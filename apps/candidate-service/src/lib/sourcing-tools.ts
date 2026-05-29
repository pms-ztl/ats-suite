/**
 * Tool IMPLEMENTATIONS for the agentic sourcing agent.
 *
 * The ai-engine declares the interfaces; this supplies the bodies, which query
 * the candidate-service DB directly. Injected into the agentic runtime via
 * AgenticContext.toolImpls by the sourcing route.
 *
 *   search_candidates      → query the pool (act)
 *   get_candidate_detail   → verify a match (observe)
 *   check_prior_engagement → skip in-pipeline candidates (MEMORY)
 *   shortlist_candidate    → write a recruiter-visible note (ACTION)
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";
import { matchCandidates } from "./matching.js";

/** Pull a flat lowercased skill list out of the Phase 37 parsedSummary blob. */
function skillsFromParsed(parsed: any): string[] {
  const raw = parsed?.skills;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s: any) => (typeof s === "string" ? s : s?.label ?? s?.id ?? ""))
    .filter(Boolean)
    .map((s: string) => s.toLowerCase());
}

function candidateSkillBag(c: any): string[] {
  const tags = (c.tags ?? []).map((t: string) => t.toLowerCase());
  return Array.from(new Set([...tags, ...skillsFromParsed(c.parsedSummary)]));
}

export function buildSourcingTools(opts: {
  tenantId: string;
  userId: string | null;
  logger: Logger;
}): Record<string, ToolImpl> {
  const { tenantId, userId, logger } = opts;

  return {
    // ── act: semantic vector search (real ML matching) ─────────────────────────
    semantic_search_candidates: async (args: { query: string; limit?: number }) => {
      const r = await matchCandidates({ tenantId, queryText: args.query, limit: args.limit ?? 25, logger });
      if (!r.available) {
        return { available: false, note: "Embeddings not configured — use search_candidates (keyword) instead." };
      }
      return {
        available: true,
        scanned: r.scanned,
        candidates: r.matches.map((m) => ({
          id: m.id, name: m.name, skills: m.skills, matchScore: m.score, source: "semantic_search",
        })),
      };
    },

    // ── act: keyword search ────────────────────────────────────────────────────
    search_candidates: async (args: {
      skills?: string[];
      titleKeywords?: string[];
      minYears?: number;
      limit?: number;
    }) => {
      const limit = args.limit ?? 25;
      const skills = (args.skills ?? []).map((s) => s.toLowerCase());
      const kws = (args.titleKeywords ?? []).map((s) => s.toLowerCase());

      // In-memory match over the tenant's pool: case-insensitive, also matches
      // summary + parsed skills (more flexible than exact tag equality).
      const pool = await prisma.candidate.findMany({
        where: { tenantId },
        take: 500,
        orderBy: { createdAt: "desc" },
      });

      const scored = pool
        .map((c) => {
          const bag = candidateSkillBag(c);
          const hay = `${c.firstName} ${c.lastName} ${c.summary ?? ""}`.toLowerCase();
          const skillHits = skills.filter((s) => bag.some((b) => b.includes(s)) || hay.includes(s));
          const kwHits = kws.filter((k) => hay.includes(k));
          const score = skillHits.length + kwHits.length;
          return { c, score, skillHits };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return {
        count: scored.length,
        candidates: scored.map((x) => ({
          id: x.c.id,
          name: `${x.c.firstName} ${x.c.lastName}`.trim(),
          skills: candidateSkillBag(x.c).slice(0, 12),
          source: "database" as const,
          matchedOn: x.skillHits,
        })),
      };
    },

    // ── observe: verify ───────────────────────────────────────────────────────
    get_candidate_detail: async (args: { candidateId: string }) => {
      const c = await prisma.candidate.findFirst({
        where: { id: args.candidateId, tenantId },
      });
      if (!c) return { found: false, error: "candidate not found in this tenant" };
      const parsed: any = c.parsedSummary ?? {};
      return {
        found: true,
        name: `${c.firstName} ${c.lastName}`.trim(),
        location: c.location ?? null,
        summary: c.summary ?? parsed.summary ?? null,
        skills: parsed.skills ?? c.tags ?? [],
        experience: Array.isArray(parsed.experience)
          ? parsed.experience.map((e: any) => ({
              title: e.title,
              company: e.company,
              tenureMonths: e.tenureMonths,
            }))
          : [],
        totalYearsExperience: parsed.totalYearsExperience ?? null,
      };
    },

    // ── memory: skip in-pipeline ──────────────────────────────────────────────
    check_prior_engagement: async (args: { candidateId: string; requisitionId: string }) => {
      const app = await prisma.application.findFirst({
        where: { tenantId, candidateId: args.candidateId, requisitionId: args.requisitionId },
        select: { id: true, stage: true, status: true, appliedAt: true },
      });
      if (!app) return { alreadyEngaged: false };
      return {
        alreadyEngaged: true,
        stage: app.stage,
        status: app.status,
        appliedAt: app.appliedAt,
      };
    },

    // ── action: shortlist ─────────────────────────────────────────────────────
    shortlist_candidate: async (args: {
      candidateId: string;
      requisitionId: string;
      rationale: string;
    }) => {
      try {
        const note = await prisma.candidateNote.create({
          data: {
            tenantId,
            candidateId: args.candidateId,
            authorUserId: userId ?? "agent-sourcing",
            content: `🤖 Sourced by agent for requisition ${args.requisitionId}: ${args.rationale}`,
            isPrivate: false,
          },
        });
        logger.info(
          { candidateId: args.candidateId, requisitionId: args.requisitionId, noteId: note.id },
          "Sourcing agent shortlisted a candidate",
        );
        return { ok: true, shortlisted: true, noteId: note.id };
      } catch (err) {
        logger.error({ err }, "shortlist_candidate failed");
        return { ok: false, error: "could not shortlist" };
      }
    },
  };
}
