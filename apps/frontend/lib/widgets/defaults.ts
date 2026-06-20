// lib/widgets/defaults.ts
// SLICE E7 - the SYSTEM-DEFAULT dashboard documents (one per role).
//
// These constants are the hardcoded fallback the read hook (hooks/use-dashboard-
// layout) resolves to when there is no user override and no tenant default (and,
// in WF5, ALWAYS - the GET/PUT persistence API arrives in WF6). Each document is
// a real DashboardDocument (the @cdc-ats/contracts shape, re-exported through
// lib/widgets/schema) that the WidgetGrid renders through WidgetFrame, so the home
// page is composed entirely of registered widgets bound to REAL data sources.
//
// ------------------------- what these reproduce -------------------------
// They reproduce the CURRENT role bento (app/(dashboard)/page.tsx + the admin
// org-overview) as a seeded layout: the same widget set, in the same reading
// order and at the same relative sizes, so rendering through the engine is
// visually equivalent to the hand-wired homes. Every widget here binds a
// realData:true E1 source via the registry, so an empty source renders the
// widget's own honest empty state (EmptyMetric / EmptyChart) - NEVER a
// fabricated zero. There are no invented metrics in this file; it only describes
// WHICH real widgets sit WHERE.
//
// ------------------------- grid geometry -------------------------
// Columns per breakpoint (must match WidgetGrid.COLS): lg 12, md 10, sm 6,
// xs 4, xxs 2. `h` is in grid rows (ROW_HEIGHT px each). Every widget's footprint
// is >= its registry minW/minH so a cell can always render honestly. The layouts
// below are authored so the lg board reads top-to-bottom in the same order as the
// hand-wired bento; the narrower breakpoints stack everything single/near-single
// column for small screens.

import {
  CURRENT_SCHEMA_VERSION,
  type DashboardDocument,
  type DashboardWidget,
  type GridLayoutItem,
} from "./schema";
import { widgetCatalog, type WidgetType } from "./registry";

/** The platform roles a system-default exists for. SUPER_ADMIN lands on the
 *  cross-tenant platform console (not this customizable home), so it is not a
 *  key here; the resolver maps it to the admin default if ever routed here. */
export type DefaultRole = "ADMIN" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER";

/** A compact authoring shape for one placed widget: the widget definition plus
 *  its lg footprint. The narrower-breakpoint layouts are derived from this. */
interface Placement {
  instanceId: string;
  type: WidgetType;
  title: string;
  viz?: string;
  config?: Record<string, unknown>;
  /** lg-breakpoint grid box. x/y/w/h in grid units. */
  lg: { x: number; y: number; w: number; h: number };
}

// Build a full DashboardWidget from a placement, pulling the bound data source,
// default config and min footprint from the registry so a default can never
// drift from the catalog (e.g. point a widget at a source the registry would
// reject). The placement's own config overrides the catalog default.
function toWidget(p: Placement): DashboardWidget {
  const entry = widgetCatalog[p.type];
  return {
    instanceId: p.instanceId,
    type: p.type,
    title: p.title,
    dataSourceKey: entry.dataSourceKey ?? p.type, // source-less utility widgets key on their type
    viz: p.viz ?? entry.allowedViz[0],
    config: { ...entry.defaultConfig, ...(p.config ?? {}) },
    minW: entry.defaultSize.minW,
    minH: entry.defaultSize.minH,
  };
}

// Column counts per breakpoint - MUST match WidgetGrid.COLS.
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 } as const;

// Derive the responsive layouts for all five breakpoints from the lg placements.
// lg is authored directly; md scales each box's x/w from 12 -> 10 columns while
// preserving the row order; sm/xs/xxs stack the widgets in reading order into a
// single (or near-single) column so every widget stays at least its min width on
// a small screen. Stacking by reading order is honest (it changes only geometry,
// never which real widget shows what) and avoids overlap on narrow grids.
function buildLayouts(placements: Placement[]): DashboardDocument["layouts"] {
  // Reading order = top-to-bottom, then left-to-right, on the lg board.
  const ordered = [...placements].sort((a, b) =>
    a.lg.y - b.lg.y || a.lg.x - b.lg.x,
  );

  const lg: GridLayoutItem[] = placements.map((p) => ({
    i: p.instanceId,
    x: p.lg.x,
    y: p.lg.y,
    w: p.lg.w,
    h: p.lg.h,
  }));

  // md: rescale columns 12 -> 10, clamp width, keep authored rows.
  const md: GridLayoutItem[] = placements.map((p) => {
    const minW = widgetCatalog[p.type].defaultSize.minW;
    const w = Math.max(minW, Math.min(COLS.md, Math.round((p.lg.w / COLS.lg) * COLS.md)));
    const x = Math.min(COLS.md - w, Math.round((p.lg.x / COLS.lg) * COLS.md));
    return { i: p.instanceId, x: Math.max(0, x), y: p.lg.y, w, h: p.lg.h };
  });

  // Single-column stacks for the small breakpoints, in reading order. Each
  // widget takes the full breakpoint width (clamped to its min) and the y just
  // accumulates so nothing overlaps.
  const stack = (cols: number): GridLayoutItem[] => {
    let y = 0;
    return ordered.map((p) => {
      const minW = widgetCatalog[p.type].defaultSize.minW;
      const w = Math.max(Math.min(cols, minW), Math.min(cols, cols));
      const item: GridLayoutItem = { i: p.instanceId, x: 0, y, w, h: p.lg.h };
      y += p.lg.h;
      return item;
    });
  };

  return {
    lg,
    md,
    sm: stack(COLS.sm),
    xs: stack(COLS.xs),
    xxs: stack(COLS.xxs),
  };
}

