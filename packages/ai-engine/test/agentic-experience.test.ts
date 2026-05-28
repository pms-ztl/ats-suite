/**
 * Integration test for the agentic candidate-experience assistant (stub path).
 * Proves: looks up status via a tool; ESCALATES (real action) on trigger phrases.
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-experience.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { CandidateExperienceOutputSchema } from "../src/agents/candidate-experience.js";
import "../src/agents/candidate-experience-agentic.js";

const escalations: any[] = [];
function tools(log: string[]): Record<string, ToolImpl> {
  return {
    get_application_status: async () => {
      log.push("status");
      return { found: true, jobTitle: "Backend Engineer", stage: "INTERVIEW", status: "ACTIVE", appliedAt: "2026-05-01" };
    },
    get_faq_answer: async (a: { topic: string }) => {
      log.push("faq");
      return { found: true, answer: "interviews are typically 45-60 minutes." };
    },
    escalate_to_recruiter: async (a: any) => {
      log.push("escalate");
      escalations.push(a);
      return { ok: true, escalated: true, noteId: "note-1" };
    },
  };
}

async function run(message: string) {
  const log: string[] = [];
  const res = await runAgenticAgent({
    agentType: "candidate-experience",
    input: { candidateId: "c1", candidateName: "Ada", message },
    context: { tenantId: "t1", userId: null, toolImpls: tools(log) },
  });
  return { res, log };
}

async function main() {
  // status question → looks up status, does NOT escalate
  const status = await run("hi, what's the status of my application?");
  assert.ok(CandidateExperienceOutputSchema.safeParse(status.res.output).success, "status schema-valid");
  assert.ok(status.log.includes("status"), "should look up application status");
  assert.equal(status.res.output.shouldEscalate, false, "plain status question must not escalate");

  // frustrated + salary → escalates (action)
  const esc = await run("I'm really frustrated and want to talk to a manager about my salary");
  assert.ok(CandidateExperienceOutputSchema.safeParse(esc.res.output).success, "escalation schema-valid");
  assert.ok(esc.log.includes("escalate"), "should call escalate_to_recruiter");
  assert.equal(esc.res.output.shouldEscalate, true, "should flag escalation");
  assert.equal(escalations.length, 1, "exactly one escalation action fired");

  console.log(`✓ status question retrieved: [${status.log.join(", ")}]  escalate=${status.res.output.shouldEscalate}`);
  console.log(`✓ frustrated+salary retrieved: [${esc.log.join(", ")}]  escalate=${esc.res.output.shouldEscalate}`);
  console.log(`✓ action: ${escalations.length} escalation opened`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
