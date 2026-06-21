/**
 * Apply-ingest BullMQ queue (job-service) - WF-I / SLICE I2 + I3.
 *
 * The accept-fast public apply path (public.ts apply-custom JSON body) does ONE
 * minimal Candidate+Application write, then enqueues an `apply-ingest` job so the
 * heavy, slow work (optional virus scan, move the resume off the incoming bucket
 * into the resume pipeline, parse, screen) runs ASYNC off the request path. The
 * applicant gets a 202 the instant the row exists - never a fabricated 201 before
 * the candidate/application rows are real.
 *
 * Cloned from the board-post / assessment-grading queue idiom over the shared
 * @cdc-ats/nats-client BullMQ helpers (which own the Redis connection via
 * REDIS_URL). The CONSUMER (apply-ingest.worker.ts) is built in WF-I / I3; this
 * module owns only the queue name, the job shape, and the idempotent enqueue
 * helper, so both the producer (I2) and the worker (I3) import the same anchors.
 *
 * IDEMPOTENT at the queue layer: the BullMQ jobId is the applicationId, which is
 * created exactly once per accepted apply (the ApplicationIdempotency ledger in
 * public.ts guarantees one Application per (tenantId, idempotencyKey)). So a
 * retried enqueue (a process restart between the DB commit and the q.add, a
 * double-accept that replayed the cached 202) coalesces onto the SAME job rather
 * than ingesting the same resume twice. The worker is ALSO idempotent per
 * applicationId at the data layer.
 */
import { getQueue } from "@cdc-ats/nats-client";
import type { Queue } from "bullmq";

export const APPLY_INGEST_QUEUE = "apply-ingest";

// ── Ingest stage (the live pipeline stage) ───────────────────────────────────
// Tracked on ApplicationIdempotency.ingestStage (a plain string column) so the
// accept step (I2), the apply-ingest worker (I3), and the public status route (I4)
// all share ONE source of truth. The stage is real-data-or-honest: it advances
// ONLY when that stage really happened (see the worker + subscriber). The plain
// string (not a Prisma enum) lets I4 emit it directly + keeps the apply-fast hot
// path free of an enum import.
//
//   PENDING_INGEST -> SCANNED -> FORWARDED -> PARSED -> SCREENED   (happy path)
//   REJECTED  (scan quarantine, terminal)  |  FAILED  (ingest failed, terminal)
export type IngestStage =
  | "PENDING_INGEST"
  | "SCANNED"
  | "FORWARDED"
  | "PARSED"
  | "SCREENED"
  | "REJECTED"
  | "FAILED";

// Monotonic rank of each NON-terminal stage so an advance is FORWARD-ONLY: a late
// resume.parsed after screening already advanced the row must never drag the stage
// backward. Terminal stages (REJECTED/FAILED) are handled explicitly by the caller
// and are absent here.
const STAGE_RANK: Record<string, number> = {
  PENDING_INGEST: 0,
  SCANNED: 1,
  FORWARDED: 2,
  PARSED: 3,
  SCREENED: 4,
};

/** True when `to` is strictly ahead of `from` on the happy-path ladder. Unknown /
 *  terminal stages (not in STAGE_RANK) are treated as rank -1 so any real stage
 *  can advance past a null/unknown current value. */
export function isForwardStage(from: string | null | undefined, to: IngestStage): boolean {
  const f = from && from in STAGE_RANK ? STAGE_RANK[from]! : -1;
  const t = to in STAGE_RANK ? STAGE_RANK[to]! : Number.POSITIVE_INFINITY;
  return t > f;
}

// Minimal structural type for the prisma client method we use, so this lib does
// not import the generated client (avoids a build-order cycle; the worker /
// subscriber pass their already-imported prismaAdmin in).
interface IngestStageUpdater {
  applicationIdempotency: {
    updateMany: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<{ count: number }>;
  };
}

/**
 * Advance ingestStage on the application's ledger row, scoped by (tenantId,
 * applicationId) on the mutation itself. Terminal stages (REJECTED/FAILED) always
 * apply; non-terminal stages apply only when they move the row FORWARD (so a
 * re-delivered event or a slow worker can never regress the stage). ingestError is
 * set when provided (the error/quarantine reason) and CLEARED when explicitly
 * passed null on a successful advance.
 *
 * Returns the number of rows updated (0 = the guard rejected a non-forward / cross-
 * tenant write, which is the intended no-op).
 */
