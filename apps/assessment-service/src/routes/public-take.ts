/**
 * Public candidate take router (assessment-service) — SLICE G4.
 *
 * Mounted at /internal/public/assessment with NO auth — the gateway forwards
 * /api/public/* unauthenticated (job-service public-by-slug idiom). There is NO
 * X-Tenant-Id header on these requests, so every handler MUST use `prismaAdmin`
 * and resolve the tenant FROM the invite/session token (a SHA-256 hash lookup),
 * never from request context. (If a multipart upload were ever added here it
 * would need tenantContext re-applied AFTER multer; nothing here uploads, so the
 * admin client carries the tenant explicitly on every write.)
 *
 * ── The take SESSION + the frozen SNAPSHOT (the heart of this slice) ──────────
 * On start we realize the per-attempt randomization ONCE and FREEZE it onto the
 * Attempt so reload + autosave + submit + grading all agree:
 *   - Attempt.questionOrder  the realized question id order (after any shuffle).
 *   - Attempt.answerKey      the per-question GRADE material (type, points,
 *                            required, and the deterministic correctAnswer). This
 *                            is server-side truth used at submit; it is NEVER part
 *                            of any payload returned to the candidate.
 * The attempt also owns the session credential + the clock:
 *   - Attempt.sessionTokenHash  SHA-256 of a short-lived per-attempt session
 *                               token. The raw token is returned ONCE on start
 *                               and presented (Authorization-style) on every
 *                               subsequent take call; we only store the hash.
 *   - Attempt.remainingSeconds  SERVER-AUTHORITATIVE time left, persisted on each
 *                               heartbeat. The server, not the browser, is the
 *                               clock: every call recomputes remaining from
 *                               startedAt + durationSeconds and auto-expires.
 *
 * HARD RULES honored here:
 *  - prismaAdmin only; tenant resolved from the token row (no header ctx).
 *  - Hidden test cases / the answer key are NEVER returned to the candidate — the
 *    take payload is sanitized to prompt + options + non-sensitive meta only.
 *  - No fabricated scores. Submit scores ONLY the deterministic items
 *    (MCQ/true-false) inline by exact-match against the frozen snapshot key, the
 *    same weighted met/total shape the screening worker uses; CODING + ESSAY are
 *    enqueued for the real grading worker (Judge0 / LLM rubric). Nothing is
 *    auto-rejected (adverse outcomes route to the existing HITL flow, GDPR Art.22).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { ok, created, Errors } from "@cdc-ats/common";
import { prismaAdmin } from "../lib/prisma.js";
import { enqueueGrading } from "../lib/queue.js";
import { publishEvent, assessmentSubject } from "../lib/nats.js";

const router = Router();

// Session tokens are short-lived (the take window). We cap a session at the
// assessment duration + a small grace; untimed assessments get a hard ceiling so
// a session credential never lives forever.
const SESSION_GRACE_MS = 5 * 60 * 1000; // 5 min grace past the timed window
const UNTIMED_SESSION_MS = 6 * 60 * 60 * 1000; // 6 h ceiling for untimed take

/** SHA-256 hex of a raw token — the only form we persist / look up by. */
function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Mint an opaque token + its hash (32 random bytes, hex). */
function mintToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Frozen-snapshot types. `answerKey` carries grade material and NEVER leaves the
// server; `questionOrder` is the realized id order. The candidate-facing question
// shape is a strict subset (no correctAnswer, no hidden material).
// ─────────────────────────────────────────────────────────────────────────────
type AnyObj = Record<string, unknown>;

interface KeyEntry {
  questionId: string;
  type: string;
  points: number;
  required: boolean;
  // Present ONLY for deterministic items (MCQ_SINGLE/MCQ_MULTI/TRUE_FALSE);
  // omitted for CODING/ESSAY (graded by the worker, not inline).
  correctAnswer?: string | string[];
}

