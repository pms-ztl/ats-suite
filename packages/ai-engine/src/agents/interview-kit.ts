/**
 * Interview Kit Agent — generates round-specific questions + scoring rubric.
 *
 * Real mode: Claude generates questions tailored to the job + requirements.
 * Stub mode: returns generic template questions.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

// ── Output schema ────────────────────────────────────────────────────────────

export const InterviewKitOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(10),
        category: z.string().describe("e.g. technical, behavioral, system-design"),
        difficulty: z.enum(["easy", "medium", "hard"]),
      }),
    )
    .min(3)
    .describe("Interview questions tailored to the job + round"),
  rubric: z
    .array(
      z.object({
        criterion: z.string(),
        weight: z.number().min(0).max(100),
        description: z.string(),
      }),
    )
    .min(3)
    .describe("Scoring rubric — weights should sum to 100"),
});

export type InterviewKitOutput = z.infer<typeof InterviewKitOutputSchema>;

export interface InterviewKitInput {
  jobTitle: string;
  jobRequirements: string[];
  interviewType: string;
  candidateName?: string;
}

const SYSTEM_PROMPT = `You design interview kits for hiring panels.

For the given job + round type, produce:
1. 4-8 questions appropriate to the round (technical, behavioral, system-design, etc.)
2. A scoring rubric with 3-5 criteria, weights summing to 100.

Rules:
- Questions must be specific to the job's requirements — no generic filler.
- Mix difficulty levels appropriately for the round.
- Avoid bias-prone questions (no "culture fit" without operationalizing it).
- Rubric criteria must be operationally measurable.`;

function formatPrompt(input: InterviewKitInput): string {
  const reqs = input.jobRequirements.length
    ? input.jobRequirements.map((r, i) => `  ${i + 1}. ${r}`).join("\n")
    : "  (none provided)";
  return `JOB: ${input.jobTitle}
ROUND TYPE: ${input.interviewType}
REQUIREMENTS:
${reqs}

Generate the interview kit.`;
}

registerAgent<InterviewKitInput, InterviewKitOutput>({
  name: "interview-kit",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: InterviewKitOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.20,
});

registerStub<InterviewKitInput, InterviewKitOutput>("interview-kit", async (input) => {
  const requirements = input.jobRequirements ?? [];
  return {
    questions: [
      {
        question: `Walk me through a project where you used ${requirements[0] ?? "your strongest skill"}.`,
        category: "experience",
        difficulty: "medium",
      },
      {
        question: `How would you debug a slow database query?`,
        category: "technical",
        difficulty: "medium",
      },
      {
        question: `Tell me about a time you disagreed with a teammate.`,
        category: "behavioral",
        difficulty: "easy",
      },
      {
        question: `Design a system for ${input.jobTitle.toLowerCase()}-style workload.`,
        category: "system-design",
        difficulty: "hard",
      },
    ],
    rubric: [
      { criterion: "Technical Depth", weight: 40, description: "Demonstrates expertise in stated requirements" },
      { criterion: "Communication", weight: 25, description: "Explains complex topics clearly" },
      { criterion: "Problem Solving", weight: 25, description: "Breaks down problems systematically" },
      { criterion: "Culture Fit", weight: 10, description: "Aligns with team values" },
    ],
  };
});
