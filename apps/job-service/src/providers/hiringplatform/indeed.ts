/**
 * Indeed adapter (job-service) - WF-F / WF-G (covers Indeed + Glassdoor + Stack
 * Overflow Jobs, which all ingest through Indeed's Job Sync platform).
 *
 * Real vendor shapes (Indeed Job Sync, GraphQL at https://apis.indeed.com/graphql):
 *  - Auth:   OAuth2 client_credentials. POST {oauthBase}/oauth/v2/tokens with
 *            grant_type=client_credentials, client_id=clientId,
 *            client_secret=clientSecret, scope="employer_access". Indeed returns
 *            { access_token, token_type:"Bearer", expires_in }. The token is
 *            CACHED in-process keyed by clientId until ~60s before expiry, so a
 *            batch of postJob/closeJob calls share one token (and a creds blip
 *            forces a real re-auth rather than reusing a stale token).
 *  - Post:   single GraphQL endpoint POST {base}/graphql with a JSON body
 *            { query, variables }. The mutation `jobsIngest` field
 *            `createSourcedJobPostings(input:{...})` ingests one or more sourced
 *            jobs and returns each result's { sourcedPostingId, employerJobId,
 *            jobStatus, errors }. We post ONE job per call (single-element
 *            sourcedJobs array). The board returns the real sourcedPostingId +
 *            employerJobId; both are persisted into externalRefs.raw so closeJob
 *            and the status reaper round-trip the real Indeed identifiers. We
 *            NEVER synthesize a sourcedPostingId / status.
 *  - Close:  mutation `jobsIngest.expireSourcedJobsBySourcedPostingId(input:{...})`
 *            by the real sourcedPostingId. Idempotent: an unknown / already-expired
 *            posting must not throw (Indeed answers with a per-id error we tolerate).
 *  - Webhook: Indeed POSTs inbound applications (Apply) to the configured disposition
 *            endpoint, signing the RAW body HMAC-SHA1 hex in the `X-Indeed-Signature`
 *            header keyed by the tenant's webhook secret. verifyWebhook runs over the
 *            EXACT raw bytes (timing-safe compare) so a forged callback is rejected.
 *  - Disposition: mutation `partnerDisposition.send(input:{...})` mirrors a HITL
 *            decision a human already made back to Indeed (status only, never an
 *            automated reject).
 *
 *  ── Inbound apply response codes (consumed by the WF-H inbound route) ─────────
 *  Indeed's Apply spec REQUIRES the webhook receiver to answer with EXACT HTTP
 *  codes so Indeed knows whether to retry or stop. The route MUST map onto these
 *  via {@link INDEED_INBOUND_CODES} / {@link classifyInbound}:
 *    200 OK                  - application accepted (verified + parsed + persisted).
 *    409 Conflict            - duplicate delivery of an already-ingested
 *                              externalApplyId (idempotent no-op; Indeed stops
 *                              retrying this one).
 *    410 Gone                - the target job posting no longer exists / is closed
 *                              (Indeed stops sending for it).
 *    400 Bad Request         - malformed / unparseable body (parseApplication null
 *                              for a structurally invalid payload).
 *    401 Unauthorized        - signature missing or HMAC mismatch (verifyWebhook
 *                              false); Indeed will not retry an unauthorized call.
 *    404 Not Found           - the posting id in the payload is unknown to the ATS.
 *    413 Payload Too Large   - body exceeded the inbound size cap.
 *    422 Unprocessable Entity- well-formed JSON but missing a REQUIRED applicant
 *                              field (email / name) so it cannot become a real
 *                              application (parseApplication null for a real-but-
 *                              incomplete payload; distinct from 400 malformed).
 *  The route returns 200 only after a successful verified+parsed+persisted apply;
 *  every other case maps to one of the codes above. NEVER auto-reject a candidate.
 *
 *  ── Rate limits ──────────────────────────────────────────────────────────────
 *  Indeed Job Sync tiers throughput by batch size: ~150 rps for large batches,
 *  ~30 rps for medium, ~1 rps for single-job ingests. Because this adapter posts
 *  ONE job per call (the conservative single-job tier), it spaces calls ≥1000ms
 *  apart (rateKey "indeed", minIntervalMs 1000) and relies on the shared
 *  Retry-After-honoring 429 backoff in http.ts as the real backstop. The token
 *  endpoint uses the same rate key so auth bursts are spaced too.
 *
 * Base host: https://apis.indeed.com (overridable via creds.baseUrl). Credentials
 * arrive decrypted per call and are NEVER persisted or logged.
 */
