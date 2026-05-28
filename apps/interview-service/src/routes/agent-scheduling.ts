/**
 * Scheduling route — picks optimal interview slots via the scheduling agent.
 *
 * POST /internal/scheduling
 *   { participants[], durationMinutes, dateRange, timezone, preferences? }
 *
 * The caller (frontend / future calendar integration) provides per-
 * participant busy windows. The agent ranks possible slots.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, getTenantId, getUserId, createLogger, requireRole } from "@cdc-ats/common";
import {
  runAgent,
  runAgenticAgent,
  hasAgenticAgent,
  publishAgentCompleted,
  type SchedulingInput,
  type SchedulingOutput,
  type AgenticSchedulingInput,
  type AgenticSchedulingOutput,
} from "@cdc-ats/ai-engine";
import { buildSchedulingTools } from "../lib/scheduling-tools.js";

const logger = createLogger({ serviceName: "interview-service:scheduling" });
const router = Router();

const RequestSchema = z.object({
  participants: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.enum(["interviewer", "candidate", "hiring_manager"]),
        busyWindows: z
          .array(z.object({ start: z.string(), end: z.string() }))
          .default([]),
      }),
    )
    .min(1)
    .max(10),
  durationMinutes: z.number().int().min(15).max(240),
  dateRange: z.object({ start: z.string(), end: z.string() }),
  timezone: z.string().default("America/Los_Angeles"),
  preferences: z
    .object({
      preferMorning: z.boolean().optional(),
      avoidFridayAfternoon: z.boolean().optional(),
      minimumNoticeDays: z.number().int().min(0).max(30).optional(),
    })
    .optional(),
  // Optional booking context — when present, the agentic scheduler may create
  // the Interview row itself instead of only proposing slots.
  candidateId: z.string().optional(),
  requisitionId: z.string().optional(),
  stage: z.string().optional(),
});

// Phase 27 F-028-micro-P1: scheduling agent is admin/recruiter only.
router.post("/", requireRole("ADMIN", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = RequestSchema.parse(req.body);

    // ── Agentic path: agent computes slots, checks load, and may BOOK ────────
    // Set AGENTIC_SCHEDULING=0 to fall back to the single-shot proposer.
    const useAgentic = hasAgenticAgent("scheduling") && process.env["AGENTIC_SCHEDULING"] !== "0";

    if (useAgentic) {
      const toolImpls = buildSchedulingTools({
        tenantId,
        userId,
        logger,
        participants: body.participants,
        durationMinutes: body.durationMinutes,
        ...(body.preferences ? { preferences: body.preferences } : {}),
        ...(body.candidateId ? { candidateId: body.candidateId } : {}),
        ...(body.requisitionId ? { requisitionId: body.requisitionId } : {}),
        ...(body.stage ? { stage: body.stage } : {}),
      });
      const ag = await runAgenticAgent<AgenticSchedulingInput, AgenticSchedulingOutput>({
        agentType: "scheduling",
        input: body as AgenticSchedulingInput,
        context: { tenantId, userId, toolImpls, persistRun: publishAgentCompleted(logger) },
      });
      logger.info(
        { toolsUsed: ag.toolsUsed, steps: ag.steps.length, booked: ag.output.booked },
        "Agentic scheduling finished (ReAct loop)",
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

    const result = await runAgent<SchedulingInput, SchedulingOutput>({
      agentType: "scheduling",
      input: body as SchedulingInput,
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
