/**
 * Hiring-platform provider contract (job-service) - WF-E / SLICE E1.
 *
 * One small TypeScript surface every external job board / multiposting partner
 * adapter implements (Indeed, LinkedIn, ZipRecruiter, Naukri, SEEK, Dice,
 * Wellfound, Google Jobs, Adzuna, Jooble, foundit, Shine). The rest of the
 * service (the distribution dispatcher, the inbound apply-webhook router, the
 * status reaper, the XML/JSON feed builder, the JSON-LD `JobPosting` emitter)
 * talks ONLY to this interface + the normalized shapes below, so a new board is
 * added by dropping in one disjoint adapter file and registering it in the
 * sibling `./index.ts` - nothing else changes.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication / inbound apply),
 * which is DELIBERATELY DISTINCT from the assessment-provider axis in
 * apps/assessment-service/src/providers: separate registries, separate module
 * gating (`oa-assessments` vs the job-board distribution surface), separate
 * credential kinds. Do NOT cross-wire the two.
 *
 * == HARD RULES baked into the contract ======================================
 *  - REAL data or honest null ONLY. {@link HiringPlatformProvider.postJob} returns
 *    a real {@link NormalizedJob.externalRefs} entry derived from the board's own
 *    response (kept verbatim in `raw`); externalId / externalUrl / status are
 *    NEVER synthesized. {@link HiringPlatformProvider.parseApplication} and
 *    {@link HiringPlatformProvider.fetchApplications} return `null` / `[]` when the
 *    board has nothing real - never a fabricated candidate or applyId.
 *  - No auto-reject. The contract carries application + disposition signal only;
 *    the decision to advance/reject a candidate stays in the HITL flow downstream
 *    (GDPR Art. 22). An adapter never decides an applicant's fate, and a
 *    disposition push back to a board ({@link HiringPlatformProvider.syncDisposition})
 *    only mirrors a decision a human already made in the ATS.
 *  - Credentials never live in this module. They arrive per call as
 *    {@link PlatformCredentials}, decrypted (AES-GCM) by the caller at the point of
 *    use (see apps/assessment-service/src/lib/provider-creds.ts for the loader
 *    pattern); an adapter must not persist or log them.
 *  - {@link HiringPlatformProvider.verifyWebhook} runs over the RAW (unparsed)
 *    request bytes the board signed, so the HMAC / signature check matches; the
 *    inbound router never parses before verifying. A forged or unverifiable
 *    callback is rejected (returns false).
 *  - Board rate limits are respected by the adapter (per-board spacing + 429
 *    Retry-After backoff via the shared http helper) - see each adapter's notes.
 */

/**
 * Decrypted, per-call hiring-platform credentials. These are the plaintext secrets
 * the caller obtained by AES-GCM-decrypting the tenant's stored board integration
 * config at the point of use; an adapter reads what it needs and never stores them.
 *
 * The base shape mirrors the assessment-service ProviderCredentials (so the same
 * sealed-config loader maps onto it) and adds the few hiring-board-specific fields:
 * Field meanings are per-board (see each adapter): e.g. Indeed/LinkedIn use OAuth
 * `clientId`+`clientSecret`, ZipRecruiter/Adzuna/Jooble use an `apiKey`, Naukri /
 * foundit / Shine use `apiToken`; `organizationId`/`contractId` scope a posting to
 * the tenant's employer account / sponsorship contract; `linkedinVersion` pins the
 * LinkedIn versioned-API date. `baseUrl`/`region`/`subdomain` cover sandbox +
 * regional routing; `webhookSecret` verifies inbound apply-webhook signatures.
 */
export interface PlatformCredentials {
  apiKey?: string;
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  /** Override the board's API base (sandbox / regional host). */
  baseUrl?: string;
  /** Regional hint some boards key their host on (e.g. "us", "in", "au"). */
  region?: string;
  /** Board account subdomain where the host is `{subdomain}.board.com`. */
  subdomain?: string;
  /** The tenant's employer / company / organization id on the board. */
  organizationId?: string;
  /** The sponsorship / posting contract id some boards require per job. */
  contractId?: string;
  /** LinkedIn versioned-API date header (e.g. "202401"); LinkedIn only. */
  linkedinVersion?: string;
}

/** Registry keys - one per supported hiring platform. Matches the per-tenant board
 *  integration kind the credential store keys its config on. This axis is DISTINCT
 *  from the assessment ProviderKey union; do not merge the two vocabularies. */
