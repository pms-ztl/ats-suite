/**
 * Application + ApplicationAttachment routes.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";

// Phase 27 F-028-micro-P1: candidate-facing operations need ADMIN/RECRUITER/HIRING_MANAGER.
// INTERVIEWER cannot create/update applications or upload attachments.
const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
import { ApplicationStageSchema, ApplicationStatusSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";

const router = Router();

const CreateApplicationSchema = z.object({
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  // nullish so callers (e.g. public apply with no cover letter) may send null
  notes: z.string().nullish(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
  stage: ApplicationStageSchema.optional(),
});

// POST /internal/applications
router.post("/", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateApplicationSchema.parse(req.body);
    // Verify candidate exists in this tenant
    const candidate = await prisma.candidate.findFirst({
      where: { id: body.candidateId, tenantId }, select: { id: true },
    });
    if (!candidate) throw Errors.notFound("Candidate");

    const app = await prisma.application.create({
      data: {
        tenantId,
        candidateId: body.candidateId,
        requisitionId: body.requisitionId,
        notes: body.notes ?? null,
        formResponses: body.formResponses as any,
        stage: body.stage ?? "APPLIED",
        status: "ACTIVE",
      },
    });
    created(res, app);
  } catch (err) { next(err); }
});

// GET /internal/applications?requisitionId=&stage=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const requisitionId = req.query["requisitionId"] as string | undefined;
    const stage = req.query["stage"] as string | undefined;
    const where: any = { tenantId };
    if (requisitionId) where.requisitionId = requisitionId;
    if (stage) where.stage = stage;
    const apps = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      take: 200,
      include: { candidate: { select: { firstName: true, lastName: true, email: true } } },
    });
    ok(res, apps);
  } catch (err) { next(err); }
});

// PATCH /internal/applications/:id
const UpdateApplicationSchema = z.object({
  stage: ApplicationStageSchema.optional(),
  status: ApplicationStatusSchema.optional(),
  notes: z.string().optional(),
});
// Phase 27 F-027-micro-a + F-028-micro-P1: gate + scope mutation by tenantId.
router.patch("/:id", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateApplicationSchema.parse(req.body);
    const existing = await prisma.application.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Application");
    const data: any = { ...body };
    if (body.stage) data.stageUpdatedAt = new Date();
    // defense-in-depth: updateMany with tenantId filter on the mutation itself.
    const { count } = await prisma.application.updateMany({ where: { id, tenantId }, data });
    if (count === 0) throw Errors.notFound("Application");
    const updated = await prisma.application.findUnique({ where: { id } });
    ok(res, updated);
  } catch (err) { next(err); }
});

// POST /internal/attachments — record metadata after file is stored
const CreateAttachmentSchema = z.object({
  applicationId: z.string(),
  fieldId: z.string(),
  fileName: z.string(),
  originalName: z.string(),
  fileSize: z.number().int(),
  mimeType: z.string(),
  storageKey: z.string(),
});
router.post("/attachments", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateAttachmentSchema.parse(req.body);
    const att = await prisma.applicationAttachment.create({
      data: { tenantId, ...body },
    });
    created(res, att);
  } catch (err) { next(err); }
});

export default router;
