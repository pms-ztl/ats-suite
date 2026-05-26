import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "candidate-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "candidate-service" });
const PORT = Number(process.env["PORT"] ?? 4005);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "candidate-service" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — agent.completed events will not publish");
    }
  }
  const app = createApp(logger);
  app.listen(PORT, () => logger.info({ port: PORT }, "candidate-service listening"));
}

main().catch((err) => {
  logger.fatal({ err }, "candidate-service failed to start");
  process.exit(1);
});
