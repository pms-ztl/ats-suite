/**
 * WF4 (modular platform) — billing-service module resolver.
 *
 * billing-service is the single source of truth for module entitlement, the same
 * way it already is for AI agents (check-agent). This file is the module sibling
 * of routes/billing.ts check-agent: it computes a module's EFFECTIVE enabled
 * state as an AND-of-gates over REAL rows — never a hardcoded flag — and exposes
 * it to the gateway module-gate (requireModule) and the worker/subscriber gate
 * (@cdc-ats/common is-module-on / isModuleEnabled), which both call
 * GET /internal/billing/check-module?key=.
 *
 * Endpoints (all additive — mounted onto the SAME /internal/billing and
 * /internal/platform mount points app.ts already exposes; NO existing/proxied
 * route is touched):
 *
 *   tenantModulesRouter (mounted under /internal/billing):
 *     GET /check-module?key=   -> { enabled, reason, requiresPlan?, dependsOn? }
 *     GET /modules             -> { plan, modules: [{key,enabled,reason,requiresPlan}] }
 *     PUT /modules/:key        -> upsert TenantModule + publish module.toggled
 *
 *   platformModulesRouter (mounted under /internal/platform, super-admin):
 *     GET /modules             -> the platform ModuleRegistry catalog (prismaAdmin)
 *     PUT /modules/:key        -> upsert a ModuleRegistry catalog row
 *
 * Source of truth, highest-precedence first (a clone of check-agent's gate
 * stack, billing.ts ~248-273, extended with the module-specific gates):
 *   1. super-admin platform kill  (PlatformAgentKillSwitch on the module's
 *      agentTypes)  — trumps everything
 *   2. plan entitlement           (PLAN_LIMITS plan rank vs manifest requiresPlan)
 *   3. TenantModule explicit toggle (the override row) OR manifest defaultEnabled
 *      when there is no override row, AND no per-tenant AgentKillSwitch
 *   4. dependency satisfied       (every manifest dependency resolves enabled)
 *   5. manifest default           (the base value gate 3 starts from)
 *
 * Effective enabled IFF ALL gates pass. The WF1 MODULE_REGISTRY (getModule)
 * supplies the manifest (requiresPlan, defaultEnabled, dependencies, agentTypes,
 * failMode); the real TenantModule rows (RLS client) supply per-tenant overrides;
 * the ModuleRegistry table (prismaAdmin) is the platform catalog. We NEVER assume
 * enabled:true.
 *
 * Fail posture: this endpoint reads local DB only, so it does not itself fail
 * open/closed — it always returns a definitive answer. The fail-OPEN-for-soft /
 * fail-CLOSED-for-hard posture lives in the CALLERS (the gateway requireModule
 * and is-module-on), exactly like the agent-gate's fail-open lives in the gateway
 * not in check-agent. (See is-module-on.ts failOpenFor.)
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  ok, Errors, getTenantId, getUserId, requireTenantAdmin, requireSuperAdmin,
  MODULE_REGISTRY, MODULE_PLAN_ORDER, getModule,
  type ModuleManifest,
} from "@cdc-ats/common";
import { getNats } from "@cdc-ats/nats-client";
import { prisma, prismaAdmin } from "../lib/prisma.js";

const router = Router();

// NATS subject billing publishes on a module toggle so every module-gate cache
// (gateway requireModule + worker is-module-on) busts within one round-trip
// instead of waiting out its 15s TTL. MUST stay byte-equal to
// @cdc-ats/common MODULE_TOGGLED_SUBJECT ("module.toggled"), the literal the
// consumer subscribes to. Kept as a local const so this file has no import edge
// onto is-module-on (which pulls in ioredis).
const MODULE_TOGGLED_SUBJECT = "module.toggled";

/** Plan rank (FREE=0 … ENTERPRISE=3). -1 for an unknown plan string. */
function planRank(plan: string | null | undefined): number {
  return MODULE_PLAN_ORDER.indexOf((plan ?? "FREE") as (typeof MODULE_PLAN_ORDER)[number]);
}

/** Resolve the caller tenant's plan, same helper shape as billing.ts. */
async function getTenantPlan(tenantId: string): Promise<string> {
  const cache = await prismaAdmin.tenantPlanCache.findUnique({ where: { tenantId } });
  return cache?.plan ?? "FREE";
}

