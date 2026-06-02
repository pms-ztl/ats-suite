"use client";
// app/(dashboard)/analytics/page.tsx - EXACT Claude Design "Aurora" analytics
// dashboard (claude-design/screen-analytics.jsx): header + export, KPI strip,
// AI insights band, pipeline funnel + diversity donut, time-to-hire trend +
// by-department, source effectiveness table.
//
// HONEST WIRING: only the funnel (getFunnel) and the fairness/diversity donut
// (getAdverseImpact) have real endpoints in the allowed data layer, so those two
// carry real series and full loading/error/empty states. The KPI strip and the
// AI insights are *derived* from that same real data (no fabricated numbers).
// Panels with no wired source (time-to-hire trend, by-department, source
// effectiveness) keep the rich layout but show an EmptyState that links to the
// detail route, rather than inventing a series.
import { KpiRow, SectionCard, Funnel, Donut, Reveal, Pill, Btn, type Kpi } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getFunnel, getAdverseImpact } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";

/* Friendly labels + canonical ordering for the funnel stages. */
const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};
const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED",
];
// A calm brand->ai ramp so each funnel bar reads as one pipeline, not a rainbow.
const FUNNEL_COLORS = ["var(--c-brand)", "var(--c-brand)", "var(--c-info)", "var(--c-info)", "var(--c-ai-2)", "var(--c-ai)", "var(--c-ai)", "var(--c-ok)"];
// Stable palette for the diversity donut groups.
const GROUP_COLORS = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-warn)", "var(--c-ok)", "var(--c-ink-3)"];

type Sev = "critical" | "warning" | "info";
function SevDot({ sev }: { sev: Sev }) {
  const c = sev === "critical" ? "var(--c-danger)" : sev === "warning" ? "var(--c-warn)" : "var(--c-info)";
  return <span style={{ width: 8, height: 8, borderRadius: 99, background: c, flexShrink: 0 }} />;
}
type Insight = { sev: Sev; finding: string; evidence: string; rec: string };

