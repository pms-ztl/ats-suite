"use client";
// components/cd/widgets/oa-results-widget.tsx
// WF5 wrapper for the `oa_results` widget. Binds the real `assessment_results`
// source (lib/assessment-api listAssessments) and renders the tenant's graded
// assessment results as the existing BarsChart (default) or the lifecycle-mix
// DonutChart, verbatim. The widget is gated on the `oa-assessments` module in the
// catalog, so it only ever appears once that module is enabled (closing the
// dashboard <-> module-resolver loop). An empty list shows the honest empty note;
// an assessment with no graded results contributes a real 0, never a fake bar.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { AssessmentListItem } from "@/lib/assessment-api";
import { BarsChart, DonutChart, CHART_COLORS } from "@/components/shared/charts";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

const EMPTY =
  "Assessment results appear once candidates have taken a published assessment.";

function shortTitle(t: string): string {
  return t.length > 28 ? `${t.slice(0, 27)}...` : t;
}

export default function OaResultsWidget({ title, viz, config }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } =
    useWidgetSource<AssessmentListItem[]>("assessment_results");
  const rows = data ?? [];

  let body: React.ReactNode;

  if (blocked) {
    body = <WidgetNote>{blockedReason}</WidgetNote>;
  } else if (loading && !data) {
    body = <WidgetNote>Loading assessment results...</WidgetNote>;
  } else if (error && !data) {
    body = <WidgetNote>Could not load assessment results.</WidgetNote>;
  } else if (rows.length === 0) {
    body = <WidgetNote>{EMPTY}</WidgetNote>;
  } else if (viz === "DonutChart") {
    const totals = rows.reduce(
      (acc, a) => {
        acc.graded += a.counts.results;
        acc.inProgress += Math.max(0, a.counts.attempts - a.counts.results);
        acc.notStarted += Math.max(0, a.counts.invites - a.counts.attempts);
        return acc;
      },
      { graded: 0, inProgress: 0, notStarted: 0 },
    );
    const segments = [
      { name: "Graded", value: totals.graded, fill: "var(--ok)" },
      { name: "In progress", value: totals.inProgress, fill: "var(--warn)" },
      { name: "Not started", value: totals.notStarted, fill: "var(--ink-3)" },
    ].filter((s) => s.value > 0);

    body = segments.length === 0 ? (
      <WidgetNote>No invites have been sent for any assessment yet.</WidgetNote>
    ) : (
      <DonutChart
        data={segments}
        colors={segments.map((s) => s.fill)}
        valueFormatter={(v) => `${v} candidate${Number(v) === 1 ? "" : "s"}`}
      />
    );
  } else {
    const maxBars = typeof config?.maxBars === "number" ? config.maxBars : 8;
    const bars = rows
      .map((a) => ({ label: shortTitle(a.title), n: a.counts.results }))
      .filter((b) => b.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, maxBars);

    body = bars.length === 0 ? (
      <WidgetNote>{EMPTY}</WidgetNote>
    ) : (
      <BarsChart
        data={bars}
        categoryKey="label"
        layout="horizontal"
        series={[{ key: "n", name: "Graded results", color: CHART_COLORS.ai }]}
        valueFormatter={(v) => `${v} result${Number(v) === 1 ? "" : "s"}`}
      />
    );
  }

  return (
    <WidgetShell title={title ?? "Assessment results"} icon="scroll">
      {body}
    </WidgetShell>
  );
}
