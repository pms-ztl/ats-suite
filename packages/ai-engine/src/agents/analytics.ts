/**
 * Analytics Agent — turns pre-loaded hiring metrics into actionable insights.
 *
 * Single-call: caller (api-gateway aggregator) pre-loads the metrics from
 * the relevant services so the LLM doesn't need tool access.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export const AnalyticsOutputSchema = z.object({
  insights: z
    .array(
      z.object({
        finding: z.string().min(10).describe("What was discovered"),
        evidence: z.string().describe("Specific numbers cited from the data"),
        severity: z.enum(["info", "warning", "critical"]),
        recommendation: z.string().describe("Concrete next action"),
      }),
    )
    .min(1)
    .max(5)
    .describe("1-5 insights ranked by severity"),
  metrics: z
    .array(
      z.object({
        name: z.string(),
        value: z.number(),
        unit: z.string(),
        trend: z.enum(["up", "down", "stable"]).optional(),
      }),
    )
    .optional(),
  answer: z.string().min(20).describe("Natural-language answer to the query"),
});

export type AnalyticsOutput = z.infer<typeof AnalyticsOutputSchema>;

export interface AnalyticsInput {
  query: string;
  metrics: {
    openRequisitions: number;
    totalCandidates: number;
    activeApplications: number;
    hiredApplications: number;
    avgTimeToHire?: number | null;
    offerAcceptRate?: number | null;
    applicationsByStage?: Record<string, number>;
    aiDecisionsToday?: number;
    totalAgentRuns?: number;
    totalCostUsd?: number;
  };
  timeRangeDays?: number;
  department?: string;
}

const SYSTEM_PROMPT = `You are an analytics expert for a hiring pipeline (Applicant Tracking System).

Your task: Analyze the provided hiring pipeline metrics and produce actionable insights.

Rules:
1. Focus on bottlenecks, conversion rates, time-to-hire trends, and source effectiveness.
2. Be data-driven — always cite specific numbers from the data provided.
3. Severity levels:
   - "info": Interesting observation, no action needed immediately.
   - "warning": Potential issue that should be monitored or addressed soon.
   - "critical": Significant problem requiring immediate attention (e.g., conversion drop >50%, TTH doubling).
4. Each insight must have a concrete, actionable recommendation.
5. Return between 1 and 5 insights, prioritized by severity.
6. The "answer" field must directly address the user's query in plain language.
7. If the data is insufficient to answer the query, say so explicitly and recommend what data to collect.
8. Never fabricate numbers — only use what is provided in the context.`;

function formatPrompt(input: AnalyticsInput): string {
  const m = input.metrics;
  const stageBreakdown = m.applicationsByStage
    ? Object.entries(m.applicationsByStage)
        .map(([s, c]) => `  - ${s}: ${c}`)
        .join("\n")
    : "  (no stage breakdown)";
  return `USER QUERY: ${input.query}
${input.timeRangeDays ? `TIME RANGE: last ${input.timeRangeDays} days` : ""}
${input.department ? `DEPARTMENT: ${input.department}` : ""}

PIPELINE METRICS:
- Open requisitions: ${m.openRequisitions}
- Total candidates: ${m.totalCandidates}
- Active applications: ${m.activeApplications}
- Hired applications: ${m.hiredApplications}
- Average time-to-hire: ${m.avgTimeToHire == null ? "no hires yet" : `${m.avgTimeToHire} days`}
- Offer accept rate: ${m.offerAcceptRate == null ? "no decisions yet" : `${m.offerAcceptRate}%`}
- AI decisions today: ${m.aiDecisionsToday ?? 0}
- Total agent runs (lifetime): ${m.totalAgentRuns ?? 0}
- Total AI cost (lifetime): $${(m.totalCostUsd ?? 0).toFixed(2)}

APPLICATIONS BY STAGE:
${stageBreakdown}

Analyze and produce insights.`;
}

registerAgent<AnalyticsInput, AnalyticsOutput>({
  name: "analytics",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: AnalyticsOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.30,
});

registerStub<AnalyticsInput, AnalyticsOutput>("analytics", async (input) => {
  const m = input.metrics;
  const insights: AnalyticsOutput["insights"] = [];

  if (m.openRequisitions === 0 && m.totalCandidates === 0) {
    insights.push({
      finding: "Pipeline is empty — no requisitions or candidates",
      evidence: `Open requisitions: ${m.openRequisitions}, total candidates: ${m.totalCandidates}`,
      severity: "info",
      recommendation: "Publish your first requisition to start the pipeline",
    });
  } else {
    if (m.activeApplications > 0 && m.hiredApplications === 0) {
      insights.push({
        finding: "Applications exist but no hires yet",
        evidence: `${m.activeApplications} active applications, 0 hires`,
        severity: "warning",
        recommendation: "Review the screening + interview stages — candidates may be stuck",
      });
    }
    if ((m.totalAgentRuns ?? 0) > 0 && (m.totalCostUsd ?? 0) > 0) {
      insights.push({
        finding: "AI agents are processing work",
        evidence: `${m.totalAgentRuns} agent runs, $${(m.totalCostUsd ?? 0).toFixed(2)} spent`,
        severity: "info",
        recommendation: "Monitor cost per hire as the pipeline matures",
      });
    }
    if (insights.length === 0) {
      insights.push({
        finding: "Pipeline is active with no immediate issues",
        evidence: `${m.openRequisitions} reqs, ${m.totalCandidates} candidates, ${m.hiredApplications} hires`,
        severity: "info",
        recommendation: "Continue monitoring conversion rates between stages",
      });
    }
  }

  return {
    insights,
    answer: `Stub analysis for query "${input.query}": ${insights[0]?.finding.toLowerCase() ?? "no findings"}.`,
  };
});
