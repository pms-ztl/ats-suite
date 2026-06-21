/**
 * Adzuna adapter (job-service hiring-platform axis) - WF-H / SLICE H2.
 *
 * Adzuna is a PULL-FEED aggregator: it does NOT accept a programmatic job-create
 * call and it does NOT POST inbound applications back to us. An employer (or their
 * ATS) registers ONE feed URL with Adzuna; Adzuna crawls that XML feed on its own
 * cadence and indexes the listings. An organic-board click on Adzuna redirects the
 * jobseeker to the apply URL carried in the feed (our public apply page), where the
 * candidate becomes a REAL Candidate through the existing public-apply path - never
 * through an Adzuna callback. So this adapter's ONLY real capability is `feed`.
 *
 * == How a job reaches Adzuna ================================================
 *  - The feed builder (the dispatcher's syndication pass) collects the tenant's
 *    currently-distributable jobs and serializes them with the WF-F feed.ts
 *    {@link toAdzunaFeed} transform (an Adzuna `<jobs>` root with `<salary_min>` /
 *    `<salary_max>` numeric fields and the currency carried separately). This
 *    adapter's {@link adzunaProvider.toFeedEntry} delegates to that same transform
 *    over the single job, so a per-board "what would this one job look like in the
 *    Adzuna feed" snapshot is byte-identical to the full-feed serialization.
 *  - There is NO per-call auth and NO per-call secret: the feed URL is registered
 *    with Adzuna out of band (partner setup), and the crawl is anonymous over the
 *    public feed URL. {@link PlatformCredentials} are therefore unused here.
 *
 * == HARD RULES (real-data-or-null) ==========================================
 *  - postJob is FEED-ONLY: Adzuna has no job-create API, so postJob does NOT call
 *    anything and does NOT fabricate an externalId. It returns a `feed` status with
 *    an EMPTY externalId (the listing lives in the crawled feed, not behind a board
 *    posting id) so the distribution row honestly records "published to the feed,
 *    awaiting crawl" rather than a fake ACTIVE keyed on a synthesized id.
 *  - closeJob is a no-op: a job drops from Adzuna when it leaves the feed on the
 *    next crawl (full-snapshot discipline in feed.ts). Idempotent, never throws.
 *  - verifyWebhook returns false: Adzuna sends no signed inbound apply callback, so
 *    any POST claiming to be adzuna is rejected (no secret can verify a callback
 *    that does not exist).
 *  - parseApplication returns null: no real inbound application arrives via Adzuna
 *    (jobseekers are redirected to our applyUrl). Honest null, NEVER a fabricated
 *    candidate or applyId.
 *  - toFeedEntry is PURE (no network, no creds) and reuses the shared WF-F
 *    serializer verbatim.
 *
 * Partner-gated SETUP (feed-registration is a partner onboarding step) but NOT
 * per-call gated: there is no secret to withhold, so unlike the API boards
 * (LinkedIn/Indeed/SEEK/Naukri) postJob does not branch on missing creds - it is
 * unconditionally feed-only. caps.postApi is false so the dispatcher never routes a
 * programmatic post here; it routes the job into the feed snapshot instead.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication), DISTINCT from the
 * assessment-provider axis. No DB, no logging of anything sensitive (there are no
 * creds to log).
 */
import type {
  HiringPlatformProvider,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  ProviderCapabilities,
} from "./types.js";
import { toAdzunaFeed } from "./feed.js";

const PROVIDER = "adzuna" as const;

/**
 * Adzuna's only real integration surface is the pull feed: it ingests the tenant's
 * XML job feed and indexes it. No programmatic post-API, no schema.org JSON-LD axis
 * here (that is Google Jobs), no inbound apply webhook, no disposition push, no
 * entitled talent search. So `feed` is the single true capability.
 */
const caps: ProviderCapabilities = {
  postApi: false,
  feed: true,
  jsonLd: false,
  applyWebhook: false,
  dispositionSync: false,
  searchCandidates: false,
};

export const adzunaProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps,

  /**
   * Feed-only: Adzuna has no job-create API. We do NOT call anything and do NOT
   * synthesize an externalId/listing URL. The job reaches Adzuna by being included
   * in the next {@link toAdzunaFeed} snapshot the feed builder serves; this returns
   * an honest "feed" status with an EMPTY externalId so the distribution row records
   * "queued into the feed" rather than a fabricated ACTIVE keyed on a fake id.
   */
  async postJob(
    _job: NormalizedJob,
    _creds,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
    return {
      // No board posting id exists for a crawled feed listing; never synthesized.
      externalId: "",
      // POSTING = accepted into the feed, not yet confirmed crawled/live. We never
      // claim ACTIVE for a feed listing we cannot independently confirm went live.
      status: "POSTING",
      raw: { reason: "feed-only", note: "Adzuna ingests the registered XML feed; no programmatic postJob" },
    };
  },

  /**
   * Nothing to close via an API: a job drops from Adzuna when it leaves the feed on
   * the next crawl (the WF-F full-snapshot discipline). Idempotent no-op (never
   * throws on close).
   */
  async closeJob(): Promise<void> {
    // No-op: removal happens by omission from the next feed snapshot.
  },

  /**
   * Adzuna sends no signed inbound apply webhook, so any callback claiming to be
   * adzuna is rejected. An organic-board click redirects to our applyUrl instead.
   */
  verifyWebhook(): boolean {
    return false;
  },

  /**
   * No real inbound application arrives via Adzuna (jobseekers are redirected to the
   * public apply page, where they become a real Candidate through the existing
   * public-apply path). Honest null, NEVER a fabricated candidate or applyId.
   */
  parseApplication(): NormalizedApplication | null {
    return null;
  },

  /**
   * Serialize the single job into ONE Adzuna feed snapshot, delegating to the WF-F
   * {@link toAdzunaFeed} transform over a single-element job set. Pure: no network,
   * no creds. The per-board snapshot is byte-identical to that job's slice of the
   * full feed (same `<salary_min>`/`<salary_max>` numeric fields, same real-data
   * discipline - a field absent on the job is absent in the output).
   */
  toFeedEntry(job: NormalizedJob): string {
    return toAdzunaFeed([job]);
  },
};

export default adzunaProvider;
