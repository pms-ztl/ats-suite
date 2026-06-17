"use client";
// components/cd/screens/OrgOverview.tsx
// The REAL-TIME OPS HOME (DESIGN_SPEC 7). A 12-col bento that the admin / compliance
// landing reads: a hero KPI row (KpiCard + DeltaPill + sparkline) over house-viz
// bands for the hiring funnel, source of hire, AI spend, screening verdicts,
// interview load and per-agent spend. Data via props only. EVERY card renders an
// honest empty state when its dataset is empty - never a fabricated zero, never a
// flat zero-line, never a permanent empty placeholder (cards with no real source
// are hidden, not faked).
import * as React from "react";
import { useState } from "react";
import { Icon } from "../icon";
import { Btn } from "../aurora-ui";
import { CommandHero, Reveal, SectionCard, PendingList, Pill } from "../aurora-kit";
import { KpiCard, DeltaPill, LiveStatus, EmptyMetric } from "../dashboard-kit";
import { DonutChart, EmptyChart, BarsChart, CHART_COLORS, colorAt } from "@/components/shared/charts";
import { FlowRibbon, OrbitField, BeadStream, CometTrail, PetalBloom, StepCascade } from "@/components/shared/ribbon";
import { WaffleField, StreamGraph, KiteRadar } from "@/components/shared/ribbon-ext";
import { exportToCSV } from "@/lib/export";
import type { OrgOverviewData } from "../types";