/** Does `plan` satisfy a manifest's requiresPlan? No requiresPlan = every plan. */
function planEntitles(plan: string, manifest: ModuleManifest): boolean {
  if (!manifest.requiresPlan) return true;
  return planRank(plan) >= planRank(manifest.requiresPlan);
}

// ── The resolved-state context, fetched ONCE per request and threaded into the
//    recursive resolver so a /modules call does not refetch per module. All rows
//    are REAL: TenantModule overrides (RLS client, tenant-scoped), the tenant +
//    platform kill switches (admin client — platform kills have no tenantId).
interface ResolveContext {
  plan: string;
  /** moduleKey -> TenantModule override (enabled flag). Missing = no override. */
  overrides: Map<string, boolean>;
  /** agentType -> tenant AgentKillSwitch.disabled. */
  tenantKills: Map<string, boolean>;
  /** agentType -> PlatformAgentKillSwitch.disabled (platform-wide). */
  platformKills: Map<string, boolean>;
}

async function loadContext(tenantId: string): Promise<ResolveContext> {
  const [plan, tenantModules, tenantKillRows, platformKillRows] = await Promise.all([
    getTenantPlan(tenantId),
    // RLS client — scoped to the caller's tenant.
    prisma.tenantModule.findMany({ where: { tenantId } }),
    prismaAdmin.agentKillSwitch.findMany({ where: { tenantId } }),
    prismaAdmin.platformAgentKillSwitch.findMany(),
  ]);
  return {
    plan,
    overrides: new Map(tenantModules.map((m) => [m.moduleKey, m.enabled])),
    tenantKills: new Map(tenantKillRows.map((k) => [k.agentType, k.disabled])),
    platformKills: new Map(platformKillRows.map((k) => [k.agentType, k.disabled])),
  };
}

interface ModuleState {
  enabled: boolean;
  reason: string;
  requiresPlan?: string;
  dependsOn?: string[];
}

/**
 * Resolve a single module's effective state against the loaded context. Pure
 * (no I/O) so /modules can resolve every key off one context load. Recurses into
 * dependencies (cycle-guarded by `seen`; the registry is already validated
 * acyclic by validateRegistry, this guard is belt-and-suspenders so a stray
 * cycle returns a definitive answer instead of looping).
 */
function resolveModule(key: string, ctx: ResolveContext, seen: Set<string> = new Set()): ModuleState {
  const manifest = getModule(key);
  // Gate 0 — unknown key. Not in the in-code registry => no manifest to gate on.
  if (!manifest) {
    return { enabled: false, reason: `Unknown module "${key}" (not in the module registry)` };
  }
  if (seen.has(key)) {
    // Dependency cycle (should be impossible post-validateRegistry). Fail the
    // gate definitively rather than recursing forever.
    return { enabled: false, reason: `Dependency cycle detected at "${key}"` };
  }
  seen.add(key);

  // Gate 1 (highest precedence) — super-admin platform kill on ANY of this
  // module's agent types. Trumps plan + toggle + default, mirroring check-agent
  // where platformKillDisabled overrides everything.
  const agentTypes = manifest.contributions.agentTypes ?? [];
  for (const at of agentTypes) {
    if (ctx.platformKills.get(at)) {
      return { enabled: false, reason: `Platform kill switch active for agent "${at}"` };
    }
  }

  // Gate 2 — plan entitlement. A module the plan does not include is off
  // regardless of any tenant override (you cannot opt into what you have not
  // paid for), matching check-agent's planAllows gate.
  if (!planEntitles(ctx.plan, manifest)) {
    return {
      enabled: false,
      reason: `Not included in plan ${ctx.plan} (requires ${manifest.requiresPlan})`,
      requiresPlan: manifest.requiresPlan,
    };
  }

  // Gate 3 — explicit TenantModule override, else the manifest default. An
  // override of `false` is an honest opt-out (off even though the plan allows it).
  const override = ctx.overrides.get(key);
  const baseOn = override !== undefined ? override : manifest.defaultEnabled;
  if (!baseOn) {
    return {
      enabled: false,
      reason: override === false
        ? "Disabled by tenant override"
        : "Off by default for this tenant",
      ...(manifest.requiresPlan ? { requiresPlan: manifest.requiresPlan } : {}),
    };
  }

  // Gate 3b — per-tenant AgentKillSwitch on ANY of this module's agent types.
  // Same precedence band as the toggle (it is a tenant-level "off"), mirroring
  // check-agent's tenantKillDisabled gate.
  for (const at of agentTypes) {
    if (ctx.tenantKills.get(at)) {
      return { enabled: false, reason: `Tenant kill switch active for agent "${at}"` };
    }
  }

  // Gate 4 — every dependency must itself resolve enabled. Collect the failing
  // deps so the caller (and the UI) can show what to turn on first.
  const blockedBy: string[] = [];
  for (const dep of manifest.dependencies) {
    const depState = resolveModule(dep.key, ctx, seen);
    if (!depState.enabled) blockedBy.push(dep.key);
  }
  if (blockedBy.length > 0) {
    return {
      enabled: false,
      reason: `Blocked by disabled dependenc${blockedBy.length === 1 ? "y" : "ies"}: ${blockedBy.join(", ")}`,
      dependsOn: blockedBy,
      ...(manifest.requiresPlan ? { requiresPlan: manifest.requiresPlan } : {}),
    };
  }

  // All gates passed.
  return {
    enabled: true,
    reason: override === true ? "Enabled by tenant override" : "Enabled (plan + default)",
    ...(manifest.requiresPlan ? { requiresPlan: manifest.requiresPlan } : {}),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tenant module routes (mounted under /internal/billing)
// ─────────────────────────────────────────────────────────────────────────────

// GET /internal/billing/check-module?key=  — the single-module resolver the
// gateway requireModule + the worker is-module-on call.
router.get("/check-module", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const key = req.query["key"] as string | undefined;
    if (!key) throw Errors.validation("key query param required");
    const ctx = await loadContext(tenantId);
    const state = resolveModule(key, ctx);
    ok(res, state);
  } catch (err) { next(err); }
});

