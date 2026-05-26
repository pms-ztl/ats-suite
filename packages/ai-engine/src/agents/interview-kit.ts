import { registerAgent } from "../runtime.js";

export interface InterviewKitInput {
  jobTitle: string;
  jobRequirements: string[];
  interviewType: string;
  candidateName?: string;
}

export interface InterviewKitOutput {
  questions: Array<{ question: string; category: string; difficulty: "easy" | "medium" | "hard" }>;
  rubric: Array<{ criterion: string; weight: number; description: string }>;
}

/** STUB: returns generic interview questions. Phase 3.5 generates with LLM. */
registerAgent<InterviewKitInput, InterviewKitOutput>("interview-kit", async (input) => {
  const requirements = input.jobRequirements ?? [];
  return {
    questions: [
      { question: `Walk me through a project where you used ${requirements[0] ?? "your strongest skill"}.`, category: "experience", difficulty: "medium" },
      { question: `How would you debug a slow database query?`, category: "technical", difficulty: "medium" },
      { question: `Tell me about a time you disagreed with a teammate.`, category: "behavioral", difficulty: "easy" },
      { question: `Design a system for ${input.jobTitle.toLowerCase()}-style workload.`, category: "system-design", difficulty: "hard" },
    ],
    rubric: [
      { criterion: "Technical Depth", weight: 40, description: "Demonstrates expertise in stated requirements" },
      { criterion: "Communication", weight: 25, description: "Explains complex topics clearly" },
      { criterion: "Problem Solving", weight: 25, description: "Breaks down problems systematically" },
      { criterion: "Culture Fit", weight: 10, description: "Aligns with team values" },
    ],
  };
});
