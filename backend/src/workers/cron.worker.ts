import { Queue, Worker, Job } from 'bullmq';
import { getRedisConnection } from '../lib/queue';
import { prisma } from '../utils/prisma';
import { emitAgentEvent } from '../lib/agent-bus';
import logger from '../lib/logger';

/**
 * Start cron-scheduled agent triggers using BullMQ repeatable jobs.
 * Each tenant gets their own scheduled jobs.
 */
export async function startCronJobs(): Promise<void> {
  if (!process.env.REDIS_URL) {
    logger.info('Cron jobs skipped — no Redis configured');
    return;
  }

  const cronQueue = new Queue('agent-cron', { connection: getRedisConnection() });

  // Weekly compliance audit — every Monday at 9am
  await cronQueue.add('weekly-compliance', {}, {
    repeat: { pattern: '0 9 * * 1' }, // Monday 9am
    jobId: 'weekly-compliance-global',
  });

  // Daily analytics digest — every day at 6am
  await cronQueue.add('daily-analytics', {}, {
    repeat: { pattern: '0 6 * * *' }, // Daily 6am
    jobId: 'daily-analytics-global',
  });

  // Hourly HITL SLA breach check
  await cronQueue.add('hitl-sla-check', {}, {
    repeat: { pattern: '0 * * * *' }, // Every hour
    jobId: 'hitl-sla-check-global',
  });

  logger.info('Cron jobs registered: weekly-compliance (Mon 9am), daily-analytics (daily 6am), hitl-sla-check (hourly)');

  // Cron worker processes scheduled triggers
  new Worker('agent-cron', async (job: Job) => {
    logger.info({ name: job.name }, 'Cron job triggered');

    // Get all tenants
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    }).catch(() => [] as Array<{ id: string; name: string }>);

    for (const tenant of tenants) {
      switch (job.name) {
        case 'weekly-compliance':
          await emitAgentEvent({ type: 'compliance.audit.due', tenantId: tenant.id });
          break;
        case 'daily-analytics':
          await emitAgentEvent({ type: 'analytics.digest.due', tenantId: tenant.id });
          break;
        case 'hitl-sla-check': {
          const { checkSLABreaches } = await import('../agents/hitl');
          const breached = await checkSLABreaches(tenant.id);
          if (breached > 0) {
            logger.warn({ tenantId: tenant.id, breachedCount: breached }, 'HITL SLA breaches detected and escalated');
          }
          break;
        }
      }
    }

    logger.info({ name: job.name, tenantsTriggered: tenants.length }, 'Cron job completed');
  }, { connection: getRedisConnection() });
}