// Assemble a full document from a role's placements.
function buildDocument(placements: Placement[]): DashboardDocument {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    globalFilters: {},
    widgets: placements.map(toWidget),
    layouts: buildLayouts(placements),
  };
}

/* ----------------------------- ADMIN / org overview -----------------------------
 * Mirrors the real-time ops home (components/cd/screens/OrgOverview): the hero
 * KPI scorecard over the hiring funnel, the screening verdict mix, AI spend by
 * provider, per-agent spend, human oversight, and the candidates table. Every
 * tile binds a real tenant-scoped source; an empty source self-empties. */
const ADMIN_PLACEMENTS: Placement[] = [
  { instanceId: "admin_kpis", type: "kpi_scorecard", title: "Overview", config: { maxTiles: 4 }, lg: { x: 0, y: 0, w: 12, h: 4 } },
  { instanceId: "admin_funnel", type: "pipeline_funnel", title: "Hiring funnel", viz: "FlowRibbon", lg: { x: 0, y: 4, w: 8, h: 5 } },
  { instanceId: "admin_verdicts", type: "breakdown", title: "Screening verdict mix", viz: "WaffleField", lg: { x: 8, y: 4, w: 4, h: 5 } },
  { instanceId: "admin_spend", type: "time_series", title: "AI spend by provider", viz: "StreamGraph", lg: { x: 0, y: 9, w: 6, h: 5 } },
  { instanceId: "admin_oversight", type: "oversight_gauge", title: "Human oversight", viz: "BeadStream", lg: { x: 6, y: 9, w: 6, h: 5 } },
  { instanceId: "admin_agents", type: "billing_spend", title: "Per-agent runs & spend", viz: "BarsChart", lg: { x: 0, y: 14, w: 6, h: 5 } },
  { instanceId: "admin_pending", type: "list_feed", title: "Pending actions", config: { limit: 10 }, lg: { x: 6, y: 14, w: 6, h: 5 } },
  { instanceId: "admin_candidates", type: "table", title: "Recent candidates", config: { pageSize: 8 }, lg: { x: 0, y: 19, w: 12, h: 6 } },
];

/* ----------------------------- RECRUITER -----------------------------
 * Mirrors the recruiter home (RecruiterDash): KPIs, the pipeline flow, latest
 * applications (screening), the hiring funnel cascade, and the live candidates
 * table. Sourcing/scheduling cards in the hand-wired home read sources that are
 * not registry-bindable (source-of-hire conversion is a landmine), so the
 * default leans on the real funnel + screening + candidate sources instead of
 * fabricating those. */
const RECRUITER_PLACEMENTS: Placement[] = [
  { instanceId: "rec_kpis", type: "kpi_scorecard", title: "Overview", config: { maxTiles: 4 }, lg: { x: 0, y: 0, w: 12, h: 4 } },
  { instanceId: "rec_flow", type: "pipeline_funnel", title: "Pipeline flow", viz: "FlowRibbon", lg: { x: 0, y: 4, w: 8, h: 5 } },
  { instanceId: "rec_apps", type: "breakdown", title: "Latest screening verdicts", viz: "WaffleField", lg: { x: 8, y: 4, w: 4, h: 5 } },
  { instanceId: "rec_funnel", type: "pipeline_funnel", title: "Hiring funnel", viz: "StepCascade", lg: { x: 0, y: 9, w: 8, h: 5 } },
  { instanceId: "rec_queue", type: "list_feed", title: "Review queue", config: { limit: 10 }, lg: { x: 8, y: 9, w: 4, h: 5 } },
  { instanceId: "rec_candidates", type: "table", title: "Candidates", config: { pageSize: 8 }, lg: { x: 0, y: 14, w: 12, h: 6 } },
];

