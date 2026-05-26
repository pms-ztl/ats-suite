import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "interview-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "interview-service" });
const PORT = Number(process.env["PORT"] ?? 4006);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "interview-service" });
      await ensureStreams();
    } catch (err) { logger.warn({ err }, "NATS setup failed"); }
  }
  const app = createApp(logger);
  app.listen(PORT, () => logger.info({ port: PORT }, "interview-service listening"));
}

main().catch((err) => { logger.fatal({ err }, "interview-service failed"); process.exit(1); });
