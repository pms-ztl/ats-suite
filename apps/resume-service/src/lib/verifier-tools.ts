/**
 * Tool IMPLEMENTATIONS for the agentic resume-verifier (resume-service).
 * Closes over the raw resume text + the enriched structure so the agent can
 * fact-check claims without re-fetching.
 *
 *   find_evidence_in_resume → substring/term search over the raw text
 *   check_date_consistency  → gaps / overlaps / impossible ranges (deterministic)
 *   lookup_github           → public profile corroboration
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import { fetchGithubProfile } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";

const STOP = new Set(["the", "and", "for", "with", "years", "year", "experience", "of", "in", "a", "an"]);
function terms(q: string): string[] {
  return Array.from(new Set(q.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w))));
}
function snippetAround(text: string, idx: number, win = 160): string {
  const s = Math.max(0, idx - win / 2), e = Math.min(text.length, idx + win / 2);
  return (s > 0 ? "…" : "") + text.slice(s, e).replace(/\s+/g, " ").trim() + (e < text.length ? "…" : "");
}

function searchText(textLower: string, rawText: string, query: string) {
  const want = terms(query);
  if (want.length === 0) return { found: false, coverage: 0, snippet: null as string | null };
  let firstIdx = -1, hits = 0;
  for (const t of want) {
    const idx = textLower.indexOf(t);
    if (idx >= 0) { hits++; if (firstIdx < 0 || idx < firstIdx) firstIdx = idx; }
  }
  const coverage = hits / want.length;
  return { found: coverage >= 0.5, coverage: Number(coverage.toFixed(2)), snippet: firstIdx >= 0 ? snippetAround(rawText, firstIdx) : null };
}

export function buildVerifierTools(opts: {
  tenantId: string;
  resumeId: string;
  resumeText: string;
  enriched: any;
  logger: Logger;
}): Record<string, ToolImpl> {
  const { resumeText, enriched, logger } = opts;
  const textLower = resumeText.toLowerCase();

  return {
    find_evidence_in_resume: async (args: { query: string }) => {
      // Stub convention: batch-verify the top claims in one call.
      if (args.query === "__top_skills__") {
        const topSkills = (enriched?.skills ?? []).slice(0, 5).map((s: any) => s.label ?? s.raw);
        const topTitles = (enriched?.experience ?? []).slice(0, 2).map((e: any) => e.raw?.title).filter(Boolean);
        const claims = [...topSkills, ...topTitles];
        return {
          perClaim: claims.map((c: string) => {
            const r = searchText(textLower, resumeText, c);
            return { claim: c, found: r.found, snippet: r.snippet };
          }),
        };
      }
      return searchText(textLower, resumeText, args.query);
    },

    check_date_consistency: async () => {
      const exps = (enriched?.experience ?? [])
        .map((e: any) => ({
          title: e.raw?.title ?? "role",
          company: e.companyLabel ?? e.raw?.company ?? "?",
          start: e.startDate?.iso ?? null,
          end: e.endDate?.iso ?? null,
          tenureMonths: e.tenureMonths ?? 0,
        }))
        .filter((e: any) => e.start)
        .sort((a: any, b: any) => (a.start < b.start ? -1 : 1));

      const anomalies: string[] = [];
      for (let i = 0; i < exps.length; i++) {
        const e = exps[i];
        if (e.end && e.end < e.start) anomalies.push(`Impossible dates at ${e.company}: ends (${e.end}) before it starts (${e.start}).`);
        if (e.tenureMonths > 0 && e.tenureMonths < 2) anomalies.push(`Very short tenure (${e.tenureMonths}mo) at ${e.company}.`);
        if (i > 0) {
          const prev = exps[i - 1];
          const prevEnd = prev.end ?? new Date().toISOString().slice(0, 10);
          // gap in months between prevEnd and this start
          const gapMo = monthsBetweenIso(prevEnd, e.start);
          if (gapMo > 6) anomalies.push(`~${gapMo}-month gap between ${prev.company} and ${e.company}.`);
          if (e.start < prevEnd) anomalies.push(`Overlapping roles: ${prev.company} and ${e.company} overlap.`);
        }
      }
      return { positionsAnalyzed: exps.length, anomalies };
    },

    lookup_github: async (args: { handle: string }) => {
      try {
        const profile: any = await fetchGithubProfile(args.handle);
        if (!profile) return { found: false, summary: "GitHub profile not reachable or rate-limited." };
        const langs = profile.topLanguages ?? profile.languages ?? [];
        return {
          found: true,
          summary: `Public GitHub @${args.handle}: ${profile.publicRepos ?? profile.public_repos ?? "?"} repos, ${profile.followers ?? "?"} followers${langs.length ? `, languages: ${langs.slice(0, 6).join(", ")}` : ""}.`,
        };
      } catch (err) {
        logger.warn({ err }, "lookup_github failed");
        return { found: false, summary: "GitHub lookup failed." };
      }
    },
  };
}

function monthsBetweenIso(aIso: string, bIso: string): number {
  const a = new Date(aIso + (aIso.length <= 7 ? "-01" : "")), b = new Date(bIso + (bIso.length <= 7 ? "-01" : ""));
  return Math.round((b.getTime() - a.getTime()) / (30.44 * 86400_000));
}
