/**
 * Outbound board-post worker (job-service) - WF-G / SLICE G6.
 *
 * Consumes the `board-post` BullMQ queue (enqueued by the distribution dispatcher).
 * For one {tenantId, jobPostingId, board} it posts the ATS JobPosting to ONE
 * external board and records the board's REAL response on the JobBoardDistribution
 * row. Clones the assessment-service provider-invite worker boot idiom (createWorker
 * + the admin/non-RLS client scoped explicitly by the job's tenantId, since a worker
 * has no request context) and reuses the SAME toNormalizedJob mapper the public feed
 * route uses, so a job is serialized identically whether it leaves by feed or post.
 *
 * == HARD RULES baked in =====================================================
 *  - MODULE GATE: if `job-distribution` is OFF for the tenant we short-circuit (skip
 *    + ack the job) via @cdc-ats/common isModuleEnabled - the same answer the gateway
 *    requireModule middleware would give. job-distribution is HARD (failMode:
 *    "closed"), so a billing blip fails CLOSED (no board work).
 *  - REAL data or honest PENDING_PARTNER_APPROVAL. When the tenant has NO creds for
 *    the board we set the JobBoardDistribution row PENDING_PARTNER_APPROVAL (queued
 *    for the partner / manual handling) - we NEVER fabricate an ACTIVE post or a fake
 *    externalPostingId/externalUrl. The externalPostingId/externalUrl/status come
 *    straight from adapter.postJob()'s real response; the board's verbatim body is
 *    kept in `raw`.
 *  - CREDENTIALS decrypted per-call (notification-service store), never persisted or
 *    logged here. A creds-store outage THROWS (BullMQ retries); a 404/disabled
 *    integration returns null -> PENDING_PARTNER_APPROVAL (not a silent drop).
 *  - RATE LIMITS respected: the BullMQ limiter caps issuance throughput and each
 *    adapter's fetchJson honors the board's per-second cap + Retry-After 429 backoff
 *    inside postJob (e.g. Indeed's batch tiers). The worker owns retry/backoff
 *    scheduling (attempts: 5, exponential) and the adapter spaces internally.
 *  - NO auto-reject: this worker only posts a job; it touches no candidate decision.
 *  - IDEMPOTENT: a row already ACTIVE with a real externalPostingId is a no-op, and
 *    the BullMQ jobId (tenant+posting+board) coalesces retries, so a re-run never
 *    double-posts the same job to the same board.
 */
import { createWorker } from "@cdc-ats/nats-client";
import { isModuleEnabled } from "@cdc-ats/common";
// Background worker (no HTTP request) - scopes by the job's tenantId explicitly, so
// it uses the admin (non-RLS) client, exactly like the assessment provider-invite +
// grading workers.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { BOARD_POST_QUEUE, type BoardPostJob } from "../lib/board-queue.js";
import { requireProvider } from "../providers/hiringplatform/index.js";
import { loadPlatformCredentials, PlatformCredsError } from "../providers/hiringplatform/provider-creds.js";
import { toNormalizedJob, type PostingForFeed } from "../lib/normalize-job.js";
import type { NormalizedJob, NormalizedJobStatus } from "../providers/hiringplatform/types.js";
import type { Logger } from "pino";

const JOB_DISTRIBUTION_MODULE_KEY = "job-distribution";

// Where applicants land + the public contact address for the board listing. Real
// platform config; the mapper omits an unset contact rather than fabricate one.
const APP_URL = process.env["APP_URL"] ?? "http://localhost:3000";
const FEED_CONTACT_EMAIL = process.env["FEED_CONTACT_EMAIL"] ?? "";

/** A JobBoardDistribution row is terminal-positive (no re-post) when it is ACTIVE
 *  with a real external id, OR was already routed to the partner. */
const ALREADY_POSTED: NormalizedJobStatus[] = ["ACTIVE", "POSTING"];

