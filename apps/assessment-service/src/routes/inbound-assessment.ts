/**
 * Inbound OA-provider result webhook (assessment-service) — WF8 / SLICE H4.
 *
 * External online-assessment vendors (Codility, HackerEarth, iMocha, TestGorilla)
 * POST a completion event here when a candidate finishes a vendor-hosted test.
 * HackerRank has NO per-invite webhook and is polled via fetchResult instead, so a
 * forged hackerrank callback resolves no adapter-supported path; the route still
 * verifies + correlates exactly like the rest.
 *
 * ── Public posture (mirrors the WF7 Judge0 / inbound-email webhooks) ──────────
 * There is NO JWT and NO tenant header on a vendor callback — the gateway
 * plain-proxies it (RAW, NO X-Internal-Service stamp). This router therefore:
 *   - is mounted with readAuthHeaders({ optional:true, publicWebhook:true }) so the
 *     gateway shared-secret check is skipped and the missing auth ctx is allowed;
 *   - is mounted BEFORE tenantContext (no request tenant exists on these calls);
 *   - uses prismaAdmin ONLY and resolves {tenantId, applicationId} FROM the
 *     AssessmentInvite.providerInvitationId correlation key the vendor echoes back
 *     — never from request context;
 *   - needs the RAW (unparsed) request body for HMAC verification, so it is
 *     mounted with express.raw (NOT the global express.json) and the adapter
 *     verifies provider.verifyWebhook(headers, rawBody, perInviteSecret) BEFORE we
 *     trust a single byte of the payload. A failed/absent signature → 401, no write.
 *
 * ── HARD RULES honored here ───────────────────────────────────────────────────
 *  - REAL data or honest empty ONLY. The AssessmentResult is built from
 *    provider.parseWebhook(rawBody) — a NormalizedResult derived from the REAL
 *    vendor payload (kept verbatim in `perQuestion.raw`) — or it is null and we
 *    422 without persisting anything. A score/percentage is stored ONLY when the
 *    vendor actually reported one; a completion with no numeric result is routed to
 *    manual review (pendingManualReview=true) rather than fabricating a zero.
 *  - Credentials AES-GCM encrypted at rest. The per-invite providerSecret is stored
 *    encrypted; we decrypt it at the point of HMAC verification (backward-compatible
 *    with a legacy plaintext secret via isEncrypted) and never log it.
 *  - NO auto-reject. On a real result we publish assessment.completed — the SAME
 *    event the native take/grade path publishes — which advances ApplicationStage
 *    ASSESSMENT and routes to the existing HITL queue (GDPR Art. 22). `passed` is
 *    null whenever the result needs a human look; this route never rejects anyone.
 *  - Vendor rate limits respected inside the adapters (e.g. HackerRank 10 rps / 429
 *    backoff); this inbound path performs no outbound vendor calls.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, decryptConfig, isEncrypted } from "@cdc-ats/common";
import type { Logger } from "pino";
import { prismaAdmin } from "../lib/prisma.js";
import { getProvider } from "../providers/index.js";
import type { NormalizedResult } from "../providers/types.js";
import { ingestVendorResult } from "../lib/ingest-vendor-result.js";

/**
 * Decrypt a stored per-invite providerSecret. Backward-compatible: an AES-GCM
 * envelope is decrypted; a legacy plaintext secret is returned as-is (so existing
 * rows keep working). decryptConfig stores the secret as a JSON string, so the
 * decrypted value is unwrapped back to a string. Returns undefined when no secret
 * is set (the adapter then rejects an unsigned-but-secret-expected webhook).
 */
function decryptProviderSecret(stored: string | null | undefined): string | undefined {
  if (stored === null || stored === undefined || stored === "") return undefined;
  if (!isEncrypted(stored)) return stored; // legacy plaintext secret
  const value = decryptConfig(stored);
  return typeof value === "string" ? value : undefined;
}

/** The raw request body as a UTF-8 string. express.raw gives us a Buffer; a
 *  proxy/test path may already have a string. Either way we get the exact bytes
 *  the vendor signed (no re-serialization), which HMAC verification depends on. */
function rawBodyString(req: Request): string {
  const body = req.body as unknown;
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  if (typeof body === "string") return body;
  return "";
}

