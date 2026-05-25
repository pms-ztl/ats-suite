import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, created, noContent, paginated } from "../lib/response";

const router = Router();
router.use(requireAuth);

// ── POST /:id/approve — approve a mobility case ───────────────────────────────
router.post("/:id/approve", requireRole("ADMIN", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const mc = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!mc) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    if (["APPROVED", "REJECTED", "COMPLETED"].includes(mc.status)) {
      throw new AppError(
        "CONFLICT",
        "Cannot approve a case that is already approved, rejected, or completed",
        409
      );
    }
    const result = await prisma.mobilityCase.updateMany({
      where: { id: req.params.id as string, tenantId },
      data: {
        status: "APPROVED",
        approvedBy: req.user?.id ?? "system",
        approvedAt: new Date(),
      },
    });
    if (result.count === 0) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    const updated = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    return ok(res, updated);
  } catch (err) { return next(err); }
});

// ── POST /:id/reject — reject a mobility case ─────────────────────────────────
const RejectSchema = z.object({
  reason: z.string().optional(),
});

router.post("/:id/reject", requireRole("ADMIN", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const mc = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!mc) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    if (["APPROVED", "REJECTED", "COMPLETED"].includes(mc.status)) {
      throw new AppError(
        "CONFLICT",
        "Cannot reject a case that is already approved, rejected, or completed",
        409
      );
    }
    const body = RejectSchema.parse(req.body);
    const result = await prisma.mobilityCase.updateMany({
      where: { id: req.params.id as string, tenantId },
      data: {
        status: "REJECTED",
        ...(body.reason !== undefined ? { notes: body.reason } : {}),
      },
    });
    if (result.count === 0) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    const updated = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    return ok(res, updated);
  } catch (err) { return next(err); }
});

// ── GET / — list MobilityCases (paginated) ────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string | undefined;
    const employeeId = req.query.employeeId as string | undefined;

    const where: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(employeeId ? { employeeId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.mobilityCase.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.mobilityCase.count({ where }),
    ]);

    return paginated(res, {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) { return next(err); }
});

// ── GET /:id — get single MobilityCase ───────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const mc = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!mc) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    return ok(res, mc);
  } catch (err) { return next(err); }
});

// ── POST / — create MobilityCase ─────────────────────────────────────────────
const CreateMobilityCaseSchema = z.object({
  employeeId: z.string().min(1),
  currentRole: z.string().min(1),
  targetRole: z.string().optional(),
  currentLocation: z.string().optional(),
  targetLocation: z.string().optional(),
  reason: z.string().optional(),
});

router.post("/", requireRole("ADMIN", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateMobilityCaseSchema.parse(req.body);
    const mc = await prisma.mobilityCase.create({
      data: {
        tenantId,
        employeeId: body.employeeId,
        currentRole: body.currentRole,
        targetRole: body.targetRole,
        currentLocation: body.currentLocation,
        targetLocation: body.targetLocation,
        reason: body.reason,
      },
    });
    return created(res, mc);
  } catch (err) { return next(err); }
});

// ── PATCH /:id — update MobilityCase ─────────────────────────────────────────
const UpdateMobilityCaseSchema = z.object({
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  targetLocation: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

router.patch("/:id", requireRole("ADMIN", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Mobility case not found", 404);

    const body = UpdateMobilityCaseSchema.parse(req.body);
    const updateData: any = {};
    if (body.currentRole !== undefined) updateData.currentRole = body.currentRole;
    if (body.targetRole !== undefined) updateData.targetRole = body.targetRole;
    if (body.targetLocation !== undefined) updateData.targetLocation = body.targetLocation;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const result = await prisma.mobilityCase.updateMany({
      where: { id: req.params.id as string, tenantId },
      data: updateData,
    });
    if (result.count === 0) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    const updated = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    return ok(res, updated);
  } catch (err) { return next(err); }
});

// ── DELETE /:id — cancel/delete MobilityCase ─────────────────────────────────
router.delete("/:id", requireRole("ADMIN", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.mobilityCase.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Mobility case not found", 404);
    if (["APPROVED", "COMPLETED"].includes(existing.status)) {
      throw new AppError(
        "CONFLICT",
        "Cannot delete an approved or completed case",
        409
      );
    }
    await prisma.mobilityCase.deleteMany({ where: { id: req.params.id as string, tenantId } });
    return noContent(res);
  } catch (err) { return next(err); }
});

export default router;