export type ProviderKey =
  | "indeed"
  | "linkedin"
  | "ziprecruiter"
  | "naukri"
  | "seek"
  | "dice"
  | "wellfound"
  | "google-jobs"
  | "adzuna"
  | "jooble"
  | "foundit"
  | "shine";

/**
 * What a board adapter can do. Each capability is honest about the board's real
 * integration surface, so the dispatcher / feed builder / inbound router can pick
 * the right path per board without probing:
 *  - `postApi`         the board accepts a real programmatic job-create call.
 *  - `feed`            the board ingests the tenant's XML/JSON job feed (pull) -
 *                      {@link HiringPlatformProvider.toFeedEntry} is implemented.
 *  - `jsonLd`          schema.org JobPosting JSON-LD is emitted for this board
 *                      (e.g. Google Jobs structured data) - {@link
 *                      HiringPlatformProvider.toJsonLd} is implemented.
 *  - `applyWebhook`    the board POSTs inbound applications to our webhook ingress
 *                      - {@link HiringPlatformProvider.parseApplication} handles it.
 *  - `dispositionSync` the board accepts a disposition push (status mirror back) -
 *                      {@link HiringPlatformProvider.syncDisposition} is implemented.
 *  - `searchCandidates`the board exposes a candidate/talent search the tenant's
 *                      account is entitled to - {@link
 *                      HiringPlatformProvider.searchCandidates} is implemented.
 */
export interface ProviderCapabilities {
  postApi: boolean;
  feed: boolean;
  jsonLd: boolean;
  applyWebhook: boolean;
  dispositionSync: boolean;
  searchCandidates: boolean;
}

/** Geographic location of a job, normalized. `remote` is the only required field
 *  (a remote-anywhere role may carry no country); the rest are present only when
 *  the requisition actually specified them (never defaulted). */
export interface NormalizedJobLocation {
  country?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  remote: boolean;
}

/** Compensation range, normalized. Present only when the requisition carries real
 *  comp data; `min`/`max` are each optional (an open-ended range is honest). */
export interface NormalizedJobSalary {
  min?: number;
  max?: number;
  /** ISO 4217 currency code (e.g. "USD", "INR", "AUD"). */
  currency: string;
  /** Pay period the range is expressed in (e.g. "year", "month", "hour"). */
  period: string;
}

/**
 * One board's real external reference for a posted job. Populated ONLY from a real
 * adapter response - `externalId` is the board's own posting id, `url` the live
 * board listing URL (omitted until the board returns one), `status` the board's
 * reported lifecycle. NEVER synthesized; the absence of a posting is the absence
 * of an entry in {@link NormalizedJob.externalRefs}.
 */
export interface ExternalJobRef {
  externalId: string;
  url?: string;
  status: NormalizedJobStatus;
}

/** Normalized lifecycle status of a posting ON a board. Mirrors the persisted
 *  DistributionStatus vocabulary (job-service schema) so an adapter response maps
 *  straight onto the JobBoardDistribution row. */
export type NormalizedJobStatus =
  | "PENDING" // queued for the board, not yet posted
  | "POSTING" // post call in flight / accepted, not yet live
  | "ACTIVE" // live on the board
  | "FAILED" // the board rejected the post (lastError carries why)
  | "EXPIRED" // the board's listing window lapsed
  | "CLOSED" // the listing was closed (by us or the board)
  | "PENDING_PARTNER_APPROVAL"; // queued for the board's manual partner review

/**
 * The single, board-agnostic job shape every adapter posts FROM and serializes
 * (feed entry / JSON-LD) FROM. Built by the dispatcher from a Requisition +
 * JobPosting; an adapter only reads it. `externalRefs` is the real per-board
 * external state (populated by prior posts), keyed by {@link ProviderKey}; an
 * adapter never writes a fake ref into it.
 */
export interface NormalizedJob {
  /** The ATS JobPosting id this job corresponds to (our correlation handle). */
  id: string;
  /** Real per-board external references, keyed by provider. Empty until posted;
   *  entries are populated ONLY from real adapter responses. */
  externalRefs: Partial<Record<ProviderKey, ExternalJobRef>>;
  title: string;
  /** Sanitized HTML job description (the board-facing body). */
  descriptionHtml: string;
  location: NormalizedJobLocation;
  /** Employment-type tags (e.g. ["FULL_TIME"], ["CONTRACT","PART_TIME"]). */
  employmentType: string[];
  salary?: NormalizedJobSalary;
  /** Hard/required qualifications, one per line. */
  requirements: string[];
  /** Listed benefits/perks, one per line. */
  benefits: string[];
  department?: string;
  /** ISO-8601 timestamp the posting went public. */
  datePublished: string;
  /** ISO-8601 timestamp the posting expires, when known. */
  validThrough?: string;
  /** Absolute apply URL applicants are sent to (the ATS public apply page). */
  applyUrl: string;
  /** Public contact email for the listing. */
  contactEmail: string;
  /** Public contact phone for the listing, when supplied. */
  contactPhone?: string;
}

