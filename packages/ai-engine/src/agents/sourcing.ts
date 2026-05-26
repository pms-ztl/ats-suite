/**
 * Sourcing Agent — ranks pre-fetched candidate pool against a requisition.
 *
 * Single-call: caller (candidate-service) does the DB search and semantic
 * lookup, passes the resulting candidate list + the requisition. The agent
 * scores match quality and explains rationale.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export const SourcingOutputSchema = z.object({
  candidates: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        matchScore: z.number().min(0).max(1),
        rationale: z.string().min(10),
        source: z.enum(["database", "talent_pool", "semantic_search"]),
        skills: z.array(z.string()),
      }),
    )
    .min(0)
    .max(50),
  searchStrategiesUsed: z.array(z.string()),
  totalScanned: z.number(),
  summary: z.string().min(20),
});

export type SourcingOutput = z.infer<typeof SourcingOutputSchema>;

export interface SourcingInput {
  requisition: {
    id: string;
    title: string;
    department: string;
    description?: string;
    requirements: string[];
  };
  candidatePool: Array<{
    id: string;
    name: string;
    skills: string[];
    yearsOfExperience?: number;
    summary?: string;
    source: "database" | "talent_pool" | "semantic_search";
  }>;
  maxResults?: number;
}

const SYSTEM_PROMPT = `You are a talent sourcing agent. Your goal is to rank the best matching candidates for a job requisition.

Strategy:
1. Match candidate skills, experience, and summary against the requirements.
2. Score each candidate from 0.0 to 1.0 (1.0 = perfect match).
3. Cite SPECIFIC evidence from the candidate profile in the rationale.
4. Do NOT consider name, location prestige, or other bias-prone signals.
5. Return only candidates that are plausibly hireable (matchScore ≥ 0.4). Skip the rest.
6. Order results by matchScore descending.
7. Limit results to maxResults (default 25).
8. The summary explains the search outcome in 2-3 sentences.`;

function formatPrompt(input: SourcingInput): string {
  const reqLines = input.requisition.requirements.map((r, i) => `  ${i + 1}. ${r}`).join("\n");
  const candidates = input.candidatePool
    .map(
      (c) =>
        `- id=${c.id} name=${c.name} source=${c.source} years=${c.yearsOfExperience ?? "?"}\n  skills: ${c.skills.slice(0, 10).join(", ")}\n  summary: ${(c.summary ?? "(none)").slice(0, 200)}`,
    )
    .join("\n");
  return `REQUISITION: ${input.requisition.title} (${input.requisition.department})
${input.requisition.description ? `Description: ${input.requisition.description}\n` : ""}REQUIREMENTS:
${reqLines}

CANDIDATE POOL (${input.candidatePool.length} candidates):
${candidates}

Rank candidates and return top ${input.maxResults ?? 25}.`;
}

registerAgent<SourcingInput, SourcingOutput>({
  name: "sourcing",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: SourcingOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.30,
});

registerStub<SourcingInput, SourcingOutput>("sourcing", async (input) => {
  const reqText = [input.requisition.title, ...input.requisition.requirements].join(" ").toLowerCase();
  const ranked = input.candidatePool
    .map((c) => {
      const matched = c.skills.filter((s) => reqText.includes(s.toLowerCase()));
      const matchScore = Math.min(1, matched.length / Math.max(1, input.requisition.requirements.length));
      return {
        id: c.id,
        name: c.name,
        matchScore,
        rationale: `Matched ${matched.length} of ${input.requisition.requirements.length} requirements via skill overlap.`,
        source: c.source,
        skills: c.skills.slice(0, 10),
      };
    })
    .filter((c) => c.matchScore >= 0.2)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, input.maxResults ?? 25);
  return {
    candidates: ranked,
    searchStrategiesUsed: ["keyword_skill_overlap"],
    totalScanned: input.candidatePool.length,
    summary: `Stub ranked ${ranked.length} of ${input.candidatePool.length} candidates above the 0.2 match threshold for ${input.requisition.title}.`,
  };
});
