/**
 * Inbound apply-webhook ingest (job-service hiring-platform axis) - WF-H / SLICE H4.
 *
 * External job boards (Indeed, LinkedIn, ZipRecruiter, Naukri, SEEK, ...) POST a
 * candidate application here when someone applies on the board. This is the inbound
 * twin of the public apply path (routes/public.ts apply-custom): it creates the SAME
 * real Candidate + Application + resume->parse->screen pipeline, but the applicant
 * arrives over a signed board webhook instead of the candidate portal.
 *
 * ── Route ────────────────────────────────────────────────────────────────────
 *   POST /internal/inbound-job-application/:provider/:tenantId
 *
 * Mounted in app.ts with express.raw({ type: "*\/*" }) so the EXACT raw request
 * bytes the board signed are preserved BEFORE any JSON parse (HMAC verification
 * depends on the unmangled bytes - re-serializing the JSON would change the bytes
 * and correctly fail the signature). The gateway plain-proxies
 * /api/inbound-job-application/* RAW (WF-E E6: NO JWT, NO X-Internal-Service stamp,
 * NO body parser); the {provider}+{tenantId} in the PATH are the correlation
 * handles and the board's HMAC over the raw body is the auth.
 *
 * ── Public posture (mirrors assessment-service inbound-assessment + the WF7
 *    Judge0 / inbound-email webhooks) ─────────────────────────────────────────
 *  - NO request auth context: the board sends no JWT/tenant header. We use
 *    prismaAdmin ONLY and take the tenant from the :tenantId path + the
 *    posting/board correlation, never from request context.
 *  - Mounted BEFORE tenantContext (no request tenant exists on these calls).
 *  - The path :tenantId is NOT a trusted auth header: a forged tenant/provider is
 *    rejected by the signature check (no stored secret -> verifySignature false ->
 *    401) and the candidate is only ever created from a REAL signed payload.
 *
 * ── Flow (per the board adapter contract) ─────────────────────────────────────
 *  1. Resolve the adapter via requireProvider(:provider). Unknown board -> 404.
 *  2. Size guard: a body over the inbound cap -> 413 (no parse).
 *  3. Load the tenant's stored webhook secret for this board (notification creds
 *     store, decrypted) and verifySignature(provider, rawBody, headers, secret)
 *     over the EXACT raw bytes (timing-safe). Failure -> provider-appropriate
 *     non-2xx (Indeed 401 UNAUTHORIZED). Verify BEFORE parsing a single byte.
 *  4. requireProvider(provider).parseApplication(rawBody):
 *       - null  -> ack-and-ignore (a ping / status ack / real-but-incomplete
 *                  payload). NO phantom candidate is ever created. For Indeed a
 *                  malformed body maps to 400, a real-but-incomplete one to 422
 *                  (classifyInbound owns the exact code).
 *       - else  -> a NormalizedApplication built from the REAL board payload.
 *  5. Resolve the owning JobPosting from jobExternalId (the partner-side id we
 *     stamped == our JobPosting.id, else the board's own externalPostingId on the
 *     JobBoardDistribution row). Unknown posting -> 404; a CLOSED listing -> 410.
 *  6. Idempotency: a duplicate delivery of an already-ingested externalApplyId is a
 *     no-op replay (Indeed 409 DUPLICATE) - keyed in the existing
 *     ApplicationIdempotency ledger as `inbound:{provider}:{externalApplyId}`.
 *  7. Dedupe Candidate by (tenantId, email) + create Application via the EXISTING
 *     internal applications path (candidate-service), store the resume to MinIO
 *     (download from resume.mediaUrl when present, else decode resume.base64) and
 *     forward it to the resume->parse->screen pipeline IDENTICALLY to apply-custom.
 *  8. publish NATS jobboard.application.received (best-effort) and return the
 *     provider-specific 2xx.
 *
 * ── HARD RULES honored ────────────────────────────────────────────────────────
 *  - REAL data or null: a board apply creates a REAL Candidate ONLY from a real,
 *    signed payload. parseApplication null -> NO candidate. We NEVER synthesize an
 *    applicant.
 *  - verifyWebhook over EXACT raw bytes, timing-safe, fail-closed.
 *  - No auto-reject: this route only ingests the application; the advance/reject
 *    decision stays in the downstream HITL flow (GDPR Art. 22).
 *  - Per-provider response codes: Indeed answers the EXACT codes its Apply spec
 *    requires (200/409/410/400/401/404/413/422) so Indeed knows whether to retry
 *    or stop; LinkedIn echoes a challenge handshake and answers 200 / non-200 with
 *    an errorCode; every other board answers a plain 200 on accept.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { decryptConfig, isEncrypted } from "@cdc-ats/common";
import type { Logger } from "pino";
import { tenantSubject } from "@cdc-ats/contracts";
// Inbound webhooks carry NO request tenant context; everything is resolved from
// the :tenantId path + the posting/board correlation, so this route uses the
// admin (non-RLS) client exclusively - same posture as the public apply path.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import { callCandidateService, forwardResumeUpload } from "../lib/service-client.js";
import { getProvider, type NormalizedApplication, type ProviderKey } from "../providers/hiringplatform/index.js";
import { verifySignature } from "../providers/hiringplatform/verify-signature.js";
import { loadPlatformCredentials } from "../providers/hiringplatform/provider-creds.js";
import { classifyInbound, type IndeedInboundOutcome } from "../providers/hiringplatform/indeed.js";

/** Inbound body size cap (matches the public apply 10MB resume limit). A body over
 *  this is rejected with 413 BEFORE any parse so a giant payload cannot pin memory. */
