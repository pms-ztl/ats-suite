import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "resume-service" });
initSentry({ serviceName: "resume-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startResumeParseWorker } from "./workers/resume-parse.worker.js";
import { isStorageConfigured } from "./lib/storage.js";
import { shutdownOcr } from "./lib/ocr.js";

const logger = createLogger({ serviceName: "resume-service" });
const PORT = Number(process.env["PORT"] ?? 4007);

let parseWorker: ReturnType<typeof startResumeParseWorker> | null = null;

async function main() {
  // Phase 36c — hard-fail at boot if S3 isn't configured in production.
  // Without this, the service runs "successfully" but every uploaded resume
  // loses its binary — recruiters can never download originals, GDPR
  // export is incomplete. That's a silent data-loss bug. Fail loud instead.
  if (process.env["NODE_ENV"] === "production" && !isStorageConfigured()) {
    logger.fatal(
      "S3 storage is not configured (S3_BUCKET / S3_REGION / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY) " +
      "but NODE_ENV=production. Refusing to start — resume binaries would be lost. " +
      "Set the env vars, or set NODE_ENV != production for a text-only dev run.",
    );
    process.exit(1);
  }

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
      // Phase 36a — release the tesseract WASM worker (~12MB of memory).
      async () => { await shutdownOcr().catch(() => {}); },
      async () => { await closeNats().catch(() => {}); },
    ],
  });
}

main().catch((err) => {
  logger.fatal({ err }, "resume-service failed to start");
  process.exit(1);
});
