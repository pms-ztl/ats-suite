import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import notificationsRouter from "./routes/notifications.js";
import integrationsRouter from "./routes/integrations.js";
import hitlRouter from "./routes/hitl.js";
import emailTemplatesRouter from "./routes/email-templates.js";
import supportRouter from "./routes/support.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("notification-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(express.json({ limit: "1mb" }));
  app.use(metrics.middleware);

  app.use(createHealthRouter({
    dependencies: {
      database: async () => { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } },
    },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  app.use("/internal/notifications", readAuthHeaders(), notificationsRouter);
  app.use("/internal/integrations", readAuthHeaders(), integrationsRouter);
  app.use("/internal/hitl", readAuthHeaders(), hitlRouter);
  app.use("/internal/email-templates", readAuthHeaders(), emailTemplatesRouter);
  // Phase 32b — in-app support tickets. Tenant + super-admin routes share
  // this router; gates inside each handler.
  app.use("/internal/support", readAuthHeaders(), supportRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
