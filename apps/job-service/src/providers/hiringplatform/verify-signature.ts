/**
 * Shared inbound-webhook signature verifier (job-service hiring-platform axis) -
 * WF-H / SLICE H5.
 *
 * ONE dispatch point the inbound apply-webhook route calls to authenticate a board
 * callback BEFORE it parses a single byte. The route receives the EXACT raw request
 * bytes (the gateway mounts a RAW body reader for /api/inbound-job-application, WF-E
 * E6, so the bytes the board signed are never mangled by JSON parsing first), looks
 * up the tenant's stored webhook secret, and asks {@link verifySignature} whether
 * the signature on those raw bytes is real. A false answer rejects the callback (the
 * Indeed inbound contract maps that to a 401 UNAUTHORIZED); only a true answer lets
 * the route go on to {@link HiringPlatformProvider.parseApplication}.
 *
 * Why a SHARED dispatcher rather than only the per-adapter `verifyWebhook`: every
 * board signs differently (different hash, different digest encoding, different
 * header, ZipRecruiter even folds a timestamp into the signed string), and the
 * route must not embed that per-board knowledge. So this module owns the dispatch
 * table for the boards whose scheme is a fixed, well-known HMAC, and DELEGATES to
 * the adapter's own `verifyWebhook` for boards with a bespoke handshake (SEEK's
 * dual base64/hex, LinkedIn's challenge handshake when it is reached through the
 * adapter, Google Jobs which sends no signed callback at all). The per-adapter
 * `verifyWebhook` stays the source of truth; this dispatcher mirrors the exact same
 * computation for the fixed-scheme boards so the two never disagree.
 *
 * == HARD RULES baked in =====================================================
 *  - RAW bytes only: every HMAC is computed over the EXACT `rawBody` string the
 *    board signed. The caller must pass the unparsed body; verifying a re-serialized
 *    JSON would change the bytes and (correctly) fail.
 *  - Timing-safe ALWAYS: every comparison goes through {@link timingSafeEqual}
 *    (Node `crypto.timingSafeEqual` over equal-length buffers, with an explicit
 *    length guard so a length mismatch returns false WITHOUT leaking timing). A
 *    naive `===` is never used on a secret/signature.
 *  - Fail closed: no secret configured, a missing/blank signature header, an
 *    unknown provider, or any mismatch ALL return false. An unverifiable callback is
 *    rejected, never optimistically accepted.
 *  - No side effects: pure function of (provider, rawBody, headers, secret). No
 *    network, no DB, no logging of the secret or the signature. Credentials are not
 *    persisted here.
 *
 * This is the HIRING-PLATFORM axis (job boards / inbound apply), DISTINCT from the
 * assessment-provider axis. The `provider` key is a board {@link ProviderKey}.
 */
import { createHmac, timingSafeEqual as nodeTimingSafeEqual } from "node:crypto";
import type { ProviderKey } from "./types.js";
import { header } from "./http.js";
import { requireProvider } from "./index.js";

/** A board's HTTP header bag as the inbound route hands it over (case-insensitive
 *  read via the shared {@link header} helper). */
export type HeaderBag = Record<string, string | string[] | undefined>;

/**
 * Constant-time string compare for signature/secret verification.
 *
 * Uses Node's `crypto.timingSafeEqual`, which REQUIRES two equal-length buffers (it
 * throws on a length mismatch and would itself leak length via the throw). So we
 * length-guard FIRST: a differing length returns false immediately. The length of a
 * signature/secret is not itself a useful secret (an attacker controls their own
 * forged signature's length), so the early length return does not weaken the
 * guarantee that matters - the per-byte compare of two same-length candidates is
 * constant-time. Empty inputs are rejected (an empty signature is never valid).
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length === 0 || b.length === 0) return false;
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // crypto.timingSafeEqual throws on unequal lengths; guard so we never throw and
  // never run the per-byte compare on mismatched lengths.
  if (ab.length !== bb.length) return false;
  return nodeTimingSafeEqual(ab, bb);
}

/** Normalize a provided signature header: drop a leading `sha1=`/`sha256=` algo
 *  prefix some boards prepend, and trim surrounding whitespace. */
function normalizeSig(value: string): string {
  return value.replace(/^sha(?:1|256)=/i, "").trim();
}

/**
 * Indeed: HMAC-SHA1 (hex) over the RAW body, delivered in `X-Indeed-Signature`
 * (some deployments send `X-Indeed-Signature-256`; either header is read). The
 * compare is hex, lower-cased on both sides, timing-safe. Mirrors
 * {@link indeedProvider.verifyWebhook} byte-for-byte.
 */
