/**
 * WF-I / I1 — presigned POST upload tickets for the public apply fast path.
 *
 * The browser uploads the candidate's resume DIRECTLY to object storage
 * (MinIO in dev, any S3-compatible store in prod) using a short-lived,
 * server-signed POST policy, instead of streaming the bytes through the
 * gateway + job-service. The accept-fast path (a later WF-I slice) then
 * references the resulting objectKey and returns 202 once the row exists.
 *
 * This mirrors the resume-service S3 client idea (apps/resume-service/src/lib/
 * storage.ts) and its buildKey discipline, but for the INCOMING bucket and the
 * upload (not download) direction. It deliberately adds NO new npm dependency:
 * the presigned POST policy + AWS Signature V4 is built with Node's built-in
 * `crypto`, which is exactly what MinIO's `presignedPostPolicy` / the AWS SDK's
 * `createPresignedPost` produce on the wire, and works against MinIO and S3
 * unchanged.
 *
 * Env config (parallel to resume-service, but the bucket is the incoming one):
 *   S3_ENDPOINT              — optional; set for MinIO (e.g. http://minio:9000)
 *   S3_REGION                — required (e.g. us-east-1; "us-east-1" for MinIO)
 *   S3_ACCESS_KEY_ID         — required
 *   S3_SECRET_ACCESS_KEY     — required
 *   S3_FORCE_PATH_STYLE      — "true" for MinIO; default false for AWS S3
 *   S3_INCOMING_BUCKET       — required; the bucket browsers POST into (e.g. ats-incoming)
 *
 * Resilience: if any required var is missing we DO NOT throw at boot — the
 * route checks isIncomingStorageConfigured() and returns a clean 503 so the
 * frontend falls back to the existing multipart apply (backward-compat).
 */
import { createHash, createHmac, randomUUID } from "node:crypto";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "job-service:incoming-storage" });

export interface IncomingStorageConfig {
  endpoint: string | null; // null = real AWS S3 (regional virtual-host endpoint)
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle: boolean;
}

let _config: IncomingStorageConfig | null | undefined;

function loadConfig(): IncomingStorageConfig | null {
  if (_config !== undefined) return _config;

  const bucket = process.env["S3_INCOMING_BUCKET"];
  const region = process.env["S3_REGION"];
  const accessKeyId = process.env["S3_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["S3_SECRET_ACCESS_KEY"];
  const endpoint = process.env["S3_ENDPOINT"] || null;
  // MinIO needs path-style; default true whenever a custom endpoint is set.
  const forcePathStyle = process.env["S3_FORCE_PATH_STYLE"] === "true" || (!!endpoint);

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    logger.warn(
      { hasBucket: !!bucket, hasRegion: !!region, hasKey: !!accessKeyId },
      "incoming object storage not configured — presigned upload tickets disabled (apply falls back to multipart)",
    );
    _config = null;
    return null;
  }

  _config = { endpoint, region, accessKeyId, secretAccessKey, bucket, forcePathStyle };
  logger.info({ bucket, region, endpoint: endpoint ?? "(aws)" }, "incoming object storage configured");
  return _config;
}

/** True when MinIO/S3 is configured for the incoming bucket. The route returns
 *  503 (fallback to multipart) when this is false. */
export function isIncomingStorageConfigured(): boolean {
  return loadConfig() !== null;
}

// ── content-type → extension (allow-list) ───────────────────────────────────
// Only resume document types are accepted. Anything else → null (the route 400s
// or falls back). Mirrors the resume-service accepted set (pdf/doc/docx) plus
// plain text, which the parser also handles.
const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export function extForContentType(contentType: string): string | null {
  return EXT_BY_TYPE[contentType.toLowerCase()] ?? null;
}

