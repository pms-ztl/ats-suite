import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter,
  createMetrics,
  createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler,
  requestId,
  readAuthHeaders,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import tenantsRouter from "./routes/tenants.js";
import planChangesRouter from "./routes/plan-changes.js";
import brandingRouter from "./routes/branding.js";
import onboardingRouter from "./routes/onboarding.js";
import gdprRouter from "./routes/gdpr.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("tenant-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));  app.use(express.json({ limit: "1mb" }));
  app.use(metrics.middleware);

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

  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // Phase 31c — close a latent bug: `requireTenantAdmin` (used by branding,
  // onboarding, plan-changes, gdpr) reads req.user, which is only populated
  // by readAuthHeaders. Without this mount the role guards return 401 for
  // legitimate admin requests. `optional: true` because /internal/tenants
  // POST (register-company saga) is called before any JWT exists.
  app.use("/internal", readAuthHeaders({ optional: true }));

  app.use("/internal/tenants", tenantsRouter);
  app.use("/internal/plan-changes", planChangesRouter);
  app.use("/internal", brandingRouter);
  app.use("/internal/onboarding", onboardingRouter);
  app.use("/internal/gdpr", gdprRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
