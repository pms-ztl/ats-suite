/**
 * JD Author Agent — generates inclusive, bias-checked job descriptions.
 *
 * Real mode: Claude produces a full JD + self-audit for biased language.
 * Stub mode: assembles a template JD from the input fields.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

// ── Output schema ────────────────────────────────────────────────────────────

export const JDAuthorOutputSchema = z.object({
  description: z.string().min(100).describe("Full publication-ready JD text"),
  requirements: z.array(z.string()).min(3).describe("Required qualifications"),
  niceToHave: z.array(z.string()).describe("Nice-to-have qualifications"),
  biasFlags: z
    .array(
      z.object({
        text: z.string().describe("The flagged snippet"),
        issue: z.string().describe("Why this is potentially biased"),
        suggestion: z.string().describe("Suggested replacement"),
        severity: z.enum(["low", "medium", "high"]),
      }),
    )
    .describe("Self-audit — flags any bias issues found in the generated text"),
  inclusivityScore: z.number().min(0).max(100).describe("Overall inclusivity score"),
});

export type JDAuthorOutput = z.infer<typeof JDAuthorOutputSchema>;

export interface JDAuthorInput {
  title: string;
  department: string;
  skills: string[];
  level: string;
  location: string;
  salaryRange?: string;
  companyContext?: string;
}

// ── System prompt (ported from monolith) ────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert job description writer for an AI-powered applicant tracking system. Your goal is to generate inclusive, welcoming, bias-free JDs that attract diverse talent.

## Phase 1: Generate the JD

Write a compelling JD following these rules:
1. Inclusive, gender-neutral language throughout.
2. "You" language to address candidates directly.
3. Focus on skills + outcomes, not pedigree or prestige.
4. Describe what the person will DO, not who they should BE.
5. Concrete, measurable requirements over vague traits.
6. Clearly separate required vs. nice-to-have qualifications.
7. Include team culture, growth opportunities, and what success looks like.

## Phase 2: Self-Review for Bias

After writing, review for these patterns and flag any issues:

### Gender-Coded Terms (medium/high)
- Masculine: rockstar, ninja, guru, hacker, dominate, aggressive, manpower, chairman
- Replace with: specialist, expert, lead, developer, workforce, chairperson

### Age-Coded Terms (high)
- "Digital native", "young and dynamic", "energetic", "fresh graduate only"
- Replace with: tech-savvy, motivated, enthusiastic, early-career

### Ability-Coded Terms (high)
- "Able-bodied", "stands for long periods", "must be able to lift"
- Replace with inclusive language or note reasonable accommodations

### Exclusionary Requirements (medium)
- Unnecessary degree requirements when skills matter more
- Overly specific years that exclude career changers
- Company jargon without explanation

### Pedigree Bias (medium)
- "Top-tier university", "Fortune 500 experience", "Ivy League"
- Focus on demonstrated skills + outcomes instead

## Inclusivity Score
- 90-100: Excellent — welcoming, gender-neutral, no flags, uses "you" language
- 70-89:  Good — mostly inclusive, minor improvements
- 50-69:  Needs improvement — some biased patterns
- 0-49:   Poor — significant bias issues

The description field should include: About the Role, What You Will Do, What We Are Looking For, Nice to Have, Why Join Us.`;

function formatPrompt(input: JDAuthorInput): string {
  const salaryLine = input.salaryRange ? `\nSalary range: ${input.salaryRange}` : "";
  const contextLine = input.companyContext ? `\nCompany context: ${input.companyContext}` : "";
  return `Generate a job description for:

Title: ${input.title}
Department: ${input.department}
Level: ${input.level}
Location: ${input.location}
Required skills: ${input.skills.join(", ")}${salaryLine}${contextLine}`;
}

registerAgent<JDAuthorInput, JDAuthorOutput>({
  name: "jd-author",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: JDAuthorOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.30,
});

// ── Stub fallback (template assembly) ───────────────────────────────────────

registerStub<JDAuthorInput, JDAuthorOutput>("jd-author", async (input) => {
  const skills = input.skills.length ? input.skills : ["relevant technical skills"];
  const description = `## About the Role
We're hiring a ${input.title} to join our ${input.department} team in ${input.location} at the ${input.level} level.

## What You Will Do
You'll work on real, impactful problems alongside a collaborative team. You'll be responsible for delivering high-quality work in areas requiring expertise in ${skills.slice(0, 3).join(", ")}.

## What We Are Looking For
- Strong experience with ${skills[0]}
- Familiarity with ${skills.slice(1, 3).join(" and ") || "modern tooling"}
- A growth mindset and willingness to learn

## Nice to Have
- Open-source contributions
- Experience mentoring others

## Why Join Us
- Meaningful work with real impact
- Supportive, inclusive team culture
- Continuous learning opportunities${input.salaryRange ? `\n- Competitive compensation (${input.salaryRange})` : ""}`;

  return {
    description,
    requirements: skills.slice(0, 5).map((s) => `Experience with ${s}`),
    niceToHave: ["Open-source contributions", "Mentorship experience"],
    biasFlags: [],
    inclusivityScore: 85, // Template is intentionally bias-aware
  };
});
