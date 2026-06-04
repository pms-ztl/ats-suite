import express, { type Express, type Request, type Response, type NextFunction } from "express";
import {
  createHealthRouter, createMetrics, createErrorHandler, requestTimeout, sentryErrorHandler,
  notFoundHandler, requestId, readAuthHeaders, tenantContext,
} from "@cdc-ats/common";
import type { Logger } from "pino";
import { prisma } from "./lib/prisma.js";
import billingRouter from "./routes/billing.js";
import platformRouter from "./routes/platform.js";
import stripeRouter, { verifyAndProcess } from "./routes/stripe.js";

export function createApp(logger: Logger): Express {
  const app = express();
  const metrics = createMetrics("billing-service");

  app.use(requestId());
  app.use(requestTimeout({ defaultMs: 30_000 }));

  // Phase 30 — Stripe webhook must use the raw body for signature verification,
  // so it MUST be mounted BEFORE express.json(). express.raw() captures the
  // bytes in req.body as a Buffer; we hand them straight to verifyAndProcess.
  // Public endpoint (no auth — Stripe's signature IS the auth).
  app.post(
    "/internal/stripe/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sig = req.headers["stripe-signature"];
        if (typeof sig !== "string") {
          res.status(400).json({ success: false, error: { message: "Missing stripe-signature header" } });
          return;
        }
        await verifyAndProcess(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (err: any) {
        // Stripe expects a 400 on signature failures so it can surface in
        // their dashboard; everything else is 500 so they retry.
        const isSig = /signature/i.test(err?.message ?? "");
        res.status(isSig ? 400 : 500).json({
          success: false,
          error: { message: err?.message ?? "Webhook error" },
        });
        next();
      }
    },
  );

  app.use(express.json({ limit: "1mb" }));
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

  // Bind request tenant for RLS-scoped queries (the raw Stripe webhook above is
  // mounted before this and uses the admin client, so it is unaffected).
  app.use(tenantContext);

  // Internal routes — gateway forwards X-Tenant-Id/X-User-Id
  app.use("/internal/billing", readAuthHeaders(), billingRouter);
  // Platform control plane (super-admin only). Role enforcement happens at the
  // gateway via requireSuperAdmin — here we trust the forwarded X-User-Role.
  app.use("/internal/platform", readAuthHeaders(), platformRouter);
  // Phase 30 — Stripe self-serve. /webhook above is the unprotected, raw-body
  // route; everything else under /internal/stripe is auth-gated.
  app.use("/internal/stripe", readAuthHeaders(), stripeRouter);

  app.use(notFoundHandler());
  app.use(sentryErrorHandler());
  app.use(createErrorHandler(logger));
  return app;
}