/* ----------------------------- HIRING MANAGER -----------------------------
 * Mirrors HMDash: KPIs, the screening verdict stream, decisions awaiting you
 * (review queue), the screening quality donut, offer pipeline, and human
 * oversight. All bound to real screening / review / offer / oversight sources. */
const HM_PLACEMENTS: Placement[] = [
  { instanceId: "hm_kpis", type: "kpi_scorecard", title: "Overview", config: { maxTiles: 4 }, lg: { x: 0, y: 0, w: 12, h: 4 } },
  { instanceId: "hm_verdicts", type: "breakdown", title: "Screening verdicts", viz: "WaffleField", lg: { x: 0, y: 4, w: 8, h: 5 } },
  { instanceId: "hm_decisions", type: "list_feed", title: "Decisions awaiting you", config: { limit: 8 }, lg: { x: 8, y: 4, w: 4, h: 5 } },
  { instanceId: "hm_quality", type: "breakdown", title: "AI screening quality", viz: "DonutChart", lg: { x: 0, y: 9, w: 6, h: 5 } },
  { instanceId: "hm_oversight", type: "oversight_gauge", title: "Human oversight", viz: "BeadStream", lg: { x: 6, y: 9, w: 6, h: 5 } },
  { instanceId: "hm_funnel", type: "pipeline_funnel", title: "Hiring funnel", viz: "StepCascade", lg: { x: 0, y: 14, w: 12, h: 5 } },
];

/* ----------------------------- INTERVIEWER -----------------------------
 * Mirrors the calm InterviewerDash: KPIs over the review queue and the pipeline.
 * The hand-wired interviewer home is built entirely on the interviews list
 * (today's interviews, week load, status mix, radar); none of those bespoke
 * interview view-models is a registered widget yet, so the default keeps the
 * shared, real-data widgets the interviewer can act on (KPIs + review queue +
 * funnel) rather than inventing interview tiles. */
const INTERVIEWER_PLACEMENTS: Placement[] = [
  { instanceId: "int_kpis", type: "kpi_scorecard", title: "Overview", config: { maxTiles: 4 }, lg: { x: 0, y: 0, w: 12, h: 4 } },
  { instanceId: "int_queue", type: "list_feed", title: "Review queue", config: { limit: 10 }, lg: { x: 0, y: 4, w: 6, h: 6 } },
  { instanceId: "int_funnel", type: "pipeline_funnel", title: "Hiring funnel", viz: "FlowRibbon", lg: { x: 6, y: 4, w: 6, h: 6 } },
];

/** The system-default documents, keyed by role. These are the hardcoded WF5
 *  fallback; WF6 layers user/tenant overrides on top via the persistence API. */
export const SYSTEM_DEFAULT_DASHBOARDS: Record<DefaultRole, DashboardDocument> = {
  ADMIN: buildDocument(ADMIN_PLACEMENTS),
  RECRUITER: buildDocument(RECRUITER_PLACEMENTS),
  HIRING_MANAGER: buildDocument(HM_PLACEMENTS),
  INTERVIEWER: buildDocument(INTERVIEWER_PLACEMENTS),
};

// Roles that should resolve to the admin org-overview default when routed to the
// customizable home (compliance + super-admin share the admin command center).
const ADMIN_LIKE: ReadonlySet<string> = new Set([
  "ADMIN",
  "SUPER_ADMIN",
  "COMPLIANCE_OFFICER",
]);

/**
 * Resolve a (possibly unknown / lowercased) role string to its system-default
 * document. Admin-like roles (admin / super-admin / compliance) get the org
 * overview default; recruiter / hiring-manager / interviewer get theirs; any
 * unrecognized role falls back to the recruiter default (the most general
 * operational home). Never returns undefined, so the read hook always has a
 * concrete document to render.
 */
export function systemDefaultFor(role: string | null | undefined): DashboardDocument {
  const r = (role ?? "").toUpperCase();
  if (ADMIN_LIKE.has(r)) return SYSTEM_DEFAULT_DASHBOARDS.ADMIN;
  if (r === "RECRUITER") return SYSTEM_DEFAULT_DASHBOARDS.RECRUITER;
  if (r === "HIRING_MANAGER") return SYSTEM_DEFAULT_DASHBOARDS.HIRING_MANAGER;
  if (r === "INTERVIEWER") return SYSTEM_DEFAULT_DASHBOARDS.INTERVIEWER;
  return SYSTEM_DEFAULT_DASHBOARDS.RECRUITER;
}
