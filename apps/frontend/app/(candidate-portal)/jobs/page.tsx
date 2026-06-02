"use client";
// app/(portal)/jobs/page.tsx, public job board.
import { Card, Button, Skeleton, ErrorState, EmptyState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import type { Requisition } from "@/lib/types";
// GET /api/public/jobs  (public, no auth)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function getJobs(): Promise<Requisition[]> {
  const r = await fetch(`${API_BASE}/public/jobs`, { credentials: "include" });
  if (!r.ok) throw new Error(`GET /public/jobs -> ${r.status}`);
  const res: any = await r.json();
  const rows = Array.isArray(res) ? res : res?.data ?? res?.jobs ?? [];
  return rows.map((j: any): Requisition => ({
    id: String(j.id ?? j.slug ?? ""), title: j.title ?? "Role", department: j.department ?? "", location: j.location ?? "",
    status: (j.status ?? "OPEN"), employmentType: j.employmentType ?? "",
    requiredSkills: j.requiredSkills ?? j.requirements ?? [],
    openings: j.openings ?? 1, candidateCount: j.candidateCount ?? 0, createdAt: j.createdAt ?? "", updatedAt: j.updatedAt ?? "",
  }));
}

export default function JobsPage() {
  const { data, loading, error, reload } = useData<Requisition[]>(getJobs);
  return (
    <div className="mx-auto w-full max-w-[820px] p-6">
      <header className="mb-6"><h1 className="text-3xl font-extrabold tracking-tight">Open roles</h1><p className="mt-1 text-ink-2">Join the team. AI is assistive in our process, a human makes every decision.</p></header>
      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>}
      {error && <ErrorState title="Could not load roles" body="The careers service did not respond." code="GET /api/public/jobs" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No open roles right now" body="Check back soon, or follow us for updates." />}
      {data && data.length > 0 && (
        <div className="flex flex-col gap-2">
          {data.map((j) => (
            <a key={j.id} href={`/jobs/${j.id}/apply`}>
              <Card material="flat" className="rounded-xl border border-line p-5 hover:bg-surface-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">{j.department} · {j.location}</div>
                <div className="mt-1 text-lg font-bold">{j.title}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">{(j.requiredSkills ?? []).slice(0, 4).map((s) => <span key={s} className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs">{s}</span>)}</div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
