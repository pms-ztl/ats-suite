/**
 * Internal-service auth middleware.
 *
 * The api-gateway validates the JWT and forwards user claims as HTTP headers:
 *   X-User-Id, X-Tenant-Id, X-User-Role, X-User-Email, X-Request-Id
 *
 * Backend services TRUST these headers (network policy restricts ingress to
 * the gateway). This middleware reads them onto req.user and rejects requests
 * that arrive without them (i.e., bypassed the gateway).
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../lib/error.js";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  // Phase 32a — when a SUPER_ADMIN is impersonating, `id` becomes the
  // impersonated user (so scoping works transparently) and `actorUserId`
  // is the super-admin actually driving the session. Backend services
  // use this for audit ("acted by SUPER_ADMIN X on behalf of USER Y").
  actorUserId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthHeadersOptions {
  /** If true, missing headers are NOT an error (used by public endpoints). */
  optional?: boolean;
  /** If set, request must have this header (used internally by gateway proxy). */
  requireServiceTokenHeader?: { name: string; value: string };
}

export function readAuthHeaders(opts: AuthHeadersOptions = {}): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    // Optional shared-secret check (defense in depth — beyond network policy)
    if (opts.requireServiceTokenHeader) {
      const sentValue = req.headers[opts.requireServiceTokenHeader.name.toLowerCase()];
      if (sentValue !== opts.requireServiceTokenHeader.value) {
        return next(new AppError("FORBIDDEN", "Invalid service token", 403));
      }
    }

    const userId = req.headers["x-user-id"] as string | undefined;
    const tenantId = req.headers["x-tenant-id"] as string | undefined;
    const role = req.headers["x-user-role"] as string | undefined;
    const email = req.headers["x-user-email"] as string | undefined;
    // Phase 32a — set by the gateway when the underlying JWT was signed
    // for an impersonation session. Header form so backends that don't
    // care about impersonation can ignore it.
    const actorUserId = req.headers["x-actor-user-id"] as string | undefined;

    if (!userId || !tenantId || !role) {
      if (opts.optional) return next();
      return next(new AppError("UNAUTHORIZED", "Missing auth headers (request did not pass through gateway)", 401));
    }

    req.user = { id: userId, tenantId, role, email: email ?? "", ...(actorUserId ? { actorUserId } : {}) };
    next();
  };
}

export function requireRole(...roles: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError("UNAUTHORIZED", "Authentication required", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("FORBIDDEN", `Role '${req.user.role}' not allowed. Required: ${roles.join(", ")}`, 403));
    }
    next();
  };
}

export const requireSuperAdmin = requireRole("SUPER_ADMIN");
export const requireTenantAdmin = requireRole("ADMIN");
export const requireTenantUser = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER");

export function getTenantId(req: Request): string {
  if (!req.user?.tenantId) throw new AppError("FORBIDDEN", "Tenant context required", 403);
  return req.user.tenantId;
}

export function getUserId(req: Request): string {
  if (!req.user?.id) throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  return req.user.id;
}
