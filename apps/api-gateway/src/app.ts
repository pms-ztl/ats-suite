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
import { resolveTenantPlan } from "./lib/tenant-plan.js";
import { requireAgentPlan } from "./lib/agent-gate.js";
import authRouter from "./routes/auth.js";
import impersonateRouter from "./routes/impersonate.js";
import { publicIngestRouter } from "./routes/public-ingest.js";
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

  // Rate limits are env-configurable so a dedicated load-test environment can
  // measure true capacity. DISABLE_RATE_LIMIT=1 turns them off entirely (load
  // tests / internal benchmarks only — NEVER in a public prod env). Defaults
  // are unchanged, so production behavior is identical unless explicitly set.
  const rlDisabled = process.env["DISABLE_RATE_LIMIT"] === "1";

  // Strict rate limit on /api/auth to slow credential stuffing
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env["AUTH_RATE_LIMIT_MAX"] ?? 20),
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => rlDisabled,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many auth attempts" } },
  });
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env["GATEWAY_RATE_LIMIT_MAX"] ?? 500),
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => rlDisabled,
  });
  app.use(generalLimiter);

  // Per-tenant rate limit — kicks in after the gateway has resolved a
  // tenant from JWT. Falls through silently when Redis is unavailable.
  app.use("/api", tenantRateLimit({
    redis,
    requestsPerMinute: rlDisabled ? 1_000_000 : Number(process.env["TENANT_RATE_LIMIT_PER_MINUTE"] ?? 600),
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
  const forwardHeaders = (proxyTarget: string, targetPrefix: string) => {
    const proxy = createProxyMiddleware({
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
            // Phase 32a — forward impersonation context so downstream services
            // can write "acted by X on behalf of Y" audit entries.
            if (req.user.actorUserId) proxyReq.setHeader("X-Actor-User-Id", req.user.actorUserId);
          }
          if ((req as any).id) {
            proxyReq.setHeader("X-Request-Id", (req as any).id);
          }
          const token = process.env["INTERNAL_SERVICE_TOKEN"];
          if (token) proxyReq.setHeader("X-Internal-Service", token);
        },
      },
    });
    // http-proxy-middleware v3's `proxyReq` event does NOT reliably fire for
    // POST/PUT/PATCH requests that carry a body, so the setHeader() calls above
    // are skipped and downstream services reject the write with "missing auth
    // headers (request did not pass through gateway)". To make identity
    // forwarding method-agnostic, we ALSO stamp the verified JWT claims onto
    // req.headers here, BEFORE proxying — http-proxy-middleware copies the
    // incoming headers onto the outbound request, so these travel for every
    // method. Any client-supplied identity/service headers are stripped first:
    // the gateway, via the verified token, is the only authority for them.
    return (req: Request, res: Response, next: NextFunction) => {
      delete req.headers["x-user-id"];
      delete req.headers["x-tenant-id"];
      delete req.headers["x-user-role"];
      delete req.headers["x-user-email"];
      delete req.headers["x-actor-user-id"];
      delete req.headers["x-internal-service"];
      if (req.user) {
        req.headers["x-user-id"] = req.user.id;
        req.headers["x-tenant-id"] = req.user.tenantId;
        req.headers["x-user-role"] = req.user.role;
        if (req.user.email) req.headers["x-user-email"] = req.user.email;
        if (req.user.actorUserId) req.headers["x-actor-user-id"] = req.user.actorUserId;
      }
      if ((req as any).id) req.headers["x-request-id"] = String((req as any).id);
      const internalToken = process.env["INTERNAL_SERVICE_TOKEN"];
      if (internalToken) req.headers["x-internal-service"] = internalToken;
      return proxy(req, res, next);
    };
  };

  const identityUrl = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  const billingUrl = process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
  const jobUrl = process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004";
  const candidateUrl = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
  const interviewUrl = process.env["INTERVIEW_SERVICE_URL"] ?? "http://localhost:4006";
  const resumeUrl = process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007";
  const screeningUrl = process.env["SCREENING_SERVICE_URL"] ?? "http://localhost:4008";
  const notificationUrl = process.env["NOTIFICATION_SERVICE_URL"] ?? "http://localhost:4009";
  const searchUrl = process.env["SEARCH_SERVICE_URL"] ?? "http://localhost:4010";
  const agentUrl = process.env["AGENT_SERVICE_URL"] ?? "http://localhost:4011";
  const analyticsServiceUrl = process.env["ANALYTICS_SERVICE_URL"] ?? "http://localhost:4012";
  const complianceServiceUrl = process.env["COMPLIANCE_SERVICE_URL"] ?? "http://localhost:4013";

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

  // Phase 29 — wrap POST /api/users/invite to inject tenantId + invitedByUserId
  // from the JWT before forwarding. Keeps the frontend body lean (no leaking
  // of tenant ids into client payloads) and matches the pattern used for
  // /api/tenants/plan-change-request below. All other /api/users paths
  // (GET list, GET :id, PATCH, DELETE) keep using the plain forwarder.
  app.post(
    "/api/users/invite",
    gatewayAuth(),
    express.json({ limit: "1mb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        const { callService } = await import("./lib/service-client.js");
        // Resolve the tenant's REAL plan so seat limits reflect what they pay
        // for. Without this, identity defaults to FREE (1 seat) and paid
        // tenants can't invite a second user.
        const tenantPlan = await resolveTenantPlan(req.user.tenantId);
        const result = await callService<any>("identity", {
          method: "POST",
          path: "/internal/users/invite",
          body: {
            ...req.body,
            tenantId: req.user.tenantId,
            plan: tenantPlan,
            invitedByUserId: req.user.id,
          },
          headers: {
            "X-User-Id": req.user.id,
            "X-Tenant-Id": req.user.tenantId,
            "X-User-Role": req.user.role,
          },
        });

        // Phase 31a — email the accept-invite link. Best-effort: even if
        // the email fails (notification-service down), the invite token is
        // valid and the admin can grab it from the audit log + paste it
        // manually. We never block the invite on email delivery.
        if (result?.inviteToken && result?.email) {
          const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";
          const acceptUrl = `${appUrl}/accept-invite?token=${result.inviteToken}`;
          // Fetch tenant name so the email reads "Welcome to Acme" instead
          // of "Welcome to {generic}".
          let tenantName = "your team";
          try {
            const t = await callService<any>("tenant", {
              method: "GET",
              path: `/internal/tenants/${req.user.tenantId}`,
            });
            tenantName = t?.name ?? tenantName;
          } catch { /* ignore */ }

          await callService("notification", {
            method: "POST",
            path: "/internal/notifications/system",
            userHeaders: {
              userId: "system",
              tenantId: req.user.tenantId,
              role: "SUPER_ADMIN",
              email: "system@cdc-ats.local",
            },
            body: {
              tenantId: req.user.tenantId,
              userId: result.id,                // recipient (the new user)
              type: "SYSTEM",
              title: `You're invited to ${tenantName} on CDC ATS`,
              body: `Hi ${result.firstName ?? "there"},\n\n${req.user.email ?? "A teammate"} invited you to join ${tenantName} on CDC ATS as ${result.role}.\n\nSet your password to accept this invite:\n${acceptUrl}\n\nThis link expires in 7 days.`,
              link: acceptUrl,
              channels: ["email"],
            },
          }).catch(() => { /* email failure is non-fatal */ });
        }

        // Strip inviteToken from the response so it doesn't leak to the
        // admin's browser network tab (email is the only legit channel).
        const { inviteToken, inviteExpiresAt, ...safe } = result;
        res.status(201).json({ success: true, data: safe });
      } catch (err) {
        next(err);
      }
    }
  );
  // GET /api/users/seats — inject the tenant's REAL plan so the team page
  // shows accurate seat usage/limits. Must be registered BEFORE the generic
  // /api/users proxy (which would otherwise forward without a plan → FREE).
  app.get(
    "/api/users/seats",
    gatewayAuth(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        const { callService } = await import("./lib/service-client.js");
        const plan = await resolveTenantPlan(req.user.tenantId);
        const data = await callService<any>("identity", {
          method: "GET",
          path: `/internal/users/seats?tenantId=${encodeURIComponent(req.user.tenantId)}&plan=${encodeURIComponent(plan)}`,
        });
        res.json({ success: true, data });
      } catch (err) {
        next(err);
      }
    }
  );
  app.use("/api/users", gatewayAuth(), forwardHeaders(identityUrl, "/internal/users"));
  app.use("/api/billing", gatewayAuth(), forwardHeaders(billingUrl, "/internal/billing"));
  app.use("/api/requisitions", gatewayAuth(), forwardHeaders(jobUrl, "/internal/requisitions"));
  app.use("/api/job-postings", gatewayAuth(), forwardHeaders(jobUrl, "/internal/job-postings"));
  app.use("/api/jd-author", gatewayAuth(), requireAgentPlan("jd-author"), forwardHeaders(jobUrl, "/internal/jd-author"));

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
  app.use("/api/sourcing", gatewayAuth(), requireAgentPlan("sourcing"), forwardHeaders(candidateUrl, "/internal/sourcing"));
  app.use("/api/offer", gatewayAuth(), requireAgentPlan("offer"), forwardHeaders(candidateUrl, "/internal/offer"));
  app.use("/api/candidate-experience", gatewayAuth(), requireAgentPlan("candidate-assistant"), forwardHeaders(candidateUrl, "/internal/candidate-experience"));
  app.use("/api/interview-intelligence", gatewayAuth(), requireAgentPlan("interview-intelligence"), forwardHeaders(interviewUrl, "/internal/interview-intelligence"));
  app.use("/api/scheduling", gatewayAuth(), requireAgentPlan("interview-scheduler"), forwardHeaders(interviewUrl, "/internal/scheduling"));

  // Gateway-hosted agent routes (analytics, bias-auditor, copilot) — each
  // mounted at its own path with body parsing scoped to just that path.
  // NOTE: aggregatorRouter above handles GET /api/analytics/pipeline etc.,
  // these handle POST /api/analytics for the agent. Express routes by method.
  app.use("/api/analytics", gatewayAuth(), requireAgentPlan("analytics"), express.json({ limit: "1mb" }), analyticsAgentRouter(logger));
  app.use("/api/bias-auditor", gatewayAuth(), requireAgentPlan("bias-auditor"), express.json({ limit: "1mb" }), biasAuditorRouter(logger));
  app.use("/api/copilot", gatewayAuth(), requireAgentPlan("copilot"), express.json({ limit: "1mb" }), copilotRouter(logger));
  app.use("/api/candidates", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/candidates"));
  app.use("/api/applications", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/applications"));
  app.use("/api/offers", gatewayAuth(), forwardHeaders(candidateUrl, "/internal/offers"));
  app.use("/api/resume", gatewayAuth(), forwardHeaders(resumeUrl, "/internal/resume"));
  app.use("/api/screening", gatewayAuth(), forwardHeaders(screeningUrl, "/internal/screening"));
  // Phase 6 — search & matching microservice (port 4010).
  app.use("/api/search", gatewayAuth(), forwardHeaders(searchUrl, "/internal/search"));
  // Phase 6 — centralized agent-orchestration microservice (port 4011).
  app.use("/api/agents", gatewayAuth(), forwardHeaders(agentUrl, "/internal/agents"));
  // Phase 6 — analytics/reporting microservice (port 4012). Mounted at /api/reporting
  // to avoid the existing gateway-hosted /api/analytics agent + aggregator routes.
  app.use("/api/reporting", gatewayAuth(), forwardHeaders(analyticsServiceUrl, "/internal/analytics"));
  // Phase 6 — compliance/audit microservice (port 4013). At /api/audit since
  // /api/compliance already proxies to notification-service.
  app.use("/api/audit", gatewayAuth(), forwardHeaders(complianceServiceUrl, "/internal/compliance"));
  app.use("/api/interviews", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/interviews"));
  app.use("/api/rounds", gatewayAuth(), forwardHeaders(interviewUrl, "/internal/rounds"));
  app.use("/api/notifications", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/notifications"));
  app.use("/api/messages", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/messages"));
  app.use("/api/integrations", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/integrations"));
  app.use("/api/webhooks", gatewayAuth(), express.json({ limit: "256kb" }), forwardHeaders(notificationUrl, "/internal/webhooks"));
  app.use("/api/compliance", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/compliance"));
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

  // GET /api/super-admin/stats — platform KPI aggregator. Fans out to
  // tenant/identity/candidate/job/billing and assembles the dashboard's top
  // cards. Fail-soft per service (a down service contributes 0 rather than
  // failing the whole dashboard). Declared BEFORE the /tenants proxy.
  const superAdminFanout = async (req: Request) => {
    const { callService } = await import("./lib/service-client.js");
    const uh = {
      userId: req.user!.id,
      tenantId: req.user!.tenantId,
      role: req.user!.role,
      email: req.user!.email,
    };
    return { callService, uh };
  };
  const settledVal = (s: PromiseSettledResult<any>) => (s.status === "fulfilled" ? s.value : null);

  app.get(
    "/api/super-admin/stats",
    gatewayAuth(),
    requireSuperAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { callService, uh } = await superAdminFanout(req);
        const [tStats, uStats, cStats, rStats, cost] = await Promise.allSettled([
          callService<any>("tenant", { path: "/internal/tenants/stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("identity", { path: "/internal/users/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("candidate", { path: "/internal/candidates/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("job", { path: "/internal/requisitions/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("billing", { path: "/internal/platform/cost?days=30", userHeaders: uh, timeoutMs: 4000 }),
        ]);
        const t = settledVal(tStats) ?? {};
        const u = settledVal(uStats) ?? {};
        const c = settledVal(cStats) ?? {};
        const r = settledVal(rStats) ?? {};
        const b = settledVal(cost) ?? {};
        res.json({
          success: true,
          data: {
            totalTenants: t.totalTenants ?? 0,
            activeTenants: t.activeTenants ?? 0,
            trialTenants: t.trialTenants ?? 0,
            suspendedTenants: t.suspendedTenants ?? 0,
            planBreakdown: t.planBreakdown ?? {},
            totalUsers: u.total ?? 0,
            totalCandidates: c.total ?? 0,
            totalRequisitions: r.total ?? 0,
            totalCostUsd30d: b?.totals?.costUsd ?? 0,
            recentTenants: t.recentTenants ?? [],
          },
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // GET /api/super-admin/health — LIVE service health. Pings every backend
  // service's /healthz, measures round-trip latency, and reports status. This
  // is genuinely live: it reflects the real running fleet, not seeded data.
  app.get(
    "/api/super-admin/health",
    gatewayAuth(),
    requireSuperAdmin,
    async (_req: Request, res: Response) => {
      const targets = [
        { n: "identity-service", u: identityUrl },
        { n: "tenant-service", u: tenantUrl },
        { n: "billing-service", u: billingUrl },
        { n: "job-service", u: jobUrl },
        { n: "candidate-service", u: candidateUrl },
        { n: "interview-service", u: interviewUrl },
        { n: "resume-service", u: resumeUrl },
        { n: "screening-service", u: screeningUrl },
        { n: "notification-service", u: notificationUrl },
        { n: "search-service", u: searchUrl },
        { n: "agent-service", u: agentUrl },
        { n: "analytics-service", u: analyticsServiceUrl },
        { n: "compliance-service", u: complianceServiceUrl },
      ];
      const services = await Promise.all(
        targets.map(async (s) => {
          const t0 = Date.now();
          try {
            const ctrl = new AbortController();
            const to = setTimeout(() => ctrl.abort(), 3000);
            const r = await fetch(`${s.u}/healthz`, { signal: ctrl.signal });
            clearTimeout(to);
            const lat = Date.now() - t0;
            return { n: s.n, s: r.ok ? "healthy" : "degraded", lat, err: r.ok ? 0 : (r.status >= 500 ? 5 : 1) };
          } catch {
            return { n: s.n, s: "down", lat: 0, err: 100 };
          }
        })
      );
      const healthy = services.filter((x) => x.s === "healthy").length;
      res.json({ success: true, data: { services, healthy, total: services.length } });
    }
  );

  // GET /api/super-admin/tenants — enriched tenant list. Forwards the query to
  // tenant-service, then merges per-tenant userCount/candidateCount/
  // requisitionCount (from the platform-stats maps) + agentRunCount/costUsd30d
  // (from billing's cost rollup). Exact-path GET so PATCH /:id and other
  // sub-paths still fall through to the proxy below.
  app.get(
    "/api/super-admin/tenants",
    gatewayAuth(),
    requireSuperAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { callService, uh } = await superAdminFanout(req);
        const qs = new URLSearchParams(req.query as Record<string, string>).toString();
        const [listRes, uStats, cStats, rStats, cost] = await Promise.allSettled([
          callService<any>("tenant", { path: `/internal/tenants${qs ? `?${qs}` : ""}`, userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("identity", { path: "/internal/users/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("candidate", { path: "/internal/candidates/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("job", { path: "/internal/requisitions/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("billing", { path: "/internal/platform/cost?days=30", userHeaders: uh, timeoutMs: 4000 }),
        ]);
        const list = settledVal(listRes) ?? { data: [], total: 0, page: 1, pages: 0 };
        const users = (settledVal(uStats) ?? {}).byTenant ?? {};
        const cands = (settledVal(cStats) ?? {}).byTenant ?? {};
        const reqs = (settledVal(rStats) ?? {}).byTenant ?? {};
        const costByTenant = new Map<string, { runs: number; costUsd: number }>();
        for (const row of (settledVal(cost) ?? {}).byTenant ?? []) {
          costByTenant.set(row.tenantId, { runs: row.runs ?? 0, costUsd: row.costUsd ?? 0 });
        }
        const rows = (list.data ?? []).map((tn: any) => ({
          ...tn,
          userCount: users[tn.id] ?? 0,
          candidateCount: cands[tn.id] ?? 0,
          requisitionCount: reqs[tn.id] ?? 0,
          agentRunCount: costByTenant.get(tn.id)?.runs ?? 0,
          costUsd30d: costByTenant.get(tn.id)?.costUsd ?? 0,
        }));
        res.json({
          success: true,
          data: { data: rows, total: list.total ?? rows.length, page: list.page ?? 1, pages: list.pages ?? 1 },
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // GET /api/super-admin/tenants/:id/detail — per-tenant drill-down: the tenant
  // record + its counts (users/candidates/requisitions), 30-day agent cost, the
  // plan-change request history, and the user roster. Exact path so it is matched
  // before the generic /api/super-admin/tenants proxy below.
  app.get(
    "/api/super-admin/tenants/:id/detail",
    gatewayAuth(),
    requireSuperAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { callService, uh } = await superAdminFanout(req);
        const tid = req.params["id"] as string;
        const [tenant, uStats, cStats, rStats, cost, planChanges, users] = await Promise.allSettled([
          callService<any>("tenant", { path: `/internal/tenants/${tid}`, userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("identity", { path: "/internal/users/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("candidate", { path: "/internal/candidates/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("job", { path: "/internal/requisitions/platform-stats", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("billing", { path: "/internal/platform/cost?days=30", userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("tenant", { path: `/internal/plan-changes/by-tenant/${tid}`, userHeaders: uh, timeoutMs: 4000 }),
          callService<any>("identity", { path: `/internal/users?tenantId=${encodeURIComponent(tid)}`, userHeaders: uh, timeoutMs: 4000 }),
        ]);
        const costRow = ((settledVal(cost) ?? {}).byTenant ?? []).find((r: any) => r.tenantId === tid);
        res.json({
          success: true,
          data: {
            tenant: settledVal(tenant) ?? null,
            userCount: ((settledVal(uStats) ?? {}).byTenant ?? {})[tid] ?? 0,
            candidateCount: ((settledVal(cStats) ?? {}).byTenant ?? {})[tid] ?? 0,
            requisitionCount: ((settledVal(rStats) ?? {}).byTenant ?? {})[tid] ?? 0,
            agentRunCount: costRow?.runs ?? 0,
            costUsd30d: costRow?.costUsd ?? 0,
            planChangeRequests: settledVal(planChanges) ?? [],
            users: settledVal(users) ?? [],
          },
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.use("/api/super-admin/tenants", gatewayAuth(), requireSuperAdmin, forwardHeaders(tenantUrl, "/internal/tenants"));
  app.use("/api/super-admin/plan-change-requests", gatewayAuth(), requireSuperAdmin, forwardHeaders(tenantUrl, "/internal/plan-changes"));

  // Phase 21 — platform control plane (super-admin only). Proxies to billing-service
  // which owns the platform kill switches, cross-tenant cost rollup, and prompt overrides.
  app.use("/api/super-admin/platform", gatewayAuth(), requireSuperAdmin, forwardHeaders(billingUrl, "/internal/platform"));

  // Phase 32a — super-admin impersonation. In-process router (signs JWT +
  // writes audit). Mounted BEFORE the proxy routes so super-admin gating
  // happens before any forwarding.
  // NOTE: no mount-level requireSuperAdmin here. /start self-checks SUPER_ADMIN,
  // but /stop must be callable WHILE impersonating — at which point req.user.role
  // is the impersonated user's role (e.g. ADMIN), not SUPER_ADMIN. Gating the
  // mount with requireSuperAdmin made it impossible to stop an active session
  // (403). Each route enforces its own authorization (/start: role===SUPER_ADMIN;
  // /stop: requires an active actorUserId).
  app.use(
    "/api/super-admin/impersonate",
    gatewayAuth(),
    express.json({ limit: "32kb" }),
    impersonateRouter,
  );

  // Phase 32c — audit log viewer. Read-only super-admin path proxied
  // straight to identity-service /internal/audit (GET only).
  app.use("/api/super-admin/audit", gatewayAuth(), requireSuperAdmin, forwardHeaders(identityUrl, "/internal/audit"));

  // Phase 34b — public ingest API. NO gatewayAuth (it uses tenant API keys,
  // verified inside the router via identity-service /api-keys/verify).
  // Versioned /v1/* so future schema changes can land at /v2/*.
  app.use("/api/v1", express.json({ limit: "2mb" }), publicIngestRouter);

  // Tenant-side CRUD for those keys.
  app.use("/api/api-keys", gatewayAuth(), forwardHeaders(identityUrl, "/internal/api-keys"));

  // Phase 34c — inbound email webhooks (SendGrid/Mailgun/Postmark).
  // Public; signature verified inside the notification-service routes.
  // Mounted as a raw proxy without express.json() — we need the multipart
  // body to flow through untouched (SendGrid sends multipart/form-data).
  app.use(
    "/api/inbound-email",
    createProxyMiddleware({
      target: notificationUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/internal/inbound-email${path}`,
      logger,
    })
  );

  // Phase 34d — cloud sync OAuth. /callback is public (no JWT — the OAuth
  // state param carries the tenantId). Everything else is auth-gated.
  app.use(
    "/api/cloud-sync",
    (req: Request, res: Response, next: NextFunction) => {
      // Skip auth for OAuth callbacks (the provider redirects here)
      if (req.path.endsWith("/callback")) return next();
      return gatewayAuth()(req, res, next);
    },
    forwardHeaders(notificationUrl, "/internal/cloud-sync"),
  );

  // Phase 34e — Twilio webhook ingress. Public + raw-body proxy so Twilio's
  // form-encoded payload + signature header pass through untouched.
  app.use(
    "/api/twilio/sms",
    createProxyMiddleware({
      target: notificationUrl, changeOrigin: true,
      pathRewrite: () => "/internal/twilio/sms", logger,
    })
  );
  app.use(
    "/api/twilio/whatsapp",
    createProxyMiddleware({
      target: notificationUrl, changeOrigin: true,
      pathRewrite: () => "/internal/twilio/whatsapp", logger,
    })
  );
  // Tenant-facing Twilio config + conversation log.
  app.use("/api/twilio", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/twilio"));

  // Phase 32b — support tickets. Tenant side (open / list / reply) is
  // standard auth; super-admin side is gated inside the router.
  app.use("/api/support", gatewayAuth(), forwardHeaders(notificationUrl, "/internal/support"));
  app.use("/api/super-admin/support", gatewayAuth(), requireSuperAdmin, forwardHeaders(notificationUrl, "/internal/support/admin"));

  // Phase 28 — Tenant SSO config (auth-gated; identity-service handles requireTenantAdmin internally).
  // Public SSO endpoints (discover, initiate, callback) are NOT here — they live
  // in routes/auth.ts because they need to sign JWTs + set cookies.
  app.use("/api/sso/config", gatewayAuth(), forwardHeaders(identityUrl, "/internal/sso/tenants"));

  // Phase 20 — tenant self-service config (branding + retention).
  // Branding GET/PUT proxies to tenant-service's /internal/branding and
  // /internal/retention. Auth required: tenant-admin scope (the route
  // itself reads X-Tenant-Id from the forwarded headers).
  app.use("/api/branding", gatewayAuth(), forwardHeaders(tenantUrl, "/internal/branding"));
  app.use("/api/retention", gatewayAuth(), forwardHeaders(tenantUrl, "/internal/retention"));

  // Phase 29 — first-run onboarding wizard state.
  // Dashboard hits GET on mount to decide whether to pop the wizard; admin
  // posts steps/dismiss/reset as the user progresses. requireTenantAdmin is
  // enforced inside the route handlers themselves for the mutating endpoints.
  app.use("/api/onboarding", gatewayAuth(), forwardHeaders(tenantUrl, "/internal/onboarding"));

  // Phase 30 — Stripe self-serve plan purchases.
  // - /api/stripe/webhook is PUBLIC + raw-body (Stripe's signature IS the auth).
  //   It's mounted BEFORE express.json() further up… but the gateway has no
  //   global json() — each route is auth-wrapped. We use createProxyMiddleware
  //   so the raw bytes flow through untouched.
  // - Everything else under /api/billing/stripe/* is JWT-gated; requireTenantAdmin
  //   is enforced inside billing-service's stripe router for mutations.
  app.use(
    "/api/stripe/webhook",
    createProxyMiddleware({
      target: billingUrl,
      changeOrigin: true,
      pathRewrite: () => "/internal/stripe/webhook",
      logger,
      // Preserve the raw body — http-proxy-middleware does this by default
      // when no body parser has consumed the stream.
    })
  );
  app.use(
    "/api/billing/stripe",
    gatewayAuth(),
    forwardHeaders(billingUrl, "/internal/stripe")
  );

  // Public branding endpoint — no auth, used by the candidate-portal to
  // whitelabel /jobs and /jobs/:id/apply. Restrictive cache so updates
  // propagate without a CDN purge but we still get ~60s edge caching.
  app.use("/api/public/branding", forwardHeaders(tenantUrl, "/internal/public-branding"));

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());      // capture into Sentry (no-op if SENTRY_DSN unset)
  app.use(createErrorHandler(logger));
  return app;
}
