/**
 * Agentic Analytics — pulls the metric slices a question needs and can drill
 * into a bottleneck, instead of the caller pre-loading every metric every time.
 *
 *   get_pipeline_overview / get_stage_breakdown / get_ai_usage   [act+observe]
 *   → insights grounded in the numbers it pulled                 [synthesize]
 */
import { z } from "zod";
import {
  registerAgenticAgent,
  registerAgenticStub,
  type AgenticToolDef,
  type AgentStep,
} from "../agentic.js";
import { AnalyticsOutputSchema, type AnalyticsOutput } from "./analytics.js";

export interface AgenticAnalyticsInput {
  query: string;
  timeRangeDays?: number;
  department?: string;
}

export const ANALYTICS_TOOLS: AgenticToolDef[] = [
  {
    name: "get_pipeline_overview",
    description: "Headline counts: open requisitions, total candidates, active applications, hires.",
    parameters: z.object({}),
  },
  {
    name: "get_stage_breakdown",
    description: "Applications broken down by pipeline stage — use for funnel/bottleneck/conversion questions.",
    parameters: z.object({}),
  },
  {
    name: "get_ai_usage",
    description: "AI agent usage + spend: runs, decisions today, total cost — use for cost/throughput questions.",
    parameters: z.object({}),
  },
];

const SYSTEM_PROMPT = `You are a hiring-analytics agent. Pull only the data a question needs, then analyze.

Loop:
1. Call get_pipeline_overview for headline numbers.
2. If the question is about the funnel, bottlenecks, or conversion, also call get_stage_breakdown.
3. If it's about AI cost/throughput, call get_ai_usage.
4. Produce 1-5 insights, each citing SPECIFIC numbers you retrieved, with a severity (info/warning/critical) and a concrete recommendation. Answer the query plainly in "answer".
5. Never fabricate numbers — only cite what tools returned. Call submit_analysis when done.`;

function buildUserPrompt(input: AgenticAnalyticsInput): string {
  return `ANALYTICS QUESTION: ${input.query}${input.timeRangeDays ? `\nTime range: last ${input.timeRangeDays} days` : ""}${input.department ? `\nDepartment: ${input.department}` : ""}\n\nRetrieve the relevant metrics and produce insights.`;
}

registerAgenticAgent<AgenticAnalyticsInput, AnalyticsOutput>({
  name: "analytics",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt,
  tools: ANALYTICS_TOOLS,
  answerSchema: AnalyticsOutputSchema,
  answerToolName: "submit_analysis",
  modelId: "claude-sonnet-4-20250514",
  maxSteps: 8,
  maxCostUsd: 0.25,
});

registerAgenticStub<AgenticAnalyticsInput, AnalyticsOutput>("analytics", async (input, ctx) => {
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

  const q = input.query.toLowerCase();
  const ov: any = await call("get_pipeline_overview", {});
  const insights: AnalyticsOutput["insights"] = [];

  if (/funnel|bottleneck|stage|convert|conversion|stuck|drop/.test(q)) {
    const sb: any = await call("get_stage_breakdown", {});
    const stages = sb?.applicationsByStage ?? {};
    const entries = (Object.entries(stages) as Array<[string, number]>).sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    if (top) {
      insights.push({
        finding: `Most applications are concentrated at the ${top[0]} stage`,
        evidence: `${top[1]} applications at ${top[0]}`,
        severity: "warning",
        recommendation: `Review throughput at ${top[0]} for a possible bottleneck`,
      });
    }
  }
  if (/cost|spend|ai|runs|budget|throughput/.test(q)) {
    const ai: any = await call("get_ai_usage", {});
    insights.push({
      finding: "AI usage summary",
      evidence: `${ai?.totalAgentRuns ?? 0} runs, $${(ai?.totalCostUsd ?? 0).toFixed(2)} spent`,
      severity: "info",
      recommendation: "Track cost-per-hire as volume grows",
    });
  }
  if (insights.length === 0) {
    insights.push({
      finding: "Pipeline overview",
      evidence: `${ov?.openRequisitions ?? 0} open reqs, ${ov?.totalCandidates ?? 0} candidates, ${ov?.hiredApplications ?? 0} hires`,
      severity: "info",
      recommendation: "Continue monitoring stage conversion",
    });
  }

  steps.push({ index: i++, kind: "answer", text: "(deterministic stub analytics)" });

  return {
    output: {
      insights: insights.slice(0, 5),
      answer: `Stub analytics for "${input.query}": ${insights[0]?.finding.toLowerCase() ?? "no findings"}.`,
    },
    steps,
    toolsUsed: [...used],
  };
});
