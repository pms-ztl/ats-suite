/**
 * api-gateway entry point.
 *
 * Boots in this order:
 *   1. OpenTelemetry (must be FIRST so subsequent imports get instrumented)
 *   2. Express app + middleware
 *   3. Listen on PORT
 */
import { initOpenTelemetry } from "@cdc-ats/common";

initOpenTelemetry({ serviceName: "api-gateway" });

import { createApp } from "./app.js";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "api-gateway" });
const PORT = Number(process.env["PORT"] ?? 4000);

async function main() {
  const app = createApp(logger);
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "api-gateway listening");
  });
}

main().catch((err) => {
  logger.fatal({ err }, "api-gateway failed to start");
  process.exit(1);
});
