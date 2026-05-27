/**
 * emitNotification — persists a notification + creates per-channel
 * NotificationDelivery rows + enqueues delivery jobs.
 *
 * Recipient resolution:
 *   - userId set:                      → publish to user:{userId} (in_app)
 *   - userId null + tenantId set:      → broadcast (SSE polls pick up;
 *                                         email/Slack uses tenant config)
 *   - userId null + tenantId null:     → platform-wide super-admin notice
 *
 * Channels:
 *   - "in_app"  → DB row + Redis pub/sub for SSE (immediate)
 *   - "email"   → fetch recipient email from identity-service, create
 *                 NotificationDelivery row, enqueue BullMQ job
 *   - "slack"   → look up TenantIntegration{kind:"slack"}, create
 *                 NotificationDelivery row with webhook URL as recipient,
 *                 enqueue BullMQ job
 */
import { prisma } from "./prisma.js";
import { publishToUser } from "./redis-pubsub.js";
import { enqueueDelivery } from "../workers/delivery.worker.js";

export type NotificationType =
  | "PLAN_CHANGE_REQUESTED"
  | "PLAN_CHANGE_APPROVED"
  | "PLAN_CHANGE_REJECTED"
  | "NEW_TENANT_SIGNUP"
  | "BULK_UPLOAD_COMPLETED"
  | "SEAT_LIMIT_REACHED"
  | "INTERVIEW_FEEDBACK_NEW"
  | "SYSTEM";

export type DeliveryChannel = "in_app" | "email" | "slack";

export interface NotificationInput {
  tenantId: string | null;
  userId: string | null;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  /** Defaults to ["in_app"]. */
  channels?: DeliveryChannel[];
}

export async function emitNotification(input: NotificationInput) {
  const channels = input.channels ?? ["in_app"];

  const saved = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      metadata: (input.metadata ?? {}) as any,
      channels,
    },
  });

  // ── in_app: Redis pub/sub fan-out for live SSE ────────────────────────────
  if (channels.includes("in_app") && input.userId) {
    await publishToUser(input.userId, saved).catch(() => { /* non-fatal */ });
  }

  // ── email: resolve recipient + create delivery row + enqueue ──────────────
  if (channels.includes("email")) {
    try {
      const recipients = await resolveEmailRecipients(input);
      for (const email of recipients) {
        const delivery = await prisma.notificationDelivery.create({
          data: {
            notificationId: saved.id,
            tenantId: input.tenantId,
            channel: "EMAIL",
            recipient: email,
            status: "PENDING",
          },
        });
        await enqueueDelivery(delivery.id);
      }
    } catch {
      // Best effort — notification still persisted
    }
  }

  // ── slack: look up tenant's webhook URL + create delivery row + enqueue ──
  if (channels.includes("slack") && input.tenantId) {
    try {
      const integration = await prisma.tenantIntegration.findUnique({
        where: { tenantId_kind: { tenantId: input.tenantId, kind: "slack" } },
      });
      if (integration?.enabled) {
        const config = integration.config as { webhookUrl?: string };
        if (config.webhookUrl) {
          const delivery = await prisma.notificationDelivery.create({
            data: {
              notificationId: saved.id,
              tenantId: input.tenantId,
              channel: "SLACK",
              recipient: config.webhookUrl,
              status: "PENDING",
            },
          });
          await enqueueDelivery(delivery.id);
        }
      }
    } catch {
      // Best effort
    }
  }

  return saved;
}

// ── Email recipient resolution ──────────────────────────────────────────────

async function resolveEmailRecipients(input: NotificationInput): Promise<string[]> {
  const identityUrl = process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001";
  const userHeaders = {
    "X-Tenant-Id": input.tenantId ?? "",
    "X-User-Id": "system",
    "X-User-Role": "SUPER_ADMIN",
  };
  // Direct user
  if (input.userId) {
    try {
      const res = await fetch(`${identityUrl}/internal/users/${input.userId}`, { headers: userHeaders });
      if (res.ok) {
        const body: any = await res.json();
        return body.data?.email ? [body.data.email] : [];
      }
    } catch { /* fall through */ }
    return [];
  }
  // Broadcast to tenant — fetch all active users in the tenant
  if (input.tenantId) {
    try {
      const res = await fetch(`${identityUrl}/internal/users`, { headers: userHeaders });
      if (res.ok) {
        const body: any = await res.json();
        const users = Array.isArray(body.data) ? body.data : [];
        return users.filter((u: any) => u.isActive && u.email).map((u: any) => u.email);
      }
    } catch { /* fall through */ }
    return [];
  }
  // Platform-wide super-admin — fetch all SUPER_ADMIN users across tenants
  try {
    const res = await fetch(`${identityUrl}/internal/users?role=SUPER_ADMIN`, { headers: userHeaders });
    if (res.ok) {
      const body: any = await res.json();
      const users = Array.isArray(body.data) ? body.data : [];
      return users.filter((u: any) => u.isActive && u.email).map((u: any) => u.email);
    }
  } catch { /* fall through */ }
  return [];
}
