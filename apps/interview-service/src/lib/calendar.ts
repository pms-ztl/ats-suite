/**
 * Calendar layer for the scheduling agent — gives it real "eyes" (availability)
 * and "hands" (meeting links + invites), without requiring OAuth.
 *
 * AVAILABILITY (eyes):
 *   1. Internal — the ATS's own Interview rows (the candidate's already-booked
 *      interviews become busy windows; deconflicts against ourselves).
 *   2. External via ICS — Google/Outlook/Apple all expose a private "secret
 *      iCal address" per calendar. Configure CALENDAR_ICS_FEEDS as a JSON map
 *      { "person@co.com": "https://...ics" } and we fetch + parse real busy
 *      windows — no OAuth, no SDK. Gated: no-op when unset.
 *
 * MEETING LINKS (hands):
 *   generateMeetingLink() returns a real, working Jitsi room URL (no auth/API).
 *   buildIcs() produces a standards-compliant VEVENT a notifier can email.
 */
import { createHash } from "crypto";
import { prisma } from "./prisma.js";
import type { Logger } from "pino";

export interface BusyWindow { start: string; end: string }
export interface Participant { email: string; role: string; busyWindows?: BusyWindow[] }

// ── ICS parsing (minimal, dependency-free) ───────────────────────────────────
function icsToWindows(ics: string, rangeStart: Date, rangeEnd: Date): BusyWindow[] {
  const out: BusyWindow[] = [];
  const events = ics.split("BEGIN:VEVENT").slice(1);
  for (const ev of events) {
    const start = matchDt(ev, "DTSTART");
    const end = matchDt(ev, "DTEND");
    if (!start || !end) continue;
    if (end < rangeStart || start > rangeEnd) continue; // outside the window we care about
    out.push({ start: start.toISOString(), end: end.toISOString() });
  }
  return out;
}
function matchDt(block: string, key: string): Date | null {
  // Matches DTSTART:20260601T090000Z and DTSTART;TZID=...:20260601T090000
  const m = block.match(new RegExp(`${key}[^:\\n]*:([0-9TZ]+)`));
  if (!m) return null;
  const v = m[1]!;
  const iso = v.length >= 15
    ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}${v.endsWith("Z") ? "Z" : "Z"}`
    : `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T00:00:00Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function icsFeeds(): Record<string, string> {
  try {
    return JSON.parse(process.env["CALENDAR_ICS_FEEDS"] ?? "{}");
  } catch {
    return {};
  }
}

/**
 * Real busy windows per participant, merged from: request-provided windows +
 * the candidate's ATS interviews + external ICS feeds (when configured).
 */
export async function getBusyWindows(opts: {
  tenantId: string;
  candidateId?: string | null;
  participants: Participant[];
  rangeStart: string;
  rangeEnd: string;
  logger: Logger;
}): Promise<Record<string, BusyWindow[]>> {
  const { tenantId, candidateId, participants, logger } = opts;
  const rangeStart = new Date(opts.rangeStart);
  const rangeEnd = new Date(opts.rangeEnd);
  const result: Record<string, BusyWindow[]> = {};
  const feeds = icsFeeds();

  // The candidate's existing ATS interviews → busy (deconflict against ourselves).
  let candidateBusy: BusyWindow[] = [];
  if (candidateId) {
    const existing = await prisma.interview.findMany({
      where: {
        tenantId,
        candidateId,
        scheduledAt: { gte: rangeStart, lte: rangeEnd },
        status: { in: ["SCHEDULED", "CONFIRMED", "RESCHEDULED"] as any },
      },
      select: { scheduledAt: true, duration: true },
    });
    candidateBusy = existing
      .filter((e) => e.scheduledAt)
      .map((e) => ({
        start: e.scheduledAt!.toISOString(),
        end: new Date(e.scheduledAt!.getTime() + (e.duration ?? 60) * 60_000).toISOString(),
      }));
  }

  for (const p of participants) {
    const windows: BusyWindow[] = [...(p.busyWindows ?? [])];
    if (p.role === "candidate") windows.push(...candidateBusy);

    // External ICS feed for this email (real availability, no OAuth).
    const feedUrl = feeds[p.email.toLowerCase()];
    if (feedUrl) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(feedUrl, { signal: controller.signal });
        clearTimeout(t);
        if (res.ok) windows.push(...icsToWindows(await res.text(), rangeStart, rangeEnd));
      } catch (err) {
        logger.warn({ err, email: p.email }, "ICS feed fetch failed; ignoring");
      }
    }
    result[p.email] = windows;
  }
  return result;
}

/** Real, working meeting link — Jitsi rooms need no auth/API. */
export function generateMeetingLink(seed: string): string {
  const room = createHash("sha256").update(seed).digest("hex").slice(0, 24);
  const base = process.env["MEETING_BASE_URL"] ?? "https://meet.jit.si";
  return `${base}/cdc-ats-${room}`;
}

/** Standards-compliant single-event ICS a notifier can attach to an email. */
export function buildIcs(opts: {
  uid: string;
  title: string;
  start: string;
  end: string;
  organizerEmail: string;
  attendees: string[];
  meetingUrl: string;
  description?: string;
}): string {
  const dt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CDC ATS//Scheduling//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(opts.start)}`,
    `DTEND:${dt(opts.end)}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${(opts.description ?? "Interview").replace(/\n/g, "\\n")}\\nJoin: ${opts.meetingUrl}`,
    `LOCATION:${opts.meetingUrl}`,
    `ORGANIZER:mailto:${opts.organizerEmail}`,
    ...opts.attendees.map((a) => `ATTENDEE;RSVP=TRUE:mailto:${a}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