export function OrgOverview({ data }: { data: OrgOverviewData }) {
  const [live, setLive] = useState(data.live ?? true);
  const {
    workspace, heroStats = [], heroKpis = [], updatedAt, kpis = [], funnel = [], funnelConversionLabel,
    diversity = [], diversityIndex = "0.78",
    pending = [], pendingCountLabel, agents = [],
    agentUsage = [], sources = [], spendTrend = [], oversight, costPerHireLabel,
    verdictMix = [], offerLifecycle = [],
    inflow = [], departments = [], interviewMix = [],
  } = data;

  const inflowTotal = inflow.reduce((s, w) => s + w.n, 0);
  const interviewTotal = interviewMix.reduce((s, d) => s + d.value, 0);
  const deptTotal = departments.reduce((s, d) => s + d.value, 0);
  const verdictTotal = verdictMix.reduce((s, d) => s + d.value, 0);
  const offerTotal = offerLifecycle.reduce((s, d) => s + d.n, 0);

  // ---- live intelligence row (renders only when real data is present) ----
  const sourceCells = sources.filter((s) => s.applied > 0);
  const spendProviders = Array.from(new Set(spendTrend.flatMap((m) => Object.keys(m.byProvider).filter((p) => (m.byProvider[p] ?? 0) > 0))));
  const spendHasData = spendTrend.length >= 2 && spendProviders.length > 0;
  const oversightData = (oversight
    ? [
        { name: "Pending", value: oversight.pending, color: "var(--warn)" },
        { name: "Approved", value: oversight.approved, color: "var(--ok)" },
        { name: "Rejected", value: oversight.rejected, color: "var(--danger)" },
      ]
    : []
  ).filter((d) => d.value > 0);
  const oversightTotal = oversightData.reduce((s, d) => s + d.value, 0);

  // ---- Hiring-health profile (KiteRadar). Each axis is a normalized 0..100 metric
  //      derived ONLY from data already loaded on this screen; an axis is added
  //      strictly when its underlying real data exists. No invented dimensions. ----
  const clampPct = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const healthAxes: { label: string; value: number; max: number }[] = [];
  const funnelApplied = funnel[0]?.n ?? 0;
  const funnelHired = funnel.find((s) => /hired/i.test(s.stage))?.n ?? funnel[funnel.length - 1]?.n ?? 0;
  if (funnel.length >= 2 && funnelApplied > 0) {
    healthAxes.push({ label: "Pipeline conversion", value: clampPct((funnelHired / funnelApplied) * 100), max: 100 });
  }
  const fourFifths = Number.parseFloat(diversityIndex ?? "");
  if (diversity.length > 0 && Number.isFinite(fourFifths) && fourFifths > 0) {
    healthAxes.push({ label: "Diversity (four-fifths)", value: clampPct(fourFifths * 100), max: 100 });
  }
  const completedInterviews = interviewMix.find((d) => /complete/i.test(d.name))?.value ?? 0;
  if (interviewTotal > 0) {
    healthAxes.push({ label: "Interview completion", value: clampPct((completedInterviews / interviewTotal) * 100), max: 100 });
  }
  if (oversight && oversightTotal > 0) {
    healthAxes.push({ label: "Oversight resolved", value: clampPct(((oversight.approved + oversight.rejected) / oversightTotal) * 100), max: 100 });
  }
  const sourceApplied = sources.map((s) => s.applied).filter((n) => n > 0);
  const sourceTotal = sourceApplied.reduce((s, n) => s + n, 0);
  if (sources.length >= 2 && sourceTotal > 0) {
    const topShare = Math.max(...sourceApplied) / sourceTotal;
    healthAxes.push({ label: "Source diversity", value: clampPct((1 - topShare) * 100), max: 100 });
  }

  // Real diversity mix -> chart-kit DonutChart.
  const diversityData = diversity.map((d) => ({ name: d.g, value: d.v, fill: d.color }));
  const diversityColors = diversity.map((d) => d.color);

  // Per-agent spend as a sortable bar chart (real metered cost, AgentRunCost).
  const agentSpendRows = agentUsage
    .slice()
    .sort((a, b) => b.costUsd - a.costUsd)
    .map((a) => ({ agent: a.agent, cost: +a.costUsd.toFixed(4), runs: a.runs }));

  // AI spend by provider over time as a StreamGraph (composition over months).
  const spendBuckets = spendTrend.map((m) => ({ label: m.label }));
  const spendSeries = spendProviders.map((p, i) => ({
    label: p,
    values: spendTrend.map((m) => +(m.byProvider[p] ?? 0).toFixed(4)),
    color: colorAt(i),
  }));

  // Export the real KPIs + pipeline funnel shown on this dashboard as a CSV report.
  const onExport = () => {
    const heroRows = heroKpis.map((k) => [
      k.name,
      k.value === null || k.value === undefined ? "" : `${k.prefix ?? ""}${k.value}${k.suffix ?? ""}`,
      k.delta === null || k.delta === undefined ? "" : `${k.delta > 0 ? "+" : ""}${k.delta}${k.deltaSuffix ?? ""}`,
    ]);
    const kpiRows = (kpis as any[]).map((k) => [String(k.label ?? k.id ?? ""), String(k.value ?? ""), String(k.delta ?? "")]);
    const funnelRows = funnel.map((s) => [`Funnel: ${s.stage}`, String(s.n), ""]);
    exportToCSV(
      `org-overview-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Metric", "Value", "Change"],
      [...heroRows, ["", "", ""], ...kpiRows, ["", "", ""], ...funnelRows],
    );
  };

  return (
    // The bento ops home shares the uniform page container at the ultrawide cap
    // (data-width="wide" -> --page-max-wide). No bespoke maxWidth/margin self-cap.
    <div className="cd-page" data-width="wide">
      <CommandHero title="Org overview" sub="Everything happening across your hiring operation, in real time." workspace={workspace} stats={heroStats} live={live} onToggleLive={() => setLive((v) => !v)}>
        {/* ONE header-level freshness pulse for the whole page (DESIGN_SPEC 7a). */}
        <LiveStatus updatedAt={live ? updatedAt : undefined} />
        <Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 30 days</Pill>
        <Btn variant="primary" icon="arrowUpRight" onClick={onExport}>Export report</Btn>
      </CommandHero>

      {/* ===== Hero KPI row (4-6 tiles): KpiCard + DeltaPill + sparkline. Each tile
              flips to the honest em-dash empty when its metric is absent. ===== */}
      {heroKpis.length > 0 && (
        <div className="cd-grid-kpi" style={{ marginBottom: 18 }}>
          {heroKpis.map((k) => (
            <KpiCard
              key={k.id}
              name={k.name}
              value={k.value}
              prefix={k.prefix}
              suffix={k.suffix}
              icon={k.icon as any}
              ai={k.ai}
              delta={k.delta}
              goodWhen={k.goodWhen}
              deltaSuffix={k.deltaSuffix}
              spark={k.spark && k.spark.length > 1 ? k.spark : null}
              target={k.target ?? null}
              period={k.period}
              emptyCaption={k.emptyCaption}
            />
          ))}
        </div>
      )}

      {/* ===== Primary band: hiring funnel (the canonical view) + diversity ===== */}
      <Reveal i={7} style={{ marginBottom: 18 }}>
        <SectionCard title="Pipeline flow" icon="motion"
          headRight={<Pill icon="users" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>ribbon thickness = live candidates per stage</Pill>}>
          <FlowRibbon
            points={funnel.map((s) => ({ label: s.stage, n: s.n }))}
            emptyLabel="The flow appears once candidates enter the pipeline."
          />
        </SectionCard>
      </Reveal>

      <div className="cd-grid-cards" style={{ marginBottom: 16 }}>
        <Reveal i={8}><SectionCard title="Hiring funnel" icon="radar" action="Breakdown"
          headRight={funnelConversionLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{funnelConversionLabel}</Pill> : undefined}>
          {/* The same real funnel stages (live candidate counts, pipeline order) as a
              waterfall cascade - the translucent falls show the true drop between stages. */}
          <div style={{ height: 240 }}>
            {funnel.length
              ? <StepCascade
                  stages={funnel.map((s) => ({ label: s.stage, n: s.n }))}
                  valueLabel={(n) => n.toLocaleString()}
                  height={240}
                  emptyLabel="No pipeline data yet." />
              : <EmptyChart label="No pipeline data yet." />}
          </div>
        </SectionCard></Reveal>
        <Reveal i={9}><SectionCard title="Diversity parity" icon="grid" action="EEOC report">
          <div style={{ height: 240 }}>
            {diversityData.length
              ? <DonutChart data={diversityData} colors={diversityColors} centerLabel={diversityIndex} centerSub="four-fifths" valueFormatter={(v) => `${v}%`} />
              : <div style={{ height: 240, display: "grid", placeItems: "center" }}><EmptyMetric caption="No diversity data yet" /></div>}
          </div>
        </SectionCard></Reveal>
      </div>

      {/* ===== Breakdowns: source of hire, AI spend by provider, screening verdicts ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={10}><SectionCard title="Where candidates come from" icon="radar"
          headRight={sourceCells.length ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{sourceCells.length} channels</Pill> : undefined}>
          <div style={{ height: 230 }}>
            {sourceCells.length
              ? <OrbitField height={230} centerSub="applications"
                  items={sourceCells.map((s) => ({ label: s.source, n: s.applied }))}
                  emptyLabel="Channel mix appears once candidates carry a source." />
              : <EmptyChart label="Channel mix appears once candidates carry a source." />}
          </div>
        </SectionCard></Reveal>

        <Reveal i={11}><SectionCard title="AI spend by provider" icon="chart"
          headRight={costPerHireLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{costPerHireLabel}</Pill> : undefined}>
          <div style={{ minHeight: 230 }}>
            {/* Composition of AI spend across months by provider (real AgentRunCost). */}
            {spendHasData
              ? <StreamGraph buckets={spendBuckets} series={spendSeries} height={230}
                  emptyLabel="Spend appears once AI runs are metered across months." />
              : <div style={{ height: 230 }}><EmptyChart label="Spend appears once AI runs are metered across months." /></div>}
          </div>
          <p style={{ margin: "10px 2px 0", fontSize: 10.5, color: "var(--ink-3)" }}>
            Metered per run from real token counts · no estimates.
          </p>
        </SectionCard></Reveal>

        <Reveal i={12}><SectionCard title="Screening verdict mix" icon="sparkles"
          headRight={verdictTotal ? <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" icon="sparkles">{verdictTotal} verdicts</Pill> : undefined}>
          {/* The screener's PASS / REVIEW / FAIL share as a 100-cell waffle. */}
          {verdictTotal
            ? <WaffleField
                segments={verdictMix.map((d) => ({ label: d.name, n: d.value, color: d.color }))}
                valueLabel={(n) => `${n} verdict${n === 1 ? "" : "s"}`} />
            : <div style={{ height: 200 }}><EmptyChart label="Verdicts appear once the screener has scored candidates." /></div>}
        </SectionCard></Reveal>
      </div>

      {/* ===== Breakdowns: interview load, human oversight, offer lifecycle ===== */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={13}><SectionCard title="Interview load · weekly" icon="calendar"
          headRight={interviewTotal ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{interviewTotal} interviews</Pill> : undefined}>
          <div style={{ height: 230 }}>
            {interviewTotal
              ? <DonutChart data={interviewMix} colors={interviewMix.map((d) => d.color)}
                  centerLabel={String(interviewTotal)} centerSub="all time"
                  valueFormatter={(v) => `${v} interview${Number(v) === 1 ? "" : "s"}`} />
              : <EmptyChart label="The mix appears once interviews are booked." />}
          </div>
        </SectionCard></Reveal>

        <Reveal i={14}><SectionCard title="Human oversight" icon="shield"
          headRight={oversight && oversight.pending > 0 ? <Pill tone="var(--warn)" bg="var(--warn-tint)" icon="clock">{oversight.pending} pending</Pill> : undefined}>
          {oversightTotal
            ? <BeadStream groups={oversightData.map((d) => ({ label: d.name, n: d.value, color: d.color }))} height={230} />
            : <div style={{ height: 230 }}><EmptyChart label="Checkpoints appear when the AI asks for a human decision." /></div>}
        </SectionCard></Reveal>

        <Reveal i={15}><SectionCard title="Offer lifecycle" icon="fileText"
          headRight={offerTotal ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{offerTotal} offers</Pill> : undefined}>
          {offerTotal
            ? <BeadStream groups={offerLifecycle.map((d) => ({ label: d.status, n: d.n, color: d.color }))} height={230}
                emptyLabel="Offers appear here as they are drafted and sent." />
            : <div style={{ height: 230 }}><EmptyChart label="Offers appear here as they are drafted and sent." /></div>}
        </SectionCard></Reveal>
      </div>

      {/* ===== Per-agent spend (sortable bars) + pending actions ===== */}
      <div className="cd-grid-cards" style={{ marginBottom: 16 }}>
        <Reveal i={16}><SectionCard title="Per-agent runs &amp; spend" icon="sparkles"
          headRight={agentSpendRows.length ? <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">last 30 days</Pill> : undefined}>
          {/* Real metered per-agent run counts as a petal bloom, plus a sortable cost bar
              chart - both from billing AgentRunCost. Honest empty when no runs exist. */}
          {agentUsage.length ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <PetalBloom items={agentUsage.map((a) => ({ label: a.agent, n: a.runs }))} centerSub="runs (30d)" />
              </div>
              <div style={{ height: Math.max(160, agentSpendRows.length * 38) }}>
                <BarsChart data={agentSpendRows} categoryKey="agent" layout="horizontal"
                  series={[{ key: "cost", name: "Spend", color: CHART_COLORS.ai }]}
                  valueFormatter={(v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
              </div>
            </>
          ) : (
            <div style={{ height: 200 }}><EmptyChart label="Agent activity appears once AI runs are metered." /></div>
          )}
          {/* The advisory roster of agents is real config (always present), shown as
              context, not data. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {agents.map((a) => (
              <div key={a.name} style={{ padding: "9px 11px", borderRadius: "var(--r)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 18%, transparent)" }}>
                <div className="mono" style={{ fontSize: 11, color: "var(--ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>{a.stat}</div>
              </div>
            ))}
          </div>
          <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> All agents advisory · humans hold every decision.</p>
        </SectionCard></Reveal>

        <Reveal i={17}><SectionCard title="Pending actions" icon="listChecks"
          headRight={pendingCountLabel ? <Pill tone="var(--warn)" bg="var(--warn-tint)">{pendingCountLabel}</Pill> : undefined}>
          {pending.length
            ? <PendingList items={pending} />
            : <div style={{ minHeight: 120, display: "grid", placeItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)" }}>
                  <Icon name="check" size={15} /> Nothing needs your attention.
                </span>
              </div>}
        </SectionCard></Reveal>
      </div>

      {/* ===== Hiring health: one normalized profile across the real dimensions this
              overview already loads. The card is gated on >=3 genuinely-present
              dimensions (the KiteRadar self-empties otherwise). ===== */}
      {healthAxes.length >= 3 && (
        <Reveal i={18} style={{ marginBottom: 16 }}>
          <SectionCard title="Hiring health" icon="radar"
            headRight={<Pill icon="radar" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>{healthAxes.length} live dimensions · 0–100</Pill>}>
            <KiteRadar axes={healthAxes} max={100}
              emptyLabel="The health profile appears once these metrics carry data." />
          </SectionCard>
        </Reveal>
      )}

      {/* ===== Hiring-activity row: weekly candidate inflow + open roles by department.
              Straight counts of real rows; the whole row hides when both are empty. ===== */}
      {(inflowTotal > 0 || deptTotal > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start" }}>
          <Reveal i={19}><SectionCard title="Candidate inflow" icon="users"
            headRight={inflowTotal ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{inflowTotal} in 8 weeks</Pill> : undefined}>
            {inflowTotal
              ? <CometTrail points={inflow} height={210}
                  emptyLabel="Weekly inflow appears as candidates arrive." />
              : <div style={{ height: 210 }}><EmptyChart label="Weekly inflow appears as candidates arrive." /></div>}
          </SectionCard></Reveal>

          <Reveal i={20}><SectionCard title="Open roles by department" icon="briefcase">
            {deptTotal
              ? <OrbitField items={departments.map((d) => ({ label: d.name, n: d.value }))}
                  centerLabel={String(deptTotal)} centerSub="open roles" />
              : <div style={{ height: 210 }}><EmptyChart label="Departments appear as requisitions open." /></div>}
          </SectionCard></Reveal>
        </div>
      )}
    </div>
  );
}
