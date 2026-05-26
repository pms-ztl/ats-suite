import { z } from "zod";
import { UserRoleSchema } from "../dtos/user.js";

export const UserInvitedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  role: UserRoleSchema,
  invitedByUserId: z.string().uuid(),
});
export type UserInvitedPayload = z.infer<typeof UserInvitedPayloadSchema>;

export const UserDeactivatedPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  deactivatedByUserId: z.string().uuid(),
});
export type UserDeactivatedPayload = z.infer<typeof UserDeactivatedPayloadSchema>;
