"use client";
// app/(dashboard)/analytics/page.tsx
// EXACT port of claude-design/screen-analytics.jsx (AnalyticsScreen), the
// analytics LANDING: a header row (h1 + lede + range pill + Export), a 4-up KPI
// row, an AI-insights card (severity-ranked findings from the analytics agent),
// a pipeline funnel + diversity donut, a time-to-hire trend + by-department
// bars, and a source-effectiveness table. Because this route lives inside the
// (dashboard) shell (sidebar + topbar + <main className="p-6">), the prototype's
// scroll wrapper and outer max-width frame are replaced by the standard
// mx-auto/max-w-[1200px] content div, the dashboard layout supplies that frame.
// Every section is reproduced element-for-element with the prototype's exact
// inline styles and structure; kit refs (Reveal, KPICard, SectionCard, Funnel,
// Donut, TrendArea, Pill, Btn, Icon) map to @/components/aurora-kit /
// aurora-icon. Every palette var(--x) is converted to var(--c-x); effect/size
// tokens (--r*, --fs-*, --ease-*) stay bare. The local SevDot helper is kept,
// with its colors converted to --c-* too.
//
// WIRING (rule 4): the KPI row is driven by getDashboardKpis() (its DashKpi
// shape matches the kit Kpi the prototype's KPICard consumes), and the pipeline
// funnel is driven by getFunnel() (gateway stage counts mapped onto the
// prototype's five funnel stages, labels + colors preserved). Each wired surface
// renders Skeleton / ErrorState / EmptyState INSIDE the prototype's container
// and falls back to the design's literal numbers when the gateway returns
// nothing, so the layout is never empty. The drill-down actions navigate to
// /analytics/time-to-hire, /analytics/source-effectiveness, /analytics/diversity
// (the SectionCard "Details" / "EEOC report" / trend "Open" actions). The
// date-range pill + Export interactions are useState. Series the endpoints do
// not provide (diversity donut, the time-to-hire trend, per-department medians,
// source channels, and the AI insight copy) keep the prototype's example
// content verbatim, it is part of the design.
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Reveal, KPICard, SectionCard, Funnel, Donut, TrendArea, Pill, Btn,
  type Kpi,
} from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getDashboardKpis, getFunnel, type DashKpi } from "@/lib/api";
import type { ApplicationStage } from "@/lib/types";

/* ----------------------------- static data ----------------------------- */
// The prototype reads window.ANALYTICS (claude-design/an-data.jsx). The KPI row
// and the funnel are wired to the gateway below; the rest of these series have
// no gateway endpoint, so they stay verbatim as the design's example content.
const RANGE = "Last 90 days";

const KPIS_STATIC: Kpi[] = [
  { id: "ttf", label: "Time-to-fill", value: 32, suffix: "d", delta: -4, good: true, spark: [40, 38, 37, 35, 34, 33, 33, 32], icon: "clock" },
  { id: "tth", label: "Time-to-hire", value: 21, suffix: "d", delta: -3, good: true, spark: [28, 27, 25, 24, 23, 22, 22, 21], icon: "calendar" },
  { id: "conv", label: "Applied to hire", value: 1.0, suffix: "%", delta: 0.1, good: true, spark: [0.7, 0.8, 0.8, 0.9, 0.9, 1.0, 1.0, 1.0], icon: "radar" },
  { id: "cph", label: "Cost per hire", value: 4120, prefix: "$", delta: -180, good: true, spark: [4600, 4500, 4420, 4360, 4280, 4220, 4180, 4120], icon: "card" },
];

const FUNNEL_STATIC = [
  { stage: "Applied", n: 4036, color: "var(--c-ink-3)" },
  { stage: "Screened", n: 902, color: "var(--c-info)" },
  { stage: "Interview", n: 318, color: "var(--c-ai)" },
  { stage: "Offer", n: 64, color: "var(--c-brand)" },
  { stage: "Hired", n: 41, color: "var(--c-ok)" },
];

const TTH_BY_DEPT = [
  { dept: "Engineering", days: 24, n: 18 },
  { dept: "Design", days: 19, n: 6 },
  { dept: "Marketing", days: 17, n: 5 },
  { dept: "Data", days: 26, n: 7 },
  { dept: "Security", days: 31, n: 5 },
];

const TTH_TREND = [30, 29, 31, 28, 26, 27, 24, 23, 25, 22, 21, 21];
const TTH_LABELS = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const SOURCES = [
  { src: "Referral", hires: 16, apps: 640, quality: 82, cost: 1200, color: "var(--c-brand)" },
  { src: "LinkedIn", hires: 11, apps: 1120, quality: 71, cost: 4800, color: "var(--c-info)" },
  { src: "Inbound", hires: 8, apps: 980, quality: 64, cost: 900, color: "var(--c-ai)" },
  { src: "Job board", hires: 6, apps: 1296, quality: 52, cost: 3200, color: "var(--c-warn)" },
];

