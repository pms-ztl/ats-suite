// lib/assessment-api.ts
// SLICE G10  -  typed data-access layer for the Online Assessments (OA) authoring
// surface. Talks to the WF4 gateway routes, which are gated behind
// requireModule('oa-assessments') and proxy to the assessment-service RLS-scoped
// /internal/assessments/* handlers (so every read/write is tenant-isolated).
//
// Routes used (all under NEXT_PUBLIC_API_URL, default http://localhost:4000/api):
//   GET    /assessments                       -> list the tenant's assessments
//   POST   /assessments                       -> create a DRAFT
//   GET    /assessments/:id                   -> one assessment (full record)
//   PUT    /assessments/:id                   -> update DRAFT metadata
//   GET    /assessments/:id/schema            -> the authoring TREE + version meta
//   PUT    /assessments/:id/schema            -> save / publish the authoring TREE
//
// Real-data-only discipline: list returns [] when empty (the caller renders an
// honest empty state); nothing is fabricated here. The authoring tree carries
// correctAnswer keys because this is the AUTHOR surface  -  the public take slice
// is what strips answer keys before they reach a candidate.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function authToken(): string | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {
    return null;
  }
}

// Unwraps the standard { success, data } envelope (tolerating a bare body).
function unwrap<T>(body: any): T {
  return (body && typeof body === "object" && "data" in body ? body.data : body) as T;
}

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = parsed?.error?.message || parsed?.message || `${method} ${path} -> ${res.status}`;
    const err = new Error(msg) as Error & { status?: number; issues?: unknown };
    err.status = res.status;
    err.issues = parsed?.error?.details ?? parsed?.error?.issues;
    throw err;
  }
  return unwrap<T>(parsed);
}

/* ───────────────────────────── view-model types ───────────────────────────── */

export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type GradedQuestionType =
  | "MCQ_SINGLE" | "MCQ_MULTI" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "CODING";

// One row in the list (the backend includes a _count of invites/attempts/results).
export interface AssessmentListItem {
  id: string;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  requisitionId: string | null;
  durationMinutes: number | null;
  passingScore: number | null;
  version: number;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  counts: { invites: number; attempts: number; results: number };
}

// A question option (MCQ / TRUE_FALSE choice).
export interface SchemaOption { id: string; label: string }

// A question in the authoring TREE. correctAnswer is the auto-grade key for
// deterministic items; ESSAY/CODING leave it unset (they route to manual / Judge0
// grading server-side, never auto-scored in the UI).
export interface SchemaQuestion {
  id: string;
  type: GradedQuestionType;
  prompt: string;
  order?: number;
  required?: boolean;
  points?: number;
  timeLimit?: number | null;
  options?: SchemaOption[];
  correctAnswer?: string | string[];
  language?: string;
  starterCode?: string;
}

export interface SchemaSection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  questions: SchemaQuestion[];
}

export interface AssessmentTree {
  settings?: { instructions?: string; randomizeSections?: boolean; [k: string]: unknown };
  sections: SchemaSection[];
}

// GET /assessments/:id/schema response.
export interface AssessmentSchemaResponse {
  assessmentId: string;
  status: AssessmentStatus;
  version: number;
  publishedHash: string | null;
  publishedAt?: string | null;
  schemaJson: AssessmentTree;
  updatedAt: string;
}

export interface CreateAssessmentInput {
  title: string;
  description?: string | null;
  requisitionId?: string | null;
  durationMinutes?: number | null;
  passingScore?: number | null;
  shuffleQuestions?: boolean;
}

/* ───────────────────────────── normalizers ───────────────────────────── */

function toListItem(a: any): AssessmentListItem {
  const c = a?._count ?? {};
  return {
    id: String(a?.id ?? ""),
    title: String(a?.title ?? "Untitled assessment"),
    description: a?.description ?? null,
    status: (a?.status ?? "DRAFT") as AssessmentStatus,
    requisitionId: a?.requisitionId ?? null,
    durationMinutes: typeof a?.durationMinutes === "number" ? a.durationMinutes : null,
    passingScore: typeof a?.passingScore === "number" ? a.passingScore : null,
    version: Number(a?.version ?? 1),
    publishedAt: a?.publishedAt ?? null,
    updatedAt: a?.updatedAt ?? a?.createdAt ?? "",
    createdAt: a?.createdAt ?? "",
    counts: {
      invites: Number(c?.invites ?? 0),
      attempts: Number(c?.attempts ?? 0),
      results: Number(c?.results ?? 0),
    },
  };
}

