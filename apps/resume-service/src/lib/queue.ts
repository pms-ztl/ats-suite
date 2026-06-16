/**
 * BullMQ queue setup for resume-service.
 */
import { getQueue } from "@cdc-ats/nats-client";
import type { Queue } from "bullmq";

export interface ResumeParseJob {
  candidateId: string;
  tenantId: string;
  userId: string;
  resumeId: string;
  bulkUploadId?: string;
}

let queue: Queue<ResumeParseJob> | null = null;

export async function enqueueResumeParse(data: ResumeParseJob): Promise<string> {
  if (!queue) queue = getQueue<ResumeParseJob>("resume-parse");
  const job = await queue.add("parse", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
    jobId: `parse-${data.candidateId}-${data.resumeId}`,
  });
  return job.id!;
}

// ── Bulk archive extract queue ───────────────────────────────────────────
// Async unzip + per-entry text extraction (OCR for images) into staging rows.
// Runs in a worker so a 10k-file zip never hits the 30s request timeout.
export interface BulkArchiveExtractJob {
  bulkUploadId: string;
  zipPath: string;
  tenantId: string;
}

let archiveQueue: Queue<BulkArchiveExtractJob> | null = null;

export async function enqueueBulkArchiveExtract(data: BulkArchiveExtractJob): Promise<string> {
  if (!archiveQueue) archiveQueue = getQueue<BulkArchiveExtractJob>("bulk-archive-extract");
  const job = await archiveQueue.add("extract", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
    jobId: `archive-${data.bulkUploadId}`,
  });
  return job.id!;
}
