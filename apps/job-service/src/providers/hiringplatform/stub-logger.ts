/**
 * Stub-honesty logger for the hiring-platform board adapters (job-service).
 *
 * Several board adapters have an HONEST stub path in postJob() where NO real
 * board API is called and a structured PENDING_PARTNER_APPROVAL / feed-only
 * envelope is returned instead:
 *
 *  - feed-only / no-public-API boards (adzuna, jooble, dice, wellfound, foundit,
 *    shine): postJob NEVER calls a board and always returns a stub envelope.
 *  - API boards with a no-credentials branch (linkedin, seek, naukri): only the
 *    missing-creds branch of postJob is a stub; the real API path is untouched.
 *
 * Those stub envelopes are truthful (they carry an honest `reason` + `note` and
 * an empty externalId), but the honesty previously lived ONLY in the persisted
 * `raw` blob and the PENDING_PARTNER_APPROVAL status; nothing warned at runtime.
 * {@link warnStub} emits a single `[STUB] not production` warning at the point of
 * use so a stub run is visible in the logs, and callers mark the returned `raw`
 * metadata with `stub: true` (additive: the `raw` column is an opaque JSON blob,
 * so no consumed shape changes).
 *
 * This reuses the standard `createLogger` idiom (as in index.ts / clamav.ts /
 * public.ts); it warns once per postJob call, never per item, and never logs or
 * transmits credentials.
 */
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "job-service:hiringplatform-stub" });

/**
 * Warn once, at the point of use, that a board adapter's stub path ran (no real
 * board API was called). `provider` is the board key; `reason` is the same honest
 * reason string carried in the returned `raw` (e.g. "no-credentials",
 * "no-public-api", "feed-only").
 */
export function warnStub(provider: string, reason: string): void {
  logger.warn(
    { provider, reason },
    `[STUB] not production: ${provider} postJob running against stub/fixture data (${reason}); no real board API called, returning an honest PENDING_PARTNER_APPROVAL / feed-only envelope`,
  );
}
