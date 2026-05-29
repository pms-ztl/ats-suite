import { config } from "./config.js";
import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: config.serviceName });
initSentry({ serviceName: config.serviceName });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: config.serviceName });

async function main() {
  const app = createApp(logger);
  const server = app.listen(config.port, () => logger.info({ port: config.port }, `${config.serviceName} listening`));
  registerGracefulShutdown({ logger, server, onShutdown: [] });
}

main().catch((err) => { logger.fatal({ err }, `${config.serviceName} failed`); process.exit(1); });
