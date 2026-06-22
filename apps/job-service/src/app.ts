import express, { type Express, type Request, type Response, type NextFunction } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders, tenantContext,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import requisitionsRouter from "./routes/requisitions.js";
import jobPostingsRouter from "./routes/job-postings.js";
import publicRouter from "./routes/public.js";
import feedRouter from "./routes/feed.js";
import jdAuthorRouter from "./routes/jd-author.js";
import gdprRouter from "./routes/gdpr.js";
import jobDistributionRouter from "./routes/job-distribution.js";
import collegesRouter from "./routes/colleges.js";
import { createInboundJobApplicationRouter } from "./routes/inbound-job-application.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("job-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));
  // WF-H / H4 — the inbound apply-webhook needs the RAW (unparsed) body for HMAC
  // signature verification, so the global JSON parser MUST skip that path; otherwise
  // it would consume the stream and the per-board signature check could never match
  // the EXACT bytes the board signed. That route applies its own express.raw below.
  const jsonParser = express.json({ limit: "5mb" });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/internal/inbound-job-application")) return next();
    return jsonParser(req, res, next);
  });
  app.use(metrics.middleware);

  app.use(createHealthRouter({
    dependencies: {
      database: async () => {
        try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; }
      },
    },
  }));
  app.get("/metrics", async (_req: Request, res: Response) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.end(await metrics.registry.metrics());
  });

  // WF-H / H4 — inbound JOB-APPLICATION webhook. PUBLIC (no JWT, no tenant header):
  // an external job board (Indeed, LinkedIn, ZipRecruiter, Naukri, SEEK, ...) POSTs
  // a candidate application here via the gateway RAW proxy
  // (/api/inbound-job-application/:provider/:tenantId -> here, WF-E E6). Reached with
  // readAuthHeaders({ optional, publicWebhook }) so the gateway shared-secret check
  // is skipped (boards do not carry it) and the missing auth ctx is allowed. We need
  // the RAW body for HMAC verification, so this mount uses express.raw (NOT the
  // global express.json); the handler loads the tenant's decrypted board webhook
  // secret, calls verifySignature over the raw bytes, and resolves the owning
  // JobPosting/tenant FROM the :tenantId path + the jobExternalId correlation via
  // prismaAdmin. Mounted BEFORE tenantContext (no request tenant context exists on
  // these calls). DISTINCT from the OA inbound-assessment axis.
  app.use(
    "/internal/inbound-job-application",
    express.raw({ type: "*/*", limit: "12mb" }),
    readAuthHeaders({ optional: true, publicWebhook: true }),
    createInboundJobApplicationRouter(logger),
  );

  // Bind request tenant for RLS-scoped queries (public routes below have no
  // X-Tenant-Id and use the admin client, so they are unaffected).
  app.use(tenantContext);

  // Internal authenticated routes
  app.use("/internal/requisitions", readAuthHeaders(), requisitionsRouter);
  app.use("/internal/job-postings", readAuthHeaders(), jobPostingsRouter);
  app.use("/internal/jd-author", readAuthHeaders(), jdAuthorRouter);
  app.use("/internal/gdpr", readAuthHeaders(), gdprRouter);
  // WF-G / G7 — job-board distribution control. The gateway forwards
  // /api/job-distribution/* -> here behind gatewayAuth + requireModule("job-distribution")
  // (PROFESSIONAL+, failMode:"closed"), stamping the verified JWT claims so the RLS
  // client scopes every read/write to the caller's tenant. POST queues a per-board
  // post (202 + PENDING rows), GET reads the REAL per-board status, DELETE queues a
  // board close + marks the row CLOSED.
  app.use("/internal/job-distribution", readAuthHeaders(), jobDistributionRouter);
  // Module A — CDC / college partner management (recruiter/admin).
  app.use("/internal/colleges", readAuthHeaders(), collegesRouter);

  // Public routes — NO auth required (gateway forwards /api/public/* unauthenticated)
  // The per-tenant XML/JSON job feed (WF-F / F2) mounts at /public/feed so the
  // existing /api/public gateway proxy reaches /api/public/feed/:tenantSlug/jobs.xml
  // with no gateway edit; the per-tenant feed token (not the path) authorizes it.
  app.use("/public/feed", feedRouter);
  app.use("/public", publicRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
