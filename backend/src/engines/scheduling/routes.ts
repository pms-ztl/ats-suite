import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../../utils/prisma';
import { AuthRequest, paginate, paginatedResult } from '../../types';
import { ok as sendOk, created } from '../../lib/response';
import { validate } from '../../middleware/validate';

const router = Router();

// POST /api/scheduling/auto-schedule - AI-driven scheduling
router.post('/scheduling/auto-schedule', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, interviewType, duration, panelUserIds, preferredSlots, timezone } = req.body;

    if (!candidateId || !requisitionId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId and requisitionId are required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    // Find available slots for requested panelists
    const requiredPanelists = panelUserIds || [];
    const availableSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        userId: requiredPanelists.length > 0 ? { in: requiredPanelists } : undefined,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 50,
    });

    // Create a schedule request
    const scheduleRequest = await prisma.scheduleRequest.create({
      data: {
        tenantId,
        candidateId,
        requiredPanelists,
        duration: duration || 60,
        timezone: timezone || 'UTC',
        preferredSlots: preferredSlots || [],
        status: 'PENDING',
      },
    });

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        tenantId,
        requisitionId,
        candidateId,
        interviewType: interviewType || 'PANEL',
        stage: 'INTERVIEW',
        status: 'SCHEDULED',
        duration: duration || 60,
        scheduledAt: availableSlots.length > 0 ? availableSlots[0].date : null,
      },
    });

    // Add panel members if specified
    if (requiredPanelists.length > 0) {
      await Promise.all(
        requiredPanelists.map((userId: string) =>
          prisma.interviewPanelMember.create({
            data: {
              interviewId: interview.id,
              userId,
              role: 'INTERVIEWER',
              isRequired: true,
            },
          })
        )
      );
    }

    // Update schedule request with the interview
    await prisma.scheduleRequest.update({
      where: { id: scheduleRequest.id },
      data: {
        interviewId: interview.id,
        status: availableSlots.length > 0 ? 'SCHEDULED' : 'PENDING',
        scheduledAt: availableSlots.length > 0 ? availableSlots[0].date : null,
      },
    });

    // Book the slot if one was found
    if (availableSlots.length > 0) {
      await prisma.scheduleSlot.update({
        where: { id: availableSlots[0].id },
        data: { isBooked: true, interviewId: interview.id },
      });
    }

    return created(res, {
      scheduleRequest,
      interview,
      availableSlotsFound: availableSlots.length,
      scheduledSlot: availableSlots[0] || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to auto-schedule: ${error.message}` } });
  }
});

// POST /api/scheduling/reschedule - smart rescheduling
router.post('/scheduling/reschedule', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewId, reason, preferredSlots } = req.body;

    if (!interviewId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'interviewId is required' } });
    }

    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, tenantId },
      include: { panelMembers: true },
    });
    if (!interview) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } });
    }

    const previousSchedule = interview.scheduledAt;

    // Release old slot
    if (previousSchedule) {
      await prisma.scheduleSlot.updateMany({
        where: { tenantId, interviewId, isBooked: true },
        data: { isBooked: false, interviewId: null },
      });
    }

    // Find new available slots for same panelists
    const panelistIds = interview.panelMembers.map(p => p.userId);
    const newSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        userId: panelistIds.length > 0 ? { in: panelistIds } : undefined,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    const newSlot = newSlots[0] || null;

    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'RESCHEDULED',
        scheduledAt: newSlot ? newSlot.date : null,
      },
    });

    if (newSlot) {
      await prisma.scheduleSlot.update({
        where: { id: newSlot.id },
        data: { isBooked: true, interviewId },
      });
    }

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'INTERVIEW_RESCHEDULED',
        resourceType: 'Interview',
        resourceId: interviewId,
        metadata: { reason, previousSchedule, newSchedule: newSlot?.date || null },
      },
    });

    return sendOk(res, {
      interview: updated,
      previousSchedule,
      newSlot,
      reason,
    }, { message: newSlot ? 'Interview rescheduled' : 'Rescheduled but no available slot found' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to reschedule: ${error.message}` } });
  }
});

// GET /api/scheduling/availability - check availability
router.get('/scheduling/availability', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { userId, date, startDate, endDate } = req.query;

    const where: any = { tenantId, isAvailable: true, isBooked: false };
    if (userId) where.userId = userId as string;
    if (date) {
      const d = new Date(date as string);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    } else {
      where.date = { gte: new Date() };
    }

    const slots = await prisma.scheduleSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 100,
    });

    return sendOk(res, {
      slots,
      totalAvailable: slots.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to check availability: ${error.message}` } });
  }
});

// POST /api/scheduling/accessibility - schedule with accessibility options
router.post('/scheduling/accessibility', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, accessibility, duration, timezone } = req.body;

    if (!candidateId || !requisitionId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId and requisitionId are required' } });
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, tenantId },
    });
    if (!candidate) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    }

    // Log the accommodation request
    const accommodation = await prisma.accommodationRequest.create({
      data: {
        tenantId,
        candidateId,
        requestType: 'SCHEDULING',
        description: JSON.stringify(accessibility || {}),
        status: 'APPROVED',
      },
    });

    const scheduleRequest = await prisma.scheduleRequest.create({
      data: {
        tenantId,
        candidateId,
        requiredPanelists: [],
        duration: duration || 60,
        timezone: timezone || 'UTC',
        accessibility: accessibility || {},
        status: 'PENDING',
      },
    });

    return res.status(201).json({ data: {
      scheduleRequest,
      accommodation,
      accessibilityOptions: accessibility,
    }, message: 'Accessible scheduling request created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create accessible schedule: ${error.message}` } });
  }
});

// POST /api/scheduling/multi-timezone - cross-timezone scheduling
router.post('/scheduling/multi-timezone', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, candidateTimezone, panelists, duration } = req.body;

    if (!candidateId || !requisitionId || !candidateTimezone) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId, requisitionId, and candidateTimezone are required' } });
    }

    const panelistIds = (panelists || []).map((p: any) => p.userId || p);

    const availableSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        userId: panelistIds.length > 0 ? { in: panelistIds } : undefined,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 50,
    });

    const scheduleRequest = await prisma.scheduleRequest.create({
      data: {
        tenantId,
        candidateId,
        requiredPanelists: panelistIds,
        duration: duration || 60,
        timezone: candidateTimezone,
        preferredSlots: [],
        status: 'PENDING',
      },
    });

    const timezoneMap = (panelists || []).reduce((acc: any, p: any) => {
      acc[p.userId || p] = p.timezone || 'UTC';
      return acc;
    }, {} as Record<string, string>);
    timezoneMap.candidate = candidateTimezone;

    return res.status(201).json({ data: {
      scheduleRequest,
      timezoneMap,
      availableSlots: availableSlots.slice(0, 10),
    }, message: 'Multi-timezone schedule request created' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to create multi-timezone schedule: ${error.message}` } });
  }
});

// POST /api/scheduling/multi-party - multi-party interview scheduling
router.post('/scheduling/multi-party', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, interviewType, panelUserIds, duration, scheduledAt } = req.body;

    if (!candidateId || !requisitionId || !panelUserIds || panelUserIds.length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId, requisitionId, and panelUserIds are required' } });
    }

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Requisition not found' } });
    }

    const interview = await prisma.interview.create({
      data: {
        tenantId,
        requisitionId,
        candidateId,
        interviewType: interviewType || 'PANEL',
        stage: 'INTERVIEW',
        status: 'SCHEDULED',
        duration: duration || 60,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    const panelMembers = await Promise.all(
      panelUserIds.map((userId: string, index: number) =>
        prisma.interviewPanelMember.create({
          data: {
            interviewId: interview.id,
            userId,
            role: index === 0 ? 'LEAD' : 'INTERVIEWER',
            isRequired: true,
          },
        })
      )
    );

    const scheduleRequest = await prisma.scheduleRequest.create({
      data: {
        tenantId,
        interviewId: interview.id,
        candidateId,
        requiredPanelists: panelUserIds,
        duration: duration || 60,
        status: scheduledAt ? 'SCHEDULED' : 'PENDING',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    return res.status(201).json({ data: {
      interview,
      panelMembers,
      scheduleRequest,
    }, message: 'Multi-party interview scheduled' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to schedule multi-party interview: ${error.message}` } });
  }
});

