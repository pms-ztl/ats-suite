import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "compliance-service" });
initSentry({ serviceName: "compliance-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "compliance-service" });
const PORT = Number(process.env["PORT"] ?? 4013);

async function main() {
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "compliance-service listening"));
  registerGracefulShutdown({ logger, server, onShutdown: [] });
}

main().catch((err) => { logger.fatal({ err }, "compliance-service failed"); process.exit(1); });
