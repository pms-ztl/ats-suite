/**
 * Judge0 client (assessment-service) — SLICE G7.
 *
 * Runs CODING answers against an ISOLATED Judge0 sidecar (env JUDGE0_URL) and
 * fans the REAL per-test-case verdict back onto AssessmentResult.perQuestion. No
 * score is ever fabricated: a question's points are awarded strictly from the
 * weighted pass count Judge0 actually returns; an item with no test cases (or an
 * unreachable Judge0) is routed to manual review (HITL), never auto-graded and
 * never auto-rejected (GDPR Art. 22).
 *
 * ── How a coding item is graded ───────────────────────────────────────────────
 * 1. The grading worker calls runCodingSubmission() for each CODING question with
 *    the candidate's source + the question's TestCase[] (visible + HIDDEN). We
 *    POST one Judge0 batch entry PER test case to /submissions/batch with
 *    base64-encoded source/stdin/expected_output + cpu/wall/memory limits and a
 *    callback_url = the gateway's /api/internal/judge0/callback. Judge0 replies
 *    with one { token } per entry, IN INPUT ORDER.
 * 2. We persist a per-question grade placeholder on result.perQuestion whose
 *    `testCases[]` carries each test case's judge0Token + the correlation tuple
 *    (attemptId, questionId, idx). The hidden flag + weight ride along so the
 *    callback can tally without re-reading the question. stdin/expectedOutput of
 *    HIDDEN cases are NOT stored on the candidate-visible projection (the results
 *    route already strips them; we additionally never echo them to the candidate).
 * 3. Judge0 calls our callback once per submission (PUT-style update). The inbound
 *    handler (handleJudge0Callback) matches the submission token to the stored
 *    testCase, writes the real status (3=Accepted/4=Wrong/5=TLE/6=Compile/…),
 *    timing + memory, marks the case passed iff status===3, and recomputes the
 *    weighted passedCount/totalCount for the question. When every token for the
 *    question has resolved it finalizes that question's points; when every coding
 *    question in the attempt is resolved it finalizes the attempt (status GRADED,
 *    publishes assessment.completed) — see grading.worker for the finalize hook.
 * 4. reapStaleCodingGrades() (a BullMQ-driven timeout reaper invoked by the
 *    worker) closes out attempts whose callbacks never arrived: any still-pending
 *    test case is marked TIMED_OUT (status 5-like, NOT passed) so the attempt can
 *    still be finalized + handed to a human reviewer rather than hanging forever.
 *
 * HARD RULES honored: JUDGE0_URL is the isolated sidecar; hidden test cases never
 * surface to the candidate; verdicts are read verbatim from Judge0; no fabricated
 * scores; no auto-reject.
 */
import { prismaAdmin } from "./prisma.js";

// ── Judge0 status ids (https://ce.judge0.com) ────────────────────────────────
// 1 In Queue, 2 Processing, 3 Accepted, 4 Wrong Answer, 5 Time Limit Exceeded,
// 6 Compilation Error, 7-12 runtime/internal errors, 13 internal, 14 exec format.
export const JUDGE0_STATUS: Record<number, string> = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)",
  9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error",
};

/** A status id < 3 means the submission is still pending (queued/processing). */
export function isPendingStatus(statusId: number | null | undefined): boolean {
  return statusId == null || statusId === 1 || statusId === 2;
}
/** ACCEPTED (status 3) is the only PASS verdict; everything else fails the case. */
export function isAcceptedStatus(statusId: number | null | undefined): boolean {
  return statusId === 3;
}

const JUDGE0_URL = process.env["JUDGE0_URL"] ?? "http://localhost:2358";
// Public base the Judge0 sidecar can reach to deliver async callbacks. Judge0
// runs in its own network, so the callback host is the gateway (PUBLIC, no auth —
// the submission token IS the correlation credential), NOT this service directly.
const JUDGE0_CALLBACK_BASE =
  process.env["JUDGE0_CALLBACK_BASE_URL"] ??
  process.env["GATEWAY_PUBLIC_URL"] ??
  "http://localhost:4000";
