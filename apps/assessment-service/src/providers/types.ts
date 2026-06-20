/**
 * Provider adapter contract (assessment-service) — WF8 / SLICE H2.
 *
 * One small TypeScript surface every external online-assessment (OA) vendor
 * adapter implements (HackerEarth, Codility, iMocha, TestGorilla, HackerRank).
 * The rest of the service (invite issuance, the inbound-webhook router, the
 * polling reaper) talks ONLY to this interface + the {@link NormalizedResult}
 * shape, so a new vendor is added by dropping in one disjoint adapter file and
 * registering it in {@link ./index.ts} — nothing else changes.
 *
 * ── HARD RULES baked into the contract ────────────────────────────────────────
 *  - REAL data or honest empty ONLY. {@link AssessmentProvider.fetchResult} and
 *    {@link AssessmentProvider.parseWebhook} return `null` when the vendor has no
 *    completed result yet. A NormalizedResult is ALWAYS derived from a real vendor
 *    payload (kept verbatim in `raw`); it is NEVER synthesized. There is no
 *    fabricated score, percentage, or pass/fail.
 *  - No auto-reject. The contract carries grade signal only (`score`, `passed`,
 *    `plagiarismFlag`); the decision to advance/reject stays in the HITL flow
 *    downstream (GDPR Art. 22). An adapter never decides a candidate's fate.
 *  - Credentials never live in this module. They arrive per call as
 *    {@link ProviderCredentials}, decrypted (AES-GCM) by the caller at the point
 *    of use; an adapter must not persist or log them.
 *  - Vendor rate limits are respected by the adapter (e.g. HackerRank 10 rps /
 *    429 backoff) — see the per-adapter notes.
 */

/**
 * Decrypted, per-call provider credentials. These are the plaintext secrets the
 * caller obtained by AES-GCM-decrypting the tenant's TenantIntegration.config at
 * the point of use; an adapter reads what it needs and never stores them.
 *
 * Field meanings are per-vendor (see each adapter): e.g. HackerEarth uses
 * `clientId`+`clientSecret`, Codility/iMocha/TestGorilla use `apiToken`/`apiKey`,
 * HackerRank uses `apiKey` (Basic/Bearer v3). `baseUrl`/`region`/`subdomain`
 * cover self-host + regional routing; `webhookSecret` is the shared secret used
 * to verify inbound webhook signatures.
 */
export interface ProviderCredentials {
  apiKey?: string;
  apiToken?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  /** Override the vendor's API base (self-host / sandbox / regional host). */
  baseUrl?: string;
  /** Regional hint some vendors key their host on (e.g. "us", "eu"). */
  region?: string;
  /** Vendor account subdomain where the host is `{subdomain}.vendor.com`. */
  subdomain?: string;
}

/**
 * A vendor-agnostic test/assessment listed in the provider's library. `id` is the
 * vendor's own test identifier (passed back into {@link InviteRequest.testId}).
 */
export interface ProviderTest {
  /** Vendor's own test/assessment id. */
  id: string;
  name: string;
  /** Free-form vendor category/tag, when supplied. */
  category?: string | null;
  durationMinutes?: number | null;
  /** The raw vendor object, kept verbatim for debugging / future fields. */
  raw?: unknown;
}

/**
 * A request to invite one candidate to a vendor test. The adapter turns this into
 * the vendor's invite/registration call. `sendCandidateEmail` is forced false at
 * the call sites (the ATS owns candidate comms), so the vendor must NOT email the
 * candidate — every adapter sets the vendor's no-email flag accordingly.
 *
 * `webhookUrl` is the ATS inbound ingress (the gateway raw proxy) the vendor will
 * POST the completion to; adapters that support per-invite callbacks wire it in.
 * HackerRank has no per-invite webhook, so it ignores `webhookUrl` and the result
 * is retrieved by {@link AssessmentProvider.fetchResult} polling instead.
 */
export interface InviteRequest {
  /** Vendor test/assessment id to invite the candidate to. */
  testId: string;
  candidateEmail: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  /**
   * The ATS correlation handle echoed back on the webhook/result so the inbound
   * router can resolve the owning invite/tenant with NO auth context. Adapters
   * pass this to the vendor (tag / external id / metadata) when the API allows.
   */
  correlationId?: string;
  /** Absolute inbound webhook URL for per-invite completion callbacks. */
  webhookUrl?: string;
  /** When the vendor supports an invite expiry, pass it through. */
  expiresAt?: Date;
}

/** What an adapter returns from {@link AssessmentProvider.invite}. */
export interface InviteResponse {
  /** The vendor's own invitation/registration id — the correlation key we store
   *  on AssessmentInvite.providerInvitationId and match inbound webhooks against. */
  providerInvitationId: string;
  /** The candidate-facing URL where they take the test. Null if the vendor does
   *  not return one synchronously (some deliver it via their own email only). */
  candidateTestUrl: string | null;
  /** Vendor-reported invite status, normalized to our lifecycle vocabulary. */
  status: NormalizedInviteStatus;
  /** The raw vendor response, kept verbatim. */
  raw: unknown;
}

