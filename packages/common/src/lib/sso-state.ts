/**
 * Phase 28 — Signed CSRF state token for SSO flows.
 *
 * SAML RelayState and OIDC state need CSRF protection: when the IdP POSTs
 * back, we have to verify the request originated from us. Solution: when
 * we send the user to the IdP, generate a short JWT containing {tenantId,
 * returnTo, nonce}, signed with JWT_SECRET. On callback we verify the
 * signature and decode.
 *
 * Tokens live ≤ 10 minutes (longer than any reasonable IdP round-trip,
 * shorter than the JWT access token TTL).
 */
import jwt from "jsonwebtoken";

const STATE_TTL_SECONDS = 600;

export interface SsoStatePayload {
  tenantId: string;
  /** Where the gateway should redirect after successful SSO. */
  returnTo?: string;
  /** Random nonce so two identical states get different tokens. */
  nonce: string;
}

export function signSsoState(payload: Omit<SsoStatePayload, "nonce">): string {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");
  const full: SsoStatePayload = {
    ...payload,
    nonce: Math.random().toString(36).slice(2, 14),
  };
  return jwt.sign(full, secret, {
    expiresIn: STATE_TTL_SECONDS,
    issuer: "cdc-ats-sso",
  });
}

export function verifySsoState(token: string): SsoStatePayload {
  const secret = process.env["JWT_SECRET"];
  if (!secret) throw new Error("JWT_SECRET not configured");
  const decoded = jwt.verify(token, secret, { issuer: "cdc-ats-sso" }) as SsoStatePayload;
  if (!decoded.tenantId || !decoded.nonce) {
    throw new Error("Invalid SSO state token shape");
  }
  return decoded;
}
