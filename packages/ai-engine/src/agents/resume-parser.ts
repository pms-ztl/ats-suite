import { registerAgent } from "../runtime.js";

export interface ResumeParserInput {
  resumeText: string;
}

export interface ResumeParserOutput {
  name: { first: string; last: string } | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  experience: Array<{ company: string; title: string; startDate: string; endDate: string | null }>;
  education: Array<{ school: string; degree: string; field: string | null }>;
  yearsOfExperience: number | null;
}

/**
 * STUB: derives a structured resume from text using simple heuristics.
 * Phase 3.5 swaps this for the real Claude Sonnet parser at
 * D:\CDC\ATS\backend\src\agents\resume-parser.ts.
 */
registerAgent<ResumeParserInput, ResumeParserOutput>("resume-parser", async (input) => {
  const text = input.resumeText ?? "";
  // Heuristic extraction
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(\+?\d[\d\s.()-]{7,})/);
  const skillsLine = text.toLowerCase().match(/skills?:?\s*(.+)/);
  const skills = skillsLine?.[1]?.split(/[,;|]/).map((s) => s.trim()).filter(Boolean).slice(0, 20) ?? [];
  const firstWord = text.trim().split(/\s+/)[0] ?? "Unknown";
  const secondWord = text.trim().split(/\s+/)[1] ?? "Applicant";
  return {
    name: { first: firstWord.slice(0, 40), last: secondWord.slice(0, 40) },
    email: emailMatch?.[0] ?? null,
    phone: phoneMatch?.[0]?.trim() ?? null,
    location: null,
    summary: text.slice(0, 200),
    skills,
    experience: [],
    education: [],
    yearsOfExperience: null,
  };
});
