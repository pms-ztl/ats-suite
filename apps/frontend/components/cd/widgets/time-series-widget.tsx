"use client";
// components/cd/widgets/time-series-widget.tsx
// WF5 wrapper for the `time_series` widget. Binds the real `spend_trend` source
// (getSpendTrend -> monthly AI spend by provider) and renders the existing
// StreamGraph verbatim. StreamGraph self-empties (needs >=2 buckets and a
// non-zero grand total), so a thin/empty history shows its honest empty note,
// never a flat zero-line.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { SpendMonth } from "@/lib/api";
import { StreamGraph } from "@/components/shared/ribbon-ext";
import { colorAt } from "@/components/shared/charts";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

type SpendTrend = { trend: SpendMonth[]; totalSpend: number };

export default function TimeSeriesWidget({ title }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<SpendTrend>("spend_trend");
  const trend = data?.trend ?? [];

  const providers = Array.from(
    new Set(trend.flatMap((m) => Object.keys(m.byProvider).filter((p) => (m.byProvider[p] ?? 0) > 0))),
  );
  const buckets = trend.map((m) => ({ label: m.label }));
  const series = providers.map((p, i) => ({
    label: p,
    values: trend.map((m) => +(m.byProvider[p] ?? 0).toFixed(4)),
    color: colorAt(i),
  }));

  return (
    <WidgetShell title={title ?? "AI spend by provider"} icon="chart">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading trend...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load the spend trend.</WidgetNote>
      ) : (
        <StreamGraph
          buckets={buckets}
          series={series}
          height={220}
          emptyLabel="Spend appears once AI runs are metered across months."
        />
      )}
    </WidgetShell>
  );
}
