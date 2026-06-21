/**
 * SEEK adapter (job-service) - WF-G / SLICE G4 (AU / NZ).
 *
 * Structurally cloned from the sibling LinkedIn + Indeed board adapters
 * (postJob<->postPosition, OAuth2 client_credentials token cache, verifyWebhook
 * over RAW bytes, parseApplication<->Apply-with-SEEK ingest, real-data-or-null)
 * but speaking SEEK's REAL 2026 Ad Sync / Enhanced Job Posting GraphQL API. This
 * targets the NEW Job Posting schema (postPosition / PositionOpening +
 * PositionProfile), NOT the deprecated Classic "createJob" surface.
 *
 * == Real SEEK shapes ========================================================
 *  - Auth: OAuth2 client_credentials (SEEK partner token). The tenant's
 *    integration stores the partner's clientId + clientSecret; we exchange them at
 *      POST {oauthBase}/oauth/token
 *      body (application/x-www-form-urlencoded):
 *        grant_type=client_credentials, client_id, client_secret,
 *        scope="query:organizations query:ontologies mutate:applications mutate:position-postings",
 *        audience="https://graphql.seek.com"
 *    SEEK returns { access_token, token_type:"Bearer", expires_in }. We CACHE the
 *    bearer token in-process keyed by clientId until ~60s before expiry so a batch
 *    of postJob/closeJob calls share one token; a token is never persisted/logged.
 *  - Post: a single GraphQL endpoint POST {graphqlBase}/graphql with a plain JSON
 *    `{ query, variables }` body (no graphql client dep). The mutation
 *      postPosition(input: { positionOpening, positionProfile, postingInstructions })
 *    creates an Ad Sync posting. We send ONE position per call. The input carries:
 *      - positionOpening: the requisition envelope (hiringOrganization =
 *        creds.organizationId SEEK Hirer URN, postingRequester).
 *      - positionProfile: the ad body (PositionFormattedDescription[] for the
 *        JobAd / SearchSummary, PositionLocation, RemunerationPackage, employment
 *        types, applicationMethod -> our public applyUrl, or the SEEK Apply
 *        questionnaire when an apply webhook is wired).
 *      - postingInstructions: [{ seekAnzAdvertisementType, idempotencyId,
 *        seekAdvertisementProductId (from creds.contractId or job meta) }]. The ad
 *        product determines pricing/placement; we send the REAL product id the
 *        tenant configured and NEVER synthesize one.
 *    SEEK returns postPosition.positionProfile.profileId (a SEEK PositionProfile
 *    URN) + status; an Ad Sync ad that needs SEEK's moderation reports a PENDING /
 *    review state which maps to PENDING_PARTNER_APPROVAL, NEVER a fabricated ACTIVE.
 *  - Update: mutation updatePostedPositionProfile(input:{ positionProfile{ profileId, ... } }).
 *  - Close: mutation closePostedPositionProfile(input:{ positionProfile:{ profileId } }).
 *    Idempotent: an unknown / already-closed profile must not throw (a per-id error
 *    or 404 is swallowed).
 *  - Inbound (Apply with SEEK): SEEK Apply POSTs a CandidateApplicationCreated event
 *    to the configured webhook, signing the RAW body HMAC-SHA256 (base64) in the
 *    `seek-signature` / `x-seek-signature` header keyed by the tenant's webhook
 *    secret. verifyWebhook runs over the EXACT raw bytes (timing-safe). The resume /
 *    cover-letter arrive as short-lived signed download URLs (we set resume.mediaUrl
 *    so the ingest downloads them immediately); SEEK Apply also includes the
 *    candidate's screening-question answers, passed through verbatim.
 *
 * == HARD RULES ==============================================================
 *  - REAL data or honest null: externalId (profileId) / externalUrl / status come
 *    ONLY from a real postPosition / status response. A gated board (no creds, or a
 *    profile still in moderation) yields PENDING_PARTNER_APPROVAL, never a fake ACTIVE.
 *  - Creds are decrypted per-call and NEVER persisted or logged here.
 *  - verifyWebhook runs over the EXACT raw bytes SEEK signed (timing-safe).
 *  - Per-adapter rate limit: a best-effort process-local spacing guard (rateKey
 *    "seek", minIntervalMs 250 ~= 4 rps) + the shared http helper's 429 Retry-After
 *    backoff as the real backstop.
 *  - No auto-reject: parseApplication only normalizes an inbound application.
 *
 * Base hosts (overridable via creds.baseUrl):
 *   GraphQL  https://graphql.seek.com
 *   OAuth    https://auth.seek.com
 */
