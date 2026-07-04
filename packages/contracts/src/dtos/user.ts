import { z } from "zod";
import { TenantPlanSchema } from "./tenant.js";

export const UserRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "COMPLIANCE_OFFICER",
  "INTERVIEWER",
  "DEPARTMENT_HEAD",
  "EXECUTIVE",
  "CANDIDATE",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRoleSchema,
  isActive: z.boolean(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type UserDTO = z.infer<typeof UserDTOSchema>;

export const CreateUserInputSchema = z.object({
  tenantId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  password: z.string().min(8),
  role: UserRoleSchema,
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const SeatInfoSchema = z.object({
  plan: TenantPlanSchema,
  used: z.number().int(),
  limit: z.number().int(),
  unlimited: z.boolean(),
  remaining: z.number().int().nullable(),
});
export type SeatInfo = z.infer<typeof SeatInfoSchema>;