const asArray = (v: unknown): AnyObj[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object") as AnyObj[]) : [];

const DETERMINISTIC_TYPES = new Set(["MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE"]);
const INLINE_GRADED = DETERMINISTIC_TYPES; // graded at submit
const WORKER_GRADED = new Set(["CODING", "ESSAY", "SHORT_ANSWER"]); // enqueued

/**
 * Strip everything that could leak the answer key / hidden test cases from a
 * question before it is sent to the candidate. The take payload is prompt +
 * options + non-sensitive meta ONLY.
 */
function toCandidateQuestion(q: AnyObj): AnyObj {
  const type = String(q["type"] ?? "");
  const base: AnyObj = {
    id: q["id"],
    type,
    prompt: q["prompt"],
    order: q["order"],
    required: q["required"] !== false,
    points: typeof q["points"] === "number" ? q["points"] : 1,
    ...(q["timeLimit"] != null ? { timeLimit: q["timeLimit"] } : {}),
  };
  // MCQ choices: labels only (option ids are the candidate's selection values,
  // which are non-sensitive — the correctAnswer key referencing them is NOT
  // included). TRUE_FALSE carries its two options the same way.
  if (Array.isArray(q["options"])) {
    base["options"] = (q["options"] as AnyObj[]).map((o) => ({ id: o["id"], label: o["label"] }));
  }
  // CODING: starter code + language are candidate-facing; the solution / hidden
  // test cases are never embedded in the inline question array (the grading
  // worker holds them), so there is nothing further to strip here.
  if (q["language"] !== undefined) base["language"] = q["language"];
  if (q["starterCode"] !== undefined) base["starterCode"] = q["starterCode"];
  return base;
}

/**
 * Build the server-only grade key for a question. correctAnswer is captured ONLY
 * for deterministic items; CODING/ESSAY/SHORT_ANSWER are graded by the worker.
 */
function toKeyEntry(q: AnyObj): KeyEntry {
  const type = String(q["type"] ?? "");
  const entry: KeyEntry = {
    questionId: String(q["id"]),
    type,
    points: typeof q["points"] === "number" ? (q["points"] as number) : 1,
    required: q["required"] !== false,
  };
  if (DETERMINISTIC_TYPES.has(type) && q["correctAnswer"] !== undefined) {
    entry.correctAnswer = q["correctAnswer"] as string | string[];
  }
  return entry;
}

/**
 * Fisher-Yates shuffle of question ids (used only when the assessment opts in to
 * shuffleQuestions). Realized ONCE at start and frozen onto the attempt.
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Server-authoritative clock. Given the frozen attempt, compute how many seconds
 * remain from startedAt + durationSeconds. Returns null for an untimed attempt.
 * The browser-reported time is never trusted; this is the single source.
 */
function computeRemaining(attempt: { startedAt: Date | null; durationSeconds: number | null }): number | null {
  if (attempt.durationSeconds == null || attempt.startedAt == null) return null;
  const elapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
  return Math.max(0, attempt.durationSeconds - elapsed);
}

/**
 * Resolve + validate the take session from the presented raw session token.
 * Reads the Attempt by sessionTokenHash via the admin client (tenant comes off
 * the row). Enforces IN_PROGRESS + the server clock; auto-expires when the
 * window has elapsed. Throws on a missing/invalid/expired session.
 *
 * Token is read from the `x-session-token` header (or `sessionToken` in the body
 * as a fallback for clients that cannot set the header).
 */
async function resolveSession(req: Request): Promise<{
  attempt: any;
  remaining: number | null;
}> {
  const headerTok = req.headers["x-session-token"];
  const bodyTok = (req.body as AnyObj | undefined)?.["sessionToken"];
  const raw = (typeof headerTok === "string" && headerTok) || (typeof bodyTok === "string" && bodyTok) || "";
  if (!raw) throw Errors.unauthorized("Missing session token");

  const attempt = await prismaAdmin.attempt.findUnique({
    where: { sessionTokenHash: hashToken(raw) },
  });
  if (!attempt) throw Errors.unauthorized("Invalid session token");

  // Cross-check the attempt id in the path matches the session (defense in depth).
  const pathAttemptId = req.params["attemptId"];
  if (pathAttemptId && pathAttemptId !== attempt.id) {
    throw Errors.forbidden("Session does not match this attempt");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw Errors.conflict(`Attempt is ${attempt.status} and can no longer be modified`);
  }

  const remaining = computeRemaining(attempt);
  if (remaining !== null && remaining <= 0) {
    // Server clock says time is up — flip to EXPIRED and reject the write.
    await prismaAdmin.attempt
      .update({ where: { id: attempt.id }, data: { status: "EXPIRED", remainingSeconds: 0 } })
      .catch(() => {});
    throw Errors.conflict("Time is up — this attempt has expired");
  }
  return { attempt, remaining };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /internal/public/assessment/start  { token }
// Open an attempt from a single-use invite token. Idempotent-ish: if the invite
// already started an attempt that is still IN_PROGRESS we resume it (a reload
// during the take must not 409). On a fresh start we realize randomization, FREEZE
// the snapshot, flip the invite STARTED + consumedAt, mint the session token, and
// publish attempt.started.
// ─────────────────────────────────────────────────────────────────────────────
const StartSchema = z.object({ token: z.string().min(1) });

router.post("/start", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = StartSchema.parse(req.body);
    const inviteTokenHash = hashToken(token);

    // Resolve the invite by hash (admin client; tenant comes off the row). We do
    // NOT match on status here so we can return a precise reason (expired vs
    // revoked vs already-consumed) instead of a blanket 404.
    const invite = await prismaAdmin.assessmentInvite.findUnique({
      where: { tokenHash: inviteTokenHash },
      include: { attempt: true },
    });
    if (!invite) throw Errors.notFound("Invite");

    if (invite.status === "REVOKED") throw Errors.forbidden("This invitation has been revoked");
    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      if (invite.status !== "EXPIRED") {
        await prismaAdmin.assessmentInvite
          .update({ where: { id: invite.id }, data: { status: "EXPIRED" } })
          .catch(() => {});
      }
      throw Errors.conflict("This invitation has expired");
    }

    const tenantId = invite.tenantId;

    // Load the PUBLISHED assessment definition (the frozen `questions` array).
    const assessment = await prismaAdmin.assessment.findFirst({
      where: { id: invite.assessmentId, tenantId },
      select: {
        id: true, title: true, description: true, status: true,
        durationMinutes: true, shuffleQuestions: true, questions: true, schemaJson: true,
      },
    });
    if (!assessment) throw Errors.notFound("Assessment");
    if (assessment.status !== "PUBLISHED") {
      throw Errors.conflict("This assessment is not currently available");
    }

    const definitionQuestions = asArray(assessment.questions);
    if (definitionQuestions.length === 0) {
      throw Errors.conflict("This assessment has no questions");
    }

    // ── Resume path: a still-running attempt for this invite is reopened with a
    // FRESH session token (the old browser session is invalidated). The frozen
    // snapshot is reused verbatim — we never re-randomize mid-take.
    if (invite.attempt && invite.attempt.status === "IN_PROGRESS") {
      const existing = invite.attempt;
      const remaining = computeRemaining(existing);
      if (remaining !== null && remaining <= 0) {
        await prismaAdmin.attempt
          .update({ where: { id: existing.id }, data: { status: "EXPIRED", remainingSeconds: 0 } })
          .catch(() => {});
        throw Errors.conflict("Time is up — this attempt has expired");
      }
      const session = mintToken();
      await prismaAdmin.attempt.update({
        where: { id: existing.id },
        data: {
          sessionTokenHash: session.hash,
          remainingSeconds: remaining,
          lastHeartbeatAt: new Date(),
        },
      });
      const frozenOrder = (existing.questionOrder as string[]) ?? [];
      const orderedQuestions = orderCandidateQuestions(definitionQuestions, frozenOrder);
      return ok(res, {
        attemptId: existing.id,
        sessionToken: session.raw, // returned ONCE
        assessment: {
          id: assessment.id,
          title: assessment.title,
          description: assessment.description,
          durationMinutes: assessment.durationMinutes,
          instructions: instructionsFrom(assessment.schemaJson),
        },
        questions: orderedQuestions,
        remainingSeconds: remaining,
        resumed: true,
      });
    }

    // A SUBMITTED/GRADED/EXPIRED prior attempt means the single use is spent.
    if (invite.attempt) {
      throw Errors.conflict(`This assessment has already been ${invite.attempt.status.toLowerCase()}`);
    }
    // A consumed invite with no live attempt is also spent (defense in depth).
    if (invite.consumedAt) {
      throw Errors.conflict("This invitation has already been used");
    }

    // ── Fresh start: realize randomization ONCE + freeze the snapshot. ──────────
    const ids = definitionQuestions.map((q) => String(q["id"]));
    const questionOrder = assessment.shuffleQuestions ? shuffle(ids) : ids;
    const answerKey: KeyEntry[] = definitionQuestions.map(toKeyEntry);

    const durationSeconds = assessment.durationMinutes != null ? assessment.durationMinutes * 60 : null;
    const now = new Date();
    const session = mintToken();

    // Single-use guard: only create the attempt + consume the invite if it has
    // NOT already been consumed (updateMany count gate) — protects against a
    // double-start race producing two attempts.
    const claim = await prismaAdmin.assessmentInvite.updateMany({
      where: { id: invite.id, consumedAt: null },
      data: { status: "STARTED", startedAt: now, openedAt: invite.openedAt ?? now, consumedAt: now },
    });
    if (claim.count === 0) {
      throw Errors.conflict("This invitation has already been used");
    }

    const attempt = await prismaAdmin.attempt.create({
      data: {
        tenantId,
        assessmentId: assessment.id,
        inviteId: invite.id,
        candidateId: invite.candidateId,
        status: "IN_PROGRESS",
        startedAt: now,
        durationSeconds,
        questionOrder: questionOrder as object,
        answerKey: answerKey as object, // SERVER-ONLY; never returned to candidate
        sessionTokenHash: session.hash,
        remainingSeconds: durationSeconds,
        lastHeartbeatAt: now,
      },
    });

    // Notify-only: attempt.started (interview / analytics may consume).
    await publishEvent({
      subject: assessmentSubject(tenantId, "started"),
      type: "assessment.started",
      tenantId,
      payload: {
        tenantId,
        attemptId: attempt.id,
        assessmentId: assessment.id,
        inviteId: invite.id,
        candidateId: invite.candidateId,
      },
    }).catch(() => {});

    const orderedQuestions = orderCandidateQuestions(definitionQuestions, questionOrder);
    created(res, {
      attemptId: attempt.id,
      sessionToken: session.raw, // returned ONCE; only the hash is stored
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        durationMinutes: assessment.durationMinutes,
        instructions: instructionsFrom(assessment.schemaJson),
      },
      questions: orderedQuestions, // sanitized — no correctAnswer / hidden material
      remainingSeconds: durationSeconds,
      resumed: false,
    });
  } catch (err) {
    next(err);
  }
});

