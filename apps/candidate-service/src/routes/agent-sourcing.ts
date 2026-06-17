/**
 * Sourcing route — ranks the tenant's candidate pool against a requisition
 * via the sourcing agent.
 *
 * POST /internal/sourcing  { requisitionId, maxResults? }
 *
 * Caller must POST the requisitionId; we fetch the requisition over HTTP
 * from job-service (no cross-service DB access), pull the local candidate
 * pool, run the agent, return rankings.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId, getUserId, createLogger, requireRole } from "@cdc-ats/common";
import {
  runAgent,
  runAgenticAgent,
  hasAgenticAgent,
  realLLMAvailable,
  publishAgentCompleted,
  type SourcingInput,
  type SourcingOutput,
  type AgenticSourcingInput,
  type AgenticSourcingOutput,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";
import { buildSourcingTools } from "../lib/sourcing-tools.js";
import { matchCandidates, embedCandidate } from "../lib/matching.js";

const logger = createLogger({ serviceName: "candidate-service:sourcing" });
const router = Router();

const RequestSchema = z.object({
  requisitionId: z.string().uuid(),
  maxResults: z.number().int().min(1).max(50).optional(),
});

// Phase 27 F-028-micro-P1: sourcing agent is recruiter/admin only.
router.post("/", requireRole("ADMIN", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const { requisitionId, maxResults } = RequestSchema.parse(req.body);

    // 1. Fetch requisition from job-service
    const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
    const reqRes = await fetch(`${jobUrl}/internal/requisitions/${requisitionId}`, {
      headers: {
        "X-User-Id": userId ?? "",
        "X-Tenant-Id": tenantId,
        "X-User-Role": (req.headers["x-user-role"] as string) ?? "ADMIN",
      },
    });
    if (!reqRes.ok) {
      return res.status(404).json({
        success: false,
        error: { code: "REQUISITION_NOT_FOUND", message: `Requisition ${requisitionId} not found` },
      });
    }
    const reqBody: any = await reqRes.json();
    const requisition = reqBody.data;
    const requirements: string[] = Array.isArray(requisition.requirements)
      ? requisition.requirements
      : [];

    // ── Agentic path: the agent drives its OWN search via tools ──────────────
    // Set AGENTIC_SOURCING=0 to fall back to the single-shot ranker.
    const useAgentic = hasAgenticAgent("sourcing") && process.env["AGENTIC_SOURCING"] !== "0";

    if (useAgentic) {
      const toolImpls = buildSourcingTools({ tenantId, userId, logger });
      const ag = await runAgenticAgent<AgenticSourcingInput, AgenticSourcingOutput>({
        agentType: "sourcing",
        input: {
          requisitionId: requisition.id,
          jobTitle: requisition.title,
          department: requisition.department,
          requirements,
          ...(maxResults != null ? { maxResults } : {}),
        },
        context: { tenantId, userId, toolImpls, persistRun: publishAgentCompleted(logger) },
      });
      logger.info(
        {
          requisitionId: requisition.id,
          toolsUsed: ag.toolsUsed,
          steps: ag.steps.length,
          returned: ag.output.candidates.length,
          shortlisted: ag.output.candidates.filter((c) => c.shortlisted).length,
        },
        "Agentic sourcing finished (ReAct loop)",
      );
      return ok(res, {
        ...ag.output,
        agentRunId: ag.agentRunId,
        toolsUsed: ag.toolsUsed,
        steps: ag.steps.length,
        agentTrace: ag.steps,
        tokensUsed: ag.snapshot.tokensIn + ag.snapshot.tokensOut,
        costUsd: ag.snapshot.costUsd,
        modelName: ag.snapshot.modelName,
      });
    }

    // ── Single-shot fallback: pre-fetch pool and rank ───────────────────────
    const candidates = await prisma.candidate.findMany({
      where: { tenantId },
      take: 200,
      orderBy: { createdAt: "desc" },
    });
    const candidatePool: SourcingInput["candidatePool"] = candidates.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim(),
      skills: (c.tags ?? []) as string[],
      yearsOfExperience: undefined,
      summary: c.summary ?? undefined,
      source: "database" as const,
    }));

    const result = await runAgent<SourcingInput, SourcingOutput>({
      agentType: "sourcing",
      input: {
        requisition: {
          id: requisition.id,
          title: requisition.title,
          department: requisition.department,
          description: requisition.description,
          requirements,
        },
        candidatePool,
        ...(maxResults != null ? { maxResults } : {}),
      },
      context: { tenantId, userId, persistRun: publishAgentCompleted(logger) },
    });

    ok(res, {
      ...result.output,
      agentRunId: result.agentRunId,
      tokensUsed: result.snapshot.tokensIn + result.snapshot.tokensOut,
      costUsd: result.snapshot.costUsd,
      modelName: result.snapshot.modelName,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /internal/sourcing/search ──────────────────────────────────────
// Free-text "who I need" → REAL AI ranking of the tenant's OWN candidate
// pool. This is what the /sourcing page button calls.
//   body:   { query: string, limit?: number }
//   ranks: the tenant's real Candidate rows (parsed resume text + skills +
//          summary) against `query` using the real LLM (sourcing agent, Groq
//          via the ai-engine). Falls back to a real keyword/skill score over
//          the same rows if the LLM is unavailable. Never invents people.
//   returns: { query, scanned, usedLLM, matches: [{ candidateId, name, role,
//             score (0-100 fit), evidence }], summary?, agentRunId?, ... }

/** Flatten parsed skills (string | {label}|{id}|{raw}) to a lowercased list. */
function parsedSkillList(parsed: any): string[] {
  const raw = parsed?.skills;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s: any) => (typeof s === "string" ? s : s?.label ?? s?.raw ?? s?.id ?? ""))
    .filter(Boolean);
}

