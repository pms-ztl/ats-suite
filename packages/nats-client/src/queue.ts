/**
 * BullMQ queue helpers — services that run async work (resume-parse,
 * screening, feedback-advance) use these instead of rolling their own.
 */
import { Queue, Worker, type Job } from "bullmq";
import IORedis, { type Redis } from "ioredis";

let connection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!connection) {
    const url = process.env["REDIS_URL"] ?? "redis://localhost:6381";
    connection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return connection;
}

export function getQueue<T = unknown>(name: string): Queue<T> {
  // BullMQ bundles its own ioredis with slightly different types — cast to any
  return new Queue<T>(name, { connection: getRedisConnection() as any });
}

export function createWorker<T = unknown>(
  name: string,
  processor: (job: Job<T>) => Promise<unknown>,
  opts: { concurrency?: number; limiter?: { max: number; duration: number } } = {}
): Worker<T> {
  const worker = new Worker<T>(name, processor, {
    connection: getRedisConnection() as any,
    concurrency: opts.concurrency ?? 3,
    limiter: opts.limiter,
  });
  return worker;
}

export async function closeRedis(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
