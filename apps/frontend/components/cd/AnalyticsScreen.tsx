"use client";
// AnalyticsScreen.tsx, Analytics dashboard (funnel, time-to-hire, source-effectiveness,
// diversity, AI insights). Ported byte-faithful from screen-analytics.jsx. Data via props only.
import React from "react";
import dynamic from "next/dynamic";
import { Pill, Reveal, KPICard, SectionCard } from "./aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import {
  FunnelViz, BarsChart, TrendChart, EmptyChart, CHART_COLORS,
} from "@/components/shared/charts";
import type { AnalyticsData, AnalyticsInsight } from "./types";
import type { FairnessMetric } from "@/lib/types";

// One real monthly time-to-hire row (from /api/analytics/time-to-hire).
export interface TthRow { label: string; avgDays: number; medianDays: number; p90Days: number; hires: number; }

// Live 3D pipeline funnel. The three.js stack must never run during SSR.
const PipelineFlow = dynamic(() => import("@/components/shared/hero3d").then((m) => m.PipelineFlow), {
  ssr: false,
  loading: () => <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card/60" />,
});

function SevDot({ sev }: { sev: AnalyticsInsight["sev"] }) {
  const c = sev === "critical" ? "var(--danger)" : sev === "warning" ? "var(--warn)" : "var(--info)";
  return <span style={{ width: 8, height: 8, borderRadius: 99, background: c, flexShrink: 0 }} />;
}

export function AnalyticsScreen({ data, fairness, tthRows, onExport }: { data: AnalyticsData; fairness?: FairnessMetric[]; tthRows?: TthRow[]; onExport?: () => void }) {
  const a = data;

  // Real time-to-hire trend (avg line + dashed median + dashed p90) from the
  // /analytics/time-to-hire endpoint. Empty array -> honest EmptyChart below.
  const tthData = (tthRows ?? []).map((r) => ({
    label: r.label, avgDays: r.avgDays, medianDays: r.medianDays, p90Days: r.p90Days,
  }));
  const hasTth = tthData.length > 0;

  // Pipeline funnel - real stage counts from getFunnel (pipelineData aggregate).
  const funnelData = a.funnel.map((s) => ({ name: s.stage, value: s.n, fill: s.color }));

  // 3D pipeline funnel - same real per-stage candidate counts (stage -> name, n -> value).
  // When funnel is empty the hero renders its own no-data state.
  const flowStages = a.funnel.map((s) => ({ name: s.stage, value: s.n }));

  // Diversity / four-fifths - real per-group impact ratio from getAdverseImpact.
  // The 0.80 line is the legal four-fifths threshold; a flagged group renders danger.
  const diversityBars = (fairness ?? []).map((m) => ({
    group: m.group,
    ratio: +(m.impactRatio ?? 0).toFixed(2),
    flagged: !!m.flagged || (m.impactRatio ?? 1) < 0.8,
  }));

  // Source effectiveness - real hires per source ranked desc (sources from props).
  const sourceBars = a.sources
    .slice()
    .sort((x, y) => y.hires - x.hires)
    .map((s) => ({ src: s.src, hires: s.hires, color: s.color }));
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Analytics</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Hiring performance across {a.orgName} · {a.range}.</p></div>
          <div style={{ display: "flex", gap: 9 }}>
            <Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>{a.range}</Pill>
            <Btn variant="primary" icon="arrowUpRight" onClick={onExport}>Export</Btn>
          </div>
        </div>

        {/* Live 3D pipeline funnel - drag to rotate. Same real stage counts as the funnel chart. */}
        <Reveal i={3}>
          <SectionCard title="Pipeline flow - drag to rotate" icon="radar">
            <PipelineFlow stages={flowStages} />
          </SectionCard>
        </Reveal>
        <div style={{ height: 16 }} />

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }} className="an-kpis">
          {a.kpis.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
        </div>

        {/* AI insights */}
        <Reveal i={4}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--ai-tint), transparent 65%)", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Insights</span><Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">analytics agent</Pill></div>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ranked by severity · grounded in your data</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }} className="an-insights">
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
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }} className="an-row">
          <Reveal i={5}><SectionCard title="Pipeline funnel" icon="radar" headRight={a.funnelConversion ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{a.funnelConversion}</Pill> : undefined}>
            <div style={{ height: 260 }}>
              {funnelData.some((s) => s.value > 0)
                ? <FunnelViz data={funnelData} valueFormatter={(v) => Number(v).toLocaleString()} />
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
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }} className="an-row">
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

        {/* source effectiveness - real hires per source, ranked desc */}
        <Reveal i={9}><SectionCard title="Source effectiveness" icon="radar" action="Details">
          <div style={{ height: Math.max(180, sourceBars.length * 34 + 40) }}>
            {sourceBars.length
              ? <BarsChart
                  data={sourceBars}
                  categoryKey="src"
                  layout="horizontal"
                  series={[{ key: "hires", name: "Hires" }]}
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
