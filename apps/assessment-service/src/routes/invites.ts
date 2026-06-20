/**
 * Assessment invite router (assessment-service).
 *
 * Mounted at /internal/assessments behind readAuthHeaders() + tenantContext, so
 * every handler runs with a bound request tenant and the RLS-scoped `prisma`
 * client. Issues a single-use candidate invite and lists existing invites.
 *
 * Token discipline (HARD RULE): the candidate's credential is an opaque random
 * token. Only its SHA-256 `tokenHash` is persisted — the raw token is NEVER
 * stored and is returned to the recruiter exactly ONCE, on creation, inside the
 * absolute take URL. The public take endpoint resolves the tenant by hashing the
 * presented raw token and matching `tokenHash`. The list endpoint never returns
 * a raw token (it cannot — we don't have it).
 *
 * On creation we publish `assessment.invited` so the notification-service can
 * email the candidate. The link in that event is ABSOLUTE (a relative path
 * silently 400s the notification-service `link` Zod .url() check), built from
 * APP_URL.
 *
 * Adverse downstream outcomes are routed to the existing HITL flow — there is no
 * auto-reject here (GDPR Art. 22).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId, requireRole } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { publishEvent, assessmentSubject } from "../lib/nats.js";
import { enqueueProviderInvite } from "../lib/queue.js";
import { isProviderKey } from "../providers/index.js";

const router = Router();

// Invites are issued by the same roles that manage requisitions/screening.
const requireInviter = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");

// Invites are valid for 5 days from issue.
const INVITE_TTL_MS = 5 * 24 * 60 * 60 * 1000;

// Public take base URL — MUST be absolute so the notification-service `link`
// (Zod .url()) accepts it; a relative path silently 400s and is swallowed.
const APP_URL = process.env["APP_URL"] ?? "http://localhost:3000";

const CreateInviteSchema = z.object({
  candidateId: z.string().uuid(),
  email: z.string().email(),
  applicationId: z.string().uuid().optional(),
  // ── External OA-vendor invite (WF8 / SLICE H3) — OPTIONAL ──
  // When `provider` is present the invite is fulfilled on an external vendor
  // (HackerRank, Codility, ...) via the provider-invite worker instead of the
  // native take flow. `providerTestId` is the vendor's own test id to invite to.
  // Omit `provider` to keep the DEFAULT native invite (a hashed single-use token).
  provider: z.string().min(1).optional(),
  providerTestId: z.string().min(1).optional(),
  candidateFirstName: z.string().min(1).max(120).optional(),
  candidateLastName: z.string().min(1).max(120).optional(),
}).refine((b) => !b.provider || Boolean(b.providerTestId), {
  message: "providerTestId is required when provider is specified",
  path: ["providerTestId"],
});

/** SHA-256 hex of the raw token — the only form we persist / look up by. */
function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * POST /internal/assessments/:id/invite
 *
 * Create an invite for an assessment. TWO modes, native is the DEFAULT:
 *
 *   - Native (no `provider`): a single-use hashed token. Returns the raw take URL
 *     ONCE (the raw token is never stored / re-fetchable) and publishes
 *     `assessment.invited` immediately for the notification-service to email.
 *
 *   - External vendor (`provider` + `providerTestId`): the invite is fulfilled on
 *     an external OA vendor (HackerRank, Codility, ...) ASYNCHRONOUSLY by the
 *     provider-invite worker. We create the invite row as PENDING (no native
 *     token), enqueue the provider-invite job, and return 202-style { provider,
 *     status: "PENDING" }. The worker calls the vendor, stores the REAL
 *     providerInvitationId + the AES-GCM-encrypted per-invite secret, flips status
 *     to SENT, and THEN publishes `assessment.invited` (with the vendor take URL).
 *     We never fabricate a vendor id here.
 */
