/**
 * BullMQ queue for assessment grading (assessment-service).
 *
 * Clones the screening-service queue idiom: a thin enqueue helper over the
 * shared @cdc-ats/nats-client BullMQ helpers (which own the Redis connection via
 * REDIS_URL). The grading worker (filled by a later slice) consumes this queue
 * to run real Judge0 verdicts / LLM rubric grading on a submitted attempt —
 * scores are produced by those graders, never fabricated.
 */
import { getQueue } from "@cdc-ats/nats-client";
import type { Queue } from "bullmq";

export const ASSESSMENT_GRADING_QUEUE = "assessment-grading";

export interface GradingJob {
  tenantId: string;
  assessmentId: string;
  attemptId: string;
  inviteId: string;
  candidateId: string;
  /** Who triggered the grade — "system" for auto-grade on submit. */
  userId: string;
}

let queue: Queue<GradingJob> | null = null;

export function getGradingQueue(): Queue<GradingJob> {
  if (!queue) queue = getQueue<GradingJob>(ASSESSMENT_GRADING_QUEUE);
  return queue;
}

export async function enqueueGrading(data: GradingJob): Promise<string> {
  const q = getGradingQueue();
  const job = await q.add("grade", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: 100,
    removeOnFail: 500,
    jobId: `grade-${data.attemptId}`,
  });
  return job.id!;
}

// ── Outbound provider-invite queue (WF8 / SLICE H3) ──────────────────────────
// A separate queue from grading: the provider-invite worker consumes it to issue
// a candidate's invite on an EXTERNAL OA vendor (HackerRank, Codility, ...). The
// worker loads the tenant's decrypted vendor creds, calls adapter.invite(), and
// stores the real providerInvitationId — it never fabricates a vendor id.
export const ASSESSMENT_INVITE_QUEUE = "assessment-provider-invite";

export interface ProviderInviteJob {
  tenantId: string;
  /** Our local AssessmentInvite row this job fulfills (the idempotency anchor). */
  inviteId: string;
  assessmentId: string;
  candidateId: string;
  /** Provider registry key (== TenantIntegration kind), e.g. "hackerrank". */
  provider: string;
  /** The vendor's own test/assessment id the candidate is invited to. */
  providerTestId: string;
  /** Candidate contact + name passed to the vendor invite (vendor must NOT email). */
  email: string;
  candidateFirstName?: string;
  candidateLastName?: string;
  /** Absolute inbound-webhook URL for vendors with per-invite callbacks. */
  webhookUrl?: string;
  /** Optional invite expiry to pass through when the vendor supports it (ISO). */
  expiresAt?: string;
  /** Who triggered the invite — "system" for an automated pipeline step. */
  userId: string;
}

let inviteQueue: Queue<ProviderInviteJob> | null = null;

export function getProviderInviteQueue(): Queue<ProviderInviteJob> {
  if (!inviteQueue) inviteQueue = getQueue<ProviderInviteJob>(ASSESSMENT_INVITE_QUEUE);
  return inviteQueue;
}

/**
 * Enqueue an outbound provider invite. Idempotent at the queue layer: the jobId is
 * derived from {provider, inviteId} so re-enqueuing the same invite (a retry, a
 * double-click) coalesces onto one job rather than inviting the candidate twice.
 * The worker is also idempotent at the data layer (skips an invite already SENT
 * with a providerInvitationId).
 */
export async function enqueueProviderInvite(data: ProviderInviteJob): Promise<string> {
  const q = getProviderInviteQueue();
  const job = await q.add("provider-invite", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 15_000 },
    removeOnComplete: 200,
    removeOnFail: 1000,
    jobId: `provider-invite-${data.provider}-${data.inviteId}`,
  });
  return job.id!;
}
