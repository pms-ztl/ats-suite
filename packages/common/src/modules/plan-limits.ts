/**
 * Plan limits, DERIVED from the module registry.
 *
 * This is a pure refactor of the three hand-maintained PLAN_LIMITS copies that
 * live in the services today:
 *   - apps/billing-service/src/lib/plan-limits.ts   (the canonical source)
 *   - apps/identity-service/src/lib/plan-limits.ts
 *   - (read paths in apps/billing-service/src/routes/billing.ts)
 *
 * The `agents` field of every plan is COMPUTED from MODULE_REGISTRY: an agent
 * module with `requiresPlan = X` contributes its billing agent name to plan X
 * and every plan above X. The other fields (seats, activeJobs, resumesPerMonth,
 * bulkUploadMax, customForms, configurableRounds) are not encoded in module
 * manifests — they are tenant quotas, so they are kept here as explicit data
 * (PLAN_QUOTAS), byte-equal to the canonical copies.
 *
 * EQUIVALENCE ASSERTION (verified against billing-service/src/lib/plan-limits.ts
 * at the time of writing — this MUST stay byte-equal; WF3-C5 replaces the three
 * in-service copies with imports of this file):
 *
 *   FREE.agents         === ["resume-parser"]
 *   STARTER.agents      === ["resume-parser", "candidate-screener", "interview-scheduler"]
 *   PROFESSIONAL.agents === "ALL"
 *   ENTERPRISE.agents   === "ALL"
 *
 *   and every numeric / boolean quota equal to the canonical value (see
 *   PLAN_QUOTAS below).
 *
 * Two registry agent-type names differ from the billing PLAN_LIMITS vocabulary
 * (the registry uses the ai-engine runtime AgentType union; PLAN_LIMITS /
 * ALL_AGENT_TYPES use the billing gate vocabulary). The mapping is applied so
 * the derived output matches the canonical strings exactly:
 *
 *   registry "scheduling"           -> billing "interview-scheduler"
 *   registry "candidate-experience" -> billing "candidate-assistant"
 *
 * Agent types that are not part of the billing gate vocabulary (e.g. the
 * interview-* helper agents contributed by the un-gated "interviews" feature
 * module, cover-letter-analyzer, etc.) are not plan-gated agents and are filtered
 * out of the derived `agents` list.
 *
 * This file is dependency-free at runtime (no zod, no prisma) so it can be
 * imported from any service or the frontend.
 */
import { MODULE_REGISTRY, MODULE_PLAN_ORDER } from "./registry.js";
import type { ModulePlan } from "./types.js";

/** Shape of one plan's limits. Mirrors the in-service PlanLimits interface. */
export interface PlanLimits {
  seats: number;
  activeJobs: number;
  resumesPerMonth: number;
  bulkUploadMax: number;
  agents: readonly string[] | "ALL";
  customForms: boolean;
  configurableRounds: boolean;
}

/**
 * The full set of plan-gated agent names, in the billing gate vocabulary.
 * Byte-equal to ALL_AGENT_TYPES in billing-service/src/lib/plan-limits.ts.
 * A plan whose derived agent set covers all of these collapses to "ALL"
 * (matching the canonical copies, which store "ALL" rather than the 12-element
 * array for PROFESSIONAL and ENTERPRISE).
 */
export const ALL_AGENT_TYPES = [
  "resume-parser", "candidate-screener", "jd-author",
  "interview-scheduler", "interview-kit", "interview-intelligence",
  "candidate-assistant", "sourcing", "offer", "analytics",
  "bias-auditor", "copilot",
  // WF7 — Online Assessments essay/long-form rubric grader. Gated by the
  // oa-assessments feature module (PROFESSIONAL+). Listed here so it shows in
  // the platform kill-switch / prompt-override / agent matrix. Note: since
  // oa-assessments is a `feature` (not `agent`) module, deriveAgentsForPlan does
  // not add it to the explicit FREE/STARTER lists (those stay byte-equal), and
  // PRO+ already collapse to "ALL" which covers oa-grader.
  "oa-grader",
] as const;

/**
 * Map a registry agentType (ai-engine runtime vocabulary) to its billing
 * PLAN_LIMITS agent name. Most are identical; only two differ. Returns
 * undefined for agent types that are not part of the billing gate vocabulary.
 */
const REGISTRY_TO_BILLING_AGENT: Record<string, string> = {
  scheduling: "interview-scheduler",
  "candidate-experience": "candidate-assistant",
};

const ALL_AGENT_SET = new Set<string>(ALL_AGENT_TYPES);

function toBillingAgent(registryAgentType: string): string | undefined {
  const mapped = REGISTRY_TO_BILLING_AGENT[registryAgentType] ?? registryAgentType;
  return ALL_AGENT_SET.has(mapped) ? mapped : undefined;
}

/**
 * The highest `requiresPlan` of any agent module in the registry. At or above
 * this plan, every plan-gated agent is available, so the plan's agent list
 * collapses to "ALL" (matching the canonical copies). Computed from the
 * registry rather than hard-coded so it tracks new high-tier agents.
 */
