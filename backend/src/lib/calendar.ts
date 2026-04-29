import ical from 'ical-generator';
import { google } from 'googleapis';

// ── ICS/iCal Generation ──────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  location?: string;
  organizer?: { name: string; email: string };
  attendees?: Array<{ name: string; email: string }>;
  meetingUrl?: string;
}

export function generateICS(event: CalendarEvent): string {
  const cal = ical({ name: 'ATS Interview Calendar' });

  const icsEvent = cal.createEvent({
    id: event.id,
    summary: event.summary,
    description: event.description,
    start: event.startAt,
    end: event.endAt,
    location: event.location,
    url: event.meetingUrl,
    organizer: event.organizer
      ? { name: event.organizer.name, email: event.organizer.email }
      : undefined,
  });

  if (event.attendees) {
    for (const attendee of event.attendees) {
      icsEvent.createAttendee({ name: attendee.name, email: attendee.email });
    }
  }

  return cal.toString();
}

// ── Google Calendar OAuth ────────────────────────────────────────────────
export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL || 'http://localhost:4000'}/api/calendar/google/callback`
  );
}

export function getGoogleAuthUrl(state?: string): string {
  const oauth2Client = createGoogleOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
    state,
    prompt: 'consent',
  });
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<string> {
  const oauth2Client = createGoogleOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startAt.toISOString() },
      end: { dateTime: event.endAt.toISOString() },
      attendees: event.attendees?.map(a => ({ email: a.email, displayName: a.name })),
      conferenceData: event.meetingUrl ? undefined : {
        createRequest: { requestId: event.id, conferenceSolutionKey: { type: 'hangoutsMeet' } },
      },
    },
    conferenceDataVersion: 1,
  });

  return response.data.id || '';
}

// ── Microsoft Graph Calendar ─────────────────────────────────────────────
export async function createMicrosoftCalendarEvent(
  accessToken: string,
  event: CalendarEvent
): Promise<string> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: event.summary,
      body: { contentType: 'text', content: event.description || '' },
      start: { dateTime: event.startAt.toISOString(), timeZone: 'UTC' },
      end: { dateTime: event.endAt.toISOString(), timeZone: 'UTC' },
      location: { displayName: event.location || '' },
      attendees: event.attendees?.map(a => ({
        emailAddress: { address: a.email, name: a.name },
        type: 'required',
      })),
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Microsoft Graph error: ${JSON.stringify(err)}`);
  }

  const data = await response.json() as { id?: string };
  return data.id || '';
}

// ── Availability Check ───────────────────────────────────────────────────
export interface TimeSlot {
  startAt: Date;
  endAt: Date;
  available: boolean;
}

export async function checkGoogleAvailability(
  accessToken: string,
  emails: string[],
  startAt: Date,
  endAt: Date
): Promise<Record<string, boolean>> {
  const oauth2Client = createGoogleOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startAt.toISOString(),
      timeMax: endAt.toISOString(),
      items: emails.map(id => ({ id })),
    },
  });

  const result: Record<string, boolean> = {};
  for (const email of emails) {
    const busy = response.data.calendars?.[email]?.busy || [];
    result[email] = busy.length === 0;
  }
  return result;
}
