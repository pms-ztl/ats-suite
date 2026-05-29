/**
 * Internal user routes — called only by api-gateway over the cluster network.
 * Routes ALL require the X-Internal-Service token header to be set (defense
 * in depth — see readAuthHeaders in app.ts).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { ok, created, Errors, getTenantId, requireRole, requireTenantAdmin } from "@cdc-ats/common";
import { CreateUserInputSchema, LoginInputSchema, UserRoleSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";
import { PLAN_LIMITS, canAddSeats, isUnlimited } from "../lib/plan-limits.js";

const router = Router();

// ─── POST /internal/users/verify-credentials ──────────────────────────────
// Called by gateway during /api/auth/login. Returns user record on match,
// 401 on mismatch / inactive.
// NOTE: intentionally NOT requireRole-guarded — this endpoint is what
// CREATES the role context (verifies credentials, returns user info so
// gateway can sign a JWT). No JWT exists at this moment. Trusted via
// network policy (only gateway can reach it).
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
// NOTE: intentionally NOT requireRole-guarded — saga path runs BEFORE the
// new tenant admin has a JWT. Same trust model as POST /internal/tenants.
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

// Phase 27 F-028-micro-P0: only tenant admins can invite users.
// Phase 31a — closes the "invited users can never log in" gap.
//
// Old behaviour (broken): created user with a random tempPassword, returned
// it in the response body, and... never emailed it. User was permanently
// stuck unable to log in.
//
// New behaviour: create user with an UNGUESSABLE placeholder password +
// create an InviteToken (7-day expiry). Gateway emails an /accept-invite
// link via notification-service. User sets their real password through
// the accept flow, which marks the token used and overwrites passwordHash.
router.post("/invite", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
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

    // 256 bits of entropy → user cannot guess it, so password-login is
    // effectively disabled until /accept-invite overwrites passwordHash.
    const { randomBytes } = await import("crypto");
    const placeholder = randomBytes(32).toString("base64");
    const passwordHash = await argon2.hash(placeholder, { type: argon2.argon2id });

    // Create user + invite token in a single transaction so a partial
    // failure never leaves a stranded user without a way to accept.
    const { user, invite } = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
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
      const inv = await tx.inviteToken.create({
        data: {
          tenantId: body.tenantId,
          email: u.email,
          role: body.role,
          invitedByUserId: body.invitedByUserId,
          // 7 days — invites sit in inboxes longer than password resets.
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return { user: u, invite: inv };
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
      // Returned so the gateway can compose the accept-invite URL and
      // hand it to notification-service. Internal-only — never exposed
      // via /api/users/:id GET.
      inviteToken: invite.token,
      inviteExpiresAt: invite.expiresAt.toISOString(),
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
      // Phase 31b — exposed via /auth/me so dashboard can show a confirm banner.
      emailVerified: (user as any).emailVerified ?? true,
      emailVerifiedAt: (user as any).emailVerifiedAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users?tenantId=... OR ?role=SUPER_ADMIN ───────────────
// Either filter is required. `?role=SUPER_ADMIN` returns all super-admins
// across the platform — used by notification-service to fan out platform
// notifications via email/Slack.
// Phase 27 F-028-micro-P0: ADMIN+ only. notification-service calls this
// with synthetic SUPER_ADMIN role; tenant admins call with their tenantId.
// Tier-3 staff have no business listing users.
router.get("/", requireRole("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query["tenantId"] as string | undefined;
    const role = req.query["role"] as string | undefined;
    if (!tenantId && !role) {
      throw Errors.validation("tenantId or role query param is required");
    }

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 1000,
    });
    ok(res, users.map((u: typeof users[number]) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      tenantId: u.tenantId,
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
// NOTE: intentionally NOT requireRole-guarded — saga path runs during
// register-company rollback when no JWT exists. Trusted via network policy.
// F-027-micro-c (LOW): plain delete-by-id is acceptable here because the
// saga's contract guarantees we're deleting the user we just created in
// this same saga; no cross-tenant scenario exists at this code path.
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    await prisma.user.delete({ where: { id } }).catch(() => { /* already gone */ });
    ok(res, { deleted: id });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /internal/users/:id/role ──────────────────────────────────────
// Change a tenant member's role. Tenant-admin only, tenant-scoped. Cannot
// touch SUPER_ADMIN, and an admin cannot demote themselves (avoid lockout).
const RoleSchema = z.object({
  role: z.enum(["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER"]),
});
router.patch("/:id/role", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorId = req.headers["x-user-id"] as string | undefined;
    const id = req.params["id"] as string;
    const { role } = RoleSchema.parse(req.body);
    if (id === actorId) throw Errors.validation("You cannot change your own role");
    const target = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!target) throw Errors.notFound("User");
    if (target.role === "SUPER_ADMIN") throw Errors.forbidden("Cannot change a super-admin's role");
    const updated = await prisma.user.update({ where: { id }, data: { role } });
    ok(res, { id: updated.id, role: updated.role });
  } catch (err) { next(err); }
});

// ── PATCH /internal/users/:id/deactivate ────────────────────────────────
// Soft-disable a member (cannot log in). Tenant-admin only, tenant-scoped;
// cannot deactivate yourself or a super-admin. Pass { reactivate: true } to undo.
router.patch("/:id/deactivate", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorId = req.headers["x-user-id"] as string | undefined;
    const id = req.params["id"] as string;
    if (id === actorId) throw Errors.validation("You cannot deactivate yourself");
    const target = await prisma.user.findFirst({ where: { id, tenantId } });
    if (!target) throw Errors.notFound("User");
    if (target.role === "SUPER_ADMIN") throw Errors.forbidden("Cannot deactivate a super-admin");
    const isActive = req.body?.reactivate === true;
    const updated = await prisma.user.update({ where: { id }, data: { isActive } });
    ok(res, { id: updated.id, isActive: updated.isActive });
  } catch (err) { next(err); }
});

export default router;
