"use client";
// components/dashboard/widgets/billing-spend-body.tsx
// WF5 BODY for the `billing_spend` widget. The frame binds the real `billing_usage`
// source (getBillingUsage(30) -> metered per-agent runs + cost from AgentRunCost)
// and hands us its state; we render per-agent spend VERBATIM with the existing viz:
// BarsChart (default - the sortable cost bars the Org overview per-agent card uses)
// or PetalBloom (the same rose chart of per-agent run counts). Every number is a
// real metered value; no metered runs -> the viz's honest empty state.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { BillingUsage } from "@/lib/api";
import { PetalBloom } from "@/components/shared/ribbon";
import { BarsChart, CHART_COLORS } from "@/components/shared/charts";
import { BodyNote } from "./widget-body";

const EMPTY = "Agent activity appears once AI runs are metered.";

export default function BillingSpendBody({ state, viz }: WidgetBodyProps<BillingUsage>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading AI spend...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load AI spend.</BodyNote>;

  const byAgent = data?.byAgent ?? [];
  const rows = byAgent
    .slice()
    .sort((a, b) => b.costUsd - a.costUsd)
    .map((a) => ({ agent: a.agentType, cost: +a.costUsd.toFixed(4), runs: a.runs }));

  if (rows.length === 0) return <BodyNote>{EMPTY}</BodyNote>;

  // PetalBloom variant: real per-agent run counts as a rose chart.
  if (viz === "PetalBloom") {
    return (
      <PetalBloom
        items={byAgent.map((a) => ({ label: a.agentType, n: a.runs }))}
        centerSub="runs (30d)"
        emptyLabel={EMPTY}
      />
    );
  }

  // Default: sortable per-agent metered spend (BarsChart, verbatim). Fills the cell
  // height (with a small floor) instead of a fixed 160px block, so the bars use the
  // whole pane and a taller cell never leaves a void beneath them.
  return (
    <div style={{ width: "100%", height: "100%", minHeight: Math.max(140, rows.length * 40) }}>
      <BarsChart
        data={rows}
        categoryKey="agent"
        layout="horizontal"
        series={[{ key: "cost", name: "Spend", color: CHART_COLORS.ai }]}
        valueFormatter={(v) => `₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
      />
    </div>
  );
}
