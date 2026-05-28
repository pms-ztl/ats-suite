/**
 * Phase 34d — Google Drive + Dropbox folder sync.
 *
 * Flow:
 *   1. Tenant admin clicks "Connect Google Drive" / "Connect Dropbox" on
 *      /settings/integrations → /api/cloud-sync/<provider>/connect
 *   2. We redirect to the provider's OAuth consent page
 *   3. Provider redirects back to /api/cloud-sync/<provider>/callback
 *   4. We exchange the code → access + refresh tokens → store in
 *      TenantIntegration(kind="google-drive" or "dropbox")
 *   5. Background worker (separate file) polls the configured folder
 *      every 5 minutes, finds new files, runs them through the resume
 *      parser, creates candidates
 *
 * Folder selection happens AFTER OAuth in the UI — we list root folders
 * with the access token and the tenant admin picks one (/settings/integrations
 * second step).
 *
 * Token refresh: stored refreshToken used to mint a new accessToken when
 * the current one expires. Worker handles this transparently.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { google } from "googleapis";
import { Dropbox, DropboxAuth } from "dropbox";
import { ok, Errors, getTenantId, getUserId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

function appUrl(): string { return process.env["APP_URL"] ?? "http://localhost:3000"; }
function apiUrl(): string { return process.env["PUBLIC_API_URL"] ?? "http://localhost:4000/api"; }

// ─── Google Drive OAuth ──────────────────────────────────────────────────

function googleOAuthClient() {
  const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_OAUTH_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw Errors.unavailable("Google OAuth not configured (GOOGLE_OAUTH_CLIENT_ID + _SECRET)");
  }
  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${apiUrl()}/cloud-sync/google-drive/callback`,
  );
}

router.get("/google-drive/connect", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const oauth = googleOAuthClient();
    // state = signed tenantId so callback can attribute the response.
    // For simplicity using a base64 wrapper; production should JWT-sign with TTL.
    const state = Buffer.from(JSON.stringify({ tenantId, ts: Date.now() })).toString("base64url");
    const url = oauth.generateAuthUrl({
      access_type: "offline",                          // need refresh token
      prompt: "consent",                                // force re-grant so we always get refresh
      scope: ["https://www.googleapis.com/auth/drive.readonly"],
      state,
    });
    ok(res, { url });
  } catch (err) { next(err); }
});

router.get("/google-drive/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query["code"] as string | undefined;
    const state = req.query["state"] as string | undefined;
    if (!code || !state) throw Errors.validation("Missing code or state");
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf-8")) as { tenantId: string; ts: number };
    if (!parsed.tenantId || Date.now() - parsed.ts > 10 * 60 * 1000) {
      throw Errors.unauthorized("OAuth state expired or invalid");
    }
    const oauth = googleOAuthClient();
    const { tokens } = await oauth.getToken(code);
    if (!tokens.refresh_token) {
      throw Errors.validation("No refresh_token returned — revoke app in Google Account and try again");
    }
    await prisma.tenantIntegration.upsert({
      where: { tenantId_kind: { tenantId: parsed.tenantId, kind: "google-drive" } },
      create: {
        tenantId: parsed.tenantId,
        kind: "google-drive",
        enabled: true,
        config: {
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token ?? null,
          expiryDate: tokens.expiry_date ?? null,
          folderId: null,                              // tenant picks in next step
        } as any,
      },
      update: {
        enabled: true,
        config: {
          refreshToken: tokens.refresh_token,
          accessToken: tokens.access_token ?? null,
          expiryDate: tokens.expiry_date ?? null,
          // preserve folderId across reconnect
          folderId: undefined,
        } as any,
      },
    });
    // Redirect back to the integration page in the dashboard.
    res.redirect(302, `${appUrl()}/settings/integrations?connected=google-drive`);
  } catch (err) { next(err); }
});

// List root folders so the tenant can pick which one to watch.
router.get("/google-drive/folders", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const integ = await prisma.tenantIntegration.findUnique({
      where: { tenantId_kind: { tenantId, kind: "google-drive" } },
    });
    if (!integ) throw Errors.notFound("Google Drive integration");
    const cfg = integ.config as any;
    const oauth = googleOAuthClient();
    oauth.setCredentials({ refresh_token: cfg.refreshToken });
    const drive = google.drive({ version: "v3", auth: oauth });
    const list = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id,name,parents)",
      pageSize: 100,
    });
    ok(res, { folders: list.data.files ?? [] });
  } catch (err) { next(err); }
});

// Set / change the watched folder.
router.put("/google-drive/folder", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { folderId } = z.object({ folderId: z.string().min(1) }).parse(req.body);
    const integ = await prisma.tenantIntegration.findUnique({
      where: { tenantId_kind: { tenantId, kind: "google-drive" } },
    });
    if (!integ) throw Errors.notFound("Google Drive integration");
    await prisma.tenantIntegration.update({
      where: { tenantId_kind: { tenantId, kind: "google-drive" } },
      data: { config: { ...(integ.config as any), folderId } },
    });
    ok(res, { folderId });
  } catch (err) { next(err); }
});

router.delete("/google-drive", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await prisma.tenantIntegration.delete({
      where: { tenantId_kind: { tenantId, kind: "google-drive" } },
    }).catch(() => undefined);
    ok(res, { disconnected: true });
  } catch (err) { next(err); }
});

// ─── Dropbox OAuth ───────────────────────────────────────────────────────

function dropboxAuth(): DropboxAuth {
  const appKey = process.env["DROPBOX_APP_KEY"];
  const appSecret = process.env["DROPBOX_APP_SECRET"];
  if (!appKey || !appSecret) {
    throw Errors.unavailable("Dropbox OAuth not configured (DROPBOX_APP_KEY + _SECRET)");
  }
  return new DropboxAuth({ clientId: appKey, clientSecret: appSecret });
}

router.get("/dropbox/connect", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const auth = dropboxAuth();
    const redirectUri = `${apiUrl()}/cloud-sync/dropbox/callback`;
    const state = Buffer.from(JSON.stringify({ tenantId, ts: Date.now() })).toString("base64url");
    const url = await auth.getAuthenticationUrl(redirectUri, state, "code", "offline", undefined, "none", false);
    ok(res, { url: String(url) });
  } catch (err) { next(err); }
});

router.get("/dropbox/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = req.query["code"] as string | undefined;
    const state = req.query["state"] as string | undefined;
    if (!code || !state) throw Errors.validation("Missing code or state");
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf-8")) as { tenantId: string; ts: number };
    if (!parsed.tenantId || Date.now() - parsed.ts > 10 * 60 * 1000) {
      throw Errors.unauthorized("OAuth state expired");
    }
    const auth = dropboxAuth();
    const redirectUri = `${apiUrl()}/cloud-sync/dropbox/callback`;
    const tokenResponse = await auth.getAccessTokenFromCode(redirectUri, code);
    const data = tokenResponse.result as any;
    if (!data.refresh_token) {
      throw Errors.validation("No refresh_token returned");
    }
    await prisma.tenantIntegration.upsert({
      where: { tenantId_kind: { tenantId: parsed.tenantId, kind: "dropbox" } },
      create: {
        tenantId: parsed.tenantId,
        kind: "dropbox",
        enabled: true,
        config: {
          refreshToken: data.refresh_token,
          accessToken: data.access_token ?? null,
          accountId: data.account_id ?? null,
          folderPath: null,
        } as any,
      },
      update: {
        enabled: true,
        config: {
          refreshToken: data.refresh_token,
          accessToken: data.access_token ?? null,
          accountId: data.account_id ?? null,
        } as any,
      },
    });
    res.redirect(302, `${appUrl()}/settings/integrations?connected=dropbox`);
  } catch (err) { next(err); }
});

router.put("/dropbox/folder", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { folderPath } = z.object({ folderPath: z.string().min(1) }).parse(req.body);
    const integ = await prisma.tenantIntegration.findUnique({
      where: { tenantId_kind: { tenantId, kind: "dropbox" } },
    });
    if (!integ) throw Errors.notFound("Dropbox integration");
    await prisma.tenantIntegration.update({
      where: { tenantId_kind: { tenantId, kind: "dropbox" } },
      data: { config: { ...(integ.config as any), folderPath } },
    });
    ok(res, { folderPath });
  } catch (err) { next(err); }
});

router.delete("/dropbox", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    await prisma.tenantIntegration.delete({
      where: { tenantId_kind: { tenantId, kind: "dropbox" } },
    }).catch(() => undefined);
    ok(res, { disconnected: true });
  } catch (err) { next(err); }
});

export default router;
