import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "resume-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";
import { startResumeParseWorker } from "./workers/resume-parse.worker.js";

const logger = createLogger({ serviceName: "resume-service" });
const PORT = Number(process.env["PORT"] ?? 4007);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "resume-service" });
      await ensureStreams();
    } catch (err) {
      logger.warn({ err }, "NATS connect failed");
    }
  }
  if (process.env["REDIS_URL"]) {
    try {
      startResumeParseWorker(logger);
    } catch (err) {
      logger.warn({ err }, "BullMQ worker startup failed");
    }
  }
  const app = createApp(logger);
  app.listen(PORT, () => logger.info({ port: PORT }, "resume-service listening"));
}

main().catch((err) => {
  logger.fatal({ err }, "resume-service failed to start");
  process.exit(1);
});
