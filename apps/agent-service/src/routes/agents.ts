import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { runAgent, hasAgenticAgent, type AgentRunSnapshot } from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Single-shot agents (one structured generateObject pass, no service-specific
// investigation tools) — these can run centrally here.
const SINGLE_SHOT = [
  "jd-author", "interview-kit", "interview-questions", "cover-letter-analyzer",
  "analytics", "bias-auditor", "offer", "sourcing", "interview-intelligence",
  "scheduling", "candidate-experience", "copilot", "resume-parser", "screening",
  "github-corroborator",
] as const;

// Agentic (ReAct + tools that read the owning service's DB) — stay in their
// owning service for now; they migrate to a tool-callback protocol later.
const AGENTIC_IN_OWNING_SERVICE = [
  "candidate-screener", "sourcing", "scheduling", "copilot", "analytics",
  "candidate-experience", "offer", "bias-auditor", "resume-verifier",
];

// GET /internal/agents/registry — what this service can run vs. what is hosted elsewhere.
router.get("/registry", async (_req: Request, res: Response) => {
  ok(res, { singleShot: SINGLE_SHOT, agenticHostedInOwningService: AGENTIC_IN_OWNING_SERVICE });
});

// POST /internal/agents/run  { agentType, input }
const RunBody = z.object({ agentType: z.string().min(1), input: z.record(z.any()).default({}) });
router.post("/run", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const { agentType, input } = RunBody.parse(req.body);
    if (hasAgenticAgent(agentType as any)) {
      throw Errors.validation(
        `'${agentType}' is an agentic (tool-using) agent and currently runs inside its owning service.`,
      );
    }
    const persistRun = async (run: AgentRunSnapshot) => {
      await prisma.agentRun
        .create({
          data: {
            id: run.agentRunId, tenantId: run.tenantId, agentType: run.agentType, status: run.status,
            inputHash: run.inputHash, tokensIn: run.tokensIn, tokensOut: run.tokensOut, costUsd: run.costUsd,
            latencyMs: run.latencyMs, modelName: run.modelName, iterations: run.iterations,
            errorMessage: run.errorMessage ?? null, triggeredByUserId: run.userId,
          },
        })
        .catch(() => {});
    };
    const result = await runAgent({ agentType: agentType as any, input, context: { tenantId, userId, persistRun } });
    ok(res, { agentRunId: result.agentRunId, output: result.output, snapshot: result.snapshot });
  } catch (err) { next(err); }
});

// GET /internal/agents/runs/:id
router.get("/runs/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const row = await prisma.agentRun.findFirst({ where: { id, tenantId } });
    if (!row) throw Errors.notFound("AgentRun");
    ok(res, row);
  } catch (err) { next(err); }
});

// GET /internal/agents/runs?agentType=&limit=
router.get("/runs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const agentType = req.query["agentType"] as string | undefined;
    const where: { tenantId: string; agentType?: string } = { tenantId };
    if (agentType) where.agentType = agentType;
    const rows = await prisma.agentRun.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
    ok(res, rows);
  } catch (err) { next(err); }
});

export default router;
