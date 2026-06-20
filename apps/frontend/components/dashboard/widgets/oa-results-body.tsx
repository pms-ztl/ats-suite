"use client";
// components/dashboard/widgets/oa-results-body.tsx
// WF5 BODY for the `oa_results` widget. The frame binds the real
// `assessment_results` source (lib/assessment-api listAssessments -> the tenant's
// assessment rows, each carrying a live _count of { invites, attempts, results }).
// This widget is gated on the `oa-assessments` module (see lib/widgets/registry):
// it only ever appears in the palette when that module is enabled, so the loop
// between the dashboard catalog and the module resolver is closed.
//
// We render VERBATIM with the existing house viz:
//   - BarsChart (default): graded results per assessment (the real `results`
//     count), horizontal, one bar per assessment.
//   - DonutChart: the lifecycle mix across assessments
//     (invited but not attempted / in progress / graded), all REAL counts.
//
// HARD RULE - REAL DATA OR HONEST EMPTY ONLY: every value here is a real backend
// count. An assessment with 0 graded results contributes a real 0 (the bar is
// dropped only when EVERY assessment is 0, which is the honest empty). No tenant
// assessments at all -> the honest empty note, never a fabricated row.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { AssessmentListItem } from "@/lib/assessment-api";
import { BarsChart, DonutChart, CHART_COLORS } from "@/components/shared/charts";
import { BodyNote, BodyFill } from "./widget-body";

const EMPTY =
  "Assessment results appear once candidates have taken a published assessment.";

// Truncate a long assessment title so the bar category axis stays readable.
function shortTitle(t: string): string {
  return t.length > 28 ? `${t.slice(0, 27)}...` : t;
}

export default function OaResultsBody({ state, viz, config }: WidgetBodyProps<AssessmentListItem[]>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading assessment results...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load assessment results.</BodyNote>;

  const rows = data ?? [];
  if (rows.length === 0) return <BodyNote>{EMPTY}</BodyNote>;

  // ── lifecycle-mix donut: real aggregate counts across all assessments ──
  if (viz === "DonutChart") {
    const totals = rows.reduce(
      (acc, a) => {
        const invites = a.counts.invites;
        const attempts = a.counts.attempts;
        const results = a.counts.results;
        // Graded = results; in progress = attempted but not yet a result;
        // not started = invited but not yet attempted. Clamp at 0 so a stale
        // count ordering can never produce a negative (fabricated) slice.
        acc.graded += results;
        acc.inProgress += Math.max(0, attempts - results);
        acc.notStarted += Math.max(0, invites - attempts);
        return acc;
      },
      { graded: 0, inProgress: 0, notStarted: 0 },
    );

    const segments = [
      { name: "Graded", value: totals.graded, fill: "var(--ok)" },
      { name: "In progress", value: totals.inProgress, fill: "var(--warn)" },
      { name: "Not started", value: totals.notStarted, fill: "var(--ink-3)" },
    ].filter((s) => s.value > 0);

    if (segments.length === 0) {
      return <BodyNote>No invites have been sent for any assessment yet.</BodyNote>;
    }

    return (
      <BodyFill height={230}>
        <DonutChart
          data={segments}
          colors={segments.map((s) => s.fill)}
          valueFormatter={(v) => `${v} candidate${Number(v) === 1 ? "" : "s"}`}
        />
      </BodyFill>
    );
  }

  // ── default: graded results per assessment (real `results` count) ──
  const maxBars = typeof config?.maxBars === "number" ? config.maxBars : 8;
  const bars = rows
    .map((a) => ({ label: shortTitle(a.title), n: a.counts.results }))
    .filter((b) => b.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, maxBars);

  if (bars.length === 0) return <BodyNote>{EMPTY}</BodyNote>;

  return (
    <BodyFill height={Math.max(160, bars.length * 44)}>
      <BarsChart
        data={bars}
        categoryKey="label"
        layout="horizontal"
        series={[{ key: "n", name: "Graded results", color: CHART_COLORS.ai }]}
        valueFormatter={(v) => `${v} result${Number(v) === 1 ? "" : "s"}`}
      />
    </BodyFill>
  );
}
