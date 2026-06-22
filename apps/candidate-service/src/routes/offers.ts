/**
 * Offer routes — plain CRUD over Offer records that the Offers board reads and
 * the approval flow updates. (The AI offer-LETTER generator is separate, in
 * agent-offer.ts at /internal/offer.) Tenant-scoped via explicit where:{tenantId}.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireRole, createLogger } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { approveOfferInternal } from "../lib/offer-approve.js";
import {
  resolveRequisitionContext,
  publishOfferAccepted,
} from "../lib/decision-events.js";

const requireRecruiterOrAdmin = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");
const router = Router();
const logger = createLogger({ serviceName: "candidate-service:offers" });

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
// Module E — sets the offer APPROVED + approvedBy, renders the offer-letter PDF
// (storing its key when object storage is configured; null otherwise — never
// fabricated), and publishes offer.approved so notification-service emails the
// candidate with the letter reference.
router.post("/:id/approve", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const userId = (req.headers["x-user-id"] as string) || null;
    const role = (req.headers["x-user-role"] as string) || "ADMIN";

    // Shared with the one-click Hire flow: render letter, set APPROVED, publish
    // offer.approved (candidate email). See lib/offer-approve.ts.
    const offer = await approveOfferInternal(id, tenantId, userId, role, logger);
    ok(res, offer);
  } catch (err) { next(err); }
});

// POST /internal/offers/:id/accept
// Module E — candidate-side accept (used by the portal). Sets the offer ACCEPTED
// + acceptedAt (idempotent) and publishes offer.accepted, which is what triggers
// onboarding downstream.
router.post("/:id/accept", requireRecruiterOrAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;

    const existing = await prisma.offer.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Offer");

    const alreadyAccepted = existing.status === "ACCEPTED";
    const acceptedAt = existing.acceptedAt ?? new Date();
    let offer = existing;
    if (!alreadyAccepted) {
      offer = await prisma.offer.update({
        where: { id },
        data: { status: "ACCEPTED", acceptedAt },
      });

      const candidate = await prisma.candidate.findFirst({
        where: { id: existing.candidateId, tenantId },
        select: { firstName: true, lastName: true, email: true },
      });
      const ctx = await resolveRequisitionContext({
        requisitionId: existing.requisitionId,
        tenantId,
        userId: (req.headers["x-user-id"] as string) || null,
        role: (req.headers["x-user-role"] as string) || "ADMIN",
      });
      const candidateName = candidate ? `${candidate.firstName} ${candidate.lastName}`.trim() : null;
      await publishOfferAccepted(
        {
          tenantId,
          offerId: offer.id,
          applicationId: offer.applicationId ?? null,
          candidateId: offer.candidateId,
          candidateName: candidateName || null,
          candidateEmail: candidate?.email ?? null,
          jobTitle: ctx.title,
          acceptedAt: acceptedAt.toISOString(),
        },
        logger,
      );
    }

    ok(res, { ...offer, alreadyAccepted });
  } catch (err) { next(err); }
});

export default router;