/** Pull candidate-facing instructions out of the authoring tree settings. */
function instructionsFrom(schemaJson: unknown): string | null {
  const settings = (schemaJson as AnyObj | undefined)?.["settings"];
  const instr = (settings as AnyObj | undefined)?.["instructions"];
  return typeof instr === "string" ? instr : null;
}

/**
 * Order the definition questions by the frozen id order, dropping any id no
 * longer present, and sanitize each to the candidate-facing shape.
 */
function orderCandidateQuestions(definition: AnyObj[], order: string[]): AnyObj[] {
  const byId = new Map<string, AnyObj>();
  for (const q of definition) byId.set(String(q["id"]), q);
  const out: AnyObj[] = [];
  for (const id of order) {
    const q = byId.get(id);
    if (q) out.push(toCandidateQuestion(q));
  }
  // Any definition question missing from the frozen order (shouldn't happen) is
  // appended so the candidate never loses a question.
  for (const q of definition) {
    if (!order.includes(String(q["id"]))) out.push(toCandidateQuestion(q));
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /internal/public/assessment/:attemptId/answer
// Autosave a single answer (upsert on [attemptId, questionId]). Validates the
// session, rejects answers to questions not in the frozen snapshot, and persists
// the server-authoritative remaining time as a heartbeat side effect.
// ─────────────────────────────────────────────────────────────────────────────
const AnswerSchema = z.object({
  questionId: z.string().min(1).max(50),
  value: z.union([z.string(), z.array(z.string())]).nullable(),
  timeSpentSeconds: z.number().int().nonnegative().optional(),
  // Optional client-reported remaining; ignored for the clock (server computes),
  // accepted only so older clients don't 400.
  remainingSeconds: z.number().int().nonnegative().optional(),
});

router.put("/:attemptId/answer", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attempt, remaining } = await resolveSession(req);
    const body = AnswerSchema.parse(req.body);

    // The question must be part of THIS attempt's frozen snapshot. Reject stray
    // ids (a tampered client cannot create answers for unknown questions).
    const frozenIds = new Set((attempt.questionOrder as string[]) ?? []);
    if (!frozenIds.has(body.questionId)) {
      throw Errors.validation(`Question '${body.questionId}' is not part of this attempt`);
    }

    const now = new Date();
    await prismaAdmin.answer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId: body.questionId } },
      create: {
        tenantId: attempt.tenantId,
        attemptId: attempt.id,
        questionId: body.questionId,
        value: body.value as object,
        ...(body.timeSpentSeconds !== undefined ? { timeSpentSeconds: body.timeSpentSeconds } : {}),
      },
      update: {
        value: body.value as object,
        ...(body.timeSpentSeconds !== undefined ? { timeSpentSeconds: body.timeSpentSeconds } : {}),
      },
    });

    // Heartbeat side effect: persist the server-authoritative remaining time.
    await prismaAdmin.attempt.update({
      where: { id: attempt.id },
      data: { remainingSeconds: remaining, lastHeartbeatAt: now },
    }).catch(() => {});

    ok(res, { saved: true, questionId: body.questionId, remainingSeconds: remaining });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /internal/public/assessment/:attemptId/heartbeat
