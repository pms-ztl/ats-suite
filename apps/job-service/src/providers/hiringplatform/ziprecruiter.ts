/**
 * ZipRecruiter adapter (job-service hiring-platform axis) — WF-G / SLICE G1.
 *
 * Real partner-API shapes (ZipRecruiter Partner API, https://www.ziprecruiter.com,
 * host https://api.ziprecruiter.com, path prefix /partner/v0):
 *  - Auth:   HTTP Basic on EVERY request — the tenant's partner `apiKey` is the
 *            Basic username, the password is empty ("apiKey:"). Sent via the shared
 *            http.basicAuth helper in the Authorization header. The key is decrypted
 *            per call and never persisted or logged.
 *  - Post:   POST   {base}/partner/v0/job   body: the normalized job mapped to
 *            ZipRecruiter's job fields (title, description, apply_url, locations,
 *            job_types, salary, expiration). ZipRecruiter returns the created job
 *            with its own `id` + (when live) `url` + `status`; we read those
 *            VERBATIM — externalId / url / status are NEVER synthesized.
 *  - Close:  DELETE {base}/partner/v0/job/{externalId}   (idempotent: a 404 on an
 *            already-removed / unknown posting is swallowed, never thrown).
 *  - Status: GET    {base}/partner/v0/job/{externalId}   → the board's reported
 *            lifecycle for the status reaper; the board's `status` is mapped, never
 *            invented (an unknown/absent board status stays PENDING, not ACTIVE).
 *  - Apply webhook: ZipRecruiter POSTs an inbound application to the tenant's
 *            configured webhook URL. The raw body is signed base64 HMAC-SHA256 over
 *            `${timestamp}.${rawBody}` in the `X-ZipRecruiter-Signature` header,
 *            with the unix `timestamp` in `X-ZipRecruiter-Signature-Timestamp`,
 *            keyed by the tenant's stored webhookSecret. verifyWebhook recomputes
 *            over the EXACT raw bytes and timing-safe-compares; a forged/unsigned
 *            callback (or one with no secret configured) is rejected.
 *  - Disposition: ZipRecruiter accepts a status mirror back on an application via
 *            POST {base}/partner/v0/application/{externalApplyId}/status. This only
 *            reflects a decision a human already made in the ATS (HARD RULE: never an
 *            automated reject) and is a no-op when the application carries no id.
 *
 *  ── Rate limit ───────────────────────────────────────────────────────────────
 *  The partner API is documented at ~5 requests/second; every outbound call goes
 *  through the shared fetch helper with a 200ms process-local spacing guard
 *  (rateKey "ziprecruiter", minIntervalMs 200) plus the Retry-After-honoring 429
 *  backoff in http.ts.
 *
 * Real-data-or-null discipline: with no creds the dispatcher/worker never reaches
 * this file (the posting is marked PENDING_PARTNER_APPROVAL upstream); when this
 * file runs it returns ONLY what the board actually reported, or null.
 *
 * Base host: https://api.ziprecruiter.com (overridable via creds.baseUrl).
 */
import { createHmac } from "node:crypto";
import type {
  HiringPlatformProvider,
  NormalizedApplicant,
  NormalizedApplication,
  NormalizedJob,
  NormalizedJobStatus,
  NormalizedResume,
  NormalizedStatus,
  PlatformCredentials,
  ProviderCapabilities,
  ScreenerAnswer,
} from "./types.js";
import {
  basicAuth,
  dt,
  fetchJson,
  header,
  str,
  timingSafeEqualStr,
} from "./http.js";

const PROVIDER = "ziprecruiter" as const;
const DEFAULT_BASE = "https://api.ziprecruiter.com";
const API_PREFIX = "/partner/v0";
// ZipRecruiter partner API caps at ~5 rps; space process-local calls >=200ms apart.
const RATE_KEY = "ziprecruiter";
const MIN_INTERVAL_MS = 200;

