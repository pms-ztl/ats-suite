/**
 * Phase — super-admin platform (cross-tenant) read views for the
 * Integrations & Webhooks console screen.
 *
 *   GET /internal/platform/integrations — ALL tenant integrations, every tenant
 *   GET /internal/platform/webhooks     — ALL webhook endpoints, every tenant
 *
 * Both are SUPER_ADMIN-only (gated inline) and intentionally use the admin /
 * non-RLS `prisma` client so they can read across every tenant. Webhook config
 * URLs are redacted; integration webhookUrls are redacted. Read-only.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors } from "@cdc-ats/common";
// Cross-tenant platform reads → admin (non-RLS) client.
import { prisma } from "../lib/prisma.js";

const router = Router();

function getRole(req: Request): string {
  return (req.user?.role ?? "") as string;
}

// Mask the tail of a URL so secrets/paths aren't fully exposed in the console.
function maskUrl(url: string): string {
  if (typeof url !== "string" || !url) return "";
  try {
    const u = new URL(url);
    const host = u.host;
    const tail = url.slice(-6);
    return `${host}/•••/${tail.replace(/^\W+/, "")}`;
  } catch {
    return `…${url.slice(-12)}`;
  }
}

// ── GET /internal/platform/integrations ────────────────────────────────────
// All tenant integrations across the platform, grouped by kind for the
// "Integrations" table (Type / Tenants / Status / Last sync).
router.get("/integrations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (getRole(req) !== "SUPER_ADMIN") throw Errors.forbidden("Super-admin only");
    const rows = await prisma.tenantIntegration.findMany({
      orderBy: { updatedAt: "desc" },
      take: 1000,
    });

    // Aggregate per integration kind: tenant count, enabled health, latest update.
    const byKind = new Map<
      string,
      { kind: string; tenantCount: number; enabledCount: number; lastUpdatedAt: Date | null }
    >();
    for (const r of rows) {
      const k = r.kind;
      const agg = byKind.get(k) ?? { kind: k, tenantCount: 0, enabledCount: 0, lastUpdatedAt: null };
      agg.tenantCount += 1;
      if (r.enabled) agg.enabledCount += 1;
      if (!agg.lastUpdatedAt || r.updatedAt > agg.lastUpdatedAt) agg.lastUpdatedAt = r.updatedAt;
      byKind.set(k, agg);
    }

    const integrations = Array.from(byKind.values()).map((a) => ({
      kind: a.kind,
      tenantCount: a.tenantCount,
      // healthy if every configured tenant has it enabled, else degraded.
      status: a.enabledCount === a.tenantCount ? "healthy" : "degraded",
      lastSyncAt: a.lastUpdatedAt ? a.lastUpdatedAt.toISOString() : null,
    }));

    ok(res, { integrations });
  } catch (err) { next(err); }
});

// ── GET /internal/platform/webhooks ────────────────────────────────────────
// All webhook endpoints across the platform for the "Webhook endpoints" table
// (Endpoint / Tenant / Events / Success / Last).
router.get("/webhooks", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (getRole(req) !== "SUPER_ADMIN") throw Errors.forbidden("Super-admin only");
    const rows = await prisma.webhook.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const webhooks = rows.map((w) => {
      // Success rate from lastStatus + failureCount is only a rough signal;
      // expose failureCount + lastStatus and let the UI synthesize a percentage.
      const lastOk = w.lastStatus == null ? null : w.lastStatus >= 200 && w.lastStatus < 300;
      return {
        id: w.id,
        tenantId: w.tenantId,
        endpoint: maskUrl(w.url),
        events: Array.isArray(w.events) && w.events.length ? w.events.join(", ") : "all events",
        active: w.active,
        failureCount: w.failureCount,
        lastStatus: w.lastStatus,
        lastOk,
        lastDeliveryAt: w.lastDeliveryAt ? w.lastDeliveryAt.toISOString() : null,
      };
    });

    ok(res, { webhooks });
  } catch (err) { next(err); }
});

export default router;
