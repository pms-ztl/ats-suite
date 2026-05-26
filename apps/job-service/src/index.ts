import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "job-service" });
initSentry({ serviceName: "job-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "job-service" });
const PORT = Number(process.env["PORT"] ?? 4004);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "job-service" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — agent.completed events will not publish");
    }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "job-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "job-service failed to start");
  process.exit(1);
});
