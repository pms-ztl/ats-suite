import { config } from "./config.js";
import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: config.serviceName });
initSentry({ serviceName: config.serviceName });

import { createApp } from "./app.js";
import { startMetricRollup } from "./lib/rollup.js";

const logger = createLogger({ serviceName: config.serviceName });

async function main() {
  const app = createApp(logger);
  const server = app.listen(config.port, () => logger.info({ port: config.port }, `${config.serviceName} listening`));

  // MetricRollup populator — periodic sweep that mirrors the REAL per-stage
  // application counts from candidate-service into MetricRollup so /reporting
  // funnel + summary read live data instead of an empty set. Pure HTTP, so it runs
  // regardless of broker availability; a failed sweep is retried on the next tick.
  const rollup = startMetricRollup(logger);

  registerGracefulShutdown({
    logger,
    server,
    onShutdown: [async () => { await rollup.stop().catch(() => {}); }],
  });
}

main().catch((err) => { logger.fatal({ err }, `${config.serviceName} failed`); process.exit(1); });
