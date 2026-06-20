/**
 * Grading worker (assessment-service) — SLICE G6.
 *
 * Consumes the `assessment-grading` BullMQ queue (enqueued by the public submit
 * route when an attempt has worker-graded items). Clones the screening-service
 * worker idiom: createWorker + a persistRun hook for AgentRun + a NATS completion
 * publish. It grades the two open-ended item families that the inline submit
 * grader deferred:
 *
 *   CODING       → the Judge0 client (real per-test-case verdicts, async). We
 *                  kick off one Judge0 batch per coding question, persist the
 *                  per-case placeholders (each carrying its Judge0 token), and let
 *                  the gateway-fronted callback fan the verdicts back in. A
 *                  timeout reaper is scheduled so an attempt never hangs if a
 *                  callback is lost.
 *   ESSAY        → the ai-engine `oa-grader` rubric agent via runAgent (gated
 *                  through the agent-plan path). The LLM produces per-criterion
 *                  scores + rationale; points are derived from the real rubric
 *                  total, never fabricated.
 *   SHORT_ANSWER → routed to manual review (HITL). We do NOT guess a short-answer
 *                  grade with an LLM here; a human grades it via the results
 *                  PATCH override (GDPR Art. 22 — no auto-decision).
 *
 * needsReview is set when a grade is low-confidence OR within ~5 points of the
 * pass bar, so a marginal candidate always gets a human look. Nothing is ever
 * auto-rejected: assessment.completed advances the candidate to ApplicationStage
 * ASSESSMENT + routes to the existing HITL review queue (notification +
 * candidate-service consume the event); the worker itself takes no adverse action.
 *
 * Module gate: if oa-assessments is OFF for the tenant we short-circuit (skip +
 * ack the job) via @cdc-ats/common isModuleEnabled — the same answer the gateway
 * requireModule middleware would give, so a disabled module does no work.
 */
import { createWorker, publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject } from "@cdc-ats/contracts";
import { isModuleEnabled } from "@cdc-ats/common";
import { runAgent, type AgentRunSnapshot, type AgentType } from "@cdc-ats/ai-engine";
// Background worker (no HTTP request) — scopes by the job's tenantId explicitly,
// so it uses the admin (non-RLS) client, like screening.worker.
import { prismaAdmin as prisma } from "../lib/prisma.js";
import {
  ASSESSMENT_GRADING_QUEUE,
  enqueueGrading,
  getGradingQueue,
  type GradingJob,
} from "../lib/queue.js";
import {
  runCodingSubmission,
  reapStaleCodingGrades,
  codingFullyResolved,
  type TestCase,
} from "../lib/judge0.js";
import { isEssayGraderAllowed, fetchApplicationForCandidate } from "../lib/service-client.js";
import type { Logger } from "pino";

const OA_MODULE_KEY = "oa-assessments";
// Registry literal for the essay/long-form rubric grader (see MODULE_REGISTRY
// oa-assessments agentTypes). Not yet in the ai-engine AgentType union (G8 adds
// the registration); typed via a cast so this slice compiles ahead of G8.
const ESSAY_AGENT: AgentType = "oa-grader" as AgentType;

// Coding callbacks are async; give Judge0 this long to deliver every verdict
// before the reaper closes the attempt out (marking unresolved cases failed).
const CODING_REAP_DELAY_MS = Number(process.env["JUDGE0_REAP_DELAY_MS"] ?? 90_000);
// Marginal band around the pass bar that forces a human review.
const REVIEW_MARGIN = Number(process.env["ASSESSMENT_REVIEW_MARGIN"] ?? 5);
const ESSAY_CONFIDENCE_FLOOR = Number(process.env["ASSESSMENT_ESSAY_CONFIDENCE_FLOOR"] ?? 0.6);

type AnyObj = Record<string, unknown>;
const asArray = (v: unknown): AnyObj[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as AnyObj[]) : [];

// The essay grader's expected output shape (the G8 agent will conform to this).
interface EssayGradeOutput {
  criteria: Array<{ name: string; score: number; maxScore: number; rationale: string }>;
  overallRationale?: string;
  // 0-1 grader self-confidence; drives needsReview when low.
  confidence?: number;
}
interface EssayGradeInput {
  prompt: string;
  answer: string;
  maxPoints: number;
  rubric?: Array<{ criterion: string; weight: number; description?: string }>;
}

