/**
 * Job posting CRUD (authenticated, tenant-scoped).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: publishing jobs is admin/recruiter only.
const requirePublisher = requireRole("ADMIN", "RECRUITER");
import { prisma } from "../lib/prisma.js";
import { ensurePublishedPosting } from "../lib/ensure-posting.js";

const router = Router();

const CreatePostingSchema = z.object({
  requisitionId: z.string().uuid(),
  slug: z.string().min(2).max(120),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  requirements: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
});

router.post("/", requirePublisher, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreatePostingSchema.parse(req.body);
    const req2 = await prisma.requisition.findFirst({ where: { id: body.requisitionId, tenantId } });
    if (!req2) throw Errors.notFound("Requisition");
    const posting = await prisma.jobPosting.create({
      data: {
        tenantId,
        requisitionId: body.requisitionId,
        slug: body.slug,
        title: body.title,
        description: body.description,
        requirements: body.requirements,
        isPublished: body.isPublished,
        publishedAt: body.isPublished ? new Date() : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    created(res, posting);
  } catch (err) { next(err); }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    // When ?requisitionId= is present, scope to that requisition's posting so the
    // frontend's "Post job" link resolves to THIS req's slug (not the first row).
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const where = requisitionId ? { tenantId, requisitionId } : { tenantId };
    const postings = await prisma.jobPosting.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
    });
    ok(res, postings);
  } catch (err) { next(err); }
});

// POST /job-postings/backfill-open — create a published posting for every OPEN
// requisition in the caller's tenant that lacks one (idempotent). Lets existing
// OPEN reqs (seeded before this helper existed) appear on the career portal.
// The orchestrator calls this once after deploy.
router.post("/backfill-open", requirePublisher, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const open = await prisma.requisition.findMany({
      where: { tenantId, status: "OPEN" },
      select: { id: true },
    });
    let createdCount = 0;
    let skipped = 0;
    for (const r of open) {
      const existing = await prisma.jobPosting.findFirst({
        where: { tenantId, requisitionId: r.id },
        select: { id: true },
      });
      if (existing) { skipped++; continue; }
      const posting = await ensurePublishedPosting(prisma, tenantId, r.id);
      if (posting) createdCount++;
    }
    ok(res, { openRequisitions: open.length, created: createdCount, skipped });
  } catch (err) { next(err); }
});

// Phase 27 F-027-micro-e + F-028-micro-P1: gate + scope mutation by tenantId.
router.patch("/:id", requirePublisher, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = CreatePostingSchema.partial().parse(req.body);
    const existing = await prisma.jobPosting.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Job posting");
    const data: any = { ...body };
    if (body.isPublished === true && !existing.publishedAt) data.publishedAt = new Date();
    if (body.expiresAt) data.expiresAt = new Date(body.expiresAt);
    const { count } = await prisma.jobPosting.updateMany({ where: { id, tenantId }, data });
    if (count === 0) throw Errors.notFound("Job posting");
    const updated = await prisma.jobPosting.findUnique({ where: { id } });
    ok(res, updated);
  } catch (err) { next(err); }
});

export default router;
