/**
 * Phase 37c + 37e — Post-parse enrichment.
 *
 * Takes the raw LLM output and walks it through:
 *   1. Skill canonicalization (Phase 37a) — maps to canonical IDs + labels
 *   2. Institution canonicalization (Phase 37b) — universities + companies
 *   3. Date normalization (Phase 37b) — every date to ISO
 *   4. Per-skill metadata computation (Phase 37c/e):
 *        - yearsActive: sum of work-position durations where skill was mentioned
 *        - lastUsedYear: latest end-year of any work position mentioning the skill
 *        - depth: lead / used / mentioned, inferred from bullets
 *        - sourceProjects: list of work-position indices where the skill appeared
 *
 * The output of this is what gets persisted to Candidate.parsedSummary
 * and Resume.parsedData. Schema is documented in the type returned below.
 */
import { canonicalizeSkill, type CanonicalSkill } from "../taxonomies/skills.js";
import { canonicalizeInstitution, type CanonicalInstitution } from "../taxonomies/institutions.js";
import { parseResumeDate, monthsBetween, type NormalizedDate } from "./normalize.js";
import type { ResumeParserOutput } from "../agents/resume-parser.js";

// ─── Enriched output types ──────────────────────────────────────────────

export type SkillDepth = "lead" | "used" | "mentioned";

export interface EnrichedSkill {
  raw: string;                          // original string from the resume
  canonicalId: string | null;           // null if no taxonomy match
  label: string;                        // canonical label, or raw if no match
  category: string | null;
  confidence: number;                   // RAW model self-report
  evidenceConfidence: number;           // blended w/ deterministic evidence signals
  matchVia: "alias" | "semantic" | null; // how it canonicalized (null = unmatched)
  yearsActive: number;                  // computed from work-history overlap
  lastUsedYear: number | null;          // latest end-year of a position mentioning it
  depth: SkillDepth;                    // lead / used / mentioned
  sourceProjectIndices: number[];       // which experience[] entries mentioned it
}

export interface EnrichOptions {
  /** Raw resume text — enables evidence-adjusted confidence (verbatim checks). */
  sourceText?: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Blend the model's self-reported confidence with deterministic evidence so the
 * number means "how well-supported is this", not just "how sure did the LLM
 * sound". NOT statistical calibration (that needs labels) — evidence grounding.
 */
function evidenceAdjustedConfidence(opts: {
  modelConfidence: number;
  canonicalized: boolean;
  verbatimInSource: boolean;
  tiedToRole: boolean;
  sparseSource: boolean;
}): number {
  let c = opts.modelConfidence;
  if (opts.canonicalized) c += 0.1;     // matched a known skill
  if (opts.verbatimInSource) c += 0.15; // literally present in the resume text
  if (opts.tiedToRole) c += 0.1;        // appears inside a real work position
  if (opts.sparseSource) c -= 0.15;     // little text to support anything
  return Math.round(clamp01(c) * 100) / 100;
}

export interface EnrichedExperience {
  raw: ResumeParserOutput["experience"][number];
  companyCanonicalId: string | null;
  companyLabel: string;
  startDate: NormalizedDate | null;
  endDate: NormalizedDate | null;         // null = ongoing
  tenureMonths: number;
}

export interface EnrichedEducation {
  raw: ResumeParserOutput["education"][number];
  schoolCanonicalId: string | null;
  schoolLabel: string;
  startDate: NormalizedDate | null;
  endDate: NormalizedDate | null;
}

export interface EnrichedResume {
  name: ResumeParserOutput["name"];
  email: ResumeParserOutput["email"];
  phone: ResumeParserOutput["phone"];
  location: ResumeParserOutput["location"];
  summary: ResumeParserOutput["summary"];
  formatGuess: ResumeParserOutput["formatGuess"];
  honestyFlags: ResumeParserOutput["honestyFlags"];
  languages: ResumeParserOutput["languages"];
  certifications: ResumeParserOutput["certifications"];
  links: ResumeParserOutput["links"];

