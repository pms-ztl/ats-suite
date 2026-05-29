import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import agentsRouter from "./routes/agents.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("agent-service");
  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 60_000 }));  app.use(express.json({ limit: "2mb" }));
  app.use(metrics.middleware);
  app.use(createHealthRouter({
    dependencies: { database: async () => { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } } },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });
  app.use("/internal/agents", readAuthHeaders(), agentsRouter);
  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
