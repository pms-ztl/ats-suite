"use client";
// components/cd/decisions-live.tsx
// Wires the verbatim CD Decisions to the gateway: listDecisions() + listRequisitions()
// -> DecisionsData. The gateway Decision is lean (no stored screening/interview metrics
// or rationale text), so those map to 0 / a derived line; the human-approval flow and
// the optimistic status updates are handled inside the screen.
import { Decisions } from "./screens/Decisions";
import { useData } from "@/lib/use-data";
import { listDecisions, listRequisitions } from "@/lib/api";
import type { Decision as GwDecision, Requisition, DecisionType, DecisionStatus } from "@/lib/types";
import type { Decision, AiRec, DecStatus } from "./types";
import { initials, ago, reqTitleMap } from "./wire-helpers";

const REC: Record<DecisionType, AiRec> = { HIRE: "hire", REJECT: "reject", HOLD: "hold" };
const STATUS: Record<DecisionStatus, DecStatus> = {
  PENDING_APPROVAL: "pending", APPROVED: "approved", SENT: "sent", ACCEPTED: "accepted", DECLINED: "declined",
};

export function DecisionsLive() {
  const decs = useData<GwDecision[]>(listDecisions);
  const reqs = useData<Requisition[]>(listRequisitions);
  const titles = reqTitleMap(reqs.data);

  // Decisions seeds local state from the data on mount, so render only once both
  // fetches settle (else it freezes on the empty loading array).
  if (decs.loading || reqs.loading) return null;

  const decisions: Decision[] = (decs.data ?? []).map((d) => {
    const aiConf = d.aiRecommendation?.confidence ?? 0;
    return {
      id: d.id,
      ini: initials(d.candidateId),
      name: d.candidateId,
      role: titles[d.requisitionId] ?? "",
      reqId: d.requisitionId,
      aiRec: d.aiRecommendation ? REC[d.aiRecommendation.type] : "hold",
      aiConf,
      screenScore: 0,
      interviewAvg: 0,
      status: STATUS[d.status] ?? "pending",
      by: d.decidedBy ?? "",
      when: ago(d.createdAt),
      rationale: d.reasonCode
        ? `Reason on file: ${d.reasonCode.replace(/_/g, " ").toLowerCase()}.`
        : "AI recommendation recorded; a human approves the decision.",
      lowConf: aiConf > 0 && aiConf < 0.7,
    };
  });

  return <Decisions data={{ decisions }} />;
}
