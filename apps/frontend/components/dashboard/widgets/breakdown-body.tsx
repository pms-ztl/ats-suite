"use client";
// components/dashboard/widgets/breakdown-body.tsx
// WF5 BODY for the `breakdown` widget. The frame binds the real `screening_list`
// source (listScreening) and hands us its state; we render the screener
// PASS/REVIEW/FAIL mix VERBATIM with the existing house viz: WaffleField (default -
// the same 100-cell waffle the Org overview "Screening verdict mix" card uses),
// DonutChart, BeadStream, or BarsChart per the placed instance's viz choice. A
// category with 0 rows is dropped (the viz filters n>0); an entirely empty list
// shows the honest empty note.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { ScreeningVerdict, ScreeningResult } from "@/lib/types";
import { BeadStream } from "@/components/shared/ribbon";
import { WaffleField } from "@/components/shared/ribbon-ext";
import { DonutChart, BarsChart, CHART_COLORS } from "@/components/shared/charts";
import { BodyNote, BodyFill } from "./widget-body";

const ORDER: [ScreeningResult, string, string][] = [
  ["PASS", "Advance", "var(--ok)"],
  ["REVIEW", "Review", "var(--warn)"],
  ["FAIL", "Reject", "var(--danger)"],
];

const EMPTY = "Verdicts appear once the screener has scored candidates.";

export default function BreakdownBody({ state, viz }: WidgetBodyProps<ScreeningVerdict[]>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading verdicts...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load verdicts.</BodyNote>;

  const rows = data ?? [];
  const segments = ORDER.map(([r, label, color]) => ({
    label,
    n: rows.filter((v) => v.result === r).length,
    color,
  })).filter((d) => d.n > 0);

  if (segments.length === 0) return <BodyNote>{EMPTY}</BodyNote>;

  if (viz === "DonutChart") {
    return (
      <BodyFill height={230}>
        <DonutChart
          data={segments.map((s) => ({ name: s.label, value: s.n, fill: s.color }))}
          colors={segments.map((s) => s.color)}
          valueFormatter={(v) => `${v} verdict${Number(v) === 1 ? "" : "s"}`}
        />
      </BodyFill>
    );
  }

  if (viz === "BeadStream") {
    return <BeadStream groups={segments} height={230} emptyLabel={EMPTY} />;
  }

  if (viz === "BarsChart") {
    return (
      <BodyFill height={Math.max(160, segments.length * 44)}>
        <BarsChart
          data={segments.map((s) => ({ label: s.label, n: s.n }))}
          categoryKey="label"
          layout="horizontal"
          series={[{ key: "n", name: "Verdicts", color: CHART_COLORS.ai }]}
          colorFn={(row) => segments.find((s) => s.label === row.label)?.color ?? CHART_COLORS.ai}
          valueFormatter={(v) => `${v} verdict${Number(v) === 1 ? "" : "s"}`}
        />
      </BodyFill>
    );
  }

  return <WaffleField segments={segments} valueLabel={(n) => `${n} verdict${n === 1 ? "" : "s"}`} />;
}
