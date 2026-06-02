"use client";
// app/(dashboard)/analytics/time-to-hire/page.tsx
import { Card } from "@/components/aurora";
export default function TimeToHirePage() {
  const byDept = [["Engineering", 24], ["Design", 19], ["Data", 28], ["Sales", 15]] as const;
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Time to hire</h1><p className="mt-1 text-ink-2">Median days from application to accepted offer.</p></header>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <div className="mb-4 font-mono text-4xl font-extrabold tabular-nums">21<span className="text-lg text-ink-3"> days median</span></div>
        {byDept.map(([d, v]) => (
          <div key={d} className="mb-2 flex items-center gap-3">
            <span className="w-28 text-sm text-ink-2">{d}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-surface-3"><div className="h-full rounded bg-brand" style={{ width: `${(v / 30) * 100}%` }} /></div>
            <span className="w-12 text-right font-mono text-sm tabular-nums">{v}d</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