import { createHmac } from "node:crypto";
import type {
  HiringPlatformProvider,
  NormalizedApplication,
  NormalizedApplicant,
  NormalizedJob,
  NormalizedJobStatus,
  NormalizedResume,
  NormalizedStatus,
  PlatformCredentials,
  ProviderCapabilities,
  ScreenerAnswer,
} from "./types.js";
import { fetchJson, header, num, dt, str, timingSafeEqualStr, PlatformHttpError } from "./http.js";

const PROVIDER = "indeed" as const;
const DEFAULT_BASE = "https://apis.indeed.com";
// Indeed Job Sync OAuth token endpoint (employer access).
const OAUTH_PATH = "/oauth/v2/tokens";
const OAUTH_SCOPE = "employer_access";
// Single-job ingest tier: ~1 rps. Space process-local calls ≥1000ms apart; the
// shared Retry-After 429 backoff in http.ts is the real backstop.
const RATE_KEY = "indeed";
const MIN_INTERVAL_MS = 1000;
// Refresh the cached token this many ms before its stated expiry.
const TOKEN_SKEW_MS = 60_000;

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function base(creds: PlatformCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function rate(): { rateKey: string; minIntervalMs: number } {
  return { rateKey: RATE_KEY, minIntervalMs: MIN_INTERVAL_MS };
}

// ── OAuth2 client_credentials token cache ────────────────────────────────────
// In-process token cache keyed by clientId. A batch of post/close calls share one
// token; a token is re-fetched once it is within TOKEN_SKEW_MS of expiry. Tokens
// are held in memory only (never persisted/logged) and are scoped per client so
// two tenants on the same worker never share a token.
interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}
const tokenCache = new Map<string, CachedToken>();

async function getAccessToken(creds: PlatformCredentials): Promise<string> {
  const clientId = creds.clientId;
  const clientSecret = creds.clientSecret;
  if (!clientId || !clientSecret) {
    throw new Error("[indeed] missing clientId/clientSecret credential");
  }
  const now = Date.now();
  const cached = tokenCache.get(clientId);
  if (cached && cached.expiresAt - TOKEN_SKEW_MS > now) {
    return cached.accessToken;
  }

  // OAuth2 client_credentials grant (application/x-www-form-urlencoded).
  const url = `${base(creds)}${OAUTH_PATH}`;
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: OAUTH_SCOPE,
  });
  const resp = await fetchJson<AnyObj>(url, {
    method: "POST",
    provider: PROVIDER,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
    ...rate(),
  });
  const root = obj(resp);
  const accessToken = typeof root["access_token"] === "string" ? (root["access_token"] as string) : "";
  if (!accessToken) {
    throw new Error("[indeed] OAuth token response missing access_token");
  }
  // expires_in is seconds; default to 1h when Indeed omits it (conservative).
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
 * single Indeed GraphQL endpoint and return the parsed `data` object. GraphQL
 * answers 200 even for field errors, so we surface a top-level `errors[]` as a
 * thrown error (the caller decides how to react). No undeclared graphql dep - this
 * is a plain fetch through the shared http helper.
 */
async function graphql(
  creds: PlatformCredentials,
  query: string,
  variables: AnyObj,
): Promise<AnyObj> {
  const url = `${base(creds)}/graphql`;
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
    const msg = typeof first["message"] === "string" ? (first["message"] as string) : "GraphQL error";
    throw new Error(`[indeed] GraphQL: ${msg}`);
  }
  return obj(root["data"]);
}

const CREATE_SOURCED_JOBS_MUTATION = `
mutation CreateSourcedJobPostings($input: CreateSourcedJobPostingsInput!) {
  jobsIngest {
    createSourcedJobPostings(input: $input) {
      results {
        sourcedPostingId
        employerJobId
        jobStatus
        errors { field message }
      }
    }
  }
}`.trim();

const EXPIRE_SOURCED_JOBS_MUTATION = `
mutation ExpireSourcedJobs($input: ExpireSourcedJobsBySourcedPostingIdInput!) {
  jobsIngest {
    expireSourcedJobsBySourcedPostingId(input: $input) {
      results {
        sourcedPostingId
        jobStatus
        errors { field message }
      }
    }
  }
}`.trim();

