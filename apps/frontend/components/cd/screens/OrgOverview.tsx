"use client";
// components/screens/OrgOverview.tsx
// Admin org-wide dashboard, ported pixel-exact from dash-admin.jsx (AdminDash).
// Data via props only. Every list/array renders a graceful empty state when [].
import * as React from "react";
import { useState } from "react";
import { Icon } from "../icon";
import { Btn, EmptyHint } from "../aurora-ui";
import {
  CommandHero, KPICard, Reveal, SectionCard, Timeline, PendingList, Pill,
} from "../aurora-kit";
import { DonutChart, TrendChart, EmptyChart, CHART_COLORS, TreemapChart, BarsChart, colorAt } from "@/components/shared/charts";
import { FlowRibbon, OrbitField, BeadStream, CometTrail, PetalBloom, StepCascade, HaloStack } from "@/components/shared/ribbon";
import { KiteRadar } from "@/components/shared/ribbon-ext";
import { exportToCSV } from "@/lib/export";
import type { OrgOverviewData } from "../types";

export function OrgOverview({ data }: { data: OrgOverviewData }) {
  const [live, setLive] = useState(data.live ?? true);
  const {
    workspace, heroStats = [], kpis = [], funnel = [], funnelConversionLabel,
    diversity = [], diversityIndex = "0.78", trend = [], trendLabels = [], trendDeltaLabel,
    activity = [], pending = [], pendingCountLabel, agents = [],
    agentUsage = [], sources = [], spendTrend = [], oversight, costPerHireLabel,
    inflow = [], departments = [], interviewMix = [],
  } = data;

  const inflowTotal = inflow.reduce((s, w) => s + w.n, 0);
  const interviewTotal = interviewMix.reduce((s, d) => s + d.value, 0);
  const deptTotal = departments.reduce((s, d) => s + d.value, 0);

  // ---- live intelligence row (renders only when real data is present) ----
  const sourceCells = sources.filter((s) => s.applied > 0).map((s, i) => ({ name: s.source, size: s.applied, fill: colorAt(i) }));
  const spendProviders = Array.from(new Set(spendTrend.flatMap((m) => Object.keys(m.byProvider).filter((p) => (m.byProvider[p] ?? 0) > 0))));
  const spendRows = spendTrend
    .filter((m) => spendProviders.some((p) => (m.byProvider[p] ?? 0) > 0))
    .map((m) => ({ label: m.label, ...Object.fromEntries(spendProviders.map((p) => [p, +(m.byProvider[p] ?? 0).toFixed(4)])) }));
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
  // 1. Pipeline conversion: hired / applied across the real funnel.
  const funnelApplied = funnel[0]?.n ?? 0;
  const funnelHired = funnel.find((s) => /hired/i.test(s.stage))?.n ?? funnel[funnel.length - 1]?.n ?? 0;
  if (funnel.length >= 2 && funnelApplied > 0) {
    healthAxes.push({ label: "Pipeline conversion", value: clampPct((funnelHired / funnelApplied) * 100), max: 100 });
  }
  // 2. Diversity (four-fifths ratio, 0..1 -> %); real only when diversity segments exist.
  const fourFifths = Number.parseFloat(diversityIndex ?? "");
  if (diversity.length > 0 && Number.isFinite(fourFifths) && fourFifths > 0) {
    healthAxes.push({ label: "Diversity (four-fifths)", value: clampPct(fourFifths * 100), max: 100 });
  }
  // 3. Interview completion: completed / all interviews from the live status mix.
  const completedInterviews = interviewMix.find((d) => /complete/i.test(d.name))?.value ?? 0;
  if (interviewTotal > 0) {
    healthAxes.push({ label: "Interview completion", value: clampPct((completedInterviews / interviewTotal) * 100), max: 100 });
  }
  // 4. Oversight resolution: approved + rejected / all HITL checkpoints.
  if (oversight && oversightTotal > 0) {
    healthAxes.push({ label: "Oversight resolved", value: clampPct(((oversight.approved + oversight.rejected) / oversightTotal) * 100), max: 100 });
  }
  // 5. Source diversity: share of applicants NOT from the single top channel.
  const sourceApplied = sources.map((s) => s.applied).filter((n) => n > 0);
  const sourceTotal = sourceApplied.reduce((s, n) => s + n, 0);
  if (sources.length >= 2 && sourceTotal > 0) {
    const topShare = Math.max(...sourceApplied) / sourceTotal;
    healthAxes.push({ label: "Source diversity", value: clampPct((1 - topShare) * 100), max: 100 });
  }

  // Real diversity mix (from /platform/unified-overview diversityData) -> chart-kit DonutChart.
  const diversityData = diversity.map((d) => ({ name: d.g, value: d.v, fill: d.color }));
  const diversityColors = diversity.map((d) => d.color);
  // Time-to-hire trend: real series only (days per period). The wrapper passes [] until
  // the backend exposes a history series, so this maps to an EmptyChart below.
  const trendData = trend.map((v, i) => ({ t: trendLabels[i] ?? `P${i + 1}`, days: v }));

  // Export the real KPIs + pipeline funnel shown on this dashboard as a CSV report.
  const onExport = () => {
    const kpiRows = (kpis as any[]).map((k) => [String(k.label ?? k.id ?? ""), String(k.value ?? ""), String(k.delta ?? k.deltaLabel ?? k.change ?? "")]);
    const funnelRows = funnel.map((s) => [`Funnel: ${s.stage}`, String(s.n), ""]);
    exportToCSV(
      `org-overview-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Metric", "Value", "Change"],
      [...kpiRows, ["", "", ""], ...funnelRows],
    );
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <CommandHero title="Org overview" sub="Everything happening across your hiring operation, in real time." workspace={workspace} stats={heroStats} live={live} onToggleLive={() => setLive((v) => !v)}>
        <Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 30 days</Pill>
        <Btn variant="primary" icon="arrowUpRight" onClick={onExport}>Export report</Btn>
      </CommandHero>

      {/* Pipeline flow ribbon hero - the same real funnel stages (live candidate
          counts per stage) rendered as the house flow visualization. */}
      <Reveal i={7} style={{ marginBottom: 18 }}>
        <SectionCard title="Pipeline flow" icon="motion"
          headRight={<Pill icon="users" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>ribbon thickness = live candidates per stage</Pill>}>
          <FlowRibbon
            points={funnel.map((s) => ({ label: s.stage, n: s.n }))}
            emptyLabel="The flow appears once candidates enter the pipeline."
          />
        </SectionCard>
      </Reveal>

      {/* 8 KPIs */}
      {kpis.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id ?? k.label} k={k} i={i} />)}
        </div>
      )}

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={8}><SectionCard title="Pipeline funnel" icon="radar" action="Breakdown" headRight={funnelConversionLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{funnelConversionLabel}</Pill> : undefined}>
          {/* Same real funnel stages (live candidate counts, pipeline order) as a
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
        <Reveal i={9}><SectionCard title="Diversity" icon="grid" action="EEOC report">
          <div style={{ height: 240 }}>
            {diversityData.length ? <DonutChart data={diversityData} colors={diversityColors} centerLabel={diversityIndex} centerSub="four-fifths" valueFormatter={(v) => `${v}%`} /> : <EmptyChart label="No diversity data yet." />}
          </div>
        </SectionCard></Reveal>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={10}><SectionCard title="Time-to-hire trend" icon="chart" headRight={trendDeltaLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)" icon="arrowUpRight">{trendDeltaLabel}</Pill> : undefined}>
            <div style={{ height: 200 }}>
              {/* Real series only. The backend does not yet expose a time-to-hire history
                  series (the wrapper passes []), so this stays an honest empty state. */}
              {trendData.length
                ? <TrendChart data={trendData} xKey="t" series={[{ key: "days", name: "Time to hire", color: CHART_COLORS.brand }]} valueFormatter={(v) => `${v}d`} />
                : <EmptyChart label="Not enough history yet." />}
            </div>
          </SectionCard></Reveal>
          <Reveal i={12}><SectionCard title="Activity" icon="bolt" action="Full log">
            {activity.length ? <Timeline items={activity} /> : <EmptyHint icon="bolt" text="No recent activity." />}
          </SectionCard></Reveal>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={11}><SectionCard title="Pending actions" icon="listChecks" headRight={pendingCountLabel ? <Pill tone="var(--warn)" bg="var(--warn-tint)">{pendingCountLabel}</Pill> : undefined}>
            {pending.length ? <PendingList items={pending} /> : <EmptyHint icon="listChecks" text="Nothing needs your attention." />}
          </SectionCard></Reveal>
          <Reveal i={13}><SectionCard title="Agent activity" icon="sparkles"
            headRight={agentUsage.length ? <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">last 30 days</Pill> : undefined}>
            {/* Real metered per-agent workload (billing AgentRunCost): runs in the last
                30 days as a petal bloom (petal length = real run count, hub = total runs).
                Falls back to the honest empty state when no runs exist. */}
            <div style={{ marginBottom: 12 }}>
              {agentUsage.length
                ? <PetalBloom
                    items={agentUsage.map((a) => ({ label: a.agent, n: a.runs }))}
                    centerSub="runs (30d)" />
                : <div style={{ height: 70 }}><EmptyChart label="Agent activity appears once AI runs are metered" /></div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {agents.map((a) => (
                <div key={a.name} style={{ padding: "9px 11px", borderRadius: "var(--r)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 18%, transparent)" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>{a.stat}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> All agents advisory · humans hold every decision.</p>
          </SectionCard></Reveal>
        </div>
      </div>

      {/* ---- Live intelligence row: channel mix, AI spend, human oversight. Each card
            renders only from real records (Candidate.source, AgentRunCost, HitlCheckpoint)
            and degrades to an honest empty state - never sample data. ---- */}
      {(sourceCells.length > 0 || spendRows.length > 0 || oversightTotal > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
          <Reveal i={14}><SectionCard title="Where candidates come from" icon="radar"
            headRight={sourceCells.length ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{sourceCells.length} channels</Pill> : undefined}>
            <div style={{ height: 230 }}>
              {sourceCells.length
                ? <TreemapChart data={sourceCells} valueFormatter={(v) => `${v} applied`} />
                : <EmptyChart label="Channel mix appears once candidates carry a source." />}
            </div>
          </SectionCard></Reveal>

          <Reveal i={15}><SectionCard title="AI spend by provider" icon="chart"
            headRight={costPerHireLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{costPerHireLabel}</Pill> : undefined}>
            <div style={{ height: 230 }}>
              {spendRows.length
                ? <BarsChart data={spendRows} categoryKey="label" layout="horizontal"
                    series={spendProviders.map((p, i) => ({ key: p, name: p, color: colorAt(i), stackId: "spend" }))}
                    valueFormatter={(v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
                : <EmptyChart label="Spend appears once AI runs are metered." />}
            </div>
            <p style={{ margin: "10px 2px 0", fontSize: 10.5, color: "var(--ink-3)" }}>
              Metered per run from real token counts · no estimates.
            </p>
          </SectionCard></Reveal>

          <Reveal i={16}><SectionCard title="Human oversight" icon="shield"
            headRight={oversight && oversight.pending > 0 ? <Pill tone="var(--warn)" bg="var(--warn-tint)" icon="clock">{oversight.pending} pending</Pill> : undefined}>
            {oversightTotal
              ? <BeadStream groups={oversightData.map((d) => ({ label: d.name, n: d.value, color: d.color }))} />
              : <div style={{ height: 230 }}><EmptyChart label="Checkpoints appear when the AI asks for a human decision." /></div>}
          </SectionCard></Reveal>
        </div>
      )}

      {/* ---- Hiring health: a single normalized profile across the real dimensions
            this overview already loads (pipeline conversion, diversity ratio, interview
            completion, oversight resolution, source diversity). The KiteRadar self-empties
            below 3 axes; we gate the whole card on >=3 genuinely-present dimensions. ---- */}
      {healthAxes.length >= 3 && (
        <Reveal i={20} style={{ marginTop: 16 }}>
          <SectionCard title="Hiring health" icon="radar"
            headRight={<Pill icon="radar" tone="var(--ink-2)" bg="var(--surface-2)" style={{ textTransform: "none" }}>{healthAxes.length} live dimensions · 0–100</Pill>}>
            <KiteRadar axes={healthAxes} max={100}
              emptyLabel="The health profile appears once these metrics carry data." />
          </SectionCard>
        </Reveal>
      )}

      {/* ---- Hiring-activity row: weekly candidate inflow, open roles by department,
            and the live interview status mix - straight counts of real rows. ---- */}
      {(inflowTotal > 0 || deptTotal > 0 || interviewTotal > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
          <Reveal i={17}><SectionCard title="Candidate inflow" icon="users"
            headRight={inflowTotal ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{inflowTotal} in 8 weeks</Pill> : undefined}>
            {/* Weekly arrivals (Candidate.appliedAt/createdAt buckets, oldest -> newest)
                as a comet trail; the glowing head is the current week. */}
            {inflowTotal
              ? <CometTrail points={inflow} height={210}
                  emptyLabel="Weekly inflow appears as candidates arrive." />
              : <div style={{ height: 210 }}><EmptyChart label="Weekly inflow appears as candidates arrive." /></div>}
          </SectionCard></Reveal>

          <Reveal i={18}><SectionCard title="Open roles by department" icon="briefcase">
            {deptTotal
              ? <OrbitField items={departments.map((d) => ({ label: d.name, n: d.value }))}
                  centerLabel={String(deptTotal)} centerSub="open roles" />
              : <div style={{ height: 210 }}><EmptyChart label="Departments appear as requisitions open." /></div>}
          </SectionCard></Reveal>

          <Reveal i={19}><SectionCard title="Interview pipeline" icon="calendar"
            headRight={interviewTotal ? <Pill tone="var(--ink-2)" bg="var(--surface-2)">{interviewTotal} interviews</Pill> : undefined}>
            <div style={{ height: 210 }}>
              {interviewTotal
                ? <DonutChart data={interviewMix} colors={interviewMix.map((d) => d.color)}
                    centerLabel={String(interviewTotal)} centerSub="all time"
                    valueFormatter={(v) => `${v} interview${Number(v) === 1 ? "" : "s"}`} />
                : <EmptyChart label="The mix appears once interviews are booked." />}
            </div>
          </SectionCard></Reveal>
        </div>
      )}
    </div>
  );
}
