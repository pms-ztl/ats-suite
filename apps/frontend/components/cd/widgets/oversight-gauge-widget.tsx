"use client";
// components/cd/widgets/oversight-gauge-widget.tsx
// WF5 wrapper for the `oversight_gauge` widget. Binds the real `oversight` source
// (getOversight -> HITL checkpoint status mix) and renders the existing BeadStream
// verbatim. A real measured 0 (a clear queue) stays a real 0 in the legend; no
// checkpoints at all -> the viz's honest empty note.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { OversightStats } from "@/lib/api";
import { BeadStream } from "@/components/shared/ribbon";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

export default function OversightGaugeWidget({ title }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<OversightStats>("oversight");

  const groups = data
    ? [
        { label: "Pending", n: data.pending, color: "var(--warn)" },
        { label: "Approved", n: data.approved, color: "var(--ok)" },
        { label: "Rejected", n: data.rejected, color: "var(--danger)" },
      ].filter((g) => g.n > 0)
    : [];

  return (
    <WidgetShell title={title ?? "Human oversight"} icon="shield">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading oversight...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load oversight.</WidgetNote>
      ) : groups.length === 0 ? (
        <WidgetNote>Checkpoints appear when the AI asks for a human decision.</WidgetNote>
      ) : (
        <BeadStream
          groups={groups}
          height={220}
          emptyLabel="Checkpoints appear when the AI asks for a human decision."
        />
      )}
    </WidgetShell>
  );
}
