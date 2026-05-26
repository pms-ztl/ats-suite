import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "interview-service" });
initSentry({ serviceName: "interview-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "interview-service" });
const PORT = Number(process.env["PORT"] ?? 4006);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "interview-service" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) { logger.warn({ err }, "NATS setup failed"); }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "interview-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => { logger.fatal({ err }, "interview-service failed"); process.exit(1); });
