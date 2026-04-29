import { Worker, Job } from 'bullmq';
import { getRedisConnection, NotificationJobData } from '../lib/queue';
import { sendEmail } from '../lib/mailer';
import { sendSlackNotification } from '../lib/slack';
import { dispatchWebhook } from '../lib/webhooks';
import logger from '../lib/logger';

export function startNotificationWorker(): Worker {
  const worker = new Worker<NotificationJobData>(
    'notification',
    async (job: Job<NotificationJobData>) => {
      const { type, tenantId, payload } = job.data;

      switch (type) {
        case 'email':
          await sendEmail({
            to: payload.to as string,
            subject: payload.subject as string,
            html: payload.html as string,
          });
          break;
        case 'slack':
          await sendSlackNotification(tenantId, {
            text: payload.text as string,
            blocks: payload.blocks as any[],
          });
          break;
        case 'webhook':
          await dispatchWebhook(
            tenantId,
            payload.event as any,
            payload.data as Record<string, unknown>,
          );
          break;
        default:
          logger.warn({ type }, 'Unknown notification type');
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
      limiter: { max: 30, duration: 60000 }, // Max 30 notifications per minute
    }
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, type: job?.data.type, error: err.message }, 'Notification job failed');
  });

  return worker;
}
