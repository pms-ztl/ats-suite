/**
 * Compliance evidence — the audit trail auditors actually ask for.
 *   GET /internal/compliance/evidence?days=90  — audit summary + recent entries
 *   GET /internal/compliance/audit?action=&limit= — filterable audit query
 *
 * Tenant-scoped. The AuditLog is append-only (no update/delete routes).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/evidence", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const days = Math.min(365, Math.max(1, Number(req.query["days"]) || 90));
    const since = new Date(Date.now() - days * 86400_000);

    const [total, recent, byAction] = await Promise.all([
      prisma.auditLog.count({ where: { tenantId, createdAt: { gte: since } } }),
      prisma.auditLog.findMany({ where: { tenantId, createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.auditLog.groupBy({ by: ["action"], where: { tenantId, createdAt: { gte: since } }, _count: { action: true } }),
    ]);

    ok(res, {
      generatedAt: new Date().toISOString(),
      windowDays: days,
      totalEvents: total,
      eventsByAction: byAction.map((b) => ({ action: b.action, count: b._count.action })),
      recent,
      controls: {
        tenantIsolation: "Postgres RLS + tenant-scoped queries on every service",
        authn: "JWT (argon2id password hashing), short-lived access tokens",
        authz: "RBAC (SUPER_ADMIN / ADMIN / RECRUITER / HIRING_MANAGER / INTERVIEWER / CANDIDATE)",
        encryptionInTransit: "TLS at the edge (nginx/Render); internal calls over private network",
        dataRetention: "configurable retention + retention-purge worker (candidate-service)",
        rightToErasure: "GDPR routes (api-gateway + candidate-service) anonymize/purge on request",
        aiFairness: "bias-auditor (EEOC 4/5ths) + PII-stripped fairness mode + agent reasoning traces",
        auditTrail: "append-only AuditLog (this dataset)",
        rateLimiting: "per-IP + per-tenant gateway limits",
      },
    });
  } catch (err) { next(err); }
});

router.get("/audit", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const action = req.query["action"] ? String(req.query["action"]) : undefined;
    const limit = Math.min(500, Math.max(1, Number(req.query["limit"]) || 100));
    const rows = await prisma.auditLog.findMany({
      where: { tenantId, ...(action ? { action } : {}) },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    ok(res, rows);
  } catch (err) { next(err); }
});

export default router;
