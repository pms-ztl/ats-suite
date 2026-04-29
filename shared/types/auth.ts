import { z } from "zod";

// ── Enums (mirror Prisma UserRole) ───────────────────────────────────────────
export const UserRoleSchema = z.enum([
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "COMPLIANCE_OFFICER",
  "CANDIDATE",
  "INTERVIEWER",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// ── User ─────────────────────────────────────────────────────────────────────
// Mirrors the Prisma User model (firstName + lastName exposed as-is;
// the frontend login mock returns a flat `name` — both shapes are captured).
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  /** Convenience computed field — optional so callers that only have firstName/lastName can omit it */
  name: z.string().optional(),
  role: UserRoleSchema,
  tenantId: z.string(),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  /** App-layer flag — not stored in DB column, resolved at login time */
  mfaEnabled: z.boolean().default(false),
  lastLoginAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

// ── Login ────────────────────────────────────────────────────────────────────
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  mfaCode: z.string().optional(),
  tenantId: z.string().optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  expiresAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    /** Convenience field for frontends that render a single name string */
    name: z.string().optional(),
    role: UserRoleSchema,
    tenantId: z.string(),
    mfaEnabled: z.boolean(),
  }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ── Token refresh ─────────────────────────────────────────────────────────────
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const RefreshTokenResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  expiresAt: z.coerce.date(),
});
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// ── Logout ────────────────────────────────────────────────────────────────────
export const LogoutRequestSchema = z.object({
  refreshToken: z.string().optional(),
});
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
