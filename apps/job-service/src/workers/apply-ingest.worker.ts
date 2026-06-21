/**
 * Apply-ingest worker (job-service) - WF-I / SLICE I3.
 *
 * Consumes the `apply-ingest` BullMQ queue (enqueued by the accept-fast public
 * apply path, public.ts I2). For ONE accepted application it runs the heavy work
 * the request DELIBERATELY deferred, off the hot path:
 *
 *   PENDING_INGEST                          (set by the accept step on the ledger row)
 *     -> (optional) ClamAV scan             CLAMAV_ENABLED gate; clean/skip -> SCANNED
 *     -> reference + fetch the resume from the incoming bucket
 *     -> forward it to resume-service for extract + parse                  -> FORWARDED
 *     -> [async] real resume.parsed event observed by the subscriber       -> PARSED
 *     -> [async] real screening.completed event observed by the subscriber -> SCREENED
 *
 * SINGLE SOURCE OF TRUTH for the live stage is ApplicationIdempotency.ingestStage
 * (a plain string column on the same ledger row the accept step created + the I4
 * status route reads). The accept step (I2) sets it to PENDING_INGEST; THIS worker
 * owns the SYNCHRONOUS leg (scan + forward: PENDING_INGEST -> SCANNED -> FORWARDED,
 * or a terminal REJECTED/FAILED). The PARSED + SCREENED transitions are completed
 * by the sibling NATS subscriber (apply-ingest.subscriber.ts) the instant the REAL
 * resume.parsed / screening.completed events arrive - never fabricated, never set
 * before the stage actually happened. (Resume parsing + screening run in their own
 * services' workers and publish over NATS; this worker cannot synchronously observe
 * their completion, so claiming PARSED/SCREENED here would be a lie.)
 *
 * == HARD RULES baked in =====================================================
 *  - NO multer here, so the async-local tenant-context gotcha that bit the
 *    multipart path does not apply: the worker scopes every write by the job's
 *    tenantId explicitly on the admin (non-RLS) client, exactly like the board /
 *    assessment workers. The resume forward uses the SAME internal forward path
 *    the multipart apply already uses (forwardResumeUpload), so extract -> parse
 *    -> screen behaves identically whether a resume arrived by multipart or by
 *    the presigned fast path.
 *  - REAL data or honest status. The object is fetched from the store (never a
 *    fabricated body); a missing/unreadable object is a real FAILED, not a
 *    pretend success. A scan INFECTED verdict carries clamd's real signature and
 *    sets the row REJECTED (terminal) - this is a malware quarantine, NOT an
 *    automated HIRING decision (GDPR Art. 22 is untouched: no candidate is
 *    rejected for a hiring reason here).
 *  - CLAMAV_ENABLED defaults OFF: with no sidecar the scan step is skipped and the
 *    pipeline still works end to end. When scanning IS enabled, a scanner OUTAGE is
 *    governed by CLAMAV_FAIL_OPEN (default OFF / fail-CLOSED): fail-closed THROWS so
 *    BullMQ retries and no unscanned upload is ever forwarded; fail-open lets the
 *    upload proceed as honestly-not-scanned. Either way the worker never claims a
 *    scan found the file clean when none ran.
 *  - IDEMPOTENT per applicationId: the BullMQ jobId is the applicationId and the
 *    worker no-ops when ingestStage is already FORWARDED-or-beyond / terminal, so a
 *    retry (process restart, double-accept that replayed the cached 202) never
 *    double-forwards the same resume.
 */
import { createWorker } from "@cdc-ats/nats-client";
// Background worker (no HTTP request) - scopes by the job's tenantId explicitly,
// so it uses the admin (non-RLS) client, exactly like the board-post worker.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import {
  APPLY_INGEST_QUEUE,
  setIngestStage,
  recordIngestError,
  type ApplyIngestJob,
  type IngestStage,
} from "../lib/apply-ingest-queue.js";
import { getIncomingObject, isIncomingStorageConfigured } from "../lib/incoming-storage.js";
import { forwardResumeUpload } from "../lib/service-client.js";
import { isClamavEnabled, clamavFailOpen, scanBuffer } from "../lib/clamav.js";
import type { Logger } from "pino";

// Stages at/after FORWARDED, or terminal, mean the synchronous leg is already done
// - the worker no-ops (the async PARSED/SCREENED transitions are the subscriber's
// job, and REJECTED/FAILED are terminal).
const SYNC_LEG_DONE: ReadonlySet<string> = new Set<IngestStage>([
  "FORWARDED",
  "PARSED",
  "SCREENED",
  "REJECTED",
  "FAILED",
]);

