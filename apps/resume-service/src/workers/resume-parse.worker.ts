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
import { createWorker } from "@cdc-ats/nats-client";
// Background worker (no HTTP request) — scopes by the job's tenantId explicitly,
// so it uses the admin (non-RLS) client.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { runParsePipeline } from "../lib/parse-pipeline.js";
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
        // Full parse → enrich → semantic-match → agentic verify → persist + publish.
        const out = await runParsePipeline({
          resumeId,
          candidateId,
          tenantId,
          userId,
          resumeText: resume.extractedText,
          bulkUploadId: bulkUploadId ?? null,
          logger,
        });
        await tickBulk(bulkUploadId, true);
        return { runId: out.runId };
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
