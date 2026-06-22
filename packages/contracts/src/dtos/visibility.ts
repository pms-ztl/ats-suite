import { z } from "zod";

// ── Module I — Field-level visibility / RBAC ──────────────────────────────────
// On top of the existing route/section role-gating, a tenant can decide which
// ROLES may see which SENSITIVE FIELDS. The policy is enforced in BOTH places:
//   • the frontend hides the field (use-permissions), AND
//   • the owning service strips the field from the serialized payload, so it is
//     never merely cosmetically hidden.
// The fallback (no policy authored) keeps every field visible to every role that
// can already reach the page → byte-identical to today.

export const VisibilityFieldSchema = z.enum([
  "salary",            // requisition salary band, offer comp
  "interviewNotes",    // panelist notes + interview artifacts
  "assessmentScores",  // OA scores + breakdowns
  "recruiterNotes",    // private recruiter notes on a candidate
  "alignmentScore",    // AI alignment / screening score
  "analytics",         // org analytics + reports
  "candidatePii",      // raw PII (email/phone/address) vs. fairness-masked view
]);
export type VisibilityField = z.infer<typeof VisibilityFieldSchema>;

export const VisibilityRoleSchema = z.enum([
  "ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER", "SUPER_ADMIN",
]);
export type VisibilityRole = z.infer<typeof VisibilityRoleSchema>;

// A policy is a sparse map: field → (role → boolean). A missing entry means
// "visible" (fail-open to today's behavior). Only authored `false` entries hide.
export const VisibilityPolicyDTOSchema = z.object({
  tenantId: z.string().uuid(),
  /** field → role → canSee. Absent keys default to visible. */
  rules: z.record(
    VisibilityFieldSchema,
    z.record(VisibilityRoleSchema, z.boolean()),
  ).default({}),
  updatedAt: z.string().datetime(),
});
export type VisibilityPolicyDTO = z.infer<typeof VisibilityPolicyDTOSchema>;

/**
 * Pure resolver shared by frontend + services. Returns whether `role` may see
 * `field` under `rules`. Defaults to TRUE when unauthored (fail-open).
 * SUPER_ADMIN always sees everything (platform operator).
 */
export function canSeeField(
  rules: VisibilityPolicyDTO["rules"] | undefined | null,
  field: VisibilityField,
  role: string,
): boolean {
  if (role === "SUPER_ADMIN") return true;
  const byRole = rules?.[field];
  if (!byRole) return true;
  const v = (byRole as Record<string, boolean>)[role];
  return v === undefined ? true : v;
}
