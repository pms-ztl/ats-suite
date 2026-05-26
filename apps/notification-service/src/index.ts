import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "notification-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";
import { startNotificationSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "notification-service" });
const PORT = Number(process.env["PORT"] ?? 4009);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "notification-service" });
      await ensureStreams();
      await startNotificationSubscribers(logger);
    } catch (err) {
      logger.warn({ err }, "NATS setup failed — running without event subscribers");
    }
  } else {
    logger.warn("NATS_URL not set — no event subscribers");
  }

  const app = createApp(logger);
  app.listen(PORT, () => logger.info({ port: PORT }, "notification-service listening"));
}

main().catch((err) => {
  logger.fatal({ err }, "notification-service failed to start");
  process.exit(1);
});
