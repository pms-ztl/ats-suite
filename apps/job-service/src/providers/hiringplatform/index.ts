/**
 * Hiring-platform provider adapter registry (job-service) - WF-E / SLICE E2.
 *
 * Maps a provider key (which is identical to the per-tenant board-integration
 * `kind` the credential store keys its config on, e.g. "indeed") to its
 * {@link HiringPlatformProvider} adapter. The rest of the service - the
 * distribution dispatcher, the inbound apply-webhook router, the status reaper,
 * the XML/JSON feed builder, the JSON-LD `JobPosting` emitter - resolves an
 * adapter through {@link getProvider} / {@link requireProvider} and never imports
 * a concrete board file directly, so adding a board is: drop in a disjoint
 * adapter file + add one line here.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication / inbound apply),
 * DELIBERATELY DISTINCT from the assessment-provider axis in
 * apps/assessment-service/src/providers: separate registry, separate module
 * gating (the job-board distribution surface vs `oa-assessments`), separate
 * credential kinds. The two ProviderKey unions never overlap; do NOT cross-wire.
 *
 * Capability note: boards differ in HOW a job reaches them and HOW an
 * application comes back. {@link providerSupportsWebhook} /
 * {@link providerSupportsFeed} read the resolved adapter's REAL
 * {@link ProviderCapabilities} so the caller picks the right path per board
 * (inbound-webhook ingress vs poll, post-API vs feed/JSON-LD) WITHOUT probing.
 *
 * The registry starts EMPTY / partially-populated: the concrete board adapters
 * register here in WF-F / WF-G / WF-H. An unregistered key resolves to `null`
 * (honest absence) - a provider is NEVER fabricated.
 *
 * All adapters obey the HARD RULES (real-data-or-null normalization, no
 * fabricated externalId/externalUrl/status/applyId, no auto-reject, RAW-bytes
 * webhook verification, per-board rate limits) - see each adapter file.
 */
import type { HiringPlatformProvider, ProviderCapabilities, ProviderKey } from "./types.js";
import { indeedProvider } from "./indeed.js";
import { ziprecruiterProvider } from "./ziprecruiter.js";
import { linkedinProvider } from "./linkedin.js";
import { naukriProvider } from "./naukri.js";
import { seekProvider } from "./seek.js";
import { diceProvider } from "./dice.js";
import { adzunaProvider } from "./adzuna.js";
import { joobleProvider } from "./jooble.js";
import { wellfoundProvider } from "./wellfound.js";
import { founditProvider, shineProvider } from "./foundit-shine.js";
import { buildSourceFeed, toJsonLd as feedToJsonLd } from "./feed.js";

/**
 * Google Jobs - a FEED-ONLY channel (no programmatic post-API, no inbound apply
 * webhook). Google does not accept a job-create call and does not POST inbound
 * applications back to us; it indexes the schema.org `JobPosting` JSON-LD we emit on
 * the public apply page (the canonical surface) and crawls the tenant's XML feed as a
 * supplement. So its only real capabilities are `jsonLd` + `feed`, both delegating to
 * the WF-F feed.ts pure builders; everything else honestly refuses rather than fake a
 * result.
 *
 * HARD RULES honored:
 *  - postJob / closeJob THROW (no fake externalId/status): the dispatcher gates on
 *    `caps.postApi` (false here) and never calls them, so a throw is the honest guard
 *    against a mis-dispatch rather than a fabricated ACTIVE posting.
 *  - verifyWebhook returns false (Google sends no signed apply callback) so any
 *    inbound POST claiming to be google-jobs is rejected.
 *  - parseApplication returns null (no real inbound application arrives via Google);
 *    candidates reach us through the public apply page, not a Google webhook.
 *  - toJsonLd / toFeedEntry are pure (no network, no creds) and reuse the shared WF-F
 *    serializers verbatim: toJsonLd -> feed.ts `toJsonLd`; toFeedEntry -> a single-job
 *    `<source>` snapshot via feed.ts `buildSourceFeed([job])`.
 */
