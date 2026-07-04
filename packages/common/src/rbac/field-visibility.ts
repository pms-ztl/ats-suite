// @cdc-ats/common: SERVER-SIDE field-visibility matrix + helpers.
//
// The FORBIDDEN pattern this module closes: hiding sensitive fields in the
// frontend only, while the API still serializes them. A curl / devtools user
// then reads salaries, interviewer notes, and scores they must not see.
//
// The fix is a central, pure, DB-free role -> field matrix that the OWNING
// service applies BEFORE it serializes an entity, so the field never leaves the
// process for a role that may not see it. The frontend may still hide the same
// field cosmetically, but the server strip is the real enforcement.
//
// This is DISTINCT from (and complementary to) the tenant-authored per-field
// policy in @cdc-ats/contracts `visibility.ts` (canSeeField): that one is an
// OPT-IN, fail-OPEN tenant customization. THIS matrix is the platform baseline
// and is fail-CLOSED for sensitive fields: an unknown role gets the most
// restrictive view. A caller can layer both: baseline first, then the tenant
// policy can only tighten further.
//
// Pure functions only. No DB, no I/O, unit-testable.

/**
 * The RBAC ROLE list: every role recognized by the field-visibility matrix.
 * This mirrors the identity-service UserRole enum PLUS the two org-leadership
 * roles added for analytics/decision access (DEPARTMENT_HEAD, EXECUTIVE) and the
 * HR_MANAGER role the matrix distinguishes from RECRUITER. Kept as a plain
 * readonly array so callers can iterate it without pulling in zod.
 *
 * Named `RBAC_ROLES` (not `ROLES`) to avoid colliding with the existing
 * `ROLES` const object exported from `types/auth.js`. This is the ROLE list
 * referenced by the cross-lane RBAC helper contract.
 */
export const RBAC_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "RECRUITER",
  "HR_MANAGER",
  "HIRING_MANAGER",
  "COMPLIANCE_OFFICER",
  "INTERVIEWER",
  "DEPARTMENT_HEAD",
  "EXECUTIVE",
  "CANDIDATE",
] as const;

export type RbacRole = (typeof RBAC_ROLES)[number];

/** The entity kinds the matrix governs. */
export type RbacEntityType = "candidate" | "interview" | "offer" | "analytics";

// ── The sensitive-field matrix ───────────────────────────────────────────────
//
// For each entity type we list the SENSITIVE fields and, per field, the set of
// roles allowed to see it. A field NOT listed here is considered non-sensitive
// and is ALWAYS visible (fail-open for ordinary data like name/stage/title).
// A field that IS listed is fail-CLOSED: only the enumerated roles see it; every
// other role (including unknown roles) has it stripped.
//
// SUPER_ADMIN is a platform operator and always sees every field (handled in
// `canViewField` directly, not enumerated per-field, to avoid drift).
//
// Field-name notes: we include several common aliases (e.g. `salary`,
// `salaryBand`, `compensation`, `comp`) so a caller does not have to normalize
// its entity shape before calling. Matching is case-sensitive on the exact key.

type FieldRoleMatrix = Record<string, readonly RbacRole[]>;

const CANDIDATE_MATRIX: FieldRoleMatrix = {
  // Private recruiter notes: the recruiting side + admins, not interviewers.
  recruiterNotes: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER"],
  // AI screening / alignment score: the hiring side + leadership, not raw
  // interviewers (who should judge on their own merits, not a prior score).
  alignmentScore: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  screeningScore: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  // Expected / current salary a candidate stated: comp-sensitive.
  expectedSalary: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  currentSalary: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
};

const INTERVIEW_MATRIX: FieldRoleMatrix = {
  // Panelist notes: the recruiting/hiring side + admins. An INTERVIEWER sees
  // interviews they are on but NOT other interviewers' notes (see the
  // interviewer-scoping note in `filterVisibleFields`); leadership does NOT see
  // raw interviewer notes (they consume decisions + analytics instead).
  interviewerNotes: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER"],
  interviewNotes: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER"],
  panelistNotes: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER"],
  // Numeric interview scores / ratings.
  interviewScores: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  scores: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  rating: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "INTERVIEWER", "DEPARTMENT_HEAD", "EXECUTIVE"],
};

