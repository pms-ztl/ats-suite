import { createHmac } from "node:crypto";

// Module D — mint collab room tokens. collab-service verifies these with the SAME
// COLLAB_TOKEN_SECRET (stateless HMAC; no shared DB). The token binds the room id,
// the participant role (host = interviewer/panel, guest = candidate), a display
// name, and an expiry. Mirrors collab-service/src/token.ts (signing side only).

const SECRET = process.env["COLLAB_TOKEN_SECRET"] ?? "dev-collab-secret-change-me";

export interface CollabClaims {
  roomId: string;
  role: "host" | "guest";
  displayName: string;
  /** epoch seconds */
  exp: number;
}

export function signCollabToken(claims: CollabClaims): string {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/** Public WS URL the browser connects to (collab-service /rt). */
export function collabWsUrl(): string {
  return process.env["COLLAB_WS_PUBLIC_URL"] ?? "ws://localhost:4016/rt";
}
