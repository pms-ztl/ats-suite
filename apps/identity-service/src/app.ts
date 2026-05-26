import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter,
  createMetrics,
  createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler,
  requestId,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import usersRouter from "./routes/users.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("identity-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(express.json({ limit: "1mb" }));
  app.use(metrics.middleware);

  // Health endpoints (k8s probes hit these)
  app.use(createHealthRouter({
    dependencies: {
      database: async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          return true;
        } catch {
          return false;
        }
      },
    },
  }));

  // Prometheus
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // ── Internal API mounted under /internal — gateway forwards here ─────
  // No X-User-Id required on these routes — they're called by other
  // services, not end users. In production, NetworkPolicy + service token
  // restricts who can reach them.
  app.use("/internal/users", usersRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
