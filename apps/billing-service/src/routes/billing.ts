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
import { ok, Errors, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
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

/**
 * Lightweight tenant overview — AI agent counters used by the dashboard.
 * Reads from the denormalized agentRunCost table fed by NATS subscribers.
 */
router.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Window for the spend sparkline: last 14 days (inclusive of today).
    const sparkDays = 14;
    const sparkSince = new Date(Date.now() - (sparkDays - 1) * 24 * 60 * 60 * 1000);
    sparkSince.setHours(0, 0, 0, 0);

    const [runsToday, totals, sparkRows] = await Promise.all([
      prisma.agentRunCost.count({
        where: { tenantId, createdAt: { gte: startOfToday } },
      }),
      prisma.agentRunCost.aggregate({
        where: { tenantId },
        _count: { _all: true },
        _sum: { tokensIn: true, tokensOut: true, costUsd: true },
      }),
      prisma.agentRunCost.findMany({
        where: { tenantId, createdAt: { gte: sparkSince } },
        select: { costUsd: true, createdAt: true },
      }),
    ]);

    // --- spendSparkline — total AI cost per local day over the last 14 days.
    // Real measured per-day spend; a 0 inside the window is a genuine "no runs
    // that day" (the day exists in range). Empty array only when there are no
    // rows in the window at all (frontend keeps its honest empty state then).
    const dayBuckets = new Map<string, number>();
    for (const r of sparkRows) {
      const d = r.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + Number(r.costUsd));
    }
    const spendSparkline: { label: string; cost: number }[] = [];
    if (sparkRows.length > 0) {
      for (let i = sparkDays - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        spendSparkline.push({
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          cost: Number((dayBuckets.get(key) ?? 0).toFixed(4)),
        });
      }
    }

    ok(res, {
      aiDecisionsToday: runsToday,
      totalAgentRuns: totals._count._all,
      totalTokensIn: totals._sum.tokensIn ?? 0,
      totalTokensOut: totals._sum.tokensOut ?? 0,
      totalCostUsd: Number(totals._sum.costUsd ?? 0),
      // --- additive: real per-day AI spend over the last 14 days (or [] = no data) ---
      spendSparkline,
    });
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

// Derive a provider label from the model name. Mirrors the bucketing the
// super-admin Models console uses so the trend lines up with that view.
function providerOf(modelName: string | null | undefined): string {
  const m = (modelName ?? "").toLowerCase();
  if (m.startsWith("claude") || m.includes("anthropic")) return "Anthropic";
  if (m.startsWith("llama") || m.includes("groq")) return "Groq";
  if (m.startsWith("gpt") || m.includes("openai")) return "OpenAI";
  if (m.startsWith("stub")) return "Stub";
  return "Other";
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// GET /internal/billing/spend-trend — AI cost over the last ~12 calendar months
// for the caller's tenant, totalled and broken down by provider. Shaped for a
// trend chart. Returns an empty trend when no AgentRunCost rows exist (the
// frontend keeps its honest empty-state rather than fabricating a line).
router.get("/spend-trend", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    // Start of the calendar month 11 months ago → a 12-month inclusive window.
    const now = new Date();
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

    const runs = await prisma.agentRunCost.findMany({
      where: { tenantId, createdAt: { gte: since } },
      select: { costUsd: true, modelName: true, createdAt: true },
    });

    // Bucket by calendar month (YYYY-MM, UTC), summing total + per-provider spend.
    const buckets = new Map<string, { total: number; byProvider: Record<string, number> }>();
    let totalSpend = 0;
    for (const r of runs) {
      const cost = Number(r.costUsd);
      totalSpend += cost;
      const d = r.createdAt;
      const month = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.get(month) ?? { total: 0, byProvider: {} };
      bucket.total += cost;
      const provider = providerOf(r.modelName);
      bucket.byProvider[provider] = (bucket.byProvider[provider] ?? 0) + cost;
      buckets.set(month, bucket);
    }

    const round = (n: number) => Number(n.toFixed(4));
    const trend = Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([month, b]) => ({
        month,
        label: MONTH_LABELS[Number(month.slice(5, 7)) - 1] ?? month,
        total: round(b.total),
        byProvider: Object.fromEntries(
          Object.entries(b.byProvider).map(([p, v]) => [p, round(v)]),
        ),
      }));

    ok(res, { trend, totalSpend: round(totalSpend) });
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
// Phase 27 — F-028-micro-P0: agent toggle is admin-only (defense-in-depth;
// gateway also gates /api/billing with auth, but tier-3 staff shouldn't
// be able to flip agents on/off for their tenant).
router.post("/agents/:type/toggle", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
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
    const [tenantKill, platformKill] = await Promise.all([
      prisma.agentKillSwitch.findUnique({
        where: { tenantId_agentType: { tenantId, agentType } },
      }),
      // Phase 21 — platform-wide kill switch trumps tenant settings.
      prisma.platformAgentKillSwitch.findUnique({ where: { agentType } }),
    ]);
    const tenantKillDisabled = tenantKill?.disabled ?? false;
    const platformKillDisabled = platformKill?.disabled ?? false;
    ok(res, {
      allowed: planAllows && !tenantKillDisabled && !platformKillDisabled,
      planAllows,
      killSwitchDisabled: tenantKillDisabled,
      platformKillDisabled,
      platformKillReason: platformKillDisabled ? platformKill?.reason ?? null : null,
      plan,
    });
  } catch (err) { next(err); }
});

// GET /internal/billing/limits — the caller tenant's plan + full limit set.
// Used by other services to enforce capability flags (customForms,
// configurableRounds) and numeric caps (activeJobs).
router.get("/limits", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const plan = await getTenantPlan(tenantId);
    ok(res, { plan, limits: PLAN_LIMITS[plan] ?? PLAN_LIMITS["FREE"] });
  } catch (err) { next(err); }
});

export default router;
