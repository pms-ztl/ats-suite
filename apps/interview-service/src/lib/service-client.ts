/**
 * HTTP client for interview-service → identity-service.
 * Used by round-progression to resolve panelist candidates by role.
 */
const IDENTITY_URL = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

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
