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
import http from "node:http";
import https from "node:https";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit, { type Store } from "express-rate-limit";
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
  MODULE_REGISTRY,
} from "@cdc-ats/common";
import { Redis } from "ioredis";
import type { Logger } from "pino";
import { createProxyMiddleware, type Options as ProxyOptions } from "http-proxy-middleware";
import { gatewayAuth } from "./lib/auth-middleware.js";
import { resolveTenantPlan } from "./lib/tenant-plan.js";
import { requireAgentPlan } from "./lib/agent-gate.js";
// WF4 — module gate. resolveModule powers the /api/me/modules nav/widget filter
// below; requireModule (WF4-exported) is the per-tenant module gate. WF7 attaches
// it to the new /api/assessments authored surface (the first module-owned route).
import { resolveModule, requireModule } from "./lib/module-gate.js";
import { embedFramingHeaders } from "./lib/embed-headers.js";
import { mintEmbedToken, EMBED_EXPIRES_SECONDS } from "./lib/embed-token.js";
import authRouter from "./routes/auth.js";
import impersonateRouter from "./routes/impersonate.js";
import { publicIngestRouter } from "./routes/public-ingest.js";
import { platformRouter } from "./routes/platform.js";
import { analyticsAgentRouter, biasAuditorRouter, copilotRouter } from "./routes/agents.js";
import { aggregatorRouter } from "./routes/aggregators.js";
import { gdprRouter } from "./routes/gdpr.js";
import { embedRouter } from "./routes/embed.js";

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

// WF-I / I5 — shared keep-alive HTTP agents for the proxy chain. Without these,
// http-proxy-middleware opens a fresh TCP (and TLS) connection per proxied
// request; under an apply spike that means thousands of handshakes/sec to
// job-service + resume-service, exhausting ephemeral ports and adding latency.
// A bounded pool of reused sockets is the single biggest throughput win for the
// public-apply data path. maxSockets is per-host, so it caps fan-out to any one
// backend; maxFreeSockets keeps a warm pool between bursts. All env-tunable.
const KEEPALIVE_MAX_SOCKETS = Number(process.env["GATEWAY_AGENT_MAX_SOCKETS"] ?? 512);
const KEEPALIVE_MAX_FREE = Number(process.env["GATEWAY_AGENT_MAX_FREE_SOCKETS"] ?? 128);
const httpKeepAliveAgent = new http.Agent({
  keepAlive: true,
  maxSockets: KEEPALIVE_MAX_SOCKETS,
  maxFreeSockets: KEEPALIVE_MAX_FREE,
  timeout: Number(process.env["GATEWAY_AGENT_SOCKET_TIMEOUT_MS"] ?? 60_000),
});
const httpsKeepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: KEEPALIVE_MAX_SOCKETS,
  maxFreeSockets: KEEPALIVE_MAX_FREE,
  timeout: Number(process.env["GATEWAY_AGENT_SOCKET_TIMEOUT_MS"] ?? 60_000),
});
/** Pick the right keep-alive agent for a backend target URL (http vs https). */
function agentFor(target: string): http.Agent | https.Agent {
  return target.startsWith("https:") ? httpsKeepAliveAgent : httpKeepAliveAgent;
}
// Inter-service-call timeout (gateway -> backend), aligned with the
// resume-service 3s budget so a stuck backend frees the socket fast under load.
export const INTER_SERVICE_TIMEOUT_MS = Number(process.env["GATEWAY_INTER_SERVICE_TIMEOUT_MS"] ?? 3000);

