"use client";
// components/screens/OrgOverview.tsx
// Admin org-wide dashboard, ported pixel-exact from dash-admin.jsx (AdminDash).
// Data via props only. Every list/array renders a graceful empty state when [].
import * as React from "react";
import { useState } from "react";
import { Icon } from "../icon";
import { Btn, EmptyHint } from "../aurora-ui";
import {
  CommandHero, KPICard, Reveal, SectionCard, Funnel, Donut, TrendArea, Timeline, PendingList, Pill,
} from "../aurora-kit";
import type { OrgOverviewData } from "../types";

export function OrgOverview({ data }: { data: OrgOverviewData }) {
  const [live, setLive] = useState(data.live ?? true);
  const {
    workspace, heroStats = [], kpis = [], funnel = [], funnelConversionLabel,
    diversity = [], diversityIndex = "0.78", trend = [], trendLabels = [], trendDeltaLabel,
    activity = [], pending = [], pendingCountLabel, agentBars = [], agents = [],
  } = data;
  const barMax = agentBars.length ? Math.max(...agentBars) : 1;

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
          {funnel.length ? <Funnel stages={funnel} /> : <EmptyHint icon="radar" text="No pipeline data yet." />}
        </SectionCard></Reveal>
        <Reveal i={9}><SectionCard title="Diversity" icon="grid" action="EEOC report">
          {diversity.length ? <Donut data={diversity} centerValue={diversityIndex} /> : <EmptyHint icon="grid" text="No diversity data yet." />}
        </SectionCard></Reveal>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={10}><SectionCard title="Time-to-hire trend" icon="chart" headRight={trendDeltaLabel ? <Pill mono tone="var(--ok)" bg="var(--ok-tint)" icon="arrowUpRight">{trendDeltaLabel}</Pill> : undefined}>
            {trend.length ? <TrendArea data={trend} labels={trendLabels} /> : <EmptyHint icon="chart" text="Not enough history yet." />}
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
            <svg viewBox="0 0 280 70" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
              <defs><linearGradient id="agp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="var(--ai)" stopOpacity="0.05" /><stop offset="1" stopColor="var(--ai)" stopOpacity="0.4" /></linearGradient></defs>
              {agentBars.map((h, i) => { const hh = (h / barMax) * 58; return <rect key={i} x={8 + i * 22} y={64 - hh} width="13" height={hh} rx="3" fill="url(#agp)" />; })}
            </svg>
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
