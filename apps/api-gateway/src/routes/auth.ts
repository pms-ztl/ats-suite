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
        isActive: boolean; lastLoginAt: string | null; emailVerified?: boolean;
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
      // Phase 31b — exposed so the dashboard can show a "Confirm your email"
      // banner. Defaults to true for users created before the migration so
      // we don't retroactively annoy anyone.
      emailVerified: user.emailVerified ?? true,
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

    // Step 3 — request + email an email-verification link. Best-effort —
    // if it fails, registration still completes; the user can request a
    // resend later. We don't block the signup on email delivery (Stripe
    // does the same for their account creation).
    try {
      const v = await callService<{
        sent: boolean; verifyToken?: string; userEmail?: string; userFirstName?: string;
      }>("identity", {
        method: "POST",
        path: "/internal/auth/request-email-verification",
        body: { userId: user.id },
      });
      if (v?.sent && v.verifyToken && v.userEmail) {
        const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";
        const verifyUrl = `${appUrl}/verify-email?token=${v.verifyToken}`;
        await callService("notification", {
          method: "POST",
          path: "/internal/notifications/system",
          userHeaders: { userId: "system", tenantId: tenant.id, role: "SUPER_ADMIN", email: "system@cdc-ats.local" },
          body: {
            tenantId: tenant.id,
            userId: user.id,
            type: "SYSTEM",
            title: "Confirm your email to finish signing up",
            body: `Hi ${v.userFirstName ?? "there"},\n\nThanks for signing up with CDC ATS! Please confirm your email so we know we've got the right one:\n\n${verifyUrl}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
            link: verifyUrl,
            channels: ["email"],
          },
        }).catch(() => undefined);
      }
    } catch { /* non-fatal */ }

    // Step 4 — issue tokens
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

// ─── POST /api/auth/forgot-password ───────────────────────────────────────
// Always 200 — never reveals whether the email exists. When it does, the
// identity-service returns a reset token + user details; we email the user
// directly via notification-service.
const ForgotSchema = z.object({ email: z.string().email() });
router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ForgotSchema.parse(req.body);
    const result = await callService<{
      sent: boolean;
      resetToken?: string;
      userId?: string;
      userEmail?: string;
      userFirstName?: string;
    }>("identity", {
      method: "POST",
      path: "/internal/auth/forgot-password",
      body: { email: body.email },
    });
    // If a real user was matched, send the email via notification-service
    if (result.resetToken && result.userEmail) {
      const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${result.resetToken}`;
      try {
        // Notification-service exposes a generic send-email path; fall back
        // to a direct SMTP call would require more plumbing. For simplicity
        // we POST a notification with channels:[email] which gets delivered
        // by the existing BullMQ worker.
        await callService("notification", {
          method: "POST",
          path: "/internal/notifications/system",
          // Synthetic system headers — this endpoint is internal-only and
          // accepts the platform-system actor identity.
          userHeaders: {
            userId: "system",
            tenantId: "00000000-0000-0000-0000-000000000000",
            role: "SUPER_ADMIN",
            email: "system@cdc-ats.local",
          },
          body: {
            tenantId: null,                 // platform-wide path; emit looks up by userId
            userId: result.userId,
            type: "SYSTEM",
            title: "Reset your CDC ATS password",
            body: `Hi ${result.userFirstName ?? "there"}, click the link below to set a new password. The link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't ask for this, ignore this email — your password won't change.`,
            link: resetUrl,
            channels: ["email"],
          },
        }).catch(() => {/* best effort — never leak the error */});
      } catch { /* swallow */ }
    }
    ok(res, { sent: true });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/reset-password ────────────────────────────────────────
const ResetSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(12).max(200),
});
router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ResetSchema.parse(req.body);
    const result = await callService<{ reset: boolean }>("identity", {
      method: "POST",
      path: "/internal/auth/reset-password",
      body,
    });
    ok(res, result);
  } catch (err) { next(err); }
});