import { createHmac } from "node:crypto";
import type {
  HiringPlatformProvider,
  NormalizedApplication,
  NormalizedApplicant,
  NormalizedJob,
  NormalizedJobStatus,
  NormalizedResume,
  PlatformCredentials,
  ProviderCapabilities,
  ScreenerAnswer,
} from "./types.js";
import { fetchJson, header, num, dt, str, timingSafeEqualStr, PlatformHttpError } from "./http.js";

const PROVIDER = "seek" as const;

/** GraphQL host (Ad Sync / position postings + candidate applications live here). */
const DEFAULT_GRAPHQL_BASE = "https://graphql.seek.com";
/** OAuth host (partner token exchange; NOT on graphql.seek.com). */
const DEFAULT_OAUTH_BASE = "https://auth.seek.com";
/** GraphQL audience SEEK's partner token must be minted for. */
const TOKEN_AUDIENCE = "https://graphql.seek.com";
/** Partner-token scopes for posting + reading applications. */
const TOKEN_SCOPE =
  "query:organizations query:ontologies mutate:applications mutate:position-postings";

/** Best-effort per-second spacing so a single worker does not burst SEEK. */
const RATE_KEY = "seek";
const MIN_INTERVAL_MS = 250; // ~4 rps; the 429 Retry-After backoff is the backstop.
/** Refresh the cached token this many ms before its stated expiry. */
const TOKEN_SKEW_MS = 60_000;

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function graphqlBase(creds: PlatformCredentials): string {
  return (creds.baseUrl ?? DEFAULT_GRAPHQL_BASE).replace(/\/+$/, "");
}

/** OAuth host: the auth host unless a sandbox baseUrl was supplied. */
function oauthBase(creds: PlatformCredentials): string {
  return (creds.baseUrl ? creds.baseUrl : DEFAULT_OAUTH_BASE).replace(/\/+$/, "");
}

function rate(): { rateKey: string; minIntervalMs: number } {
  return { rateKey: RATE_KEY, minIntervalMs: MIN_INTERVAL_MS };
}

// ── OAuth2 client_credentials token cache ────────────────────────────────────
// SEEK partner tokens are short-lived. We cache the bearer token in-process keyed
// by clientId so a burst of posts shares one token instead of re-exchanging every
// call. The access token NEVER leaves this process and is NOT persisted; for a
// multi-instance deployment the upgrade is to back this map with Redis keyed by the
// same clientId (the read/refresh contract below stays identical).
interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}
const tokenCache = new Map<string, CachedToken>();

/**
 * Get a valid partner bearer token, exchanging creds via client_credentials when
 * the cache is empty/stale. Throws when creds are missing (the caller treats a
 * gated board as PENDING_PARTNER_APPROVAL upstream) or when SEEK rejects the
 * exchange.
 */
async function getAccessToken(creds: PlatformCredentials): Promise<string> {
  const clientId = str(creds.clientId);
  const clientSecret = str(creds.clientSecret);
  if (!clientId || !clientSecret) {
    throw new Error("[seek] missing clientId/clientSecret credential");
  }
  const now = Date.now();
  const cached = tokenCache.get(clientId);
  if (cached && cached.expiresAt - TOKEN_SKEW_MS > now) {
    return cached.accessToken;
  }

  // OAuth2 client_credentials grant (application/x-www-form-urlencoded).
  const url = `${oauthBase(creds)}/oauth/token`;
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: TOKEN_SCOPE,
    audience: TOKEN_AUDIENCE,
  }).toString();

  const resp = await fetchJson<AnyObj>(url, {
    method: "POST",
    provider: PROVIDER,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form,
    rateKey: `${RATE_KEY}:oauth`,
    minIntervalMs: MIN_INTERVAL_MS,
  });
  const root = obj(resp);
  const accessToken = str(root["access_token"]);
  if (!accessToken) {
    throw new Error("[seek] OAuth token response missing access_token");
  }
  // expires_in is seconds; default to 1h when SEEK omits it (conservative).
  const expiresInSec = num(root["expires_in"]) ?? 3600;
  tokenCache.set(clientId, { accessToken, expiresAt: now + expiresInSec * 1000 });
  return accessToken;
}

