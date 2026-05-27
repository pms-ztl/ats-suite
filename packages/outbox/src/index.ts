/**
 * @cdc-ats/outbox — transactional outbox helpers for guaranteed NATS delivery.
 *
 * The problem
 *   Services publish NATS events after committing domain changes. If the
 *   service crashes in between, the event is lost — billing-service's
 *   cost projection drifts, notification-service never fires the email.
 *
 * The pattern
 *   1. Each service has an `Outbox` table in its own DB
 *   2. When the domain change writes (e.g. AgentRun row), we ALSO write
 *      an Outbox row in the SAME transaction → atomic, no half-states
 *   3. A background worker polls PENDING outbox rows + publishes to NATS
 *   4. Successful publishes mark the row SENT
 *   5. Failures stay PENDING; worker retries with backoff
 *   6. Old SENT rows are pruned periodically
 *
 * Usage
 *   import { enqueueOutbox, startOutboxWorker } from "@cdc-ats/outbox";
 *
 *   // In a route handler / worker:
 *   await prisma.$transaction(async (tx) => {
 *     await tx.agentRun.create({ data: ... });
 *     await enqueueOutbox(tx as any, {
 *       subject: tenantSubject(tenantId, "agent", "completed"),
 *       type: "agent.completed",
 *       tenantId,
 *       payload: { ... },
 *     });
 *   });
 *
 *   // On service boot:
 *   const stop = startOutboxWorker({ logger, prisma, pollMs: 2000 });
 *   // Register stop() with registerGracefulShutdown
 */
import type { Logger } from "pino";

export interface OutboxEntry {
  subject: string;
  type: string;
  tenantId: string | null;
  payload: Record<string, unknown>;
}

/**
 * Enqueue an event inside a Prisma transaction. The `tx` param is the
 * transaction client passed to `prisma.$transaction(async (tx) => ...)`.
 * Each consuming service must have an `Outbox` model with the schema
 * documented in OUTBOX_SCHEMA below.
 */
export async function enqueueOutbox(
  tx: { outbox: { create: (args: { data: any }) => Promise<unknown> } },
  entry: OutboxEntry,
): Promise<void> {
  await tx.outbox.create({
    data: {
      subject: entry.subject,
      type: entry.type,
      tenantId: entry.tenantId,
      payload: entry.payload as any,
      status: "PENDING",
      attemptCount: 0,
    },
  });
}

export interface OutboxWorkerOptions {
  logger: Logger;
  /** The service's prisma client. Must have an `outbox` model. */
  prisma: any;
  /** How often to poll for PENDING rows (default 2s). */
  pollMs?: number;
  /** Max batch size per poll (default 50). */
  batchSize?: number;
  /** Stop retrying after this many attempts (default 10). */
  maxAttempts?: number;
  /** Prune SENT rows older than this many days (default 7). */
  pruneAfterDays?: number;
}

/**
 * Returns a stop() function. Call it from your shutdown hook.
 */
export function startOutboxWorker(opts: OutboxWorkerOptions): () => Promise<void> {
  const pollMs = opts.pollMs ?? 2_000;
  const batchSize = opts.batchSize ?? 50;
  const maxAttempts = opts.maxAttempts ?? 10;
  const pruneAfterDays = opts.pruneAfterDays ?? 7;
  let stopping = false;
  let timer: NodeJS.Timeout | null = null;
  let lastPrune = 0;

  const tick = async (): Promise<void> => {
    if (stopping) return;
    try {
      // Lazy-import nats-client so the outbox package doesn't directly
      // depend on it at compile time (avoids circular workspace builds).
      const { publishEvent } = await import("@cdc-ats/nats-client");

      // Pick up to batchSize PENDING rows ordered by oldest first.
      // Use SKIP LOCKED if multiple workers — for single-replica services
      // this is fine without it.
      const pending = await opts.prisma.outbox.findMany({
        where: {
          status: "PENDING",
          attemptCount: { lt: maxAttempts },
        },
        orderBy: { createdAt: "asc" },
        take: batchSize,
      });

      for (const row of pending) {
        try {
          await publishEvent({
            subject: row.subject,
            type: row.type,
            tenantId: row.tenantId,
            payload: row.payload,
          });
          await opts.prisma.outbox.update({
            where: { id: row.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
              attemptCount: { increment: 1 },
            },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const nextAttempt = (row.attemptCount ?? 0) + 1;
          await opts.prisma.outbox
            .update({
              where: { id: row.id },
              data: {
                attemptCount: { increment: 1 },
                lastError: msg.slice(0, 1000),
                status: nextAttempt >= maxAttempts ? "FAILED" : "PENDING",
              },
            })
            .catch(() => { /* swallow */ });
          opts.logger.warn(
            { err: msg, outboxId: row.id, attempt: nextAttempt, subject: row.subject },
            "outbox publish failed",
          );
        }
      }

      // Prune old SENT rows once an hour
      if (Date.now() - lastPrune > 60 * 60 * 1000) {
        lastPrune = Date.now();
        const cutoff = new Date(Date.now() - pruneAfterDays * 24 * 60 * 60 * 1000);
        const { count } = await opts.prisma.outbox.deleteMany({
          where: { status: "SENT", sentAt: { lt: cutoff } },
        });
        if (count > 0) {
          opts.logger.info({ pruned: count, olderThanDays: pruneAfterDays }, "outbox pruned");
        }
      }
    } catch (err) {
      opts.logger.warn({ err }, "outbox tick errored — will retry");
    } finally {
      if (!stopping) timer = setTimeout(tick, pollMs);
    }
  };

  timer = setTimeout(tick, pollMs);
  opts.logger.info({ pollMs, batchSize, maxAttempts }, "outbox worker started");

  return async () => {
    stopping = true;
    if (timer) clearTimeout(timer);
    opts.logger.info("outbox worker stopped");
  };
}

/**
 * Each consuming service MUST add this to their Prisma schema (and run a
 * migration). Identical across services so the @cdc-ats/outbox helpers
 * can speak to any of them.
 *
 * ```prisma
 * enum OutboxStatus {
 *   PENDING
 *   SENT
 *   FAILED
 * }
 *
 * model Outbox {
 *   id           String       @id @default(uuid())
 *   subject      String       // NATS subject, e.g. tenant.{id}.agent.completed
 *   type         String       // logical event type, e.g. agent.completed
 *   tenantId     String?      // null for platform-wide events
 *   payload      Json
 *   status       OutboxStatus @default(PENDING)
 *   attemptCount Int          @default(0)
 *   lastError    String?
 *   sentAt       DateTime?
 *   createdAt    DateTime     @default(now())
 *   updatedAt    DateTime     @updatedAt
 *
 *   @@index([status, createdAt])
 *   @@index([tenantId])
 * }
 * ```
 */
export const OUTBOX_SCHEMA = "see source — Prisma schema documented in JSDoc";
