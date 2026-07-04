import { createHmac, timingSafeEqual } from "node:crypto";

// Module D — the tenant's OWN built-in interview room (own-WebRTC + collab-service
// relay). NO external meeting tool (Jitsi/Zoom/Meet/Teams). Every interview's
// "meeting link" is a URL into our own /interview/room page, carrying a short,
// opaque, signed JOIN TOKEN so a candidate (guest) can join WITHOUT an account.
//
// The join token is a stateless HMAC (base64url(payloadJson).hmac) binding the
// interview id + a guest role + an expiry, mirroring the collab-token idiom. The
// guest-join endpoint (routes/artifacts.ts) verifies it and hands back a
// short-lived collab-service room token — so a valid link is the only credential
// a candidate needs, and it cannot be forged or replayed after it expires.

const SECRET =
  process.env["INTERVIEW_JOIN_TOKEN_SECRET"] ??
  process.env["COLLAB_TOKEN_SECRET"] ??
  "dev-collab-secret-change-me";

const DEFAULT_TTL_SECONDS = 14 * 24 * 60 * 60; // 14 days — invites are sent ahead of the interview

export interface JoinClaims {
  /** the interview id this token grants guest access to */
  interviewId: string;
  /** always "guest" for candidate links (staff join authenticated) */
  role: "guest";
  /** epoch seconds */
  exp: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

/** Mint a short, opaque, signed guest join token for an interview. */
export function mintGuestJoinToken(interviewId: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const claims: JoinClaims = {
    interviewId,
    role: "guest",
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payload = b64url(Buffer.from(JSON.stringify(claims)));
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Verify a guest join token. Returns the claims or null (bad sig / expired / malformed). */
export function verifyGuestJoinToken(token: string): JoinClaims | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as JoinClaims;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;
    if (!claims.interviewId || claims.role !== "guest") return null;
    return claims;
  } catch {
    return null;
  }
}

/** The public base URL of the frontend app that hosts the built-in room. */
export function appBaseUrl(): string {
  return process.env["APP_URL"] ?? "http://localhost:3000";
}

/**
 * The tenant's OWN built-in room URL for an interview, with the guest join token.
 * Contract shape (rendered by the frontend, NEVER an external meeting URL):
 *   ${APP_URL}/interview/room/{interviewId}?t=<joinToken>
 */
export function buildBuiltInRoomUrl(interviewId: string, joinToken?: string): string {
  const token = joinToken ?? mintGuestJoinToken(interviewId);
  return `${appBaseUrl()}/interview/room/${interviewId}?t=${encodeURIComponent(token)}`;
}
