import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter,
  createMetrics,
  createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler,
  requestId,
  readAuthHeaders,
  tenantContext,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import tenantsRouter from "./routes/tenants.js";
import planChangesRouter from "./routes/plan-changes.js";
import brandingRouter from "./routes/branding.js";
import uiConfigRouter from "./routes/ui-config.js";
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
  // Bind request tenant so branding/onboarding (RLS client) scope to the
  // caller's own Tenant row. The register saga has no X-Tenant-Id and uses
  // the admin client, so it is unaffected.
  app.use("/internal", tenantContext);

  app.use("/internal/tenants", tenantsRouter);
  app.use("/internal/plan-changes", planChangesRouter);
  app.use("/internal", brandingRouter);
  // WF-C (C3): developer-customizable UI config (GET/PUT /internal/ui-config).
  // Mounted at /internal so it inherits the readAuthHeaders + tenantContext set
  // up above (RLS client scopes to the caller's own Tenant row); the PUT is
  // additionally gated by requireTenantAdmin inside the router.
  app.use("/internal", uiConfigRouter);
  app.use("/internal/onboarding", onboardingRouter);
  app.use("/internal/gdpr", gdprRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
