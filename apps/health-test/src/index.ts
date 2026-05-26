/**
 * health-test — minimal stub service used by Phase 0 to verify:
 *   1) The gateway can proxy requests to a downstream service
 *   2) Auth headers (X-User-Id, X-Tenant-Id, X-User-Role) arrive intact
 *   3) The shared @cdc-ats/common middleware stack works
 *   4) Health endpoints are mounted
 *
 * Once Phase 1 starts, this can be deleted.
 */
import { initOpenTelemetry, createLogger } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "health-test" });

import express, { type Request, type Response } from "express";
import {
  createHealthRouter,
  createMetrics,
  createErrorHandler,
  notFoundHandler,
  requestId,
  readAuthHeaders,
} from "@cdc-ats/common";

const logger = createLogger({ serviceName: "health-test" });
const PORT = Number(process.env["PORT"] ?? 4099);

const app = express();
const metrics = createMetrics("health-test");

app.use(requestId());
app.use(express.json());
app.use(metrics.middleware);
app.use(createHealthRouter());

// Metrics endpoint
app.get("/metrics", async (_req: Request, res: Response) => {
  res.set("Content-Type", metrics.registry.contentType);
  res.end(await metrics.registry.metrics());
});

// Echo route — verifies gateway forwarded headers
app.get("/ping", readAuthHeaders(), (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: "pong from health-test service",
      receivedHeaders: {
        "x-user-id": req.headers["x-user-id"] ?? null,
        "x-tenant-id": req.headers["x-tenant-id"] ?? null,
        "x-user-role": req.headers["x-user-role"] ?? null,
        "x-user-email": req.headers["x-user-email"] ?? null,
        "x-request-id": req.headers["x-request-id"] ?? null,
      },
      parsedUser: req.user ?? null,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(notFoundHandler());
app.use(createErrorHandler(logger));

app.listen(PORT, () => {
  logger.info({ port: PORT }, "health-test service listening");
});