/**
 * Build the object key a browser will upload into. Layout mirrors the resume-
 * service buildKey discipline (sanitized, tenant-scoped, opaque uuid name) but
 * lives under incoming/<tenantId>/<jobId>/<uuid>.<ext> in the incoming bucket so
 * a later accept step can correlate the upload to the {tenant, job} it belongs
 * to without trusting any client-supplied filename.
 */
export function buildIncomingKey(args: { tenantId: string; jobId: string; ext: string }): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const ext = args.ext.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) || "bin";
  return `incoming/${safe(args.tenantId)}/${safe(args.jobId)}/${randomUUID()}.${ext}`;
}

// ── AWS Signature V4 (POST policy) ──────────────────────────────────────────
// These helpers reproduce, with zero extra dependencies, exactly what MinIO's
// presignedPostPolicy / the AWS SDK's createPresignedPost emit: a base64 policy
// document + the four signing form fields. See AWS docs "Browser-Based Uploads
// Using POST (AWS Signature Version 4)".
function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function signingKey(secret: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

export interface UploadTicket {
  /** The bucket URL the browser POSTs the multipart form to. */
  postURL: string;
  /** The form fields to send alongside the file (file MUST be the LAST field). */
  formData: Record<string, string>;
  /** The key the object will live at — the accept step references this. */
  objectKey: string;
  /** When this ticket stops being valid (ISO 8601). */
  expiresAt: string;
}

/**
 * Mint a presigned POST policy so the browser can upload one resume DIRECTLY to
 * the incoming bucket. Constraints baked into the signed policy (the browser
 * cannot widen them):
 *   - exact object key (incoming/<tenant>/<job>/<uuid>.<ext>)
 *   - exact bucket
 *   - content-length-range 1 byte .. maxBytes (default 10MB)
 *   - content-type starts-with the requested type
 *   - 5-minute expiry (default)
 *
 * Returns null when storage isn't configured (the route turns that into a 503).
 */
export function createUploadTicket(args: {
  tenantId: string;
  jobId: string;
  contentType: string;
  ext: string;
  maxBytes?: number;
  expirySeconds?: number;
}): UploadTicket | null {
  const cfg = loadConfig();
  if (!cfg) return null;

  const maxBytes = args.maxBytes ?? 10 * 1024 * 1024; // 10MB
  const expirySeconds = args.expirySeconds ?? 300; // 5 minutes
  const objectKey = buildIncomingKey({ tenantId: args.tenantId, jobId: args.jobId, ext: args.ext });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8); // YYYYMMDD
  const credential = `${cfg.accessKeyId}/${dateStamp}/${cfg.region}/s3/aws4_request`;
  const expiration = new Date(now.getTime() + expirySeconds * 1000).toISOString();

  // The policy document — every field the browser sends must be either
  // explicitly equal here or covered by a starts-with. The signature covers
  // this exact document, so the browser cannot change bucket, key, size, or
  // type without invalidating it.
  const policy = {
    expiration,
    conditions: [
      { bucket: cfg.bucket },
      { key: objectKey },
      ["content-length-range", 1, maxBytes],
      ["starts-with", "$Content-Type", args.contentType],
      { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
      { "x-amz-credential": credential },
      { "x-amz-date": amzDate },
    ],
  };
  const policyBase64 = Buffer.from(JSON.stringify(policy), "utf8").toString("base64");
  const signature = createHmac(
    "sha256",
    signingKey(cfg.secretAccessKey, dateStamp, cfg.region, "s3"),
  )
    .update(policyBase64, "utf8")
    .digest("hex");

  // Endpoint: path-style for MinIO (<endpoint>/<bucket>), virtual-host for AWS
  // (https://<bucket>.s3.<region>.amazonaws.com). The form's `key` + `bucket`
  // fields carry the rest.
  let postURL: string;
  if (cfg.endpoint) {
    postURL = cfg.forcePathStyle
      ? `${cfg.endpoint.replace(/\/$/, "")}/${cfg.bucket}`
      : cfg.endpoint.replace(/\/$/, "");
  } else {
    postURL = `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com`;
  }

  return {
    postURL,
    objectKey,
    expiresAt: expiration,
    formData: {
      key: objectKey,
      bucket: cfg.bucket,
      "Content-Type": args.contentType,
      "x-amz-algorithm": "AWS4-HMAC-SHA256",
      "x-amz-credential": credential,
      "x-amz-date": amzDate,
      policy: policyBase64,
      "x-amz-signature": signature,
    },
  };
}

// ── statObject (SigV4-signed HEAD) ──────────────────────────────────────────
// WF-I / I2 — the accept-fast apply path NEVER trusts the client-supplied size.
// After the browser uploads directly to the incoming bucket, the accept handler
// HEADs the object to confirm it EXISTS and read its REAL byte size from the
// store. This is the server's only source of truth for the size (the presigned
// POST policy's content-length-range already capped the upload at the bucket, but
// the accept step re-verifies independently). Built with Node's built-in `crypto`
// + global `fetch` so it adds NO new npm dependency, exactly like the presigned
// POST policy above (job-service does not depend on @aws-sdk/client-s3).
const EMPTY_SHA256 = createHash("sha256").update("").digest("hex");

function hmacRaw(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

export interface StatResult {
  /** True when the object exists in the incoming bucket. */
  exists: boolean;
  /** REAL object size in bytes from the store (Content-Length), or null. */
  size: number | null;
}

// Resolve the request target (scheme/host/canonical URI) for one object key,
// matching the path-style vs virtual-host choice createUploadTicket makes. Shared
// by statIncomingObject (HEAD) + getIncomingObject (GET) so the two never drift.
function resolveObjectTarget(
  cfg: IncomingStorageConfig,
  objectKey: string,
): { scheme: string; host: string; canonicalUri: string; url: string } {
  let host: string;
  let pathPrefix: string; // leading path segment(s) before /<objectKey>
  let scheme: string;
  if (cfg.endpoint) {
    const u = new URL(cfg.endpoint);
    host = u.host;
    scheme = u.protocol.replace(/:$/, "");
    // path-style (MinIO): /<bucket>/<key>; else virtual-host with bucket in host.
    pathPrefix = cfg.forcePathStyle ? `/${cfg.bucket}` : "";
    if (!cfg.forcePathStyle) host = `${cfg.bucket}.${host}`;
  } else {
    host = `${cfg.bucket}.s3.${cfg.region}.amazonaws.com`;
    scheme = "https";
    pathPrefix = "";
  }
  // Canonical URI: each path segment URI-encoded (but '/' kept as separators).
  const canonicalUri =
    `${pathPrefix}/` + objectKey.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  return { scheme, host, canonicalUri, url: `${scheme}://${host}${canonicalUri}` };
}

// Build the SigV4 Authorization header for a single S3 request (HEAD/GET), with an
// empty body (UNSIGNED payload via the empty-string hash, which both MinIO and S3
// accept for a bodiless request). Returns the headers to send. Zero new deps.
function signObjectRequest(
  cfg: IncomingStorageConfig,
  method: "HEAD" | "GET",
  host: string,
  canonicalUri: string,
): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const service = "s3";

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${EMPTY_SHA256}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [method, canonicalUri, "", canonicalHeaders, signedHeaders, EMPTY_SHA256].join("\n");

  const scope = `${dateStamp}/${cfg.region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    createHash("sha256").update(canonicalRequest, "utf8").digest("hex"),
  ].join("\n");

  const kDate = hmacRaw(`AWS4${cfg.secretAccessKey}`, dateStamp);
  const kRegion = hmacRaw(kDate, cfg.region);
  const kService = hmacRaw(kRegion, service);
  const kSigning = hmacRaw(kService, "aws4_request");
  const sig = createHmac("sha256", kSigning).update(stringToSign, "utf8").digest("hex");

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${sig}`;

  return { host, "x-amz-date": amzDate, "x-amz-content-sha256": EMPTY_SHA256, authorization };
}

/**
 * HEAD an object in the incoming bucket and return whether it exists + its REAL
 * size. Returns { exists:false, size:null } for a 404/403 or any transport error
 * (the caller treats a non-existent / unreadable object as a rejected apply, NOT
 * a fabricated success). Returns null only when storage is unconfigured - the
 * accept path must not run without storage.
 */
export async function statIncomingObject(objectKey: string): Promise<StatResult | null> {
  const cfg = loadConfig();
  if (!cfg) return null;

  const { host, canonicalUri, url } = resolveObjectTarget(cfg, objectKey);
  const headers = signObjectRequest(cfg, "HEAD", host, canonicalUri);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers,
      // The store is local (MinIO) or same-region S3 - keep a tight budget so a
      // stuck store cannot pin the accept request open.
      signal: AbortSignal.timeout(Number(process.env["INCOMING_STAT_TIMEOUT_MS"] ?? 3000)),
    });
    if (!res.ok) {
      // 404 (not uploaded) / 403 (key mismatch) -> not a fabricated success.
      return { exists: false, size: null };
    }
    const len = res.headers.get("content-length");
    const size = len !== null && /^\d+$/.test(len) ? Number(len) : null;
    return { exists: true, size };
  } catch (err) {
    logger.warn({ err: err instanceof Error ? err.message : String(err), objectKey }, "statIncomingObject HEAD failed");
    return { exists: false, size: null };
  }
}

