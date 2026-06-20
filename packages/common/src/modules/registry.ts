/**
 * Canonical, in-code module registry.
 *
 * This is the single source of truth for what the ATS can do. Every manifest
 * here describes a REAL module — derived from:
 *   - the live agent types in @cdc-ats/ai-engine (runtime.ts AgentType union),
 *   - the plan gating in billing-service (PLAN_LIMITS),
 *   - the cd-shell navigation (components/cd/cd-shell.tsx NAV),
 *   - the gateway agent routes (api-gateway src/app.ts).
 *
 * No fictional features are invented. New product surfaces that are part of
 * this enterprise build (custom dashboards, white-label embed, the OA platform)
 * are included because they are real, planned modules consumed by later
 * workflows; they are marked defaultEnabled:false / plan-gated where they are
 * not yet generally available.
 *
 * Registry integrity (no dependency cycles, no missing deps) is enforced by
 * validateRegistry, which the consuming workflows call at startup.
 */
import type { ModuleManifest } from "./types.js";

// Role keys match the cd-shell ROLE_MAP lowercase values.
const ADMIN_RECRUITER_HM = ["admin", "recruiter", "hiring_manager"];

export const MODULE_REGISTRY: ModuleManifest[] = [
  // ---- Core hiring (the base every tenant gets) -------------------------
  {
    key: "core-hiring",
    name: "Core Hiring",
    version: "1.0.0",
    category: "hiring",
    type: "feature",
    defaultEnabled: true,
    dependencies: [],
    capabilities: ["requisitions", "candidates", "applications", "pipeline", "decisions"],
    permissions: ["requisition:read", "requisition:write", "candidate:read", "candidate:write"],
    contributions: {
      nav: [
        { label: "Candidates", href: "/candidates", roles: ADMIN_RECRUITER_HM },
        { label: "Requisitions", href: "/requisitions", roles: ADMIN_RECRUITER_HM },
        { label: "Decisions", href: "/decisions", roles: ADMIN_RECRUITER_HM },
      ],
      routes: ["/candidates", "/requisitions", "/decisions"],
      widgets: ["pipeline-funnel", "open-requisitions", "recent-candidates"],
      gatewayRoutes: ["/api/candidates", "/api/requisitions", "/api/job-postings", "/api/public"],
      natsSubjects: ["candidate.created", "application.created", "requisition.updated"],
    },
    // SOFT (open): core-hiring is the base every tenant gets (no requiresPlan,
    // defaultEnabled) and is NOT billing-sensitive. A billing-service blip must
    // never lock every tenant out of the core product, so it fails OPEN.
    failMode: "open",
  },

  // ---- AI agents (each maps to a real ai-engine AgentType) --------------
  {
    key: "resume-parser",
    name: "Resume Parser",
    version: "1.0.0",
    category: "intelligence",
    type: "agent",
    requiresPlan: "FREE",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["resume-extraction", "resume-normalization", "candidate-enrichment"],
    permissions: ["agent:resume-parser:run"],
    contributions: {
      agentTypes: ["resume-parser"],
      workers: ["resume-parse"],
      natsSubjects: ["resume.parsed"],
    },
    // SOFT (open): an AI agent on a billing blip should keep working for a
    // (possibly paying) tenant rather than hard-fail; not governance.
    failMode: "open",
  },
  {
    key: "ai-screening",
    name: "AI Screening",
    version: "1.0.0",
    category: "hiring",
    type: "agent",
    requiresPlan: "STARTER",
    defaultEnabled: true,
    dependencies: [
      { key: "core-hiring", range: "^1.0.0" },
      { key: "resume-parser", range: "^1.0.0" },
    ],
    capabilities: ["candidate-screening", "requirement-evidence", "score-verdict"],
    permissions: ["agent:candidate-screener:run"],
    contributions: {
      nav: [{ label: "Screening", href: "/screening", roles: ADMIN_RECRUITER_HM }],
      routes: ["/screening"],
      widgets: ["screening-verdicts"],
      gatewayRoutes: ["/api/screening"],
      agentTypes: ["candidate-screener"],
      workers: ["screening"],
      natsSubjects: ["screening.completed"],
    },
    // SOFT (open): an AI agent; not governance. Fails open on a billing blip.
    failMode: "open",
  },
  {
    key: "ai-sourcing",
    name: "AI Sourcing",
    version: "1.0.0",
    category: "hiring",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["candidate-sourcing", "outreach-suggestions"],
    permissions: ["agent:sourcing:run"],
    contributions: {
      nav: [{ label: "Sourcing", href: "/sourcing", roles: ["admin", "recruiter"] }],
      routes: ["/sourcing"],
      gatewayRoutes: ["/api/sourcing"],
      agentTypes: ["sourcing"],
    },
    // SOFT (open): an AI agent; not governance. Fails open on a billing blip.
    failMode: "open",
  },
  {
    key: "jd-author",
    name: "JD Author",
    version: "1.0.0",
    category: "hiring",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["jd-generation", "requirements-capture"],
    permissions: ["agent:jd-author:run"],
    contributions: {
      gatewayRoutes: ["/api/jd-author"],
      agentTypes: ["jd-author"],
    },
    // SOFT (open): an AI agent; not governance. Fails open on a billing blip.
    failMode: "open",
  },
  {
    key: "copilot",
    name: "Recruiting Copilot",
    version: "1.0.0",
    category: "intelligence",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["conversational-assist", "task-suggestions"],
    permissions: ["agent:copilot:run"],
    contributions: {
      nav: [{ label: "Copilot", href: "/copilot", roles: ADMIN_RECRUITER_HM }],
      routes: ["/copilot"],
      gatewayRoutes: ["/api/copilot"],
      agentTypes: ["copilot"],
    },
    // SOFT (open): an AI agent; not governance. Fails open on a billing blip.
    failMode: "open",
  },
  {
    key: "analytics",
    name: "Analytics & Insights",
    version: "1.0.0",
    category: "intelligence",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["hiring-analytics", "metric-rollups", "narrative-insights"],
    permissions: ["agent:analytics:run", "analytics:read"],
    contributions: {
      nav: [{ label: "Analytics", href: "/analytics", roles: ["admin", "recruiter", "hiring_manager", "compliance_officer"] }],
      routes: ["/analytics"],
      widgets: ["time-to-hire", "funnel-conversion", "source-effectiveness"],
      gatewayRoutes: ["/api/analytics", "/api/reporting"],
      agentTypes: ["analytics"],
    },
    // SOFT (open): an AI insights agent (intelligence category), not governance.
    // Read-mostly; fails open on a billing blip.
    failMode: "open",
  },
  {
    key: "compliance",
    name: "Compliance & Bias Audit",
    version: "1.0.0",
    category: "governance",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [
      { key: "core-hiring", range: "^1.0.0" },
      { key: "ai-screening", range: "^1.0.0" },
    ],
    capabilities: ["bias-audit", "eeoc-reporting", "gdpr-dsr", "adverse-impact"],
    permissions: ["agent:bias-auditor:run", "compliance:read"],
    contributions: {
      nav: [{ label: "Compliance", href: "/compliance", roles: ["admin", "compliance_officer"] }],
      routes: ["/compliance"],
      gatewayRoutes: ["/api/bias-auditor"],
      agentTypes: ["bias-auditor"],
    },
    // HARD (closed): governance + legally sensitive (bias audit, EEOC, GDPR DSR
    // erasure). A billing outage must NOT silently grant access to compliance
    // surfaces, so it fails CLOSED.
    failMode: "closed",
  },

  // ---- Interview lifecycle ---------------------------------------------
  {
    key: "interviews",
    name: "Interviews",
    version: "1.0.0",
    category: "hiring",
    type: "feature",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["interview-rounds", "interview-kits", "scorecards", "interview-intelligence"],
    permissions: ["interview:read", "interview:write"],
    contributions: {
      nav: [{ label: "Interviews", href: "/interviews", roles: ["admin", "recruiter", "hiring_manager", "interviewer"] }],
      routes: ["/interviews"],
      widgets: ["upcoming-interviews"],
      gatewayRoutes: ["/api/interviews", "/api/rounds", "/api/interview-intelligence"],
      agentTypes: ["interview-kit", "interview-intelligence", "interview-questions"],
      natsSubjects: ["interview.scheduled", "interview.completed"],
    },
    // SOFT (open): a hiring feature with no plan gate; not billing-sensitive and
    // not governance. A billing blip should not block interview scheduling.
    failMode: "open",
  },
  {
    key: "scheduling",
    name: "Interview Scheduling",
    version: "1.0.0",
    category: "hiring",
    type: "agent",
    requiresPlan: "STARTER",
    defaultEnabled: true,
    dependencies: [{ key: "interviews", range: "^1.0.0" }],
    capabilities: ["auto-scheduling", "availability-matching"],
    permissions: ["agent:interview-scheduler:run"],
    contributions: {
      nav: [{ label: "Scheduling", href: "/scheduling", roles: ADMIN_RECRUITER_HM }],
      routes: ["/scheduling"],
      gatewayRoutes: ["/api/scheduling"],
      agentTypes: ["scheduling"],
    },
    // SOFT (open): an AI agent; not governance. Fails open on a billing blip.
    failMode: "open",
  },
  {
    key: "offers",
    name: "Offers",
    version: "1.0.0",
    category: "hiring",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["offer-generation", "offer-approval", "comp-modeling"],
    permissions: ["offer:read", "offer:write", "agent:offer:run"],
    contributions: {
      nav: [{ label: "Offers", href: "/offers", roles: ADMIN_RECRUITER_HM }],
      routes: ["/offers"],
      widgets: ["pending-offers"],
      gatewayRoutes: ["/api/offers", "/api/offer"],
      agentTypes: ["offer"],
    },
    // SOFT (open): a paid hiring agent like jd-author / sourcing / copilot (all
    // open). Plan entitlement is still enforced by the resolver's plan gate when
    // billing is REACHABLE; this only governs the billing-OUTAGE posture, where
    // an agent surface fails open. Not governance, not the named closed set.
    failMode: "open",
  },
  {
    key: "candidate-experience",
    name: "Candidate Experience Assistant",
    version: "1.0.0",
    category: "intelligence",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: true,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["candidate-assist", "cover-letter-analysis", "applicant-messaging"],
    permissions: ["agent:candidate-assistant:run"],
    contributions: {
      gatewayRoutes: ["/api/candidate-experience"],
      agentTypes: ["candidate-experience", "cover-letter-analyzer"],
    },
    // SOFT (open): an AI agent; not governance. Fails open on a billing blip.
    failMode: "open",
  },

  // ---- Platform capabilities -------------------------------------------
  {
    key: "billing",
    name: "Billing & Plans",
    version: "1.0.0",
    category: "platform",
    type: "capability",
    defaultEnabled: true,
    dependencies: [],
    capabilities: ["plan-management", "invoicing", "usage-metering", "plan-gating"],
    permissions: ["billing:read", "billing:write"],
    contributions: {
      nav: [{ label: "Billing & Plan", href: "/billing", roles: ["admin"] }],
      routes: ["/billing"],
      gatewayRoutes: ["/api/billing"],
      natsSubjects: ["plan.changed"],
    },
    // SOFT (open): the billing module surface itself is not governance and is not
    // in the named closed set. If billing is unreachable the route fails open to
    // the (degraded) plan view; any write still hits the down service and fails
    // there. Failing this closed would needlessly hide plan management on a blip.
    failMode: "open",
  },
  {
    key: "review-queue",
    name: "Human Review Queue",
    version: "1.0.0",
    category: "governance",
    type: "feature",
    defaultEnabled: true,
    dependencies: [{ key: "ai-screening", range: "^1.0.0" }],
    capabilities: ["hitl-checkpoints", "manual-override", "reason-codes"],
    permissions: ["hitl:read", "hitl:write"],
    contributions: {
      nav: [{ label: "Review Queue", href: "/hitl", roles: ["admin", "hiring_manager", "compliance_officer"] }],
      routes: ["/hitl"],
      widgets: ["review-queue-count"],
      gatewayRoutes: ["/api/hitl"],
    },
    // HARD (closed): governance. This is the human-in-the-loop review queue that
    // backs the GDPR Art.22 "no solely-automated decision" guarantee; a billing
    // blip must NOT silently disable human oversight, so it fails CLOSED.
    failMode: "closed",
  },

  // ---- New enterprise-build modules (consumed by later WFs) -------------
  {
    key: "oa-assessments",
    name: "Online Assessments",
    version: "1.0.0",
    category: "hiring",
    type: "feature",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: false,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["assessment-authoring", "candidate-testing", "auto-grading", "proctoring"],
    permissions: ["assessment:read", "assessment:write", "assessment:grade"],
    contributions: {
      nav: [{ label: "Assessments", href: "/assessments", roles: ADMIN_RECRUITER_HM }],
      routes: ["/assessments"],
      widgets: ["assessment-results"],
      gatewayRoutes: ["/api/assessments"],
      natsSubjects: ["assessment.submitted", "assessment.graded"],
      // WF7 — the essay/long-form rubric grader (Judge0 handles code; this
      // handles prose). Plan-gated via the oa-assessments module (PROFESSIONAL+).
      agentTypes: ["oa-grader"],
    },
    // HARD (closed): billing-sensitive (PROFESSIONAL+ paid surface) and carries
    // proctoring + grading PII. A billing outage must NOT silently grant access
    // to the assessment platform, so it fails CLOSED.
    failMode: "closed",
  },
  {
    key: "custom-dashboards",
    name: "Customizable Dashboards",
    version: "1.0.0",
    category: "platform",
    type: "feature",
    requiresPlan: "PROFESSIONAL",
    defaultEnabled: false,
    dependencies: [{ key: "core-hiring", range: "^1.0.0" }],
    capabilities: ["widget-layout", "saved-views", "per-role-dashboards"],
    permissions: ["dashboard:read", "dashboard:write"],
    contributions: {
      routes: ["/"],
      widgets: ["dashboard-grid"],
      gatewayRoutes: ["/api/dashboards"],
    },
    // SOFT (open): a UI personalization feature; not governance and not security-
    // sensitive (it only lays out widgets the user already has access to). A
    // billing blip falls back to the default dashboard, so it fails open.
    failMode: "open",
  },
  {
    key: "white-label-embed",
    name: "White-label Embed",
    version: "1.0.0",
    category: "platform",
    type: "capability",
    requiresPlan: "ENTERPRISE",
    defaultEnabled: false,
    dependencies: [
      { key: "core-hiring", range: "^1.0.0" },
      { key: "custom-dashboards", range: "^1.0.0" },
    ],
    capabilities: ["iframe-embed", "branding-override", "scoped-tokens"],
    permissions: ["embed:read", "embed:configure"],
    contributions: {
      gatewayRoutes: ["/api/embed"],
    },
    // HARD (closed): ENTERPRISE-only security boundary (scoped embed tokens,
    // branding override, iframe embed). A billing outage must NOT silently grant
    // access to the white-label embed surface, so it fails CLOSED.
    failMode: "closed",
  },
];

