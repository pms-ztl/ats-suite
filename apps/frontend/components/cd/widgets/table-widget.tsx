"use client";
// components/cd/widgets/table-widget.tsx
// WF5 wrapper for the `table` widget. Binds the real `candidates_list` source
// (listCandidates) and renders a compact, tenant-scoped row table. An empty
// result renders an honest empty caption (never a fabricated placeholder row).
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { Candidate } from "@/lib/types";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

const STAGE_LABEL: Record<string, string> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

export default function TableWidget({ title, config }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<Candidate[]>("candidates_list");
  const pageSize = typeof config?.pageSize === "number" ? config.pageSize : 8;
  const rows = (data ?? []).slice(0, pageSize);

  return (
    <WidgetShell title={title ?? "Candidates"} icon="users">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading candidates...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load candidates.</WidgetNote>
      ) : rows.length === 0 ? (
        <WidgetNote>No candidates yet.</WidgetNote>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--ink-3)" }}>
              <th style={{ padding: "6px 8px", fontWeight: 700 }}>Candidate</th>
              <th style={{ padding: "6px 8px", fontWeight: 700 }}>Stage</th>
              <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>AI score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid var(--line)" }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "7px 8px", color: "var(--ink-2)" }}>{STAGE_LABEL[c.stage] ?? c.stage}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {/* Honest: a candidate with no advisory score shows a dash, not a 0. */}
                  {typeof c.aiScore === "number" ? c.aiScore : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </WidgetShell>
  );
}
