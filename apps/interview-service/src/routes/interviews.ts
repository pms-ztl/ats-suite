import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1:
// - create / advance-round → recruiter or admin (not interviewer)
// - feedback → interviewer or recruiter or admin (interviewer is the primary submitter)
const requireScheduler   = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
const requireFeedbackSubmitter = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER");
import { InterviewTypeSchema, InterviewStatusSchema, InterviewRecommendationSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";
import { advanceApplicationToNextRound } from "../lib/round-progression.js";

const router = Router();

const CreateInterviewSchema = z.object({
  requisitionId: z.string().uuid(),
  candidateId: z.string().uuid(),
  applicationId: z.string().optional(),
  type: InterviewTypeSchema.optional(),
  stage: z.string(),
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().int().default(60),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  roundId: z.string().uuid().optional(),
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const candidateId = req.query["candidateId"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    // Phase 23 — tier-3 staff filtering. `panelistId=me` (or the explicit
    // user id) restricts to interviews where the caller is on the panel.
    // INTERVIEWER dashboards use this to show "my interviews" without
    // pulling system-wide rows.
    const panelistIdRaw = req.query["panelistId"] as string | undefined;
    const callerId = req.headers["x-user-id"] as string | undefined;
    const panelistId = panelistIdRaw === "me" ? callerId : panelistIdRaw;

    // `feedbackPending=true` further narrows to interviews where the
    // caller (or specified panelist) hasn't yet submitted feedback —
    // powers "feedback due" widget on the interviewer landing.
    const feedbackPending = req.query["feedbackPending"] === "true";

    const where: any = { tenantId };
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;
    if (panelistId) {
      where.panelMembers = { some: { userId: panelistId } };
    }
    const rows = await prisma.interview.findMany({
      where, orderBy: { scheduledAt: "asc" }, take: 100,
      include: {
        round: { select: { name: true, order: true } },
        panelMembers: panelistId ? { where: { userId: panelistId } } : false,
        feedback: feedbackPending && panelistId ? { where: { interviewerId: panelistId } } : false,
      },
    });
    // If feedbackPending, drop interviews where the panelist already
    // submitted feedback. Done client-side since the Prisma include
    // doesn't easily express "no feedback row from this user".
    const filtered = feedbackPending && panelistId
      ? rows.filter((r: any) => !r.feedback || r.feedback.length === 0)
      : rows;
    ok(res, filtered);
  } catch (err) { next(err); }
});

router.post("/", requireScheduler, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateInterviewSchema.parse(req.body);
    const data: any = { tenantId, ...body };
    if (body.scheduledAt) data.scheduledAt = new Date(body.scheduledAt);
    if (body.roundId) {
      const round = await prisma.interviewRound.findFirst({ where: { id: body.roundId, tenantId } });
      if (round) data.roundNumber = round.order;
    }
    const interview = await prisma.interview.create({ data });
    created(res, interview);
  } catch (err) { next(err); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const row = await prisma.interview.findFirst({
      where: { id, tenantId },
      include: { panelMembers: true, feedback: true, round: true },
    });
    if (!row) throw Errors.notFound("Interview");
    ok(res, row);
  } catch (err) { next(err); }
});

// ── POST /internal/interviews/:id/feedback ─────────────────────────────
const FeedbackSchema = z.object({
  interviewerId: z.string().uuid(),
  candidateId: z.string().uuid(),
  overallRating: z.number().int().min(1).max(5),
  recommendation: InterviewRecommendationSchema,
  strengths: z.array(z.string()).default([]),
  concerns: z.array(z.string()).default([]),
  notes: z.string().optional(),
});
router.post("/:id/feedback", requireFeedbackSubmitter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = FeedbackSchema.parse(req.body);
    const interview = await prisma.interview.findFirst({
      where: { id, tenantId },
      include: { round: true },
    });
    if (!interview) throw Errors.notFound("Interview");
    const feedback = await prisma.interviewFeedback.create({
      data: {
        tenantId,
        interviewId: id,
        interviewerId: body.interviewerId,
        candidateId: body.candidateId,
        overallRating: body.overallRating,
        recommendation: body.recommendation,
        strengths: body.strengths as any,
        concerns: body.concerns as any,
        notes: body.notes ?? null,
      },
    });

    // Auto-advance? (Phase 3: synchronous; Phase 3.5 moves to worker queue)
    if (
      interview.round?.autoAdvanceOnPass &&
      body.recommendation === "STRONG_HIRE" &&
      interview.applicationId
    ) {
      try {
        const advanced = await advanceApplicationToNextRound({
          applicationId: interview.applicationId,
          candidateId: interview.candidateId,
          requisitionId: interview.requisitionId,
          tenantId,
          triggeredBy: "auto",
        });
        return created(res, { feedback, autoAdvance: advanced });
      } catch (err) {
        // log + return feedback anyway
      }
    }
    created(res, { feedback });
  } catch (err) { next(err); }
});

// ── POST /internal/interviews/applications/:id/advance-round ───────────
router.post("/applications/:id/advance-round", requireScheduler, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const applicationId = req.params["id"] as string;
    // Need candidateId + requisitionId from caller (gateway resolves from app)
    const body = z.object({
      candidateId: z.string().uuid(),
      requisitionId: z.string().uuid(),
    }).parse(req.body);
    const result = await advanceApplicationToNextRound({
      applicationId,
      candidateId: body.candidateId,
      requisitionId: body.requisitionId,
      tenantId,
      triggeredBy: "user",
    });
    if (result.reason === "no_more_rounds") {
      throw Errors.validation("Application has completed all defined rounds");
    }
    ok(res, result);
  } catch (err) { next(err); }
});

export default router;