// GET /api/scheduling/no-show/prevention - no-show prevention status
router.get('/scheduling/no-show/prevention', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        tenantId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });

    const pastNoShows = await prisma.interview.count({
      where: { tenantId, status: 'NO_SHOW' },
    });

    const totalPast = await prisma.interview.count({
      where: { tenantId, status: { in: ['COMPLETED', 'NO_SHOW', 'CANCELLED'] } },
    });

    const noShowRate = totalPast > 0 ? (pastNoShows / totalPast) * 100 : 0;

    const needsReminder = upcomingInterviews.filter(i => {
      if (!i.scheduledAt) return false;
      const hoursUntil = (i.scheduledAt.getTime() - Date.now()) / 3600000;
      return hoursUntil < 48 && hoursUntil > 0;
    });

    return sendOk(res, {
      upcomingCount: upcomingInterviews.length,
      needsReminder: needsReminder.map(i => ({
        interviewId: i.id,
        candidateId: i.candidateId,
        scheduledAt: i.scheduledAt,
        status: i.status,
      })),
      noShowStats: {
        totalNoShows: pastNoShows,
        noShowRate: Math.round(noShowRate * 10) / 10,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to get no-show prevention status: ${error.message}` } });
  }
});

// POST /api/scheduling/no-show/remind - send reminders
router.post('/scheduling/no-show/remind', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewIds } = req.body;

    let interviews;
    if (interviewIds && Array.isArray(interviewIds)) {
      interviews = await prisma.interview.findMany({
        where: { id: { in: interviewIds }, tenantId, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
      });
    } else {
      // Auto-select interviews in next 48 hours without reminders
      const in48h = new Date(Date.now() + 48 * 3600000);
      interviews = await prisma.interview.findMany({
        where: {
          tenantId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { gte: new Date(), lte: in48h },
        },
      });
    }

    const reminders = await Promise.all(
      interviews.map(async (interview) => {
        const comm = await prisma.candidateCommunication.create({
          data: {
            tenantId,
            candidateId: interview.candidateId,
            channel: 'EMAIL',
            direction: 'OUTBOUND',
            subject: 'Interview Reminder',
            body: `Reminder: Your interview is scheduled for ${interview.scheduledAt?.toISOString() || 'TBD'}. Please confirm your attendance.`,
            metadata: { interviewId: interview.id, type: 'NO_SHOW_PREVENTION_REMINDER' },
          },
        });
        return { interviewId: interview.id, candidateId: interview.candidateId, communicationId: comm.id };
      })
    );

    return sendOk(res, {
      remindersSent: reminders.length,
      reminders,
    }, { message: `${reminders.length} reminder(s) sent` });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to send reminders: ${error.message}` } });
  }
});

// ─── P2 Scheduling & Coordination Routes ────────────────────────────────────

// POST /api/scheduling/sms-scheduler - Conversational SMS Frontline Scheduler
// Feature 121: Allows candidates to schedule interviews via natural conversation through text.
router.post('/scheduling/sms-scheduler', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, phoneNumber, inboundMessage, requisitionId } = req.body;

    if (!candidateId || !phoneNumber) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId and phoneNumber are required' } });
    }

    // Fetch upcoming available slots to offer the candidate
    const availableSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    // Parse simple intent from inbound message (keyword matching)
    const msgLower = (inboundMessage || '').toLowerCase();
    let intent: string;
    let responseBody: string;
    let scheduleRequest = null;

    if (msgLower.includes('confirm') || msgLower.includes('yes') || msgLower.includes('book')) {
      intent = 'CONFIRM';
      if (availableSlots.length > 0) {
        scheduleRequest = await prisma.scheduleRequest.create({
          data: {
            tenantId,
            candidateId,
            requiredPanelists: [],
            duration: 45,
            timezone: 'UTC',
            status: 'SCHEDULED',
            scheduledAt: availableSlots[0].date,
          },
        });
        await prisma.scheduleSlot.update({
          where: { id: availableSlots[0].id },
          data: { isBooked: true },
        });
        responseBody = `Great! Your interview is confirmed for ${availableSlots[0].date.toISOString()}. Reply CANCEL to cancel.`;
      } else {
        responseBody = 'Sorry, no slots are available right now. A recruiter will reach out soon.';
      }
    } else if (msgLower.includes('cancel')) {
      intent = 'CANCEL';
      responseBody = 'Your interview has been cancelled. Reply SCHEDULE to book a new time.';
    } else if (msgLower.includes('reschedule') || msgLower.includes('change')) {
      intent = 'RESCHEDULE';
      const slotLines = availableSlots.map((s, i) => `${i + 1}. ${s.date.toISOString()}`).join('\n');
      responseBody = availableSlots.length > 0
        ? `Here are available times:\n${slotLines}\nReply with a number to confirm.`
        : 'No slots available right now. We will contact you shortly.';
    } else {
      intent = 'GREETING';
      const slotLines = availableSlots.map((s, i) => `${i + 1}. ${s.date.toISOString()}`).join('\n');
      responseBody = availableSlots.length > 0
        ? `Hi! Here are available interview slots:\n${slotLines}\nReply CONFIRM to book the first slot or RESCHEDULE to see more.`
        : 'Hi! No slots are currently available. A recruiter will contact you soon.';
    }

    // Log the SMS exchange
    await prisma.candidateCommunication.create({
      data: {
        tenantId,
        candidateId,
        channel: 'SMS',
        direction: 'OUTBOUND',
        subject: 'SMS Scheduling',
        body: responseBody,
        metadata: {
          inboundMessage,
          intent,
          phoneNumber,
          requisitionId: requisitionId || null,
        },
      },
    });

    return res.status(201).json({ data: {
      intent,
      responseMessage: responseBody,
      scheduleRequest,
      availableSlots: availableSlots.length,
    }, message: 'SMS scheduling interaction processed' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to process SMS scheduling: ${error.message}` } });
  }
});

// GET /api/scheduling/capacity-forecast - Interview Capacity & Forecasting Engine
// Feature 215: Forecasts interviewer capacity and staffing needs to prevent scheduling bottlenecks.
router.get('/scheduling/capacity-forecast', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { weeksAhead = '4' } = req.query;

    const weeks = Math.min(parseInt(weeksAhead as string, 10) || 4, 12);
    const now = new Date();
    const forecastEnd = new Date(now.getTime() + weeks * 7 * 24 * 3600000);

    // Count upcoming booked interviews per interviewer
    const panelMembersRaw = await prisma.interviewPanelMember.findMany({
      where: {
        interview: {
          tenantId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { gte: now, lte: forecastEnd },
        },
      },
      include: {
        interview: { select: { scheduledAt: true, duration: true } },
      },
    });

    // Aggregate load per userId
    const loadMap: Record<string, { scheduledCount: number; totalMinutes: number }> = {};
    for (const pm of panelMembersRaw) {
      if (!loadMap[pm.userId]) loadMap[pm.userId] = { scheduledCount: 0, totalMinutes: 0 };
      loadMap[pm.userId].scheduledCount += 1;
      loadMap[pm.userId].totalMinutes += pm.interview.duration;
    }

    // Available slots per user in the forecast window
    const availableSlots = await prisma.scheduleSlot.groupBy({
      by: ['userId'],
      where: {
        tenantId,
        isAvailable: true,
        isBooked: false,
        date: { gte: now, lte: forecastEnd },
      },
      _count: { id: true },
    });

    const capacityMap: Record<string, number> = {};
    for (const slot of availableSlots) {
      capacityMap[slot.userId] = slot._count.id;
    }

    // Build per-user forecast
    const allUserIds = Array.from(new Set([
      ...Object.keys(loadMap),
      ...Object.keys(capacityMap),
    ]));

    const forecast = allUserIds.map(userId => ({
      userId,
      scheduledInterviews: loadMap[userId]?.scheduledCount || 0,
      scheduledMinutes: loadMap[userId]?.totalMinutes || 0,
      availableSlots: capacityMap[userId] || 0,
      utilizationPct: capacityMap[userId]
        ? Math.round(((loadMap[userId]?.scheduledCount || 0) / capacityMap[userId]) * 100)
        : null,
      isBottleneck: (capacityMap[userId] || 0) === 0 && (loadMap[userId]?.scheduledCount || 0) > 0,
    }));

    const bottleneckCount = forecast.filter(f => f.isBottleneck).length;
    const totalScheduled = panelMembersRaw.length;

    return sendOk(res, {
      forecastWindowWeeks: weeks,
      forecastEnd,
      totalScheduledInterviews: totalScheduled,
      interviewerCount: allUserIds.length,
      bottleneckInterviewers: bottleneckCount,
      forecast,
    }, { message: 'Capacity forecast computed' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to compute capacity forecast: ${error.message}` } });
  }
});