const JUDGE0_CALLBACK_URL = `${JUDGE0_CALLBACK_BASE}/api/internal/judge0/callback`;

// Per-test-case execution limits. Bounded so a hostile submission cannot wedge
// the sidecar; overridable via env for heavier languages.
const CPU_TIME_LIMIT = Number(process.env["JUDGE0_CPU_LIMIT"] ?? 5); // seconds
const WALL_TIME_LIMIT = Number(process.env["JUDGE0_WALL_LIMIT"] ?? 10); // seconds
const MEMORY_LIMIT_KB = Number(process.env["JUDGE0_MEMORY_LIMIT_KB"] ?? 256_000); // 256 MB

// ── Language id resolution ───────────────────────────────────────────────────
// Judge0 keys languages by numeric id. A question may carry either an explicit
// numeric languageId or a human language name ("python", "javascript", …); we
// map common names to the Judge0 CE default ids. Unknown names fall back to a
// configurable default so the submission is still attempted (and any compile
// error surfaces as a real status, not a fabricated pass).
const LANGUAGE_IDS: Record<string, number> = {
  "c": 50,
  "cpp": 54,
  "c++": 54,
  "csharp": 51,
  "c#": 51,
  "go": 60,
  "java": 62,
  "javascript": 63,
  "js": 63,
  "node": 63,
  "kotlin": 78,
  "php": 68,
  "python": 71,
  "python3": 71,
  "py": 71,
  "ruby": 72,
  "rust": 73,
  "swift": 83,
  "typescript": 74,
  "ts": 74,
};
const DEFAULT_LANGUAGE_ID = Number(process.env["JUDGE0_DEFAULT_LANGUAGE_ID"] ?? 71); // python3

export function resolveLanguageId(language: unknown, languageId: unknown): number {
  if (typeof languageId === "number" && Number.isFinite(languageId)) return languageId;
  if (typeof language === "string") {
    const id = LANGUAGE_IDS[language.trim().toLowerCase()];
    if (id) return id;
  }
  return DEFAULT_LANGUAGE_ID;
}

const b64 = (s: string): string => Buffer.from(s ?? "", "utf8").toString("base64");

// ── Contracts ────────────────────────────────────────────────────────────────

/** One test case attached to a CODING question definition. `hidden` cases are
 *  NEVER surfaced to the candidate; `weight` lets a case count for more than one
 *  (defaults to 1). */
export interface TestCase {
  name?: string;
  stdin?: string;
  expectedOutput?: string;
  hidden?: boolean;
  weight?: number;
}

/** The per-case result stored on result.perQuestion[].testCases[]. judge0Token +
 *  the correlation tuple let the async callback find + update exactly this case. */
