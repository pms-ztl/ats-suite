import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated, created, noContent } from "../lib/response";
import { ReviewStatus } from "../../node_modules/.prisma/client/enums";
import { gdprAccess, gdprErase, gdprRectify, gdprPortability } from "../lib/gdpr";
import { computeAdverseImpact, generateComplianceReport } from "../lib/compliance-compute";
import { runComplianceAudit } from "../agents/bias-auditor-agent";

const router = Router();
router.use(requireAuth);

// ── DSAR ─────────────────────────────────────────────────────────────────────

router.get("/dsar", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string | undefined;
    const requestType = req.query.requestType as string | undefined;

    const where: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(requestType ? { requestType } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.dataSubjectRequest.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.dataSubjectRequest.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

const CreateDSARSchema = z.object({
  candidateId: z.string().min(1),
  requestType: z.string().min(1),
  status: z.string().optional(),
});

router.post("/dsar", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateDSARSchema.parse(req.body);

    const candidate = await prisma.candidate.findFirst({ where: { id: body.candidateId, tenantId } });
    if (!candidate) throw new AppError("NOT_FOUND", "Candidate not found", 404);

    const dsar = await prisma.dataSubjectRequest.create({
      data: {
        tenantId,
        candidateId: body.candidateId,
        requestType: body.requestType,
        status: body.status ?? "PENDING",
      },
    });
    return created(res, dsar);
  } catch (err) { return next(err); }
});

router.get("/dsar/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const dsar = await prisma.dataSubjectRequest.findFirst({ where: { id: req.params.id, tenantId } });
    if (!dsar) throw new AppError("NOT_FOUND", "DSAR not found", 404);
    return ok(res, dsar);
  } catch (err) { return next(err); }
});

const UpdateDSARSchema = z.object({
  status: z.string().optional(),
  responseData: z.record(z.string(), z.unknown()).optional(),
});

router.patch("/dsar/:id", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.dataSubjectRequest.findFirst({ where: { id: req.params.id as string, tenantId } });
    if (!existing) throw new AppError("NOT_FOUND", "DSAR not found", 404);
    const body = UpdateDSARSchema.parse(req.body);

    const updateData: any = {};
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "FULFILLED" && !existing.fulfilledAt) updateData.fulfilledAt = new Date();
    }
    if (body.responseData !== undefined) updateData.responseData = body.responseData;

    const dsar = await prisma.dataSubjectRequest.update({ where: { id: req.params.id as string }, data: updateData });
    return ok(res, dsar);
  } catch (err) { return next(err); }
});

// ── Consent Records ───────────────────────────────────────────────────────────

router.get("/consent", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const candidateId = req.query.candidateId as string | undefined;

    const where: any = { tenantId, ...(candidateId ? { candidateId } : {}) };

    const [data, total] = await Promise.all([
      prisma.consentRecord.findMany({ where, skip, take: pageSize, orderBy: { grantedAt: "desc" } }),
      prisma.consentRecord.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

const CreateConsentSchema = z.object({
  candidateId: z.string().min(1),
  consentType: z.string().min(1),
  purpose: z.string().min(1),
  granted: z.boolean(),
  jurisdiction: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  ipAddress: z.string().optional(),
});

router.post("/consent", requireRole("ADMIN", "COMPLIANCE_OFFICER", "RECRUITER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateConsentSchema.parse(req.body);

    // Find max version for this candidateId+consentType
    const existing = await prisma.consentRecord.findMany({
      where: { tenantId, candidateId: body.candidateId, consentType: body.consentType },
      orderBy: { version: "desc" },
      take: 1,
    });
    const nextVersion = (existing[0]?.version ?? 0) + 1;

    // If revoking, mark previous record as revoked
    if (!body.granted && existing.length > 0 && !existing[0].revokedAt) {
      await prisma.consentRecord.update({
        where: { id: existing[0].id },
        data: { revokedAt: new Date() },
      });
    }

    const consent = await prisma.consentRecord.create({
      data: {
        tenantId,
        candidateId: body.candidateId,
        consentType: body.consentType,
        purpose: body.purpose,
        granted: body.granted,
        version: nextVersion,
        jurisdiction: body.jurisdiction,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        ipAddress: body.ipAddress,
      },
    });
    return created(res, consent);
  } catch (err) { return next(err); }
});

// ── Data Retention Policies ───────────────────────────────────────────────────

router.get("/retention", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const includeInactive = req.query.includeInactive === "true";
    const where: any = { tenantId, ...(includeInactive ? {} : { isActive: true }) };
    const policies = await prisma.dataRetentionPolicy.findMany({ where, orderBy: { dataType: "asc" } });
    return ok(res, policies);
  } catch (err) { return next(err); }
});

