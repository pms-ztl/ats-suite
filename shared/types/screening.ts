import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────

export const ScreeningTypeSchema = z.enum([
  "AUTOMATED",
  "MANUAL",
  "AI_ASSISTED",
]);
export type ScreeningType = z.infer<typeof ScreeningTypeSchema>;

export const ScreeningStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
]);
export type ScreeningStatus = z.infer<typeof ScreeningStatusSchema>;

export const ScreeningResultSchema = z.enum(["PASS", "FAIL", "REVIEW"]);
export type ScreeningResult = z.infer<typeof ScreeningResultSchema>;

// ── Screening ────────────────────────────────────────────────────────────────

export const ScreeningSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  type: ScreeningTypeSchema,
  status: ScreeningStatusSchema,
  score: z.number().min(0).max(100).optional(),
  passThreshold: z.number().min(0).max(100).optional(),
  result: ScreeningResultSchema,
  questions: z.array(z.record(z.unknown())),
  answers: z.array(z.record(z.unknown())),
  completedAt: z.coerce.date().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Screening = z.infer<typeof ScreeningSchema>;

// ── Assessment Result ────────────────────────────────────────────────────────

export const AssessmentResultSchema = z.object({
  id: z.string().uuid(),
  screeningId: z.string().uuid(),
  candidateId: z.string().uuid(),
  assessmentType: z.string(),
  score: z.number().min(0),
  maxScore: z.number().min(0),
  percentile: z.number().min(0).max(100).optional(),
  completedAt: z.coerce.date(),
  tenantId: z.string().uuid(),
});
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;

// ── Mutation schemas ─────────────────────────────────────────────────────────

export const CreateScreeningSchema = ScreeningSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateScreening = z.infer<typeof CreateScreeningSchema>;
