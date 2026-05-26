import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "tenant-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "tenant-service" });
const PORT = Number(process.env["PORT"] ?? 4002);

const app = createApp(logger);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "tenant-service listening");
});
