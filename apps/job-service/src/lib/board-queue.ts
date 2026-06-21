/**
 * Outbound board-distribution BullMQ queues (job-service) - WF-G / SLICE G6.
 *
 * Two queues, cloned from the assessment-service queue idiom (apps/assessment-
 * service/src/lib/queue.ts) over the shared @cdc-ats/nats-client BullMQ helpers
 * (which own the Redis connection via REDIS_URL):
 *
 *   1. board-post   - a job leaves the ATS toward ONE external board. The
 *      board-post worker loads the tenant's decrypted board creds, calls
 *      requireProvider(board).postJob(normalizedJob, creds), and writes the REAL
 *      externalPostingId/externalUrl/status onto the JobBoardDistribution row. When
 *      no creds are configured for the board it sets the row
 *      PENDING_PARTNER_APPROVAL (an honest "queued for the partner", NOT a fake
 *      ACTIVE) - it never fabricates an external id/url/status.
 *
 *   2. board-sync   - a disposition (a decision a human already made in the ATS)
 *      is mirrored BACK to the board that delivered the application, for boards
 *      whose adapter supports dispositionSync. Never an auto-reject; it only
 *      reports an existing HITL outcome (GDPR Art. 22).
 *
 * BOTH workers short-circuit (skip + ack) when the `job-distribution` module is OFF
 * for the tenant, via @cdc-ats/common isModuleEnabled - the same effective-state
 * answer the gateway requireModule middleware would give. job-distribution is a
 * HARD (failMode: "closed") module, so a billing blip fails CLOSED (no board work).
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication / inbound apply),
 * DISTINCT from the assessment-provider axis; the two never cross-wire.
 */
import { getQueue } from "@cdc-ats/nats-client";
import type { Queue } from "bullmq";

// ── board-post queue ─────────────────────────────────────────────────────────
export const BOARD_POST_QUEUE = "board-post";

/**
 * One outbound post of a JobPosting to ONE board. Carries only correlation keys -
 * the worker loads the posting + requisition (and the tenant's decrypted creds)
 * itself, so the job payload never holds a credential or a fabricated external id.
 */
export interface BoardPostJob {
  tenantId: string;
  /** The ATS JobPosting being distributed. */
  jobPostingId: string;
  /** Board registry key (== TenantIntegration kind), e.g. "indeed", "linkedin". */
  board: string;
  /** Who triggered the post - "system" for an automated pipeline step. */
  userId?: string;
}

let boardPostQueue: Queue<BoardPostJob> | null = null;

export function getBoardPostQueue(): Queue<BoardPostJob> {
  if (!boardPostQueue) boardPostQueue = getQueue<BoardPostJob>(BOARD_POST_QUEUE);
  return boardPostQueue;
}

/**
 * Enqueue an outbound board post. Idempotent at the queue layer: the jobId is
 * derived from {tenantId, jobPostingId, board} - the same tuple the
 * JobBoardDistribution @@unique key uses - so re-enqueuing the same post (a retry,
 * a double-click) coalesces onto one job rather than double-posting. The worker is
 * ALSO idempotent at the data layer (an ACTIVE row with a real externalPostingId is
 * a no-op).
 */
export async function enqueueBoardPost(data: BoardPostJob): Promise<string> {
  const q = getBoardPostQueue();
  const job = await q.add("board-post", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 15_000 },
    removeOnComplete: 200,
    removeOnFail: 1000,
    jobId: `board-post-${data.tenantId}-${data.jobPostingId}-${data.board}`,
  });
  return job.id!;
}

// ── board-sync queue ─────────────────────────────────────────────────────────
export const BOARD_SYNC_QUEUE = "board-sync";

/**
 * One disposition-sync push: mirror an ATS candidate disposition back to the board
 * that delivered the application. The worker resolves the JobBoardDistribution row
 * (board posting external id) + the inbound application's external apply id from the
 * correlation keys here, loads creds, and calls adapter.syncDisposition() when the
 * board supports it. NEVER an auto-reject - `status` only reports a decision a human
 * already made.
 */
