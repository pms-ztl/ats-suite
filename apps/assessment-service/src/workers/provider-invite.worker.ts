/**
 * Outbound provider-invite worker (assessment-service) — WF8 / SLICE H3.
 *
 * Consumes the `assessment-provider-invite` BullMQ queue (enqueued by the invites
 * route when an invite body specifies an external OA vendor). It issues the
 * candidate's invite on the vendor (HackerRank, Codility, HackerEarth, iMocha,
 * TestGorilla) and records the REAL vendor invitation id so the inbound webhook /
 * polling reaper can correlate the eventual result back. Clones the grading
 * worker's boot idiom (createWorker + the admin/non-RLS client scoped explicitly
 * by the job's tenantId, since a worker has no request context).
 *
 * ── HARD RULES baked in ───────────────────────────────────────────────────────
 *  - MODULE GATE: if oa-assessments is OFF for the tenant we short-circuit (skip +
 *    ack the job) via @cdc-ats/common isModuleEnabled — the same answer the gateway
 *    requireModule middleware would give. A disabled module does no vendor work.
 *  - REAL data only: providerInvitationId is the vendor's own id from a real
 *    adapter.invite() response. Nothing is synthesized; if the vendor call fails
 *    the invite is NOT marked SENT (it stays for retry / manual handling).
 *  - CREDENTIALS encrypted at rest: creds are fetched DECRYPTED at the point of use
 *    from the notification-service store (never persisted here). Any per-invite
 *    `providerSecret` the vendor mints is stored AES-GCM encrypted (encryptConfig)
 *    on the AssessmentInvite row — never in plaintext, never logged.
 *  - IDEMPOTENT per providerInvitationId: an invite already SENT with a stored
 *    providerInvitationId is a no-op (the BullMQ jobId also coalesces retries), so
 *    a re-run never double-invites the candidate on the vendor.
 *  - RATE LIMITS respected: the BullMQ limiter caps issuance throughput and the
 *    adapter's fetchJson honors each vendor's per-second cap + Retry-After 429
 *    backoff (e.g. HackerRank 10 rps) inside adapter.invite().
 *  - NO auto-reject: this worker only issues an invite; advancing/rejecting a
 *    candidate stays in the HITL flow downstream (GDPR Art. 22).
 */
import { createWorker } from "@cdc-ats/nats-client";
import { isModuleEnabled, encryptConfig } from "@cdc-ats/common";
// Background worker (no HTTP request) — scopes by the job's tenantId explicitly,
// so it uses the admin (non-RLS) client, exactly like grading.worker.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import {
  ASSESSMENT_INVITE_QUEUE,
  type ProviderInviteJob,
} from "../lib/queue.js";
import { getProvider } from "../providers/index.js";
import type { InviteRequest } from "../providers/types.js";
import { loadProviderCredentials, ProviderCredsError } from "../lib/provider-creds.js";
import { publishEvent, assessmentSubject } from "../lib/nats.js";
import type { Logger } from "pino";

const OA_MODULE_KEY = "oa-assessments";

// Public take base — vendors that return no synchronous take URL fall back to the
// native take link (absolute so the notification-service .url() check accepts it).
const APP_URL = process.env["APP_URL"] ?? "http://localhost:3000";

