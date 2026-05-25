import { Router } from "express";
import { z } from "zod";
import { Prisma, RequisitionStatus } from "../../node_modules/.prisma/client/client";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import prisma from "../utils/prisma";
import { ok, created, noContent, paginated } from "../lib/response";
import { generateJD } from "../agents/jd-author-agent";

const router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────
const CreateRequisitionSchema = z.object({
  title: z.string().min(1).max(200),
  department: z.string().min(1),
  location: z.string().min(1).default("Remote"),
  country: z.string().default("US"),
  jobFamily: z.string().optional(),
  description: z.string().optional(),
  // requirements is Json in Prisma schema — accept any JSON-compatible value
  requirements: z.any().optional(),
  headcount: z.number().int().min(1).default(1),
  priority: z.number().int().min(1).max(5).default(3),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default("USD"),
  hiringManagerId: z.string().optional(),
  recruiterId: z.string().optional(),
  targetStartDate: z
    .string()
    .datetime()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
});

const UpdateRequisitionSchema = CreateRequisitionSchema.partial().extend({
  status: z
    .enum(["DRAFT", "OPEN", "ON_HOLD", "FILLED", "CANCELLED", "CLOSED"])
    .optional(),
});

// ── All routes require authentication ────────────────────────────────────────
router.use(requireAuth);

// GET /api/requisitions — list with pagination, filtering, search
router.get("/", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const skip = (page - 1) * pageSize;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const department = req.query.department as string | undefined;

    const where: Prisma.RequisitionWhereInput = {
      tenantId,
      ...(status ? { status: status as RequisitionStatus } : {}),
      ...(department ? { department } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { department: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.requisition.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { applications: true } },
        },
      }),
      prisma.requisition.count({ where }),
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

// GET /api/requisitions/:id — single requisition with applications + jobPosting
router.get("/:id", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const req_item = await prisma.requisition.findFirst({
      where: { id: req.params.id as string, tenantId },
      include: {
        _count: { select: { applications: true } },
        // Include applications so the detail page can render the candidate list.
        applications: {
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            stage: true,
            status: true,
            createdAt: true,
            candidate: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        // Include job postings so the publish button can read isPublished state.
        // (Schema relation is 1:N though we only ever publish one per requisition.)
        jobPostings: {
          select: { id: true, slug: true, isPublished: true, publishedAt: true },
          orderBy: { publishedAt: "desc" },
          take: 1,
        },
        recruiter: { select: { firstName: true, lastName: true } },
      },
    });
    if (!req_item) throw new AppError("NOT_FOUND", "Requisition not found", 404);
    return ok(res, req_item);
  } catch (err) {
    return next(err);
  }
});

// POST /api/requisitions — create (ADMIN, RECRUITER, HIRING_MANAGER)
router.post("/", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const data = CreateRequisitionSchema.parse(req.body);
    const requisition = await prisma.requisition.create({
      data: {
        ...data,
        tenantId,
        status: "OPEN" as RequisitionStatus,
        requirements: data.requirements ?? [],
      },
    });
    return created(res, requisition);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/requisitions/:id — update (ADMIN, RECRUITER, HIRING_MANAGER)
router.patch("/:id", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.requisition.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Requisition not found", 404);

    const data = UpdateRequisitionSchema.parse(req.body);
    const updated = await prisma.requisition.update({
      where: { id: req.params.id as string },
      data,
    });
    return ok(res, updated);
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/requisitions/:id — soft-delete (sets status to CANCELLED)
router.delete("/:id", requireRole("ADMIN", "RECRUITER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.requisition.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Requisition not found", 404);

    await prisma.requisition.update({
      where: { id: req.params.id as string },
      data: { status: "CANCELLED" as RequisitionStatus },
    });
    return noContent(res);
  } catch (err) {
    return next(err);
  }
});

// POST /api/requisitions/:id/close
router.post("/:id/close", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.requisition.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Requisition not found", 404);

    const updated = await prisma.requisition.update({
      where: { id: req.params.id as string },
      data: { status: "CLOSED" as RequisitionStatus, closedAt: new Date() },
    });
    return ok(res, updated);
  } catch (err) {
    return next(err);
  }
});

// POST /api/requisitions/:id/approve
router.post("/:id/approve", requireRole("ADMIN", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const existing = await prisma.requisition.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Requisition not found", 404);

    const updated = await prisma.requisition.update({
      where: { id: req.params.id as string },
      data: { status: "OPEN" as RequisitionStatus },
    });
    return ok(res, updated);
  } catch (err) {
    return next(err);
  }
});

