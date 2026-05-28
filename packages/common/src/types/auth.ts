/** User roles — must match identity-service Prisma UserRole enum exactly. */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  HIRING_MANAGER: "HIRING_MANAGER",
  COMPLIANCE_OFFICER: "COMPLIANCE_OFFICER",
  INTERVIEWER: "INTERVIEWER",
  CANDIDATE: "CANDIDATE",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** JWT payload signed by the api-gateway. */
export interface JwtPayload {
  sub: string;        // user.id
  email: string;
  role: Role;
  tenantId: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
  // Phase 32a — present when a SUPER_ADMIN is impersonating another user.
  // `sub` becomes the impersonated user (so all downstream auth/scoping
  // works exactly as if they were logged in directly). `actorUserId` is
  // the real user driving the session — every audit entry records BOTH so
  // we can answer "who actually did this".
  actorUserId?: string;
}