export function startProviderInviteWorker(logger: Logger) {
  const worker = createWorker<ProviderInviteJob>(
    ASSESSMENT_INVITE_QUEUE,
    async (job) => {
      const { tenantId, inviteId, provider, providerTestId } = job.data;
      logger.info({ jobId: job.id, inviteId, provider }, "provider-invite job starting");

      // ── Module gate: oa-assessments off → skip + ack (no vendor work). ────────
      if (!(await isModuleEnabled(tenantId, OA_MODULE_KEY))) {
        logger.info({ jobId: job.id, tenantId, inviteId }, "provider-invite skipped — oa-assessments disabled for tenant");
        return { skipped: true, reason: "module-disabled" };
      }

      const adapter = getProvider(provider);
      if (!adapter) {
        // Unknown provider key — a config error, not a transient fault. Do NOT
        // throw (that would retry forever); ack with an honest error.
        logger.warn({ inviteId, provider }, "provider-invite: unknown provider key");
        return { error: "unknown-provider", provider };
      }

      // ── Load the local invite row (the idempotency anchor + tenant scope). ────
      const invite = await prisma.assessmentInvite.findFirst({
        where: { id: inviteId, tenantId },
        select: {
          id: true,
          status: true,
          provider: true,
          providerInvitationId: true,
          email: true,
          expiresAt: true,
        },
      });
      if (!invite) {
        logger.warn({ inviteId }, "provider-invite: invite row not found (deleted?)");
        return { error: "invite-not-found" };
      }

      // ── IDEMPOTENT: already issued on the vendor → no-op (never double-invite). ─
      if (invite.providerInvitationId && invite.status === "SENT") {
        logger.info({ inviteId, providerInvitationId: invite.providerInvitationId }, "provider-invite already sent — idempotent no-op");
        return { skipped: true, reason: "already-sent", providerInvitationId: invite.providerInvitationId };
      }

      // ── Load DECRYPTED vendor creds at the point of use (never persisted). ─────
      // A creds-store outage THROWS (job retries); a missing/disabled integration
      // returns null → route to manual handling (no creds = cannot invite).
      let creds;
      try {
        creds = await loadProviderCredentials(tenantId, provider, job.data.userId || "system");
      } catch (err) {
        if (err instanceof ProviderCredsError) {
          // Transient store error: rethrow so BullMQ retries with backoff.
          logger.warn({ inviteId, provider, err: err.message }, "provider-invite: creds store error — will retry");
          throw err;
        }
        throw err;
      }
      if (!creds) {
        // No vendor configured for this tenant/kind → cannot invite. Leave the
        // invite un-SENT and route to manual handling (never fabricate creds/id).
        logger.warn({ inviteId, provider }, "provider-invite: no vendor credentials configured — routed to manual handling");
        return { error: "no-credentials", provider };
      }

      // ── Issue the invite on the vendor (rate-limit aware inside the adapter). ──
      const req: InviteRequest = {
        testId: providerTestId,
        candidateEmail: job.data.email || invite.email,
        ...(job.data.candidateFirstName ? { candidateFirstName: job.data.candidateFirstName } : {}),
        ...(job.data.candidateLastName ? { candidateLastName: job.data.candidateLastName } : {}),
        // Echo our local inviteId as the vendor correlation handle so the inbound
        // webhook can resolve {tenant, invite} with NO auth context.
        correlationId: inviteId,
        ...(job.data.webhookUrl ? { webhookUrl: job.data.webhookUrl } : {}),
        ...(job.data.expiresAt ? { expiresAt: new Date(job.data.expiresAt) } : {}),
      };

      // adapter.invite() throws on a vendor/transport error (incl. exhausted 429
      // backoff) — let it propagate so BullMQ retries; the invite stays un-SENT.
      const result = await adapter.invite(req, creds);

      // ── Persist the REAL vendor id + the encrypted per-invite secret. ─────────
      // providerSecret is the per-invite callback-signing secret some vendors mint;
      // fall back to the tenant's webhookSecret so the inbound webhook can verify a
      // signature even when the vendor returns no per-invite secret. AES-GCM at rest.
      //
      // It is stored as the encrypted form of the bare secret STRING (not an object)
      // to match the H4 inbound webhook reader, which decrypts and expects a string
      // (decryptProviderSecret returns the value only when typeof === "string").
      const perInviteSecret = creds.webhookSecret;
      const encryptedSecret = perInviteSecret ? encryptConfig(perInviteSecret) : null;

      await prisma.assessmentInvite.update({
        where: { id: invite.id },
        data: {
          provider,
          providerInvitationId: result.providerInvitationId,
          ...(encryptedSecret ? { providerSecret: encryptedSecret } : {}),
          status: "SENT",
          sentAt: new Date(),
        },
      });

      // ── Notify-only: surface the take link (vendor URL, else native fallback). ─
      // The notification-service emails the candidate. NEVER an auto-reject; this
      // is purely "your assessment is ready". Absolute URL (relative 400s .url()).
      const takeUrl = result.candidateTestUrl ?? `${APP_URL}/assessment/take/invite/${inviteId}`;
      await publishEvent({
        subject: assessmentSubject(tenantId, "invited"),
        type: "assessment.invited",
        tenantId,
        payload: {
          tenantId,
          inviteId,
          assessmentId: job.data.assessmentId,
          candidateId: job.data.candidateId,
          email: req.candidateEmail,
          provider,
          providerInvitationId: result.providerInvitationId,
          rawTokenUrl: takeUrl,
        },
      }).catch((err) => logger.warn({ err, inviteId }, "failed to publish assessment.invited"));

      logger.info(
        { inviteId, provider, providerInvitationId: result.providerInvitationId, hasTakeUrl: Boolean(result.candidateTestUrl) },
        "provider-invite sent",
      );
      return { inviteId, provider, providerInvitationId: result.providerInvitationId, sent: true };
    },
    {
      // Modest concurrency + a throughput cap so a burst of invites cannot blow a
      // vendor's per-second limit; each adapter ALSO spaces + 429-backs-off
      // internally (e.g. HackerRank 10 rps). Tunable via env.
      concurrency: Number(process.env["PROVIDER_INVITE_CONCURRENCY"] || 3),
      limiter: {
        max: Number(process.env["PROVIDER_INVITE_RATE_MAX"] || 8),
        duration: Number(process.env["PROVIDER_INVITE_RATE_DURATION_MS"] || 1000),
      },
    },
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "provider-invite done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "provider-invite failed"));
  logger.info("assessment-provider-invite worker started");
  return worker;
}
