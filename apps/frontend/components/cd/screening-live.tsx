"use client";
// components/cd/screening-live.tsx
// Wires the verbatim CD Screening (./screens/Screening) to the real gateway:
// listScreening() -> ScreeningData. The CD screen is props-only, so this maps the
// ScreeningVerdict[] the gateway returns onto the rows it expects. AI is advisory;
// the human's click is recorded as the deciding action (handled in-screen). The
// "Export" button downloads the real screening rows as CSV via lib/export.
import { Screening } from "./screens/Screening";
import { useData } from "@/lib/use-data";
import { listScreening, listCandidates, listRequisitions } from "@/lib/api";
import { exportToCSV } from "@/lib/export";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch, Candidate, Requisition } from "@/lib/types";
import type { ScreeningData, ScreeningRow, ReqBreakdown, VerdictKind } from "./types";

const KIND: Record<ScreeningResult, VerdictKind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<VerdictKind, string> = { pass: "Strong match", review: "Strong potential", fail: "Below the bar" };
const RESULT_LABEL: Record<VerdictKind, string> = { pass: "PASS", review: "REVIEW", fail: "FAIL" };

function initials(name: string): string {
  const p = String(name).trim().split(/\s+/).filter(Boolean);
  return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?";
}
const reqState = (met: RequirementMatch["met"]): VerdictKind => (met === true ? "pass" : met === "partial" ? "review" : "fail");

function toRow(v: ScreeningVerdict, name: string, roleTitle: string): ScreeningRow {
  const kind = KIND[v.result] ?? "review";
  const reqs = v.requirements ?? [];
  // Only real, measured fields: the requirement label, its met/partial/unmet status
  // (from the screener's `met`), and the AI-cited evidence text. No invented weight%
  // or x/10 sub-score — the screener does not produce those.
  const requirements: ReqBreakdown[] = reqs.map((req, i) => ({
    id: `r${i + 1}`,
    label: req.requirement,
    state: reqState(req.met),
    note: req.evidence || "",
  }));
  return {
    id: v.id ?? v.candidateId,
    ini: initials(name),
    name,
    role: roleTitle || v.agent,
    reqId: v.requisitionId ?? "",
    score: v.score,
    kind,
    conf: v.confidence,
    band: BAND[kind],
    status: "pending",
    reasoning: v.summary,
    requirements,
  };
}

export function ScreeningLive() {
  const queue = useData<ScreeningVerdict[]>(listScreening);
  const cands = useData<Candidate[]>(listCandidates);
  const reqs = useData<Requisition[]>(listRequisitions);
  const candById = new Map((cands.data ?? []).map((c) => [c.id, c.name]));
  const reqById = new Map((reqs.data ?? []).map((r) => [r.id, r.title]));

  const rows: ScreeningRow[] = (queue.data ?? []).map((v) =>
    toRow(v, candById.get(v.candidateId) ?? v.candidateId, reqById.get(v.requisitionId ?? "") ?? "")
  );
  const data: ScreeningData = { rows, requirements: [], trace: [] };

  // Verdict-flow ribbon points: real PASS / REVIEW / FAIL counts from the rows in
  // hand, with each bucket's real average AI match score as the sub-label. No rows
  // in a bucket -> no sub (never an invented average).
  const verdictFlow = (["pass", "review", "fail"] as VerdictKind[]).map((k) => {
    const scores = rows.filter((r) => r.kind === k).map((r) => r.score);
    return {
      label: RESULT_LABEL[k].charAt(0) + RESULT_LABEL[k].slice(1).toLowerCase(),
      n: scores.length,
      sub: scores.length ? `avg ${Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)}` : undefined,
    };
  });

  // Real CSV export of exactly the rows shown (no backend needed — data in hand).
  const onExport = () =>
    exportToCSV(
      `screening-queue-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Candidate", "Role", "Score", "Result", "Confidence", "Recommendation", "Summary"],
      rows.map((r) => [r.name, r.role, r.score, RESULT_LABEL[r.kind], r.conf.toFixed(2), r.band, r.reasoning ?? ""]),
    );

  return <Screening data={data} onExport={onExport} verdictFlow={verdictFlow} />;
}
