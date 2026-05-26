import { z } from "zod";

export const ApplicationStageSchema = z.enum([
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW",
  "FINAL_REVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
]);
export type ApplicationStage = z.infer<typeof ApplicationStageSchema>;

export const ApplicationStatusSchema = z.enum([
  "ACTIVE", "ON_HOLD", "REJECTED", "WITHDRAWN", "HIRED",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const CandidateDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  resumeUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  source: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
});
export type CandidateDTO = z.infer<typeof CandidateDTOSchema>;

export const ApplicationDTOSchema = z.object({
  id: z.string(),
  tenantId: z.string().uuid(),
  candidateId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  stage: ApplicationStageSchema,
  status: ApplicationStatusSchema,
  appliedAt: z.string().datetime(),
  formResponses: z.record(z.string(), z.unknown()).nullable(),
});
export type ApplicationDTO = z.infer<typeof ApplicationDTOSchema>;

export const ApplicationAttachmentDTOSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string(),
  fieldId: z.string(),
  fileName: z.string(),
  fileSize: z.number().int(),
  mimeType: z.string(),
  storageKey: z.string(),
  createdAt: z.string().datetime(),
});
export type ApplicationAttachmentDTO = z.infer<typeof ApplicationAttachmentDTOSchema>;