async function authHeaders(creds: PlatformCredentials): Promise<Record<string, string>> {
  const token = await getAccessToken(creds);
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ── GraphQL transport ────────────────────────────────────────────────────────
/**
 * POST one GraphQL operation as a plain JSON `{ query, variables }` body to the
 * single SEEK GraphQL endpoint and return the parsed `data` object. GraphQL
 * answers 200 even for field errors, so we surface a top-level `errors[]` as a
 * thrown error (the caller decides how to react). No undeclared graphql dep - this
 * is a plain fetch through the shared http helper.
 */
async function graphql(creds: PlatformCredentials, query: string, variables: AnyObj): Promise<AnyObj> {
  const url = `${graphqlBase(creds)}/graphql`;
  const resp = await fetchJson<AnyObj>(url, {
    method: "POST",
    provider: PROVIDER,
    headers: await authHeaders(creds),
    body: JSON.stringify({ query, variables }),
    ...rate(),
  });
  const root = obj(resp);
  const errors = Array.isArray(root["errors"]) ? (root["errors"] as unknown[]) : [];
  if (errors.length > 0) {
    const first = obj(errors[0]);
    const msg = str(first["message"]) ?? "GraphQL error";
    throw new Error(`[seek] GraphQL: ${msg}`);
  }
  return obj(root["data"]);
}

// ── SEEK Ad Sync GraphQL operations (2026 Enhanced Job Posting schema) ─────────
// postPosition creates a posting from a PositionOpening + PositionProfile +
// PostingInstructions; the result carries the SEEK PositionProfile id (profileId)
// the close + status reads round-trip on. NOT the deprecated Classic createJob.
const POST_POSITION_MUTATION = `
mutation PostPosition($input: PostPositionInput!) {
  postPosition(input: $input) {
    positionProfile {
      profileId
      positionUri
      status
    }
    errors { code message }
  }
}`.trim();

const UPDATE_POSITION_MUTATION = `
mutation UpdatePostedPositionProfile($input: UpdatePostedPositionProfileInput!) {
  updatePostedPositionProfile(input: $input) {
    positionProfile {
      profileId
      positionUri
      status
    }
    errors { code message }
  }
}`.trim();

const CLOSE_POSITION_MUTATION = `
mutation ClosePostedPositionProfile($input: ClosePostedPositionProfileInput!) {
  closePostedPositionProfile(input: $input) {
    positionProfile { profileId status }
    errors { code message }
  }
}`.trim();

const POSITION_STATUS_QUERY = `
query PositionProfile($id: String!) {
  positionProfile(id: $id) {
    profileId
    positionUri
    status
  }
}`.trim();

/** Map a SEEK Ad Sync position status string onto the normalized posting lifecycle.
 *  NEVER synthesizes ACTIVE: when SEEK gates a posting behind moderation / partner
 *  review it reports a PENDING/REVIEW state, which maps to PENDING_PARTNER_APPROVAL,
 *  not ACTIVE. An unrecognized status stays POSTING (accepted, not yet known-live). */
function mapPositionStatus(raw: unknown): NormalizedJobStatus {
  const s = String(raw ?? "").toUpperCase();
  if (s.includes("PENDING_PARTNER") || s.includes("PARTNER_APPROVAL") || s.includes("MODERAT") || s.includes("REVIEW")) {
    return "PENDING_PARTNER_APPROVAL";
  }
  if (s.includes("ACTIVE") || s.includes("LIVE") || s.includes("POSTED") || s.includes("OPEN") || s.includes("PUBLISHED")) {
    return "ACTIVE";
  }
  if (s.includes("EXPIRE")) return "EXPIRED";
  if (s.includes("CLOSE") || s.includes("DELETED") || s.includes("REMOVED") || s.includes("ENDED")) return "CLOSED";
  if (s.includes("REJECT") || s.includes("FAIL") || s.includes("ERROR")) return "FAILED";
  if (s.includes("PENDING")) return "PENDING";
  // Accepted by Ad Sync but no live confirmation yet.
  return "POSTING";
}

// ── JOB <-> PositionOpening + PositionProfile mapping ─────────────────────────

/** Map our employmentType tags to SEEK's WorkType enum (best-effort; omit when we
 *  cannot map honestly rather than defaulting). */
function mapWorkTypes(types: string[]): string[] {
  const out: string[] = [];
  for (const t of types) {
    const u = (t ?? "").toUpperCase();
    if (u.includes("FULL")) out.push("FullTime");
    else if (u.includes("PART")) out.push("PartTime");
    else if (u.includes("CONTRACT") || u.includes("TEMP")) out.push("ContractTemp");
    else if (u.includes("CASUAL") || u.includes("VACATION")) out.push("CasualVacation");
  }
  return [...new Set(out)];
}

/** Build the PositionLocation list. SEEK keys locations on its own location
 *  reference (a seekAnzLocation id supplied as creds/job meta); when we only have a
 *  free-form address we send the formattedAddress + countryCode so SEEK can
 *  resolve. We never fabricate a SEEK location id. */
function buildLocations(job: NormalizedJob): AnyObj[] {
  const loc = job.location;
  const formatted = [str(loc.city), str(loc.region), str(loc.postalCode), str(loc.country)]
    .filter((p): p is string => Boolean(p))
    .join(", ");
  const entry: AnyObj = {
    ...(str(loc.country) ? { countryCode: loc.country } : {}),
    ...(formatted ? { formattedAddress: formatted } : {}),
  };
  return Object.keys(entry).length ? [entry] : [];
}

/**
 * Build the PostingInstructions array. The ad product
 * (seekAdvertisementProductId) determines pricing/placement and MUST be the REAL
 * product id the tenant configured (creds.contractId) or one carried on the job
 * meta (job.seekAdvertisementProductId); we NEVER synthesize one. idempotencyId is
 * derived from our JobPosting id so a retried postJob does not double-charge.
 */
function buildPostingInstructions(job: NormalizedJob, creds: PlatformCredentials): AnyObj[] {
  const productId = str(creds.contractId) ?? str((job as unknown as AnyObj)["seekAdvertisementProductId"]);
  const instruction: AnyObj = {
    // ClassicAdvertisement vs Branded comes from the product; SEEK infers it from
    // the product id, so we send the type only when the job meta carried one.
    idempotencyId: job.id,
    ...(productId ? { seekAdvertisementProductId: productId } : {}),
    ...(str((job as unknown as AnyObj)["seekAnzAdvertisementType"])
      ? { seekAnzAdvertisementType: str((job as unknown as AnyObj)["seekAnzAdvertisementType"]) }
      : {}),
  };
  return [instruction];
}

/**
 * Build the SEEK ApplicationMethod. When the dispatcher wires a per-posting inbound
 * webhook URL (Apply with SEEK), applications come back through our webhook ingress
 * and SEEK collects the screening questionnaire; otherwise applicants are routed to
 * OUR public applyUrl (offsite apply). We never pre-grade questions.
 */
function buildApplicationMethod(job: NormalizedJob, webhookUrl?: string): AnyObj {
  if (webhookUrl) {
    const questions = (job.requirements ?? [])
      .map((q, i): AnyObj | null => {
        const text = str(q);
        if (!text) return null;
        return { value: `req-${i}`, text, responseTypeCode: "FreeText", required: false };
      })
      .filter((q): q is AnyObj => q !== null);
    return {
      // SEEK Apply: applications arrive via the webhook; we collect answers keyed by
      // OUR identifiers so the inbound event maps straight back with no SEEK guess.
      applicationUri: webhookUrl,
      ...(questions.length ? { questionnaire: { questions } } : {}),
    };
  }
  // Offsite: SEEK routes applicants to our public apply page.
  return { applicationUri: job.applyUrl };
}

/** Serialize the formatted-description sections SEEK requires (the JobAd body +
 *  the search-result summary). Only real content is sent. */
function buildFormattedDescriptions(job: NormalizedJob): AnyObj[] {
  const sections: AnyObj[] = [
    { descriptionId: "AdvertisementDetails", content: job.descriptionHtml },
  ];
  // SEEK shows a short search summary; derive it from the description's plain text
  // ONLY as a passthrough excerpt (no fabricated copy), capped at SEEK's limit.
  const summary = job.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);
  if (summary) sections.push({ descriptionId: "SearchBulletPoint", content: summary });
  return sections;
}

