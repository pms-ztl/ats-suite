import jwt from "jsonwebtoken";

// Use getter functions so the secret is read at call time (important for tests)
const getJwtSecret = () => process.env.JWT_SECRET ?? "dev-secret-change-in-production";
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN ?? "15m";
const getRefreshExpiresIn = () => process.env.REFRESH_EXPIRES_IN ?? "7d";

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: string;
  tenantId: string;
  type: "access" | "refresh";
}

export function signAccessToken(payload: Omit<JwtPayload, "type">): string {
  return jwt.sign({ ...payload, type: "access" }, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: Omit<JwtPayload, "type">): string {
  return jwt.sign({ ...payload, type: "refresh" }, getJwtSecret(), {
    expiresIn: getRefreshExpiresIn(),
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getJwtSecret());
  if (typeof decoded === "string") throw new Error("Invalid token");
  return decoded as JwtPayload;
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === "string") return null;
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}
