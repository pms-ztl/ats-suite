import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "candidate-service" });

import { createApp } from "./app.js";

const logger = createLogger({ serviceName: "candidate-service" });
const PORT = Number(process.env["PORT"] ?? 4005);

const app = createApp(logger);
app.listen(PORT, () => {
  logger.info({ port: PORT }, "candidate-service listening");
});
