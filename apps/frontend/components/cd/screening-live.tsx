"use client";
// components/cd/screening-live.tsx
// Wires the verbatim CD Screening (./screens/Screening) to the real gateway:
// listScreening() -> ScreeningData. The CD screen is props-only, so this maps the
// ScreeningVerdict[] the gateway returns onto the rows it expects. AI is advisory;
// the human's click is recorded as the deciding action (handled in-screen).
import { Screening } from "./screens/Screening";
import { useData } from "@/lib/use-data";
import { listScreening, listCandidates, listRequisitions } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch, Candidate, Requisition } from "@/lib/types";
import type { ScreeningData, ScreeningRow, ReqBreakdown, VerdictKind } from "./types";

const KIND: Record<ScreeningResult, VerdictKind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<VerdictKind, string> = { pass: "Strong match", review: "Strong potential", fail: "Below the bar" };

function initials(name: string): string {
  const p = String(name).trim().split(/\s+/).filter(Boolean);
  return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?";
}
const reqState = (met: RequirementMatch["met"]): VerdictKind => (met === true ? "pass" : met === "partial" ? "review" : "fail");

function toRow(v: ScreeningVerdict, name: string, roleTitle: string): ScreeningRow {
  const kind = KIND[v.result] ?? "review";
  const reqs = v.requirements ?? [];
  const requirements: ReqBreakdown[] = reqs.map((req, i) => {
    const state = reqState(req.met);
    return {
      id: `r${i + 1}`,
      label: req.requirement,
      state,
      weight: Math.round(100 / Math.max(1, reqs.length)),
      sub: state === "pass" ? "9/10" : state === "review" ? "6/10" : "3/10",
      note: req.evidence || "",
    };
  });
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
  const data: ScreeningData = {
    rows: (queue.data ?? []).map((v) =>
      toRow(v, candById.get(v.candidateId) ?? v.candidateId, reqById.get(v.requisitionId ?? "") ?? "")
    ),
    requirements: [],
    trace: [],
  };
  return <Screening data={data} />;
}
