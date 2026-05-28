/**
 * Phase 34d — Cloud-sync polling worker.
 *
 * Every 5 minutes, for each connected tenant:
 *   1. Google Drive: list files in watched folder
 *   2. Dropbox: same
 *   3. For each new resume-shaped file (PDF/DOC/DOCX/TXT), download +
 *      forward to resume-service /upload, scoped to that tenant
 *
 * Dedupe: TenantIntegration.config.processedIds[] keeps the last 500
 * file ids we've imported. Prepend new, trim to 500.
 *
 * Token refresh: googleapis + dropbox SDKs both refresh access tokens
 * transparently when handed the refreshToken.
 */
import { google } from "googleapis";
import { Dropbox, DropboxAuth } from "dropbox";
import { prisma } from "./prisma.js";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "notification-service:cloud-sync-worker" });

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const MAX_FILES_PER_POLL = 50;
const PROCESSED_HISTORY = 500;

const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function safeName(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
}

async function uploadResumeAsync(args: {
  tenantId: string;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<boolean> {
  const resumeUrl = process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007";
  const candidateUrl = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
  try {
    // 1) Create a synthetic candidate from filename — resume-parser overwrites
    //    name/email after parsing. Email "<filename>.cloud-sync@unknown.local"
    //    keeps the upsert deterministic without colliding with real emails.
    const stem = args.fileName.replace(/\.[^.]+$/, "");
    const syntheticEmail = `${safeName(stem)}.cloud-sync@unknown.local`;
    const candRes = await fetch(`${candidateUrl}/internal/candidates/upsert-from-application`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": "cloud-sync",
        "X-Tenant-Id": args.tenantId,
        "X-User-Role": "ADMIN",
      },
      body: JSON.stringify({
        email: syntheticEmail,
        firstName: stem.split(/[\s_-]/)[0] ?? "Unknown",
        lastName: stem.split(/[\s_-]/).slice(1).join(" ") || "Cloud Sync",
        source: "CLOUD_SYNC",
      }),
    });
    if (!candRes.ok) return false;
    const candBody: any = await candRes.json();
    const candidateId = (candBody.data ?? candBody).id;

    // 2) Forward bytes to resume-service.
    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("candidateId", candidateId);
    form.append("file", args.buffer, { filename: args.fileName, contentType: args.mimeType });
    const upRes = await fetch(`${resumeUrl}/internal/resume/upload`, {
      method: "POST",
      headers: {
        ...form.getHeaders(),
        "X-User-Id": "cloud-sync",
        "X-Tenant-Id": args.tenantId,
        "X-User-Role": "ADMIN",
      },
      body: form as any,
    });
    return upRes.ok;
  } catch (err) {
    logger.warn({ err, tenantId: args.tenantId }, "Cloud-sync resume upload failed");
    return false;
  }
}

