import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { ok, created } from "../lib/response";

// ─── Schemas ──────────────────────────────────────────────────────────────────

/**
 * Schema for creating an interview.
 *
 * Schema notes (verified against prisma/schema.prisma):
 *  - requisitionId  String        required (non-null FK on Interview)
 *  - candidateId    String        required (non-null FK on Interview)
 *  - applicationId  String?       optional FK — when provided, requisitionId,
 *                                 candidateId, and stage are derived from it
 *  - stage          String        required (plain string, not an enum)
 *  - type           InterviewType? optional enum
 *  - duration       Int           maps to the `duration` column (minutes), default 60
 *  - meetingUrl     String?       column name is meetingUrl, not meetingLink
 *  - scheduledAt    DateTime?     optional
 *  No `interviewerIds` or `notes` columns exist on Interview itself;
 *  panel members live in InterviewPanelMember.
 */
const CreateInterviewSchema = z.object({
  // When applicationId is provided, requisitionId / candidateId / stage are
  // derived automatically from the linked Application record.
  applicationId: z.string().optional(),
  requisitionId: z.string().min(1).optional(),
  candidateId: z.string().min(1).optional(),

  // Interview specifics
  scheduledAt: z.coerce.date().optional(),
  // Accept either `duration` (native column name) or `durationMinutes` (API convenience)
  duration: z.number().int().min(15).max(480).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  stage: z.string().optional(),
  type: z
    .enum(["PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "PANEL", "FINAL"])
    .optional(),
  location: z.string().optional(),
  // Column is named meetingUrl in the schema
  meetingUrl: z.string().url().optional().or(z.literal("")),
  guideId: z.string().optional(),
  // panel member convenience field
  interviewerIds: z.array(z.string()).optional(),
});

/**
 * Exact InterviewStatus enum values from schema:
 *   SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW | RESCHEDULED
 */
const InterviewStatusEnum = z.enum([
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "RESCHEDULED",
]);

const UpdateInterviewSchema = CreateInterviewSchema.partial().extend({
  status: InterviewStatusEnum.optional(),
});

/**
 * Schema for submitting interview feedback.
 *
 * Schema notes (verified against prisma/schema.prisma InterviewFeedback):
 *  - No tenantId column on InterviewFeedback
 *  - candidateId  String   required (non-null FK)
 *  - overallRating Int     (not "rating")
 *  - recommendation String (legacy required plain-string field)
 *  - recommendationEnum InterviewRecommendation? (the typed enum field)
 *  - strengths / concerns are Json columns (stored as arrays)
 *  - signals Json (extra signal tags, defaults to [])
 */
const FeedbackSchema = z.object({
  interviewerId: z.string().min(1),
  candidateId: z.string().min(1),
  overallRating: z.number().int().min(1).max(5),
  strengths: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
  signals: z.array(z.string()).default([]),
  recommendation: z
    .enum(["STRONG_YES", "YES", "NEUTRAL", "NO", "STRONG_NO"]),
  notes: z.string().optional(),
});

/**
 * Schema for managing panel members (InterviewPanelMember model).
 */
const PanelMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.string().default("INTERVIEWER"),
  isRequired: z.boolean().default(true),
});

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * POST /interviews
 * Creates a new interview scoped to the authenticated tenant.
 * Verifies the application (if supplied) belongs to this tenant.
 */
export async function createInterview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const data = CreateInterviewSchema.parse(req.body);

    let requisitionId = data.requisitionId;
    let candidateId = data.candidateId;
    let stage = data.stage;

    // Derive requisitionId, candidateId and stage from Application when supplied
    if (data.applicationId) {
      const application = await prisma.application.findFirst({
        where: { id: data.applicationId, tenantId },
      });
      if (!application) {
        throw new AppError("NOT_FOUND", "Application not found", 404);
      }
      requisitionId = requisitionId ?? application.requisitionId;
      candidateId = candidateId ?? application.candidateId;
      stage = stage ?? application.stage;
    }

    if (!requisitionId) {
      throw new AppError("VALIDATION_ERROR", "requisitionId is required", 422);
    }
    if (!candidateId) {
      throw new AppError("VALIDATION_ERROR", "candidateId is required", 422);
    }

    // Verify requisition belongs to tenant
    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      throw new AppError("NOT_FOUND", "Requisition not found", 404);
    }

    // Resolve effective duration (accept durationMinutes as alias for duration)
    const duration = data.durationMinutes ?? data.duration ?? 60;

    const { interviewerIds, durationMinutes, ...rest } = data;

    const interview = await prisma.interview.create({
      data: {
        ...rest,
        requisitionId,
        candidateId,
        stage: stage ?? "INTERVIEW",
        duration,
        tenantId,
        status: "SCHEDULED",
        ...(interviewerIds && interviewerIds.length > 0
          ? {
              panelMembers: {
                create: interviewerIds.map((userId: string) => ({
                  userId,
                  role: "INTERVIEWER",
                })),
              },
            }
          : {}),
      },
      include: {
        panelMembers: true,
        feedback: true,
      },
    });

    created(res, interview);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /interviews/:id
 * Partially updates an interview. All fields are optional.
 * Returns 404 if the interview does not belong to the tenant.
 */
