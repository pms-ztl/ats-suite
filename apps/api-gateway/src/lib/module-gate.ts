/**
 * Module gate — the gateway analogue of agent-gate.ts, for the WF1 module
 * system. A requireModule(moduleKey) middleware blocks a request when the
 * tenant's resolved module state (TenantModule overrides + ModuleRegistry +
 * PLAN_LIMITS + kill switches, AND-ed by billing) does not include that module.
 *
 * billing-service is the single source of truth (GET /internal/billing/check-
 * module?key=); this middleware sits in front of FUTURE module-owned routes the
 * gateway will expose (WF7 / WF9). It is EXPORTED but, per WF4 scope, attached
 * to NO existing/proxied route — the frozen v1 demo surface stays byte-identical.
 *
 * It is a deliberate clone of the proven agent-gate stack:
 *   - same short (~15s) per-[tenantId, moduleKey] cache + staleness budget,
 *   - the SAME fail-soft posture on a billing outage: SOFT modules fail OPEN
 *     (manifest failMode !== "closed", same as the agent-gate never hard-blocks
 *     a possibly-paying tenant on a billing blip), while HARD modules
 *     (failMode === "closed", e.g. compliance / review-queue / oa-assessments /
 *     white-label-embed) fail CLOSED so a billing blip cannot silently expose a
 *     fail-closed surface.
 *     An unknown / unregistered key is treated as soft (fail OPEN) so a typo
 *     never wedges a route.
 *   - reads REAL rows via billing — the enabled flag is NEVER hardcoded.
 *
 * D3b: subscribes to the `module.toggled` NATS subject so a tenant/super-admin
 * toggle busts the cached entry within one round-trip instead of waiting out
 * the TTL. The subscription is best-effort (core NATS, ephemeral); a missed
 * bust just falls back to TTL expiry, consistent with the fail-soft design.
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError, getModule, MODULE_TOGGLED_SUBJECT } from "@cdc-ats/common";
import { getNats } from "@cdc-ats/nats-client";
import type { Logger } from "pino";
import { callService } from "./service-client.js";

// Short cache: module state changes rarely, so a few seconds of staleness is
// acceptable and avoids a billing round-trip on every gated request. Matches
// the agent-gate's 15s budget.
const cache = new Map<string, { result: CheckModuleResult; exp: number }>();
const TTL_MS = 15_000;

/** Shape returned by billing GET /internal/billing/check-module?key=. */
export interface CheckModuleResult {
  enabled: boolean;
  /** Machine-readable reason when !enabled, e.g. "DISABLED", "PLAN_LIMIT",
   *  "DEPENDENCY_DISABLED". Used to pick 404 vs 403. */
  reason?: string;
  /** The plan that would unlock the module, when blocked on plan. */
  requiresPlan?: string;
  /** Module keys this module depends on that are themselves disabled. */
  dependsOn?: string[];
}

function cacheKey(tenantId: string, moduleKey: string): string {
  return `${tenantId}:${moduleKey}`;
}

/**
 * Whether a module should fail OPEN on a billing error. Soft unless the manifest
 * explicitly declares failMode: "closed". Unknown keys are treated as soft so a
 * typo never hard-blocks a route. Mirrors the agent-gate's fail-open default and
 * is-module-on's failOpenFor.
 */
function failOpenFor(moduleKey: string): boolean {
  const manifest = getModule(moduleKey);
  if (!manifest) return true; // unknown -> treat as soft, fail open
  return manifest.failMode !== "closed";
}

/**
 * Resolve the effective module state for [tenantId, moduleKey] via billing,
 * with a short cache. On a billing outage this returns the manifest's fail
 * posture as a synthetic result (soft -> enabled:true; hard -> enabled:false
 * with reason "BILLING_UNAVAILABLE") rather than throwing, so a dependency blip
 * never crashes the gateway. Definitive "not enabled" answers come back as
 * enabled:false from billing, not as a thrown error.
 */
export async function resolveModule(req: Request, moduleKey: string): Promise<CheckModuleResult> {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return { enabled: false, reason: "UNAUTHORIZED" };
  const key = cacheKey(tenantId, moduleKey);
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.result;
  try {
    const r = await callService<CheckModuleResult>("billing", {
      method: "GET",
      path: `/internal/billing/check-module?key=${encodeURIComponent(moduleKey)}`,
      userHeaders: { userId: req.user!.id, tenantId, role: req.user!.role },
      timeoutMs: 3000,
    });
    const result: CheckModuleResult =
      r && typeof r.enabled === "boolean"
        ? r
        : { enabled: failOpenFor(moduleKey), reason: "BILLING_MALFORMED" };
    cache.set(key, { result, exp: Date.now() + TTL_MS });
    return result;
  } catch {
    // Fail open for SOFT modules on a billing outage — never hard-block a
    // (possibly paying) tenant because billing had a blip. HARD modules
    // (failMode: "closed") fail closed so a blip can't expose them. We do NOT
    // cache the fail-soft answer, so the next request re-checks billing.
    return failOpenFor(moduleKey)
      ? { enabled: true, reason: "BILLING_UNAVAILABLE" }
      : { enabled: false, reason: "BILLING_UNAVAILABLE" };
  }
}

