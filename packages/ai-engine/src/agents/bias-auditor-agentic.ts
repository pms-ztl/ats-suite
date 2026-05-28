/**
 * Agentic Bias Auditor — computes the four-fifths math via a TOOL per attribute
 * instead of being handed the ratios, then flags violations.
 *
 *   compute_adverse_impact   → deterministic 4/5ths stats per attribute   [act]
 *   flag_compliance_violation→ raise a compliance flag on a failure     [ACTION]
 *
 * Privacy is preserved exactly as before: the agent only ever sees group COUNTS
 * (applicants/selected) — never PII. The single-shot version was handed the
 * pre-computed ratios; here the agent drives the computation + decision itself.
 */
import { z } from "zod";
import {
  registerAgenticAgent,
  registerAgenticStub,
  type AgenticToolDef,
  type AgentStep,
} from "../agentic.js";
import { BiasAuditorOutputSchema, type BiasAuditorOutput } from "./bias-auditor.js";

export interface AgenticBiasAuditorInput {
  /** Raw per-attribute, per-stage group COUNTS (no PII, no pre-computed ratios). */
  data: Array<{
    attribute: string;
    stage: string;
    groups: Array<{ name: string; applicants: number; selected: number }>;
  }>;
  timeRangeDays?: number;
}

export const BIAS_TOOLS: AgenticToolDef[] = [
  {
    name: "compute_adverse_impact",
    description:
      "Compute selection rates + the 4/5ths (80%) adverse-impact ratio for one attribute/stage's groups. Returns per-group rates, the ratio, and pass/fail. Call once per attribute/stage entry.",
    parameters: z.object({
      groups: z
        .array(z.object({ name: z.string(), applicants: z.number(), selected: z.number() }))
        .min(1),
    }),
  },
  {
    name: "flag_compliance_violation",
    description:
      "Raise a compliance flag when an attribute/stage FAILS the 4/5ths rule (ratio < 0.80). A compliance officer will review it.",
    parameters: z.object({
      attribute: z.string(),
      stage: z.string(),
      ratio: z.number(),
      reason: z.string(),
    }),
  },
];

const SYSTEM_PROMPT = `You are an EEOC compliance auditor (29 CFR 1607, Uniform Guidelines). You COMPUTE the numbers via tools — you never eyeball them.

Loop:
1. For EACH attribute/stage entry in the input, call compute_adverse_impact with its raw group counts. Use the returned rates + ratio; do not invent numbers.
2. If an entry FAILS the 4/5ths rule (ratio < 0.80), call flag_compliance_violation for it.
3. Build one report per entry mapping the computed group rates, ratio, and pass/fail, with a finding and a specific corrective recommendation.
4. overallCompliance = true ONLY if every entry passed. Write a professional narrative and document the methodology (EEOC Uniform Guidelines, 29 CFR 1607). Set generatedAt to the current ISO time.
5. Call submit_audit. Never fabricate demographic data — only the counts provided.`;

function buildUserPrompt(input: AgenticBiasAuditorInput): string {
  const lines = input.data
    .map(
      (d) =>
        `- ${d.attribute} @ ${d.stage}: ${d.groups.map((g) => `${g.name}(${g.selected}/${g.applicants})`).join(", ")}`,
    )
    .join("\n");
  return `Audit these selection cohorts${input.timeRangeDays ? ` (last ${input.timeRangeDays} days)` : ""}:\n${lines}\n\nCompute adverse impact for each, flag failures, and submit your audit.`;
}

registerAgenticAgent<AgenticBiasAuditorInput, BiasAuditorOutput>({
  name: "bias-auditor",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt,
  tools: BIAS_TOOLS,
  answerSchema: BiasAuditorOutputSchema,
  answerToolName: "submit_audit",
  modelId: "claude-sonnet-4-20250514",
  maxSteps: 12,
  maxCostUsd: 0.3,
});

registerAgenticStub<AgenticBiasAuditorInput, BiasAuditorOutput>("bias-auditor", async (input, ctx) => {
  const steps: AgentStep[] = [];
  const used = new Set<string>();
  let i = 0;
  const call = async (name: string, args: any) => {
    used.add(name);
    steps.push({ index: i++, kind: "tool_call", toolName: name, args });
    const impl = ctx.toolImpls[name];
    let obs: any = { error: "no impl" };
    let ok = false;
    if (impl) {
      try {
        obs = await impl(args, ctx);
        ok = true;
      } catch (e) {
        obs = { error: e instanceof Error ? e.message : String(e) };
      }
    }
    steps.push({
      index: i++,
      kind: "observation",
      toolName: name,
      observation: typeof obs === "string" ? obs : JSON.stringify(obs).slice(0, 600),
      ok,
    });
    return obs;
  };

  const reports: BiasAuditorOutput["reports"] = [];
  let allPass = true;
  for (const entry of input.data) {
    const r: any = await call("compute_adverse_impact", { groups: entry.groups });
    const pass = !!r?.fourFifthsPass;
    if (!pass) {
      allPass = false;
      await call("flag_compliance_violation", {
        attribute: entry.attribute,
        stage: entry.stage,
        ratio: r?.adverseImpactRatio ?? 0,
        reason: `4/5ths failure: ratio ${(r?.adverseImpactRatio ?? 0).toFixed(2)} < 0.80`,
      });
    }
    reports.push({
      attribute: entry.attribute,
      stage: entry.stage,
      groups: r?.groups ?? entry.groups.map((g) => ({ ...g, selectionRate: g.applicants ? g.selected / g.applicants : 0 })),
      adverseImpactRatio: r?.adverseImpactRatio ?? 0,
      fourFifthsPass: pass,
      finding: pass
        ? `${entry.attribute} at ${entry.stage} passes the 4/5ths rule (ratio ${(r?.adverseImpactRatio ?? 0).toFixed(2)}).`
        : `${entry.attribute} at ${entry.stage} FAILS the 4/5ths rule (ratio ${(r?.adverseImpactRatio ?? 0).toFixed(2)}).`,
      recommendation: pass
        ? "No action required; continue monitoring."
        : `Investigate the ${entry.stage} step for ${entry.attribute}; review criteria for job-relatedness.`,
    });
  }

  steps.push({ index: i++, kind: "answer", text: "(deterministic stub audit)" });

  return {
    output: {
      reports: reports.length ? reports : [
        {
          attribute: "n/a", stage: "n/a", groups: [{ name: "n/a", applicants: 0, selected: 0, selectionRate: 0 }],
          adverseImpactRatio: 1, fourFifthsPass: true, finding: "No cohort data provided.", recommendation: "Provide selection data to audit.",
        },
      ],
      overallCompliance: allPass,
      narrative: `Stub audit of ${input.data.length} cohort(s): ${allPass ? "all passed the 4/5ths rule." : "one or more groups show adverse impact and were flagged."}`,
      methodology: "EEOC Uniform Guidelines on Employee Selection Procedures (29 CFR 1607), four-fifths rule.",
      generatedAt: new Date().toISOString(),
    },
    steps,
    toolsUsed: [...used],
  };
});
