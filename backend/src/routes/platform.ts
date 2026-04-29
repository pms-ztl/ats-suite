import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok } from "../lib/response";

const router = Router();
router.use(requireAuth);

// GET /health
router.get("/health", async (_req, res, next) => {
  try {
    return ok(res, { status: "healthy", timestamp: new Date().toISOString(), version: "1.0.0", services: { database: "up", cache: "up" } });
  } catch (err) { return next(err); }
});

// GET /config
router.get("/config", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new AppError("NOT_FOUND", "Tenant not found", 404);
    return ok(res, { tenantId: tenant.id, settings: tenant.settings, dataRegion: tenant.dataRegion, isolationConfig: tenant.isolationConfig });
  } catch (err) { return next(err); }
});

// GET /features
router.get("/features", async (_req, res, next) => {
  try {
    return ok(res, { features: { aiScreening: true, biasDetection: true, diversityTracking: true, complianceReporting: true, videoInterviews: false, mfaEnforcement: false } });
  } catch (err) { return next(err); }
});

// GET /tenants/current
router.get("/tenants/current", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, dataRegion: true, settings: true, createdAt: true, updatedAt: true },
    });
    if (!tenant) throw new AppError("NOT_FOUND", "Tenant not found", 404);
    return ok(res, tenant);
  } catch (err) { return next(err); }
});

// PATCH /tenants/current
const UpdateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  dataRegion: z.string().optional(),
});

router.patch("/tenants/current", requireRole("ADMIN"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = UpdateTenantSchema.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.settings !== undefined) updateData.settings = body.settings as any;
    if (body.dataRegion !== undefined) updateData.dataRegion = body.dataRegion;
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });
    return ok(res, tenant);
  } catch (err) { return next(err); }
});

// GET /unified-overview — aggregated cross-module stats
router.get("/unified-overview", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const [
      requisitions, candidates, interviews, applications,
      scheduleEvents, hiresThisMonth
    ] = await Promise.all([
      prisma.requisition.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
      prisma.candidate.count({ where: { tenantId } }),
      prisma.interview.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
      prisma.application.groupBy({ by: ["stage"], where: { tenantId }, _count: true }),
      prisma.scheduleEvent.count({ where: { tenantId, startAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.application.count({ where: { tenantId, stage: "HIRED", updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);

    type GroupRow = { _count: number; [key: string]: unknown };
    const openReqs = ((requisitions as GroupRow[]).find((r) => r.status === "OPEN")?._count ?? 0);
    const totalReqs = (requisitions as GroupRow[]).reduce((s: number, r: GroupRow) => s + r._count, 0);
    const completedInterviews = ((interviews as GroupRow[]).find((i) => i.status === "COMPLETED")?._count ?? 0);

    return ok(res, {
      requisitions: { total: totalReqs, byStatus: (requisitions as GroupRow[]).map((r: GroupRow) => ({ status: r.status, count: r._count })) },
      candidates: { total: candidates },
      interviews: { total: (interviews as GroupRow[]).reduce((s: number, i: GroupRow) => s + i._count, 0), completed: completedInterviews },
      pipeline: { stages: (applications as GroupRow[]).map((a: GroupRow) => ({ stage: a.stage, count: a._count })) },
      scheduling: { eventsThisWeek: scheduleEvents },
      analytics: { hiresThisMonth, openReqs },
    });
  } catch (err) { return next(err); }
});

// GET /orchestration/overview — pipeline stage counts and metrics for requisitions
router.get("/orchestration/overview", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);

    const [reqsByStatus, applicationsByStage, recentReqs] = await Promise.all([
      prisma.requisition.groupBy({ by: ["status"], where: { tenantId }, _count: true }),
      prisma.application.groupBy({ by: ["stage"], where: { tenantId }, _count: true }),
      prisma.requisition.findMany({
        where: { tenantId, status: { in: ["OPEN", "ON_HOLD"] } },
        select: { id: true, title: true, department: true, status: true, createdAt: true, closedAt: true, priority: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Compute pipeline stages based on application stages
    const stageMap: Record<string, number> = {};
    for (const a of applicationsByStage) stageMap[a.stage] = a._count;

    type GRow = { _count: number; [key: string]: unknown };
    const pipelineStages = [
      { id: "intake",    name: "Intake & Approval",    count: (reqsByStatus as GRow[]).find((r) => r.status === "OPEN")?._count ?? 0 },
      { id: "screening", name: "Screening & Shortlist", count: (stageMap["SCREENED"] ?? 0) + (stageMap["PHONE_SCREEN"] ?? 0) },
      { id: "interview", name: "Interview Loop",        count: (stageMap["INTERVIEW"] ?? 0) + (stageMap["FINAL_REVIEW"] ?? 0) },
      { id: "offer",     name: "Offer & Close",         count: (stageMap["OFFER"] ?? 0) + (stageMap["HIRED"] ?? 0) },
    ];

    return ok(res, {
      pipelineStages,
      requisitions: recentReqs,
      summary: {
        total: (reqsByStatus as GRow[]).reduce((s: number, r: GRow) => s + r._count, 0),
        open: (reqsByStatus as GRow[]).find((r) => r.status === "OPEN")?._count ?? 0,
        filled: (reqsByStatus as GRow[]).find((r) => r.status === "FILLED")?._count ?? 0,
        onHold: (reqsByStatus as GRow[]).find((r) => r.status === "ON_HOLD")?._count ?? 0,
      },
    });
  } catch (err) { return next(err); }
});

export default router;

