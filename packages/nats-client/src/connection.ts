/**
 * NATS connection singleton — every service should call connectNats() once on
 * startup, then publishers/subscribers reuse the connection.
 */
import { connect, type NatsConnection, type ConnectionOptions } from "nats";

let connection: NatsConnection | null = null;

export interface ConnectNatsOptions {
  serviceName: string;
  /** NATS server URL — defaults to NATS_URL env or nats://nats:4222 */
  url?: string;
  /** Max retries for the initial connect (k8s pod startup race). Default 30. */
  maxInitialRetries?: number;
  /** Initial backoff between retries (ms). Doubles up to 30s. Default 1000. */
  initialBackoffMs?: number;
}

export async function connectNats(opts: ConnectNatsOptions): Promise<NatsConnection> {
  if (connection) return connection;
  const options: ConnectionOptions = {
    name: opts.serviceName,
    servers: opts.url ?? process.env["NATS_URL"] ?? "nats://nats:4222",
    reconnect: true,
    maxReconnectAttempts: -1,         // forever, once initial connect succeeds
    reconnectTimeWait: 1000,
  };

  // Initial-connect retry loop. NATS's `reconnect` option doesn't fire for
  // the FIRST connection — if NATS isn't reachable at boot, connect() rejects
  // immediately. In k8s the broker pod may take 10-30s to be ready.
  const maxRetries = opts.maxInitialRetries ?? 30;
  let backoff = opts.initialBackoffMs ?? 1000;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      connection = await connect(options);
      break;
    } catch (err) {
      lastErr = err;
      if (attempt === maxRetries) {
        throw new Error(
          `NATS connect failed after ${maxRetries + 1} attempts: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      await new Promise((r) => setTimeout(r, backoff));
      backoff = Math.min(backoff * 2, 30_000);
    }
  }
  if (!connection) throw new Error(`NATS connect unreachable: ${String(lastErr)}`);

  // Graceful close
  const shutdown = async () => {
    if (connection) {
      await connection.drain();
      connection = null;
    }
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return connection;
}

export function getNats(): NatsConnection {
  if (!connection) {
    throw new Error("NATS connection not initialized. Call connectNats() first.");
  }
  return connection;
}

export async function closeNats(): Promise<void> {
  if (connection) {
    await connection.drain();
    connection = null;
  }
}
