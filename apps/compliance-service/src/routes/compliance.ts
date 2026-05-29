import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { fetchScreeningAudit } from "../lib/service-client.js";

const router = Router();

// POST /internal/compliance/audit/log — append an immutable audit record.
const LogBody = z.object({
  kind: z.string().min(1).max(40),
  subjectType: z.string().max(40).default(""),
  subjectId: z.string().max(120).default(""),
  summary: z.string().max(2000).default(""),
  payload: z.record(z.any()).default({}),
});
router.post("/audit/log", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorUserId = getUserId(req);
    const b = LogBody.parse(req.body);
    const rec = await prisma.auditRecord.create({
      data: { tenantId, actorUserId, kind: b.kind, subjectType: b.subjectType, subjectId: b.subjectId, summary: b.summary, payload: b.payload as any },
    });
    created(res, { logged: true, id: rec.id, createdAt: rec.createdAt });
  } catch (err) { next(err); }
});

// GET /internal/compliance/audit?kind=&limit=  — list records.
router.get("/audit", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const kind = req.query["kind"] as string | undefined;
    const where: { tenantId: string; kind?: string } = { tenantId };
    if (kind) where.kind = kind;
    const rows = await prisma.auditRecord.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
    ok(res, rows);
  } catch (err) { next(err); }
});

// GET /internal/compliance/audit/subject/:subjectId — full trail for one subject.
router.get("/audit/subject/:subjectId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const subjectId = req.params["subjectId"] as string;
    const rows = await prisma.auditRecord.findMany({ where: { tenantId, subjectId }, orderBy: { createdAt: "desc" } });
    ok(res, rows);
  } catch (err) { next(err); }
});

// GET /internal/compliance/retention/policy
router.get("/retention/policy", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const policy = await prisma.retentionPolicy.findUnique({ where: { tenantId } });
    ok(res, policy ?? { tenantId, candidateDays: 365, auditDays: 2555, default: true });
  } catch (err) { next(err); }
});

// POST /internal/compliance/bias-audit/:requisitionId — pull the screening
// decision distribution + persist it as a BIAS_AUDIT record.
router.post("/bias-audit/:requisitionId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorUserId = getUserId(req);
    const requisitionId = req.params["requisitionId"] as string;
    const audit = await fetchScreeningAudit(requisitionId, tenantId);
    if (!audit) throw Errors.notFound("Screening audit for requisition (screening-service unreachable or no screenings)");
    const rec = await prisma.auditRecord.create({
      data: {
        tenantId, actorUserId, kind: "BIAS_AUDIT", subjectType: "requisition", subjectId: requisitionId,
        summary: `Adverse-impact / decision-distribution audit: ${audit.total ?? 0} screenings, pass rate ${audit.passRate ?? 0}`,
        payload: audit as any,
      },
    });
    ok(res, { auditRecordId: rec.id, audit });
  } catch (err) { next(err); }
});

export default router;
