/**
 * LinkedIn Talent Solutions adapter (job-service) - WF-G / SLICE G3.
 *
 * The FIRST concrete hiring-platform board adapter. Structurally cloned from the
 * assessment-service vendor adapters (postJob<->invite, verifyWebhook over RAW
 * bytes, parseApplication<->parseWebhook, real-data-or-null) but speaking
 * LinkedIn's REAL Job Posting + Apply Connect APIs.
 *
 * == Real LinkedIn shapes ===================================================
 *  - Auth: OAuth2 client_credentials on a per-customer CHILD application. The
 *    tenant's integration stores that child app's clientId + clientSecret; we
 *    exchange them at POST {oauthBase}/oauth/v2/accessToken for a bearer token
 *    and CACHE it ~30 min (keyed by clientId), refreshing before expiry. A token
 *    is never persisted; the cache is process-local (a Redis-backed cache is the
 *    multi-instance upgrade - see TOKEN CACHE note below).
 *  - Post: POST {restBase}/rest/simpleJobPostings as a BATCH create
 *      headers: Authorization: Bearer <token>
 *               LinkedIn-Version: <creds.linkedinVersion ?? DEFAULT_VERSION>
 *               X-RestLi-Protocol-Version: 2.0.0
 *               X-RestLi-Method: BATCH_CREATE
 *      body:    { elements: [ <one simpleJobPosting> ] }
 *    LinkedIn returns an ASYNC task per element; we then poll
 *      GET {restBase}/rest/simpleJobPostingTasks/{taskId}
 *    until the task reports a terminal state. A SUCCEEDED task carries the real
 *    job posting URN (the externalId) + the live listing URL. A task that needs
 *    LinkedIn's partner review reports PENDING / partner-approval, which we map to
 *    PENDING_PARTNER_APPROVAL (NEVER a synthesized ACTIVE).
 *  - Onsite Apply (Apply Connect): when an apply-webhook URL is supplied the
 *    posting carries an onsiteApplyConfiguration with jobApplicationWebhookUrl +
 *    the FormBuilder questions mapped to partnerQuestionIdentifier entries (so an
 *    inbound application's answers come back keyed by our own identifiers).
 *  - Inbound: LinkedIn first does a CHALLENGE handshake (a GET/POST carrying a
 *    challengeCode we echo back) then PUSHes EXPORT_JOB_APPLICATION events signed
 *    HMAC-SHA256 over the RAW body in the X-LI-Signature header. The resume
 *    arrives as a 30-day signed mediaUrl; we set resume.mediaUrl so the ingest
 *    downloads it to MinIO immediately (the URL expires).
 *
 * RSC / RSC+ (Recruiter System Connect) is explicitly OUT of scope here - this
 * adapter is job posting + Apply Connect inbound only.
 *
 * == HARD RULES ============================================================
 *  - REAL data or honest null: externalId / externalUrl / status come ONLY from a
 *    real task/posting response. A gated board (no creds, or a task still in
 *    partner review) yields PENDING_PARTNER_APPROVAL, never a fake ACTIVE.
 *  - Creds are decrypted per-call and NEVER persisted or logged here.
 *  - verifyWebhook runs over the EXACT raw bytes LinkedIn signed (timing-safe).
 *  - Per-adapter rate limit: a best-effort process-local spacing guard + the
 *    shared http helper's 429 Retry-After backoff.
 *  - No auto-reject: parseApplication only normalizes an inbound application.
 *
 * Base hosts (overridable via creds.baseUrl):
 *   REST  https://api.linkedin.com
 *   OAuth https://www.linkedin.com
 */