const GOOGLE_JOBS = "google-jobs" as const;
const googleJobsCaps: ProviderCapabilities = {
  postApi: false,
  feed: true,
  jsonLd: true,
  applyWebhook: false,
  dispositionSync: false,
  searchCandidates: false,
};
const googleJobsProvider: HiringPlatformProvider = {
  id: GOOGLE_JOBS,
  caps: googleJobsCaps,
  async postJob() {
    // Feed-only: Google has no job-create API. Never synthesize an externalId/status.
    throw new Error("[google-jobs] feed-only channel: no programmatic postJob (use the JSON-LD / feed surface)");
  },
  async closeJob() {
    // Nothing to close via API: a job drops from Google when it leaves the feed /
    // its JSON-LD is removed. Idempotent no-op (never throws on close).
  },
  verifyWebhook() {
    // Google does not send a signed inbound apply webhook; reject any callback.
    return false;
  },
  parseApplication() {
    // No real inbound application arrives via Google (applicants use the public apply
    // page). Honest null rather than a fabricated candidate.
    return null;
  },
  toJsonLd(job) {
    return feedToJsonLd(job);
  },
  toFeedEntry(job) {
    // Single-job <source> feed snapshot, built from the WF-F serializer (pure).
    return buildSourceFeed([job]);
  },
};

/**
 * The provider registry: providerKey -> board adapter.
 *
 * Intentionally a PARTIAL map: only the keys whose adapters have been
 * implemented (in WF-F / WF-G / WF-H) appear here. A `ProviderKey` with no entry
 * resolves to `null` via {@link getProvider} rather than to a fabricated stub.
 */
export const PROVIDERS: Partial<Record<ProviderKey, HiringPlatformProvider>> = {
  // Board adapters register here as they are implemented (WF-F / WF-G / WF-H),
  // one disjoint file + one line each. The `indeed` adapter also covers Glassdoor
  // + Stack Overflow Jobs (they ingest through Indeed's Job Sync platform), e.g.:
  //   linkedin: linkedInProvider,
  indeed: indeedProvider,
  ziprecruiter: ziprecruiterProvider,
  linkedin: linkedinProvider,
  // Naukri (InfoEdge India) via the Zwayam Amplify multiposting bridge. HARD GATE:
  // requires a paid Naukri subscription + the paid integration module; with no creds
  // postJob returns PENDING_PARTNER_APPROVAL (no fake ACTIVE). Inbound apply via the
  // Amplify /apply/stage_update candidate-pull only; NO Resdex scrape (searchCandidates
  // is manual-contract-gated, left unimplemented).
  naukri: naukriProvider,
  // SEEK (AU / NZ) via the 2026 Ad Sync / Enhanced Job Posting GraphQL API
  // (postPosition + PositionOpening/PositionProfile, OAuth2 client_credentials
  // partner token). With no creds postJob returns PENDING_PARTNER_APPROVAL (no fake
  // ACTIVE); inbound apply via Apply-with-SEEK webhook (HMAC-SHA256 over raw bytes).
  seek: seekProvider,
  // Google Jobs - FEED-ONLY (caps jsonLd + feed). No post-API, no inbound webhook;
  // it indexes our schema.org JobPosting JSON-LD + crawls the XML feed, both via the
  // WF-F feed.ts builders. Defined inline above (no per-board API surface to adapt).
  "google-jobs": googleJobsProvider,
  // Dice (DHI Group) - FEED-PUBLISHER (caps feed only). The Dice Job Bot crawls the
  // published WF-F <source> feed (toFeedEntry delegates to buildSourceFeed([job]),
  // case-sensitive publisher tag set at the feed-publish layer). NO public post-API:
  // ATS Direct requires a signed DHI partner addendum + secret key, so postJob
  // returns PENDING_PARTNER_APPROVAL (no fake ACTIVE), not a scrape. Apply is an
  // apply-redirect to our public apply page, so there is no signed inbound webhook
  // (verifyWebhook false, parseApplication null).
  dice: diceProvider,
  // Adzuna - PULL-FEED aggregator (caps feed only). No programmatic post-API and no
  // inbound apply webhook: it crawls the registered WF-F Adzuna XML feed (toFeedEntry
  // delegates to toAdzunaFeed([job]) - split numeric <salary_min>/<salary_max>) and an
  // organic-board click redirects the jobseeker to our public apply page. Feed
  // registration is a partner-onboarding step but there is NO per-call secret, so
  // postJob is unconditionally feed-only (POSTING status, EMPTY externalId - never a
  // fake ACTIVE); verifyWebhook false, parseApplication null.
  adzuna: adzunaProvider,
  // Jooble - PULL-FEED aggregator (caps feed only), self-serve (NOT partner-gated).
  // Same shape as Adzuna; differs only in the feed wire format (toFeedEntry delegates
  // to toJoobleFeed([job]) - DD.MM.YYYY <updated>, inline <salary> string, <job id>
  // attribute). No post-API, no inbound webhook: organic clicks redirect to our public
  // apply page. postJob feed-only (POSTING, EMPTY externalId); verifyWebhook false,
  // parseApplication null.
  jooble: joobleProvider,
  // Wellfound (formerly AngelList Talent) - INVERTED / FEED-PULL model (caps feed +
  // applyWebhook). There is NO outbound partner job-create API: Wellfound PULLS the
  // tenant's standard <source> feed on its own crawl (toFeedEntry delegates to
  // buildSourceFeed([job])), so postJob returns PENDING_PARTNER_APPROVAL with an EMPTY
  // externalId (never a fake ACTIVE). applyWebhook is true ONLY so a CONFIGURED partner
  // application-writeback (HMAC-SHA256 over raw bytes, X-Wellfound/X-AngelList-Signature)
  // can route through the inbound ingress; the default apply flow redirects to our public
  // apply page so parseApplication returns null absent that signed writeback. No scraper
  // (searchCandidates false).
  wellfound: wellfoundProvider,
  // foundit (formerly Monster India/APAC) + Shine.com - CREDENTIAL-STORED connectors with
  // NO documented public employer API. Every capability is FALSE: the real path is a
  // manual partner contract (a privately-issued endpoint + secret configured out of band),
  // so postJob returns PENDING_PARTNER_APPROVAL with an EMPTY externalId + a clear
  // `no-public-api` flag (never a fake ACTIVE / synthetic id / guessed endpoint).
  // verifyWebhook false + parseApplication null unconditionally (no documented signed
  // callback); the default apply flow redirects to our public apply page. NO scrapers.
  // Both are built from the shared makeNoPublicApiProvider() factory in foundit-shine.js.
  foundit: founditProvider,
  shine: shineProvider,
};

