/**
 * GDPR / EU AI Act - per-candidate Online Assessment (OA) data export + erasure
 * (assessment-service, WF10 / J1).
 *
 *   GET    /internal/gdpr/candidates/:id/export   bundles every OA row about the
 *                                                 candidate (Article 15 access +
 *                                                 Article 20 portability)
 *   DELETE /internal/gdpr/candidates/:id          erases / anonymizes every OA row
 *                                                 about the candidate (Article 17)
 *
 * These are the OA legs of the platform-wide data-subject-request (DSR) fan-out.
 * The api-gateway /api/gdpr/candidates/:id orchestration AND the compliance
 * service erasure path both call these so a candidate erasure/export ALSO covers
 * the assessment rows: Attempt, Answer, AssessmentResult, ProctorEvent, and the
 * AssessmentInvite (its email is candidate PII).
 *
 * These are AUTHENTICATED internal routes (mounted behind readAuthHeaders +
 * tenantContext), so the tenant is on the request header. We still query with
 * prismaAdmin and an EXPLICIT tenantId filter (not the RLS request client): the
 * erasure runs a multi-table batch that the RLS per-operation wrapper would
 * reshape, exactly like candidate-service GDPR uses prismaAdmin for its batch.
 * Defense in depth: every where-clause carries tenantId, so a cross-tenant id can
 * never touch another tenant's rows even on the admin client.
 *
 * HARD RULES honored:
 *  - REAL data / honest empty only. An empty export is { candidateId, counts:0,
 *    attempts:[] }, never a fabricated record.
 *  - NEVER leak the answer key or hidden test cases. The frozen Attempt.answerKey
 *    and per-question hidden test-case I/O are STRIPPED from the export (the
 *    data subject gets their own data, not the grading key).
 *  - Erasure is irreversible PII removal; surviving foreign-key shells are
 *    anonymized rather than orphaned. No em / en dashes.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, getTenantId } from "@cdc-ats/common";
// Cross-table batch + RLS-bypassing admin path (see file header). Every query
// carries an explicit tenantId filter so isolation holds without the RLS wrapper.
import { prismaAdmin as prisma } from "../lib/prisma.js";

const router = Router();

type AnyObj = Record<string, unknown>;
const asArray = (v: unknown): AnyObj[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as AnyObj[]) : [];

/**
 * Strip the answer key / hidden test-case I/O from a persisted perQuestion grade
 * before it goes into a data-subject export. The candidate may see WHICH grading
 * method ran + their own per-question outcome + the rationale, but never the
 * correct answer or a hidden case's stdin/expected output.
 */
function sanitizeGradeForSubject(grade: AnyObj): AnyObj {
  const testCases = asArray(grade["testCases"]).map((tc) => {
    const hidden = tc["hidden"] === true;
    const base: AnyObj = {
      name: tc["name"] ?? null,
      hidden,
      passed: typeof tc["passed"] === "boolean" ? tc["passed"] : null,
      status: tc["status"] ?? null,
    };
    if (!hidden) {
      if (tc["stdin"] !== undefined) base["stdin"] = tc["stdin"];
      if (tc["expectedOutput"] !== undefined) base["expectedOutput"] = tc["expectedOutput"];
      if (tc["actualOutput"] !== undefined) base["actualOutput"] = tc["actualOutput"];
    }
    return base;
  });
  return {
    questionId: grade["questionId"] ?? null,
    type: grade["type"] ?? null,
    correct: typeof grade["correct"] === "boolean" ? grade["correct"] : null,
    pointsAwarded: typeof grade["pointsAwarded"] === "number" ? grade["pointsAwarded"] : null,
    pointsPossible: typeof grade["pointsPossible"] === "number" ? grade["pointsPossible"] : null,
    manuallyGraded: grade["manuallyGraded"] === true,
    ...(typeof grade["rationale"] === "string" ? { rationale: grade["rationale"] } : {}),
    ...(asArray(grade["criteria"]).length
      ? {
          criteria: asArray(grade["criteria"]).map((c) => ({
            name: c["name"] ?? null,
            score: typeof c["score"] === "number" ? c["score"] : null,
            maxScore: typeof c["maxScore"] === "number" ? c["maxScore"] : null,
            rationale: typeof c["rationale"] === "string" ? c["rationale"] : null,
          })),
        }
      : {}),
    ...(testCases.length ? { testCases } : {}),
  };
}

