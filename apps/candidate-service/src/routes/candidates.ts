/**
 * Candidate + application + attachment routes — gateway forwards user headers.
 *
 *   GET    /internal/candidates                    — list (tenant-scoped)
 *   POST   /internal/candidates                    — create candidate
 *   GET    /internal/candidates/:id                — single
 *   PATCH  /internal/candidates/:id                — update
 *   GET    /internal/candidates/:id/applications   — candidate's apps
 *   GET    /internal/candidates/:id/attachments    — application attachments
 *   POST   /internal/candidates/upsert-from-application — used by public apply
 *
 *   GET    /internal/applications                  — list (filter by req/stage)
 *   POST   /internal/applications                  — create
 *   PATCH  /internal/applications/:id              — update stage/status
 *
 *   POST   /internal/attachments                   — record file metadata
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: candidate operations need ADMIN/RECRUITER/HIRING_MANAGER.
// upsert-from-application is INTERNAL (called by job-service public apply flow),
// so it's NOT gated here — see comment on that route.
const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
import { prisma } from "../lib/prisma.js";

const router = Router();

const CreateCandidateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /internal/candidates
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const candidates = await prisma.candidate.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    ok(res, candidates);
  } catch (err) { next(err); }
});

/**
 * Lightweight tenant overview — total candidates + active applications.
 * Used by gateway's /api/platform/unified-overview aggregator.
 */
router.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const [totalCandidates, activeApplications, hiredApplications, applicationsByStage] =
      await Promise.all([
        prisma.candidate.count({ where: { tenantId } }),
        prisma.application.count({ where: { tenantId, status: "ACTIVE" } }),
        prisma.application.count({ where: { tenantId, status: "HIRED" } }),
        prisma.application.groupBy({
          by: ["stage"],
          where: { tenantId },
          _count: { _all: true },
        }),
      ]);
    const byStage: Record<string, number> = {};
    for (const row of applicationsByStage) byStage[row.stage] = row._count._all;
    ok(res, {
      totalCandidates,
      activeCandidates: activeApplications, // alias for dashboard
      activeApplications,
      hiredApplications,
      applicationsByStage: byStage,
    });
  } catch (err) { next(err); }
});

// GET /internal/candidates/platform-stats — SUPER_ADMIN cross-tenant counts.
// Returns { total, byTenant } for the super-admin dashboard. Declared before
// /:id so the literal path isn't captured as a candidate id.
router.get("/platform-stats", requireRole("SUPER_ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const grouped = await prisma.candidate.groupBy({ by: ["tenantId"], _count: { _all: true } });
    const byTenant: Record<string, number> = {};
    let total = 0;
    for (const r of grouped) {
      byTenant[r.tenantId] = r._count._all;
      total += r._count._all;
    }
    ok(res, { total, byTenant });
  } catch (err) { next(err); }
});

// POST /internal/candidates
router.post("/", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateCandidateSchema.parse(req.body);
    const existing = await prisma.candidate.findFirst({
      where: { tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw Errors.conflict("Candidate with this email already exists");
    const candidate = await prisma.candidate.create({
      data: { tenantId, ...body, email: body.email.toLowerCase() },
    });
    created(res, candidate);
  } catch (err) { next(err); }
});

// POST /internal/candidates/upsert-from-application — used by job-service when
// a public apply comes in. Idempotent on (tenantId, email).
// NOT requireRole-guarded: called from job-service's public apply handler
// where the original requester is an anonymous candidate (no JWT). The
// X-User-Role header in this case is the synthetic "system" role set by
// job-service. Trusted via inter-service network policy.
router.post("/upsert-from-application", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateCandidateSchema.parse(req.body);
    const candidate = await prisma.candidate.upsert({
      where: { tenantId_email: { tenantId, email: body.email.toLowerCase() } },
      create: { tenantId, ...body, email: body.email.toLowerCase(), source: body.source ?? "PUBLIC_APPLY" },
      update: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone ?? undefined,
        linkedinUrl: body.linkedinUrl ?? undefined,
      },
    });
    ok(res, candidate);
  } catch (err) { next(err); }
});

// GET /internal/candidates/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const candidate = await prisma.candidate.findFirst({
      where: { id, tenantId },
      include: { applications: true },
    });
    if (!candidate) throw Errors.notFound("Candidate");
    ok(res, candidate);
  } catch (err) { next(err); }
});

// GET /internal/candidates/:id/applications
router.get("/:id/applications", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const apps = await prisma.application.findMany({
      where: { candidateId: id, tenantId },
      orderBy: { createdAt: "desc" },
    });
    ok(res, apps);
  } catch (err) { next(err); }
});

// GET /internal/candidates/:id/attachments
router.get("/:id/attachments", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const apps = await prisma.application.findMany({
      where: { candidateId: id, tenantId }, select: { id: true, requisitionId: true },
    });
    const appIds = apps.map((a) => a.id);
    const attachments = appIds.length === 0 ? [] : await prisma.applicationAttachment.findMany({
      where: { applicationId: { in: appIds }, tenantId },
      orderBy: { createdAt: "desc" },
    });
    const appMap = new Map(apps.map((a) => [a.id, a]));
    ok(res, attachments.map((a) => ({
      ...a,
      requisitionId: appMap.get(a.applicationId)?.requisitionId ?? null,
    })));
  } catch (err) { next(err); }
});

// PATCH /internal/candidates/:id
const UpdateCandidateSchema = CreateCandidateSchema.partial().extend({
  resumeUrl: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
// Phase 27 F-027-micro-b + F-028-micro-P1: gate + scope mutation by tenantId.
router.patch("/:id", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateCandidateSchema.parse(req.body);
    const existing = await prisma.candidate.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Candidate");
    const { count } = await prisma.candidate.updateMany({ where: { id, tenantId }, data: body });
    if (count === 0) throw Errors.notFound("Candidate");
    const updated = await prisma.candidate.findUnique({ where: { id } });
    ok(res, updated);
  } catch (err) { next(err); }
});

export default router;
