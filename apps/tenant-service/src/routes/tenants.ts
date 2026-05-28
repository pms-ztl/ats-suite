/**
 * Internal tenant routes — called by api-gateway only.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, requireSuperAdmin } from "@cdc-ats/common";
import { CreateTenantInputSchema, TenantPlanSchema, TenantStatusSchema, tenantSubject } from "@cdc-ats/contracts";
import { publishEvent } from "@cdc-ats/nats-client";
import { prisma } from "../lib/prisma.js";

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
