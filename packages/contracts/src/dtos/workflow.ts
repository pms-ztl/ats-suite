import { z } from "zod";

// ── Module H — Customizable pipeline / scorecards / approvals ─────────────────
// Enterprises layer their own hiring workflow over the canonical ApplicationStage
// enum. A WorkflowTemplate is an ordered list of StageDefs; each StageDef maps to
// a canonical stage (so analytics + automation still understand it) but carries a
// tenant label, color, and optional gates. Un-customized tenants resolve to the
// canonical default, so behavior is byte-identical unless a template is authored.

export const CanonicalStageSchema = z.enum([
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW",
  "TECHNICAL_ROUND", "HR_ROUND", "FINAL_REVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
]);
export type CanonicalStage = z.infer<typeof CanonicalStageSchema>;

export const StageDefSchema = z.object({
  /** Stable key within the template (slug). */
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(80),
  /** Canonical stage this custom stage reports as. */
  canonical: CanonicalStageSchema,
  color: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
  order: z.number().int(),
  /** When true, leaving this stage requires an approval per the ApprovalPolicy. */
  requiresApproval: z.boolean().default(false),
  /** Optional: this stage is skipped for these requisition departments. */
  skipForDepartments: z.array(z.string()).default([]),
});
export type StageDef = z.infer<typeof StageDefSchema>;

export const WorkflowTemplateDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(120),
  /** When set, this template applies only to that requisition; else tenant-default. */
  requisitionId: z.string().uuid().nullable(),
  isDefault: z.boolean(),
  stages: z.array(StageDefSchema).min(1),
  updatedAt: z.string().datetime(),
});
export type WorkflowTemplateDTO = z.infer<typeof WorkflowTemplateDTOSchema>;

// Interview scorecard templates — the rubric an interviewer scores against.
export const ScorecardDimensionSchema = z.object({
  key: z.string().min(1).max(50),
  label: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  /** Weight in the composite (0–1); weights need not sum to 1 (normalized at read). */
  weight: z.number().min(0).max(1).default(1),
  /** Rating scale max (e.g. 4 or 5). */
  scaleMax: z.number().int().min(2).max(10).default(4),
});
export type ScorecardDimension = z.infer<typeof ScorecardDimensionSchema>;

export const ScorecardTemplateDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(120),
  /** Optional: scope to a requisition or interview type; else tenant-default. */
  requisitionId: z.string().uuid().nullable(),
  interviewType: z.string().nullable(),
  dimensions: z.array(ScorecardDimensionSchema).min(1),
  /** Allowed overall recommendations (defaults to the canonical 5-point scale). */
  recommendations: z.array(z.string()).default([
    "STRONG_HIRE", "HIRE", "NEUTRAL", "NO_HIRE", "STRONG_NO_HIRE",
  ]),
  isDefault: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type ScorecardTemplateDTO = z.infer<typeof ScorecardTemplateDTOSchema>;

// Approval policy — who must approve a gated stage transition (e.g. OFFER/HIRE).
export const ApprovalStepSchema = z.object({
  /** Role that must approve at this step. */
  role: z.enum(["RECRUITER", "HIRING_MANAGER", "ADMIN", "COMPLIANCE_OFFICER", "SUPER_ADMIN"]),
  order: z.number().int(),
  /** Optional reason/label for the authoring UI. */
  label: z.string().max(120).optional(),
});
export type ApprovalStep = z.infer<typeof ApprovalStepSchema>;

export const ApprovalPolicyDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  /** Canonical stage transition this policy gates (typically OFFER or HIRED). */
  gatedStage: CanonicalStageSchema,
  steps: z.array(ApprovalStepSchema).default([]),
  isActive: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type ApprovalPolicyDTO = z.infer<typeof ApprovalPolicyDTOSchema>;
