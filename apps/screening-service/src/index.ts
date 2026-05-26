import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "screening-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";
import { startScreeningWorker } from "./workers/screening.worker.js";
import { startScreeningSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "screening-service" });
const PORT = Number(process.env["PORT"] ?? 4008);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "screening-service" });
      await ensureStreams();
      await startScreeningSubscribers(logger);
    } catch (err) { logger.warn({ err }, "NATS setup failed"); }
  }
  if (process.env["REDIS_URL"]) {
    try { startScreeningWorker(logger); } catch (err) { logger.warn({ err }, "BullMQ worker failed"); }
  }
  const app = createApp(logger);
  app.listen(PORT, () => logger.info({ port: PORT }, "screening-service listening"));
}

main().catch((err) => { logger.fatal({ err }, "screening-service failed"); process.exit(1); });