const PARTNER_DISPOSITION_MUTATION = `
mutation SendPartnerDisposition($input: SendPartnerDispositionInput!) {
  partnerDisposition {
    send(input: $input) {
      accepted
      errors { field message }
    }
  }
}`.trim();

/** Map an Indeed `jobStatus` string onto the normalized posting lifecycle. NEVER
 *  synthesizes ACTIVE: when Indeed gates a posting behind partner approval it
 *  reports a PENDING/REVIEW state, which maps to PENDING_PARTNER_APPROVAL, not
 *  ACTIVE. An unrecognized status stays POSTING (accepted, not yet known-live). */
function mapJobStatus(raw: unknown): NormalizedJobStatus {
  const s = String(raw ?? "").toUpperCase();
  if (s.includes("ACTIVE") || s.includes("LIVE") || s.includes("PUBLISHED") || s.includes("OPEN")) return "ACTIVE";
  if (s.includes("PENDING_PARTNER") || s.includes("PARTNER_APPROVAL") || s.includes("REVIEW") || s.includes("PENDING_APPROVAL")) {
    return "PENDING_PARTNER_APPROVAL";
  }
  if (s.includes("EXPIRE")) return "EXPIRED";
  if (s.includes("CLOSE") || s.includes("DELETED") || s.includes("REMOVED")) return "CLOSED";
  if (s.includes("REJECT") || s.includes("FAIL") || s.includes("ERROR")) return "FAILED";
  if (s.includes("PENDING")) return "PENDING";
  // Accepted by the ingest but no live confirmation yet.
  return "POSTING";
}

/** Build the Indeed sourced-job input from the normalized job. Only real fields
 *  are sent; optional fields are omitted (never defaulted to a placeholder). */
function toSourcedJob(job: NormalizedJob): AnyObj {
  const loc = job.location;
  const sourcedJob: AnyObj = {
    // Our JobPosting id is the partner-side correlation handle Indeed echoes back.
    sourcedJobId: job.id,
    title: job.title,
    description: job.descriptionHtml,
    applyUrl: job.applyUrl,
    employmentTypes: job.employmentType,
    location: {
      remote: loc.remote,
      ...(loc.country ? { country: loc.country } : {}),
      ...(loc.city ? { city: loc.city } : {}),
      ...(loc.region ? { admin1: loc.region } : {}),
      ...(loc.postalCode ? { postalCode: loc.postalCode } : {}),
    },
    ...(job.salary
      ? {
          compensation: {
            currencyCode: job.salary.currency,
            period: job.salary.period,
            ...(job.salary.min !== undefined ? { min: job.salary.min } : {}),
            ...(job.salary.max !== undefined ? { max: job.salary.max } : {}),
          },
        }
      : {}),
    ...(job.department ? { department: job.department } : {}),
    ...(job.requirements.length ? { requirements: job.requirements } : {}),
    ...(job.benefits.length ? { benefits: job.benefits } : {}),
    ...(job.datePublished ? { datePosted: job.datePublished } : {}),
    ...(job.validThrough ? { expirationDate: job.validThrough } : {}),
    contact: {
      email: job.contactEmail,
      ...(job.contactPhone ? { phone: job.contactPhone } : {}),
    },
  };
  return sourcedJob;
}

/** Pull the single created-posting result out of the createSourcedJobPostings
 *  payload, tolerating a couple of shape variants. */
function firstIngestResult(data: AnyObj): AnyObj | null {
  const jobsIngest = obj(data["jobsIngest"]);
  const created = obj(jobsIngest["createSourcedJobPostings"]);
  const results = Array.isArray(created["results"]) ? (created["results"] as unknown[]) : [];
  if (results.length === 0) return null;
  return obj(results[0]);
}