/** Normalized invite lifecycle status (a small, vendor-agnostic vocabulary). */
export type NormalizedInviteStatus =
  | "PENDING"
  | "SENT"
  | "STARTED"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED";

/** Normalized completion status of an assessment result. */
export type NormalizedResultStatus =
  | "PENDING" // invited, not started
  | "STARTED" // in progress
  | "COMPLETED" // finished, score available
  | "EXPIRED" // invite/window lapsed without completion
  | "CANCELLED";

/**
 * The single, vendor-agnostic result shape every adapter normalizes a vendor
 * payload into. Optional numeric/flag fields are present ONLY when the vendor
 * actually reported them — never defaulted to 0/false. `raw` is the untouched
 * vendor payload (provenance + debugging). A NormalizedResult is produced ONLY
 * from a real vendor payload; the absence of a result is `null`, never a fake.
 */
export interface NormalizedResult {
  /** Vendor invitation id this result belongs to — the correlation key. */
  providerInvitationId: string;
  /** Which adapter produced this (the registry key, e.g. "hackerrank"). */
  provider: ProviderKey;
  status: NormalizedResultStatus;
  /** Absolute score the vendor reported (points). Omitted if not reported. */
  score?: number;
  /** Max possible score the vendor reported. Omitted if not reported. */
  maxScore?: number;
  /** Percentage 0..100 the vendor reported (or derived from score/maxScore when
   *  BOTH are present). Omitted when neither percentage nor score+maxScore exist. */
  percentage?: number;
  /** Vendor pass/fail verdict, when the vendor evaluated one. */
  passed?: boolean;
  /** Vendor plagiarism/cheating flag, when the vendor evaluated one. */
  plagiarismFlag?: boolean;
  /** Vendor-hosted candidate report URL, when supplied. */
  reportUrl?: string;
  /** Per-section breakdown the vendor reported, normalized. */
  sections?: NormalizedSection[];
  startedAt?: Date;
  completedAt?: Date;
  /** The untouched vendor payload — provenance for every field above. */
  raw: unknown;
}

/** One section/skill breakdown inside a {@link NormalizedResult}. */
export interface NormalizedSection {
  name: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
}

/**
 * The adapter contract. Every vendor file exports a single object implementing
 * this. Methods are async and may throw on a transport/HTTP error; the caller is
 * responsible for retry/backoff scheduling, but each adapter already respects the
 * vendor's documented rate limits internally (sequential calls + 429 honoring).
 */
export interface AssessmentProvider {
  /** Registry key + the value stamped into NormalizedResult.provider. */
  readonly id: ProviderKey;

  /**
   * List the tests/assessments available in the tenant's vendor account. Returns
   * an empty array (honest empty) when the account has none.
   */
  listTests(creds: ProviderCredentials): Promise<ProviderTest[]>;

  /**
   * Invite one candidate to a vendor test. The vendor must NOT email the
   * candidate (the no-email flag is set); the ATS owns candidate comms. Returns
   * the providerInvitationId + the candidate take URL (when the vendor returns
   * one synchronously).
   */
  invite(req: InviteRequest, creds: ProviderCredentials): Promise<InviteResponse>;

  /**
   * Fetch the result for a vendor invitation by polling. Returns a fully
   * populated NormalizedResult ONLY when the vendor reports the assessment is
   * complete; returns `null` while it is still pending/in-progress or has no
   * result — NEVER a fabricated score. This is the ONLY result path for vendors
   * without per-invite webhooks (HackerRank).
   */
  fetchResult(
    providerInvitationId: string,
    creds: ProviderCredentials,
  ): Promise<NormalizedResult | null>;

  /**
   * Verify an inbound webhook's authenticity from its headers + RAW (unparsed)
   * body and the tenant's stored webhook secret. Returns false on any mismatch
   * (or when no secret is configured) so a forged callback is rejected. Adapters
   * whose vendor offers no signature return false when a secret IS expected and
   * the signature is therefore unverifiable.
   */
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
    secret: string | undefined,
  ): boolean;

  /**
   * Parse a (already-verified) inbound webhook RAW body into a NormalizedResult.
   * Returns `null` when the payload is not a completion event (e.g. an
   * invite-opened ping) or carries no real score — the caller then ignores it
   * rather than persisting a fake. NEVER synthesizes a score.
   */
  parseWebhook(rawBody: string): NormalizedResult | null;
}

/** Registry keys — one per supported vendor. Matches the TenantIntegration kind. */
export type ProviderKey =
  | "hackerearth"
  | "codility"
  | "imocha"
  | "testgorilla"
  | "hackerrank";
