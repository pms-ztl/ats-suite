import express, { type Express, type Request, type Response } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders, tenantContext,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import onboardingRouter from "./routes/onboarding.js";
import portalRouter from "./routes/portal.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("onboarding-service");
  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));
  app.use(express.json({ limit: "2mb" }));
  app.use(metrics.middleware);
  app.use(createHealthRouter({
    dependencies: { database: async () => { try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; } } },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // PUBLIC candidate portal — the opaque portalToken in the path is the credential.
  // No tenantContext / auth headers (resolved from the case row via the admin client).
  app.use("/public/onboarding", portalRouter);

  // Internal authenticated routes (recruiter/admin), RLS-scoped.
  app.use(tenantContext);
  app.use("/internal/onboarding-cases", readAuthHeaders(), onboardingRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
