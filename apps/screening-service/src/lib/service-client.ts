/**
 * Minimal HTTP clients for screening-service → other services.
 * Used by the screening worker to fetch real candidate + job data
 * instead of placeholders.
 */
import { AppError } from "@cdc-ats/common";

const URLS = {
  resume: process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007",
  job: process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004",
  candidate: process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005",
};

const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

async function call<T>(
  service: keyof typeof URLS,
  path: string,
  tenantId: string,
  userId: string
): Promise<T | null> {
  const url = `${URLS[service]}${path}`;
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": userId,
    "X-User-Role": "ADMIN", // internal call, granted full read
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export interface ResumeData {
  id: string;
  candidateId: string;
  fileName: string;
  extractedText: string | null;
  // Stored NESTED as { raw|enriched: { skills:[{raw,confidence}], name:{value}, ... } }.
  // Typed loosely — get_candidate_profile unwraps it.
  parsedData: Record<string, any> | null;
  parseStatus: string;
}

export interface RequisitionData {
  id: string;
  title: string;
  department: string;
  description?: string | null;
  requirements: string[] | unknown;
}

export async function fetchResume(
  candidateId: string,
  tenantId: string
): Promise<ResumeData | null> {
  return call<ResumeData>("resume", `/internal/resume/${candidateId}`, tenantId, "system");
}

export async function fetchRequisition(
  requisitionId: string,
  tenantId: string
): Promise<RequisitionData | null> {
  return call<RequisitionData>("job", `/internal/requisitions/${requisitionId}`, tenantId, "system");
}

export async function fetchCandidateApplications(
  candidateId: string,
  tenantId: string
): Promise<Array<{ id: string; requisitionId: string; stage: string; status: string }> | null> {
  return call("candidate", `/internal/candidates/${candidateId}/applications`, tenantId, "system");
}
