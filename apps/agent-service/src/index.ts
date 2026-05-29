import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "agent-service" });
initSentry({ serviceName: "agent-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "agent-service" });
const PORT = Number(process.env["PORT"] ?? 4011);

async function main() {
  const app = createApp(logger);
  const server = app.listen(PORT, () => logger.info({ port: PORT }, "agent-service listening"));
  registerGracefulShutdown({ logger, server, onShutdown: [] });
}

main().catch((err) => { logger.fatal({ err }, "agent-service failed"); process.exit(1); });
