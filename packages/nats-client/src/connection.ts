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
}

export async function connectNats(opts: ConnectNatsOptions): Promise<NatsConnection> {
  if (connection) return connection;
  const options: ConnectionOptions = {
    name: opts.serviceName,
    servers: opts.url ?? process.env["NATS_URL"] ?? "nats://nats:4222",
    reconnect: true,
    maxReconnectAttempts: -1,         // forever
    reconnectTimeWait: 1000,
  };
  connection = await connect(options);

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
