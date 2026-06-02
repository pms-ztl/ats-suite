"use client";
// app/(dashboard)/analytics/diversity/page.tsx, diversity breakdown (aggregate, privacy-safe).
import { AIChip, Card } from "@/components/aurora";
export default function DiversityPage() {
  const stages = [["Applied", 48], ["Screened", 46], ["Interview", 44], ["Offer", 43], ["Hired", 42]] as const;
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Diversity</h1><p className="mt-1 text-ink-2">Representation across the funnel, aggregate and privacy-safe.</p></header>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <div className="mb-3 flex items-center gap-2"><AIChip>bias-auditor</AIChip><span className="text-sm text-ink-2">Representation holds steady through the funnel, no significant drop-off flagged.</span></div>
        {stages.map(([s, v]) => (
          <div key={s} className="mb-2 flex items-center gap-3">
            <span className="w-24 text-sm text-ink-2">{s}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-surface-3"><div className="h-full rounded bg-ai" style={{ width: `${v}%` }} /></div>
            <span className="w-12 text-right font-mono text-sm tabular-nums">{v}%</span>
          </div>
        ))}
        <p className="mt-3 text-xs text-ink-3">See the compliance hub for the adverse-impact ratio against the 0.80 threshold.</p>
      </Card>
    </div>
  );
}
