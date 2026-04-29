import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────

export const InterviewTypeSchema = z.enum([
  "PHONE_SCREEN",
  "TECHNICAL",
  "BEHAVIORAL",
  "PANEL",
  "FINAL",
]);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const InterviewStatusSchema = z.enum([
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);
export type InterviewStatus = z.infer<typeof InterviewStatusSchema>;

export const InterviewRecommendationSchema = z.enum([
  "STRONG_YES",
  "YES",
  "NEUTRAL",
  "NO",
  "STRONG_NO",
]);
export type InterviewRecommendation = z.infer<typeof InterviewRecommendationSchema>;

// ── Interview ────────────────────────────────────────────────────────────────

export const InterviewSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  scheduledAt: z.coerce.date(),
  duration: z.number().int().positive().describe("Duration in minutes"),
  type: InterviewTypeSchema,
  status: InterviewStatusSchema,
  interviewerIds: z.array(z.string().uuid()),
  meetingLink: z.string().url().optional(),
  notes: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Interview = z.infer<typeof InterviewSchema>;

// ── Interview Feedback ───────────────────────────────────────────────────────

export const InterviewFeedbackSchema = z.object({
  id: z.string().uuid(),
  interviewId: z.string().uuid(),
  interviewerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendation: InterviewRecommendationSchema,
  notes: z.string(),
  createdAt: z.coerce.date(),
});
export type InterviewFeedback = z.infer<typeof InterviewFeedbackSchema>;

// ── Mutation schemas ─────────────────────────────────────────────────────────

export const CreateInterviewSchema = InterviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateInterview = z.infer<typeof CreateInterviewSchema>;

export const UpdateInterviewSchema = InterviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();
export type UpdateInterview = z.infer<typeof UpdateInterviewSchema>;
