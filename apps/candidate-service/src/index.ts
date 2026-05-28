import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "candidate-service" });
initSentry({ serviceName: "candidate-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startRetentionPurgeWorker } from "./workers/retention-purge.worker.js";
import { startCandidateSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "candidate-service" });
const PORT = Number(process.env["PORT"] ?? 4005);

let stopRetention: (() => Promise<void>) | null = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "candidate-service" });
      await ensureStreams();
      logger.info("NATS connected");
      // Phase 35c — backfill subscriber for resume.parsed events.
      await startCandidateSubscribers(logger);
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — agent.completed events will not publish");
    }
  }

  // Phase 20 — daily retention purge. No-op if REDIS_URL unset.
  stopRetention = startRetentionPurgeWorker(logger);

  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "candidate-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (stopRetention) await stopRetention().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "candidate-service failed to start");
  process.exit(1);
});