const CreateRetentionSchema = z.object({
  dataType: z.string().min(1),
  retentionDays: z.number().int().positive(),
  jurisdiction: z.string().optional(),
  autoDelete: z.boolean().optional(),
});

router.post("/retention", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateRetentionSchema.parse(req.body);

    // jurisdiction is String? (nullable) in schema — use empty string as sentinel
    // when absent so the compound unique index (tenantId, dataType, jurisdiction)
    // can be matched in the upsert where clause (Prisma rejects null in unique lookups).
    const jurisdiction = body.jurisdiction ?? "";

    const policy = await prisma.dataRetentionPolicy.upsert({
      where: {
        tenantId_dataType_jurisdiction: {
          tenantId,
          dataType: body.dataType,
          jurisdiction,
        },
      },
      update: {
        retentionDays: body.retentionDays,
        ...(body.autoDelete !== undefined ? { autoDelete: body.autoDelete } : {}),
        isActive: true,
      },
      create: {
        tenantId,
        dataType: body.dataType,
        retentionDays: body.retentionDays,
        jurisdiction,
        autoDelete: body.autoDelete ?? true,
      },
    });
    return created(res, policy);
  } catch (err) { return next(err); }
});

const UpdateRetentionSchema = z.object({
  retentionDays: z.number().int().positive().optional(),
  autoDelete: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

router.patch("/retention/:id", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.dataRetentionPolicy.findFirst({ where: { id: req.params.id as string, tenantId } });
    if (!existing) throw new AppError("NOT_FOUND", "Retention policy not found", 404);
    const body = UpdateRetentionSchema.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (body.retentionDays !== undefined) updateData.retentionDays = body.retentionDays;
    if (body.autoDelete !== undefined) updateData.autoDelete = body.autoDelete;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    const policy = await prisma.dataRetentionPolicy.update({ where: { id: req.params.id as string }, data: updateData });
    return ok(res, policy);
  } catch (err) { return next(err); }
});

// ── Audit Log ─────────────────────────────────────────────────────────────────

router.get("/audit-log", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const resourceType = req.query.resourceType as string | undefined;
    const resourceId = req.query.resourceId as string | undefined;
    const actorId = req.query.actorId as string | undefined;
    const action = req.query.action as string | undefined;

    const where: any = {
      tenantId,
      ...(resourceType ? { resourceType } : {}),
      ...(resourceId ? { resourceId } : {}),
      ...(actorId ? { actorId } : {}),
      ...(action ? { action } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.auditTrailEntry.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.auditTrailEntry.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

// ── Human Review Queue ────────────────────────────────────────────────────────

router.get("/human-review/queue", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string | undefined;
    const reviewType = req.query.reviewType as string | undefined;

    const where: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(reviewType ? { reviewType } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.humanReviewItem.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      prisma.humanReviewItem.count({ where }),
    ]);

    return paginated(res, { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) { return next(err); }
});

const CreateHumanReviewSchema = z.object({
  reviewType: z.string().min(1),
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
  riskLevel: z.string().optional(),
  assignedTo: z.string().optional(),
  slaDeadline: z.string().datetime().optional(),
});

router.post("/human-review/submit", requireRole("ADMIN", "COMPLIANCE_OFFICER", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateHumanReviewSchema.parse(req.body);

    const item = await prisma.humanReviewItem.create({
      data: {
        tenantId,
        reviewType: body.reviewType,
        resourceType: body.resourceType,
        resourceId: body.resourceId,
        riskLevel: body.riskLevel ?? "MEDIUM",
        status: ReviewStatus.PENDING,
        assignedTo: body.assignedTo,
        slaDeadline: body.slaDeadline ? new Date(body.slaDeadline) : undefined,
      },
    });
    return created(res, item);
  } catch (err) { return next(err); }
});

router.get("/human-review/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const item = await prisma.humanReviewItem.findFirst({ where: { id: req.params.id, tenantId } });
    if (!item) throw new AppError("NOT_FOUND", "Human review item not found", 404);
    return ok(res, item);
  } catch (err) { return next(err); }
});

const UpdateHumanReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  decision: z.string().optional(),
  justification: z.string().optional(),
});

