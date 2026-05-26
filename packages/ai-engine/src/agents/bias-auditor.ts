/**
 * Bias Auditor Agent — interprets pre-computed adverse-impact data into an
 * EEOC-style compliance narrative.
 *
 * Single-call: caller (api-gateway) runs the SQL via candidate-service +
 * job-service, computes selection rates per group, and passes the raw
 * numbers into this agent. The agent never sees PII, only group counts.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export const BiasAuditorOutputSchema = z.object({
  reports: z
    .array(
      z.object({
        attribute: z.string().describe("Protected attribute (e.g. race, gender)"),
        stage: z.string().describe("Pipeline stage (e.g. SCREENED, INTERVIEW)"),
        groups: z
          .array(
            z.object({
              name: z.string(),
              applicants: z.number(),
              selected: z.number(),
              selectionRate: z.number(),
            }),
          )
          .min(1),
        adverseImpactRatio: z.number(),
        fourFifthsPass: z.boolean(),
        finding: z.string().describe("What this data shows"),
        recommendation: z.string().describe("Specific corrective action"),
      }),
    )
    .min(1),
  overallCompliance: z.boolean().describe("True if ALL reports pass 4/5ths"),
  narrative: z.string().min(50).describe("Human-readable compliance narrative"),
  methodology: z.string().describe("EEOC methodology description"),
  generatedAt: z.string().describe("ISO timestamp"),
});

export type BiasAuditorOutput = z.infer<typeof BiasAuditorOutputSchema>;

export interface BiasAuditorInput {
  /** Pre-computed per-attribute, per-stage stats from candidate-service SQL. */
  data: Array<{
    attribute: string;
    stage: string;
    groups: Array<{
      name: string;
      applicants: number;
      selected: number;
      selectionRate: number;
    }>;
    adverseImpactRatio: number;
    fourFifthsPass: boolean;
    highestRateGroup: string;
    lowestRateGroup: string;
  }>;
  timeRangeDays?: number;
}

const SYSTEM_PROMPT = `You are a compliance auditor specializing in employment law and the EEOC Uniform Guidelines on Employee Selection Procedures (29 CFR 1607).

Your role:
1. The 4/5ths rule numbers have ALREADY been computed via SQL and are provided in the input. Do NOT recalculate them.
2. Your job is to interpret the data and generate a clear narrative report.
3. Flag any groups where the adverse impact ratio is below 0.80.
4. Recommend specific actions to address disparities.
5. Document the methodology used (EEOC Uniform Guidelines, 29 CFR 1607).
6. NEVER fabricate demographic data — only use what is provided.

When generating the output:
- reports: Reflect the input data exactly. Map group data to the output format.
- overallCompliance: true ONLY if EVERY report has fourFifthsPass = true.
- narrative: Clear, professional compliance summary of findings, risks, and recommendations.
- methodology: Describe the EEOC 4/5ths rule methodology used.
- generatedAt: Use the current ISO timestamp.`;

function formatPrompt(input: BiasAuditorInput): string {
  const timeRange = input.timeRangeDays
    ? `\nTIME RANGE: last ${input.timeRangeDays} days`
    : "";
  const reports = input.data
    .map((d, i) => {
      const groups = d.groups
        .map(
          (g) =>
            `    - ${g.name}: ${g.selected}/${g.applicants} = ${(g.selectionRate * 100).toFixed(1)}%`,
        )
        .join("\n");
      return `Report ${i + 1}: attribute="${d.attribute}", stage="${d.stage}"
  Groups:
${groups}
  Adverse Impact Ratio: ${d.adverseImpactRatio.toFixed(3)}
  4/5ths Pass: ${d.fourFifthsPass}
  Highest rate group: ${d.highestRateGroup}, Lowest rate group: ${d.lowestRateGroup}`;
    })
    .join("\n\n");
  return `COMPLIANCE AUDIT INPUT${timeRange}

${reports}

Interpret the data and produce the compliance audit.`;
}

registerAgent<BiasAuditorInput, BiasAuditorOutput>({
  name: "bias-auditor",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: BiasAuditorOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.30,
});

registerStub<BiasAuditorInput, BiasAuditorOutput>("bias-auditor", async (input) => {
  const reports = input.data.map((d) => ({
    attribute: d.attribute,
    stage: d.stage,
    groups: d.groups.map((g) => ({
      name: g.name,
      applicants: g.applicants,
      selected: g.selected,
      selectionRate: g.selectionRate,
    })),
    adverseImpactRatio: d.adverseImpactRatio,
    fourFifthsPass: d.fourFifthsPass,
    finding: d.fourFifthsPass
      ? `${d.attribute} at ${d.stage}: passes 4/5ths rule (${d.adverseImpactRatio.toFixed(3)})`
      : `${d.attribute} at ${d.stage}: ADVERSE IMPACT — ratio ${d.adverseImpactRatio.toFixed(3)} below 0.80`,
    recommendation: d.fourFifthsPass
      ? "Continue monitoring; current selection process is within EEOC guidelines"
      : `Review screening criteria for bias against ${d.lowestRateGroup}; consider blind review`,
  }));
  const overallCompliance = reports.every((r) => r.fourFifthsPass);
  return {
    reports,
    overallCompliance,
    narrative: overallCompliance
      ? `All ${reports.length} audits pass the EEOC 4/5ths rule. The selection process appears equitable across analyzed attributes.`
      : `${reports.filter((r) => !r.fourFifthsPass).length} of ${reports.length} audits show potential adverse impact. Immediate review recommended.`,
    methodology:
      "EEOC Uniform Guidelines on Employee Selection Procedures (29 CFR 1607). Adverse impact ratio = (lowest group selection rate) / (highest group selection rate). 4/5ths rule passes when ratio ≥ 0.80.",
    generatedAt: new Date().toISOString(),
  };
});
