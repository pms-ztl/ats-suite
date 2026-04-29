import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import logger from './logger';

// ── Redis connection ──────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let connection: IORedis | null = null;

export function getRedisConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
    });
    connection.on('error', (err) => logger.error({ err }, 'Redis connection error'));
    connection.on('connect', () => logger.info('Redis connected'));
  }
  return connection;
}

// ── Queue definitions ─────────────────────────────────────────────────

export const QUEUE_NAMES = {
  RESUME_PARSE: 'resume-parse',
  SCREENING: 'ai-screening',
  NOTIFICATION: 'notification',
} as const;

const queues: Map<string, Queue> = new Map();

export function getQueue(name: string): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, { connection: getRedisConnection() }));
  }
  return queues.get(name)!;
}

// ── Job types ─────────────────────────────────────────────────────────

export interface ResumeParseJobData {
  candidateId: string;
  tenantId: string;
  userId: string;
  resumeId: string;
}

export interface ScreeningJobData {
  candidateId: string;
  requisitionId: string;
  tenantId: string;
  userId: string;
}

export interface NotificationJobData {
  type: 'email' | 'slack' | 'webhook';
  tenantId: string;
  payload: Record<string, unknown>;
}

// ── Enqueue helpers ───────────────────────────────────────────────────

export async function enqueueResumeParse(data: ResumeParseJobData): Promise<string> {
  const queue = getQueue(QUEUE_NAMES.RESUME_PARSE);
  const job = await queue.add('parse', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
    jobId: `parse-${data.candidateId}-${data.resumeId}`, // Idempotency key
  });
  logger.info({ jobId: job.id, candidateId: data.candidateId }, 'Resume parse job enqueued');
  return job.id!;
}

export async function enqueueScreening(data: ScreeningJobData): Promise<string> {
  const queue = getQueue(QUEUE_NAMES.SCREENING);
  const job = await queue.add('screen', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
    removeOnComplete: 100,
    removeOnFail: 500,
    jobId: `screen-${data.candidateId}-${data.requisitionId}`, // Idempotency key
  });
  logger.info({ jobId: job.id, candidateId: data.candidateId }, 'Screening job enqueued');
  return job.id!;
}

export async function enqueueNotification(data: NotificationJobData): Promise<string> {
  const queue = getQueue(QUEUE_NAMES.NOTIFICATION);
  const job = await queue.add(data.type, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail: 200,
  });
  return job.id!;
}

// ── Graceful shutdown ─────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  for (const [name, queue] of queues) {
    await queue.close();
    logger.info({ queue: name }, 'Queue closed');
  }
  if (connection) {
    await connection.quit();
    connection = null;
  }
}
