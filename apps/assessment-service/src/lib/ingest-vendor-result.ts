/**
 * Vendor result ingest (assessment-service) — WF8 / SLICE H5.
 *
 * The SINGLE place a vendor {@link NormalizedResult} becomes an AssessmentResult +
 * an `assessment.completed` event. BOTH result paths call this so they produce
 * byte-identical effects and are idempotent with each other:
 *   - the inbound webhook (Codility/HackerEarth/iMocha/TestGorilla) — push, and
 *   - the poll reconciler (HackerRank + any dropped webhook) — pull.
 *
 * Idempotency model (the whole reason this is one function):
 *   - A vendor result has NO native Attempt, and AssessmentResult.attemptId is
 *     @unique. We key the result by a STABLE synthetic attempt id derived from the
 *     invite — `provider:{inviteId}` — so a webhook retry AND a later poll for the
 *     same invite UPSERT the SAME row instead of duplicating it.
 *   - The poll path passes `onlyIfAbsent:true`: if a finalized result already
 *     exists for the invite (e.g. the webhook already landed), the poll SKIPS the
 *     write + the publish entirely (no duplicate completion event). The webhook
 *     path leaves it false (last-delivery wins — vendors re-send the same final
 *     payload, so a re-write is harmless and keeps the latest verbatim `raw`).
 *
 * HARD RULES baked in (identical to the inbound route they were extracted from):
 *  - REAL data or honest empty ONLY. rawScore/maxScore are stored ONLY from real
 *    vendor figures; a completion with NO numeric grade stores 0/0 AND forces
 *    manual review (never a fabricated zero). `normalized` + verbatim `raw` are
 *    kept as provenance for every stored field.
 *  - NO auto-reject. We publish assessment.completed (the SAME event the native
 *    take/grade path emits) which advances ApplicationStage ASSESSMENT + routes to
 *    the existing HITL queue. `passed` is null whenever a human review is pending.
 */
import type { Logger } from "pino";
import { prismaAdmin } from "./prisma.js";
import { publishEvent, assessmentSubject } from "./nats.js";
import { fetchApplicationForCandidate } from "./service-client.js";
import type { NormalizedResult } from "../providers/types.js";

/** The minimal invite shape the ingest needs (a subset of AssessmentInvite). */
export interface IngestInvite {
  id: string;
  tenantId: string;
  assessmentId: string;
  candidateId: string;
  applicationId: string | null;
  submittedAt: Date | null;
}

export interface IngestVendorResultOptions {
  invite: IngestInvite;
  providerKey: string;
  normalized: NormalizedResult;
  /**
   * Poll path → true: skip the write + publish when a finalized result already
   * exists for this invite (the webhook beat us to it). Webhook path → false
   * (default): last delivery wins.
   */
  onlyIfAbsent?: boolean;
}

export interface IngestVendorResultOutcome {
  applied: boolean;
  /** Why we did not apply (when applied=false): "already-finalized". */
  reason?: string;
  resultId?: string;
  needsReview?: boolean;
  scorePercent?: number | null;
}

/** The stable synthetic attempt id for a vendor (no-native-Attempt) result. */
export function syntheticAttemptIdForInvite(inviteId: string): string {
  return `provider:${inviteId}`;
}

/**
 * Map a real vendor {@link NormalizedResult} onto an AssessmentResult (upsert,
 * idempotent), mark the invite SUBMITTED, and publish assessment.completed. Never
 * synthesizes a score; never auto-rejects. Returns whether anything was applied.
 */
