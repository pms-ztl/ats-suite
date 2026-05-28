import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import candidatesRouter from "./routes/candidates.js";
import applicationsRouter from "./routes/applications.js";
import sourcingRouter from "./routes/agent-sourcing.js";
import offerRouter from "./routes/agent-offer.js";
import experienceRouter from "./routes/agent-experience.js";
import gdprRouter from "./routes/gdpr.js";
import importRouter from "./routes/import.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("candidate-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(express.json({ limit: "5mb" }));
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

  app.use("/internal/candidates", readAuthHeaders(), candidatesRouter);
  app.use("/internal/applications", readAuthHeaders(), applicationsRouter);
  app.use("/internal/sourcing", readAuthHeaders(), sourcingRouter);
  app.use("/internal/offer", readAuthHeaders(), offerRouter);
  app.use("/internal/candidate-experience", readAuthHeaders(), experienceRouter);
  app.use("/internal/gdpr", readAuthHeaders(), gdprRouter);
  // Phase 34a — CSV/Excel bulk candidate import.
  app.use("/internal/candidates/import", readAuthHeaders(), importRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
