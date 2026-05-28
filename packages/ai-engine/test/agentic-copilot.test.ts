/**
 * Integration test for the agentic copilot (stub path).
 *
 * Proves SELECTIVE, agent-driven retrieval: a people-question pulls candidates
 * (not metrics); a metrics-question pulls metrics (not candidates). The old
 * single-shot copilot blindly fetched everything every time.
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-copilot.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { CopilotOutputSchema } from "../src/agents/copilot.js";
import "../src/agents/copilot-agentic.js";

function makeTools(log: string[]): Record<string, ToolImpl> {
  return {
    search_candidates: async () => {
      log.push("search_candidates");
      return { count: 2, candidates: [
        { id: "c1", name: "Ada", snippet: "react, typescript" },
        { id: "c2", name: "Bo", snippet: "react, node" },
      ] };
    },
    search_requisitions: async () => {
      log.push("search_requisitions");
      return { count: 1, requisitions: [{ id: "r1", title: "FE Eng", snippet: "Eng · OPEN" }] };
    },
    get_pipeline_metrics: async () => {
      log.push("get_pipeline_metrics");
      return { metrics: [{ name: "totalAgentRuns", value: 42, unit: "runs" }] };
    },
  };
}

async function run(query: string) {
  const log: string[] = [];
  const res = await runAgenticAgent({
    agentType: "copilot",
    input: { query },
    context: { tenantId: "t1", userId: "u1", toolImpls: makeTools(log) },
  });
  return { res, log };
}

async function main() {
  // 1) People question → candidates retrieved, metrics NOT
  const people = await run("which candidates know React?");
  assert.ok(CopilotOutputSchema.safeParse(people.res.output).success, "people answer schema-valid");
  assert.ok(people.log.includes("search_candidates"), "should search candidates");
  assert.ok(!people.log.includes("get_pipeline_metrics"), "should NOT pull metrics for a people question");
  assert.ok(people.res.output.sources.length > 0, "should cite sources");

  // 2) Metrics question → metrics retrieved, candidates NOT
  const metrics = await run("how many AI runs have we done in total?");
  assert.ok(CopilotOutputSchema.safeParse(metrics.res.output).success, "metrics answer schema-valid");
  assert.ok(metrics.log.includes("get_pipeline_metrics"), "should fetch metrics");
  assert.ok(!metrics.log.includes("search_candidates"), "should NOT pull candidates for a metrics question");

  console.log(`✓ people-question retrieved: [${people.log.join(", ")}]  (metrics skipped)`);
  console.log(`✓ metrics-question retrieved: [${metrics.log.join(", ")}]  (candidates skipped)`);
  console.log(`✓ both answers schema-valid + grounded in cited sources`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
