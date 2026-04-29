import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { authenticate, generateToken } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestId } from './middleware/requestId';
import { initSentry } from './lib/sentry';

// Engine route imports (default exports)
import platformRoutes from './engines/platform-core/routes';
import complianceRoutes from './engines/compliance-governance/routes';
import analyticsRoutes from './engines/analytics/routes';
import decisionRoutes from './engines/decision/routes';
import schedulingRoutes from './engines/scheduling/routes';
import onboardingRoutes from './engines/onboarding/routes';
import healthRouter from './routes/health';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './openapi';
import pinoHttp from 'pino-http';
import logger from './lib/logger';
import { registry } from './lib/metrics';
import { metricsMiddleware } from './middleware/metrics';
import { securityHeaders } from './middleware/securityHeaders';

// Batch B5 — skeleton routers (501 Not Implemented)
import authRouter from './routes/auth';
import ssoRouter from './routes/sso';
import requisitionsRouter from './routes/requisitions';
import candidatesRouter from './routes/candidates';
import interviewsRouter from './routes/interviews';
import screeningRouter from './routes/screening';
import biasRouter from './routes/bias';
import complianceRouter from './routes/compliance';

import sourcingRouter from './routes/sourcing';
import decisionsRouter from './routes/decisions';
import analyticsRouter from './routes/analytics';
import securityRouter from './routes/security';
import platformRouter from './routes/platform';
import tenantsRouter from './routes/tenants';
import skillsRouter from './routes/skills';
import integrationsRouter from './routes/integrations';
import mobilityRouter from './routes/mobility';
import onboardingRouter from './routes/onboarding';
import notificationsRouter from './routes/notifications';
import usersRouter from './routes/users';
import calendarRouter from './routes/calendar';
import agentRunsRouter from './routes/agent-runs';
import resumeRouter from './routes/resume';
import candidateChatRouter from './routes/candidate-chat';
import observabilityRouter from './routes/observability';
import billingRouter from './routes/billing';
import copilotRouter from './routes/copilot';
import offersRouter from './routes/offers';
import publicApiRouter from './routes/public-api';
import featureFlagsRouter from './routes/feature-flags';

// Batch B6 — skeleton routers (501 Not Implemented)
import b6SecurityRoutes from './routes/security';
import b6AiRoutes from './routes/ai';
import b6AnalyticsRoutes from './routes/analytics';
import b6SourcingRoutes from './routes/sourcing';
import b6DecisionsRoutes from './routes/decisions';
import b6IntegrationsRoutes from './routes/integrations';
import b6SchedulingRoutes from './routes/scheduling';
import b6MobilityRoutes from './routes/mobility';
import b6OnboardingRoutes from './routes/onboarding';
import b6PlatformRoutes from './routes/platform';
import b6TenantsRoutes from './routes/tenants';
import b6SkillsRoutes from './routes/skills';

const app = express();

// ── Sentry (must initialize before middleware) ────────────────────────────
initSentry();

// ── Global Middleware ─────────────────────────────────────────────────────
app.use(requestId);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
}));
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── CSRF Defense-in-Depth: Origin/Referer Validation ─────────────────────
// Since this is a REST API consumed by a SPA with Bearer tokens in
// Authorization header (not cookie-based auth), SameSite=lax already
// provides significant CSRF mitigation. This adds origin validation
// as defense-in-depth for state-changing requests.
app.use((req, res, next) => {
  // Skip read-only methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  // Skip public, pre-auth, and probe endpoints
  if (
    req.path.startsWith('/api/public/') ||
    req.path === '/api/auth/login' ||
    req.path.startsWith('/api/auth/sso/') ||
    req.path === '/api/auth/mfa/verify' ||
    req.path === '/healthz' ||
    req.path === '/readyz'
  ) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // If Origin/Referer header present, validate it matches allowed origin
  if (origin && !origin.startsWith(allowedOrigin)) {
    return res.status(403).json({
      error: { code: 'CSRF_VIOLATION', message: 'Cross-origin request blocked' },
    });
  }

  next();
});

