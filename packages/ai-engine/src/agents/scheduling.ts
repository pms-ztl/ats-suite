/**
 * Scheduling Agent — picks optimal interview slots from pre-fetched
 * participant availability.
 *
 * Single-call: caller (interview-service) checks calendars and passes
 * the busy/free windows per participant. The agent ranks slots and
 * picks the best one or escalates to HITL.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

const ProposedSlotSchema = z.object({
  start: z.string().describe("Slot start time, ISO 8601"),
  end: z.string().describe("Slot end time, ISO 8601"),
  score: z.number().min(0).max(1).describe("Suitability 0-1"),
  availableParticipants: z.array(z.string()).describe("Emails of available participants"),
  conflicts: z.array(z.string()).describe("Emails of participants with conflicts"),
});

export const SchedulingOutputSchema = z.object({
  proposedSlots: z.array(ProposedSlotSchema).min(1).max(5),
  selectedSlot: z
    .object({ start: z.string(), end: z.string() })
    .nullable()
    .describe("Pre-selected best slot, or null if HITL needed"),
  reasoning: z.string().min(20),
});

export type SchedulingOutput = z.infer<typeof SchedulingOutputSchema>;

export interface SchedulingInput {
  participants: Array<{
    email: string;
    role: "interviewer" | "candidate" | "hiring_manager";
    busyWindows: Array<{ start: string; end: string }>;
  }>;
  durationMinutes: number;
  dateRange: { start: string; end: string };
  timezone: string;
  preferences?: {
    preferMorning?: boolean;
    avoidFridayAfternoon?: boolean;
    minimumNoticeDays?: number;
  };
}

const SYSTEM_PROMPT = `You are an interview scheduling assistant.

Your task: Find 1-5 optimal meeting slots considering:
- All participant availability (provided as busy windows per participant)
- Time zone preferences
- Optional preferences (preferMorning, avoidFridayAfternoon, minimumNoticeDays)

Rules:
1. A slot is "available" for a participant if it does NOT overlap any of their busy windows.
2. Score each slot 0-1 (1 = ideal):
   - +0.4 if ALL participants available
   - +0.2 if respects preferMorning
   - +0.2 if respects avoidFridayAfternoon
   - +0.2 if respects minimumNoticeDays
3. selectedSlot:
   - If the top slot has ALL participants available AND score ≥ 0.8: set it.
   - Otherwise set null (defer to human scheduler / HITL).
4. Always include conflicts list per slot (empty if no conflicts).
5. proposedSlots ordered by score descending.`;

function formatPrompt(input: SchedulingInput): string {
  const parts = input.participants
    .map((p) => {
      const busy = p.busyWindows.map((w) => `    ${w.start} → ${w.end}`).join("\n");
      return `- ${p.email} (${p.role})\n  busy windows:\n${busy || "    (none)"}`;
    })
    .join("\n");
  const prefs = input.preferences
    ? `\nPREFERENCES: ${JSON.stringify(input.preferences)}`
    : "";
  return `MEETING DURATION: ${input.durationMinutes} minutes
DATE RANGE: ${input.dateRange.start} → ${input.dateRange.end}
TIMEZONE: ${input.timezone}${prefs}

PARTICIPANTS:
${parts}

Propose interview slots.`;
}

registerAgent<SchedulingInput, SchedulingOutput>({
  name: "scheduling",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: SchedulingOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.15,
});

registerStub<SchedulingInput, SchedulingOutput>("scheduling", async (input) => {
  // Naive stub: propose 3 slots in the next 3 weekdays at 10am, 1pm, 3pm
  const start = new Date(input.dateRange.start);
  const slots: SchedulingOutput["proposedSlots"] = [];
  let day = 0;
  while (slots.length < 3 && day < 14) {
    const date = new Date(start);
    date.setDate(date.getDate() + day);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      day++;
      continue;
    }
    for (const hour of [10, 13, 15]) {
      if (slots.length >= 3) break;
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + input.durationMinutes * 60_000);
      const conflicts = input.participants
        .filter((p) =>
          p.busyWindows.some(
            (b) =>
              new Date(b.start) < slotEnd && new Date(b.end) > slotStart,
          ),
        )
        .map((p) => p.email);
      const available = input.participants
        .filter((p) => !conflicts.includes(p.email))
        .map((p) => p.email);
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        score: conflicts.length === 0 ? 1 : Math.max(0.2, 1 - conflicts.length / input.participants.length),
        availableParticipants: available,
        conflicts,
      });
    }
    day++;
  }
  slots.sort((a, b) => b.score - a.score);
  const top = slots[0];
  const selectedSlot =
    top && top.score >= 0.8 ? { start: top.start, end: top.end } : null;
  return {
    proposedSlots: slots.length > 0 ? slots : [{
      start: input.dateRange.start,
      end: new Date(new Date(input.dateRange.start).getTime() + input.durationMinutes * 60_000).toISOString(),
      score: 0,
      availableParticipants: [],
      conflicts: input.participants.map((p) => p.email),
    }],
    selectedSlot,
    reasoning: top
      ? selectedSlot
        ? `Stub selected slot with score ${top.score.toFixed(2)} — all participants available.`
        : `Stub deferred to HITL — best slot has score ${top.score.toFixed(2)}, conflicts exist.`
      : "No weekday slots fit in the date range — HITL required.",
  };
});
