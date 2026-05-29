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