// ── Explainability record (EU AI Act / GDPR Art.15) ───────────────────────────
// Builds a structured, candidate-safe explanation of HOW a score was produced
// from the REAL per-question grades. It records, per question, the grading method
// (deterministic exact-match, code execution, AI-assisted rubric, or human
// review), whether AI assisted, and the rationale/confidence read verbatim from
// the grade. It NEVER contains the answer key or hidden test cases. It also
// captures the standing human-review status so the honest message ("AI assists
// scoring, a person always makes the final decision") is data-backed.

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
      // Rationale / confidence are read verbatim from the real grade (LLM rubric
      // summary for essays, grader note otherwise). Omitted when absent.
      ...(typeof g["rationale"] === "string" ? { rationale: g["rationale"] } : {}),
      ...(typeof g["graderNote"] === "string" ? { note: g["graderNote"] } : {}),
      ...(typeof g["confidence"] === "number" ? { confidence: g["confidence"] } : {}),
    };
  });

  const aiAssistedCount = questions.filter((q) => q.aiAssisted).length;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: input.source, // "auto" grader or a "human" override
    // The standing decision posture. NEVER an auto-reject: a flagged result holds
    // its verdict (passed=null) for a human; adverse routing is the HITL queue.
    aiAssisted: aiAssistedCount > 0,
    aiAssistedQuestionCount: aiAssistedCount,
    humanReviewRequired: input.needsReview,
    humanReviewReason: input.needsReview
      ? input.marginal
        ? "Score is within the marginal band of the pass mark; a human reviewer confirms the outcome."
        : "One or more answers need a human grader, or an automated grade was low-confidence."
      : null,
    scorePercent: input.scorePercent,
    passingScore: input.passingScore,
    // passed reflects the auto/human verdict; null while a human review is pending.
    passed: input.needsReview ? null : input.passed,
    // A short, honest, candidate-facing disclosure. EU AI Act Art.13 / GDPR Art.22.
    notice:
      "Your responses were scored with the help of automated tools (deterministic checks for multiple-choice, code execution for coding, and AI assistance for written answers). AI assists scoring only; a person always makes the final decision and you can request a human review.",
    methods: questions,
  };
}