import { createHmac } from "node:crypto";
import type {
  ExternalJobRef,
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
import { fetchJson, header, num, dt, str, timingSafeEqualStr, sleep } from "./http.js";

const PROVIDER = "linkedin" as const;

/** LinkedIn versioned-API date pinned when the tenant did not configure one. */
const DEFAULT_VERSION = "202603";

/** REST host (job postings + tasks live here). */
const DEFAULT_REST_BASE = "https://api.linkedin.com";
/** OAuth host (token exchange lives here, NOT on api.linkedin.com). */
const DEFAULT_OAUTH_BASE = "https://www.linkedin.com";

/** Best-effort per-second spacing so a single worker does not burst LinkedIn. */
const RATE_KEY = "linkedin:rest";
const MIN_INTERVAL_MS = 250; // ~4 rps; the 429 Retry-After backoff is the backstop.

/** simpleJobPostingTasks polling budget: terminal-state wait without hanging a job. */
const TASK_POLL_ATTEMPTS = 8;
const TASK_POLL_INTERVAL_MS = 1500;

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function restBase(creds: PlatformCredentials): string {
  return (creds.baseUrl ?? DEFAULT_REST_BASE).replace(/\/+$/, "");
}

/** OAuth host: the www host unless a sandbox baseUrl was supplied. */
function oauthBase(creds: PlatformCredentials): string {
  return (creds.baseUrl ? creds.baseUrl : DEFAULT_OAUTH_BASE).replace(/\/+$/, "");
}

function version(creds: PlatformCredentials): string {
  return str(creds.linkedinVersion) ?? DEFAULT_VERSION;
}

// ── TOKEN CACHE ─────────────────────────────────────────────────────────────
// OAuth2 client_credentials tokens are ~30-min lived. We cache the bearer token
// per CHILD-app clientId (each tenant integration is its own child app) so a
// burst of posts shares one token instead of re-exchanging every call. The
// access token NEVER leaves this process and is NOT persisted (a creds-store
// blip must not surface a stale token). For a multi-instance deployment the
// upgrade is to back this map with Redis (SET token EX <expiry-skew>) keyed by
// the same clientId; the read/refresh contract below stays identical.
interface CachedToken {
  token: string;
  /** Epoch ms after which the token must be refreshed (already skew-adjusted). */
  expiresAt: number;
}
const tokenCache = new Map<string, CachedToken>();
/** Refresh this many ms BEFORE the real expiry so an in-flight call never 401s. */
const TOKEN_EXPIRY_SKEW_MS = 60_000;

/**
 * Get a valid bearer token for the tenant's child app, exchanging creds via
 * client_credentials when the cache is empty/stale. Throws when creds are missing
 * (the caller treats a gated board as PENDING_PARTNER_APPROVAL upstream) or when
 * LinkedIn rejects the exchange.
 */
async function getAccessToken(creds: PlatformCredentials): Promise<string> {
  const clientId = str(creds.clientId);
  const clientSecret = str(creds.clientSecret);
  if (!clientId || !clientSecret) {
    throw new Error("[linkedin] missing clientId/clientSecret credential");
  }

  const cached = tokenCache.get(clientId);
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const url = `${oauthBase(creds)}/oauth/v2/accessToken`;
  // LinkedIn expects application/x-www-form-urlencoded on the token endpoint.
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
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
  const token = str(root["access_token"]);
  if (!token) throw new Error("[linkedin] token exchange returned no access_token");

  // expires_in is seconds; cache slightly short so an in-flight call never 401s.
  const expiresInSec = num(root["expires_in"]) ?? 1800; // LinkedIn default ~30 min
  tokenCache.set(clientId, {
    token,
    expiresAt: Date.now() + Math.max(0, expiresInSec * 1000 - TOKEN_EXPIRY_SKEW_MS),
  });
  return token;
}

function restHeaders(token: string, creds: PlatformCredentials, extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "LinkedIn-Version": version(creds),
    "X-RestLi-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
    Accept: "application/json",
    ...extra,
  };
}

// ── JOB <-> simpleJobPosting mapping ──────────────────────────────────────────

/** Map our employmentType tags to LinkedIn's employmentStatus enum (best-effort,
 *  omit when we cannot map honestly rather than defaulting). */
function mapEmploymentStatus(types: string[]): string | undefined {
  const t = (types[0] ?? "").toUpperCase();
  if (t.includes("FULL")) return "FULL_TIME";
  if (t.includes("PART")) return "PART_TIME";
  if (t.includes("CONTRACT")) return "CONTRACT";
  if (t.includes("TEMP")) return "TEMPORARY";
  if (t.includes("INTERN")) return "INTERNSHIP";
  if (t.includes("VOLUNTEER")) return "VOLUNTEER";
  return undefined;
}

/**
 * Build the onsiteApplyConfiguration that wires Apply Connect: the inbound
 * webhook URL plus the FormBuilder questions mapped to partnerQuestionIdentifier
 * entries, so an EXPORT_JOB_APPLICATION event returns answers keyed by OUR
 * field ids (the dedupe/correlation we own). Only attached when an apply webhook
 * URL is supplied (otherwise LinkedIn routes applicants to the applyUrl).
 */