export interface CodingTestCaseResult {
  idx: number;
  name: string | null;
  hidden: boolean;
  weight: number;
  judge0Token: string | null;
  // null while pending; filled verbatim from the real Judge0 verdict.
  statusId: number | null;
  status: string | null;
  passed: boolean | null;
  timeMs: number | null;
  memoryKb: number | null;
  // Visible-case I/O is retained for the recruiter detail view; hidden-case I/O
  // is NEVER stored here (the results route also strips it, defense in depth).
  stdin?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

/** What the grading worker gets back when it kicks off a coding submission. */
export interface CodingSubmissionResult {
  /** True when at least one batch entry was accepted by Judge0 (callbacks pending). */
  submitted: boolean;
  /** The per-case placeholders to persist on the question grade (tokens inside). */
  testCases: CodingTestCaseResult[];
  /** Total weighted cases (denominator for the eventual score). */
  totalWeight: number;
  /** Reason the submission could not run (e.g. no test cases / Judge0 down). */
  reason?: string;
}

// ── Outbound: POST /submissions/batch (one entry per test case) ───────────────

interface Judge0BatchEntry {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit: number;
  wall_time_limit: number;
  memory_limit: number;
  callback_url: string;
}

/**
 * Submit a candidate's coding answer against the question's test cases. Returns
 * per-case placeholders (each with the Judge0 token) for the worker to persist;
 * the REAL verdicts arrive asynchronously via handleJudge0Callback. When there
 * are no test cases, or Judge0 is unreachable, returns submitted:false with a
 * reason so the worker routes the question to manual review (never a fake score).
 */
export async function runCodingSubmission(opts: {
  source: string;
  language: unknown;
  languageId: unknown;
  testCases: TestCase[];
}): Promise<CodingSubmissionResult> {
  const cases = Array.isArray(opts.testCases) ? opts.testCases : [];
  // Build the per-case placeholder list up-front so the order matches the batch.
  const placeholders: CodingTestCaseResult[] = cases.map((tc, idx) => {
    const hidden = tc.hidden === true;
    const weight = typeof tc.weight === "number" && tc.weight > 0 ? tc.weight : 1;
    const base: CodingTestCaseResult = {
      idx,
      name: tc.name ?? null,
      hidden,
      weight,
      judge0Token: null,
      statusId: null,
      status: null,
      passed: null,
      timeMs: null,
      memoryKb: null,
    };
    if (!hidden) {
      if (tc.stdin !== undefined) base.stdin = tc.stdin;
      if (tc.expectedOutput !== undefined) base.expectedOutput = tc.expectedOutput;
    }
    return base;
  });
  const totalWeight = placeholders.reduce((s, c) => s + c.weight, 0);

  if (cases.length === 0) {
    return { submitted: false, testCases: placeholders, totalWeight, reason: "no test cases configured" };
  }
  if (!opts.source || typeof opts.source !== "string" || opts.source.trim().length === 0) {
    // No submitted code — every case is a real fail (0 points), not a route-to-review.
    for (const p of placeholders) {
      p.statusId = 4;
      p.status = JUDGE0_STATUS[4]!;
      p.passed = false;
    }
    return { submitted: true, testCases: placeholders, totalWeight, reason: "empty submission" };
  }

  const languageId = resolveLanguageId(opts.language, opts.languageId);
  const submissions: Judge0BatchEntry[] = cases.map((tc) => ({
    source_code: b64(opts.source),
    language_id: languageId,
    stdin: b64(tc.stdin ?? ""),
    expected_output: b64(tc.expectedOutput ?? ""),
    cpu_time_limit: CPU_TIME_LIMIT,
    wall_time_limit: WALL_TIME_LIMIT,
    memory_limit: MEMORY_LIMIT_KB,
    callback_url: JUDGE0_CALLBACK_URL,
  }));

  try {
    const url = `${JUDGE0_URL}/submissions/batch?base64_encoded=true`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...judge0AuthHeaders() },
      body: JSON.stringify({ submissions }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { submitted: false, testCases: placeholders, totalWeight, reason: `Judge0 returned ${res.status}` };
    }
    // Judge0 returns [{ token }, …] in input order; map tokens onto placeholders.
    const body = (await res.json()) as Array<{ token?: string }>;
    if (!Array.isArray(body)) {
      return { submitted: false, testCases: placeholders, totalWeight, reason: "Judge0 returned an unexpected shape" };
    }
    body.forEach((entry, i) => {
      const p = placeholders[i];
      if (p && typeof entry?.token === "string") p.judge0Token = entry.token;
    });
    const anyToken = placeholders.some((p) => p.judge0Token);
    if (!anyToken) {
      return { submitted: false, testCases: placeholders, totalWeight, reason: "Judge0 returned no tokens" };
    }
    return { submitted: true, testCases: placeholders, totalWeight };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Judge0 request failed";
    return { submitted: false, testCases: placeholders, totalWeight, reason };
  }
}

