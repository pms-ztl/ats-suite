/**
 * HTTP client for resume-service → candidate-service.
 * Used by bulk upload to upsert real candidates instead of placeholder IDs.
 */
import { AppError } from "@cdc-ats/common";

const CANDIDATE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
const BILLING_URL = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

export interface UpsertCandidateResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function upsertCandidate(
  input: { email: string; firstName: string; lastName: string; source?: string },
  tenantId: string,
  userId: string
): Promise<UpsertCandidateResult | null> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": userId,
    "X-User-Role": "ADMIN",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${CANDIDATE_URL}/internal/candidates/upsert-from-application`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...input, source: input.source ?? "BULK_UPLOAD" }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json();
    return (body?.data ?? body) as UpsertCandidateResult;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export interface ResumeQuota {
  allowed: boolean;
  used: number;
  limit: number;
  plan: string;
}

/**
 * Ask billing-service whether the tenant can parse `count` more resumes this
 * month (enforces the plan's resumesPerMonth limit). FAIL-OPEN: if billing is
 * unreachable or errors, we allow the upload — a billing blip must never block
 * a recruiter from importing candidates.
 */
export async function checkResumeQuota(
  count: number,
  tenantId: string,
  userId: string
): Promise<ResumeQuota> {
  const FAIL_OPEN: ResumeQuota = { allowed: true, used: 0, limit: -1, plan: "UNKNOWN" };
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": userId,
    "X-User-Role": "ADMIN",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${BILLING_URL}/internal/check-resume-quota?count=${count}`, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return FAIL_OPEN;
    const body: any = await res.json();
    const data = body?.data ?? body;
    return {
      allowed: data?.allowed !== false,
      used: Number(data?.used ?? 0),
      limit: Number(data?.limit ?? -1),
      plan: String(data?.plan ?? "UNKNOWN"),
    };
  } catch {
    clearTimeout(timer);
    return FAIL_OPEN;
  }
}
