/**
 * Billing routes — called by gateway with X-Tenant-Id from JWT.
 *
 *   GET  /internal/usage?days=N
 *   GET  /internal/agents — list all agents with plan/kill-switch status
 *   POST /internal/agents/:type/toggle
 *   GET  /internal/check-resume-quota?count=N
 *   GET  /internal/check-agent?agentType=
 *   GET  /internal/plan-limits
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { PLAN_LIMITS, ALL_AGENT_TYPES, isPlanAgentEnabled, canParseMoreResumes } from "../lib/plan-limits.js";

const router = Router();

async function getTenantPlan(tenantId: string): Promise<string> {
  const cache = await prisma.tenantPlanCache.findUnique({ where: { tenantId } });
  return cache?.plan ?? "FREE";
}

// GET /internal/plan-limits
router.get("/plan-limits", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, { plans: PLAN_LIMITS, allAgents: ALL_AGENT_TYPES });
  } catch (err) { next(err); }
});

// GET /internal/usage?days=30
router.get("/usage", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const days = Math.min(Number(req.query["days"]) || 30, 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const runs = await prisma.agentRunCost.findMany({
      where: { tenantId, createdAt: { gte: since } },
    });

    let totalRuns = 0, totalTokensIn = 0, totalTokensOut = 0, totalCostUsd = 0;
    const byAgent = new Map<string, { runs: number; tokensIn: number; tokensOut: number; costUsd: number }>();
    for (const r of runs) {
      totalRuns += 1;
      totalTokensIn += r.tokensIn;
      totalTokensOut += r.tokensOut;
      totalCostUsd += Number(r.costUsd);
      const cur = byAgent.get(r.agentType) ?? { runs: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 };
      cur.runs += 1;
      cur.tokensIn += r.tokensIn;
      cur.tokensOut += r.tokensOut;
      cur.costUsd += Number(r.costUsd);
      byAgent.set(r.agentType, cur);
    }
    ok(res, {
      tenantId, days, totalRuns, totalTokensIn, totalTokensOut,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      byAgent: Array.from(byAgent.entries()).map(([agentType, v]) => ({
        agentType, ...v, costUsd: Number(v.costUsd.toFixed(4)),
      })),
    });
  } catch (err) { next(err); }
});

// GET /internal/agents — list agents with plan/kill-switch combined status
router.get("/agents", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const plan = await getTenantPlan(tenantId);
    const kills = await prisma.agentKillSwitch.findMany({ where: { tenantId } });
    const killMap = new Map(kills.map((k) => [k.agentType, k.disabled]));
    const agents = ALL_AGENT_TYPES.map((a) => {
      const planAllows = isPlanAgentEnabled(plan, a);
      const killed = killMap.get(a) ?? false;
      return { agentType: a, enabled: planAllows && !killed, planAllows, killSwitchDisabled: killed };
    });
    ok(res, { plan, planLimits: PLAN_LIMITS[plan], agents });
  } catch (err) { next(err); }
});

// POST /internal/agents/:type/toggle
const ToggleSchema = z.object({ enabled: z.boolean(), reason: z.string().optional() });
router.post("/agents/:type/toggle", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const agentType = req.params["type"] as string;
    const { enabled, reason } = ToggleSchema.parse(req.body);
    const plan = await getTenantPlan(tenantId);
    if (enabled && !isPlanAgentEnabled(plan, agentType)) {
      throw Errors.planLimit(`Agent '${agentType}' not included in plan ${plan}`);
    }
    await prisma.agentKillSwitch.upsert({
      where: { tenantId_agentType: { tenantId, agentType } },
      create: { tenantId, agentType, disabled: !enabled, reason: reason ?? null },
      update: { disabled: !enabled, reason: reason ?? null },
    });
    ok(res, { agentType, enabled });
  } catch (err) { next(err); }
});

// GET /internal/check-resume-quota?count=N — used by resume-service before
// accepting a bulk upload. Returns { allowed, used, limit }.
router.get("/check-resume-quota", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const count = Number(req.query["count"]) || 1;
    const plan = await getTenantPlan(tenantId);
    // Count this month's resume parses
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const used = await prisma.agentRunCost.count({
      where: { tenantId, agentType: "resume-parser", createdAt: { gte: monthStart } },
    });
    const allowed = canParseMoreResumes(plan, used, count);
    ok(res, { allowed, used, limit: PLAN_LIMITS[plan]?.resumesPerMonth ?? 0, plan });
  } catch (err) { next(err); }
});

// GET /internal/check-agent?agentType=
router.get("/check-agent", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const agentType = req.query["agentType"] as string | undefined;
    if (!agentType) throw Errors.validation("agentType query param required");
    const plan = await getTenantPlan(tenantId);
    const planAllows = isPlanAgentEnabled(plan, agentType);
    const killed = await prisma.agentKillSwitch.findUnique({
      where: { tenantId_agentType: { tenantId, agentType } },
    });
    ok(res, {
      allowed: planAllows && !(killed?.disabled ?? false),
      planAllows,
      killSwitchDisabled: killed?.disabled ?? false,
      plan,
    });
  } catch (err) { next(err); }
});

export default router;
