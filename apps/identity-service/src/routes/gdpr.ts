/**
 * Phase 31c — GDPR tenant-wide data export for identity-service.
 * Admin-only. Returns every user (without passwordHash), every audit event,
 * and SSO config metadata. Personal data exported per GDPR Article 20.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/tenant/export", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);

    const [usersRaw, auditEvents, sso, ssoAudit] = await Promise.all([
      prisma.user.findMany({ where: { tenantId } }),
      prisma.auditEvent.findMany({ where: { tenantId } }),
      prisma.tenantSso.findUnique({ where: { tenantId } }),
      prisma.ssoLoginAudit.findMany({ where: { tenantId } }),
    ]);

    // STRIP passwordHash + mfaSecret — exporting them defeats the purpose of
    // hashing them in the first place. The export is for the tenant admin
    // to take their data elsewhere, NOT for re-importing into a new auth system.
    const users = usersRaw.map(({ passwordHash, mfaSecret, ...rest }) => rest);

    ok(res, {
      service: "identity",
      counts: {
        users: users.length,
        auditEvents: auditEvents.length,
        ssoLoginAudit: ssoAudit.length,
      },
      users,
      auditEvents,
      // SSO config with clientSecret redacted — same rule as the SSO config
      // GET endpoint exposes.
      sso: sso ? { ...sso, oidcClientSecret: sso.oidcClientSecret ? "***REDACTED***" : null } : null,
      ssoLoginAudit: ssoAudit,
    });
  } catch (err) { next(err); }
});

export default router;
