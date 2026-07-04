// lib/assessment-provider-api.ts
// LANE 2 helper - the external online-assessment (OA) VENDOR flow surface
// (HackerRank / HackerEarth / Codility / iMocha / TestGorilla), kept lane-local
// so nothing here touches shared lib/api.ts.
//
// It talks to the SAME module-owned gateway base as the OA authoring surface
// (/api/assessments, gated behind requireModule('oa-assessments')), consuming:
//
//   NEW (Lane 1):
//     GET  /api/assessments/providers               -> connected-status per vendor
//     GET  /api/assessments/providers/:kind/tests    -> the vendor's REAL test library
//     GET  /api/assessments/providers/:kind/validate -> live connection check + test count
//
//   EXISTING (already shipped, unchanged):
//     GET  /api/assessments                          -> the tenant's assessments (list)
//     POST /api/assessments                          -> create a DRAFT assessment
//     POST /api/assessments/:id/invite               -> issue an invite (native OR vendor)
//     GET  /api/assessments/:id/invites              -> invites issued for an assessment
//     GET  /api/assessments/:id/results              -> graded results (incl. vendor summary)
//
// REAL-data-or-honest-empty discipline (HARD RULE): an un-keyed vendor is
// reported as not connected (the UI shows "connect your account"); a test that
// has not been taken shows "awaiting result"; NOTHING here fabricates a test,
// a score, or a connected state. The invite is issued through the exact existing
// POST /:id/invite { provider, providerTestId } flow - no new backend contract.

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
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return unwrap<T>(parsed);
}

/* ─────────────────────────── vendor identity ─────────────────────────── */

// The two vendors NCR Voyix uses are first-class here; the other three shipped
// adapters stay available for completeness. Keys match the provider registry +
// the TenantIntegration `kind`.
export type ProviderKind = "hackerrank" | "hackerearth" | "codility" | "imocha" | "testgorilla";

export interface ProviderMeta {
  kind: ProviderKind;
  name: string;
  abbr: string;
  color: string;
}

// Display metadata, colors mirror the settings/integrations panel so the two
// surfaces read consistently. HackerRank + HackerEarth lead (NCR Voyix's stack).
export const PROVIDER_META: Record<ProviderKind, ProviderMeta> = {
  hackerrank: { kind: "hackerrank", name: "HackerRank", abbr: "HR", color: "var(--ok)" },
  hackerearth: { kind: "hackerearth", name: "HackerEarth", abbr: "HE", color: "var(--brand)" },
  codility: { kind: "codility", name: "Codility", abbr: "CO", color: "var(--info)" },
  imocha: { kind: "imocha", name: "iMocha", abbr: "IM", color: "var(--ai)" },
  testgorilla: { kind: "testgorilla", name: "TestGorilla", abbr: "TG", color: "var(--warn)" },
};

// The coding-test vendors surfaced in the candidate send-test flow, in order.
export const CODING_PROVIDERS: ProviderKind[] = ["hackerrank", "hackerearth"];

export function providerLabel(kind: string | null | undefined): string {
  const k = (kind ?? "").toLowerCase() as ProviderKind;
  return PROVIDER_META[k]?.name ?? (kind ?? "External vendor");
}

/* ─────────────────────────── Lane 1 shapes ─────────────────────────── */

// One row from GET /api/assessments/providers. `connected` reflects whether the
// tenant has saved credentials for this vendor (a TenantIntegration row exists);
// it is NEVER a claim that a live handshake succeeded (that is `validate`). We
// read defensively so a slightly different field name from Lane 1 still resolves.
export interface ProviderStatus {
  kind: ProviderKind;
  name: string;
  connected: boolean;
  /** Optional test count the list endpoint may include; omitted when unknown. */
  testCount?: number | null;
}

// One test in a vendor's library (GET /providers/:kind/tests). `id` is the
// vendor's own test id, passed straight back into the invite as `providerTestId`.
export interface ProviderTest {
  id: string;
  name: string;
  category?: string | null;
  durationMinutes?: number | null;
}

// Result of GET /providers/:kind/validate - a real connection probe.
export interface ProviderValidation {
  ok: boolean;
  /** Number of tests the vendor account exposes, when the probe could count them. */
  testCount?: number | null;
  /** Honest failure reason from the vendor/probe (never a secret). */
  message?: string | null;
}

/* ─────────────────────────── normalizers ─────────────────────────── */

const KNOWN_KINDS = new Set<string>(Object.keys(PROVIDER_META));

