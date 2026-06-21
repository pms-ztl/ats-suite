/**
 * Outbound board-close worker (job-service) - WF-G / SLICE G7.
 *
 * Consumes the `board-close` BullMQ queue (enqueued by the distribution route's
 * DELETE). For one {tenantId, jobPostingId, board} it takes the ATS JobPosting's
 * listing DOWN on ONE external board and stamps the JobBoardDistribution row CLOSED.
 * The inverse of the board-post worker; clones its boot idiom (createWorker + the
 * admin/non-RLS client scoped explicitly by the job's tenantId, since a worker has
 * no request context).
 *
 * == HARD RULES baked in =====================================================
 *  - MODULE GATE: if `job-distribution` is OFF for the tenant we short-circuit (skip
 *    + ack) via @cdc-ats/common isModuleEnabled - the same answer the gateway
 *    requireModule middleware would give. job-distribution is HARD (failMode:
 *    "closed"), so a billing blip fails CLOSED (no board work).
 *  - IDEMPOTENT: adapter.closeJob is idempotent (an unknown / already-closed posting
 *    no-ops) and the BullMQ jobId ({tenant, posting, board}) coalesces retries, so a
 *    re-close never errors. A row with no real externalPostingId never reached a
 *    board, so there is nothing to close there: a local-only CLOSED (the route
 *    already set it) with no board call.
 *  - CREDENTIALS decrypted per-call (notification-service store), never persisted or
 *    logged. A creds-store outage THROWS (BullMQ retries); a 404/disabled integration
 *    returns null -> the board takedown cannot be authenticated, so we keep the row
 *    CLOSED (the route's intent) and record that the board was not confirmed, never a
 *    fabricated success.
 *  - RATE LIMITS respected: the BullMQ limiter caps throughput and each adapter's
 *    fetchJson honors the board's per-second cap + Retry-After 429 backoff inside
 *    closeJob. The worker owns retry/backoff scheduling (attempts: 5).
 *  - NO auto-reject: this worker only takes a job listing down; it touches no
 *    candidate decision.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication), DISTINCT from the
 * assessment-provider axis; the two never cross-wire.
 */
import { createWorker } from "@cdc-ats/nats-client";
import { isModuleEnabled } from "@cdc-ats/common";
// Background worker (no HTTP request) - scopes by the job's tenantId explicitly, so
// it uses the admin (non-RLS) client, like the board-post + board-sync workers.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { BOARD_CLOSE_QUEUE, type BoardCloseJob } from "./../lib/board-queue.js";
import { requireProvider } from "../providers/hiringplatform/index.js";
import { loadPlatformCredentials, PlatformCredsError } from "../providers/hiringplatform/provider-creds.js";
import type { Logger } from "pino";

const JOB_DISTRIBUTION_MODULE_KEY = "job-distribution";

export function startBoardCloseWorker(logger: Logger) {
  const worker = createWorker<BoardCloseJob>(
    BOARD_CLOSE_QUEUE,
    async (job) => {
      const { tenantId, jobPostingId, board } = job.data;
      logger.info({ jobId: job.id, tenantId, jobPostingId, board }, "board-close job starting");

      // ── Module gate: job-distribution off -> skip + ack (no board work). ──────
      if (!(await isModuleEnabled(tenantId, JOB_DISTRIBUTION_MODULE_KEY))) {
        logger.info({ jobId: job.id, tenantId, jobPostingId, board }, "board-close skipped - job-distribution disabled for tenant");
        return { skipped: true, reason: "module-disabled" };
      }

      // ── Resolve the board adapter. An unknown board key is a config error, not a
      // transient fault: do NOT throw (that retries forever) - ack honestly. ─────
      let adapter;
      try {
        adapter = requireProvider(board);
      } catch {
        logger.warn({ jobPostingId, board }, "board-close: unknown board key");
        return { error: "unknown-board", board };
      }

      // ── Load the distribution row (the source of the real external posting id). ─
      const dist = await prisma.jobBoardDistribution.findUnique({
        where: { tenantId_jobPostingId_board: { tenantId, jobPostingId, board } },
        select: { id: true, externalPostingId: true },
      });
      if (!dist) {
        // The row was deleted out from under us; nothing to close (no fabrication).
        logger.warn({ jobPostingId, board }, "board-close: distribution row not found (deleted?)");
        return { error: "distribution-not-found" };
      }

      // ── A row that never reached a board has no listing to take down. The route
      // already flipped it CLOSED; this is a local-only close (no board call). ───
      if (!dist.externalPostingId) {
        logger.info({ jobPostingId, board }, "board-close: no external posting id - local close only (never posted)");
        return { closed: true, reason: "never-posted", board };
      }

      // ── Load DECRYPTED board creds at the point of use (never persisted/logged). ─
      // A creds-store outage THROWS (job retries); a 404/disabled integration returns
      // null -> the takedown cannot be authenticated. Keep the row CLOSED (the route's
      // intent) and record that the board was not confirmed; NEVER fabricate a success.
      let creds;
      try {
        creds = await loadPlatformCredentials(tenantId, board, job.data.userId || "system");
      } catch (err) {
        if (err instanceof PlatformCredsError) {
          logger.warn({ jobPostingId, board, status: err.status }, "board-close: creds store error - will retry");
          throw err;
        }
        throw err;
      }
      if (!creds) {
        logger.info({ jobPostingId, board }, "board-close: no board credentials - board takedown not confirmed (row stays CLOSED)");
        await prisma.jobBoardDistribution
          .update({
            where: { id: dist.id },
            data: { status: "CLOSED", lastError: "board takedown not confirmed: no credentials", lastSyncedAt: new Date() },
          })
          .catch((err) => logger.warn({ err, jobPostingId, board }, "board-close: failed to stamp row"));
        return { closed: true, reason: "no-credentials", board };
      }

      // ── Take the listing down on the board. adapter.closeJob is idempotent (an
      // unknown / already-closed posting no-ops); a transport error throws so BullMQ
      // retries the remaining attempts. ────────────────────────────────────────
      await adapter.closeJob(dist.externalPostingId, creds);

      await prisma.jobBoardDistribution.update({
        where: { id: dist.id },
        data: { status: "CLOSED", lastError: null, lastSyncedAt: new Date() },
      });

      logger.info({ jobPostingId, board, externalPostingId: dist.externalPostingId }, "board-close closed on board");
      return { closed: true, board, externalPostingId: dist.externalPostingId };
    },
    {
      concurrency: Number(process.env["BOARD_CLOSE_CONCURRENCY"] || 3),
      limiter: {
        max: Number(process.env["BOARD_CLOSE_RATE_MAX"] || 8),
        duration: Number(process.env["BOARD_CLOSE_RATE_DURATION_MS"] || 1000),
      },
    },
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "board-close done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "board-close failed"));
  logger.info("board-close worker started");
  return worker;
}
