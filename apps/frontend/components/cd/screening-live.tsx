"use client";
// components/cd/screening-live.tsx
// Wires the verbatim CD Screening (./screens/Screening) to the real gateway:
// listScreening() -> ScreeningData. The CD screen is props-only, so this maps the
// ScreeningVerdict[] the gateway returns onto the rows it expects. AI is advisory;
// the human's click is recorded as the deciding action (handled in-screen).
import { Screening } from "./screens/Screening";
import { useData } from "@/lib/use-data";
import { listScreening } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch } from "@/lib/types";
import type { ScreeningData, ScreeningRow, ReqBreakdown, VerdictKind } from "./types";

const KIND: Record<ScreeningResult, VerdictKind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<VerdictKind, string> = { pass: "Strong match", review: "Strong potential", fail: "Below the bar" };

function initials(name: string): string {
  const p = String(name).trim().split(/\s+/).filter(Boolean);
  return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?";
}
const reqState = (met: RequirementMatch["met"]): VerdictKind => (met === true ? "pass" : met === "partial" ? "review" : "fail");

function toRow(v: ScreeningVerdict): ScreeningRow {
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
    ini: initials(v.candidateId),
    name: v.candidateId,
    role: v.agent,
    reqId: v.requisitionId ?? "",
    score: v.score,
    kind,
    conf: v.confidence,
    band: BAND[kind],
    status: "pending",
    requirements,
  };
}

export function ScreeningLive() {
  const queue = useData<ScreeningVerdict[]>(listScreening);
  const data: ScreeningData = {
    rows: (queue.data ?? []).map(toRow),
    requirements: [],
    trace: [],
  };
  return <Screening data={data} />;
}