// Pure clock sync — the server recomputes + persists remainingSeconds and tells
// the client how long is left. Auto-expires inside resolveSession when the window
// has elapsed (the server is the clock authority, not the browser).
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:attemptId/heartbeat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attempt, remaining } = await resolveSession(req);
    await prismaAdmin.attempt.update({
      where: { id: attempt.id },
      data: { remainingSeconds: remaining, lastHeartbeatAt: new Date() },
    }).catch(() => {});
    ok(res, { remainingSeconds: remaining, status: "IN_PROGRESS" });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /internal/public/assessment/:attemptId/proctor-events
// Append a batch of proctoring signals captured client-side (tab-switch, paste,
// face-lost, etc.). Validates the session; stored verbatim (the risk score is
// derived deterministically on the recruiter-side results surface — never here).
// ─────────────────────────────────────────────────────────────────────────────
const ProctorEventSchema = z.object({
  type: z.string().min(1).max(60),
  metadata: z.record(z.unknown()).optional(),
  occurredAt: z.string().datetime().optional(),
});
const ProctorBatchSchema = z.object({
  events: z.array(ProctorEventSchema).min(1).max(200),
});

router.post("/:attemptId/proctor-events", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attempt } = await resolveSession(req);
    const { events } = ProctorBatchSchema.parse(req.body);

    await prismaAdmin.proctorEvent.createMany({
      data: events.map((e) => ({
        tenantId: attempt.tenantId,
        attemptId: attempt.id,
        type: e.type,
        metadata: (e.metadata ?? {}) as object,
        ...(e.occurredAt ? { occurredAt: new Date(e.occurredAt) } : {}),
      })),
    });

    ok(res, { accepted: events.length });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /internal/public/assessment/:attemptId/submit  (confirmed)
