/**
 * Phase 37h — GitHub corroboration.
 *
 * Given the candidate's GitHub URL (or @handle), fetches:
 *   1. Public profile (name, bio, location, follower count, account age)
 *   2. Recent repos (last 20) — language, star count, last push
 *   3. Aggregate language stats (% across all owned repos)
 *
 * Output is consumed by the candidate detail page to surface "Public
 * Signal" alongside the resume claims. Recruiter sees inconsistencies
 * flagged: "Resume says 5 years of Rust, GitHub shows Rust in 1 small
 * repo last touched 3 years ago."
 *
 * Why we don't use a registered agent for this: it's not an LLM
 * call — it's a public API fetch. The CORROBORATION ANALYSIS (LLM
 * comparison resume vs GitHub) does run through an agent (below).
 *
 * Rate limits: unauthenticated GitHub API allows 60 req/hour per IP.
 * For real prod use, set GITHUB_TOKEN to lift that to 5000/hour. We
 * gracefully degrade: if 403, return partial data.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  recentRepos: Array<{
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    pushedAt: string | null;
    isOriginal: boolean;
  }>;
  languageBreakdown: Record<string, number>;
  fetchedAt: string;
  rateLimitRemaining?: number;
}

/** Extract the GitHub handle from a free-form URL or string. */
export function extractGithubHandle(input: string | null | undefined): string | null {
  if (!input) return null;
  const m = input.match(/(?:github\.com\/|@)([\w-]+)/i);
  return m?.[1] ?? null;
}

/** Best-effort fetch of GitHub profile + recent repos. */
export async function fetchGithubProfile(handle: string): Promise<GitHubProfile | null> {
  const token = process.env["GITHUB_TOKEN"];
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github+json",
    "User-Agent": "cdc-ats-corroborator",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const profileRes = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`, { headers });
    if (!profileRes.ok) return null;
    const profile: any = await profileRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}/repos?per_page=20&sort=pushed&type=owner`, { headers });
    const repos: any[] = reposRes.ok ? (await reposRes.json() as any[]) : [];

    // Aggregate languages — count repos per language (no expensive per-repo
    // byte-count fetch).
    const langCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
    }

    return {
      login: profile.login,
      name: profile.name ?? null,
      bio: profile.bio ?? null,
      location: profile.location ?? null,
      blog: profile.blog ?? null,
      publicRepos: profile.public_repos ?? 0,
      followers: profile.followers ?? 0,
      following: profile.following ?? 0,
      createdAt: profile.created_at,
      recentRepos: repos.map((r: any) => ({
        name: r.name,
        description: r.description ?? null,
        language: r.language ?? null,
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        pushedAt: r.pushed_at ?? null,
        isOriginal: !r.fork,
      })),
      languageBreakdown: langCounts,
      fetchedAt: new Date().toISOString(),
      rateLimitRemaining: profileRes.headers.get("x-ratelimit-remaining") ? Number(profileRes.headers.get("x-ratelimit-remaining")) : undefined,
    };
  } catch {
    return null;
  }
}

// ─── LLM-driven corroboration analysis ──────────────────────────────────

export const GithubCorroborationSchema = z.object({
  confirmed: z.array(z.object({
    claim: z.string(),
    evidence: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  discrepancies: z.array(z.object({
    claim: z.string(),
    discrepancy: z.string(),
    severity: z.enum(["low", "medium", "high"]),
  })),
  publicSignal: z.object({
    accountAgeYears: z.number().nullable(),
    accountIsActive: z.boolean(),
    primaryLanguages: z.array(z.string()),
    notableRepos: z.array(z.string()),
    overallStrength: z.enum(["strong", "moderate", "minimal", "absent"]),
  }),
  confidence: z.number().min(0).max(1),
});

export type GithubCorroboration = z.infer<typeof GithubCorroborationSchema>;

export interface GithubCorroborationInput {
  candidateProfileJson: string;     // EnrichedResume JSON
  githubProfileJson: string;         // GitHubProfile JSON
}

const SYSTEM_PROMPT = `You compare a candidate's resume claims against their public GitHub profile.

Be honest. Surface BOTH confirmations and discrepancies. Don't penalize candidates for not having a public GitHub presence — many don't (security engineers, BizOps, etc.).

WHAT TO CHECK:
- Skills: does GitHub show real activity in the claimed languages/frameworks? "Python expert" + 1 Python repo 5 years ago = discrepancy.
- Tenure: does the GitHub account age make claimed years-of-experience plausible?
- Projects: does the resume mention specific projects? Can you find them in repos?
- Public profile: is bio consistent? Does location match?

OUTPUT:
- confirmed: claims where GitHub provides supporting evidence.
- discrepancies: claims where GitHub contradicts or is silent. severity:
    low = silent, not contradicted (e.g. they claim React, GitHub doesn't show JS — could be private repos)
    medium = contradicted partially
    high = directly contradicted (claim Python expert, no Python on profile)
- publicSignal.overallStrength: holistic assessment of how strong the GitHub presence is.
- confidence: your confidence in the overall analysis.

CRITICAL: missing GitHub data is not a discrepancy. It's just absence of evidence. Only flag DIRECT contradictions.

OUTPUT: single JSON object matching the schema. No commentary.`;

registerAgent<GithubCorroborationInput, GithubCorroboration>({
  name: "github-corroborator" as any,
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: (input) => `Compare these:

RESUME (parsed):
\`\`\`json
${input.candidateProfileJson}
\`\`\`

GITHUB PROFILE:
\`\`\`json
${input.githubProfileJson}
\`\`\``,
  outputSchema: GithubCorroborationSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 2,
  maxCostUsd: 0.08,
});

registerStub<GithubCorroborationInput, GithubCorroboration>("github-corroborator" as any, async () => ({
  confirmed: [],
  discrepancies: [],
  publicSignal: {
    accountAgeYears: null,
    accountIsActive: false,
    primaryLanguages: [],
    notableRepos: [],
    overallStrength: "absent",
  },
  confidence: 0.1,
}));
