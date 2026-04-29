import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";
import { signAccessToken, verifyToken as _verifyToken } from "../lib/jwt";
import { AuthUser } from "../types";
import { setTenantContext } from "./prisma-rls";
import { prisma } from "../utils/prisma";

// Express Request is already augmented with user?: AuthUser in types/index.ts

// ── Backward-compat: generateToken used by app.ts login route ────────────────
export function generateToken(user: AuthUser): string {
  return signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });
}

// ── requireAuth ───────────────────────────────────────────────────────────────
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.["ats-token"] as string | undefined;

    const raw = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : cookieToken;

    if (!raw) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const payload = _verifyToken(raw);

    if (payload.type !== "access") {
      throw new AppError("UNAUTHORIZED", "Invalid token type", 401);
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      firstName: (payload as any).firstName ?? "",
      lastName: (payload as any).lastName ?? "",
    };

    // Set RLS tenant context so Postgres enforces row-level isolation
    if (req.user.tenantId) {
      try {
        await setTenantContext(prisma, req.user.tenantId);
      } catch {
        // RLS context setting is best-effort; app-layer filtering still applies
      }
    }

    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
  }
}

// ── Backward-compat alias: app.ts uses `authenticate` ────────────────────────
export const authenticate = requireAuth;

// ── requireRole ───────────────────────────────────────────────────────────────
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user)
      return next(new AppError("UNAUTHORIZED", "Authentication required", 401));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "FORBIDDEN",
          `Role '${req.user.role}' is not allowed. Required: ${roles.join(", ")}`,
          403
        )
      );
    }
    next();
  };
}

// Backward-compat alias used by existing engine routes
export const authorize = requireRole;

// ── requireTenant ─────────────────────────────────────────────────────────────
export function requireTenant(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user?.tenantId) {
    return next(new AppError("FORBIDDEN", "Tenant context required", 403));
  }
  next();
}

// ── getTenantId ───────────────────────────────────────────────────────────────
// Helper to scope Prisma queries to the authenticated tenant
export function getTenantId(req: Request): string {
  if (!req.user?.tenantId)
    throw new AppError("FORBIDDEN", "Tenant context required", 403);
  return req.user.tenantId;
}
