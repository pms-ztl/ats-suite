import { z } from "zod";

/**
 * Every NATS event carries these envelope fields so consumers can do
 * idempotency, tenant scoping, and trace correlation without unpacking the
 * full payload.
 */
export const EventEnvelopeSchema = z.object({
  /** UUID v4 — used as the idempotency key by subscribers. */
  eventId: z.string().uuid(),
  /** Event type — matches the subject leaf (e.g. "resume.parsed"). */
  type: z.string(),
  /** Tenant this event belongs to (null = platform-wide). */
  tenantId: z.string().uuid().nullable(),
  /** When the event was emitted (ISO). */
  emittedAt: z.string().datetime(),
  /** Optional trace context (OpenTelemetry trace ID + span ID). */
  traceparent: z.string().optional(),
  /** The actual payload. */
  payload: z.unknown(),
});
export type EventEnvelope<T = unknown> = Omit<z.infer<typeof EventEnvelopeSchema>, "payload"> & { payload: T };

/**
 * NATS subject helper — encodes tenant scoping into the subject hierarchy so
 * consumers can subscribe to one tenant or use wildcards.
 *
 *   tenantSubject("abc-123", "resume", "parsed") → "tenant.abc-123.resume.parsed"
 *   tenantSubject(null, "tenant", "created")     → "platform.tenant.created"
 */
export function tenantSubject(tenantId: string | null, domain: string, event: string): string {
  if (tenantId === null) return `platform.${domain}.${event}`;
  return `tenant.${tenantId}.${domain}.${event}`;
}

/** Builds the wildcard subject used by consumers that watch every tenant. */
export function wildcardSubject(domain: string, event: string): string {
  return `tenant.*.${domain}.${event}`;
}
