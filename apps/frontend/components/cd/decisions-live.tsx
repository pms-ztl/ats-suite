"use client";
// components/cd/decisions-live.tsx
// The standalone GET /api/decisions route does not exist (404), so the previous
// wiring always collapsed to a fake "no decisions" empty state. Repointed to the
// REAL human-in-the-loop review queue (listReviewQueue -> GET /api/agents/hitl):
// these are the candidates genuinely awaiting a human decision. When the queue is
// empty the empty state is now HONEST (a real query returned zero), not a 404.
import { Decisions } from "./screens/Decisions";
import { useData } from "@/lib/use-data";
import { listReviewQueue, listRequisitions, listCandidates } from "@/lib/api";
import type { Requisition, Candidate } from "@/lib/types";
import type { ReviewItem } from "@/lib/aurora-types";
import type { Decision, AiRec } from "./types";
import { initials, ago, reqTitleMap } from "./wire-helpers";

const REC: Record<string, AiRec> = { PASS: "hire", FAIL: "reject", REVIEW: "hold" };

export function DecisionsLive() {
  const queue = useData<ReviewItem[]>(listReviewQueue);
  const reqs = useData<Requisition[]>(listRequisitions);
  const cands = useData<Candidate[]>(listCandidates);

  // Decisions seeds local state from the data on mount, so render only once all
  // fetches settle (else it freezes on the empty loading array).
  if (queue.loading || reqs.loading || cands.loading) return null;

  const titles = reqTitleMap(reqs.data);
  const candById = new Map((cands.data ?? []).map((c) => [c.id, c.name]));

  const decisions: Decision[] = (queue.data ?? []).map((r) => {
    const v = r.verdict;
    const name = candById.get(r.candidateId) || v?.candidateId || r.candidateId;
    const conf = v?.confidence ?? 0;
    return {
      id: r.id,
      ini: initials(name),
      name,
      role: titles[r.requisitionId] ?? "",
      reqId: r.requisitionId,
      aiRec: REC[v?.result ?? "REVIEW"] ?? "hold",
      aiConf: conf,
      screenScore: v?.score ?? 0,
      interviewAvg: 0,
      status: "pending",
      by: r.assignedTo ?? "",
      when: ago(r.slaDueAt),
      rationale: v?.summary || `Flagged for review: ${String(r.reasonCode).replace(/_/g, " ").toLowerCase()}.`,
      lowConf: conf > 0 && conf < 0.7,
    };
  });

  return <Decisions data={{ decisions }} />;
}
