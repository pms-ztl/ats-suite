import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "billing-service" });
initSentry({ serviceName: "billing-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startBillingSubscribers } from "./lib/subscribers.js";

const logger = createLogger({ serviceName: "billing-service" });
const PORT = Number(process.env["PORT"] ?? 4003);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "billing-service" });
      await ensureStreams();
      await startBillingSubscribers(logger);
      logger.info("NATS connected + subscribers started");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — running without event subscribers");
    }
  } else {
    logger.warn("NATS_URL not set — running without event subscribers");
  }

  const app = createApp(logger);
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "billing-service listening");
  });

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "billing-service failed to start");
  process.exit(1);
});
