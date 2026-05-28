/**
 * Integration test for the agentic sourcing agent's ReAct loop (stub path).
 *
 * Proves the pattern generalizes to a second agent / service:
 *   • the agent runs MULTIPLE search strategies (broadens when too few hits)
 *   • verifies each match via get_candidate_detail
 *   • SKIPS a candidate already engaged for this req (check_prior_engagement = memory)
 *   • takes the shortlist_candidate ACTION on a strong match
 *   • returns a schema-valid ranked shortlist
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-sourcing.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { AgenticSourcingSchema } from "../src/agents/sourcing-agentic.js";
import "../src/agents/sourcing-agentic.js"; // register agent + stub

// ── In-memory pool ───────────────────────────────────────────────────────────
const POOL = [
  { id: "ada", name: "Ada", skills: ["react", "typescript", "graphql"], summary: "frontend engineer" },
  { id: "bob", name: "Bob", skills: ["react", "typescript"], summary: "ui developer" },
  // Cleo matches only the broadened TITLE search (no requirement skills), and is
  // already engaged for this req → exercises both broaden + memory-skip.
  { id: "cleo", name: "Cleo", skills: ["vue"], summary: "senior frontend engineer" },
];
const ENGAGED = new Set(["cleo:req-1"]);
const shortlisted: string[] = [];

const toolImpls: Record<string, ToolImpl> = {
  search_candidates: async (args: { skills?: string[]; titleKeywords?: string[]; limit?: number }) => {
    const skills = (args.skills ?? []).map((s) => s.toLowerCase());
    const kws = (args.titleKeywords ?? []).map((s) => s.toLowerCase());
    const hits = POOL.filter((c) => {
      const skillHit = skills.some((s) => c.skills.includes(s));
      const kwHit = kws.some((k) => c.summary.includes(k));
      return skillHit || kwHit;
    });
    return {
      count: hits.length,
      candidates: hits.map((c) => ({ id: c.id, name: c.name, skills: c.skills, source: "database" })),
    };
  },
  get_candidate_detail: async (args: { candidateId: string }) => {
    const c = POOL.find((x) => x.id === args.candidateId);
    return c ? { found: true, name: c.name, skills: c.skills, summary: c.summary } : { found: false };
  },
  check_prior_engagement: async (args: { candidateId: string; requisitionId: string }) => ({
    alreadyEngaged: ENGAGED.has(`${args.candidateId}:${args.requisitionId}`),
  }),
  shortlist_candidate: async (args: { candidateId: string }) => {
    shortlisted.push(args.candidateId);
    return { ok: true, shortlisted: true };
  },
};

async function main() {
  const res = await runAgenticAgent({
    agentType: "sourcing",
    input: {
      requisitionId: "req-1",
      jobTitle: "Frontend Engineer",
      department: "Engineering",
      requirements: ["react", "typescript", "graphql"],
    },
    context: { tenantId: "t1", userId: "u1", toolImpls },
  });

  // 1) schema-valid
  assert.ok(AgenticSourcingSchema.safeParse(res.output).success, "verdict must conform to schema");

  // 2) used the search + verify + memory + action tools
  for (const t of ["search_candidates", "get_candidate_detail", "check_prior_engagement", "shortlist_candidate"]) {
    assert.ok(res.toolsUsed.includes(t), `expected tool used: ${t}`);
  }

  // 3) broadened: more than one distinct search strategy
  assert.ok(
    res.output.searchStrategiesUsed.length >= 2,
    `expected >=2 search strategies, got ${res.output.searchStrategiesUsed.length}`,
  );

  // 4) memory: Cleo was engaged → excluded from results
  const ids = res.output.candidates.map((c) => c.id);
  assert.ok(!ids.includes("cleo"), "engaged candidate (cleo) must be skipped");

  // 5) action: Ada (3/3) shortlisted
  const ada = res.output.candidates.find((c) => c.id === "ada");
  assert.ok(ada, "Ada should be returned");
  assert.equal(ada?.shortlisted, true, "Ada should be shortlisted");
  assert.ok(shortlisted.includes("ada"), "shortlist action should have fired for Ada");

  console.log(`✓ schema-valid; tools used: ${res.toolsUsed.join(", ")}`);
  console.log(`✓ search strategies (broadened): ${res.output.searchStrategiesUsed.join("  |  ")}`);
  console.log(`✓ memory: engaged candidate 'cleo' skipped`);
  console.log(`✓ ranked: ${res.output.candidates.map((c) => `${c.name}=${c.matchScore.toFixed(2)}${c.shortlisted ? "*" : ""}`).join(", ")}`);
  console.log(`✓ action: shortlisted [${shortlisted.join(", ")}]`);
  console.log(`✓ trace: ${res.steps.length} steps`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
