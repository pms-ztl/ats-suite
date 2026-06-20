"use client";
// components/dashboard/widgets/table-body.tsx
// WF5 BODY for the `table` widget. The frame binds the real `candidates_list`
// source (listCandidates) and hands us its state; we render a compact,
// tenant-scoped row table (the same Candidate / Stage / AI-score columns the
// candidates surfaces use). An empty result renders an honest empty caption, never
// a fabricated placeholder row; a candidate with no advisory score shows a dash,
// not a 0.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { Candidate } from "@/lib/types";
import { BodyNote } from "./widget-body";

const STAGE_LABEL: Record<string, string> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

export default function TableBody({ state, config }: WidgetBodyProps<Candidate[]>) {
  const { data, loading, error } = state;
  const pageSize = typeof config?.pageSize === "number" ? config.pageSize : 8;

  if (loading && !data) return <BodyNote>Loading candidates...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load candidates.</BodyNote>;

  const rows = (data ?? []).slice(0, pageSize);
  if (rows.length === 0) return <BodyNote>No candidates yet.</BodyNote>;

  return (
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
  );
}
