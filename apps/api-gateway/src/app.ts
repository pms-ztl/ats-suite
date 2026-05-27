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
  requestTimeout,
  tenantRateLimit,
  sentryErrorHandler,
  Errors,
} from "@cdc-ats/common";
import { Redis } from "ioredis";
import type { Logger } from "pino";
import { createProxyMiddleware, type Options as ProxyOptions } from "http-proxy-middleware";
import { gatewayAuth } from "./lib/auth-middleware.js";
import authRouter from "./routes/auth.js";
import { platformRouter } from "./routes/platform.js";
import { analyticsAgentRouter, biasAuditorRouter, copilotRouter } from "./routes/agents.js";
import { aggregatorRouter } from "./routes/aggregators.js";
import { gdprRouter } from "./routes/gdpr.js";

// Lazy-connect Redis so tests / no-redis dev still work
let redis: Redis | null = null;
if (process.env["REDIS_URL"]) {
  try {
    redis = new Redis(process.env["REDIS_URL"], {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });
    redis.on("error", () => {/* swallow — middleware falls through on error */});
  } catch {
    redis = null;
  }
}

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("api-gateway");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));
  app.use(helmet());
  // CORS — accept a comma-separated list in CORS_ORIGIN, or fall back to all
  // localhost ports in development. In prod set CORS_ORIGIN explicitly.
  const corsOriginEnv = process.env["CORS_ORIGIN"];
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(",").map((s) => s.trim()).filter(Boolean)
    : null;
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server, curl, etc.
      if (allowedOrigins) {
        return callback(null, allowedOrigins.includes(origin));
      }
      // Dev fallback: any localhost / 127.0.0.1 port
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
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

  // Per-tenant rate limit — kicks in after the gateway has resolved a
  // tenant from JWT. Falls through silently when Redis is unavailable.
  app.use("/api", tenantRateLimit({
    redis,
    requestsPerMinute: Number(process.env["TENANT_RATE_LIMIT_PER_MINUTE"] ?? 600),
  }));

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
  const notificationUrl = process.env["NOTIFICATION_SERVICE_URL"] ?? "http://localhost:4009";

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
  app.use("/api/jd-author", gatewayAuth(), forwardHeaders(jobUrl, "/internal/jd-author"));

  // Platform aggregator — fans out to job + candidate + billing in parallel
  app.use("/api/platform", gatewayAuth(), platformRouter(logger));

  // GDPR — per-candidate export + delete fans out across services
  app.use("/api/gdpr", gatewayAuth(), express.json({ limit: "1mb" }), gdprRouter(logger));

  // Cross-service read aggregators (analytics/pipeline, /agents/hitl,
  // /sourcing/talent-pools, etc.). MUST come BEFORE the single-service
  // proxies below so specific GET routes like /api/sourcing/talent-pools
  // don't get caught by the /api/sourcing proxy.
  app.use("/api", gatewayAuth(), aggregatorRouter(logger));

  // Single-service agent routes (POST proxies — MUST come before the
  // gateway-hosted /api mount above for the same path, because the
  // gateway-hosted handlers use express.json() which would consume the
  // body before http-proxy-middleware could forward it).
  app.use("/api/sourcing", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/sourcing"));
  app.use("/api/offer", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/offer"));
  app.use("/api/candidate-experience", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/candidate-experience"));
  app.use("/api/interview-intelligence", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/interview-intelligence"));
  app.use("/api/scheduling", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/scheduling"));

  // Gateway-hosted agent routes (analytics, bias-auditor, copilot) — each
  // mounted at its own path with body parsing scoped to just that path.
  // NOTE: aggregatorRouter above handles GET /api/analytics/pipeline etc.,
  // these handle POST /api/analytics for the agent. Express routes by method.
  app.use("/api/analytics", gatewayAuth(), express.json({ limit: "1mb" }), analyticsAgentRouter(logger));
  app.use("/api/bias-auditor", gatewayAuth(), express.json({ limit: "1mb" }), biasAuditorRouter(logger));
  app.use("/api/copilot", gatewayAuth(), express.json({ limit: "1mb" }), copilotRouter(logger));
  app.use("/api/candidates", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/candidates"));
  app.use("/api/applications", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/applications"));
  app.use("/api/resume", gatewayAuth(), forwardHeaders(resumeUrl, "/internal/resume"));
  app.use("/api/screening", gatewayAuth(), forwardHeaders(screeningUrl, "/internal/screening"));
  app.use("/api/interviews", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/interviews"));
  app.use("/api/rounds", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/rounds"));
  app.use("/api/notifications", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/notifications"));
  app.use("/api/integrations", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/integrations"));
  app.use("/api/email-templates", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/email-templates"));
  // HITL — GET is handled by aggregatorRouter above for shape consistency;
  // POST + PATCH go straight through to notification-service.
  app.use("/api/hitl", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/hitl"));

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

  // Phase 21 — platform control plane (super-admin only). Proxies to billing-service
  // which owns the platform kill switches, cross-tenant cost rollup, and prompt overrides.
  app.use("/api/super-admin/platform", gatewayAuth(), requireSuperAdmin, forwardHeaders(billingUrl, "/internal/platform"));

  // Phase 20 — tenant self-service config (branding + retention).
  // Branding GET/PUT proxies to tenant-service's /internal/branding and
  // /internal/retention. Auth required: tenant-admin scope (the route
  // itself reads X-Tenant-Id from the forwarded headers).
  app.use("/api/branding", gatewayAuth(), forwardHeaders(tenantUrl, "/internal/branding"));
  app.use("/api/retention", gatewayAuth(), forwardHeaders(tenantUrl, "/internal/retention"));

  // Public branding endpoint — no auth, used by the candidate-portal to
  // whitelabel /jobs and /jobs/:id/apply. Restrictive cache so updates
  // propagate without a CDN purge but we still get ~60s edge caching.
  app.use("/api/public/branding", forwardHeaders(tenantUrl, "/internal/public-branding"));

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());      // capture into Sentry (no-op if SENTRY_DSN unset)
  app.use(createErrorHandler(logger));
  return app;
}
