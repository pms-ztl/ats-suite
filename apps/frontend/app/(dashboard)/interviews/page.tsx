"use client";
// app/(dashboard)/interviews/page.tsx - EXACT Claude Design "Aurora" layout.
// Interviews list; InterviewStatus drives the badges. Wired to api.interviews.
import { StatusBadge, Card, Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listInterviews } from "@/lib/api";
import type { Interview, InterviewStatus } from "@/lib/types";

const BADGE: Record<InterviewStatus, "open" | "review" | "pass" | "fail" | "draft"> = {
  SCHEDULED: "open", CONFIRMED: "pass", IN_PROGRESS: "review", COMPLETED: "review",
  CANCELLED: "fail", NO_SHOW: "fail", RESCHEDULED: "open",
};

export default function InterviewsPage() {
  const { data, loading, error, reload } = useData<Interview[]>(listInterviews);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Interviews</h1>
        <p className="mt-1 text-ink-2">Upcoming and completed rounds. AI proposes slots; you confirm.</p>
      </header>
      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}
      {error && <ErrorState title="Could not load interviews" body="The interviews service did not respond." code="GET /api/interviews" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No interviews scheduled" body="When you schedule a round it appears here with the panel and AI-proposed times." />}
      {data && data.length > 0 && (
        <div className="grid gap-2">
          {data.map((iv) => (
            <Card key={iv.id} material="flat" className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{iv.round}</div>
                <div className="text-xs text-ink-3">{iv.startsAt ? new Date(iv.startsAt).toLocaleString() : "Unscheduled"} · {iv.durationMins}m · {iv.mode}</div>
              </div>
              <StatusBadge status={BADGE[iv.status] ?? "draft"} icon={null} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
