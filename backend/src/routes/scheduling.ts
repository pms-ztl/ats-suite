import { Router } from "express";
import { z } from "zod";
import { requireAuth, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated, created, noContent } from "../lib/response";
import { generateICS, CalendarEvent } from "../lib/calendar";
import { syncToExternalCalendar, checkExternalAvailability } from "../lib/calendar-sync";
import { sendEmail } from "../lib/mailer";
import { scheduleInterview } from "../agents/scheduling-agent";
import logger from "../lib/logger";

const router = Router();
router.use(requireAuth);

// GET / — list schedule events (paginated)
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const candidateId = req.query.candidateId as string | undefined;
    const where: any = { tenantId, ...(status ? { status } : {}), ...(type ? { type } : {}), ...(candidateId ? { candidateId } : {}) };
    const [data, total] = await Promise.all([
      prisma.scheduleEvent.findMany({ where, skip, take: pageSize, orderBy: { startAt: "desc" } }),
      prisma.scheduleEvent.count({ where }),
    ]);
    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// GET /availability — check availability by time range (MUST be before /:id)
router.get("/availability", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const startAt = req.query.startAt ? new Date(req.query.startAt as string) : new Date();
    const endAt = req.query.endAt ? new Date(req.query.endAt as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const events = await prisma.scheduleEvent.findMany({
      where: { tenantId, startAt: { gte: startAt }, endAt: { lte: endAt } },
      orderBy: { startAt: "asc" },
    });
    return ok(res, { events, startAt, endAt, count: events.length });
  } catch (err) { return next(err); }
});

// POST /availability/check (MUST be before /:id)
router.post("/availability/check", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const { startAt, endAt, attendees } = req.body ?? {};
    if (!startAt || !endAt) throw new AppError("VALIDATION_ERROR", "startAt and endAt required", 400);
    const conflicts = await prisma.scheduleEvent.count({
      where: {
        tenantId,
        status: { not: "CANCELLED" },
        OR: [
          { startAt: { gte: new Date(startAt), lt: new Date(endAt) } },
          { endAt: { gt: new Date(startAt), lte: new Date(endAt) } },
        ],
      },
    });
    // Check external calendar availability if user has a connected calendar
    const userId = (req as any).user?.id;
    let externalAvailability: Record<string, boolean> | null = null;
    if (userId && attendees && Array.isArray(attendees)) {
      const emails = attendees
        .filter((a: any) => typeof a === 'string' || a.email)
        .map((a: any) => typeof a === 'string' ? a : a.email);
      if (emails.length > 0) {
        externalAvailability = await checkExternalAvailability(
          userId, tenantId, emails, new Date(startAt), new Date(endAt)
        );
      }
    }

    return ok(res, { available: conflicts === 0, conflicts, startAt, endAt, externalAvailability });
  } catch (err) { return next(err); }
});

// POST /ai-schedule — AI-powered interview scheduling with HITL
const AiScheduleInputSchema = z.object({
  interviewId: z.string().min(1),
  participants: z.array(z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.string().min(1),
  })).min(1),
  durationMinutes: z.number().int().min(15).max(480),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  timezone: z.string().min(1),
  preferences: z.object({
    preferMorning: z.boolean().optional(),
    avoidLunch: z.boolean().optional(),
    allowWeekends: z.boolean().optional(),
  }).optional(),
});

router.post("/ai-schedule", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || "system";
    const body = AiScheduleInputSchema.parse(req.body);

    const result = await scheduleInterview({
      ...body,
      tenantId,
      userId,
    });

    return ok(res, {
      proposedSlots: result.proposedSlots,
      hitlCheckpointId: result.hitlCheckpointId,
      runId: result.runId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return next(new AppError("VALIDATION_ERROR", `Invalid input: ${(err as z.ZodError).issues.map((e: z.ZodIssue) => e.message).join(', ')}`, 400));
    }
    return next(err);
  }
});

// GET /:id — single event
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const event = await prisma.scheduleEvent.findFirst({ where: { id: req.params.id, tenantId } });
    if (!event) throw new AppError("NOT_FOUND", "Schedule event not found", 404);
    return ok(res, event);
  } catch (err) { return next(err); }
});

