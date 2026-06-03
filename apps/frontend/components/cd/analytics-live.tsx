"use client";
// components/cd/analytics-live.tsx
// Wires the verbatim CD Analytics (./AnalyticsScreen) to the gateway: getDashboardKpis
// + getFunnel + getAdverseImpact -> AnalyticsData. KPIs and the pipeline funnel are
// live; time-to-hire-by-dept, source-effectiveness and the AI-insight panel are not
// exposed by the gateway, so they render empty.
import { AnalyticsScreen } from "./AnalyticsScreen";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getDashboardKpis, getFunnel, getAdverseImpact, type DashKpi } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";
import type { AnalyticsData, FunnelStage, DonutDatum } from "./types";

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen", ASSESSMENT: "Assessment",
  INTERVIEW: "Interview", FINAL_REVIEW: "Final review", OFFER: "Offer", HIRED: "Hired",
};
const STAGE_ORDER: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];
const FUNNEL_COLORS = ["var(--brand)", "var(--brand)", "var(--info)", "var(--info)", "var(--ai-2)", "var(--ai)", "var(--ai)", "var(--ok)"];
const GROUP_COLORS = ["var(--brand)", "var(--ai)", "var(--info)", "var(--warn)", "var(--ok)", "var(--ink-3)"];

export function AnalyticsLive() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);

  // AnalyticsScreen renders the Funnel/charts unguarded and crashes on empty data
  // (Funnel reads stages[0].n), so render only after the fetches settle.
  if (kpis.loading || funnel.loading || fairness.loading) return null;

  const stages = (funnel.data ?? []).slice().sort((a, b) => {
    const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const funnelStages: FunnelStage[] = stages.map((s, i) => ({ stage: STAGE_LABEL[s.stage] ?? s.stage, n: s.count, color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }));
  const applied = stages.find((s) => s.stage === "APPLIED")?.count ?? stages[0]?.count ?? 0;
  const hired = stages.find((s) => s.stage === "HIRED")?.count ?? 0;
  const conv = applied > 0 ? +((hired / applied) * 100).toFixed(1) : 0;

  const totalSel = (fairness.data ?? []).reduce((acc, m) => acc + (m.selectionRate || 0), 0) || 1;
  const diversity: DonutDatum[] = (fairness.data ?? []).map((m, i) => ({ g: m.group, v: Math.round(((m.selectionRate || 0) / totalSel) * 100), color: m.flagged ? "var(--warn)" : GROUP_COLORS[i % GROUP_COLORS.length] }));

  const data: AnalyticsData = {
    orgName: user?.tenant?.name ?? "your workspace",
    range: "Last 30 days",
    kpis: kpis.data ?? [],
    insights: [],
    funnel: funnelStages.length ? funnelStages : [{ stage: "Applied", n: 0, color: "var(--ink-3)" }],
    funnelConversion: conv > 0 ? `${conv}% applied to hired` : "",
    diversity,
    tthTrend: [],
    tthLabels: [],
    tthDelta: "",
    tthByDept: [],
    sources: [],
  };
  return <AnalyticsScreen data={data} />;
}
