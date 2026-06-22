/**
 * Assessment results router (assessment-service) — SLICE G5.
 *
 * Mounted under /internal/assessments behind readAuthHeaders() + tenantContext.
 * Surfaces graded outcomes (AssessmentResult), the full per-attempt breakdown
 * (per-question answers, real Judge0 per-test-case code verdicts, per-criterion
 * LLM essay rationale, the ProctorEvent timeline + a derived risk score), and a
 * HITL human-grade override path, scoped to the request tenant via the RLS
 * `prisma` client.
 *
 * HARD RULES honored here:
 *  - REAL data or honest empty ONLY. List endpoints return [] when empty; a
 *    result that is still grading / awaiting manual review surfaces as such
 *    (pendingManualReview / null score) rather than inventing a grade. Judge0
 *    verdicts + LLM rubric rationale are read back verbatim from what the grading
 *    worker persisted — never fabricated here.
 *  - NO auto-reject. The grade override sets passed + clears needsReview for the
 *    human reviewer; routing an adverse outcome stays in the existing HITL flow
 *    (GDPR Art. 22). This endpoint records the human decision; it does not reject.
 *  - Hidden test cases are NEVER exposed. This is an INTERNAL (recruiter-side)
 *    surface, but we still strip hidden test-case stdin/expected output and the
 *    correctAnswer key from the question metadata we join in, so the detail shape
 *    is identical whether or not a hidden case existed (no leakage path).
 *
 * Per-question detail shape note: the grading worker stores per-question grades
 * (including code per-test-case verdicts and essay per-criterion rationale) on
 * AssessmentResult.perQuestion as JSON (the Answer row only carries the raw
 * candidate value + time spent — see prisma/schema.prisma). We read that JSON
 * back, merge the candidate's stored answer, and attach the non-sensitive
 * question metadata; we never re-grade and never fabricate missing grades.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type AnyObj = Record<string, unknown>;

const asArray = (v: unknown): AnyObj[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as AnyObj[]) : [];

const asObj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

/**
 * Strip everything that could leak the answer key / hidden test cases from a
 * question definition before it is joined into a result/attempt detail payload.
 * Hidden test cases NEVER reach any UI, recruiter-side included.
 */
function sanitizeQuestionMeta(q: AnyObj): AnyObj {
  const {
    // dropped: never expose these on a graded-detail surface
    correctAnswer: _correctAnswer,
    testCases: _testCases,
    hiddenTestCases: _hiddenTestCases,
    solution: _solution,
    ...safe
  } = q;
  return {
    id: safe["id"],
    type: safe["type"],
    prompt: safe["prompt"],
    order: safe["order"],
    points: safe["points"],
    ...(safe["language"] !== undefined ? { language: safe["language"] } : {}),
  };
}

/**
 * Sanitize a single per-test-case code verdict so only pass/fail + the
 * candidate-visible facets survive. The hidden flag is reported (so the UI can
 * show "5/8 hidden tests passed") but the stdin / expectedOutput of a hidden
 * case are removed; visible-case I/O is kept as-is. This mirrors what the
 * grading worker is expected to persist (status from a real Judge0 run).
 */
function sanitizeTestCase(tc: AnyObj): AnyObj {
  const hidden = tc["hidden"] === true;
  const base: AnyObj = {
    name: tc["name"] ?? null,
    hidden,
    passed: typeof tc["passed"] === "boolean" ? tc["passed"] : null,
    // Real Judge0 status (e.g. "Accepted", "Wrong Answer", "Time Limit
    // Exceeded"); read verbatim, never synthesized.
    status: tc["status"] ?? null,
    timeMs: typeof tc["timeMs"] === "number" ? tc["timeMs"] : null,
    memoryKb: typeof tc["memoryKb"] === "number" ? tc["memoryKb"] : null,
  };
  if (!hidden) {
    if (tc["stdin"] !== undefined) base["stdin"] = tc["stdin"];
    if (tc["expectedOutput"] !== undefined) base["expectedOutput"] = tc["expectedOutput"];
    if (tc["actualOutput"] !== undefined) base["actualOutput"] = tc["actualOutput"];
  }
  return base;
}

