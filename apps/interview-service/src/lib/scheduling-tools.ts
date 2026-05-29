/**
 * Tool IMPLEMENTATIONS for the agentic scheduling agent.
 *
 *   compute_candidate_slots → slot math vs REAL availability + per-participant
 *                             timezones (act)
 *   check_interviewer_load   → existing interviews that week        (MEMORY)
 *   book_interview           → create the Interview + meeting link + invite
 *                             event (ACTION with real downstream effect)
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";
import { prisma } from "./prisma.js";
import { getBusyWindows, generateMeetingLink, buildIcs, type BusyWindow } from "./calendar.js";

interface Participant {
  email: string;
  role: string;
  busyWindows?: BusyWindow[];
  timezone?: string; // IANA tz; falls back to the meeting timezone
}
interface Prefs {
  preferMorning?: boolean;
  avoidFridayAfternoon?: boolean;
  minimumNoticeDays?: number;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
/** Local hour-of-day for a UTC instant in a given IANA timezone. */
function localHour(date: Date, tz?: string): number {
  if (!tz) return date.getHours();
  try {
    return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(date), 10);
  } catch {
    return date.getHours();
  }
}

export function buildSchedulingTools(opts: {
  tenantId: string;
  userId: string | null;
  logger: Logger;
  participants: Participant[];
  durationMinutes: number;
  preferences?: Prefs;
  meetingTimezone?: string;
  candidateId?: string;
  requisitionId?: string;
  stage?: string;
}): Record<string, ToolImpl> {
  const { tenantId, logger, participants, durationMinutes, preferences } = opts;
  const meetingTz = opts.meetingTimezone;
  const WORK_START = 8, WORK_END = 19; // local working-hours window per participant

  return {
    compute_candidate_slots: async (args: { rangeStart: string; rangeEnd: string }) => {
      const rangeStart = new Date(args.rangeStart);
      const rangeEnd = new Date(args.rangeEnd);
      const now = Date.now();
      const minNoticeMs = (preferences?.minimumNoticeDays ?? 0) * 86400_000;

      // ── Pull REAL availability (ATS interviews + ICS feeds) and merge it in.
      const realBusy = await getBusyWindows({
        tenantId,
        candidateId: opts.candidateId ?? null,
        participants,
        rangeStart: args.rangeStart,
        rangeEnd: args.rangeEnd,
        logger,
      });
      const effective = participants.map((p) => ({
        ...p,
        tz: p.timezone ?? meetingTz,
        windows: realBusy[p.email] ?? p.busyWindows ?? [],
      }));

      const slots: Array<{
        start: string; end: string; score: number;
        availableParticipants: string[]; conflicts: string[]; offHoursParticipants: string[];
      }> = [];

      for (let d = new Date(rangeStart); d <= rangeEnd && slots.length < 40; d.setDate(d.getDate() + 1)) {
        const dow = d.getUTCDay();
        for (const hour of [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]) {
          const slotStart = new Date(d);
          slotStart.setUTCHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);
          if (slotStart.getTime() - now < minNoticeMs) continue;

          // Per-participant: conflict (busy overlap) or off-hours (outside 8-19 local)
          const conflicts: string[] = [];
          const offHours: string[] = [];
          for (const p of effective) {
            if (p.windows.some((w) => overlaps(slotStart, slotEnd, new Date(w.start), new Date(w.end)))) {
              conflicts.push(p.email);
              continue;
            }
            const lh = localHour(slotStart, p.tz);
            if (lh < WORK_START || lh >= WORK_END) offHours.push(p.email);
          }
          // Skip slots nobody could reasonably attend
          if (offHours.length === effective.length) continue;

          const available = effective.filter((p) => !conflicts.includes(p.email)).map((p) => p.email);

          let score = 0;
          score += conflicts.length === 0 ? 0.4 : Math.max(0, 0.4 * (available.length / effective.length));
          score += offHours.length === 0 ? 0.2 : Math.max(0, 0.2 * (1 - offHours.length / effective.length)); // tz fit
          if (preferences?.preferMorning) score += localHour(slotStart, meetingTz) < 12 ? 0.2 : 0;
          else score += 0.2;
          const meetingDow = new Date(slotStart).getUTCDay();
          if (!(preferences?.avoidFridayAfternoon && meetingDow === 5 && localHour(slotStart, meetingTz) >= 12)) score += 0.2;
          score = Math.min(1, Number(score.toFixed(2)));

          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            score,
            availableParticipants: available,
            conflicts,
            offHoursParticipants: offHours,
          });
        }
      }
      slots.sort((a, b) => b.score - a.score);
      return {
        count: slots.length,
        usedRealAvailability: Object.values(realBusy).some((w) => w.length > 0),
        slots: slots.slice(0, 10),
      };
    },

    check_interviewer_load: async (args: { aroundIso: string }) => {
      const around = new Date(args.aroundIso);
      const weekStart = startOfWeek(around);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400_000);
      const count = await prisma.interview.count({
        where: { tenantId, scheduledAt: { gte: weekStart, lt: weekEnd }, status: { in: ["SCHEDULED", "RESCHEDULED"] as any } },
      });
      return { weekStart: weekStart.toISOString(), interviewsThatWeek: count, heavilyBooked: count >= 15 };
    },

    book_interview: async (args: { start: string; end: string }) => {
      if (!opts.candidateId || !opts.requisitionId) {
        return { ok: false, error: "no candidate/requisition context — cannot book" };
      }
      try {
        const meetingUrl = generateMeetingLink(`${tenantId}:${opts.candidateId}:${args.start}`);
        const interview = await prisma.interview.create({
          data: {
            tenantId,
            requisitionId: opts.requisitionId,
            candidateId: opts.candidateId,
            stage: opts.stage ?? "INTERVIEW",
            status: "SCHEDULED",
            scheduledAt: new Date(args.start),
            duration: durationMinutes,
            meetingUrl,
            location: meetingUrl,
          },
        });

        const attendees = participants.map((p) => p.email);
        const organizer = participants.find((p) => p.role === "hiring_manager")?.email ?? participants[0]?.email ?? "noreply@cdc-ats.local";
        const ics = buildIcs({
          uid: `${interview.id}@cdc-ats`,
          title: `Interview — ${opts.stage ?? "INTERVIEW"}`,
          start: args.start,
          end: args.end,
          organizerEmail: organizer,
          attendees,
          meetingUrl,
        });

        // Real downstream effect: notification-service emails the invite + ICS.
        await publishEvent({
          subject: tenantSubject(tenantId, "interview", "scheduled"),
          type: "interview.scheduled",
          tenantId,
          payload: {
            tenantId,
            interviewId: interview.id,
            candidateId: opts.candidateId,
            requisitionId: opts.requisitionId,
            scheduledAt: args.start,
            endAt: args.end,
            durationMinutes,
            meetingUrl,
            attendees,
            organizer,
            ics,
            bookedByAgent: true,
          },
        }).catch((err) => logger.warn({ err }, "interview.scheduled publish failed (invite not sent)"));

        logger.info({ interviewId: interview.id, candidateId: opts.candidateId, meetingUrl }, "Scheduling agent booked + invited");
        return { ok: true, interviewId: interview.id, scheduledAt: args.start, meetingUrl, invitedAttendees: attendees.length };
      } catch (err) {
        logger.error({ err }, "book_interview failed");
        return { ok: false, error: "could not create interview" };
      }
    },
  };
}
