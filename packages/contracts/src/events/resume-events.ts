import { z } from "zod";

export const ResumeParsedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  candidateId: z.string().uuid(),
  resumeId: z.string(),
  bulkUploadId: z.string().uuid().nullable(),
  parsedSkillsCount: z.number().int(),
  parseCostUsd: z.number(),
});
export type ResumeParsedPayload = z.infer<typeof ResumeParsedPayloadSchema>;

export const BulkUploadCompletedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  bulkUploadId: z.string().uuid(),
  userId: z.string().uuid(),
  totalFiles: z.number().int(),
  processedFiles: z.number().int(),
  failedFiles: z.number().int(),
  status: z.enum(["COMPLETED", "PARTIAL", "FAILED"]),
});
export type BulkUploadCompletedPayload = z.infer<typeof BulkUploadCompletedPayloadSchema>;
