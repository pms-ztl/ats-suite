import { Router } from "express";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { ok, paginated } from "../lib/response";
import { prisma } from "../utils/prisma";
import {
  createScreening,
  startScreening,
  completeScreening,
  createAssessmentResult,
} from "./screening-write";
import { screenCandidate } from "../agents/screening-agent";
import { z } from "zod";

const AIScreenSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().min(1),
});

const router = Router();


router.use(requireAuth);

// GET /api/screening
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;

    const where: any = {
      tenantId,
      ...(req.query.applicationId ? { applicationId: req.query.applicationId as string } : {}),
      ...(req.query.status ? { status: req.query.status as string } : {}),
      ...(req.query.result ? { result: req.query.result as string } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.screening.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
              requisition: { select: { id: true, title: true, department: true } },
            },
          },
          assessmentResults: true,
        },
      }),
      prisma.screening.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// GET /api/screening/:id
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const screening = await prisma.screening.findFirst({
      where: { id: req.params.id, tenantId },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
            requisition: { select: { id: true, title: true, department: true } },
          },
        },
        assessmentResults: { orderBy: { completedAt: "desc" } },
      },
    });
    if (!screening) throw new AppError("NOT_FOUND", "Screening not found", 404);
    return ok(res, screening);
  } catch (err) { return next(err); }
});

// POST /api/screening (ADMIN, RECRUITER)
router.post("/", requireRole("ADMIN", "RECRUITER"), createScreening);

// POST /api/screening/:id/start (ADMIN, RECRUITER)
router.post("/:id/start", requireRole("ADMIN", "RECRUITER"), startScreening);

// GET /api/screening/:id/result
router.get("/:id/result", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const screening = await prisma.screening.findFirst({
      where: { id: req.params.id, tenantId },
      select: {
        id: true,
        status: true,
        result: true,
        score: true,
        passThreshold: true,
        completedAt: true,
        assessmentResults: { orderBy: { completedAt: "desc" } },
      },
    });
    if (!screening) throw new AppError("NOT_FOUND", "Screening not found", 404);
    return ok(res, screening);
  } catch (err) { return next(err); }
});

// POST /api/screening/:id/complete
router.post("/:id/complete", completeScreening);

// POST /api/screening/:id/assessment
router.post("/:id/assessment", createAssessmentResult);

// POST /api/screening/ai-screen — trigger AI screening for a candidate
router.post("/ai-screen", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || "system";
    const parsed = AIScreenSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((e: { message: string }) => e.message).join(", "),
        400,
      );
    }
    const { candidateId, requisitionId } = parsed.data;

    // Get resume text
    const resume = await prisma.resume.findFirst({
      where: { candidateId, tenantId },
    });

    if (!resume?.extractedText) {
      throw new AppError(
        "PRECONDITION_FAILED",
        "Resume not found or not yet extracted — upload and parse first",
        412,
      );
    }

    // Get parsed resume data if available
    let parsedResume;
    if (resume.parsedData && typeof resume.parsedData === "object") {
      const pd = resume.parsedData as any;
      parsedResume = {
        skills: pd.skills || [],
        experience: pd.experience || [],
        education: pd.education || [],
        totalYearsExperience: pd.totalYearsExperience || 0,
      };
    }

    const result = await screenCandidate({
      candidateId,
      requisitionId,
      tenantId,
      userId,
      resumeText: resume.extractedText,
      parsedResume,
    });

    return ok(res, {
      screening: result.screening,
      runId: result.runId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
      hitlRequired: result.hitlRequired,
      hitlCheckpointId: result.hitlCheckpointId,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
