/**
 * AES-256-GCM config envelope encryption.
 *
 * Encrypts arbitrary JSON-serialisable config blobs (integration secrets,
 * module settings, dashboard payloads) at rest. Uses node:crypto only, with
 * no external dependency.
 *
 * Envelope: a random 12-byte IV per encrypt (the GCM-recommended size), a
 * 16-byte authentication tag, and the ciphertext. The three parts are packed
 * as base64 segments joined by dots:
 *
 *     base64(iv) . base64(tag) . base64(ciphertext)
 *
 * The key comes from env `ATS_CONFIG_ENC_KEY`, a 32-byte key supplied as hex
 * (64 chars) or base64. Callers should treat ciphertext as opaque.
 *
 * Backward-compatible reads: `isEncrypted(payload)` lets callers detect a
 * plaintext value so existing rows can be re-encrypted on next write
 * (encrypt-on-next-write migration) without a bulk backfill.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/** Env var holding the 32-byte AES-256 key (hex or base64). */
export const CONFIG_ENC_KEY_ENV = "ATS_CONFIG_ENC_KEY";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const SEGMENT_SEPARATOR = ".";

/**
 * Resolve and validate the 32-byte key from `ATS_CONFIG_ENC_KEY`.
 * Accepts hex (64 chars) or base64; throws a clear error if missing or the
 * decoded length is not exactly 32 bytes.
 */
function resolveKey(): Buffer {
  const raw = process.env[CONFIG_ENC_KEY_ENV];
  if (!raw || raw.trim().length === 0) {
    throw new Error(
      `${CONFIG_ENC_KEY_ENV} is not set. Provide a 32-byte AES-256 key as hex (64 chars) or base64.`,
    );
  }
  const value = raw.trim();

  // Prefer hex when the string is a clean 64-char hex value, otherwise base64.
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    key = Buffer.from(value, "hex");
  } else {
    key = Buffer.from(value, "base64");
  }

  if (key.length !== KEY_BYTES) {
    throw new Error(
      `${CONFIG_ENC_KEY_ENV} must decode to exactly ${KEY_BYTES} bytes (got ${key.length}). Provide a 32-byte key as hex (64 chars) or base64.`,
    );
  }
  return key;
}

/**
 * Encrypt a JSON-serialisable value into a packed base64 envelope.
 * Returns `base64(iv).base64(tag).base64(ciphertext)`.
 */
export function encryptConfig(obj: unknown): string {
  const key = resolveKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(SEGMENT_SEPARATOR);
}

/**
 * Decrypt a packed envelope produced by {@link encryptConfig} and JSON-parse
 * the result. Throws if the payload is malformed or authentication fails
 * (wrong key or tampered ciphertext).
 */
export function decryptConfig(payload: string): unknown {
  if (typeof payload !== "string" || !isEncrypted(payload)) {
    throw new Error("decryptConfig: payload is not a valid AES-GCM envelope");
  }
  const key = resolveKey();

  const parts = payload.split(SEGMENT_SEPARATOR);
  const ivB64 = parts[0]!;
  const tagB64 = parts[1]!;
  const ctB64 = parts[2]!;

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ctB64, "base64");

  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error("decryptConfig: payload is not a valid AES-GCM envelope");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let plaintext: Buffer;
  try {
    plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    // GCM auth failure (wrong key or tampered data) surfaces here.
    throw new Error("decryptConfig: authentication failed (wrong key or corrupted payload)");
  }

  return JSON.parse(plaintext.toString("utf8"));
}

/**
 * Detect whether a string looks like an AES-GCM envelope produced by
 * {@link encryptConfig}. Used for backward-compatible reads so plaintext
 * values can be re-encrypted on next write.
 *
 * This is a structural check (three base64 segments with correct IV/tag
 * lengths), not a decryption, and it does not require the key.
 */
export function isEncrypted(payload: unknown): payload is string {
  if (typeof payload !== "string") return false;
  const parts = payload.split(SEGMENT_SEPARATOR);
  if (parts.length !== 3) return false;

  const ivB64 = parts[0]!;
  const tagB64 = parts[1]!;
  const ctB64 = parts[2]!;
  if (ivB64.length === 0 || tagB64.length === 0 || ctB64.length === 0) {
    return false;
  }

  const base64Re = /^[A-Za-z0-9+/]+={0,2}$/;
  if (!base64Re.test(ivB64) || !base64Re.test(tagB64) || !base64Re.test(ctB64)) {
    return false;
  }

  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  // ciphertext may be 0 bytes for an empty-string payload, so only check iv/tag.
  return iv.length === IV_BYTES && tag.length === TAG_BYTES;
}
