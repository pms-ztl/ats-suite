/**
 * JD Author route — generates a job description via the jd-author agent.
 *
 * POST /internal/jd-author  → returns ParsedJD
 *
 * The agent runs against Claude when ANTHROPIC_API_KEY is set, otherwise
 * the deterministic stub. Cost/usage is persisted via the per-service
 * AgentRun model (in job_db).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId, getUserId } from "@cdc-ats/common";
import { runAgent, type JDAuthorInput, type JDAuthorOutput } from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

const router = Router();

const RequestSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().min(1).max(100),
  skills: z.array(z.string()).min(1).max(50),
  level: z.string().min(1).max(50),
  location: z.string().min(1).max(200),
  salaryRange: z.string().optional(),
  companyContext: z.string().max(2000).optional(),
  requisitionId: z.string().uuid().optional(),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = RequestSchema.parse(req.body);

    const { requisitionId, ...agentInput } = body;

    const result = await runAgent<JDAuthorInput, JDAuthorOutput>({
      agentType: "jd-author",
      input: agentInput,
      context: {
        tenantId,
        userId,
        persistRun: async (snapshot) => {
          await prisma.agentRun
            .create({
              data: {
                id: snapshot.agentRunId,
                tenantId: snapshot.tenantId,
                agentType: snapshot.agentType,
                status: snapshot.status,
                triggeredBy: snapshot.userId ?? "system",
                inputHash: snapshot.inputHash,
                tokensIn: snapshot.tokensIn,
                tokensOut: snapshot.tokensOut,
                costUsd: snapshot.costUsd,
                latencyMs: snapshot.latencyMs,
                modelName: snapshot.modelName,
                iterations: snapshot.iterations,
                errorMessage: snapshot.errorMessage,
                startedAt: snapshot.startedAt,
                completedAt: snapshot.completedAt,
              },
            })
            .catch(() => {
              /* AgentRun is denormalized telemetry — best effort */
            });
        },
      },
    });

    // If caller provided requisitionId, persist the description/requirements to it
    if (requisitionId) {
      await prisma.requisition
        .updateMany({
          where: { id: requisitionId, tenantId },
          data: {
            description: result.output.description,
            requirements: result.output.requirements as any,
          },
        })
        .catch(() => {
          /* Best effort — caller may have given a stale ID */
        });
    }

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

export default router;
