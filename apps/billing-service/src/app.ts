import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import billingRouter from "./routes/billing.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("billing-service");

  app.use(requestId());
  app.use(express.json({ limit: "1mb" }));
  app.use(metrics.middleware);

  app.use(createHealthRouter({
    dependencies: {
      database: async () => {
        try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; }
      },
    },
  }));

  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // Internal routes — gateway forwards X-Tenant-Id/X-User-Id
  app.use("/internal/billing", readAuthHeaders(), billingRouter);

  app.use(notFoundHandler());
  app.use(createErrorHandler(logger));
  return app;
}
