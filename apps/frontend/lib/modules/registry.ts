// lib/modules/registry.ts
// WF9 / SLICE I4 — CLIENT mirror of the module catalog.
//
// The features page (app/(dashboard)/settings/features/page.tsx) renders REAL,
// per-tenant module state from GET /api/me/modules — that endpoint is the
// authority for the `enabled` flag, the block `reason`, and `requiresPlan`. But
// the wire shape from /api/me/modules is intentionally lean: it carries `key`,
// `name`, `category`, `type`, the resolved `enabled`/`reason`, `requiresPlan`,
// and the raw `contributions` object — it does NOT carry the human-readable
// DESCRIPTION or a stable display ordering. This file supplies that DISPLAY
// metadata so the UI can group, sort, and explain each module without inventing
// any tenant data.
//
// ───────────────────────── HARD RULES (do not relax) ─────────────────────────
//  1. This is a DISPLAY mirror, not a source of truth. It NEVER decides whether a
//     module is on — only how to label/group/describe it. The live `enabled`,
//     `reason`, and plan entitlement ALWAYS come from /api/me/modules at runtime.
//  2. It mirrors the canonical @cdc-ats/common MODULE_REGISTRY (keys, names,
//     categories, requiresPlan). The entries here are a static snapshot of that
//     in-code registry — no fictional modules. A module the server returns that
//     is NOT mirrored here still renders (it falls back to the server-supplied
//     name + key); a mirror entry the server does NOT return is simply not shown.
//     So the page can never drift into showing a module the tenant cannot resolve.
//  3. Descriptions are product chrome (what the module DOES), not tenant data.
//
// Super-admin can read the persisted catalog via GET /api/super-admin/modules,
// but that route is SUPER_ADMIN-only — a tenant admin on the features page
// cannot call it. So this static mirror (kept byte-aligned with the in-code
// MODULE_REGISTRY) is the display source for the tenant-facing screen.

/** Billing plans, smallest to largest. Mirrors @cdc-ats/common ModulePlan. */
export type ModulePlan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

/** Module kind, mirrors @cdc-ats/common ModuleType. */
export type ModuleType = "agent" | "capability" | "feature";

/**
 * One client-side display entry. A pure-presentation subset of the canonical
 * ModuleManifest: the fields the features page needs to group, order, label,
 * and describe a module. NOTHING here gates the module — gating is the server's
 * job (resolved per tenant in /api/me/modules).
 */
export interface ClientModuleEntry {
  /** Stable key — joins to the server's /api/me/modules row by `key`. */
  key: string;
  /** Human-readable name (mirror of the manifest name). */
  name: string;
  /** Grouping bucket: "hiring" | "intelligence" | "governance" | "platform". */
  category: string;
  /** Module kind. */
  type: ModuleType;
  /** Minimum plan that entitles this module. null = available on every plan. */
  requiresPlan: ModulePlan | null;
  /** What the module DOES — product chrome for the row subtitle. Not tenant data. */
  description: string;
}

// Plan order, smallest to largest. Exported so the page can rank a tenant's plan
// against a module's requiresPlan for the honest "plan-locked" / "upgrade" state.
export const MODULE_PLAN_ORDER: readonly ModulePlan[] = [
  "FREE",
  "STARTER",
  "PROFESSIONAL",
  "ENTERPRISE",
] as const;

/** Rank of a plan (FREE=0 … ENTERPRISE=3). -1 for an unknown / null plan. */
export function planRank(plan: string | null | undefined): number {
  return MODULE_PLAN_ORDER.indexOf((plan ?? "") as ModulePlan);
}

/**
 * Does `plan` entitle a module requiring `requiresPlan`? A null requiresPlan is
 * available on every plan. An unknown plan string never entitles a gated module.
 * This is a DISPLAY helper only (to render "Upgrade to PROFESSIONAL" honestly) —
 * the server still enforces entitlement (402 PLAN_LIMIT) on the toggle write.
 */
export function planEntitles(plan: string | null | undefined, requiresPlan: ModulePlan | null | undefined): boolean {
  if (!requiresPlan) return true;
  return planRank(plan) >= planRank(requiresPlan);
}

/**
 * The display catalog. A static snapshot of @cdc-ats/common MODULE_REGISTRY,
 * ordered by category then a stable in-category order for a predictable layout.
 * Keys/names/categories/requiresPlan are mirrored 1:1 with the in-code registry;
 * descriptions are derived from each manifest's capabilities (what it does).
 */
