/**
 * is-module-on — service-side module gate for BullMQ workers + NATS subscribers.
 *
 * Background workers (resume-parse, screening, delivery, retention-purge, ...) and
 * NATS subscribers do not pass through the API gateway, so they cannot rely on the
 * gateway's requireModule middleware to stop running when their owning module is
 * turned off for a tenant. This helper gives them the SAME effective-state answer
 * the gateway gets, so a worker can short-circuit (skip + ack the job) instead of
 * doing work for a disabled module.
 *
 * Mechanism (a deliberate clone of the proven gate stack):
 *   - Source of truth: billing-service GET /internal/billing/check-module?key=,
 *     the same endpoint the gateway's module-gate calls. billing computes the
 *     effective state from REAL rows (TenantModule overrides + ModuleRegistry +
 *     PLAN_LIMITS + the kill switches) AND-ed together — never a hardcoded flag.
 *   - Internal HTTP call mirrors screening-service/src/lib/service-client.ts:
 *     X-Tenant-Id / X-User-Id / X-User-Role headers + the X-Internal-Service
 *     token so the call is accepted by the service-token enforcement.
 *   - Cache: a short (TTL ~15s) cache keyed [tenantId, moduleKey], same staleness
 *     budget as the gateway agent-gate. When REDIS_URL is set the cache lives in
 *     Redis so the bust propagates across every worker pod; otherwise it falls
 *     back to an in-process Map (single-pod dev). The cached entry is busted when
 *     a `module.toggled` NATS event fires — the worker that already runs a NATS
 *     subscriber calls bustModuleCache() from that handler. (This package cannot
 *     import @cdc-ats/nats-client: nats-client depends on @cdc-ats/common, so
 *     importing it here would create a dependency cycle. Wiring the bust from the
 *     consumer's existing subscriber keeps common free of that edge.)
 *   - Fail posture: identical to the agent-gate. On any billing / Redis error we
 *     do NOT hard-block. SOFT modules (manifest failMode !== "closed") fail OPEN
 *     (return true). HARD modules (failMode === "closed", e.g. compliance,
 *     review-queue, oa-assessments, white-label-embed) fail CLOSED so a billing
 *     blip cannot silently expose a fail-closed surface. An unknown / unregistered
 *     key fails OPEN (treated soft) so a typo never wedges a worker.
 */
import { Redis } from "ioredis";
import { getModule } from "./registry.js";

/** NATS subject billing publishes on a module toggle. Workers subscribe to it
 * and call bustModuleCache(tenantId, moduleKey) from the handler. Exported so
 * the consumer and the publisher (billing) agree on the literal. */
export const MODULE_TOGGLED_SUBJECT = "module.toggled";

/** Cache TTL — matches the gateway agent-gate's 15s staleness budget. */
const TTL_MS = 15_000;
const TTL_SECONDS = 15;

/** Redis key namespace for a single [tenantId, moduleKey] cache entry. */
const CACHE_PREFIX = "module-gate";
function cacheKey(tenantId: string, moduleKey: string): string {
  return `${CACHE_PREFIX}:${tenantId}:${moduleKey}`;
}

const BILLING_URL = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

// ── Cache store: Redis when available, else an in-process Map ───────────────
let redis: Redis | null | undefined; // undefined = not yet initialised
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env["REDIS_URL"];
  if (!url) {
    redis = null; // no Redis configured — use the in-process fallback
    return redis;
  }
  try {
    redis = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: false });
    // Never let a Redis connection error crash the worker process; the helper
    // already degrades to the in-process cache + fail-open on read errors.
    redis.on("error", () => {});
  } catch {
    redis = null;
  }
  return redis;
}

const memCache = new Map<string, { enabled: boolean; exp: number }>();

export interface IsModuleEnabledOptions {
  /**
   * User id stamped on the internal call (audit only). Workers have no end user,
   * so this defaults to "system" like the other internal worker clients.
   */
  userId?: string;
  /** Bypass the cache and force a fresh billing read (e.g. right after a toggle). */
  skipCache?: boolean;
}

interface CheckModuleResult {
  enabled: boolean;
  reason?: string;
  requiresPlan?: string;
  dependsOn?: string[];
}

/**
 * Whether a soft module should fail OPEN. A module is "soft" unless its manifest
 * explicitly declares failMode: "closed". Unknown keys are treated as soft so a
 * typo never hard-blocks a worker. Mirrors the agent-gate's fail-open default.
 */
function failOpenFor(moduleKey: string): boolean {
  const manifest = getModule(moduleKey);
  if (!manifest) return true; // unknown -> treat as soft, fail open
  return manifest.failMode !== "closed";
}

