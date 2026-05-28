/**
 * Tool IMPLEMENTATIONS for the agentic scheduling agent.
 *
 *   compute_candidate_slots → deterministic slot math vs busy windows (act)
 *   check_interviewer_load   → existing interviews that week        (MEMORY)
 *   book_interview           → create the real Interview row        (ACTION)
 *
 * The factory closes over the request body (participants/duration/prefs +
 * optional candidate/req context) so the agent's tool args stay minimal.
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";

interface Participant {
  email: string;
  role: string;
  busyWindows: Array<{ start: string; end: string }>;
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
  const day = x.getDay(); // 0 Sun
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

export function buildSchedulingTools(opts: {
  tenantId: string;
  userId: string | null;
  logger: Logger;
  participants: Participant[];
  durationMinutes: number;
  preferences?: Prefs;
  candidateId?: string;
  requisitionId?: string;
  stage?: string;
}): Record<string, ToolImpl> {
  const { tenantId, logger, participants, durationMinutes, preferences } = opts;

  return {
    compute_candidate_slots: async (args: { rangeStart: string; rangeEnd: string }) => {
      const rangeStart = new Date(args.rangeStart);
      const rangeEnd = new Date(args.rangeEnd);
      const now = Date.now();
      const minNoticeMs = (preferences?.minimumNoticeDays ?? 0) * 86400_000;
      const slots: Array<{
        start: string;
        end: string;
        score: number;
        availableParticipants: string[];
        conflicts: string[];
      }> = [];

      for (let d = new Date(rangeStart); d <= rangeEnd && slots.length < 40; d.setDate(d.getDate() + 1)) {
        const dow = d.getDay();
        if (dow === 0 || dow === 6) continue; // weekdays only
        for (const hour of [9, 10, 11, 13, 14, 15, 16]) {
          const slotStart = new Date(d);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);
          if (slotStart.getTime() - now < minNoticeMs) continue;

          const conflicts = participants
            .filter((p) =>
              p.busyWindows.some((w) => overlaps(slotStart, slotEnd, new Date(w.start), new Date(w.end))),
            )
            .map((p) => p.email);
          const available = participants.filter((p) => !conflicts.includes(p.email)).map((p) => p.email);

          let score = 0;
          if (conflicts.length === 0) score += 0.4;
          else score += Math.max(0, 0.4 * (available.length / participants.length));
          if (preferences?.preferMorning && hour < 12) score += 0.2;
          else if (!preferences?.preferMorning) score += 0.2; // no morning pref → neutral credit
          if (!(preferences?.avoidFridayAfternoon && dow === 5 && hour >= 12)) score += 0.2;
          score += 0.2; // notice already enforced above
          score = Math.min(1, Number(score.toFixed(2)));

          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            score,
            availableParticipants: available,
            conflicts,
          });
        }
      }
      slots.sort((a, b) => b.score - a.score);
      return { count: slots.length, slots: slots.slice(0, 10) };
    },

    check_interviewer_load: async (args: { aroundIso: string }) => {
      const around = new Date(args.aroundIso);
      const weekStart = startOfWeek(around);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400_000);
      const count = await prisma.interview.count({
        where: {
          tenantId,
          scheduledAt: { gte: weekStart, lt: weekEnd },
          status: { in: ["SCHEDULED", "RESCHEDULED"] as any },
        },
      });
      return {
        weekStart: weekStart.toISOString(),
        interviewsThatWeek: count,
        heavilyBooked: count >= 15,
      };
    },

    book_interview: async (args: { start: string; end: string }) => {
      if (!opts.candidateId || !opts.requisitionId) {
        return { ok: false, error: "no candidate/requisition context — cannot book" };
      }
      try {
        const interview = await prisma.interview.create({
          data: {
            tenantId,
            requisitionId: opts.requisitionId,
            candidateId: opts.candidateId,
            stage: opts.stage ?? "INTERVIEW",
            status: "SCHEDULED",
            scheduledAt: new Date(args.start),
            duration: durationMinutes,
          },
        });
        logger.info(
          { interviewId: interview.id, candidateId: opts.candidateId, scheduledAt: args.start },
          "Scheduling agent booked an interview",
        );
        return { ok: true, interviewId: interview.id, scheduledAt: args.start };
      } catch (err) {
        logger.error({ err }, "book_interview failed");
        return { ok: false, error: "could not create interview" };
      }
    },
  };
}
