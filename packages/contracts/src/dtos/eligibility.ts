import { z } from "zod";

// ── Module A — Eligibility gating ────────────────────────────────────────────
// A requisition may carry an ordered list of eligibility rules that are
// evaluated against the candidate's submitted application answers BEFORE the
// application is accepted. A failing rule short-circuits the apply with the
// rule's own `errorMessage` (e.g. "Only CSE candidates can apply for this job").
//
// Rules are intentionally simple + declarative so they can be authored in the
// requisition form-builder UI and evaluated cheaply on the hot apply path
// without an LLM call. `field` is the FormField id whose answer is checked.

export const EligibilityOpSchema = z.enum([
  "eq",      // answer === values[0]
  "neq",     // answer !== values[0]
  "in",      // values includes answer (case-insensitive)
  "not_in",  // values does NOT include answer
  "gte",     // Number(answer) >= Number(values[0])
  "lte",     // Number(answer) <= Number(values[0])
  "between", // Number(values[0]) <= Number(answer) <= Number(values[1])
]);
export type EligibilityOp = z.infer<typeof EligibilityOpSchema>;

export const EligibilityRuleSchema = z.object({
  /** FormField id whose submitted answer is evaluated (e.g. "department"). */
  field: z.string().min(1).max(50),
  op: EligibilityOpSchema,
  /** Comparison operand(s). `in`/`not_in` use the whole array; numeric ops use [0] (+[1] for between). */
  values: z.array(z.string()).default([]),
  /** Shown to the candidate when this rule fails. */
  errorMessage: z.string().min(1).max(300),
  /** Optional human label for the rule in the authoring UI. */
  label: z.string().max(120).optional(),
});
export type EligibilityRule = z.infer<typeof EligibilityRuleSchema>;

export const EligibilityRulesSchema = z.array(EligibilityRuleSchema);
export type EligibilityRules = z.infer<typeof EligibilityRulesSchema>;

/** Result of evaluating a candidate's answers against a requisition's rules. */
export const EligibilityResultSchema = z.object({
  eligible: z.boolean(),
  /** First failing rule's message, when `eligible` is false. */
  errorMessage: z.string().nullable(),
  /** Field id of the first failing rule (for inline form highlighting). */
  field: z.string().nullable(),
});
export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

// ── College / CDC channel ────────────────────────────────────────────────────
// A CollegePartner is a campus/CDC the tenant shares a job link with. The
// shareToken yields a public landing (/cdc/<token>) that lists the tenant's open
// roles and stamps every application made through it with the college name, so
// resumes arrive WITH the college attached and recruiters can group by campus.

export const CollegePartnerDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  /** URL-safe slug, unique per tenant. */
  slug: z.string().min(1).max(120),
  /** Opaque public share token used in /cdc/<token>. */
  shareToken: z.string().min(8),
  contactEmail: z.string().email().nullable().optional(),
  /** Optional restriction: only these requisition ids are shown on the landing. */
  requisitionIds: z.array(z.string().uuid()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
});
export type CollegePartnerDTO = z.infer<typeof CollegePartnerDTOSchema>;

export const CreateCollegePartnerSchema = z.object({
  name: z.string().min(1).max(200),
  contactEmail: z.string().email().optional(),
  requisitionIds: z.array(z.string().uuid()).optional(),
});
export type CreateCollegePartner = z.infer<typeof CreateCollegePartnerSchema>;

// ── Pure evaluator ───────────────────────────────────────────────────────────
// Shared by job-service (authoritative gate on the apply path) AND the frontend
// apply form (optimistic pre-validation). Deterministic, no I/O, no LLM. A rule
// whose field has no submitted answer is treated as FAILING (the candidate did
// not provide the gated information), which keeps the gate strict by default.

const norm = (v: unknown): string => String(v ?? "").trim();
const lc = (v: unknown): string => norm(v).toLowerCase();

/** Evaluate one rule against the candidate's answers map. Returns true if it passes. */
export function evaluateEligibilityRule(rule: EligibilityRule, answers: Record<string, unknown>): boolean {
  const raw = answers[rule.field];
  const answer = norm(raw);
  // No answer to a gated field → fail closed.
  if (answer === "") return false;
  const vals = rule.values ?? [];
  switch (rule.op) {
    case "eq":     return lc(answer) === lc(vals[0]);
    case "neq":    return lc(answer) !== lc(vals[0]);
    case "in":     return vals.some((v) => lc(v) === lc(answer));
    case "not_in": return !vals.some((v) => lc(v) === lc(answer));
    case "gte":    return Number(answer) >= Number(vals[0]);
    case "lte":    return Number(answer) <= Number(vals[0]);
    case "between": {
      const n = Number(answer);
      return n >= Number(vals[0]) && n <= Number(vals[1]);
    }
    default:       return true;
  }
}

/**
 * Evaluate ALL rules; returns the first failure (or eligible:true). Rules with
 * an unparseable numeric operand on a numeric op are skipped (treated as pass)
 * so a malformed rule can never hard-block every applicant.
 */
export function evaluateEligibility(
  rules: EligibilityRule[] | undefined | null,
  answers: Record<string, unknown>,
): EligibilityResult {
  for (const rule of rules ?? []) {
    const numericOp = rule.op === "gte" || rule.op === "lte" || rule.op === "between";
    if (numericOp && (rule.values ?? []).some((v) => Number.isNaN(Number(v)))) continue;
    if (!evaluateEligibilityRule(rule, answers)) {
      return { eligible: false, errorMessage: rule.errorMessage, field: rule.field };
    }
  }
  return { eligible: true, errorMessage: null, field: null };
}
