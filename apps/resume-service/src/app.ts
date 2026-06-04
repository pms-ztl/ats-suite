import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders, tenantContext,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import resumeRouter from "./routes/resume.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("resume-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(metrics.middleware);

  app.use(createHealthRouter({
    dependencies: {
      database: async () => { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } },
    },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // Multer handles its own body parsing; don't put express.json() before it.
  app.use(tenantContext); // bind request tenant for RLS-scoped queries
  app.use("/internal/resume", readAuthHeaders(), resumeRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
