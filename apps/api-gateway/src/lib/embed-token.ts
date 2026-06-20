/**
 * WF2 — embed token mint/verify.
 *
 * Short-lived, signed tokens that authorize an embeddable widget (WF9) to load
 * ONE module/resource for ONE tenant, framed only by a server-resolved set of
 * origins. These are DELIBERATELY separate from the auth JWT:
 *
 *   - signed with a DEDICATED secret (process.env.EMBED_SECRET), NOT the auth
 *     JWT_SECRET, so a leaked embed token can never be replayed as a session
 *     token and vice versa;
 *   - audience "cdc-embed" (the auth tokens use a different audience), so an
 *     auth token can never satisfy verifyEmbedToken and an embed token can
 *     never satisfy verifyAccessToken;
 *   - HS256 via jsonwebtoken (per the WF2 contract). The auth path uses jose;
 *     keeping the libraries distinct keeps the two token systems independent.
 *
 * The token bakes the server-resolved authorization context so the embed host
 * never has to trust client-supplied params: tenantId, sub (the user who
 * minted it), role, module, resourceId, the locked params, and allowedOrigins
 * (the frame-ancestors allowlist for this embed). allowedOrigins FAILS CLOSED:
 * if the mint caller cannot resolve any, it is [] and the consumer emits
 * frame-ancestors 'none' (no origin may frame the widget).
 */
import jwt from "jsonwebtoken";

/** Audience baked into + required of every embed token. Distinct from the auth JWT audience. */
export const EMBED_AUDIENCE = "cdc-embed";

/** Embed tokens are short-lived: a 10-minute window to hand off to the iframe. */
export const EMBED_EXPIRES_SECONDS = 10 * 60;

/**
 * The authorization context an embed token carries. Every field is
 * server-resolved at mint time; the consumer (WF9 embed host) trusts ONLY
 * what is inside the verified token, never the client request.
 */
export interface EmbedClaims {
  /** Tenant the embed is scoped to. */
  tenantId: string;
  /** The user (id) who minted the token. */
  sub: string;
  /** That user's role at mint time. */
  role: string;
  /** Module key the embed renders (e.g. a registry module key). */
  module: string;
  /** The specific resource the embed is bound to (e.g. a requisition id). */
  resourceId: string;
  /**
   * Locked, server-resolved params. The embed host uses these verbatim and
   * ignores any client-supplied equivalents, so a framed page cannot widen
   * its own scope.
   */
  params: Record<string, unknown>;
  /**
   * frame-ancestors allowlist for this embed. Empty => fail closed (no origin
   * may frame the widget). Each entry is expected to be a clean https origin
   * (validated upstream at the tenant branding layer / mint route).
   */
  allowedOrigins: string[];
}

/** Decoded embed token = the baked claims plus the standard JWT registered claims. */
export interface VerifiedEmbedClaims extends EmbedClaims {
  /** Audience — always EMBED_AUDIENCE for a valid embed token. */
  aud: string;
  /** Issued-at (seconds since epoch). */
  iat: number;
  /** Expiry (seconds since epoch). */
  exp: number;
}

/**
 * Resolve the dedicated embed signing secret. Throws (fail closed) if it is
 * missing or too short — we never silently fall back to the auth JWT secret,
 * because sharing secrets between the two token systems would defeat their
 * isolation.
 */
function embedSecret(): string {
  const s = process.env["EMBED_SECRET"];
  if (!s || s.length < 32) {
    throw new Error("EMBED_SECRET env var is required and must be at least 32 characters");
  }
  return s;
}

/**
 * Mint a signed embed token (HS256, aud "cdc-embed", exp 10 minutes) from a
 * fully server-resolved claim set. allowedOrigins is normalized to an array so
 * an undefined/null caller value fails closed to [] (no framing).
 */
export function mintEmbedToken(claims: EmbedClaims): string {
  const payload: EmbedClaims = {
    tenantId: claims.tenantId,
    sub: claims.sub,
    role: claims.role,
    module: claims.module,
    resourceId: claims.resourceId,
    params: claims.params ?? {},
    // Fail closed: anything other than a real array becomes [].
    allowedOrigins: Array.isArray(claims.allowedOrigins) ? claims.allowedOrigins : [],
  };
  return jwt.sign(payload, embedSecret(), {
    algorithm: "HS256",
    audience: EMBED_AUDIENCE,
    expiresIn: EMBED_EXPIRES_SECONDS,
  });
}

/**
 * Verify an embed token: checks the HS256 signature against EMBED_SECRET, the
 * audience ("cdc-embed"), and expiry. Returns the decoded claims or throws on
 * any failure (bad signature, wrong audience, expired, malformed). The
 * algorithm is pinned to HS256 so a token cannot be downgraded to "none".
 */
export function verifyEmbedToken(token: string): VerifiedEmbedClaims {
  const decoded = jwt.verify(token, embedSecret(), {
    algorithms: ["HS256"],
    audience: EMBED_AUDIENCE,
  });
  if (typeof decoded === "string") {
    throw new Error("Embed token payload is not an object");
  }
  const d = decoded as Record<string, unknown>;
  return {
    tenantId: String(d["tenantId"] ?? ""),
    sub: String(d["sub"] ?? ""),
    role: String(d["role"] ?? ""),
    module: String(d["module"] ?? ""),
    resourceId: String(d["resourceId"] ?? ""),
    params: (d["params"] && typeof d["params"] === "object") ? (d["params"] as Record<string, unknown>) : {},
    allowedOrigins: Array.isArray(d["allowedOrigins"]) ? (d["allowedOrigins"] as string[]) : [],
    aud: String(d["aud"] ?? ""),
    iat: Number(d["iat"] ?? 0),
    exp: Number(d["exp"] ?? 0),
  };
}
