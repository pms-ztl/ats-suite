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
import { FunnelViz, DonutChart, TrendChart, EmptyChart, CHART_COLORS } from "@/components/shared/charts";
import type { OrgOverviewData } from "../types";

export function OrgOverview({ data }: { data: OrgOverviewData }) {
  const [live, setLive] = useState(data.live ?? true);
  const {
    workspace, heroStats = [], kpis = [], funnel = [], funnelConversionLabel,
    diversity = [], diversityIndex = "0.78", trend = [], trendLabels = [], trendDeltaLabel,
    activity = [], pending = [], pendingCountLabel, agents = [],
  } = data;

  // Real pipeline funnel (from /platform/unified-overview pipelineData) -> chart-kit FunnelViz.
  const funnelData = funnel.map((s) => ({ name: s.stage, value: s.n, fill: s.color }));
  // Real diversity mix (from /platform/unified-overview diversityData) -> chart-kit DonutChart.
  const diversityData = diversity.map((d) => ({ name: d.g, value: d.v, fill: d.color }));
  const diversityColors = diversity.map((d) => d.color);
  // Time-to-hire trend: real series only (days per period). The wrapper passes [] until
  // the backend exposes a history series, so this maps to an EmptyChart below.
  const trendData = trend.map((v, i) => ({ t: trendLabels[i] ?? `P${i + 1}`, days: v }));

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <CommandHero title="Org overview" sub="Everything happening across your hiring operation, in real time." workspace={workspace} stats={heroStats} live={live} onToggleLive={() => setLive((v) => !v)}>
        <Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 30 days</Pill>
        <Btn variant="primary" icon="arrowUpRight">Export report</Btn>
      </CommandHero>

      {/* 8 KPIs */}
      {kpis.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id ?? k.label} k={k} i={i} />)}
        </div>
      )}

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={8}><SectionCard title="Pipeline funnel" icon="radar" action="Breakdown" headRight={funnelConversionLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)">{funnelConversionLabel}</Pill> : undefined}>
          <div style={{ height: 240 }}>
            {funnelData.length ? <FunnelViz data={funnelData} valueFormatter={(v) => v.toLocaleString()} /> : <EmptyChart label="No pipeline data yet." />}
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
          <Reveal i={13}><SectionCard title="Agent activity" icon="sparkles">
            {/* The fabricated agentBars sparkline was removed. No per-agent run-count
                time series is exposed by the gateway yet, so this is an honest empty
                state until that endpoint lands. The agent roster below is static config. */}
            <div style={{ height: 70, marginBottom: 12 }}>
              <EmptyChart label="Agent activity coming soon" />
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
    </div>
  );
}
