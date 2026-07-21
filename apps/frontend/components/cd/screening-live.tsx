"use client";
// components/cd/screening-live.tsx
// Wires the verbatim CD Screening (./screens/Screening) to the real gateway:
// listScreening() -> ScreeningData. The CD screen is props-only, so this maps the
// ScreeningVerdict[] the gateway returns onto the rows it expects. AI is advisory;
// the human's click is recorded as the deciding action (handled in-screen). The
// "Export" button downloads the real screening rows as CSV via lib/export.
import { useSearchParams } from "next/navigation";
import { Screening } from "./screens/Screening";
import { useData } from "@/lib/use-data";
import { listScreening, listCandidates, listRequisitions } from "@/lib/api";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";

// Bulk screening actions hit the real application-stage API (same one the hire flow
// uses): resolve each screened candidate to their active application for the
// requisition, then advance it one stage or reject it. AI stays advisory; the
// recruiter's bulk click is the deciding write.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const STAGE_ORDER = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "TECHNICAL_ROUND", "HR_ROUND", "FINAL_REVIEW", "OFFER", "HIRED"];
const TERMINAL = new Set(["REJECTED", "WITHDRAWN", "HIRED"]);
function authHeaders(): Record<string, string> {
  let t: string | null = null;
  try { t = window.sessionStorage.getItem("ats-access-token"); } catch { /* storage blocked */ }
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}
async function resolveActiveApp(candidateId: string, reqId: string): Promise<{ id: string; stage: string } | null> {
  const res = await fetch(`${API_BASE}/candidates/${candidateId}/applications`, { credentials: "include", headers: authHeaders() });
  if (!res.ok) return null;
  const j = await res.json().catch(() => null);
  const apps: { id: string; stage: string; requisitionId?: string }[] = j?.data ?? j ?? [];
  return apps.find((a) => a.requisitionId === reqId && !TERMINAL.has(a.stage))
    ?? apps.find((a) => !TERMINAL.has(a.stage))
    ?? null;
}
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
    candidateId: v.candidateId,
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
  // Arriving from a candidate's profile ("Open full verdict") carries their id
  // so the queue can open straight to THEIR verdict panel instead of dumping
  // the visitor into the general 39-candidate queue with no indication of who
  // they were even looking for.
  const initialOpenCandidateId = useSearchParams().get("candidateId") ?? undefined;
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

  // Map a selected row id (v.id ?? v.candidateId) back to its verdict so we can
  // resolve the candidate + requisition for the stage write.
  const verdictByRowId = new Map((queue.data ?? []).map((v) => [v.id ?? v.candidateId, v]));

  async function bulkAct(ids: string[], mode: "advance" | "reject") {
    const verdicts = ids.map((id) => verdictByRowId.get(id)).filter(Boolean) as ScreeningVerdict[];
    let ok = 0, failed = 0;
    for (const v of verdicts) {
      const app = await resolveActiveApp(v.candidateId, v.requisitionId ?? "");
      if (!app) { failed++; continue; }
      let body: Record<string, string>;
      if (mode === "reject") {
        body = { stage: "REJECTED", status: "REJECTED" };
      } else {
        const idx = STAGE_ORDER.indexOf(app.stage);
        const next = idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : app.stage;
        body = { stage: next };
      }
      const res = await fetch(`${API_BASE}/applications/${app.id}`, { method: "PATCH", credentials: "include", headers: authHeaders(), body: JSON.stringify(body) });
      if (res.ok) ok++; else failed++;
    }
    const verb = mode === "reject" ? "Rejected" : "Advanced";
    if (ok) toast.success(`${verb} ${ok} candidate${ok === 1 ? "" : "s"}${failed ? ` · ${failed} could not be updated` : ""}.`);
    else toast.error(`Couldn't ${mode} ${failed || "the"} candidate${failed === 1 ? "" : "s"}.`);
    queue.reload();
  }

  const onBulkAdvance = (ids: string[]) => { void bulkAct(ids, "advance"); };
  const onBulkReject = (ids: string[]) => { void bulkAct(ids, "reject"); };

  return <Screening data={data} onExport={onExport} verdictFlow={verdictFlow} onBulkAdvance={onBulkAdvance} onBulkReject={onBulkReject} initialOpenCandidateId={initialOpenCandidateId} />;
}
