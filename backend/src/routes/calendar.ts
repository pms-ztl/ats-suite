import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth, getTenantId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ok, created } from '../lib/response';
import {
  generateICS,
  getGoogleAuthUrl,
  createGoogleOAuthClient,
  CalendarEvent,
} from '../lib/calendar';
import prisma from '../utils/prisma';

const router = Router();
router.use(requireAuth);

// GET /api/calendar/google/auth-url
router.get('/google/auth-url', (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ success: false, error: { code: 'NOT_CONFIGURED', message: 'Google Calendar not configured' } });
  }
  const url = getGoogleAuthUrl((req as any).user?.tenantId);
  return ok(res, { url });
});

// GET /api/calendar/google/callback
router.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query as { code: string };
    if (!code) throw new AppError('INVALID_REQUEST', 'Missing code', 400);

    const oauth2Client = createGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in IntegrationConfig for the tenant
    const tenantId = getTenantId(req);
    if (tenantId) {
      await prisma.integrationConfig.upsert({
        where: {
          tenantId_integrationType_provider: {
            tenantId,
            integrationType: 'CALENDAR',
            provider: 'GOOGLE_CALENDAR',
          },
        },
        update: {
          config: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expiry_date,
          },
          status: 'ACTIVE',
          lastSyncAt: new Date(),
        },
        create: {
          tenantId,
          integrationType: 'CALENDAR',
          provider: 'GOOGLE_CALENDAR',
          config: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expiry_date,
          },
          status: 'ACTIVE',
        },
      });
    }

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/integrations?calendar=connected`);
  } catch (err) { return next(err); }
});

// POST /api/calendar/events — create calendar event and return ICS
const CreateEventSchema = z.object({
  summary: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  attendees: z.array(z.object({ name: z.string(), email: z.string().email() })).optional(),
  scheduleEventId: z.string().optional(),
});

router.post('/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateEventSchema.parse(req.body);
    const tenantId = getTenantId(req);

    const event: CalendarEvent = {
      id: body.scheduleEventId || crypto.randomUUID(),
      summary: body.summary,
      description: body.description,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      location: body.location,
      meetingUrl: body.meetingUrl,
      attendees: body.attendees,
    };

    const ics = generateICS(event);

    return created(res, {
      event,
      ics,
      icsDataUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
    });
  } catch (err) { return next(err); }
});

// GET /api/calendar/events/:id/ics — download ICS for a schedule event
router.get('/events/:id/ics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const scheduleEvent = await (prisma.scheduleEvent as any).findFirst({
      where: { id: req.params.id as string, tenantId },
    });

    if (!scheduleEvent) throw new AppError('NOT_FOUND', 'Event not found', 404);

    const event: CalendarEvent = {
      id: scheduleEvent.id,
      summary: scheduleEvent.title || 'Interview',
      description: scheduleEvent.description,
      startAt: new Date(scheduleEvent.startAt),
      endAt: new Date(scheduleEvent.endAt),
      location: scheduleEvent.location,
    };

    const ics = generateICS(event);
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="interview-${scheduleEvent.id}.ics"`);
    return res.send(ics);
  } catch (err) { return next(err); }
});

// GET /api/calendar/providers — list available calendar providers
router.get('/providers', (_req: Request, res: Response) => {
  return ok(res, {
    providers: [
      { id: 'google', name: 'Google Calendar', available: !!process.env.GOOGLE_CLIENT_ID },
      { id: 'microsoft', name: 'Microsoft Outlook', available: !!process.env.MICROSOFT_CLIENT_ID },
      { id: 'ics', name: 'ICS Download', available: true },
    ],
  });
});

export default router;
