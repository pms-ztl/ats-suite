/**
 * Outbound disposition-sync worker (job-service) - WF-G / SLICE G6.
 *
 * Consumes the `board-sync` BullMQ queue. For one disposition-sync job it mirrors a
 * candidate disposition (a decision a human ALREADY made in the ATS) BACK to the
 * board that delivered the application, so the board's funnel stays in sync. Clones
 * the board-post worker boot idiom (createWorker + the admin/non-RLS client scoped
 * explicitly by the job's tenantId, since a worker has no request context).
 *
 * == HARD RULES baked in =====================================================
 *  - MODULE GATE: if `job-distribution` is OFF for the tenant we short-circuit (skip
 *    + ack) via @cdc-ats/common isModuleEnabled - the same answer the gateway
 *    requireModule middleware would give. job-distribution is HARD (failMode:
 *    "closed"), so a billing blip fails CLOSED (no board work).
 *  - NO auto-reject. This worker NEVER decides a candidate's fate; `status` (incl.
 *    REJECTED) only REPORTS an existing HITL outcome the human recorded. The adapter
 *    maps it onto the board's disposition vocabulary - it never triggers a reject.
 *  - REAL correlation keys only. The job carries the board's own jobExternalId +
 *    externalApplyId (the values the inbound application delivered). We push the
 *    disposition keyed on THOSE real ids - nothing is synthesized. A board whose
 *    adapter has no dispositionSync capability is a no-op (honest skip).
 *  - CREDENTIALS decrypted per-call (notification-service store), never persisted or
 *    logged. A creds-store outage THROWS (BullMQ retries); a 404/disabled
 *    integration returns null -> skip (the tenant has no usable integration), never
 *    a silent fabricated push.
 *  - RATE LIMITS respected: the BullMQ limiter caps throughput and each adapter's
 *    fetchJson honors the board's per-second cap + Retry-After 429 backoff inside
 *    syncDisposition. The worker owns retry/backoff scheduling (attempts: 5).
 */
import { createWorker } from "@cdc-ats/nats-client";
import { isModuleEnabled } from "@cdc-ats/common";
// Background worker (no HTTP request) - scopes by the job's tenantId explicitly, so
// it uses the admin (non-RLS) client, like the board-post + assessment workers.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { BOARD_SYNC_QUEUE, type BoardSyncJob } from "../lib/board-queue.js";
import { requireProvider } from "../providers/hiringplatform/index.js";
import { loadPlatformCredentials, PlatformCredsError } from "../providers/hiringplatform/provider-creds.js";
import type { NormalizedApplication, NormalizedStatus } from "../providers/hiringplatform/types.js";
import type { Logger } from "pino";

const JOB_DISTRIBUTION_MODULE_KEY = "job-distribution";

/** The disposition vocabulary the board adapters accept (the NormalizedStatus
 *  union). A payload status outside this set is a data error - we skip rather than
 *  guess (no fabricated disposition). */
const VALID_STATUSES: NormalizedStatus[] = [
  "NEW",
  "REVIEWED",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
];

