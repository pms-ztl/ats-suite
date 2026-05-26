import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "notification-service" });
initSentry({ serviceName: "notification-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startNotificationSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "notification-service" });
const PORT = Number(process.env["PORT"] ?? 4009);

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

  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "notification-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "notification-service failed to start");
  process.exit(1);
});