function buildOnsiteApply(job: NormalizedJob, webhookUrl: string): AnyObj {
  // Each requirement line doubles as a screening question identifier; FormBuilder
  // questions ride in on the same shape downstream. partnerQuestionIdentifier is
  // OUR id so the inbound answer maps straight back with no LinkedIn-side guess.
  const questions = (job.requirements ?? [])
    .map((q, i): AnyObj | null => {
      const text = str(q);
      if (!text) return null;
      return {
        partnerQuestionIdentifier: `req-${i}`,
        questionText: text,
        // We never pre-grade; LinkedIn collects the answer, the ATS screens it.
        required: false,
      };
    })
    .filter((q): q is AnyObj => q !== null);

  return {
    jobApplicationWebhookUrl: webhookUrl,
    ...(questions.length ? { questions } : {}),
  };
}

/**
 * Serialize a NormalizedJob into a single simpleJobPosting element. externalId
 * is NEVER set here (it comes back from the task); this is the create body only.
 */
function toSimpleJobPosting(job: NormalizedJob, creds: PlatformCredentials, webhookUrl?: string): AnyObj {
  const companyUrn = str(creds.organizationId);
  const employmentStatus = mapEmploymentStatus(job.employmentType);

  const location: AnyObj = {};
  const country = str(job.location.country);
  const city = str(job.location.city);
  const postal = str(job.location.postalCode);
  if (country) location["countryCode"] = country;
  if (city) location["city"] = city;
  if (postal) location["postalCode"] = postal;

  const element: AnyObj = {
    // Our JobPosting id as the partner-side external reference LinkedIn echoes on
    // the inbound application, so we can resolve the owning posting + tenant.
    externalJobPostingId: job.id,
    title: job.title,
    description: job.descriptionHtml,
    listedAt: dt(job.datePublished)?.getTime() ?? Date.now(),
    // Applicants land on OUR public apply page (or Apply Connect when wired below).
    applyMethod: webhookUrl
      ? { "com.linkedin.simplejobposting.OnsiteApplyConfiguration": buildOnsiteApply(job, webhookUrl) }
      : { "com.linkedin.simplejobposting.OffsiteApplyConfiguration": { companyApplyUrl: job.applyUrl } },
    ...(companyUrn ? { companyApplyUrl: job.applyUrl, integrationContext: companyUrn } : {}),
    ...(str(creds.contractId) ? { contract: creds.contractId } : {}),
    ...(employmentStatus ? { employmentStatus } : {}),
    ...(job.location.remote ? { workplaceTypes: ["remote"] } : {}),
    ...(Object.keys(location).length ? { location } : {}),
    ...(job.validThrough && dt(job.validThrough) ? { expireAt: dt(job.validThrough)!.getTime() } : {}),
  };
  return element;
}

/** Map a LinkedIn task / posting state onto our NormalizedJobStatus. Anything that
 *  is not an unambiguous live/closed/failed signal stays PENDING_PARTNER_APPROVAL
 *  (honest: not yet really live), NEVER fabricated ACTIVE. */
function mapTaskStatus(raw: unknown): NormalizedJobStatus {
  const s = String(raw ?? "").toUpperCase();
  if (s.includes("FAIL") || s.includes("REJECT") || s.includes("ERROR")) return "FAILED";
  if (s.includes("SUCCEED") || s.includes("SUCCESS") || s.includes("LISTED") || s.includes("LIVE")) return "ACTIVE";
  if (s.includes("CLOSED")) return "CLOSED";
  if (s.includes("EXPIRE")) return "EXPIRED";
  // PENDING / IN_PROGRESS / PROCESSING / partner-review -> not yet really live.
  return "PENDING_PARTNER_APPROVAL";
}

/** Pull the real posting URN + live URL out of a SUCCEEDED task payload (or null
 *  when LinkedIn has not yet minted them - we never synthesize either). */
