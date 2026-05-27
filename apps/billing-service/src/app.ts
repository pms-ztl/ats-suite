import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import billingRouter from "./routes/billing.js";
import platformRouter from "./routes/platform.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("billing-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(express.json({ limit: "1mb" }));
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
  // Platform control plane (super-admin only). Role enforcement happens at the
  // gateway via requireSuperAdmin — here we trust the forwarded X-User-Role.
  app.use("/internal/platform", readAuthHeaders(), platformRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
