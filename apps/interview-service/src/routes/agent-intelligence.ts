/**
 * Interview Intelligence route — analyzes a transcript into a scorecard via
 * the interview-intelligence agent.
 *
 * POST /internal/interview-intelligence
 *   { interviewId, transcript, durationMinutes? }
 *
 * Loads the interview + round + requisition to feed the agent the job
 * context. Persists the scorecard back to the InterviewFeedback record.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId, getUserId, createLogger, requireRole } from "@cdc-ats/common";
import {
  runAgent,
  publishAgentCompleted,
  type InterviewIntelligenceInput,
  type InterviewIntelligenceOutput,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

const logger = createLogger({ serviceName: "interview-service:intelligence" });
const router = Router();

const RequestSchema = z.object({
  interviewId: z.string().uuid(),
  transcript: z.string().min(50).max(50000),
  durationMinutes: z.number().int().min(1).max(600).optional(),
});

// Phase 27 F-028-micro-P1: any tenant user (incl. interviewer who just finished
// the interview and wants the transcript analyzed).
router.post("/", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = RequestSchema.parse(req.body);

    // 1. Load interview + round
    const interview = await prisma.interview.findFirst({
      where: { id: body.interviewId, tenantId },
      include: { round: true },
    });
    if (!interview) {
      return res.status(404).json({
        success: false,
        error: { code: "INTERVIEW_NOT_FOUND", message: `Interview ${body.interviewId} not found` },
      });
    }

    // 2. Fetch requisition from job-service
    const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
    const reqRes = await fetch(`${jobUrl}/internal/requisitions/${interview.requisitionId}`, {
      headers: {
        "X-User-Id": userId ?? "",
        "X-Tenant-Id": tenantId,
        "X-User-Role": (req.headers["x-user-role"] as string) ?? "ADMIN",
      },
    });
    if (!reqRes.ok) {
      return res.status(404).json({
        success: false,
        error: { code: "REQUISITION_NOT_FOUND", message: `Requisition for interview not found` },
      });
    }
    const reqBody: any = await reqRes.json();
    const requisition = reqBody.data;

    // 3. Run agent
    const result = await runAgent<InterviewIntelligenceInput, InterviewIntelligenceOutput>({
      agentType: "interview-intelligence",
      input: {
        transcript: body.transcript,
        jobTitle: requisition.title,
        jobRequirements: Array.isArray(requisition.requirements) ? requisition.requirements : [],
        interviewType: interview.round?.interviewType ?? "GENERAL",
        ...(body.durationMinutes != null ? { durationMinutes: body.durationMinutes } : {}),
      },
      context: { tenantId, userId, persistRun: publishAgentCompleted(logger) },
    });

    ok(res, {
      ...result.output,
      interviewId: interview.id,
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