/**
 * Normalize one persisted perQuestion grade entry into the API detail shape,
 * merging the candidate's answer + sanitized question metadata. `correct` is null
 * (not false) for open-ended questions still awaiting manual grading — honest
 * empty rather than a fabricated zero.
 */
function buildQuestionDetail(grade: AnyObj, answer: AnyObj | undefined, questionMeta: AnyObj | undefined): AnyObj {
  const testCases = asArray(grade["testCases"]).map(sanitizeTestCase);
  // Per-criterion essay rubric rationale produced by the LLM grader. Read back
  // verbatim; if absent (not yet graded / not an essay) it is simply omitted.
  const criteria = asArray(grade["criteria"]).map((c) => ({
    name: c["name"] ?? null,
    score: typeof c["score"] === "number" ? c["score"] : null,
    maxScore: typeof c["maxScore"] === "number" ? c["maxScore"] : null,
    rationale: typeof c["rationale"] === "string" ? c["rationale"] : null,
  }));

  return {
    questionId: grade["questionId"],
    type: questionMeta?.["type"] ?? grade["type"] ?? null,
    prompt: questionMeta?.["prompt"] ?? null,
    correct: typeof grade["correct"] === "boolean" ? grade["correct"] : null,
    pointsAwarded: typeof grade["pointsAwarded"] === "number" ? grade["pointsAwarded"] : null,
    pointsPossible:
      typeof grade["pointsPossible"] === "number"
        ? grade["pointsPossible"]
        : typeof questionMeta?.["points"] === "number"
          ? (questionMeta["points"] as number)
          : null,
    manuallyGraded: grade["manuallyGraded"] === true,
    autoGraded: grade["manuallyGraded"] !== true && typeof grade["correct"] === "boolean",
    // Candidate's stored response (Answer.value). null when unanswered.
    answer: answer ? (answer["value"] ?? null) : null,
    timeSpentSeconds: answer && typeof answer["timeSpentSeconds"] === "number" ? answer["timeSpentSeconds"] : null,
    // CODING — real per-test-case Judge0 verdicts (hidden-case I/O stripped).
    ...(testCases.length ? { testCases } : {}),
    // ESSAY — per-criterion LLM rubric rationale.
    ...(criteria.length ? { criteria } : {}),
    // Overall grader rationale for this question (LLM essay summary), if any.
    ...(typeof grade["rationale"] === "string" && !criteria.length ? { rationale: grade["rationale"] } : {}),
  };
}

/**
 * Surface the EXTERNAL-vendor result summary that ingestVendorResult persisted on
 * AssessmentResult.perQuestion (see lib/ingest-vendor-result.ts lines 134-145).
 *
 * A vendor result has NO native Attempt + NO native per-question grades; its
 * perQuestion holds a SINGLE summary object `{ source, providerInvitationId,
 * status, reportUrl?, sections?, plagiarismFlag?, normalized, raw }`. The native
 * grader, by contrast, writes one entry per question (each carrying a
 * `questionId`). We detect the vendor shape by the presence of `source` +
 * `providerInvitationId` and the ABSENCE of `questionId`, and read every field
 * back VERBATIM (never synthesized). Returns null for a native (non-vendor)
 * result so the caller can omit the panel entirely (honest empty).
 *
 * The verbatim vendor `raw`/`normalized` provenance is intentionally NOT surfaced
 * here: this is the recruiter-facing display summary, not the DSAR/provenance
 * export (that already lives in routes/gdpr.ts). Sections are passed through as
 * the vendor reported them (name + whatever real score/percentage existed).
 */
