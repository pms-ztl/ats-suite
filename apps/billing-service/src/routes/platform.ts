/**
 * Phase 21 — super-admin platform control plane.
 *
 * Three feature groups, served under /internal/platform/*:
 *
 *   GET    /agents                      — every agent's platform-wide state
 *   PUT    /agents/:type                — toggle kill switch
 *   GET    /cost?days=30                — cross-tenant cost rollup
 *   GET    /prompts                     — every agent's prompt-override state
 *   GET    /prompts/:type               — full override + version history
 *   PUT    /prompts/:type               — save new override version
 *   POST   /prompts/:type/rollback/:id  — flip an old version back to active
 *   DELETE /prompts/:type               — drop all overrides (revert to hardcoded)
 *
 * All routes assume the gateway has verified SUPER_ADMIN role and forwarded
 * X-User-Id. The role is enforced at the gateway via requireSuperAdmin —
 * within billing-service we just accept the headers as truth (services
 * trust the gateway in this architecture).
 *
 * No tenant context is required because these are platform-wide operations.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getUserId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { ALL_AGENT_TYPES } from "../lib/plan-limits.js";

const router = Router();

// ─── GET /internal/platform/agents ──────────────────────────────────────────
// Lists every agent with platform-wide kill state, total runs in last 30d,
// total cost, and per-tenant kill-switch count (so super-admin can see which
// agents are getting throttled at the tenant level even if globally enabled).
router.get("/agents", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [platformKills, tenantKillStats, runStats] = await Promise.all([
      prisma.platformAgentKillSwitch.findMany(),
      prisma.agentKillSwitch.groupBy({
        by: ["agentType"],
        where: { disabled: true },
        _count: { _all: true },
      }),
      prisma.agentRunCost.groupBy({
        by: ["agentType"],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        _sum: { costUsd: true, tokensIn: true, tokensOut: true },
      }),
    ]);

    const killMap = new Map(platformKills.map((k) => [k.agentType, k]));
    const tenantKillMap = new Map(tenantKillStats.map((s) => [s.agentType, s._count._all]));
    const runMap = new Map(runStats.map((s) => [s.agentType, s]));

    const agents = ALL_AGENT_TYPES.map((agentType) => {
      const kill = killMap.get(agentType);
      const stats = runMap.get(agentType);
      return {
        agentType,
        platformKillDisabled: kill?.disabled ?? false,
        platformKillReason: kill?.reason ?? null,
        platformKillUpdatedAt: kill?.updatedAt?.toISOString() ?? null,
        platformKillUpdatedByUserId: kill?.updatedByUserId ?? null,
        tenantsWithKillSwitch: tenantKillMap.get(agentType) ?? 0,
        runs30d: stats?._count._all ?? 0,
        costUsd30d: Number(stats?._sum.costUsd ?? 0),
        tokensIn30d: stats?._sum.tokensIn ?? 0,
        tokensOut30d: stats?._sum.tokensOut ?? 0,
      };
    });

    ok(res, { agents, periodDays: 30 });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/platform/agents/:type ────────────────────────────────────
const KillSchema = z.object({
  disabled: z.boolean(),
  reason: z.string().max(500).optional(),
});

router.put("/agents/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentType = req.params["type"] as string;
    if (!ALL_AGENT_TYPES.includes(agentType as any)) {
      throw Errors.validation(`Unknown agentType: ${agentType}`);
    }
    const body = KillSchema.parse(req.body);
    const userId = getUserId(req) ?? null;

    const updated = await prisma.platformAgentKillSwitch.upsert({
      where: { agentType },
      create: {
        agentType,
        disabled: body.disabled,
        reason: body.reason ?? null,
        updatedByUserId: userId,
      },
      update: {
        disabled: body.disabled,
        reason: body.reason ?? null,
        updatedByUserId: userId,
      },
    });

    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/platform/cost?days=30&groupBy=tenant|agent ───────────────
// Cross-tenant cost rollup. Returns aggregates suitable for the super-admin
// "who's spending what" dashboard.
router.get("/cost", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query["days"]) || 30));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [byTenant, byAgent, byDay, totals] = await Promise.all([
      // Per-tenant rollup
      prisma.agentRunCost.groupBy({
        by: ["tenantId"],
        where: { createdAt: { gte: since } },
        _sum: { costUsd: true, tokensIn: true, tokensOut: true },
        _count: { _all: true },
      }),
      // Per-agent-type rollup
      prisma.agentRunCost.groupBy({
        by: ["agentType"],
        where: { createdAt: { gte: since } },
        _sum: { costUsd: true },
        _count: { _all: true },
      }),
      // Time-series for the trend chart: cost per day across all tenants
      prisma.$queryRaw<Array<{ day: Date; cost: number; runs: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS day,
               COALESCE(SUM("costUsd"), 0)::float AS cost,
               COUNT(*) AS runs
        FROM "AgentRunCost"
        WHERE "createdAt" >= ${since}
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.agentRunCost.aggregate({
        where: { createdAt: { gte: since } },
        _sum: { costUsd: true, tokensIn: true, tokensOut: true },
        _count: { _all: true },
      }),
    ]);

    // Enrich per-tenant with plan from TenantPlanCache (already mirrored).
    const tenantIds = byTenant.map((r) => r.tenantId);
    const planCache = await prisma.tenantPlanCache.findMany({
      where: { tenantId: { in: tenantIds } },
      select: { tenantId: true, plan: true },
    });
    const planMap = new Map(planCache.map((p) => [p.tenantId, p.plan]));

    ok(res, {
      periodDays: days,
      totals: {
        runs: totals._count._all,
        costUsd: Number(totals._sum.costUsd ?? 0),
        tokensIn: totals._sum.tokensIn ?? 0,
        tokensOut: totals._sum.tokensOut ?? 0,
      },
      byTenant: byTenant
        .map((r) => ({
          tenantId: r.tenantId,
          plan: planMap.get(r.tenantId) ?? "UNKNOWN",
          runs: r._count._all,
          costUsd: Number(r._sum.costUsd ?? 0),
          tokensIn: r._sum.tokensIn ?? 0,
          tokensOut: r._sum.tokensOut ?? 0,
        }))
        .sort((a, b) => b.costUsd - a.costUsd),
      byAgent: byAgent
        .map((r) => ({
          agentType: r.agentType,
          runs: r._count._all,
          costUsd: Number(r._sum.costUsd ?? 0),
        }))
        .sort((a, b) => b.costUsd - a.costUsd),
      byDay: byDay.map((r) => ({
        day: r.day.toISOString().slice(0, 10),
        costUsd: r.cost,
        runs: Number(r.runs),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/platform/prompts ─────────────────────────────────────────
// Lists every agent + its currently-active override row (or null if none).
router.get("/prompts", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const active = await prisma.promptOverride.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const map = new Map(active.map((p) => [p.agentType, p]));
    const prompts = ALL_AGENT_TYPES.map((agentType) => ({
      agentType,
      override: map.get(agentType) ?? null,
    }));
    ok(res, { prompts });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/platform/prompts/:type ───────────────────────────────────
// Full active override + version history. Hits two queries; cheap.
router.get("/prompts/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentType = req.params["type"] as string;
    if (!ALL_AGENT_TYPES.includes(agentType as any)) throw Errors.validation(`Unknown agentType: ${agentType}`);

    const [active, history] = await Promise.all([
      prisma.promptOverride.findFirst({
        where: { agentType, isActive: true },
      }),
      prisma.promptOverride.findMany({
        where: { agentType, isActive: false },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    ok(res, { agentType, active, history });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/platform/prompts/:type ───────────────────────────────────
const UpsertPromptSchema = z.object({
  systemPrompt: z.string().min(10).max(20_000).nullable().optional(),
  modelName: z.string().min(1).max(100).nullable().optional(),
  temperature: z.number().min(0).max(2).nullable().optional(),
  notes: z.string().max(500).optional(),
});

router.put("/prompts/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentType = req.params["type"] as string;
    if (!ALL_AGENT_TYPES.includes(agentType as any)) throw Errors.validation(`Unknown agentType: ${agentType}`);
    const body = UpsertPromptSchema.parse(req.body);
    const userId = getUserId(req) ?? null;

    // Find the latest version number for this agent so we can increment.
    const latest = await prisma.promptOverride.findFirst({
      where: { agentType },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    // Two-step in a transaction so the unique-active-per-agentType index
    // never sees two active rows at once:
    //   1) flip all existing active rows to inactive
    //   2) insert the new row as active
    const created = await prisma.$transaction(async (tx) => {
      await tx.promptOverride.updateMany({
        where: { agentType, isActive: true },
        data: { isActive: false },
      });
      return tx.promptOverride.create({
        data: {
          agentType,
          systemPrompt: body.systemPrompt ?? null,
          modelName: body.modelName ?? null,
          temperature: body.temperature ?? null,
          version: nextVersion,
          isActive: true,
          notes: body.notes ?? null,
          createdByUserId: userId,
        },
      });
    });

    ok(res, created);
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/platform/prompts/:type/rollback/:id ─────────────────────
// Flip an old version back to active. Increments version so it shows as
// a new entry in the timeline (not a destructive change).
router.post("/prompts/:type/rollback/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentType = req.params["type"] as string;
    const id = req.params["id"] as string;
    const userId = getUserId(req) ?? null;

    const source = await prisma.promptOverride.findUnique({ where: { id } });
    if (!source || source.agentType !== agentType) throw Errors.notFound("Prompt version");

    const latest = await prisma.promptOverride.findFirst({
      where: { agentType },
      orderBy: { version: "desc" },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    const created = await prisma.$transaction(async (tx) => {
      await tx.promptOverride.updateMany({
        where: { agentType, isActive: true },
        data: { isActive: false },
      });
      return tx.promptOverride.create({
        data: {
          agentType,
          systemPrompt: source.systemPrompt,
          modelName: source.modelName,
          temperature: source.temperature,
          version: nextVersion,
          isActive: true,
          notes: `Rollback to v${source.version}` + (source.notes ? ` — ${source.notes}` : ""),
          createdByUserId: userId,
        },
      });
    });

    ok(res, created);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /internal/platform/prompts/:type ────────────────────────────────
// Revert to hardcoded defaults — deactivate any active override but keep the
// history rows so super-admin can re-activate later.
router.delete("/prompts/:type", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentType = req.params["type"] as string;
    await prisma.promptOverride.updateMany({
      where: { agentType, isActive: true },
      data: { isActive: false },
    });
    ok(res, { reverted: agentType });
  } catch (err) {
    next(err);
  }
});

export default router;
