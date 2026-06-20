"use client";
// components/cd/widgets/billing-spend-widget.tsx
// WF5 wrapper for the `billing_spend` widget. Binds the real `billing_usage`
// source (getBillingUsage(30) -> metered per-agent runs + cost from AgentRunCost)
// and renders per-agent spend as the existing BarsChart verbatim. Every number is
// a real metered value; no metered runs -> the chart's honest EmptyChart.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { BillingUsage } from "@/lib/api";
import { BarsChart, CHART_COLORS } from "@/components/shared/charts";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

export default function BillingSpendWidget({ title }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<BillingUsage>("billing_usage");
  const byAgent = data?.byAgent ?? [];

  const rows = byAgent
    .slice()
    .sort((a, b) => b.costUsd - a.costUsd)
    .map((a) => ({ agent: a.agentType, cost: +a.costUsd.toFixed(4), runs: a.runs }));

  return (
    <WidgetShell
      title={title ?? "AI spend"}
      icon="card"
      headRight={
        data ? (
          <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>last 30 days</span>
        ) : undefined
      }
    >
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading AI spend...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load AI spend.</WidgetNote>
      ) : rows.length === 0 ? (
        <WidgetNote>Agent activity appears once AI runs are metered.</WidgetNote>
      ) : (
        <div style={{ height: Math.max(160, rows.length * 38) }}>
          <BarsChart
            data={rows}
            categoryKey="agent"
            layout="horizontal"
            series={[{ key: "cost", name: "Spend", color: CHART_COLORS.ai }]}
            valueFormatter={(v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
          />
        </div>
      )}
    </WidgetShell>
  );
}