/** Every provider key that has a registered adapter (honest, not the full union). */
export const PROVIDER_KEYS = Object.keys(PROVIDERS) as ProviderKey[];

/** True when `key` is a registered provider key (narrows to ProviderKey). */
export function isProviderKey(key: unknown): key is ProviderKey {
  return typeof key === "string" && key in PROVIDERS;
}

/** Resolve an adapter by key, or null if the key has no registered adapter. */
export function getProvider(key: string): HiringPlatformProvider | null {
  return isProviderKey(key) ? PROVIDERS[key] ?? null : null;
}

/** Resolve an adapter by key, throwing a clear error for an unknown provider. */
export function requireProvider(key: string): HiringPlatformProvider {
  const provider = getProvider(key);
  if (!provider) {
    throw new Error(
      `Unknown hiring-platform provider "${key}". Known: ${PROVIDER_KEYS.join(", ") || "(none registered)"}`,
    );
  }
  return provider;
}

/**
 * Whether a board delivers inbound applications via a webhook the ATS ingress
 * receives (vs poll-only). Reads the resolved adapter's REAL
 * {@link ProviderCapabilities.applyWebhook}; the inbound-webhook router uses this
 * to decide whether a board callback path is expected, and the poll/reaper covers
 * the rest. An unregistered key returns false (honest: no adapter, no webhook).
 */
export function providerSupportsWebhook(key: string): boolean {
  return getProvider(key)?.caps.applyWebhook === true;
}

/**
 * Whether a board ingests the tenant's XML/JSON job feed (pull) rather than (or
 * in addition to) accepting a programmatic post. Reads the resolved adapter's REAL
 * {@link ProviderCapabilities.feed}; the feed builder uses this to decide which
 * boards to include in the generated feed. An unregistered key returns false.
 */
export function providerSupportsFeed(key: string): boolean {
  return getProvider(key)?.caps.feed === true;
}

export * from "./types.js";
