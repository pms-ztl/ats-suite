import { z } from "zod";
import { TenantPlanSchema } from "./tenant.js";

export const PlanChangeStatusSchema = z.enum([
  "PENDING", "APPROVED", "REJECTED", "CANCELLED",
]);
export type PlanChangeStatus = z.infer<typeof PlanChangeStatusSchema>;

export const PlanChangeRequestDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  fromPlan: TenantPlanSchema,
  toPlan: TenantPlanSchema,
  status: PlanChangeStatusSchema,
  reason: z.string().nullable(),
  requestedByUserId: z.string().uuid(),
  requestedAt: z.string().datetime(),
  reviewedByUserId: z.string().uuid().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  decisionNote: z.string().nullable(),
});
export type PlanChangeRequestDTO = z.infer<typeof PlanChangeRequestDTOSchema>;
