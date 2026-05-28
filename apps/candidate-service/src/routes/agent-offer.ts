/**
 * Offer route — drafts a compensation offer for an application via the
 * offer agent.
 *
 * POST /internal/offer  { applicationId, candidateExpectation?, hiringManagerNotes? }
 *
 * Caller passes the comp band; if omitted we use a default range based on
 * the requisition's salaryMin/Max. Market data is optional.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId, getUserId, createLogger, requireRole } from "@cdc-ats/common";
import {
  runAgent,
  publishAgentCompleted,
  type OfferInput,
  type OfferOutput,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";

const logger = createLogger({ serviceName: "candidate-service:offer" });
const router = Router();

const RequestSchema = z.object({
  applicationId: z.string().uuid(),
  compBand: z
    .object({
      min: z.number().min(0),
      mid: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().default("USD"),
    })
    .optional(),
  marketRate: z
    .object({
      p25: z.number(),
      p50: z.number(),
      p75: z.number(),
      currency: z.string().default("USD"),
    })
    .optional(),
  candidateExpectation: z.number().optional(),
  candidateCurrentSalary: z.number().optional(),
  interviewSignal: z.enum(["STRONG_HIRE", "HIRE", "NEUTRAL", "NO_HIRE"]).optional(),
  hiringManagerNotes: z.string().max(2000).optional(),
});

// Phase 27 F-028-micro-P1: offer drafting is sensitive — recruiter/admin only.
router.post("/", requireRole("ADMIN", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = RequestSchema.parse(req.body);

    // 1. Load application + candidate
    const application = await prisma.application.findFirst({
      where: { id: body.applicationId, tenantId },
      include: { candidate: true },
    });
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: "APPLICATION_NOT_FOUND", message: `Application ${body.applicationId} not found` },
      });
    }

    // 2. Fetch requisition from job-service for title/level/department + salary
    const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
    const reqRes = await fetch(`${jobUrl}/internal/requisitions/${application.requisitionId}`, {
      headers: {
        "X-User-Id": userId ?? "",
        "X-Tenant-Id": tenantId,
        "X-User-Role": (req.headers["x-user-role"] as string) ?? "ADMIN",
      },
    });
    if (!reqRes.ok) {
      return res.status(404).json({
        success: false,
        error: { code: "REQUISITION_NOT_FOUND", message: `Requisition for application not found` },
      });
    }
    const reqBody: any = await reqRes.json();
    const requisition = reqBody.data;

    // 3. Build comp band: use body if provided, else infer from requisition salary
    const compBand = body.compBand ?? {
      min: requisition.salaryMin ?? 80000,
      mid: ((requisition.salaryMin ?? 80000) + (requisition.salaryMax ?? 140000)) / 2,
      max: requisition.salaryMax ?? 140000,
      currency: requisition.salaryCurrency ?? "USD",
    };

    // 4. Run the agent
    const agentInput: OfferInput = {
      jobTitle: requisition.title,
      level: requisition.level ?? "Mid",
      department: requisition.department,
      compBand,
      ...(body.marketRate ? { marketRate: body.marketRate } : {}),
      candidate: {
        skills: (application.candidate.tags ?? []) as string[],
        ...(body.candidateExpectation != null ? { expectation: body.candidateExpectation } : {}),
        ...(body.candidateCurrentSalary != null ? { currentSalary: body.candidateCurrentSalary } : {}),
      },
      ...(body.interviewSignal ? { interviewSignal: body.interviewSignal } : {}),
      ...(body.hiringManagerNotes ? { hiringManagerNotes: body.hiringManagerNotes } : {}),
    };

    const result = await runAgent<OfferInput, OfferOutput>({
      agentType: "offer",
      input: agentInput,
      context: { tenantId, userId, persistRun: publishAgentCompleted(logger) },
    });

    ok(res, {
      ...result.output,
      applicationId: application.id,
      candidateId: application.candidateId,
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
