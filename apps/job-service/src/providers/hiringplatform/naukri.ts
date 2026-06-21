/**
 * Naukri adapter (job-service hiring-platform axis) - WF-G / SLICE G5.
 *
 * Naukri (InfoEdge India) has NO open employer job-posting API. The real, paid
 * integration path is InfoEdge's "Zwayam Amplify" multiposting bridge: an ATS
 * registered as an Amplify partner pushes job lifecycle events to Amplify and
 * Amplify mirrors them onto the tenant's Naukri RMS account, then Amplify PUSHES
 * inbound candidate applications (an Amplify "candidate-pull", NOT a Resdex
 * resume-database scrape) back to the ATS via a stage-update callback.
 *
 * == Real Amplify shapes (host https://api.zwayam.com) ========================
 *  - Auth:   a SHARED-SECRET pair on EVERY outbound call -
 *              * the tenant's `apiKey` rides as the `apiKey` QUERY parameter, and
 *              * the tenant's secret rides in the `Secret Key` HTTP header
 *                (Amplify's literal header name; it is a static shared secret, NOT
 *                an HMAC of the body).
 *            Both are decrypted per call and NEVER persisted or logged. The secret
 *            maps from creds.apiToken (the token-board field; falls back to
 *            webhookSecret/clientSecret when a tenant stored it under that key).
 *  - Post:   Naukri/Amplify models the job lifecycle as four outbound webhooks the
 *            ATS calls on Amplify (the `<ats>` path segment is the partner slug):
 *              create -> POST   {base}/amplify/webhook/{ats}/jobs/create
 *              modify -> POST   {base}/amplify/webhook/{ats}/jobs/modify
 *              delete -> POST   {base}/amplify/webhook/{ats}/jobs/delete
 *            postJob() calls .../jobs/create with the normalized job mapped to
 *            Amplify's job body and the ATS JobPosting id as `referenceId` (the
 *            correlation handle Amplify echoes back). Amplify returns its own job
 *            id, which we read VERBATIM as externalId - NEVER synthesized.
 *  - Close:  closeJob() calls .../jobs/delete by the Amplify job id. Idempotent: a
 *            404 on an already-deleted / unknown job is swallowed, never thrown.
 *  - Inbound apply: Amplify PUSHes a candidate application as an `/apply/stage_update`
 *            event to the ATS ingress (an Amplify candidate-pull, NOT Resdex).
 *            parseApplication normalizes that payload; a ping / non-application
 *            stage event yields null (never a fabricated candidate).
 *
 *  ── HARD GATE: paid Naukri subscription + paid integration module ────────────
 *  Amplify access requires BOTH a paid Naukri (InfoEdge) subscription AND the paid
 *  integration module enabled for the tenant. There is NO free / self-serve path.
 *  So when creds are absent (no apiKey, or no secret) postJob does NOT attempt a
 *  call and does NOT invent a posting: it returns status PENDING_PARTNER_APPROVAL
 *  with an EMPTY externalId, so the row honestly records "awaiting the paid Naukri
 *  partner setup" rather than a fake ACTIVE. (The dispatcher/worker also short-
 *  circuits upstream when the job-distribution module is off; this is the in-adapter
 *  backstop for a missing paid subscription.)
 *
 *  ── searchCandidates: manual-contract-gated, NOT implemented ─────────────────
 *  caps.searchCandidates is FALSE and searchCandidates is intentionally NOT
 *  implemented. The ONLY candidate surface exposed here is the Amplify INBOUND
 *  application pull (parseApplication of /apply/stage_update). Naukri's Resdex
 *  resume database is a separate, manually-contracted product with its own ToS that
 *  forbids programmatic scraping; we expose NO Resdex search. A tenant wanting
 *  Resdex must arrange it under a manual contract out of band.
 *
 *  ── verifyWebhook: shared-secret header compare (timing-safe), NOT HMAC ───────
 *  Amplify's inbound stage-update does NOT HMAC-sign the body; it echoes the same
 *  static `Secret Key` header. verifyWebhook reads that header and timing-safe
 *  compares it to the tenant's stored secret. (rawBody is accepted for signature
 *  parity with the HMAC boards and so the inbound router never parses before
 *  verifying, but it is not hashed here - the compare is over the secret itself.)
 *  No secret configured, or a mismatch, rejects (returns false).
 *
 *  ── Rate limit ───────────────────────────────────────────────────────────────
 *  Amplify is documented conservatively (multiposting bridge, not a high-throughput
 *  API); every outbound call goes through the shared fetch helper with a 250ms
 *  process-local spacing guard (rateKey "naukri", minIntervalMs 250) plus the
 *  Retry-After-honoring 429 backoff in http.ts.
 *
 * Base host: https://api.zwayam.com (overridable via creds.baseUrl). India region.
 */
