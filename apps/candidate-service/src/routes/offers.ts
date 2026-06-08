/**
 * Offer routes — plain CRUD over Offer records that the Offers board reads and
 * the approval flow updates. (The AI offer-LETTER generator is separate, in
 * agent-offer.ts at /internal/offer.) Tenant-scoped via explicit where:{tenantId}.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
const router = Router();

const OfferStatusSchema = z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"]);

const CreateOfferSchema = z.object({
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  applicationId: z.string().optional(),
  baseSalary: z.number().int().positive(),
  currency: z.string().default("USD"),
  bonusPercent: z.number().int().min(0).max(100).optional(),
  equity: z.string().optional(),
  startDate: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  status: OfferStatusSchema.optional(),
  notes: z.string().optional(),
});

// GET /internal/offers?status=&requisitionId=
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const where: any = { tenantId };
    if (req.query["status"]) where.status = req.query["status"];
    if (req.query["requisitionId"]) where.requisitionId = req.query["requisitionId"];
    const offers = await prisma.offer.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
    ok(res, offers);
  } catch (err) { next(err); }
});

// GET /internal/offers/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const offer = await prisma.offer.findFirst({ where: { id: req.params["id"] as string, tenantId } });
    if (!offer) throw Errors.notFound("Offer");
    ok(res, offer);
  } catch (err) { next(err); }
});

// POST /internal/offers
router.post("/", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateOfferSchema.parse(req.body);
    const offer = await prisma.offer.create({
      data: {
        tenantId,
        candidateId: body.candidateId,
        requisitionId: body.requisitionId,
        applicationId: body.applicationId ?? null,
        baseSalary: body.baseSalary,
        currency: body.currency,
        bonusPercent: body.bonusPercent ?? null,
        equity: body.equity ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        status: body.status ?? "DRAFT",
        notes: body.notes ?? null,
      },
    });
    created(res, offer);
  } catch (err) { next(err); }
});

// PATCH /internal/offers/:id
const UpdateOfferSchema = z.object({
  status: OfferStatusSchema.optional(),
  baseSalary: z.number().int().positive().optional(),
  notes: z.string().optional(),
});
router.patch("/:id", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const existing = await prisma.offer.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!existing) throw Errors.notFound("Offer");
    const body = UpdateOfferSchema.parse(req.body);
    const offer = await prisma.offer.update({ where: { id }, data: body });
    ok(res, offer);
  } catch (err) { next(err); }
});

// POST /internal/offers/:id/approve
router.post("/:id/approve", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const existing = await prisma.offer.findFirst({ where: { id, tenantId }, select: { id: true } });
    if (!existing) throw Errors.notFound("Offer");
    const userId = (req.headers["x-user-id"] as string) || null;
    const offer = await prisma.offer.update({ where: { id }, data: { status: "APPROVED", approvedBy: userId } });
    ok(res, offer);
  } catch (err) { next(err); }
});

export default router;
