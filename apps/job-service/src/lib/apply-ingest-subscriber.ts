/**
 * Apply-ingest NATS subscriber (job-service) - WF-I / SLICE I3.
 *
 * Completes the ASYNC leg of the accept-fast ingest pipeline. The apply-ingest
 * worker advances the ledger row's ingestStage up to FORWARDED (scan + hand the
 * resume to resume-service); resume parsing + screening then run in their OWN
 * services' workers and publish over NATS. This subscriber observes those REAL
 * events and advances ingestStage the instant each stage genuinely completes:
 *
 *   tenant.{id}.resume.parsed       -> ingestStage = PARSED
 *   tenant.{id}.screening.completed -> ingestStage = SCREENED  (terminal-positive)
 *
 * It NEVER fabricates a stage: PARSED/SCREENED are set ONLY from a real event,
 * and only ever FORWARD (setIngestStage's forward-only guard ignores a late /
 * re-delivered event that would regress the row). A screening result of FAIL /
 * REVIEW still advances ingestStage to SCREENED - SCREENED means "the screen ran",
 * not "the candidate passed"; the hiring decision is the HITL queue's, untouched
 * here (GDPR Art. 22).
 *
 * Correlation: the events carry candidateId (+ requisitionId for screening) but no
 * applicationId, so we resolve the ApplicationIdempotency ledger row by the
 * (tenantId, candidateId, requisitionId) keys the accept step recorded on it. Only
 * accept-fast applies have a ledger row with these keys set, so a multipart-path
 * candidate (no row) is a clean no-op - exactly the desired behavior (the multipart
 * path has no live status to advance).
 *
 * Runs outside any HTTP request -> scopes every query by the event's tenantId
 * explicitly on the admin (non-RLS) client, like the other cross-service workers.
 */
import { subscribeToEvents, type ActiveSubscription } from "@cdc-ats/nats-client";
import { z } from "zod";
import { prismaAdmin as prisma } from "./prisma.js";
import { setIngestStage } from "./apply-ingest-queue.js";
import type { Logger } from "pino";

// Stages that are still in-flight (can be advanced by an async event). Once a row
// is SCREENED or terminal (REJECTED/FAILED) we leave it alone.
const ADVANCEABLE = ["PENDING_INGEST", "SCANNED", "FORWARDED", "PARSED"] as const;

const ResumeParsedPayload = z
  .object({ tenantId: z.string(), candidateId: z.string() })
  .passthrough();

const ScreeningCompletedPayload = z
  .object({
    tenantId: z.string(),
    candidateId: z.string(),
    requisitionId: z.string().optional(),
  })
  .passthrough();

export async function startApplyIngestSubscribers(logger: Logger): Promise<ActiveSubscription[]> {
  const subs: ActiveSubscription[] = [];

  // ── tenant.{id}.resume.parsed -> PARSED ─────────────────────────────────────
  // resume.parsed carries candidateId but no requisitionId, so we advance the most
  // recent still-in-flight accept-fast ledger row for that candidate. (One apply ->
  // one fresh row; a candidate re-applying creates a new row, and we only touch the
  // newest in-flight one.)
  subs.push(
    await subscribeToEvents({
      stream: "RESUME_EVENTS",
      subject: "tenant.*.resume.parsed",
      durable: "job-service:apply-ingest-resume-parsed",
      logger,
      handler: async (envelope) => {
        const p = ResumeParsedPayload.parse(envelope.payload);
        const row = await prisma.applicationIdempotency.findFirst({
          where: {
            tenantId: p.tenantId,
            candidateId: p.candidateId,
            ingestStage: { in: [...ADVANCEABLE] },
          },
          orderBy: { lastRunAt: "desc" },
          select: { applicationId: true, ingestStage: true },
        });
        if (!row?.applicationId) return; // no accept-fast ingest in flight -> no-op
        const n = await setIngestStage(prisma, p.tenantId, row.applicationId, "PARSED", null);
        if (n > 0) logger.info({ applicationId: row.applicationId, from: row.ingestStage, to: "PARSED" }, "apply-ingest: advanced to PARSED on resume.parsed");
      },
    }),
  );

  // ── tenant.{id}.screening.completed -> SCREENED ─────────────────────────────
  // screening.completed carries candidateId + requisitionId, so we resolve the row
  // precisely. SCREENED is terminal-positive for the ingest pipeline regardless of
  // the screen's PASS/REVIEW/FAIL result.
  subs.push(
    await subscribeToEvents({
      stream: "SCREENING_EVENTS",
      subject: "tenant.*.screening.completed",
      durable: "job-service:apply-ingest-screening-completed",
      logger,
      handler: async (envelope) => {
        const p = ScreeningCompletedPayload.parse(envelope.payload);
        const row = await prisma.applicationIdempotency.findFirst({
          where: {
            tenantId: p.tenantId,
            candidateId: p.candidateId,
            ...(p.requisitionId ? { requisitionId: p.requisitionId } : {}),
            ingestStage: { in: [...ADVANCEABLE] },
          },
          orderBy: { lastRunAt: "desc" },
          select: { applicationId: true, ingestStage: true },
        });
        if (!row?.applicationId) return; // no accept-fast ingest in flight -> no-op
        const n = await setIngestStage(prisma, p.tenantId, row.applicationId, "SCREENED", null);
        if (n > 0) logger.info({ applicationId: row.applicationId, from: row.ingestStage, to: "SCREENED" }, "apply-ingest: advanced to SCREENED on screening.completed");
      },
    }),
  );

  logger.info("apply-ingest subscribers started (resume.parsed + screening.completed)");
  return subs;
}
