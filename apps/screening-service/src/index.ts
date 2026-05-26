import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "screening-service" });
initSentry({ serviceName: "screening-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startScreeningWorker } from "./workers/screening.worker.js";
import { startScreeningSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "screening-service" });
const PORT = Number(process.env["PORT"] ?? 4008);

let screeningWorker: ReturnType<typeof startScreeningWorker> | null = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "screening-service" });
      await ensureStreams();
      await startScreeningSubscribers(logger);
      logger.info("NATS connected + subscribers started");
    } catch (err) { logger.warn({ err }, "NATS setup failed"); }
  }
  if (process.env["REDIS_URL"]) {
    try { screeningWorker = startScreeningWorker(logger); }
    catch (err) { logger.warn({ err }, "BullMQ worker failed"); }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "screening-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (screeningWorker) await screeningWorker.close().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => { logger.fatal({ err }, "screening-service failed"); process.exit(1); });