function toProviderStatus(raw: any): ProviderStatus | null {
  const kind = String(raw?.kind ?? raw?.provider ?? raw?.id ?? "").toLowerCase();
  if (!KNOWN_KINDS.has(kind)) return null;
  const k = kind as ProviderKind;
  // Accept several honest truthy signals for "credentials saved", but treat a
  // missing/false value as NOT connected (never optimistic).
  const connected =
    raw?.connected === true ||
    raw?.configured === true ||
    raw?.enabled === true ||
    raw?.hasCredentials === true;
  const rawCount = raw?.testCount ?? raw?.tests ?? raw?.count;
  return {
    kind: k,
    name: PROVIDER_META[k].name,
    connected,
    testCount: typeof rawCount === "number" ? rawCount : null,
  };
}

function toProviderTest(raw: any): ProviderTest | null {
  const id = raw?.id ?? raw?.testId ?? raw?.slug;
  if (id == null || String(id).length === 0) return null;
  return {
    id: String(id),
    name: String(raw?.name ?? raw?.title ?? `Test ${id}`),
    category: typeof raw?.category === "string" ? raw.category : null,
    durationMinutes: typeof raw?.durationMinutes === "number" ? raw.durationMinutes : null,
  };
}

/* ─────────────────────────── Lane 1 endpoints ─────────────────────────── */

// List the connected status for every OA vendor. Honest empty on any failure /
// empty tenant (the caller renders "connect your account"). The whole set is
// derived so an unknown/extra kind from Lane 1 is ignored, and a vendor Lane 1
// omits still appears as NOT connected (never silently missing).
export async function listProviders(): Promise<ProviderStatus[]> {
  let rows: any[] = [];
  try {
    const body = await call<any>("GET", "/assessments/providers");
    rows = Array.isArray(body) ? body : body?.providers ?? body?.rows ?? [];
  } catch {
    rows = [];
  }
  const byKind = new Map<ProviderKind, ProviderStatus>();
  for (const r of rows) {
    const s = toProviderStatus(r);
    if (s) byKind.set(s.kind, s);
  }
  // Ensure every known vendor is represented (disconnected when Lane 1 omits it).
  return (Object.keys(PROVIDER_META) as ProviderKind[]).map(
    (k) => byKind.get(k) ?? { kind: k, name: PROVIDER_META[k].name, connected: false, testCount: null },
  );
}

// Browse a vendor's REAL test library. Returns [] when the account is un-keyed
// or has no tests (the caller shows the honest "connect your account" / "no
// tests" empty state); throws only so the caller can show a real error.
export async function listProviderTests(kind: ProviderKind): Promise<ProviderTest[]> {
  const body = await call<any>("GET", `/assessments/providers/${encodeURIComponent(kind)}/tests`);
  const rows = Array.isArray(body) ? body : body?.tests ?? body?.rows ?? [];
  return rows.map(toProviderTest).filter((t: ProviderTest | null): t is ProviderTest => t !== null);
}

// Probe a vendor connection live (Test connection). Reports a real ok/failed
// state + the test count the probe saw. A thrown/failed probe is surfaced as
// { ok:false } with the honest message - never an optimistic "connected".
export async function validateProvider(kind: ProviderKind): Promise<ProviderValidation> {
  try {
    const body = await call<any>("GET", `/assessments/providers/${encodeURIComponent(kind)}/validate`);
    const okFlag = body?.ok === true || body?.valid === true || body?.connected === true;
    const rawCount = body?.testCount ?? body?.tests ?? body?.count;
    return {
      ok: okFlag,
      testCount: typeof rawCount === "number" ? rawCount : null,
      message: typeof body?.message === "string" ? body.message : typeof body?.error === "string" ? body.error : null,
    };
  } catch (e) {
    return { ok: false, testCount: null, message: e instanceof Error ? e.message : "Connection check failed." };
  }
}

/* ─────────────────────────── existing endpoints ─────────────────────────── */

export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface AssessmentLite {
  id: string;
  title: string;
  status: AssessmentStatus;
  requisitionId: string | null;
}

function toAssessmentLite(a: any): AssessmentLite {
  return {
    id: String(a?.id ?? ""),
    title: String(a?.title ?? "Untitled assessment"),
    status: (a?.status ?? "DRAFT") as AssessmentStatus,
    requisitionId: a?.requisitionId ?? null,
  };
}

// List assessments, optionally scoped to a requisition. Used to RESOLVE which
// assessment record a candidate's vendor invite hangs off (an external-vendor
// invite still needs an owning Assessment row, exactly as the existing invite
// route requires).
export async function listAssessmentsLite(requisitionId?: string | null): Promise<AssessmentLite[]> {
  const qs = requisitionId ? `?requisitionId=${encodeURIComponent(requisitionId)}` : "";
  const body = await call<any>("GET", `/assessments${qs}`);
  const rows = Array.isArray(body) ? body : body?.assessments ?? body?.rows ?? [];
  return rows.map(toAssessmentLite);
}