export const indeedProvider: HiringPlatformProvider = {
  id: PROVIDER,

  // postApi (GraphQL Job Sync) + applyWebhook (inbound Apply) + dispositionSync
  // (partnerDisposition.send) + feed (Indeed also ingests an XML feed). No JSON-LD
  // and no entitled talent-search on this surface.
  caps: {
    postApi: true,
    feed: true,
    jsonLd: false,
    applyWebhook: true,
    dispositionSync: true,
    searchCandidates: false,
  } satisfies ProviderCapabilities,

  async postJob(job, creds) {
    const input: AnyObj = {
      // Indeed batches; we ingest one sourced job per call (single-job tier).
      sourcedJobs: [toSourcedJob(job)],
      ...(creds.organizationId ? { employerId: creds.organizationId } : {}),
      ...(creds.contractId ? { sourceId: creds.contractId } : {}),
    };
    const data = await graphql(creds, CREATE_SOURCED_JOBS_MUTATION, { input });
    const result = firstIngestResult(data);
    if (!result) {
      throw new Error("[indeed] createSourcedJobPostings returned no result");
    }
    const errors = Array.isArray(result["errors"]) ? (result["errors"] as unknown[]) : [];
    const sourcedPostingId = str(result["sourcedPostingId"]);
    if (errors.length > 0 || !sourcedPostingId) {
      const first = obj(errors[0]);
      const msg = typeof first["message"] === "string" ? (first["message"] as string) : "ingest rejected";
      throw new Error(`[indeed] createSourcedJobPostings: ${msg}`);
    }
    const employerJobId = str(result["employerJobId"]);
    // REAL data only: status comes straight from Indeed's reported jobStatus. A
    // partner-gated board reports a review state -> PENDING_PARTNER_APPROVAL here,
    // never a fabricated ACTIVE.
    const status = mapJobStatus(result["jobStatus"]);
    return {
      // The sourcedPostingId is the handle closeJob/the reaper round-trip on.
      externalId: sourcedPostingId,
      status,
      // Persist BOTH real Indeed identifiers in raw for downstream correlation.
      raw: { sourcedPostingId, ...(employerJobId ? { employerJobId } : {}), result },
    };
  },

  async closeJob(externalId, creds) {
    // Idempotent: Indeed answers an unknown / already-expired posting with a
    // per-id error rather than a transport failure; we swallow a 404 and tolerate
    // a per-result error so re-closing never throws.
    const input: AnyObj = {
      sourcedPostingIds: [externalId],
      ...(creds.organizationId ? { employerId: creds.organizationId } : {}),
    };
    try {
      await graphql(creds, EXPIRE_SOURCED_JOBS_MUTATION, { input });
    } catch (err) {
      if (err instanceof PlatformHttpError && err.status === 404) return;
      // A top-level GraphQL error here is treated as "already gone / unknown" and
      // swallowed to keep close idempotent; a transport error still surfaces.
      if (err instanceof PlatformHttpError) throw err;
      return;
    }
  },

  async fetchJobStatus(externalId, creds) {
    const QUERY = `
query SourcedJobStatus($input: SourcedJobPostingsByIdInput!) {
  jobsIngest {
    sourcedJobPostingsById(input: $input) {
      results { sourcedPostingId jobStatus }
    }
  }
}`.trim();
    const input: AnyObj = {
      sourcedPostingIds: [externalId],
      ...(creds.organizationId ? { employerId: creds.organizationId } : {}),
    };
    const data = await graphql(creds, QUERY, { input });
    const jobsIngest = obj(data["jobsIngest"]);
    const byId = obj(jobsIngest["sourcedJobPostingsById"]);
    const results = Array.isArray(byId["results"]) ? (byId["results"] as unknown[]) : [];
    const first = obj(results[0]);
    // REAL status only; an empty result is reported as CLOSED (the board no longer
    // tracks it), never a fabricated ACTIVE.
    const status = results.length === 0 ? "CLOSED" : mapJobStatus(first["jobStatus"]);
    return { status, raw: data };
  },

  toFeedEntry(job) {
    // Indeed XML feed `<job>` element (a pure function of the job, no creds/network).
    const cdata = (v: string) => `<![CDATA[${v}]]>`;
    const lines: string[] = ["<job>"];
    lines.push(`<referencenumber>${cdata(job.id)}</referencenumber>`);
    lines.push(`<title>${cdata(job.title)}</title>`);
    lines.push(`<description>${cdata(job.descriptionHtml)}</description>`);
    lines.push(`<url>${cdata(job.applyUrl)}</url>`);
    lines.push(`<email>${cdata(job.contactEmail)}</email>`);
    if (job.location.city) lines.push(`<city>${cdata(job.location.city)}</city>`);
    if (job.location.region) lines.push(`<state>${cdata(job.location.region)}</state>`);
    if (job.location.country) lines.push(`<country>${cdata(job.location.country)}</country>`);
    if (job.location.postalCode) lines.push(`<postalcode>${cdata(job.location.postalCode)}</postalcode>`);
    if (job.department) lines.push(`<category>${cdata(job.department)}</category>`);
    if (job.employmentType.length) lines.push(`<jobtype>${cdata(job.employmentType.join(", "))}</jobtype>`);
    if (job.salary) {
      const { min, max, currency, period } = job.salary;
      const range = [min, max].filter((n): n is number => n !== undefined).join(" - ");
      if (range) lines.push(`<salary>${cdata(`${range} ${currency}/${period}`)}</salary>`);
    }
    if (job.location.remote) lines.push(`<remotetype>${cdata("Fully remote")}</remotetype>`);
    if (job.datePublished) lines.push(`<date>${cdata(job.datePublished)}</date>`);
    lines.push("</job>");
    return lines.join("");
  },

  verifyWebhook(headers, rawBody, secret) {
    if (!secret) return false;
    // Indeed signs the RAW body HMAC-SHA1 (hex) in X-Indeed-Signature. Verify over
    // the EXACT bytes Indeed signed (the inbound router must not parse first).
    const sig = header(headers, "x-indeed-signature") ?? header(headers, "x-indeed-signature-256");
    if (!sig) return false;
    const expected = createHmac("sha1", secret).update(rawBody, "utf8").digest("hex");
    const provided = sig.replace(/^sha1=/i, "").trim().toLowerCase();
    return timingSafeEqualStr(expected.toLowerCase(), provided);
  },

  parseApplication(rawBody) {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      // Malformed / unparseable body -> the route answers 400 (see classifyInbound).
      return null;
    }
    // Ignore non-application events (ping / status ack) honestly rather than persist
    // a fake. Indeed's Apply payload nests the application under `application`/`data`.
    const application = obj(payload["application"] ?? payload["data"] ?? payload);
    const eventType = str(payload["eventType"] ?? payload["type"]);
    if (eventType && /ping|test|heartbeat/i.test(eventType)) return null;

    const jobExternalId = str(
      application["jobId"] ??
        application["sourcedPostingId"] ??
        application["employerJobId"] ??
        payload["jobId"],
    );
    const externalApplyId = str(
      application["id"] ?? application["applicationId"] ?? payload["id"] ?? payload["applicationId"],
    );
    // Without the two correlation keys this is not a real application we can route.
    if (!jobExternalId || !externalApplyId) return null;

    const applicantRaw = obj(application["applicant"] ?? application["candidate"]);
    const fullName = str(applicantRaw["fullName"] ?? applicantRaw["name"]);
    let firstName = str(applicantRaw["firstName"] ?? applicantRaw["givenName"]);
    let lastName = str(applicantRaw["lastName"] ?? applicantRaw["familyName"]);
    if ((!firstName || !lastName) && fullName) {
      const parts = fullName.split(/\s+/);
      firstName = firstName ?? parts[0];
      lastName = lastName ?? (parts.length > 1 ? parts.slice(1).join(" ") : "");
    }
    const email = str(applicantRaw["email"]);
    // A real-but-incomplete payload (no usable name/email) -> the route answers 422
    // (distinct from a 400 malformed body). NEVER fabricate an applicant.
    if (!email || !firstName) return null;

    const candidate: NormalizedApplicant = {
      firstName,
      lastName: lastName ?? "",
      email,
      ...(str(applicantRaw["phone"] ?? applicantRaw["phoneNumber"]) ? { phone: str(applicantRaw["phone"] ?? applicantRaw["phoneNumber"]) } : {}),
      ...(str(applicantRaw["location"] ?? applicantRaw["locationName"]) ? { location: str(applicantRaw["location"] ?? applicantRaw["locationName"]) } : {}),
    };

    // Resume: Indeed delivers EITHER an inline base64 blob OR a fetchable mediaUrl.
    const resumeRaw = obj(application["resume"] ?? applicantRaw["resume"]);
    const resumeFileName = str(resumeRaw["fileName"] ?? resumeRaw["name"]);
    const resumeBase64 = str(resumeRaw["data"] ?? resumeRaw["base64"] ?? resumeRaw["content"]);
    const resumeUrl = str(resumeRaw["url"] ?? resumeRaw["fileUrl"] ?? resumeRaw["mediaUrl"]);
    let resume: NormalizedResume | undefined;
    if (resumeBase64 || resumeUrl) {
      resume = {
        fileName: resumeFileName ?? "resume",
        contentType: str(resumeRaw["contentType"] ?? resumeRaw["mimeType"]) ?? "application/octet-stream",
        ...(resumeBase64 ? { base64: resumeBase64 } : {}),
        ...(!resumeBase64 && resumeUrl ? { mediaUrl: resumeUrl } : {}),
      };
    }

    // Screener Q&A passthrough (Indeed calls them `screenerQuestions`/`questions`).
    const screenerRaw = Array.isArray(application["screenerQuestions"])
      ? (application["screenerQuestions"] as unknown[])
      : Array.isArray(application["questions"])
        ? (application["questions"] as unknown[])
        : [];
    const screenerAnswers: ScreenerAnswer[] = screenerRaw
      .map((q): ScreenerAnswer | null => {
        const qo = obj(q);
        const question = str(qo["question"] ?? qo["text"] ?? qo["label"]);
        const answer = str(qo["answer"] ?? qo["response"] ?? qo["value"]);
        if (!question || answer === undefined) return null;
        return { question, answer };
      })
      .filter((q): q is ScreenerAnswer => q !== null);

    const appliedAt = dt(application["appliedDate"] ?? application["createdAt"] ?? payload["appliedDate"]) ?? new Date();
    const coverLetter = str(application["coverLetter"] ?? application["coverletter"]);

    const normalized: NormalizedApplication = {
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
    return normalized;
  },

  async syncDisposition(app, status, creds) {
    // Mirror a HITL decision a human already made back to Indeed. Status only -
    // this NEVER triggers an automated reject; REJECTED here only reports an
    // existing human outcome.
    const input: AnyObj = {
      applicationId: app.externalApplyId,
      ...(app.jobExternalId ? { sourcedPostingId: app.jobExternalId } : {}),
      ...(creds.organizationId ? { employerId: creds.organizationId } : {}),
      status: mapDisposition(status),
    };
    await graphql(creds, PARTNER_DISPOSITION_MUTATION, { input });
  },
};

