import { z } from "zod";

export const ScreeningCompletedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  screeningId: z.string().uuid(),
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  result: z.enum(["PASS", "FAIL", "REVIEW"]),
  score: z.number().nullable(),
});
export type ScreeningCompletedPayload = z.infer<typeof ScreeningCompletedPayloadSchema>;
