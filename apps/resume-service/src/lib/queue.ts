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
