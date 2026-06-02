"use client";
// app/(dashboard)/hitl/[id]/page.tsx, review detail: evidence pack, reason codes,
// reasoning trace, anti-rubber-stamp (a reason is required before resolving).
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button, AIChip, ConfidenceMeter, Card, Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getReviewItem, resolveReview } from "@/lib/api";
import type { ReviewItem } from "@/lib/types";

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useData<ReviewItem>(() => getReviewItem(id), [id]);
  const [note, setNote] = useState("");

  if (loading) return <div className="mx-auto max-w-[900px]"><Skeleton className="h-48 rounded-2xl" /></div>;
  if (error || !data) return <div className="mx-auto max-w-[900px]"><ErrorState title="Review item not found" body="Could not load this review." code={`GET /api/hitl/${id}`} onRetry={reload} /></div>;
  const v = data.verdict;

  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Human review</h1>
        <span className="rounded-pill bg-warn-tint px-2 py-0.5 text-xs font-bold text-warn">{data.reasonCode}</span>
        <span className="ml-auto font-mono text-xs tabular-nums text-ink-3">SLA {new Date(data.slaDueAt).toLocaleString()}</span>
      </header>

      <Card material="flat" className="mb-4 rounded-2xl border border-line p-5">
        <div className="mb-3 flex items-center gap-3"><AIChip>{v.agent}</AIChip><span className="font-mono text-3xl font-extrabold tabular-nums">{v.score}</span></div>
        <ConfidenceMeter value={v.confidence} />
        <p className="mt-3 text-sm text-ink-2">{v.summary}</p>
        <h2 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-ink-3">Evidence pack</h2>
        <ul className="flex flex-col gap-2">
          {v.requirements.map((r, i) => (
            <li key={i} className="rounded border border-line bg-surface p-3 text-sm">
              <div className="flex justify-between font-semibold"><span>{r.requirement}</span><span className={r.met === true ? "text-ok" : r.met === "partial" ? "text-warn" : "text-ink-3"}>{r.met === true ? "Met" : r.met === "partial" ? "Partial" : "Not met"}</span></div>
              <p className="mt-1 text-xs text-ink-3">{r.evidence}</p>
            </li>
          ))}
        </ul>
        {v.reasoningTrace && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-ai-ink">Reasoning trace</summary>
            <ol className="mt-2 flex flex-col gap-1 text-xs text-ink-2">
              {v.reasoningTrace.map((s, i) => <li key={i}><b>{s.step}:</b> {s.detail}</li>)}
            </ol>
          </details>
        )}
      </Card>

      <Card material="flat" className="rounded-2xl border border-line p-5">
        <h2 className="mb-2 text-sm font-bold tracking-tight">Your decision</h2>
        <p className="mb-3 text-xs text-ink-3">A written reason is required. This is recorded against your identity in the audit trail.</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Why are you confirming or overriding this verdict?"
          className="mb-3 w-full rounded border border-line-2 bg-surface p-3 outline-none focus-visible:shadow-ring" />
        <div className="flex gap-2">
          <Button variant="danger" disabled={!note.trim()} onClick={() => resolveReview(id, { result: "FAIL", note })}>Override to fail</Button>
          <Button variant="primary" disabled={!note.trim()} onClick={() => resolveReview(id, { result: "PASS", note })}>Confirm pass</Button>
        </div>
      </Card>
    </div>
  );
}