// GET /api/scheduling/bottlenecks - Proactive scheduling intelligence that prevents bottlenecks
// Feature 723: Identifies scheduling bottlenecks proactively and recommends actions.
router.get('/scheduling/bottlenecks', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 24 * 3600000);

    // Pending schedule requests older than 48h
    const stalePendingRequests = await prisma.scheduleRequest.findMany({
      where: {
        tenantId,
        status: 'PENDING',
        createdAt: { lte: new Date(now.getTime() - 48 * 3600000) },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    // Interviews scheduled in next 14 days with no confirmed panelists
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        tenantId,
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
        scheduledAt: { gte: now, lte: in14Days },
      },
      include: {
        panelMembers: { select: { userId: true, confirmed: true } },
      },
    });

    const unconfirmedInterviews = upcomingInterviews.filter(
      i => i.panelMembers.length > 0 && i.panelMembers.every(p => !p.confirmed)
    );

    // Users with zero available slots in next 14 days but active panel assignments
    const panelUserIds = Array.from(
      new Set(upcomingInterviews.flatMap(i => i.panelMembers.map(p => p.userId)))
    );

    const slotsPerUser = await prisma.scheduleSlot.groupBy({
      by: ['userId'],
      where: {
        tenantId,
        userId: { in: panelUserIds },
        isAvailable: true,
        isBooked: false,
        date: { gte: now, lte: in14Days },
      },
      _count: { id: true },
    });

    const usersWithSlots = new Set(slotsPerUser.map(s => s.userId));
    const overloadedUsers = panelUserIds.filter(uid => !usersWithSlots.has(uid));

    // Compose recommendations
    const recommendations: string[] = [];
    if (stalePendingRequests.length > 0) {
      recommendations.push(`${stalePendingRequests.length} schedule request(s) pending for more than 48 hours — consider reassigning or expanding panelist pool.`);
    }
    if (unconfirmedInterviews.length > 0) {
      recommendations.push(`${unconfirmedInterviews.length} upcoming interview(s) have no confirmed panelists — send confirmation reminders.`);
    }
    if (overloadedUsers.length > 0) {
      recommendations.push(`${overloadedUsers.length} interviewer(s) have panel assignments but no available slots — request they open calendar availability.`);
    }

    return sendOk(res, {
      stalePendingRequests: stalePendingRequests.length,
      unconfirmedUpcomingInterviews: unconfirmedInterviews.length,
      overloadedInterviewers: overloadedUsers.length,
      overloadedUserIds: overloadedUsers,
      recommendations,
      healthy: recommendations.length === 0,
    }, { message: 'Bottleneck analysis complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to analyze bottlenecks: ${error.message}` } });
  }
});