// ── GET /internal/gdpr/candidates/:id/export ──────────────────────────────────
// Article 15 (access) + Article 20 (portability). Returns every OA row about the
// candidate: attempts (with their answers, sanitized grades, explainability, and
// proctoring events) + invites. The answer key / hidden test-case I/O are
// stripped; the data subject gets THEIR data, not the grading key.
router.get("/candidates/:id/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const candidateId = req.params["id"] as string;

    const [invites, attempts] = await Promise.all([
      prisma.assessmentInvite.findMany({
        where: { tenantId, candidateId },
        orderBy: { createdAt: "asc" },
      }),
      prisma.attempt.findMany({
        where: { tenantId, candidateId },
        orderBy: { createdAt: "asc" },
        include: {
          answers: { select: { questionId: true, value: true, timeSpentSeconds: true, createdAt: true } },
          proctorEvents: {
            orderBy: { occurredAt: "asc" },
            select: { type: true, metadata: true, occurredAt: true },
          },
          result: true,
          assessment: { select: { id: true, title: true } },
        },
      }),
    ]);

    const attemptExport = attempts.map((a) => ({
      id: a.id,
      assessmentId: a.assessmentId,
      assessmentTitle: a.assessment?.title ?? null,
      status: a.status,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      durationSeconds: a.durationSeconds,
      createdAt: a.createdAt,
      // The candidate's own answers (Answer.value). The frozen answerKey is
      // SERVER-ONLY and intentionally NOT exported.
      answers: a.answers.map((ans) => ({
        questionId: ans.questionId,
        value: ans.value,
        timeSpentSeconds: ans.timeSpentSeconds,
        answeredAt: ans.createdAt,
      })),
      proctorEvents: a.proctorEvents.map((e) => ({
        type: e.type,
        metadata: e.metadata,
        occurredAt: e.occurredAt,
      })),
      result: a.result
        ? {
            rawScore: a.result.rawScore,
            maxScore: a.result.maxScore,
            passed: a.result.passed,
            pendingManualReview: a.result.pendingManualReview,
            gradedAt: a.result.gradedAt,
            // EU AI Act explainability record (how the score was produced).
            explainability: a.result.explainability ?? null,
            // Per-question breakdown with the answer key / hidden I/O stripped.
            perQuestion: asArray(a.result.perQuestion).map(sanitizeGradeForSubject),
          }
        : null,
    }));

    ok(res, {
      service: "assessment",
      exportedAt: new Date().toISOString(),
      gdprArticle: "Article 15 (access) + Article 20 (portability)",
      candidateId,
      counts: {
        invites: invites.length,
        attempts: attempts.length,
        answers: attempts.reduce((n, a) => n + a.answers.length, 0),
        results: attempts.filter((a) => a.result).length,
        proctorEvents: attempts.reduce((n, a) => n + a.proctorEvents.length, 0),
      },
      invites: invites.map((i) => ({
        id: i.id,
        assessmentId: i.assessmentId,
        email: i.email,
        status: i.status,
        provider: i.provider,
        expiresAt: i.expiresAt,
        sentAt: i.sentAt,
        openedAt: i.openedAt,
        startedAt: i.startedAt,
        submittedAt: i.submittedAt,
        createdAt: i.createdAt,
      })),
      attempts: attemptExport,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /internal/gdpr/candidates/:id ──────────────────────────────────────
// Article 17 (erasure). Physically deletes the candidate's OA child rows
// (Answer, ProctorEvent, AssessmentResult) and anonymizes the rows whose
// deletion would orphan a foreign key or lose audit-required structure
// (Attempt keeps the row but drops candidateId + the frozen answerKey;
// AssessmentInvite keeps the row but scrubs email + the candidate token hashes).
// Scoped by tenantId on every where-clause; runs as one transaction.
router.delete("/candidates/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const candidateId = req.params["id"] as string;

    // Resolve the candidate's attempts + invites so we can delete their child
    // rows and per-row anonymize (tokenHash / providerInvitationId are @unique,
    // so we cannot collapse every invite onto one scrubbed value).
    const [attempts, invites] = await Promise.all([
      prisma.attempt.findMany({ where: { tenantId, candidateId }, select: { id: true } }),
      prisma.assessmentInvite.findMany({ where: { tenantId, candidateId }, select: { id: true } }),
    ]);
    const attemptIds = attempts.map((a) => a.id);

    const anonymizedEmail = `deleted-${candidateId}@gdpr.invalid`;

    const ops: any[] = [
      // Children of the candidate's attempts.
      prisma.answer.deleteMany({ where: { tenantId, attemptId: { in: attemptIds } } }),
      prisma.proctorEvent.deleteMany({ where: { tenantId, attemptId: { in: attemptIds } } }),
      prisma.assessmentResult.deleteMany({ where: { tenantId, candidateId } }),
      // Anonymize the attempt shells (drop PII linkage + the frozen grade key).
      prisma.attempt.updateMany({
        where: { tenantId, candidateId },
        data: {
          candidateId: `deleted-${candidateId}`,
          answerKey: [] as object,
          sessionTokenHash: null,
        },
      }),
      // Anonymize each invite individually so the @unique token columns stay
      // unique (email is PII; the token hashes are candidate credentials).
      ...invites.map((inv) =>
        prisma.assessmentInvite.update({
          where: { id: inv.id },
          data: {
            candidateId: `deleted-${candidateId}`,
            email: anonymizedEmail,
            tokenHash: `gdpr-erased-${inv.id}`,
            providerInvitationId: null,
            providerSecret: null,
          },
        }),
      ),
    ];

    const [answers, proctorEvents, results, attemptsUpdated] = await prisma.$transaction(ops);
    const invitesUpdated = { count: invites.length };

    ok(res, {
      service: "assessment",
      deletedAt: new Date().toISOString(),
      gdprArticle: "Article 17 (right to erasure)",
      candidateId,
      result: {
        answersDeleted: (answers as { count: number }).count,
        proctorEventsDeleted: (proctorEvents as { count: number }).count,
        resultsDeleted: (results as { count: number }).count,
        attemptsAnonymized: (attemptsUpdated as { count: number }).count,
        invitesAnonymized: (invitesUpdated as { count: number }).count,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
