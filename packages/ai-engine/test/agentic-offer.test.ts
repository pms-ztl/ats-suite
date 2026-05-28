/**
 * Integration test for the agentic offer agent (stub path).
 * Proves: gathers band+market+signal via tools; flags an out-of-band exception (action).
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-offer.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { OfferOutputSchema } from "../src/agents/offer.js";
import "../src/agents/offer-agentic.js";

const flags: any[] = [];
function tools(log: string[]): Record<string, ToolImpl> {
  return {
    get_comp_band: async () => {
      log.push("band");
      return { found: true, min: 100000, mid: 130000, max: 160000, currency: "USD" };
    },
    get_market_rate: async () => {
      log.push("market");
      return { modeled: true, p25: 120000, p50: 135000, p75: 155000, currency: "USD" };
    },
    get_candidate_signal: async () => {
      log.push("signal");
      return { signal: "STRONG_HIRE" };
    },
    flag_compensation_exception: async (a: any) => {
      log.push("flag");
      flags.push(a);
      return { ok: true, flagged: true, noteId: "n1" };
    },
  };
}

async function run(input: any) {
  const log: string[] = [];
  const res = await runAgenticAgent({
    agentType: "offer",
    input: { applicationId: "app-1", ...input },
    context: { tenantId: "t1", userId: "u1", toolImpls: tools(log) },
  });
  return { res, log };
}

async function main() {
  // STRONG_HIRE, no crazy expectation → within band, no exception
  const normal = await run({});
  assert.ok(OfferOutputSchema.safeParse(normal.res.output).success, "offer schema-valid");
  for (const t of ["band", "market", "signal"]) assert.ok(normal.log.includes(t), `should call get_${t}`);
  assert.ok(normal.res.output.baseSalary <= 160000, "base within band max");
  assert.ok(["at_mid", "above_mid"].includes(normal.res.output.compBandPosition), "STRONG_HIRE positions at/above mid");
  assert.ok(!normal.log.includes("flag"), "no exception for in-band offer");

  // Expectation way over band max → exception flagged (action)
  const over = await run({ candidateExpectation: 220000 });
  assert.ok(OfferOutputSchema.safeParse(over.res.output).success, "over-band offer schema-valid");
  assert.ok(over.log.includes("flag"), "should flag out-of-band exception");
  assert.equal(flags.length, 1, "exactly one comp exception flagged");
  assert.ok(over.res.output.baseSalary <= 160000, "still clamped to band max");

  console.log(`✓ normal offer retrieved: [${normal.log.join(", ")}]  position=${normal.res.output.compBandPosition} base=$${normal.res.output.baseSalary}`);
  console.log(`✓ over-band offer retrieved: [${over.log.join(", ")}]  exception flagged, base clamped to $${over.res.output.baseSalary}`);
  console.log(`✓ action: ${flags.length} compensation exception opened`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  process.exit(1);
});
