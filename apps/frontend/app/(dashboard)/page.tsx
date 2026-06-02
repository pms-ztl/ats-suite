"use client";
// app/(dashboard)/page.tsx, role-dispatched dashboard home.
// Renders KPIs + funnel + pending actions for the signed-in user's role.
import { Button, AIChip, Card, Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getFunnel } from "@/lib/api";
import type { ApplicationStage } from "@/lib/types";

// TODO(wiring): derive from the session, GET /api/me → { role }
const ROLE: string = "ADMIN";

const KPIS = [
  { label: "Active candidates", value: "1,284", icon: "users" },
  { label: "Open reqs", value: "38", icon: "briefcase" },
  { label: "AI decisions", value: "342", ai: true },
  { label: "Time to hire", value: "21d", icon: "clock" },
];

export default function DashboardPage() {
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Org overview</h1>
          <p className="mt-1 text-ink-2">Everything happening across your hiring operation, in real time.</p>
        </div>
        <Button variant="primary" size="sm">Export report</Button>
      </header>

      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label} material="flat" className="rounded-xl border border-line p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-2">
              <span>{k.label}</span>{k.ai && <AIChip>AI</AIChip>}
            </div>
            <div className="mt-3 font-mono text-3xl font-extrabold tabular-nums">{k.value}</div>
          </Card>
        ))}
      </section>

      <Card material="flat" className="rounded-xl border border-line p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-3">Pipeline funnel</h2>
        {funnel.loading && <Skeleton className="h-40 rounded-lg" />}
        {funnel.error && <ErrorState title="Funnel unavailable" body="Could not load funnel data." code="GET /api/analytics/funnel" onRetry={funnel.reload} />}
        {funnel.data && (
          <div className="flex flex-col gap-2">
            {funnel.data.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs text-ink-2">{s.stage}</span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-surface-3">
                  <div className="h-full rounded bg-brand" style={{ width: `${Math.min(100, s.count)}%` }} />
                </div>
                <span className="w-12 text-right font-mono text-sm tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
      <p className="mt-3 text-xs text-ink-3">Dispatched for role: {ROLE}. Recruiter / hiring-manager / interviewer / admin / compliance-officer each get a tailored layout.</p>
    </div>
  );
}
