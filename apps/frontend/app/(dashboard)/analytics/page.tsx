"use client";
// app/(dashboard)/analytics/page.tsx, analytics overview (funnel + KPIs + AI insights).
// Sub-routes: /analytics/time-to-hire, /source-effectiveness, /diversity reuse this shell.
import { AIChip, Card, Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getFunnel } from "@/lib/api";
import type { ApplicationStage } from "@/lib/types";

export default function AnalyticsPage() {
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        <p className="mt-1 text-ink-2">Funnel, time-to-hire, source effectiveness, and diversity.</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card material="flat" className="rounded-xl border border-line p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-3">Conversion funnel</h2>
          {funnel.loading && <Skeleton className="h-48 rounded-lg" />}
          {funnel.error && <ErrorState title="Funnel unavailable" body="Could not load funnel." code="GET /api/analytics/funnel" onRetry={funnel.reload} />}
          {funnel.data && (
            <div className="flex flex-col gap-2">
              {funnel.data.map((s) => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-ink-2">{s.stage}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded bg-surface-3"><div className="h-full rounded bg-brand" style={{ width: `${Math.min(100, s.count)}%` }} /></div>
                  <span className="w-12 text-right font-mono text-sm tabular-nums">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card material="clay" className="rounded-xl p-5">
          <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-wide text-ink-3">Insights</h2><AIChip>copilot</AIChip></div>
          <p className="text-sm text-ink-2">AI-surfaced trends and anomalies appear here, each one a starting point for your own analysis, not a conclusion.</p>
        </Card>
      </div>
    </div>
  );
}
