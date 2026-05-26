import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "tenant-service" });
initSentry({ serviceName: "tenant-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "tenant-service" });
const PORT = Number(process.env["PORT"] ?? 4002);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "tenant-service" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — events will silently drop");
    }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT }, "tenant-service listening");
  });

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "tenant-service failed to start");
  process.exit(1);
});