export function startBoardSyncWorker(logger: Logger) {
  const worker = createWorker<BoardSyncJob>(
    BOARD_SYNC_QUEUE,
    async (job) => {
      const { tenantId, board, jobExternalId, externalApplyId, status } = job.data;
      logger.info({ jobId: job.id, tenantId, board, externalApplyId, status }, "board-sync job starting");

      // ── Module gate: job-distribution off -> skip + ack (no board work). ──────
      if (!(await isModuleEnabled(tenantId, JOB_DISTRIBUTION_MODULE_KEY))) {
        logger.info({ jobId: job.id, tenantId, board }, "board-sync skipped - job-distribution disabled for tenant");
        return { skipped: true, reason: "module-disabled" };
      }

      // ── Validate the disposition is a real NormalizedStatus (never guess). ────
      if (!VALID_STATUSES.includes(status as NormalizedStatus)) {
        logger.warn({ externalApplyId, status }, "board-sync: unknown disposition status - skipped");
        return { error: "unknown-status", status };
      }
      const disposition = status as NormalizedStatus;

      // ── Resolve the board adapter. Unknown key / no dispositionSync capability
      // is a config fact, not a transient fault: ack honestly (no throw, no fake). ─
      let adapter;
      try {
        adapter = requireProvider(board);
      } catch {
        logger.warn({ externalApplyId, board }, "board-sync: unknown board key");
        return { error: "unknown-board", board };
      }
      if (!adapter.caps.dispositionSync || typeof adapter.syncDisposition !== "function") {
        // This board does not accept a disposition push (e.g. LinkedIn, SEEK, Naukri).
        // Honest no-op - the ATS keeps the decision; the board simply is not mirrored.
        logger.info({ externalApplyId, board }, "board-sync: board has no dispositionSync - no-op");
        return { skipped: true, reason: "no-disposition-sync", board };
      }

      // ── Load DECRYPTED board creds at the point of use (never persisted/logged). ─
      // A creds-store outage THROWS (job retries); a 404/disabled integration returns
      // null -> skip (no usable integration; the disposition stays recorded in the
      // ATS, the board simply is not synced). NEVER fabricate creds.
      let creds;
      try {
        creds = await loadPlatformCredentials(tenantId, board, job.data.userId || "system");
      } catch (err) {
        if (err instanceof PlatformCredsError) {
          logger.warn({ externalApplyId, board, status: err.status }, "board-sync: creds store error - will retry");
          throw err;
        }
        throw err;
      }
      if (!creds) {
        logger.info({ externalApplyId, board }, "board-sync: no board credentials - skipped (disposition stays in the ATS)");
        return { skipped: true, reason: "no-credentials", board };
      }

      // ── Build a NormalizedApplication shell carrying ONLY the REAL correlation
      // keys. syncDisposition reads app.externalApplyId + app.jobExternalId (the
      // values the inbound application delivered); it never reads the candidate
      // fields, so we do NOT fabricate a candidate - the shell is the honest minimum
      // the disposition push needs. ────────────────────────────────────────────
      const app = buildDispositionApplication(board, jobExternalId, externalApplyId);

      // adapter.syncDisposition() throws on a board/transport error (incl. exhausted
      // 429 backoff) - let it propagate so BullMQ retries. It only mirrors the status;
      // it triggers no automated reject.
      await adapter.syncDisposition(app, disposition, creds);

      // Stamp the freshness on the owning distribution row (best-effort): the board's
      // funnel is now mirrored as of now. Resolve the row by the board posting id.
      await prisma.jobBoardDistribution
        .updateMany({
          where: { tenantId, board, externalPostingId: jobExternalId },
          data: { lastSyncedAt: new Date() },
        })
        .catch((err) => logger.warn({ err, externalApplyId, board }, "board-sync: failed to stamp lastSyncedAt"));

      logger.info({ externalApplyId, board, status: disposition }, "board-sync mirrored disposition to board");
      return { externalApplyId, board, status: disposition, synced: true };
    },
    {
      concurrency: Number(process.env["BOARD_SYNC_CONCURRENCY"] || 3),
      limiter: {
        max: Number(process.env["BOARD_SYNC_RATE_MAX"] || 8),
        duration: Number(process.env["BOARD_SYNC_RATE_DURATION_MS"] || 1000),
      },
    },
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "board-sync done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "board-sync failed"));
  logger.info("board-sync worker started");
  return worker;
}

/**
 * Build the minimal {@link NormalizedApplication} the disposition push consumes.
 *
 * syncDisposition reads ONLY `provider`, `jobExternalId`, and `externalApplyId` (the
 * board's own correlation ids the inbound application delivered). The candidate /
 * resume / screener fields are NOT read on the disposition path, so we do NOT
 * fabricate a candidate (real-data-or-null): the shell carries the real ids plus the
 * structurally-required empty/zero placeholders that the adapter never inspects.
 * `raw` echoes the correlation keys (their provenance), never a fake board payload.
 */
function buildDispositionApplication(
  board: string,
  jobExternalId: string,
  externalApplyId: string,
): NormalizedApplication {
  return {
    provider: requireProvider(board).id,
    jobExternalId,
    externalApplyId,
    // Not read by syncDisposition; structurally required by the type. Left at the
    // honest minimum (epoch, empty contact, empty screener) rather than a fabricated
    // applicant - the disposition push never inspects these.
    appliedAt: new Date(0),
    candidate: { firstName: "", lastName: "", email: "" },
    screenerAnswers: [],
    raw: { jobExternalId, externalApplyId },
  };
}
