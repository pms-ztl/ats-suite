/**
 * Redis Pub/Sub — fan-out notifications to SSE clients across all
 * notification-service pods (each pod subscribes to user:{userId} channels
 * and writes to that user's open SSE connections).
 *
 * Architecture:
 *   1. NATS subscriber receives domain event
 *   2. Handler creates Notification row in DB
 *   3. Handler publishes to Redis channel `user:{userId}`
 *   4. Every notification-service pod with an open SSE connection for
 *      that userId writes the event downstream
 */
import { Redis } from "ioredis";

let publisher: Redis | null = null;
let subscriber: Redis | null = null;

function getRedisUrl(): string {
  return process.env["REDIS_URL"] ?? "redis://localhost:6381";
}

export function getPublisher(): Redis {
  if (!publisher) {
    publisher = new Redis(getRedisUrl(), { maxRetriesPerRequest: null });
  }
  return publisher;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(getRedisUrl(), { maxRetriesPerRequest: null });
  }
  return subscriber;
}

/** Publish a notification to all listeners on user:{userId} channel. */
export async function publishToUser(userId: string, notification: unknown): Promise<void> {
  await getPublisher().publish(`user:${userId}`, JSON.stringify(notification));
}

/**
 * Subscribe an SSE handler to a single user's channel. Returns an unsub fn.
 * Each call creates its own subscriber connection so SSE close cleans up
 * independently.
 */
export async function subscribeToUser(
  userId: string,
  handler: (notification: unknown) => void
): Promise<() => Promise<void>> {
  const sub = new Redis(getRedisUrl(), { maxRetriesPerRequest: null });
  const channel = `user:${userId}`;
  await sub.subscribe(channel);
  sub.on("message", (ch, payload) => {
    if (ch !== channel) return;
    try {
      handler(JSON.parse(payload));
    } catch {
      // bad payload — skip
    }
  });
  return async () => {
    await sub.unsubscribe(channel).catch(() => {});
    await sub.quit().catch(() => {});
  };
}
