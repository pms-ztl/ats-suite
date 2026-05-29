const SCREENING_URL = process.env["SCREENING_SERVICE_URL"] ?? "http://localhost:4008";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

/** Pull the deterministic decision-distribution audit from screening-service. */
export async function fetchScreeningAudit(requisitionId: string, tenantId: string): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
      "X-User-Id": "system",
      "X-User-Role": "ADMIN",
    };
    if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;
    const res = await fetch(`${SCREENING_URL}/internal/screening/audit/${requisitionId}`, {
      headers,
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