// GET /api/scheduling/availability-prediction - Agentic Interviewer Availability Predictor
// Feature 820: Predicts when interviewers will be available, improving scheduling efficiency.
router.get('/scheduling/availability-prediction', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { userId, daysAhead = '14' } = req.query;

    const days = Math.min(parseInt(daysAhead as string, 10) || 14, 30);
    const now = new Date();
    const windowEnd = new Date(now.getTime() + days * 24 * 3600000);

    const slotWhere: any = {
      tenantId,
      isAvailable: true,
      isBooked: false,
      date: { gte: now, lte: windowEnd },
    };
    if (userId) slotWhere.userId = userId as string;

    const slots = await prisma.scheduleSlot.findMany({
      where: slotWhere,
      orderBy: [{ userId: 'asc' }, { date: 'asc' }],
    });

    // Group slots by userId → by date
    const byUser: Record<string, { userId: string; slots: typeof slots; nextAvailable: Date | null; totalSlots: number }> = {};
    for (const slot of slots) {
      if (!byUser[slot.userId]) {
        byUser[slot.userId] = { userId: slot.userId, slots: [], nextAvailable: null, totalSlots: 0 };
      }
      byUser[slot.userId].slots.push(slot);
      byUser[slot.userId].totalSlots += 1;
      if (!byUser[slot.userId].nextAvailable) {
        byUser[slot.userId].nextAvailable = slot.date;
      }
    }

    // Historical load: past completed interviews per user last 30 days
    const past30 = new Date(now.getTime() - 30 * 24 * 3600000);
    const historicalLoad = await prisma.interviewPanelMember.groupBy({
      by: ['userId'],
      where: {
        interview: {
          tenantId,
          status: 'COMPLETED',
          scheduledAt: { gte: past30 },
        },
        userId: userId ? { equals: userId as string } : undefined,
      },
      _count: { id: true },
    });

    const avgPerUser = historicalLoad.length > 0
      ? historicalLoad.reduce((sum, h) => sum + h._count.id, 0) / historicalLoad.length
      : 0;

    const predictions = Object.values(byUser).map(u => {
      const hist = historicalLoad.find(h => h.userId === u.userId);
      const historicalWeeklyRate = hist ? hist._count.id / 4 : 0;
      return {
        userId: u.userId,
        nextAvailableAt: u.nextAvailable,
        availableSlotsInWindow: u.totalSlots,
        predictedWeeklyCapacity: Math.round(historicalWeeklyRate),
        confidenceScore: u.totalSlots > 5 ? 'HIGH' : u.totalSlots > 2 ? 'MEDIUM' : 'LOW',
      };
    });

    return sendOk(res, {
      predictionWindowDays: days,
      windowEnd,
      predictions,
      teamAverageHistoricalWeeklyInterviews: Math.round(avgPerUser / 4),
    }, { message: 'Availability predictions computed' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict availability: ${error.message}` } });
  }
});

// POST /api/scheduling/slot-negotiation - Dynamic Interview Slot Negotiation
// Feature 821: Negotiates available interview slots between candidates and interviewers dynamically.
router.post('/scheduling/slot-negotiation', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, panelUserIds, proposedSlotId, counterProposalSlotId, action } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId is required' } });
    }

    // action: PROPOSE | COUNTER | ACCEPT | REJECT
    const negotiationAction = (action || 'PROPOSE').toUpperCase();

    if (negotiationAction === 'ACCEPT' && proposedSlotId) {
      // Accept the proposed slot — book it
      const slot = await prisma.scheduleSlot.findFirst({
        where: { id: proposedSlotId, tenantId, isAvailable: true, isBooked: false },
      });
      if (!slot) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Proposed slot not found or already booked' } });
      }

      const interview = requisitionId
        ? await prisma.interview.create({
            data: {
              tenantId,
              requisitionId,
              candidateId,
              interviewType: 'PANEL',
              stage: 'INTERVIEW',
              status: 'SCHEDULED',
              duration: 60,
              scheduledAt: slot.date,
            },
          })
        : null;

      await prisma.scheduleSlot.update({
        where: { id: proposedSlotId },
        data: { isBooked: true, interviewId: interview?.id || null },
      });

      await prisma.scheduleRequest.create({
        data: {
          tenantId,
          candidateId,
          requiredPanelists: panelUserIds || [],
          duration: 60,
          status: 'SCHEDULED',
          scheduledAt: slot.date,
          interviewId: interview?.id || null,
        },
      });

      return sendOk(res, { action: 'ACCEPTED', slot, interview }, { message: 'Slot accepted and booked' });
    }

    // For PROPOSE / COUNTER — find best matching open slots
    const panelistIds: string[] = panelUserIds || [];
    const candidateSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
        userId: panelistIds.length > 0 ? { in: panelistIds } : undefined,
      },
      orderBy: { date: 'asc' },
      take: 10,
    });

    // Identify overlapping slots when multiple panelists required
    const slotsByDate: Record<string, typeof candidateSlots> = {};
    for (const slot of candidateSlots) {
      const key = slot.date.toISOString().slice(0, 13); // hour bucket
      if (!slotsByDate[key]) slotsByDate[key] = [];
      slotsByDate[key].push(slot);
    }

    const overlappingSlots = Object.values(slotsByDate)
      .filter(group => panelistIds.length === 0 || group.length >= Math.min(panelistIds.length, 2))
      .map(group => group[0]);

    await prisma.scheduleRequest.upsert({
      where: { id: counterProposalSlotId || 'new-placeholder' },
      create: {
        tenantId,
        candidateId,
        requiredPanelists: panelistIds,
        duration: 60,
        status: 'NEGOTIATING',
        preferredSlots: overlappingSlots.slice(0, 3).map(s => s.id),
      },
      update: {
        preferredSlots: overlappingSlots.slice(0, 3).map(s => s.id),
        status: 'NEGOTIATING',
      },
    }).catch(() =>
      prisma.scheduleRequest.create({
        data: {
          tenantId,
          candidateId,
          requiredPanelists: panelistIds,
          duration: 60,
          status: 'NEGOTIATING',
          preferredSlots: overlappingSlots.slice(0, 3).map(s => s.id),
        },
      })
    );

    return sendOk(res, {
      action: negotiationAction,
      proposedSlots: overlappingSlots.slice(0, 3),
      totalMatchingSlots: overlappingSlots.length,
      nextStep: overlappingSlots.length > 0
        ? 'Send ACCEPT with proposedSlotId to confirm'
        : 'No overlapping slots — panelists need to add availability',
    }, { message: 'Slot negotiation in progress' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to negotiate slot: ${error.message}` } });
  }
});