function readTaskResult(task: AnyObj): { externalId?: string; url?: string } {
  const result = obj(task["result"] ?? task["jobPosting"] ?? task);
  const externalId =
    str(result["jobPosting"]) ?? str(result["entity"]) ?? str(result["id"]) ?? str(task["jobPostingUrn"]);
  const url = str(result["jobPostingUrl"]) ?? str(result["listingUrl"]) ?? str(task["jobPostingUrl"]);
  return {
    ...(externalId ? { externalId } : {}),
    ...(url ? { url } : {}),
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

export const linkedinProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps: CAPS,

  /**
   * Post one job via the batch simpleJobPostings create, then poll the async
   * task to a terminal state. Returns the REAL posting URN + live URL only when
   * the task actually succeeds; an in-flight / partner-review task yields
   * PENDING_PARTNER_APPROVAL with whatever taskId LinkedIn gave us as the
   * external handle (so the reaper can finish the poll later). NEVER ACTIVE
   * unless LinkedIn really said so.
   */
  async postJob(job, creds) {
    // No creds -> gated board. We surface PENDING_PARTNER_APPROVAL with no
    // external id (the caller persists the honest "awaiting board" state).
    if (!str(creds.clientId) || !str(creds.clientSecret)) {
      return { externalId: "", status: "PENDING_PARTNER_APPROVAL", raw: { reason: "no-credentials" } };
    }

    const token = await getAccessToken(creds);
    // Apply Connect wiring: when the dispatcher hands us a per-posting inbound
    // webhook URL (carried on the normalized job's apply path) wire onsite apply.
    const webhookUrl = str((job as unknown as AnyObj)["applyWebhookUrl"]);

    const url = `${restBase(creds)}/rest/simpleJobPostings`;
    const body = JSON.stringify({ elements: [toSimpleJobPosting(job, creds, webhookUrl)] });

    const resp = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: restHeaders(token, creds, { "X-RestLi-Method": "BATCH_CREATE" }),
      body,
      rateKey: RATE_KEY,
      minIntervalMs: MIN_INTERVAL_MS,
    });
    const root = obj(resp);

    // BATCH_CREATE returns a per-element result map; the element carries the
    // async task id we then poll. Read the first (we batch one job per call).
    const results = obj(root["results"] ?? root["elements"]);
    const firstResult = obj(Object.values(results)[0] ?? (Array.isArray(root["elements"]) ? (root["elements"] as unknown[])[0] : undefined));
    const taskId =
      str(firstResult["id"]) ??
      str(firstResult["jobPostingTask"]) ??
      str(firstResult["task"]) ??
      str(root["id"]);

    if (!taskId) {
      // No task id back -> LinkedIn accepted nothing concrete. Honest pending.
      return {
        externalId: "",
        status: "PENDING_PARTNER_APPROVAL",
        raw: resp ?? { reason: "no-task-id" },
      };
    }

    // ── Poll the task to a terminal state (bounded). ──────────────────────────
    let lastTask: AnyObj = firstResult;
    let status: NormalizedJobStatus = "POSTING";
    for (let attempt = 0; attempt < TASK_POLL_ATTEMPTS; attempt++) {
      const taskUrl = `${restBase(creds)}/rest/simpleJobPostingTasks/${encodeURIComponent(taskId)}`;
      const taskResp = await fetchJson<AnyObj>(taskUrl, {
        provider: PROVIDER,
        headers: restHeaders(token, creds),
        rateKey: RATE_KEY,
        minIntervalMs: MIN_INTERVAL_MS,
      });
      lastTask = obj(taskResp);
      status = mapTaskStatus(lastTask["status"] ?? lastTask["state"]);
      // Terminal -> stop polling.
      if (status === "ACTIVE" || status === "FAILED" || status === "CLOSED" || status === "EXPIRED") break;
      // Not yet terminal -> wait then re-poll.
      if (attempt < TASK_POLL_ATTEMPTS - 1) await sleep(TASK_POLL_INTERVAL_MS);
    }

    // Real id/url ONLY from a succeeded task; a still-pending task stays partner-approval.
    const { externalId, url: liveUrl } = status === "ACTIVE" ? readTaskResult(lastTask) : {};
    const finalStatus: NormalizedJobStatus =
      status === "ACTIVE" && !externalId ? "PENDING_PARTNER_APPROVAL" : status === "POSTING" ? "PENDING_PARTNER_APPROVAL" : status;

    return {
      // The task id is a real handle even before the URN exists, so the reaper can
      // finish the poll; we never fabricate a posting URN.
      externalId: externalId ?? taskId,
      ...(liveUrl ? { externalUrl: liveUrl } : {}),
      status: finalStatus,
      raw: { create: resp, task: lastTask },
    };
  },

  /**
   * Close a posting. LinkedIn closes a job via a partial update setting the
   * listing status to CLOSED. Idempotent: a 404 (already gone / unknown) is
   * swallowed. A missing-creds close is a no-op (nothing was ever really posted).
   */
  async closeJob(externalId, creds) {
    if (!str(externalId)) return;
    if (!str(creds.clientId) || !str(creds.clientSecret)) return;
    let token: string;
    try {
      token = await getAccessToken(creds);
    } catch {
      return; // cannot authenticate -> nothing to close
    }
    const url = `${restBase(creds)}/rest/simpleJobPostings/${encodeURIComponent(externalId)}`;
    try {
      await fetchJson<AnyObj>(url, {
        method: "POST",
        provider: PROVIDER,
        headers: restHeaders(token, creds, { "X-RestLi-Method": "PARTIAL_UPDATE" }),
        body: JSON.stringify({ patch: { $set: { listingStatus: "CLOSED" } } }),
        rateKey: RATE_KEY,
        minIntervalMs: MIN_INTERVAL_MS,
        // A close that 404s (already gone) must not throw; cap retries low.
        maxRetries: 1,
      });
    } catch (err) {
      if (isNotFound(err)) return; // idempotent: unknown/closed posting
      throw err;
    }
  },

  /**
   * Read the board's current status for a posting (status reaper). Returns the
   * mapped status + verbatim payload; null when LinkedIn has no such posting.
   */
  async fetchJobStatus(externalId, creds) {
    const token = await getAccessToken(creds);
    const url = `${restBase(creds)}/rest/simpleJobPostings/${encodeURIComponent(externalId)}`;
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(url, {
        provider: PROVIDER,
        headers: restHeaders(token, creds),
        rateKey: RATE_KEY,
        minIntervalMs: MIN_INTERVAL_MS,
      });
    } catch (err) {
      if (isNotFound(err)) return { status: "CLOSED", raw: { reason: "not-found" } };
      throw err;
    }
    const posting = obj(resp);
    return { status: mapTaskStatus(posting["listingStatus"] ?? posting["status"] ?? posting["state"]), raw: posting };
  },

  /**
   * Verify an inbound Apply Connect callback. Two shapes:
   *  1. Challenge handshake: LinkedIn sends a challengeCode we must echo; the
   *     payload carries no push data. We treat a well-formed challenge as
   *     verified ONLY when a secret is configured (the router then echoes the
   *     challengeCode in its 200 response - parseApplication returns null for it).
   *  2. Push (EXPORT_JOB_APPLICATION): HMAC-SHA256 of the RAW body keyed by the
   *     tenant's webhook secret, compared timing-safe against X-LI-Signature.
   * Returns false when no secret is configured (an unverifiable callback is
   * rejected) or the signature mismatches.
   */
  verifyWebhook(headers, rawBody, secret) {
    if (!secret) return false;

    // Challenge handshake: a body with a challengeCode and no signature header is
    // LinkedIn validating the endpoint. Accept it (secret present) so the router
    // can echo the code; there is nothing to HMAC-verify yet.
    const sig = header(headers, "x-li-signature") ?? header(headers, "x-linkedin-signature");
    if (!sig) {
      let parsed: AnyObj;
      try {
        parsed = obj(JSON.parse(rawBody));
      } catch {
        return false;
      }
      return Boolean(str(parsed["challengeCode"]) ?? str(parsed["challenge"]));
    }

    // Push: HMAC-SHA256 over the EXACT raw bytes LinkedIn signed.
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
    const expectedHex = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const provided = sig.replace(/^sha256=/i, "").trim();
    // LinkedIn signs base64; accept either base64 or hex defensively, both timing-safe.
    return timingSafeEqualStr(expected, provided) || timingSafeEqualStr(expectedHex, provided);
  },

  /**
   * Parse a verified inbound callback into a NormalizedApplication. Returns null
   * for a challenge handshake or any non-application event (the router ignores
   * it, having already echoed any challengeCode). NEVER synthesizes a candidate
   * or applyId; the resume rides in as a 30-day signed mediaUrl so the ingest
   * downloads it to MinIO immediately.
   */
  parseApplication(rawBody) {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      return null;
    }

    // Challenge handshake carries no application -> not an application event.
    if (str(payload["challengeCode"]) ?? str(payload["challenge"])) return null;

    // LinkedIn wraps the event; only EXPORT_JOB_APPLICATION carries an application.
    const eventType = String(payload["eventType"] ?? payload["type"] ?? "").toUpperCase();
    if (eventType && !eventType.includes("JOB_APPLICATION")) return null;

    const app = obj(
      payload["jobApplication"] ?? payload["application"] ?? payload["data"] ?? payload["value"] ?? payload,
    );

    // jobApplicationId is taken VERBATIM (the inbound dedupe/idempotency key).
    const externalApplyId = str(app["jobApplicationId"]) ?? str(app["id"]) ?? str(payload["jobApplicationId"]);
    if (!externalApplyId) return null;

    // The board posting id this application targets. Prefer the partner-side id we
    // stamped (externalJobPostingId) so the router resolves the owning posting with
    // no auth context; fall back to LinkedIn's own posting urn.
    const jobExternalId =
      str(app["externalJobPostingId"]) ??
      str(app["jobPosting"]) ??
      str(app["jobPostingId"]) ??
      str(payload["jobPosting"]) ??
      "";
    if (!jobExternalId) return null;

    // ── Applicant identity (real fields only; no placeholders). ───────────────
    const applicant = obj(app["applicant"] ?? app["candidate"] ?? app["contact"]);
    const firstName = str(applicant["firstName"]) ?? str(app["firstName"]);
    const lastName = str(applicant["lastName"]) ?? str(app["lastName"]);
    const email = str(applicant["emailAddress"]) ?? str(applicant["email"]) ?? str(app["email"]);
    // No real identity -> honest null (never a synthesized "Applicant").
    if (!firstName || !lastName || !email) return null;

    const candidate: NormalizedApplicant = {
      firstName,
      lastName,
      email,
      ...(str(applicant["phoneNumber"]) ?? str(applicant["phone"])
        ? { phone: str(applicant["phoneNumber"]) ?? str(applicant["phone"]) }
        : {}),
      ...(str(applicant["location"]) ? { location: str(applicant["location"]) } : {}),
    };

    // ── Resume: a 30-day signed mediaUrl (download immediately). ──────────────
    const resume = parseResume(app);

    // ── Screener answers (FormBuilder questions keyed by partnerQuestionIdentifier). ─
    const answersRaw = Array.isArray(app["answers"])
      ? (app["answers"] as unknown[])
      : Array.isArray(app["questionAnswers"])
        ? (app["questionAnswers"] as unknown[])
        : Array.isArray(app["screeningQuestionAnswers"])
          ? (app["screeningQuestionAnswers"] as unknown[])
          : [];
    const screenerAnswers: ScreenerAnswer[] = answersRaw
      .map((a): ScreenerAnswer | null => {
        const ao = obj(a);
        // partnerQuestionIdentifier is OUR id; fall back to the LinkedIn question text.
        const question =
          str(ao["partnerQuestionIdentifier"]) ?? str(ao["question"]) ?? str(ao["questionText"]) ?? str(ao["identifier"]);
        const answerVal = ao["answer"] ?? ao["value"] ?? ao["response"] ?? ao["answers"];
        const answer = Array.isArray(answerVal)
          ? answerVal.map((x) => str(x)).filter((x): x is string => Boolean(x)).join(", ")
          : str(answerVal);
        if (!question || answer === undefined) return null;
        return { question, answer };
      })
      .filter((a): a is ScreenerAnswer => a !== null);

    const appliedAt = dt(app["appliedAt"] ?? app["createdAt"] ?? app["submittedAt"] ?? payload["appliedAt"]) ?? new Date();
    const coverLetter = str(app["coverLetter"]) ?? str(app["coverLetterText"]);

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

