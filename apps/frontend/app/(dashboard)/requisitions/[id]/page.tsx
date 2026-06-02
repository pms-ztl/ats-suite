"use client";
// app/(dashboard)/requisitions/[id]/page.tsx, requisition detail + candidate pipeline.
import { useParams } from "next/navigation";
import { Button, AIChip, Card, Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getRequisition, listCandidates } from "@/lib/api";
import type { Requisition, Candidate, ApplicationStage } from "@/lib/types";

const STAGES: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];

export default function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const req = useData<Requisition>(() => getRequisition(id), [id]);
  const cands = useData<Candidate[]>(() => listCandidates({ requisitionId: id }), [id]);

  if (req.loading) return <div className="mx-auto max-w-[1280px]"><Skeleton className="h-32 rounded-2xl" /></div>;
  if (req.error || !req.data) return <div className="mx-auto max-w-[1280px]"><ErrorState title="Requisition not found" body="Could not load this requisition." code={`GET /api/requisitions/${id}`} onRetry={req.reload} /></div>;
  const r = req.data;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{r.title}</h1>
          <p className="mt-1 text-ink-2">{r.department} · {r.location} · {r.status}</p>
        </div>
        <div className="flex gap-2">
          <a href={`/requisitions/${id}/rounds`}><Button variant="soft" size="sm">Interview rounds</Button></a>
          <a href={`/requisitions/${id}/form-builder`}><Button variant="soft" size="sm">Form builder</Button></a>
        </div>
      </header>

      {/* pipeline by stage */}
      <div className="grid grid-flow-col gap-3 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <Card key={stage} material="flat" className="w-64 shrink-0 rounded-xl border border-line p-3">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-3">{stage}</div>
            {cands.loading && <Skeleton className="h-16 rounded-lg" />}
            {cands.data?.filter((c) => c.stage === stage).map((c) => (
              <a key={c.id} href={`/candidates/${c.id}`} className="mb-2 block rounded-lg border border-line bg-surface p-2 hover:bg-surface-2">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">{c.name}</span>{c.aiScore != null && <AIChip>{String(c.aiScore)}</AIChip>}</div>
                <div className="text-xs text-ink-3">{c.timeInStageDays ?? 0}d in stage</div>
              </a>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}
