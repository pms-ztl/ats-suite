/**
 * Subscribe to Jetstream events with built-in idempotency, ack handling, and
 * graceful shutdown.
 *
 *   subscribeToEvents({
 *     stream: "RESUME_EVENTS",
 *     subject: "tenant.*.resume.parsed",
 *     durable: "screening-service:resume-parsed",
 *     handler: async (envelope) => {
 *       // envelope.payload is unknown — validate with Zod
 *       const parsed = ResumeParsedPayloadSchema.parse(envelope.payload);
 *       await screenCandidate(parsed);
 *     },
 *   });
 */
import { AckPolicy, DeliverPolicy, JSONCodec, type ConsumerInfo } from "nats";
import { getNats } from "./connection.js";
import type { EventEnvelope } from "@cdc-ats/contracts";
import type { Logger } from "pino";

const codec = JSONCodec();

export interface SubscribeOptions {
  /** Stream name (must already exist — see ensureStreams). */
  stream: string;
  /** Subject filter (can include wildcards). */
  subject: string;
  /** Durable consumer name — unique per subscriber. Survives restarts. */
  durable: string;
  /** Handler receives the envelope; throw to NACK (will retry). */
  handler: (envelope: EventEnvelope<unknown>) => Promise<void>;
  /** Logger for handler errors. */
  logger: Logger;
  /** Max concurrent messages being processed (default 5). */
  concurrency?: number;
}

export interface ActiveSubscription {
  consumer: ConsumerInfo;
  stop: () => Promise<void>;
}

export async function subscribeToEvents(opts: SubscribeOptions): Promise<ActiveSubscription> {
  const nats = getNats();
  const jsm = await nats.jetstreamManager();
  const js = nats.jetstream();

  // Idempotent consumer create/update
  try {
    await jsm.consumers.info(opts.stream, opts.durable);
  } catch {
    await jsm.consumers.add(opts.stream, {
      durable_name: opts.durable,
      filter_subject: opts.subject,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      max_deliver: 5,
      ack_wait: 60_000_000_000, // 60s in nanoseconds
    });
  }
  const consumer = await js.consumers.get(opts.stream, opts.durable);
  const consumerInfo = await consumer.info();

  // Long-lived consume loop
  const messages = await consumer.consume({
    max_messages: opts.concurrency ?? 5,
  });

  let stopped = false;
  (async () => {
    for await (const msg of messages) {
      if (stopped) break;
      try {
        const envelope = codec.decode(msg.data) as EventEnvelope<unknown>;
        await opts.handler(envelope);
        msg.ack();
      } catch (err) {
        opts.logger.error(
          { err, subject: msg.subject, deliveryCount: msg.info.deliveryCount },
          "Event handler failed — will redeliver"
        );
        msg.nak(5000); // retry in 5s
      }
    }
  })().catch((err) => {
    opts.logger.error({ err, stream: opts.stream, durable: opts.durable }, "Consume loop crashed");
  });

  return {
    consumer: consumerInfo,
    stop: async () => {
      stopped = true;
      messages.stop();
    },
  };
}