const MAX_AGENT_PLAN_RANK = MODULE_REGISTRY.reduce((max, mod) => {
  if (mod.type !== "agent" || !mod.requiresPlan) return max;
  const r = planRankStatic(mod.requiresPlan);
  return r > max ? r : max;
}, 0);

function planRankStatic(plan: string): number {
  const idx = MODULE_PLAN_ORDER.indexOf(plan as ModulePlan);
  return idx === -1 ? -1 : idx;
}

/**
 * Per-plan tenant quotas. These are NOT derivable from module manifests, so they
 * are kept as explicit data. Values are byte-equal to the canonical PLAN_LIMITS
 * copies in the services. The `agents` field is intentionally absent here — it
 * is derived from the registry by derivePlanLimits().
 */
const PLAN_QUOTAS: Record<ModulePlan, Omit<PlanLimits, "agents">> = {
  FREE: {
    seats: 1, activeJobs: 3, resumesPerMonth: 10, bulkUploadMax: 25,
    customForms: false, configurableRounds: false,
  },
  STARTER: {
    seats: 5, activeJobs: 20, resumesPerMonth: 500, bulkUploadMax: 100,
    customForms: true, configurableRounds: true,
  },
  PROFESSIONAL: {
    seats: 15, activeJobs: -1, resumesPerMonth: 5000, bulkUploadMax: 500,
    customForms: true, configurableRounds: true,
  },
  ENTERPRISE: {
    seats: -1, activeJobs: -1, resumesPerMonth: -1, bulkUploadMax: 1000,
    customForms: true, configurableRounds: true,
  },
};

/**
 * Derive the billing agent names available on `plan` from MODULE_REGISTRY.
 *
 * An agent module with `requiresPlan = X` contributes its (mapped, gate-vocab)
 * agentTypes to every plan at or above X. The result preserves registry order
 * and de-duplicates. At or above the highest agent `requiresPlan` (PROFESSIONAL
 * today) every plan-gated agent is available, so the list collapses to "ALL" —
 * which keeps PROFESSIONAL and ENTERPRISE byte-equal to the canonical "ALL".
 * (The interview-kit / interview-intelligence gate agents are contributed by the
 * un-gated "interviews" feature module rather than an agent module, so they are
 * present on every plan and never narrow the PRO+ set below "ALL".)
 */
function deriveAgentsForPlan(plan: ModulePlan): readonly string[] | "ALL" {
  const rank = planRankStatic(plan);

  // Plans at/above the top agent tier have every plan-gated agent -> "ALL".
  if (rank >= MAX_AGENT_PLAN_RANK) return "ALL";

  const seen = new Set<string>();
  const agents: string[] = [];
  for (const mod of MODULE_REGISTRY) {
    if (mod.type !== "agent") continue;
    // An agent with no requiresPlan is available on every plan (rank 0).
    const required = mod.requiresPlan ? planRankStatic(mod.requiresPlan) : 0;
    if (rank < required) continue;
    for (const at of mod.contributions.agentTypes ?? []) {
      const billing = toBillingAgent(at);
      if (!billing || seen.has(billing)) continue;
      seen.add(billing);
      agents.push(billing);
    }
  }
  return agents;
}

/**
 * Build the full PLAN_LIMITS object: each plan's quotas (PLAN_QUOTAS) merged
 * with its registry-derived `agents`. Keyed by plan string, matching the shape
 * the services consume today.
 */
export function derivePlanLimits(): Record<string, PlanLimits> {
  const out: Record<string, PlanLimits> = {};
  for (const plan of MODULE_PLAN_ORDER) {
    const q = PLAN_QUOTAS[plan];
    // Key order matches the canonical in-service copies exactly (agents sits
    // between bulkUploadMax and customForms) so the serialized shape is identical.
    out[plan] = {
      seats: q.seats,
      activeJobs: q.activeJobs,
      resumesPerMonth: q.resumesPerMonth,
      bulkUploadMax: q.bulkUploadMax,
      agents: deriveAgentsForPlan(plan),
      customForms: q.customForms,
      configurableRounds: q.configurableRounds,
    };
  }
  return out;
}

/**
 * The derived PLAN_LIMITS object. Byte-equal to the canonical in-service copies
 * (see the equivalence assertion in the file header). Frozen so consumers cannot
 * mutate the shared instance.
 */
export const PLAN_LIMITS: Record<string, PlanLimits> = Object.freeze(derivePlanLimits());

export function isUnlimited(n: number): boolean { return n === -1; }

export function isPlanAgentEnabled(plan: string, agentType: string): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return false;
  const allowed = limits.agents;
  if (allowed === "ALL") return true;
  return (allowed as readonly string[]).includes(agentType);
}

export function canParseMoreResumes(plan: string, monthCount: number, addingN = 1): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return false;
  const limit = limits.resumesPerMonth;
  if (isUnlimited(limit)) return true;
  return monthCount + addingN <= limit;
}

export function canAddSeats(plan: string, currentSeats: number, addingN = 1): boolean {
  const limits = PLAN_LIMITS[plan];
  if (!limits) return true;
  const limit = limits.seats;
  if (isUnlimited(limit)) return true;
  return currentSeats + addingN <= limit;
}
