/**
 * Integration test for the agentic scheduling agent's ReAct loop (stub path).
 *
 * Proves: the agent computes slots, WIDENS the range when the first window has
 * conflicts, checks interviewer load (memory), and BOOKS the interview (action).
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-scheduling.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { AgenticSchedulingSchema } from "../src/agents/scheduling-agentic.js";
import "../src/agents/scheduling-agentic.js";

const ORIG_END = "2026-06-02T00:00:00.000Z";
const booked: any[] = [];
let computeCalls = 0;
let loadChecks = 0;

const toolImpls: Record<string, ToolImpl> = {
  compute_candidate_slots: async (args: { rangeStart: string; rangeEnd: string }) => {
    computeCalls++;
    // Original range → only a conflicted slot; widened range → an all-free slot.
    if (new Date(args.rangeEnd) <= new Date(ORIG_END)) {
      return {
        count: 1,
        slots: [
          {
            start: "2026-06-01T17:00:00.000Z",
            end: "2026-06-01T18:00:00.000Z",
            score: 0.6,
            availableParticipants: ["interviewer@co.com"],
            conflicts: ["cand@x.com"],
          },
        ],
      };
    }
    return {
      count: 1,
      slots: [
        {
          start: "2026-06-04T17:00:00.000Z",
          end: "2026-06-04T18:00:00.000Z",
          score: 1.0,
          availableParticipants: ["interviewer@co.com", "cand@x.com"],
          conflicts: [],
        },
      ],
    };
  },
  check_interviewer_load: async () => {
    loadChecks++;
    return { interviewsThatWeek: 3, heavilyBooked: false };
  },
  book_interview: async (args: { start: string; end: string }) => {
    const id = `intv-${booked.length + 1}`;
    booked.push({ id, ...args });
    return { ok: true, interviewId: id, scheduledAt: args.start };
  },
};

async function main() {
  const res = await runAgenticAgent({
    agentType: "scheduling",
    input: {
      participants: [
        { email: "interviewer@co.com", role: "interviewer", busyWindows: [] },
        { email: "cand@x.com", role: "candidate", busyWindows: [{ start: "2026-06-01T17:00:00.000Z", end: "2026-06-01T18:00:00.000Z" }] },
      ],
      durationMinutes: 60,
      dateRange: { start: "2026-06-01T00:00:00.000Z", end: ORIG_END },
      timezone: "UTC",
      candidateId: "cand-1",
      requisitionId: "req-1",
      stage: "INTERVIEW",
    },
    context: { tenantId: "t1", userId: "u1", toolImpls },
  });

  assert.ok(AgenticSchedulingSchema.safeParse(res.output).success, "verdict must conform to schema");
  for (const t of ["compute_candidate_slots", "check_interviewer_load", "book_interview"]) {
    assert.ok(res.toolsUsed.includes(t), `expected tool used: ${t}`);
  }
  assert.ok(computeCalls >= 2, `expected the agent to widen (>=2 compute calls), got ${computeCalls}`);
  assert.equal(loadChecks, 1, "should check interviewer load once");
  assert.equal(res.output.booked, true, "should have booked");
  assert.ok(res.output.bookedInterviewId, "bookedInterviewId should be set");
  assert.equal(booked.length, 1, "exactly one interview booked");

  console.log(`✓ schema-valid; tools used: ${res.toolsUsed.join(", ")}`);
  console.log(`✓ widened range: ${computeCalls} compute calls`);
  console.log(`✓ memory: interviewer load checked`);
  console.log(`✓ action: booked interview ${res.output.bookedInterviewId} at ${res.output.selectedSlot?.start}`);
  console.log(`✓ trace: ${res.steps.length} steps`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
