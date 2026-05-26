import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import requisitionsRouter from "./routes/requisitions.js";
import jobPostingsRouter from "./routes/job-postings.js";
import publicRouter from "./routes/public.js";
import jdAuthorRouter from "./routes/jd-author.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("job-service");

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

  // Internal authenticated routes
  app.use("/internal/requisitions", readAuthHeaders(), requisitionsRouter);
  app.use("/internal/job-postings", readAuthHeaders(), jobPostingsRouter);
  app.use("/internal/jd-author", readAuthHeaders(), jdAuthorRouter);

  // Public routes — NO auth required (gateway forwards /api/public/* unauthenticated)
  app.use("/public", publicRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
