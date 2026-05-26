/**
 * Port of monolith's round-progression.ts — shared by HTTP advance-round
 * endpoint AND the feedback-advance worker (Batch 6 logic).
 */
import { prisma } from "./prisma.js";

export type AdvanceTriggeredBy = "user" | "auto";

export interface AdvanceResult {
  interview: any;
  round: any;
  assignedPanelistId: string | null;
  reason: "scheduled" | "no_more_rounds" | "no_panelist_available";
}

export async function advanceApplicationToNextRound(args: {
  applicationId: string;
  candidateId: string;
  requisitionId: string;
  tenantId: string;
  triggeredBy: AdvanceTriggeredBy;
}): Promise<AdvanceResult> {
  const { applicationId, candidateId, requisitionId, tenantId } = args;

  const lastInterview = await prisma.interview.findFirst({
    where: { applicationId, tenantId, roundId: { not: null } },
    orderBy: [{ roundNumber: "desc" }, { createdAt: "desc" }],
    select: { roundNumber: true },
  });
  const nextOrder = (lastInterview?.roundNumber ?? 0) + 1;

  const nextRound = await prisma.interviewRound.findFirst({
    where: { requisitionId, tenantId, order: nextOrder },
  });
  if (!nextRound) {
    return { interview: null, round: null, assignedPanelistId: null, reason: "no_more_rounds" };
  }

  const interview = await prisma.interview.create({
    data: {
      tenantId, requisitionId, candidateId, applicationId,
      roundId: nextRound.id,
      roundNumber: nextRound.order,
      type: nextRound.interviewType,
      stage: nextRound.name,
      duration: nextRound.durationMinutes,
      status: "SCHEDULED",
    },
  });

  // Phase 3 stub: skip cross-service user lookup. In Phase 3.5 we'd call
  // identity-service /internal/users?tenantId=&role= to find candidates.
  // For now, panelist auto-assign is a no-op + emits "no_panelist_available".
  return {
    interview,
    round: nextRound,
    assignedPanelistId: null,
    reason: nextRound.defaultPanelistRole ? "no_panelist_available" : "scheduled",
  };
}