export function startGradingWorker(logger: Logger) {
  const worker = createWorker<GradingJob>(
    ASSESSMENT_GRADING_QUEUE,
    async (job) => {
      const { tenantId, assessmentId, attemptId, candidateId, userId } = job.data;
      const isReap = (job.name as string) === "reap";
      logger.info({ jobId: job.id, attemptId, isReap }, "grading job starting");

      // Module gate: oa-assessments off for this tenant -> skip + ack (no work).
      if (!(await isModuleEnabled(tenantId, OA_MODULE_KEY))) {
        logger.info({ jobId: job.id, tenantId, attemptId }, "grading skipped — oa-assessments disabled for tenant");
        return { skipped: true };
      }

      // ── Reaper pass: close out stale Judge0 callbacks, then finalize. ─────────
      if (isReap) {
        const resolved = await reapStaleCodingGrades(attemptId);
        if (resolved) await finalizeAttempt({ tenantId, assessmentId, attemptId, candidateId }, logger);
        return { reaped: true, resolved };
      }

      // Load the attempt + its (partial) result + the assessment definition.
      const attempt = await prisma.attempt.findFirst({
        where: { id: attemptId, tenantId },
        include: {
          result: true,
          answers: { select: { questionId: true, value: true } },
          assessment: { select: { id: true, questions: true, schemaJson: true, passingScore: true } },
        },
      });
      if (!attempt) {
        logger.warn({ attemptId }, "grading: attempt not found");
        return { error: "attempt not found" };
      }
      if (!attempt.result) {
        logger.warn({ attemptId }, "grading: no result row (submit must run first)");
        return { error: "no result" };
      }

      const definition = asArray(attempt.assessment?.questions);
      const defById = new Map<string, AnyObj>();
      for (const q of definition) defById.set(String(q["id"]), q);
      const answerByQ = new Map<string, unknown>();
      for (const a of attempt.answers) answerByQ.set(a.questionId, a.value);

      // Work on a mutable copy of perQuestion (the canonical grade store).
      const perQuestion = asArray(attempt.result.perQuestion);
      let anyCodingPending = false;

      for (const grade of perQuestion) {
        const qId = String(grade["questionId"] ?? "");
        const def = defById.get(qId);
        const type = String(def?.["type"] ?? grade["type"] ?? "");

        if (type === "CODING") {
          const source = readSubmittedCode(answerByQ.get(qId));
          const testCases = readTestCases(def);
          const sub = await runCodingSubmission({
            source,
            language: def?.["language"],
            languageId: def?.["languageId"],
            testCases,
          });
          // Persist the per-case placeholders (tokens inside) so the async
          // callback + reaper can correlate. Hidden-case I/O is never stored.
          grade["testCases"] = sub.testCases;
          grade["totalCount"] = sub.totalWeight;
          if (sub.submitted) {
            // Verdicts arrive async — keep pendingGrade until the callback/reaper
            // resolves the question; mark the attempt as still-pending coding.
            const stillPending = sub.testCases.some((t) => t.judge0Token && t.statusId == null);
            if (stillPending) {
              grade["pendingGrade"] = true;
              anyCodingPending = true;
            } else {
              // Empty submission scored inline (all real fails) — resolve now.
              resolveCodingGradeInline(grade);
            }
          } else {
            // No test cases / Judge0 unreachable -> route to manual review, never
            // a fabricated score. correct stays null; a human grades via override.
            grade["correct"] = null;
            grade["pointsAwarded"] = 0;
            grade["pendingGrade"] = true;
            grade["graderNote"] = `Auto-grade unavailable: ${sub.reason ?? "Judge0 not reachable"} — routed to manual review`;
          }
          continue;
        }

        if (type === "ESSAY") {
          await gradeEssay({ tenantId, userId, grade, def, answer: answerByQ.get(qId) }, logger);
          continue;
        }

        if (type === "SHORT_ANSWER") {
          // No auto-decision for free-text short answers — route to HITL. Keep the
          // honest placeholder; a human grades it via the results PATCH override.
          grade["correct"] = null;
          grade["pendingGrade"] = true;
          grade["graderNote"] = "Short-answer responses are reviewed by a human grader";
          continue;
        }
        // Deterministic items were already scored inline at submit — leave as-is.
      }

      // Persist the worker's grades.
      await prisma.assessmentResult.update({
        where: { id: attempt.result.id },
        data: { perQuestion: perQuestion as object },
      });

      if (anyCodingPending) {
        // Coding verdicts are still in flight (Judge0 callbacks). Schedule the
        // reaper to finalize even if a callback is lost; the callback path
        // finalizes earlier when every verdict lands.
        await scheduleReaper(job.data);
        logger.info({ attemptId, reapInMs: CODING_REAP_DELAY_MS }, "coding verdicts pending — reaper scheduled");
        return { attemptId, pendingCoding: true };
      }

      // No coding still pending — finalize now (essay + short-answer + inline are
      // all resolved or routed to HITL).
      await finalizeAttempt({ tenantId, assessmentId, attemptId, candidateId }, logger);
      return { attemptId, finalized: true };
    },
    {
      concurrency: Number(process.env["GRADING_CONCURRENCY"] || 4),
      limiter: { max: Number(process.env["GRADING_RATE_MAX"] || 30), duration: 60_000 },
    },
  );

  worker.on("completed", (job, ret) => logger.info({ jobId: job.id, ret }, "grading done"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "grading failed"));
  logger.info("assessment-grading worker started");
  return worker;
}

// ── Essay grading via the oa-grader rubric agent ──────────────────────────────

