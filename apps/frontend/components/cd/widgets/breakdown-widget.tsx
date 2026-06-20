"use client";
// components/cd/widgets/breakdown-widget.tsx
// WF5 wrapper for the `breakdown` widget. Binds the real `screening_list` source
// (listScreening) and renders the screener PASS/REVIEW/FAIL mix as the existing
// WaffleField (default) or DonutChart verbatim. A category with 0 rows is dropped
// (the viz filters n>0); an entirely empty list shows the honest empty note.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { ScreeningVerdict, ScreeningResult } from "@/lib/types";
import { WaffleField } from "@/components/shared/ribbon-ext";
import { DonutChart } from "@/components/shared/charts";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

const ORDER: [ScreeningResult, string, string][] = [
  ["PASS", "Advance", "var(--ok)"],
  ["REVIEW", "Review", "var(--warn)"],
  ["FAIL", "Reject", "var(--danger)"],
];

export default function BreakdownWidget({ title, viz }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<ScreeningVerdict[]>("screening_list");
  const rows = data ?? [];

  const segments = ORDER.map(([r, label, color]) => ({
    label,
    n: rows.filter((v) => v.result === r).length,
    color,
  })).filter((d) => d.n > 0);

  const empty = "Verdicts appear once the screener has scored candidates.";

  return (
    <WidgetShell title={title ?? "Screening verdicts"} icon="sparkles">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading verdicts...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load verdicts.</WidgetNote>
      ) : segments.length === 0 ? (
        <WidgetNote>{empty}</WidgetNote>
      ) : viz === "DonutChart" ? (
        <DonutChart
          data={segments.map((s) => ({ name: s.label, value: s.n, fill: s.color }))}
          colors={segments.map((s) => s.color)}
          valueFormatter={(v) => `${v} verdict${Number(v) === 1 ? "" : "s"}`}
        />
      ) : (
        <WaffleField
          segments={segments}
          valueLabel={(n) => `${n} verdict${n === 1 ? "" : "s"}`}
        />
      )}
    </WidgetShell>
  );
}
