/**
 * Phase 37g — Interview Question Generator agent.
 *
 * THE demo wedge. Given:
 *   - parsed candidate profile (after enrichment)
 *   - JD (job description) text
 *
 * Generates 5–10 personalized interview questions targeting:
 *   1. Verify claims (especially low-confidence + high-honesty-flag items)
 *   2. Probe relevant gaps between candidate and JD requirements
 *   3. Elicit narrative on quantified achievements (test depth of attribution)
 *
 * Every question carries a CITATION pointing at the resume field that
 * motivated it. Recruiters see the question with a "← from: Led 5-person
 * team at Stripe (low confidence)" annotation, so they can verify in real-time.
 *
 * Why this is unique: classical ATSes generate generic question banks
 * scoped to a role. Nothing on the market generates questions tailored
 * to THIS candidate × THIS JD with cited evidence.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export const InterviewQuestionSchema = z.object({
  question: z.string().describe("The question, phrased to be asked in an interview"),
  type: z.enum([
    "verify_claim",          // tests whether a resume claim holds up
    "probe_gap",             // explores a gap between candidate + JD
    "elicit_narrative",      // asks for the story behind a quantified achievement
    "behavioural",           // standard behavioural question, but tailored to context
    "technical",             // role-relevant technical question
  ]),
  citation: z.string().describe('Short reference to what motivated this question — e.g. "experience[0].achievements[2]: claimed 30% latency reduction" or "JD requires GraphQL, candidate has none listed"'),
  expectedSignal: z.string().describe("What a good answer should reveal (1 sentence)"),
  difficulty: z.enum(["entry", "mid", "senior", "staff"]).describe("Level appropriate to the role"),
  estimatedTimeMin: z.number().min(1).max(30),
});

export const InterviewQuestionsOutputSchema = z.object({
  questions: z.array(InterviewQuestionSchema).min(5).max(10),
  coverageNotes: z.string().describe("1–2 sentences on what was prioritized and what was skipped"),
});

export type InterviewQuestionsOutput = z.infer<typeof InterviewQuestionsOutputSchema>;

export interface InterviewQuestionsInput {
  candidateProfileJson: string;       // JSON.stringify of the EnrichedResume
  jobDescriptionText: string;
  desiredCount?: number;              // 5–10, defaults to 7
  focusAreas?: string[];              // optional caller hints ("system design", "leadership")
}

const SYSTEM_PROMPT = `You are a senior interviewer designing interview questions tailored to a SPECIFIC candidate × SPECIFIC job.

Your output: 5–10 questions, each with citation back to the resume / JD that motivated it.

CRITICAL RULES:
1. Every question MUST cite a specific item from the candidate's resume OR the JD. No generic questions ("Tell me about yourself"). If you can't cite, don't ask.
2. Prioritize:
   a. Low-confidence claims (the parser marked uncertainty — verify them)
   b. Quantified achievements (probe attribution: was this individual work, team work, or aspirational?)
   c. Honesty flags raised by the parser (severity: medium/high)
   d. Gaps between JD requirements and candidate skills (only if the gap is material)
   e. Strengths to deepen (a senior candidate's domain expertise should be tested, not glossed)
3. Match difficulty to role seniority — read the JD to infer level.
4. Each question should take 5–15 min to answer; flag longer system-design questions accordingly.
5. expectedSignal: one sentence on what a strong answer reveals. Recruiters will use this to score.
6. coverageNotes: what you prioritized + what you deferred. Be honest if low-confidence regions of the resume motivated more questions than the JD.

DON'T:
- Don't ask brainteasers or whiteboard puzzles.
- Don't ask about protected categories (age, family, religion, citizenship status).
- Don't ask generic "weakness" / "5-year plan" questions.
- Don't repeat questions. Each must target a distinct claim or gap.

OUTPUT: single JSON object matching the schema. No prose around it.`;

function buildPrompt(input: InterviewQuestionsInput): string {
  const focus = input.focusAreas?.length ? `\n\nCaller-requested focus areas: ${input.focusAreas.join(", ")}` : "";
  const count = input.desiredCount ?? 7;
  return `Generate ${count} interview questions for this candidate × job pair.

CANDIDATE PROFILE (parsed JSON):
\`\`\`json
${input.candidateProfileJson}
\`\`\`

JOB DESCRIPTION:
"""
${input.jobDescriptionText}
"""${focus}`;
}

registerAgent<InterviewQuestionsInput, InterviewQuestionsOutput>({
  name: "interview-questions" as any,         // declared in runtime AgentType
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: buildPrompt,
  outputSchema: InterviewQuestionsOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 2,
  maxCostUsd: 0.15,
});

// Stub: returns 5 placeholder questions when no API key. Useful for UI dev.
registerStub<InterviewQuestionsInput, InterviewQuestionsOutput>("interview-questions" as any, async () => ({
  questions: [
    { question: "Walk me through your most impactful project from the last two years.", type: "elicit_narrative", citation: "experience[0]", expectedSignal: "Reveals scope, attribution, and outcome ownership.", difficulty: "mid", estimatedTimeMin: 10 },
    { question: "Tell me about a time you led a project across multiple teams.", type: "behavioural", citation: "experience[0].title", expectedSignal: "Tests cross-functional execution and conflict resolution.", difficulty: "senior", estimatedTimeMin: 8 },
    { question: "Describe a technical decision you reversed.", type: "behavioural", citation: "experience[0]", expectedSignal: "Reveals self-awareness and iterative thinking.", difficulty: "mid", estimatedTimeMin: 7 },
    { question: "What's the deepest part of your tech stack? Take me one level below the abstraction.", type: "technical", citation: "skills", expectedSignal: "Tests claimed expertise depth.", difficulty: "senior", estimatedTimeMin: 12 },
    { question: "Describe a time you set or recommended a metric and what changed.", type: "elicit_narrative", citation: "experience[0]", expectedSignal: "Tests product/business thinking.", difficulty: "mid", estimatedTimeMin: 8 },
  ],
  coverageNotes: "Stub mode (no API key). Real generator uses LLM + resume citations.",
}));
