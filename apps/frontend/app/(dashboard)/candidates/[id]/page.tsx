"use client";
// app/(dashboard)/candidates/[id]/page.tsx, rich multi-zone candidate profile.
// Screening verdict + scorecards + activity + parsed résumé. prev/next + blind mode.
// Reflows to a single column on small viewports.
import { useParams } from "next/navigation";
import { Button, AIChip, ConfidenceMeter, Card, StatusBadge, Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getCandidate, getVerdict } from "@/lib/api";
import type { Candidate, ScreeningVerdict } from "@/lib/types";

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const cand = useData<Candidate>(() => getCandidate(id), [id]);
  const verdict = useData<ScreeningVerdict>(() => getVerdict(id), [id]);

  if (cand.loading) return <div className="mx-auto max-w-[1280px]"><Skeleton className="h-40 rounded-2xl" /></div>;
  if (cand.error || !cand.data) return <div className="mx-auto max-w-[1280px]"><ErrorState title="Candidate not found" body="We could not load this candidate." code={`GET /api/candidates/${id}`} onRetry={cand.reload} /></div>;
  const c = cand.data;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1">
          <Button variant="soft" size="sm">Previous</Button>
          <Button variant="soft" size="sm">Next</Button>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input type="checkbox" className="size-4 accent-brand" /> Blind / bias-reduced mode
        </label>
      </div>

      {/* multi-zone: collapses 1.6fr/1fr to single column under 920px */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card material="clay" className="rounded-2xl p-5">
            <h1 className="text-xl font-extrabold tracking-tight">{c.name}</h1>
            <p className="text-ink-3">{c.email} · {c.location}</p>
            <div className="mt-3"><span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{c.stage}</span></div>
          </Card>

          <Card material="flat" className="rounded-2xl border border-line p-5">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-3">Screening verdict</h2>
            {verdict.loading && <Skeleton className="h-28 rounded-xl" />}
            {verdict.data && (
              <div>
                <div className="flex items-center gap-3">
                  <AIChip>{verdict.data.agent}</AIChip>
                  <span className="font-mono text-3xl font-extrabold tabular-nums">{verdict.data.score}</span>
                </div>
                <div className="mt-3"><ConfidenceMeter value={verdict.data.confidence} /></div>
                <p className="mt-3 text-sm text-ink-2">{verdict.data.summary}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card material="flat" className="rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Parsed résumé</h2>
            <p className="text-sm text-ink-3">Parsed fields with source highlights load here from the resume-parser.</p>
          </Card>
          <Card material="flat" className="rounded-2xl border border-line p-5">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Activity &amp; notes</h2>
            <p className="text-sm text-ink-3">Timeline of stage moves, scorecards, and notes.</p>
          </Card>
          <Button variant="primary" className="w-full">Advance candidate</Button>
        </div>
      </div>
    </div>
  );
}
