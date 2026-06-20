const SCREENING_URL = process.env["SCREENING_SERVICE_URL"] ?? "http://localhost:4008";
const ASSESSMENT_URL = process.env["ASSESSMENT_SERVICE_URL"] ?? "http://localhost:4014";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

/** Stamp the internal-service + acting-user headers a trusted internal call needs. */
function internalHeaders(tenantId: string, actorUserId: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": actorUserId,
    "X-User-Role": "ADMIN",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;
  return headers;
}

/** Pull the deterministic decision-distribution audit from screening-service. */
export async function fetchScreeningAudit(requisitionId: string, tenantId: string): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(`${SCREENING_URL}/internal/screening/audit/${requisitionId}`, {
      headers: internalHeaders(tenantId, "system"),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json();
    return body?.data ?? body;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * WF10/J1 - DSR leg for Online Assessment (OA) data. compliance-service drives a
 * candidate data-subject request and calls assessment-service so the erasure /
 * export ALSO covers Attempt/Answer/AssessmentResult/ProctorEvent/Invite.
 *
 * Returns null (not a throw) when assessment-service is unreachable so a single
 * service outage produces a partial DSR result the caller can report, rather than
 * hard-failing the whole request. The candidate-facing erasure of PII still
 * succeeds for every service that IS reachable.
 */
export async function fetchAssessmentExport(
  candidateId: string,
  tenantId: string,
  actorUserId: string,
): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `${ASSESSMENT_URL}/internal/gdpr/candidates/${encodeURIComponent(candidateId)}/export`,
      { headers: internalHeaders(tenantId, actorUserId), signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json();
    return body?.data ?? body;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/** WF10/J1 - erase the candidate's OA rows via assessment-service (Article 17). */
export async function eraseAssessmentData(
  candidateId: string,
  tenantId: string,
  actorUserId: string,
): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(
      `${ASSESSMENT_URL}/internal/gdpr/candidates/${encodeURIComponent(candidateId)}`,
      { method: "DELETE", headers: internalHeaders(tenantId, actorUserId), signal: controller.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json();
    return body?.data ?? body;
  } catch {
    clearTimeout(timer);
    return null;
  }
}
