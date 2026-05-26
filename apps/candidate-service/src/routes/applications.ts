/**
 * Application + ApplicationAttachment routes.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId } from "@cdc-ats/common";
import { ApplicationStageSchema, ApplicationStatusSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";

const router = Router();

const CreateApplicationSchema = z.object({
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  notes: z.string().optional(),
  formResponses: z.record(z.string(), z.unknown()).optional(),
  stage: ApplicationStageSchema.optional(),
});

// POST /internal/applications
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
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
router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateApplicationSchema.parse(req.body);
    const existing = await prisma.application.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Application");
    const data: any = { ...body };
    if (body.stage) data.stageUpdatedAt = new Date();
    const updated = await prisma.application.update({ where: { id }, data });
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
router.post("/attachments", async (req: Request, res: Response, next: NextFunction) => {
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