function verifyIndeed(rawBody: string, headers: HeaderBag, secret: string): boolean {
  const sig = header(headers, "x-indeed-signature") ?? header(headers, "x-indeed-signature-256");
  if (!sig) return false;
  const expected = createHmac("sha1", secret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqual(expected.toLowerCase(), normalizeSig(sig).toLowerCase());
}

/**
 * LinkedIn: HMAC-SHA256 over the RAW body, delivered in `X-LI-Signature` (alias
 * `X-LinkedIn-Signature`). LinkedIn signs base64; we also accept hex defensively,
 * each compared timing-safe. The challenge-handshake path (a body carrying a
 * challengeCode and NO signature header) is NOT authenticated here - that handshake
 * is the adapter's concern (it has no HMAC to verify yet), so a LinkedIn callback
 * with no signature header returns false from THIS dispatcher and the route falls
 * back to the adapter's `verifyWebhook` for the handshake. Mirrors
 * {@link linkedinProvider.verifyWebhook}'s push branch.
 */
function verifyLinkedIn(rawBody: string, headers: HeaderBag, secret: string): boolean {
  const sig = header(headers, "x-li-signature") ?? header(headers, "x-linkedin-signature");
  if (!sig) return false;
  const provided = normalizeSig(sig);
  const expectedB64 = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqual(expectedB64, provided) || timingSafeEqual(expectedHex, provided.toLowerCase());
}

/**
 * ZipRecruiter: base64 HMAC-SHA256 over the signed string `${timestamp}.${rawBody}`,
 * delivered in `X-ZipRecruiter-Signature` with the unix `timestamp` in
 * `X-ZipRecruiter-Signature-Timestamp`. Both headers are required (the timestamp is
 * part of the signed bytes, so a missing timestamp makes the signature
 * unverifiable). Mirrors {@link ziprecruiterProvider.verifyWebhook}.
 */
function verifyZipRecruiter(rawBody: string, headers: HeaderBag, secret: string): boolean {
  const sig = header(headers, "x-ziprecruiter-signature");
  const timestamp = header(headers, "x-ziprecruiter-signature-timestamp");
  if (!sig || !timestamp) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest("base64");
  return timingSafeEqual(expected, normalizeSig(sig));
}

/**
 * Naukri (InfoEdge / Zwayam Amplify): a SHARED-SECRET header compare, NOT an HMAC of
 * the body. Amplify echoes the same static `Secret Key` header (alias `secret-key`);
 * we timing-safe compare that header value to the tenant's stored secret. The
 * rawBody is unused for Naukri (kept in the signature for parity), so it is accepted
 * but not hashed. Mirrors {@link naukriProvider.verifyWebhook}.
 */
function verifyNaukri(_rawBody: string, headers: HeaderBag, secret: string): boolean {
  const provided = header(headers, "Secret Key") ?? header(headers, "secret-key");
  if (!provided) return false;
  return timingSafeEqual(secret, provided.trim());
}

/**
 * The per-provider verifier dispatch table. ONLY the boards with a fixed,
 * well-known signing scheme appear here; every other key (seek, google-jobs, and
 * any future board) is NOT in the table and is handled by delegating to the
 * adapter's own `verifyWebhook` in {@link verifySignature}.
 *
 *   indeed       -> HMAC-SHA1 (hex)            == X-Indeed-Signature
 *   linkedin     -> HMAC-SHA256 (base64/hex)   == X-LI-Signature
 *   ziprecruiter -> base64 HMAC-SHA256 over `${timestamp}.${rawBody}`
 *                                              == X-ZipRecruiter-Signature
 *                                              (+ X-ZipRecruiter-Signature-Timestamp)
 *   naukri       -> shared-secret header compare (`Secret Key`), NOT an HMAC
 *   (others)     -> delegate to requireProvider(provider).verifyWebhook
 */
const DISPATCH: Partial<Record<ProviderKey, (rawBody: string, headers: HeaderBag, secret: string) => boolean>> = {
  indeed: verifyIndeed,
  linkedin: verifyLinkedIn,
  ziprecruiter: verifyZipRecruiter,
  naukri: verifyNaukri,
};

/**
 * Verify an inbound apply-webhook's signature over the EXACT raw bytes the board
 * signed. The single entry point the inbound route calls before parsing.
 *
 * Dispatches by `provider`: a fixed-scheme board (indeed / linkedin / ziprecruiter /
 * naukri) is verified by its entry in {@link DISPATCH}; any other registered board
 * (seek, google-jobs, ...) delegates to that adapter's own
 * {@link HiringPlatformProvider.verifyWebhook} (the adapter is the source of truth
 * for its bespoke handshake). An unknown provider key, or any verifier throwing,
 * fails closed (returns false) - an unverifiable callback is always rejected.
 *
 * @param provider the board {@link ProviderKey} the callback claims to be from.
 * @param rawBody  the EXACT unparsed request body bytes the board signed.
 * @param headers  the inbound HTTP headers (read case-insensitively).
 * @param secret   the tenant's stored webhook secret; a missing/blank secret makes
 *                 the callback unverifiable -> false.
 * @returns true ONLY when the signature is real; false on any mismatch, missing
 *          secret/header, unknown provider, or error (fail closed).
 */
export function verifySignature(
  provider: ProviderKey,
  rawBody: string,
  headers: HeaderBag,
  secret?: string,
): boolean {
  // Fail closed: no secret -> the callback is unverifiable, reject it.
  if (typeof secret !== "string" || secret.length === 0) return false;

  const fixed = DISPATCH[provider];
  if (fixed) {
    try {
      return fixed(rawBody, headers, secret);
    } catch {
      // A malformed header / crypto error must never accept a callback.
      return false;
    }
  }

  // Bespoke-scheme board (seek, google-jobs, ...): the adapter owns verification.
  // requireProvider throws for an unregistered key; treat that (and any verifier
  // error) as an honest rejection rather than letting it bubble into the route.
  try {
    return requireProvider(provider).verifyWebhook(headers, rawBody, secret);
  } catch {
    return false;
  }
}

export default verifySignature;
