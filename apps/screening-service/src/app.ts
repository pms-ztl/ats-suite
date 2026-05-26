import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import screeningRouter from "./routes/screening.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("screening-service");
  app.use(requestId());
  app.use(express.json({ limit: "1mb" }));
  app.use(metrics.middleware);
  app.use(createHealthRouter({
    dependencies: { database: async () => { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } } },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });
  app.use("/internal/screening", readAuthHeaders(), screeningRouter);
  app.use(notFoundHandler());
  app.use(createErrorHandler(logger));
  return app;
}
