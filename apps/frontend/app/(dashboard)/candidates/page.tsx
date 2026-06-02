"use client";
// app/(dashboard)/candidates/page.tsx, high-volume triage table.
// AI score + stage + result + bulk actions. View switch (board/table) lives in shell.
import { Button, AIChip, StatusBadge, Card, Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listCandidates } from "@/lib/api";
import type { Candidate, ApplicationStage } from "@/lib/types";

const STAGES: ApplicationStage[] = [
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
];

export default function CandidatesPage() {
  const { data, loading, error, reload } = useData<Candidate[]>(() => listCandidates());
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Candidates</h1>
          <p className="mt-1 text-ink-2">Triage at volume. AI scores are advisory; you move people forward.</p>
        </div>
        <Button variant="ai" size="sm">AI sourcing</Button>
      </header>

      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>}
      {error && <ErrorState title="Could not load candidates" body="The candidate service did not respond." code="GET /api/candidates" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No candidates yet" body="Import a list or open AI sourcing to start your pipeline." actions={<Button variant="ai">AI sourcing</Button>} />}

      {data && data.length > 0 && (
        <Card material="flat" className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="p-3">Name</th><th className="p-3">Stage</th><th className="p-3">AI score</th><th className="p-3">Source</th><th className="p-3">In stage</th></tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-surface-2">
                  <td className="p-3"><a href={`/candidates/${c.id}`} className="font-semibold hover:text-brand-ink">{c.name}</a><div className="text-xs text-ink-3">{c.email}</div></td>
                  <td className="p-3"><span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{c.stage}</span></td>
                  <td className="p-3">{c.aiScore != null ? <span className="inline-flex items-center gap-1.5"><AIChip>{String(c.aiScore)}</AIChip></span> : <span className="text-ink-3">,</span>}</td>
                  <td className="p-3 text-ink-2">{c.source ?? ""}</td>
                  <td className="p-3 font-mono tabular-nums text-ink-2">{c.timeInStageDays ?? 0}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="mt-3 text-xs text-ink-3">Stages use the verbatim ApplicationStage enum: {STAGES.join(", ")}.</p>
    </div>
  );
}
