import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "resume-service" });
initSentry({ serviceName: "resume-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startResumeParseWorker } from "./workers/resume-parse.worker.js";

const logger = createLogger({ serviceName: "resume-service" });
const PORT = Number(process.env["PORT"] ?? 4007);

let parseWorker: ReturnType<typeof startResumeParseWorker> | null = null;

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "resume-service" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed");
    }
  }
  if (process.env["REDIS_URL"]) {
    try {
      parseWorker = startResumeParseWorker(logger);
    } catch (err) {
      logger.warn({ err }, "BullMQ worker startup failed");
    }
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "resume-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [
      async () => { if (parseWorker) await parseWorker.close().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "resume-service failed to start");
  process.exit(1);
});
