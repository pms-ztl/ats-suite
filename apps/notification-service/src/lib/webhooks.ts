/**
 * Outbound webhooks + audit trail.
 *
 * deliverWebhooks() fans a domain event out to every active tenant webhook
 * subscribed to it, signed with HMAC-SHA256 so receivers can verify authenticity
 * (X-CDC-Signature: sha256=<hex>). writeAudit() appends an immutable AuditLog
 * row. Both are best-effort and never throw into the event pipeline.
 */
import { createHmac } from "crypto";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";

export async function writeAudit(opts: {
  tenantId: string;
  action: string;
  actorUserId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: opts.tenantId,
        action: opts.action,
        actorUserId: opts.actorUserId ?? null,
        targetType: opts.targetType ?? null,
        targetId: opts.targetId ?? null,
        metadata: (opts.metadata ?? {}) as any,
      },
    });
  } catch {
    /* audit is best-effort; never break the event flow */
  }
}

export async function deliverWebhooks(
  tenantId: string,
  eventType: string,
  payload: Record<string, unknown>,
  logger?: Logger,
): Promise<void> {
  let hooks;
  try {
    hooks = await prisma.webhook.findMany({ where: { tenantId, active: true } });
  } catch {
    return;
  }
  const targets = hooks.filter((h) => h.events.length === 0 || h.events.includes(eventType));
  if (targets.length === 0) return;

  const body = JSON.stringify({ event: eventType, tenantId, deliveredAt: new Date().toISOString(), data: payload });
  await Promise.all(
    targets.map(async (h) => {
      const sig = createHmac("sha256", h.secret).update(body).digest("hex");
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(h.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CDC-Event": eventType,
            "X-CDC-Signature": `sha256=${sig}`,
          },
          body,
          signal: controller.signal,
        });
        clearTimeout(timer);
        await prisma.webhook.update({
          where: { id: h.id },
          data: {
            lastStatus: res.status,
            lastDeliveryAt: new Date(),
            failureCount: res.ok ? 0 : { increment: 1 },
            // auto-disable a webhook after 20 consecutive failures
            ...(res.ok ? {} : h.failureCount + 1 >= 20 ? { active: false } : {}),
          },
        }).catch(() => undefined);
      } catch (err) {
        logger?.warn({ err, webhookId: h.id }, "webhook delivery failed");
        await prisma.webhook.update({
          where: { id: h.id },
          data: { failureCount: { increment: 1 }, lastStatus: 0, lastDeliveryAt: new Date() },
        }).catch(() => undefined);
      }
    }),
  );
}

/** Convenience: record an audit row AND fan the event out to webhooks. */
export async function auditAndDeliver(
  eventType: string,
  payload: Record<string, unknown> & { tenantId: string },
  opts: { actorUserId?: string | null; targetType?: string; targetId?: string; logger?: Logger } = {},
): Promise<void> {
  await writeAudit({
    tenantId: payload.tenantId,
    action: eventType,
    actorUserId: opts.actorUserId ?? (payload["triggeredByUserId"] as string) ?? null,
    targetType: opts.targetType ?? null,
    targetId: opts.targetId ?? null,
    metadata: payload,
  });
  await deliverWebhooks(payload.tenantId, eventType, payload, opts.logger);
}
