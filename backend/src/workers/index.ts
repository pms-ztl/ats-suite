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

  // Only start workers if Redis is configured.
  // BullMQ workers will crash with ECONNREFUSED otherwise.
  // Inline fallbacks (resume parse via setImmediate) handle the dev/no-Redis path.
  if (!process.env.REDIS_URL) {
    logger.info('REDIS_URL not set — background workers disabled (using inline fallbacks)');
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
