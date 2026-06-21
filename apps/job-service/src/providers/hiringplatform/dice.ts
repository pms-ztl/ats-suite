/**
 * Dice adapter (job-service hiring-platform axis) - WF-H / SLICE H1.
 *
 * Dice (DHI Group, https://www.dice.com) is a tech-focused job board whose ONLY
 * generally-available ingestion path is a FEED PUBLISH: the "Dice Job Bot" crawls
 * the publisher's standard `<source>/<job>` XML feed (the same de-facto aggregator
 * schema Indeed-style boards read), so this adapter is a FEED-PUBLISHER, NOT a
 * post-API connector. It is structurally the Google Jobs feed-only sibling in
 * ./index.ts, but emitting the WF-F `<source>` feed instead of JSON-LD.
 *
 * == How a Dice posting actually happens =====================================
 *  - Distribution: Dice's bot picks the job up from the tenant's published WF-F
 *    `<source>` feed. {@link diceProvider.toFeedEntry} delegates to the WF-F
 *    feed.ts `buildSourceFeed([job])` serializer VERBATIM (pure, no creds, no
 *    network) so a single job renders as a one-entry `<source>` snapshot the bot
 *    can ingest. The shared feed builder already obeys the real-data-or-omit rule
 *    (a field the job does not carry is omitted, never defaulted).
 *
 *    Routing note: the Dice Job Bot keys ingestion off a CASE-SENSITIVE feed
 *    hashtag / publisher tag agreed with DHI at onboarding (e.g. a `#DiceJobs`
 *    style marker on the publisher block). The feed builder emits the publisher
 *    metadata; the exact tag casing is configured per tenant at the dispatcher /
 *    feed-publish layer (NOT synthesized here), because a mis-cased tag silently
 *    drops the feed from the bot's crawl.
 *
 *  - Programmatic post: Dice's "ATS Direct" / Dice API job-post path is NOT a
 *    public REST surface. It requires a signed partner addendum to the Dice
 *    contract plus a partner secret key issued by DHI; there is no self-serve
 *    job-create endpoint. So {@link diceProvider.postJob} does NOT call out and
 *    does NOT fabricate an externalId/ACTIVE status - it returns a real
 *    PENDING_PARTNER_APPROVAL marker (caps.postApi is false, so the dispatcher
 *    gates on it and routes the posting to the feed + manual-partner path instead).
 *
 *  - Inbound apply: a Dice listing's Apply button is an APPLY-REDIRECT to the
 *    publisher's own apply URL (our public apply page) - applicants land on the ATS
 *    and become real Candidates through the existing public apply flow, NOT through
 *    a Dice webhook. Dice does NOT POST a signed inbound application back on the
 *    feed-publish path, so {@link diceProvider.parseApplication} returns null unless
 *    an ATS-Direct postback shape is separately configured (which requires the same
 *    partner addendum). verifyWebhook therefore returns false (no signed callback to
 *    verify on this surface).
 *
 * == HARD RULES ==============================================================
 *  - REAL data or honest null. No fabricated externalId / externalUrl / status:
 *    postJob returns PENDING_PARTNER_APPROVAL (the honest "no public post API"
 *    state), never a fake ACTIVE. parseApplication returns null (the apply is a
 *    redirect, not a postback), never a synthesized candidate or applyId.
 *  - Credential-stored connector with NO public API ships behind a clear
 *    PENDING_PARTNER_APPROVAL flag; this is NOT a scraper (we publish a feed the bot
 *    pulls; we never scrape Dice).
 *  - verifyWebhook returns false on this surface (no signed apply callback exists),
 *    so any inbound POST claiming to be Dice is rejected rather than trusted.
 *  - No auto-reject; this adapter only publishes a feed entry.
 *  - toFeedEntry is pure (no network, no creds) and reuses the WF-F serializer.
 *  - No em / en dashes in emitted text (the feed builder enforces this too).
 */
import type {
  HiringPlatformProvider,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  PlatformCredentials,
  ProviderCapabilities,
} from "./types.js";
import { buildSourceFeed } from "./feed.js";

const PROVIDER = "dice" as const;

/**
 * The partner-addendum gate: Dice's programmatic ATS Direct / API post path is
 * NOT a public REST surface - it requires a signed addendum to the DHI contract +
 * a partner secret key. Until that is in place a post is honestly parked as
 * PENDING_PARTNER_APPROVAL rather than dispatched, and surfaced via this flag so
 * the dispatcher / admin UI can explain WHY a Dice job is not auto-posting.
 */