// GET /internal/billing/modules  — the full resolved set for the caller tenant.
// Resolves every registered module off ONE context load.
router.get("/modules", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const ctx = await loadContext(tenantId);
    const modules = MODULE_REGISTRY.map((m) => {
      const state = resolveModule(m.key, ctx);
      return {
        key: m.key,
        enabled: state.enabled,
        reason: state.reason,
        ...(state.requiresPlan ? { requiresPlan: state.requiresPlan } : {}),
        ...(state.dependsOn ? { dependsOn: state.dependsOn } : {}),
      };
    });
    ok(res, { plan: ctx.plan, modules });
  } catch (err) { next(err); }
});

// PUT /internal/billing/modules/:key  — set a tenant's explicit override for a
// module + bust the gate caches. Admin-only (defense-in-depth like agent toggle).
// Returns 402 PLAN_LIMIT when enabling a module the plan does not entitle.
const ToggleSchema = z.object({
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional(),
});
router.put("/modules/:key", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const moduleKey = req.params["key"] as string;
    const { enabled, config } = ToggleSchema.parse(req.body);

    const manifest = getModule(moduleKey);
    if (!manifest) {
      throw Errors.validation(`Unknown module "${moduleKey}" (not in the module registry)`);
    }

    // You cannot enable a module your plan does not include — same 402 the agent
    // toggle throws (billing.ts ~217). Disabling is always allowed.
    if (enabled) {
      const plan = await getTenantPlan(tenantId);
      if (!planEntitles(plan, manifest)) {
        throw Errors.planLimit(
          `Module '${moduleKey}' not included in plan ${plan}${manifest.requiresPlan ? ` (requires ${manifest.requiresPlan})` : ""}`,
        );
      }
    }

    // Upsert the override on the RLS client (tenant-scoped). enabledAt records
    // the most recent enable for auditing; left untouched on a disable.
    await prisma.tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      create: {
        tenantId, moduleKey, enabled,
        config: (config ?? {}) as object,
        enabledAt: enabled ? new Date() : null,
        updatedBy: userId,
      },
      update: {
        enabled,
        ...(config !== undefined ? { config: config as object } : {}),
        ...(enabled ? { enabledAt: new Date() } : {}),
        updatedBy: userId,
      },
    });

    // D3a — fire-and-forget cache-bust signal. Core NATS publish (no JetStream
    // stream needed for an ephemeral bust); a NATS outage must NOT block the
    // toggle write, so it is wrapped + swallowed (fail-soft, like the rest of
    // the service's event emits). Payload is exactly { tenantId, moduleKey }.
    await publishModuleToggled(tenantId, moduleKey);

    ok(res, { moduleKey, enabled });
  } catch (err) { next(err); }
});