const MAX_BODY_BYTES = 12 * 1024 * 1024;

/** Resume-download timeout (ms) when the board delivers a fetchable mediaUrl that
 *  must be pulled to MinIO immediately (e.g. LinkedIn's 30-day signed URL). */
const RESUME_FETCH_TIMEOUT_MS = 15_000;

type AnyObj = Record<string, unknown>;

/**
 * The outcome the route resolves an inbound delivery into. A superset of Indeed's
 * IndeedInboundOutcome (the broadest, EXACT-code contract); every board maps onto
 * one of these and {@link respond} renders the provider-appropriate status code.
 */
type InboundOutcome = IndeedInboundOutcome;

/** The raw request body as a UTF-8 string. express.raw yields a Buffer; a
 *  proxy/test path may hand a string. Either way we get the EXACT bytes the board
 *  signed (no re-serialization), which the HMAC verification depends on. */
function rawBodyString(req: Request): string {
  const body = req.body as unknown;
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  if (typeof body === "string") return body;
  return "";
}

/** Byte length of the raw body (for the size guard), without re-encoding. */
function rawBodyBytes(req: Request): number {
  const body = req.body as unknown;
  if (Buffer.isBuffer(body)) return body.length;
  if (typeof body === "string") return Buffer.byteLength(body, "utf8");
  return 0;
}

/**
 * Decrypt a stored board webhook secret. Backward-compatible: an AES-GCM envelope
 * is decrypted; a legacy plaintext secret is returned as-is. decryptConfig stores a
 * secret as a JSON string, so the decrypted value is unwrapped back to a string.
 * (The provider-creds loader already maps a plaintext webhookSecret; this covers an
 * encrypted-at-rest secret without changing that loader.)
 */
function decryptSecret(stored: string | null | undefined): string | undefined {
  if (stored === null || stored === undefined || stored === "") return undefined;
  if (!isEncrypted(stored)) return stored;
  const value = decryptConfig(stored);
  return typeof value === "string" ? value : undefined;
}

/**
 * Per-provider HTTP response mapping. Indeed REQUIRES the exact codes from its
 * Apply spec (classifyInbound owns the table) so it knows whether to retry or stop.
 * LinkedIn answers 200 on accept and a non-200 with an errorCode otherwise. Every
 * other board answers a plain 200 on accept and a conservative non-2xx otherwise
 * (a generic board has no documented retry contract, so we keep the body honest and
 * the code sane). NEVER auto-rejects a candidate.
 */
