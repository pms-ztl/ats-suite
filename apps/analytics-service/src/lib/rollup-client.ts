/**
 * Cross-service reads for the analytics MetricRollup population job.
 *
 * analytics-service owns NO source data of its own (DB-per-service) — the real
 * hiring funnel lives in candidate-service. So the rollup PULLS the authoritative,
 * already-aggregated per-stage counts candidate-service computes (a real
 * `application.groupBy({ by: ["stage"] })`, the SAME source the live dashboard
 * funnel reads through the gateway) and mirrors them into MetricRollup for the
 * pre-aggregated /reporting reads. REAL data only — every number traces back to
 * candidate-service's groupBy; a read failure leaves the existing rollup untouched.
 *
 * Trusted service-to-service posture: presents the gateway's internal-service
 * token (when configured) + a SUPER_ADMIN/system identity, exactly like the other
 * internal cross-service calls (readAuthHeaders trusts these on the internal port).
 */
const TENANT_URL = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
const CANDIDATE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

function headers(tenantId: string, role: string): Record<string, string> {
  // readAuthHeaders REQUIRES X-User-Id + X-Tenant-Id + X-User-Role on every
  // authenticated internal route (all three or it 401s), even where the route
  // itself ignores the tenant (the super-admin tenant list). So we always send a
  // tenant header — the caller's own tenant for per-tenant reads, or a "system"
  // placeholder for the cross-tenant list (the SUPER_ADMIN list route ignores it).
  const h: Record<string, string> = {
    Accept: "application/json",
    "X-User-Id": "analytics-rollup",
    "X-Tenant-Id": tenantId,
    "X-User-Role": role,
  };
  if (INTERNAL_TOKEN) h["X-Internal-Service"] = INTERNAL_TOKEN;
  return h;
}

export interface TenantRef {
  id: string;
}

/**
 * Enumerate every tenant (paged) from tenant-service's super-admin list. The
 * rollup is a trusted cross-tenant background task, so it presents SUPER_ADMIN.
 * Returns [] on any error (the sweep then simply does nothing this tick — no
 * fabricated tenants).
 */
export async function listTenants(): Promise<TenantRef[]> {
  const out: TenantRef[] = [];
  const limit = 100;
  for (let page = 1; page <= 100; page++) {
    try {
      const url = `${TENANT_URL}/internal/tenants?page=${page}&limit=${limit}`;
      const res = await fetch(url, { headers: headers("system", "SUPER_ADMIN"), signal: AbortSignal.timeout(5000) });
      if (!res.ok) break;
      const body: any = await res.json().catch(() => null);
      const rows: any[] = Array.isArray(body?.data) ? body.data : [];
      for (const r of rows) if (typeof r?.id === "string") out.push({ id: r.id });
      const pages: number = typeof body?.pages === "number" ? body.pages : 1;
      if (page >= pages || rows.length === 0) break;
    } catch {
      break;
    }
  }
  return out;
}

/**
 * Real per-stage application counts for ONE tenant, from candidate-service's
 * overview (applicationsByStage = a live groupBy). Returns null on any read error
 * so the caller leaves this tenant's rollup untouched (never a fabricated 0-map).
 */
export async function fetchApplicationsByStage(tenantId: string): Promise<Record<string, number> | null> {
  try {
    const url = `${CANDIDATE_URL}/internal/candidates/overview`;
    // candidate-service overview is a recruiter/admin read; present ADMIN scoped to
    // the tenant (RLS on candidate-service keys off X-Tenant-Id).
    const res = await fetch(url, { headers: headers(tenantId, "ADMIN"), signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const body: any = await res.json().catch(() => null);
    const map = body?.data?.applicationsByStage;
    if (map && typeof map === "object") {
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(map)) if (typeof v === "number") out[k] = v;
      return out;
    }
    return null;
  } catch {
    return null;
  }
}
