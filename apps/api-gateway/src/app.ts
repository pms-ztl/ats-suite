/**
 * Express app composition for api-gateway (Phase 1).
 *
 *   /api/auth/*                 → handled in-process (login, register, me, etc.)
 *   /api/users/*                → proxied to identity-service with JWT verified
 *   /api/tenants/*              → proxied to tenant-service
 *   /api/super-admin/tenants/*  → proxied to tenant-service (SUPER_ADMIN only)
 *
 * Everything else returns 404 from notFoundHandler. Phase 2 adds billing,
 * job, candidate proxies; Phase 3 adds resume, screening, interview;
 * Phase 4 adds notification.
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
  Errors,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { createProxyMiddleware, type Options as ProxyOptions } from "http-proxy-middleware";
import { gatewayAuth } from "./lib/auth-middleware.js";
import authRouter from "./routes/auth.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("api-gateway");

  app.use(requestId());
  app.use(helmet());
  app.use(cors({
    origin: process.env["CORS_ORIGIN"] ?? "http://localhost:3000",
    credentials: true,
  }));
  app.use(compression());
  app.use(cookieParser());
  app.use(metrics.middleware);

  // Strict rate limit on /api/auth to slow credential stuffing
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many auth attempts" } },
  });
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(generalLimiter);

  // ── Health endpoints + metrics ──────────────────────────────────────
  app.use(createHealthRouter());
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // ── Public auth routes (JSON body, in-process) ──────────────────────
  // express.json() applied ONLY to /api/auth/* — proxy routes must NOT
  // consume the body (http-proxy-middleware streams it).
  app.use("/api/auth", express.json({ limit: "1mb" }), authLimiter, authRouter);

  // ── Proxy helper that forwards X-User-* headers ────────────────────
  // `targetPrefix` is PREPENDED to the request path (which has already had
  // the express mount path stripped by app.use). So mounting at /api/billing
  // with targetPrefix /internal/billing turns GET /api/billing/agents into
  // GET <billingUrl>/internal/billing/agents.
  const forwardHeaders = (proxyTarget: string, targetPrefix: string) =>
    createProxyMiddleware({
      target: proxyTarget,
      changeOrigin: true,
      pathRewrite: (path) => `${targetPrefix}${path}`,
      logger,
      on: {
        proxyReq: (proxyReq, rawReq) => {
          const req = rawReq as unknown as Request;
          if (req.user) {
            proxyReq.setHeader("X-User-Id", req.user.id);
            proxyReq.setHeader("X-Tenant-Id", req.user.tenantId);
            proxyReq.setHeader("X-User-Role", req.user.role);
            if (req.user.email) proxyReq.setHeader("X-User-Email", req.user.email);
          }
          if ((req as any).id) {
            proxyReq.setHeader("X-Request-Id", (req as any).id);
          }
          const token = process.env["INTERNAL_SERVICE_TOKEN"];
          if (token) proxyReq.setHeader("X-Internal-Service", token);
        },
      },
    });

  const identityUrl = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  const billingUrl = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
  const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
  const candidateUrl = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
  const interviewUrl = process.env["INTERVIEW_SERVICE_URL"] ?? "http://localhost:4006";
  const resumeUrl = process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007";
  const screeningUrl = process.env["SCREENING_SERVICE_URL"] ?? "http://localhost:4008";

  // ── Public routes (no auth) — /api/public/* → job-service /public/* ──
  app.use(
    "/api/public",
    createProxyMiddleware({
      target: jobUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/public${path}`,
      logger,
    })
  );

  app.use("/api/users", gatewayAuth(), forwardHeaders(identityUrl, "/internal/users"));
  app.use("/api/billing", gatewayAuth(), forwardHeaders(billingUrl, "/internal/billing"));
  app.use("/api/requisitions", gatewayAuth(), forwardHeaders(jobUrl, "/internal/requisitions"));
  app.use("/api/job-postings", gatewayAuth(), forwardHeaders(jobUrl, "/internal/job-postings"));
  app.use("/api/candidates", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/candidates"));
  app.use("/api/applications", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/applications"));
  app.use("/api/resume", gatewayAuth(), forwardHeaders(resumeUrl, "/internal/resume"));
  app.use("/api/screening", gatewayAuth(), forwardHeaders(screeningUrl, "/internal/screening"));
  app.use("/api/interviews", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/interviews"));
  app.use("/api/rounds", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/rounds"));

  // /api/tenants/plan-change-request (in-process — wraps tenant-service)
  app.post(
    "/api/tenants/plan-change-request",
    gatewayAuth(),
    express.json({ limit: "1mb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        if (req.user.role !== "ADMIN") {
          throw Errors.forbidden("Only tenant admins may request plan changes");
        }
        const { callService } = await import("./lib/service-client.js");
        const result = await callService("tenant", {
          method: "POST",
          path: "/internal/plan-changes",
          body: {
            ...req.body,
            tenantId: req.user.tenantId,
            requestedByUserId: req.user.id,
          },
        });
        res.status(201).json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    }
  );

  app.get(
    "/api/tenants/plan-change-requests",
    gatewayAuth(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        const { callService } = await import("./lib/service-client.js");
        const result = await callService("tenant", {
          method: "GET",
          path: `/internal/plan-changes/by-tenant/${req.user.tenantId}`,
        });
        res.json({ success: true, data: result });
      } catch (err) {
        next(err);
      }
    }
  );

  app.use("/api/tenants", gatewayAuth(), forwardHeaders(tenantUrl, "/internal/tenants"));

  const requireSuperAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "SUPER_ADMIN") {
      return next(Errors.forbidden("SUPER_ADMIN role required"));
    }
    next();
  };

  app.use("/api/super-admin/tenants", gatewayAuth(), requireSuperAdmin, forwardHeaders(tenantUrl, "/internal/tenants"));
  app.use("/api/super-admin/plan-change-requests", gatewayAuth(), requireSuperAdmin, forwardHeaders(tenantUrl, "/internal/plan-changes"));

  app.use(notFoundHandler());
  app.use(createErrorHandler(logger));
  return app;
}
