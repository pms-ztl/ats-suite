"use client";
// components/dashboard/widgets/oversight-gauge-body.tsx
// WF5 BODY for the `oversight_gauge` widget. The frame binds the real `oversight`
// source (getOversight -> HITL checkpoint status mix) and hands us its state; we
// render the existing house viz VERBATIM: BeadStream (default - the same bead track
// the Org overview "Human oversight" card uses), an ArcMeter of the resolved share,
// or a DonutChart of the mix per the placed instance's viz choice. A real measured
// 0 (a clear queue) stays a real 0 in the legend; no checkpoints at all -> the
// viz's honest empty note.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { OversightStats } from "@/lib/api";
import { BeadStream, ArcMeter } from "@/components/shared/ribbon";
import { DonutChart } from "@/components/shared/charts";
import { BodyNote, BodyFill } from "./widget-body";

const EMPTY = "Checkpoints appear when the AI asks for a human decision.";

export default function OversightGaugeBody({ state, viz }: WidgetBodyProps<OversightStats>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading oversight...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load oversight.</BodyNote>;

  const groups = data
    ? [
        { label: "Pending", n: data.pending, color: "var(--warn)" },
        { label: "Approved", n: data.approved, color: "var(--ok)" },
        { label: "Rejected", n: data.rejected, color: "var(--danger)" },
      ].filter((g) => g.n > 0)
    : [];

  if (groups.length === 0) return <BodyNote>{EMPTY}</BodyNote>;

  // ArcMeter variant: the share of checkpoints already resolved by a human.
  if (viz === "ArcMeter") {
    const total = data ? data.total : 0;
    const resolved = data ? data.approved + data.rejected : 0;
    // total > 0 here (groups non-empty); a real measured 0% resolved stays a real 0.
    const pct = total > 0 ? Math.round((resolved / total) * 100) : null;
    return (
      <BodyFill height={230}>
        <ArcMeter value={pct} max={100} label="Resolved" sub={`${resolved} of ${total}`} height={230} emptyLabel={EMPTY} />
      </BodyFill>
    );
  }

  if (viz === "DonutChart") {
    return (
      <BodyFill height={230}>
        <DonutChart
          data={groups.map((g) => ({ name: g.label, value: g.n, fill: g.color }))}
          colors={groups.map((g) => g.color)}
          valueFormatter={(v) => `${v} checkpoint${Number(v) === 1 ? "" : "s"}`}
        />
      </BodyFill>
    );
  }

  return <BeadStream groups={groups} height={220} emptyLabel={EMPTY} />;
}
