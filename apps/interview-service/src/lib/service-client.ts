/**
 * HTTP client for interview-service → identity-service.
 * Used by round-progression to resolve panelist candidates by role.
 */
const IDENTITY_URL = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
const BILLING_URL = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

export interface PlanLimits {
  seats: number; activeJobs: number; resumesPerMonth: number; bulkUploadMax: number;
  agents: readonly string[] | "ALL"; customForms: boolean; configurableRounds: boolean;
}

/**
 * Fetch the tenant's plan + limits from billing-service for capability gating
 * (configurableRounds). Fails OPEN (null) on a billing outage.
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

export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export async function fetchActiveUsersByRole(
  tenantId: string,
  _role: string
): Promise<UserSummary[]> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": "system",
    "X-User-Role": "ADMIN",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  // identity-service GET /internal/users?tenantId= returns all users; we filter by role here
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${IDENTITY_URL}/internal/users?tenantId=${tenantId}`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const body: any = await res.json();
    const users = (body?.data ?? body ?? []) as UserSummary[];
    return users.filter((u) => u.isActive && u.role === _role);
  } catch {
    clearTimeout(timer);
    return [];
  }
}
