/**
 * Jooble adapter (job-service hiring-platform axis) - WF-H / SLICE H2.
 *
 * Jooble is a PULL-FEED job-search aggregator: like Adzuna it does NOT accept a
 * programmatic job-create call and does NOT POST inbound applications back to us. An
 * employer (or their ATS) registers ONE feed URL with Jooble; Jooble crawls that XML
 * feed on its own cadence and indexes the listings. An organic-board click on Jooble
 * redirects the jobseeker to the apply URL carried in the feed (our public apply
 * page), where the candidate becomes a REAL Candidate through the existing
 * public-apply path - never through a Jooble callback. So this adapter's ONLY real
 * capability is `feed`.
 *
 * Jooble differs from Adzuna ONLY in the feed wire format (and that is captured
 * entirely in the WF-F transform this delegates to): Jooble uses a `<jobs>` root
 * with one `<job id="...">` per posting, DD.MM.YYYY `<updated>` dates, and the
 * compensation expressed INLINE as a single `<salary>` string (currency + range +
 * period) rather than Adzuna's split numeric `<salary_min>`/`<salary_max>` fields.
 * The adapter itself is otherwise identical to {@link adzunaProvider}.
 *
 * == How a job reaches Jooble ================================================
 *  - The feed builder collects the tenant's currently-distributable jobs and
 *    serializes them with the WF-F feed.ts {@link toJoobleFeed} transform. This
 *    adapter's {@link joobleProvider.toFeedEntry} delegates to that same transform
 *    over the single job, so a per-board "what would this one job look like in the
 *    Jooble feed" snapshot is byte-identical to the full-feed serialization
 *    (DD.MM.YYYY dates, inline `<salary>`, `<job id>` attribute).
 *  - There is NO per-call auth and NO per-call secret: the feed URL is registered
 *    with Jooble out of band, and the crawl is anonymous over the public feed URL.
 *    Unlike Adzuna, Jooble's self-serve feed registration is NOT partner-gated.
 *    {@link PlatformCredentials} are unused here either way.
 *
 * == HARD RULES (real-data-or-null) ==========================================
 *  - postJob is FEED-ONLY: Jooble has no job-create API, so postJob does NOT call
 *    anything and does NOT fabricate an externalId. It returns a `feed` status with
 *    an EMPTY externalId (the listing lives in the crawled feed, keyed by the ATS
 *    JobPosting id inside the `<job id>` attribute, not behind a Jooble posting id)
 *    so the distribution row honestly records "published to the feed, awaiting
 *    crawl" rather than a fake ACTIVE keyed on a synthesized id.
 *  - closeJob is a no-op: a job drops from Jooble when it leaves the feed on the
 *    next crawl (full-snapshot discipline in feed.ts). Idempotent, never throws.
 *  - verifyWebhook returns false: Jooble sends no signed inbound apply callback, so
 *    any POST claiming to be jooble is rejected.
 *  - parseApplication returns null: no real inbound application arrives via Jooble
 *    (jobseekers are redirected to our applyUrl). Honest null, NEVER a fabricated
 *    candidate or applyId.
 *  - toFeedEntry is PURE (no network, no creds) and reuses the shared WF-F
 *    serializer verbatim.
 *
 * caps.postApi is false so the dispatcher never routes a programmatic post here; it
 * routes the job into the feed snapshot instead.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication), DISTINCT from the
 * assessment-provider axis. No DB, no logging of anything sensitive.
 */
import type {
  HiringPlatformProvider,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  ProviderCapabilities,
} from "./types.js";
import { toJoobleFeed } from "./feed.js";
import { warnStub } from "./stub-logger.js";

const PROVIDER = "jooble" as const;

/**
 * Jooble's only real integration surface is the pull feed: it ingests the tenant's
 * XML job feed and indexes it. No programmatic post-API, no JSON-LD axis here, no
 * inbound apply webhook, no disposition push, no entitled talent search. So `feed`
 * is the single true capability.
 */
const caps: ProviderCapabilities = {
  postApi: false,
  feed: true,
  jsonLd: false,
  applyWebhook: false,
  dispositionSync: false,
  searchCandidates: false,
};

export const joobleProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps,

  /**
   * Feed-only: Jooble has no job-create API. We do NOT call anything and do NOT
   * synthesize an externalId/listing URL. The job reaches Jooble by being included
   * in the next {@link toJoobleFeed} snapshot the feed builder serves; this returns
   * an honest "feed" status with an EMPTY externalId so the distribution row records
   * "queued into the feed" rather than a fabricated ACTIVE keyed on a fake id.
   */
  async postJob(
    _job: NormalizedJob,
    _creds,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
    // STUB path: no board API is called (Jooble is pull-feed only). Warn at runtime.
    warnStub(PROVIDER, "feed-only");
    return {
      // No board posting id exists for a crawled feed listing; never synthesized.
      // (The feed itself carries the ATS JobPosting id in the `<job id>` attribute.)
      externalId: "",
      // POSTING = accepted into the feed, not yet confirmed crawled/live. We never
      // claim ACTIVE for a feed listing we cannot independently confirm went live.
      status: "POSTING",
      raw: { stub: true, reason: "feed-only", note: "Jooble ingests the registered XML feed; no programmatic postJob" },
    };
  },

  /**
   * Nothing to close via an API: a job drops from Jooble when it leaves the feed on
   * the next crawl (the WF-F full-snapshot discipline). Idempotent no-op (never
   * throws on close).
   */
  async closeJob(): Promise<void> {
    // No-op: removal happens by omission from the next feed snapshot.
  },

  /**
   * Jooble sends no signed inbound apply webhook, so any callback claiming to be
   * jooble is rejected. An organic-board click redirects to our applyUrl instead.
   */
  verifyWebhook(): boolean {
    return false;
  },

  /**
   * No real inbound application arrives via Jooble (jobseekers are redirected to the
   * public apply page, where they become a real Candidate through the existing
   * public-apply path). Honest null, NEVER a fabricated candidate or applyId.
   */
  parseApplication(): NormalizedApplication | null {
    return null;
  },

  /**
   * Serialize the single job into ONE Jooble feed snapshot, delegating to the WF-F
   * {@link toJoobleFeed} transform over a single-element job set. Pure: no network,
   * no creds. The per-board snapshot is byte-identical to that job's slice of the
   * full feed (DD.MM.YYYY `<updated>` date, inline `<salary>` string, `<job id>`
   * attribute, same real-data discipline - a field absent on the job is absent).
   */
  toFeedEntry(job: NormalizedJob): string {
    return toJoobleFeed([job]);
  },
};

export default joobleProvider;