/** One screener question + the applicant's answer, as a board delivered it on an
 *  inbound application. Pure passthrough - never synthesized. */
export interface ScreenerAnswer {
  question: string;
  answer: string;
}

/** A resume attachment on an inbound application. Boards deliver a resume EITHER
 *  inline (base64) OR by a fetchable media URL; at most one is set. Both omitted
 *  means the application carried no resume (honest absence, not a stub). */
export interface NormalizedResume {
  fileName: string;
  contentType: string;
  /** Base64-encoded file bytes, when the board delivered the resume inline. */
  base64?: string;
  /** A fetchable URL the resume must be downloaded from, when not inline. */
  mediaUrl?: string;
}

/** The applicant's identity + contact on an inbound application. Only `firstName`,
 *  `lastName`, and `email` are required (a board that omits the rest is honest);
 *  nothing is defaulted to a placeholder. */
export interface NormalizedApplicant {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  /** Free-form location string as the board reported it. */
  location?: string;
}

/**
 * The single, board-agnostic shape every adapter normalizes an inbound application
 * (webhook or pull) into. Produced ONLY from a real board payload (kept verbatim in
 * `raw`); {@link HiringPlatformProvider.parseApplication} returns `null` rather than
 * fabricate one. `externalApplyId` is the board's own application id (the inbound
 * dedupe key); `jobExternalId` is the board posting id the application targets, so
 * the router can resolve the owning JobPosting / tenant with no auth context.
 */
export interface NormalizedApplication {
  /** Which board adapter produced this (the registry key, e.g. "indeed"). */
  provider: ProviderKey;
  /** The board's own posting id this application targets (the correlation key). */
  jobExternalId: string;
  /** The board's own application id - the inbound idempotency / dedupe key. */
  externalApplyId: string;
  /** When the candidate applied, per the board. */
  appliedAt: Date;
  candidate: NormalizedApplicant;
  resume?: NormalizedResume;
  /** Screener Q&A the board collected, in order. Empty when the board collected none. */
  screenerAnswers: ScreenerAnswer[];
  coverLetter?: string;
  /** The untouched board payload - provenance for every field above. */
  raw: unknown;
}

/**
 * Normalized candidate-application disposition status - a small, board-agnostic
 * vocabulary the ATS pushes BACK to a board (when it supports dispositionSync) to
 * mirror a decision a human already made. This is the APPLICATION/candidate axis
 * and is intentionally separate from {@link NormalizedJobStatus} (the posting axis).
 * No status here triggers an automated reject; it only reports an existing HITL
 * outcome.
 */
export type NormalizedStatus =
  | "NEW" // received, not yet reviewed
  | "REVIEWED" // a human looked at it
  | "SHORTLISTED" // advanced toward interview
  | "INTERVIEWING" // in the interview loop
  | "OFFER" // an offer was extended
  | "HIRED" // accepted / hired
  | "REJECTED" // declined after human review (never auto)
  | "WITHDRAWN"; // the candidate withdrew

/**
 * A candidate returned from a board's talent-search surface (when the board
 * exposes one and the tenant is entitled). Produced ONLY from a real board result;
 * {@link HiringPlatformProvider.searchCandidates} returns `[]` for no matches.
 */
export interface NormalizedCandidate {
  /** Which board produced this match (the registry key). */
  provider: ProviderKey;
  /** The board's own candidate / profile id. */
  externalId: string;
  firstName?: string;
  lastName?: string;
  /** Public headline / current title, when the board exposes one. */
  headline?: string;
  /** Free-form location string as the board reported it. */
  location?: string;
  /** Skill tags the board surfaced for the profile. Empty when none. */
  skills: string[];
  /** The board's public profile URL for the candidate, when supplied. */
  profileUrl?: string;
  /** Contact email, ONLY when the board's API actually returns one (many gate it). */
  email?: string;
  /** The untouched board payload - provenance for every field above. */
  raw: unknown;
}

