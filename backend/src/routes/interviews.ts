import { Router } from "express";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated } from "../lib/response";
import {
  createInterview,
  updateInterview,
  cancelInterview,
  deleteInterview,
  submitFeedback,
} from "./interviews-write";
import { generateInterviewKit } from "../agents/interview-kit-agent";
import { analyzeInterview } from "../agents/interview-intelligence-agent";

const router = Router();

router.use(requireAuth);

// GET /api/interviews
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;

    const where: any = {
      tenantId,
      ...(req.query.candidateId ? { candidateId: req.query.candidateId as string } : {}),
      ...(req.query.applicationId ? { applicationId: req.query.applicationId as string } : {}),
      ...(req.query.status ? { status: req.query.status as string } : {}),
      ...(req.query.type ? { type: req.query.type as string } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { scheduledAt: "desc" },
        include: {
          application: {
            include: {
              candidate: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
              requisition: {
                select: { id: true, title: true, department: true },
              },
            },
          },
          feedback: {
            select: {
              id: true,
              overallRating: true,
              recommendation: true,
              recommendationEnum: true,
              interviewerId: true,
            },
          },
        },
      }),
      prisma.interview.count({ where }),
    ]);

    return paginated(res, {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/interviews/:id
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, tenantId },
      include: {
        application: {
          include: {
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            requisition: {
              select: { id: true, title: true, department: true },
            },
          },
        },
        panelMembers: true,
        feedback: {
          include: {
            interviewer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        scorecard: true,
      },
    });

    if (!interview) throw new AppError("NOT_FOUND", "Interview not found", 404);

    return ok(res, interview);
  } catch (err) {
    return next(err);
  }
});

// POST /api/interviews (ADMIN, RECRUITER, HIRING_MANAGER)
router.post("/", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), createInterview);

// PATCH /api/interviews/:id (ADMIN, RECRUITER, HIRING_MANAGER)
router.patch("/:id", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), updateInterview);

// DELETE /api/interviews/:id (ADMIN, RECRUITER)
router.delete("/:id", requireRole("ADMIN", "RECRUITER"), deleteInterview);

// POST /api/interviews/:id/feedback (any authenticated user — interviewers submit feedback)
router.post("/:id/feedback", submitFeedback);

// POST /api/interviews/:id/cancel (ADMIN, RECRUITER, HIRING_MANAGER)
router.post("/:id/cancel", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), cancelInterview);

// POST /api/interviews/ai-kit — Generate AI-powered interview kit
router.post("/ai-kit", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = req.user?.id;
    if (!userId) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const { requisitionId, candidateId, interviewType, interviewerRole, durationMinutes } = req.body;

    if (!requisitionId || !candidateId) {
      throw new AppError(
        "VALIDATION_ERROR",
        "requisitionId and candidateId are required",
        400,
      );
    }

    const validTypes = ["technical", "behavioral", "culture", "final"];
    const type = validTypes.includes(interviewType) ? interviewType : "technical";

    const result = await generateInterviewKit({
      requisitionId,
      candidateId,
      interviewType: type,
      interviewerRole: interviewerRole || "Hiring Manager",
      durationMinutes: durationMinutes || 60,
      tenantId,
      userId,
    });

    return ok(res, result);
  } catch (err) {
    return next(err);
  }
});

// POST /api/interviews/ai-analyze — AI-powered interview transcript analysis
router.post("/ai-analyze", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = req.user?.id;
    if (!userId) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const { interviewId, recordingUrl, transcript, consentToken, requisitionId } = req.body;

    if (!interviewId) {
      throw new AppError("VALIDATION_ERROR", "interviewId is required", 400);
    }

    if (!consentToken) {
      throw new AppError("VALIDATION_ERROR", "consentToken is required for interview analysis", 400);
    }

    if (!recordingUrl && !transcript) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Either recordingUrl or transcript must be provided",
        400,
      );
    }

    const result = await analyzeInterview({
      interviewId,
      recordingUrl,
      transcript,
      consentToken,
      tenantId,
      userId,
      requisitionId,
    });

    return ok(res, result);
  } catch (err) {
    return next(err);
  }
});

export default router;
