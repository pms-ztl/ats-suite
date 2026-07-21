"use client";
// app/(embed)/embed/screening/[token]/page.tsx
//
// WF9 / SLICE I1 — chrome-less SCREENING embed. Renders the existing Claude
// Design Screening queue (components/cd/screens/Screening) over the REAL,
// server-locked screening verdicts — tenant-scoped, and locked to a requisition
// when the embed token carries one. The verdict-flow ribbon is derived from the
// SAME rows the dashboard uses (real PASS / REVIEW / FAIL counts + avg score).
// Read-only by design: no decide / bulk callbacks are passed, so the embed
// surfaces the AI assessments without exposing a write path to the host site.
// EmbedShell validates the token, applies the tenant brand, and fails closed.
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Screening } from "@/components/cd/screens/Screening";
import type { ScreeningData, ScreeningRow, ReqBreakdown, VerdictKind } from "@/components/cd/types";
import { EmbedShell, fetchEmbedData } from "../../embed-shell";

// ── raw-row -> view-model mapping (mirrors lib/api.ts toVerdict + screening-live
// toRow, kept self-contained so the embed has no dependency on the auth client). ──
const RESULT_LABEL: Record<VerdictKind, string> = { pass: "PASS", review: "REVIEW", fail: "FAIL" };
const BAND: Record<VerdictKind, string> = { pass: "Strong match", review: "Strong potential", fail: "Below the bar" };

function kindOf(result: unknown): VerdictKind {
  const r = String(result ?? "REVIEW").toUpperCase();
  return r === "PASS" ? "pass" : r === "FAIL" ? "fail" : "review";
}
function reqState(r: any): VerdictKind {
  const met = r?.met === true || r?.status === "MATCH" || r?.outcome === "met";
  const partial = r?.met === "partial" || r?.status === "PARTIAL" || r?.outcome === "partial";
  return met ? "pass" : partial ? "review" : "fail";
}
function initials(name: string): string {
  const p = String(name).trim().split(/\s+/).filter(Boolean);
  return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?";
}

function toRow(s: any): ScreeningRow {
  const kind = kindOf(s?.result);
  const findings = s?.requirementFindings ?? s?.signals ?? s?.findings ?? [];
  const requirements: ReqBreakdown[] = Array.isArray(findings)
    ? findings.map((req: any, i: number) => ({
        id: `r${i + 1}`,
        label: req?.requirement ?? req?.label ?? req?.name ?? "Requirement",
        state: reqState(req),
        note: req?.evidence ?? req?.detail ?? req?.reasoning ?? "",
      }))
    : [];
  // The embed payload carries only what the screening row stores; candidate /
  // requisition names are auth-gated lookups not available to an anonymous embed,
  // so we honestly show the candidate id (never a fabricated name).
  const name = s?.candidate?.name || [s?.candidate?.firstName, s?.candidate?.lastName].filter(Boolean).join(" ") || s?.candidateId || "Candidate";
  return {
    id: s?.id ?? s?.candidateId ?? Math.random().toString(36).slice(2),
    candidateId: s?.candidateId ?? "",
    ini: initials(name),
    name,
    role: s?.agentType ?? s?.screeningType ?? "candidate-screener",
    reqId: s?.requisitionId ?? "",
    score: Math.round(Number(s?.score ?? s?.matchPercentage ?? 0)),
    kind,
    conf: Number(s?.confidence ?? (s?.matchPercentage != null ? s.matchPercentage / 100 : 0.7)),
    band: BAND[kind],
    status: "pending",
    reasoning: s?.reasoning ?? s?.summary ?? "No summary provided.",
    requirements,
  };
}

function ScreeningBody({ token }: { token: string }) {
  const [rows, setRows] = useState<ScreeningRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchEmbedData<{ screenings?: any[] }>(token);
      if (cancelled) return;
      const raw = Array.isArray(data?.screenings) ? data!.screenings! : [];
      setRows(raw.map(toRow));
    })();
    return () => { cancelled = true; };
  }, [token]);

  const data: ScreeningData = { rows: rows ?? [], requirements: [], trace: [] };

  // Real verdict-flow ribbon points (same derivation as screening-live).
  const verdictFlow = (["pass", "review", "fail"] as VerdictKind[]).map((k) => {
    const scores = (rows ?? []).filter((r) => r.kind === k).map((r) => r.score);
    return {
      label: RESULT_LABEL[k].charAt(0) + RESULT_LABEL[k].slice(1).toLowerCase(),
      n: scores.length,
      sub: scores.length ? `avg ${Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)}` : undefined,
    };
  });

  // The CD Screening screen wants a flex parent with a real height (it owns its
  // own internal scroll). Give it a full-viewport column inside the embed.
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: 0 }}>
      <Screening data={data} verdictFlow={verdictFlow} />
    </div>
  );
}

export default function EmbedScreeningPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <EmbedShell token={token ?? ""} expectedModule="screening">
      {({ token: t }) => <ScreeningBody token={t} />}
    </EmbedShell>
  );
}
