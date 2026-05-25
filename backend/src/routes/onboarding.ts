import { Router } from "express";
import { z } from "zod";
import { requireAuth, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, created, noContent, paginated } from "../lib/response";

const router = Router();
router.use(requireAuth);

// ── GET /tasks — list OnboardingTasks (paginated) ────────────────────────────
router.get("/tasks", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const handoffId = req.query.handoffId as string | undefined;
    const status = req.query.status as string | undefined;
    const assignedTo = req.query.assignedTo as string | undefined;

    const where: any = {
      tenantId,
      ...(handoffId ? { handoffId } : {}),
      ...(status ? { status } : {}),
      ...(assignedTo ? { assignedTo } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.onboardingTask.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.onboardingTask.count({ where }),
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

// ── GET /tasks/:id — get single OnboardingTask ───────────────────────────────
router.get("/tasks/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const task = await prisma.onboardingTask.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!task) throw new AppError("NOT_FOUND", "Onboarding task not found", 404);
    return ok(res, task);
  } catch (err) { return next(err); }
});

// ── POST /tasks — create OnboardingTask ──────────────────────────────────────
const CreateTaskSchema = z.object({
  handoffId: z.string().min(1),
  title: z.string().min(1),
  taskType: z.string().min(1),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

router.post("/tasks", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateTaskSchema.parse(req.body);

    // Verify handoff belongs to tenant
    const handoff = await prisma.onboardingHandoff.findFirst({
      where: { id: body.handoffId, tenantId },
    });
    if (!handoff) {
      throw new AppError("NOT_FOUND", "Onboarding handoff not found", 404);
    }

    const task = await prisma.onboardingTask.create({
      data: {
        tenantId,
        handoffId: body.handoffId,
        title: body.title,
        taskType: body.taskType,
        assignedTo: body.assignedTo,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    return created(res, task);
  } catch (err) { return next(err); }
});

// ── PATCH /tasks/:id — update OnboardingTask ─────────────────────────────────
const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.string().optional(),
});

router.patch("/tasks/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.onboardingTask.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Onboarding task not found", 404);

    const body = UpdateTaskSchema.parse(req.body);
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
    if (body.dueDate !== undefined) updateData.dueDate = new Date(body.dueDate);
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "COMPLETED" && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    const result = await prisma.onboardingTask.updateMany({
      where: { id: req.params.id as string, tenantId },
      data: updateData,
    });
    if (result.count === 0) throw new AppError("NOT_FOUND", "Onboarding task not found", 404);
    const updated = await prisma.onboardingTask.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    return ok(res, updated);
  } catch (err) { return next(err); }
});

// ── DELETE /tasks/:id — delete OnboardingTask ────────────────────────────────
router.delete("/tasks/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.onboardingTask.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Onboarding task not found", 404);
    await prisma.onboardingTask.deleteMany({ where: { id: req.params.id as string, tenantId } });
    return noContent(res);
  } catch (err) { return next(err); }
});

// ── GET /checklist/:candidateId — get all tasks for a candidate ───────────────
router.get("/checklist/:candidateId", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const { candidateId } = req.params;

    const handoffs = await prisma.onboardingHandoff.findMany({
      where: { tenantId, candidateId },
      orderBy: { createdAt: "desc" },
    });

    const handoffIds = handoffs.map((h: { id: string }) => h.id);

    const tasks = handoffIds.length > 0
      ? await prisma.onboardingTask.findMany({
          where: { tenantId, handoffId: { in: handoffIds } },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const handoffsWithTasks = handoffs.map((h: (typeof handoffs)[number]) => ({
      ...h,
      tasks: tasks.filter((t: (typeof tasks)[number]) => t.handoffId === h.id),
    }));

    return ok(res, {
      candidate: { id: candidateId },
      handoffs: handoffsWithTasks,
    });
  } catch (err) { return next(err); }
});

// ── GET /handoffs — list OnboardingHandoffs (paginated) ──────────────────────
router.get("/handoffs", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const status = req.query.status as string | undefined;
    const candidateId = req.query.candidateId as string | undefined;

    const where: any = {
      tenantId,
      ...(status ? { status } : {}),
      ...(candidateId ? { candidateId } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.onboardingHandoff.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.onboardingHandoff.count({ where }),
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

// ── POST /handoffs — create OnboardingHandoff ────────────────────────────────
const CreateHandoffSchema = z.object({
  candidateId: z.string().min(1),
  requisitionId: z.string().optional(),
  hiringContext: z.record(z.string(), z.unknown()),
  interviewNotes: z.array(z.unknown()).optional(),
  assignedTo: z.string().optional(),
});

router.post("/handoffs", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateHandoffSchema.parse(req.body);
    const handoff = await prisma.onboardingHandoff.create({
      data: {
        tenantId,
        candidateId: body.candidateId,
        requisitionId: body.requisitionId,
        hiringContext: body.hiringContext as any,
        interviewNotes: (body.interviewNotes ?? []) as any,
        assignedTo: body.assignedTo,
      },
    });
    return created(res, handoff);
  } catch (err) { return next(err); }
});

export default router;