// Finalize the attempt. Scores the DETERMINISTIC items inline by EXACT MATCH
// against the FROZEN answer key (MCQ_SINGLE / MCQ_MULTI / TRUE_FALSE), using the
// same weighted met/total shape as the screening worker. CODING / ESSAY /
// SHORT_ANSWER are left ungraded here and enqueued to the real grading worker
// (Judge0 verdicts + LLM rubric); the attempt goes to status SUBMITTED and the
// result is created with pendingManualReview = (any worker-graded item exists).
// NEVER fabricates a score; NEVER auto-rejects (HITL owns adverse outcomes).
// ─────────────────────────────────────────────────────────────────────────────
const SubmitSchema = z.object({
  // Explicit confirmation gate so a stray request can't end a take.
  confirmed: z.literal(true),
});

/** Normalize a candidate value + a key value to comparable sets of option ids. */
function asIdSet(v: unknown): Set<string> {
  if (Array.isArray(v)) return new Set(v.map((x) => String(x)));
  if (typeof v === "string") return new Set([v]);
  return new Set();
}
function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

router.post("/:attemptId/submit", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attempt } = await resolveSession(req);
    SubmitSchema.parse(req.body);

    const now = new Date();
    const answerKey = (attempt.answerKey as KeyEntry[]) ?? [];

    // Load the candidate's saved answers (admin client; tenant off the attempt).
    const answers = await prismaAdmin.answer.findMany({
      where: { attemptId: attempt.id },
      select: { questionId: true, value: true },
    });
    const answerByQ = new Map<string, unknown>();
    for (const a of answers) answerByQ.set(a.questionId, a.value);

    // ── Inline deterministic scoring against the FROZEN key (same weighted
    // met/total shape as screening.worker: each item weighted by its points). ──
    const perQuestion: AnyObj[] = [];
    let rawScore = 0; // sum of points awarded by the inline grader
    let deterministicMax = 0; // sum of points for the inline-graded items
    let pendingManualReview = false;

    for (const k of answerKey) {
      const possible = typeof k.points === "number" ? k.points : 1;
      const candidate = answerByQ.get(k.questionId) ?? null;

      if (INLINE_GRADED.has(k.type)) {
        deterministicMax += possible;
        // Exact-match against the frozen key. An unanswered/incorrect item scores
        // 0 — a real zero, not a fabricated one. No key => cannot grade (treated
        // as awaiting review rather than silently wrong).
        if (k.correctAnswer === undefined) {
          pendingManualReview = true;
          perQuestion.push({
            questionId: k.questionId, type: k.type, correct: null,
            pointsAwarded: 0, pointsPossible: possible, manuallyGraded: false,
          });
          continue;
        }
        const correct = setsEqual(asIdSet(candidate), asIdSet(k.correctAnswer));
        const awarded = correct ? possible : 0;
        rawScore += awarded;
        perQuestion.push({
          questionId: k.questionId, type: k.type, correct,
          pointsAwarded: awarded, pointsPossible: possible, manuallyGraded: false,
        });
      } else if (WORKER_GRADED.has(k.type)) {
        // Deferred to the grading worker — record an UNGRADED placeholder (correct
        // = null, no points yet). pendingManualReview gates the result as not-final.
        pendingManualReview = true;
        perQuestion.push({
          questionId: k.questionId, type: k.type, correct: null,
          pointsAwarded: 0, pointsPossible: possible, manuallyGraded: false, pendingGrade: true,
        });
      } else {
        // Unknown type — never guess a grade; route to review.
        pendingManualReview = true;
        perQuestion.push({
          questionId: k.questionId, type: k.type, correct: null,
          pointsAwarded: 0, pointsPossible: possible, manuallyGraded: false, pendingGrade: true,
        });
      }
    }

    // maxScore is the FULL rubric maximum (inline + worker-graded), so the
    // recruiter-side percentage is honest once the worker fills in the rest.
    const maxScore = answerKey.reduce((sum, k) => sum + (typeof k.points === "number" ? k.points : 1), 0);

    const durationSeconds =
      attempt.startedAt != null ? Math.max(0, Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000)) : null;

    // Persist the attempt as SUBMITTED + the (partial) result. The attempt status
    // moves to SUBMITTED now; the grading worker advances it to GRADED when it
    // resolves the worker-graded items. The session token is cleared so it cannot
    // be reused after submit.
    await prismaAdmin.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        submittedAt: now,
        durationSeconds,
        remainingSeconds: 0,
        sessionTokenHash: null,
      },
    });
    await prismaAdmin.assessmentInvite.update({
      where: { id: attempt.inviteId },
      data: { status: "SUBMITTED", submittedAt: now },
    }).catch(() => {});

    const result = await prismaAdmin.assessmentResult.upsert({
      where: { attemptId: attempt.id },
      create: {
        tenantId: attempt.tenantId,
        assessmentId: attempt.assessmentId,
        attemptId: attempt.id,
        candidateId: attempt.candidateId,
        rawScore, // ONLY the deterministic points so far — never fabricated
        maxScore,
        passed: null, // computed after grading completes (and never auto-rejects)
        pendingManualReview,
        perQuestion: perQuestion as object,
        gradedAt: pendingManualReview ? null : now, // fully graded only if all-deterministic
      },
      update: {
        rawScore,
        maxScore,
        pendingManualReview,
        perQuestion: perQuestion as object,
        gradedAt: pendingManualReview ? null : now,
      },
    });

    // Enqueue the real grading worker (Judge0 / LLM rubric) when any worker-graded
    // item exists. The worker fans the verdicts back onto the same result; it
    // does NOT auto-reject — adverse outcomes route to the existing HITL flow.
    let gradingJobId: string | null = null;
    if (pendingManualReview) {
      try {
        gradingJobId = await enqueueGrading({
          tenantId: attempt.tenantId,
          assessmentId: attempt.assessmentId,
          attemptId: attempt.id,
          inviteId: attempt.inviteId,
          candidateId: attempt.candidateId,
          userId: "system",
        });
      } catch {
        // Redis down — the result stays pendingManualReview so a human/worker
        // can still pick it up; we do not block the candidate's submit on it.
        gradingJobId = null;
      }
    }

    // Notify-only: attempt.submitted (results / HITL surfaces consume this).
    await publishEvent({
      subject: assessmentSubject(attempt.tenantId, "submitted"),
      type: "assessment.submitted",
      tenantId: attempt.tenantId,
      payload: {
        tenantId: attempt.tenantId,
        attemptId: attempt.id,
        assessmentId: attempt.assessmentId,
        inviteId: attempt.inviteId,
        candidateId: attempt.candidateId,
        pendingManualReview,
      },
    }).catch(() => {});

    // Candidate-facing submit response: NEVER returns a grade/score (grading may
    // not be done, and even when it is, exposing it here is the recruiter's call).
    // It only confirms receipt + whether scoring is still in progress.
    ok(res, {
      submitted: true,
      attemptId: attempt.id,
      status: "SUBMITTED",
      scoringInProgress: pendingManualReview,
      resultId: result.id,
      ...(gradingJobId ? { gradingJobId } : {}),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
