/**
 * Screening worker — listens on `ai-screening` queue.
 * Triggered by:
 *   - NATS subscriber on resume.parsed (auto-screen)
 *   - Direct HTTP POST (manual re-screen)
 */
import { createWorker, publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";
import { runAgent } from "@cdc-ats/ai-engine";
import type { ScreeningInput, ScreeningOutput } from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";
import type { ScreeningJob } from "../lib/queue.js";
import type { Logger } from "pino";

export function startScreeningWorker(logger: Logger) {
  const worker = createWorker<ScreeningJob>(
    "ai-screening",
    async (job) => {
      const { candidateId, requisitionId, tenantId, userId, resumeId } = job.data;
      logger.info({ jobId: job.id, candidateId, requisitionId }, "Screening starting");

      // Fetch resume parsed data + requisition requirements via internal calls
      // For Phase 3 stub: synthesize minimal inputs from job data
      // In Phase 3.5 this becomes proper REST calls to resume-service + job-service
      const screening = await prisma.screening.create({
        data: {
          tenantId, candidateId, requisitionId,
          screeningType: "AI_ASSISTED",
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });

      try {
        const result = await runAgent<ScreeningInput, ScreeningOutput>({
          agentType: "candidate-screener",
          input: {
            resumeText: `Resume for candidate ${candidateId} (Phase 3 stub — full fetch in 3.5)`,
            resumeSkills: [],
            jobRequirements: ["TypeScript", "Node.js", "SQL"],
            jobTitle: "Engineer",
          },
          context: {
            tenantId, userId,
            persistRun: async (run) => {
              await prisma.agentRun.create({
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
              await publishEvent({
                subject: tenantSubject(run.tenantId, "agent", "completed"),
                type: "agent.completed",
                tenantId: run.tenantId,
                payload: {
                  tenantId: run.tenantId,
                  agentRunId: run.agentRunId,
                  agentType: run.agentType,
                  status: run.status,
                  tokensIn: run.tokensIn,
                  tokensOut: run.tokensOut,
                  costUsd: run.costUsd,
                  latencyMs: run.latencyMs,
                  triggeredByUserId: run.userId,
                },
              }).catch(() => {});
            },
          },
        });

        await prisma.screening.update({
          where: { id: screening.id },
          data: {
            status: "COMPLETED",
            result: result.output.result,
            score: result.output.score,
            matchPercentage: result.output.matchPercentage,
            signals: result.output.signals as any,
            reasoning: result.output.reasoning,
            agentRunId: result.agentRunId,
            completedAt: new Date(),
          },
        });

        // Publish screening.completed → interview-service may consume
        await publishEvent({
          subject: tenantSubject(tenantId, "screening", "completed"),
          type: "screening.completed",
          tenantId,
          payload: {
            tenantId,
            screeningId: screening.id,
            candidateId,
            requisitionId,
            result: result.output.result,
            score: result.output.score,
          },
        }).catch(() => {});

        return { screeningId: screening.id, result: result.output.result };
      } catch (err) {
        await prisma.screening.update({
          where: { id: screening.id },
          data: { status: "FAILED", completedAt: new Date() },
        });
        throw err;
      }
    },
    { concurrency: 2, limiter: { max: 5, duration: 60_000 } }
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "screening done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "screening failed"));
  logger.info("ai-screening worker started");
  return worker;
}
