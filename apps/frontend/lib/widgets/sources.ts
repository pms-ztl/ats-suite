// lib/widgets/sources.ts
// SLICE E1 — the dataSourceKey registry for the customizable dashboard (WF5/WF6).
//
// A dashboard widget (DashboardWidgetSchema, @cdc-ats/contracts) names a
// `dataSourceKey`; this table is the single source of truth that resolves that
// key to the REAL lib/api fetcher that feeds it, plus the refresh cadence and a
// hard `realData` flag.
//
// HARD RULE — REAL DATA OR HONEST EMPTY ONLY:
//   Only keys with `realData: true` may be bound to a widget. Every such fetcher
//   was AUDIT-VERIFIED against lib/api.ts to call the real gateway and return a
//   real, tenant-scoped value (a real measured 0 is allowed; a fabricated 0 is
//   never produced). A widget bound to an empty source must render
//   EmptyMetric/EmptyChart, NOT a fabricated zero — the fetcher returns an empty
//   array / null-valued view model and the renderer (WF6) shows the empty state.
//
//   Keys with `realData: false` are KNOWN LANDMINES recorded here ON PURPOSE so
//   the binder can refuse them. They have NO usable backend source (no gateway
//   proxy, or the underlying number is structurally always 0 / not yet computed)
//   and would render a fake metric if bound. getSource() returns them so the UI
//   can explain WHY a key is unbindable; getRealDataSourceKeys() excludes them.
//
// The refresh cadence mirrors the live layer in lib/use-data.ts (45s background
// refetch); REFRESH_MS here is the per-source override the binder may pass to the
// hook. We keep everything at the platform default unless a source is materially
// more expensive.

import * as api from "@/lib/api";
// The Online Assessments (OA) list fetcher lives in its own typed client (it talks
// to the WF4 /api/assessments routes gated behind requireModule('oa-assessments')).
// It is a REAL, tenant-scoped read (RLS-isolated downstream), returning [] when the
// tenant has no assessments (honest empty, never fabricated).
import { listAssessments } from "@/lib/assessment-api";

// Background refresh cadence (ms). Matches lib/use-data.ts REFRESH_MS so a bound
// widget refreshes on the same 45s heartbeat as the hand-wired Aurora homes.
export const DEFAULT_REFRESH_MS = 45_000;
// Cross-tenant super-admin rollups are heavier and change slowly; refresh them
// less aggressively than per-tenant operational data.
const SUPER_ADMIN_REFRESH_MS = 120_000;

// The view-model "shape" a source yields, for the binder/renderer to pick a
// compatible viz. These are documentation-grade tags (the names of the lib/api
// return types / DTOs), not runtime-enforced types.
export type ViewModelType =
  | "DashKpi[]"
  | "PlatformOverview"
  | "FunnelStage[]"
  | "BillingUsage"
  | "SpendTrend"
  | "OversightStats"
  | "ScreeningVerdict[]"
  | "Candidate[]"
  | "Requisition[]"
  | "Interview[]"
  | "Offer[]"
  | "ReviewItem[]"
  | "PlatformTenant[]"
  | "PlatformCostRollup"
  | "AssessmentListItem[]"
  // Landmine view models (never bound; here only to type the registry rows).
  | "Decision[]"
  | "SourceStat[]"
  | "FairnessMetric[]"
  | "ScalarMetric";

// A registry row. `fetcher` is the exact lib/api function (verbatim — we never
// re-wrap or re-implement the data layer here). `scope` distinguishes the
// tenant-operational keys every role may bind from the super-admin-only rollups.
export interface DataSource<T = unknown> {
  key: string;
  // The real lib/api fetcher. Undefined ONLY for a landmine that has no fetcher
  // at all to point at (none today — every landmine still maps to its real
  // fetcher so the binder can show the honest reason).
  fetcher: () => Promise<T>;
  viewModelType: ViewModelType;
  refreshMs: number;
  // HARD GATE: only `true` may be bound to a widget (getRealDataSourceKeys).
  realData: boolean;
  // Human-readable scope/role gate for the binder UI.
  scope: "tenant" | "super-admin";
  // One-line description of what the source feeds.
  label: string;
  // For realData:false rows — WHY it is a landmine (shown to the user; the binder
  // refuses the key). Omitted for real rows.
  blockedReason?: string;
}