/** Read the cached enabled flag (Redis first, then in-process). null = miss. */
async function readCache(tenantId: string, moduleKey: string): Promise<boolean | null> {
  const key = cacheKey(tenantId, moduleKey);
  const r = getRedis();
  if (r) {
    try {
      const v = await r.get(key);
      if (v === "1") return true;
      if (v === "0") return false;
      return null;
    } catch {
      // fall through to in-process cache on a Redis read error
    }
  }
  const hit = memCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.enabled;
  if (hit) memCache.delete(key);
  return null;
}

/** Write the enabled flag to the cache (Redis with TTL, plus in-process). */
async function writeCache(tenantId: string, moduleKey: string, enabled: boolean): Promise<void> {
  const key = cacheKey(tenantId, moduleKey);
  memCache.set(key, { enabled, exp: Date.now() + TTL_MS });
  const r = getRedis();
  if (r) {
    try {
      await r.set(key, enabled ? "1" : "0", "EX", TTL_SECONDS);
    } catch {
      // in-process cache already holds it; ignore Redis write failure
    }
  }
}

/** Internal call to billing check-module. Returns null on any error (caller
 * then applies the fail-open / fail-closed posture). Clones the screening
 * service-client call: 3s timeout + internal-service token + data unwrap. */
async function fetchCheckModule(
  tenantId: string,
  moduleKey: string,
  userId: string,
): Promise<CheckModuleResult | null> {
  const url = `${BILLING_URL}/internal/billing/check-module?key=${encodeURIComponent(moduleKey)}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
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
    const data = body?.data ?? body;
    if (data == null || typeof data.enabled !== "boolean") return null;
    return data as CheckModuleResult;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Resolve whether `moduleKey` is enabled for `tenantId`, the way the gateway
 * resolves it. Use this at the top of a worker/subscriber handler to short
 * circuit (skip + ack) when the owning module is off.
 *
 * Returns true/false. On a billing or cache error it applies the manifest's
 * fail posture (soft -> true, hard/closed -> false), never throwing, so a
 * dependency blip cannot crash the worker.
 */
export async function isModuleEnabled(
  tenantId: string,
  moduleKey: string,
  opts: IsModuleEnabledOptions = {},
): Promise<boolean> {
  if (!tenantId || !moduleKey) return failOpenFor(moduleKey);

  if (!opts.skipCache) {
    const cached = await readCache(tenantId, moduleKey);
    if (cached !== null) return cached;
  }

  const result = await fetchCheckModule(tenantId, moduleKey, opts.userId ?? "system");
  if (result === null) {
    // billing unreachable / malformed — do not hard-block soft modules.
    return failOpenFor(moduleKey);
  }

  await writeCache(tenantId, moduleKey, result.enabled);
  return result.enabled;
}

/**
 * Drop cached module-gate entries so the next isModuleEnabled() re-reads billing.
 * Call this from the worker's `module.toggled` NATS subscriber so a toggle takes
 * effect within one round-trip instead of waiting out the TTL.
 *
 *   bustModuleCache(tenantId, moduleKey) — bust one entry (the toggled module).
 *   bustModuleCache(tenantId)            — bust every module for one tenant.
 *   bustModuleCache()                    — bust everything (use sparingly).
 *
 * Returns the number of in-process entries cleared (Redis deletes are best
 * effort and not counted). Never throws.
 */
export async function bustModuleCache(tenantId?: string, moduleKey?: string): Promise<number> {
  // ── In-process cache ──
  let cleared = 0;
  if (tenantId && moduleKey) {
    if (memCache.delete(cacheKey(tenantId, moduleKey))) cleared = 1;
  } else {
    const prefix = tenantId ? `${CACHE_PREFIX}:${tenantId}:` : `${CACHE_PREFIX}:`;
    for (const key of [...memCache.keys()]) {
      if (key.startsWith(prefix)) {
        memCache.delete(key);
        cleared++;
      }
    }
  }

  // ── Redis cache (cross-pod) ──
  const r = getRedis();
  if (r) {
    try {
      if (tenantId && moduleKey) {
        await r.del(cacheKey(tenantId, moduleKey));
      } else {
        // Scan + delete the namespace (or one tenant's slice). SCAN avoids the
        // blocking KEYS command on a shared Redis.
        const match = tenantId ? `${CACHE_PREFIX}:${tenantId}:*` : `${CACHE_PREFIX}:*`;
        let cursor = "0";
        do {
          const [next, batch] = await r.scan(cursor, "MATCH", match, "COUNT", 200);
          cursor = next;
          if (batch.length > 0) await r.del(...batch);
        } while (cursor !== "0");
      }
    } catch {
      // in-process entries already cleared; ignore Redis errors
    }
  }

  return cleared;
}
