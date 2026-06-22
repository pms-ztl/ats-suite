import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "onboarding-service" });
initSentry({ serviceName: "onboarding-service" });

import { createApp } from "./app.js";
import { connectNats, ensureStreams, closeNats } from "@cdc-ats/nats-client";
import { startOnboardingSubscribers } from "./subscribers.js";

const logger = createLogger({ serviceName: "onboarding-service" });
const PORT = Number(process.env["PORT"] ?? 4015);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "onboarding-service" });
      await ensureStreams();
      await startOnboardingSubscribers(logger);
      logger.info("NATS connected + onboarding subscribers started");
    } catch (err) { logger.warn({ err }, "NATS setup failed — running without event subscribers"); }
  } else {
    logger.warn("NATS_URL not set — no onboarding triggers");
  }
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "onboarding-service listening"));

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await closeNats().catch(() => {}); }],
  });
}

main().catch((err) => { logger.fatal({ err }, "onboarding-service failed"); process.exit(1); });