export default function AnalyticsPage() {
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);

  // Order + label the real funnel rows; keep any unknown stages in their server order.
  const stages = (funnel.data ?? [])
    .slice()
    .sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
  const funnelStages = stages.map((s, i) => ({
    stage: STAGE_LABEL[s.stage] ?? s.stage,
    n: s.count,
    color: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
  }));

  // Diversity donut, normalised to a share of total selections across groups.
  const totalSel = (fairness.data ?? []).reduce((acc, m) => acc + (m.selectionRate || 0), 0) || 1;
  const donutData = (fairness.data ?? []).map((m, i) => ({
    g: m.group,
    v: Math.round((m.selectionRate / totalSel) * 100),
    color: m.flagged ? "var(--c-warn)" : GROUP_COLORS[i % GROUP_COLORS.length],
  }));
  const flaggedGroups = (fairness.data ?? []).filter((m) => m.flagged);
  const minRatio = (fairness.data ?? []).reduce((m, x) => Math.min(m, x.impactRatio), 1);

  // ----- derived metrics (computed from the two real series, never invented) -----
  const applied = stages.find((s) => s.stage === "APPLIED")?.count ?? stages[0]?.count ?? 0;
  const hired = stages.find((s) => s.stage === "HIRED")?.count ?? stages[stages.length - 1]?.count ?? 0;
  const interviews = stages.find((s) => s.stage === "INTERVIEW")?.count ?? 0;
  const overallConv = applied > 0 ? +((hired / applied) * 100).toFixed(1) : 0;

  // Biggest single-stage drop in the funnel, for the AI band.
  let worstDrop = { from: "", to: "", lost: 0, pct: 0 };
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count, cur = stages[i].count;
    const lost = prev - cur;
    if (prev > 0 && lost > worstDrop.lost) {
      worstDrop = { from: STAGE_LABEL[stages[i - 1].stage] ?? stages[i - 1].stage, to: STAGE_LABEL[stages[i].stage] ?? stages[i].stage, lost, pct: Math.round((lost / prev) * 100) };
    }
  }

  const kpis: Kpi[] = [
    { id: "applied", label: "Applications", value: applied, icon: "users", spark: [applied], delta: 0, good: true },
    { id: "interviews", label: "In interview", value: interviews, icon: "calendar", spark: [interviews], delta: 0, good: true },
    { id: "hired", label: "Hires", value: hired, icon: "check", spark: [hired], delta: 0, good: true },
    { id: "conv", label: "Applied to hired", value: overallConv, icon: "sparkles", spark: [overallConv], delta: 0, good: true, ai: true, suffix: "%" },
  ];

  const insights: Insight[] = [];
  if (worstDrop.lost > 0) {
    insights.push({
      sev: worstDrop.pct >= 70 ? "critical" : "warning",
      finding: `Largest drop-off: ${worstDrop.from} to ${worstDrop.to}`,
      evidence: `${worstDrop.lost.toLocaleString()} candidates (${worstDrop.pct}%) leave the funnel at this step, the steepest single-stage loss in your pipeline.`,
      rec: `Review the ${worstDrop.to.toLowerCase()} criteria and outreach cadence for this stage.`,
    });
  }
  if (flaggedGroups.length > 0) {
    insights.push({
      sev: "critical",
      finding: `Adverse-impact flag on ${flaggedGroups.length} group${flaggedGroups.length > 1 ? "s" : ""}`,
      evidence: `Lowest impact ratio is ${minRatio.toFixed(2)}, below the 0.80 four-fifths threshold. Groups: ${flaggedGroups.map((g) => g.group).join(", ")}.`,
      rec: "Open the diversity report and audit the screening criteria driving the gap.",
    });
  } else if ((fairness.data ?? []).length > 0) {
    insights.push({
      sev: "info",
      finding: "Selection rates within the four-fifths rule",
      evidence: `All groups clear the 0.80 threshold (lowest ratio ${minRatio.toFixed(2)}). No adverse-impact flag this period.`,
      rec: "Keep monitoring as new cohorts move through the funnel.",
    });
  }
  if (overallConv > 0) {
    insights.push({
      sev: overallConv < 2 ? "warning" : "info",
      finding: `Applied to hired conversion is ${overallConv}%`,
      evidence: `${hired.toLocaleString()} hires from ${applied.toLocaleString()} applications across the current funnel.`,
      rec: overallConv < 2 ? "Tighten top-of-funnel sourcing so screeners see better-fit candidates." : "Conversion is healthy; protect quality as volume scales.",
    });
  }

  const insightsLoading = funnel.loading || fairness.loading;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Analytics</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Hiring performance across your pipeline, funnel, fairness, and source mix.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 90 days</Pill>
          <Btn variant="primary" icon="arrowUpRight">Export</Btn>
        </div>
      </div>

      {/* KPIs (derived from the real funnel) */}
      {funnel.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {funnel.error && <div className="mb-[18px]"><ErrorState title="Could not load metrics" body="The analytics service did not respond." code="GET /api/analytics/funnel" onRetry={funnel.reload} /></div>}
      {funnel.data && funnel.data.length > 0 && <KpiRow kpis={kpis} cols={4} />}

      {/* AI insights */}
      <Reveal i={4}>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--c-ai-tint), transparent 65%)", borderBottom: "1px solid var(--c-line)" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Insights</span><Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">analytics agent</Pill></div>
            <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>ranked by severity · grounded in your data</span>
          </div>
          {insightsLoading && <div style={{ padding: 18 }}><Skeleton className="h-24 rounded-[11px]" /></div>}
          {!insightsLoading && (funnel.error || fairness.error) && insights.length === 0 && (
            <div style={{ padding: 18 }}><EmptyState title="Insights unavailable" body="Insights need the funnel and fairness signals, which did not load this time." /></div>
          )}
          {!insightsLoading && insights.length === 0 && !(funnel.error || fairness.error) && (
            <div style={{ padding: 18 }}><EmptyState title="No insights yet" body="As candidates move through the funnel, the analytics agent surfaces grounded findings here." /></div>
          )}
          {!insightsLoading && insights.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, insights.length)},1fr)`, gap: 0 }}>
              {insights.slice(0, 3).map((ins, i) => (
                <div key={i} style={{ padding: "16px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><SevDot sev={ins.sev} /><span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: ins.sev === "critical" ? "var(--c-danger)" : ins.sev === "warning" ? "var(--c-warn)" : "var(--c-info)" }}>{ins.sev}</span></div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 6 }}>{ins.finding}</div>
                  <p style={{ margin: "0 0 9px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.5 }}>{ins.evidence}</p>
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12, color: "var(--c-ai-ink)", fontWeight: 600, lineHeight: 1.45 }}><Icon name="bolt" size={13} style={{ flexShrink: 0, marginTop: 2 }} />{ins.rec}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* funnel + diversity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={5}>
          <SectionCard title="Pipeline funnel" icon="radar" headRight={overallConv > 0 ? <Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">{overallConv}% applied to hired</Pill> : undefined}>
            {funnel.loading && <Skeleton className="h-48 rounded-lg" />}
            {funnel.error && <ErrorState title="Funnel unavailable" body="Could not load the pipeline funnel." code="GET /api/analytics/funnel" onRetry={funnel.reload} />}
            {funnel.data && funnel.data.length === 0 && <EmptyState title="No funnel data yet" body="When candidates apply and move through stages, the funnel fills in here." />}
            {funnel.data && funnelStages.length > 0 && <Funnel stages={funnelStages} />}
          </SectionCard>
        </Reveal>
        <Reveal i={6}>
          <SectionCard title="Diversity (selection)" icon="grid" action="EEOC report" onAction={() => { window.location.href = "/analytics/diversity"; }}>
            {fairness.loading && <Skeleton className="h-40 rounded-lg" />}
            {fairness.error && <ErrorState title="Fairness unavailable" body="Could not load adverse-impact metrics." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
            {fairness.data && donutData.length === 0 && <EmptyState title="No fairness data yet" body="Selection rates by group appear once enough candidates have been screened." />}
            {fairness.data && donutData.length > 0 && <Donut data={donutData} center={{ value: minRatio.toFixed(2), label: "min ratio" }} />}
          </SectionCard>
        </Reveal>
      </div>

      {/* time-to-hire trend + by dept (no wired source -> honest empty, links to detail) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={7}>
          <SectionCard title="Time-to-hire trend" icon="chart" action="Open" onAction={() => { window.location.href = "/analytics/time-to-hire"; }}>
            <EmptyState
              title="Trend not wired yet"
              body="The time-to-hire series is not available from the current analytics endpoint. Open the detail view for medians by department."
              actions={<a href="/analytics/time-to-hire"><Btn variant="soft" icon="chart">Time to hire</Btn></a>}
            />
          </SectionCard>
        </Reveal>
        <Reveal i={8}>
          <SectionCard title="By department" icon="briefcase" action="Open" onAction={() => { window.location.href = "/analytics/time-to-hire"; }}>
            <EmptyState title="No department breakdown" body="Per-department time-to-hire lives in the detail view." />
          </SectionCard>
        </Reveal>
      </div>

      {/* source effectiveness (no wired source -> honest empty, links to detail) */}
      <Reveal i={9}>
        <SectionCard title="Source effectiveness" icon="radar" action="Details" onAction={() => { window.location.href = "/analytics/source-effectiveness"; }}>
          <EmptyState
            title="Source mix not wired yet"
            body="Hires, quality, and cost-per-hire by source are not exposed by the allowed data layer. Open the detail view for candidates and hires by source."
            actions={<a href="/analytics/source-effectiveness"><Btn variant="soft" icon="radar">Source effectiveness</Btn></a>}
          />
        </SectionCard>
      </Reveal>
    </div>
  );
}
