/**
 * Integration test for the agentic screener's ReAct loop.
 *
 * Runs the deterministic STUB path (no API key needed), but the stub genuinely
 * drives the injected tools — so this proves the agentic wiring end-to-end:
 *   • tools are actually called (perceive → investigate)
 *   • per-requirement evidence is gathered (act → observe)
 *   • a full step trace is captured (working memory / audit)
 *   • a borderline candidate triggers the flag_for_human_review ACTION
 *   • the final verdict conforms to the schema
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-screener.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { AgenticScreeningSchema } from "../src/agents/screener-agentic.js";
import "../src/agents/screener-agentic.js"; // side-effect: register agent + stub

// ── In-memory fixtures ───────────────────────────────────────────────────────
const REQUIREMENTS = ["5+ years React", "AWS production deployment", "GraphQL API design"];
// Resume mentions React + AWS, but NOT GraphQL → 2/3 met → borderline REVIEW.
const RESUME_TEXT = `
Senior Frontend Engineer. Built large React applications for 6 years.
Deployed production services on AWS (ECS, Lambda, S3). Led a team of 4.
`.toLowerCase();

const flagCalls: any[] = [];

const toolImpls: Record<string, ToolImpl> = {
  get_job_requirements: async () => ({
    found: true,
    title: "Senior Frontend Engineer",
    department: "Engineering",
    requirements: REQUIREMENTS,
    requirementCount: REQUIREMENTS.length,
  }),
  get_candidate_profile: async () => ({
    found: true,
    skills: ["React", "AWS", "TypeScript"],
    hasResumeText: true,
    resumeTextLength: RESUME_TEXT.length,
    parseStatus: "COMPLETED",
  }),
  find_evidence_in_resume: async (args: { query: string }) => {
    const words = args.query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const matched = words.filter((w) => RESUME_TEXT.includes(w));
    const coverage = words.length ? matched.length / words.length : 0;
    return {
      found: coverage >= 0.5,
      coverage,
      matchedTerms: matched,
      snippet: coverage >= 0.5 ? "…built large react applications…aws…" : null,
    };
  },
  lookup_past_screenings: async () => ({ count: 0, note: "first candidate", passBar: 70 }),
  flag_for_human_review: async (args: any) => {
    flagCalls.push(args);
    return { ok: true, taskOpened: true, severity: args.severity };
  },
};

// ── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  const res = await runAgenticAgent({
    agentType: "candidate-screener",
    input: {
      candidateId: "cand-test-1",
      requisitionId: "req-test-1",
      jobTitle: "Senior Frontend Engineer",
    },
    context: { tenantId: "tenant-test", userId: "user-test", toolImpls },
  });

  // 1) Verdict conforms to schema
  const parsed = AgenticScreeningSchema.safeParse(res.output);
  assert.ok(parsed.success, "verdict must conform to AgenticScreeningSchema");

  // 2) The agent actually used its investigation tools (perceive + act)
  for (const t of ["get_job_requirements", "get_candidate_profile", "find_evidence_in_resume"]) {
    assert.ok(res.toolsUsed.includes(t), `expected tool used: ${t}`);
  }

  // 3) A trace was captured with tool_call + observation pairs
  const toolCalls = res.steps.filter((s) => s.kind === "tool_call").length;
  const observations = res.steps.filter((s) => s.kind === "observation").length;
  assert.ok(toolCalls >= 4, `expected >=4 tool_call steps, got ${toolCalls}`);
  assert.equal(toolCalls, observations, "every tool_call must have an observation");

  // 4) Per-requirement findings: React + AWS met, GraphQL not
  const findings = res.output.requirementFindings;
  assert.equal(findings.length, REQUIREMENTS.length, "one finding per requirement");
  const graphql = findings.find((f) => f.requirement.includes("GraphQL"));
  assert.equal(graphql?.met, false, "GraphQL should be unmet (not in resume)");
  const react = findings.find((f) => f.requirement.includes("React"));
  assert.equal(react?.met, true, "React should be met");

  // 5) 2/3 met → score 67 → REVIEW, borderline → flag action fired
  assert.equal(res.output.result, "REVIEW", `expected REVIEW, got ${res.output.result}`);
  assert.equal(res.output.escalatedToHuman, true, "borderline should escalate to human");
  assert.equal(flagCalls.length, 1, "flag_for_human_review should fire exactly once");

  console.log("✓ verdict conforms to schema");
  console.log(`✓ tools used: ${res.toolsUsed.join(", ")}`);
  console.log(`✓ trace captured: ${res.steps.length} steps (${toolCalls} tool calls)`);
  console.log(`✓ per-requirement findings: ${findings.map((f) => `${f.requirement}=${f.met}`).join("; ")}`);
  console.log(`✓ verdict: ${res.output.result} score=${res.output.score} conf=${res.output.confidence}`);
  console.log(`✓ autonomous action: flag_for_human_review fired (severity=${flagCalls[0].severity})`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
