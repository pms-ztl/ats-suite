/**
 * Screening worker — listens on `ai-screening` queue.
 * Triggered by:
 *   - NATS subscriber on resume.parsed (auto-screen)
 *   - Direct HTTP POST (manual re-screen)
 */
import { createWorker, publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";
import { runAgent, runAgenticAgent, hasAgenticAgent } from "@cdc-ats/ai-engine";
import type {
  ScreeningInput,
  ScreeningOutput,
  AgenticScreeningInput,
  AgenticScreeningOutput,
  AgentRunSnapshot,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";
import { fetchResume, fetchRequisition } from "../lib/service-client.js";
import { buildScreenerTools } from "../lib/screener-tools.js";
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

      // ── Phase 6b: fetch real cross-service data ──────────────────────
      const [resume, requisition] = await Promise.all([
        fetchResume(candidateId, tenantId),
        fetchRequisition(requisitionId, tenantId),
      ]);

      const resumeText = resume?.extractedText ?? "(no resume text available)";
      // parsedData is nested ({ raw|enriched: { skills:[{raw,confidence}] } }); unwrap + flatten.
      const _pd: any = resume?.parsedData ?? {};
      const _core: any = _pd.enriched ?? _pd.raw ?? _pd;
      const resumeSkills: string[] = (Array.isArray(_core.skills) ? _core.skills : [])
        .map((s: any) => (typeof s === "string" ? s : s?.raw ?? s?.name ?? null))
        .filter((s: any): s is string => typeof s === "string" && s.length > 0);
      const jobRequirements = Array.isArray(requisition?.requirements)
        ? (requisition.requirements as string[])
        : ["general experience"];   // fallback when requirements JSON isn't an array
      const jobTitle = requisition?.title ?? "Unknown Role";

      logger.info({
        candidateId, requisitionId,
        resumeFetched: !!resume, requisitionFetched: !!requisition,
        skillsCount: resumeSkills.length, requirementsCount: jobRequirements.length,
      }, "Fetched cross-service context for screening");

      // Shared persistence hook — writes AgentRun + emits agent.completed,
      // identical for both the single-shot and agentic execution paths.
      const persistRun = async (run: AgentRunSnapshot) => {
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
        try {
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
              modelName: run.modelName,
              iterations: run.iterations,
              triggeredByUserId: run.userId,
            },
          });
          logger.info({ agentRunId: run.agentRunId }, "Published agent.completed");
        } catch (err) {
          logger.error({ err, agentRunId: run.agentRunId }, "Failed to publish agent.completed");
        }
      };

      try {
        // ── Agentic path (genuine ReAct loop) when the agent is registered ────
        // Set AGENTIC_SCREENER=0 to fall back to the single-shot screener.
        const useAgentic =
          hasAgenticAgent("candidate-screener") && process.env["AGENTIC_SCREENER"] !== "0";

        let verdict: {
          result: ScreeningOutput["result"];
          score: number;
          matchPercentage: number;
          signals: string[];
          reasoning: string;
          agentRunId: string;
        };
        // Agentic-only: the full ReAct step trace, persisted for the UI.
        let agentTrace: unknown = null;
        // Agentic-only extras surfaced on the completion event (no schema change).
        let agenticMeta:
          | {
              confidence: number;
              recommendedAction: string;
              escalatedToHuman: boolean;
              toolsUsed: string[];
              stepCount: number;
              requirementFindings: AgenticScreeningOutput["requirementFindings"];
            }
          | null = null;

        if (useAgentic) {
          const toolImpls = buildScreenerTools({ tenantId, userId, logger });
          const ag = await runAgenticAgent<AgenticScreeningInput, AgenticScreeningOutput>({
            agentType: "candidate-screener",
            input: { candidateId, requisitionId, jobTitle },
            context: { tenantId, userId, toolImpls, persistRun },
          });
          logger.info(
            {
              candidateId,
              requisitionId,
              toolsUsed: ag.toolsUsed,
              steps: ag.steps.length,
              result: ag.output.result,
              confidence: ag.output.confidence,
              recommendedAction: ag.output.recommendedAction,
            },
            "Agentic screener finished (ReAct loop)",
          );
          verdict = {
            result: ag.output.result,
            score: ag.output.score,
            matchPercentage: ag.output.matchPercentage,
            signals: ag.output.signals,
            reasoning: ag.output.reasoning,
            agentRunId: ag.agentRunId,
          };
          agentTrace = ag.steps;
          agenticMeta = {
            confidence: ag.output.confidence,
            recommendedAction: ag.output.recommendedAction,
            escalatedToHuman: ag.output.escalatedToHuman,
            toolsUsed: ag.toolsUsed,
            stepCount: ag.steps.length,
            requirementFindings: ag.output.requirementFindings,
          };
        } else {
          const result = await runAgent<ScreeningInput, ScreeningOutput>({
            agentType: "candidate-screener",
            input: { resumeText, resumeSkills, jobRequirements, jobTitle },
            context: { tenantId, userId, persistRun },
          });
          verdict = {
            result: result.output.result,
            score: result.output.score,
            matchPercentage: result.output.matchPercentage,
            signals: result.output.signals,
            reasoning: result.output.reasoning,
            agentRunId: result.agentRunId,
          };
        }

        await prisma.screening.update({
          where: { id: screening.id },
          data: {
            status: "COMPLETED",
            result: verdict.result,
            score: verdict.score,
            matchPercentage: verdict.matchPercentage,
            signals: verdict.signals as any,
            reasoning: verdict.reasoning,
            agentRunId: verdict.agentRunId,
            ...(agentTrace ? { agentTrace: agentTrace as any } : {}),
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
            result: verdict.result,
            score: verdict.score,
            ...(agenticMeta ? { agentic: agenticMeta } : {}),
          },
        }).catch(() => {});

        return { screeningId: screening.id, result: verdict.result };
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