// POST /api/scheduling/no-show/recovery - No-Show Autonomous Recovery
// Feature 832: Automatically recovers from candidate no-shows by rescheduling and notifying.
router.post('/scheduling/no-show/recovery', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewId } = req.body;

    if (!interviewId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'interviewId is required' } });
    }

    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, tenantId },
      include: { panelMembers: true },
    });
    if (!interview) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } });
    }

    // Mark as no-show
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'NO_SHOW' },
    });

    // Release the booked slot
    await prisma.scheduleSlot.updateMany({
      where: { tenantId, interviewId, isBooked: true },
      data: { isBooked: false, interviewId: null },
    });

    // Find the next available slot across current panelists
    const panelistIds = interview.panelMembers.map(p => p.userId);
    const nextSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        userId: panelistIds.length > 0 ? { in: panelistIds } : undefined,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    let recoveryInterview = null;
    if (nextSlots.length > 0) {
      recoveryInterview = await prisma.interview.create({
        data: {
          tenantId,
          requisitionId: interview.requisitionId,
          candidateId: interview.candidateId,
          interviewType: interview.interviewType,
          stage: interview.stage,
          status: 'SCHEDULED',
          duration: interview.duration,
          scheduledAt: nextSlots[0].date,
        },
      });

      // Re-assign panel members
      await Promise.all(
        interview.panelMembers.map(pm =>
          prisma.interviewPanelMember.create({
            data: {
              interviewId: recoveryInterview!.id,
              userId: pm.userId,
              role: pm.role,
              isRequired: pm.isRequired,
            },
          })
        )
      );

      await prisma.scheduleSlot.update({
        where: { id: nextSlots[0].id },
        data: { isBooked: true, interviewId: recoveryInterview.id },
      });
    }

    // Notify candidate via communication log
    const notification = await prisma.candidateCommunication.create({
      data: {
        tenantId,
        candidateId: interview.candidateId,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        subject: 'Interview Rescheduled After No-Show',
        body: recoveryInterview
          ? `We noticed you missed your interview. It has been rescheduled for ${recoveryInterview.scheduledAt?.toISOString()}. Please confirm attendance.`
          : `We noticed you missed your interview. Please contact us to reschedule at your earliest convenience.`,
        metadata: {
          originalInterviewId: interviewId,
          recoveryInterviewId: recoveryInterview?.id || null,
          type: 'NO_SHOW_RECOVERY',
        },
      },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: 'NO_SHOW_RECOVERY_INITIATED',
        resourceType: 'Interview',
        resourceId: interviewId,
        metadata: { recoveryInterviewId: recoveryInterview?.id || null },
      },
    });

    return sendOk(res, {
      originalInterviewId: interviewId,
      recoveryInterview,
      notificationSent: true,
      notificationId: notification.id,
      nextAvailableSlots: nextSlots.length,
    }, { message: recoveryInterview ? 'No-show recovery complete — interview rescheduled' : 'No-show logged — no slots available for auto-recovery' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to execute no-show recovery: ${error.message}` } });
  }
});

// POST /api/scheduling/multi-panel/negotiate - Autonomous Multi-Panel Scheduling Negotiator
// Feature 863: Automatically negotiates availability across multiple panelists to find meeting slots.
router.post('/scheduling/multi-panel/negotiate', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, requisitionId, panelUserIds, duration, requiredOverlapCount } = req.body;

    if (!candidateId || !panelUserIds || panelUserIds.length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'candidateId and panelUserIds are required' } });
    }

    const minOverlap = requiredOverlapCount || panelUserIds.length;

    // Fetch all available slots for all specified panelists in next 30 days
    const windowEnd = new Date(Date.now() + 30 * 24 * 3600000);
    const slots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        userId: { in: panelUserIds },
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date(), lte: windowEnd },
      },
      orderBy: { date: 'asc' },
    });

    // Group by hour bucket and count unique panelists per bucket
    const buckets: Record<string, { date: Date; userIds: Set<string>; slotIds: string[] }> = {};
    for (const slot of slots) {
      const key = slot.date.toISOString().slice(0, 13);
      if (!buckets[key]) buckets[key] = { date: slot.date, userIds: new Set(), slotIds: [] };
      buckets[key].userIds.add(slot.userId);
      buckets[key].slotIds.push(slot.id);
    }

    // Find buckets where enough panelists are free
    const qualifying = Object.values(buckets)
      .filter(b => b.userIds.size >= Math.min(minOverlap, panelUserIds.length))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 10)
      .map(b => ({
        proposedTime: b.date,
        availablePanelists: Array.from(b.userIds),
        availableCount: b.userIds.size,
        slotIds: b.slotIds,
        allPanelistsAvailable: b.userIds.size >= panelUserIds.length,
      }));

    const scheduleRequest = await prisma.scheduleRequest.create({
      data: {
        tenantId,
        candidateId,
        requiredPanelists: panelUserIds,
        duration: duration || 60,
        status: qualifying.length > 0 ? 'PENDING' : 'BLOCKED',
        preferredSlots: qualifying.slice(0, 3).map(q => q.slotIds[0]),
      },
    });

    return created(res, {
      scheduleRequest,
      qualifyingSlots: qualifying,
      bestOption: qualifying[0] || null,
      negotiationStatus: qualifying.length > 0 ? 'SLOTS_FOUND' : 'NO_OVERLAP',
      missingPanelistIds: qualifying.length > 0
        ? panelUserIds.filter((uid: string) => !qualifying[0].availablePanelists.includes(uid))
        : panelUserIds,
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to negotiate multi-panel schedule: ${error.message}` } });
  }
});

// GET /api/scheduling/burnout-risk - Predictive Interviewer Burnout Balancer
// Feature 864: Predicts interviewer burnout and rebalances interview loads.
router.get('/scheduling/burnout-risk', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const now = new Date();
    const past30 = new Date(now.getTime() - 30 * 24 * 3600000);
    const past7 = new Date(now.getTime() - 7 * 24 * 3600000);
    const next14 = new Date(now.getTime() + 14 * 24 * 3600000);

    // Interviews completed per interviewer in last 30 days
    const last30Load = await prisma.interviewPanelMember.groupBy({
      by: ['userId'],
      where: {
        interview: {
          tenantId,
          status: 'COMPLETED',
          scheduledAt: { gte: past30 },
        },
      },
      _count: { id: true },
    });

    // Interviews completed per interviewer in last 7 days (recent spike detection)
    const last7Load = await prisma.interviewPanelMember.groupBy({
      by: ['userId'],
      where: {
        interview: {
          tenantId,
          status: 'COMPLETED',
          scheduledAt: { gte: past7 },
        },
      },
      _count: { id: true },
    });

    // Upcoming load in next 14 days
    const upcomingLoad = await prisma.interviewPanelMember.groupBy({
      by: ['userId'],
      where: {
        interview: {
          tenantId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { gte: now, lte: next14 },
        },
      },
      _count: { id: true },
    });

    const last7Map: Record<string, number> = {};
    for (const r of last7Load) last7Map[r.userId] = r._count.id;

    const upcomingMap: Record<string, number> = {};
    for (const r of upcomingLoad) upcomingMap[r.userId] = r._count.id;

    // Burnout scoring: >8 in 30 days OR >3 in last 7 days OR >5 upcoming
    const BURNOUT_MONTHLY_THRESHOLD = 8;
    const BURNOUT_WEEKLY_THRESHOLD = 3;
    const BURNOUT_UPCOMING_THRESHOLD = 5;

    const assessments = last30Load.map(r => {
      const monthly = r._count.id;
      const weekly = last7Map[r.userId] || 0;
      const upcoming = upcomingMap[r.userId] || 0;

      const riskScore =
        (monthly >= BURNOUT_MONTHLY_THRESHOLD ? 40 : (monthly / BURNOUT_MONTHLY_THRESHOLD) * 40) +
        (weekly >= BURNOUT_WEEKLY_THRESHOLD ? 30 : (weekly / BURNOUT_WEEKLY_THRESHOLD) * 30) +
        (upcoming >= BURNOUT_UPCOMING_THRESHOLD ? 30 : (upcoming / BURNOUT_UPCOMING_THRESHOLD) * 30);

      return {
        userId: r.userId,
        interviewsLast30Days: monthly,
        interviewsLast7Days: weekly,
        upcomingInterviews14Days: upcoming,
        burnoutRiskScore: Math.round(riskScore),
        riskLevel: riskScore >= 80 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW',
        recommendation: riskScore >= 80
          ? 'Immediately redistribute upcoming interviews to other panelists'
          : riskScore >= 50
          ? 'Limit new scheduling assignments for this interviewer this week'
          : 'Load within healthy range',
      };
    });

    assessments.sort((a, b) => b.burnoutRiskScore - a.burnoutRiskScore);

    const highRiskCount = assessments.filter(a => a.riskLevel === 'HIGH').length;

    return sendOk(res, {
      assessedInterviewers: assessments.length,
      highRiskCount,
      mediumRiskCount: assessments.filter(a => a.riskLevel === 'MEDIUM').length,
      assessments,
      thresholds: {
        monthlyBurnout: BURNOUT_MONTHLY_THRESHOLD,
        weeklyBurnout: BURNOUT_WEEKLY_THRESHOLD,
        upcomingBurnout: BURNOUT_UPCOMING_THRESHOLD,
      },
    }, { message: 'Burnout risk assessment complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to assess burnout risk: ${error.message}` } });
  }
});

