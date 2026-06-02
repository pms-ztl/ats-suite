"use client";
// app/(dashboard)/requisitions/page.tsx, requisitions list.
import { Button, StatusBadge, Card, Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listRequisitions } from "@/lib/api";
import type { Requisition } from "@/lib/types";

export default function RequisitionsPage() {
  const { data, loading, error, reload } = useData<Requisition[]>(listRequisitions);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Requisitions</h1>
          <p className="mt-1 text-ink-2">Open roles and their pipelines.</p>
        </div>
        <a href="/requisitions/new"><Button variant="primary" size="sm">New requisition</Button></a>
      </header>

      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}
      {error && <ErrorState title="Could not load requisitions" body="The requisitions service did not respond." code="GET /api/requisitions" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No requisitions yet" body="Create your first role, the jd-author agent can draft it for you." actions={<a href="/requisitions/new"><Button variant="ai">Create with AI</Button></a>} />}

      {data && data.length > 0 && (
        <div className="grid gap-2">
          {data.map((r) => (
            <a key={r.id} href={`/requisitions/${r.id}`}>
              <Card material="flat" className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4 hover:bg-surface-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-xs text-ink-3">{r.department} · {r.location}</div>
                </div>
                <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{r.status}</span>
                <span className="font-mono text-sm tabular-nums text-ink-2">{r.candidateCount} candidates</span>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