export function createInboundAssessmentRouter(logger: Logger): Router {
  const router = Router();

  // POST /internal/inbound-assessment/:provider/:inviteId
  // :provider    — the vendor registry key (e.g. "codility"), selects the adapter.
  // :inviteId    — the vendor's providerInvitationId (the correlation key); we
  //                resolve {tenantId, applicationId, candidateId} from the matching
  //                AssessmentInvite via prismaAdmin (no request tenant context).
  router.post("/:provider/:inviteId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const providerKey = String(req.params["provider"] ?? "");
      const providerInvitationId = String(req.params["inviteId"] ?? "");

      // Resolve the adapter. Unknown vendor → 404 (a forged callback for a vendor
      // we do not support is a harmless no-op; never throws a 500).
      const provider = getProvider(providerKey);
      if (!provider) {
        logger.warn({ providerKey }, "inbound-assessment: unknown provider");
        throw Errors.notFound("Provider");
      }

      // Resolve the owning invite FROM the correlation key (NOT request context).
      // prismaAdmin: this call carries no tenant header. providerInvitationId is
      // @unique, so this pins exactly one tenant/application/candidate or none.
      const invite = providerInvitationId
        ? await prismaAdmin.assessmentInvite.findUnique({
            where: { providerInvitationId },
          })
        : null;
      if (!invite) {
        // Unknown correlation id → harmless no-op. 200 so the vendor does not retry
        // a callback we can never correlate (an unguessable id is the credential).
        logger.warn({ providerKey, providerInvitationId }, "inbound-assessment: no invite for correlation id");
        return ok(res, { applied: false, reason: "unknown correlation id" });
      }

      // Defense in depth: the stored provider (if recorded) must match the path
      // vendor — a callback for invite X must come from invite X's vendor.
      if (invite.provider && invite.provider !== providerKey) {
        logger.warn(
          { inviteId: invite.id, expected: invite.provider, got: providerKey },
          "inbound-assessment: provider mismatch for invite",
        );
        throw Errors.unauthorized();
      }

      // ── Verify the signature over the RAW body BEFORE trusting the payload ─────
      const rawBody = rawBodyString(req);
      const secret = decryptProviderSecret(invite.providerSecret);
      const verified = provider.verifyWebhook(req.headers, rawBody, secret);
      if (!verified) {
        // Forged / unsigned / wrong-secret callback → reject, persist nothing.
        logger.warn({ inviteId: invite.id, providerKey }, "inbound-assessment: webhook signature verification failed");
        throw Errors.unauthorized();
      }

      // ── Parse the (verified) RAW body into a NormalizedResult ─────────────────
      // REAL-or-null: parseWebhook returns null for a non-completion ping or a
      // payload carrying no real score — we ack 200 without persisting a fake.
      const normalized: NormalizedResult | null = provider.parseWebhook(rawBody);
      if (!normalized) {
        logger.info({ inviteId: invite.id, providerKey }, "inbound-assessment: not a completion event (no result) — ignored");
        return ok(res, { applied: false, reason: "no completion result in payload" });
      }

      // ── Ingest the REAL vendor result (shared with the poll reconciler) ───────
      // ingestVendorResult is the SINGLE source of truth for turning a
      // NormalizedResult into an AssessmentResult + assessment.completed event, so
      // the webhook (push) and the poll reconciler (pull) produce byte-identical
      // effects and are idempotent with each other (keyed on a synthetic attempt id
      // derived from the invite). Webhook path = last-delivery-wins (onlyIfAbsent
      // omitted) since vendors re-send the same final payload harmlessly.
      const outcome = await ingestVendorResult(
        {
          invite: {
            id: invite.id,
            tenantId: invite.tenantId,
            assessmentId: invite.assessmentId,
            candidateId: invite.candidateId,
            applicationId: invite.applicationId ?? null,
            submittedAt: invite.submittedAt ?? null,
          },
          providerKey,
          normalized,
        },
        logger,
      );

      logger.info(
        { inviteId: invite.id, providerKey, resultId: outcome.resultId, scorePercent: outcome.scorePercent, needsReview: outcome.needsReview },
        "inbound-assessment: vendor result ingested",
      );

      ok(res, { applied: outcome.applied, resultId: outcome.resultId, needsReview: outcome.needsReview });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
