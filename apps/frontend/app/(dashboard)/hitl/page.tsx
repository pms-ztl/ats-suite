"use client";
// app/(dashboard)/hitl/page.tsx - EXACT Claude Design "Aurora" layout.
// Human-in-the-loop review queue. Evidence packs, reason codes, SLAs.
// Wired to the gateway /agents/hitl via lib/api.
import { AIChip, ConfidenceMeter, Card, Skeleton, EmptyState, ErrorState, Button } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listReviewQueue } from "@/lib/api";
import type { ReviewItem } from "@/lib/types";

export default function HitlPage() {
  const { data, loading, error, reload } = useData<ReviewItem[]>(listReviewQueue);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Review queue</h1>
        <p className="mt-1 text-ink-2">Low-confidence and flagged verdicts routed to a human. Read the evidence, then decide.</p>
      </header>

      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>}
      {error && <ErrorState title="Could not load the review queue" body="The HITL service did not respond." code="GET /api/hitl" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="Queue is clear" body="Nothing needs human review right now. Flagged verdicts will arrive here with a full evidence pack." />}

      {data && data.length > 0 && (
        <div className="grid gap-3">
          {data.map((r) => (
            <Card key={r.id} material="flat" className="rounded-xl border border-line p-4">
              <div className="flex flex-wrap items-center gap-3">
                <AIChip>{r.verdict.agent}</AIChip>
                <span className="rounded-pill bg-warn-tint px-2 py-0.5 text-xs font-bold text-warn">{r.reasonCode}</span>
                <span className="ml-auto font-mono text-xs tabular-nums text-ink-3">SLA due {r.slaDueAt ? new Date(r.slaDueAt).toLocaleString() : "-"}</span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
                <p className="text-sm text-ink-2">{r.verdict.summary}</p>
                <ConfidenceMeter value={r.verdict.confidence} />
              </div>
              <div className="mt-3 text-right">
                <a href={`/hitl/${r.id}`}><Button variant="primary" size="sm">Open evidence pack</Button></a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
