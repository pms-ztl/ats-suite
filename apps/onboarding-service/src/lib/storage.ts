/**
 * Module F — object storage for onboarding document uploads (PAN card, bank
 * proof, government photo ID, signed offer letter, etc.).
 *
 * Same S3-compatible idiom as resume-service (AWS S3 in prod, MinIO in dev): the
 * AWS SDK works against MinIO unchanged with a custom endpoint + forcePathStyle.
 *
 * Env config (falls back to the shared S3_* used by resume-service so a single
 * MinIO/S3 config covers both, but a dedicated bucket can be set):
 *   ONBOARDING_S3_BUCKET     — bucket for onboarding docs (default: falls back to S3_BUCKET)
 *   S3_REGION                — required
 *   S3_ENDPOINT              — optional; set for MinIO (e.g. http://minio:9000)
 *   S3_ACCESS_KEY_ID         — required
 *   S3_SECRET_ACCESS_KEY     — required
 *   S3_FORCE_PATH_STYLE      — "true" for MinIO
 *
 * Key layout: tenant/<tenantId>/onboarding/<caseId>/<taskId>/<filename>
 *
 * Resilience: if storage isn't configured we DO NOT throw — isStorageConfigured()
 * returns false and the caller records an honest "submitted, awaiting storage"
 * state instead of pretending the upload succeeded. Never a fabricated success.
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "onboarding-service:storage" });

let _client: S3Client | null = null;
let _bucket: string | null = null;
let _initDone = false;

function init(): { client: S3Client | null; bucket: string | null } {
  if (_initDone) return { client: _client, bucket: _bucket };
  _initDone = true;

  // Dedicated onboarding bucket, else fall back to the shared resume bucket env.
  const bucket = process.env["ONBOARDING_S3_BUCKET"] ?? process.env["S3_BUCKET"];
  const region = process.env["S3_REGION"];
  const accessKeyId = process.env["S3_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["S3_SECRET_ACCESS_KEY"];
  const endpoint = process.env["S3_ENDPOINT"];
  const forcePathStyle = process.env["S3_FORCE_PATH_STYLE"] === "true";

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    logger.warn(
      { hasBucket: !!bucket, hasRegion: !!region, hasKey: !!accessKeyId },
      "S3 storage not configured — onboarding document uploads will not be persisted to object storage",
    );
    _client = null;
    _bucket = null;
    return { client: null, bucket: null };
  }

  _client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    ...(forcePathStyle ? { forcePathStyle } : {}),
  });
  _bucket = bucket;
  logger.info({ bucket, region, endpoint: endpoint ?? "(aws)" }, "S3 storage configured");
  return { client: _client, bucket: _bucket };
}

export function isStorageConfigured(): boolean {
  return init().client !== null;
}

export function buildKey(args: { tenantId: string; caseId: string; taskId: string; fileName: string }): string {
  // Sanitize the filename to avoid path traversal / weird Unicode confusion.
  const safe =
    args.fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/\.{2,}/g, "_") // collapse any ".." so no path-traversal token survives the slug
      .slice(0, 200) || "document";
  return `tenant/${args.tenantId}/onboarding/${args.caseId}/${args.taskId}/${safe}`;
}

/**
 * Upload a buffer. Returns the key on success, null when storage isn't configured.
 */
export async function putObject(args: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string | null> {
  const { client, bucket } = init();
  if (!client || !bucket) return null;

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: args.key,
    Body: args.body,
    ContentType: args.contentType,
    // Private by default — retrieval is via presigned URLs only.
    ACL: undefined,
  }));
  return args.key;
}

/**
 * Generate a time-limited download URL. Returns null if storage not configured.
 * 10-minute expiry default — long enough to click, short enough to limit abuse.
 */
export async function getPresignedDownloadUrl(key: string, expiresSeconds = 600): Promise<string | null> {
  const { client, bucket } = init();
  if (!client || !bucket) return null;
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: expiresSeconds });
}

/** Delete an object (used by GDPR-delete + lifecycle pruning). */
export async function deleteObject(key: string): Promise<boolean> {
  const { client, bucket } = init();
  if (!client || !bucket) return false;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return true;
}
