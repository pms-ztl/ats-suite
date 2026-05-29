/**
 * Internal tenant routes — called by api-gateway only.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, requireSuperAdmin } from "@cdc-ats/common";
import { CreateTenantInputSchema, TenantPlanSchema, TenantStatusSchema, tenantSubject } from "@cdc-ats/contracts";
import { publishEvent } from "@cdc-ats/nats-client";
import { prisma } from "../lib/prisma.js";

// Phase 30 — plans that can transition via Stripe self-serve.
const STRIPE_PLANS = ["FREE", "STARTER", "PROFESSIONAL"] as const;

const router = Router();

// ─── POST /internal/tenants — create tenant (called by register saga) ────
// NOTE: intentionally NOT requireRole-guarded — during /api/auth/register-company
// the caller has no JWT yet, so no role exists. Gateway is trusted via
// network policy + restricts /api/auth/register-company to public path only.
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateTenantInputSchema.parse(req.body);

    const existing = await prisma.tenant.findUnique({ where: { slug: body.slug } });
    if (existing) throw Errors.conflict(`Tenant with slug ${body.slug} already exists`);

    const trialEndsAt =
      body.plan !== "FREE" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null;

    const tenant = await prisma.tenant.create({
      data: {
        name: body.name,
        slug: body.slug,
        plan: body.plan as any,
        status: trialEndsAt ? "TRIAL" : "ACTIVE",
        trialEndsAt,
        industry: body.industry,
        companySize: body.companySize,
        website: body.website,
      },
    });

    // Emit platform.tenant.created → billing-service seeds plan cache
    const xUserId = req.headers["x-user-id"];
    const createdByUserId =
      typeof xUserId === "string" && /^[0-9a-f-]{36}$/i.test(xUserId) ? xUserId : null;
    publishEvent({
      subject: "platform.tenant.created",
      type: "tenant.created",
      tenantId: null,
      payload: {
        tenantId: tenant.id,
        name: tenant.name,
        plan: tenant.plan,
        industry: tenant.industry,
        companySize: tenant.companySize,
        createdByUserId,
      },
    }).catch(() => { /* non-fatal */ });

    created(res, tenant);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /internal/tenants/:id — compensation for saga rollback ───────
// NOTE: NOT requireRole-guarded — called by the register-company saga in the
// gateway when user creation fails after tenant creation. At that moment the
// caller has no JWT yet (saga runs before login). Trusted via network policy.
// F-027-micro N/A: tenants have no tenantId column (they ARE the tenant),
// so deleteMany scoped by tenantId doesn't apply.
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    // Hard delete since this is only called for saga rollback before any data
    // (users, requisitions, etc.) has been associated.
    await prisma.tenant.delete({ where: { id } }).catch(() => { /* already gone */ });
    ok(res, { deleted: id });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/tenants/:id ───────────────────────────────────────────
