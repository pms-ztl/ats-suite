/**
 * Auth polish routes — forgot-password, password reset, password change,
 * MFA enrol / verify / disable.
 *
 * All routes are mounted under /internal/auth — gateway exposes them at
 * /api/auth/forgot-password, /api/auth/reset-password, /api/auth/change-password,
 * /api/auth/mfa/{setup,verify,disable}.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { ok, Errors, getUserId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// ── POST /internal/auth/forgot-password ────────────────────────────────────
// Always returns success (never reveals whether the email exists). When the
// email DOES exist + the user is active, we create a PasswordReset row.
// The gateway picks up the resetUrl from the response and emails it.
const ForgotSchema = z.object({ email: z.string().email() });

router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ForgotSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { email: body.email.toLowerCase(), isActive: true },
    });
    if (!user) {
      // Don't leak existence — return success regardless
      return ok(res, { sent: true });
    }
    // Invalidate any pending resets for this user
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },                // mark expired
    });
    const reset = await prisma.passwordReset.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });
    // Return enough info that the gateway can compose + send the email
    ok(res, {
      sent: true,
      // Internal-only fields below — gateway uses these to email user;
      // safe because this endpoint is only reachable via internal network.
      resetToken: reset.token,
      userId: user.id,
      userEmail: user.email,
      userFirstName: user.firstName,
    });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/reset-password ─────────────────────────────────────
const ResetSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(12).max(200),
});

router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ResetSchema.parse(req.body);
    const reset = await prisma.passwordReset.findUnique({ where: { token: body.token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw Errors.validation("Reset token is invalid or has expired");
    }
    const passwordHash = await argon2.hash(body.newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ]);
    ok(res, { reset: true });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/request-email-verification ────────────────────────
// Phase 31b — issue (or re-issue) an email-verification token for a user.
// Called by the gateway:
//   1. Automatically as the last saga step of /register-company.
//   2. On user request via /api/auth/resend-verification.
// Idempotent: any previous unused tokens for the same user are expired
// before a new one is created.
const RequestVerificationSchema = z.object({ userId: z.string().uuid() });

router.post("/request-email-verification", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = RequestVerificationSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound("User");
    if (user.emailVerified) {
      return ok(res, { sent: false, alreadyVerified: true });
    }
    await prisma.emailVerification.updateMany({
      where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });
    const v = await prisma.emailVerification.create({
      data: {
        userId,
        email: user.email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });
    ok(res, {
      sent: true,
      verifyToken: v.token,
      userId: user.id,
      userEmail: user.email,
      userFirstName: user.firstName,
    });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/verify-email ──────────────────────────────────────
// Phase 31b — public, token-gated. Flips User.emailVerified = true and marks
// the token used. Returns the userId so the gateway can show a success page.
const VerifyEmailSchema = z.object({ token: z.string().uuid() });

router.post("/verify-email", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = VerifyEmailSchema.parse(req.body);
    const v = await prisma.emailVerification.findUnique({ where: { token } });
    if (!v || v.usedAt || v.expiresAt < new Date()) {
      throw Errors.validation("Verification link is invalid or has expired");
    }
    // Guard against the user changing their email between request + click.
    const user = await prisma.user.findUnique({ where: { id: v.userId } });
    if (!user) throw Errors.notFound("User");
    if (user.email !== v.email) {
      // Email changed since the link was sent — invalidate.
      await prisma.emailVerification.update({
        where: { id: v.id },
        data: { usedAt: new Date() },
      });
      throw Errors.validation("This verification link no longer matches your email. Request a new one.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: v.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      }),
      prisma.emailVerification.update({
        where: { id: v.id },
        data: { usedAt: new Date() },
      }),
    ]);

    ok(res, { verified: true, userId: v.userId, email: v.email });
  } catch (err) { next(err); }
});

// ── GET /internal/auth/invite-info?token=... ──────────────────────────────
// Phase 31a — looked up by the /accept-invite page so the UI can show
//   "Hi Alex, you've been invited to Acme Corp as Recruiter"
// before asking for a password. Public-callable via gateway (token IS the
// auth). Returns minimal info — no userId, no userhash, nothing exploitable.
router.get("/invite-info", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.query["token"];
    if (typeof token !== "string" || !token) throw Errors.validation("token required");

    const invite = await prisma.inviteToken.findUnique({ where: { token } });
    if (!invite) throw Errors.notFound("Invite");
    if (invite.usedAt) throw Errors.validation("This invite has already been used.");
    if (invite.expiresAt < new Date()) throw Errors.validation("This invite has expired.");

    // Resolve the user (created at invite time so we can pre-fill the name)
    // and the tenant name (so the UI can say "Welcome to Acme Corp").
    const user = await prisma.user.findFirst({
      where: { tenantId: invite.tenantId, email: invite.email },
      select: { firstName: true, lastName: true, email: true, role: true },
    });
    if (!user) throw Errors.notFound("Invited user");

    ok(res, {
      email: invite.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: invite.role,
      tenantId: invite.tenantId,
      expiresAt: invite.expiresAt.toISOString(),
    });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/accept-invite ─────────────────────────────────────
// Phase 31a — token-gated password set. Overwrites the placeholder password
// the invite route created. Marks the invite token used so it can't be
// reused. Returns the userId so the gateway can sign a JWT and log them in.
const AcceptInviteSchema = z.object({
  token: z.string().uuid(),
  newPassword: z.string().min(12).max(200),
});

router.post("/accept-invite", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = AcceptInviteSchema.parse(req.body);

    const invite = await prisma.inviteToken.findUnique({ where: { token: body.token } });
    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      throw Errors.validation("Invite token is invalid or has expired");
    }

    const user = await prisma.user.findFirst({
      where: { tenantId: invite.tenantId, email: invite.email },
    });
    if (!user) throw Errors.notFound("Invited user");

    const passwordHash = await argon2.hash(body.newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.inviteToken.update({
        where: { id: invite.id },
        data: { usedAt: new Date() },
      }),
    ]);

    ok(res, {
      accepted: true,
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/change-password ────────────────────────────────────
// Authenticated — must provide current password.
const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12).max(200),
});

router.post("/change-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw Errors.unauthorized();
    const body = ChangePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound("User");
    const valid = await argon2.verify(user.passwordHash, body.currentPassword);
    if (!valid) throw Errors.unauthorized("Current password is incorrect");

    const passwordHash = await argon2.hash(body.newPassword);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    ok(res, { changed: true });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/mfa/setup ──────────────────────────────────────────
// Generates a TOTP secret + a data-URL QR code. The user scans + enters one
// code via /mfa/verify before mfaEnabled flips on.
router.post("/mfa/setup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw Errors.unauthorized();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound("User");
    if (user.mfaEnabled) {
      throw Errors.validation("MFA already enabled — disable first to re-enrol");
    }

    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, "CDC ATS", secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);

    // Store provisional secret — only finalised when /verify succeeds
    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false },
    });

    ok(res, {
      secret,            // user can type this manually if QR fails
      otpauth,
      qrDataUrl,         // <img src={qrDataUrl}/> in the UI
    });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/mfa/verify ────────────────────────────────────────
// Confirms enrolment by validating a fresh code against the stored secret.
const MfaVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});

router.post("/mfa/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw Errors.unauthorized();
    const body = MfaVerifySchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound("User");
    if (!user.mfaSecret) throw Errors.validation("Call /mfa/setup first");

    const valid = authenticator.verify({ token: body.code, secret: user.mfaSecret });
    if (!valid) throw Errors.unauthorized("Invalid MFA code");

    await prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });
    ok(res, { enabled: true });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/mfa/disable ───────────────────────────────────────
// Requires re-entering the current password (defense against session theft).
const MfaDisableSchema = z.object({
  password: z.string().min(1),
});

router.post("/mfa/disable", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) throw Errors.unauthorized();
    const body = MfaDisableSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound("User");
    const ok2 = await argon2.verify(user.passwordHash, body.password);
    if (!ok2) throw Errors.unauthorized("Password incorrect");

    await prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: null, mfaEnabled: false },
    });
    ok(res, { disabled: true });
  } catch (err) { next(err); }
});

// ── POST /internal/auth/mfa/challenge ─────────────────────────────────────
// Used by the gateway login flow after the password step when mfaEnabled=true.
// Returns success/failure; gateway then completes the JWT signing.
const MfaChallengeSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
});

router.post("/mfa/challenge", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = MfaChallengeSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user?.mfaSecret || !user.mfaEnabled) {
      throw Errors.validation("MFA not enabled for this user");
    }
    const valid = authenticator.verify({ token: body.code, secret: user.mfaSecret });
    if (!valid) throw Errors.unauthorized("Invalid MFA code");
    ok(res, { verified: true });
  } catch (err) { next(err); }
});

export default router;
