import { z } from "zod";

export const NotificationTypeSchema = z.enum([
  "PLAN_CHANGE_REQUESTED",
  "PLAN_CHANGE_APPROVED",
  "PLAN_CHANGE_REJECTED",
  "NEW_TENANT_SIGNUP",
  "BULK_UPLOAD_COMPLETED",
  "SEAT_LIMIT_REACHED",
  "INTERVIEW_FEEDBACK_NEW",
  "SYSTEM",
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationDTOSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
  type: NotificationTypeSchema,
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  readAt: z.string().datetime().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});
export type NotificationDTO = z.infer<typeof NotificationDTOSchema>;
