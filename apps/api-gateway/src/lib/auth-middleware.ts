/**
 * Gateway auth middleware — verifies JWT from Authorization header or
 * cookie, attaches decoded claims as req.user, and forwards them as
 * X-* headers to downstream services via the proxy.
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "@cdc-ats/common";
import { verifyAccessToken } from "./jwt.js";

export function gatewayAuth(opts: { optional?: boolean } = {}): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const cookieToken = (req as any).cookies?.["ats-token"] as string | undefined;
      const raw = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : cookieToken;

      if (!raw) {
        if (opts.optional) return next();
        throw new AppError("UNAUTHORIZED", "Authentication required", 401);
      }

      const payload = await verifyAccessToken(raw);
      req.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
        email: payload.email,
        // Phase 32a — surface the impersonator for downstream auditing.
        ...(payload.actorUserId ? { actorUserId: payload.actorUserId } : {}),
      };
      next();
    } catch (err) {
      if (opts.optional) return next();
      if (err instanceof AppError) return next(err);
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    }
  };
}
