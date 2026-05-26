import { z } from "zod";
import { InterviewRecommendationSchema } from "../dtos/interview.js";

export const FeedbackSubmittedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  feedbackId: z.string().uuid(),
  interviewId: z.string().uuid(),
  candidateId: z.string().uuid(),
  interviewerId: z.string().uuid(),
  recommendation: InterviewRecommendationSchema,
  roundId: z.string().uuid().nullable(),
  roundNumber: z.number().int().nullable(),
});
export type FeedbackSubmittedPayload = z.infer<typeof FeedbackSubmittedPayloadSchema>;

export const InterviewScheduledPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  interviewId: z.string().uuid(),
  candidateId: z.string().uuid(),
  roundId: z.string().uuid().nullable(),
  scheduledAt: z.string().datetime().nullable(),
  panelistUserIds: z.array(z.string().uuid()),
});
export type InterviewScheduledPayload = z.infer<typeof InterviewScheduledPayloadSchema>;