function respond(res: Response, provider: ProviderKey, outcome: InboundOutcome, extra: AnyObj = {}): void {
  const accepted = outcome === "OK" || outcome === "DUPLICATE";
  const body: AnyObj = {
    provider,
    outcome,
    accepted,
    ...extra,
  };

  if (provider === "indeed") {
    // EXACT Indeed Apply codes: 200/409/410/400/401/404/413/422.
    res.status(classifyInbound(outcome)).json(body);
    return;
  }

  if (provider === "linkedin") {
    // LinkedIn: 200 on accept (incl. an idempotent duplicate), else a non-200 with
    // an errorCode so LinkedIn surfaces the failure.
    if (accepted) {
      res.status(200).json(body);
    } else {
      res.status(linkedinErrorStatus(outcome)).json({ ...body, errorCode: outcome });
    }
    return;
  }

  // Generic board (ziprecruiter, naukri, seek, ...): a plain 200 on accept; a
  // conservative non-2xx otherwise so a forged/garbled callback is not silently
  // treated as success.
  res.status(accepted ? 200 : genericErrorStatus(outcome)).json(body);
}

/** LinkedIn non-accept status: a signature failure is 401, an unknown/gone posting
 *  404/410, a too-large body 413, everything else 400. */
function linkedinErrorStatus(outcome: InboundOutcome): number {
  switch (outcome) {
    case "UNAUTHORIZED": return 401;
    case "UNKNOWN_POSTING": return 404;
    case "GONE": return 410;
    case "TOO_LARGE": return 413;
    case "UNPROCESSABLE": return 422;
    default: return 400;
  }
}

/** Generic-board non-accept status (same shape, no vendor-specific retry contract). */
function genericErrorStatus(outcome: InboundOutcome): number {
  switch (outcome) {
    case "UNAUTHORIZED": return 401;
    case "UNKNOWN_POSTING": return 404;
    case "GONE": return 410;
    case "TOO_LARGE": return 413;
    case "UNPROCESSABLE": return 422;
    default: return 400;
  }
}

/**
 * Resolve the owning JobPosting (and its tenant) from the board's jobExternalId.
 *
 * The dispatcher stamps OUR JobPosting.id as the partner-side correlation handle
 * (Indeed sourcedJobId, LinkedIn externalJobPostingId), so the common case is a
 * direct id match. As a fallback we resolve the board's OWN posting id via the
 * JobBoardDistribution.externalPostingId for this provider, which is how a board
 * that mints its own id and echoes only that on the apply still correlates.
 *
 * Always scoped to the path :tenantId so a forged jobExternalId from another tenant
 * cannot cross-correlate. Returns the posting (with its requisitionId) or null.
 */
async function resolvePosting(
  tenantId: string,
  provider: ProviderKey,
  jobExternalId: string,
): Promise<{ id: string; requisitionId: string; isPublished: boolean } | null> {
  // 1. Direct: jobExternalId is our JobPosting id (the stamped partner-side handle).
  const direct = await prisma.jobPosting.findFirst({
    where: { id: jobExternalId, tenantId },
    select: { id: true, requisitionId: true, isPublished: true },
  });
  if (direct) return direct;

  // 2. Fallback: the board's own externalPostingId on a distribution row.
  const dist = await prisma.jobBoardDistribution.findFirst({
    where: { tenantId, board: provider, externalPostingId: jobExternalId },
    select: { jobPosting: { select: { id: true, requisitionId: true, isPublished: true } } },
  });
  return dist?.jobPosting ?? null;
}

/**
 * Idempotency on the inbound externalApplyId, reusing the ApplicationIdempotency
 * ledger. Returns true when this exact (provider, externalApplyId) was already
 * ingested for the tenant (a duplicate delivery -> the caller answers DUPLICATE
 * without creating a second Candidate/Application). On a first delivery it claims
 * the key and returns false. A ledger error never blocks ingest (fail-open): a
 * possible duplicate is better surfaced as a second application than a dropped one.
 */
