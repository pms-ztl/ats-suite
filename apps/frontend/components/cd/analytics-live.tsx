"use client";
// components/cd/analytics-live.tsx
// Wires the verbatim CD Analytics (./AnalyticsScreen) to the gateway: getDashboardKpis
// + getFunnel + getAdverseImpact -> AnalyticsData. KPIs and the pipeline funnel are
// live; time-to-hire-by-dept, source-effectiveness and the AI-insight panel are not
// exposed by the gateway, so they render empty.
import { AnalyticsScreen, type TthRow } from "./AnalyticsScreen";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getDashboardKpis, getFunnel, getAdverseImpact, type DashKpi } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";
import { CHART_COLORS } from "@/components/shared/charts";
import type { AnalyticsData, FunnelStage } from "./types";

// Local gateway fetch mirroring lib/api's raw(): bearer from sessionStorage,
// credentials include, unwrap res?.data ?? res. The funnel uses the same helper
// shape (a thin GET against /api); we keep TTH self-contained here so this file
// stays the only edit to the live wrapper.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function tthToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function getTimeToHire(): Promise<TthRow[]> {
  const t = tthToken();
  const res = await fetch(`${API_BASE}/analytics/time-to-hire`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  });
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  const out = json?.data ?? json ?? {};
  const rows: any[] = Array.isArray(out.trend) ? out.trend : Array.isArray(out.trendByMonth) ? out.trendByMonth : [];
  return rows.map((r) => ({
    label: String(r?.label ?? r?.month ?? ""),
    avgDays: Number(r?.avgDays ?? 0),
    medianDays: Number(r?.medianDays ?? 0),
    p90Days: Number(r?.p90Days ?? 0),
    hires: Number(r?.hires ?? 0),
  }));
}

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen", ASSESSMENT: "Assessment",
  INTERVIEW: "Interview", FINAL_REVIEW: "Final review", OFFER: "Offer", HIRED: "Hired",
};
const STAGE_ORDER: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];
// Hex (not CSS vars) so the recharts FunnelViz fills render outside the Aurora token scope.
const FUNNEL_COLORS = [CHART_COLORS.brand, CHART_COLORS.brand, CHART_COLORS.info, CHART_COLORS.info, CHART_COLORS.violet, CHART_COLORS.ai, CHART_COLORS.ai, CHART_COLORS.ok];

export function AnalyticsLive() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const tth = useData<TthRow[]>(getTimeToHire);

  // AnalyticsScreen renders the Funnel/charts unguarded and crashes on empty data
  // (Funnel reads stages[0].n), so render only after the fetches settle.
  if (kpis.loading || funnel.loading || fairness.loading || tth.loading) return null;

  const stages = (funnel.data ?? []).slice().sort((a, b) => {
    const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const funnelStages: FunnelStage[] = stages.map((s, i) => ({ stage: STAGE_LABEL[s.stage] ?? s.stage, n: s.count, color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }));
  const applied = stages.find((s) => s.stage === "APPLIED")?.count ?? stages[0]?.count ?? 0;
  const hired = stages.find((s) => s.stage === "HIRED")?.count ?? 0;
  const conv = applied > 0 ? +((hired / applied) * 100).toFixed(1) : 0;

  // Real monthly time-to-hire series from /api/analytics/time-to-hire. The
  // backend returns an empty array when there are zero hires in the window, so
  // tthRows stays empty and AnalyticsScreen keeps its honest EmptyChart.
  const tthRows = tth.data ?? [];
  const tthDelta =
    tthRows.length > 1 && tthRows[tthRows.length - 1] && tthRows[0]
      ? (() => {
          const first = tthRows.find((r) => r.hires > 0);
          const last = [...tthRows].reverse().find((r) => r.hires > 0);
          if (!first || !last || first === last) return "";
          const d = Math.round(last.avgDays - first.avgDays);
          return d === 0 ? "flat vs start of window" : `${d > 0 ? "+" : ""}${d} days vs start of window`;
        })()
      : "";

  const data: AnalyticsData = {
    orgName: user?.tenant?.name ?? "your workspace",
    range: "Last 30 days",
    kpis: kpis.data ?? [],
    insights: [],
    funnel: funnelStages.length ? funnelStages : [{ stage: "Applied", n: 0, color: CHART_COLORS.ink3 }],
    funnelConversion: conv > 0 ? `${conv}% applied to hired` : "",
    // Diversity is rendered as four-fifths impact-ratio bars from the real metrics
    // passed via the `fairness` prop; the legacy donut datum is no longer used.
    diversity: [],
    // Real avg-days-per-month series + labels (empty when no hires).
    tthTrend: tthRows.map((r) => r.avgDays),
    tthLabels: tthRows.map((r) => r.label),
    tthDelta,
    tthByDept: [],
    // Source effectiveness lives on its own wired page; the overview shows an
    // empty-state pointer rather than fabricated rows.
    sources: [],
  };
  return <AnalyticsScreen data={data} fairness={fairness.data ?? []} tthRows={tthRows} />;
}