function buildVendorSummary(perQuestion: unknown): AnyObj | null {
  const entries = asArray(perQuestion);
  // The vendor summary is the lone entry that carries a `source` + a
  // `providerInvitationId` and is NOT a per-question grade (no `questionId`).
  const v = entries.find(
    (e) =>
      typeof e["source"] === "string" &&
      typeof e["providerInvitationId"] === "string" &&
      e["questionId"] === undefined,
  );
  if (!v) return null;

  const sections = asArray(v["sections"]).map((s) => ({
    name: typeof s["name"] === "string" ? s["name"] : null,
    score: typeof s["score"] === "number" ? s["score"] : null,
    maxScore: typeof s["maxScore"] === "number" ? s["maxScore"] : null,
    percentage: typeof s["percentage"] === "number" ? s["percentage"] : null,
  }));

  return {
    provider: v["source"] ?? null,
    providerInvitationId: v["providerInvitationId"] ?? null,
    // Vendor-reported completion status (e.g. "COMPLETED"); verbatim or null.
    status: typeof v["status"] === "string" ? v["status"] : null,
    // Vendor-hosted candidate report URL, when the vendor supplied one.
    reportUrl: typeof v["reportUrl"] === "string" ? v["reportUrl"] : null,
    // Vendor plagiarism/cheating verdict, when the vendor evaluated one. null
    // (not false) when the vendor did not report it (honest unknown).
    plagiarismFlag: typeof v["plagiarismFlag"] === "boolean" ? v["plagiarismFlag"] : null,
    // Per-section breakdown the vendor reported (omitted when none).
    ...(sections.length ? { sections } : {}),
  };
}

/**
 * Deterministic, transparent proctoring risk score (0-100) derived from the
 * captured ProctorEvent timeline. NOT an LLM call and NOT a fabricated number:
 * it is a fixed-weight sum over real events, capped at 100, so the recruiter can
 * see exactly what drove it. High-signal events (paste of external content,
 * face/identity loss) weigh more than a single tab blur.
 */
const PROCTOR_WEIGHTS: Record<string, number> = {
  TAB_SWITCH: 8,
  TAB_BLUR: 5,
  WINDOW_BLUR: 5,
  COPY: 6,
  PASTE: 12,
  FACE_LOST: 20,
  MULTIPLE_FACES: 25,
  FULLSCREEN_EXIT: 8,
  DEVTOOLS_OPEN: 15,
  NETWORK_LOSS: 4,
};

function computeRiskScore(events: { type: string }[]): { riskScore: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  let raw = 0;
  for (const e of events) {
    const t = (e.type || "").toUpperCase();
    byType[t] = (byType[t] ?? 0) + 1;
    raw += PROCTOR_WEIGHTS[t] ?? 3; // unknown event types get a small default weight
  }
  return { riskScore: Math.min(100, Math.round(raw)), byType };
}

// ── Explainability record (EU AI Act / GDPR Art.15) ───────────────────────────
// Mirrors workers/grading.worker.ts buildExplainability so a HUMAN override on
// this route refreshes the same record shape (source:"human"). Built from the
// recomputed real grades; NEVER contains the answer key or hidden test cases.
const GRADING_METHOD: Record<string, string> = {
  MCQ_SINGLE: "deterministic_exact_match",
  MCQ_MULTI: "deterministic_exact_match",
  TRUE_FALSE: "deterministic_exact_match",
  CODING: "automated_code_execution",
  ESSAY: "ai_assisted_rubric",
  SHORT_ANSWER: "human_review",
};

interface ExplainabilityInput {
  perQuestion: AnyObj[];
  scorePercent: number | null;
  passingScore: number | null;
  passed: boolean | null;
  needsReview: boolean;
  marginal: boolean;
  source: "auto" | "human";
}