const OFFER_MATRIX: FieldRoleMatrix = {
  // Raw salary band / compensation on an offer. HIRING_MANAGER does NOT see the
  // raw band by default (spec: "not raw salary bands unless owner"; ownership
  // is enforced by the caller via the `isOwner` option below). Interviewers
  // never see comp.
  salary: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  salaryBand: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  compensation: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  comp: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  baseSalary: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  bonus: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  equity: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  // The hire/no-hire decision on the offer: leadership + the hiring side.
  decision: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
};

const ANALYTICS_MATRIX: FieldRoleMatrix = {
  // Whole-org analytics rollups. Leadership + admins + recruiting ops; NOT
  // interviewers (they see only their own interviews, not org metrics).
  analytics: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  metrics: ["ADMIN", "RECRUITER", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  compensationSpend: ["ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  salaryBenchmarks: ["ADMIN", "HR_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  decision: ["ADMIN", "RECRUITER", "HR_MANAGER", "HIRING_MANAGER", "DEPARTMENT_HEAD", "EXECUTIVE"],
};

const MATRIX: Record<RbacEntityType, FieldRoleMatrix> = {
  candidate: CANDIDATE_MATRIX,
  interview: INTERVIEW_MATRIX,
  offer: OFFER_MATRIX,
  analytics: ANALYTICS_MATRIX,
};

/**
 * Options for `filterVisibleFields`. All optional and backward-compatible.
 */
export interface FilterVisibleFieldsOptions {
  /**
   * When true, the caller has verified `role` is the OWNER of this entity
   * (e.g. the hiring manager who owns the requisition, or the interviewer whose
   * own notes these are). Ownership grants the same view an ADMIN would have,
   * so an owning HIRING_MANAGER sees the raw salary band on their own offer, and
   * an owning INTERVIEWER sees their own interviewer notes. The caller is
   * responsible for actually proving ownership before passing true.
   */
  isOwner?: boolean;
}

/**
 * Returns true if `role` may see `field` on an entity of `entityType`.
 *
 * Rules:
 *   • SUPER_ADMIN sees everything.
 *   • A field NOT in the sensitive matrix is always visible (non-sensitive).
 *   • A field IN the matrix is visible only to the enumerated roles.
 *   • An unknown / empty role is treated as least-privilege: it sees only
 *     non-sensitive fields.
 *   • `isOwner` grants ADMIN-equivalent access (see options doc).
 */
export function canViewField(
  role: string,
  entityType: RbacEntityType,
  field: string,
  opts: FilterVisibleFieldsOptions = {},
): boolean {
  if (role === "SUPER_ADMIN") return true;

  const allowedRoles = MATRIX[entityType]?.[field];
  // Not a listed sensitive field -> non-sensitive -> always visible.
  if (!allowedRoles) return true;

  // Owner gets the full (ADMIN-equivalent) view of their own entity.
  if (opts.isOwner) return true;

  return (allowedRoles as readonly string[]).includes(role);
}

/**
 * Strips every field that `role` may not see from a shallow copy of `entity`,
 * per the central matrix for `entityType`. Non-sensitive fields pass through
 * untouched. Returns a NEW object (the input is never mutated); null/undefined
 * and non-object inputs are returned as-is so callers can pipe optional values.
 *
 * This is the enforcement point: call it in the service serializer BEFORE the
 * entity leaves the process. Arrays should be mapped element-by-element by the
 * caller (this function operates on a single entity object).
 *
 * Special case for INTERVIEWER on `interview` entities: an interviewer may see
 * their OWN notes/scores but not other panelists'. Since a single serialized
 * interview object mixes both, the caller signals "these are the caller's own"
 * via `opts.isOwner`. Without it, an INTERVIEWER has the interviewer-notes
 * fields stripped (they can still see the interview's non-sensitive shell:
 * schedule, room URL, candidate basics).
 */
export function filterVisibleFields<T>(
  entity: T,
  role: string,
  entityType: RbacEntityType,
  opts: FilterVisibleFieldsOptions = {},
): Partial<T> {
  if (entity === null || entity === undefined || typeof entity !== "object") {
    return entity as Partial<T>;
  }

  // Arrays are not the intended input (this operates on a single entity), but
  // handle them gracefully by mapping each element through the same filter.
  if (Array.isArray(entity)) {
    return entity.map((item) =>
      filterVisibleFields(item, role, entityType, opts),
    ) as unknown as Partial<T>;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entity as Record<string, unknown>)) {
    if (canViewField(role, entityType, key, opts)) {
      out[key] = value;
    }
  }
  return out as Partial<T>;
}
