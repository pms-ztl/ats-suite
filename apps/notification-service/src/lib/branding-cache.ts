/**
 * Tenant branding cache — fetches branding from tenant-service on cache miss,
 * caches the result for 60 seconds keyed on tenantId.
 *
 * Why a cache: the delivery worker is hot — every notification email
 * fetches branding. Without a cache that's one HTTP hop per email, and
 * branding rarely changes. 60s TTL = bounded staleness, no manual
 * invalidation needed.
 *
 * Why not Redis: the cache is small (one tenant = one row), per-pod
 * locality is fine, and falling back to a remote cache would just add
 * another network hop on the hot path.
 */
import { createLogger } from "@cdc-ats/common";
import type { TenantBranding } from "./mailer.js";

const logger = createLogger({ serviceName: "notification-service:branding-cache" });

interface CacheEntry {
  branding: TenantBranding;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry>();

const tenantServiceUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";

export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  const cached = cache.get(tenantId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.branding;
  }

  // Cache miss — fetch from tenant-service. On error, return the stale
  // cache if any, otherwise return empty so the email uses platform defaults.
  try {
    const url = `${tenantServiceUrl}/internal/branding`;
    const res = await fetch(url, {
      headers: {
        "x-tenant-id": tenantId,
        "x-user-id": "system",
        "x-user-role": "ADMIN",
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      logger.warn({ tenantId, status: res.status }, "branding fetch failed");
      return cached?.branding ?? {};
    }
    const body = (await res.json()) as any;
    const data = body.data ?? body;
    const branding: TenantBranding = {
      companyName: data.name,
      logoUrl: data.logoUrl,
      primaryColor: data.brandPrimaryColor,
      secondaryColor: data.brandSecondaryColor,
      website: data.website,
    };
    cache.set(tenantId, { branding, fetchedAt: Date.now() });
    return branding;
  } catch (err) {
    logger.warn({ tenantId, err }, "branding fetch error");
    return cached?.branding ?? {};
  }
}

/** Test seam — drop the cache (e.g. for unit tests). */
export function clearBrandingCache(): void {
  cache.clear();
}
