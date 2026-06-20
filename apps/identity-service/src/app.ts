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
import usersRouter from "./routes/users.js";
import dashboardsRouter from "./routes/dashboards.js";
import authPolishRouter from "./routes/auth-polish.js";
import ssoRouter from "./routes/sso.js";
import gdprRouter from "./routes/gdpr.js";
import auditRouter from "./routes/audit.js";
import apiKeysRouter from "./routes/api-keys.js";

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
  // readAuthHeaders is OPTIONAL here because several routes are intentionally
  // unauthenticated (verify-credentials during login, POST / during the
  // register saga, accept-invite) — they run before any JWT exists. But the
  // role-guarded routes (GET list, invite, role/deactivate, platform-stats,
  // assignable) need req.user populated from the gateway's X-User-* headers;
  // without this middleware requireRole/requireTenantAdmin always 401'd.
  // Bind request tenant (when present) so the RLS-scoped user-management
  // handlers see it. Pre-auth requests (login, register saga) carry no
  // X-Tenant-Id, which is fine — those handlers use the admin client.
  app.use(tenantContext);
  // WF6/F1 — per-user + tenant-default dashboard layouts and UI prefs. Mounted
  // additively under /internal/users (so the gateway's /api/me/dashboards/* and
  // /api/tenant/dashboards/* proxies land here). Declared BEFORE usersRouter so
  // the literal /me/* and /tenant/* paths are matched here and never captured by
  // usersRouter's /:id. These routes ALWAYS need req.user (caller identity), so
  // readAuthHeaders is NON-optional; the RLS client keys writes to the caller.
  app.use("/internal/users", readAuthHeaders(), dashboardsRouter);
  app.use("/internal/users", readAuthHeaders({ optional: true }), usersRouter);
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
  // Phase 34b — tenant API keys. CRUD requires tenant-admin (enforced inside);
  // /verify is unauthenticated (the bearer key IS the auth).
  app.use("/internal/api-keys", readAuthHeaders({ optional: true }), apiKeysRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