export async function setIngestStage(
  db: IngestStageUpdater,
  tenantId: string,
  applicationId: string,
  stage: IngestStage,
  error?: string | null,
): Promise<number> {
  const terminal = stage === "REJECTED" || stage === "FAILED";
  const where: Record<string, unknown> = { tenantId, applicationId };
  if (!terminal) {
    // Forward-only guard expressed in the WHERE so it is atomic: only advance when
    // the current stage is null OR strictly behind the target on the ladder.
    const behind = Object.entries(STAGE_RANK)
      .filter(([, rank]) => rank < (STAGE_RANK[stage] ?? Number.POSITIVE_INFINITY))
      .map(([name]) => name);
    where["OR"] = [{ ingestStage: null }, { ingestStage: { in: behind } }];
  }
  const data: Record<string, unknown> = {
    ingestStage: stage,
    lastRunAt: new Date(),
  };
  if (error !== undefined) data["ingestError"] = error;
  const { count } = await db.applicationIdempotency.updateMany({ where, data });
  return count;
}

/**
 * Record an ingest error on the ledger row WITHOUT changing ingestStage. Used when
 * a transient failure (e.g. a resume-service forward blip) leaves the row at its
 * current stage to be retried - the operator still sees why the last attempt failed.
 * Scoped by (tenantId, applicationId) on the mutation itself.
 */
export async function recordIngestError(
  db: IngestStageUpdater,
  tenantId: string,
  applicationId: string,
  error: string,
): Promise<number> {
  const { count } = await db.applicationIdempotency.updateMany({
    where: { tenantId, applicationId },
    data: { ingestError: error, lastRunAt: new Date() },
  });
  return count;
}

/**
 * One staged ingest of an accepted public application. Carries only correlation
 * keys + the storage pointer - never a resume binary, never any fabricated id.
 * The worker (I3) loads what it needs from these:
 *   - tenantId/applicationId/candidateId scope every downstream call + status write
 *   - objectKey points at the resume the browser uploaded DIRECTLY to the incoming
 *     bucket (incoming/<tenantId>/<jobId>/<uuid>.<ext>); the worker references /
 *     streams it into the resume pipeline (no multer, so the async-context tenant
 *     gotcha that affected the multipart path does not apply here).
 *   - filename/contentType are the validated values from the accept step (the size
 *     was verified server-side via statObject; the client value is never trusted).
 */
export interface ApplyIngestJob {
  tenantId: string;
  /** The Application row created in the accept step - the idempotency anchor. */
  applicationId: string;
  /** The Candidate the resume + screening attach to. */
  candidateId: string;
  /** The requisition the application targets (lets the worker run screening). */
  requisitionId: string;
  /** incoming/<tenantId>/<jobId>/<uuid>.<ext> in the incoming bucket. */
  objectKey: string;
  /** Original (sanitized) filename for the resume, for the parse handoff. */
  filename: string;
  /** Verified content type (pdf/doc/docx/txt). */
  contentType: string;
  /** Server-verified object size in bytes (from statObject, not the client). */
  size: number;
}

let queue: Queue<ApplyIngestJob> | null = null;

export function getApplyIngestQueue(): Queue<ApplyIngestJob> {
  if (!queue) queue = getQueue<ApplyIngestJob>(APPLY_INGEST_QUEUE);
  return queue;
}

/**
 * Enqueue a staged apply ingest. Idempotent at the queue layer on the
 * applicationId (one Application per accepted apply -> one ingest job), so a
 * re-enqueue coalesces rather than double-ingesting. attempts/backoff mirror the
 * board-post worker so a transient resume-service / storage blip is retried.
 */
export async function enqueueApplyIngest(data: ApplyIngestJob): Promise<string> {
  const q = getApplyIngestQueue();
  const job = await q.add("apply-ingest", data, {
    attempts: 5,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
    jobId: `apply-ingest-${data.applicationId}`,
  });
  return job.id!;
}