/** Optional bearer/header auth for hosted Judge0 (RapidAPI / self-host token). */
function judge0AuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const authToken = process.env["JUDGE0_AUTH_TOKEN"];
  if (authToken) headers["X-Auth-Token"] = authToken;
  const rapidKey = process.env["JUDGE0_RAPIDAPI_KEY"];
  if (rapidKey) {
    headers["X-RapidAPI-Key"] = rapidKey;
    headers["X-RapidAPI-Host"] = process.env["JUDGE0_RAPIDAPI_HOST"] ?? "judge0-ce.p.rapidapi.com";
  }
  return headers;
}

// ── Inbound: handle one Judge0 callback (PUT) ────────────────────────────────

/** The Judge0 callback body (base64_encoded fields decoded here). We only read
 *  the facets we trust: the submission token + status + timing/memory + stdout. */
export interface Judge0Callback {
  token?: string;
  status?: { id?: number; description?: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null; // seconds, as a string
  memory?: number | null; // KB
}

const decodeMaybeB64 = (v: string | null | undefined): string | null => {
  if (v == null) return null;
  try {
    return Buffer.from(v, "base64").toString("utf8");
  } catch {
    return v;
  }
};

/**
 * Apply one Judge0 callback to the stored grade. Finds the result whose
 * perQuestion[].testCases[] contains the submission token, writes the REAL
 * verdict onto that case, recomputes the question's weighted passedCount /
 * totalCount + points, and reports whether every coding case in the attempt has
 * now resolved (so the caller can finalize the attempt). Idempotent: a duplicate
 * callback for an already-resolved token is a no-op.
 *
 * Returns null when no result owns the token (unknown/late callback). Otherwise
 * { attemptId, allResolved } so the worker's finalize hook can run.
 */
export async function handleJudge0Callback(
  cb: Judge0Callback,
): Promise<{ attemptId: string; allResolved: boolean } | null> {
  const token = cb.token;
  if (!token || typeof token !== "string") return null;

  // Locate the result carrying this token. perQuestion is JSONB; we cannot index
  // it cheaply, so we scan recent ungraded results (pendingManualReview = true).
  // Admin client: the callback is public/unauthenticated, tenant comes off the row.
  const candidates = await prismaAdmin.assessmentResult.findMany({
    where: { pendingManualReview: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
    select: { id: true, attemptId: true, perQuestion: true },
  });

  for (const r of candidates) {
    const perQuestion = Array.isArray(r.perQuestion) ? (r.perQuestion as AnyObj[]) : [];
    let touched = false;
    for (const q of perQuestion) {
      const tcs = Array.isArray(q["testCases"]) ? (q["testCases"] as AnyObj[]) : [];
      const tc = tcs.find((t) => t["judge0Token"] === token);
      if (!tc) continue;

      // Idempotent: already resolved -> nothing to do.
      if (tc["statusId"] != null && tc["status"] !== "Timed Out") return { attemptId: r.attemptId, allResolved: codingFullyResolved(perQuestion) };

      const statusId = typeof cb.status?.id === "number" ? cb.status.id : 13;
      tc["statusId"] = statusId;
      tc["status"] = cb.status?.description ?? JUDGE0_STATUS[statusId] ?? "Unknown";
      tc["passed"] = isAcceptedStatus(statusId);
      tc["timeMs"] = cb.time != null ? Math.round(Number(cb.time) * 1000) : null;
      tc["memoryKb"] = typeof cb.memory === "number" ? cb.memory : null;
      // Visible-case actual output for the recruiter detail; never for hidden.
      if (tc["hidden"] !== true) {
        const out = decodeMaybeB64(cb.stdout) ?? decodeMaybeB64(cb.stderr) ?? decodeMaybeB64(cb.compile_output);
        if (out != null) tc["actualOutput"] = out;
      }
      recomputeQuestionFromTestCases(q);
      touched = true;
      break;
    }

    if (touched) {
      await prismaAdmin.assessmentResult.update({
        where: { id: r.id },
        data: { perQuestion: perQuestion as object },
      });
      return { attemptId: r.attemptId, allResolved: codingFullyResolved(perQuestion) };
    }
  }
  return null;
}

// ── Timeout reaper ────────────────────────────────────────────────────────────

/**
 * Close out a single attempt whose Judge0 callbacks never arrived. Any still
 * pending coding test case is stamped TIMED_OUT (not passed), each affected
 * question is recomputed, and the result is saved. Returns true when every coding
 * case is now resolved (so the worker can finalize). Never fabricates a pass.
 */
export async function reapStaleCodingGrades(attemptId: string): Promise<boolean> {
  const result = await prismaAdmin.assessmentResult.findUnique({
    where: { attemptId },
    select: { id: true, perQuestion: true },
  });
  if (!result) return false;
  const perQuestion = Array.isArray(result.perQuestion) ? (result.perQuestion as AnyObj[]) : [];
  let changed = false;
  for (const q of perQuestion) {
    const tcs = Array.isArray(q["testCases"]) ? (q["testCases"] as AnyObj[]) : [];
    let qChanged = false;
    for (const tc of tcs) {
      if (tc["statusId"] == null && tc["judge0Token"]) {
        tc["statusId"] = 5; // treat an unresolved case as a (real) failure, not a pass
        tc["status"] = "Timed Out";
        tc["passed"] = false;
        qChanged = true;
        changed = true;
      }
    }
    if (qChanged) recomputeQuestionFromTestCases(q);
  }
  if (changed) {
    await prismaAdmin.assessmentResult.update({
      where: { id: result.id },
      data: { perQuestion: perQuestion as object },
    });
  }
  return codingFullyResolved(perQuestion);
}

// ── Shared tally helpers ──────────────────────────────────────────────────────

type AnyObj = Record<string, unknown>;

/** True when every CODING question's test cases have all resolved (no pending
 *  token left). Non-coding questions are ignored here. */
export function codingFullyResolved(perQuestion: AnyObj[]): boolean {
  for (const q of perQuestion) {
    if (!Array.isArray(q["testCases"])) continue;
    for (const tc of q["testCases"] as AnyObj[]) {
      if (tc["judge0Token"] && tc["statusId"] == null) return false;
    }
  }
  return true;
}

/**
 * Recompute one coding question's grade from its (possibly partial) test-case
 * verdicts. Points are awarded proportionally to the WEIGHTED pass count, so a
 * candidate who passes 5/8 weighted cases gets 5/8 of the question's points. The
 * question is only marked `correct`/fully-graded once no token is still pending;
 * until then it stays pendingGrade. NEVER fabricates a verdict.
 */
function recomputeQuestionFromTestCases(q: AnyObj): void {
  const tcs = Array.isArray(q["testCases"]) ? (q["testCases"] as AnyObj[]) : [];
  let totalWeight = 0;
  let passedWeight = 0;
  let pending = false;
  for (const tc of tcs) {
    const weight = typeof tc["weight"] === "number" && (tc["weight"] as number) > 0 ? (tc["weight"] as number) : 1;
    totalWeight += weight;
    if (tc["judge0Token"] && tc["statusId"] == null) pending = true;
    if (tc["passed"] === true) passedWeight += weight;
  }
  q["passedCount"] = passedWeight;
  q["totalCount"] = totalWeight;
  const possible = typeof q["pointsPossible"] === "number" ? (q["pointsPossible"] as number) : 1;
  const awarded = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * possible) : 0;
  if (pending) {
    // Still awaiting verdicts — keep the placeholder, do not commit points yet.
    q["pendingGrade"] = true;
    return;
  }
  // Fully resolved: commit the real, proportional points.
  q["pointsAwarded"] = awarded;
  q["correct"] = totalWeight > 0 ? passedWeight === totalWeight : null;
  delete q["pendingGrade"];
}
