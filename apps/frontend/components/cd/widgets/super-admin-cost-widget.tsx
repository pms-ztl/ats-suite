"use client";
// components/cd/widgets/super-admin-cost-widget.tsx
// WF5 wrapper for the `super_admin_cost` widget (SUPER_ADMIN-only). Binds the real
// `platform_cost` source (getPlatformCost(30) -> cross-tenant AI cost rollup) and
// renders per-agent platform spend as the existing BarsChart verbatim. No metered
// cross-tenant usage -> the chart's honest EmptyChart.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { PlatformCostRollup } from "@/lib/api";
import { BarsChart, CHART_COLORS } from "@/components/shared/charts";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

export default function SuperAdminCostWidget({ title }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<PlatformCostRollup>("platform_cost");

  const rows = (data?.byAgent ?? [])
    .slice()
    .sort((a, b) => b.costUsd - a.costUsd)
    .map((a) => ({ agent: a.agentType, cost: +a.costUsd.toFixed(4), runs: a.runs }));

  return (
    <WidgetShell
      title={title ?? "Platform AI cost"}
      icon="server"
      headRight={
        data ? (
          <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>last {data.periodDays} days</span>
        ) : undefined
      }
    >
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading platform cost...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load platform cost.</WidgetNote>
      ) : rows.length === 0 ? (
        <WidgetNote>Cross-tenant cost appears once AI runs are metered.</WidgetNote>
      ) : (
        <div style={{ height: Math.max(160, rows.length * 38) }}>
          <BarsChart
            data={rows}
            categoryKey="agent"
            layout="horizontal"
            series={[{ key: "cost", name: "Spend", color: CHART_COLORS.ai }]}
            valueFormatter={(v) => `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
          />
        </div>
      )}
    </WidgetShell>
  );
}