import type {
  HiringPlatformProvider,
  NormalizedApplicant,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  NormalizedResume,
  PlatformCredentials,
  ProviderCapabilities,
  ScreenerAnswer,
} from "./types.js";
import { fetchJson, header, dt, str, timingSafeEqualStr } from "./http.js";

const PROVIDER = "naukri" as const;
const DEFAULT_BASE = "https://api.zwayam.com";
/** The partner slug in the Amplify webhook path /amplify/webhook/{ats}/jobs/... */
const ATS_SLUG = "cdc-ats";
/** Amplify shared-secret header name (literal). NOT an HMAC of the body. */
const SECRET_HEADER = "Secret Key";
// Amplify is a multiposting bridge (not a high-throughput API); space calls >=250ms.
const RATE_KEY = "naukri";
const MIN_INTERVAL_MS = 250;

const caps: ProviderCapabilities = {
  postApi: true,
  feed: false,
  jsonLd: false,
  applyWebhook: true,
  dispositionSync: false,
  // Resdex is manual-contract-gated and forbids scraping; no programmatic search.
  searchCandidates: false,
};

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function base(creds: PlatformCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

/** The Amplify shared secret: stored under apiToken (token board), falling back to
 *  webhookSecret / clientSecret when the tenant filed it under those keys. */
function secretOf(creds: PlatformCredentials): string | undefined {
  return str(creds.apiToken) ?? str(creds.webhookSecret) ?? str(creds.clientSecret);
}

/** True when the tenant has BOTH halves of the Amplify shared-secret pair. Without
 *  both, the paid Naukri partner setup is incomplete -> gated (no real call). */
function hasCreds(creds: PlatformCredentials): boolean {
  return Boolean(str(creds.apiKey) && secretOf(creds));
}

/** Build the outbound job-webhook URL with the apiKey as a QUERY parameter. */
function jobWebhookUrl(
  creds: PlatformCredentials,
  action: "create" | "modify" | "delete",
): string {
  const apiKey = str(creds.apiKey) ?? "";
  const u = new URL(`${base(creds)}/amplify/webhook/${ATS_SLUG}/jobs/${action}`);
  // Amplify carries the partner apiKey as a query param (NOT a header / bearer).
  u.searchParams.set("apiKey", apiKey);
  return u.toString();
}

/** Outbound headers: the static shared `Secret Key` header (NOT an HMAC) + JSON. */
function authHeaders(creds: PlatformCredentials): Record<string, string> {
  const secret = secretOf(creds);
  if (!str(creds.apiKey) || !secret) throw new Error("[naukri] missing apiKey / secret credential");
  return {
    [SECRET_HEADER]: secret,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function rate(): { rateKey: string; minIntervalMs: number } {
  return { rateKey: RATE_KEY, minIntervalMs: MIN_INTERVAL_MS };
}

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

/** Map Amplify's reported job status onto the normalized lifecycle. An unknown or
 *  absent status stays PENDING_PARTNER_APPROVAL (Amplify queues a create for the
 *  Naukri RMS partner-side push); NEVER defaulted to a fabricated ACTIVE. */
function mapJobStatus(raw: unknown): NormalizedJobStatus {
  const s = String(raw ?? "").toLowerCase();
  if (!s) return "PENDING_PARTNER_APPROVAL";
  if (s.includes("active") || s.includes("live") || s.includes("published") || s.includes("posted") || s.includes("open")) {
    return "ACTIVE";
  }
  if (s.includes("posting") || s.includes("processing") || s.includes("inprogress") || s.includes("queued")) {
    return "POSTING";
  }
  if (s.includes("expire")) return "EXPIRED";
  if (s.includes("close") || s.includes("deleted") || s.includes("removed") || s.includes("inactive")) return "CLOSED";
  if (s.includes("reject") || s.includes("fail") || s.includes("error") || s.includes("denied")) return "FAILED";
  // pending / review / approval / draft / submitted -> awaiting the partner push.
  return "PENDING_PARTNER_APPROVAL";
}

/** Serialize the normalized job into Amplify's job-create body. Only real, present
 *  fields are emitted (no defaulted / synthetic values). The ATS JobPosting id is
 *  sent as `referenceId` (Amplify's partner correlation handle). */
function toJobBody(job: NormalizedJob): AnyObj {
  const loc = job.location;
  const location: AnyObj = { remote: loc.remote };
  if (loc.city) location["city"] = loc.city;
  if (loc.region) location["state"] = loc.region;
  if (loc.country) location["country"] = loc.country;
  if (loc.postalCode) location["pincode"] = loc.postalCode;

  const body: AnyObj = {
    referenceId: job.id,
    title: job.title,
    description: job.descriptionHtml,
    applyUrl: job.applyUrl,
    location,
    contactEmail: job.contactEmail,
    postedDate: job.datePublished,
  };
  if (job.employmentType.length) body["employmentType"] = job.employmentType;
  if (job.department) body["functionalArea"] = job.department;
  if (job.validThrough) body["expiryDate"] = job.validThrough;
  if (job.contactPhone) body["contactPhone"] = job.contactPhone;
  if (job.requirements.length) body["keySkills"] = job.requirements;
  if (job.benefits.length) body["benefits"] = job.benefits;
  if (job.salary) {
    const salary: AnyObj = { currency: job.salary.currency, period: job.salary.period };
    if (job.salary.min !== undefined) salary["min"] = job.salary.min;
    if (job.salary.max !== undefined) salary["max"] = job.salary.max;
    body["salary"] = salary;
  }
  return body;
}

/** Pull Amplify's job node out of whatever envelope it wraps the response in. */
function jobNode(resp: unknown): AnyObj {
  const root = obj(resp);
  return obj(root["job"] ?? root["data"] ?? root["result"] ?? root);
}

export const naukriProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps,

  /**
   * Push a job-create event to Amplify, which mirrors it onto the tenant's Naukri
   * RMS account. Returns the REAL Amplify job id + reported status only when
   * Amplify actually accepts it. HARD GATE: with no paid-subscription creds we do
   * NOT call Amplify and do NOT invent a posting - we return
   * PENDING_PARTNER_APPROVAL with an empty externalId so the row honestly records
   * "awaiting the paid Naukri partner setup", NEVER a fabricated ACTIVE.
   */
  async postJob(
    job: NormalizedJob,
    creds: PlatformCredentials,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
    if (!hasCreds(creds)) {
      return {
        externalId: "",
        status: "PENDING_PARTNER_APPROVAL",
        raw: { reason: "no-credentials", note: "paid Naukri subscription + integration module required" },
      };
    }

    const resp = await fetchJson<AnyObj>(jobWebhookUrl(creds, "create"), {
      method: "POST",
      provider: PROVIDER,
      headers: authHeaders(creds),
      body: JSON.stringify(toJobBody(job)),
      ...rate(),
    });
    const node = jobNode(resp);
    // REAL Amplify job id only - never synthesized. No id back => Amplify queued it
    // for the partner-side push but has not assigned one yet; that is an honest
    // PENDING_PARTNER_APPROVAL with no external handle, not a fake ACTIVE.
    const externalId = str(node["jobId"] ?? node["id"] ?? node["amplifyJobId"] ?? node["referenceId"]);
    const externalUrl = str(node["jobUrl"] ?? node["url"] ?? node["naukriUrl"] ?? node["listingUrl"]);
    const status = mapJobStatus(node["status"] ?? node["state"]);
    if (!externalId) {
      return { externalId: "", status: "PENDING_PARTNER_APPROVAL", raw: resp };
    }
    return {
      externalId,
      ...(externalUrl ? { externalUrl } : {}),
      status,
      raw: resp,
    };
  },

  /**
   * Delete a previously created job on Amplify by its Amplify job id. Idempotent:
   * a 404 on an already-deleted / unknown job is swallowed, never thrown. A no-op
   * when there is no external id (the create never reached Amplify) or no creds.
   */
  async closeJob(externalId: string, creds: PlatformCredentials): Promise<void> {
    if (!externalId || !hasCreds(creds)) return;
    try {
      await fetchJson<AnyObj>(jobWebhookUrl(creds, "delete"), {
        method: "POST",
        provider: PROVIDER,
        headers: authHeaders(creds),
        body: JSON.stringify({ jobId: externalId }),
        ...rate(),
      });
    } catch (err) {
      // Idempotent: deleting an already-removed / unknown job must not throw.
      if (isNotFound(err)) return;
      throw err;
    }
  },

  /**
   * Verify an inbound Amplify stage-update callback. Amplify does NOT HMAC-sign the
   * body; it echoes the same static `Secret Key` header. We timing-safe compare that
   * header to the tenant's stored secret over the EXACT shared secret (rawBody is
   * accepted only so the inbound router never parses before verifying). No secret
   * configured, a missing header, or a mismatch => false (forged callback rejected).
   */
  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    _rawBody: string,
    secret?: string,
  ): boolean {
    if (!secret) return false;
    // Amplify sends the literal `Secret Key` header (read case-insensitively).
    const provided = header(headers, SECRET_HEADER) ?? header(headers, "secret-key");
    if (!provided) return false;
    return timingSafeEqualStr(secret, provided.trim());
  },

  /**
   * Normalize an inbound Amplify `/apply/stage_update` payload (an Amplify
   * candidate-pull, NOT a Resdex scrape) into a {@link NormalizedApplication}.
   * Returns null for a ping / non-application stage event, or a payload with no
   * real applicant / correlation keys - NEVER a fabricated candidate or applyId.
   */
  parseApplication(rawBody: string): NormalizedApplication | null {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      return null;
    }

    // Only a stage-update / apply event yields an application; pings => null.
    const eventType = String(
      payload["event"] ?? payload["type"] ?? payload["eventType"] ?? payload["stage"] ?? "",
    ).toLowerCase();
    if (eventType && /ping|test|heartbeat/.test(eventType)) return null;

    const application = obj(payload["application"] ?? payload["candidate"] ?? payload["data"] ?? payload);
    const applicant = obj(
      application["candidate"] ?? application["applicant"] ?? application["profile"] ?? application,
    );

    // The Amplify job id this application targets + the board's own application id
    // (the inbound dedupe key) - REAL or null. Without both we cannot route/dedupe.
    const jobExternalId = str(
      application["jobId"] ?? application["job_id"] ?? application["referenceId"] ?? payload["jobId"] ?? obj(application["job"])["id"],
    );
    const externalApplyId = str(
      application["applicationId"] ?? application["application_id"] ?? application["id"] ?? payload["applicationId"] ?? payload["id"],
    );
    if (!jobExternalId || !externalApplyId) return null;

    const candidate = parseApplicant(applicant);
    if (!candidate) return null; // no real identity => honest null, never a placeholder

    const appliedAt =
      dt(
        application["appliedAt"] ??
          application["applied_at"] ??
          application["createdAt"] ??
          application["stageUpdatedAt"] ??
          payload["timestamp"],
      ) ?? new Date();

    const resume = parseResume(obj(application["resume"] ?? applicant["resume"]));
    const screenerAnswers = parseScreenerAnswers(
      application["screenerAnswers"] ?? application["answers"] ?? application["questions"],
    );
    const coverLetter = str(application["coverLetter"] ?? application["cover_letter"] ?? applicant["coverLetter"]);

    return {
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
  },
};

/** Build a NormalizedApplicant from an Amplify applicant node, or null when it
 *  lacks a real first/last name + email (we never default to a placeholder). */
function parseApplicant(applicant: AnyObj): NormalizedApplicant | null {
  const email = str(applicant["email"] ?? applicant["emailId"] ?? applicant["email_address"]);
  if (!email) return null;

  let firstName = str(applicant["firstName"] ?? applicant["first_name"] ?? applicant["givenName"]);
  let lastName = str(applicant["lastName"] ?? applicant["last_name"] ?? applicant["familyName"]);
  // Amplify often sends a single `name` / `fullName`; split it only when the parts
  // are genuinely absent (never invent a last name).
  if (!firstName && !lastName) {
    const full = str(applicant["name"] ?? applicant["fullName"] ?? applicant["candidateName"]);
    if (full) {
      const parts = full.split(/\s+/);
      firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(" ");
    }
  }
  if (!firstName || !lastName) return null;

  const phone = str(applicant["phone"] ?? applicant["mobile"] ?? applicant["phoneNumber"] ?? applicant["contactNumber"]);
  const location = str(applicant["location"] ?? applicant["city"] ?? applicant["currentLocation"]);
  return {
    firstName,
    lastName,
    email,
    ...(phone ? { phone } : {}),
    ...(location ? { location } : {}),
  };
}

/** Build a NormalizedResume from an Amplify resume node, or null when it carries
 *  neither inline bytes nor a fetchable URL (honest absence, not a stub). */
function parseResume(resume: AnyObj): NormalizedResume | null {
  const base64 = str(resume["content"] ?? resume["base64"] ?? resume["data"] ?? resume["fileContent"]);
  const mediaUrl = str(resume["url"] ?? resume["resumeUrl"] ?? resume["downloadUrl"] ?? resume["fileUrl"] ?? resume["mediaUrl"]);
  if (!base64 && !mediaUrl) return null;
  const fileName = str(resume["fileName"] ?? resume["filename"] ?? resume["name"]) ?? "resume";
  const contentType =
    str(resume["contentType"] ?? resume["mimeType"] ?? resume["mimetype"]) ?? "application/octet-stream";
  return {
    fileName,
    contentType,
    ...(base64 ? { base64 } : {}),
    ...(mediaUrl ? { mediaUrl } : {}),
  };
}

/** Map an Amplify screener-answers payload (array or object) into normalized Q&A,
 *  passthrough only - never synthesized. */
function parseScreenerAnswers(raw: unknown): ScreenerAnswer[] {
  const out: ScreenerAnswer[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      const a = obj(item);
      const question = str(a["question"] ?? a["prompt"] ?? a["label"]);
      const answer = str(a["answer"] ?? a["response"] ?? a["value"]);
      if (question && answer) out.push({ question, answer });
    }
  } else if (raw && typeof raw === "object") {
    for (const [question, value] of Object.entries(raw as AnyObj)) {
      const answer = str(value);
      if (question && answer) out.push({ question, answer });
    }
  }
  return out;
}

export default naukriProvider;
