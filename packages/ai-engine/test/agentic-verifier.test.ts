/**
 * Integration test for the agentic resume-verifier (stub path).
 * Proves: verifies claims via find_evidence, runs date-consistency, corroborates
 * GitHub, and produces a trust score — i.e. parsing now fact-checks itself.
 *
 * Run:  npx tsx packages/ai-engine/test/agentic-verifier.test.ts
 */
import assert from "node:assert/strict";
import { runAgenticAgent, type ToolImpl } from "../src/agentic.js";
import { ResumeVerificationSchema } from "../src/agents/resume-verifier-agentic.js";
import "../src/agents/resume-verifier-agentic.js";

const tools: Record<string, ToolImpl> = {
  find_evidence_in_resume: async (args: { query: string }) => {
    if (args.query === "__top_skills__") {
      return { perClaim: [
        { claim: "TypeScript", found: true, snippet: "…6 years of TypeScript…" },
        { claim: "Kubernetes", found: false, snippet: null }, // claimed but unsupported
        { claim: "Senior Engineer", found: true, snippet: "…Senior Backend Engineer…" },
      ] };
    }
    return { found: true, coverage: 0.8, snippet: "…match…" };
  },
  check_date_consistency: async () => ({ positionsAnalyzed: 3, anomalies: ["~14-month gap between Acme and Globex."] }),
  lookup_github: async (a: { handle: string }) => ({ found: true, summary: `Public GitHub @${a.handle}: 30 repos, languages: TypeScript, Go.` }),
};

async function main() {
  const res = await runAgenticAgent({
    agentType: "resume-verifier",
    input: { candidateId: "c1", resumeId: "r1", githubHandle: "adalovelace" },
    context: { tenantId: "t1", userId: "u1", toolImpls: tools },
  });

  assert.ok(ResumeVerificationSchema.safeParse(res.output).success, "verification schema-valid");
  for (const t of ["find_evidence_in_resume", "check_date_consistency", "lookup_github"]) {
    assert.ok(res.toolsUsed.includes(t), `expected tool used: ${t}`);
  }
  // Unsupported Kubernetes claim should appear; date gap should be a red flag.
  assert.ok(res.output.findings.some((f) => f.status === "unsupported"), "should mark the unsupported claim");
  assert.ok(res.output.redFlags.length >= 1, "date gap should surface as a red flag");
  assert.ok(res.output.trustScore >= 0 && res.output.trustScore <= 100, "trustScore in range");

  console.log(`✓ schema-valid; tools used: ${res.toolsUsed.join(", ")}`);
  console.log(`✓ findings: ${res.output.findings.map((f) => `${f.claim}=${f.status}`).join(", ")}`);
  console.log(`✓ redFlags: ${res.output.redFlags.join(" | ")}`);
  console.log(`✓ trustScore: ${res.output.trustScore}`);
  console.log("\nALL ASSERTIONS PASSED ✅");
}

main().catch((err) => { console.error("\n❌ TEST FAILED:", err.message); process.exit(1); });
