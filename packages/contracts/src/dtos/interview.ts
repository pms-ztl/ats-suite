import { z } from "zod";

export const InterviewTypeSchema = z.enum([
  "PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "PANEL", "FINAL",
]);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const InterviewStatusSchema = z.enum([
  "SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED",
  "CANCELLED", "NO_SHOW", "RESCHEDULED",
]);
export type InterviewStatus = z.infer<typeof InterviewStatusSchema>;

export const InterviewRecommendationSchema = z.enum([
  "STRONG_HIRE", "HIRE", "LEAN_HIRE", "NO_HIRE", "STRONG_NO_HIRE",
]);
export type InterviewRecommendation = z.infer<typeof InterviewRecommendationSchema>;

export const InterviewRoundDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requisitionId: z.string().uuid().nullable(),
  name: z.string(),
  order: z.number().int(),
  interviewType: InterviewTypeSchema,
  durationMinutes: z.number().int(),
  instructions: z.string().nullable(),
  autoAdvanceOnPass: z.boolean(),
  defaultPanelistRole: z.string().nullable(),
});
export type InterviewRoundDTO = z.infer<typeof InterviewRoundDTOSchema>;

export const InterviewDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  candidateId: z.string().uuid(),
  applicationId: z.string().nullable(),
  type: InterviewTypeSchema.nullable(),
  stage: z.string(),
  status: InterviewStatusSchema,
  scheduledAt: z.string().datetime().nullable(),
  duration: z.number().int(),
  roundId: z.string().uuid().nullable(),
  roundNumber: z.number().int().nullable(),
});
export type InterviewDTO = z.infer<typeof InterviewDTOSchema>;

export const InterviewFeedbackDTOSchema = z.object({
  id: z.string().uuid(),
  interviewId: z.string().uuid(),
  interviewerId: z.string().uuid(),
  candidateId: z.string().uuid(),
  overallRating: z.number().int(),
  recommendation: InterviewRecommendationSchema,
  notes: z.string().nullable(),
  submittedAt: z.string().datetime(),
});
export type InterviewFeedbackDTO = z.infer<typeof InterviewFeedbackDTOSchema>;
