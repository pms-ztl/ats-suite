/**
 * Integration test for the agentic bias-auditor (stub path).
 * Proves: computes 4/5ths per attribute via a tool; flags the failing cohort (action).
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-bias.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { BiasAuditorOutputSchema } from "../src/agents/bias-auditor.js";
import "../src/agents/bias-auditor-agentic.js";

const flagged: any[] = [];
const tools: Record<string, ToolImpl> = {
  compute_adverse_impact: async (args: { groups: Array<{ name: string; applicants: number; selected: number }> }) => {
    const groups = args.groups.map((g) => ({ ...g, selectionRate: g.applicants ? g.selected / g.applicants : 0 }));
    const rates = groups.map((g) => g.selectionRate);
    const highest = Math.max(...rates);
    const lowest = Math.min(...rates);
    const ratio = highest > 0 ? lowest / highest : 1;
    const byRate = [...groups].sort((a, b) => b.selectionRate - a.selectionRate);
    return {
      groups,
      adverseImpactRatio: Number(ratio.toFixed(4)),
      fourFifthsPass: ratio >= 0.8,
      highestRateGroup: byRate[0].name,
      lowestRateGroup: byRate[byRate.length - 1].name,
    };
  },
  flag_compliance_violation: async (a: any) => {
    flagged.push(a);
    return { ok: true, flagged: true };
  },
};

async function main() {
  const res = await runAgenticAgent({
    agentType: "bias-auditor",
    input: {
      data: [
        // gender @ SCREENED: passes (0.9 ratio)
        { attribute: "gender", stage: "SCREENED", groups: [
          { name: "male", applicants: 100, selected: 50 },     // 0.50
          { name: "female", applicants: 100, selected: 45 },   // 0.45 → ratio 0.90 pass
        ] },
        // race @ INTERVIEW: FAILS (0.5 ratio)
        { attribute: "race", stage: "INTERVIEW", groups: [
          { name: "groupA", applicants: 100, selected: 40 },   // 0.40
          { name: "groupB", applicants: 100, selected: 20 },   // 0.20 → ratio 0.50 fail
        ] },
      ],
    },
    context: { tenantId: "t1", userId: "u1", toolImpls: tools },
  });

  assert.ok(BiasAuditorOutputSchema.safeParse(res.output).success, "audit schema-valid");
  assert.ok(res.toolsUsed.includes("compute_adverse_impact"), "should compute via tool");
  assert.ok(res.toolsUsed.includes("flag_compliance_violation"), "should flag the failing cohort");
  assert.equal(res.output.reports.length, 2, "one report per cohort");
  assert.equal(res.output.overallCompliance, false, "overall fails when any cohort fails");
  assert.equal(flagged.length, 1, "exactly the failing cohort flagged");
  assert.equal(flagged[0].attribute, "race", "the race/INTERVIEW cohort is the one flagged");

  console.log(`✓ schema-valid; tools used: ${res.toolsUsed.join(", ")}`);
  console.log(`✓ reports: ${res.output.reports.map((r) => `${r.attribute}@${r.stage}=${r.fourFifthsPass ? "pass" : "FAIL"}(${r.adverseImpactRatio})`).join(", ")}`);
  console.log(`✓ overallCompliance=${res.output.overallCompliance}`);
  console.log(`✓ action: flagged [${flagged.map((f) => f.attribute + "@" + f.stage).join(", ")}]`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