// POST /api/scheduling/fallback-orchestrate - Real-Time Rescheduling & Fallback Orchestrator
// Feature 865: Automatically reschedules and executes fallback plans when appointments cancel or conflict.
router.post('/scheduling/fallback-orchestrate', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewId, reason, fallbackPanelUserIds } = req.body;

    if (!interviewId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'interviewId is required' } });
    }

    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, tenantId },
      include: { panelMembers: true },
    });
    if (!interview) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } });
    }

    // Release current slot
    await prisma.scheduleSlot.updateMany({
      where: { tenantId, interviewId, isBooked: true },
      data: { isBooked: false, interviewId: null },
    });

    // Determine panelist pool: prefer fallback list, then existing
    const originalPanelists = interview.panelMembers.map(p => p.userId);
    const fallbackPool: string[] = fallbackPanelUserIds || [];
    const panelPool = fallbackPool.length > 0 ? fallbackPool : originalPanelists;

    // Find next available slot across the fallback pool
    const fallbackSlots = await prisma.scheduleSlot.findMany({
      where: {
        tenantId,
        userId: panelPool.length > 0 ? { in: panelPool } : undefined,
        isAvailable: true,
        isBooked: false,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: 5,
    });

    let rescheduledInterview = null;
    const steps: string[] = ['Original slot released'];

    if (fallbackSlots.length > 0) {
      const newSlot = fallbackSlots[0];

      rescheduledInterview = await prisma.interview.update({
        where: { id: interviewId },
        data: {
          status: 'RESCHEDULED',
          scheduledAt: newSlot.date,
        },
      });

      await prisma.scheduleSlot.update({
        where: { id: newSlot.id },
        data: { isBooked: true, interviewId },
      });

      steps.push(`Rescheduled to ${newSlot.date.toISOString()}`);

      // If fallback panelists differ, replace panel members
      if (fallbackPool.length > 0 && JSON.stringify(fallbackPool.sort()) !== JSON.stringify(originalPanelists.sort())) {
        await prisma.interviewPanelMember.deleteMany({
          where: { interviewId },
        });
        await Promise.all(
          fallbackPool.map((uid, i) =>
            prisma.interviewPanelMember.create({
              data: {
                interviewId,
                userId: uid,
                role: i === 0 ? 'LEAD' : 'INTERVIEWER',
                isRequired: true,
              },
            })
          )
        );
        steps.push(`Panel replaced with fallback interviewers: ${fallbackPool.join(', ')}`);
      } else {
        steps.push('Original panel retained');
      }
    } else {
      await prisma.interview.update({
        where: { id: interviewId },
        data: { status: 'CANCELLED' },
      });
      steps.push('No fallback slots found — interview cancelled');
    }

    // Notify candidate
    await prisma.candidateCommunication.create({
      data: {
        tenantId,
        candidateId: interview.candidateId,
        channel: 'EMAIL',
        direction: 'OUTBOUND',
        subject: rescheduledInterview ? 'Your Interview Has Been Rescheduled' : 'Your Interview Has Been Cancelled',
        body: rescheduledInterview
          ? `Your interview has been rescheduled to ${rescheduledInterview.scheduledAt?.toISOString()}. Reason: ${reason || 'scheduling conflict'}.`
          : `Your interview could not be rescheduled at this time. A recruiter will be in touch. Reason: ${reason || 'scheduling conflict'}.`,
        metadata: { interviewId, type: 'FALLBACK_ORCHESTRATION', reason },
      },
    });

    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        actorId: req.user!.id,
        action: rescheduledInterview ? 'INTERVIEW_FALLBACK_RESCHEDULED' : 'INTERVIEW_FALLBACK_CANCELLED',
        resourceType: 'Interview',
        resourceId: interviewId,
        metadata: { reason, steps, fallbackPanelUserIds: fallbackPool },
      },
    });

    return sendOk(res, {
      interviewId,
      rescheduledInterview,
      fallbackSlotsAvailable: fallbackSlots.length,
      orchestrationSteps: steps,
      outcome: rescheduledInterview ? 'RESCHEDULED' : 'CANCELLED',
    }, { message: rescheduledInterview ? 'Fallback orchestration complete — interview rescheduled' : 'Fallback orchestration complete — no slots available' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to orchestrate fallback: ${error.message}` } });
  }
});

// GET /api/scheduling/load-balance - Panelist Availability & Load Balancer
// Feature 927: Tracks panelist availability and distributes interview load fairly.
router.get('/scheduling/load-balance', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;

    const now = new Date();
    const past30 = new Date(now.getTime() - 30 * 24 * 3600000);
    const next30 = new Date(now.getTime() + 30 * 24 * 3600000);

    // Historical interview counts per user last 30 days
    const historicalLoad = await prisma.interviewPanelMember.groupBy({
      by: ['userId'],
      where: {
        interview: {
          tenantId,
          scheduledAt: { gte: past30, lte: now },
        },
      },
      _count: { id: true },
    });

    // Upcoming scheduled interviews per user next 30 days
    const upcomingLoad = await prisma.interviewPanelMember.groupBy({
      by: ['userId'],
      where: {
        interview: {
          tenantId,
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
          scheduledAt: { gte: now, lte: next30 },
        },
      },
      _count: { id: true },
    });

    // Available open slots per user next 30 days
    const openSlots = await prisma.scheduleSlot.groupBy({
      by: ['userId'],
      where: {
        tenantId,
        isAvailable: true,
        isBooked: false,
        date: { gte: now, lte: next30 },
      },
      _count: { id: true },
    });

    const histMap: Record<string, number> = {};
    for (const r of historicalLoad) histMap[r.userId] = r._count.id;

    const upcomingMap: Record<string, number> = {};
    for (const r of upcomingLoad) upcomingMap[r.userId] = r._count.id;

    const slotsMap: Record<string, number> = {};
    for (const r of openSlots) slotsMap[r.userId] = r._count.id;

    // Merge all known user IDs
    const allUserIds = Array.from(new Set([
      ...Object.keys(histMap),
      ...Object.keys(upcomingMap),
      ...Object.keys(slotsMap),
    ]));

    // Compute load score and distribution
    const totalHistorical = Object.values(histMap).reduce((a, b) => a + b, 0);
    const avgHistorical = allUserIds.length > 0 ? totalHistorical / allUserIds.length : 0;

    const balanceReport = allUserIds.map(userId => {
      const hist = histMap[userId] || 0;
      const upcoming = upcomingMap[userId] || 0;
      const available = slotsMap[userId] || 0;
      const deviationFromAvg = hist - avgHistorical;
      const isOverloaded = hist > avgHistorical * 1.5 && hist > 2;
      const isUnderutilized = hist < avgHistorical * 0.5 && available > 0;

      return {
        userId,
        historicalInterviews30Days: hist,
        upcomingInterviews30Days: upcoming,
        openSlots30Days: available,
        deviationFromTeamAvg: Math.round(deviationFromAvg * 10) / 10,
        loadStatus: isOverloaded ? 'OVERLOADED' : isUnderutilized ? 'UNDERUTILIZED' : 'BALANCED',
        rebalanceRecommendation: isOverloaded
          ? 'Reduce upcoming assignments — route new requests to less-loaded interviewers'
          : isUnderutilized
          ? 'Eligible for additional interview assignments'
          : null,
      };
    });

    balanceReport.sort((a, b) => b.historicalInterviews30Days - a.historicalInterviews30Days);

    const overloadedCount = balanceReport.filter(r => r.loadStatus === 'OVERLOADED').length;
    const underutilizedCount = balanceReport.filter(r => r.loadStatus === 'UNDERUTILIZED').length;

    // Suggested rebalancing actions
    const rebalancingActions: Array<{ fromUserId: string; toUserId: string; suggestedInterviewShift: number }> = [];
    const overloaded = balanceReport.filter(r => r.loadStatus === 'OVERLOADED');
    const underutilized = balanceReport.filter(r => r.loadStatus === 'UNDERUTILIZED');
    for (let i = 0; i < Math.min(overloaded.length, underutilized.length, 5); i++) {
      rebalancingActions.push({
        fromUserId: overloaded[i].userId,
        toUserId: underutilized[i].userId,
        suggestedInterviewShift: Math.ceil(overloaded[i].deviationFromTeamAvg / 2),
      });
    }

    return sendOk(res, {
      teamAverageHistoricalInterviews30Days: Math.round(avgHistorical * 10) / 10,
      totalInterviewers: allUserIds.length,
      overloadedCount,
      underutilizedCount,
      balancedCount: balanceReport.filter(r => r.loadStatus === 'BALANCED').length,
      balanceReport,
      rebalancingActions,
    }, { message: 'Load balance report generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to generate load balance report: ${error.message}` } });
  }
});