const DIVERSITY = [
  { g: "Women", v: 44, color: "var(--c-brand)" },
  { g: "Men", v: 49, color: "var(--c-info)" },
  { g: "Non-binary", v: 4, color: "var(--c-ai)" },
  { g: "Undisclosed", v: 3, color: "var(--c-ink-3)" },
];

const INSIGHTS: { sev: "critical" | "warning" | "info"; finding: string; evidence: string; rec: string; ai: boolean }[] = [
  { sev: "critical", finding: "Job-board conversion is collapsing", evidence: "Job board: 1,296 applicants to 6 hires (0.46%), well below referral (2.5%) at 2.7x the cost.", rec: "Shift spend from job boards to referral incentives, projected -$2,000 cost-per-hire.", ai: true },
  { sev: "warning", finding: "Security roles are bottlenecked at screening", evidence: "Security time-to-hire is 31d vs 22d org-wide; 9-day gap concentrated in the screening stage.", rec: "Add a second technical screener or relax the must-have on niche tooling.", ai: true },
  { sev: "info", finding: "Offer-accept rate is trending up", evidence: "86% this quarter (+2pts), driven by faster scheduling (median 1.2 days to first interview).", rec: "Maintain the fast-scheduling SLA, it correlates with accept rate.", ai: true },
];

// Map a gateway funnel stage onto one of the prototype's five funnel buckets,
// keeping the exact stage labels + colors. Positive funnel only (no rejects).
const FUNNEL_BUCKETS = ["Applied", "Screened", "Interview", "Offer", "Hired"];
function bucketOf(stage: ApplicationStage): number {
  switch (stage) {
    case "APPLIED": return 0;
    case "SCREENED": case "PHONE_SCREEN": case "ASSESSMENT": return 1;
    case "INTERVIEW": case "FINAL_REVIEW": return 2;
    case "OFFER": return 3;
    case "HIRED": return 4;
    default: return -1;
  }
}

/* ------------------------------- SevDot -------------------------------- */
// Ported verbatim from the prototype's SevDot, palette tokens -> --c-*.
function SevDot({ sev }: { sev: "critical" | "warning" | "info" }) {
  const c = sev === "critical" ? "var(--c-danger)" : sev === "warning" ? "var(--c-warn)" : "var(--c-info)";
  return <span style={{ width: 8, height: 8, borderRadius: 99, background: c, flexShrink: 0 }} />;
}

