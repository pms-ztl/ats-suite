/**
 * Publish events to Jetstream with the standard envelope shape.
 *
 *   await publishEvent({
 *     subject: tenantSubject(tenantId, "resume", "parsed"),
 *     type: "resume.parsed",
 *     tenantId,
 *     payload: { candidateId, resumeId, ... } satisfies ResumeParsedPayload,
 *   });
 */
import { randomUUID } from "crypto";
import { JSONCodec } from "nats";
import { getNats } from "./connection.js";
import type { EventEnvelope } from "@cdc-ats/contracts";

const codec = JSONCodec();

export interface PublishOptions<T> {
  subject: string;
  type: string;
  tenantId: string | null;
  payload: T;
  /** Optional event ID for testing / deduplication; defaults to UUIDv4. */
  eventId?: string;
  /** Optional OTel trace context (W3C traceparent header). */
  traceparent?: string;
}

export async function publishEvent<T>(opts: PublishOptions<T>): Promise<string> {
  const nats = getNats();
  const js = nats.jetstream();
  const envelope: EventEnvelope<T> = {
    eventId: opts.eventId ?? randomUUID(),
    type: opts.type,
    tenantId: opts.tenantId,
    emittedAt: new Date().toISOString(),
    traceparent: opts.traceparent,
    payload: opts.payload,
  };
  const ack = await js.publish(opts.subject, codec.encode(envelope), {
    msgID: envelope.eventId,  // Jetstream deduplication
  });
  return `${ack.stream}-${ack.seq}`;
}
