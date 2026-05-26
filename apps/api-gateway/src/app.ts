/**
 * Express app composition for api-gateway.
 *
 * Phase 0 scope:
 *   - GET /healthz, /readyz, /livez (via @cdc-ats/common health router)
 *   - GET /metrics (Prometheus)
 *   - GET /api/health-test/ping → proxied to health-test service to verify
 *     header forwarding works end-to-end
 *
 * Auth / login / saga endpoints arrive in Phase 1.
 */
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import {
  createHealthRouter,
  createMetrics,
  createErrorHandler,
  notFoundHandler,
  requestId,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { createProxyMiddleware } from "http-proxy-middleware";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("api-gateway");

  // ── Order matters ────────────────────────────────────────────────────
  app.use(requestId());
  app.use(helmet());
  app.use(cors({ origin: process.env["CORS_ORIGIN"] ?? "http://localhost:3000", credentials: true }));
  app.use(compression());
  app.use(cookieParser());
  app.use(metrics.middleware);

  // Rate-limit per IP — stricter on auth endpoints
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(generalLimiter);

  // ── Health + metrics endpoints (no auth) ─────────────────────────────
  app.use(createHealthRouter());
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // ── Phase 0: proxy /api/health-test/* → health-test service ──────────
  // This validates header forwarding works before adding real services.
  const healthTestTarget = process.env["HEALTH_TEST_SERVICE_URL"] ?? "http://localhost:4099";
  app.use(
    "/api/health-test",
    (req: Request, _res: Response, next: NextFunction) => {
      // Phase 1 will replace this with actual JWT validation.
      // For Phase 0 we just inject some demo headers so we can verify
      // the downstream service receives them.
      req.headers["x-user-id"] = "demo-user-id";
      req.headers["x-tenant-id"] = "demo-tenant-id";
      req.headers["x-user-role"] = "ADMIN";
      req.headers["x-user-email"] = "demo@example.com";
      req.headers["x-request-id"] = (req.id as string | undefined) ?? "";
      next();
    },
    createProxyMiddleware({
      target: healthTestTarget,
      changeOrigin: true,
      pathRewrite: { "^/api/health-test": "" },
      logger,
    })
  );

  // ── Errors ───────────────────────────────────────────────────────────
  app.use(notFoundHandler());
  app.use(createErrorHandler(logger));

  return app;
}
