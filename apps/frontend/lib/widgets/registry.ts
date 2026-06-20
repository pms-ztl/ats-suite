// lib/widgets/registry.ts
// SLICE E2 — the WIDGET CATALOG for the customizable dashboard (WF5/WF6).
//
// SLICE E1 (lib/widgets/sources.ts) is the data layer: it resolves a
// `dataSourceKey` to a REAL lib/api fetcher and stamps a hard `realData` flag.
// This module is the PRESENTATION layer on top of it: a catalog of the widget
// KINDS a user may place on their dashboard, each one wiring a widget renderer
// (the WF5 widget wrapper) to exactly one E1 data source plus the viz variants,
// default size/config, and role/module/plan gates the placement UI (WF6) reads.
//
// ───────────────────────── HARD RULES (do not relax) ─────────────────────────
//  1. REAL DATA OR HONEST EMPTY ONLY. Every catalog entry's `dataSourceKey` MUST
//     resolve to an E1 source whose `realData === true` — this is ASSERTED at
//     module load (assertRealSource) so a regression that points a widget at a
//     landmine or a typo'd key throws immediately, in dev and in the build. The
//     ONLY entries without a source are `markdown_note` and `quick_actions`
//     (static / navigational widgets that read no tenant data); their
//     `dataSourceKey` is null and they are exempt from the assertion.
//  2. Each entry OWNS its honest-empty behavior. The catalog does not render —
//     it names the WF5 wrapper component (via React.lazy) that, when its bound
//     source yields an empty array / null view-model, renders EmptyMetric /
//     EmptyChart (dashboard-kit / charts) and NEVER a fabricated zero.
//  3. The viz kit is REUSED, never re-implemented. `allowedViz` lists the names
//     of the existing shared/ribbon + shared/charts + dashboard-kit components a
//     widget may render with; the wrapper picks one of them verbatim.
//
// The WF5 widget wrapper components referenced by `component` live under
// components/cd/widgets/<type>.tsx and are loaded lazily so the catalog itself
// stays free of client-only imports (it is consumed by both the placement UI and
// any server-side validation of a saved DashboardDocument).

import * as React from "react";
import { getSource, type DataSource } from "./sources";
import type { IconName } from "@/components/cd/icon";
import type { WidgetBodyProps } from "@/components/dashboard/WidgetFrame";

/* ───────────────────────────── role / plan gates ───────────────────────────── */

// The platform roles, as stamped on the JWT / auth-context user.role and gated in
// middleware.ts. A widget lists the roles allowed to PLACE it; the tenant-scoped
// operational widgets are open to every in-tenant role, while the cross-tenant
// rollup widget is SUPER_ADMIN-only (mirroring the source's `scope`).
export type DashboardRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "RECRUITER"
  | "HIRING_MANAGER"
  | "INTERVIEWER";

// Every in-tenant role (the default `roles` for operational widgets). Excludes
// SUPER_ADMIN, whose home is the cross-tenant platform console.
export const TENANT_ROLES: DashboardRole[] = [
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
];