export async function ingestVendorResult(
  opts: IngestVendorResultOptions,
  logger: Logger,
): Promise<IngestVendorResultOutcome> {
  const { invite, providerKey, normalized, onlyIfAbsent = false } = opts;
  const { tenantId, assessmentId, candidateId } = invite;
  const providerInvitationId = normalized.providerInvitationId;
  const syntheticAttemptId = syntheticAttemptIdForInvite(invite.id);

  // Idempotency guard for the POLL path: if a finalized result already exists for
  // this invite, do nothing (the webhook/an earlier poll already published the
  // completion). A still-pending-review row is NOT "finalized", so a later real
  // grade can still land — but we never re-publish a duplicate completion.
  if (onlyIfAbsent) {
    const existing = await prismaAdmin.assessmentResult.findUnique({
      where: { attemptId: syntheticAttemptId },
      select: { id: true, gradedAt: true, pendingManualReview: true },
    });
    if (existing && (existing.gradedAt !== null || existing.pendingManualReview === false)) {
      return { applied: false, reason: "already-finalized", resultId: existing.id };
    }
  }

  // ── Map the REAL vendor result onto AssessmentResult (no synthesis) ───────────
  const hasAbsolute = typeof normalized.score === "number" && typeof normalized.maxScore === "number";
  const hasPercent = typeof normalized.percentage === "number";
  const rawScore = hasAbsolute ? (normalized.score as number) : hasPercent ? (normalized.percentage as number) : 0;
  const maxScore = hasAbsolute ? (normalized.maxScore as number) : hasPercent ? 100 : 0;
  const scorePercent = hasAbsolute
    ? (normalized.maxScore as number) > 0
      ? Math.round(((normalized.score as number) / (normalized.maxScore as number)) * 100)
      : null
    : hasPercent
      ? Math.round(normalized.percentage as number)
      : null;
  const hasNumericScore = hasAbsolute || hasPercent;

  // Pass/fail: the vendor's own verdict when supplied; else recompute against the
  // assessment's passing bar when both exist; else null (honest unknown). A
  // plagiarism flag OR a missing numeric score forces manual review.
  const assessment = await prismaAdmin.assessment.findUnique({
    where: { id: assessmentId },
    select: { passingScore: true, requisitionId: true },
  });
  const passingScore = assessment?.passingScore ?? null;
  const vendorPassed = typeof normalized.passed === "boolean" ? normalized.passed : null;
  const computedPassed =
    vendorPassed !== null
      ? vendorPassed
      : passingScore != null && scorePercent != null
        ? scorePercent >= passingScore
        : null;
  const needsReview = !hasNumericScore || normalized.plagiarismFlag === true || computedPassed === null;

  // Verbatim vendor payload + normalized view as provenance on perQuestion (the
  // same JSON column the native grader uses). `raw` is kept untouched so every
  // stored field is traceable to a real vendor field.
  const perQuestion = [
    {
      source: providerKey,
      providerInvitationId,
      status: normalized.status,
      ...(normalized.reportUrl ? { reportUrl: normalized.reportUrl } : {}),
      ...(Array.isArray(normalized.sections) && normalized.sections.length ? { sections: normalized.sections } : {}),
      ...(typeof normalized.plagiarismFlag === "boolean" ? { plagiarismFlag: normalized.plagiarismFlag } : {}),
      normalized,
      raw: normalized.raw,
    },
  ];

  const now = new Date();
  const result = await prismaAdmin.assessmentResult.upsert({
    where: { attemptId: syntheticAttemptId },
    update: {
      rawScore,
      maxScore,
      passed: needsReview ? null : computedPassed, // hold the verdict for a human when flagged
      pendingManualReview: needsReview,
      perQuestion: perQuestion as object,
      gradedAt: needsReview ? null : now,
    },
    create: {
      tenantId,
      assessmentId,
      attemptId: syntheticAttemptId,
      candidateId,
      rawScore,
      maxScore,
      passed: needsReview ? null : computedPassed,
      pendingManualReview: needsReview,
      perQuestion: perQuestion as object,
      gradedAt: needsReview ? null : now,
    },
  });

  // Mark the invite SUBMITTED (its lifecycle end) without disturbing native take
  // fields. Best-effort.
  await prismaAdmin.assessmentInvite
    .update({ where: { id: invite.id }, data: { status: "SUBMITTED", submittedAt: invite.submittedAt ?? now } })
    .catch(() => {});

  // Resolve the applicationId so candidate-service advances the right application's
  // stage (best-effort; null is acceptable). Prefer the invite's own applicationId,
  // else resolve via candidate-service like the native path.
  let applicationId: string | null = invite.applicationId ?? null;
  if (!applicationId) {
    try {
      applicationId = await fetchApplicationForCandidate(candidateId, tenantId, assessment?.requisitionId ?? null);
    } catch {
      applicationId = null;
    }
  }

  // Publish assessment.completed — the SAME event the native grading worker + the
  // webhook path publish — so notification + candidate-service advance
  // ApplicationStage ASSESSMENT + route to the existing HITL queue. NEVER an
  // auto-reject: `passed` is null while a human review is pending.
  await publishEvent({
    subject: assessmentSubject(tenantId, "completed"),
    type: "assessment.completed",
    tenantId,
    payload: {
      tenantId,
      assessmentId,
      attemptId: syntheticAttemptId,
      candidateId,
      applicationId,
      provider: providerKey,
      passed: needsReview ? null : computedPassed,
      score: scorePercent,
      needsReview,
    },
  }).catch((err) => logger.warn({ err, inviteId: invite.id }, "failed to publish assessment.completed"));

  return { applied: true, resultId: result.id, needsReview, scorePercent };
}
