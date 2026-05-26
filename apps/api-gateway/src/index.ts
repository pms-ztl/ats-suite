/**
 * api-gateway entry point.
 *
 * Boots in this order:
 *   1. OpenTelemetry (must be FIRST so subsequent imports get instrumented)
 *   2. NATS (so gateway-hosted agents can publish agent.completed events)
 *   3. Express app + middleware
 *   4. Listen on PORT
 */
import { initOpenTelemetry } from "@cdc-ats/common";

initOpenTelemetry({ serviceName: "api-gateway" });

import { createApp } from "./app.js";
import { createLogger } from "@cdc-ats/common";
import { connectNats, ensureStreams } from "@cdc-ats/nats-client";

const logger = createLogger({ serviceName: "api-gateway" });
const PORT = Number(process.env["PORT"] ?? 4000);

async function main() {
  if (process.env["NATS_URL"]) {
    try {
      await connectNats({ serviceName: "api-gateway" });
      await ensureStreams();
      logger.info("NATS connected");
    } catch (err) {
      logger.warn({ err }, "NATS connect failed — gateway agents will not publish cost events");
    }
  }
  const app = createApp(logger);
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "api-gateway listening");
  });
}

main().catch((err) => {
  logger.fatal({ err }, "api-gateway failed to start");
  process.exit(1);
});
