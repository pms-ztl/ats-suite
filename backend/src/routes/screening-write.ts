import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { ok, created } from "../lib/response";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const CreateScreeningSchema = z.object({
  applicationId: z.string(),
  type: z.enum(["AUTOMATED", "MANUAL", "AI_ASSISTED"]),
  passThreshold: z.number().min(0).max(100).default(70),
  questions: z.array(z.record(z.string(), z.unknown())).default([]),
});

const CompleteScreeningSchema = z.object({
  score: z.number().min(0).max(100),
  answers: z.array(z.record(z.string(), z.unknown())).default([]),
  result: z.enum(["PASS", "FAIL", "REVIEW"]).optional(),
});

const AssessmentResultSchema = z.object({
  assessmentType: z.string().min(1),
  score: z.number().min(0),
  maxScore: z.number().min(0),
  percentile: z.number().min(0).max(100).optional(),
  completedAt: z.coerce.date().default(() => new Date()),
});

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * POST /screenings
 * Creates a new screening for an application, scoped to the authenticated tenant.
 * Returns 404 if the application does not belong to the tenant.
 */
export async function createScreening(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const data = CreateScreeningSchema.parse(req.body);

    const application = await prisma.application.findFirst({
      where: { id: data.applicationId, tenantId },
    });
    if (!application) {
      throw new AppError("NOT_FOUND", "Application not found", 404);
    }

    const screening = await prisma.screening.create({
      data: {
        tenantId,
        applicationId: data.applicationId,
        type: data.type,
        screeningType: data.type,
        status: "PENDING",
        passThreshold: data.passThreshold,
        questions: data.questions as any
      },
    });

    created(res, screening);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /screenings/:id/start
 * Transitions a PENDING screening to IN_PROGRESS.
 * Returns 400 if the screening is not in PENDING status.
 * Returns 404 if the screening does not belong to the tenant.
 */
export async function startScreening(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const screening = await prisma.screening.findFirst({
      where: { id, tenantId } as any
    });
    if (!screening) {
      throw new AppError("NOT_FOUND", "Screening not found", 404);
    }
    if (screening.status !== "PENDING") {
      throw new AppError(
        "BAD_REQUEST",
        `Cannot start a screening in ${screening.status} status`,
        400,
      );
    }

    const updated = await prisma.screening.update({
      where: { id } as any,
      data: { status: "IN_PROGRESS" },
    });

    ok(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /screenings/:id/complete
 * Marks a screening as COMPLETED, records score and answers.
 * Auto-determines ScreeningOutcome (PASS / REVIEW / FAIL) from the score and
 * passThreshold if an explicit result is not supplied.
 * Returns 404 if the screening does not belong to the tenant.
 */
export async function completeScreening(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const screening = await prisma.screening.findFirst({
      where: { id, tenantId } as any
    });
    if (!screening) {
      throw new AppError("NOT_FOUND", "Screening not found", 404);
    }

    const { score, answers, result: explicitResult } =
      CompleteScreeningSchema.parse(req.body);

    // Auto-determine ScreeningOutcome when not explicitly provided.
    // Scores within 80 % of the threshold are flagged for REVIEW.
    const threshold = screening.passThreshold ?? 70;
    const autoResult =
      score >= threshold
        ? "PASS"
        : score >= threshold * 0.8
          ? "REVIEW"
          : "FAIL";
    const finalResult: "PASS" | "FAIL" | "REVIEW" = explicitResult ?? autoResult;

    const updated = await prisma.screening.update({
      where: { id } as any,
      data: {
        status: "COMPLETED",
        score,
        answers,
        result: finalResult,
        completedAt: new Date(),
      } as any,
    });

    ok(res, updated);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /screenings/:id/assessment-results
 * Adds an AssessmentResult record linked to the screening.
 * candidateId is resolved from the screening's parent application.
 * Returns 404 if the screening does not belong to the tenant.
 */
export async function createAssessmentResult(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = getTenantId(req);
    const { id } = req.params;

    const screening = await prisma.screening.findFirst({
      where: { id, tenantId } as any,
      include: { application: { select: { candidateId: true } } },
    });
    if (!screening) {
      throw new AppError("NOT_FOUND", "Screening not found", 404);
    }

    const data = AssessmentResultSchema.parse(req.body);

    const result = await prisma.assessmentResult.create({
      data: {
        tenantId,
        screeningId: id as any,
        candidateId: (screening as any).application.candidateId,
        assessmentType: data.assessmentType,
        score: data.score,
        maxScore: data.maxScore,
        percentile: data.percentile,
        completedAt: data.completedAt,
      },
    });

    created(res, result);
  } catch (err) {
    next(err);
  }
}
