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
import { ok, created, Errors, getUserId, requireSuperAdmin } from "@cdc-ats/common";
import { publishEvent } from "@cdc-ats/nats-client";
// SUPER_ADMIN platform control plane — aggregates across all tenants, so it uses
// the admin (non-RLS) client.
import { prismaAdmin as prisma } from "../lib/prisma.js";
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

// Phase 27 — F-028-micro-P0: defense-in-depth super-admin guard. Gateway
// already mounts /api/super-admin/platform with requireSuperAdmin (see
// api-gateway/src/app.ts), but per-route guards mean if the gateway proxy
// is misconfigured downstream, the service still refuses.
router.put("/agents/:type", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentType = req.params["type"] as string;
    if (!ALL_AGENT_TYPES.includes(agentType as any)) {
      throw Errors.validation(`Unknown agentType: ${agentType}`);
    }
    const body = KillSchema.parse(req.body);
    const userId = getUserId(req) ?? null;

    // Phase 22 — only audit + alert when state actually changes. If
    // super-admin clicks the toggle that's already in the desired state
    // (or hits the API twice in a row), we don't want a duplicate audit row
    // or duplicate Slack alert.
    const prior = await prisma.platformAgentKillSwitch.findUnique({ where: { agentType } });
    const stateChanged = (prior?.disabled ?? false) !== body.disabled;

    // Upsert current-state row + (if changed) audit row in one transaction
    // so the live state never diverges from the audit log.
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.platformAgentKillSwitch.upsert({
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
      if (stateChanged) {
        await tx.platformKillAudit.create({
          data: {
            agentType,
            disabled: body.disabled,
            reason: body.reason ?? null,
            actorUserId: userId,
          },
        });
      }
      return result;
    });

    // Phase 22 — alert super-admin via NATS so notification-service can
    // dispatch to Slack + in-app feed. Fire-and-forget; the kill switch
    // is the source of truth, the notification is just informational.
    if (stateChanged) {
      publishEvent({
        subject: "platform.agent.kill-switch.toggled",
        type: "platform.agent.kill-switch.toggled",
        tenantId: null,
        payload: {
          agentType,
          disabled: body.disabled,
          reason: body.reason ?? null,
          actorUserId: userId,
          toggledAt: updated.updatedAt.toISOString(),
        },
      }).catch(() => { /* non-fatal — notification is best-effort */ });
    }

    ok(res, updated);
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/platform/audit?limit=100 ─────────────────────────────────
// Phase 22 — append-only audit of every platform kill switch toggle.
// Optional ?agentType= filter to scope to one agent's history.
router.get("/audit", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query["limit"]) || 100));
    const agentType = typeof req.query["agentType"] === "string" ? req.query["agentType"] : undefined;

    const rows = await prisma.platformKillAudit.findMany({
      where: agentType ? { agentType } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    ok(res, { audit: rows });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/platform/flags ───────────────────────────────────────────
// Cross-tenant feature-flag rollout view for the super-admin "Feature Flags"
// screen. FeatureFlag rows are per-tenant (tenantId, name, enabled); this
// collapses them by name into one row per flag with:
//   tenants = how many tenants have it ENABLED
//   roll    = rollout % = enabled tenants / total tenants (0-100)
//   on      = is the flag live anywhere (enabled for ≥1 tenant)
// Uses the admin (non-RLS) client because this is a platform-wide rollup.
//
// FeatureFlag has no description column, so `desc` is synthesized from a small
// known-label map (keeps parity with the designed copy) with a humanized
// fallback derived from the flag name.
const FLAG_DESCRIPTIONS: Record<string, string> = {
  customForms: "Custom application form builder",
  configurableRounds: "Configurable interview rounds",
  aiSourcing: "AI candidate sourcing",
  internalMobility: "Internal mobility engine",
  videoInterviews: "Native video interviews",
  copilotV3: "Copilot v3, grounded retrieval",
};

function humanizeFlagName(name: string): string {
  // camelCase / snake_case / kebab-case -> "Title Case words"
  const words = name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return name;
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

router.get("/flags", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [byNameEnabled, byNameTotal, tenantTotal] = await Promise.all([
      // Tenants with the flag ENABLED, grouped by flag name.
      prisma.featureFlag.groupBy({
        by: ["name"],
        where: { enabled: true },
        _count: { _all: true },
      }),
      // Every flag name that exists anywhere (so a flag rolled out to 0 tenants
      // still appears as an off/0% row instead of vanishing).
      prisma.featureFlag.groupBy({
        by: ["name"],
        _count: { _all: true },
      }),
      // Denominator for the rollout %: total tenants known to the platform
      // (mirrored into TenantPlanCache via NATS).
      prisma.tenantPlanCache.count(),
    ]);

    const enabledMap = new Map(byNameEnabled.map((r) => [r.name, r._count._all]));
    const denom = tenantTotal > 0 ? tenantTotal : 0;

    const flags = byNameTotal
      .map((r) => {
        const name = r.name;
        const enabledCount = enabledMap.get(name) ?? 0;
        const roll = denom > 0 ? Math.round((enabledCount / denom) * 100) : 0;
        return {
          n: name,
          desc: FLAG_DESCRIPTIONS[name] ?? humanizeFlagName(name),
          roll: Math.max(0, Math.min(100, roll)),
          on: enabledCount > 0,
          tenants: enabledCount,
        };
      })
      .sort((a, b) => b.tenants - a.tenants || a.n.localeCompare(b.n));

    ok(res, { flags });
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

router.put("/prompts/:type", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
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
router.post("/prompts/:type/rollback/:id", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
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
router.delete("/prompts/:type", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
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

// ─── GET /internal/platform/models ─────────────────────────────────────────
// Super-admin Models & Providers screen. Real per-provider + per-agent AI spend
// derived from AgentRunCost (last 30d): provider spend (grouped by the provider
// inferred from modelName) + per-agent model routing cost. Cross-tenant admin
// read. Empty if there has been no AI usage (console then keeps designed data).
router.get("/models", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const inferProvider = (model: string): string => {
      const lc = model.toLowerCase();
      if (lc.includes("stub")) return "Stub (local)";
      if (lc.includes("claude")) return "Anthropic";
      if (lc.includes("gpt") || lc.includes("o1") || lc.includes("o3")) return "OpenAI";
      if (lc.includes("llama") || lc.includes("groq")) return "Groq";
      if (lc.includes("gemini")) return "Google";
      if (lc.includes("mistral")) return "Mistral";
      return "OpenRouter";
    };

    const [byModel, byAgent] = await Promise.all([
      prisma.agentRunCost.groupBy({
        by: ["modelName"],
        where: { createdAt: { gte: since }, modelName: { not: null } },
        _sum: { costUsd: true },
        _avg: { latencyMs: true },
        _count: { _all: true },
      }),
      prisma.agentRunCost.groupBy({
        by: ["agentType", "modelName"],
        where: { createdAt: { gte: since } },
        _sum: { costUsd: true },
        _count: { _all: true },
      }),
    ]);

    // Providers — group real model spend by inferred provider.
    const provMap = new Map<string, { spend: number; models: Set<string>; latSum: number; latN: number }>();
    for (const r of byModel) {
      const model = String(r.modelName ?? "");
      if (!model) continue;
      const prov = inferProvider(model);
      const agg = provMap.get(prov) ?? { spend: 0, models: new Set<string>(), latSum: 0, latN: 0 };
      agg.spend += Number(r._sum.costUsd ?? 0);
      agg.models.add(model);
      const n = r._count._all || 0;
      agg.latSum += Number(r._avg.latencyMs ?? 0) * n;
      agg.latN += n;
      provMap.set(prov, agg);
    }
    const providers = Array.from(provMap.entries())
      .map(([n, a]) => {
        const models = Array.from(a.models);
        const modelStr = models.slice(0, 4).join(", ") + (models.length > 4 ? `, +${models.length - 4} more` : "");
        return {
          n,
          s: "connected",
          models: modelStr || "(no recent usage)",
          spend: Math.round(a.spend * 100) / 100,
          head: Math.max(20, 100 - Math.round(a.spend / 50)),
          lat: a.latN ? Math.round(a.latSum / a.latN) : 0,
        };
      })
      .sort((x, y) => y.spend - x.spend);

    // Routing — per agent, the top model by run count + total 30d cost.
    const agentMap = new Map<string, { models: Map<string, number>; cost: number }>();
    for (const r of byAgent) {
      const a = String(r.agentType ?? "");
      if (!a) continue;
      const entry = agentMap.get(a) ?? { models: new Map<string, number>(), cost: 0 };
      entry.cost += Number(r._sum.costUsd ?? 0);
      const m = String(r.modelName ?? "—");
      entry.models.set(m, (entry.models.get(m) ?? 0) + (r._count._all || 0));
      agentMap.set(a, entry);
    }
    const routing = Array.from(agentMap.entries())
      .map(([a, e]) => {
        const sorted = Array.from(e.models.entries()).sort((x, y) => y[1] - x[1]);
        return {
          a,
          p: sorted[0]?.[0] ?? "—",
          f: sorted[1]?.[0] ?? "—",
          cost: Math.round(e.cost * 100) / 100,
        };
      })
      .sort((x, y) => y.cost - x.cost);

    ok(res, { providers, routing });
  } catch (err) {
    next(err);
  }
});

export default router;