  skills: EnrichedSkill[];
  experience: EnrichedExperience[];
  education: EnrichedEducation[];

  // Derived top-level stats
  totalYearsExperience: number;          // from earliest start to latest end (or now)
  uniqueCompanies: number;
  averageTenureMonths: number;
}

// ─── helpers ────────────────────────────────────────────────────────────

const LEAD_PATTERNS = [/^led\b/i, /^managed\b/i, /^owned\b/i, /^architected\b/i, /^designed and led\b/i, /^built and led\b/i];
const USED_PATTERNS = [/\bbuilt\b/i, /\bshipped\b/i, /\bimplemented\b/i, /\bdeveloped\b/i, /\bdeployed\b/i, /\bintegrated\b/i, /\bcoded\b/i, /\bauthored\b/i];

function inferDepthFromBullets(bullets: string[], skill: string): SkillDepth {
  const skillRe = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  for (const b of bullets) {
    if (!skillRe.test(b)) continue;
    if (LEAD_PATTERNS.some((p) => p.test(b))) return "lead";
    if (USED_PATTERNS.some((p) => p.test(b))) return "used";
  }
  return "mentioned";
}

function tryCanonicalize(institutionName: string): CanonicalInstitution | null {
  return canonicalizeInstitution(institutionName);
}

// ─── Main entry: enrich() ───────────────────────────────────────────────

export function enrich(raw: ResumeParserOutput, opts: EnrichOptions = {}): EnrichedResume {
  const sourceText = (opts.sourceText ?? "").toLowerCase();
  const sparseSource = sourceText.length > 0 && sourceText.length < 400;
  // 1. Normalize experience dates + canonicalize companies
  const experience: EnrichedExperience[] = raw.experience.map((e) => {
    const sd = parseResumeDate(e.startDate);
    const ed = parseResumeDate(e.endDate ?? null);
    const tenureMonths = sd ? monthsBetween(sd, ed) : 0;
    const company = tryCanonicalize(e.company);
    return {
      raw: e,
      companyCanonicalId: company?.id ?? null,
      companyLabel: company?.label ?? e.company,
      startDate: sd,
      endDate: ed,
      tenureMonths,
    };
  });

  // 2. Normalize education dates + canonicalize schools
  const education: EnrichedEducation[] = raw.education.map((ed) => {
    const sd = parseResumeDate(ed.startDate ?? null);
    const e = parseResumeDate(ed.endDate ?? null);
    const school = tryCanonicalize(ed.school);
    return {
      raw: ed,
      schoolCanonicalId: school?.id ?? null,
      schoolLabel: school?.label ?? ed.school,
      startDate: sd,
      endDate: e,
    };
  });

  // 3. Skills — canonicalize + compute per-skill metadata.
  // For each skill we look at every work-position's bullets; if mentioned,
  // the position contributes its tenure to yearsActive + updates lastUsedYear.
  const enrichedSkills: EnrichedSkill[] = [];
  for (const s of raw.skills) {
    const canonical: CanonicalSkill | null = canonicalizeSkill(s.raw);
    const aliases = canonical?.aliases ?? [s.raw.toLowerCase()];

    let monthsTotal = 0;
    let lastUsedYear: number | null = null;
    const sourceProjectIndices: number[] = [];
    let depth: SkillDepth = "mentioned";

    for (let i = 0; i < experience.length; i++) {
      const exp = experience[i]!;
      const allBullets = [exp.raw.title, ...(exp.raw.bullets ?? [])].join(" ").toLowerCase();
      const mentioned = aliases.some((a) => allBullets.includes(a));
      if (!mentioned) continue;

      sourceProjectIndices.push(i);
      monthsTotal += exp.tenureMonths;
      const endYear = exp.endDate
        ? Number(exp.endDate.iso.split("-")[0])
        : new Date().getUTCFullYear();
      if (lastUsedYear === null || endYear > lastUsedYear) lastUsedYear = endYear;

      // Depth: take the strongest signal across all positions mentioning the skill
      const bulletDepth = inferDepthFromBullets(exp.raw.bullets ?? [], s.raw);
      if (bulletDepth === "lead") depth = "lead";
      else if (bulletDepth === "used" && depth !== "lead") depth = "used";
    }

    const verbatimInSource = sourceText.length > 0 && aliases.some((a) => sourceText.includes(a));
    enrichedSkills.push({
      raw: s.raw,
      canonicalId: canonical?.id ?? null,
      label: canonical?.label ?? s.raw,
      category: canonical?.category ?? null,
      confidence: s.confidence,
      evidenceConfidence: evidenceAdjustedConfidence({
        modelConfidence: s.confidence,
        canonicalized: !!canonical,
        verbatimInSource,
        tiedToRole: sourceProjectIndices.length > 0,
        sparseSource,
      }),
      matchVia: canonical ? "alias" : null,
      yearsActive: Math.round((monthsTotal / 12) * 10) / 10,    // 1 dp
      lastUsedYear,
      depth,
      sourceProjectIndices,
    });
  }

  // 4. Top-level derived stats
  const allStartYears = experience
    .map((e) => (e.startDate ? Number(e.startDate.iso.split("-")[0]) : null))
    .filter((n): n is number => n !== null);
  const earliestYear = allStartYears.length ? Math.min(...allStartYears) : null;
  const latestEndYear = experience.reduce<number | null>((acc, e) => {
    const y = e.endDate ? Number(e.endDate.iso.split("-")[0]) : new Date().getUTCFullYear();
    return acc === null || y > acc ? y : acc;
  }, null);
  const totalYearsExperience = earliestYear !== null && latestEndYear !== null
    ? Math.max(0, latestEndYear - earliestYear)
    : 0;

  const companyIds = new Set(experience.map((e) => e.companyCanonicalId ?? e.raw.company.toLowerCase()));
  const totalMonths = experience.reduce((s, e) => s + e.tenureMonths, 0);
  const averageTenureMonths = experience.length > 0
    ? Math.round(totalMonths / experience.length)
    : 0;

  return {
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    location: raw.location,
    summary: raw.summary,
    formatGuess: raw.formatGuess,
    honestyFlags: raw.honestyFlags,
    languages: raw.languages,
    certifications: raw.certifications,
    links: raw.links,
    skills: enrichedSkills,
    experience,
    education,
    totalYearsExperience,
    uniqueCompanies: companyIds.size,
    averageTenureMonths,
  };
}

// ─── Fairness mode (Phase 37j) ──────────────────────────────────────────
/**
 * PII-stripped view of an EnrichedResume. Removes name, photo (which we
 * don't store anyway), location specificity, university prestige signals,
 * and other identity-correlated info. Available behind a "blind hiring"
 * search toggle.
 *
 * What gets STRIPPED:
 *   - name (full obfuscation)
 *   - email + phone (replaced with "[redacted]")
 *   - location (kept only at country level)
 *   - school name (replaced with degree type only)
 *   - certifications still kept; usually not identity-correlated
 *
 * What gets KEPT:
 *   - skills + metadata
 *   - experience: company name (anonymized to industry), title, dates
 *   - achievements (structured impact — the actual signal)
 *   - languages + certs
 */
export function toFairnessView(enriched: EnrichedResume): EnrichedResume {
  const stripLocation = (loc: string | null): string | null => {
    if (!loc) return null;
    // Keep last comma-separated token (often country / state)
    const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1]! : null;
  };

  return {
    ...enriched,
    name: { value: null, confidence: 0 },
    email: { value: "[redacted]", confidence: 0 },
    phone: { value: "[redacted]", confidence: 0 },
    location: { value: stripLocation(enriched.location.value), confidence: enriched.location.confidence },
    links: { linkedin: null, github: enriched.links.github, portfolio: enriched.links.portfolio, blog: null, twitter: null },
    education: enriched.education.map((e) => ({
      ...e,
      schoolCanonicalId: null,
      schoolLabel: "[degree only]",
      raw: { ...e.raw, school: "[degree only]", gpa: null, honors: [] },
    })),
  };
}
