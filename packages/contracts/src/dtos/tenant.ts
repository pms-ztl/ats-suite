import { z } from "zod";

export const TenantPlanSchema = z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]);
export type TenantPlan = z.infer<typeof TenantPlanSchema>;

export const TenantStatusSchema = z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED"]);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

export const TenantDTOSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  plan: TenantPlanSchema,
  status: TenantStatusSchema,
  trialEndsAt: z.string().datetime().nullable(),
  industry: z.string().nullable(),
  companySize: z.string().nullable(),
  website: z.string().nullable(),
  logoUrl: z.string().nullable(),
  dataRegion: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TenantDTO = z.infer<typeof TenantDTOSchema>;

export const CreateTenantInputSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(80),
  plan: TenantPlanSchema.default("FREE"),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url().optional(),
});
export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;
