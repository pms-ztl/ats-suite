import { createGoogleCalendarEvent, createMicrosoftCalendarEvent, checkGoogleAvailability, CalendarEvent } from './calendar';
import { prisma } from '../utils/prisma';
import logger from './logger';

export interface CalendarSyncResult {
  provider: 'google' | 'microsoft' | 'none';
  externalEventId: string | null;
  meetingUrl: string | null;
  synced: boolean;
}

/**
 * Sync a schedule event to the user's connected calendar provider.
 * Looks up the user's stored OAuth tokens and creates the event externally.
 * Fire-and-forget — failure is logged but doesn't block the flow.
 */
export async function syncToExternalCalendar(
  userId: string,
  tenantId: string,
  event: CalendarEvent
): Promise<CalendarSyncResult> {
  try {
    const integration = await prisma.integrationConfig.findFirst({
      where: {
        tenantId,
        provider: { in: ['GOOGLE_CALENDAR', 'MICROSOFT_CALENDAR'] },
        status: 'ACTIVE',
      },
    });

    if (!integration) {
      return { provider: 'none', externalEventId: null, meetingUrl: null, synced: false };
    }

    const config = integration.config as Record<string, any>;
    const accessToken = config?.accessToken;

    if (!accessToken) {
      logger.warn({ userId, tenantId }, 'Calendar integration found but no access token');
      return { provider: 'none', externalEventId: null, meetingUrl: null, synced: false };
    }

    if (integration.provider === 'GOOGLE_CALENDAR') {
      const externalId = await createGoogleCalendarEvent(accessToken, event);
      logger.info({ userId, externalId, eventId: event.id }, 'Event synced to Google Calendar');
      return { provider: 'google', externalEventId: externalId, meetingUrl: null, synced: true };
    }

    if (integration.provider === 'MICROSOFT_CALENDAR') {
      const externalId = await createMicrosoftCalendarEvent(accessToken, event);
      logger.info({ userId, externalId, eventId: event.id }, 'Event synced to Microsoft Calendar');
      return { provider: 'microsoft', externalEventId: externalId, meetingUrl: null, synced: true };
    }

    return { provider: 'none', externalEventId: null, meetingUrl: null, synced: false };
  } catch (err) {
    logger.error({ err, userId, eventId: event.id }, 'External calendar sync failed');
    return { provider: 'none', externalEventId: null, meetingUrl: null, synced: false };
  }
}

/**
 * Check freebusy status across Google Calendar for given emails.
 * Returns a map of email -> isAvailable, or null if no integration configured.
 */
export async function checkExternalAvailability(
  userId: string,
  tenantId: string,
  emails: string[],
  startAt: Date,
  endAt: Date
): Promise<Record<string, boolean> | null> {
  try {
    const integration = await prisma.integrationConfig.findFirst({
      where: { tenantId, provider: 'GOOGLE_CALENDAR', status: 'ACTIVE' },
    });

    if (!integration) return null;

    const config = integration.config as Record<string, any>;
    const accessToken = config?.accessToken;
    if (!accessToken) return null;

    return await checkGoogleAvailability(accessToken, emails, startAt, endAt);
  } catch (err) {
    logger.error({ err, userId }, 'External availability check failed');
    return null;
  }
}