/**
 * The hiring-platform adapter contract. Every board file exports a single object
 * implementing this. Required methods cover the universal lifecycle (post / close
 * / verify+parse inbound apply); the optional methods are present on a board ONLY
 * when its matching {@link ProviderCapabilities} flag is true, so the caller gates
 * on `caps` before invoking an optional method. Async methods may throw on a
 * transport/HTTP error; the caller owns retry/backoff scheduling, while each
 * adapter already respects the board's documented rate limits internally.
 */
export interface HiringPlatformProvider {
  /** Registry key + the value stamped into normalized shapes' `provider` field. */
  readonly id: ProviderKey;

  /** What this board can do - the caller gates optional-method calls on these. */
  readonly caps: ProviderCapabilities;

  /**
   * Post (create or update) one job on the board via its programmatic API. Returns
   * the board's REAL external posting id + (when the board returns one) the live
   * listing URL + the board's reported status, plus the verbatim board response in
   * `raw`. externalId / externalUrl / status are NEVER synthesized - they come
   * from the board's actual response. Only meaningful when `caps.postApi`.
   */
  postJob(
    job: NormalizedJob,
    creds: PlatformCredentials,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }>;

  /**
   * Close / take down a previously posted job on the board by its external posting
   * id. Idempotent: closing an already-closed or unknown posting must not throw.
   * Only meaningful when `caps.postApi`.
   */
  closeJob(externalId: string, creds: PlatformCredentials): Promise<void>;

  /**
   * Fetch the board's current lifecycle status for a posting by its external id,
   * for the status reaper. Returns the board's reported status + the verbatim
   * payload; NEVER synthesizes a status. Present only on boards that expose a
   * posting-status read.
   */
  fetchJobStatus?(
    externalId: string,
    creds: PlatformCredentials,
  ): Promise<{ status: NormalizedJobStatus; raw: unknown }>;

  /**
   * Serialize the job into ONE entry of this board's XML/JSON pull feed (the
   * board ingests the tenant's feed rather than accepting a post). Present only
   * when `caps.feed`. A pure function of the job - no network, no creds.
   */
  toFeedEntry?(job: NormalizedJob): string;

  /**
   * Serialize the job into schema.org `JobPosting` JSON-LD (e.g. for Google Jobs
   * structured data). Present only when `caps.jsonLd`. A pure function of the job
   * - no network, no creds.
   */
  toJsonLd?(job: NormalizedJob): object;

  /**
   * Verify an inbound apply-webhook's authenticity from its headers + the RAW
   * (unparsed) body and the tenant's stored webhook secret. Returns false on any
   * mismatch (or when no secret is configured) so a forged callback is rejected.
   * Boards whose webhook offers no signature return false when a secret IS expected
   * and the signature is therefore unverifiable.
   */
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
    secret?: string,
  ): boolean;

  /**
   * Parse an (already-verified) inbound webhook RAW body into a
   * {@link NormalizedApplication}. Returns `null` when the payload is not a real
   * application event (e.g. a ping / status ack) or carries no real applicant - the
   * caller then ignores it rather than persisting a fake. NEVER synthesizes a
   * candidate or applyId.
   */
  parseApplication(rawBody: string): NormalizedApplication | null;

  /**
   * Push a candidate's disposition (a decision a human already made in the ATS)
   * back to the board, to keep the board's funnel in sync. Present only when
   * `caps.dispositionSync`. Never triggers an automated reject - it only mirrors an
   * existing HITL outcome.
   */
  syncDisposition?(
    app: NormalizedApplication,
    status: NormalizedStatus,
    creds: PlatformCredentials,
  ): Promise<void>;

  /**
   * Pull applications from the board since a timestamp (for boards that expose a
   * poll instead of, or in addition to, a webhook). Returns a list normalized from
   * REAL board payloads; `[]` when there are none - never fabricated. Present only
   * when `caps.applyWebhook` is false but the board still supports a poll, or as a
   * backstop alongside the webhook.
   */
  fetchApplications?(since: Date, creds: PlatformCredentials): Promise<NormalizedApplication[]>;

  /**
   * Search the board's talent pool (when the board exposes one and the tenant is
   * entitled). Returns matches normalized from REAL board results; `[]` for no
   * matches - never fabricated. Present only when `caps.searchCandidates`.
   */
  searchCandidates?(query: string, creds: PlatformCredentials): Promise<NormalizedCandidate[]>;
}
