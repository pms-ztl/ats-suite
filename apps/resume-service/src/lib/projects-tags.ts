/**
 * projects[] + tags[] extraction (resume-service).
 *
 * The upstream resume-parser agent (in @cdc-ats/ai-engine) extracts name /
 * skills / experience / education / links / certifications, but NOT a dedicated
 * `projects` list nor a flat `tags` facet list. This module derives both from the
 * REAL parsed artifacts we already have in-hand at persist time — the raw resume
 * text and the enriched output — WITHOUT a second LLM call, so the additive fields
 * come for free on every parse.
 *
 * REAL-DATA-OR-HONEST-EMPTY. Nothing here is fabricated:
 *   - projects come from an actual "Projects" (or "Personal/Side/Notable Projects")
 *     section in the resume text; no such section -> [] (honest empty).
 *   - tags are a deduped, lower-cased facet list assembled ONLY from things the
 *     parse already found: canonical skill labels, certification names, spoken
 *     languages, and the format guess. No inference beyond re-projecting existing
 *     extracted values into a flat, searchable facet list.
 */
import type { ResumeParserOutput } from "@cdc-ats/ai-engine";

export interface ResumeProject {
  /** Project name / title as written (the bullet or line heading). */
  name: string;
  /** Any following description lines joined, or null when the entry is a bare title. */
  description: string | null;
  /** Tech/tools detected in the project text that also appear as canonical skills. */
  technologies: string[];
}

// Section headings that introduce a projects block. Matched case-insensitively on
// a line that is (almost) only the heading — real resumes put these on their own
// line, often upper-cased. Kept deliberately tight so we don't scoop a "Project
// Manager" job title into the projects section.
const PROJECT_HEADINGS = [
  /^\s*(personal|side|notable|academic|key|selected|open[-\s]?source)?\s*projects?\s*:?\s*$/i,
];
// Headings that END the projects block (the next resume section starts here).
const SECTION_END = [
  /^\s*(experience|work experience|employment|professional experience)\b/i,
  /^\s*(education|academic)\b/i,
  /^\s*(skills|technical skills|core competencies)\b/i,
  /^\s*(certifications?|licenses?)\b/i,
  /^\s*(languages?)\b/i,
  /^\s*(awards?|honors?|publications?|references?|interests?|hobbies)\b/i,
  /^\s*(summary|objective|profile)\b/i,
];

const BULLET_PREFIX = /^\s*[-*•·▪◦‣]\s+/;
const MAX_PROJECTS = 25;
const MAX_TAGS = 40;

/**
 * Slice the lines belonging to the resume's projects section, if one exists.
 * Returns [] when there is no projects heading (honest empty).
 */
function projectSectionLines(text: string): string[] {
  const lines = text.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (PROJECT_HEADINGS.some((re) => re.test(lines[i] ?? ""))) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return [];
  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (SECTION_END.some((re) => re.test(line))) break;
    out.push(line);
  }
  return out;
}

/**
 * Parse the projects section into { name, description, technologies } entries.
 * An entry starts on a bullet OR a non-empty, non-indented line; following
 * indented / continuation lines fold into its description. technologies are the
 * canonical skill labels that literally appear in the entry text (real overlap,
 * never invented).
 */
export function extractProjects(text: string, canonicalSkillLabels: string[]): ResumeProject[] {
  const lines = projectSectionLines(text);
  if (lines.length === 0) return [];

  const skillRes = canonicalSkillLabels.map((label) => ({
    label,
    re: new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"),
  }));

  const projects: ResumeProject[] = [];
  let cur: { name: string; descLines: string[] } | null = null;
  const flush = () => {
    if (!cur) return;
    const name = cur.name.trim();
    if (name.length === 0) { cur = null; return; }
    const description = cur.descLines.map((l) => l.trim()).filter(Boolean).join(" ") || null;
    const haystack = `${name} ${description ?? ""}`;
    const technologies = skillRes.filter(({ re }) => re.test(haystack)).map(({ label }) => label);
    projects.push({ name: name.slice(0, 300), description: description?.slice(0, 1000) ?? null, technologies: Array.from(new Set(technologies)) });
    cur = null;
  };

  for (const raw of lines) {
    const line = raw ?? "";
    if (line.trim().length === 0) continue; // blank line separates but does not itself start an entry
    const isBullet = BULLET_PREFIX.test(line);
    const isNewEntry = isBullet || !/^\s/.test(line); // bullet OR a flush-left line starts a new project
    const cleaned = line.replace(BULLET_PREFIX, "").trim();
    if (isNewEntry) {
      flush();
      // Split "Name - description" / "Name: description" / "Name | description"
      // so a single-line entry still yields a name + description.
      const m = cleaned.match(/^(.{2,120}?)\s*(?:[-–—:|]|\s{2,})\s*(.+)$/);
      if (m) cur = { name: m[1]!, descLines: [m[2]!] };
      else cur = { name: cleaned, descLines: [] };
    } else if (cur) {
      cur.descLines.push(cleaned);
    }
    if (projects.length >= MAX_PROJECTS) break;
  }
  flush();
  return projects.slice(0, MAX_PROJECTS);
}

/**
 * Assemble a flat, deduped, lower-cased tag facet list from EXISTING extracted
 * values only. Order: canonical skill labels first (most useful for search/filter),
 * then certifications, then languages, then the format guess. No fabrication — every
 * tag traces back to a value the parse already surfaced.
 */
export function buildTags(opts: {
  canonicalSkillLabels: string[];
  parsed: ResumeParserOutput;
}): string[] {
  const { canonicalSkillLabels, parsed } = opts;
  const tags: string[] = [];
  const push = (v: string | null | undefined) => {
    if (!v) return;
    const t = v.trim().toLowerCase();
    if (t.length === 0 || t.length > 60) return;
    tags.push(t);
  };

  for (const label of canonicalSkillLabels) push(label);
  for (const cert of parsed.certifications ?? []) push(cert.name);
  for (const lang of parsed.languages ?? []) push(lang.language);
  if (parsed.formatGuess && parsed.formatGuess !== "other") push(parsed.formatGuess);

  // Dedup preserving first-seen order; cap for a sane payload size.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}