// GET /api/csrf-token — endpoint for frontend to verify CSRF protection is active
app.get('/api/csrf-token', (_req, res) => {
  res.json({ success: true, data: { csrfEnabled: true } });
});

// Use pino-http for structured logging in production, morgan in dev
if (process.env.NODE_ENV === 'production') {
  app.use(pinoHttp({ logger }));
} else {
  app.use(morgan('short'));
}
app.use(metricsMiddleware);

// ── Rate Limiting ────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } },
  skip: (req) => req.path === '/healthz' || req.path === '/readyz',
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // strict limit on auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many login attempts.' } },
});
app.use('/api/auth/login', authLimiter);

// ── Health / Readiness Probes (no auth) ─────────────────────────────────
app.use(healthRouter);

// Prometheus metrics (no auth — typically only exposed internally)
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});

// ── Health Check (no auth) ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' } });
});

// ── OpenAPI / Swagger UI (no auth) ───────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/openapi.json', (_req, res) => res.json(swaggerSpec));

// ── Auth Routes (public — must be before authenticate middleware) ────────
app.use('/api/auth', authRouter);
app.use('/api/auth/sso', ssoRouter);

// ── Public API (no auth required) ───────────────────────────────────────
app.use('/api/public', publicApiRouter);

// ── Auth Middleware ──────────────────────────────────────────────────────
app.use(authenticate);

// ── Engine Routes ────────────────────────────────────────────────────────
// ── New CRUD routers (mounted BEFORE engine routes to take precedence) ──────
app.use('/api/requisitions', requisitionsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/screening', screeningRouter);
app.use('/api/bias', biasRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/sourcing', sourcingRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/security', securityRouter);
app.use('/api/platform', platformRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/mobility', mobilityRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/users', usersRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/agents', agentRunsRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/candidate-chat', candidateChatRouter);
app.use('/api/observability', observabilityRouter);
app.use('/api/billing', billingRouter);
app.use('/api/agents/copilot', copilotRouter);
app.use('/api/offers', offersRouter);
app.use('/api/features', featureFlagsRouter);

// Routes already include their prefix (e.g. /platform/health, /security/..., /bias/...)
// Mount under /api so final paths become /api/platform/health, /api/security/..., etc.

// Engine 1: Platform Core — routes: /platform/*, /requisitions/*, /tenants/*, /skills/*
app.use('/api', platformRoutes);

// Engine 4: Compliance — routes: /compliance/*
app.use('/api/compliance', complianceRoutes);

// Engine 6: Analytics — routes: /event-ledger, /dashboard/*, /fairness/*, /bottlenecks/*
app.use('/api/analytics', analyticsRoutes);

// Engine 11: Decisions & Offers — routes: /decisions/*, /offers/*
app.use('/api', decisionRoutes);

// Engine 13: Scheduling — routes: /scheduling/*
app.use('/api', schedulingRoutes);

// Engine 15: Onboarding — routes: /onboarding/*
app.use('/api', onboardingRoutes);

// ── Batch B6 Skeleton Routes (501 fallback, mounted after engine routes) ─
app.use('/api/security', b6SecurityRoutes);
app.use('/api/ai', b6AiRoutes);
app.use('/api/analytics', b6AnalyticsRoutes);
app.use('/api/sourcing', b6SourcingRoutes);
app.use('/api/decisions', b6DecisionsRoutes);
app.use('/api/integrations', b6IntegrationsRoutes);
app.use('/api/scheduling', b6SchedulingRoutes);
app.use('/api/mobility', b6MobilityRoutes);
app.use('/api/onboarding', b6OnboardingRoutes);
app.use('/api/platform', b6PlatformRoutes);
app.use('/api/tenants', b6TenantsRoutes);
app.use('/api/skills', b6SkillsRoutes);

// ── Error Handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
