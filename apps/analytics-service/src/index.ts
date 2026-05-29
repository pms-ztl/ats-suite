import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "analytics-service" });
initSentry({ serviceName: "analytics-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "analytics-service" });
const PORT = Number(process.env["PORT"] ?? 4012);

async function main() {
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "analytics-service listening"));
  registerGracefulShutdown({ logger, server, onShutdown: [] });
}

main().catch((err) => { logger.fatal({ err }, "analytics-service failed"); process.exit(1); });
