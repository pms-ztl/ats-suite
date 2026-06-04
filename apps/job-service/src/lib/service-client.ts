/**
 * Minimal HTTP client for job-service → candidate-service calls during
 * public apply. The full typed client lives in api-gateway; this is a
 * stripped-down version for one-off internal calls.
 */
import { AppError } from "@cdc-ats/common";

const CANDIDATE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
const RESUME_URL = process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007";
const BILLING_URL = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

export interface PlanLimits {
  seats: number; activeJobs: number; resumesPerMonth: number; bulkUploadMax: number;
  agents: readonly string[] | "ALL"; customForms: boolean; configurableRounds: boolean;
}

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