// ── Job Posting Publish/Unpublish ────────────────────────────────────────────
// W-001 fix: Recruiters publish requisitions as JobPostings to make them
// visible on the public job board. Without this, candidates see no jobs.

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const PublishSchema = z.object({
  expiresAt: z.string().datetime().optional(),
}).optional();

// POST /api/requisitions/:id/publish — publish requisition as a JobPosting
router.post("/:id/publish", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.params.id as string;
    const body = PublishSchema.parse(req.body || {});

    const requisition = await prisma.requisition.findFirst({
      where: { id: requisitionId, tenantId },
    });
    if (!requisition) throw new AppError("NOT_FOUND", "Requisition not found", 404);
    if (requisition.status !== "OPEN") {
      throw new AppError("INVALID_STATE", `Cannot publish requisition with status ${requisition.status}. Only OPEN requisitions can be published.`, 400);
    }

    // Look for existing JobPosting for this requisition (re-publish vs first publish)
    const existing = await prisma.jobPosting.findFirst({
      where: { tenantId, requisitionId },
    });

    if (existing) {
      // Re-publish: just flip the flag and update timestamps
      const updated = await prisma.jobPosting.update({
        where: { id: existing.id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
          expiresAt: body?.expiresAt ? new Date(body.expiresAt) : null,
        },
      });
      return ok(res, updated);
    }

    // First publish: create the JobPosting
    // Generate unique slug (append short random suffix if collision)
    const baseSlug = slugify(requisition.title);
    let slug = baseSlug;
    let attempt = 0;
    while (attempt < 5) {
      const collision = await prisma.jobPosting.findFirst({ where: { tenantId, slug } });
      if (!collision) break;
      attempt++;
      slug = `${baseSlug}-${Math.floor(Date.now() / 1000).toString(36)}`;
    }

    const requirements: string[] = Array.isArray((requisition as any).requirements)
      ? ((requisition as any).requirements as string[])
      : [];

    const posting = await prisma.jobPosting.create({
      data: {
        tenantId,
        requisitionId,
        slug,
        title: requisition.title,
        description: requisition.description || `Join our team as ${requisition.title} in ${requisition.department}.`,
        requirements,
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: body?.expiresAt ? new Date(body.expiresAt) : null,
      },
    });

    // Audit
    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: "JOB_POSTING_PUBLISHED",
        resourceType: "JobPosting",
        resourceId: posting.id,
        actorId: req.user?.id || null,
        actorType: "USER",
        after: { requisitionId, slug, title: posting.title },
      },
    }).catch(() => {});

    return ok(res, posting);
  } catch (err) {
    return next(err);
  }
});

// POST /api/requisitions/:id/unpublish — remove JobPosting from public board
router.post("/:id/unpublish", requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"), async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.params.id as string;

    const result = await prisma.jobPosting.updateMany({
      where: { tenantId, requisitionId },
      data: { isPublished: false },
    });
    if (result.count === 0) throw new AppError("NOT_FOUND", "No published job posting found for this requisition", 404);

    return ok(res, { unpublished: true, count: result.count });
  } catch (err) {
    return next(err);
  }
});

// ── AI JD Draft ──────────────────────────────────────────────────────────────
const AIDraftSchema = z.object({
  title: z.string().min(1, "title is required"),
  department: z.string().min(1),
  skills: z.array(z.string()).min(1),
  level: z.string().min(1),
  location: z.string().min(1).default("Remote"),
  salaryRange: z.string().optional(),
  requisitionId: z.string().optional(),
});

// POST /api/requisitions/ai-draft — generate inclusive JD via AI agent
router.post("/ai-draft", async (req, res, next) => {
  try {
    const tenantId = getTenantId(req);
    const userId = req.user!.id;
    const data = AIDraftSchema.parse(req.body);

    const result = await generateJD({
      title: data.title,
      department: data.department,
      skills: data.skills,
      level: data.level,
      location: data.location,
      salaryRange: data.salaryRange,
      tenantId,
      userId,
      requisitionId: data.requisitionId,
    });

    return ok(res, {
      description: result.jd.description,
      requirements: result.jd.requirements,
      niceToHave: result.jd.niceToHave,
      biasFlags: result.jd.biasFlags,
      inclusivityScore: result.jd.inclusivityScore,
      runId: result.runId,
      tokensUsed: result.tokensUsed,
      costUsd: result.costUsd,
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return next(new AppError("VALIDATION_ERROR", err.errors?.[0]?.message || "Invalid input", 400));
    }
    return next(err);
  }
});

export default router;
