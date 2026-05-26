/**
 * Public auth routes — login, register-company saga, me, logout.
 * These compose calls across identity-service + tenant-service.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors } from "@cdc-ats/common";
import { LoginInputSchema, TenantPlanSchema } from "@cdc-ats/contracts";
import { callService } from "../lib/service-client.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { gatewayAuth } from "../lib/auth-middleware.js";

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env["NODE_ENV"] === "production",
  sameSite: "lax" as const,
  path: "/",
};

// ─── POST /api/auth/login ────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginInputSchema.parse(req.body);

    // 1. Verify credentials with identity-service
    const user = await callService<{
      id: string; tenantId: string; email: string; firstName: string; lastName: string; role: string;
    }>("identity", {
      method: "POST",
      path: "/internal/users/verify-credentials",
      body,
    });

    // 2. Issue tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role as any,
    });
    const refreshToken = await signRefreshToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role as any,
    });

    res.cookie("ats-token", accessToken, { ...COOKIE_OPTS, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("ats-refresh", refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

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

// ─── POST /api/auth/refresh ──────────────────────────────────────────────
router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw =
      ((req as any).cookies?.["ats-refresh"] as string | undefined) ??
      (req.body?.refreshToken as string | undefined);
    if (!raw) throw Errors.unauthorized("Refresh token required");

    const payload = await verifyRefreshToken(raw);
    // Confirm user still active
    const user = await callService<{ id: string; tenantId: string; email: string; role: string; isActive: boolean }>(
      "identity",
      { method: "GET", path: `/internal/users/${payload.sub}` }
    );
    if (!user.isActive) throw Errors.unauthorized("User deactivated");

    const accessToken = await signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role as any,
    });
    res.cookie("ats-token", accessToken, { ...COOKIE_OPTS, maxAge: 24 * 60 * 60 * 1000 });
    ok(res, {
      token: accessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("ats-token", COOKIE_OPTS);
  res.clearCookie("ats-refresh", COOKIE_OPTS);
  ok(res, { message: "Logged out" });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────
// Composes user (identity-service) + tenant (tenant-service) for frontend.
router.get("/me", gatewayAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();

    // Fetch user + tenant in parallel — both are independent reads
    const [user, tenant] = await Promise.all([
      callService<{
        id: string; tenantId: string; email: string; firstName: string; lastName: string; role: string;
        isActive: boolean; lastLoginAt: string | null;
      }>("identity", { method: "GET", path: `/internal/users/${req.user.id}` }),
      callService<{
        id: string; name: string; slug: string; plan: string; status: string;
        trialEndsAt: string | null; logoUrl: string | null;
      }>("tenant", { method: "GET", path: `/internal/tenants/${req.user.tenantId}` }),
    ]);

    ok(res, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      tenantId: user.tenantId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        trialEndsAt: tenant.trialEndsAt,
        logoUrl: tenant.logoUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/register-company ─────────────────────────────────────
// SAGA: create Tenant → create User → if user fails, rollback Tenant.
const RegisterCompanySchema = z.object({
  orgName: z.string().min(2).max(100),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  plan: TenantPlanSchema.default("FREE"),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

function slugify(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
    "-" + Date.now().toString(36)
  );
}

router.post("/register-company", async (req: Request, res: Response, next: NextFunction) => {
  let createdTenantId: string | null = null;
  try {
    const body = RegisterCompanySchema.parse(req.body);
    const slug = slugify(body.orgName);

    // Step 1 — create tenant
    const tenant = await callService<{
      id: string; name: string; slug: string; plan: string; status: string; trialEndsAt: string | null;
    }>("tenant", {
      method: "POST",
      path: "/internal/tenants",
      body: {
        name: body.orgName,
        slug,
        plan: body.plan,
        industry: body.industry,
        companySize: body.companySize,
        website: body.website || undefined,
      },
    });
    createdTenantId = tenant.id;

    // Step 2 — create user (admin) for this tenant
    let user: { id: string; email: string; firstName: string; lastName: string; role: string; tenantId: string };
    try {
      user = await callService<typeof user>("identity", {
        method: "POST",
        path: "/internal/users",
        body: {
          tenantId: tenant.id,
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
          password: body.password,
          role: "ADMIN",
        },
      });
    } catch (err) {
      // ROLLBACK: user creation failed, undo tenant
      if (createdTenantId) {
        await callService("tenant", {
          method: "DELETE",
          path: `/internal/tenants/${createdTenantId}`,
        }).catch(() => { /* best-effort */ });
      }
      throw err;
    }

    // Step 3 — issue tokens
    const accessToken = await signAccessToken({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: "ADMIN",
    });
    const refreshToken = await signRefreshToken({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      role: "ADMIN",
    });

    res.cookie("ats-token", accessToken, { ...COOKIE_OPTS, maxAge: 24 * 60 * 60 * 1000 });
    res.cookie("ats-refresh", refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    created(res, {
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      tenant,
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

export default router;