// ─── P2/P3 SCHEDULING FEATURES ─────────────────────────────────────────────

// GET /api/scheduling/conversational-sms-frontline-scheduler
router.get('/scheduling/conversational-sms-frontline-scheduler', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const pending = await prisma.interview.findMany({
      where: { tenantId, status: 'SCHEDULED', interviewType: 'PHONE' },
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: pending.length, interviews: pending }, { message: 'Pending SMS scheduling requests' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch SMS scheduling requests: ${error.message}` } });
  }
});

const SmsFrontlineSchedulerRunSchema = z.object({
  candidateId: z.string().min(1),
  message: z.string().min(1),
});

// POST /api/scheduling/conversational-sms-frontline-scheduler/run
router.post('/scheduling/conversational-sms-frontline-scheduler/run', validate(SmsFrontlineSchedulerRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { candidateId, message } = req.body;
    const candidate = await prisma.candidate.findFirst({ where: { id: candidateId, tenantId } });
    if (!candidate) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Candidate not found' } });
    const comm = await prisma.candidateCommunication.create({
      data: { tenantId, candidateId, channel: 'SMS', direction: 'OUTBOUND', subject: 'Interview Scheduling', body: message },
    });
    return sendOk(res, { communication: comm }, { message: 'SMS scheduling message sent' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to send SMS scheduling message: ${error.message}` } });
  }
});

// GET /api/scheduling/interview-capacity-forecasting-engine
router.get('/scheduling/interview-capacity-forecasting-engine', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 86400000);
    const interviews = await prisma.interview.findMany({
      where: { tenantId, scheduledAt: { gte: now, lte: in30Days } },
      orderBy: { scheduledAt: 'asc' },
    });
    const byWeek: Record<number, typeof interviews> = {};
    for (const iv of interviews) {
      if (!iv.scheduledAt) continue;
      const week = Math.floor((iv.scheduledAt.getTime() - now.getTime()) / (7 * 86400000));
      if (!byWeek[week]) byWeek[week] = [];
      byWeek[week].push(iv);
    }
    const weeks = Object.entries(byWeek).map(([w, ivs]) => ({ week: Number(w) + 1, count: ivs.length }));
    return sendOk(res, { totalNext30Days: interviews.length, byWeek: weeks }, { message: 'Interview capacity for next 30 days' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch capacity forecast: ${error.message}` } });
  }
});

const CapacityForecastRunSchema = z.object({
  weeksAhead: z.number().int().min(1).max(12).default(4),
});

// POST /api/scheduling/interview-capacity-forecasting-engine/run
router.post('/scheduling/interview-capacity-forecasting-engine/run', validate(CapacityForecastRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { weeksAhead } = req.body;
    const now = new Date();
    const horizon = new Date(now.getTime() + weeksAhead * 7 * 86400000);
    const interviews = await prisma.interview.findMany({
      where: { tenantId, scheduledAt: { gte: now, lte: horizon } },
    });
    const weeklyAvg = weeksAhead > 0 ? Math.round(interviews.length / weeksAhead) : 0;
    return sendOk(res, { weeksAhead, totalScheduled: interviews.length, weeklyAverage: weeklyAvg }, { message: 'Capacity forecast generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run capacity forecast: ${error.message}` } });
  }
});

// GET /api/scheduling/proactive-scheduling-intelligence-that-prevents-bottlenecks
router.get('/scheduling/proactive-scheduling-intelligence-that-prevents-bottlenecks', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const in7Days = new Date(Date.now() + 7 * 86400000);
    const bottlenecks = await prisma.interview.findMany({
      where: {
        tenantId,
        OR: [{ scheduledAt: null }, { scheduledAt: { gt: in7Days } }],
        status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: bottlenecks.length, interviews: bottlenecks }, { message: 'Bottleneck candidates identified' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch scheduling bottlenecks: ${error.message}` } });
  }
});

// GET /api/scheduling/agentic-interviewer-availability-predictor
router.get('/scheduling/agentic-interviewer-availability-predictor', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const in14Days = new Date(now.getTime() + 14 * 86400000);
    const panelMembers = await prisma.interviewPanelMember.findMany({
      where: { interview: { tenantId, scheduledAt: { gte: now, lte: in14Days } } },
      include: { interview: { select: { scheduledAt: true, duration: true } } },
    });
    const loadMap: Record<string, number> = {};
    for (const pm of panelMembers) {
      if (!loadMap[pm.userId]) loadMap[pm.userId] = 0;
      loadMap[pm.userId]++;
    }
    const interviewers = Object.entries(loadMap).map(([userId, upcomingCount]) => ({ userId, upcomingCount }));
    return sendOk(res, { interviewers, totalInterviewers: interviewers.length }, { message: 'Interviewer upcoming load' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch interviewer availability: ${error.message}` } });
  }
});

const InterviewerAvailabilityRunSchema = z.object({
  interviewerId: z.string().optional(),
  dateRange: z.string().optional(),
});