async function claimInboundKey(
  tenantId: string,
  provider: ProviderKey,
  externalApplyId: string,
  logger: Logger,
): Promise<{ duplicate: boolean }> {
  const idempotencyKey = `inbound:${provider}:${externalApplyId}`;
  try {
    await prisma.applicationIdempotency.create({
      data: {
        tenantId,
        idempotencyKey,
        requestMethod: "POST",
        requestPath: `/internal/inbound-job-application/${provider}/${tenantId}`,
        recoveryPoint: "started",
        lastRunAt: new Date(),
      },
    });
    return { duplicate: false };
  } catch (err) {
    // Unique-constraint violation on (tenantId, idempotencyKey) => already ingested.
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2002") {
      return { duplicate: true };
    }
    // Any other ledger error: fail-open so a store blip never drops a real apply.
    logger.warn({ provider, externalApplyId, err }, "inbound-apply: idempotency ledger error - proceeding (fail-open)");
    return { duplicate: false };
  }
}

/** Mark the claimed idempotency key as completed with the response code (best-effort). */
async function completeInboundKey(
  tenantId: string,
  provider: ProviderKey,
  externalApplyId: string,
  responseCode: number,
  responseBody: AnyObj,
): Promise<void> {
  const idempotencyKey = `inbound:${provider}:${externalApplyId}`;
  await prisma.applicationIdempotency
    .update({
      where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
      data: { responseCode, responseBody: responseBody as object, recoveryPoint: "completed", lastRunAt: new Date() },
    })
    .catch(() => {});
}

/**
 * Materialize the inbound resume into the buffer the resume->parse->screen pipeline
 * expects. The board delivers a resume EITHER inline (base64) OR via a fetchable
 * mediaUrl (downloaded immediately - LinkedIn's signed URL expires). Returns null
 * when the application carried no resume (honest absence) or the download failed (a
 * failed resume forward must not fail the application, exactly like apply-custom).
 */
async function materializeResume(
  app: NormalizedApplication,
  logger: Logger,
): Promise<{ buffer: Buffer; originalname: string; mimetype: string } | null> {
  const resume = app.resume;
  if (!resume) return null;
  const originalname = resume.fileName || "resume";
  const mimetype = resume.contentType || "application/octet-stream";

  // Inline base64: decode straight to a buffer.
  if (resume.base64) {
    try {
      const buffer = Buffer.from(resume.base64, "base64");
      if (buffer.length === 0) return null;
      return { buffer, originalname, mimetype };
    } catch (err) {
      logger.warn({ provider: app.provider, err }, "inbound-apply: failed to decode inline resume base64");
      return null;
    }
  }

  // Fetchable mediaUrl: download to a buffer now (the URL may expire). Best-effort.
  if (resume.mediaUrl) {
    try {
      const res = await fetch(resume.mediaUrl, { signal: AbortSignal.timeout(RESUME_FETCH_TIMEOUT_MS) });
      if (!res.ok) {
        logger.warn({ provider: app.provider, status: res.status }, "inbound-apply: resume mediaUrl download non-2xx");
        return null;
      }
      const arrayBuf = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length === 0) return null;
      // Honor a server-reported content-type when the adapter only had a default.
      const headerType = res.headers.get("content-type");
      return {
        buffer,
        originalname,
        mimetype: mimetype === "application/octet-stream" && headerType ? headerType : mimetype,
      };
    } catch (err) {
      logger.warn({ provider: app.provider, err }, "inbound-apply: resume mediaUrl download failed");
      return null;
    }
  }

  return null;
}

/** Flatten screener Q&A + cover letter into the Application formResponses (the same
 *  shape the public apply-custom stores). Pure passthrough - never synthesized. */
function buildFormResponses(app: NormalizedApplication): Record<string, unknown> {
  const formResponses: Record<string, unknown> = {};
  for (const { question, answer } of app.screenerAnswers) {
    if (question) formResponses[question] = answer;
  }
  // Provenance: which board this application arrived from + the board's own ids.
  formResponses["__source"] = `JOB_BOARD:${app.provider}`;
  formResponses["__externalApplyId"] = app.externalApplyId;
  formResponses["__jobExternalId"] = app.jobExternalId;
  return formResponses;
}

