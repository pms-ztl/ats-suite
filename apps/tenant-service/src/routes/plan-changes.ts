/**
 * Plan-change request workflow routes.
 *
 *   POST   /internal/plan-changes               — tenant admin submits request
 *   GET    /internal/plan-changes/by-tenant/:id — tenant admin's own history
 *   DELETE /internal/plan-changes/:id           — tenant admin cancels own pending
 *   GET    /internal/plan-changes               — super-admin queue (filter by status)
 *   PATCH  /internal/plan-changes/:id           — super-admin APPROVE|REJECT (atomically
 *                                                  updates Tenant.plan on approve)
 *
 * NATS events emitted (Phase 1 stub — emit-once when NATS publisher is wired):
 *   tenant.{id}.plan-change.requested
 *   tenant.{id}.plan-change.reviewed
 *   tenant.{id}.tenant.plan-changed
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors } from "@cdc-ats/common";
import { TenantPlanSchema, PlanChangeStatusSchema, tenantSubject } from "@cdc-ats/contracts";
import { publishEvent } from "@cdc-ats/nats-client";
import { prisma } from "../lib/prisma.js";

const router = Router();

const SubmitSchema = z.object({
  tenantId: z.string().uuid(),
  toPlan: TenantPlanSchema,
  reason: z.string().max(500).optional(),
  requestedByUserId: z.string().uuid(),
});

// POST /internal/plan-changes
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = SubmitSchema.parse(req.body);
    const tenant = await prisma.tenant.findUnique({ where: { id: body.tenantId } });
    if (!tenant) throw Errors.notFound("Tenant");
    if (tenant.plan === body.toPlan) {
      throw Errors.validation(`Tenant already on the ${body.toPlan} plan`);
    }
    const existing = await prisma.planChangeRequest.findFirst({
      where: { tenantId: body.tenantId, status: "PENDING" },
    });
    if (existing) throw Errors.conflict(`A pending request already exists (${existing.id})`);

    const request = await prisma.planChangeRequest.create({
      data: {
        tenantId: body.tenantId,
        fromPlan: tenant.plan,
        toPlan: body.toPlan as any,
        reason: body.reason ?? null,
        requestedByUserId: body.requestedByUserId,
        status: "PENDING",
      },
    });
    created(res, request);
  } catch (err) {
    next(err);
  }
});

// GET /internal/plan-changes/by-tenant/:id
router.get("/by-tenant/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const rows = await prisma.planChangeRequest.findMany({
      where: { tenantId: id },
      orderBy: { requestedAt: "desc" },
      take: 50,
    });
    ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// DELETE /internal/plan-changes/:id (cancel own pending)
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const row = await prisma.planChangeRequest.findUnique({ where: { id } });
    if (!row) throw Errors.notFound("Plan change request");
    if (row.status !== "PENDING") {
      throw Errors.validation(`Cannot cancel a request in ${row.status} state`);
    }
    await prisma.planChangeRequest.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    ok(res, { cancelled: true });
  } catch (err) {
    next(err);
  }
});

// GET /internal/plan-changes?status=PENDING (super-admin queue)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = typeof req.query["status"] === "string" ? req.query["status"] : "PENDING";
    const rows = await prisma.planChangeRequest.findMany({
      where: { status: status as any },
      orderBy: { requestedAt: "desc" },
      include: { tenant: { select: { id: true, name: true, slug: true, plan: true, status: true } } },
    });
    ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /internal/plan-changes/:id (super-admin approve/reject)
const ReviewSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().max(500).optional(),
  reviewedByUserId: z.string().uuid(),
});

router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const body = ReviewSchema.parse(req.body);

    const request = await prisma.planChangeRequest.findUnique({ where: { id } });
    if (!request) throw Errors.notFound("Plan change request");
    if (request.status !== "PENDING") {
      throw Errors.validation(`Cannot review a request in ${request.status} state`);
    }

    const newStatus = body.action === "APPROVE" ? "APPROVED" : "REJECTED";

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.planChangeRequest.update({
        where: { id },
        data: {
          status: newStatus as any,
          reviewedByUserId: body.reviewedByUserId,
          reviewedAt: new Date(),
          decisionNote: body.note ?? null,
        },
      });
      if (body.action === "APPROVE") {
        await tx.tenant.update({
          where: { id: request.tenantId },
          data: { plan: request.toPlan, status: "ACTIVE" as any },
        });
      }
      return updated;
    });

    // Emit tenant.plan-changed → billing-service updates cache + disables agents
    if (body.action === "APPROVE") {
      publishEvent({
        subject: tenantSubject(request.tenantId, "tenant", "plan-changed"),
        type: "tenant.plan-changed",
        tenantId: request.tenantId,
        payload: {
          tenantId: request.tenantId,
          fromPlan: request.fromPlan,
          toPlan: request.toPlan,
          changedByUserId: body.reviewedByUserId,
          requestId: id,
        },
      }).catch(() => { /* non-fatal */ });
    }

    ok(res, result);
  } catch (err) {
    next(err);
  }
});

export default router;