async function gradeEssay(
  ctx: { tenantId: string; userId: string; grade: AnyObj; def: AnyObj | undefined; answer: unknown },
  logger: Logger,
): Promise<void> {
  const { tenantId, userId, grade, def } = ctx;
  const qId = String(grade["questionId"] ?? "");
  const maxPoints = typeof grade["pointsPossible"] === "number" ? (grade["pointsPossible"] as number) : 1;
  const answerText = typeof ctx.answer === "string" ? ctx.answer : "";

  // Plan-gate the LLM essay autoscore through the agent-plan path. If the agent
  // is not in the tenant's plan (or the module is off), route to manual review
  // rather than calling the LLM — and never fabricate a score.
  if (!(await isEssayGraderAllowed(tenantId, "oa-grader"))) {
    grade["correct"] = null;
    grade["pendingGrade"] = true;
    grade["graderNote"] = "Essay auto-grading not in plan — routed to manual review";
    return;
  }
  if (!answerText.trim()) {
    // Unanswered essay is a real zero, not a route-to-review.
    grade["pointsAwarded"] = 0;
    grade["correct"] = false;
    grade["criteria"] = [];
    grade["rationale"] = "No response submitted.";
    delete grade["pendingGrade"];
    return;
  }

  const persistRun = async (run: AgentRunSnapshot) => {
    // assessment-service has no AgentRun table; AgentRun accounting lives in the
    // billing rollup via the agent.completed event the runtime/persist layer
    // emits elsewhere. We log the run for traceability without a local write.
    logger.info(
      { agentRunId: run.agentRunId, agentType: run.agentType, status: run.status, costUsd: run.costUsd, attemptQ: qId },
      "oa-grader run",
    );
  };

  try {
    const rubric = readRubric(def);
    const { output } = await runAgent<EssayGradeInput, EssayGradeOutput>({
      agentType: ESSAY_AGENT,
      input: {
        prompt: String(def?.["prompt"] ?? ""),
        answer: answerText,
        maxPoints,
        ...(rubric ? { rubric } : {}),
      },
      context: { tenantId, userId: userId || "system", persistRun },
    });

    const criteria = Array.isArray(output?.criteria) ? output.criteria : [];
    let rubricScore = 0;
    let rubricMax = 0;
    for (const c of criteria) {
      rubricScore += Number(c?.score ?? 0);
      rubricMax += Number(c?.maxScore ?? 0);
    }
    // Scale the rubric total onto the question's point value (the real grade).
    const awarded = rubricMax > 0 ? Math.round((rubricScore / rubricMax) * maxPoints) : 0;
    const confidence = typeof output?.confidence === "number" ? output.confidence : null;

    grade["criteria"] = criteria.map((c) => ({
      name: c?.name ?? null,
      score: Number(c?.score ?? 0),
      maxScore: Number(c?.maxScore ?? 0),
      rationale: typeof c?.rationale === "string" ? c.rationale : null,
    }));
    if (output?.overallRationale) grade["rationale"] = output.overallRationale;
    grade["pointsAwarded"] = awarded;
    grade["correct"] = maxPoints > 0 ? awarded >= maxPoints : null;
    grade["autoGraded"] = true;
    if (confidence != null) grade["confidence"] = confidence;
    // Low-confidence essay grades always go to a human (needsReview).
    grade["needsReview"] = confidence != null && confidence < ESSAY_CONFIDENCE_FLOOR;
    delete grade["pendingGrade"];
  } catch (err) {
    // LLM failure -> route to manual review (never a fabricated score).
    grade["correct"] = null;
    grade["pendingGrade"] = true;
    grade["graderNote"] = `Essay auto-grade failed (${err instanceof Error ? err.message : "error"}) — routed to manual review`;
    logger.warn({ err, attemptQ: qId }, "essay auto-grade failed; routed to manual review");
  }
}

// ── Finalize: compute the score, set needsReview, publish assessment.completed ─

