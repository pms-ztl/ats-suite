/**
 * Phase 31c — GDPR tenant-wide data export for tenant-service.
 * Admin-only. Returns the tenant record, branding, retention config,
 * onboarding state, and plan-change history.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

function requireTenantId(req: Request): string {
  const id = req.headers["x-tenant-id"];
  if (typeof id !== "string" || !id) throw Errors.unauthorized("Missing tenant context");
  return id;
}

router.get("/tenant/export", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = requireTenantId(req);

    const [tenant, planChanges] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.planChangeRequest.findMany({ where: { tenantId } }),
    ]);
    if (!tenant) throw Errors.notFound("Tenant");

    // stripeCustomerId is exported because the admin owns the Stripe
    // customer — but it's purely an opaque id, no PII leak.
    ok(res, {
      service: "tenant",
      tenant,
      planChangeHistory: planChanges,
      counts: { planChangeRequests: planChanges.length },
    });
  } catch (err) { next(err); }
});

export default router;
