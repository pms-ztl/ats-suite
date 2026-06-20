/**
 * Vendor result poll reconciler (assessment-service) — WF8 / SLICE H5.
 *
 * The PULL counterpart to the inbound webhook (inbound-assessment.ts, the PUSH
 * path). Two real cases need polling:
 *   1. HackerRank for Work has NO per-invite webhook — fetchResult polling is its
 *      ONLY result source (providerSupportsWebhook("hackerrank") === false).
 *   2. A DROPPED webhook for any vendor — a callback that never arrived (network
 *      blip, vendor outage, our restart) would otherwise leave a finished
 *      assessment ungraded forever. The reconciler is the backstop.
 *
 * What a tick does (cross-tenant maintenance job → prismaAdmin, like
 * retention-purge.worker / the grading worker's background pass):
 *   - Select every AssessmentInvite that is provider-backed and STILL PENDING:
 *       provider != null AND providerInvitationId != null
 *       AND status IN (SENT, OPENED, STARTED)            ← not yet SUBMITTED/…
 *       AND (expiresAt IS NULL OR expiresAt > now - GRACE) ← stop after expiry+grace
 *       AND no finalized AssessmentResult already exists for it.
 *   - For each, resolve the tenant's decrypted creds (notification-service) ONCE
 *     per (tenant, provider) per tick, then call adapter.fetchResult(). A real
 *     NormalizedResult → ingestVendorResult(onlyIfAbsent:true): the SAME upsert +
 *     assessment.completed the webhook produces, idempotent (skips if the webhook
 *     already finalized it). A null (still pending / not scored yet) → leave it for
 *     the next tick. NEVER a fabricated score.
 *   - Mark a genuinely lapsed invite (past expiresAt + grace, no result) EXPIRED so
 *     it drops out of the polling set — no zombie polling forever, and NO
 *     auto-reject (EXPIRED is a lifecycle fact, not an adverse decision; the HITL
 *     flow owns any candidate-facing outcome).
 *
 * Module gate: short-circuits per tenant via isModuleEnabled(tenantId,
 * "oa-assessments") — the same answer the gateway requireModule would give — so a
 * tenant with the module OFF does no vendor polling.
 *
 * Schedule: BullMQ repeatable (Redis-backed, survives restarts). Default every
 * 30 min; ASSESSMENT_POLL_INTERVAL_MIN overrides (a small value for demos). The
 * backoff is the repeat interval itself — fetchResult per invite is rate-limited
 * inside each adapter (e.g. HackerRank 10 rps / 429 Retry-After) and creds are
 * cached per tick, so a tick never bursts a vendor.
 */
import { Worker, Queue, type Job } from "bullmq";
import { Redis } from "ioredis";
import type { Logger } from "pino";
import { isModuleEnabled } from "@cdc-ats/common";
// Cross-tenant maintenance job → admin (non-RLS) client by design (it scopes by
// each invite's tenantId explicitly, like the grading + retention workers).
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { getProvider, providerSupportsWebhook } from "../providers/index.js";
import type { AssessmentProvider, NormalizedResult, ProviderCredentials } from "../providers/types.js";
import { loadProviderCredentials, ProviderCredsError } from "../lib/provider-creds.js";
import { ingestVendorResult, syntheticAttemptIdForInvite } from "../lib/ingest-vendor-result.js";

const QUEUE = "assessment-vendor-poll";
const JOB_NAME = "poll";
const OA_MODULE_KEY = "oa-assessments";

// Statuses that mean "the candidate may still finish" — only these are polled.
const PENDING_STATUSES = ["SENT", "OPENED", "STARTED"] as const;
// Keep polling this long PAST expiresAt before giving up (a vendor may report a
// just-in-time completion slightly after the window closes). Default 1h.
const EXPIRY_GRACE_MS = Number(process.env["ASSESSMENT_POLL_EXPIRY_GRACE_MS"] ?? 60 * 60 * 1000);
// Cap invites processed per tick so one large tenant cannot starve others; the
// next tick picks up the rest.
const MAX_PER_TICK = Number(process.env["ASSESSMENT_POLL_MAX_PER_TICK"] ?? 500);

interface PollInvite {
  id: string;
  tenantId: string;
  assessmentId: string;
  candidateId: string;
  applicationId: string | null;
  provider: string | null;
  providerInvitationId: string | null;
  status: string;
  expiresAt: Date | null;
  submittedAt: Date | null;
}

