/**
 * Notification delivery worker — pulls NotificationDelivery rows in PENDING
 * state and dispatches them via the right channel (EMAIL or SLACK).
 *
 * Driven by BullMQ: emitNotification() enqueues a "deliver" job per
 * (notification × channel) row it creates. The worker:
 *   1. Loads the NotificationDelivery row (so we have the recipient + status)
 *   2. Loads the parent Notification (for title/body/link)
 *   3. For EMAIL: looks up TenantIntegration{kind:"email"} for from/reply-to,
 *      then calls sendEmail
 *   4. For SLACK: looks up TenantIntegration{kind:"slack"} for webhookUrl,
 *      then calls sendSlack
 *   5. Updates the delivery row (SENT + sentAt OR FAILED + lastError + attempt++)
 *
 * Retries: BullMQ exponential backoff on transient failures (max 3 attempts).
 * Permanent failures (e.g. missing webhook URL) mark FAILED on first try.
 */
import { Worker, Queue, type Job } from "bullmq";
import { Redis } from "ioredis";
import type { Logger } from "pino";
import { prisma } from "../lib/prisma.js";
import { sendEmail, renderNotificationEmail } from "../lib/mailer.js";
import { sendSlack } from "../lib/slack.js";

export const DELIVERY_QUEUE = "notification-delivery";

export interface DeliveryJobData {
  deliveryId: string;
}

let deliveryQueue: Queue<DeliveryJobData> | null = null;

export function getDeliveryQueue(): Queue<DeliveryJobData> | null {
  if (deliveryQueue) return deliveryQueue;
  const url = process.env["REDIS_URL"];
  if (!url) return null;
  // BullMQ expects ioredis with maxRetriesPerRequest: null
  const conn = new Redis(url, { maxRetriesPerRequest: null });
  deliveryQueue = new Queue<DeliveryJobData>(DELIVERY_QUEUE, {
    connection: conn as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2_000 },
      removeOnComplete: { count: 500, age: 7 * 24 * 3600 },
      removeOnFail: { count: 1000, age: 30 * 24 * 3600 },
    },
  });
  return deliveryQueue;
}

export async function enqueueDelivery(deliveryId: string): Promise<void> {
  const q = getDeliveryQueue();
  if (!q) return;
  await q.add("deliver", { deliveryId }, { jobId: deliveryId });
}

export function startDeliveryWorker(logger: Logger): Worker<DeliveryJobData> | null {
  const url = process.env["REDIS_URL"];
  if (!url) return null;
  const conn = new Redis(url, { maxRetriesPerRequest: null });
  const worker = new Worker<DeliveryJobData>(
    DELIVERY_QUEUE,
    async (job: Job<DeliveryJobData>) => {
      const { deliveryId } = job.data;
      const delivery = await prisma.notificationDelivery.findUnique({
        where: { id: deliveryId },
        include: { notification: true },
      });
      if (!delivery) {
        logger.warn({ deliveryId }, "delivery row gone — skipping");
        return;
      }
      if (delivery.status === "SENT") {
        logger.info({ deliveryId }, "already sent — skipping");
        return;
      }

      const n = delivery.notification;
      let ok = false;
      let error: string | undefined;

      try {
        if (delivery.channel === "EMAIL") {
          const { text, html } = renderNotificationEmail({
            title: n.title,
            body: n.body,
            link: n.link,
          });
          const res = await sendEmail({
            to: delivery.recipient,
            subject: n.title,
            text,
            html,
          });
          ok = res.ok;
          error = res.error;
        } else if (delivery.channel === "SLACK") {
          // recipient is the webhook URL for SLACK (resolved at enqueue time)
          const res = await sendSlack({
            webhookUrl: delivery.recipient,
            title: n.title,
            body: n.body,
            link: n.link,
            iconEmoji: iconForType(n.type),
          });
          ok = res.ok;
          error = res.error;
        } else {
          // IN_APP is handled by emit.ts directly — no worker step needed.
          ok = true;
        }
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }

      await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
          status: ok ? "SENT" : "FAILED",
          attemptCount: { increment: 1 },
          ...(ok ? { sentAt: new Date(), lastError: null } : { lastError: error ?? "unknown" }),
        },
      });

      if (!ok) {
        // Throw so BullMQ schedules a retry per the backoff config
        throw new Error(`Delivery failed: ${error ?? "unknown"}`);
      }
    },
    {
      connection: conn as any,
      concurrency: Number(process.env["DELIVERY_WORKER_CONCURRENCY"] ?? 5),
    },
  );

  worker.on("ready", () => logger.info("notification delivery worker ready"));
  worker.on("failed", (job, err) => logger.warn({ jobId: job?.id, err: err?.message }, "delivery failed"));
  worker.on("completed", (job) => logger.debug({ jobId: job?.id }, "delivery completed"));
  return worker;
}

function iconForType(type: string): string {
  switch (type) {
    case "PLAN_CHANGE_REQUESTED":
    case "PLAN_CHANGE_APPROVED":
    case "PLAN_CHANGE_REJECTED":
      return ":credit_card:";
    case "NEW_TENANT_SIGNUP":
      return ":wave:";
    case "BULK_UPLOAD_COMPLETED":
      return ":inbox_tray:";
    case "SEAT_LIMIT_REACHED":
      return ":no_entry:";
    case "INTERVIEW_FEEDBACK_NEW":
      return ":speech_balloon:";
    default:
      return ":bell:";
  }
}