/**
 * Publish the module.toggled cache-bust signal. Best-effort: any failure
 * (NATS down, not connected) is swallowed — the cache entries still expire on
 * their 15s TTL, so a missed bust degrades to slightly-stale, never to a wedged
 * toggle. Uses raw core-NATS publish because the bust is ephemeral and does not
 * need JetStream persistence (and "module.toggled" is not on a JetStream
 * stream). Payload: { tenantId, moduleKey }.
 */
async function publishModuleToggled(tenantId: string, moduleKey: string): Promise<void> {
  try {
    const nats = getNats();
    nats.publish(
      MODULE_TOGGLED_SUBJECT,
      Buffer.from(JSON.stringify({ tenantId, moduleKey })),
    );
  } catch {
    // NATS not connected / publish failed — TTL expiry is the fallback bust.
  }
}

export const tenantModulesRouter = router;

// ─────────────────────────────────────────────────────────────────────────────
// Platform module catalog routes (mounted under /internal/platform, super-admin)
// ─────────────────────────────────────────────────────────────────────────────

const platformRouter = Router();

// GET /internal/platform/modules — the platform ModuleRegistry catalog. Returns
// the REAL ModuleRegistry rows (prismaAdmin), and ALSO surfaces the in-code
// MODULE_REGISTRY manifests so super-admin can see the full shipped catalog even
// for modules that have no DB row yet (the in-code registry mirrors what the
// catalog table should hold). `inCatalog` marks which keys are persisted.
platformRouter.get("/modules", requireSuperAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prismaAdmin.moduleRegistry.findMany({ orderBy: { key: "asc" } });
    const rowByKey = new Map(rows.map((r) => [r.key, r]));
    const catalog = MODULE_REGISTRY.map((m) => {
      const row = rowByKey.get(m.key);
      return {
        key: m.key,
        name: m.name,
        version: m.version,
        category: m.category,
        type: m.type,
        requiresPlan: m.requiresPlan ?? null,
        defaultEnabled: m.defaultEnabled,
        // Additive (WF9 I5 super-admin Modules console): the manifest's direct
        // dependency keys so the console can show each module's "depends on" set.
        // Purely a new field — existing consumers ignore it.
        dependencies: m.dependencies.map((d) => d.key),
        inCatalog: row !== undefined,
      };
    });
    ok(res, { registry: rows, catalog });
  } catch (err) { next(err); }
});

// PUT /internal/platform/modules/:key — upsert a ModuleRegistry catalog row,
// mirroring the in-code MODULE_REGISTRY manifest for that key. Super-admin only.
// The in-code manifest stays the source of truth for gating; this persists the
// catalog row (manifest snapshot) so it is queryable + a tenant can be toggled
// against it.
const CatalogUpsertSchema = z.object({
  defaultEnabled: z.boolean().optional(),
  requiresPlan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).nullable().optional(),
});
platformRouter.put("/modules/:key", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params["key"] as string;
    const manifest = getModule(key);
    if (!manifest) {
      throw Errors.validation(`Unknown module "${key}" (not in the module registry)`);
    }
    const body = CatalogUpsertSchema.parse(req.body ?? {});
    const defaultEnabled = body.defaultEnabled ?? manifest.defaultEnabled;
    const requiresPlan = body.requiresPlan !== undefined ? body.requiresPlan : (manifest.requiresPlan ?? null);

    const row = await prismaAdmin.moduleRegistry.upsert({
      where: { key },
      create: {
        key,
        name: manifest.name,
        version: manifest.version,
        category: manifest.category,
        type: manifest.type,
        requiresPlan,
        defaultEnabled,
        manifest: manifest as unknown as object,
      },
      update: {
        name: manifest.name,
        version: manifest.version,
        category: manifest.category,
        type: manifest.type,
        requiresPlan,
        defaultEnabled,
        manifest: manifest as unknown as object,
      },
    });
    ok(res, row);
  } catch (err) { next(err); }
});

export const platformModulesRouter = platformRouter;

export default router;