function toTree(raw: any): AssessmentTree {
  const sections = Array.isArray(raw?.sections) ? raw.sections : [];
  return { settings: raw?.settings ?? undefined, sections };
}

/* ───────────────────────────── client functions ───────────────────────────── */

// List the tenant's assessments. Honest empty: returns [] when there are none.
export async function listAssessments(
  q?: { status?: AssessmentStatus; requisitionId?: string },
): Promise<AssessmentListItem[]> {
  const params = new URLSearchParams();
  if (q?.status) params.set("status", q.status);
  if (q?.requisitionId) params.set("requisitionId", q.requisitionId);
  const qs = params.toString();
  const body = await call<any>("GET", `/assessments${qs ? `?${qs}` : ""}`);
  const rows = Array.isArray(body) ? body : body?.assessments ?? body?.rows ?? [];
  return rows.map(toListItem);
}

// Create a DRAFT assessment. The builder fills the schema via saveAssessmentSchema.
export async function createAssessment(input: CreateAssessmentInput): Promise<AssessmentListItem> {
  const body = await call<any>("POST", "/assessments", input);
  return toListItem(body);
}

// Fetch one assessment's full record (list-item shape).
export async function getAssessment(id: string): Promise<AssessmentListItem> {
  const body = await call<any>("GET", `/assessments/${id}`);
  return toListItem(body);
}

// Update DRAFT metadata (title/duration/passing score/etc.). PUBLISHED is immutable (409).
export async function updateAssessment(
  id: string,
  patch: Partial<CreateAssessmentInput>,
): Promise<AssessmentListItem> {
  const body = await call<any>("PUT", `/assessments/${id}`, patch);
  return toListItem(body);
}

// Load the authoring TREE + version meta for the builder.
export async function getAssessmentSchema(id: string): Promise<AssessmentSchemaResponse> {
  const body = await call<any>("GET", `/assessments/${id}/schema`);
  return {
    assessmentId: String(body?.assessmentId ?? id),
    status: (body?.status ?? "DRAFT") as AssessmentStatus,
    version: Number(body?.version ?? 1),
    publishedHash: body?.publishedHash ?? null,
    publishedAt: body?.publishedAt ?? null,
    schemaJson: toTree(body?.schemaJson),
    updatedAt: body?.updatedAt ?? "",
  };
}

// Save the authoring TREE. publish=true bumps version, derives the flat question
// array server-side, and flips the assessment to PUBLISHED (immutable thereafter).
export async function saveAssessmentSchema(
  id: string,
  schemaJson: AssessmentTree,
  publish = false,
): Promise<AssessmentSchemaResponse> {
  const body = await call<any>("PUT", `/assessments/${id}/schema`, { schemaJson, publish });
  return {
    assessmentId: String(body?.assessmentId ?? id),
    status: (body?.status ?? "DRAFT") as AssessmentStatus,
    version: Number(body?.version ?? 1),
    publishedHash: body?.publishedHash ?? null,
    publishedAt: body?.publishedAt ?? null,
    schemaJson: toTree(body?.schemaJson ?? schemaJson),
    updatedAt: body?.updatedAt ?? "",
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
 * SLICE G12  -  PUBLIC candidate TAKE helpers (no auth).
 *
 * These are the ONLY calls the candidate-portal runner makes. They hit the
 * gateway's UNAUTHENTICATED public surface, which proxies to the
 * assessment-service public-take router (prismaAdmin, tenant resolved FROM the
 * token row  -  no JWT, no tenant header):
 *
 *   POST   /api/public/assessment/start                       { token }
 *   PUT    /api/public/assessment/:attemptId/answer           { questionId, value, timeSpentSeconds? }
 *   POST   /api/public/assessment/:attemptId/heartbeat        {}
 *   POST   /api/public/assessment/:attemptId/proctor-events   { events: [...] }
 *   POST   /api/public/assessment/:attemptId/submit           { confirmed: true }
 *
 * The single-use INVITE token (from the take link) is the credential for
 * `start`; every later call presents the short-lived per-attempt SESSION token
 * that `start` returns ONCE, via the `x-session-token` header (the downstream
 * router resolves the attempt + tenant from its SHA-256 hash).
 *
 * HARD RULES honored here:
 *  - The candidate UI NEVER receives the answer key or hidden test cases  -  the
 *    server already strips correctAnswer / hidden material from every question
 *    before `start` returns; these types reflect only that sanitized subset.
 *  - No score is ever shown on submit (the response only confirms receipt + a
 *    scoringInProgress flag). Real Judge0 / LLM-rubric verdicts are computed
 *    server-side for recruiters, never echoed to the candidate.
 *  - The clock is server-authoritative: every call returns the server's
 *    remainingSeconds; the browser only displays it.
 * ═══════════════════════════════════════════════════════════════════════════ */

// Candidate-safe question shape (NO correctAnswer, NO hidden test cases).
export type TakeQuestionType =
  | "MCQ_SINGLE" | "MCQ_MULTI" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "CODING";

export interface TakeOption { id: string; label: string }

export interface TakeQuestion {
  id: string;
  type: TakeQuestionType;
  prompt: string;
  order?: number;
  required: boolean;
  points: number;
  timeLimit?: number | null;
  // MCQ_SINGLE / MCQ_MULTI / TRUE_FALSE only.
  options?: TakeOption[];
  // CODING only  -  candidate-facing starter scaffold + language hint.
  language?: string | null;
  starterCode?: string | null;
}

export interface TakeAssessmentMeta {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
  instructions?: string | null;
}

export interface StartResponse {
  attemptId: string;
  // Returned ONCE; held only in memory for the take session, never persisted.
  sessionToken: string;
  assessment: TakeAssessmentMeta;
  questions: TakeQuestion[];
  remainingSeconds: number | null;
  resumed: boolean;
}

// A candidate answer value: a single string (SHORT_ANSWER / ESSAY / CODING /
// TRUE_FALSE / MCQ_SINGLE option id) or a set of option ids (MCQ_MULTI).
export type AnswerValue = string | string[] | null;

export interface SaveAnswerResponse {
  saved: boolean;
  questionId: string;
  remainingSeconds: number | null;
}

export interface HeartbeatResponse {
  remainingSeconds: number | null;
  status: string;
}

export interface ProctorEventInput {
  type: string;
  metadata?: Record<string, unknown>;
  occurredAt?: string;
}

export interface SubmitResponse {
  submitted: boolean;
  attemptId: string;
  status: string;
  // True while CODING / ESSAY / SHORT_ANSWER items await the grading worker.
  // NEVER a score  -  the candidate is never shown a grade here.
  scoringInProgress: boolean;
  resultId: string;
}

// A structured error so the runner can tell a TERMINAL state (expired / revoked
// / already used / time up) apart from a transient one (offline, 5xx).
export class TakeApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "TakeApiError";
    this.status = status;
    this.code = code;
  }
}

