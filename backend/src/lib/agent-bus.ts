import { Queue } from 'bullmq';
import { getRedisConnection } from './queue';
import logger from './logger';

// ── Agent Event Types ─────────────────────────────────────────────────

export type AgentEvent =
  | { type: 'resume.parsed'; tenantId: string; candidateId: string; runId: string; parsedData: Record<string, unknown> }
  | { type: 'screening.completed'; tenantId: string; candidateId: string; requisitionId: string; recommendation: string; runId: string }
  | { type: 'interview.analyzed'; tenantId: string; interviewId: string; runId: string }
  | { type: 'offer.drafted'; tenantId: string; offerId: string; candidateId: string; runId: string }
  | { type: 'stage.changed'; tenantId: string; candidateId: string; fromStage: string; toStage: string; applicationId: string }
  | { type: 'compliance.audit.due'; tenantId: string }
  | { type: 'analytics.digest.due'; tenantId: string };

// ── Agent Event Queue ─────────────────────────────────────────────────

let agentEventQueue: Queue | null = null;

function getAgentEventQueue(): Queue {
  if (!agentEventQueue) {
    agentEventQueue = new Queue('agent-events', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 200,
        removeOnFail: 500,
      },
    });
  }
  return agentEventQueue;
}

/**
 * Emit an agent event to the inter-agent message bus.
 * Events are tenant-scoped — only workers for the same tenant process them.
 * Fire-and-forget: caller is never blocked.
 */
export async function emitAgentEvent(event: AgentEvent): Promise<void> {
  if (!process.env.REDIS_URL) {
    logger.debug({ event: event.type }, 'Agent event skipped (no Redis)');
    return;
  }

  try {
    const queue = getAgentEventQueue();
    await queue.add(event.type, event, {
      jobId: `${event.type}-${event.tenantId}-${Date.now()}`,
    });
    logger.info({ type: event.type, tenantId: event.tenantId }, 'Agent event emitted');
  } catch (err) {
    logger.error({ err, event: event.type }, 'Failed to emit agent event');
  }
}
