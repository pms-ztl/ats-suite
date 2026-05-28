import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "notification-service" });
initSentry({ serviceName: "notification-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startNotificationSubscribers } from "./lib/subscribers.js";
import { startDeliveryWorker } from "./workers/delivery.worker.js";

const logger = createLogger({ serviceName: "notification-service" });
const PORT = Number(process.env["PORT"] ?? 4009);

let deliveryWorker: ReturnType<typeof startDeliveryWorker> = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "notification-service" });
      await ensureStreams();
      await startNotificationSubscribers(logger);
      logger.info("NATS connected + subscribers started");
    } catch (err) {
      logger.warn({ err }, "NATS setup failed — running without event subscribers");
    }
  } else {
    logger.warn("NATS_URL not set — no event subscribers");
  }

  if (process.env["REDIS_URL"]) {
    try {
      deliveryWorker = startDeliveryWorker(logger);
      logger.info("Notification delivery worker started (email + Slack channels)");
    } catch (err) {
      logger.warn({ err }, "Delivery worker startup failed — email + Slack deliveries disabled");
    }
  } else {
    logger.warn("REDIS_URL not set — email + Slack delivery worker disabled");
  }

  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "notification-service listening"));

  // Phase 34d — kick off the cloud-sync polling worker. Pull every 5 min,
  // import any new resume files from connected Google Drive / Dropbox folders.
  // Disable in tests / single-shot deploys with DISABLE_CLOUD_SYNC_WORKER=true.
  const { startCloudSyncWorker } = await import("./lib/cloud-sync-worker.js");
  startCloudSyncWorker();

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (deliveryWorker) await deliveryWorker.close().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "notification-service failed to start");
  process.exit(1);
});