export interface FetchedObject {
  body: Buffer;
  /** Content-Type the store reported, or null. */
  contentType: string | null;
  /** REAL object size in bytes (the buffer length). */
  size: number;
}

/**
 * GET an object's bytes out of the incoming bucket. Used by the apply-ingest
 * worker (I3) to stream the resume the browser uploaded directly into the resume
 * pipeline - the heavy binary never transited the API on the way in, and now flows
 * through ONE internal hop on the way to extract/parse/screen. Returns null when
 * storage is unconfigured OR the object is missing/unreadable (the worker treats a
 * null as a real failure - it never fabricates a parsed resume from nothing).
 *
 * A maxBytes guard (default 10MB, the same ceiling the presigned POST policy bakes
 * in) protects the worker from an oversized object even if the bucket policy were
 * ever loosened.
 */
export async function getIncomingObject(
  objectKey: string,
  opts: { maxBytes?: number; timeoutMs?: number } = {},
): Promise<FetchedObject | null> {
  const cfg = loadConfig();
  if (!cfg) return null;

  const maxBytes = opts.maxBytes ?? 10 * 1024 * 1024;
  const { host, canonicalUri, url } = resolveObjectTarget(cfg, objectKey);
  const headers = signObjectRequest(cfg, "GET", host, canonicalUri);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(opts.timeoutMs ?? Number(process.env["INCOMING_GET_TIMEOUT_MS"] ?? 15_000)),
    });
    if (!res.ok) {
      logger.warn({ objectKey, status: res.status }, "getIncomingObject GET non-2xx");
      return null;
    }
    // Guard against an oversized object before buffering it all into memory.
    const len = res.headers.get("content-length");
    if (len !== null && /^\d+$/.test(len) && Number(len) > maxBytes) {
      logger.warn({ objectKey, contentLength: len, maxBytes }, "getIncomingObject: object exceeds max bytes - refusing");
      return null;
    }
    const ab = await res.arrayBuffer();
    const body = Buffer.from(ab);
    if (body.byteLength > maxBytes) {
      logger.warn({ objectKey, bytes: body.byteLength, maxBytes }, "getIncomingObject: body exceeds max bytes - refusing");
      return null;
    }
    return { body, contentType: res.headers.get("content-type"), size: body.byteLength };
  } catch (err) {
    logger.warn({ err: err instanceof Error ? err.message : String(err), objectKey }, "getIncomingObject GET failed");
    return null;
  }
}
