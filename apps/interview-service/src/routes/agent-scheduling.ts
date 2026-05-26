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
import { ok, getTenantId, getUserId, createLogger } from "@cdc-ats/common";
import {
  runAgent,
  publishAgentCompleted,
  type SchedulingInput,
  type SchedulingOutput,
} from "@cdc-ats/ai-engine";

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
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = RequestSchema.parse(req.body);

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
