import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "search-service" });
initSentry({ serviceName: "search-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startSearchSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "search-service" });
const PORT = Number(process.env["PORT"] ?? 4010);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "search-service" });
      await ensureStreams();
      await startSearchSubscribers(logger);
      logger.info("NATS connected + subscribers started");
    } catch (err) {
      logger.warn({ err }, "NATS setup failed — running without event indexing");
    }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "search-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => { logger.fatal({ err }, "search-service failed"); process.exit(1); });
