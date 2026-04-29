import crypto from 'crypto';
import prisma from '../utils/prisma';
import logger from './logger';

export type WebhookEvent =
  | 'candidate.created' | 'candidate.updated' | 'candidate.stage_changed'
  | 'application.created' | 'application.stage_changed'
  | 'interview.scheduled' | 'interview.completed' | 'interview.cancelled'
  | 'requisition.created' | 'requisition.filled' | 'requisition.closed'
  | 'offer.created' | 'offer.accepted' | 'offer.rejected'
  | 'hire.completed';

interface WebhookPayload {
  event: WebhookEvent;
  tenantId: string;
  data: Record<string, unknown>;
  timestamp: string;
}

function signPayload(secret: string, payload: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify an inbound webhook signature.
 * Use this to validate callbacks from DocuSign, Checkr, etc.
 * Returns true if the signature matches, false otherwise.
 */
export function verifyWebhookSignature(
  secret: string,
  payload: string,
  receivedSignature: string,
): boolean {
  if (!secret) {
    // No secret configured — cannot verify. Reject for safety.
    return false;
  }
  const expectedSignature = `sha256=${signPayload(secret, payload)}`;
  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature),
    );
  } catch {
    return false; // Length mismatch
  }
}

export async function dispatchWebhook(
  tenantId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  // Find active webhooks for this tenant and event
  const webhooks = await (prisma.integration as any).findMany({
    where: {
      tenantId,
      type: 'WEBHOOK',
      status: 'ACTIVE',
    },
  });

  if (!webhooks || webhooks.length === 0) return;

  const payload: WebhookPayload = {
    event,
    tenantId,
    data,
    timestamp: new Date().toISOString(),
  };

  const payloadStr = JSON.stringify(payload);

  // Fire and forget — don't block the request
  for (const webhook of webhooks) {
    const config = (webhook.config as any) || {};
    const url = config.webhookUrl;
    const secret = config.secret;
    if (!secret) {
      logger.warn({ webhookId: webhook.id, url }, 'Webhook skipped — no secret configured (insecure)');
      continue;
    }

    // Filter by event if webhook has event filters
    const events: string[] = config.events || [];
    if (events.length > 0 && !events.includes(event)) continue;

    if (!url) continue;

    const signature = signPayload(secret, payloadStr);

    // Retry up to 3 times with exponential backoff
    (async () => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-ATS-Signature': `sha256=${signature}`,
              'X-ATS-Event': event,
              'X-ATS-Delivery': crypto.randomUUID(),
            },
            body: payloadStr,
            signal: AbortSignal.timeout(10000),
          });

          // Log delivery
          await (prisma.auditLog as any).create({
            data: {
              tenantId,
              action: 'WEBHOOK_DELIVERED',
              resource: 'webhook',
              resourceId: webhook.id,
              metadata: {
                event,
                url,
                status: res.status,
                attempt,
              },
            },
          }).catch(() => {}); // Don't fail on audit log error

          if (res.ok) break;
        } catch (err) {
          if (attempt === 3) {
            // Log final failure
            await (prisma.auditLog as any).create({
              data: {
                tenantId,
                action: 'WEBHOOK_FAILED',
                resource: 'webhook',
                resourceId: webhook.id,
                metadata: { event, url, error: String(err), attempt },
              },
            }).catch(() => {});
          } else {
            // Exponential backoff: 1s, 2s, 4s
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }
    })();
  }
}