export function createInboundJobApplicationRouter(logger: Logger): Router {
  const router = Router();

  // POST /internal/inbound-job-application/:provider/:tenantId
  router.post("/:provider/:tenantId", async (req: Request, res: Response, next: NextFunction) => {
    const providerKey = String(req.params["provider"] ?? "");
    const tenantId = String(req.params["tenantId"] ?? "");

    try {
      // ── 1. Resolve the adapter. Unknown board -> 404 (forged provider no-op). ──
      const provider = getProvider(providerKey);
      if (!provider) {
        logger.warn({ providerKey }, "inbound-apply: unknown provider");
        // No adapter to render provider-specific codes; a plain 404 is correct.
        return res.status(404).json({ accepted: false, outcome: "UNKNOWN_POSTING", error: { code: "UNKNOWN_PROVIDER", message: "Unknown hiring-platform provider" } });
      }
      const pkey = provider.id;

      // ── 2. Size guard BEFORE any parse (413). ─────────────────────────────────
      if (rawBodyBytes(req) > MAX_BODY_BYTES) {
        logger.warn({ provider: pkey, tenantId }, "inbound-apply: body exceeds size cap");
        return respond(res, pkey, "TOO_LARGE");
      }

      const rawBody = rawBodyString(req);

      // ── 3. Verify the signature over the EXACT raw bytes BEFORE trusting it. ───
      // Load the tenant's stored webhook secret for this board (decrypted creds
      // store). A missing creds row -> no secret -> verifySignature fail-closed.
      let secret: string | undefined;
      try {
        const creds = await loadPlatformCredentials(tenantId, pkey);
        secret = decryptSecret(creds?.webhookSecret);
      } catch (err) {
        // A creds-store blip must not be mistaken for "forged"; surface a 5xx so the
        // board retries rather than us recording a phantom 401.
        logger.warn({ provider: pkey, tenantId, err }, "inbound-apply: creds store error loading webhook secret");
        return next(err);
      }

      const verified = verifySignature(pkey, rawBody, req.headers, secret);

      // LinkedIn challenge handshake: a body carrying a challengeCode with NO
      // signature is LinkedIn validating the endpoint. verifySignature accepts it
      // (when a secret is configured) and parseApplication returns null for it; we
      // echo the challengeCode in a 200 so the endpoint is confirmed. This is the
      // ONLY non-signed path we honor and it creates no candidate.
      if (verified && pkey === "linkedin") {
        const challenge = readLinkedInChallenge(rawBody);
        if (challenge) {
          logger.info({ provider: pkey, tenantId }, "inbound-apply: linkedin challenge handshake echoed");
          return res.status(200).json({ provider: pkey, challengeCode: challenge });
        }
      }

      if (!verified) {
        // Forged / unsigned / wrong-secret / no-secret callback -> reject, no write.
        logger.warn({ provider: pkey, tenantId }, "inbound-apply: signature verification failed");
        return respond(res, pkey, "UNAUTHORIZED");
      }

      // ── 4. Parse the (verified) RAW body. null -> ack-and-ignore. ─────────────
      // REAL-or-null: a ping / status ack / malformed / real-but-incomplete payload
      // yields null and we NEVER create a phantom candidate. We distinguish a
      // malformed body (400) from a well-formed-but-incomplete one (422) for Indeed.
      let app: NormalizedApplication | null;
      try {
        app = provider.parseApplication(rawBody);
      } catch (err) {
        logger.warn({ provider: pkey, tenantId, err }, "inbound-apply: parseApplication threw");
        return respond(res, pkey, "MALFORMED");
      }
      if (!app) {
        // Honest ack-and-ignore: not a real application event (or no usable
        // applicant). For Indeed, a body that is not valid JSON is MALFORMED (400);
        // a well-formed body that simply is not an apply / lacks a required field is
        // UNPROCESSABLE (422). NEVER a phantom candidate.
        const malformed = !isParseableJson(rawBody);
        const outcome: InboundOutcome = malformed ? "MALFORMED" : "UNPROCESSABLE";
        logger.info({ provider: pkey, tenantId, outcome }, "inbound-apply: no real application in payload - ignored");
        return respond(res, pkey, outcome, { reason: malformed ? "unparseable body" : "no real application in payload" });
      }

      // ── 5. Resolve the owning JobPosting (and confirm it is still live). ──────
      const posting = await resolvePosting(tenantId, pkey, app.jobExternalId);
      if (!posting) {
        // The board posting id is unknown to this tenant -> 404 (Indeed stops only
        // on 410; a 404 lets it retry in case of a race, which is the documented
        // semantics). No candidate created.
        logger.warn({ provider: pkey, tenantId, jobExternalId: app.jobExternalId }, "inbound-apply: no posting for jobExternalId");
        return respond(res, pkey, "UNKNOWN_POSTING", { jobExternalId: app.jobExternalId });
      }
      if (!posting.isPublished) {
        // The listing is closed/unpublished -> 410 GONE (the board stops sending).
        logger.info({ provider: pkey, tenantId, jobPostingId: posting.id }, "inbound-apply: posting closed/unpublished - GONE");
        return respond(res, pkey, "GONE", { jobPostingId: posting.id });
      }

      // ── 6. Idempotency on the board's externalApplyId. ────────────────────────
      const claim = await claimInboundKey(tenantId, pkey, app.externalApplyId, logger);
      if (claim.duplicate) {
        // Already ingested -> idempotent no-op replay. Indeed answers 409 and stops
        // retrying this delivery; no second Candidate/Application is created.
        logger.info({ provider: pkey, tenantId, externalApplyId: app.externalApplyId }, "inbound-apply: duplicate delivery - no-op");
        return respond(res, pkey, "DUPLICATE", { externalApplyId: app.externalApplyId });
      }

      // ── 7. Dedupe Candidate by (tenantId, email) + create Application via the
      //       EXISTING internal applications path, then store + forward the resume
      //       to the resume->parse->screen pipeline IDENTICALLY to apply-custom. ──
      const candidate = await callCandidateService<{ id: string }>({
        method: "POST",
        path: "/internal/candidates/upsert-from-application",
        tenantId,
        body: {
          firstName: app.candidate.firstName,
          // candidate-service requires a non-empty lastName (min(1)). Some boards
          // (e.g. Indeed) honestly normalize a single-token name to an EMPTY last
          // name rather than fabricate one; that real applicant must still land, so
          // we fall back the surname to the (real) first name at the call boundary
          // only when the board genuinely gave none. This fills a required contract
          // field for a REAL applicant - it does NOT invent a phantom candidate.
          lastName: app.candidate.lastName.trim() || app.candidate.firstName,
          email: app.candidate.email,
          phone: app.candidate.phone,
          // source records the board so downstream analytics/HITL see provenance.
          source: `JOB_BOARD_${pkey.toUpperCase().replace(/-/g, "_")}`,
        },
      });

      const application = await callCandidateService<{ id: string }>({
        method: "POST",
        path: "/internal/applications",
        tenantId,
        role: "RECRUITER", // trusted internal call; endpoint is recruiter/admin-gated
        body: {
          candidateId: candidate.id,
          requisitionId: posting.requisitionId,
          notes: app.coverLetter ?? null,
          formResponses: buildFormResponses(app),
        },
      });

      // Resume: download (mediaUrl) or decode (base64) then forward for parsing.
      // Best-effort - a failed resume forward must not fail the application (the
      // candidate + application already exist), exactly like apply-custom.
      let resumeForwarded = false;
      const resumeFile = await materializeResume(app, logger);
      if (resumeFile) {
        resumeForwarded = await forwardResumeUpload({
          tenantId,
          candidateId: candidate.id,
          file: resumeFile,
        });
      }

      // Bump the posting's application count (best-effort), matching apply-custom.
      prisma.jobPosting
        .update({ where: { id: posting.id }, data: { applicationCount: { increment: 1 } } })
        .catch(() => {});

      // ── 8. Publish jobboard.application.received (best-effort). ───────────────
      // Mirrors the public-apply observability event so the rest of the platform
      // (analytics, notifications, HITL) sees a board-sourced application land. NATS
      // may be unconfigured in some environments; never let a publish failure fail
      // the apply (the candidate/application/resume are already committed).
      await publishReceived(
        {
          tenantId,
          provider: pkey,
          jobPostingId: posting.id,
          requisitionId: posting.requisitionId,
          applicationId: application.id,
          candidateId: candidate.id,
          externalApplyId: app.externalApplyId,
          jobExternalId: app.jobExternalId,
          appliedAt: app.appliedAt.toISOString(),
          resumeForwarded,
        },
        logger,
      );

      const responseBody: AnyObj = {
        applicationId: application.id,
        candidateId: candidate.id,
        resumeForwarded,
        jobPostingId: posting.id,
        externalApplyId: app.externalApplyId,
      };
      // Record the completed idempotency outcome (best-effort) so a re-delivery
      // replays as DUPLICATE rather than re-creating.
      await completeInboundKey(tenantId, pkey, app.externalApplyId, 200, responseBody);

      logger.info(
        { provider: pkey, tenantId, applicationId: application.id, candidateId: candidate.id, resumeForwarded },
        "inbound-apply: board application ingested",
      );
      return respond(res, pkey, "OK", responseBody);
    } catch (err) {
      // An unexpected error (candidate-service down, etc.): surface a 5xx via the
      // shared error handler so the board retries rather than us swallowing a real
      // application. Nothing partial is acked as success.
      logger.error({ provider: providerKey, tenantId, err }, "inbound-apply: ingest failed");
      next(err);
    }
  });

  return router;
}

