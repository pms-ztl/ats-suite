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
