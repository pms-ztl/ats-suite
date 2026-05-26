/**
 * Candidate Experience route — chat assistant for candidates asking about
 * their application status.
 *
 * POST /internal/candidate-experience  { candidateId, message, conversationHistory? }
 *
 * Reads the candidate's most recent active application + any upcoming
 * interview, then runs the agent. The agent decides whether to escalate
 * to a human recruiter.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId, getUserId, createLogger } from "@cdc-ats/common";
import {
  runAgent,
  publishAgentCompleted,
  type CandidateExperienceInput,
  type CandidateExperienceOutput,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

const logger = createLogger({ serviceName: "candidate-service:experience" });
const router = Router();

const RequestSchema = z.object({
  candidateId: z.string().uuid(),
  message: z.string().min(1).max(4000),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(20)
    .optional(),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = RequestSchema.parse(req.body);

    // 1. Load candidate + their most recent active application
    const candidate = await prisma.candidate.findFirst({
      where: { id: body.candidateId, tenantId },
      include: {
        applications: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: { code: "CANDIDATE_NOT_FOUND", message: `Candidate ${body.candidateId} not found` },
      });
    }

    // 2. Build application context (if any active app)
    let applicationContext: CandidateExperienceInput["applicationContext"] = null;
    const app = candidate.applications[0];
    if (app) {
      // Fetch requisition title from job-service
      const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
      const reqRes = await fetch(`${jobUrl}/internal/requisitions/${app.requisitionId}`, {
        headers: {
          "X-User-Id": userId ?? "",
          "X-Tenant-Id": tenantId,
          "X-User-Role": (req.headers["x-user-role"] as string) ?? "ADMIN",
        },
      });
      const jobTitle = reqRes.ok ? (await reqRes.json() as any).data.title : "your role";

      applicationContext = {
        jobTitle,
        stage: app.stage,
        status: app.status,
        appliedAt: app.createdAt.toISOString().slice(0, 10),
      };
    }

    // 3. Run the agent
    const agentInput: CandidateExperienceInput = {
      candidateName: candidate.firstName,
      message: body.message,
      ...(body.conversationHistory ? { conversationHistory: body.conversationHistory } : {}),
      applicationContext,
    };

    const result = await runAgent<CandidateExperienceInput, CandidateExperienceOutput>({
      agentType: "candidate-experience",
      input: agentInput,
      context: { tenantId, userId, persistRun: publishAgentCompleted(logger) },
    });

    ok(res, {
      ...result.output,
      candidateId: candidate.id,
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