// Create a DRAFT assessment so a candidate can be invited when the tenant has no
// assessment yet for the role. Minimal existing path (same POST the OA list uses).
export async function createAssessmentShell(input: {
  title: string;
  requisitionId?: string | null;
}): Promise<AssessmentLite> {
  const body = await call<any>("POST", "/assessments", {
    title: input.title,
    ...(input.requisitionId ? { requisitionId: input.requisitionId } : {}),
  });
  return toAssessmentLite(body);
}

// An invite row as returned by POST /:id/invite (vendor mode) and the invites list.
export interface AssessmentInvite {
  id: string;
  assessmentId: string;
  candidateId: string;
  email: string;
  status: string; // PENDING -> SENT -> STARTED -> COMPLETED / EXPIRED
  provider?: string | null;
  sentAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  // Present ONLY on the native (non-vendor) create response; NEVER re-fetchable.
  rawTokenUrl?: string | null;
  // Vendor take link, when the vendor returned one synchronously (populated by
  // the invites list once the provider-invite worker has stored it).
  candidateTestUrl?: string | null;
}

function toInvite(raw: any): AssessmentInvite {
  return {
    id: String(raw?.id ?? ""),
    assessmentId: String(raw?.assessmentId ?? ""),
    candidateId: String(raw?.candidateId ?? ""),
    email: String(raw?.email ?? ""),
    status: String(raw?.status ?? "PENDING"),
    provider: raw?.provider ?? null,
    sentAt: raw?.sentAt ?? null,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    rawTokenUrl: typeof raw?.rawTokenUrl === "string" ? raw.rawTokenUrl : null,
    candidateTestUrl:
      typeof raw?.candidateTestUrl === "string"
        ? raw.candidateTestUrl
        : typeof raw?.providerTestUrl === "string"
          ? raw.providerTestUrl
          : null,
  };
}

// Issue a VENDOR invite through the EXISTING POST /:id/invite flow. `provider` +
// `providerTestId` route it to the provider-invite worker (async), which calls
// the real vendor and flips the row PENDING -> SENT. We never fabricate a vendor
// id; the returned row is PENDING until the worker confirms it.
export async function sendProviderInvite(input: {
  assessmentId: string;
  candidateId: string;
  email: string;
  provider: ProviderKind;
  providerTestId: string;
  applicationId?: string | null;
  candidateFirstName?: string;
  candidateLastName?: string;
}): Promise<AssessmentInvite> {
  const body = await call<any>("POST", `/assessments/${encodeURIComponent(input.assessmentId)}/invite`, {
    candidateId: input.candidateId,
    email: input.email,
    provider: input.provider,
    providerTestId: input.providerTestId,
    ...(input.applicationId ? { applicationId: input.applicationId } : {}),
    ...(input.candidateFirstName ? { candidateFirstName: input.candidateFirstName } : {}),
    ...(input.candidateLastName ? { candidateLastName: input.candidateLastName } : {}),
  });
  return toInvite(body);
}

// List invites for an assessment (used to show a candidate's live invite status
// + take link after sending, and to build the dashboard).
export async function listInvites(assessmentId: string): Promise<AssessmentInvite[]> {
  const body = await call<any>("GET", `/assessments/${encodeURIComponent(assessmentId)}/invites`);
  const rows = Array.isArray(body) ? body : body?.invites ?? body?.rows ?? [];
  return rows.map(toInvite);
}

/* ─────────────────────────── results ─────────────────────────── */

export interface VendorSection {
  name: string | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
}

export interface VendorSummary {
  provider: string | null;
  providerInvitationId: string | null;
  status: string | null;
  reportUrl: string | null;
  plagiarismFlag: boolean | null;
  sections?: VendorSection[];
}

export interface ResultRow {
  id: string;
  attemptId: string;
  candidateId: string;
  rawScore: number;
  maxScore: number;
  scorePercent: number | null;
  passed: boolean | null;
  pendingManualReview: boolean;
  gradedAt: string | null;
  attempt: {
    id: string;
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    durationSeconds: number | null;
    inviteId: string;
  } | null;
  vendor: VendorSummary | null;
}

export interface ResultsList {
  assessmentId: string;
  title: string;
  passingScore: number | null;
  total: number;
  results: ResultRow[];
}

// Fetch the graded results for one assessment (native + vendor summaries). The
// service returns [] until a REAL grade exists; the caller shows "awaiting
// result" for an invite that has no matching result row yet.
export async function getResults(assessmentId: string): Promise<ResultsList> {
  const body = await call<any>("GET", `/assessments/${encodeURIComponent(assessmentId)}/results`);
  const results = Array.isArray(body?.results) ? body.results : [];
  return {
    assessmentId: String(body?.assessmentId ?? assessmentId),
    title: String(body?.title ?? "Assessment"),
    passingScore: typeof body?.passingScore === "number" ? body.passingScore : null,
    total: typeof body?.total === "number" ? body.total : results.length,
    results,
  };
}
