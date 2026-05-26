/**
 * Copilot Agent — recruiter assistant that answers natural-language queries
 * about the hiring pipeline.
 *
 * Single-call: caller (api-gateway) pre-searches candidates, requisitions,
 * and metrics relevant to the query and passes them in as context. The
 * agent synthesizes a natural-language answer with cited sources.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export const CopilotOutputSchema = z.object({
  answer: z.string().min(1).max(3000),
  sources: z
    .array(
      z.object({
        type: z.enum(["candidate", "requisition", "interview", "metric", "policy"]),
        id: z.string(),
        snippet: z.string().max(200),
      }),
    )
    .max(10),
  suggestedActions: z
    .array(
      z.object({
        label: z.string(),
        type: z.enum(["navigate", "filter", "export", "schedule", "create"]),
        payload: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .max(5)
    .optional(),
  confidence: z.number().min(0).max(1),
  followUpQuestions: z.array(z.string()).max(3).optional(),
});

export type CopilotOutput = z.infer<typeof CopilotOutputSchema>;

export interface CopilotInput {
  query: string;
  /** Search hits relevant to the query, fetched by the caller. */
  searchResults: {
    candidates?: Array<{ id: string; name: string; snippet: string }>;
    requisitions?: Array<{ id: string; title: string; snippet: string }>;
    interviews?: Array<{ id: string; description: string; snippet: string }>;
    metrics?: Array<{ name: string; value: number; unit?: string }>;
  };
  context?: {
    currentPage?: string;
    selectedEntities?: Array<{ type: string; id: string }>;
  };
}

const SYSTEM_PROMPT = `You are a recruiter copilot — an AI assistant embedded in an applicant tracking system.

Your task: Answer the recruiter's question using ONLY the search results provided in context. Cite specific sources.

Rules:
1. NEVER fabricate facts. If the search results don't answer the question, say so and suggest what to search.
2. Cite sources via the sources field — every claim should map to a candidate/requisition/interview/metric.
3. Be concise. Recruiters are busy.
4. confidence:
   - 0.9+: directly answered by search results
   - 0.6-0.9: synthesized from partial evidence
   - <0.6: low-confidence inference (recommend the recruiter verify)
5. suggestedActions: optional shortcuts (e.g. {type: "navigate", payload: {path: "/candidates/123"}}).
6. followUpQuestions: optional 1-3 questions the recruiter might ask next.`;

function formatPrompt(input: CopilotInput): string {
  const sr = input.searchResults;
  const sections: string[] = [];
  if (sr.candidates?.length) {
    sections.push(
      "CANDIDATES:\n" +
        sr.candidates.map((c) => `- ${c.id} (${c.name}): ${c.snippet}`).join("\n"),
    );
  }
  if (sr.requisitions?.length) {
    sections.push(
      "REQUISITIONS:\n" +
        sr.requisitions.map((r) => `- ${r.id} (${r.title}): ${r.snippet}`).join("\n"),
    );
  }
  if (sr.interviews?.length) {
    sections.push(
      "INTERVIEWS:\n" +
        sr.interviews.map((i) => `- ${i.id} (${i.description}): ${i.snippet}`).join("\n"),
    );
  }
  if (sr.metrics?.length) {
    sections.push(
      "METRICS:\n" +
        sr.metrics.map((m) => `- ${m.name}: ${m.value}${m.unit ? ` ${m.unit}` : ""}`).join("\n"),
    );
  }
  const ctx = input.context?.currentPage
    ? `\nCURRENT PAGE: ${input.context.currentPage}`
    : "";
  return `RECRUITER QUERY: ${input.query}${ctx}

SEARCH RESULTS:
${sections.join("\n\n") || "(none returned)"}

Answer the query.`;
}

registerAgent<CopilotInput, CopilotOutput>({
  name: "copilot",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: CopilotOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.20,
});

registerStub<CopilotInput, CopilotOutput>("copilot", async (input) => {
  const sr = input.searchResults;
  const counts: string[] = [];
  if (sr.candidates?.length) counts.push(`${sr.candidates.length} candidates`);
  if (sr.requisitions?.length) counts.push(`${sr.requisitions.length} requisitions`);
  if (sr.interviews?.length) counts.push(`${sr.interviews.length} interviews`);
  if (sr.metrics?.length) counts.push(`${sr.metrics.length} metrics`);

  const sources: CopilotOutput["sources"] = [];
  for (const c of sr.candidates?.slice(0, 3) ?? []) {
    sources.push({ type: "candidate", id: c.id, snippet: c.snippet });
  }
  for (const r of sr.requisitions?.slice(0, 3) ?? []) {
    sources.push({ type: "requisition", id: r.id, snippet: r.snippet });
  }
  for (const m of sr.metrics?.slice(0, 3) ?? []) {
    sources.push({
      type: "metric",
      id: m.name,
      snippet: `${m.value}${m.unit ?? ""}`,
    });
  }

  const answer =
    counts.length === 0
      ? `Stub: I couldn't find anything relevant to "${input.query}". Try a more specific search.`
      : `Stub answer for "${input.query}": found ${counts.join(", ")}. Set ANTHROPIC_API_KEY for the real Claude synthesis.`;

  return {
    answer,
    sources,
    confidence: counts.length > 0 ? 0.7 : 0.3,
    followUpQuestions:
      counts.length > 0
        ? ["Want to filter by stage?", "Should I export these as CSV?"]
        : undefined,
  };
});