export function startBoardPostWorker(logger: Logger) {
  const worker = createWorker<BoardPostJob>(
    BOARD_POST_QUEUE,
    async (job) => {
      const { tenantId, jobPostingId, board } = job.data;
      logger.info({ jobId: job.id, tenantId, jobPostingId, board }, "board-post job starting");

      // ── Module gate: job-distribution off -> skip + ack (no board work). ──────
      if (!(await isModuleEnabled(tenantId, JOB_DISTRIBUTION_MODULE_KEY))) {
        logger.info({ jobId: job.id, tenantId, jobPostingId, board }, "board-post skipped - job-distribution disabled for tenant");
        return { skipped: true, reason: "module-disabled" };
      }

      // ── Resolve the board adapter. An unknown board key is a config error, not a
      // transient fault: do NOT throw (that retries forever) - ack with an honest
      // error and leave the row FAILED. ────────────────────────────────────────
      let adapter;
      try {
        adapter = requireProvider(board);
      } catch {
        logger.warn({ jobPostingId, board }, "board-post: unknown board key");
        await setDistribution(tenantId, jobPostingId, board, {
          status: "FAILED",
          lastError: `unknown board "${board}"`,
        });
        return { error: "unknown-board", board };
      }
      if (!adapter.caps.postApi) {
        // This board ingests a feed / JSON-LD rather than accepting a programmatic
        // post (e.g. Adzuna, Jooble, Google Jobs). It is reached via the public feed
        // route, not this worker. Ack honestly without fabricating a post.
        logger.info({ jobPostingId, board }, "board-post: board has no post API (feed/JSON-LD only) - routed to the feed");
        return { skipped: true, reason: "no-post-api", board };
      }

      // ── Load the posting (+ its requisition) - the NormalizedJob source. ──────
      const posting = await loadPosting(tenantId, jobPostingId);
      if (!posting) {
        logger.warn({ jobPostingId }, "board-post: job posting not found (deleted?)");
        return { error: "posting-not-found" };
      }

      // ── IDEMPOTENT: a row already ACTIVE/POSTING with a real external id -> no-op. ─
      const existing = await prisma.jobBoardDistribution.findUnique({
        where: { tenantId_jobPostingId_board: { tenantId, jobPostingId, board } },
        select: { status: true, externalPostingId: true },
      });
      if (existing && existing.externalPostingId && ALREADY_POSTED.includes(existing.status as NormalizedJobStatus)) {
        logger.info({ jobPostingId, board, externalPostingId: existing.externalPostingId }, "board-post already posted - idempotent no-op");
        return { skipped: true, reason: "already-posted", externalPostingId: existing.externalPostingId };
      }

      // ── Load DECRYPTED board creds at the point of use (never persisted/logged). ─
      // A creds-store outage THROWS (job retries); a missing/disabled integration
      // returns null -> PENDING_PARTNER_APPROVAL (queued for the partner, NOT a fake
      // post). NEVER fabricate creds or an external id.
      let creds;
      try {
        creds = await loadPlatformCredentials(tenantId, board, job.data.userId || "system");
      } catch (err) {
        if (err instanceof PlatformCredsError) {
          // Transient store error: rethrow so BullMQ retries with backoff. Do NOT
          // mistake a creds-store blip for "no board configured" and mark it pending.
          logger.warn({ jobPostingId, board, status: err.status }, "board-post: creds store error - will retry");
          throw err;
        }
        throw err;
      }
      if (!creds) {
        // No board integration configured for this tenant -> honest queued-for-partner
        // state. This is the explicit PENDING_PARTNER_APPROVAL path: never a fake ACTIVE.
        logger.info({ jobPostingId, board }, "board-post: no board credentials - row set PENDING_PARTNER_APPROVAL (manual/partner handling)");
        await setDistribution(tenantId, jobPostingId, board, {
          status: "PENDING_PARTNER_APPROVAL",
          lastError: null,
        });
        return { jobPostingId, board, status: "PENDING_PARTNER_APPROVAL", reason: "no-credentials" };
      }

      // ── Mark the row POSTING (post call in flight), then post. ────────────────
      const normalized: NormalizedJob = toNormalizedJob(posting, {
        appUrl: APP_URL,
        contactEmail: FEED_CONTACT_EMAIL,
      });
      await setDistribution(tenantId, jobPostingId, board, { status: "POSTING", lastError: null });

      // adapter.postJob() throws on a board/transport error (incl. exhausted 429
      // backoff) - let it propagate so BullMQ retries; the row stays POSTING and we
      // flip it FAILED only after the retries are exhausted (the catch below records
      // the last error each attempt). REAL externalId/url/status only.
      let result: { externalId: string; externalUrl?: string; status: NormalizedJobStatus; raw: unknown };
      try {
        result = await adapter.postJob(normalized, creds);
      } catch (err) {
        const message = err instanceof Error ? err.message : "post failed";
        // Record the last error on the row so an operator sees why; keep the row
        // FAILED and rethrow so BullMQ retries the remaining attempts.
        await setDistribution(tenantId, jobPostingId, board, { status: "FAILED", lastError: message }).catch(() => {});
        logger.warn({ jobPostingId, board, err: message }, "board-post: postJob failed - will retry");
        throw err;
      }

      // ── Persist the REAL board response. status comes straight from the board
      // (a partner-gated board reports a review state -> PENDING_PARTNER_APPROVAL,
      // never a fabricated ACTIVE). externalPostingId/externalUrl are the board's
      // own; `raw` keeps the verbatim response for downstream correlation. ───────
      await setDistribution(tenantId, jobPostingId, board, {
        status: result.status,
        externalPostingId: result.externalId,
        ...(result.externalUrl ? { externalUrl: result.externalUrl } : {}),
        lastError: null,
        raw: result.raw,
      });

      logger.info(
        { jobPostingId, board, externalPostingId: result.externalId, status: result.status, hasUrl: Boolean(result.externalUrl) },
        "board-post posted",
      );
      return { jobPostingId, board, externalPostingId: result.externalId, status: result.status, posted: true };
    },
    {
      // Modest concurrency + a throughput cap so a burst cannot blow a board's
      // per-second limit; each adapter ALSO spaces + 429-backs-off internally.
      concurrency: Number(process.env["BOARD_POST_CONCURRENCY"] || 3),
      limiter: {
        max: Number(process.env["BOARD_POST_RATE_MAX"] || 8),
        duration: Number(process.env["BOARD_POST_RATE_DURATION_MS"] || 1000),
      },
    },
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "board-post done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "board-post failed"));
  logger.info("board-post worker started");
  return worker;
}

/** Upsert the JobBoardDistribution row for {tenant, posting, board} with the given
 *  patch. Sets lastSyncedAt on every write so the reaper/UI sees freshness. */
async function setDistribution(
  tenantId: string,
  jobPostingId: string,
  board: string,
  patch: {
    status: NormalizedJobStatus;
    externalPostingId?: string;
    externalUrl?: string;
    lastError?: string | null;
    raw?: unknown;
  },
): Promise<void> {
  const data = {
    status: patch.status,
    ...(patch.externalPostingId !== undefined ? { externalPostingId: patch.externalPostingId } : {}),
    ...(patch.externalUrl !== undefined ? { externalUrl: patch.externalUrl } : {}),
    ...(patch.lastError !== undefined ? { lastError: patch.lastError } : {}),
    // Prisma Json input: match the codebase idiom (requisitions.ts / jd-author.ts)
    // of `as any` for a Json column rather than wrestle the JsonNullableInput type.
    ...(patch.raw !== undefined ? { raw: patch.raw as any } : {}),
    lastSyncedAt: new Date(),
  };
  await prisma.jobBoardDistribution.upsert({
    where: { tenantId_jobPostingId_board: { tenantId, jobPostingId, board } },
    update: data,
    create: { tenantId, jobPostingId, board, ...data },
  });
}

/** Load the posting + its requisition projected onto the {@link PostingForFeed}
 *  shape the shared mapper consumes. Tenant-scoped on the admin client (the worker
 *  has no request context, so it scopes by the job's tenantId explicitly). */
async function loadPosting(tenantId: string, jobPostingId: string): Promise<PostingForFeed | null> {
  const row = await prisma.jobPosting.findFirst({
    where: { id: jobPostingId, tenantId },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      requirements: true,
      publishedAt: true,
      expiresAt: true,
      requisition: {
        select: {
          department: true,
          location: true,
          country: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
        },
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    publishedAt: row.publishedAt,
    expiresAt: row.expiresAt,
    requisition: row.requisition
      ? {
          department: row.requisition.department,
          location: row.requisition.location,
          country: row.requisition.country,
          salaryMin: row.requisition.salaryMin,
          salaryMax: row.requisition.salaryMax,
          salaryCurrency: row.requisition.salaryCurrency,
        }
      : null,
  };
}
