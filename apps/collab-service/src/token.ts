import { createHmac, timingSafeEqual } from "node:crypto";

// Module D — collab room tokens. interview-service mints a token (signCollabToken)
// when a participant opens the room; collab-service verifies it on WS connect, so
// a room can never be joined without a server grant. Both sides share
// COLLAB_TOKEN_SECRET. The token is `base64url(payloadJson).hmac` — stateless, no
// shared DB. The payload binds the room, the participant role, and an expiry.

const SECRET = process.env["COLLAB_TOKEN_SECRET"] ?? "dev-collab-secret-change-me";

export interface CollabClaims {
  roomId: string;
  role: "host" | "guest";
  displayName: string;
  /** epoch seconds */
  exp: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function signCollabToken(claims: CollabClaims): string {
  const payload = b64url(Buffer.from(JSON.stringify(claims)));
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyCollabToken(token: string): CollabClaims | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as CollabClaims;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;
    if (!claims.roomId || (claims.role !== "host" && claims.role !== "guest")) return null;
    return claims;
  } catch {
    return null;
  }
}
