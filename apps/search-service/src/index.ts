import { config } from "./config.js";
import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: config.serviceName });
initSentry({ serviceName: config.serviceName });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startSearchSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: config.serviceName });

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: config.serviceName });
      await ensureStreams();
      await startSearchSubscribers(logger);
      logger.info("NATS connected + subscribers started");
    } catch (err) {
      logger.warn({ err }, "NATS setup failed — running without event indexing");
    }
  }
  const app = createApp(logger);
  const server = app.listen(config.port, () => logger.info({ port: config.port }, `${config.serviceName} listening`));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => { logger.fatal({ err }, `${config.serviceName} failed`); process.exit(1); });