router.patch("/human-review/:id", requireRole("ADMIN", "COMPLIANCE_OFFICER", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.humanReviewItem.findFirst({ where: { id: req.params.id as string, tenantId } });
    if (!existing) throw new AppError("NOT_FOUND", "Human review item not found", 404);
    const body = UpdateHumanReviewSchema.parse(req.body);

    const updateData: any = { ...body };
    if (body.status === ReviewStatus.APPROVED || body.status === ReviewStatus.REJECTED) {
      updateData.completedAt = new Date();
    }

    const item = await prisma.humanReviewItem.update({ where: { id: req.params.id as string }, data: updateData });
    return ok(res, item);
  } catch (err) { return next(err); }
});

// ── GDPR Data Subject Rights ─────────────────────────────────────────────────

// POST /api/compliance/gdpr/access — export candidate data
router.post("/gdpr/access", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const { candidateId } = req.body;
    if (!candidateId) throw new AppError("VALIDATION_ERROR", "candidateId required", 400);
    const data = await gdprAccess(candidateId, tenantId);
    return ok(res, data);
  } catch (err) { return next(err); }
});

// POST /api/compliance/gdpr/erase — delete candidate data + embeddings
router.post("/gdpr/erase", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || null;
    const { candidateId } = req.body;
    if (!candidateId) throw new AppError("VALIDATION_ERROR", "candidateId required", 400);
    const result = await gdprErase(candidateId, tenantId, userId);
    return ok(res, result);
  } catch (err) { return next(err); }
});

// POST /api/compliance/gdpr/rectify — update candidate PII
router.post("/gdpr/rectify", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const { candidateId, updates } = req.body;
    if (!candidateId || !updates) throw new AppError("VALIDATION_ERROR", "candidateId and updates required", 400);
    await gdprRectify(candidateId, tenantId, updates);
    return ok(res, { rectified: true, candidateId });
  } catch (err) { return next(err); }
});

// GET /api/compliance/gdpr/export/:candidateId — download data as JSON
router.get("/gdpr/export/:candidateId", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const json = await gdprPortability(req.params.candidateId as string, tenantId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="candidate-data-${req.params.candidateId}.json"`);
    return res.send(json);
  } catch (err) { return next(err); }
});

// ── EEOC Adverse Impact Analysis ────────────────────────────────────────────

// POST /api/compliance/adverse-impact — compute adverse impact analysis
router.post("/adverse-impact", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const { protectedAttribute, stage, startDate, endDate } = req.body;

    if (!protectedAttribute) throw new AppError("VALIDATION_ERROR", "protectedAttribute required", 400);

    const timeRange = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // default: last year
      end: endDate ? new Date(endDate) : new Date(),
    };

    const result = await computeAdverseImpact({ tenantId, timeRange, protectedAttribute, stage });
    return ok(res, result);
  } catch (err) { return next(err); }
});

// POST /api/compliance/report — generate full compliance report
router.post("/report", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const { attributes, stages, startDate, endDate } = req.body;

    const report = await generateComplianceReport({
      tenantId,
      timeRange: {
        start: startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        end: endDate ? new Date(endDate) : new Date(),
      },
      attributes: attributes || ['source'], // default to source-based analysis
      stages,
    });

    // Store the report in audit log
    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: 'COMPLIANCE_REPORT_GENERATED',
        resourceType: 'ComplianceReport',
        resourceId: report.generatedAt,
        actorId: (req as any).user?.id || 'system',
        actorType: 'USER',
        metadata: {
          overallCompliance: report.overallCompliance,
          attributesAnalyzed: report.reports.length,
        },
      },
    }).catch(() => {});

    return ok(res, report);
  } catch (err) { return next(err); }
});

// ── AI Compliance Audit ─────────────────────────────────────────────────────

const AiAuditSchema = z.object({
  attributes: z.array(z.string().min(1)).min(1, 'At least one attribute required'),
  stages: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

router.post("/ai-audit", requireRole("ADMIN", "COMPLIANCE_OFFICER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = (req as any).user?.id || 'unknown';
    const body = AiAuditSchema.parse(req.body);

    const timeRange = {
      start: body.startDate ? new Date(body.startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: body.endDate ? new Date(body.endDate) : new Date(),
    };

    const result = await runComplianceAudit({
      tenantId,
      userId,
      timeRange,
      attributes: body.attributes,
      stages: body.stages,
    });

    return ok(res, {
      audit: result.audit,
      runId: result.runId,
      hitlCheckpointId: result.hitlCheckpointId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
  } catch (err) { return next(err); }
});

export default router;
