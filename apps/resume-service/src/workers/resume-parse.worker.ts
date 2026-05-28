/**
 * Resume-parse worker.
 *
 * 1. Loads Resume row
 * 2. Runs resume-parser agent (stub for Phase 3)
 * 3. Updates Resume.parsedData + parseStatus="PARSED"
 * 4. Increments BulkUpload counter if bulkUploadId set
 * 5. Publishes tenant.{tenantId}.resume.parsed (screening-service consumes)
 * 6. Publishes tenant.{tenantId}.agent.completed (billing-service consumes)
 */
import { createWorker, publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject as ts } from "@cdc-ats/contracts";
import { runAgent, enrich, extractGithubHandle, fetchGithubProfile } from "@cdc-ats/ai-engine";
import type {
  ResumeParserInput, ResumeParserOutput,
  GithubCorroborationInput, GithubCorroboration,
} from "@cdc-ats/ai-engine";
import { prisma } from "../lib/prisma.js";
import type { ResumeParseJob } from "../lib/queue.js";
import type { Logger } from "pino";

export function startResumeParseWorker(logger: Logger) {
  const worker = createWorker<ResumeParseJob>(
    "resume-parse",
    async (job) => {
      const { candidateId, tenantId, userId, resumeId, bulkUploadId } = job.data;
      logger.info({ jobId: job.id, candidateId, resumeId }, "Processing resume parse");

      const resume = await prisma.resume.findFirst({ where: { id: resumeId, tenantId } });
      if (!resume?.extractedText) {
        await tickBulk(bulkUploadId, false, "no extracted text", resume?.fileName);
        throw new Error(`Resume ${resumeId} has no extracted text`);
      }

      try {
        const result = await runAgent<ResumeParserInput, ResumeParserOutput>({
          agentType: "resume-parser",
          input: { resumeText: resume.extractedText },
          context: {
            tenantId,
            userId,
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
              // Publish agent.completed → billing-service updates cost projection
              await publishEvent({
                subject: ts(run.tenantId, "agent", "completed"),
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
              }).catch(() => { /* non-fatal */ });
            },
          },
        });

        // Phase 37 — post-parse enrichment.
        //   - Canonicalize skills via taxonomy/aliases
        //   - Canonicalize companies + universities
        //   - Compute per-skill YOE + lastUsedYear + depth + sourceProjects
        //   - Normalize all dates to ISO with confidence
        const enriched = enrich(result.output);

        // Phase 37h — GitHub corroboration. If the parsed resume names a
        // GitHub URL/handle, fetch the public profile + recent repos, then
        // ask github-corroborator agent to compare claims vs evidence.
        // Best-effort: rate-limited, no API key required for public data.
        let githubCorroboration: GithubCorroboration | null = null;
        const ghHandle = extractGithubHandle(result.output.links?.github);
        if (ghHandle) {
          const ghProfile = await fetchGithubProfile(ghHandle);
          if (ghProfile) {
            try {
              const corro = await runAgent<GithubCorroborationInput, GithubCorroboration>({
                agentType: "github-corroborator" as any,
                input: {
                  candidateProfileJson: JSON.stringify(enriched),
                  githubProfileJson: JSON.stringify(ghProfile),
                },
                context: { tenantId, userId, persistRun: async () => undefined },
              });
              githubCorroboration = corro.output;
            } catch (err) {
              logger.warn({ err, ghHandle }, "GitHub corroboration failed; continuing");
            }
          }
        }

        await prisma.resume.update({
          where: { id: resumeId },
          data: {
            parsedData: { raw: result.output, enriched, githubCorroboration } as any,
            parseStatus: "PARSED",
            parsedAt: new Date(),
          },
        });

        // Publish resume.parsed — screening + candidate consume.
        // Phase 37 — payload now carries BOTH raw parser output (for screener
        // back-compat) AND the enriched view (for candidate backfill).
        await publishEvent({
          subject: ts(tenantId, "resume", "parsed"),
          type: "resume.parsed",
          tenantId,
          payload: {
            tenantId,
            candidateId,
            resumeId,
            bulkUploadId: bulkUploadId ?? null,
            parsedSkillsCount: enriched.skills.length,
            parseCostUsd: result.snapshot.costUsd,
            parsed: result.output,
            enriched,
            githubCorroboration,
          },
        }).catch(() => { /* non-fatal */ });

        await tickBulk(bulkUploadId, true);
        return { runId: result.agentRunId };
      } catch (err) {
        await tickBulk(bulkUploadId, false, err instanceof Error ? err.message : String(err), resume.fileName);
        throw err;
      }
    },
    { concurrency: 3, limiter: { max: 10, duration: 60_000 } }
  );

  worker.on("completed", (job) => logger.info({ jobId: job.id }, "resume parse done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "resume parse failed"));
  logger.info("resume-parse worker started");
  return worker;
}

async function tickBulk(bulkUploadId: string | undefined, ok: boolean, errMsg?: string, filename?: string) {
  if (!bulkUploadId) return;
  try {
    const row = await prisma.bulkUpload.findUnique({ where: { id: bulkUploadId } });
    if (!row) return;
    const newProc = row.processedFiles + (ok ? 1 : 0);
    const newFail = row.failedFiles + (ok ? 0 : 1);
    const settled = newProc + newFail;
    const done = settled >= row.totalFiles;
    const errors = (!ok && filename)
      ? [...((row.errors as any[]) ?? []), { filename, error: errMsg ?? "unknown" }]
      : row.errors;
    await prisma.bulkUpload.update({
      where: { id: bulkUploadId },
      data: {
        processedFiles: newProc,
        failedFiles: newFail,
        errors: errors as any,
        ...(done && {
          completedAt: new Date(),
          status: newFail === 0 ? "COMPLETED" : newFail === row.totalFiles ? "FAILED" : "PARTIAL",
        }),
      },
    });
  } catch { /* logged elsewhere */ }
}
