import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "identity-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "identity-service" });
const PORT = Number(process.env["PORT"] ?? 4001);

const app = createApp(logger);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "identity-service listening");
});
