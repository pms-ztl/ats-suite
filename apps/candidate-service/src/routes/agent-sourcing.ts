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
  publishAgentCompleted,
  type SourcingInput,
  type SourcingOutput,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

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

    // 2. Build candidate pool from this tenant's candidates
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

    // 3. Run the agent
    const result = await runAgent<SourcingInput, SourcingOutput>({
      agentType: "sourcing",
      input: {
        requisition: {
          id: requisition.id,
          title: requisition.title,
          department: requisition.department,
          description: requisition.description,
          requirements: Array.isArray(requisition.requirements) ? requisition.requirements : [],
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

export default router;