/**
 * Plan order, smallest to largest. Used by consumers to compare requiresPlan.
 * Mirrors the billing-service plan tiers.
 */
export const MODULE_PLAN_ORDER = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"] as const;

/**
 * Look up a module by key. Returns undefined when the key is not registered.
 * Typed against the registry so callers get the full ModuleManifest.
 */
export function getModule(key: string): ModuleManifest | undefined {
  return MODULE_REGISTRY.find((m) => m.key === key);
}

/**
 * Validate the registry's dependency graph using Kahn's algorithm
 * (topological sort). THROWS on:
 *   - a duplicate module key,
 *   - a dependency that references a module key not present in the registry,
 *   - a dependency cycle (any subset of modules that mutually depend).
 *
 * On success returns the topologically sorted keys (dependencies first), which
 * downstream loaders use as a safe initialization order. Semver range strings
 * are validated for non-emptiness only; full range satisfaction is the
 * consuming workflow's concern (it knows each module's actual version).
 *
 * The default argument lets callers validate the canonical registry directly:
 *   validateRegistry();
 */
export function validateRegistry(reg: ModuleManifest[] = MODULE_REGISTRY): string[] {
  // 1. Build the node set and reject duplicates.
  const nodes = new Map<string, ModuleManifest>();
  for (const m of reg) {
    if (nodes.has(m.key)) {
      throw new Error(`Module registry: duplicate module key "${m.key}"`);
    }
    nodes.set(m.key, m);
  }

  // 2. Build adjacency (dependency -> dependents) + in-degree, validating deps.
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();
  for (const key of nodes.keys()) {
    inDegree.set(key, 0);
    dependents.set(key, []);
  }
  for (const m of reg) {
    for (const dep of m.dependencies) {
      if (!dep.key || !dep.range) {
        throw new Error(
          `Module registry: module "${m.key}" has a dependency with an empty key or range`,
        );
      }
      if (!nodes.has(dep.key)) {
        throw new Error(
          `Module registry: module "${m.key}" depends on missing module "${dep.key}"`,
        );
      }
      // edge: dep.key -> m.key (m depends on dep, so dep must come first)
      dependents.get(dep.key)!.push(m.key);
      inDegree.set(m.key, (inDegree.get(m.key) ?? 0) + 1);
    }
  }

  // 3. Kahn's algorithm: repeatedly pop zero-in-degree nodes.
  const queue: string[] = [];
  for (const [key, deg] of inDegree) {
    if (deg === 0) queue.push(key);
  }
  // Deterministic output order regardless of registry insertion order.
  queue.sort();

  const sorted: string[] = [];
  while (queue.length > 0) {
    const key = queue.shift()!;
    sorted.push(key);
    const ready: string[] = [];
    for (const next of dependents.get(key) ?? []) {
      const deg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, deg);
      if (deg === 0) ready.push(next);
    }
    ready.sort();
    queue.push(...ready);
  }

  // 4. If not every node was emitted, the leftovers form one or more cycles.
  if (sorted.length !== nodes.size) {
    const cyclic = [...nodes.keys()].filter((k) => !sorted.includes(k)).sort();
    throw new Error(
      `Module registry: dependency cycle detected among modules: ${cyclic.join(", ")}`,
    );
  }

  return sorted;
}