/**
 * Convenience boolean wrapper around resolveModule (mirrors agent-gate's
 * isAgentAllowed). Exported for nav/widget filtering (e.g. GET /api/me/modules).
 */
export async function isModuleAllowed(req: Request, moduleKey: string): Promise<boolean> {
  const r = await resolveModule(req, moduleKey);
  return r.enabled === true;
}

/**
 * requireModule(moduleKey) — Express middleware that 404s (module surface
 * absent) or 402/403 (plan / dependency block) a request when the module is
 * disabled for the caller's tenant. EXPORTED for FUTURE module-owned routes
 * (WF7 / WF9); attached to NO existing route in WF4.
 *
 * Status selection:
 *   - reason PLAN_LIMIT          -> 402 (upgrade path, like the agent-gate)
 *   - otherwise (DISABLED / dep) -> 404 (the surface simply does not exist for
 *                                   this tenant; do not advertise it)
 */
export function requireModule(moduleKey: string): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user?.tenantId) {
        return next(new AppError("UNAUTHORIZED", "Authentication required", 401));
      }
      const result = await resolveModule(req, moduleKey);
      if (result.enabled) return next();
      const manifest = getModule(moduleKey);
      const label = manifest?.name ?? moduleKey;
      if (result.reason === "PLAN_LIMIT") {
        return next(new AppError(
          "PLAN_LIMIT",
          `The "${label}" module is not included in your current plan. Upgrade to enable it.`,
          402,
        ));
      }
      // Surface absent for this tenant — return 404 so a disabled module looks
      // like it does not exist (don't advertise a feature they can't reach).
      return next(new AppError(
        "MODULE_DISABLED",
        `The "${label}" module is not enabled for your account.`,
        404,
      ));
    } catch (err) { next(err); }
  };
}

/**
 * Drop cached module-gate entries so the next resolveModule() re-reads billing.
 *   bustModuleCache(tenantId, moduleKey) — bust one entry.
 *   bustModuleCache(tenantId)            — bust every module for one tenant.
 *   bustModuleCache()                    — bust everything.
 */
export function bustModuleCache(tenantId?: string, moduleKey?: string): void {
  if (tenantId && moduleKey) {
    cache.delete(cacheKey(tenantId, moduleKey));
    return;
  }
  const prefix = tenantId ? `${tenantId}:` : "";
  for (const key of [...cache.keys()]) {
    if (!prefix || key.startsWith(prefix)) cache.delete(key);
  }
}

// Decode a NATS message payload (Uint8Array of UTF-8 JSON) without importing the
// `nats` codec directly — the gateway only depends on @cdc-ats/nats-client, not
// the raw `nats` package, so we keep the dependency surface clean.
const textDecoder = new TextDecoder();
function decodeJson(data: Uint8Array): unknown {
  return JSON.parse(textDecoder.decode(data));
}

/**
 * D3b — subscribe to the `module.toggled` NATS subject and bust the matching
 * cache entry on each toggle. Best-effort: this is a core NATS (ephemeral)
 * subscription, so a missed message simply falls back to TTL expiry, consistent
 * with the gate's fail-soft posture. Call once from the gateway entry point
 * AFTER connectNats() has succeeded; a no-op (returns null) if NATS is down.
 */
export function subscribeModuleToggles(logger?: Logger): { stop: () => void } | null {
  let nats;
  try {
    nats = getNats();
  } catch {
    // NATS not connected (NATS_URL unset / connect failed). Toggles then take
    // effect within the TTL window. Non-fatal.
    return null;
  }
  const sub = nats.subscribe(MODULE_TOGGLED_SUBJECT);
  (async () => {
    for await (const msg of sub) {
      try {
        const envelope = decodeJson(msg.data) as {
          tenantId?: string | null;
          payload?: { tenantId?: string; moduleKey?: string; key?: string };
        };
        const payload = envelope?.payload ?? {};
        const tenantId = payload.tenantId ?? envelope?.tenantId ?? undefined;
        const moduleKey = payload.moduleKey ?? payload.key ?? undefined;
        bustModuleCache(tenantId ?? undefined, moduleKey);
      } catch {
        // A malformed toggle event must never break the subscription loop; the
        // affected entry just ages out via the TTL. Bust everything as a safe
        // fallback so a stale enabled flag can't linger past the next request.
        bustModuleCache();
      }
    }
  })().catch((err) => {
    logger?.warn?.({ err }, "module.toggled subscription loop ended");
  });
  return {
    stop: () => {
      sub.unsubscribe();
    },
  };
}