router.post("/:id/invite", requireInviter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const assessmentId = req.params["id"] as string;
    const body = CreateInviteSchema.parse(req.body);

    // Confirm the assessment exists in this tenant (RLS-scoped read). Avoids
    // dangling invites against another tenant's / a deleted assessment.
    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
      select: { id: true },
    });
    if (!assessment) throw Errors.notFound("Assessment");

    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

    // ── External-vendor invite (async via the provider-invite worker) ──────────
    if (body.provider) {
      if (!isProviderKey(body.provider)) {
        throw Errors.validation(`Unknown assessment provider "${body.provider}"`);
      }
      // The local invite row still needs a unique tokenHash (the column is
      // NOT NULL + @unique). The candidate takes the vendor test, not the native
      // flow, so this token is never surfaced — it is a random non-take placeholder.
      const placeholderToken = randomBytes(32).toString("hex");
      const invite = await prisma.assessmentInvite.create({
        data: {
          tenantId,
          assessmentId,
          candidateId: body.candidateId,
          ...(body.applicationId ? { applicationId: body.applicationId } : {}),
          tokenHash: hashToken(placeholderToken),
          email: body.email,
          provider: body.provider,
          // PENDING until the worker confirms the real vendor invitation.
          status: "PENDING",
          expiresAt,
        },
      });

      // Enqueue the outbound provider invite. Idempotent at the queue layer
      // (jobId = provider+inviteId) and at the worker (skips an already-SENT row).
      // A missing Redis (dev/CI) leaves the invite PENDING rather than 500ing.
      await enqueueProviderInvite({
        tenantId,
        inviteId: invite.id,
        assessmentId,
        candidateId: body.candidateId,
        provider: body.provider,
        providerTestId: body.providerTestId as string,
        email: body.email,
        ...(body.candidateFirstName ? { candidateFirstName: body.candidateFirstName } : {}),
        ...(body.candidateLastName ? { candidateLastName: body.candidateLastName } : {}),
        // No per-invite webhookUrl is registered here: the H4 inbound webhook keys
        // its path on the vendor's providerInvitationId, which does not exist until
        // AFTER adapter.invite() returns. The H5 poll reconciler (which polls every
        // provider-backed SENT invite by its stored providerInvitationId) is the
        // guaranteed, idempotent result channel; the webhook is a best-effort
        // accelerator a later slice can wire once the id round-trip is settled.
        expiresAt: expiresAt.toISOString(),
        userId,
      }).catch(() => {
        // Queue unreachable (e.g. Redis down in dev/CI) — the invite row stays
        // PENDING so a retry / reconciliation poller can re-drive it later, rather
        // than 500ing the recruiter's request. No fabricated vendor id is created.
      });

      return created(res, { ...invite, provider: body.provider, status: "PENDING", async: true });
    }

    // ── Native invite (DEFAULT): single-use hashed token ──────────────────────
    // Opaque single-use token: 32 random bytes, hex-encoded. Store only the hash.
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    const invite = await prisma.assessmentInvite.create({
      data: {
        tenantId,
        assessmentId,
        candidateId: body.candidateId,
        ...(body.applicationId ? { applicationId: body.applicationId } : {}),
        tokenHash,
        email: body.email,
        status: "SENT",
        expiresAt,
        sentAt: new Date(),
      },
    });

    const rawTokenUrl = `${APP_URL}/assessment/take/${rawToken}`;

    // Notify-only: notification-service consumes this to email the candidate the
    // take link. The URL is absolute (relative paths 400 the .url() check).
    await publishEvent({
      subject: assessmentSubject(tenantId, "invited"),
      type: "assessment.invited",
      tenantId,
      payload: {
        tenantId,
        inviteId: invite.id,
        assessmentId,
        candidateId: body.candidateId,
        email: body.email,
        rawTokenUrl,
      },
    }).catch(() => {});

    // The raw take URL is surfaced to the recruiter ONCE here — never persisted,
    // never returned again. The stored invite carries only the tokenHash.
    created(res, { ...invite, rawTokenUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /internal/assessments/:id/invites
 *
 * List the invites issued for an assessment in this tenant. Never returns a raw
 * token (we only store the hash) — `tokenHash` is omitted from the response.
 */
router.get("/:id/invites", requireInviter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const assessmentId = req.params["id"] as string;

    const invites = await prisma.assessmentInvite.findMany({
      where: { tenantId, assessmentId },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        tenantId: true,
        assessmentId: true,
        candidateId: true,
        applicationId: true,
        email: true,
        status: true,
        expiresAt: true,
        sentAt: true,
        openedAt: true,
        startedAt: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    ok(res, invites);
  } catch (err) {
    next(err);
  }
});

export default router;