// POST / — create event
const CreateEventSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  candidateId: z.string().optional(),
  requisitionId: z.string().optional(),
  organizerUserId: z.string().optional(),
  attendees: z.array(z.record(z.string(), z.unknown())).optional(),
  location: z.string().optional(),
  virtualLink: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateEventSchema.parse(req.body);
    const event = await prisma.scheduleEvent.create({
      data: {
        tenantId,
        type: body.type,
        title: body.title,
        description: body.description,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        candidateId: body.candidateId,
        requisitionId: body.requisitionId,
        organizerUserId: body.organizerUserId,
        attendees: (body.attendees ?? []) as any,
        location: body.location,
        virtualLink: body.virtualLink,
        status: body.status ?? "SCHEDULED",
        metadata: (body.metadata ?? {}) as any,
      } as any,
    });

    // Generate ICS and send calendar invites to attendees (fire-and-forget)
    if (body.attendees && body.attendees.length > 0) {
      try {
        const calEvent: CalendarEvent = {
          id: event.id,
          summary: event.title || 'Interview',
          description: event.description || '',
          startAt: new Date(event.startAt),
          endAt: new Date(event.endAt),
          location: event.location || '',
          attendees: (body.attendees as Array<{ name?: string; email?: string }>)
            .filter(a => a.email)
            .map(a => ({ name: a.name || '', email: a.email! })),
        };
        const icsContent = generateICS(calEvent);

        // Send invite email to each attendee with an email
        for (const attendee of calEvent.attendees || []) {
          sendEmail({
            to: attendee.email,
            subject: `Interview Scheduled: ${event.title || 'Interview'}`,
            html: `<p>You have been invited to an interview.</p>
              <p><strong>When:</strong> ${new Date(event.startAt).toLocaleString()}</p>
              <p><strong>Where:</strong> ${event.location || 'TBD'}</p>
              <p>Please add this event to your calendar.</p>`,
          }).catch(err => logger.error({ err, eventId: event.id }, 'Failed to send calendar invite'));
        }
      } catch (err) {
        logger.error({ err, eventId: event.id }, 'Failed to generate ICS or send invites');
      }
    }

    // Sync to external calendar (fire-and-forget)
    const calSyncUserId = (req as any).user?.id;
    if (calSyncUserId) {
      syncToExternalCalendar(calSyncUserId, tenantId, {
        id: event.id,
        summary: event.title || 'Interview',
        description: event.description || '',
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt),
        location: event.location || '',
        attendees: (body.attendees as Array<{ name?: string; email?: string }>)
          ?.filter(a => a.email)
          .map(a => ({ name: a.name || '', email: a.email! })),
      }).then(result => {
        if (result.synced) {
          prisma.scheduleEvent.update({
            where: { id: event.id },
            data: {
              externalId: result.externalEventId,
              externalCalendar: result.provider,
            },
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    return created(res, event);
  } catch (err) { return next(err); }
});

// PATCH /:id
const UpdateEventSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  virtualLink: z.string().optional(),
  attendees: z.array(z.record(z.string(), z.unknown())).optional(),
});

router.patch("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.scheduleEvent.findFirst({ where: { id: req.params.id, tenantId } });
    if (!existing) throw new AppError("NOT_FOUND", "Schedule event not found", 404);
    const body = UpdateEventSchema.parse(req.body);
    const updateData: any = { ...body };
    if (body.startAt) updateData.startAt = new Date(body.startAt);
    if (body.endAt) updateData.endAt = new Date(body.endAt);
    if (body.attendees) updateData.attendees = body.attendees;
    const event = await prisma.scheduleEvent.update({ where: { id: req.params.id }, data: updateData });
    return ok(res, event);
  } catch (err) { return next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.scheduleEvent.findFirst({ where: { id: req.params.id, tenantId } });
    if (!existing) throw new AppError("NOT_FOUND", "Schedule event not found", 404);
    await prisma.scheduleEvent.delete({ where: { id: req.params.id } });
    return noContent(res);
  } catch (err) { return next(err); }
});

export default router;