async function finalizeAttempt(
  ctx: { tenantId: string; assessmentId: string; attemptId: string; candidateId: string },
  logger: Logger,
): Promise<void> {
  const { tenantId, assessmentId, attemptId, candidateId } = ctx;
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, tenantId },
    include: { result: true, assessment: { select: { passingScore: true, requisitionId: true } } },
  });
  if (!attempt?.result) return;

  const perQuestion = asArray(attempt.result.perQuestion);
  // Are any items still awaiting a human (or a still-pending coding verdict)?
  const stillPending = perQuestion.some((q) => q["pendingGrade"] === true) || !codingFullyResolved(perQuestion);
  const needsReview =
    stillPending || perQuestion.some((q) => q["needsReview"] === true);

  // autoScore/finalScore from the REAL per-question points (never fabricated).
  let rawScore = 0;
  let maxScore = 0;
  for (const q of perQuestion) {
    rawScore += typeof q["pointsAwarded"] === "number" ? (q["pointsAwarded"] as number) : 0;
    maxScore += typeof q["pointsPossible"] === "number" ? (q["pointsPossible"] as number) : 0;
  }
  const scorePercent = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : null;
  const passingScore = attempt.assessment?.passingScore ?? null;

  // Marginal band: even a numeric pass within REVIEW_MARGIN of the bar gets a
  // human look. We do NOT auto-reject — passed is computed only for surfacing;
  // adverse routing is the HITL queue's job (GDPR Art. 22).
  let passed: boolean | null = null;
  let marginal = false;
  if (passingScore != null && scorePercent != null) {
    passed = scorePercent >= passingScore;
    marginal = Math.abs(scorePercent - passingScore) <= REVIEW_MARGIN;
  }
  const finalNeedsReview = needsReview || marginal;

  // EU AI Act / GDPR Art.15 - persist an explainability record alongside the
  // score. It is derived from the REAL per-question grades (never fabricated) and
  // is the basis for both the candidate-facing explanation and a DSR export.
  const explainability = buildExplainability({
    perQuestion,
    scorePercent,
    passingScore,
    passed,
    needsReview: finalNeedsReview,
    marginal,
    source: "auto",
  });

  await prisma.assessmentResult.update({
    where: { id: attempt.result.id },
    data: {
      rawScore,
      maxScore,
      passed: finalNeedsReview ? null : passed, // hold the verdict for a human when flagged
      pendingManualReview: finalNeedsReview,
      gradedAt: finalNeedsReview ? null : new Date(),
      perQuestion: perQuestion as object,
      explainability: explainability as object,
    },
  });

  // The attempt is GRADED once auto-grading has run (a human override can still
  // refine it via the results PATCH). We do not flip the candidate to rejected.
  await prisma.attempt
    .update({ where: { id: attempt.id }, data: { status: "GRADED" } })
    .catch(() => {});

  // Resolve the applicationId so candidate-service can advance the right
  // application's stage to ASSESSMENT (best-effort; null is acceptable).
  let applicationId: string | null = null;
  try {
    applicationId = await fetchApplicationForCandidate(candidateId, tenantId, attempt.assessment?.requisitionId ?? null);
  } catch {
    applicationId = null;
  }

  // Publish assessment.completed — notification + candidate-service consume it to
  // advance ApplicationStage.ASSESSMENT + route to the existing HITL review queue.
  // NEVER carries an auto-reject; `passed` is null while a human review is pending.
  await publishEvent({
    subject: tenantSubject(tenantId, "assessment", "completed"),
    type: "assessment.completed",
    tenantId,
    payload: {
      tenantId,
      assessmentId,
      attemptId,
      candidateId,
      applicationId,
      passed: finalNeedsReview ? null : passed,
      score: scorePercent,
      needsReview: finalNeedsReview,
    },
  }).catch((err) => logger.warn({ err, attemptId }, "failed to publish assessment.completed"));

  logger.info(
    { attemptId, rawScore, maxScore, scorePercent, passed, needsReview: finalNeedsReview },
    "assessment attempt finalized",
  );
}

/**
 * Finalize hook the Judge0 callback path calls when every verdict for an attempt
 * has landed. Exported so the inbound callback route (G7 wiring) can drive it.
 */
