/**
 * Internal user routes — called only by api-gateway over the cluster network.
 * Routes ALL require the X-Internal-Service token header to be set (defense
 * in depth — see readAuthHeaders in app.ts).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { ok, created, Errors, getTenantId } from "@cdc-ats/common";
import { CreateUserInputSchema, LoginInputSchema, UserRoleSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";
import { PLAN_LIMITS, canAddSeats, isUnlimited } from "../lib/plan-limits.js";

const router = Router();

// ─── POST /internal/users/verify-credentials ──────────────────────────────
// Called by gateway during /api/auth/login. Returns user record on match,
// 401 on mismatch / inactive.
router.post("/verify-credentials", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginInputSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { email: body.email.toLowerCase() },
    });
    if (!user) throw Errors.unauthorized("Invalid email or password");
    if (!user.isActive) throw Errors.forbidden("Account disabled");

    const valid = await argon2.verify(user.passwordHash, body.password);
    if (!valid) throw Errors.unauthorized("Invalid email or password");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    ok(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/users — create user (called by register-company saga) ─
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateUserInputSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { tenantId: body.tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw Errors.conflict("User with this email already exists in this tenant");

    const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });
    const user = await prisma.user.create({
      data: {
        tenantId: body.tenantId,
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        isActive: true,
      },
    });

    created(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/seats?tenantId=&plan= ────────────────────────────
// Gateway calls this when sidebar needs the current seat count.
// `plan` query param avoids a cross-service call to tenant-service.
router.get("/seats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query["tenantId"] as string | undefined;
    const plan = (req.query["plan"] as string | undefined) ?? "FREE";
    if (!tenantId) throw Errors.validation("tenantId query param is required");

    const used = await prisma.user.count({ where: { tenantId, isActive: true } });
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS["FREE"]!;
    const limit = limits.seats;
    ok(res, {
      plan,
      used,
      limit,
      unlimited: isUnlimited(limit),
      remaining: isUnlimited(limit) ? null : Math.max(0, limit - used),
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/users/invite ─────────────────────────────────────────
// Body: { tenantId, plan, email, firstName, lastName, role, invitedByUserId }
const InviteSchema = z.object({
  tenantId: z.string().uuid(),
  plan: z.string().default("FREE"),
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  role: UserRoleSchema,
  invitedByUserId: z.string().uuid(),
});

router.post("/invite", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = InviteSchema.parse(req.body);

    // Seat-limit gate (Phase 1 reads plan from request body; Phase 2 calls billing-service)
    const used = await prisma.user.count({
      where: { tenantId: body.tenantId, isActive: true },
    });
    if (!canAddSeats(body.plan, used, 1)) {
      const limit = PLAN_LIMITS[body.plan]?.seats ?? 0;
      throw Errors.planLimit(
        `Plan ${body.plan} allows max ${limit} seats. You have ${used}. Upgrade to invite more.`
      );
    }

    const existing = await prisma.user.findFirst({
      where: { tenantId: body.tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw Errors.conflict("User with this email already exists in this tenant");

    // Create user with temporary password (will need to be reset on first login;
    // proper invite-link flow is a Phase 1.5 follow-up)
    const tempPassword = Math.random().toString(36).slice(2, 14);
    const passwordHash = await argon2.hash(tempPassword, { type: argon2.argon2id });
    const user = await prisma.user.create({
      data: {
        tenantId: body.tenantId,
        email: body.email.toLowerCase(),
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        passwordHash,
        isActive: true,
      },
    });

    await prisma.auditEvent.create({
      data: {
        tenantId: body.tenantId,
        actorUserId: body.invitedByUserId,
        action: "USER_INVITED",
        resourceType: "User",
        resourceId: user.id,
        metadata: { email: body.email, role: body.role },
      },
    }).catch(() => { /* non-fatal */ });

    created(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      tempPassword,    // returned to gateway so it can be emailed; never logged
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/:id ─────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Errors.notFound("User");

    ok(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users?tenantId= ─────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query["tenantId"] as string | undefined;
    if (!tenantId) throw Errors.validation("tenantId query param is required");

    const users = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
    });
    ok(res, users.map((u: typeof users[number]) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      isActive: u.isActive,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /internal/users/:id — saga compensation ───────────────────────
// Called by gateway register-company saga IF tenant-service fails after user
// was already created. Should be very rare; logs prominently for debugging.
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    await prisma.user.delete({ where: { id } }).catch(() => { /* already gone */ });
    ok(res, { deleted: id });
  } catch (err) {
    next(err);
  }
});

export default router;