export interface PollTickResult {
  invitesScanned: number;
  resultsIngested: number;
  invitesExpired: number;
  stillPending: number;
  skippedModuleOff: number;
}

/**
 * One reconciliation tick. Pulls the pending provider-backed invites, polls each
 * vendor for a real result, and ingests the ones that have completed. Module-gated
 * per tenant; creds cached per (tenant, provider) for the tick.
 */
export async function runPollTick(logger: Logger): Promise<PollTickResult> {
  const now = Date.now();
  // Drop invites whose window lapsed beyond the grace — they are expired below,
  // not polled. We still SELECT them (to flip them EXPIRED) via a separate pass.
  const invites = (await prisma.assessmentInvite.findMany({
    where: {
      provider: { not: null },
      providerInvitationId: { not: null },
      status: { in: [...PENDING_STATUSES] },
    },
    select: {
      id: true,
      tenantId: true,
      assessmentId: true,
      candidateId: true,
      applicationId: true,
      provider: true,
      providerInvitationId: true,
      status: true,
      expiresAt: true,
      submittedAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: MAX_PER_TICK,
  })) as PollInvite[];

  const res: PollTickResult = {
    invitesScanned: invites.length,
    resultsIngested: 0,
    invitesExpired: 0,
    stillPending: 0,
    skippedModuleOff: 0,
  };

  // Per-tick caches so we never re-ask billing / the creds store for the same key.
  const moduleCache = new Map<string, boolean>();
  const credsCache = new Map<string, ProviderCredentials | null>();

  for (const invite of invites) {
    const provider = invite.provider!;
    const providerInvitationId = invite.providerInvitationId!;

    // Module gate (per tenant, cached): OFF → skip this tenant's invites entirely.
    let moduleOn = moduleCache.get(invite.tenantId);
    if (moduleOn === undefined) {
      moduleOn = await isModuleEnabled(invite.tenantId, OA_MODULE_KEY);
      moduleCache.set(invite.tenantId, moduleOn);
    }
    if (!moduleOn) {
      res.skippedModuleOff += 1;
      continue;
    }

    // Expiry: past expiresAt + grace with no result → mark EXPIRED, stop polling.
    // (EXPIRED is a lifecycle fact, NOT an adverse decision — no auto-reject.)
    if (invite.expiresAt && invite.expiresAt.getTime() + EXPIRY_GRACE_MS < now) {
      const finalized = await hasFinalizedResult(invite.id);
      if (!finalized) {
        await prisma.assessmentInvite
          .update({ where: { id: invite.id }, data: { status: "EXPIRED" } })
          .catch((err) => logger.warn({ err, inviteId: invite.id }, "poll: failed to mark invite expired"));
        res.invitesExpired += 1;
      }
      continue;
    }

    // Resolve the adapter. An invite tagged with an unknown/unsupported provider is
    // a data error, not something to poll — skip it (no throw, no fake).
    const adapter = getProvider(provider);
    if (!adapter) {
      logger.warn({ inviteId: invite.id, provider }, "poll: unknown provider on invite — skipped");
      res.stillPending += 1;
      continue;
    }
    // Defense: only poll vendors we actually poll. A webhook-only vendor still gets
    // polled here as the dropped-webhook backstop, so we do NOT gate on
    // providerSupportsWebhook — but a vendor whose adapter cannot fetchResult will
    // simply return null below. (Kept for traceability.)
    void providerSupportsWebhook(provider);

    // Resolve creds ONCE per (tenant, provider) per tick. A creds-store blip throws
    // (ProviderCredsError) → leave the invite pending for the next tick (do NOT
    // mistake a transient error for "no vendor configured"). A 404/disabled → null
    // → skip this invite (the tenant has no usable integration for this vendor).
    const credsKey = `${invite.tenantId}:${provider}`;
    let creds: ProviderCredentials | null | undefined = credsCache.get(credsKey);
    if (creds === undefined) {
      try {
        creds = await loadProviderCredentials(invite.tenantId, provider);
      } catch (err) {
        if (err instanceof ProviderCredsError) {
          logger.warn({ inviteId: invite.id, provider, status: err.status }, "poll: creds store error — will retry next tick");
          res.stillPending += 1;
          continue;
        }
        throw err;
      }
      credsCache.set(credsKey, creds);
    }
    if (!creds) {
      logger.info({ inviteId: invite.id, provider }, "poll: no usable creds for tenant/provider — skipped");
      res.stillPending += 1;
      continue;
    }

    // Poll the vendor for a REAL result. null = still pending / not scored → leave
    // for the next tick (NEVER a fabricated score). A transport error on ONE invite
    // must not abort the tick — log + leave pending.
    let normalized: NormalizedResult | null;
    try {
      normalized = await pollOne(adapter, providerInvitationId, creds);
    } catch (err) {
      logger.warn({ err, inviteId: invite.id, provider }, "poll: fetchResult failed — will retry next tick");
      res.stillPending += 1;
      continue;
    }
    if (!normalized) {
      res.stillPending += 1;
      continue;
    }

    // Real completion → ingest via the SHARED path (idempotent with the webhook).
    // onlyIfAbsent: skip the write + publish if the webhook already finalized it.
    try {
      const outcome = await ingestVendorResult(
        {
          invite: {
            id: invite.id,
            tenantId: invite.tenantId,
            assessmentId: invite.assessmentId,
            candidateId: invite.candidateId,
            applicationId: invite.applicationId,
            submittedAt: invite.submittedAt,
          },
          providerKey: provider,
          normalized,
          onlyIfAbsent: true,
        },
        logger,
      );
      if (outcome.applied) {
        res.resultsIngested += 1;
        logger.info(
          { inviteId: invite.id, provider, resultId: outcome.resultId, scorePercent: outcome.scorePercent, needsReview: outcome.needsReview },
          "poll: vendor result reconciled",
        );
      } else {
        // already-finalized by the webhook — count as ingested-elsewhere, not pending.
        logger.info({ inviteId: invite.id, provider, reason: outcome.reason }, "poll: result already finalized — no-op");
      }
    } catch (err) {
      logger.warn({ err, inviteId: invite.id, provider }, "poll: ingest failed — will retry next tick");
      res.stillPending += 1;
    }
  }

  return res;
}

/** Poll a single invite's vendor for a real {@link NormalizedResult} (or null). */
async function pollOne(
  adapter: AssessmentProvider,
  providerInvitationId: string,
  creds: ProviderCredentials,
): Promise<NormalizedResult | null> {
  return adapter.fetchResult(providerInvitationId, creds);
}

/** True when a finalized AssessmentResult already exists for this invite (so the
 *  webhook beat the poll, or an earlier poll already reconciled it). Mirrors the
 *  ingest's onlyIfAbsent guard so the expiry pass never expires a graded invite. */
async function hasFinalizedResult(inviteId: string): Promise<boolean> {
  const existing = await prisma.assessmentResult.findUnique({
    where: { attemptId: syntheticAttemptIdForInvite(inviteId) },
    select: { gradedAt: true, pendingManualReview: true },
  });
  return Boolean(existing && (existing.gradedAt !== null || existing.pendingManualReview === false));
}

/**
 * Start the poll reconciler. Returns a stop function (call from graceful
 * shutdown), or null when REDIS_URL is unset (dev/CI without infra — no polling).
 */
export function startAssessmentPollWorker(logger: Logger): (() => Promise<void>) | null {
  const url = process.env["REDIS_URL"];
  if (!url) {
    logger.info("assessment poll reconciler disabled — REDIS_URL not set");
    return null;
  }

  const conn = new Redis(url, { maxRetriesPerRequest: null });
  const queue = new Queue(QUEUE, { connection: conn as any });

  // Repeatable schedule (Redis-backed → survives restarts). Default every 30 min;
  // ASSESSMENT_POLL_INTERVAL_MIN overrides (use a small value for demos).
  const intervalMin = Number(process.env["ASSESSMENT_POLL_INTERVAL_MIN"]);
  const everyMs = Number.isFinite(intervalMin) && intervalMin > 0 ? intervalMin * 60 * 1000 : 30 * 60 * 1000;

  queue
    .add(JOB_NAME, {}, { repeat: { every: everyMs }, jobId: "assessment-vendor-poll-repeat" })
    .catch((err) => logger.warn({ err }, "failed to schedule assessment poll reconciler"));

  const worker = new Worker(
    QUEUE,
    async (_job: Job) => {
      const result = await runPollTick(logger);
      logger.info(result, "assessment poll reconciler tick finished");
      return result;
    },
    { connection: conn as any, concurrency: 1 },
  );

  worker.on("ready", () => logger.info({ everyMs }, "assessment poll reconciler ready"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err?.message }, "assessment poll reconciler failed"));

  return async () => {
    await worker.close().catch(() => {});
    await queue.close().catch(() => {});
    await conn.quit().catch(() => {});
  };
}