async function publicCall<T>(
  method: string,
  path: string,
  opts: { body?: unknown; sessionToken?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.sessionToken) headers["x-session-token"] = opts.sessionToken;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      // No credentials: this is the unauthenticated public surface; the token is
      // the only credential and it travels in the header / body.
      ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
    });
  } catch {
    throw new TakeApiError("We could not reach the server. Check your connection and try again.", 0);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error?.message ?? json?.message ?? "Something went wrong. Please try again.";
    throw new TakeApiError(message, res.status, json?.error?.code);
  }
  return unwrap<T>(json);
}

/** Open (or resume) an attempt from the single-use invite token in the link. */
export function startAttempt(token: string): Promise<StartResponse> {
  return publicCall<StartResponse>("POST", "/public/assessment/start", { body: { token } });
}

/** Debounced autosave of one answer. Also acts as a heartbeat (server returns remaining). */
export function saveAnswer(
  attemptId: string,
  sessionToken: string,
  input: { questionId: string; value: AnswerValue; timeSpentSeconds?: number },
): Promise<SaveAnswerResponse> {
  return publicCall<SaveAnswerResponse>("PUT", `/public/assessment/${attemptId}/answer`, {
    sessionToken,
    body: input,
  });
}

/** Pure clock sync  -  the server recomputes + returns the authoritative remaining time. */
export function heartbeat(attemptId: string, sessionToken: string): Promise<HeartbeatResponse> {
  return publicCall<HeartbeatResponse>("POST", `/public/assessment/${attemptId}/heartbeat`, {
    sessionToken,
    body: {},
  });
}

/** Flush a batch of proctoring signals captured client-side (best-effort). */
export function sendProctorEvents(
  attemptId: string,
  sessionToken: string,
  events: ProctorEventInput[],
): Promise<{ accepted: number }> {
  return publicCall<{ accepted: number }>("POST", `/public/assessment/${attemptId}/proctor-events`, {
    sessionToken,
    body: { events },
  });
}

/** Finalize the attempt. Gated by an explicit confirm (confirmed: true). */
export function submitAttempt(attemptId: string, sessionToken: string): Promise<SubmitResponse> {
  return publicCall<SubmitResponse>("POST", `/public/assessment/${attemptId}/submit`, {
    sessionToken,
    body: { confirmed: true },
  });
}
