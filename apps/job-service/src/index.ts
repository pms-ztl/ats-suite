import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "job-service" });
initSentry({ serviceName: "job-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startOutboxWorker } from "@cdc-ats/outbox";
import { prisma } from "./lib/prisma.js";

const logger = createLogger({ serviceName: "job-service" });
const PORT = Number(process.env["PORT"] ?? 4004);

let stopOutbox: (() => Promise<void>) | null = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "job-service" });
      await ensureStreams();
      logger.info("NATS connected");
      // Outbox worker only makes sense when NATS is reachable
      stopOutbox = startOutboxWorker({ logger, prisma, pollMs: 2000 });
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — agent.completed events will not publish");
    }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "job-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (stopOutbox) await stopOutbox().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "job-service failed to start");
  process.exit(1);
});