/**
 * Build the full postPosition input from the normalized job. externalId is NEVER
 * set here (profileId comes back from the response); this is the create body only.
 *   PostPositionInput {
 *     positionOpening { postingRequesterId },
 *     positionProfile { positionTitle, positionOrganizations, positionFormattedDescriptions,
 *                       positionLocation, jobCategories?, workTypeCodes, offeredRemunerationPackage?,
 *                       seekApplicationQuestionnaire?, applicationMethod },
 *     postingInstructions: [{ idempotencyId, seekAdvertisementProductId, seekAnzAdvertisementType? }]
 *   }
 */
function toPostPositionInput(job: NormalizedJob, creds: PlatformCredentials, webhookUrl?: string): AnyObj {
  const hirerId = str(creds.organizationId);
  const workTypeCodes = mapWorkTypes(job.employmentType);
  const locations = buildLocations(job);

  const positionProfile: AnyObj = {
    positionTitle: job.title,
    // SEEK Hirer URN: the tenant's employer account the ad is billed to.
    ...(hirerId ? { positionOrganizations: [hirerId] } : {}),
    positionFormattedDescriptions: buildFormattedDescriptions(job),
    ...(locations.length ? { positionLocation: locations } : {}),
    ...(workTypeCodes.length ? { workTypeCodes } : {}),
    ...(job.salary
      ? {
          offeredRemunerationPackage: {
            basisCode: mapRemunerationBasis(job.salary.period),
            ranges: [
              {
                currency: job.salary.currency,
                ...(job.salary.min !== undefined ? { minimumAmount: { value: job.salary.min, currency: job.salary.currency } } : {}),
                ...(job.salary.max !== undefined ? { maximumAmount: { value: job.salary.max, currency: job.salary.currency } } : {}),
                intervalCode: mapRemunerationInterval(job.salary.period),
              },
            ],
          },
        }
      : {}),
    applicationMethod: buildApplicationMethod(job, webhookUrl),
  };

  return {
    positionOpening: {
      // postingRequester = the SEEK Hirer the ad is posted on behalf of.
      ...(hirerId ? { postingRequesterId: hirerId } : {}),
    },
    positionProfile,
    postingInstructions: buildPostingInstructions(job, creds),
  };
}

