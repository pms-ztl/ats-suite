import { z } from "zod";

export const RequisitionStatusSchema = z.enum([
  "DRAFT", "OPEN", "ON_HOLD", "FILLED", "CLOSED", "CANCELLED",
]);
export type RequisitionStatus = z.infer<typeof RequisitionStatusSchema>;

export const RequisitionDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string(),
  department: z.string(),
  location: z.string(),
  status: RequisitionStatusSchema,
  priority: z.number().int(),
  headcount: z.number().int(),
  hiringManagerId: z.string().uuid().nullable(),
  recruiterId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});
export type RequisitionDTO = z.infer<typeof RequisitionDTOSchema>;

export const JobPostingDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requisitionId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  isPublished: z.boolean(),
  publishedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  views: z.number().int(),
  applicationCount: z.number().int(),
});
export type JobPostingDTO = z.infer<typeof JobPostingDTOSchema>;

export const FormFieldTypeSchema = z.enum([
  "text", "textarea", "email", "phone", "number", "url",
  "date", "select", "multiselect", "radio", "checkbox",
  "file", "image",
]);
export type FormFieldType = z.infer<typeof FormFieldTypeSchema>;

export const FormFieldSchema = z.object({
  id: z.string().min(1).max(50),
  type: FormFieldTypeSchema,
  label: z.string().min(1).max(200),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z.array(z.string()).optional(),
  fileTypes: z.array(z.string()).optional(),
  maxSizeMb: z.number().int().optional(),
  minLength: z.number().int().optional(),
  maxLength: z.number().int().optional(),
  pattern: z.string().optional(),
  order: z.number().int(),
  // Optional assessment metadata (OA platform, WF later). These are additive
  // and MUST stay optional so existing requisition/form payloads validate
  // unchanged. A plain application form never sets them.
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  points: z.number().int().optional(),
  timeLimit: z.number().int().optional(),
});
export type FormField = z.infer<typeof FormFieldSchema>;

export const ApplicationFormSchemaDTO = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requisitionId: z.string().uuid().nullable(),
  name: z.string(),
  fields: z.array(FormFieldSchema),
  isDefault: z.boolean(),
});
export type ApplicationFormSchemaDTO = z.infer<typeof ApplicationFormSchemaDTO>;