export const DICE_PARTNER_ADDENDUM_REQUIRED = true;

/** Human-readable reason carried on the PENDING_PARTNER_APPROVAL post result. */
export const DICE_NO_PUBLIC_API_REASON =
  "Dice has no public job-post API; ATS Direct requires a signed DHI partner addendum + secret key. Distribute via the published <source> feed (Dice Job Bot crawl) instead.";

/**
 * Dice capabilities: FEED-PUBLISHER only.
 *  - feed: true     -> toFeedEntry delegates to the WF-F `<source>` builder; the
 *                      Dice Job Bot crawls the published feed.
 *  - postApi: false -> no public job-create REST (ATS Direct is partner-gated).
 *  - jsonLd: false  -> Dice ingests the XML `<source>` feed, not schema.org JSON-LD.
 *  - applyWebhook: false -> apply is a redirect to our public apply page, not a
 *                      signed inbound POST (no webhook to verify/parse here).
 *  - dispositionSync / searchCandidates: false -> no public surface for either on
 *                      the feed-publish path.
 */
const caps: ProviderCapabilities = {
  postApi: false,
  feed: true,
  jsonLd: false,
  applyWebhook: false,
  dispositionSync: false,
  searchCandidates: false,
};

export const diceProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps,

  /**
   * No public post-API. ATS Direct requires a signed DHI partner addendum + secret
   * key, so we return a REAL PENDING_PARTNER_APPROVAL marker rather than call out or
   * fabricate an externalId/ACTIVE status. The dispatcher gates on caps.postApi
   * (false) and routes to the feed + manual-partner path; this method existing keeps
   * the contract total while staying honest about the absent API.
   */
  async postJob(
    job: NormalizedJob,
    _creds: PlatformCredentials,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
    return {
      // The ATS JobPosting id is the only real correlation handle we have (Dice has
      // issued no posting id - there is no API to issue one). NEVER a fake board id.
      externalId: job.id,
      status: "PENDING_PARTNER_APPROVAL",
      raw: {
        provider: PROVIDER,
        pending: "PARTNER_ADDENDUM_REQUIRED",
        partnerAddendumRequired: DICE_PARTNER_ADDENDUM_REQUIRED,
        reason: DICE_NO_PUBLIC_API_REASON,
        jobPostingId: job.id,
      },
    };
  },

  /**
   * Nothing to close via an API (there is none): a Dice listing drops when the job
   * leaves the published feed on the next bot crawl. Idempotent no-op, never throws.
   */
  async closeJob(_externalId: string, _creds: PlatformCredentials): Promise<void> {
    // Feed-driven takedown: removing the job from the published <source> feed expires
    // the Dice listing on the next crawl. No partner-gated close call is made here.
  },

  /**
   * Serialize the job into ONE entry of the Dice-ingestible `<source>` feed by
   * delegating to the WF-F feed.ts `buildSourceFeed([job])` serializer VERBATIM. The
   * Dice Job Bot crawls this published feed; this is a pure function of the job (no
   * creds, no network). Routing reminder: the publisher feed hashtag/tag Dice keys
   * on is CASE-SENSITIVE and is set at the feed-publish layer, not synthesized here.
   */
  toFeedEntry(job: NormalizedJob): string {
    return buildSourceFeed([job]);
  },

  /**
   * No signed inbound apply webhook on the feed-publish path: a Dice Apply button is
   * an apply-redirect to our public apply page, so applicants become real Candidates
   * through the existing public apply flow, never via a Dice POST. Reject any inbound
   * callback claiming to be Dice (returns false) rather than trust an unverifiable one.
   * (An ATS-Direct postback would carry its own signature scheme configured under the
   * partner addendum; until then there is nothing real to verify.)
   */
  verifyWebhook(
    _headers: Record<string, string | string[] | undefined>,
    _rawBody: string,
    _secret?: string,
  ): boolean {
    return false;
  },

  /**
   * The Dice apply is a redirect, not a postback, so no real inbound application
   * arrives here on the feed-publish path: honest null rather than a fabricated
   * candidate / applyId. Candidates reach the ATS through the public apply page.
   * (Returns null unless an ATS-Direct postback shape is separately configured under
   * the partner addendum; none is wired on this surface.)
   */
  parseApplication(_rawBody: string): NormalizedApplication | null {
    return null;
  },
};

export default diceProvider;