/** Map a pay period onto SEEK's RemunerationBasis code. */
function mapRemunerationBasis(period: string): string {
  const p = (period ?? "").toLowerCase();
  if (p.includes("hour")) return "Hourly";
  if (p.includes("year") || p.includes("annu")) return "Salaried";
  return "Salaried";
}

/** Map a pay period onto SEEK's RemunerationInterval code. */
function mapRemunerationInterval(period: string): string {
  const p = (period ?? "").toLowerCase();
  if (p.includes("hour")) return "Hour";
  if (p.includes("day")) return "Day";
  if (p.includes("week")) return "Week";
  if (p.includes("month")) return "Month";
  return "Year";
}

/** Pull the real profileId + live URL + status out of a postPosition /
 *  updatePostedPositionProfile payload (or honest blanks when SEEK has not minted
 *  them - we never synthesize either). */
function readPositionResult(payload: AnyObj): { profileId?: string; url?: string; status: NormalizedJobStatus } {
  const positionProfile = obj(payload["positionProfile"]);
  const profileId = str(positionProfile["profileId"]) ?? str(positionProfile["id"]);
  const url = str(positionProfile["positionUri"]) ?? str(positionProfile["seekPositionUri"]);
  const status = mapPositionStatus(positionProfile["status"] ?? payload["status"]);
  return {
    ...(profileId ? { profileId } : {}),
    ...(url ? { url } : {}),
    status,
  };
}

const CAPS: ProviderCapabilities = {
  postApi: true,
  feed: false,
  jsonLd: false,
  applyWebhook: true,
  dispositionSync: false,
  searchCandidates: false,
};

