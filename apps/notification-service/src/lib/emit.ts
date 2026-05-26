/**
 * emitNotification — persists a notification + fans out to all recipient
 * users via Redis Pub/Sub.
 *
 * Recipient resolution:
 *   - userId set:                      → publish to user:{userId}
 *   - userId null + tenantId set:      → fetch user IDs from identity-service
 *                                         and publish to each user:{id}
 *   - userId null + tenantId null:     → publish to all SUPER_ADMIN users
 *
 * Phase 4 implementation: skips identity-service round-trip for the
 * broadcast case — the SSE endpoint itself filters with userScopeWhere
 * so any user opening their stream will see broadcast notifications even
 * without explicit publish. (Phase 4.5: add identity-service /internal/
 * users?role=SUPER_ADMIN call to push instantly to all super-admins.)
 */
import { prisma } from "./prisma.js";
import { publishToUser } from "./redis-pubsub.js";

export type NotificationType =
  | "PLAN_CHANGE_REQUESTED"
  | "PLAN_CHANGE_APPROVED"
  | "PLAN_CHANGE_REJECTED"
  | "NEW_TENANT_SIGNUP"
  | "BULK_UPLOAD_COMPLETED"
  | "SEAT_LIMIT_REACHED"
  | "INTERVIEW_FEEDBACK_NEW"
  | "SYSTEM";

export interface NotificationInput {
  tenantId: string | null;
  userId: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export async function emitNotification(input: NotificationInput) {
  const saved = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      metadata: (input.metadata ?? {}) as any,
    },
  });

  // Live push: only direct-user notifications get instant fan-out for now
  // (broadcast notifications are picked up by the SSE poll cycle and
  // /unread-count refresh when the user opens the stream — adequate for v1).
  if (input.userId) {
    await publishToUser(input.userId, saved).catch(() => { /* non-fatal */ });
  }

  return saved;
}
