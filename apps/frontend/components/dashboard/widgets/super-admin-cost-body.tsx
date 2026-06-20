"use client";
// components/dashboard/widgets/super-admin-cost-body.tsx
// WF5 BODY for the `super_admin_cost` widget (SUPER_ADMIN-only). The frame binds the
// real `platform_cost` source (getPlatformCost(30) -> cross-tenant AI cost rollup)
// and hands us its state; we render per-agent platform spend VERBATIM with the
// existing BarsChart (same sortable cost bars as the per-tenant billing widget),
// labelled in USD (the platform rollup is metered in USD). No metered cross-tenant
// usage -> the viz's honest empty state.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { PlatformCostRollup } from "@/lib/api";
import { BarsChart, CHART_COLORS } from "@/components/shared/charts";
import { BodyNote, BodyFill } from "./widget-body";

export default function SuperAdminCostBody({ state }: WidgetBodyProps<PlatformCostRollup>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading platform cost...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load platform cost.</BodyNote>;

  const rows = (data?.byAgent ?? [])
    .slice()
    .sort((a, b) => b.costUsd - a.costUsd)
    .map((a) => ({ agent: a.agentType, cost: +a.costUsd.toFixed(4), runs: a.runs }));

  if (rows.length === 0) return <BodyNote>Cross-tenant cost appears once AI runs are metered.</BodyNote>;

  return (
    <BodyFill height={Math.max(160, rows.length * 38)}>
      <BarsChart
        data={rows}
        categoryKey="agent"
        layout="horizontal"
        series={[{ key: "cost", name: "Spend", color: CHART_COLORS.ai }]}
        valueFormatter={(v) => `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
      />
    </BodyFill>
  );
}
