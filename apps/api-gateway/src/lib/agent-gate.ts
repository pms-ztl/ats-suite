/**
 * Agent plan-gate — blocks an agent invocation when the tenant's billing plan
 * (or a kill switch) does not include that agent. billing-service is the single
 * source of truth (GET /internal/check-agent); this middleware sits in front of
 * every agent route the gateway exposes. Because services now reject any request
 * that did not pass through the gateway (X-Internal-Service enforcement), gating
 * here cannot be bypassed by hitting an internal port directly.
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "@cdc-ats/common";
import { callService } from "./service-client.js";

// Short cache: plan + kill switches change rarely, so a few seconds of staleness
// is acceptable and avoids a billing round-trip on every agent invocation.
const cache = new Map<string, { allowed: boolean; exp: number }>();
const TTL_MS = 15_000;

export async function isAgentAllowed(req: Request, agentType: string): Promise<boolean> {
  const tenantId = req.user?.tenantId;
  if (!tenantId) return false;
  const key = `${tenantId}:${agentType}`;
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.allowed;
  try {
    const r = await callService<{ allowed: boolean }>("billing", {
      method: "GET",
      path: `/internal/billing/check-agent?agentType=${encodeURIComponent(agentType)}`,
      userHeaders: { userId: req.user!.id, tenantId, role: req.user!.role },
      timeoutMs: 3000,
    });
    const allowed = r?.allowed === true;
    cache.set(key, { allowed, exp: Date.now() + TTL_MS });
    return allowed;
  } catch {
    // Fail open on a billing outage — never hard-block a (possibly paying)
    // tenant because the billing service had a blip. Definitive "not allowed"
    // responses come back as allowed:false above, not as a thrown error.
    return true;
  }
}

export function requireAgentPlan(agentType: string): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Only agent-invoking writes are gated. Reads (GET/HEAD) on these mounts —
      // e.g. saved talent pools, past sourcing runs — stay available on any plan.
      if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
        return next();
      }
      if (!req.user?.tenantId) {
        return next(new AppError("UNAUTHORIZED", "Authentication required", 401));
      }
      const allowed = await isAgentAllowed(req, agentType);
      if (!allowed) {
        return next(new AppError(
          "PLAN_LIMIT",
          `The "${agentType}" agent is not included in your current plan. Upgrade to enable it.`,
          402,
        ));
      }
      next();
    } catch (err) { next(err); }
  };
}
