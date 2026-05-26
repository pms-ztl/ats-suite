import { z } from "zod";
import { TenantPlanSchema } from "../dtos/tenant.js";
import { PlanChangeStatusSchema } from "../dtos/plan-change.js";

export const TenantCreatedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string(),
  plan: TenantPlanSchema,
  industry: z.string().nullable(),
  companySize: z.string().nullable(),
  // Nullable because self-serve signups create the tenant BEFORE any user
  // exists — first user is created after as part of the same saga.
  createdByUserId: z.string().uuid().nullable(),
});
export type TenantCreatedPayload = z.infer<typeof TenantCreatedPayloadSchema>;

export const TenantPlanChangedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  fromPlan: TenantPlanSchema,
  toPlan: TenantPlanSchema,
  changedByUserId: z.string().uuid(),
  requestId: z.string().uuid(),
});
export type TenantPlanChangedPayload = z.infer<typeof TenantPlanChangedPayloadSchema>;

export const PlanChangeRequestedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  tenantName: z.string(),
  requestId: z.string().uuid(),
  fromPlan: TenantPlanSchema,
  toPlan: TenantPlanSchema,
  reason: z.string().nullable(),
  requestedByUserId: z.string().uuid(),
});
export type PlanChangeRequestedPayload = z.infer<typeof PlanChangeRequestedPayloadSchema>;

export const PlanChangeReviewedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  requestId: z.string().uuid(),
  status: PlanChangeStatusSchema,
  decisionNote: z.string().nullable(),
  reviewedByUserId: z.string().uuid(),
});
export type PlanChangeReviewedPayload = z.infer<typeof PlanChangeReviewedPayloadSchema>;
