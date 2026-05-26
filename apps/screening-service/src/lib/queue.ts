import { getQueue } from "@cdc-ats/nats-client";
import type { Queue } from "bullmq";

export interface ScreeningJob {
  candidateId: string;
  requisitionId: string;
  tenantId: string;
  userId: string;
  resumeId: string;
}

let queue: Queue<ScreeningJob> | null = null;

export async function enqueueScreening(data: ScreeningJob): Promise<string> {
  if (!queue) queue = getQueue<ScreeningJob>("ai-screening");
  const job = await queue.add("screen", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: 100,
    removeOnFail: 500,
    jobId: `screen-${data.candidateId}-${data.requisitionId}`,
  });
  return job.id!;
}
