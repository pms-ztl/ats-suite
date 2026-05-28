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
import { ok, created, Errors, requireTenantAdmin, requireSuperAdmin } from "@cdc-ats/common";
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

// POST /internal/plan-changes — tenant admin submits upgrade request.
// Phase 27 F-028-micro-P0: tenant admin only (recruiter/interviewer can't request upgrades).
router.post("/", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
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

    // Emit tenant.{id}.plan-change.requested → notification-service notifies super-admins
    publishEvent({
      subject: tenantSubject(body.tenantId, "plan-change", "requested"),
      type: "plan-change.requested",
      tenantId: body.tenantId,
      payload: {
        tenantId: body.tenantId,
        tenantName: tenant.name,
        requestId: request.id,
        fromPlan: tenant.plan,
        toPlan: body.toPlan,
        reason: body.reason ?? null,
        requestedByUserId: body.requestedByUserId,
      },
    }).catch(() => { /* non-fatal */ });

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
// Phase 27 F-028-micro-P0: tenant-admin only.
// Phase 27 F-027-micro: cross-tenant cancel was possible — tenant A could
// cancel tenant B's request by guessing the id. Now scoped by tenantId on
// BOTH the lookup AND the mutation (defense-in-depth).
router.delete("/:id", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const tenantId = req.user?.tenantId;
    if (!tenantId) throw Errors.unauthorized("Missing tenant context");
    const row = await prisma.planChangeRequest.findFirst({ where: { id, tenantId } });
    if (!row) throw Errors.notFound("Plan change request");
    if (row.status !== "PENDING") {
      throw Errors.validation(`Cannot cancel a request in ${row.status} state`);
    }
    const { count } = await prisma.planChangeRequest.updateMany({
      where: { id, tenantId },
      data: { status: "CANCELLED" },
    });
    if (count === 0) throw Errors.notFound("Plan change request");
    ok(res, { cancelled: true });
  } catch (err) {
    next(err);
  }
});

// GET /internal/plan-changes?status=PENDING (super-admin queue)
// Phase 27 F-028-micro-P0: super-admin only.
router.get("/", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
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

// Phase 27 F-028-micro-P0: super-admin only — approve/reject plan changes.
//
// Phase 33a — approval no longer auto-activates the new plan for paid
// tiers. The split:
//
//   toPlan = ENTERPRISE   → flips Tenant.plan immediately (custom contract,
//                            no Stripe involvement). paymentMethod=ENTERPRISE_CONTRACT.
//   toPlan = FREE         → flips Tenant.plan immediately (downgrade to free
//                            is the end-state of cancellation). paymentMethod=FREE.
//   toPlan = STARTER|PROFESSIONAL → APPROVED but Tenant.plan NOT flipped yet.
//                            paymentMethod=STRIPE. Tenant must pay via Checkout
//                            (billing-service /stripe/checkout-for-request/:id)
//                            and the Stripe webhook activates the plan.
//
// REJECT: no change to Tenant.plan, paymentMethod left null, request marked REJECTED.
router.patch("/:id", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const body = ReviewSchema.parse(req.body);

    const request = await prisma.planChangeRequest.findUnique({ where: { id } });
    if (!request) throw Errors.notFound("Plan change request");
    if (request.status !== "PENDING") {
      throw Errors.validation(`Cannot review a request in ${request.status} state`);
    }

    const newStatus = body.action === "APPROVE" ? "APPROVED" : "REJECTED";

    // Paid plans (STARTER/PROFESSIONAL) need Stripe payment — only mark approved.
    // FREE/ENTERPRISE flip the tenant immediately.
    const requiresStripePayment = body.action === "APPROVE"
      && (request.toPlan === "STARTER" || request.toPlan === "PROFESSIONAL");
    const paymentMethod = body.action === "APPROVE"
      ? (requiresStripePayment ? "STRIPE" : request.toPlan === "ENTERPRISE" ? "ENTERPRISE_CONTRACT" : "FREE")
      : null;
    const now = new Date();

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.planChangeRequest.update({
        where: { id },
        data: {
          status: newStatus as any,
          reviewedByUserId: body.reviewedByUserId,
          reviewedAt: now,
          decisionNote: body.note ?? null,
          ...(paymentMethod ? { paymentMethod } : {}),
          // activatedAt only set for the immediate-activation cases.
          ...(body.action === "APPROVE" && !requiresStripePayment ? { activatedAt: now } : {}),
        },
      });
      if (body.action === "APPROVE" && !requiresStripePayment) {
        await tx.tenant.update({
          where: { id: request.tenantId },
          data: { plan: request.toPlan, status: "ACTIVE" as any },
        });
      }
      return updated;
    });

    // Emit events. Two distinct subjects so subscribers can react differently:
    //   tenant.{id}.plan-change.reviewed         — always (notification email
    //                                              to the requester: approved /
    //                                              rejected / payment-required)
    //   tenant.{id}.tenant.plan-changed         — only on immediate activation
    //                                              (FREE/ENTERPRISE); Stripe
    //                                              webhook fires this for paid plans
    publishEvent({
      subject: tenantSubject(request.tenantId, "plan-change", "reviewed"),
      type: "plan-change.reviewed",
      tenantId: request.tenantId,
      payload: {
        tenantId: request.tenantId,
        requestId: id,
        action: body.action,
        toPlan: request.toPlan,
        paymentMethod: paymentMethod ?? null,
        requiresStripePayment,
        note: body.note ?? null,
        requestedByUserId: request.requestedByUserId,
        reviewedByUserId: body.reviewedByUserId,
      },
    }).catch(() => { /* non-fatal */ });

    if (body.action === "APPROVE" && !requiresStripePayment) {
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

// ─── GET /internal/plan-changes/:id ──────────────────────────────────────
// Phase 33a — billing-service calls this to validate a Checkout request:
// only proceed if the request is APPROVED + paymentMethod=STRIPE + caller's
// tenant matches. Internal-only; no auth gate here (the caller is the
// billing-service via the gateway proxy chain).
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const row = await prisma.planChangeRequest.findUnique({ where: { id } });
    if (!row) throw Errors.notFound("Plan change request");
    ok(res, row);
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /internal/plan-changes/:id/activate ──────────────────────────
// Phase 33a — called by billing-service after Stripe webhook confirms payment.
// Idempotent — re-calling on an already-activated request is a no-op.
// Updates Tenant.plan + sets activatedAt + emits tenant.plan-changed.
router.patch("/:id/activate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const row = await prisma.planChangeRequest.findUnique({ where: { id } });
    if (!row) throw Errors.notFound("Plan change request");
    if (row.status !== "APPROVED") {
      throw Errors.validation(`Cannot activate a request in ${row.status} state`);
    }
    if (row.activatedAt) {
      ok(res, { activated: true, idempotent: true, request: row });
      return;
    }

    const now = new Date();
    const [updated, _tenant] = await prisma.$transaction([
      prisma.planChangeRequest.update({
        where: { id },
        data: { activatedAt: now },
      }),
      prisma.tenant.update({
        where: { id: row.tenantId },
        data: { plan: row.toPlan, status: "ACTIVE" as any },
      }),
    ]);

    publishEvent({
      subject: tenantSubject(row.tenantId, "tenant", "plan-changed"),
      type: "tenant.plan-changed",
      tenantId: row.tenantId,
      payload: {
        tenantId: row.tenantId,
        fromPlan: row.fromPlan,
        toPlan: row.toPlan,
        changedByUserId: row.reviewedByUserId ?? "stripe-webhook",
        requestId: id,
        source: "stripe",
      },
    }).catch(() => undefined);

    ok(res, { activated: true, request: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