// ─── POST /api/auth/resend-verification ───────────────────────────────────
// Phase 31b — authenticated. Lets the signed-in user re-request a verify
// email if they lost the original (e.g. spam folder). Rate-limited to
// 1 per minute by trivially using the upsert pattern in identity-service
// (existing pending tokens get expired before a new one is issued).
router.post("/resend-verification", gatewayAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    const v = await callService<{
      sent: boolean; alreadyVerified?: boolean; verifyToken?: string; userEmail?: string; userFirstName?: string;
    }>("identity", {
      method: "POST",
      path: "/internal/auth/request-email-verification",
      body: { userId: req.user.id },
    });
    if (v.alreadyVerified) {
      return ok(res, { sent: false, alreadyVerified: true });
    }
    if (v.sent && v.verifyToken && v.userEmail) {
      const appUrl = process.env["APP_URL"] ?? "http://localhost:3000";
      const verifyUrl = `${appUrl}/verify-email?token=${v.verifyToken}`;
      await callService("notification", {
        method: "POST",
        path: "/internal/notifications/system",
        userHeaders: { userId: "system", tenantId: req.user.tenantId, role: "SUPER_ADMIN", email: "system@cdc-ats.local" },
        body: {
          tenantId: req.user.tenantId,
          userId: req.user.id,
          type: "SYSTEM",
          title: "Confirm your email",
          body: `Hi ${v.userFirstName ?? "there"},\n\nHere's a fresh confirmation link (the previous one is now invalid):\n\n${verifyUrl}\n\nThis link expires in 24 hours.`,
          link: verifyUrl,
          channels: ["email"],
        },
      }).catch(() => undefined);
    }
    ok(res, { sent: true });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/verify-email ──────────────────────────────────────────
// Phase 31b — public, token-gated. Called by the /verify-email page.
const VerifyEmailSchema = z.object({ token: z.string().uuid() });
router.post("/verify-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = VerifyEmailSchema.parse(req.body);
    const result = await callService<{ verified: boolean; userId: string; email: string }>("identity", {
      method: "POST",
      path: "/internal/auth/verify-email",
      body,
    });
    ok(res, result);
  } catch (err) { next(err); }
});

// ─── GET /api/auth/invite-info?token=... ──────────────────────────────────
// Phase 31a — public, token-gated. The /accept-invite page hits this to
// show "Hi Alex, you've been invited to Acme Corp as Recruiter" before
// asking for a password.
router.get("/invite-info", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query["token"];
    if (typeof token !== "string" || !token) {
      throw Errors.validation("token query param required");
    }
    const result = await callService<any>("identity", {
      method: "GET",
      path: `/internal/auth/invite-info?token=${encodeURIComponent(token)}`,
    });
    // Add tenantName so the UI can say "Welcome to Acme Corp" without a
    // second roundtrip.
    let tenantName: string | null = null;
    try {
      const t = await callService<any>("tenant", {
        method: "GET",
        path: `/internal/tenants/${result.tenantId}`,
      });
      tenantName = t?.name ?? null;
    } catch { /* leave null */ }
    ok(res, { ...result, tenantName });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/accept-invite ─────────────────────────────────────────
// Phase 31a — public, token-gated. Sets the user's password and auto-logs
// them in by signing a JWT + setting the ats-token cookie, same as the
// regular login flow.
const AcceptInviteSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(12).max(200),
});
router.post("/accept-invite", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = AcceptInviteSchema.parse(req.body);
    const result = await callService<{
      accepted: boolean;
      userId: string;
      email: string;
      tenantId: string;
      role: string;
    }>("identity", {
      method: "POST",
      path: "/internal/auth/accept-invite",
      body,
    });

    // Auto-login: sign a JWT identical to the regular login flow and set
    // the httpOnly cookie. The /accept-invite page then redirects to /.
    const { signAccessToken } = await import("../lib/jwt.js");
    const token = await signAccessToken({
      userId: result.userId,
      email: result.email,
      tenantId: result.tenantId,
      role: result.role as any,
    });
    res.cookie("ats-token", token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    ok(res, { accepted: true, accessToken: token, userId: result.userId });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/change-password ───────────────────────────────────────
const ChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(200),
});
router.post("/change-password", gatewayAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    const body = ChangeSchema.parse(req.body);
    const result = await callService<{ changed: boolean }>("identity", {
      method: "POST",
      path: "/internal/auth/change-password",
      userHeaders: {
        userId: req.user.id,
        tenantId: req.user.tenantId,
        role: req.user.role,
        email: req.user.email,
      },
      body,
    });
    ok(res, result);
  } catch (err) { next(err); }
});

// ─── POST /api/auth/mfa/{setup,verify,disable} ────────────────────────────
for (const action of ["setup", "verify", "disable"] as const) {
  router.post(`/mfa/${action}`, gatewayAuth(), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw Errors.unauthorized();
      const result = await callService<any>("identity", {
        method: "POST",
        path: `/internal/auth/mfa/${action}`,
        userHeaders: {
          userId: req.user.id,
          tenantId: req.user.tenantId,
          role: req.user.role,
          email: req.user.email,
        },
        body: req.body,
      });
      ok(res, result);
    } catch (err) { next(err); }
  });
}

// ─── Phase 28 — Enterprise SSO ───────────────────────────────────────────

/**
 * POST /api/auth/sso/discover — body { email } → { tenantId, protocol, initiateUrl } | null
 * Public. Used by login pages on email-blur.
 */
router.post("/sso/discover", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const result = await callService<{ tenantId: string; protocol: string; initiateUrl: string } | null>("identity", {
      method: "POST",
      path: "/internal/sso/discover",
      body,
    });
    ok(res, result);
  } catch (err) { next(err); }
});

/**
 * GET /api/auth/sso/{saml|oidc}/:tenantId/initiate — 302 to IdP
 * Public. We just proxy identity-service's 302 back to the browser.
 */
