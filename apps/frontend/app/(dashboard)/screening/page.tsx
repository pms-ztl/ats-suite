"use client";
// app/(dashboard)/screening/page.tsx - EXACT Claude Design "Aurora" layout.
// Screening queue + glass verdict side panel. Result states: PASS / REVIEW / FAIL.
// AI is advisory; a human advances or declines. Wired to api.screening via lib/api.
import { useState } from "react";
import { Button, AIChip, ConfidenceMeter, Card, StatusBadge, Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listScreening } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult } from "@/lib/types";

const RESULT_BADGE: Record<ScreeningResult, "pass" | "review" | "fail"> = {
  PASS: "pass", REVIEW: "review", FAIL: "fail",
};

export default function ScreeningPage() {
  const { data, loading, error, reload } = useData<ScreeningVerdict[]>(listScreening);
  const [open, setOpen] = useState<ScreeningVerdict | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Screening queue</h1>
        <p className="mt-1 text-ink-2">Evidence-backed AI verdicts. Open one to review and decide. A human always advances.</p>
      </header>

      {loading && (
        <div className="grid gap-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      )}

      {error && <ErrorState title="Could not load screening" body="The screening service did not respond." code="GET /api/screening" onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState title="Nothing to screen yet" body="When candidates apply, the candidate-screener scores them here for your review." />
      )}

      {data && data.length > 0 && (
        <Card material="flat" className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="p-3">Candidate</th><th className="p-3">Score</th><th className="p-3">Confidence</th><th className="p-3">Result</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {data.map((v) => (
                <tr key={v.id ?? v.candidateId} className="border-b border-line last:border-0">
                  <td className="p-3 font-semibold">{v.candidateId}</td>
                  <td className="p-3 font-mono tabular-nums">{v.score}</td>
                  <td className="w-48 p-3"><ConfidenceMeter value={v.confidence} /></td>
                  <td className="p-3"><StatusBadge status={RESULT_BADGE[v.result]} icon={null} /></td>
                  <td className="p-3 text-right">
                    <Button variant="soft" size="sm" onClick={() => setOpen(v)} aria-haspopup="dialog">Open verdict</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {open && <VerdictPanel v={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function VerdictPanel({ v, onClose }: { v: ScreeningVerdict; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Screening verdict"
      className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <Card material="glass" className="h-full w-full max-w-[460px] overflow-y-auto p-6">
        <div className="flex items-start justify-between">
          <AIChip>{v.agent}</AIChip>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">Close</Button>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <span className="font-mono text-4xl font-extrabold tabular-nums">{v.score}</span>
          <span className="pb-1 text-ink-3">match score</span>
        </div>
        <div className="mt-3"><ConfidenceMeter value={v.confidence} /></div>
        <p className="mt-4 text-sm text-ink-2">{v.summary}</p>
        <h2 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wide text-ink-3">Per-requirement evidence</h2>
        <ul className="flex flex-col gap-2">
          {v.requirements.map((r, i) => (
            <li key={i} className="rounded border border-line bg-surface p-3">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{r.requirement}</span>
                <span className={r.met === true ? "text-ok" : r.met === "partial" ? "text-warn" : "text-ink-3"}>
                  {r.met === true ? "Met" : r.met === "partial" ? "Partial" : "Not met"}
                </span>
              </div>
              <p className="mt-1 flex gap-1.5 text-xs text-ink-3"><span className="text-ai">AI</span>{r.evidence}</p>
            </li>
          ))}
        </ul>
        <div className="sticky bottom-0 mt-5 flex gap-2 border-t border-line bg-surface/80 py-3 backdrop-blur">
          <Button variant="danger" className="flex-1">Decline</Button>
          <Button variant="primary" className="flex-1">Advance</Button>
        </div>
        <p className="mt-3 text-center text-xs text-ink-3">AI is advisory. This verdict supports your judgment, it does not replace it.</p>
      </Card>
    </div>
  );
}
