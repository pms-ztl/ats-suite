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
}