/** Best-effort current role/title from real parsed data — never fabricated. */
function deriveRole(c: { summary?: string | null; parsedSummary?: any }): string {
  const p = c.parsedSummary ?? {};
  if (typeof p.headline === "string" && p.headline.trim()) return p.headline.trim();
  if (Array.isArray(p.experience) && p.experience.length) {
    const e = p.experience[0];
    const title = e?.raw?.title ?? e?.title ?? "";
    const company = e?.companyLabel ?? e?.raw?.company ?? "";
    const joined = [title, company].filter(Boolean).join(" @ ");
    if (joined) return joined;
  }
  return "";
}

/** Signal-dense profile text fed to the LLM ranker (real candidate data only). */
function profileSummary(c: {
  summary?: string | null; tags?: string[]; parsedSummary?: any;
}): string {
  const p = c.parsedSummary ?? {};
  const skills = parsedSkillList(p);
  const tags = (c.tags ?? []) as string[];
  const allSkills = Array.from(new Set([...skills, ...tags]));
  const exp = Array.isArray(p.experience)
    ? p.experience
        .map((e: any) => `${e?.raw?.title ?? e?.title ?? ""} ${e?.companyLabel ?? e?.raw?.company ?? ""}`.trim())
        .filter(Boolean)
    : [];
  const parts = [
    c.summary ?? p.summary ?? "",
    typeof p.totalYearsExperience === "number" ? `${p.totalYearsExperience} years total experience` : "",
    allSkills.length ? `Skills: ${allSkills.slice(0, 30).join(", ")}` : "",
    exp.length ? `Experience: ${exp.slice(0, 8).join("; ")}` : "",
  ];
  return parts.filter(Boolean).join("\n").trim();
}

const SearchSchema = z.object({
  query: z.string().min(2).max(2000),
  limit: z.number().int().min(1).max(50).optional(),
});

