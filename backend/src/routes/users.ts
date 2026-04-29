import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { z } from "zod";
import { requireAuth, requireRole, getTenantId } from "../middleware/auth";
import { AppError } from "../middleware/errorHandler";
import { prisma } from "../utils/prisma";
import { ok, created } from "../lib/response";

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; tenantId: string; firstName: string; lastName: string };
}

const router = Router();
router.use(requireAuth);

// GET /api/users/profile — Get authenticated user profile
router.get("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) throw new AppError("NOT_FOUND", "User not found", 404);

    return ok(res, {
      ...user,
      name: `${user.firstName} ${user.lastName}`.trim(),
    });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/users/profile — Update authenticated user profile
const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  timezone: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  // Notification preferences
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
}).strict();

router.patch("/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const body = UpdateProfileSchema.parse(req.body);

    // Extract user-updatable fields
    const { firstName, lastName, ...metadata } = body;

    const updatedUser = await prisma.user.update({
      where: { id: authReq.user.id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return ok(res, {
      ...updatedUser,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
      message: "Profile updated successfully",
    });
  } catch (err) {
    return next(err);
  }
});

// GET /api/users — List users (admin only, for team management)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(res, users);
  } catch (err) {
    return next(err);
  }
});

// POST /api/users/invite — Invite a new team member (ADMIN only)
const InviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"]),
});

router.post("/invite", requireRole("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = InviteSchema.parse(req.body);

    // Check for existing user within tenant
    const existing = await prisma.user.findFirst({
      where: { tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw new AppError("CONFLICT", "User with this email already exists", 409);

    // Create user with temporary password (they'll reset on first login)
    const { hashPassword } = await import("../lib/password");
    const tempPassword = crypto.randomUUID().slice(0, 12);
    const passwordHash = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: body.email.toLowerCase(),
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        passwordHash,
        isActive: true,
      },
    });

    // Audit trail (fire-and-forget)
    await prisma.auditTrailEntry.create({
      data: {
        tenantId,
        action: "USER_INVITED",
        resourceType: "User",
        resourceId: user.id,
        actorId: (req as AuthRequest).user?.id || null,
        actorType: "USER",
        after: { email: body.email, role: body.role },
      },
    }).catch(() => {});

    return created(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/users/:id/role — Change user role (ADMIN only)
router.patch("/:id/role", requireRole("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { role } = z
      .object({ role: z.enum(["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"]) })
      .parse(req.body);

    const user = await prisma.user.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!user) throw new AppError("NOT_FOUND", "User not found", 404);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });

    return ok(res, updated);
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/users/:id/deactivate — Deactivate user (ADMIN only)
router.patch("/:id/deactivate", requireRole("ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const user = await prisma.user.findFirst({
      where: { id: req.params.id as string, tenantId },
    });
    if (!user) throw new AppError("NOT_FOUND", "User not found", 404);

    // Don't let admin deactivate themselves
    if (user.id === (req as AuthRequest).user?.id) {
      throw new AppError("FORBIDDEN", "Cannot deactivate yourself", 403);
    }

    await prisma.user.update({ where: { id: user.id }, data: { isActive: false } });
    return ok(res, { deactivated: true, userId: user.id });
  } catch (err) {
    return next(err);
  }
});

export default router;
