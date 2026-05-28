/**
 * Phase 35b — real object storage for resume binaries.
 *
 * Backed by any S3-compatible store: AWS S3 in prod, MinIO in dev. The
 * AWS SDK works against MinIO unchanged when we set a custom endpoint
 * and forcePathStyle.
 *
 * Env config:
 *   S3_BUCKET                — required
 *   S3_REGION                — required (e.g. us-east-1; "us-east-1" for MinIO)
 *   S3_ENDPOINT              — optional; set for MinIO (e.g. http://minio:9000)
 *   S3_ACCESS_KEY_ID         — required
 *   S3_SECRET_ACCESS_KEY     — required
 *   S3_FORCE_PATH_STYLE      — "true" for MinIO; default false for AWS S3
 *
 * Key layout: tenant/<tenantId>/resumes/<resumeId>/<filename>
 *
 * Resilience: if S3 env vars are missing we DO NOT throw at boot — we
 * record the absence and fall back to skipping storage (writing only to
 * DB + extracted text). This keeps dev environments working when S3
 * isn't running locally; calling code can check isStorageConfigured() to
 * decide whether to expose download URLs.
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "resume-service:storage" });

let _client: S3Client | null = null;
let _bucket: string | null = null;

function init(): { client: S3Client | null; bucket: string | null } {
  if (_client !== null) return { client: _client, bucket: _bucket };

  const bucket = process.env["S3_BUCKET"];
  const region = process.env["S3_REGION"];
  const accessKeyId = process.env["S3_ACCESS_KEY_ID"];
  const secretAccessKey = process.env["S3_SECRET_ACCESS_KEY"];
  const endpoint = process.env["S3_ENDPOINT"];
  const forcePathStyle = process.env["S3_FORCE_PATH_STYLE"] === "true";

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    logger.warn(
      { hasBucket: !!bucket, hasRegion: !!region, hasKey: !!accessKeyId },
      "S3 storage not configured — resume binaries will not be persisted to object storage",
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
  const { client } = init();
  return client !== null;
}

export function buildKey(args: { tenantId: string; resumeId: string; fileName: string }): string {
  // Sanitize the filename to avoid path traversal / weird Unicode confusion.
  const safe = args.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200);
  return `tenant/${args.tenantId}/resumes/${args.resumeId}/${safe}`;
}

/**
 * Upload a buffer. Returns the key (for storing in Resume.storageKey).
 * No-op (returns null) when storage isn't configured.
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
    // Disable public access by default — downloads use presigned URLs.
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
