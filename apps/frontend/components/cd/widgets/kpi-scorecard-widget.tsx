"use client";
// components/cd/widgets/kpi-scorecard-widget.tsx
// WF5 wrapper for the `kpi_scorecard` widget. Binds the real `dashboard_kpis`
// source (getDashboardKpis) and renders the existing KpiCard verbatim. A KPI with
// no value (hasValue:false) flips its tile to the honest em-dash EmptyMetric via
// KpiCard's own absent-value path; never a fabricated 0.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { DashKpi } from "@/lib/api";
import { KpiCard } from "@/components/cd/dashboard-kit";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

export default function KpiScorecardWidget({ title, config }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<DashKpi[]>("dashboard_kpis");
  const maxTiles = typeof config?.maxTiles === "number" ? config.maxTiles : 4;

  return (
    <WidgetShell title={title ?? "KPIs"} icon="bolt">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading KPIs...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load KPIs.</WidgetNote>
      ) : !data || data.length === 0 ? (
        <WidgetNote>No KPIs yet.</WidgetNote>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {data.slice(0, maxTiles).map((k) => (
            <KpiCard
              key={k.id}
              name={k.label}
              // hasValue:false -> value null -> KpiCard renders EmptyMetric (honest).
              value={k.hasValue ? k.value : null}
              prefix={k.prefix}
              suffix={k.suffix}
              icon={k.icon as never}
              ai={k.ai}
              delta={k.hasPrior ? k.delta : null}
              goodWhen={k.good === false ? "down" : "up"}
              spark={k.spark && k.spark.length > 1 ? k.spark : null}
              emptyCaption="No data yet"
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