export async function updateInterview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const existing = await prisma.interview.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Interview not found", 404);
    }

    const data = UpdateInterviewSchema.parse(req.body);

    const updated = await prisma.interview.update({
      where: { id } as any,
      data,
      include: {
        panelMembers: true,
        feedback: true,
      },
    });

    ok(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /interviews/:id/cancel
 * Cancels a scheduled or confirmed interview.
 * Does not allow cancelling a completed interview.
 */
export async function cancelInterview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const existing = await prisma.interview.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Interview not found", 404);
    }
    if (existing.status === "COMPLETED") {
      throw new AppError(
        "BAD_REQUEST",
        "Cannot cancel a completed interview",
        400,
      );
    }
    if (existing.status === "CANCELLED") {
      throw new AppError(
        "BAD_REQUEST",
        "Interview is already cancelled",
        400,
      );
    }

    const updated = await prisma.interview.update({
      where: { id } as any,
      data: { status: "CANCELLED" },
    });

    ok(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /interviews/:id
 * Hard-deletes an interview and its related feedback records.
 * Returns 404 if the interview does not belong to the tenant.
 */
export async function deleteInterview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const existing = await prisma.interview.findFirst({
      where: { id, tenantId } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Interview not found", 404);
    }

    // Delete dependent records first to respect FK constraints
    await prisma.interviewFeedback.deleteMany({ where: { interviewId: id as string } });
    await prisma.interviewPanelMember.deleteMany({ where: { interviewId: id as string } });
    // InterviewScorecard has a unique FK; delete if present
    await prisma.interviewScorecard.deleteMany({ where: { interviewId: id as string } });
    await prisma.interview.delete({ where: { id: id as string } });
    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /interviews/:id/feedback
 * Submits feedback for an interview by an interviewer.
 * Enforces uniqueness per (interviewId, interviewerId) via the schema @@unique.
 * Auto-advances interview status to COMPLETED when all panel members have
 * submitted feedback.
 *
 * Schema notes:
 *  - InterviewFeedback has no tenantId column — tenant is verified via the
 *    Interview lookup.
 *  - `recommendation` (String, required legacy field) is set to the enum name.
 *  - `recommendationEnum` (InterviewRecommendation?) is the typed enum field.
 *  - `overallRating` is the column name (not `rating`).
 */
export async function submitFeedback(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const interview = await prisma.interview.findFirst({
      where: { id, tenantId } as any,
      include: { panelMembers: true },
    });
    if (!interview) {
      throw new AppError("NOT_FOUND", "Interview not found", 404);
    }
    if (interview.status === "CANCELLED") {
      throw new AppError(
        "BAD_REQUEST",
        "Cannot submit feedback for a cancelled interview",
        400,
      );
    }

    const data = FeedbackSchema.parse(req.body);

    // Check for duplicate submission (@@unique([interviewId, interviewerId]))
    const duplicateCheck = await prisma.interviewFeedback.findUnique({
      where: {
        interviewId_interviewerId: {
          interviewId: id as any,
          interviewerId: data.interviewerId,
        },
      },
    });
    if (duplicateCheck) {
      throw new AppError(
        "CONFLICT",
        "Feedback already submitted by this interviewer",
        409,
      );
    }

    const feedback = await prisma.interviewFeedback.create({
      data: {
        interviewId: id as any,
        interviewerId: data.interviewerId,
        candidateId: data.candidateId,
        overallRating: data.overallRating,
        strengths: data.strengths,
        concerns: data.concerns,
        signals: data.signals,
        // Legacy string field (required non-null in schema)
        recommendation: data.recommendation,
        // Typed enum field
        recommendationEnum: data.recommendation,
        notes: data.notes,
      },
    });

    // Auto-advance to COMPLETED when all required panel members have submitted
    const totalPanelMembers = (interview as any).panelMembers?.length ?? 0;
    const feedbackCount = await prisma.interviewFeedback.count({
      where: { interviewId: id } as any
    });
    if (totalPanelMembers > 0 && feedbackCount >= totalPanelMembers) {
      await prisma.interview.update({
        where: { id } as any,
        data: { status: "COMPLETED" },
      });
    }

    created(res, feedback);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /interviews/:id/panel
 * Adds a panel member to an interview (creates an InterviewPanelMember record).
 * Returns 409 if the user is already on the panel (@@unique([interviewId, userId])).
 */
export async function addPanelMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const interview = await prisma.interview.findFirst({
      where: { id, tenantId } as any
    });
    if (!interview) {
      throw new AppError("NOT_FOUND", "Interview not found", 404);
    }

    const data = PanelMemberSchema.parse(req.body);

    const member = await prisma.interviewPanelMember.create({
      data: {
        interviewId: id as any,
        userId: data.userId,
        role: data.role,
        isRequired: data.isRequired,
      },
    });

    created(res, member);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /interviews/:id/panel/:userId
 * Removes a panel member from an interview.
 */
export async function removePanelMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id, userId } = req.params;

    const interview = await prisma.interview.findFirst({
      where: { id, tenantId } as any
    });
    if (!interview) {
      throw new AppError("NOT_FOUND", "Interview not found", 404);
    }

    const existing = await prisma.interviewPanelMember.findUnique({
      where: { interviewId_userId: { interviewId: id, userId } } as any
    });
    if (!existing) {
      throw new AppError("NOT_FOUND", "Panel member not found", 404);
    }

    await prisma.interviewPanelMember.delete({
      where: { interviewId_userId: { interviewId: id, userId } } as any
    });

    ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
