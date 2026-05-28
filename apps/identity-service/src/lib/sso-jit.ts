/**
 * Phase 28 — SSO JIT (just-in-time) user provisioning.
 *
 * Both SAML and OIDC handlers funnel into `findOrCreateSsoUser` once they
 * have validated assertion claims. Lookup order:
 *   1. externalId (most stable — IdP-issued nameID/sub)
 *   2. (tenantId, email) — covers users who used to log in with a password
 *      and now switch to SSO; we link the existing row to the IdP identity
 *   3. Create new — JIT provisioning. Role is mapped from IdP groups via
 *      TenantSso.roleMap; default is `defaultRole`.
 *
 * Seat-limit gate: when creating a NEW user (path 3), we still call the
 * plan-driven `canAddSeats` check. SSO doesn't bypass seat limits — a
 * tenant on FREE plan with 1 seat already used will see SSO login fail
 * with a 402 just like manual invite would.
 */
import argon2 from "argon2";
import { randomBytes } from "node:crypto";
import { prisma } from "./prisma.js";
import { canAddSeats, PLAN_LIMITS } from "./plan-limits.js";
import { AppError } from "@cdc-ats/common";
import type { TenantSso, UserRole } from "../generated/prisma/index.js";

export interface SsoAssertion {
  externalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  groups?: string[];
}

export interface JitContext {
  tenantId: string;
  /** The SsoTenant config row — needed for role mapping + seat-limit plan lookup. */
  config: TenantSso;
  /** Plan the tenant is currently on. Fetched by the route handler before calling here. */
  plan: string;
}

export interface JitResult {
  user: {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  };
  /** True if we created a new User row this call (vs. linked existing). */
  created: boolean;
  /** True if we linked an existing email-matched user to the IdP identity. */
  linked: boolean;
}

/**
 * Resolve the IdP `groups` claim to one of our UserRole values via the
 * tenant's roleMap. First match wins. No match → defaultRole.
 */
export function mapGroupsToRole(groups: string[] | undefined, config: TenantSso): UserRole {
  if (!groups || groups.length === 0) return config.defaultRole;
  const map = (config.roleMap ?? {}) as Record<string, string>;
  for (const g of groups) {
    const mapped = map[g];
    if (mapped && isValidRole(mapped)) return mapped as UserRole;
  }
  return config.defaultRole;
}

const VALID_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"]);
function isValidRole(role: string): boolean {
  return VALID_ROLES.has(role);
}

export async function findOrCreateSsoUser(
  assertion: SsoAssertion,
  ctx: JitContext,
): Promise<JitResult> {
  if (!assertion.email) {
    throw new AppError("BAD_REQUEST", "IdP did not return an email claim", 400);
  }
  const email = assertion.email.toLowerCase();
  const role = mapGroupsToRole(assertion.groups, ctx.config);

  // Path 1: lookup by externalId (most stable across email changes at IdP)
  const byExternal = await prisma.user.findUnique({ where: { externalId: assertion.externalId } });
  if (byExternal) {
    // Verify the user still belongs to the same tenant — if IdP swapped a
    // user between tenants we treat it as a different identity (don't leak).
    if (byExternal.tenantId !== ctx.tenantId) {
      throw new AppError("FORBIDDEN", "SSO identity belongs to a different tenant", 403);
    }
    if (!byExternal.isActive) {
      throw new AppError("FORBIDDEN", "Account disabled", 403);
    }
    await prisma.user.update({
      where: { id: byExternal.id },
      data: { ssoLastLogin: new Date(), lastLoginAt: new Date() },
    });
    return { user: serialize(byExternal), created: false, linked: false };
  }

  // Path 2: lookup by (tenantId, email) — link existing password user to IdP
  const byEmail = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: ctx.tenantId, email } },
  });
  if (byEmail) {
    if (!byEmail.isActive) throw new AppError("FORBIDDEN", "Account disabled", 403);
    const linked = await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        externalId: assertion.externalId,
        ssoLastLogin: new Date(),
        lastLoginAt: new Date(),
        // Update name from IdP if it has changed
        ...(assertion.firstName ? { firstName: assertion.firstName } : {}),
        ...(assertion.lastName ? { lastName: assertion.lastName } : {}),
      },
    });
    return { user: serialize(linked), created: false, linked: true };
  }

  // Path 3: JIT create. Enforce seat limit.
  const used = await prisma.user.count({ where: { tenantId: ctx.tenantId, isActive: true } });
  if (!canAddSeats(ctx.plan, used, 1)) {
    const limit = PLAN_LIMITS[ctx.plan]?.seats ?? 0;
    throw new AppError(
      "PLAN_LIMIT_EXCEEDED",
      `Plan ${ctx.plan} allows max ${limit} seats. Currently using ${used}. ` +
        `Tenant admin must upgrade or invite this user explicitly with a seat reassignment.`,
      402,
    );
  }

  // Random password — user can never use it (they only ever log in via SSO).
  // Stored as argon2 hash for consistency with the rest of the User model.
  const randomPassword = randomBytes(32).toString("hex");
  const passwordHash = await argon2.hash(randomPassword, { type: argon2.argon2id });

  const created = await prisma.user.create({
    data: {
      tenantId: ctx.tenantId,
      email,
      passwordHash,
      firstName: assertion.firstName ?? email.split("@")[0]!,
      lastName: assertion.lastName ?? "",
      role,
      isActive: true,
      externalId: assertion.externalId,
      ssoLastLogin: new Date(),
      lastLoginAt: new Date(),
    },
  });
  return { user: serialize(created), created: true, linked: false };
}

function serialize(u: {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}): JitResult["user"] {
  return {
    id: u.id,
    tenantId: u.tenantId,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isActive: u.isActive,
  };
}
