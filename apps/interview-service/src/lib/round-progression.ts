/**
 * Round progression — shared by HTTP advance-round endpoint AND the
 * feedback-advance flow. When the round has defaultPanelistRole, calls
 * identity-service to find active users with that role and round-robin
 * assigns ONE of them as panelist (least-recently-assigned wins).
 */
import { publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";
import { prisma } from "./prisma.js";
import { fetchActiveUsersByRole } from "./service-client.js";
import { buildBuiltInRoomUrl } from "./built-in-room.js";

export type AdvanceTriggeredBy = "user" | "auto";

/**
 * Map the next round's InterviewType to the canonical ApplicationStage the
 * pipeline should reflect once that round starts. TECHNICAL rounds land on the
 * first-class TECHNICAL_ROUND stage; behavioral/panel rounds land on HR_ROUND;
 * a FINAL round closes out on FINAL_REVIEW. PHONE_SCREEN keeps the existing
 * PHONE_SCREEN stage. A candidate-service subscriber consumes the event and
 * advances forward-only (terminal/past stages are never regressed).
 */
function canonicalStageForRoundType(interviewType: string): string {
  switch (interviewType) {
    case "PHONE_SCREEN": return "PHONE_SCREEN";
    case "TECHNICAL":    return "TECHNICAL_ROUND";
    case "FINAL":        return "FINAL_REVIEW";
    case "BEHAVIORAL":
    case "PANEL":
    default:             return "HR_ROUND";
  }
}

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

  // Create stub interview for the next round, then stamp the tenant's OWN
  // built-in room URL (bound to the new interview id) so the room link is ready
  // when this round is scheduled. Never an external meeting tool.
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
  await prisma.interview.update({
    where: { id: interview.id },
    data: { meetingUrl: buildBuiltInRoomUrl(interview.id) },
  });

  // ── Connect the interview leg to the canonical pipeline ──────────────
  // Publish interview.round.started so candidate-service can advance the
  // Application.stage to the canonical stage for this round type
  // (TECHNICAL -> TECHNICAL_ROUND, BEHAVIORAL/PANEL -> HR_ROUND,
  // FINAL -> FINAL_REVIEW). Best-effort: a NATS outage must not break the
  // round progression itself. The subscriber forward-only advances, so a
  // candidate already at/past the target stage is never regressed.
  const targetStage = canonicalStageForRoundType(nextRound.interviewType);
  await publishEvent({
    subject: tenantSubject(tenantId, "interview", "round.started"),
    type: "interview.round.started",
    tenantId,
    payload: {
      tenantId,
      applicationId,
      candidateId,
      requisitionId,
      interviewId: interview.id,
      roundId: nextRound.id,
      roundNumber: nextRound.order,
      roundName: nextRound.name,
      interviewType: nextRound.interviewType,
      targetStage,
    },
  }).catch(() => undefined);

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