// Plan tiers, mirroring @cdc-ats/contracts ModulePlanSchema (FREE..ENTERPRISE).
// A widget's optional `planTier` is the MINIMUM plan required to place it; the
// filter() helper compares against the tenant's current plan by rank.
export type PlanTier = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
const PLAN_RANK: Record<PlanTier, number> = {
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

/* ──────────────────────────────── widget kinds ─────────────────────────────── */

// The fixed set of widget kinds this build ships. WF6's placement palette is
// driven entirely by this union — adding a widget kind means adding a catalog
// entry (and its wrapper), not touching the renderer.
export type WidgetType =
  | "kpi_scorecard"
  | "time_series"
  | "pipeline_funnel"
  | "breakdown"
  | "table"
  | "list_feed"
  | "billing_spend"
  | "oversight_gauge"
  | "super_admin_cost"
  | "oa_results"
  | "markdown_note"
  | "quick_actions";

// Catalog grouping for the placement palette (purely organizational).
export type WidgetCategory =
  | "metrics"
  | "pipeline"
  | "analytics"
  | "data"
  | "oversight"
  | "billing"
  | "platform"
  | "utility";

// A grid footprint in react-grid-layout units (columns × rows). `minW`/`minH`
// are the smallest size the widget can be resized to and still render honestly.
export interface WidgetSize {
  w: number;
  h: number;
  minW: number;
  minH: number;
}

// One catalog entry. `dataSourceKey` is the E1 key this widget binds to (null
// only for the source-less static/utility widgets). `component` is a React.lazy
// import of the WF5 wrapper so the catalog carries no client-only code at import
// time. `allowedViz[0]` is the default viz variant.
export interface CatalogEntry {
  type: WidgetType;
  label: string;
  // Short description for the placement palette tooltip.
  description: string;
  icon: IconName;
  category: WidgetCategory;
  // Names of the shared viz / card components this widget may render with
  // (verbatim from shared/ribbon, shared/charts, dashboard-kit). First = default.
  allowedViz: string[];
  // The E1 source key (realData:true) that feeds this widget. null ONLY for
  // markdown_note / quick_actions, which read no tenant data.
  dataSourceKey: string | null;
  // Lazy WF5 wrapper. The component owns the source binding + honest-empty render.
  // (Self-binding variant: takes WidgetRenderProps and resolves its own source.)
  component: React.LazyExoticComponent<React.ComponentType<WidgetRenderProps>>;
  // SLICE E6 - the lazy WIDGET BODY loader the <WidgetFrame> mounts via its
  // `bodyLoader`. The body (components/dashboard/widgets/<type>-body) is a
  // presentational renderer that takes WidgetBodyProps: the frame already owns the
  // chrome (SectionCard), the viewport gate and the data binding (useData against
  // `dataSourceKey`), so the body only turns the supplied `state` into the reused
  // viz or an honest empty state — it does NOT fetch. The grid's renderWidget passes
  // this loader straight to WidgetFrame.bodyLoader.
  //
  // Typed on WidgetBodyProps<any>: each body is generic over its own data shape
  // (e.g. WidgetBodyProps<DashKpi[]>), which is NOT assignable to the invariant
  // WidgetBodyProps<unknown>. `any` here erases that data-type variance so a
  // strongly-typed body of any source shape can register; the frame still binds the
  // real source by `dataSourceKey`, so this loosening never weakens the data layer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bodyLoader: () => Promise<{ default: React.ComponentType<WidgetBodyProps<any>> }>;
  // Default widget-specific config (DashboardWidget.config). Empty object when none.
  defaultConfig: Record<string, unknown>;
  // Default + minimum grid footprint when the widget is first placed.
  defaultSize: WidgetSize;
  // Roles allowed to PLACE this widget (the WF6 palette filters by these).
  roles: DashboardRole[];
  // Optional module key (packages/common modules registry) that must be enabled
  // for the tenant before this widget can be placed.
  requiredModule?: string;
  // Optional MINIMUM plan tier required to place this widget.
  planTier?: PlanTier;
}

// Props every WF5 widget wrapper receives. The wrapper resolves its own source
// via getSource(entry.dataSourceKey) + useData (the 45s live layer), so the
// catalog only needs to hand it the placed instance's identity, viz + config.
export interface WidgetRenderProps {
  instanceId: string;
  type: WidgetType;
  title?: string;
  // The chosen viz variant (one of the entry's allowedViz). Falls back to the
  // entry default when the saved document omits it.
  viz?: string;
  // The placed instance's merged config (defaults + user overrides).
  config?: Record<string, unknown>;
}

/* ─────────────────── lazy WF5 wrappers (components/cd/widgets) ───────────────── */
// Each wrapper binds its E1 source and renders an honest-empty state. They are
// loaded lazily so this catalog can be imported anywhere (including any
// server-side DashboardDocument validation) without pulling client-only viz code.
// The dynamic import paths are the canonical home for the WF5 widget components.

const KpiScorecardWidget = React.lazy(() => import("@/components/cd/widgets/kpi-scorecard-widget"));
const TimeSeriesWidget = React.lazy(() => import("@/components/cd/widgets/time-series-widget"));
const PipelineFunnelWidget = React.lazy(() => import("@/components/cd/widgets/pipeline-funnel-widget"));
const BreakdownWidget = React.lazy(() => import("@/components/cd/widgets/breakdown-widget"));
const TableWidget = React.lazy(() => import("@/components/cd/widgets/table-widget"));
const ListFeedWidget = React.lazy(() => import("@/components/cd/widgets/list-feed-widget"));
const BillingSpendWidget = React.lazy(() => import("@/components/cd/widgets/billing-spend-widget"));
const OversightGaugeWidget = React.lazy(() => import("@/components/cd/widgets/oversight-gauge-widget"));
const SuperAdminCostWidget = React.lazy(() => import("@/components/cd/widgets/super-admin-cost-widget"));
const OaResultsWidget = React.lazy(() => import("@/components/cd/widgets/oa-results-widget"));
const MarkdownNoteWidget = React.lazy(() => import("@/components/cd/widgets/markdown-note-widget"));
const QuickActionsWidget = React.lazy(() => import("@/components/cd/widgets/quick-actions-widget"));

/* ──────────────────────────────── the catalog ──────────────────────────────── */

const CATALOG: Record<WidgetType, CatalogEntry> = {
  /* ── metrics ── */
  // Headline KPI tiles (open reqs, active candidates, AI decisions, ...). Each
  // tile flips to the honest em-dash EmptyMetric when its metric is absent.
  kpi_scorecard: {
    type: "kpi_scorecard",
    label: "KPI scorecard",
    description: "Headline KPI tiles with delta + sparkline.",
    icon: "bolt",
    category: "metrics",
    allowedViz: ["KpiCard", "DeltaPill"],
    dataSourceKey: "dashboard_kpis",
    component: KpiScorecardWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/kpi-scorecard-body"),
    defaultConfig: { maxTiles: 4 },
    defaultSize: { w: 6, h: 4, minW: 3, minH: 3 },
    roles: TENANT_ROLES,
    requiredModule: "core-hiring",
  },

  /* ── analytics ── */
  // A real series over time (monthly AI spend by provider). Empty -> EmptyChart.
  time_series: {
    type: "time_series",
    label: "Trend over time",
    description: "Monthly AI spend by provider as a stream / line.",
    icon: "chart",
    category: "analytics",
    allowedViz: ["StreamGraph", "CometTrail", "AreaChart", "LineChart"],
    dataSourceKey: "spend_trend",
    component: TimeSeriesWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/time-series-body"),
    defaultConfig: {},
    defaultSize: { w: 6, h: 5, minW: 3, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "billing",
  },

  /* ── pipeline ── */
  // The hiring funnel — live candidate count per pipeline stage. Empty array ->
  // the ribbon / cascade self-empties (never a flat zero-line).
  pipeline_funnel: {
    type: "pipeline_funnel",
    label: "Hiring funnel",
    description: "Live candidate count per pipeline stage.",
    icon: "motion",
    category: "pipeline",
    allowedViz: ["FlowRibbon", "StepCascade"],
    dataSourceKey: "pipeline_funnel",
    component: PipelineFunnelWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/pipeline-funnel-body"),
    defaultConfig: {},
    defaultSize: { w: 8, h: 5, minW: 4, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "core-hiring",
  },

  // A categorical breakdown (screening PASS/REVIEW/FAIL mix). Empty -> EmptyChart.
  breakdown: {
    type: "breakdown",
    label: "Breakdown",
    description: "Categorical mix (e.g. screening verdicts) as a donut / waffle.",
    icon: "sparkles",
    category: "analytics",
    allowedViz: ["WaffleField", "DonutChart", "BeadStream", "BarsChart"],
    dataSourceKey: "screening_list",
    component: BreakdownWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/breakdown-body"),
    defaultConfig: {},
    defaultSize: { w: 4, h: 5, minW: 3, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "ai-screening",
  },

  /* ── data ── */
  // A real, tenant-scoped row table (candidates). Empty -> honest empty table.
  table: {
    type: "table",
    label: "Data table",
    description: "Tenant-scoped rows (candidates) in a sortable table.",
    icon: "users",
    category: "data",
    allowedViz: ["DataTable"],
    dataSourceKey: "candidates_list",
    component: TableWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/table-body"),
    defaultConfig: { pageSize: 8 },
    defaultSize: { w: 6, h: 6, minW: 4, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "core-hiring",
  },

  // A scrollable feed of recent items (HITL review queue). Empty -> honest empty.
  list_feed: {
    type: "list_feed",
    label: "Activity feed",
    description: "Recent items (review queue) as a scrollable list.",
    icon: "inbox",
    category: "data",
    allowedViz: ["PendingList", "ListFeed"],
    dataSourceKey: "review_queue",
    component: ListFeedWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/list-feed-body"),
    defaultConfig: { limit: 10 },
    defaultSize: { w: 4, h: 6, minW: 3, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "review-queue",
  },

  /* ── billing ── */
  // Metered AI workload & spend (last 30 days, per agent). Empty -> EmptyChart.
  billing_spend: {
    type: "billing_spend",
    label: "AI spend",
    description: "Metered AI workload + spend (last 30 days, per agent).",
    icon: "card",
    category: "billing",
    allowedViz: ["BarsChart", "PetalBloom", "KpiCard"],
    dataSourceKey: "billing_usage",
    component: BillingSpendWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/billing-spend-body"),
    defaultConfig: { days: 30 },
    defaultSize: { w: 6, h: 5, minW: 3, minH: 4 },
    roles: ["ADMIN", "HIRING_MANAGER", "RECRUITER", "INTERVIEWER"],
    requiredModule: "billing",
  },

  /* ── oversight ── */
  // Human oversight — HITL checkpoint status mix. A real measured 0 (clear queue)
  // is a real 0; no checkpoints -> EmptyChart.
  oversight_gauge: {
    type: "oversight_gauge",
    label: "Human oversight",
    description: "HITL checkpoint status mix (pending / approved / rejected).",
    icon: "shield",
    category: "oversight",
    allowedViz: ["BeadStream", "DonutChart", "KpiCard"],
    dataSourceKey: "oversight",
    component: OversightGaugeWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/oversight-gauge-body"),
    defaultConfig: {},
    defaultSize: { w: 4, h: 5, minW: 3, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "review-queue",
  },

  /* ── platform (super-admin only) ── */
  // Cross-tenant AI cost rollup (last 30 days). SUPER_ADMIN-only, mirroring the
  // source scope. Empty -> EmptyChart.
  super_admin_cost: {
    type: "super_admin_cost",
    label: "Platform cost",
    description: "Cross-tenant AI cost rollup (last 30 days).",
    icon: "server",
    category: "platform",
    allowedViz: ["BarsChart", "StreamGraph", "KpiCard"],
    dataSourceKey: "platform_cost",
    component: SuperAdminCostWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/super-admin-cost-body"),
    defaultConfig: { days: 30 },
    defaultSize: { w: 6, h: 5, minW: 4, minH: 4 },
    roles: ["SUPER_ADMIN"],
  },

  /* ── assessments (module-gated) ── */
  // Online Assessments results: real per-assessment graded-result counts (and a
  // lifecycle-mix donut) from listAssessments. This entry is the canonical
  // module-gated widget: its `requiredModule` is "oa-assessments" (defaultEnabled:
  // false), so the WF6 palette filter ONLY surfaces it once the tenant has that
  // module enabled, closing the dashboard <-> module-resolver loop. planTier
  // mirrors the module's requiresPlan (PROFESSIONAL+). Empty -> EmptyChart.
  oa_results: {
    type: "oa_results",
    label: "Assessment results",
    description: "Graded online-assessment results per assessment (and lifecycle mix).",
    icon: "scroll",
    category: "analytics",
    allowedViz: ["BarsChart", "DonutChart"],
    dataSourceKey: "assessment_results",
    component: OaResultsWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/oa-results-body"),
    defaultConfig: { maxBars: 8 },
    defaultSize: { w: 6, h: 5, minW: 3, minH: 4 },
    roles: TENANT_ROLES,
    requiredModule: "oa-assessments",
    planTier: "PROFESSIONAL",
  },

  /* ── utility (no data source) ── */
  // A static markdown note the user writes. No tenant data -> exempt from the
  // realData assertion. Honest by construction: it only renders its own text.
  markdown_note: {
    type: "markdown_note",
    label: "Note",
    description: "A static markdown note you write.",
    icon: "type",
    category: "utility",
    allowedViz: ["Markdown"],
    dataSourceKey: null,
    component: MarkdownNoteWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/markdown-note-body"),
    defaultConfig: { markdown: "" },
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
    roles: ["SUPER_ADMIN", ...TENANT_ROLES],
  },

  // A grid of navigational shortcuts. No tenant data -> exempt from the
  // assertion; it only renders links the user configures.
  quick_actions: {
    type: "quick_actions",
    label: "Quick actions",
    description: "A grid of navigational shortcuts.",
    icon: "listChecks",
    category: "utility",
    allowedViz: ["QuickActions"],
    dataSourceKey: null,
    component: QuickActionsWidget,
    bodyLoader: () => import("@/components/dashboard/widgets/quick-actions-body"),
    defaultConfig: { actions: [] },
    defaultSize: { w: 3, h: 3, minW: 2, minH: 2 },
    roles: ["SUPER_ADMIN", ...TENANT_ROLES],
  },
};

/* ─────────────────────── load-time real-data assertion ─────────────────────── */
// HARD RULE 1: every entry that names a source MUST resolve to a realData:true
// E1 source. This runs ONCE at module load so a typo'd key, a removed source, or
// a widget pointed at a landmine fails fast (in dev and at build) instead of
// silently rendering a fake metric. Source-less utility widgets are exempt.

const SOURCELESS_TYPES: ReadonlySet<WidgetType> = new Set<WidgetType>([
  "markdown_note",
  "quick_actions",
]);

function assertRealSource(entry: CatalogEntry): void {
  if (SOURCELESS_TYPES.has(entry.type)) {
    // A source-less widget MUST declare a null dataSourceKey (not a stray key).
    if (entry.dataSourceKey !== null) {
      throw new Error(
        `Widget catalog: "${entry.type}" is source-less but declares dataSourceKey "${entry.dataSourceKey}".`,
      );
    }
    return;
  }
  if (!entry.dataSourceKey) {
    throw new Error(
      `Widget catalog: "${entry.type}" has no dataSourceKey but is not a source-less widget.`,
    );
  }
  const source: DataSource | undefined = getSource(entry.dataSourceKey);
  if (!source) {
    throw new Error(
      `Widget catalog: "${entry.type}" -> unknown dataSourceKey "${entry.dataSourceKey}" (not in lib/widgets/sources).`,
    );
  }
  if (!source.realData) {
    throw new Error(
      `Widget catalog: "${entry.type}" -> "${entry.dataSourceKey}" is a realData:false landmine (${source.blockedReason ?? "no real source"}). Only realData:true sources may be bound.`,
    );
  }
}

// Run the assertion across the whole catalog at module load.
for (const entry of Object.values(CATALOG)) {
  assertRealSource(entry);
}

/* ────────────────────────────────── exports ────────────────────────────────── */

// The full catalog, as a typed record keyed by WidgetType.
export const widgetCatalog: Record<WidgetType, CatalogEntry> = CATALOG;

// All catalog entries as an array (palette enumeration).
export function listCatalog(): CatalogEntry[] {
  return Object.values(CATALOG);
}

// Resolve a widget type to its catalog entry, or undefined for an unknown type.
// WF6's renderer/validator MUST treat undefined as "drop this widget" rather
// than rendering something unregistered.
export function getCatalogEntry(type: string): CatalogEntry | undefined {
  return (CATALOG as Record<string, CatalogEntry>)[type];
}

// Type guard: is this string a registered widget type?
export function isWidgetType(type: string): type is WidgetType {
  return Object.prototype.hasOwnProperty.call(CATALOG, type);
}

// The placement-palette filter. Returns the catalog entries a user MAY place,
// given their role, the tenant's enabled modules, and the tenant's plan:
//   • role        — entry.roles must include it.
//   • plan        — when entry.planTier is set, the tenant's plan rank must meet it.
//   • module      — when entry.requiredModule is set AND `enabledModules` is
//                   provided, the module must be in the enabled set or the widget
//                   is DROPPED from the palette. This is what closes the
//                   dashboard <-> module-resolver loop: e.g. `oa_results`
//                   (requiredModule: "oa-assessments") only appears once that
//                   module is enabled for the tenant. `enabledModules` undefined
//                   means "module gating not resolved here" and is NOT used to hide
//                   widgets (the fail-soft all-enabled posture, matching the
//                   cd-shell nav); pass an explicit list (possibly empty) to
//                   enforce module gating. A widget with NO requiredModule is
//                   ALWAYS available (subject only to role + plan), so this gate is
//                   purely additive and cannot regress the pre-module palette.
export function filter(
  role: DashboardRole,
  enabledModules?: string[],
  plan?: PlanTier,
): CatalogEntry[] {
  const moduleSet = enabledModules ? new Set(enabledModules) : null;
  const planRank = plan ? PLAN_RANK[plan] : null;

  return listCatalog().filter((entry) => {
    // Role gate.
    if (!entry.roles.includes(role)) return false;

    // Plan gate (only when both the entry requires a tier and a plan is known).
    if (entry.planTier && planRank !== null) {
      if (planRank < PLAN_RANK[entry.planTier]) return false;
    }

    // Module gate (only when an enabled-module list is explicitly provided).
    if (entry.requiredModule && moduleSet && !moduleSet.has(entry.requiredModule)) {
      return false;
    }

    return true;
  });
}