const caps: ProviderCapabilities = {
  postApi: true,
  feed: false,
  jsonLd: false,
  applyWebhook: true,
  dispositionSync: true,
  searchCandidates: false,
};

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function base(creds: PlatformCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function jobUrl(creds: PlatformCredentials, externalId?: string): string {
  const root = `${base(creds)}${API_PREFIX}/job`;
  return externalId ? `${root}/${encodeURIComponent(externalId)}` : root;
}

/** HTTP Basic on every request: apiKey is the username, empty password. */
function authHeaders(creds: PlatformCredentials): Record<string, string> {
  const key = creds.apiKey ?? creds.apiToken;
  if (!key) throw new Error("[ziprecruiter] missing apiKey credential");
  return {
    Authorization: basicAuth(key, ""),
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

/** Map ZipRecruiter's reported job status to the normalized lifecycle. An unknown
 *  or absent board status stays PENDING (NEVER defaulted to ACTIVE — real-or-honest). */
function mapJobStatus(raw: unknown): NormalizedJobStatus {
  const s = String(raw ?? "").toLowerCase();
  if (!s) return "PENDING";
  if (s.includes("active") || s.includes("live") || s.includes("published") || s.includes("open")) return "ACTIVE";
  if (s.includes("pending") && (s.includes("approval") || s.includes("review") || s.includes("partner"))) {
    return "PENDING_PARTNER_APPROVAL";
  }
  if (s.includes("posting") || s.includes("processing") || s.includes("queued")) return "POSTING";
  if (s.includes("expire")) return "EXPIRED";
  if (s.includes("close") || s.includes("removed") || s.includes("deleted") || s.includes("inactive")) return "CLOSED";
  if (s.includes("reject") || s.includes("fail") || s.includes("error") || s.includes("denied")) return "FAILED";
  if (s.includes("pending") || s.includes("draft")) return "PENDING";
  return "PENDING";
}

/** Serialize the normalized job into ZipRecruiter's create-job body. Only real,
 *  present fields are emitted (no defaulted/synthetic values). */
function toJobBody(job: NormalizedJob): AnyObj {
  const loc = job.location;
  const location: AnyObj = { remote: loc.remote };
  if (loc.city) location["city"] = loc.city;
  if (loc.region) location["state"] = loc.region;
  if (loc.country) location["country"] = loc.country;
  if (loc.postalCode) location["postal_code"] = loc.postalCode;

  const body: AnyObj = {
    title: job.title,
    description: job.descriptionHtml,
    apply_url: job.applyUrl,
    locations: [location],
    posted_date: job.datePublished,
    contact_email: job.contactEmail,
  };
  if (job.employmentType.length) body["job_types"] = job.employmentType;
  if (job.department) body["category"] = job.department;
  if (job.validThrough) body["expiration_date"] = job.validThrough;
  if (job.contactPhone) body["contact_phone"] = job.contactPhone;
  if (job.requirements.length) body["requirements"] = job.requirements;
  if (job.benefits.length) body["benefits"] = job.benefits;
  if (job.salary) {
    const salary: AnyObj = { currency: job.salary.currency, period: job.salary.period };
    if (job.salary.min !== undefined) salary["min"] = job.salary.min;
    if (job.salary.max !== undefined) salary["max"] = job.salary.max;
    body["salary"] = salary;
  }
  return body;
}

/** Pull the board job object out of whatever envelope ZipRecruiter wraps it in. */
function jobNode(resp: unknown): AnyObj {
  const root = obj(resp);
  return obj(root["job"] ?? root["data"] ?? root);
}

export const ziprecruiterProvider: HiringPlatformProvider = {
  id: PROVIDER,
  caps,

  async postJob(
    job: NormalizedJob,
    creds: PlatformCredentials,
  ): Promise<{ externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown }> {
    const resp = await fetchJson<AnyObj>(jobUrl(creds), {
      method: "POST",
      provider: PROVIDER,
      headers: authHeaders(creds),
      body: JSON.stringify(toJobBody(job)),
      ...rate(),
    });
    const node = jobNode(resp);
    // REAL id only — never synthesized. No id back => the board did not accept it.
    const externalId = str(node["id"] ?? node["job_id"] ?? node["reference"]);
    if (!externalId) {
      throw new Error("[ziprecruiter] post-job response missing job id");
    }
    const externalUrl = str(node["url"] ?? node["job_url"] ?? node["listing_url"]);
    const status = mapJobStatus(node["status"] ?? node["state"]);
    return {
      externalId,
      ...(externalUrl ? { externalUrl } : {}),
      status,
      raw: resp,
    };
  },

  async closeJob(externalId: string, creds: PlatformCredentials): Promise<void> {
    try {
      await fetchJson<AnyObj>(jobUrl(creds, externalId), {
        method: "DELETE",
        provider: PROVIDER,
        headers: authHeaders(creds),
        ...rate(),
      });
    } catch (err) {
      // Idempotent: closing an already-removed / unknown posting must not throw.
      if (isNotFound(err)) return;
      throw err;
    }
  },

  async fetchJobStatus(
    externalId: string,
    creds: PlatformCredentials,
  ): Promise<{ status: NormalizedJobStatus; raw: unknown }> {
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(jobUrl(creds, externalId), {
        provider: PROVIDER,
        headers: authHeaders(creds),
        ...rate(),
      });
    } catch (err) {
      // A removed posting reads back as CLOSED, not as a fabricated status.
      if (isNotFound(err)) return { status: "CLOSED", raw: { error: "not_found", externalId } };
      throw err;
    }
    const node = jobNode(resp);
    return { status: mapJobStatus(node["status"] ?? node["state"]), raw: resp };
  },

  verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: string,
    secret?: string,
  ): boolean {
    if (!secret) return false;
    const provided = header(headers, "x-ziprecruiter-signature");
    const timestamp = header(headers, "x-ziprecruiter-signature-timestamp");
    if (!provided || !timestamp) return false;
    // base64 HMAC-SHA256 over `${timestamp}.${rawBody}` keyed by the tenant secret.
    const expected = createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`, "utf8")
      .digest("base64");
    return timingSafeEqualStr(expected, provided.trim());
  },

  parseApplication(rawBody: string): NormalizedApplication | null {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      return null;
    }

    // Only an actual apply event yields an application; pings / status acks => null.
    const eventType = String(payload["event"] ?? payload["type"] ?? payload["event_type"] ?? "").toLowerCase();
    if (eventType && !eventType.includes("appl")) return null;

    const application = obj(payload["application"] ?? payload["data"] ?? payload);
    const applicant = obj(application["candidate"] ?? application["applicant"] ?? application["job_seeker"] ?? application);

    // The board's own application id (inbound dedupe key) and posting id — REAL or
    // null. Without both we cannot route/dedupe, so we ignore rather than fake them.
    const externalApplyId = str(
      application["application_id"] ?? application["id"] ?? payload["application_id"] ?? payload["id"],
    );
    const jobExternalId = str(
      application["job_id"] ?? application["job_reference"] ?? payload["job_id"] ?? obj(application["job"])["id"],
    );
    if (!externalApplyId || !jobExternalId) return null;

    const candidate = parseApplicant(applicant);
    if (!candidate) return null; // no real identity => honest null, never a placeholder

    const appliedAt =
      dt(application["applied_at"] ?? application["created_at"] ?? application["submitted_at"] ?? payload["timestamp"]) ??
      new Date();

    const resume = parseResume(obj(application["resume"] ?? applicant["resume"]));
    const screenerAnswers = parseScreenerAnswers(application["screener_answers"] ?? application["answers"] ?? application["questions"]);
    const coverLetter = str(application["cover_letter"] ?? application["coverLetter"] ?? applicant["cover_letter"]);

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

  async syncDisposition(
    app: NormalizedApplication,
    status: NormalizedStatus,
    creds: PlatformCredentials,
  ): Promise<void> {
    // Mirror a human-made HITL decision back to the board; never an automated reject.
    // No-op when the application carries no board id (nothing to mirror against).
    if (!app.externalApplyId) return;
    const url = `${base(creds)}${API_PREFIX}/application/${encodeURIComponent(app.externalApplyId)}/status`;
    try {
      await fetchJson<AnyObj>(url, {
        method: "POST",
        provider: PROVIDER,
        headers: authHeaders(creds),
        body: JSON.stringify({ status: mapDisposition(status), job_id: app.jobExternalId }),
        ...rate(),
      });
    } catch (err) {
      // A board that does not know this application (404) is not an error worth
      // retrying — the disposition simply has nowhere to land.
      if (isNotFound(err)) return;
      throw err;
    }
  },
};

/** Build a NormalizedApplicant from a board applicant node, or null when it lacks a
 *  real first/last name + email (we never default to a placeholder identity). */
function parseApplicant(applicant: AnyObj): NormalizedApplicant | null {
  const email = str(applicant["email"] ?? applicant["email_address"]);
  if (!email) return null;

  let firstName = str(applicant["first_name"] ?? applicant["firstName"] ?? applicant["given_name"]);
  let lastName = str(applicant["last_name"] ?? applicant["lastName"] ?? applicant["family_name"]);
  // ZipRecruiter sometimes sends a single `name`; split it only when the parts are
  // genuinely absent (never invent a last name).
  if (!firstName && !lastName) {
    const full = str(applicant["name"] ?? applicant["full_name"]);
    if (full) {
      const parts = full.split(/\s+/);
      firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(" ");
    }
  }
  if (!firstName || !lastName) return null;

  const phone = str(applicant["phone"] ?? applicant["phone_number"] ?? applicant["telephone"]);
  const location = str(applicant["location"] ?? applicant["city"] ?? applicant["address"]);
  return {
    firstName,
    lastName,
    email,
    ...(phone ? { phone } : {}),
    ...(location ? { location } : {}),
  };
}

/** Build a NormalizedResume from a board resume node, or null when it carries
 *  neither inline bytes nor a fetchable URL (honest absence, not a stub). */
function parseResume(resume: AnyObj): NormalizedResume | null {
  const base64 = str(resume["content"] ?? resume["base64"] ?? resume["data"] ?? resume["file_content"]);
  const mediaUrl = str(resume["url"] ?? resume["download_url"] ?? resume["file_url"] ?? resume["media_url"]);
  if (!base64 && !mediaUrl) return null;
  const fileName = str(resume["file_name"] ?? resume["filename"] ?? resume["name"]) ?? "resume";
  const contentType =
    str(resume["content_type"] ?? resume["mime_type"] ?? resume["mimetype"]) ?? "application/octet-stream";
  return {
    fileName,
    contentType,
    ...(base64 ? { base64 } : {}),
    ...(mediaUrl ? { mediaUrl } : {}),
  };
}

/** Map a board screener-answers payload (array or object) into normalized Q&A,
 *  passthrough only — never synthesized. */
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

/** Map the ATS disposition vocabulary onto ZipRecruiter's status mirror values. */
function mapDisposition(status: NormalizedStatus): string {
  switch (status) {
    case "NEW":
      return "new";
    case "REVIEWED":
      return "reviewed";
    case "SHORTLISTED":
      return "shortlisted";
    case "INTERVIEWING":
      return "interviewing";
    case "OFFER":
      return "offer";
    case "HIRED":
      return "hired";
    case "REJECTED":
      return "declined";
    case "WITHDRAWN":
      return "withdrawn";
    default:
      return "reviewed";
  }
}

export default ziprecruiterProvider;
