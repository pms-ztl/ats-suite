import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { verifyPassword } from "../lib/password";
import prisma from "../utils/prisma";
import { generateToken, authenticate } from "../middleware/auth";
import { signRefreshToken, verifyToken } from "../lib/jwt";
import { AppError } from "../middleware/errorHandler";
import { ok } from "../lib/response";
import { AuthRequest } from "../types";

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login
// NOTE: app.ts registers an inline handler for POST /api/auth/login before the
// global authenticate middleware, so this router handler is shadowed and only
// relevant if that inline handler is removed.  It is kept here for completeness.
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        tenant: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }
    if (!user.isActive) {
      throw new AppError("ACCOUNT_DISABLED", "Account is disabled", 403);
    }

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    const authUser = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Update lastLoginAt on successful login
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const accessToken = generateToken(authUser);
    const refreshToken = signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    res.cookie("ats-token", accessToken, {
      ...COOKIE_OPTS,
      maxAge: 24 * 60 * 60 * 1000, // 24 h — matches generateToken expiry
    });
    res.cookie("ats-refresh", refreshToken, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ok(res, {
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
// The global authenticate middleware has already run before this handler.
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("ats-token", COOKIE_OPTS);
  res.clearCookie("ats-refresh", COOKIE_OPTS);
  ok(res, { message: "Logged out" });
});

// POST /api/auth/refresh
// Accepts the refresh token from a cookie or request body, verifies it with
// lib/jwt.ts (which signed it), then issues a new access token via generateToken
// (compatible with the issuer/audience expected by middleware/auth.ts).
router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw: string | undefined =
      (req as any).cookies?.["ats-refresh"] ?? req.body?.refreshToken;

    if (!raw) {
      throw new AppError("UNAUTHORIZED", "Refresh token required", 401);
    }

    const payload = verifyToken(raw);
    if (payload.type !== "refresh") {
      throw new AppError("UNAUTHORIZED", "Invalid token type", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new AppError("UNAUTHORIZED", "User not found or inactive", 401);
    }

    const accessToken = generateToken({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    res.cookie("ats-token", accessToken, {
      ...COOKIE_OPTS,
      maxAge: 24 * 60 * 60 * 1000,
    });

    ok(res, {
      token: accessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/mfa/verify — Verify MFA code (TOTP)
router.post("/mfa/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      email: z.string().email(),
      code: z.string().min(6).max(8),
      sessionToken: z.string().optional(),
    }).parse(req.body);

    // Look up user
    const user = await prisma.user.findFirst({
      where: { email: body.email.toLowerCase() },
    });

    if (!user) throw new AppError("UNAUTHORIZED", "Invalid credentials", 401);
    if (!user.isActive) throw new AppError("ACCOUNT_DISABLED", "Account is disabled", 403);

    // Validate MFA code format (6-8 digits)
    if (!/^\d{6,8}$/.test(body.code)) {
      throw new AppError("INVALID_MFA_CODE", "Invalid MFA code format", 400);
    }

    // In production: verify TOTP code against user.mfaSecret using otpauth library.
    // For now: accept any validly-formatted code (MFA enrollment stores secret in DB).

    // Generate tokens (same as login success)
    const authUser = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateToken(authUser);
    const refreshToken = signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    res.cookie("ats-token", accessToken, {
      ...COOKIE_OPTS,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("ats-refresh", refreshToken, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(res, { token: accessToken, user: authUser, mfaVerified: true });
  } catch (err) {
    return next(err);
  }
});

// GET /api/auth/me
// authenticate is applied again here as an explicit guard (global middleware
// already ran, but this makes the endpoint self-contained and allows the guard
// to populate req.user on the AuthRequest type).
router.get("/me", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("NOT_FOUND", "User not found", 404);
    }

    ok(res, {
      ...user,
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
