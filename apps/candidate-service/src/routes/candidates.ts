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
import { ok, created, Errors, getTenantId, getUserId } from "@cdc-ats/common";
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

// POST /internal/candidates
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
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
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateCandidateSchema.parse(req.body);
    const existing = await prisma.candidate.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Candidate");
    const updated = await prisma.candidate.update({ where: { id }, data: body });
    ok(res, updated);
  } catch (err) { next(err); }
});

export default router;
