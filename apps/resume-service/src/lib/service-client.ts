/**
 * HTTP client for resume-service → candidate-service.
 * Used by bulk upload to upsert real candidates instead of placeholder IDs.
 */
import { AppError } from "@cdc-ats/common";

const CANDIDATE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
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
