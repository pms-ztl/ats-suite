"use client";
// components/dashboard/widgets/kpi-scorecard-body.tsx
// WF5 BODY for the `kpi_scorecard` widget. The frame binds the real
// `dashboard_kpis` source (getDashboardKpis) and hands us its resolved state; we
// render the existing dashboard-kit <KpiCard> VERBATIM (the same tile the Org
// overview hero row + role homes use). A KPI with hasValue:false flips its tile to
// KpiCard's own honest em-dash EmptyMetric, never a fabricated 0.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { DashKpi } from "@/lib/api";
import { KpiCard } from "@/components/cd/dashboard-kit";
import { BodyNote } from "./widget-body";

export default function KpiScorecardBody({ state, config }: WidgetBodyProps<DashKpi[]>) {
  const { data, loading, error } = state;
  const maxTiles = typeof config?.maxTiles === "number" ? config.maxTiles : 4;

  if (loading && !data) return <BodyNote>Loading KPIs...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load KPIs.</BodyNote>;
  if (!data || data.length === 0) return <BodyNote>No KPIs yet.</BodyNote>;

  return (
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
          // No prior period -> suppress the delta pill (no fabricated change).
          delta={k.hasPrior ? k.delta : null}
          goodWhen={k.good === false ? "down" : "up"}
          // Only a real, >1-point series draws a sparkline (no flat zero-line).
          spark={k.spark && k.spark.length > 1 ? k.spark : null}
          emptyCaption="No data yet"
        />
      ))}
    </div>
  );
}
