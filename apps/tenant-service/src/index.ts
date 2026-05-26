import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "tenant-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "tenant-service" });
const PORT = Number(process.env["PORT"] ?? 4002);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "tenant-service" });
      await ensureStreams();
      logger.info("Connected to NATS — events will publish");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — events will silently drop");
    }
  }
  const app = createApp(logger);
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "tenant-service listening");
  });
}

main().catch((err) => {
  logger.fatal({ err }, "tenant-service failed to start");
  process.exit(1);
});
