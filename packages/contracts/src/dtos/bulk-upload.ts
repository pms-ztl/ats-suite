import { z } from "zod";

export const BulkUploadStatusSchema = z.enum([
  "QUEUED", "PROCESSING", "COMPLETED", "FAILED", "PARTIAL",
]);
export type BulkUploadStatus = z.infer<typeof BulkUploadStatusSchema>;

export const BulkUploadDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  requisitionId: z.string().uuid().nullable(),
  status: BulkUploadStatusSchema,
  totalFiles: z.number().int(),
  processedFiles: z.number().int(),
  failedFiles: z.number().int(),
  progress: z.number().int().min(0).max(100),
  errors: z.array(z.object({ filename: z.string(), error: z.string() })),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});
export type BulkUploadDTO = z.infer<typeof BulkUploadDTOSchema>;
