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
import usersRouter from "./routes/users.js";
import authPolishRouter from "./routes/auth-polish.js";
import ssoRouter from "./routes/sso.js";
import gdprRouter from "./routes/gdpr.js";
import auditRouter from "./routes/audit.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("identity-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));
  app.use(express.json({ limit: "1mb" }));
  // SAML POST callback is form-urlencoded, not JSON. Mount the parser globally
  // (cheap; only applies when Content-Type matches).
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
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
  // Auth polish — forgot/reset password are unauthenticated; the others
  // (change-password, mfa/*) require X-User-Id from a logged-in JWT.
  app.use("/internal/auth", readAuthHeaders({ optional: true }), authPolishRouter);
  // Phase 28 — SSO. Routes split internally between public (discover,
  // initiate, callback) and auth-gated config (gateway adds requireTenantAdmin
  // when proxying /api/sso/config/*).
  app.use("/internal/sso", readAuthHeaders({ optional: true }), ssoRouter);
  app.use("/internal/gdpr", readAuthHeaders(), gdprRouter);
  // Phase 32a/32c — audit log read/write. POST is internal (no role check
  // — only the gateway/services should hit it); GET is super-admin only
  // (enforced inside the router via requireSuperAdmin).
  app.use("/internal/audit", readAuthHeaders({ optional: true }), auditRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
