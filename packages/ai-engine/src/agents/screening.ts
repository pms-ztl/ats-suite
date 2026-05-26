import { registerAgent } from "../runtime.js";

export interface ScreeningInput {
  resumeText: string;
  resumeSkills?: string[];
  jobRequirements: string[];
  jobTitle: string;
}

export interface ScreeningOutput {
  score: number;          // 0-100
  matchPercentage: number; // 0-100
  result: "PASS" | "FAIL" | "REVIEW";
  signals: string[];      // {skill, match, weight} normalized to string for stub
  reasoning: string;
}

/**
 * STUB: scores by counting how many requirement keywords appear in the
 * resume text. Phase 3.5 swaps for the real LLM scorer.
 */
registerAgent<ScreeningInput, ScreeningOutput>("candidate-screener", async (input) => {
  const lowerResume = (input.resumeText ?? "").toLowerCase();
  const requirements = input.jobRequirements ?? [];
  const matched: string[] = [];
  for (const req of requirements) {
    if (req && lowerResume.includes(req.toLowerCase())) matched.push(req);
  }
  const matchPercentage = requirements.length > 0
    ? Math.round((matched.length / requirements.length) * 100)
    : 50;
  const score = Math.min(100, matchPercentage + (input.resumeSkills?.length ?? 0) * 2);
  const result: ScreeningOutput["result"] =
    matchPercentage >= 70 ? "PASS" :
    matchPercentage >= 40 ? "REVIEW" :
    "FAIL";
  return {
    score,
    matchPercentage,
    result,
    signals: matched.map((m) => `MATCH:${m}`),
    reasoning: `Matched ${matched.length}/${requirements.length} requirements for ${input.jobTitle}.`,
  };
});
