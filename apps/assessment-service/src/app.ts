import express, { type Express, type Request, type Response, type NextFunction } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders, tenantContext,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import assessmentsRouter from "./routes/assessments.js";
import invitesRouter from "./routes/invites.js";
import publicTakeRouter from "./routes/public-take.js";
import resultsRouter from "./routes/results.js";
import gdprRouter from "./routes/gdpr.js";
import { createJudge0CallbackRouter } from "./routes/judge0-callback.js";
import { createInboundAssessmentRouter } from "./routes/inbound-assessment.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("assessment-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));
  // WF8/H4 — the inbound OA-provider webhook needs the RAW (unparsed) body for
  // HMAC verification, so the global JSON parser MUST skip that path; otherwise it
  // would consume the stream and the per-invite signature check could never match
  // the exact bytes the vendor signed. That route applies its own express.raw.
  const jsonParser = express.json({ limit: "5mb" });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/internal/inbound-assessment")) return next();
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

  // Public candidate take routes — NO auth (gateway forwards /api/public/*
  // unauthenticated). These resolve the tenant from the invite token via the
  // admin client, so they MUST be mounted BEFORE tenantContext + readAuthHeaders
  // (no X-Tenant-Id header is present on a public request).
  app.use("/internal/public/assessment", publicTakeRouter);

  // WF7/G7 — Judge0 inbound callback. PUBLIC (no JWT, no tenant header): the
  // isolated Judge0 sidecar delivers verdicts here via the gateway raw proxy
  // (/api/internal/judge0/callback). The opaque submission token IS the
  // credential — the handler resolves the owning result/tenant from it via the
  // admin client. Mounted BEFORE tenantContext for the same reason as the take
  // routes (no request tenant context exists on these calls).
  app.use("/internal/judge0", createJudge0CallbackRouter(logger));

  // WF8/H4 — inbound OA-provider result webhook. PUBLIC (no JWT, no tenant
  // header): an external assessment vendor (Codility, HackerEarth, iMocha,
  // TestGorilla) POSTs a completion event here via the gateway raw proxy
  // (/api/inbound-assessment). It is reached with readAuthHeaders({ optional,
  // publicWebhook }) so the gateway shared-secret check is skipped (vendors do not
  // carry it) and the missing auth ctx is allowed. We need the RAW body for HMAC
  // verification, so this mount uses express.raw (NOT the global express.json); the
  // handler decrypts the per-invite secret, calls provider.verifyWebhook over the
  // raw bytes, and resolves the tenant FROM AssessmentInvite.providerInvitationId
  // via prismaAdmin. Mounted BEFORE tenantContext for the same reason as the
  // judge0 callback (no request tenant context exists on these calls).
  app.use(
    "/internal/inbound-assessment",
    express.raw({ type: "*/*", limit: "5mb" }),
    readAuthHeaders({ optional: true, publicWebhook: true }),
    createInboundAssessmentRouter(logger),
  );

  // Bind request tenant for RLS-scoped queries on the authenticated routes below.
  app.use(tenantContext);

  // Internal authenticated routes. The Routes slice (WF7) fills the handlers;
  // invites + results share the /internal/assessments base with authoring.
  app.use("/internal/assessments", readAuthHeaders(), assessmentsRouter);
  app.use("/internal/assessments", readAuthHeaders(), invitesRouter);
  app.use("/internal/assessments", readAuthHeaders(), resultsRouter);

  // WF10/J1 - GDPR/EU-AI-Act DSR legs for OA data. The compliance-service +
  // api-gateway candidate erasure/export fan-out calls these so a data-subject
  // request ALSO covers Attempt/Answer/AssessmentResult/ProctorEvent/Invite.
  app.use("/internal/gdpr", readAuthHeaders(), gdprRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