async function pollGoogleDriveForTenant(tenantId: string, config: any): Promise<number> {
  const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_OAUTH_CLIENT_SECRET"];
  if (!clientId || !clientSecret || !config.refreshToken || !config.folderId) return 0;

  const oauth = new google.auth.OAuth2(clientId, clientSecret);
  oauth.setCredentials({ refresh_token: config.refreshToken });
  const drive = google.drive({ version: "v3", auth: oauth });

  const processed: string[] = Array.isArray(config.processedIds) ? config.processedIds : [];
  const processedSet = new Set(processed);

  const list = await drive.files.list({
    q: `'${config.folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,modifiedTime)",
    pageSize: MAX_FILES_PER_POLL,
    orderBy: "modifiedTime desc",
  });
  const files = list.data.files ?? [];
  let newCount = 0;
  for (const f of files) {
    if (!f.id || processedSet.has(f.id)) continue;
    if (!f.mimeType || !RESUME_MIME_TYPES.has(f.mimeType)) continue;
    try {
      const dl = await drive.files.get({ fileId: f.id, alt: "media" }, { responseType: "arraybuffer" });
      const buf = Buffer.from(dl.data as ArrayBuffer);
      const okUp = await uploadResumeAsync({
        tenantId, buffer: buf, fileName: f.name ?? `${f.id}.pdf`, mimeType: f.mimeType,
      });
      if (okUp) {
        processed.unshift(f.id);
        newCount++;
      }
    } catch (err) {
      logger.warn({ err, fileId: f.id }, "Drive file download failed");
    }
  }

  if (newCount > 0) {
    const trimmed = processed.slice(0, PROCESSED_HISTORY);
    await prisma.tenantIntegration.update({
      where: { tenantId_kind: { tenantId, kind: "google-drive" } },
      data: { config: { ...config, processedIds: trimmed, lastSyncAt: new Date().toISOString() } },
    });
  }
  return newCount;
}

async function pollDropboxForTenant(tenantId: string, config: any): Promise<number> {
  const appKey = process.env["DROPBOX_APP_KEY"];
  const appSecret = process.env["DROPBOX_APP_SECRET"];
  if (!appKey || !appSecret || !config.refreshToken || !config.folderPath) return 0;

  const auth = new DropboxAuth({
    clientId: appKey,
    clientSecret: appSecret,
    refreshToken: config.refreshToken,
  });
  const dbx = new Dropbox({ auth });

  const processed: string[] = Array.isArray(config.processedIds) ? config.processedIds : [];
  const processedSet = new Set(processed);

  const list = await dbx.filesListFolder({ path: config.folderPath, recursive: false, limit: MAX_FILES_PER_POLL });
  const entries = list.result.entries.filter((e) => e[".tag"] === "file") as any[];

  let newCount = 0;
  for (const e of entries) {
    if (processedSet.has(e.id)) continue;
    // Dropbox doesn't expose mimeType — infer from extension
    const ext = e.name.toLowerCase().split(".").pop();
    const mimeType =
      ext === "pdf"  ? "application/pdf" :
      ext === "doc"  ? "application/msword" :
      ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
      ext === "txt"  ? "text/plain" : null;
    if (!mimeType || !RESUME_MIME_TYPES.has(mimeType)) continue;

    try {
      const dl = await dbx.filesDownload({ path: e.path_lower ?? e.id });
      const r = dl.result as any;
      const buf = Buffer.isBuffer(r.fileBinary) ? r.fileBinary : Buffer.from(r.fileBinary);
      const okUp = await uploadResumeAsync({
        tenantId, buffer: buf, fileName: e.name, mimeType,
      });
      if (okUp) {
        processed.unshift(e.id);
        newCount++;
      }
    } catch (err) {
      logger.warn({ err, fileId: e.id }, "Dropbox file download failed");
    }
  }

  if (newCount > 0) {
    const trimmed = processed.slice(0, PROCESSED_HISTORY);
    await prisma.tenantIntegration.update({
      where: { tenantId_kind: { tenantId, kind: "dropbox" } },
      data: { config: { ...config, processedIds: trimmed, lastSyncAt: new Date().toISOString() } },
    });
  }
  return newCount;
}

async function pollAll(): Promise<void> {
  const integrations = await prisma.tenantIntegration.findMany({
    where: { enabled: true, kind: { in: ["google-drive", "dropbox"] } },
  });
  for (const integ of integrations) {
    try {
      const cfg = integ.config as any;
      const n = integ.kind === "google-drive"
        ? await pollGoogleDriveForTenant(integ.tenantId, cfg)
        : await pollDropboxForTenant(integ.tenantId, cfg);
      if (n > 0) logger.info({ tenantId: integ.tenantId, kind: integ.kind, imported: n }, "Cloud-sync imported files");
    } catch (err) {
      logger.warn({ err, integrationId: integ.id }, "Cloud-sync poll failed for tenant");
    }
  }
}

/** Start the polling loop. Call from index.ts after server boot. */
export function startCloudSyncWorker(): void {
  if (process.env["DISABLE_CLOUD_SYNC_WORKER"] === "true") {
    logger.info("Cloud-sync worker disabled via DISABLE_CLOUD_SYNC_WORKER");
    return;
  }
  pollAll().catch((err) => logger.error({ err }, "Initial cloud-sync poll failed"));
  setInterval(() => {
    pollAll().catch((err) => logger.error({ err }, "Cloud-sync poll failed"));
  }, POLL_INTERVAL_MS);
  logger.info({ intervalMs: POLL_INTERVAL_MS }, "Cloud-sync worker started");
}