export const seekProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps: CAPS,

  /**
   * Post one position via the Ad Sync postPosition mutation. Returns the REAL SEEK
   * profileId + live position URL only when SEEK actually returns them; a posting
   * still in moderation / partner review yields PENDING_PARTNER_APPROVAL (with the
   * profileId as the external handle when SEEK minted one, so the reaper can finish
   * the poll later). NEVER ACTIVE unless SEEK really said so.
   */
  async postJob(job, creds) {
    // No creds -> gated board. Surface PENDING_PARTNER_APPROVAL with no external id
    // (the caller persists the honest "awaiting board" state).
    if (!str(creds.clientId) || !str(creds.clientSecret)) {
      return { externalId: "", status: "PENDING_PARTNER_APPROVAL", raw: { reason: "no-credentials" } };
    }

    // Apply with SEEK wiring: when the dispatcher hands us a per-posting inbound
    // webhook URL (carried on the normalized job's apply path) wire SEEK Apply.
    const webhookUrl = str((job as unknown as AnyObj)["applyWebhookUrl"]);
    const input = toPostPositionInput(job, creds, webhookUrl);

    const data = await graphql(creds, POST_POSITION_MUTATION, { input });
    const posted = obj(data["postPosition"]);
    const errors = Array.isArray(posted["errors"]) ? (posted["errors"] as unknown[]) : [];
    const { profileId, url, status } = readPositionResult(posted);

    if (errors.length > 0 && !profileId) {
      const first = obj(errors[0]);
      const msg = str(first["message"]) ?? "postPosition rejected";
      throw new Error(`[seek] postPosition: ${msg}`);
    }

    // REAL data only: an ACTIVE without a real profileId is honestly downgraded to
    // partner-approval; a still-posting state stays partner-approval too.
    const finalStatus: NormalizedJobStatus =
      status === "ACTIVE" && !profileId ? "PENDING_PARTNER_APPROVAL" : status === "POSTING" && !profileId ? "PENDING_PARTNER_APPROVAL" : status;

    return {
      // profileId is the handle closeJob + the reaper round-trip on; never fabricated.
      externalId: profileId ?? "",
      ...(url ? { externalUrl: url } : {}),
      status: finalStatus,
      raw: { ...(profileId ? { profileId } : {}), postPosition: posted },
    };
  },

  /**
   * Close a posting via closePostedPositionProfile by its profileId. Idempotent: a
   * 404 (already gone / unknown) is swallowed, as is a per-id GraphQL error. A
   * missing-creds / missing-id close is a no-op (nothing was ever really posted).
   */
  async closeJob(externalId, creds) {
    if (!str(externalId)) return;
    if (!str(creds.clientId) || !str(creds.clientSecret)) return;
    const input: AnyObj = { positionProfile: { profileId: externalId } };
    try {
      await graphql(creds, CLOSE_POSITION_MUTATION, { input });
    } catch (err) {
      if (err instanceof PlatformHttpError && err.status === 404) return; // already gone
      // A top-level GraphQL error here is treated as "already gone / unknown" and
      // swallowed to keep close idempotent; a transport error still surfaces.
      if (err instanceof PlatformHttpError) throw err;
      return;
    }
  },

  /**
   * Read SEEK's current status for a posting (status reaper). Returns the mapped
   * status + verbatim payload; CLOSED when SEEK no longer tracks the profile.
   */
  async fetchJobStatus(externalId, creds) {
    let data: AnyObj;
    try {
      data = await graphql(creds, POSITION_STATUS_QUERY, { id: externalId });
    } catch (err) {
      if (err instanceof PlatformHttpError && err.status === 404) {
        return { status: "CLOSED", raw: { reason: "not-found" } };
      }
      throw err;
    }
    const positionProfile = obj(data["positionProfile"]);
    // An empty result -> the board no longer tracks it (CLOSED), never a fake ACTIVE.
    if (!str(positionProfile["profileId"]) && !str(positionProfile["status"])) {
      return { status: "CLOSED", raw: data };
    }
    return { status: mapPositionStatus(positionProfile["status"]), raw: data };
  },

  /**
   * Verify an inbound Apply-with-SEEK callback. SEEK signs the RAW body
   * HMAC-SHA256 (base64) in the `seek-signature` header keyed by the tenant's
   * webhook secret. Returns false when no secret is configured (an unverifiable
   * callback is rejected) or the signature mismatches; runs over the EXACT raw
   * bytes SEEK signed (the inbound router must not parse first).
   */
  verifyWebhook(headers, rawBody, secret) {
    if (!secret) return false;
    const sig = header(headers, "seek-signature") ?? header(headers, "x-seek-signature");
    if (!sig) return false;
    // SEEK signs base64; accept hex defensively too, both timing-safe.
    const expectedB64 = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
    const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const provided = sig.replace(/^sha256=/i, "").trim();
    return timingSafeEqualStr(expectedB64, provided) || timingSafeEqualStr(expectedHex, provided.toLowerCase());
  },

  /**
   * Parse a verified inbound SEEK Apply callback into a NormalizedApplication.
   * Returns null for a ping / non-application event or any payload missing a real
   * applicant (the router then ignores it). NEVER synthesizes a candidate or
   * applyId; the resume / cover letter ride in as short-lived signed mediaUrls so
   * the ingest downloads them immediately.
   */
  parseApplication(rawBody) {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      return null;
    }

    // SEEK delivers an event envelope; only CandidateApplicationCreated carries an
    // application. A ping / test / other event type is ignored honestly.
    const eventType = String(payload["type"] ?? payload["eventType"] ?? payload["typeCode"] ?? "");
    if (eventType && /ping|test|heartbeat|subscription/i.test(eventType)) return null;
    if (eventType && !/application/i.test(eventType)) return null;

    // The application body nests under data / candidateApplicationProfile / application.
    const data = obj(payload["data"] ?? payload);
    const app = obj(
      data["candidateApplicationProfile"] ??
        data["candidateProfile"] ??
        data["application"] ??
        payload["candidateApplicationProfile"] ??
        payload,
    );

    // The SEEK application id (the inbound dedupe/idempotency key), taken verbatim.
    const externalApplyId =
      str(app["profileId"]) ??
      str(app["applicationId"]) ??
      str(app["id"]) ??
      str(data["applicationId"]) ??
      str(payload["id"]);
    if (!externalApplyId) return null;

    // The SEEK posting (PositionProfile) id this application targets. Prefer the
    // partner-side id we stamped so the router resolves the owning posting with no
    // auth context; fall back to SEEK's own posting profile id.
    const positionRef = obj(app["positionProfile"] ?? app["position"] ?? data["positionProfile"]);
    const jobExternalId =
      str(app["seekPartnerJobReference"]) ??
      str(app["externalReferenceId"]) ??
      str(positionRef["profileId"]) ??
      str(positionRef["positionProfileId"]) ??
      str(app["positionProfileId"]) ??
      str(data["positionProfileId"]) ??
      "";
    if (!jobExternalId) return null;

    // ── Applicant identity (real fields only; no placeholders). ───────────────
    const candidateRaw = obj(app["candidate"] ?? app["person"] ?? app["jobseeker"]);
    const name = obj(candidateRaw["personName"] ?? candidateRaw["name"] ?? app["personName"]);
    const firstName = str(name["given"]) ?? str(name["firstName"]) ?? str(candidateRaw["firstName"]);
    const lastName = str(name["family"]) ?? str(name["lastName"]) ?? str(candidateRaw["lastName"]);
    const communication = obj(candidateRaw["communication"] ?? candidateRaw["contact"]);
    const emails = Array.isArray(communication["email"]) ? (communication["email"] as unknown[]) : [];
    const firstEmail = obj(emails[0]);
    const email =
      str(firstEmail["address"]) ?? str(communication["email"]) ?? str(candidateRaw["email"]) ?? str(app["email"]);
    // No real identity -> honest null (never a synthesized "Applicant").
    if (!firstName || !lastName || !email) return null;

    const phones = Array.isArray(communication["phone"]) ? (communication["phone"] as unknown[]) : [];
    const firstPhone = obj(phones[0]);
    const phone = str(firstPhone["formattedNumber"]) ?? str(firstPhone["number"]) ?? str(candidateRaw["phone"]);
    const addresses = Array.isArray(communication["address"]) ? (communication["address"] as unknown[]) : [];
    const firstAddress = obj(addresses[0]);
    const location =
      str(firstAddress["formattedAddress"]) ?? str(candidateRaw["location"]) ?? str(candidateRaw["address"]);

    const candidate: NormalizedApplicant = {
      firstName,
      lastName,
      email,
      ...(phone ? { phone } : {}),
      ...(location ? { location } : {}),
    };

    // ── Resume / cover letter: short-lived signed mediaUrls (download now). ────
    const resume = parseResume(app);
    const coverLetter = parseCoverLetter(app);

    // ── Screener Q&A (SEEK questionnaire answers, keyed by our identifiers). ───
    const answersRaw = Array.isArray(app["seekQuestionnaireSubmission"])
      ? (app["seekQuestionnaireSubmission"] as unknown[])
      : Array.isArray(obj(app["seekQuestionnaireSubmission"])["responses"])
        ? (obj(app["seekQuestionnaireSubmission"])["responses"] as unknown[])
        : Array.isArray(app["answers"])
          ? (app["answers"] as unknown[])
          : Array.isArray(app["questionnaireResponses"])
            ? (app["questionnaireResponses"] as unknown[])
            : [];
    const screenerAnswers: ScreenerAnswer[] = answersRaw
      .map((a): ScreenerAnswer | null => {
        const ao = obj(a);
        // The value we stamped (our req-N identifier) is preferred; fall back to text.
        const question =
          str(ao["value"]) ?? str(ao["questionIdentifier"]) ?? str(ao["question"]) ?? str(ao["questionText"]) ?? str(ao["text"]);
        const answerVal = ao["answer"] ?? ao["responses"] ?? ao["response"] ?? ao["choice"] ?? ao["value"];
        const answer = Array.isArray(answerVal)
          ? answerVal.map((x) => str(obj(x)["text"]) ?? str(x)).filter((x): x is string => Boolean(x)).join(", ")
          : str(answerVal);
        if (!question || answer === undefined) return null;
        return { question, answer };
      })
      .filter((a): a is ScreenerAnswer => a !== null);

    const appliedAt =
      dt(app["submittedDateTime"] ?? app["createdDateTime"] ?? app["appliedAt"] ?? data["submittedDateTime"]) ?? new Date();

    const out: NormalizedApplication = {
      provider: PROVIDER,
      jobExternalId,
      externalApplyId,
      appliedAt,
      candidate,
      ...(resume ? { resume } : {}),
      screenerAnswers,
      ...(coverLetter ? { coverLetter } : {}),
      raw: payload,
    };
    return out;
  },
};

