/**
 * Phase 32a — Super-admin impersonation.
 *
 * Customer support workflow: when a tenant admin reports "X is broken on
 * my account", the super-admin clicks "Impersonate" in /admin and gets a
 * 1-hour session as that tenant's admin. The dashboard renders exactly
 * what the customer sees. Every action taken during impersonation is
 * audited with BOTH the actor (super-admin) and subject (impersonated user).
 *
 * Routes (all gateway-mounted under /api/super-admin/impersonate):
 *   POST /:tenantId/start  →  switch the cookie to an impersonation JWT
 *   POST /stop             →  switch back to the super-admin's own session
 *
 * Security:
 *   - Impersonation JWT TTL is hard-capped at 1h (see jwt.ts)
 *   - actorUserId is embedded so we can never lose track of who's really driving
 *   - stop endpoint reads actorUserId from the current JWT — you can't "stop
 *     impersonating" into someone you weren't really
 *   - Every start + stop writes a row to AuditEvent (in identity-service)
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { Errors, ok } from "@cdc-ats/common";
import { signAccessToken, verifyAccessToken } from "../lib/jwt.js";
import { callService } from "../lib/service-client.js";

const router = Router();

// Cookie options must match the login flow exactly or the browser
// won't overwrite the existing cookie.
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "lax" as const,
  path: "/",
};

// ─── POST /api/super-admin/impersonate/:tenantId/start ────────────────────
// Body (optional): { userId } — pick a specific user inside the tenant.
// Default: the tenant's first ADMIN.
router.post("/:tenantId/start", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    if (req.user.role !== "SUPER_ADMIN") throw Errors.forbidden("Only SUPER_ADMIN can impersonate");
    if (req.user.actorUserId) {
      // Defense in depth — refuse nested impersonation. The super-admin must
      // stop impersonating first, then start a fresh session. Prevents
      // "impersonate A → impersonate B → forget you're A" confusion.
      throw Errors.conflict("Already impersonating; stop first before starting another");
    }

    const tenantIdParam = req.params["tenantId"];
    if (typeof tenantIdParam !== "string") throw Errors.validation("tenantId required");
    const tenantId = tenantIdParam;
    const body = z.object({ userId: z.string().uuid().optional() }).parse(req.body ?? {});

    // Forward the super-admin's identity on the internal lookups below. The
    // user-list endpoint is requireRole("SUPER_ADMIN","ADMIN"); without these
    // headers identity sees no req.user and returns 401 (which previously made
    // every impersonation start fail). The SUPER_ADMIN role is also what lets
    // the cross-tenant ?tenantId= query through identity's tenant-scoping.
    const uh = {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      role: req.user.role,
      email: req.user.email,
    };

    // Verify the tenant exists. We hit tenant-service rather than trusting
    // the URL — a typo in the URL shouldn't silently sign a JWT for a
    // non-existent tenant.
    const tenant = await callService<{ id: string; name: string; status: string }>("tenant", {
      method: "GET",
      path: `/internal/tenants/${tenantId}`,
      userHeaders: uh,
    });

    // Pick the target user: explicit userId from the body, or the tenant's
    // first ADMIN. If neither exists, fail loudly — there's no one to
    // impersonate.
    let target: { id: string; email: string; role: string };
    if (body.userId) {
      const u = await callService<any>("identity", {
        method: "GET",
        path: `/internal/users/${body.userId}`,
        userHeaders: uh,
      });
      if (u.tenantId !== tenantId) throw Errors.validation("User does not belong to that tenant");
      target = { id: u.id, email: u.email, role: u.role };
    } else {
      const list = await callService<{ data: any[] }>("identity", {
        method: "GET",
        path: `/internal/users?tenantId=${tenantId}&role=ADMIN`,
        userHeaders: uh,
      });
      const first = (list.data ?? (list as any))[0];
      if (!first) throw Errors.notFound(`No ADMIN found for tenant ${tenant.name}`);
      target = { id: first.id, email: first.email, role: first.role };
    }

    // Sign the impersonation JWT. signAccessToken auto-shortens TTL to 1h
    // when actorUserId is present.
    const token = await signAccessToken({
      userId: target.id,
      tenantId,
      email: target.email,
      role: target.role as any,
      actorUserId: req.user.id,
    });
    res.cookie("ats-token", token, { ...COOKIE_OPTS, maxAge: 60 * 60 * 1000 });

    // Audit. Best-effort — if the audit write fails the impersonation
    // still works (we'd rather have a working support session and a
    // missing audit row than the inverse).
    await writeAudit({
      tenantId,
      actorUserId: req.user.id,
      action: "IMPERSONATION_STARTED",
      resourceType: "User",
      resourceId: target.id,
      metadata: {
        actorEmail: req.user.email,
        targetEmail: target.email,
        targetRole: target.role,
        tenantName: tenant.name,
      },
      ipAddress: req.ip,
    });

    ok(res, {
      impersonating: true,
      target: { userId: target.id, email: target.email, role: target.role, tenantId, tenantName: tenant.name },
      actor: { userId: req.user.id, email: req.user.email },
      expiresIn: 60 * 60,
    });
  } catch (err) { next(err); }
});

// ─── POST /api/super-admin/impersonate/stop ────────────────────────────────
// Reads actorUserId from the current cookie, signs a fresh super-admin
// JWT, and writes the audit row.
router.post("/stop", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    if (!req.user.actorUserId) {
      // Not currently impersonating — nothing to stop. Could be a frontend
      // bug or a stale tab. Return success so the FE clears its banner.
      return ok(res, { impersonating: false, alreadyStopped: true });
    }

    const actor = await callService<any>("identity", {
      method: "GET",
      path: `/internal/users/${req.user.actorUserId}`,
    });

    // Sign a fresh JWT for the actor — back to their own identity, normal TTL.
    const token = await signAccessToken({
      userId: actor.id,
      tenantId: actor.tenantId,
      email: actor.email,
      role: actor.role,
    });
    res.cookie("ats-token", token, { ...COOKIE_OPTS, maxAge: 24 * 60 * 60 * 1000 });

    await writeAudit({
      tenantId: req.user.tenantId,                  // the tenant they WERE in
      actorUserId: req.user.actorUserId,
      action: "IMPERSONATION_STOPPED",
      resourceType: "User",
      resourceId: req.user.id,
      metadata: {
        actorEmail: actor.email,
        targetEmail: req.user.email,
      },
      ipAddress: req.ip,
    });

    ok(res, { impersonating: false, actor: { userId: actor.id, email: actor.email } });
  } catch (err) { next(err); }
});

// ─── helpers ─────────────────────────────────────────────────────────────

async function writeAudit(input: {
  tenantId: string | null;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string | undefined;
}): Promise<void> {
  await callService("identity", {
    method: "POST",
    path: "/internal/audit",
    body: input,
  }).catch(() => undefined);
}

export default router;