// WF-I / I5 — optional shared Redis store for express-rate-limit. Resolved ONCE
// at module load (top-level await, NodeNext ESM) so createApp stays synchronous.
// `rate-limit-redis` is NOT yet declared in apps/api-gateway/package.json, so the
// import is best-effort: when the package (or Redis) is absent we fall back to
// the default in-memory store. To make the limiter ceilings cluster-correct
// (counted across replicas, not per-process), add `rate-limit-redis` to the
// gateway's dependencies — the wiring below already consumes it.
let RateLimitRedisStore: (new (opts: any) => Store) | null = null;
if (process.env["REDIS_URL"] && process.env["DISABLE_RATE_LIMIT"] !== "1") {
  try {
    // Indirect specifier (a variable, not a string literal) so tsc does NOT try
    // to statically resolve a package that isn't installed yet — the dynamic
    // import is best-effort and ERR_MODULE_NOT_FOUND is swallowed. This compiles
    // whether or not `rate-limit-redis` is present in node_modules.
    const spec = "rate-limit-redis";
    const mod: any = await import(spec).catch(() => null);
    RateLimitRedisStore = (mod?.default ?? mod?.RedisStore ?? null) as
      | (new (opts: any) => Store)
      | null;
  } catch {
    RateLimitRedisStore = null;
  }
}

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("api-gateway");

  // WF-I / I5 — THE #1 THROUGHPUT BLOCKER FIX. Trust the proxy/tunnel in front
  // of the gateway so Express derives req.ip from X-Forwarded-For instead of the
  // single upstream socket address. Without this, EVERY request (from every real
  // client) shares ONE req.ip — so the per-IP rate limiters below collapse the
  // whole apply spike into a SINGLE bucket and 429 instantly under load. Must be
  // set BEFORE any rate-limit middleware (express-rate-limit reads req.ip at
  // request time, but trust-proxy is an app setting that has to be in place when
  // the request is parsed). Configurable via TRUST_PROXY:
  //   unset / "true"  -> trust all hops (the default for a tunneled single-host
  //                      demo where the immediate peer is always our own proxy)
  //   "false"         -> trust none (direct-exposure deployments)
  //   a number ("1")  -> trust exactly N hops (LB chains)
  //   a CSV of CIDRs  -> trust only those proxy subnets
  const trustProxyEnv = process.env["TRUST_PROXY"];
  let trustProxy: boolean | number | string[] = true;
  if (trustProxyEnv !== undefined) {
    if (trustProxyEnv === "true") trustProxy = true;
    else if (trustProxyEnv === "false") trustProxy = false;
    else if (/^\d+$/.test(trustProxyEnv.trim())) trustProxy = Number(trustProxyEnv.trim());
    else trustProxy = trustProxyEnv.split(",").map((s) => s.trim()).filter(Boolean);
  }
  app.set("trust proxy", trustProxy);

  app.use(requestId());
  // Per-path timeout override — MUST run BEFORE the global requestTimeout
  // middleware, because that middleware arms its setTimeout (reading
  // req.timeoutMs) at the moment it executes. A 1k–10k-file / up-to-300MB ZIP
  // upload + async-extract handoff on /api/resume streams far past the default
  // 30s socket budget, so give the entire /api/resume path a 300s window. Other
  // services keep the 30s default untouched.
  app.use("/api/resume", (req: Request, _res: Response, next: NextFunction) => {
    req.timeoutMs = 300_000;
    next();
  });
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

  // WF2 — scoped embed framing. Runs AFTER helmet() so it can override helmet's
  // global X-Frame-Options, but ONLY on /embed/* and /api/embed/* (it no-ops on
  // every other path, leaving the global frameguard byte-identical). On the
  // embed surface it removes X-Frame-Options and sets CSP frame-ancestors from
  // the verified embed token's allowedOrigins, failing closed to 'none' when no
  // valid token / empty allowlist. Mounted before the proxy chain so the headers
  // are set regardless of how the embed request is ultimately routed.
  app.use(embedFramingHeaders());

  // Rate limits are env-configurable so a dedicated load-test environment can
  // measure true capacity. DISABLE_RATE_LIMIT=1 turns them off entirely (load
  // tests / internal benchmarks only — NEVER in a public prod env). Defaults
  // keep production behavior intact unless explicitly raised.
  const rlDisabled = process.env["DISABLE_RATE_LIMIT"] === "1";

  // WF-I / I5 — shared Redis store so the limiter ceilings are correct ACROSS
  // replicas (an in-memory store counts per-process, so N replicas silently
  // multiply the effective limit by N). Uses the module-resolved optional
  // `rate-limit-redis` store when present + Redis is connected; otherwise falls
  // back to the default in-memory store (per-process). Declare `rate-limit-redis`
  // in apps/api-gateway/package.json to make ceilings cluster-correct.
  let redisStoreFactory: (() => Store) | null = null;
  if (redis && !rlDisabled && RateLimitRedisStore) {
    const RedisStoreCtor = RateLimitRedisStore;
    redisStoreFactory = () =>
      new RedisStoreCtor({
        // ioredis: forward the limiter's commands to the shared client.
        sendCommand: (...args: string[]) => (redis as Redis).call(...(args as [string, ...string[]])),
        prefix: "rl:gw:",
      });
    logger.info("rate limiters using shared Redis store (cluster-correct)");
  } else if (!rlDisabled) {
    logger.warn("rate limiters using in-memory store (per-process) — declare rate-limit-redis for cluster-correct ceilings");
  }
  const withStore = <T extends Record<string, unknown>>(cfg: T): T =>
    redisStoreFactory ? ({ ...cfg, store: redisStoreFactory() } as T) : cfg;

  // Strict rate limit on /api/auth to slow credential stuffing. Per-IP (real
  // client IP now that trust-proxy is set above).
  // NOTE on `validate: false`: trust-proxy is set deliberately above, so we
  // silence express-rate-limit v7's permissive-trust-proxy startup validation
  // (which would otherwise log ERR_ERL_PERMISSIVE_TRUST_PROXY and, with a custom
  // keyGenerator, the IPv6 subnet warning). The trust boundary is owned by the
  // TRUST_PROXY env knob, not by the limiter's heuristic check.
  const authLimiter = rateLimit(withStore({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env["AUTH_RATE_LIMIT_MAX"] ?? 20),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    skip: () => rlDisabled,
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many auth attempts" } },
  }));
  // Global ceiling — raised WELL above legit peak so a genuine apply spike (the
  // async pipeline absorbs the writes downstream) is admitted rather than 429'd
  // at the edge. With trust-proxy fixed this is now a real per-IP limit, so the
  // ceiling protects against a single hostile source without throttling a true
  // multi-thousand-client burst. Default bumped from 500 -> 5000/15min/IP; still
  // env-overridable and fully disabled by DISABLE_RATE_LIMIT=1.
  const generalLimiter = rateLimit(withStore({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env["GATEWAY_RATE_LIMIT_MAX"] ?? 5000),
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    skip: () => rlDisabled,
  }));
  app.use(generalLimiter);

  // WF-I / I5 — public-apply burst control. A token-bucket-shaped limiter keyed
  // by IP + email + job slug: an individual applicant may legitimately retry a
  // few times (burst ~5) and the bucket refills ~1/s, but a single source cannot
  // hammer one job. This is INTENTIONALLY narrow (only the public apply POSTs) so
  // the high global ceiling above can stay generous for the real spike while this
  // stops a hot-loop abuser. Keyed below the global limiter so both apply.
  //   PUBLIC_APPLY_BURST     default 5   (bucket capacity / window max)
  //   PUBLIC_APPLY_WINDOW_MS default 5000 (~1 token/s refill at burst 5)
  const applyBurst = Number(process.env["PUBLIC_APPLY_BURST"] ?? 5);
  const applyWindowMs = Number(process.env["PUBLIC_APPLY_WINDOW_MS"] ?? 5000);
  const publicApplyLimiter = rateLimit(withStore({
    windowMs: applyWindowMs,
    max: applyBurst,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    skip: (req: Request) => rlDisabled || req.method !== "POST",
    keyGenerator: (req: Request) => {
      const ip = req.ip ?? "unknown";
      // email lives in the multipart/JSON body which is NOT parsed on this raw
      // proxy path, so key on the stable parts we have: IP + the job slug in the
      // path. (Per-email keying would require parsing the body and consuming the
      // upload stream, which must stay untouched for the proxy.)
      const slug = (req.params as Record<string, string>)?.["slug"] ?? req.path;
      return `apply:${ip}:${slug}`;
    },
    message: { success: false, error: { code: "RATE_LIMITED", message: "Too many applications from this source — slow down and retry shortly." } },
  }));
  // Mount on BOTH public apply shapes (slug apply + slug apply-custom) before the
  // generic /api/public proxy. Method-skipped to POST so GET listings are never
  // throttled by this bucket.
  app.use("/api/public/jobs/:slug/apply", publicApplyLimiter);
  app.use("/api/public/jobs/:slug/apply-custom", publicApplyLimiter);

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
  // WF-I / I5 — `agent` (keep-alive socket pooling) is applied to EVERY proxy
  // mount: it is a pure throughput win with no behavior change. `proxyTimeout` is
  // OPT-IN per mount (default: none) — a blanket short timeout would break the
  // legitimately-slow paths that flow through this same helper (multipart resume
  // uploads on /api/resume, which already get a 300s request window, and the AI
  // agent proxies like /api/jd-author that wait on multi-second LLM calls). So we
  // do NOT impose the 3s inter-service budget on the generic forwarder; the
  // gateway's own callService() carries that budget for the aggregator calls.
  const forwardHeaders = (proxyTarget: string, targetPrefix: string, opts?: { proxyTimeoutMs?: number }) => {
    const proxy = createProxyMiddleware({
      target: proxyTarget,
      changeOrigin: true,
      // Reuse pooled keep-alive sockets to the backend instead of a fresh
      // TCP/TLS handshake per request (the throughput win on every write).
      agent: agentFor(proxyTarget),
      ...(opts?.proxyTimeoutMs ? { proxyTimeout: opts.proxyTimeoutMs } : {}),
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
  // WF7 — assessment-service (online assessments / OA), port 4014. Proxied for
  // the first time here (it ran un-proxied since WF3); see the /api/assessments +
  // /api/public/assessment + Judge0-callback mounts below.
  const assessmentUrl = process.env["ASSESSMENT_SERVICE_URL"] ?? "http://localhost:4014";
  // Module F — onboarding-service (Workday-style post-offer onboarding), port 4015.
  const onboardingUrl = process.env["ONBOARDING_SERVICE_URL"] ?? "http://localhost:4015";

  // WF7 — PUBLIC candidate take surface (no auth). The candidate opens an
  // assessment from a single-use invite token, so there is NO JWT and NO tenant
  // header on these calls — the assessment-service public-take router resolves the
  // tenant FROM the token row via prismaAdmin (the job-service public-by-slug
  // idiom). This is a RAW createProxyMiddleware (NO gatewayAuth, NO
  // X-Internal-Service stamp — the same posture as the public apply + inbound-email
  // blocks): the token in the body/header IS the credential, verified downstream.
  // It supports multipart take uploads untouched (no body parser consumes the
  // stream). Mounted BEFORE the generic /api/public catch-all so this exact
  // sub-path wins over the job-service rewrite.
  //   /api/public/assessment/*  → assessment-service /internal/public/assessment/*
  app.use(
    "/api/public/assessment",
    createProxyMiddleware({
      target: assessmentUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/internal/public/assessment${path}`,
      logger,
    })
  );

  // WF7/G7 — Judge0 inbound callback ingress. PUBLIC + raw proxy: the isolated
  // Judge0 sidecar delivers per-submission verdicts here and carries NO JWT — the
  // opaque submission token in the body IS the correlation credential (verified
  // downstream by matching it to a stored test case). Same posture as the
  // inbound-email / twilio webhook proxies: NO gatewayAuth, NO X-Internal-Service
  // stamp, and NO body parser (the JSON body streams through untouched).
  //   /api/internal/judge0/*  → assessment-service /internal/judge0/*
  app.use(
    "/api/internal/judge0",
    createProxyMiddleware({
      target: assessmentUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/internal/judge0${path}`,
      logger,
    })
  );

  // WF8/H4 — inbound OA-provider result webhook ingress. PUBLIC + raw proxy: an
  // external assessment vendor (Codility, HackerEarth, iMocha, TestGorilla) POSTs
  // a completion event here and carries NO JWT — the providerInvitationId in the
  // path IS the correlation credential and the vendor's HMAC signature (over the
  // raw body, verified downstream against the per-invite secret) is the auth. Same
  // posture as the Judge0 / inbound-email / twilio webhook proxies: NO gatewayAuth,
  // NO X-Internal-Service stamp, and NO body parser (the raw bytes the vendor
  // signed stream through untouched so the HMAC check matches). NOT module-gated:
  // a vendor cannot send the tenant's oa-assessments flag, and the downstream
  // route safely no-ops an unknown/forged correlation id.
  //   /api/inbound-assessment/*  → assessment-service /internal/inbound-assessment/*
  app.use(
    "/api/inbound-assessment",
    createProxyMiddleware({
      target: assessmentUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/internal/inbound-assessment${path}`,
      logger,
    })
  );

  // WF-E / E6 — inbound JOB-APPLICATION webhook ingress. PUBLIC + raw proxy: an
  // external hiring platform / job board (Indeed, LinkedIn, ZipRecruiter, Naukri,
  // ...) POSTs a candidate application here and carries NO JWT — the {provider}
  // + {tenantId} in the PATH are the correlation handles and the vendor's HMAC
  // signature (over the raw body, verified downstream against the per-board webhook
  // secret) is the auth. Same posture as the inbound-assessment / Judge0 /
  // inbound-email / twilio webhook proxies: NO gatewayAuth, NO X-Internal-Service
  // stamp, and NO body parser (the raw bytes the vendor signed stream through
  // untouched so the HMAC check matches; the path tenantId is NOT a trusted auth
  // header). NOT module-gated: a vendor cannot send the tenant's job-distribution
  // flag, and the downstream route safely no-ops an unknown/forged provider/tenant.
  // The hiring-platform inbound axis is DISTINCT from the OA inbound-assessment axis.
  //   /api/inbound-job-application/:provider/:tenantId
  //      → job-service /internal/inbound-job-application/:provider/:tenantId
  app.use(
    "/api/inbound-job-application",
    createProxyMiddleware({
      target: jobUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/internal/inbound-job-application${path}`,
      logger,
    })
  );

  // Module F — PUBLIC candidate onboarding portal. The opaque portalToken in the
  // path IS the credential (no JWT, no tenant header); onboarding-service resolves
  // the tenant from the case row. Same posture as the assessment public-take proxy
  // and mounted BEFORE the generic /api/public job-service catch-all so this exact
  // sub-path wins.
  //   /api/public/onboarding/*  → onboarding-service /public/onboarding/*
  app.use(
    "/api/public/onboarding",
    createProxyMiddleware({
      target: onboardingUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/public/onboarding${path}`,
      logger,
    })
  );

  // ── Public routes (no auth) — /api/public/* → job-service /public/* ──
  // WF-I / I5 — the public APPLY data path. Reuse pooled keep-alive sockets to
  // job-service (the hottest backend under an apply spike). No aggressive
  // proxyTimeout here: a multipart apply (resume upload) can legitimately run
  // longer than the 3s inter-service budget, and the request itself is governed
  // by the /api/resume 300s window + the per-IP apply burst limiter above.
  app.use(
    "/api/public",
    createProxyMiddleware({
      target: jobUrl,
      changeOrigin: true,
      agent: agentFor(jobUrl),
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

        // Phase 35 — "added beneath you" notices (notify-only). Tell the
        // inviter (the manager who added) and, if they report to someone, that
        // manager too (e.g. the tenant admin) that a new user joined the org.
        // in_app + email; best-effort, never blocks the invite.
        try {
          const newName = `${result?.firstName ?? ""} ${result?.lastName ?? ""}`.trim() || result?.email || "A new teammate";
          const inviterName = req.user.email ?? "a manager";
          const teamUrl = `${process.env["APP_URL"] ?? "http://localhost:3000"}/settings/team`;
          const targets: Array<{ userId: string; body: string }> = [
            { userId: req.user.id, body: `${newName} was added to your team as ${result?.role ?? "a team member"}.` },
          ];
          if (result?.inviterManagerId && result.inviterManagerId !== req.user.id) {
            targets.push({
              userId: result.inviterManagerId,
              body: `${newName} was added under ${inviterName} as ${result?.role ?? "a team member"}.`,
            });
          }
          for (const tg of targets) {
            await callService("notification", {
              method: "POST",
              path: "/internal/notifications/system",
              userHeaders: { userId: "system", tenantId: req.user.tenantId, role: "SUPER_ADMIN", email: "system@cdc-ats.local" },
              body: {
                tenantId: req.user.tenantId,
                userId: tg.userId,
                type: "SYSTEM",
                title: "New team member added",
                body: tg.body,
                link: teamUrl,
                channels: ["in_app", "email"],
              },
            }).catch(() => { /* notice delivery is non-fatal */ });
          }
        } catch { /* notices never block the invite */ }

        // Strip inviteToken + the internal inviterManagerId from the response
        // so neither leaks to the admin's browser network tab.
        const { inviteToken, inviteExpiresAt, inviterManagerId: _imid, ...safe } = result;
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
  // WF4 — tenant-admin gate for tenant-scoped module mutations. Mirrors the
  // inline requireSuperAdmin below; the verified JWT role is the authority.
  const requireTenantAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(Errors.unauthorized());
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return next(Errors.forbidden("Tenant admin role required"));
    }
    next();
  };

  app.use("/api/users", gatewayAuth(), forwardHeaders(identityUrl, "/internal/users"));
  app.use("/api/billing", gatewayAuth(), forwardHeaders(billingUrl, "/internal/billing"));

  // WF4 — module surface for the tenant. All additive, behind gatewayAuth.
  //
  // GET /api/me/modules — the caller tenant's RESOLVED enabled module set, for
  // nav + widget filtering on the client. Resolves every registered module via
  // the module-gate (billing check-module, REAL TenantModule/ModuleRegistry +
  // PLAN_LIMITS rows — never a hardcoded enabled:true), fail-soft per module so
  // a billing blip degrades gracefully rather than 500ing the whole nav.
  app.get(
    "/api/me/modules",
    gatewayAuth(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        const resolved = await Promise.all(
          MODULE_REGISTRY.map(async (m) => {
            const r = await resolveModule(req, m.key);
            return {
              key: m.key,
              name: m.name,
              category: m.category,
              type: m.type,
              enabled: r.enabled === true,
              reason: r.enabled ? undefined : r.reason,
              requiresPlan: m.requiresPlan ?? null,
              contributions: m.contributions,
            };
          }),
        );
        res.json({
          success: true,
          data: {
            modules: resolved,
            enabledKeys: resolved.filter((m) => m.enabled).map((m) => m.key),
          },
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // PUT /api/tenant/modules/:key — tenant admin toggles a module on/off for
  // their own tenant. requireTenantAdmin gate, then proxied to billing
  // (/internal/billing/modules/:key) which owns the TenantModule write +
  // publishes module.toggled (the gateway cache buster subscribes to it).
  app.put(
    "/api/tenant/modules/:key",
    gatewayAuth(),
    requireTenantAdmin,
    express.json({ limit: "256kb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        const moduleKey = req.params["key"] as string;
        const { callService } = await import("./lib/service-client.js");
        const data = await callService<unknown>("billing", {
          method: "PUT",
          path: `/internal/billing/modules/${encodeURIComponent(moduleKey)}`,
          body: req.body,
          userHeaders: {
            userId: req.user.id,
            tenantId: req.user.tenantId,
            role: req.user.role,
            email: req.user.email,
          },
        });
        res.json({ success: true, data });
      } catch (err) {
        next(err);
      }
    },
  );
  // WF6/F1 — per-user dashboard layouts + UI preferences, and tenant-default
  // layouts. Plain forwardHeaders proxies (no express.json — the body streams
  // through, matching every other write proxy here). All behind gatewayAuth so
  // the verified JWT claims are stamped on as X-User-Id/X-Tenant-Id/X-User-Role
  // before reaching identity, which keys the RLS writes to the caller.
  //   GET/PUT/DELETE /api/me/dashboards/:dashboardKey
  //                                  → identity /internal/users/me/dashboards/:k
  //   GET/PATCH      /api/me/preferences
  //                                  → identity /internal/users/me/preferences
  //   GET/PUT        /api/tenant/dashboards/:dashboardKey (tenant-admin only,
  //      enforced inside identity)   → identity /internal/users/tenant/dashboards/:k
  app.use("/api/me/dashboards", gatewayAuth(), forwardHeaders(identityUrl, "/internal/users/me/dashboards"));
  app.use("/api/me/preferences", gatewayAuth(), forwardHeaders(identityUrl, "/internal/users/me/preferences"));
  app.use("/api/tenant/dashboards", gatewayAuth(), forwardHeaders(identityUrl, "/internal/users/tenant/dashboards"));

  // WF-C/WF-D (C4+D4) — developer-customizable UI config surface for the caller
  // tenant. Mirrors the /api/me/modules + /api/me/dashboards mounts: a plain
  // forwardHeaders proxy to tenant-service /internal/ui-config (which GET-serves
  // the migrated UiConfig document + sibling rendering defaults, and PUT-persists
  // a UiConfigSchema-validated document — the schema is the CSS-injection defense
  // boundary, so every hex/font/url is validated downstream before it can reach an
  // inline <style>). forwardHeaders stamps the verified JWT claims (X-User-Id/
  // X-Tenant-Id/X-User-Role) so the tenant-service RLS client scopes the read/write
  // to the caller's OWN Tenant row.
  //
  // GET is an OPEN READ (any authed tenant user — the chrome needs the document to
  // render), matching the modules read-pass convention. PUT requires the
  // ENTERPRISE-gated `ui-customization` module (requireModule), method-agnostic
  // module gate applied ONLY to the write so a non-GET on a tenant without the
  // module gets 404/402 here while the read — and the fail-soft default that keeps
  // cd-shell byte-identical when /api/me/ui-config 404s or has no override — is
  // never blocked. The gate is wired as a per-method shim (NOT a prefix-level
  // middleware) so it can never catch the open GET or any other route. The PUT's
  // own tenant-admin authorization is enforced downstream (tenant-service
  // requireTenantAdmin), exactly like /api/branding + /api/onboarding.
  //   GET /api/me/ui-config      → tenant-service /internal/ui-config (open read)
  //   PUT /api/me/ui-config      → tenant-service /internal/ui-config
  //                                (module-gated: requireModule('ui-customization'))
  {
    const uiConfigProxy = forwardHeaders(tenantUrl, "/internal/ui-config");
    const uiConfigModuleGate = requireModule("ui-customization");
    app.use(
      "/api/me/ui-config",
      gatewayAuth(),
      (req: Request, res: Response, next: NextFunction) => {
        // GET stays open (read-pass); only the write (PUT) is module-gated. Any
        // other verb falls through to the gate too, so a non-GET on a tenant
        // without the module is consistently 404/402'd rather than forwarded.
        if (req.method === "GET") return next();
        return uiConfigModuleGate(req, res, next);
      },
      uiConfigProxy,
    );
  }

  app.use("/api/requisitions", gatewayAuth(), forwardHeaders(jobUrl, "/internal/requisitions"));
  app.use("/api/job-postings", gatewayAuth(), forwardHeaders(jobUrl, "/internal/job-postings"));
  // Module A — CDC / college partners (recruiter/admin).
  app.use("/api/colleges", gatewayAuth(), forwardHeaders(jobUrl, "/internal/colleges"));
  app.use("/api/jd-author", gatewayAuth(), requireAgentPlan("jd-author"), forwardHeaders(jobUrl, "/internal/jd-author"));

  // WF7 — Online Assessments authoring/invite/results surface (recruiter-side).
  // The FIRST module-owned gateway route: gated behind requireModule('oa-assessments')
  // so a tenant without the module (not on plan / kill-switched / dependency off)
  // gets 404/402 here, while the byte-frozen v1 surface stays untouched. The mount
  // is method-agnostic (GET reads + POST/PUT/PATCH/DELETE authoring), and
  // forwardHeaders stamps the verified JWT claims (X-User-Id/X-Tenant-Id/X-User-Role)
  // so the assessment-service RLS client scopes every read/write to the caller's
  // tenant. invites + results live under the same /internal/assessments base.
  //   /api/assessments/*  → assessment-service /internal/assessments/*
  app.use(
    "/api/assessments",
    gatewayAuth(),
    requireModule("oa-assessments"),
    forwardHeaders(assessmentUrl, "/internal/assessments"),
  );

  // WF-E / E6 — Job Distribution surface (recruiter-side). Posts a requisition out
  // to external hiring platforms / job boards (Indeed, LinkedIn, ZipRecruiter,
  // Naukri, ...) and reads back the per-board distribution status. The
  // hiring-platform adapter axis is DISTINCT from the OA assessment-provider axis:
  // it is gated behind its OWN module (requireModule('job-distribution'),
  // PROFESSIONAL+, defaultEnabled:false, failMode:'closed' — registered in WF-E/E5)
  // so a tenant without the module gets 404/402 here while the byte-frozen v1
  // surface stays untouched. The mount is method-agnostic (GET reads + POST/PUT/
  // PATCH/DELETE distribution control), and forwardHeaders stamps the verified JWT
  // claims (X-User-Id/X-Tenant-Id/X-User-Role) so the job-service RLS client scopes
  // every read/write to the caller's tenant. Mirrors the /api/assessments mount.
  //   /api/job-distribution/*  → job-service /internal/job-distribution/*
  app.use(
    "/api/job-distribution",
    gatewayAuth(),
    requireModule("job-distribution"),
    forwardHeaders(jobUrl, "/internal/job-distribution"),
  );

  // Platform aggregator — fans out to job + candidate + billing in parallel
  app.use("/api/platform", gatewayAuth(), platformRouter(logger));

  // GDPR — per-candidate export + delete fans out across services
  app.use("/api/gdpr", gatewayAuth(), express.json({ limit: "1mb" }), gdprRouter(logger));

  // WF2 — POST /api/embed/token. An AUTHED user mints a short-lived embed token
  // for a resource they can already access (gatewayAuth has verified them). The
  // gateway resolves the tenant's frame-ancestors allowlist SERVER-SIDE (the
  // tenant's embedAllowedOrigins, via tenant-service branding) so the client
  // can never widen its own framing scope. The minted token bakes the verified
  // tenant/user/role + the requested module/resourceId/params + that allowlist.
  //
  // Fail closed: if the tenant has no configured origins AND the authed caller
  // did not pass an explicit allowedOrigins, the token carries [] and the embed
  // consumer emits frame-ancestors 'none' (no origin may frame). The explicit
  // allowedOrigins fallback exists only until WF3 makes the tenant column the
  // live source of truth; it is still constrained to the caller's own tenant.
  //
  // Registered BEFORE the catch-all /api aggregator so this exact path wins.
  app.post(
    "/api/embed/token",
    gatewayAuth(),
    express.json({ limit: "64kb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) throw Errors.unauthorized();
        const { module, resourceId, params, allowedOrigins } = (req.body ?? {}) as {
          module?: unknown;
          resourceId?: unknown;
          params?: unknown;
          allowedOrigins?: unknown;
        };
        if (typeof module !== "string" || module.length === 0) {
          throw Errors.validation("module is required");
        }
        if (typeof resourceId !== "string" || resourceId.length === 0) {
          throw Errors.validation("resourceId is required");
        }
        const lockedParams =
          params && typeof params === "object" && !Array.isArray(params)
            ? (params as Record<string, unknown>)
            : {};

        // Resolve the tenant's configured allowlist (server-side, authoritative).
        // Fail soft to [] if tenant-service is unreachable — fail closed on the
        // resulting empty allowlist rather than throwing.
        let tenantOrigins: string[] = [];
        try {
          const { callService } = await import("./lib/service-client.js");
          const branding = await callService<{ embedAllowedOrigins?: unknown }>("tenant", {
            method: "GET",
            path: "/internal/branding",
            userHeaders: {
              userId: req.user.id,
              tenantId: req.user.tenantId,
              role: req.user.role,
              email: req.user.email,
            },
            timeoutMs: 4000,
          });
          if (Array.isArray(branding?.embedAllowedOrigins)) {
            tenantOrigins = (branding.embedAllowedOrigins as unknown[]).filter(
              (o): o is string => typeof o === "string" && o.length > 0,
            );
          }
        } catch {
          tenantOrigins = [];
        }

        // Until WF3 wires the tenant column end to end, accept an explicit
        // allowedOrigins from the authed caller as a fallback ONLY when the
        // tenant has none configured. Each entry must be a clean https origin
        // (parsed, no path/query/credentials, no wildcard) — anything looser is
        // dropped, so the trust boundary can never be widened past a bare origin.
        let resolvedOrigins = tenantOrigins;
        if (resolvedOrigins.length === 0 && Array.isArray(allowedOrigins)) {
          resolvedOrigins = (allowedOrigins as unknown[])
            .map((o) => (typeof o === "string" ? o.trim() : ""))
            .map((raw) => {
              if (!raw) return null;
              try {
                const u = new URL(raw);
                if (u.protocol !== "https:") return null;
                if ((u.pathname && u.pathname !== "/") || u.search || u.hash || u.username || u.password) return null;
                if (!u.hostname || u.hostname.includes("*")) return null;
                return u.origin;
              } catch {
                return null;
              }
            })
            .filter((o): o is string => o !== null);
          resolvedOrigins = Array.from(new Set(resolvedOrigins));
        }

        const token = mintEmbedToken({
          tenantId: req.user.tenantId,
          sub: req.user.id,
          role: req.user.role,
          module,
          resourceId,
          params: lockedParams,
          allowedOrigins: resolvedOrigins,
        });
        res.json({ success: true, data: { token, expiresIn: EMBED_EXPIRES_SECONDS } });
      } catch (err) {
        next(err);
      }
    },
  );

  // WF9 / SLICE I1 — embed DATA PLANE (token-authed, NO gatewayAuth). The
  // embeddable chrome-less widgets are framed into a customer site with no
  // session JWT — the short-lived signed EMBED TOKEN (minted above) is the only
  // credential. embedRouter() verifies that token itself and resolves the LOCKED
  // resource scoped to the baked tenantId (never the request):
  //   POST /api/embed/validate -> { valid, module, resourceId, params, branding }
  //   GET  /api/embed/data     -> the locked funnel / screening / chart / public job
  // Mounted on /api/embed (relaxed framing via embedFramingHeaders + nginx),
  // BEFORE the catch-all /api aggregator (which is gatewayAuth-gated) so these
  // exact sub-paths win. The /api/embed/token mint above stays gatewayAuth (an
  // already-logged-in user mints the token); only validate + data are token-authed.
  app.use("/api/embed", embedRouter());

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

  // /api/tenants/plan-change-request (in-process — wraps tenant-service).
  // Mounted via app.use + a POST guard: the app.post(...) form did not see the
  // Authorization header on this path (gatewayAuth 401'd), while the identical
  // app.use chain used elsewhere (e.g. /api/copilot) authenticates correctly.
  app.use(
    "/api/tenants/plan-change-request",
    gatewayAuth(),
    express.json({ limit: "1mb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.method !== "POST") { next(); return; }
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

  // GET /api/super-admin/security — platform security telemetry. In-process
  // aggregator (matches the /super-admin/stats + /super-admin/health style)
  // that reads identity-service's real-derived security KPIs: 24h active
  // sessions, MFA adoption %, and the active-sessions list. Fail-soft: if
  // identity is down it returns neutral zeros + an empty list so the screen
  // keeps its designed suspicious-activity / SSO panels.
  app.get(
    "/api/super-admin/security",
    gatewayAuth(),
    requireSuperAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { callService, uh } = await superAdminFanout(req);
        const sec = await Promise.allSettled([
          callService<any>("identity", { path: "/internal/users/platform/security", userHeaders: uh, timeoutMs: 4000 }),
        ]);
        const r0 = sec[0];
        const s: any = r0.status === "fulfilled" && r0.value ? r0.value : {};
        res.json({
          success: true,
          data: {
            activeSessions: s.activeSessions ?? 0,
            totalUsers: s.totalUsers ?? 0,
            mfaEnabledUsers: s.mfaEnabledUsers ?? 0,
            mfaAdoptionPct: s.mfaAdoptionPct ?? 0,
            sessions: Array.isArray(s.sessions) ? s.sessions : [],
          },
        });
      } catch (err) {
        next(err);
      }
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

  // WF4 — super-admin module control plane (GET list + PUT platform default /
  // registry sync). Proxies to billing-service /internal/platform/modules which
  // owns the ModuleRegistry + cross-tenant TenantModule rows. GET reads, PUT
  // mutates; both flow through the same mount. requireSuperAdmin gates it.
  app.use("/api/super-admin/modules", gatewayAuth(), requireSuperAdmin, forwardHeaders(billingUrl, "/internal/platform/modules"));

  // GET /api/super-admin/billing/invoices — current-cycle invoices derived from
  // each tenant's REAL plan + MRR. One "paid" invoice per PAYING tenant; FREE
  // tenants (no MRR) generate no invoice (so no false "failed payment" alarms).
  app.get(
    "/api/super-admin/billing/invoices",
    gatewayAuth(),
    requireSuperAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { callService, uh } = await superAdminFanout(req);
        const listRes = await callService<any>("tenant", { path: "/internal/tenants?pageSize=200", userHeaders: uh, timeoutMs: 4000 });
        const PLAN_MRR: Record<string, number> = { FREE: 0, STARTER: 149, PROFESSIONAL: 399, ENTERPRISE: 2400 };
        const now = new Date();
        const dateStr = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1).toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
        const invoices = ((listRes?.data ?? []) as any[])
          .map((tn) => {
            const plan = tn.plan ?? "FREE";
            const mrr = Number(tn.mrr ?? PLAN_MRR[plan] ?? 0);
            return { tid: tn.id, plan, amt: mrr, status: "paid", date: dateStr };
          })
          .filter((inv) => inv.amt > 0);
        res.json({ success: true, data: invoices });
      } catch (err) {
        next(err);
      }
    }
  );

  // GET /api/super-admin/models — Models & Providers (real AI spend per provider
  // + per-agent routing, derived from billing AgentRunCost).
  app.use("/api/super-admin/models", gatewayAuth(), requireSuperAdmin, forwardHeaders(billingUrl, "/internal/platform/models"));

  // Cross-tenant Integrations & Webhooks console (super-admin only). Proxies to
  // notification-service which owns TenantIntegration + Webhook; the platform
  // router returns ALL rows across tenants (admin/non-RLS client).
  app.use("/api/super-admin/integrations", gatewayAuth(), requireSuperAdmin, forwardHeaders(notificationUrl, "/internal/platform/integrations"));
  app.use("/api/super-admin/webhooks", gatewayAuth(), requireSuperAdmin, forwardHeaders(notificationUrl, "/internal/platform/webhooks"));

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

  // Operators & Roles — the platform operator roster (all SUPER_ADMIN users),
  // proxied to identity-service /internal/users/platform/operators (GET only).
  app.use("/api/super-admin/operators", gatewayAuth(), requireSuperAdmin, forwardHeaders(identityUrl, "/internal/users/platform/operators"));

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

  // WF7 — Judge0 code-execution callback. Judge0 (the external code runner) PUTs
  // each submission's verdict to this URL when execution finishes (async grading).
  // It is an EXTERNAL caller: no JWT, no tenant header, and explicitly NO
  // X-Internal-Service stamp — a RAW proxy that streams the body untouched, like
  // the inbound-email + twilio webhook blocks. The assessment-service callback
  // route authenticates the verdict by the opaque per-submission token Judge0
  // echoes back (minted when the run was enqueued) and resolves the tenant from
  // that row via prismaAdmin; the gateway is a dumb pass-through here.
  //   /api/internal/judge0/callback/*  → assessment-service /internal/judge0/callback/*
  app.use(
    "/api/internal/judge0/callback",
    createProxyMiddleware({
      target: assessmentUrl,
      changeOrigin: true,
      pathRewrite: (path) => `/internal/judge0/callback${path}`,
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
  // Exact-path mount MUST precede the generic /api/super-admin/support mount
  // (Express matches in order): the platform inbox returns pre-shaped rows +
  // KPIs; the generic mount maps to /internal/support/admin (raw tickets).
  app.use("/api/super-admin/support/platform", gatewayAuth(), requireSuperAdmin, forwardHeaders(notificationUrl, "/internal/support/platform"));
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
  // Module F — onboarding CASES (post-offer execution: PAN/bank/docs/tasks) live in
  // the dedicated onboarding-service. Distinct from /api/onboarding above, which is
  // the tenant's onboarding CONFIG in tenant-service.
  app.use("/api/onboarding-cases", gatewayAuth(), forwardHeaders(onboardingUrl, "/internal/onboarding-cases"));

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