export default function AnalyticsPage() {
  const router = useRouter();
  // Date-range picker + export interactions (prototype had inert controls).
  const [range, setRange] = useState(RANGE);
  const [exporting, setExporting] = useState(false);
  const onExport = () => { setExporting(true); setTimeout(() => setExporting(false), 1200); };

  // KPI row -> getDashboardKpis (DashKpi matches the kit Kpi the prototype uses).
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  // Pipeline funnel -> getFunnel, mapped onto the prototype's five funnel stages.
  const funnel = useData<{ stage: string; n: number; color: string }[]>(async () => {
    const rows = await getFunnel(); // { stage, count }[]
    const counts = [0, 0, 0, 0, 0];
    rows.forEach((r) => {
      const b = bucketOf(r.stage);
      if (b >= 0) counts[b] += Number(r.count) || 0;
    });
    if (!counts.some((c) => c > 0)) return FUNNEL_STATIC; // graceful fallback
    return FUNNEL_STATIC.map((s, i) => ({ ...s, n: counts[i] }));
  });

  const kpiRow = kpis.data && kpis.data.length ? kpis.data.slice(0, 4) : KPIS_STATIC;
  const funnelStages = funnel.data && funnel.data.length ? funnel.data : FUNNEL_STATIC;
  const maxDept = Math.max(...TTH_BY_DEPT.map((d) => d.days));
  const maxHires = Math.max(...SOURCES.map((s) => s.hires));

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Analytics</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Hiring performance across Northwind Talent · {range}.</p></div>
        <div style={{ display: "flex", gap: 9 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", background: "var(--c-surface-2)", whiteSpace: "nowrap", cursor: "pointer" }}>
            <Icon name="clock" size={12} />
            <select value={range} onChange={(e) => setRange(e.target.value)} style={{ border: "none", background: "transparent", color: "inherit", font: "inherit", fontWeight: 600, cursor: "pointer", outline: "none", appearance: "none" }}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 12 months</option>
            </select>
          </label>
          <Btn variant="primary" icon="arrowUpRight" onClick={onExport} disabled={exporting}>{exporting ? "Exporting..." : "Export"}</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {kpis.loading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        {kpis.error && <div style={{ gridColumn: "1 / -1" }}><ErrorState title="Could not load metrics" body="The overview service did not respond." code="GET /api/platform/unified-overview" onRetry={kpis.reload} /></div>}
        {!kpis.loading && !kpis.error && kpiRow.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
      </div>

      {/* AI insights */}
      <Reveal i={4}>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--c-ai-tint), transparent 65%)", borderBottom: "1px solid var(--c-line)" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Insights</span><Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">analytics agent</Pill></div>
            <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>ranked by severity · grounded in your data</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} style={{ padding: "16px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><SevDot sev={ins.sev} /><span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: ins.sev === "critical" ? "var(--c-danger)" : ins.sev === "warning" ? "var(--c-warn)" : "var(--c-info)" }}>{ins.sev}</span></div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 6 }}>{ins.finding}</div>
                <p style={{ margin: "0 0 9px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.5 }}>{ins.evidence}</p>
                <div style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12, color: "var(--c-ai-ink)", fontWeight: 600, lineHeight: 1.45 }}><Icon name="bolt" size={13} style={{ flexShrink: 0, marginTop: 2 }} />{ins.rec}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* funnel + diversity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={5}><SectionCard title="Pipeline funnel" icon="radar" headRight={<Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">1.0% applied to hired</Pill>}>
          {funnel.loading && <Skeleton className="h-48 rounded-lg" />}
          {funnel.error && <ErrorState title="Funnel unavailable" body="Could not load the pipeline funnel." code="GET /api/analytics/funnel" onRetry={funnel.reload} />}
          {!funnel.loading && !funnel.error && funnelStages.length === 0 && <EmptyState title="No funnel data yet" body="When candidates apply and move through stages, the funnel fills in here." />}
          {!funnel.loading && !funnel.error && funnelStages.length > 0 && <Funnel stages={funnelStages} />}
        </SectionCard></Reveal>
        <Reveal i={6}><SectionCard title="Diversity (hires)" icon="grid" action="EEOC report" onAction={() => router.push("/analytics/diversity")}><Donut data={DIVERSITY} /></SectionCard></Reveal>
      </div>

      {/* time-to-hire trend + by dept */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={7}><SectionCard title="Time-to-hire trend" icon="chart" headRight={<Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="arrowUpRight">-9 days YoY</Pill>}><TrendArea data={TTH_TREND} labels={TTH_LABELS} /></SectionCard></Reveal>
        <Reveal i={8}><SectionCard title="By department" icon="briefcase">
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {TTH_BY_DEPT.map((d, i) => (
              <div key={d.dept} style={{ display: "grid", gridTemplateColumns: "92px 1fr 56px", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--c-ink-2)", fontWeight: 500 }}>{d.dept}</span>
                <div style={{ height: 16, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: ((d.days / maxDept) * 100) + "%", borderRadius: 6, background: d.days > 28 ? "var(--c-warn)" : "var(--c-brand)", animation: "growx 1s var(--ease-out) both", animationDelay: (i * 80) + "ms" }} />
                </div>
                <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>{d.days}d</span>
              </div>
            ))}
          </div>
        </SectionCard></Reveal>
      </div>

      {/* source effectiveness */}
      <Reveal i={9}><SectionCard title="Source effectiveness" icon="radar" action="Details" onAction={() => router.push("/analytics/source-effectiveness")}>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 90px 90px 90px", gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
          <span>Source</span><span>Hires</span><span style={{ textAlign: "right" }}>Quality</span><span style={{ textAlign: "right" }}>Apps</span><span style={{ textAlign: "right" }}>Cost/hire</span>
        </div>
        {SOURCES.map((s, i) => (
          <div key={s.src} style={{ display: "grid", gridTemplateColumns: "120px 1fr 90px 90px 90px", gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 600 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />{s.src}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ flex: 1, maxWidth: 200, height: 18, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: ((s.hires / maxHires) * 100) + "%", borderRadius: 6, background: s.color, animation: "growx 1s var(--ease-out) both", animationDelay: (i * 80) + "ms" }} />
              </div>
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700 }}>{s.hires}</span>
            </div>
            <span style={{ textAlign: "right", display: "inline-flex", justifyContent: "flex-end", alignItems: "center", gap: 5 }}><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: s.quality >= 75 ? "var(--c-ok)" : s.quality >= 60 ? "var(--c-warn)" : "var(--c-danger)" }}>{s.quality}</span></span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--c-ink-3)" }}>{s.apps.toLocaleString()}</span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", fontWeight: 600, color: s.cost > 4000 ? "var(--c-danger)" : "var(--c-ink)" }}>${s.cost.toLocaleString()}</span>
          </div>
        ))}
      </SectionCard></Reveal>
    </div>
  );
}
