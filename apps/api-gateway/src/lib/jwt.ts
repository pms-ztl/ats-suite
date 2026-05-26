/**
 * JWT signing + verification — gateway is the ONLY service that knows the
 * secret. All other services trust forwarded headers.
 */
import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload, Role } from "@cdc-ats/common";

const SECRET = (() => {
  const s = process.env["JWT_SECRET"];
  if (!s || s.length < 32) {
    throw new Error("JWT_SECRET env var is required and must be at least 32 characters");
  }
  return new TextEncoder().encode(s);
})();

const ISSUER = process.env["JWT_ISSUER"] ?? "cdc-ats";
const AUDIENCE = process.env["JWT_AUDIENCE"] ?? "cdc-ats-api";
const ACCESS_EXPIRES = process.env["JWT_ACCESS_EXPIRES"] ?? "24h";
const REFRESH_EXPIRES = process.env["JWT_REFRESH_EXPIRES"] ?? "7d";

export interface SignTokenInput {
  userId: string;
  tenantId: string;
  email: string;
  role: Role;
}

export async function signAccessToken(input: SignTokenInput): Promise<string> {
  return new SignJWT({
    email: input.email,
    role: input.role,
    tenantId: input.tenantId,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES)
    .sign(SECRET);
}

export async function signRefreshToken(input: SignTokenInput): Promise<string> {
  return new SignJWT({
    email: input.email,
    role: input.role,
    tenantId: input.tenantId,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES)
    .sign(SECRET);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (payload.type !== "access") {
    throw new Error("Wrong token type — expected access");
  }
  return payload as unknown as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (payload.type !== "refresh") {
    throw new Error("Wrong token type — expected refresh");
  }
  return payload as unknown as JwtPayload;
}
