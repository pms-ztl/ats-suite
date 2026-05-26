/**
 * Round progression — shared by HTTP advance-round endpoint AND the
 * feedback-advance flow. When the round has defaultPanelistRole, calls
 * identity-service to find active users with that role and round-robin
 * assigns ONE of them as panelist (least-recently-assigned wins).
 */
import { prisma } from "./prisma.js";
import { fetchActiveUsersByRole } from "./service-client.js";

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

  // Find latest round for this application
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

  // Create stub interview for the next round
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

  // ── Phase 6b: round-robin panelist auto-assign ──────────────────────
  let assignedPanelistId: string | null = null;
  let reason: AdvanceResult["reason"] = "scheduled";

  if (nextRound.defaultPanelistRole) {
    const candidates = await fetchActiveUsersByRole(tenantId, nextRound.defaultPanelistRole);

    if (candidates.length === 0) {
      reason = "no_panelist_available";
    } else {
      // Round-robin: pick user whose most recent assignment is oldest.
      // Tracked via InterviewPanelMember.interview.createdAt.
      const lastAssignments = await prisma.interviewPanelMember.findMany({
        where: { userId: { in: candidates.map((c) => c.id) } },
        include: { interview: { select: { createdAt: true } } },
        orderBy: { createdAt: "desc" },
      });

      const lastTsByUser = new Map<string, Date>();
      for (const a of lastAssignments) {
        if (!lastTsByUser.has(a.userId)) {
          lastTsByUser.set(a.userId, a.interview.createdAt);
        }
      }

      // Users with no prior assignment go first (epoch=0), then sort ASC by lastTs
      const sorted = candidates
        .map((c) => ({ userId: c.id, lastTs: lastTsByUser.get(c.id) ?? new Date(0) }))
        .sort((a, b) => a.lastTs.getTime() - b.lastTs.getTime());

      const picked = sorted[0]!.userId;

      await prisma.interviewPanelMember.create({
        data: {
          interviewId: interview.id,
          userId: picked,
          role: nextRound.defaultPanelistRole,
          isRequired: true,
          confirmed: false,
        },
      });
      assignedPanelistId = picked;
    }
  }

  return { interview, round: nextRound, assignedPanelistId, reason };
}