/** Map the ATS normalized disposition onto Indeed's partnerDisposition status
 *  vocabulary. Pure status mirroring (no auto-reject semantics). */
function mapDisposition(status: NormalizedStatus): string {
  switch (status) {
    case "NEW":
      return "NEW";
    case "REVIEWED":
      return "REVIEWED";
    case "SHORTLISTED":
      return "ADVANCED";
    case "INTERVIEWING":
      return "INTERVIEWING";
    case "OFFER":
      return "OFFER_EXTENDED";
    case "HIRED":
      return "HIRED";
    case "REJECTED":
      return "NOT_SELECTED";
    case "WITHDRAWN":
      return "WITHDRAWN";
    default:
      return "REVIEWED";
  }
}

// ── Inbound apply response-code contract (consumed by the WF-H route) ─────────
/**
 * The EXACT HTTP status codes Indeed's Apply spec requires the inbound webhook
 * receiver to return, so Indeed knows whether to retry or stop. The WF-H route
 * imports this + {@link classifyInbound} and answers with the mapped code; it
 * NEVER invents a different code (a wrong code makes Indeed retry or silently drop
 * deliveries).
 */
export const INDEED_INBOUND_CODES = {
  /** Application accepted (verified + parsed + persisted). */
  OK: 200,
  /** Duplicate delivery of an already-ingested externalApplyId (idempotent no-op). */
  DUPLICATE: 409,
  /** Target posting no longer exists / is closed; Indeed stops sending for it. */
  GONE: 410,
  /** Malformed / unparseable body. */
  MALFORMED: 400,
  /** Signature missing or HMAC mismatch (verifyWebhook false). */
  UNAUTHORIZED: 401,
  /** The posting id in the payload is unknown to the ATS. */
  UNKNOWN_POSTING: 404,
  /** Body exceeded the inbound size cap. */
  TOO_LARGE: 413,
  /** Well-formed JSON but missing a REQUIRED applicant field (cannot become real). */
  UNPROCESSABLE: 422,
} as const;

/** The outcome the WF-H route resolves an inbound delivery into, before mapping to
 *  a status code via {@link INDEED_INBOUND_CODES}. */
export type IndeedInboundOutcome =
  | "OK"
  | "DUPLICATE"
  | "GONE"
  | "MALFORMED"
  | "UNAUTHORIZED"
  | "UNKNOWN_POSTING"
  | "TOO_LARGE"
  | "UNPROCESSABLE";

/** Resolve an inbound outcome to the EXACT Indeed HTTP status code. */
export function classifyInbound(outcome: IndeedInboundOutcome): number {
  return INDEED_INBOUND_CODES[outcome];
}

export default indeedProvider;
