"use client";
// AnalyticsScreen.tsx, Analytics dashboard (funnel, time-to-hire, source-effectiveness,
// diversity, AI insights). Ported byte-faithful from screen-analytics.jsx. Data via props only.
import React from "react";
import { Pill, Reveal, KPICard, SectionCard } from "./aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import { FlowRibbon, ArcMeter, OrbitField, CometTrail, StepCascade } from "@/components/shared/ribbon";
import { StreamGraph } from "@/components/shared/ribbon-ext";
import {
  BarsChart, TrendChart, EmptyChart, CHART_COLORS,
} from "@/components/shared/charts";
import type { AnalyticsData, AnalyticsInsight } from "./types";
import type { FairnessMetric } from "@/lib/types";

// One real monthly time-to-hire row (from /api/analytics/time-to-hire).
export interface TthRow { label: string; avgDays: number; medianDays: number; p90Days: number; hires: number; }

function SevDot({ sev }: { sev: AnalyticsInsight["sev"] }) {
  const c = sev === "critical" ? "var(--danger)" : sev === "warning" ? "var(--warn)" : "var(--info)";
  return <span style={{ width: 8, height: 8, borderRadius: 99, background: c, flexShrink: 0 }} />;
}

export function AnalyticsScreen({ data, fairness, tthRows, conversionPct, inflowWeekly, inflowBySource, onExport }: { data: AnalyticsData; fairness?: FairnessMetric[]; tthRows?: TthRow[]; conversionPct?: number | null; inflowWeekly?: { label: string; n: number }[]; inflowBySource?: { buckets: { label: string }[]; series: { label: string; values: number[] }[] }; onExport?: () => void }) {
  const a = data;

  // Real time-to-hire trend (avg line + dashed median + dashed p90) from the
  // /analytics/time-to-hire endpoint. Empty array -> honest EmptyChart below.
  const tthData = (tthRows ?? []).map((r) => ({
    label: r.label, avgDays: r.avgDays, medianDays: r.medianDays, p90Days: r.p90Days,
  }));
  const hasTth = tthData.length > 0;

  // Pipeline funnel - real stage counts from getFunnel (pipelineData aggregate).
  const funnelData = a.funnel.map((s) => ({ name: s.stage, value: s.n, fill: s.color }));


  // Diversity / four-fifths - real per-group impact ratio from getAdverseImpact.
  // The 0.80 line is the legal four-fifths threshold; a flagged group renders danger.
  const diversityBars = (fairness ?? []).map((m) => ({
    group: m.group,
    ratio: +(m.impactRatio ?? 0).toFixed(2),
    flagged: !!m.flagged || (m.impactRatio ?? 1) < 0.8,
  }));

  // Source effectiveness - ranked by real hires per source when any exist; until the
  // first hires land it ranks by real application volume instead (labelled in-chart).
  const sourcesHaveHires = a.sources.some((s) => s.hires > 0);
  const sourceBars = a.sources
    .slice()
    .sort((x, y) => (sourcesHaveHires ? y.hires - x.hires : y.apps - x.apps))
    .map((s) => ({ src: s.src, n: sourcesHaveHires ? s.hires : s.apps, color: s.color }));
  const sourceMetric = sourcesHaveHires ? "Hires" : "Applications";
  return (
    <div style={{ overflowY: "auto", height: "100%" }}>
      <div className="cd-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Analytics</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Hiring performance across {a.orgName} · {a.range}.</p></div>
          <div style={{ display: "flex", gap: 9 }}>
            <Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>{a.range}</Pill>
            <Btn variant="primary" icon="arrowUpRight" onClick={onExport}>Export</Btn>
          </div>
        </div>

        {/* Pipeline flow ribbon - real stage counts as a full-width, theme-adaptive stream. */}
        <Reveal i={3}>
          <SectionCard title="Pipeline flow" icon="radar"
            headRight={<Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ textTransform: "none" }}>ribbon thickness = live candidates per stage</Pill>}>
            <FlowRibbon points={a.funnel.map((s) => ({ label: s.stage, n: s.n }))} />
          </SectionCard>
        </Reveal>
        <div style={{ height: 16 }} />

        {/* conversion gauge + channel orbit - the same real funnel/source data the
            cards below use (conversion = applied->hired, dots = applications per channel) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" }} className="an-row">
          <Reveal i={4}><SectionCard title="Pipeline conversion" icon="check">
            <ArcMeter value={conversionPct ?? null} sub="applied to hired" emptyLabel="Conversion appears once candidates flow." />
          </SectionCard></Reveal>
          <Reveal i={5}><SectionCard title="Channel orbit" icon="radar"
            headRight={<Pill tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>dot size = applications per channel</Pill>}>
            <OrbitField items={a.sources.map((s) => ({ label: s.src, n: s.apps }))} centerSub="applications" />
          </SectionCard></Reveal>
        </div>

        {/* Inflow trail - real weekly candidate-arrival counts (appliedAt, createdAt
            fallback) over the trailing 8 calendar weeks; the comet head is this week. */}
        <Reveal i={6}>
          <SectionCard title="Inflow trail" icon="motion"
            headRight={<Pill tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>comet head = this week</Pill>}>
            <CometTrail points={inflowWeekly ?? []} emptyLabel="The inflow trail appears once candidates start arriving." />
          </SectionCard>
        </Reveal>
        <div style={{ height: 16 }} />

        {/* Sources over time - the same real weekly candidate arrivals as the comet
            trail above, but SPLIT BY SOURCE: a stacked river of the top channels over
            the trailing 8 weeks (the rest folded into "Other"). */}
        <Reveal i={7}>
          <SectionCard title="Sources over time" icon="motion"
            headRight={<Pill tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>weekly arrivals by channel</Pill>}>
            <StreamGraph
              buckets={inflowBySource?.buckets ?? []}
              series={inflowBySource?.series ?? []}
              emptyLabel="Per-source inflow appears once candidates start arriving."
            />
          </SectionCard>
        </Reveal>
        <div style={{ height: 16 }} />

        {/* KPIs */}
        <div className="cd-grid-kpi an-kpis" style={{ marginBottom: 18 }}>
          {a.kpis.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
        </div>

        {/* AI insights */}
        <Reveal i={4}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--ai-tint), transparent 65%)", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Insights</span><Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">analytics agent</Pill></div>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ranked by severity · grounded in your data</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 0 }} className="an-insights">
              {a.insights.map((ins, i) => (
                <div key={i} style={{ padding: "16px 18px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><SevDot sev={ins.sev} /><span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: ins.sev === "critical" ? "var(--danger)" : ins.sev === "warning" ? "var(--warn)" : "var(--info)" }}>{ins.sev}</span></div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 6 }}>{ins.finding}</div>
                  <p style={{ margin: "0 0 9px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{ins.evidence}</p>
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12, color: "var(--ai-ink)", fontWeight: 600, lineHeight: 1.45 }}><Icon name="bolt" size={13} style={{ flexShrink: 0, marginTop: 2 }} />{ins.rec}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* funnel + diversity */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" }} className="an-row">
          <Reveal i={5}><SectionCard title="Pipeline funnel" icon="radar" headRight={a.funnelConversion ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{a.funnelConversion}</Pill> : undefined}>
            <div style={{ height: 260 }}>
              {funnelData.some((s) => s.value > 0)
                ? <StepCascade height={260} stages={funnelData.map((s) => ({ label: s.name, n: s.value }))}
                    valueLabel={(n) => n.toLocaleString()}
                    emptyLabel="Pipeline funnel - no candidates in pipeline yet" />
                : <EmptyChart label="Pipeline funnel - no candidates in pipeline yet" />}
            </div>
          </SectionCard></Reveal>
          <Reveal i={6}><SectionCard title="Adverse impact (four-fifths)" icon="grid" action="EEOC report">
            <div style={{ height: 260 }}>
              {diversityBars.length
                ? <BarsChart
                    data={diversityBars}
                    categoryKey="group"
                    series={[{ key: "ratio", name: "Impact ratio" }]}
                    valueFormatter={(v) => Number(v).toFixed(2)}
                    threshold={{ value: 0.8, label: "0.80 four-fifths" }}
                    colorFn={(row) => (row.flagged ? CHART_COLORS.danger : CHART_COLORS.brand)}
                  />
                : <EmptyChart label="Diversity - no demographic data yet" />}
            </div>
          </SectionCard></Reveal>
        </div>

        {/* time-to-hire trend + by dept */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" }} className="an-row">
          <Reveal i={7}><SectionCard title="Time-to-hire trend" icon="chart" headRight={hasTth && a.tthDelta ? <Pill mono tone="var(--ink-2)" bg="var(--surface-2)">{a.tthDelta}</Pill> : undefined}>
            {/* Real monthly avg-days-to-hire with dashed median + p90 bands from
                /api/analytics/time-to-hire. Empty -> honest EmptyChart. */}
            <div style={{ height: 200 }}>
              {hasTth
                ? <TrendChart
                    data={tthData}
                    xKey="label"
                    series={[
                      { key: "avgDays", name: "Avg days", color: CHART_COLORS.brand, type: "area" },
                      { key: "medianDays", name: "Median", color: CHART_COLORS.info, type: "line", dashed: true },
                      { key: "p90Days", name: "P90", color: CHART_COLORS.violet, type: "line", dashed: true },
                    ]}
                    valueFormatter={(v) => `${Math.round(Number(v))}d`}
                  />
                : <EmptyChart label="Time-to-hire trend - no hires yet" />}
            </div>
          </SectionCard></Reveal>
          <Reveal i={8}><SectionCard title="By department" icon="briefcase">
            {/* No per-department time-to-hire series from the gateway today. */}
            <div style={{ height: 200 }}><EmptyChart label="By department - awaiting analytics aggregator" /></div>
          </SectionCard></Reveal>
        </div>

        {/* source effectiveness - real hires per source (falls back to real application
            volume, labelled, until the first hires land) */}
        <Reveal i={9}><SectionCard title="Source effectiveness" icon="radar" action="Details"
          headRight={sourceBars.length ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{sourceMetric.toLowerCase()} per channel</Pill> : undefined}>
          <div style={{ height: Math.max(180, sourceBars.length * 34 + 40) }}>
            {sourceBars.length
              ? <BarsChart
                  data={sourceBars}
                  categoryKey="src"
                  layout="horizontal"
                  series={[{ key: "n", name: sourceMetric }]}
                  valueFormatter={(v) => Number(v).toLocaleString()}
                  colorFn={(row) => row.color || CHART_COLORS.brand}
                />
              : <EmptyChart label="Source effectiveness - open the Details page for the live breakdown" />}
          </div>
        </SectionCard></Reveal>
      </div>
    </div>
  );
}
