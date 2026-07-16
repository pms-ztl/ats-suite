"use client";
// components/cd/analytics-live.tsx
// Wires the verbatim CD Analytics (./AnalyticsScreen) to the gateway: getDashboardKpis
// + getFunnel + getAdverseImpact -> AnalyticsData. KPIs and the pipeline funnel are
// live; time-to-hire-by-dept, source-effectiveness and the AI-insight panel are not
// exposed by the gateway, so they render empty.
import { AnalyticsScreen, type TthRow } from "./AnalyticsScreen";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getDashboardKpis, getFunnel, getAdverseImpact, getSourceOfHire, listCandidates, weeklyCounts, prettySource, type DashKpi, type SourceStat } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";
import { CHART_COLORS, colorAt } from "@/components/shared/charts";
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

// Weekly candidate arrivals SPLIT BY SOURCE for the StreamGraph. Mirrors weeklyCounts'
// trailing-N-week boundaries (Sunday-start, "May 12" labels) so the per-source river
// lines up week-for-week with the total-inflow CometTrail above it. Sources are humanized
// (prettySource) and capped to the top `top` channels by total arrivals; the remainder is
// folded into a single "Other" series so the river stays readable. Empty in -> empty out
// (StreamGraph renders its own honest empty state).
function inflowBySourceWeekly(
  rows: { appliedAt?: string | null; source?: string | null }[],
  weeks = 8,
  top = 6,
): { buckets: { label: string }[]; series: { label: string; values: number[] }[] } {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // back to Sunday
  const buckets: { label: string; from: number; to: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(weekStart); from.setDate(from.getDate() - i * 7);
    const to = new Date(from); to.setDate(to.getDate() + 7);
    buckets.push({ label: from.toLocaleDateString(undefined, { month: "short", day: "numeric" }), from: from.getTime(), to: to.getTime() });
  }
  // counts[source][weekIndex]
  const counts = new Map<string, number[]>();
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (!r?.appliedAt) continue;
    const t = new Date(r.appliedAt).getTime();
    if (!isFinite(t)) continue;
    const j = buckets.findIndex((w) => t >= w.from && t < w.to);
    if (j < 0) continue;
    const src = prettySource(String(r.source || "").trim() || "Unknown");
    if (!counts.has(src)) counts.set(src, new Array(weeks).fill(0));
    counts.get(src)![j]++;
    totals.set(src, (totals.get(src) ?? 0) + 1);
  }
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  const keep = ranked.slice(0, top);
  const rest = ranked.slice(top);
  const series: { label: string; values: number[] }[] = keep.map((s) => ({ label: s, values: counts.get(s)! }));
  if (rest.length) {
    const other = new Array(weeks).fill(0);
    for (const s of rest) { const v = counts.get(s)!; for (let j = 0; j < weeks; j++) other[j] += v[j]; }
    series.push({ label: "Other", values: other });
  }
  return { buckets: buckets.map(({ label }) => ({ label })), series };
}

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen", ASSESSMENT: "Assessment",
  INTERVIEW: "Interview", TECHNICAL_ROUND: "Technical round", HR_ROUND: "HR round", FINAL_REVIEW: "Final review", OFFER: "Offer", HIRED: "Hired",
};
const STAGE_ORDER: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "TECHNICAL_ROUND", "HR_ROUND", "FINAL_REVIEW", "OFFER", "HIRED"];
// Hex (not CSS vars) so the recharts FunnelViz fills render outside the Aurora token scope.
const FUNNEL_COLORS = [CHART_COLORS.brand, CHART_COLORS.brand, CHART_COLORS.info, CHART_COLORS.info, CHART_COLORS.violet, CHART_COLORS.ai, CHART_COLORS.ai, CHART_COLORS.ok];

export function AnalyticsLive() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const tth = useData<TthRow[]>(getTimeToHire);
  const sourceStats = useData<SourceStat[]>(getSourceOfHire);
  const inflow = useData(() => listCandidates());

  // AnalyticsScreen renders the Funnel/charts unguarded and crashes on empty data
  // (Funnel reads stages[0].n), so render only after the fetches settle.
  if (kpis.loading || funnel.loading || fairness.loading || tth.loading || sourceStats.loading || inflow.loading) return null;

  const stages = (funnel.data ?? []).slice().sort((a, b) => {
    const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const funnelStages: FunnelStage[] = stages.map((s, i) => ({ stage: STAGE_LABEL[s.stage] ?? s.stage.replace(/_/g, " "), n: s.count, color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }));
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

  // Real weekly candidate-arrival counts for the comet trail: each candidate's
  // appliedAt (createdAt fallback, mapped in lib/api toCandidate) bucketed into the
  // trailing 8 calendar weeks. No candidates -> [] keeps the honest empty state.
  const inflowCands = inflow.data ?? [];
  const inflowWeekly = inflowCands.length ? weeklyCounts(inflowCands.map((c) => c.appliedAt), 8) : [];
  // Same real arrivals as the comet trail, split by humanized source (top ~6 channels,
  // the rest folded into "Other") for the Sources-over-time stream graph.
  const inflowBySource = inflowCands.length
    ? inflowBySourceWeekly(inflowCands.map((c) => ({ appliedAt: c.appliedAt, source: c.source })), 8, 6)
    : { buckets: [], series: [] };

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
    // Real per-channel stats from GET /analytics/source-of-hire (Candidate.source ×
    // Application outcomes). hires/apps are real counts; cost-per-hire is not tracked
    // per source, so it stays 0 and the screen does not render it.
    sources: (sourceStats.data ?? []).map((s, i) => ({
      src: s.source, color: colorAt(i),
      hires: s.hired, quality: 0, apps: s.applied, cost: 0,
    })),
  };
  // Real applied->hired conversion for the ArcMeter gauge; null (honest empty)
  // until the first application lands.
  return <AnalyticsScreen data={data} fairness={fairness.data ?? []} tthRows={tthRows} conversionPct={applied > 0 ? conv : null} inflowWeekly={inflowWeekly} inflowBySource={inflowBySource} />;
}
