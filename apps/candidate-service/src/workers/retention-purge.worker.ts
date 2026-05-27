/**
 * Phase 20 — data retention purge worker.
 *
 * Runs on a daily schedule (BullMQ repeat). For each tenant:
 *   1. Fetches `dataRetentionDays` from tenant-service
 *   2. Finds Candidates where updatedAt < now - retentionDays AND
 *      isAnonymized is false (skip already-deleted)
 *   3. Calls the in-process GDPR delete logic for each — same flow as
 *      manual deletion via the gateway, so we don't duplicate the
 *      anonymization rules
 *
 * Why daily, not realtime: retention is a compliance policy, not a hard
 * deadline. Once a day at 3am UTC is fine and avoids pounding the DB.
 *
 * Why BullMQ repeat, not node-cron: the worker already lives in BullMQ
 * (resume-parse, screening, feedback-advance). Reusing the same Redis
 * means one place to monitor + retry semantics for free.
 */
import { Worker, Queue, type Job } from "bullmq";
import { Redis } from "ioredis";
import type { Logger } from "pino";
import { prisma } from "../lib/prisma.js";

const QUEUE = "candidate-retention-purge";
const JOB_NAME = "purge";
const tenantServiceUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";

/**
 * Tick the purge — runs once per scheduled execution. Iterates through all
 * tenants we know about (discovered from the Candidate table itself — we
 * don't have a direct tenant list in this service) and processes each.
 */
async function runPurgeTick(logger: Logger): Promise<{
  tenantsProcessed: number;
  candidatesAnonymized: number;
}> {
  // Distinct tenant IDs in candidate-db. This is an O(tenants) query and
  // tenants is small — fine for a daily job.
  const tenants = await prisma.candidate.findMany({
    where: { isAnonymized: false },
    select: { tenantId: true },
    distinct: ["tenantId"],
  });

  let candidatesAnonymized = 0;

  for (const { tenantId } of tenants) {
    let retentionDays = 730;
    try {
      const res = await fetch(`${tenantServiceUrl}/internal/retention`, {
        headers: {
          "x-tenant-id": tenantId,
          "x-user-id": "system",
          "x-user-role": "ADMIN",
        },
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: { dataRetentionDays?: number } };
        retentionDays = body.data?.dataRetentionDays ?? 730;
      } else {
        logger.warn({ tenantId, status: res.status }, "retention fetch failed; using 730d default");
      }
    } catch (err) {
      logger.warn({ tenantId, err }, "retention fetch error; using 730d default");
    }

    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const candidates = await prisma.candidate.findMany({
      where: {
        tenantId,
        isAnonymized: false,
        updatedAt: { lt: cutoff },
      },
      select: { id: true },
      // Cap per-tick to avoid one huge tenant starving others. The next
      // tick will pick up the rest.
      take: 500,
    });

    for (const { id } of candidates) {
      try {
        await anonymizeCandidate(tenantId, id);
        candidatesAnonymized++;
      } catch (err) {
        logger.warn({ tenantId, candidateId: id, err }, "candidate purge failed; will retry next tick");
      }
    }

    if (candidates.length > 0) {
      logger.info({ tenantId, retentionDays, purged: candidates.length, cutoff: cutoff.toISOString() }, "tenant purge tick complete");
    }
  }

  return { tenantsProcessed: tenants.length, candidatesAnonymized };
}

/**
 * Same anonymization shape as the manual GDPR delete route in `routes/gdpr.ts`.
 * Kept inline (not extracted to a shared helper) because the GDPR route
 * additionally writes an audit log and returns a structured response; the
 * worker just needs the data effects. If we ever change anonymization
 * rules, search for "anonymized-Email" comment in both files.
 */
async function anonymizeCandidate(tenantId: string, candidateId: string): Promise<void> {
  const anonymizedEmail = `deleted-${candidateId}@gdpr.invalid`;
  await prisma.$transaction([
    prisma.applicationAttachment.deleteMany({
      where: {
        tenantId,
        applicationId: {
          in: (
            await prisma.application.findMany({
              where: { tenantId, candidateId },
              select: { id: true },
            })
          ).map((a) => a.id),
        },
      },
    }),
    prisma.candidateNote.deleteMany({ where: { tenantId, candidateId } }),
    prisma.application.deleteMany({ where: { tenantId, candidateId } }),
    prisma.candidate.update({
      where: { id: candidateId },
      data: {
        email: anonymizedEmail,
        firstName: "Anonymized",
        lastName: "User",
        phone: null,
        location: null,
        linkedinUrl: null,
        portfolioUrl: null,
        summary: null,
        tags: [],
        source: "gdpr-retention-purge",
        isAnonymized: true,
      },
    }),
  ]);
}

/**
 * Start the worker. Returns a stop function (call from graceful shutdown).
 * Returns null if Redis is not configured (dev mode without infra is OK).
 */
export function startRetentionPurgeWorker(logger: Logger): (() => Promise<void>) | null {
  const url = process.env["REDIS_URL"];
  if (!url) {
    logger.info("retention purge worker disabled — REDIS_URL not set");
    return null;
  }

  const conn = new Redis(url, { maxRetriesPerRequest: null });
  const queue = new Queue(QUEUE, { connection: conn as any });

  // Schedule a daily run at 03:00 UTC. We use BullMQ's repeat option
  // (cron-syntax) so the schedule survives pod restarts via Redis state.
  // For local dev / demos, the env var RETENTION_PURGE_INTERVAL_MIN
  // overrides to a frequent interval so you don't have to wait a day.
  const intervalMin = Number(process.env["RETENTION_PURGE_INTERVAL_MIN"]);
  const repeatOpts = Number.isFinite(intervalMin) && intervalMin > 0
    ? { every: intervalMin * 60 * 1000 }
    : { pattern: "0 3 * * *", tz: "UTC" };

  queue
    .add(JOB_NAME, {}, { repeat: repeatOpts, jobId: "retention-purge-daily" })
    .catch((err) => logger.warn({ err }, "failed to schedule retention purge job"));

  const worker = new Worker(
    QUEUE,
    async (_job: Job) => {
      const result = await runPurgeTick(logger);
      logger.info(result, "retention purge tick finished");
      return result;
    },
    { connection: conn as any, concurrency: 1 },
  );

  worker.on("ready", () => logger.info({ schedule: repeatOpts }, "retention purge worker ready"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err?.message }, "retention purge failed"));

  return async () => {
    await worker.close().catch(() => {});
    await queue.close().catch(() => {});
    await conn.quit().catch(() => {});
  };
}