/** Extract a resume from an EXPORT_JOB_APPLICATION. LinkedIn delivers it as a
 *  30-day signed mediaUrl; we set resume.mediaUrl so the ingest downloads it to
 *  MinIO immediately (the URL expires). Returns undefined when no resume rode in. */
function parseResume(app: AnyObj): NormalizedResume | undefined {
  // Resume may be a nested object or a flat set of fields depending on version.
  const res = obj(app["resume"] ?? app["resumeFile"] ?? app["attachment"]);
  const mediaUrl =
    str(res["mediaUrl"]) ??
    str(res["downloadUrl"]) ??
    str(res["url"]) ??
    str(res["signedUrl"]) ??
    str(app["resumeUrl"]) ??
    str(app["resumeMediaUrl"]);
  if (!mediaUrl) return undefined;
  const fileName = str(res["fileName"]) ?? str(res["name"]) ?? str(app["resumeFileName"]) ?? "resume.pdf";
  const contentType = str(res["contentType"]) ?? str(res["mimeType"]) ?? "application/pdf";
  return { fileName, contentType, mediaUrl };
}

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

/** Test-seam: clear the process-local OAuth token cache (used by adapter tests
 *  to force a fresh client_credentials exchange). Never called in normal flow. */
export function __clearLinkedInTokenCache(): void {
  tokenCache.clear();
}

export type { ExternalJobRef };
export default linkedinProvider;
