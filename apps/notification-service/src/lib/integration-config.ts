/**
 * TenantIntegration config envelope — AES-GCM encryption at rest + redaction.
 *
 * The `TenantIntegration.config` JSON column holds tenant secrets: Slack webhook
 * URLs, assessment-provider API keys/tokens, etc. WF8 hardens this so secrets are
 * AES-GCM encrypted at rest (the plaintext store was the one prod blocker).
 *
 * Storage shape:
 *   - Encrypted (new writes):  { __enc: "base64(iv).base64(tag).base64(ct)" }
 *   - Plaintext (legacy rows): { webhookUrl: "...", ... }  ← read transparently
 *
 * Backward-compatible reads: {@link unsealConfig} detects the `__enc` envelope
 * via @cdc-ats/common isEncrypted(). If the stored value is a legacy plaintext
 * object (no `__enc`, or an `__enc` that is not a valid envelope) it is returned
 * as-is. Combined with seal-on-write in the upsert path, existing slack/email
 * rows migrate to ciphertext on their next save with no destructive backfill.
 *
 * Redaction: secrets are NEVER returned to the client. {@link redactConfig}
 * masks/omits the per-kind secret fields before a config is serialised in any
 * GET response.
 */
import { encryptConfig, decryptConfig, isEncrypted } from "@cdc-ats/common";

/** Marker key under which the AES-GCM envelope string is stored in the JSON column. */
export const ENVELOPE_KEY = "__enc";

/**
 * Integration kind registry. Existing notification channels (slack, email) plus
 * the WF8 assessment-provider kinds. Additive: existing kinds keep working.
 *
 * NOTE: this registry is the set of kinds managed by the integrations router.
 * Other routers own their own kinds (twilio, google-drive, dropbox, ...) and are
 * intentionally not listed here.
 */
export const INTEGRATION_KINDS = [
  "slack",
  "email",
  // WF8 assessment / online-assessment (OA) providers:
  "hackerrank",
  "codility",
  "hackerearth",
  "imocha",
  "testgorilla",
] as const;

export type IntegrationKind = (typeof INTEGRATION_KINDS)[number];

/**
 * Per-kind secret fields that must be encrypted at rest and redacted on read.
 * Anything not listed is treated as non-secret routing config (channel name,
 * subdomain, fromAddress, ...) and is safe to return to the client.
 */
const SECRET_FIELDS: Record<string, readonly string[]> = {
  slack: ["webhookUrl"],
  email: [],
  hackerrank: ["apiKey", "apiToken", "webhookSecret"],
  codility: ["apiKey", "apiToken", "webhookSecret"],
  hackerearth: ["apiKey", "clientSecret", "webhookSecret"],
  imocha: ["apiKey", "webhookSecret"],
  testgorilla: ["apiKey", "webhookSecret"],
};

/** True when the kind is one of the assessment-provider kinds. */
export function isAssessmentKind(kind: string): boolean {
  return (
    kind === "hackerrank" ||
    kind === "codility" ||
    kind === "hackerearth" ||
    kind === "imocha" ||
    kind === "testgorilla"
  );
}

type ConfigObject = Record<string, unknown>;

/**
 * Wrap a config object into the encrypted storage envelope for persistence.
 * Returns `{ __enc: <aes-gcm-envelope> }`, which is what gets written to the
 * `config` JSON column.
 */
export function sealConfig(config: ConfigObject): { [ENVELOPE_KEY]: string } {
  return { [ENVELOPE_KEY]: encryptConfig(config) };
}

/**
 * Read a stored `config` value back into a plain object, transparently
 * decrypting an `__enc` envelope and passing legacy plaintext through.
 *
 * Never throws on shape: a malformed/missing value yields `{}`. A genuine
 * decryption/auth failure (wrong key, tampered ciphertext) is rethrown so the
 * caller surfaces a real error rather than silently treating ciphertext as
 * plaintext.
 */
export function unsealConfig(stored: unknown): ConfigObject {
  if (stored === null || stored === undefined) return {};
  if (typeof stored !== "object") return {};

  const obj = stored as ConfigObject;
  const envelope = obj[ENVELOPE_KEY];

  if (typeof envelope === "string" && isEncrypted(envelope)) {
    const decrypted = decryptConfig(envelope);
    return decrypted && typeof decrypted === "object"
      ? (decrypted as ConfigObject)
      : {};
  }

  // Legacy plaintext row (or an envelope that is not a valid AES-GCM payload):
  // return the stored object as-is, minus a stray non-envelope marker key.
  if (ENVELOPE_KEY in obj) {
    const { [ENVELOPE_KEY]: _ignored, ...rest } = obj;
    return rest;
  }
  return obj;
}

/** True when a stored config value is already in the encrypted envelope form. */
export function isSealed(stored: unknown): boolean {
  if (!stored || typeof stored !== "object") return false;
  const envelope = (stored as ConfigObject)[ENVELOPE_KEY];
  return typeof envelope === "string" && isEncrypted(envelope);
}

/**
 * Produce a client-safe view of a (decrypted) config object: secret fields for
 * the kind are masked to a short suffix hint, never the full value. Non-secret
 * fields pass through. Use this before returning any config in a GET response.
 */
export function redactConfig(kind: string, config: ConfigObject): ConfigObject {
  const secrets = SECRET_FIELDS[kind] ?? [];
  const out: ConfigObject = { ...config };
  // Never leak the storage envelope marker.
  delete out[ENVELOPE_KEY];
  for (const field of secrets) {
    const value = out[field];
    if (typeof value === "string" && value.length > 0) {
      // Mask: keep only a last-N hint so admins can confirm which key is set.
      const hint = value.length > 4 ? value.slice(-4) : "";
      out[field] = hint ? `…${hint}` : "set";
    } else if (value !== undefined) {
      out[field] = "set";
    }
  }
  return out;
}

/**
 * Convenience: read a stored config and return the redacted, client-safe view
 * in one step (decrypt → redact).
 */
export function readRedactedConfig(kind: string, stored: unknown): ConfigObject {
  return redactConfig(kind, unsealConfig(stored));
}
