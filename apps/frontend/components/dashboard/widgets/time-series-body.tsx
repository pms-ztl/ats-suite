"use client";
// components/dashboard/widgets/time-series-body.tsx
// WF5 BODY for the `time_series` widget. The frame binds the real `spend_trend`
// source (getSpendTrend -> monthly AI spend by provider) and hands us its state;
// we render the existing house viz VERBATIM: StreamGraph (default - the same river
// the Org overview "AI spend by provider" card uses) or CometTrail when the placed
// instance chose it. Both self-empty (StreamGraph needs >=2 buckets + a non-zero
// grand total; CometTrail needs >=2 points + a non-zero total), so a thin/empty
// history shows the viz's honest empty note, never a flat zero-line.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { SpendMonth } from "@/lib/api";
import { CometTrail } from "@/components/shared/ribbon";
import { StreamGraph } from "@/components/shared/ribbon-ext";
import { colorAt } from "@/components/shared/charts";
import { BodyNote } from "./widget-body";

type SpendTrend = { trend: SpendMonth[]; totalSpend: number };

const EMPTY = "Spend appears once AI runs are metered across months.";

export default function TimeSeriesBody({ state, viz }: WidgetBodyProps<SpendTrend>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading trend...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load the spend trend.</BodyNote>;

  const trend = data?.trend ?? [];
  const providers = Array.from(
    new Set(trend.flatMap((m) => Object.keys(m.byProvider).filter((p) => (m.byProvider[p] ?? 0) > 0))),
  );

  // CometTrail variant: chart the real monthly spend total as a single trend line.
  if (viz === "CometTrail") {
    const points = trend.map((m) => ({ label: m.label, n: +(m.total ?? 0).toFixed(4) }));
    return (
      <CometTrail
        points={points}
        height={220}
        valueLabel={(n) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
        emptyLabel={EMPTY}
      />
    );
  }

  // Default: composition of AI spend across months by provider (the river).
  const buckets = trend.map((m) => ({ label: m.label }));
  const series = providers.map((p, i) => ({
    label: p,
    values: trend.map((m) => +(m.byProvider[p] ?? 0).toFixed(4)),
    color: colorAt(i),
  }));

  return <StreamGraph buckets={buckets} series={series} height={220} emptyLabel={EMPTY} />;
}
