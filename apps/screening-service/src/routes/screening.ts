import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { runAgent, type ScreeningInput, type ScreeningOutput, type AgentRunSnapshot } from "@cdc-ats/ai-engine";
import { prisma, prismaAdmin } from "../lib/prisma.js";
import { fetchRequisition } from "../lib/service-client.js";

const router = Router();

// ── POST /internal/screening/score ───────────────────────────────────────
// Synchronous, candidate-LESS scoring: score raw resume TEXT against a
// requisition's requirements and return the verdict inline (no Screening row,
// no Candidate needed). Used by resume-service's bulk-archive worker to rank
// staging items by ATS score BEFORE any candidate is created. Reuses the same
// `candidate-screener` agent + requisition fetch as the async worker.
const ScoreBodySchema = z.object({
  requisitionId: z.string().min(1),
  resumeText: z.string(),
  resumeSkills: z.array(z.string()).optional(),
});
router.post("/score", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = ScoreBodySchema.parse(req.body);

    const resumeText = body.resumeText?.trim() ?? "";
    if (resumeText.length === 0) {
      throw Errors.validation("resumeText is required to score a resume");
    }

    const requisition = await fetchRequisition(body.requisitionId, tenantId);
    if (!requisition) throw Errors.notFound("Requisition");

    const jobRequirements = Array.isArray(requisition.requirements)
      ? (requisition.requirements as string[])
      : ["general experience"]; // same fallback as the async screening worker
    const jobTitle = requisition.title ?? "Unknown Role";

    // Persist the AgentRun (cost/usage audit) to this service's DB — mirrors
    // the screening worker's persistRun. Background-style write → admin client.
    const persistRun = async (run: AgentRunSnapshot) => {
      try {
        await prismaAdmin.agentRun.create({
          data: {
            id: run.agentRunId,
            tenantId: run.tenantId,
            agentType: run.agentType,
            status: run.status,
            inputHash: run.inputHash,
            tokensIn: run.tokensIn,
            tokensOut: run.tokensOut,
            costUsd: run.costUsd,
            latencyMs: run.latencyMs,
            modelName: run.modelName,
            triggeredByUserId: run.userId,
            errorMessage: run.errorMessage ?? null,
          },
        });
      } catch {
        /* audit write is best-effort; the score itself is the deliverable */
      }
    };

    const result = await runAgent<ScreeningInput, ScreeningOutput>({
      agentType: "candidate-screener",
      input: { resumeText, resumeSkills: body.resumeSkills, jobRequirements, jobTitle },
      context: { tenantId, userId, persistRun },
    });

    ok(res, {
      requisitionId: body.requisitionId,
      score: result.output.score,
      matchPercentage: result.output.matchPercentage,
      result: result.output.result,
      signals: result.output.signals,
      reasoning: result.output.reasoning,
      agentRunId: result.agentRunId,
    });
  } catch (err) { next(err); }
});

// GET /internal/screening?requisitionId=&status=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const candidateId = req.query["candidateId"] as string | undefined;
    const status = req.query["status"] as string | undefined;
    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;
    const rows = await prisma.screening.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
    ok(res, rows);
  } catch (err) { next(err); }
});

// GET /internal/screening/audit/:requisitionId
// Phase 5 — compliance / adverse-impact audit for a requisition's screenings.
// Deterministic (no LLM): score distribution + result breakdown + per-candidate
// decisions with evidence, for NYC LL144 / EU AI Act record-keeping. Protected-
// class attributes are intentionally not stored, so this surfaces the decision
// distribution + explainability rather than protected-class impact ratios.
// Declared BEFORE /:id so "audit" isn't captured as a screening id.
router.get("/audit/:requisitionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.params["requisitionId"] as string;
    const rows = await prisma.screening.findMany({
      where: { tenantId, requisitionId, status: "COMPLETED" },
      select: { candidateId: true, score: true, result: true, reasoning: true, signals: true, completedAt: true },
      orderBy: { score: "desc" },
    });
    const scores = rows
      .map((r) => r.score)
      .filter((s): s is number => typeof s === "number")
      .sort((a, b) => a - b);
    const byResult: Record<string, number> = { PASS: 0, REVIEW: 0, FAIL: 0 };
    for (const r of rows) if (r.result) byResult[r.result] = (byResult[r.result] ?? 0) + 1;
    const n = scores.length;
    const avg = n ? Math.round(scores.reduce((a, b) => a + b, 0) / n) : null;
    const median = n ? (n % 2 ? scores[(n - 1) / 2]! : Math.round((scores[n / 2 - 1]! + scores[n / 2]!) / 2)) : null;
    const passRate = rows.length ? Number((byResult["PASS"]! / rows.length).toFixed(2)) : 0;
    ok(res, {
      requisitionId,
      total: rows.length,
      byResult,
      passRate,
      score: { min: n ? scores[0] : null, max: n ? scores[n - 1] : null, avg, median },
      adverseImpactNote:
        "Protected-class attributes are intentionally not collected, so four-fifths / adverse-impact ratios cannot be computed here. This report provides the auditable decision distribution and per-candidate explainability required for NYC Local Law 144 / EU AI Act record-keeping; run a separate demographic bias audit on aggregated, voluntary self-ID data if available.",
      decisions: rows.map((r) => ({
        candidateId: r.candidateId,
        score: r.score,
        result: r.result,
        reasoning: r.reasoning,
        signals: r.signals,
        decidedAt: r.completedAt,
      })),
    });
  } catch (err) { next(err); }
});

// GET /internal/screening/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const row = await prisma.screening.findFirst({ where: { id, tenantId } });
    if (!row) throw Errors.notFound("Screening");
    ok(res, row);
  } catch (err) { next(err); }
});

export default router;
