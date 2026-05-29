/**
 * resolveTenantPlan — gateway-side lookup of a tenant's current billing plan.
 *
 * Seat + feature gating lives in identity-service, but identity (DB-per-service)
 * doesn't store the plan — it lives on Tenant in tenant-service. Historically
 * the gateway forwarded invites without the real plan, so every tenant was
 * silently gated at FREE limits (1 seat) regardless of what they paid for.
 *
 * This resolves the canonical plan from tenant-service and caches it briefly
 * (plans change rarely; a 30s TTL keeps invite/seat checks fresh without a
 * tenant-service round-trip on every request). Fails open to the last-known
 * (or FREE) value so a tenant-service blip never hard-blocks user management.
 */
const planCache = new Map<string, { plan: string; exp: number }>();
const PLAN_TTL_MS = 30_000;

export async function resolveTenantPlan(tenantId: string): Promise<string> {
  const hit = planCache.get(tenantId);
  if (hit && hit.exp > Date.now()) return hit.plan;
  try {
    const { callService } = await import("./service-client.js");
    const tenant = await callService<{ plan?: string }>("tenant", {
      method: "GET",
      path: `/internal/tenants/${tenantId}`,
    });
    const plan = typeof tenant?.plan === "string" ? tenant.plan : "FREE";
    planCache.set(tenantId, { plan, exp: Date.now() + PLAN_TTL_MS });
    return plan;
  } catch {
    return hit?.plan ?? "FREE";
  }
}