// ─── GET /internal/tenants/stats — platform KPIs (SUPER_ADMIN) ──────────
// Cross-tenant rollup for the super-admin dashboard. MUST be declared before
// GET /:id so "stats" isn't captured as a tenant id.
router.get("/stats", requireSuperAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [byStatus, byPlan, totalTenants, recent] = await Promise.all([
      prisma.tenant.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.tenant.groupBy({ by: ["plan"], _count: { _all: true } }),
      prisma.tenant.count(),
      prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, plan: true, status: true, createdAt: true },
      }),
    ]);
    const statusMap: Record<string, number> = {};
    for (const r of byStatus) statusMap[r.status] = r._count._all;
    const planBreakdown: Record<string, number> = {};
    for (const r of byPlan) planBreakdown[r.plan] = r._count._all;
    ok(res, {
      totalTenants,
      activeTenants: statusMap["ACTIVE"] ?? 0,
      trialTenants: statusMap["TRIAL"] ?? 0,
      suspendedTenants: statusMap["SUSPENDED"] ?? 0,
      planBreakdown,
      recentTenants: recent.map((t) => ({
        id: t.id,
        name: t.name,
        plan: t.plan,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw Errors.notFound("Tenant");
    ok(res, tenant);
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/tenants?plan=&status=&search= — super-admin list ──────
// Phase 27 F-028-micro-P0: defense-in-depth super-admin guard. Gateway
// already mounts this under /api/super-admin/tenants with requireSuperAdmin.
router.get("/", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plan = typeof req.query["plan"] === "string" ? req.query["plan"] : undefined;
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const search = typeof req.query["search"] === "string" ? req.query["search"] : undefined;
    const page = Number(req.query["page"]) || 1;
    const limit = Number(req.query["limit"]) || 25;

    const where: any = {};
    if (plan) where.plan = plan.toUpperCase();
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, tenants] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    ok(res, {
      data: tenants,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/tenants/:id/stripe-customer ───────────────────────────
// Phase 30 — billing-service writes the Stripe customer id back here after
// creating it. Intentionally NOT requireRole-guarded — internal service-to-
// service call (gateway never exposes this path). Idempotent: re-writing
// the same id is a no-op; rewriting a different id should never happen
// because we always reuse the customer.
router.put("/:id/stripe-customer", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const body = z.object({ stripeCustomerId: z.string().min(1) }).parse(req.body);
    const { count } = await prisma.tenant.updateMany({
      where: { id },
      data: { stripeCustomerId: body.stripeCustomerId },
    });
    if (count === 0) throw Errors.notFound("Tenant");
    ok(res, { tenantId: id, stripeCustomerId: body.stripeCustomerId });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /internal/tenants/:id/plan-from-stripe ─────────────────────────
// Phase 30 — billing-service calls this when a Stripe webhook says the
// tenant's subscription changed. We update Tenant.plan + status, then emit
// the canonical tenant.plan-changed event so the rest of the platform
// (billing's TenantPlanCache subscriber, notification-service, etc.) reacts
// the same way as a manual plan change.
//
// Intentionally NOT requireSuperAdmin — this is internal service-to-service.
// Restricted to STARTER/PROFESSIONAL/FREE (ENTERPRISE never flows through
// Stripe self-serve).
router.put("/:id/plan-from-stripe", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const body = z.object({
      plan: z.enum(STRIPE_PLANS),
      stripeStatus: z.string(),
    }).parse(req.body);

    const current = await prisma.tenant.findUnique({ where: { id }, select: { plan: true } });
    if (!current) throw Errors.notFound("Tenant");

    if (current.plan === "ENTERPRISE") {
      // Stripe should never modify an Enterprise plan — that lives in
      // PlanChangeRequest. Defensive guard.
      throw Errors.conflict("Cannot modify ENTERPRISE plan via Stripe");
    }

    // No-op if already on this plan (idempotent webhook handling).
    if (current.plan === body.plan) {
      ok(res, { tenantId: id, plan: body.plan, changed: false });
      return;
    }

    const { count } = await prisma.tenant.updateMany({
      where: { id },
      data: {
        plan: body.plan as any,
        // Move out of TRIAL the moment a paid plan kicks in; downgrade keeps
        // ACTIVE since the data hasn't gone away.
        status: body.plan === "FREE" ? "ACTIVE" : "ACTIVE",
      },
    });
    if (count === 0) throw Errors.notFound("Tenant");

    // Emit the SAME canonical event that the manual PlanChangeRequest
    // approval flow emits. Existing subscribers (billing cache,
    // notifications) react the same way regardless of source.
    publishEvent({
      subject: tenantSubject(id, "tenant", "plan-changed"),
      type: "tenant.plan-changed",
      tenantId: id,
      payload: {
        tenantId: id,
        fromPlan: current.plan,
        toPlan: body.plan,
        source: "stripe",
        stripeStatus: body.stripeStatus,
      },
    }).catch(() => undefined);

    ok(res, { tenantId: id, plan: body.plan, changed: true });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /internal/tenants/:id — super-admin update ────────────────────
const UpdateSchema = z.object({
  plan: TenantPlanSchema.optional(),
  status: TenantStatusSchema.optional(),
  name: z.string().min(2).max(100).optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  dataRegion: z.string().optional(),
});

// Phase 27 F-028-micro-P0: super-admin only. Defense-in-depth: gateway
// gates /api/super-admin/tenants/:id with requireSuperAdmin.
router.patch("/:id", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const body = UpdateSchema.parse(req.body);
    const tenant = await prisma.tenant.update({
      where: { id },
      data: body as any,
    });
    ok(res, tenant);
  } catch (err) {
    next(err);
  }
});

export default router;