export const CLIENT_MODULE_REGISTRY: ClientModuleEntry[] = [
  // ── Core hiring ──────────────────────────────────────────────────────────
  {
    key: "core-hiring",
    name: "Core Hiring",
    category: "hiring",
    type: "feature",
    requiresPlan: null,
    description: "Requisitions, candidates, applications, the pipeline, and hiring decisions. The base every tenant gets.",
  },
  {
    key: "ai-screening",
    name: "AI Screening",
    category: "hiring",
    type: "agent",
    requiresPlan: "STARTER",
    description: "Screens applicants against the role's requirements with per-requirement evidence and a score verdict.",
  },
  {
    key: "ai-sourcing",
    name: "AI Sourcing",
    category: "hiring",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "Finds and ranks passive candidates that match an open role, with outreach suggestions.",
  },
  {
    key: "jd-author",
    name: "JD Author",
    category: "hiring",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "Drafts job descriptions and captures structured requirements from a short brief.",
  },
  {
    key: "interviews",
    name: "Interviews",
    category: "hiring",
    type: "feature",
    requiresPlan: null,
    description: "Interview rounds, kits, scorecards, and interview intelligence.",
  },
  {
    key: "scheduling",
    name: "Interview Scheduling",
    category: "hiring",
    type: "agent",
    requiresPlan: "STARTER",
    description: "Auto-schedules interviews by matching panel and candidate availability.",
  },
  {
    key: "offers",
    name: "Offers",
    category: "hiring",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "Offer generation, approval routing, and compensation modeling.",
  },
  {
    key: "oa-assessments",
    name: "Online Assessments",
    category: "hiring",
    type: "feature",
    requiresPlan: "PROFESSIONAL",
    description: "Author online assessments, send them to candidates, and auto-grade code and prose.",
  },

  // ── Intelligence (AI agents) ─────────────────────────────────────────────
  {
    key: "resume-parser",
    name: "Resume Parser",
    category: "intelligence",
    type: "agent",
    requiresPlan: "FREE",
    description: "Extracts and normalizes resumes, then enriches the candidate record.",
  },
  {
    key: "copilot",
    name: "Recruiting Copilot",
    category: "intelligence",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "An in-app assistant that drafts, summarizes, and answers across the workspace.",
  },
  {
    key: "analytics",
    name: "Analytics & Insights",
    category: "intelligence",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "Hiring analytics, metric rollups, and narrative insights over your funnel.",
  },
  {
    key: "candidate-experience",
    name: "Candidate Experience Assistant",
    category: "intelligence",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "Assists candidates, analyzes cover letters, and powers applicant messaging.",
  },

  // ── Governance ───────────────────────────────────────────────────────────
  {
    key: "compliance",
    name: "Compliance & Bias Audit",
    category: "governance",
    type: "agent",
    requiresPlan: "PROFESSIONAL",
    description: "Audits decisions for adverse impact, flags four-fifths-rule risk, and handles EEOC and GDPR.",
  },
  {
    key: "review-queue",
    name: "Human Review Queue",
    category: "governance",
    type: "feature",
    requiresPlan: null,
    description: "Human-in-the-loop checkpoints with manual override and reason codes.",
  },

  // ── Platform ─────────────────────────────────────────────────────────────
  {
    key: "billing",
    name: "Billing & Plans",
    category: "platform",
    type: "capability",
    requiresPlan: null,
    description: "Plan management, invoicing, usage metering, and plan gating.",
  },
  {
    key: "custom-dashboards",
    name: "Customizable Dashboards",
    category: "platform",
    type: "feature",
    requiresPlan: "PROFESSIONAL",
    description: "Drag-and-drop widget layouts, saved views, and per-role dashboards.",
  },
  {
    key: "white-label-embed",
    name: "White-label Embed",
    category: "platform",
    type: "capability",
    requiresPlan: "ENTERPRISE",
    description: "Embed branded, chrome-less widgets into your own site with scoped tokens.",
  },
  {
    key: "ui-customization",
    name: "UI Customization",
    category: "platform",
    type: "capability",
    requiresPlan: "ENTERPRISE",
    description: "Override the dashboard theme tokens, the per-role default layout, and which surface slots render across the in-app shell.",
  },
];

/** Human-readable label + order for each category bucket (display only). */
export const MODULE_CATEGORY_META: Record<string, { label: string; icon: string; order: number }> = {
  hiring: { label: "Hiring", icon: "briefcase", order: 0 },
  intelligence: { label: "AI agents", icon: "sparkles", order: 1 },
  governance: { label: "Governance", icon: "shield", order: 2 },
  platform: { label: "Platform", icon: "server", order: 3 },
};

/** Friendly fallback label/order for a category the mirror does not know. */
export function categoryMeta(category: string): { label: string; icon: string; order: number } {
  return (
    MODULE_CATEGORY_META[category] ?? {
      label: category ? category.charAt(0).toUpperCase() + category.slice(1) : "Other",
      icon: "bolt",
      order: 99,
    }
  );
}

/** Look up a client display entry by key. undefined when not mirrored. */
export function getClientModule(key: string): ClientModuleEntry | undefined {
  return CLIENT_MODULE_REGISTRY.find((m) => m.key === key);
}