export function startApplyIngestWorker(logger: Logger) {
  const worker = createWorker<ApplyIngestJob>(
    APPLY_INGEST_QUEUE,
    async (job) => {
      const { tenantId, applicationId, candidateId, requisitionId, objectKey } = job.data;
      logger.info({ jobId: job.id, tenantId, applicationId, objectKey }, "apply-ingest job starting");

      // ── Load the ledger row (the idempotency anchor + current stage). The accept
      // step created it (ingestStage = PENDING_INGEST) in the same write as the
      // Candidate / Application. A worker that somehow runs before that row exists
      // ack-no-ops (the enqueue is in the same accept handler, so this is defensive). ─
      const row = await prisma.applicationIdempotency.findFirst({
        where: { tenantId, applicationId },
        select: { ingestStage: true },
      });
      if (!row) {
        logger.warn({ applicationId, tenantId }, "apply-ingest: ledger row not found (accept step not committed?) - ack no-op");
        return { error: "ledger-row-not-found" };
      }

      // ── IDEMPOTENT: the synchronous leg is already done -> no-op. ──────────────
      if (row.ingestStage && SYNC_LEG_DONE.has(row.ingestStage)) {
        logger.info({ applicationId, stage: row.ingestStage }, "apply-ingest: already past forward / terminal - idempotent no-op");
        return { skipped: true, reason: "already-done", stage: row.ingestStage };
      }

      // Storage must be configured for the fast path (the accept step only accepts
      // an objectKey when storage was available). If it is gone now, retry.
      if (!isIncomingStorageConfigured()) {
        throw new Error("incoming object storage not configured - cannot fetch the resume (will retry)");
      }

      // ── Fetch the resume bytes from the incoming bucket ONCE. Used by both the
      // optional scan and the forward, so we never read the object twice. A
      // missing/unreadable object is a REAL failure: mark FAILED (terminal) and
      // ack (retrying a 404 forever is pointless - the upload simply is not there). ─
      const fetched = await getIncomingObject(objectKey);
      if (!fetched) {
        logger.warn({ applicationId, objectKey }, "apply-ingest: resume object missing/unreadable - marking FAILED");
        await setIngestStage(prisma, tenantId, applicationId, "FAILED", "resume object missing or unreadable in incoming bucket");
        return { error: "object-unreadable", stage: "FAILED" };
      }

      // ── Step 1: optional ClamAV scan (CLAMAV_ENABLED gate). scanNote records the
      // HONEST scan outcome on the SCANNED transition - it never says "clean" unless
      // a scan actually returned clean. ─────────────────────────────────────────────
      let scanNote: string | null = "scan skipped (CLAMAV_ENABLED off)";
      if (isClamavEnabled()) {
        const verdict = await scanBuffer(fetched.body);
        if ("ok" in verdict && verdict.ok === false) {
          // Scanner outage / protocol error.
          if (clamavFailOpen()) {
            // Fail-open (default): proceed, but record honestly that NO scan ran -
            // we do NOT claim the file is clean.
            logger.warn({ applicationId, err: verdict.error }, "apply-ingest: clamd unavailable + CLAMAV_FAIL_OPEN - proceeding as not-scanned");
            scanNote = `not scanned (scanner unavailable: ${verdict.error})`;
          } else {
            // Fail-closed: a scanner outage is a retryable error; never forward an
            // unscanned upload.
            logger.warn({ applicationId, err: verdict.error }, "apply-ingest: clamd unavailable - will retry (fail-closed)");
            throw new Error(`clamav scan error: ${verdict.error}`);
          }
        } else if ("clean" in verdict && verdict.clean === false) {
          // REAL malware finding -> quarantine. Terminal REJECTED with the real
          // signature; the resume is NOT forwarded into the pipeline. This is a
          // security quarantine, never a hiring rejection.
          logger.warn({ applicationId, signature: verdict.signature }, "apply-ingest: resume INFECTED - quarantined (REJECTED)");
          await setIngestStage(prisma, tenantId, applicationId, "REJECTED", `infected: ${verdict.signature}`);
          return { applicationId, stage: "REJECTED", signature: verdict.signature };
        } else {
          logger.info({ applicationId }, "apply-ingest: resume scan clean");
          scanNote = null; // real clean scan -> clear any prior note
        }
      }
      // Clean scan / scanning disabled / fail-open outage: clear the scan gate. The
      // scanNote keeps the row honest about whether a scan actually ran.
      await setIngestStage(prisma, tenantId, applicationId, "SCANNED", scanNote);

      // ── Step 2: forward the resume into the resume pipeline. Reuses the SAME
      // internal forward path the multipart apply uses, so extract -> parse ->
      // (auto)screen is identical to the existing flow. forwardResumeUpload returns
      // a boolean; a false is a transient resume-service blip, so we throw to let
      // BullMQ retry rather than mark a fake FORWARDED. ───────────────────────────
      const ok = await forwardResumeUpload({
        tenantId,
        candidateId,
        file: {
          buffer: fetched.body,
          originalname: job.data.filename || objectKey.split("/").pop() || "resume",
          mimetype: job.data.contentType || fetched.contentType || "application/octet-stream",
        },
      });
      if (!ok) {
        // Stay at SCANNED (already recorded) and note WHY the forward failed so an
        // operator sees it; BullMQ retries the whole job.
        await recordIngestError(prisma, tenantId, applicationId, "resume-service forward failed (will retry)");
        throw new Error("resume forward to resume-service failed - will retry");
      }

      // FORWARDED: the resume is in the pipeline (extract done synchronously in
      // resume-service, parse enqueued there). PARSED + SCREENED are advanced by
      // the subscriber when the REAL resume.parsed / screening.completed events
      // arrive for this {tenant, candidate, requisition}.
      await setIngestStage(prisma, tenantId, applicationId, "FORWARDED", null);
      logger.info({ applicationId, candidateId, requisitionId }, "apply-ingest: resume forwarded to pipeline (FORWARDED) - awaiting parse/screen events");
      return { applicationId, stage: "FORWARDED", forwarded: true };
    },
    {
      // Modest concurrency + a throughput cap so a spike of accepted applies cannot
      // overwhelm resume-service; the resume-parse + screening workers have their
      // own caps downstream. Tunable via env.
      concurrency: Number(process.env["APPLY_INGEST_CONCURRENCY"] || 4),
      limiter: {
        max: Number(process.env["APPLY_INGEST_RATE_MAX"] || 20),
        duration: Number(process.env["APPLY_INGEST_RATE_DURATION_MS"] || 1000),
      },
    },
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "apply-ingest done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "apply-ingest failed"));
  logger.info("apply-ingest worker started");
  return worker;
}