export interface BoardSyncJob {
  tenantId: string;
  /** Board registry key (== TenantIntegration kind), e.g. "indeed". */
  board: string;
  /** The board's own posting id the application targeted (jobExternalId). */
  jobExternalId: string;
  /** The board's own application id (the inbound dedupe key, externalApplyId). */
  externalApplyId: string;
  /**
   * The disposition to mirror - a NormalizedStatus literal (NEW | REVIEWED |
   * SHORTLISTED | INTERVIEWING | OFFER | HIRED | REJECTED | WITHDRAWN). REJECTED
   * here only reports an existing HITL outcome; it triggers no automated reject.
   */
  status: string;
  /** Who triggered the sync - the user who recorded the disposition, or "system". */
  userId?: string;
}

let boardSyncQueue: Queue<BoardSyncJob> | null = null;

export function getBoardSyncQueue(): Queue<BoardSyncJob> {
  if (!boardSyncQueue) boardSyncQueue = getQueue<BoardSyncJob>(BOARD_SYNC_QUEUE);
  return boardSyncQueue;
}

/**
 * Enqueue a disposition sync. Idempotent at the queue layer on
 * {board, externalApplyId, status} so re-recording the same disposition coalesces
 * onto one push rather than spamming the board.
 */
export async function enqueueBoardSync(data: BoardSyncJob): Promise<string> {
  const q = getBoardSyncQueue();
  const job = await q.add("board-sync", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 15_000 },
    removeOnComplete: 200,
    removeOnFail: 1000,
    jobId: `board-sync-${data.board}-${data.externalApplyId}-${data.status}`,
  });
  return job.id!;
}

// ── board-close queue (WF-G / SLICE G7) ───────────────────────────────────────
export const BOARD_CLOSE_QUEUE = "board-close";

/**
 * One outbound takedown of a JobPosting from ONE board (the inverse of board-post).
 * Enqueued by the distribution route's DELETE. The board-close worker resolves the
 * JobBoardDistribution row, loads the tenant's decrypted creds, and calls
 * requireProvider(board).closeJob(externalPostingId, creds) - adapter.closeJob is
 * idempotent (an unknown / already-closed posting no-ops). A row that never reached
 * a board (no externalPostingId) needs no board call; the route already flipped the
 * row CLOSED. Carries only correlation keys - no credential, no fabricated id.
 */
export interface BoardCloseJob {
  tenantId: string;
  /** The ATS JobPosting whose board listing is being taken down. */
  jobPostingId: string;
  /** Board registry key (== TenantIntegration kind), e.g. "indeed", "linkedin". */
  board: string;
  /** Who triggered the close - "system" for an automated pipeline step. */
  userId?: string;
}

let boardCloseQueue: Queue<BoardCloseJob> | null = null;

export function getBoardCloseQueue(): Queue<BoardCloseJob> {
  if (!boardCloseQueue) boardCloseQueue = getQueue<BoardCloseJob>(BOARD_CLOSE_QUEUE);
  return boardCloseQueue;
}

/**
 * Enqueue an outbound board close. Idempotent at the queue layer on the same
 * {tenantId, jobPostingId, board} tuple the JobBoardDistribution @@unique key uses,
 * so a re-close (a retry, a double-click) coalesces onto one job rather than calling
 * the board twice. The worker + adapter are ALSO idempotent (closing an unknown /
 * already-closed posting is a no-op).
 */
export async function enqueueBoardClose(data: BoardCloseJob): Promise<string> {
  const q = getBoardCloseQueue();
  const job = await q.add("board-close", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 15_000 },
    removeOnComplete: 200,
    removeOnFail: 1000,
    jobId: `board-close-${data.tenantId}-${data.jobPostingId}-${data.board}`,
  });
  return job.id!;
}
