/**
 * Integration test for the agentic analytics agent (stub path).
 * Proves selective drill-down: a funnel question pulls the stage breakdown;
 * a cost question pulls AI usage. Both always pull the overview.
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-analytics.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { AnalyticsOutputSchema } from "../src/agents/analytics.js";
import "../src/agents/analytics-agentic.js";

function tools(log: string[]): Record<string, ToolImpl> {
  return {
    get_pipeline_overview: async () => {
      log.push("overview");
      return { openRequisitions: 4, totalCandidates: 120, activeApplications: 60, hiredApplications: 5 };
    },
    get_stage_breakdown: async () => {
      log.push("stages");
      return { applicationsByStage: { APPLIED: 40, SCREENED: 15, INTERVIEW: 5 } };
    },
    get_ai_usage: async () => {
      log.push("ai");
      return { aiDecisionsToday: 12, totalAgentRuns: 340, totalCostUsd: 8.5 };
    },
  };
}

async function run(query: string) {
  const log: string[] = [];
  const res = await runAgenticAgent({
    agentType: "analytics",
    input: { query },
    context: { tenantId: "t1", userId: "u1", toolImpls: tools(log) },
  });
  return { res, log };
}

async function main() {
  const funnel = await run("where is the biggest bottleneck in our funnel?");
  assert.ok(AnalyticsOutputSchema.safeParse(funnel.res.output).success, "funnel schema-valid");
  assert.ok(funnel.log.includes("overview"), "always pulls overview");
  assert.ok(funnel.log.includes("stages"), "funnel question pulls stage breakdown");
  assert.ok(!funnel.log.includes("ai"), "funnel question should NOT pull AI usage");

  const cost = await run("how much have we spent on AI and how many runs?");
  assert.ok(AnalyticsOutputSchema.safeParse(cost.res.output).success, "cost schema-valid");
  assert.ok(cost.log.includes("ai"), "cost question pulls AI usage");
  assert.ok(!cost.log.includes("stages"), "cost question should NOT pull stage breakdown");
  assert.ok(cost.res.output.insights.length >= 1, "produces insights");

  console.log(`✓ funnel question retrieved: [${funnel.log.join(", ")}]`);
  console.log(`✓ cost question retrieved: [${cost.log.join(", ")}]`);
  console.log(`✓ both schema-valid with cited insights`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
