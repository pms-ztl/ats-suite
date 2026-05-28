import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import interviewsRouter from "./routes/interviews.js";
import roundsRouter from "./routes/rounds.js";
import intelligenceRouter from "./routes/agent-intelligence.js";
import schedulingRouter from "./routes/agent-scheduling.js";
import gdprRouter from "./routes/gdpr.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("interview-service");
  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(express.json({ limit: "1mb" }));
  app.use(metrics.middleware);
  app.use(createHealthRouter({
    dependencies: { database: async () => { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } } },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });
  app.use("/internal/interviews", readAuthHeaders(), interviewsRouter);
  app.use("/internal/rounds", readAuthHeaders(), roundsRouter);
  app.use("/internal/interview-intelligence", readAuthHeaders(), intelligenceRouter);
  app.use("/internal/scheduling", readAuthHeaders(), schedulingRouter);
  app.use("/internal/gdpr", readAuthHeaders(), gdprRouter);
  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