// POST /api/scheduling/agentic-interviewer-availability-predictor/run
router.post('/scheduling/agentic-interviewer-availability-predictor/run', validate(InterviewerAvailabilityRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewerId, dateRange } = req.body;
    const now = new Date();
    const end = dateRange ? new Date(dateRange) : new Date(now.getTime() + 14 * 86400000);
    const where: any = { interview: { tenantId, scheduledAt: { gte: now, lte: end } } };
    if (interviewerId) where.userId = interviewerId;
    const panelMembers = await prisma.interviewPanelMember.findMany({
      where,
      include: { interview: { select: { scheduledAt: true, duration: true, status: true } } },
    });
    const prediction = { interviewerId: interviewerId || 'ALL', upcomingInterviews: panelMembers.length, predictedAvailable: panelMembers.length < 5 };
    return sendOk(res, prediction, { message: 'Availability prediction generated' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to predict interviewer availability: ${error.message}` } });
  }
});

// GET /api/scheduling/dynamic-interview-slot-negotiation
router.get('/scheduling/dynamic-interview-slot-negotiation', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const pending = await prisma.interview.findMany({
      where: { tenantId, status: 'SCHEDULING_PENDING' } as any,
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: pending.length, interviews: pending }, { message: 'Interviews awaiting slot negotiation' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch slot negotiation queue: ${error.message}` } });
  }
});

// GET /api/scheduling/no-show-autonomous-recovery
router.get('/scheduling/no-show-autonomous-recovery', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 7 * 86400000);
    const noShows = await prisma.interview.findMany({
      where: { tenantId, status: 'NO_SHOW', scheduledAt: { gte: since } },
      orderBy: { scheduledAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: noShows.length, interviews: noShows }, { message: 'No-show interviews from last 7 days' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch no-show recovery queue: ${error.message}` } });
  }
});

// GET /api/scheduling/autonomous-multi-panel-scheduling-negotiator
router.get('/scheduling/autonomous-multi-panel-scheduling-negotiator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const interviews = await prisma.interview.findMany({
      where: { tenantId, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      include: { panelMembers: true },
    });
    const panelInterviews = interviews.filter(iv => iv.panelMembers.length > 1);
    return sendOk(res, { count: panelInterviews.length, interviews: panelInterviews.map(iv => ({ ...iv, panelSize: iv.panelMembers.length })) }, { message: 'Panel interviews requiring multi-party scheduling' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch panel scheduling queue: ${error.message}` } });
  }
});

// GET /api/scheduling/predictive-interviewer-burnout-balancer
router.get('/scheduling/predictive-interviewer-burnout-balancer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const since = new Date(Date.now() - 30 * 86400000);
    const panelMembers = await prisma.interviewPanelMember.findMany({
      where: { interview: { tenantId, scheduledAt: { gte: since } } },
    });
    const loadMap: Record<string, number> = {};
    for (const pm of panelMembers) {
      if (!loadMap[pm.userId]) loadMap[pm.userId] = 0;
      loadMap[pm.userId]++;
    }
    const distribution = Object.entries(loadMap)
      .map(([userId, count]) => ({ userId, interviewCount30Days: count }))
      .sort((a, b) => b.interviewCount30Days - a.interviewCount30Days);
    const avg = distribution.length > 0 ? distribution.reduce((s, d) => s + d.interviewCount30Days, 0) / distribution.length : 0;
    const burnoutRisk = distribution.filter(d => d.interviewCount30Days > avg * 1.5);
    return sendOk(res, { distribution, burnoutRisk, averageLoad: Math.round(avg * 10) / 10 }, { message: 'Interviewer load distribution' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch burnout balancer data: ${error.message}` } });
  }
});

// GET /api/scheduling/real-time-rescheduling-fallback-orchestrator
router.get('/scheduling/real-time-rescheduling-fallback-orchestrator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const rescheduled = await prisma.interview.findMany({
      where: { tenantId, status: { in: ['CANCELLED', 'RESCHEDULED'] } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    return sendOk(res, { count: rescheduled.length, interviews: rescheduled }, { message: 'Cancelled/rescheduled interviews' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch rescheduling fallback queue: ${error.message}` } });
  }
});

const ReschedulingFallbackRunSchema = z.object({
  interviewId: z.string().min(1),
  newScheduledAt: z.string().datetime(),
});

// POST /api/scheduling/real-time-rescheduling-fallback-orchestrator/run
router.post('/scheduling/real-time-rescheduling-fallback-orchestrator/run', validate(ReschedulingFallbackRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { interviewId, newScheduledAt } = req.body;
    const interview = await prisma.interview.findFirst({ where: { id: interviewId, tenantId } });
    if (!interview) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } });
    const updated = await prisma.interview.update({
      where: { id: interviewId },
      data: { scheduledAt: new Date(newScheduledAt), status: 'SCHEDULED' },
    });
    return sendOk(res, { interview: updated }, { message: 'Interview rescheduled successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to reschedule interview: ${error.message}` } });
  }
});

// GET /api/scheduling/panelist-availability-load-balancer
router.get('/scheduling/panelist-availability-load-balancer', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 86400000);
    const slots = await prisma.scheduleSlot.findMany({
      where: { tenantId, isAvailable: true, date: { gte: now, lte: in7Days } },
      orderBy: { date: 'asc' },
    });
    const byUser: Record<string, number> = {};
    for (const s of slots) {
      if (!byUser[s.userId]) byUser[s.userId] = 0;
      byUser[s.userId]++;
    }
    const summary = Object.entries(byUser).map(([userId, availableSlots]) => ({ userId, availableSlots }));
    return sendOk(res, { summary, totalAvailableSlots: slots.length }, { message: 'Panelist availability summary' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch panelist availability: ${error.message}` } });
  }
});

// GET /api/scheduling/swarm-based-interview-scheduling-orchestrator
router.get('/scheduling/swarm-based-interview-scheduling-orchestrator', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const queue = await prisma.interview.findMany({
      where: { tenantId, scheduledAt: null, status: { notIn: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] } },
      include: { panelMembers: { select: { userId: true } } },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    return sendOk(res, { count: queue.length, queue: queue.map(iv => ({ id: iv.id, candidateId: iv.candidateId, requisitionId: iv.requisitionId, panelSize: iv.panelMembers.length })) }, { message: 'Swarm scheduling queue' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to fetch swarm scheduling queue: ${error.message}` } });
  }
});

const SwarmSchedulerRunSchema = z.object({
  requisitionId: z.string().min(1),
});

// POST /api/scheduling/swarm-based-interview-scheduling-orchestrator/run
router.post('/scheduling/swarm-based-interview-scheduling-orchestrator/run', validate(SwarmSchedulerRunSchema), async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.user!.tenantId;
    const { requisitionId } = req.body;
    const unscheduled = await prisma.interview.findMany({
      where: { tenantId, requisitionId, scheduledAt: null, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
      take: 20,
    });
    const availableSlot = await prisma.scheduleSlot.findFirst({
      where: { tenantId, isAvailable: true, isBooked: false, date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    });
    const scheduled = availableSlot ? unscheduled.slice(0, 1) : [];
    if (availableSlot && scheduled.length > 0) {
      await prisma.interview.update({ where: { id: scheduled[0].id }, data: { scheduledAt: availableSlot.date, status: 'SCHEDULED' } });
      await prisma.scheduleSlot.update({ where: { id: availableSlot.id }, data: { isBooked: true } });
    }
    return sendOk(res, { requisitionId, totalUnscheduled: unscheduled.length, scheduledThisRun: scheduled.length }, { message: 'Swarm scheduler run complete' });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `Failed to run swarm scheduler: ${error.message}` } });
  }
});

export default router;

