/**
 * Minimal HTTP client for job-service → candidate-service calls during
 * public apply. The full typed client lives in api-gateway; this is a
 * stripped-down version for one-off internal calls.
 */
import { AppError } from "@cdc-ats/common";
// WF3-C5: the local PlanLimits interface (byte-identical to the in-service
// PLAN_LIMITS shape) has been collapsed into the single derived definition in
// @cdc-ats/common (modules/plan-limits). job-service does not keep a PLAN_LIMITS
// data copy — it fetches the tenant's limits from billing-service over REST
// (fetchPlanLimits below) — so only the shared type is imported here. No
// call-site / gating behavior change.
import type { PlanLimits } from "@cdc-ats/common";

const CANDIDATE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
const RESUME_URL = process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007";
const SCREENING_URL = process.env["SCREENING_SERVICE_URL"] ?? "http://localhost:4008";
const BILLING_URL = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

/** Internal service headers for a trusted job-service -> peer-service call. The
 *  resume/screening reads below are admin-gated reads, so we present an ADMIN role
 *  exactly like forwardResumeUpload; the X-Internal-Service token (when set) is the
 *  gateway-bypass authority readAuthHeaders requires. */
function internalHeaders(tenantId: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": "public-apply",
    "X-User-Role": "ADMIN",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;
  return headers;
}

export type { PlanLimits };

/**
 * Fetch the tenant's plan + limits from billing-service for capability gating
 * (customForms, activeJobs). Fails OPEN (returns null) on a billing outage so a
 * blip never blocks legitimate work.
 */
export async function fetchPlanLimits(tenantId: string): Promise<{ plan: string; limits: PlanLimits } | null> {
  try {
    const headers: Record<string, string> = {
      "Accept": "application/json", "X-Tenant-Id": tenantId, "X-User-Id": "system", "X-User-Role": "ADMIN",
    };
    if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;
    const res = await fetch(`${BILLING_URL}/internal/billing/limits`, { headers, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const body: any = await res.json();
    return (body?.data ?? null) as { plan: string; limits: PlanLimits } | null;
  } catch { return null; }
}

/**
 * Forward a public-apply resume to resume-service for storage + parsing.
 * Best-effort: the candidate already exists; a failed resume forward must not
 * fail the application. Uses internal service headers (no end-user auth).
 */
export async function forwardResumeUpload(opts: {
  tenantId: string;
  candidateId: string;
  file: { buffer: Buffer; originalname: string; mimetype: string };
}): Promise<boolean> {
  try {
    const fd = new FormData();
    fd.append("candidateId", opts.candidateId);
    fd.append("resume", new Blob([opts.file.buffer], { type: opts.file.mimetype }), opts.file.originalname);
    const headers: Record<string, string> = {
      "X-Tenant-Id": opts.tenantId,
      "X-User-Id": "public-apply",
      "X-User-Role": "ADMIN", // internal call; resume upload is admin/recruiter-gated
    };
    if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;
    const res = await fetch(`${RESUME_URL}/internal/resume/upload`, { method: "POST", headers, body: fd as any });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * WF-I / I4 — read the REAL resume parse stage for a candidate from resume-service
 * (GET /internal/resume/:candidateId). Used ONLY by the public application status
 * route to map the live pipeline position honestly. Returns null when there is no
 * resume row yet (the resume has not been ingested) OR on any read error — the
 * status route treats a null as "not yet scanned" rather than fabricating a stage.
 *   parseStatus: PENDING | EXTRACTED | PARSED | FAILED (resume-service values)
 *   hasParsedData: true once structured parse output exists.
 */
export async function getResumeParseStatus(
  tenantId: string,
  candidateId: string,
): Promise<{ parseStatus: string; hasParsedData: boolean } | null> {
  try {
    const res = await fetch(`${RESUME_URL}/internal/resume/${encodeURIComponent(candidateId)}`, {
      headers: internalHeaders(tenantId),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null; // 404 => no resume row yet (not ingested)
    const body: any = await res.json().catch(() => null);
    const r = body?.data ?? null;
    if (!r) return null;
    return {
      parseStatus: typeof r.parseStatus === "string" ? r.parseStatus : "PENDING",
      hasParsedData: r.parsedData != null,
    };
  } catch {
    return null;
  }
}

/**
 * WF-I / I4 — read the latest screening verdict for a candidate from
 * screening-service (GET /internal/screening?candidateId=). Used ONLY by the public
 * application status route. Returns null when there is no screening yet OR on any
 * read error (the status route treats null as "not yet screened"). The first row is
 * the newest (the route orders by createdAt desc).
 *   status: PENDING | RUNNING | COMPLETED | FAILED (screening-service values)
 *   result: PASS | REVIEW | FAIL | null
 */
export async function getScreeningStatus(
  tenantId: string,
  candidateId: string,
): Promise<{ status: string; result: string | null } | null> {
  try {
    const url = `${SCREENING_URL}/internal/screening?candidateId=${encodeURIComponent(candidateId)}`;
    const res = await fetch(url, { headers: internalHeaders(tenantId), signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const body: any = await res.json().catch(() => null);
    const rows = Array.isArray(body?.data) ? body.data : [];
    if (rows.length === 0) return null;
    const latest = rows[0];
    return {
      status: typeof latest?.status === "string" ? latest.status : "PENDING",
      result: typeof latest?.result === "string" ? latest.result : null,
    };
  } catch {
    return null;
  }
}

/**
 * Rollup — read the REAL number of applications a requisition has from
 * candidate-service (the owner of the Application rows), so job-service can
 * reconcile the denormalized JobPosting.applicationCount off the request hot path
 * (the accept-fast apply deliberately dropped the per-apply count UPDATE to avoid a
 * row-level write-lock hotspot). This is a REAL count of the applications
 * candidate-service reports for the requisition, never a fabricated / incremented
 * guess.
 *
 * candidate-service's GET /internal/applications?requisitionId= returns the real
 * rows (ordered appliedAt desc). It caps a single response at 200 rows and exposes
 * no cursor, so we read what it returns and count exactly. When the response is
 * short of the cap the count is exact; a response AT the cap means "at least 200"
 * (the true total is higher) — we return { count, capped } so the caller records
 * the real observed floor and never overstates. Returns null on any read error so
 * the caller leaves the existing stored count untouched (no fabricated 0).
 */
const APPLICATIONS_READ_CAP = 200;
export async function fetchApplicationCountForRequisition(
  tenantId: string,
  requisitionId: string,
): Promise<{ count: number; capped: boolean } | null> {
  try {
    const url = `${CANDIDATE_URL}/internal/applications?requisitionId=${encodeURIComponent(requisitionId)}`;
    const res = await fetch(url, { headers: internalHeaders(tenantId), signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const body: any = await res.json().catch(() => null);
    const rows = Array.isArray(body?.data) ? body.data : null;
    if (rows === null) return null;
    return { count: rows.length, capped: rows.length >= APPLICATIONS_READ_CAP };
  } catch {
    return null;
  }
}

export async function callCandidateService<T>(opts: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  tenantId: string;
  userId?: string;
  role?: string;
}): Promise<T> {
  const url = `${CANDIDATE_URL}${opts.path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-Id": opts.tenantId,
    "X-User-Id": opts.userId ?? "public",
    "X-User-Role": opts.role ?? "CANDIDATE",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const res = await fetch(url, {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let body: any;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  if (!res.ok || body.success === false) {
    const err = body?.error ?? { code: "UPSTREAM_FAILURE", message: `candidate-service ${res.status}` };
    throw new AppError(err.code, err.message, res.status);
  }
  return body.data as T;
}
