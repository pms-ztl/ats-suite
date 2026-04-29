import { Router } from "express";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, paginated } from "../lib/response";
import { createCandidate, updateCandidate, deleteCandidate, advanceStage } from "./candidates-write";

const router = Router();
const NOT_IMPLEMENTED = {
  error: { code: "NOT_IMPLEMENTED", message: "Endpoint not yet implemented" },
};

router.use(requireAuth);

// GET /api/candidates
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const search = req.query.search as string | undefined;
    const source = req.query.source as string | undefined;

    const where: any = {
      tenantId,
      isAnonymized: false,
      ...(source ? { source } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { newApplications: true } },
          newApplications: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              stage: true,
              status: true,
              requisitionId: true,
              requisition: { select: { id: true, title: true, department: true } },
            },
          },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    return paginated(res, {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/candidates/:id
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, tenantId },
      include: {
        newApplications: {
          include: {
            requisition: {
              select: { id: true, title: true, department: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        candidateNotes: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!candidate) throw new AppError("NOT_FOUND", "Candidate not found", 404);
    return ok(res, candidate);
  } catch (err) {
    return next(err);
  }
});

// POST /api/candidates (ADMIN, RECRUITER, HIRING_MANAGER only)
router.post("/", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), createCandidate);

// PATCH /api/candidates/:id (ADMIN, RECRUITER only)
router.patch("/:id", requireRole("ADMIN", "RECRUITER"), updateCandidate);

// DELETE /api/candidates/:id (ADMIN only)
router.delete("/:id", requireRole("ADMIN"), deleteCandidate);

// POST /api/candidates/:id/stage (ADMIN, RECRUITER, HIRING_MANAGER)
router.post("/:id/stage", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), advanceStage);

// GET /api/candidates/:id/applications
router.get("/:id/applications", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, tenantId },
    });
    if (!candidate) throw new AppError("NOT_FOUND", "Candidate not found", 404);
    const applications = await prisma.application.findMany({
      where: { candidateId: req.params.id, tenantId },
      include: {
        requisition: {
          select: { id: true, title: true, department: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(res, applications);
  } catch (err) {
    return next(err);
  }
});

export default router;