/** Extract a resume from a SEEK CandidateApplicationCreated event. SEEK delivers it
 *  as a short-lived signed download URL; we set resume.mediaUrl so the ingest
 *  downloads it immediately (the URL expires). Returns undefined when none rode in. */
function parseResume(app: AnyObj): NormalizedResume | undefined {
  // Resume may be nested under attachments[] (typeCode "Resume"/"SelectedResume") or
  // a flat resume object, depending on the event version.
  const attachments = Array.isArray(app["attachments"]) ? (app["attachments"] as unknown[]) : [];
  const resumeAttachment = attachments
    .map(obj)
    .find((a) => /resume|cv/i.test(String(a["typeCode"] ?? a["type"] ?? a["seekRoleCode"] ?? "")));
  const res = obj(resumeAttachment ?? app["resume"] ?? app["resumeFile"]);
  const mediaUrl =
    str(res["url"]) ?? str(res["downloadUrl"]) ?? str(res["mediaUrl"]) ?? str(res["signedUrl"]) ?? str(app["resumeUrl"]);
  if (!mediaUrl) return undefined;
  const fileName = str(res["fileName"]) ?? str(res["name"]) ?? str(app["resumeFileName"]) ?? "resume.pdf";
  const contentType = str(res["contentType"]) ?? str(res["mimeType"]) ?? "application/pdf";
  return { fileName, contentType, mediaUrl };
}

/** Extract a cover letter from a SEEK event: either inline text or a signed URL we
 *  surface as a download (kept as text only when SEEK delivered text inline). */
function parseCoverLetter(app: AnyObj): string | undefined {
  const attachments = Array.isArray(app["attachments"]) ? (app["attachments"] as unknown[]) : [];
  const coverAttachment = attachments
    .map(obj)
    .find((a) => /cover/i.test(String(a["typeCode"] ?? a["type"] ?? a["seekRoleCode"] ?? "")));
  const inline = str(app["coverLetter"]) ?? str(app["coverLetterText"]) ?? str(obj(coverAttachment ?? {})["text"]);
  if (inline) return inline;
  // A cover letter delivered only as a signed URL is surfaced as that URL (the
  // ingest downloads it); we never fabricate body text.
  const url = str(obj(coverAttachment ?? {})["url"]) ?? str(obj(coverAttachment ?? {})["downloadUrl"]);
  return url ?? undefined;
}

/** Test-seam: clear the process-local OAuth token cache (used by adapter tests to
 *  force a fresh client_credentials exchange). Never called in normal flow. */
export function __clearSeekTokenCache(): void {
  tokenCache.clear();
}

export default seekProvider;
