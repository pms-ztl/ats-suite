"use client";
// app/(dashboard)/decisions/page.tsx - EXACT Claude Design "Aurora" layout.
// Human-approval-gated decisions queue. AI is advisory; the decision is empty
// until a human acts. Wired to api.decisions.
import { Button, AIChip, Card, Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listDecisions, recordDecision } from "@/lib/api";
import type { Decision } from "@/lib/types";

export default function DecisionsPage() {
  const { data, loading, error, reload } = useData<Decision[]>(listDecisions);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Decisions</h1>
        <p className="mt-1 text-ink-2">Every decision is made by a person. AI offers a recommendation, nothing is auto-decided.</p>
      </header>

      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}
      {error && <ErrorState title="Could not load decisions" body="The decisions service did not respond." code="GET /api/decisions" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No decisions pending" body="When candidates reach final review, they appear here for your call." />}

      {data && data.length > 0 && (
        <div className="grid gap-2">
          {data.map((d) => (
            <Card key={d.id} material="flat" className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{d.candidateId}</div>
                <div className="text-xs text-ink-3">Requisition {d.requisitionId}</div>
              </div>
              {d.aiRecommendation && (
                <span className="inline-flex items-center gap-2">
                  <AIChip>recommends {d.aiRecommendation.type}</AIChip>
                  <span className="font-mono text-xs tabular-nums text-ink-3">conf {d.aiRecommendation.confidence.toFixed(2)}</span>
                </span>
              )}
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => recordDecision({ id: d.id, type: "REJECT" })}>Reject</Button>
                <Button variant="soft" size="sm" onClick={() => recordDecision({ id: d.id, type: "HOLD" })}>Hold</Button>
                <Button variant="primary" size="sm" onClick={() => recordDecision({ id: d.id, type: "HIRE" })}>Hire</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
