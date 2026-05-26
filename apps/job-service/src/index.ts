import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "job-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "job-service" });
const PORT = Number(process.env["PORT"] ?? 4004);

const app = createApp(logger);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "job-service listening");
});