export async function finalizeIfCodingResolved(
  ctx: { tenantId: string; assessmentId: string; attemptId: string; candidateId: string },
  logger: Logger,
): Promise<void> {
  const result = await prisma.assessmentResult.findUnique({
    where: { attemptId: ctx.attemptId },
    select: { perQuestion: true },
  });
  if (!result) return;
  const perQuestion = asArray(result.perQuestion);
  // Only finalize once coding is fully resolved AND no essay/short-answer is still
  // pending a worker grade (those resolve in the main pass before the reaper).
  if (!codingFullyResolved(perQuestion)) return;
  await finalizeAttempt(ctx, logger);
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Schedule the timeout reaper for an attempt with pending Judge0 callbacks. */
async function scheduleReaper(data: GradingJob): Promise<void> {
  const q = getGradingQueue();
  await q
    .add("reap", data, {
      delay: CODING_REAP_DELAY_MS,
      attempts: 2,
      backoff: { type: "exponential", delay: 10_000 },
      removeOnComplete: 100,
      removeOnFail: 200,
      jobId: `reap-${data.attemptId}`,
    })
    .catch(() => {
      // Redis hiccup — fall back to the standard enqueue helper (no delay) so the
      // attempt is still reaped on the next pass rather than hanging forever.
      return enqueueGrading({ ...data });
    });
}

/** The candidate's submitted code for a CODING question (Answer.value is a
 *  string for coding items). */
function readSubmittedCode(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join("\n");
  return "";
}

/** Read a CODING question's test cases from its published definition. Supports
 *  both `testCases` and a legacy `hiddenTestCases` array (merged). Returns [] when
 *  none are configured (the worker then routes the item to manual review). */
function readTestCases(def: AnyObj | undefined): TestCase[] {
  if (!def) return [];
  const visible = Array.isArray(def["testCases"]) ? (def["testCases"] as AnyObj[]) : [];
  const hidden = Array.isArray(def["hiddenTestCases"]) ? (def["hiddenTestCases"] as AnyObj[]) : [];
  const map = (arr: AnyObj[], forceHidden: boolean): TestCase[] =>
    arr.map((t) => ({
      name: typeof t["name"] === "string" ? t["name"] : undefined,
      stdin: typeof t["stdin"] === "string" ? t["stdin"] : typeof t["input"] === "string" ? (t["input"] as string) : undefined,
      expectedOutput:
        typeof t["expectedOutput"] === "string"
          ? t["expectedOutput"]
          : typeof t["expected"] === "string"
            ? (t["expected"] as string)
            : undefined,
      hidden: forceHidden || t["hidden"] === true,
      weight: typeof t["weight"] === "number" && (t["weight"] as number) > 0 ? (t["weight"] as number) : 1,
    }));
  return [...map(visible, false), ...map(hidden, true)];
}

/** Optional grading rubric attached to an ESSAY question definition. */
function readRubric(
  def: AnyObj | undefined,
): Array<{ criterion: string; weight: number; description?: string }> | null {
  if (!def || !Array.isArray(def["rubric"])) return null;
  const rubric = (def["rubric"] as AnyObj[])
    .map((r) => ({
      criterion: String(r["criterion"] ?? r["name"] ?? ""),
      weight: typeof r["weight"] === "number" ? (r["weight"] as number) : 0,
      ...(typeof r["description"] === "string" ? { description: r["description"] as string } : {}),
    }))
    .filter((r) => r.criterion.length > 0);
  return rubric.length > 0 ? rubric : null;
}

/** Resolve an already-returned coding submission (e.g. empty submission scored
 *  inline) into final points without waiting for a callback. */
function resolveCodingGradeInline(grade: AnyObj): void {
  const tcs = Array.isArray(grade["testCases"]) ? (grade["testCases"] as AnyObj[]) : [];
  let totalWeight = 0;
  let passedWeight = 0;
  for (const tc of tcs) {
    const weight = typeof tc["weight"] === "number" && (tc["weight"] as number) > 0 ? (tc["weight"] as number) : 1;
    totalWeight += weight;
    if (tc["passed"] === true) passedWeight += weight;
  }
  const possible = typeof grade["pointsPossible"] === "number" ? (grade["pointsPossible"] as number) : 1;
  grade["passedCount"] = passedWeight;
  grade["totalCount"] = totalWeight;
  grade["pointsAwarded"] = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * possible) : 0;
  grade["correct"] = totalWeight > 0 ? passedWeight === totalWeight : null;
  delete grade["pendingGrade"];
}