/** Whether the raw body is parseable JSON (used to split Indeed MALFORMED 400 from
 *  UNPROCESSABLE 422 when parseApplication returns null). */
function isParseableJson(rawBody: string): boolean {
  if (!rawBody.trim()) return false;
  try {
    JSON.parse(rawBody);
    return true;
  } catch {
    return false;
  }
}

/** Read a LinkedIn challenge code from a verified handshake body (no signature). */
function readLinkedInChallenge(rawBody: string): string | undefined {
  try {
    const o = JSON.parse(rawBody) as AnyObj;
    const c = o["challengeCode"] ?? o["challenge"];
    return typeof c === "string" && c.length > 0 ? c : undefined;
  } catch {
    return undefined;
  }
}

/** Payload for the jobboard.application.received event. */
interface JobBoardApplicationReceivedPayload {
  tenantId: string;
  provider: ProviderKey;
  jobPostingId: string;
  requisitionId: string;
  applicationId: string;
  candidateId: string;
  externalApplyId: string;
  jobExternalId: string;
  appliedAt: string;
  resumeForwarded: boolean;
}

/**
 * Publish jobboard.application.received to JetStream (best-effort). Imported
 * lazily so a route that runs in an environment with NATS_URL unset (the publisher
 * throws "not connected") simply logs and continues - the application is already
 * committed and must not be rolled back by a missing message bus.
 */
async function publishReceived(payload: JobBoardApplicationReceivedPayload, logger: Logger): Promise<void> {
  try {
    if (!process.env["NATS_URL"]) return;
    const { publishEvent } = await import("@cdc-ats/nats-client");
    await publishEvent({
      subject: tenantSubject(payload.tenantId, "jobboard", "application.received"),
      type: "jobboard.application.received",
      tenantId: payload.tenantId,
      payload,
    });
  } catch (err) {
    logger.warn({ provider: payload.provider, applicationId: payload.applicationId, err }, "inbound-apply: jobboard.application.received publish failed (non-fatal)");
  }
}

export default createInboundJobApplicationRouter;