function buildExplainability(input: ExplainabilityInput): AnyObj {
  const questions = input.perQuestion.map((g) => {
    const type = String(g["type"] ?? "");
    const manuallyGraded = g["manuallyGraded"] === true;
    const pending = g["pendingGrade"] === true;
    const method = manuallyGraded
      ? "human_review"
      : pending
        ? "pending_human_review"
        : (GRADING_METHOD[type] ?? "human_review");
    const aiAssisted = !manuallyGraded && method === "ai_assisted_rubric";
    return {
      questionId: g["questionId"] ?? null,
      type: type || null,
      method,
      aiAssisted,
      pointsAwarded: typeof g["pointsAwarded"] === "number" ? g["pointsAwarded"] : null,
      pointsPossible: typeof g["pointsPossible"] === "number" ? g["pointsPossible"] : null,
      ...(typeof g["rationale"] === "string" ? { rationale: g["rationale"] } : {}),
      ...(typeof g["graderNote"] === "string" ? { note: g["graderNote"] } : {}),
      ...(typeof g["reviewerNote"] === "string" ? { reviewerNote: g["reviewerNote"] } : {}),
      ...(typeof g["confidence"] === "number" ? { confidence: g["confidence"] } : {}),
    };
  });

  const aiAssistedCount = questions.filter((q) => q.aiAssisted).length;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: input.source,
    aiAssisted: aiAssistedCount > 0,
    aiAssistedQuestionCount: aiAssistedCount,
    humanReviewRequired: input.needsReview,
    humanReviewReason: input.needsReview
      ? "One or more answers still need a human grader."
      : null,
    scorePercent: input.scorePercent,
    passingScore: input.passingScore,
    passed: input.needsReview ? null : input.passed,
    notice:
      "Your responses were scored with the help of automated tools (deterministic checks for multiple-choice, code execution for coding, and AI assistance for written answers). AI assists scoring only; a person always makes the final decision and you can request a human review.",
    methods: questions,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/:id/results
// List the graded results (+ their attempts) for one assessment. Honest empty
// list when nothing has been graded yet. RLS scopes to the request tenant; we
// also pass tenantId explicitly (defense in depth + works when RLS is inert).
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/results", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const assessmentId = req.params["id"] as string;

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, tenantId },
      select: { id: true, title: true, passingScore: true },
    });
    if (!assessment) throw Errors.notFound("Assessment");

    const results = await prisma.assessmentResult.findMany({
      where: { tenantId, assessmentId },
      orderBy: [{ pendingManualReview: "desc" }, { rawScore: "desc" }],
      // `attempt` is null for an EXTERNAL-vendor result (it has a synthetic
      // attemptId + no native Attempt row); `perQuestion` then carries the
      // vendor summary instead (see buildVendorSummary).
      select: {
        id: true,
        attemptId: true,
        candidateId: true,
        rawScore: true,
        maxScore: true,
        passed: true,
        pendingManualReview: true,
        gradedAt: true,
        perQuestion: true,
        attempt: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            submittedAt: true,
            durationSeconds: true,
            inviteId: true,
          },
        },
      },
      take: 500,
    });

    ok(res, {
      assessmentId: assessment.id,
      title: assessment.title,
      passingScore: assessment.passingScore,
      total: results.length,
      results: results.map((r) => {
        const pct = r.maxScore > 0 ? Math.round((r.rawScore / r.maxScore) * 100) : null;
        // EXTERNAL-vendor results (Codility/HackerEarth/iMocha/TestGorilla/
        // HackerRank, ingested in real time) have no native attempt; their vendor
        // summary lives on perQuestion. Surface it so the recruiter sees the
        // provider, report link, per-section breakdown + plagiarism flag. Native
        // results have no vendor summary → `vendor` is null (panel omitted).
        const vendor = buildVendorSummary(r.perQuestion);
        return {
          id: r.id,
          attemptId: r.attemptId,
          candidateId: r.candidateId,
          rawScore: r.rawScore,
          maxScore: r.maxScore,
          // Normalized 0-100 percentage; null only when the rubric has no points.
          scorePercent: pct,
          passed: r.passed,
          pendingManualReview: r.pendingManualReview,
          gradedAt: r.gradedAt,
          attempt: r.attempt,
          // Real-time external-OA-vendor result summary, or null for native.
          vendor,
        };
      }),
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/attempts/:attemptId
// Full attempt detail: per-question answers + grades, per-test-case code
// verdicts, per-criterion essay rationale, and the ProctorEvent timeline with a
// derived risk score. Hidden test-case I/O + the answer key are stripped.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/attempts/:attemptId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const attemptId = req.params["attemptId"] as string;

    // EXTERNAL-vendor results carry a SYNTHETIC attemptId ("provider:{inviteId}")
    // and have NO native Attempt row (see lib/ingest-vendor-result.ts). The native
    // attempt-detail join below would 404 for them, so resolve the vendor result
    // directly by its unique attemptId FIRST and return a vendor-shaped detail
    // bound to the persisted vendor summary (no native answers/proctoring to
    // fabricate). Native attempts fall through unchanged.
    if (attemptId.startsWith("provider:")) {
      const vendorResult = await prisma.assessmentResult.findFirst({
        where: { attemptId, tenantId },
        include: { assessment: { select: { id: true, title: true, passingScore: true } } },
      });
      if (!vendorResult) throw Errors.notFound("Attempt");
      const pct =
        vendorResult.maxScore > 0 ? Math.round((vendorResult.rawScore / vendorResult.maxScore) * 100) : null;
      ok(res, {
        attempt: {
          id: vendorResult.attemptId,
          assessmentId: vendorResult.assessmentId,
          candidateId: vendorResult.candidateId,
          // No native attempt timeline exists for a vendor result (honest null).
          inviteId: null,
          status: vendorResult.pendingManualReview ? "AWAITING_REVIEW" : "GRADED",
          startedAt: null,
          submittedAt: vendorResult.gradedAt,
          durationSeconds: null,
          // Marks this as the external-vendor path (no native take session).
          external: true,
        },
        assessment: vendorResult.assessment
          ? {
              id: vendorResult.assessment.id,
              title: vendorResult.assessment.title,
              passingScore: vendorResult.assessment.passingScore,
            }
          : null,
        invite: null,
        result: {
          id: vendorResult.id,
          rawScore: vendorResult.rawScore,
          maxScore: vendorResult.maxScore,
          scorePercent: pct,
          passed: vendorResult.passed,
          pendingManualReview: vendorResult.pendingManualReview,
          gradedAt: vendorResult.gradedAt,
          explainability: vendorResult.explainability ?? null,
        },
        // The vendor summary is the per-result breakdown for an external OA (in
        // place of native per-question grades): provider, report link, sections,
        // plagiarism flag. Read verbatim from perQuestion; null only if absent.
        vendor: buildVendorSummary(vendorResult.perQuestion),
        // No native per-question detail or proctoring for an external vendor.
        questions: [],
        proctoring: null,
      });
      return;
    }

    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptId, tenantId },
      include: {
        answers: {
          select: { questionId: true, value: true, timeSpentSeconds: true },
        },
        proctorEvents: {
          orderBy: { occurredAt: "asc" },
          select: { id: true, type: true, metadata: true, occurredAt: true },
        },
        result: true,
        assessment: { select: { id: true, title: true, passingScore: true, questions: true } },
        invite: { select: { id: true, email: true, status: true } },
      },
    });
    if (!attempt) throw Errors.notFound("Attempt");

    // Index answers + sanitized question metadata by questionId.
    const answerByQ = new Map<string, AnyObj>();
    for (const a of attempt.answers) answerByQ.set(a.questionId, a as unknown as AnyObj);

    const questionMetaByQ = new Map<string, AnyObj>();
    for (const q of asArray(attempt.assessment?.questions)) {
      const id = q["id"];
      if (typeof id === "string") questionMetaByQ.set(id, sanitizeQuestionMeta(q));
    }

    // The graded breakdown lives on the result's perQuestion JSON. When the
    // attempt is submitted but not yet graded there is no result yet — surface
    // the answers with null grades (honest empty), never a fabricated score.
    const grades = asArray(attempt.result?.perQuestion);
    const gradeByQ = new Map<string, AnyObj>();
    for (const g of grades) {
      const id = g["questionId"];
      if (typeof id === "string") gradeByQ.set(id, g);
    }

    // Union of question ids from the assessment definition + any answered ids,
    // preserving the assessment's question order where known.
    const orderedIds: string[] = [];
    const seen = new Set<string>();
    for (const q of asArray(attempt.assessment?.questions)) {
      const id = q["id"];
      if (typeof id === "string" && !seen.has(id)) {
        seen.add(id);
        orderedIds.push(id);
      }
    }
    for (const a of attempt.answers) {
      if (!seen.has(a.questionId)) {
        seen.add(a.questionId);
        orderedIds.push(a.questionId);
      }
    }

    const questions = orderedIds.map((id) =>
      buildQuestionDetail(gradeByQ.get(id) ?? { questionId: id }, answerByQ.get(id), questionMetaByQ.get(id)),
    );

    const { riskScore, byType } = computeRiskScore(attempt.proctorEvents);
    const pct =
      attempt.result && attempt.result.maxScore > 0
        ? Math.round((attempt.result.rawScore / attempt.result.maxScore) * 100)
        : null;

    ok(res, {
      attempt: {
        id: attempt.id,
        assessmentId: attempt.assessmentId,
        candidateId: attempt.candidateId,
        inviteId: attempt.inviteId,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        durationSeconds: attempt.durationSeconds,
      },
      assessment: attempt.assessment
        ? { id: attempt.assessment.id, title: attempt.assessment.title, passingScore: attempt.assessment.passingScore }
        : null,
      invite: attempt.invite,
      result: attempt.result
        ? {
            id: attempt.result.id,
            rawScore: attempt.result.rawScore,
            maxScore: attempt.result.maxScore,
            scorePercent: pct,
            passed: attempt.result.passed,
            pendingManualReview: attempt.result.pendingManualReview,
            gradedAt: attempt.result.gradedAt,
            // EU AI Act / GDPR Art.15 explainability record (how the score was
            // produced). Read verbatim; null until the first grade lands.
            explainability: attempt.result.explainability ?? null,
          }
        : null, // not graded yet — honest null, not a zero
      questions,
      proctoring: {
        riskScore, // deterministic, transparent (see computeRiskScore)
        byType,
        events: attempt.proctorEvents.map((e) => ({
          id: e.id,
          type: e.type,
          metadata: asObj(e.metadata),
          occurredAt: e.occurredAt,
        })),
      },
      // null for a native attempt (the grader writes per-question entries, not a
      // vendor summary). Kept here so the detail shape matches the external-vendor
      // branch above, so a frontend panel can always read `detail.vendor`.
      vendor: buildVendorSummary(attempt.result?.perQuestion),
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /internal/assessments/attempts/:attemptId/grade
// Human grade override (HITL review path). Accepts per-answer humanPoints, then
// recomputes the final result: human points take precedence over the auto score
// per question, the rest of the auto grade is preserved, passed is recomputed
// against the assessment passing score, and pendingManualReview is cleared.
//
// GDPR Art. 22 — this records a HUMAN decision; it does not auto-reject. Routing
// an adverse outcome stays in the existing HITL flow downstream.
// ─────────────────────────────────────────────────────────────────────────────
interface GradeOverrideBody {
  // Per-answer human point overrides for open-ended (or disputed) questions.
  grades?: Array<{
    questionId: string;
    humanPoints: number;
    // Optional reviewer note persisted alongside the per-question grade.
    note?: string;
  }>;
  // Optional explicit pass/fail override; when omitted, recomputed from score.
  passed?: boolean;
  // Whether to clear the pending-manual-review flag (default true on grade).
  clearNeedsReview?: boolean;
}

router.patch("/attempts/:attemptId/grade", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const reviewerId = getUserId(req);
    const attemptId = req.params["attemptId"] as string;
    const body = (req.body ?? {}) as GradeOverrideBody;

    // ── Validate the override payload (honest 400 on a bad shape) ──────────────
    const overrides = Array.isArray(body.grades) ? body.grades : [];
    for (const g of overrides) {
      if (!g || typeof g.questionId !== "string" || !g.questionId) {
        throw Errors.validation("Each grade override requires a questionId");
      }
      if (typeof g.humanPoints !== "number" || !Number.isFinite(g.humanPoints) || g.humanPoints < 0) {
        throw Errors.validation(`humanPoints for question ${g.questionId} must be a non-negative number`);
      }
    }
    if (body.passed !== undefined && typeof body.passed !== "boolean") {
      throw Errors.validation("passed must be a boolean when provided");
    }

    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptId, tenantId },
      include: {
        result: true,
        assessment: { select: { passingScore: true, questions: true } },
      },
    });
    if (!attempt) throw Errors.notFound("Attempt");
    if (!attempt.result) {
      // Cannot override a grade that does not exist yet — the auto grader must
      // run first. Honest 409 rather than fabricating a base result.
      throw Errors.conflict("Attempt has not been auto-graded yet; cannot apply a human override");
    }

    const overrideByQ = new Map<string, { humanPoints: number; note?: string }>();
    for (const g of overrides) overrideByQ.set(g.questionId, { humanPoints: g.humanPoints, ...(g.note ? { note: g.note } : {}) });

    // Per-question possible points fallback from the assessment definition.
    const pointsByQ = new Map<string, number>();
    for (const q of asArray(attempt.assessment?.questions)) {
      const id = q["id"];
      if (typeof id === "string" && typeof q["points"] === "number") pointsByQ.set(id, q["points"] as number);
    }

    // Recompute perQuestion: apply human points where given, keep auto otherwise.
    const now = new Date();
    const existing = asArray(attempt.result.perQuestion);
    let humanScore = 0;
    let maxScore = 0;

    const recomputed: AnyObj[] = existing.map((g): AnyObj => {
      const qId = typeof g["questionId"] === "string" ? (g["questionId"] as string) : "";
      const possible =
        typeof g["pointsPossible"] === "number"
          ? (g["pointsPossible"] as number)
          : (pointsByQ.get(qId) ?? 0);
      maxScore += possible;

      const ov = overrideByQ.get(qId);
      if (ov) {
        // Cap the human points at the question's possible points (no inflation
        // above the rubric maximum).
        const awarded = Math.min(ov.humanPoints, possible);
        humanScore += awarded;
        return {
          ...g,
          pointsAwarded: awarded,
          pointsPossible: possible,
          manuallyGraded: true,
          correct: possible > 0 ? awarded >= possible : (g["correct"] ?? null),
          ...(ov.note ? { reviewerNote: ov.note } : {}),
          gradedBy: reviewerId,
          gradedAt: now.toISOString(),
        };
      }
      // Untouched questions keep their real auto grade.
      const auto = typeof g["pointsAwarded"] === "number" ? (g["pointsAwarded"] as number) : 0;
      humanScore += auto;
      return { ...g, pointsPossible: possible };
    });

    // Any overridden question that did NOT already exist in perQuestion (e.g. an
    // ungraded essay) is appended so the human grade is captured.
    for (const [qId, ov] of overrideByQ) {
      if (recomputed.some((g) => g["questionId"] === qId)) continue;
      const possible = pointsByQ.get(qId) ?? 0;
      const awarded = Math.min(ov.humanPoints, possible);
      humanScore += awarded;
      maxScore += possible;
      recomputed.push({
        questionId: qId,
        pointsAwarded: awarded,
        pointsPossible: possible,
        manuallyGraded: true,
        correct: possible > 0 ? awarded >= possible : null,
        ...(ov.note ? { reviewerNote: ov.note } : {}),
        gradedBy: reviewerId,
        gradedAt: now.toISOString(),
      });
    }

    const finalMax = maxScore > 0 ? maxScore : attempt.result.maxScore;
    const scorePercent = finalMax > 0 ? Math.round((humanScore / finalMax) * 100) : null;
    const passingScore = attempt.assessment?.passingScore ?? null;
    // passed: explicit override wins; else recompute against the passing score
    // when one exists; else leave null (no bar configured — honest unknown).
    const passed =
      body.passed !== undefined
        ? body.passed
        : passingScore != null && scorePercent != null
          ? scorePercent >= passingScore
          : null;
    const clearNeedsReview = body.clearNeedsReview !== false;
    const humanReviewRequired = clearNeedsReview ? false : attempt.result.pendingManualReview;

    // Refresh the EU AI Act / GDPR Art.15 explainability record so it reflects
    // the HUMAN decision (source:"human"). Derived from the recomputed real
    // grades; never fabricated. Holds verdict (passed=null) only if review stands.
    const explainability = buildExplainability({
      perQuestion: recomputed,
      scorePercent,
      passingScore,
      passed,
      needsReview: humanReviewRequired,
      // A human override is the review; it is not a marginal-band auto-flag.
      marginal: false,
      source: "human",
    });

    const updated = await prisma.assessmentResult.update({
      where: { id: attempt.result.id },
      data: {
        rawScore: humanScore, // finalScore = humanScore over autoScore
        maxScore: finalMax,
        passed,
        pendingManualReview: humanReviewRequired,
        perQuestion: recomputed as never,
        explainability: explainability as never,
        gradedAt: now,
      },
    });

    // Mark the attempt itself GRADED once a human has signed off.
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: "GRADED" },
    }).catch(() => {});

    ok(res, {
      id: updated.id,
      attemptId: updated.attemptId,
      candidateId: updated.candidateId,
      rawScore: updated.rawScore,
      maxScore: updated.maxScore,
      scorePercent,
      passed: updated.passed,
      pendingManualReview: updated.pendingManualReview,
      gradedAt: updated.gradedAt,
      gradedBy: reviewerId,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
