import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole, filterVisibleFields, createLogger } from "@cdc-ats/common";
import { publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";

// Phase 27 F-028-micro-P1:
// - create / advance-round → recruiter or admin (not interviewer)
// - feedback → interviewer or recruiter or admin (interviewer is the primary submitter)
const requireScheduler   = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
const requireFeedbackSubmitter = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER");
// Reads on interview rows (list + detail). Leadership may read; an INTERVIEWER is
// additionally scoped server-side to only their own panel interviews and has other
// panelists' notes/scores stripped via filterVisibleFields (see routes below).
const requireInterviewReader = requireRole(
  "ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "INTERVIEWER", "DEPARTMENT_HEAD", "EXECUTIVE",
);
import { InterviewTypeSchema, InterviewStatusSchema, InterviewRecommendationSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";
import { advanceApplicationToNextRound } from "../lib/round-progression.js";
import { buildBuiltInRoomUrl } from "../lib/built-in-room.js";

const router = Router();
const logger = createLogger({ serviceName: "interview-service:interviews" });

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

router.get("/", requireInterviewReader, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const role = req.user?.role ?? "";
    const candidateId = req.query["candidateId"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    // Phase 23 — tier-3 staff filtering. `panelistId=me` (or the explicit
    // user id) restricts to interviews where the caller is on the panel.
    // INTERVIEWER dashboards use this to show "my interviews" without
    // pulling system-wide rows.
    const panelistIdRaw = req.query["panelistId"] as string | undefined;
    const callerId = req.headers["x-user-id"] as string | undefined;
    let panelistId = panelistIdRaw === "me" ? callerId : panelistIdRaw;
    // Least-privilege: an INTERVIEWER may NEVER pull the system-wide list. Force
    // the panel filter to the caller's own id server-side, ignoring any client
    // panelistId (so they cannot omit it or point it at another user).
    if (role === "INTERVIEWER") panelistId = callerId;

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
    // Strip sensitive interview fields per the caller's role. An INTERVIEWER is
    // scoped to their own panel above, so isOwner=true keeps their own view; the
    // matrix still hides other panelists' notes/scores it does not enumerate.
    const isOwner = role === "INTERVIEWER";
    const visible = filtered.map((r: any) => filterVisibleFields(r, role, "interview", { isOwner }));
    ok(res, visible);
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
    // The room URL must bind the real interview id, so we set it after create.
    // Never persist a caller-supplied external meeting link here — the tenant's
    // OWN built-in room is the only meeting surface. A caller may still pass its
    // own built-in room URL (kept as-is); anything else is replaced.
    const suppliedBuiltInRoom =
      typeof body.meetingUrl === "string" && body.meetingUrl.includes("/interview/room/")
        ? body.meetingUrl
        : undefined;
    delete data.meetingUrl;
    const interview = await prisma.interview.create({ data });
    const meetingUrl = suppliedBuiltInRoom ?? buildBuiltInRoomUrl(interview.id);
    const withRoom = await prisma.interview.update({
      where: { id: interview.id },
      data: { meetingUrl, ...(interview.location ? {} : { location: meetingUrl }) },
    });
    created(res, withRoom);
  } catch (err) { next(err); }
});

router.get("/:id", requireInterviewReader, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const role = req.user?.role ?? "";
    const callerId = req.headers["x-user-id"] as string | undefined;
    const id = req.params["id"] as string;
    const row = await prisma.interview.findFirst({
      where: { id, tenantId },
      include: { panelMembers: true, feedback: true, round: true },
    });
    if (!row) throw Errors.notFound("Interview");
    // An INTERVIEWER may only read an interview they are on the panel for.
    // Non-panel access is 404 (do not confirm the row exists), matching the
    // list route's server-side panel scoping.
    const onPanel = (row.panelMembers ?? []).some((m: any) => m.userId === callerId);
    if (role === "INTERVIEWER" && !onPanel) throw Errors.notFound("Interview");
    // Strip other panelists' notes/scores for interviewers (isOwner only when
    // this is their own panel interview); recruiting/hiring/admin keep the view.
    const visible = filterVisibleFields(row, role, "interview", { isOwner: role === "INTERVIEWER" && onPanel });
    ok(res, visible);
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

    // Real downstream effect: notify the tenant a scorecard landed. Fires the
    // (previously producer-less) interview.feedback event so the notification
    // listener has a live publisher. Best-effort — never blocks the write.
    await publishEvent({
      subject: tenantSubject(tenantId, "interview", "feedback.created"),
      type: "interview.feedback.created",
      tenantId,
      payload: {
        tenantId,
        feedbackId: feedback.id,
        interviewId: id,
        candidateId: body.candidateId,
        applicationId: interview.applicationId ?? null,
        interviewerId: body.interviewerId,
        rating: body.overallRating,
        recommendation: body.recommendation,
        summary: body.notes ?? null,
        roundId: interview.roundId ?? null,
        roundNumber: interview.roundNumber ?? null,
        at: new Date().toISOString(),
      },
    }).catch((err) => logger.warn({ err, interviewId: id }, "interview.feedback.created publish failed"));

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

// ── Panel management ───────────────────────────────────────────────────
// Assign specific NAMED people to an interview panel, beyond the role-based
// round-robin auto-assign. Tenant-scoped; scheduler-gated for mutations.
//   GET    /internal/interviews/:id/panel           — list members
//   POST   /internal/interviews/:id/panel           — add/update a member
//   DELETE /internal/interviews/:id/panel/:userId   — remove a member
const AddPanelSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().min(1).max(40).optional(),
  isRequired: z.boolean().optional(),
  confirmed: z.boolean().optional(),
});

router.get("/:id/panel", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const interview = await prisma.interview.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!interview) throw Errors.notFound("Interview");
    const members = await prisma.interviewPanelMember.findMany({
      where: { interviewId: id },
      orderBy: { createdAt: "asc" },
    });
    ok(res, members);
  } catch (err) { next(err); }
});

router.post("/:id/panel", requireScheduler, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = AddPanelSchema.parse(req.body);
    const interview = await prisma.interview.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!interview) throw Errors.notFound("Interview");
    // Idempotent: re-adding the same user updates their role / required flag
    // instead of erroring on the @@unique([interviewId, userId]) constraint.
    const member = await prisma.interviewPanelMember.upsert({
      where: { interviewId_userId: { interviewId: id, userId: body.userId } },
      create: {
        interviewId: id,
        userId: body.userId,
        role: body.role ?? "INTERVIEWER",
        isRequired: body.isRequired ?? true,
        confirmed: body.confirmed ?? false,
      },
      update: {
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.isRequired !== undefined ? { isRequired: body.isRequired } : {}),
        ...(body.confirmed !== undefined ? { confirmed: body.confirmed } : {}),
      },
    });
    created(res, member);
  } catch (err) { next(err); }
});

router.delete("/:id/panel/:userId", requireScheduler, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const userId = req.params["userId"] as string;
    const interview = await prisma.interview.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!interview) throw Errors.notFound("Interview");
    await prisma.interviewPanelMember.deleteMany({ where: { interviewId: id, userId } });
    ok(res, { removed: userId });
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
