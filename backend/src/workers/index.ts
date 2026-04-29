import { startResumeParseWorker } from './resume-parse.worker';
import { startScreeningWorker } from './screening.worker';
import { startNotificationWorker } from './notification.worker';
import { startAgentEventsWorker } from './agent-events.worker';
import { startCronJobs } from './cron.worker';
import logger from '../lib/logger';

let workersStarted = false;

/**
 * Start all background workers.
 * Safe to call multiple times — only starts once.
 */
export function startWorkers(): void {
  if (workersStarted) return;

  // Only start workers if Redis is configured
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'test') {
    logger.info('Redis not configured — workers disabled (test mode)');
    return;
  }

  try {
    startResumeParseWorker();
    startScreeningWorker();
    startNotificationWorker();
    startAgentEventsWorker();
    startCronJobs().catch(err => logger.error({ err }, 'Failed to start cron jobs'));
    workersStarted = true;
    logger.info('All background workers started');
  } catch (err) {
    logger.error({ err }, 'Failed to start workers — running without background processing');
  }
}