router.get("/sso/:protocol/:tenantId/initiate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const protocol = req.params["protocol"];
    if (protocol !== "saml" && protocol !== "oidc") throw Errors.notFound("protocol");
    // We can't use callService here because it doesn't handle 302 redirects.
    // Just construct the identity-service URL and 307-redirect the browser
    // there; identity-service will then 302 to the IdP.
    const identityUrl = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
    res.redirect(307, `${identityUrl}/internal/sso/${protocol}/${req.params["tenantId"]}/initiate`);
  } catch (err) { next(err); }
});

/**
 * POST /api/auth/sso/saml/:tenantId/callback — receive IdP SAML POST
 * Public. After identity-service validates the assertion, we sign a JWT
 * + set the httpOnly cookie + redirect to /sso-callback (which redirects
 * to / via the role dispatcher).
 */
router.post("/sso/saml/:tenantId/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.params["tenantId"]!;
    const result = await callService<{
      mode?: "test";
      assertion?: unknown;
      user?: { id: string; tenantId: string; email: string; role: string; firstName?: string };
      externalId?: string;
      jitCreated?: boolean;
    }>("identity", {
      method: "POST",
      path: `/internal/sso/saml/${tenantId}/callback`,
      body: req.body,
      headers: { "x-forwarded-for": req.ip ?? "", "user-agent": req.get("user-agent") ?? "" },
    });
    if (result.mode === "test") {
      // DRAFT mode — show the parsed assertion in JSON for the tenant admin.
      return ok(res, result);
    }
    if (!result.user) throw Errors.unauthorized("SSO callback returned no user");
    const accessToken = await signAccessToken({
      userId: result.user.id, tenantId: result.user.tenantId,
      email: result.user.email, role: result.user.role as any,
    });
    res.cookie("ats-token", accessToken, { ...COOKIE_OPTS, maxAge: 24 * 60 * 60 * 1000 });
    // Phase 31a — send welcome email for JIT-provisioned users.
    if (result.jitCreated) sendSsoWelcomeEmail(result.user).catch(() => undefined);
    res.redirect(302, "/sso-callback");
  } catch (err) { next(err); }
});

// Phase 31a — best-effort welcome email for a newly JIT-provisioned SSO user.
// Fire-and-forget — failure must not break the login redirect.
async function sendSsoWelcomeEmail(user: { id: string; tenantId: string; email: string; role: string; firstName?: string }) {
  let tenantName = "your team";
  try {
    const t = await callService<any>("tenant", { method: "GET", path: `/internal/tenants/${user.tenantId}` });
    tenantName = t?.name ?? tenantName;
  } catch { /* ignore */ }
  await callService("notification", {
    method: "POST",
    path: "/internal/notifications/system",
    userHeaders: { userId: "system", tenantId: user.tenantId, role: "SUPER_ADMIN", email: "system@cdc-ats.local" },
    body: {
      tenantId: user.tenantId,
      userId: user.id,
      type: "SYSTEM",
      title: `Welcome to ${tenantName} on CDC ATS`,
      body: `Hi ${user.firstName ?? "there"},\n\nYour account was just created via Single Sign-On. You're set up as ${user.role}.\n\nYou can sign in any time at ${process.env["APP_URL"] ?? "your CDC ATS workspace"} using your organization's identity provider.`,
      channels: ["email"],
    },
  }).catch(() => undefined);
}

/**
 * GET /api/auth/sso/oidc/:tenantId/callback — receive IdP OIDC redirect
 * Same JWT + cookie + redirect flow as SAML.
 */
router.get("/sso/oidc/:tenantId/callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.params["tenantId"]!;
    // Pass through the query params (code, state) as a query string
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === "string") qs.set(k, v);
    }
    const result = await callService<{
      mode?: "test";
      assertion?: unknown;
      user?: { id: string; tenantId: string; email: string; role: string; firstName?: string };
      externalId?: string;
      jitCreated?: boolean;
    }>("identity", {
      method: "GET",
      path: `/internal/sso/oidc/${tenantId}/callback?${qs.toString()}`,
      headers: { "x-forwarded-for": req.ip ?? "", "user-agent": req.get("user-agent") ?? "" },
    });
    if (result.mode === "test") return ok(res, result);
    if (!result.user) throw Errors.unauthorized("SSO callback returned no user");
    const accessToken = await signAccessToken({
      userId: result.user.id, tenantId: result.user.tenantId,
      email: result.user.email, role: result.user.role as any,
    });
    res.cookie("ats-token", accessToken, { ...COOKIE_OPTS, maxAge: 24 * 60 * 60 * 1000 });
    // Phase 31a — welcome email for JIT-provisioned OIDC users.
    if (result.jitCreated) sendSsoWelcomeEmail(result.user).catch(() => undefined);
    res.redirect(302, "/sso-callback");
  } catch (err) { next(err); }
});

export default router;