// The registry. Order: real tenant sources, real super-admin sources, then the
// explicit landmines. EVERY fetcher below was confirmed present in lib/api.ts and
// confirmed to read the real gateway (see the per-row note).
const SOURCES: Record<string, DataSource> = {
  /* ============================ REAL · tenant ============================ */
  // GET /platform/unified-overview -> hero KPI tiles (real counts/derived/series).
  dashboard_kpis: {
    key: "dashboard_kpis",
    fetcher: api.getDashboardKpis,
    viewModelType: "DashKpi[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Headline KPI tiles (open reqs, active candidates, AI decisions, ...).",
  },
  // GET /platform/unified-overview -> the full typed aggregate (counts, derived
  // metrics, sparklines, deltas). null/[] for not-yet-available fields (honest).
  platform_overview: {
    key: "platform_overview",
    fetcher: api.getPlatformOverview,
    viewModelType: "PlatformOverview",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Unified platform overview aggregate (counts, deltas, sparklines).",
  },
  // GET /platform/unified-overview -> pipelineData; real per-stage candidate
  // counts. Empty array when no candidates are in the pipeline.
  pipeline_funnel: {
    key: "pipeline_funnel",
    fetcher: api.getFunnel,
    viewModelType: "FunnelStage[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Hiring funnel — live candidate count per pipeline stage.",
  },
  // GET /billing/usage?days=30 -> metered AgentRunCost (real runs/tokens/cost).
  billing_usage: {
    key: "billing_usage",
    fetcher: () => api.getBillingUsage(30),
    viewModelType: "BillingUsage",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "AI workload & spend (last 30 days, metered per agent).",
  },
  // GET /billing/spend-trend -> AgentRunCost grouped by month + provider. Empty
  // trend until AI runs are metered across months.
  spend_trend: {
    key: "spend_trend",
    fetcher: api.getSpendTrend,
    viewModelType: "SpendTrend",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Monthly AI spend by provider.",
  },
  // GET /agents/hitl -> HITL checkpoint status mix (pending/approved/rejected).
  oversight: {
    key: "oversight",
    fetcher: api.getOversight,
    viewModelType: "OversightStats",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Human oversight — HITL checkpoint status mix.",
  },
  // GET /screening -> real screener verdicts (PASS/REVIEW/FAIL + evidence).
  screening_list: {
    key: "screening_list",
    fetcher: api.listScreening,
    viewModelType: "ScreeningVerdict[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Screening verdicts list.",
  },
  // GET /candidates -> real candidate rows (tenant-scoped via RLS).
  candidates_list: {
    key: "candidates_list",
    fetcher: () => api.listCandidates(),
    viewModelType: "Candidate[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Candidates list.",
  },
  // GET /requisitions -> real requisition rows.
  requisitions_list: {
    key: "requisitions_list",
    fetcher: api.listRequisitions,
    viewModelType: "Requisition[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Requisitions list.",
  },
  // GET /interviews -> real interview rows.
  interviews_list: {
    key: "interviews_list",
    fetcher: api.listInterviews,
    viewModelType: "Interview[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Interviews list.",
  },
  // GET /offers -> real offer rows (DRAFT -> ACCEPTED lifecycle).
  offers_list: {
    key: "offers_list",
    fetcher: api.listOffers,
    viewModelType: "Offer[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Offers list.",
  },
  // GET /agents/hitl -> real review-queue items (mapped reason codes + SLA).
  review_queue: {
    key: "review_queue",
    fetcher: api.listReviewQueue,
    viewModelType: "ReviewItem[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "HITL review queue.",
  },
  // GET /assessments -> the tenant's real assessment rows, each carrying a live
  // _count of { invites, attempts, results }. Empty array until the tenant has
  // authored an assessment (honest empty; the widget self-empties). This source
  // backs the `oa_results` widget, which is gated on the `oa-assessments` module:
  // the gateway route itself is behind requireModule('oa-assessments'), so the
  // module gate on the widget mirrors the backend's own gate.
  assessment_results: {
    key: "assessment_results",
    fetcher: () => listAssessments(),
    viewModelType: "AssessmentListItem[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: true,
    scope: "tenant",
    label: "Online Assessments: per-assessment invite / attempt / result counts.",
  },

  /* ========================= REAL · super-admin ========================= */
  // GET /super-admin/tenants -> real platform tenant registry rows.
  super_admin_tenants: {
    key: "super_admin_tenants",
    fetcher: api.listPlatformTenants,
    viewModelType: "PlatformTenant[]",
    refreshMs: SUPER_ADMIN_REFRESH_MS,
    realData: true,
    scope: "super-admin",
    label: "Platform tenants (cross-tenant registry).",
  },
  // GET /super-admin/platform/cost -> real cross-tenant AI cost rollup.
  platform_cost: {
    key: "platform_cost",
    fetcher: () => api.getPlatformCost(30),
    viewModelType: "PlatformCostRollup",
    refreshMs: SUPER_ADMIN_REFRESH_MS,
    realData: true,
    scope: "super-admin",
    label: "Cross-tenant AI cost rollup (last 30 days).",
  },

  /* ===================== LANDMINES · realData:false =====================
   * Recorded so the binder can NEVER bind them. Each still points at its real
   * fetcher so the UI can show the honest reason, but the realData gate keeps it
   * out of getRealDataSourceKeys() and out of any widget. */
  // listDecisions hits api.decisions.listDecisions, but the gateway exposes NO
  // /decisions proxy -> the call throws / never returns real data.
  decisions_list: {
    key: "decisions_list",
    fetcher: api.listDecisions,
    viewModelType: "Decision[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: false,
    scope: "tenant",
    label: "Decisions list (human-gated).",
    blockedReason:
      "No gateway proxy for /decisions — the fetcher cannot return real data.",
  },
  // getSourceOfHire returns real APPLIED counts per channel, but `hired` is
  // structurally always 0 (no hire->source attribution exists), so any
  // conversion rate derived from it is fabricated. Channel-applied counts could
  // be charted elsewhere, but the *conversion* source is a landmine.
  source_of_hire: {
    key: "source_of_hire",
    fetcher: api.getSourceOfHire,
    viewModelType: "SourceStat[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: false,
    scope: "tenant",
    label: "Source-of-hire conversion (applied vs hired per channel).",
    blockedReason:
      "`hired` is always 0 (no hire-to-source attribution) — conversion rate would be fabricated.",
  },
  // getAdverseImpact reads diversityData from the aggregate, which is null until a
  // real demographic store exists -> no backend source today.
  adverse_impact: {
    key: "adverse_impact",
    fetcher: api.getAdverseImpact,
    viewModelType: "FairnessMetric[]",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: false,
    scope: "tenant",
    label: "Adverse-impact / four-fifths fairness metrics.",
    blockedReason:
      "No demographic backend source (diversityData is null) — cannot bind without fabricating.",
  },
  // complianceScore — the platform aggregate returns null (honest-null; never
  // computed). No real source, so it is unbindable as a scalar metric.
  compliance_score: {
    key: "compliance_score",
    // Surfaced via getPlatformOverview().complianceScore, which is always null.
    fetcher: api.getPlatformOverview,
    viewModelType: "ScalarMetric",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: false,
    scope: "tenant",
    label: "Compliance score.",
    blockedReason:
      "complianceScore is honest-null in the aggregate — no real backend source.",
  },
  // diversityScore — same as above: honest-null in the aggregate, no real source.
  diversity_score: {
    key: "diversity_score",
    fetcher: api.getPlatformOverview,
    viewModelType: "ScalarMetric",
    refreshMs: DEFAULT_REFRESH_MS,
    realData: false,
    scope: "tenant",
    label: "Diversity index score.",
    blockedReason:
      "diversityScore is honest-null in the aggregate — no real backend source.",
  },
};

// Resolve a dataSourceKey to its registry row, or undefined if the key is
// unknown. Callers MUST also check `.realData` before binding.
export function getSource(key: string): DataSource | undefined {
  return SOURCES[key];
}

// The full registry (real + landmines). Use getRealDataSourceKeys() for binding.
export function listSources(): DataSource[] {
  return Object.values(SOURCES);
}

// The ONLY keys a widget may be bound to: realData === true. The dashboard binder
// (WF6) must validate every widget.dataSourceKey against this allow-list.
export function getRealDataSourceKeys(): string[] {
  return Object.values(SOURCES)
    .filter((s) => s.realData)
    .map((s) => s.key);
}

// Convenience: the bindable rows (realData:true), optionally scoped.
export function getBindableSources(scope?: DataSource["scope"]): DataSource[] {
  return Object.values(SOURCES).filter(
    (s) => s.realData && (scope ? s.scope === scope : true),
  );
}

// Guard the binder can call: true only when the key exists AND is real.
export function isBindable(key: string): boolean {
  return !!SOURCES[key]?.realData;
}