router.post("/search", requireRole("ADMIN", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const { query, limit } = SearchSchema.parse(req.body);
    const max = limit ?? 10;

    // 1. Load the tenant's REAL candidate pool (RLS-scoped). This is the
    //    knowledge base — no external data, no fabricated rows.
    const candidates = await prisma.candidate.findMany({
      where: { tenantId },
      take: 500,
      orderBy: { createdAt: "desc" },
    });

    // 2. Honest empty — the tenant simply has no candidates yet.
    if (candidates.length === 0) {
      return ok(res, {
        query,
        scanned: 0,
        usedLLM: false,
        matches: [],
        summary: "No candidates in your pool yet. Import or receive applications to build a searchable talent base.",
      });
    }

    // Pre-compute per-candidate derived role + profile text from real data.
    const enriched = candidates.map((c) => ({
      row: c,
      name: `${c.firstName} ${c.lastName}`.trim(),
      role: deriveRole(c),
      profile: profileSummary(c),
      skills: Array.from(
        new Set([...(c.tags ?? []), ...parsedSkillList(c.parsedSummary)]),
      ),
    }));

    // Pre-rank by lightweight keyword/skill relevance. Used to (a) feed the LLM a
    // SHORTLIST that fits the model's tokens-per-minute budget (sending all rows
    // overflows Groq's free-tier TPM), and (b) drive the no-LLM fallback.
    const terms = Array.from(
      new Set(
        query
          .toLowerCase()
          .split(/[^a-z0-9+#.]+/i)
          .map((t) => t.trim())
          .filter((t) => t.length >= 2),
      ),
    );
    const ranked = enriched
      .map((e) => {
        const hay = `${e.name} ${e.role} ${e.profile} ${e.skills.join(" ")}`.toLowerCase();
        const skillBag = e.skills.map((s) => s.toLowerCase());
        const hits = terms.filter((t) => skillBag.some((s) => s.includes(t)) || hay.includes(t));
        return { e, score: terms.length ? Math.round((hits.length / terms.length) * 100) : 0, hits };
      })
      .sort((a, b) => b.score - a.score);
    // The LLM only sees the most-relevant slice (or the first N on a vague query),
    // with tight per-candidate summaries, so the prompt stays under the TPM limit.
    const LLM_POOL = 30;
    const llmShortlist = (ranked.some((r) => r.score > 0) ? ranked.filter((r) => r.score > 0) : ranked).slice(0, LLM_POOL);

    // 3. Real LLM ranking via the sourcing agent (Groq through the ai-engine).
    //    We treat the free-text query as the requisition's title+requirements
    //    so the agent's evidence is grounded in the real candidate profiles.
    if (realLLMAvailable("claude-sonnet-4-20250514")) {
      try {
        const candidatePool: SourcingInput["candidatePool"] = llmShortlist.map(({ e }) => ({
          id: e.row.id,
          name: e.name,
          skills: e.skills.slice(0, 12),
          ...(e.profile ? { summary: `${e.role ? e.role + ". " : ""}${e.profile}`.slice(0, 220) } : {}),
          source: "database" as const,
        }));

        const result = await runAgent<SourcingInput, SourcingOutput>({
          agentType: "sourcing",
          input: {
            requisition: {
              id: "free-text-search",
              title: query,
              department: "",
              description: `Find candidates matching this request: ${query}`,
              requirements: [query],
            },
            candidatePool,
            maxResults: max,
          },
          context: { tenantId, userId, persistRun: publishAgentCompleted(logger) },
        });

        const byId = new Map(enriched.map((e) => [e.row.id, e]));
        const matches = result.output.candidates
          .map((c) => {
            const e = byId.get(c.id);
            if (!e) return null; // drop anything not in the real pool
            return {
              candidateId: c.id,
              name: e.name || c.name,
              role: e.role,
              score: Math.round(Math.max(0, Math.min(1, c.matchScore)) * 100),
              evidence: c.rationale,
            };
          })
          .filter((m): m is NonNullable<typeof m> => m !== null)
          .sort((a, b) => b.score - a.score)
          .slice(0, max);

        logger.info({ scanned: candidates.length, returned: matches.length }, "AI sourcing search finished");
        return ok(res, {
          query,
          scanned: candidates.length,
          usedLLM: true,
          matches,
          summary: result.output.summary,
          agentRunId: result.agentRunId,
          tokensUsed: result.snapshot.tokensIn + result.snapshot.tokensOut,
          costUsd: result.snapshot.costUsd,
          modelName: result.snapshot.modelName,
        });
      } catch (err) {
        // LLM failed mid-run — fall through to the real keyword scorer below
        // rather than 500ing. Still real data, just no LLM.
        logger.warn({ err }, "AI sourcing LLM failed; falling back to keyword match");
      }
    }

    // 4. Fallback — real keyword/skill scoring over the real rows (reusing the
    //    pre-ranking above). No invented people; evidence cites matched terms.
    const scored = ranked.filter((x) => x.score > 0).slice(0, max);

    return ok(res, {
      query,
      scanned: candidates.length,
      usedLLM: false,
      matches: scored.map((x) => ({
        candidateId: x.e.row.id,
        name: x.e.name,
        role: x.e.role,
        score: x.score,
        evidence: x.hits.length
          ? `Keyword match on ${x.hits.slice(0, 6).join(", ")} (LLM ranking unavailable).`
          : "Partial match (LLM ranking unavailable).",
      })),
      summary: `Matched ${scored.length} of ${candidates.length} candidates by keyword/skill overlap (AI ranker unavailable).`,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /internal/sourcing/match ───────────────────────────────────────
// Direct ML vector match: rank candidates by embedding similarity to a job's
// requirements (or free text). Non-agentic; powers a "Best matches" surface.
const MatchSchema = z.object({
  requisitionId: z.string().uuid().optional(),
  text: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
router.post("/match", requireRole("ADMIN", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = MatchSchema.parse(req.body);
    let queryText = body.text ?? "";
    if (!queryText && body.requisitionId) {
      const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
      const r = await fetch(`${jobUrl}/internal/requisitions/${body.requisitionId}`, {
        headers: { "X-User-Id": userId ?? "", "X-Tenant-Id": tenantId, "X-User-Role": (req.headers["x-user-role"] as string) ?? "ADMIN" },
      });
      if (r.ok) {
        const reqData: any = ((await r.json()) as any).data;
        const reqs = Array.isArray(reqData?.requirements) ? reqData.requirements.join(", ") : "";
        queryText = `${reqData?.title ?? ""}\n${reqData?.description ?? ""}\n${reqs}`.trim();
      }
    }
    if (!queryText) {
      return res.status(400).json({ success: false, error: { code: "NO_QUERY", message: "Provide text or a requisitionId" } });
    }
    const result = await matchCandidates({ tenantId, queryText, limit: body.limit ?? 25, logger });
    if (!result.available) {
      return res.status(503).json({ success: false, error: { code: "EMBEDDINGS_OFF", message: "Embeddings not configured (set OPENAI_API_KEY/EMBEDDINGS_API_KEY)." } });
    }
    ok(res, { matches: result.matches, scanned: result.scanned });
  } catch (err) { next(err); }
});

// ── POST /internal/sourcing/embed-backfill ──────────────────────────────
// Embed candidates that don't have a vector yet (e.g. parsed before this
// feature). Processes up to `limit` per call; call repeatedly to drain.
router.post("/embed-backfill", requireRole("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const limit = Math.min(200, Math.max(1, Number(req.body?.limit) || 100));
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "Candidate"
      WHERE "tenantId" = ${tenantId} AND "embedding" IS NULL AND "parsedSummary" IS NOT NULL
      LIMIT ${limit}
    `;
    let embedded = 0;
    for (const row of rows) {
      if (await embedCandidate(row.id, tenantId, logger)) embedded++;
    }
    ok(res, { candidatesProcessed: rows.length, embedded, remainingHint: rows.length === limit ? "more may remain — call again" : "drained" });
  } catch (err) { next(err); }
});

export default router;
