/**
 * HackerRank (for Work) adapter — WF8 / SLICE H2.
 *
 * Real vendor shapes (HackerRank for Work REST API v3, https://www.hackerrank.com/work):
 *  - Auth:   Bearer <apiKey> (the v3 personal access token). Some older accounts
 *            use HTTP Basic with the key as the username; we send Bearer and fall
 *            back to nothing else (the key form is configured per tenant).
 *  - Tests:  GET  {base}/x/api/v3/tests → the account's tests (paginated `data[]`).
 *  - Invite: POST {base}/x/api/v3/tests/{testId}/candidates/
 *              body: { full_name, email, send_email:false, tag:[correlationId] }
 *            HackerRank returns the created candidate record; we read the
 *            candidate id + the test login url. `send_email:false` keeps the ATS
 *            in control of candidate comms (HARD RULE).
 *  - Result: GET {base}/x/api/v3/tests/{testId}/candidates/{id} → the candidate
 *            with `attempt_endtime` + `score`/`percentage_score` once finished.
 *            HackerRank gives the testId+candidate id as a compound key; we encode
 *            it into providerInvitationId as "{testId}:{candidateId}" so a single
 *            opaque id round-trips through fetchResult/polling.
 *
 *  ── NO per-invite webhook ────────────────────────────────────────────────────
 *  HackerRank for Work does NOT POST a per-invite completion callback. Results are
 *  retrieved by POLLING fetchResult ONLY. Accordingly verifyWebhook() returns
 *  false and parseWebhook() returns null — there is no inbound-webhook path for
 *  this vendor, and the polling reaper is the sole result source.
 *
 *  ── Rate limit ───────────────────────────────────────────────────────────────
 *  HackerRank caps the API at ~10 requests/second and returns HTTP 429 with a
 *  Retry-After when exceeded. Every call goes through fetchJson with a 100ms
 *  process-local spacing guard (rateKey "hackerrank", minIntervalMs 100) plus the
 *  shared Retry-After-honoring 429 backoff.
 *
 * Base host: https://www.hackerrank.com (overridable via creds.baseUrl).
 */
import type {
  AssessmentProvider,
  InviteRequest,
  InviteResponse,
  NormalizedResult,
  NormalizedResultStatus,
  ProviderCredentials,
  ProviderTest,
} from "./types.js";
import { fetchJson, derivePercentage, num, dt } from "./http.js";

const PROVIDER = "hackerrank";
const DEFAULT_BASE = "https://www.hackerrank.com";
// HackerRank caps at ~10 rps; space process-local calls ≥100ms apart.
const RATE_KEY = "hackerrank";
const MIN_INTERVAL_MS = 100;

function base(creds: ProviderCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function authHeaders(creds: ProviderCredentials): Record<string, string> {
  const key = creds.apiKey ?? creds.apiToken;
  if (!key) throw new Error("[hackerrank] missing apiKey credential");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function rate(): { rateKey: string; minIntervalMs: number } {
  return { rateKey: RATE_KEY, minIntervalMs: MIN_INTERVAL_MS };
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

/** Compose / decompose the compound {testId}:{candidateId} correlation id. */
function composeId(testId: string, candidateId: string): string {
  return `${testId}:${candidateId}`;
}
function decomposeId(providerInvitationId: string): { testId: string; candidateId: string } | null {
  const idx = providerInvitationId.indexOf(":");
  if (idx <= 0 || idx >= providerInvitationId.length - 1) return null;
  return {
    testId: providerInvitationId.slice(0, idx),
    candidateId: providerInvitationId.slice(idx + 1),
  };
}

function mapStatus(candidate: AnyObj): NormalizedResultStatus {
  // HackerRank marks completion by a non-null attempt_endtime; `status` strings
  // vary ("invited", "in_progress", "completed").
  const endtime = candidate["attempt_endtime"] ?? candidate["completed_at"];
  const s = String(candidate["status"] ?? candidate["plagiarism_status"] ?? "").toLowerCase();
  if (endtime || s.includes("complete") || s.includes("finish") || s.includes("evaluated")) return "COMPLETED";
  if (s.includes("progress") || s.includes("start") || candidate["attempt_starttime"]) return "STARTED";
  if (s.includes("expire")) return "EXPIRED";
  if (s.includes("cancel") || s.includes("disqualif")) return "CANCELLED";
  return "PENDING";
}

/** Build a NormalizedResult from a HackerRank candidate object, or null if it is
 *  not a real completed/scored candidate (still PENDING/STARTED → null). */
function normalizeCandidate(providerInvitationId: string, candidate: AnyObj): NormalizedResult | null {
  const status = mapStatus(candidate);
  const score = num(candidate["score"] ?? candidate["total_score"]);
  const maxScore = num(candidate["max_score"] ?? candidate["full_score"]);
  const explicitPct = candidate["percentage_score"] ?? candidate["percentage"];

  // Poll discipline: only a genuinely completed candidate yields a result. While
  // PENDING/STARTED we return null so the reaper keeps polling (NEVER a fake 0).
  if (status !== "COMPLETED") return null;
  if (score === undefined && explicitPct === undefined) return null;

  const scoresRaw = obj(candidate["questions"] ?? candidate["score_breakdown"]);
  const sections = Object.entries(scoresRaw)
    .map(([name, v]) => {
      const sScore = num(v);
      if (sScore === undefined) return null;
      return { name, score: sScore };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const pct = derivePercentage(explicitPct, score, maxScore);
  const plagiarism =
    typeof candidate["plagiarism"] === "boolean"
      ? (candidate["plagiarism"] as boolean)
      : typeof candidate["plagiarism_status"] === "string"
        ? candidate["plagiarism_status"].toLowerCase().includes("suspect") ||
          candidate["plagiarism_status"].toLowerCase().includes("flag")
        : undefined;
  const reportUrl =
    typeof candidate["report_url"] === "string"
      ? (candidate["report_url"] as string)
      : typeof candidate["pdf"] === "string"
        ? (candidate["pdf"] as string)
        : undefined;
  const startedAt = dt(candidate["attempt_starttime"] ?? candidate["started_at"]);
  const completedAt = dt(candidate["attempt_endtime"] ?? candidate["completed_at"]);

  return {
    providerInvitationId,
    provider: PROVIDER,
    status,
    ...(score !== undefined ? { score } : {}),
    ...(maxScore !== undefined ? { maxScore } : {}),
    ...(pct !== undefined ? { percentage: pct } : {}),
    ...(plagiarism !== undefined ? { plagiarismFlag: plagiarism } : {}),
    ...(reportUrl ? { reportUrl } : {}),
    ...(sections.length ? { sections } : {}),
    ...(startedAt ? { startedAt } : {}),
    ...(completedAt ? { completedAt } : {}),
    raw: candidate,
  };
}

export const hackerRankProvider: AssessmentProvider = {
  id: PROVIDER,

  async listTests(creds: ProviderCredentials): Promise<ProviderTest[]> {
    const url = `${base(creds)}/x/api/v3/tests?limit=100`;
    const body = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds), ...rate() });
    const list = Array.isArray(body?.["data"])
      ? (body!["data"] as unknown[])
      : Array.isArray(body?.["tests"])
        ? (body!["tests"] as unknown[])
        : Array.isArray(body)
          ? (body as unknown[])
          : [];
    return list
      .map((t): ProviderTest | null => {
        const to = obj(t);
        const id = to["id"] ?? to["test_id"];
        if (id == null) return null;
        return {
          id: String(id),
          name: typeof to["name"] === "string" ? to["name"] : typeof to["unique_id"] === "string" ? (to["unique_id"] as string) : String(id),
          category: typeof to["role"] === "string" ? to["role"] : null,
          durationMinutes: num(to["duration"]) ?? null,
          raw: t,
        };
      })
      .filter((t): t is ProviderTest => t !== null);
  },

  async invite(req: InviteRequest, creds: ProviderCredentials): Promise<InviteResponse> {
    const url = `${base(creds)}/x/api/v3/tests/${encodeURIComponent(req.testId)}/candidates/`;
    const fullName = [req.candidateFirstName, req.candidateLastName].filter(Boolean).join(" ").trim();
    const payload: AnyObj = {
      email: req.candidateEmail,
      ...(fullName ? { full_name: fullName } : {}),
      // HARD RULE: vendor must NOT email the candidate.
      send_email: false,
      ...(req.correlationId ? { tag: [req.correlationId] } : {}),
    };
    const resp = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: authHeaders(creds),
      body: JSON.stringify(payload),
      ...rate(),
    });
    const root = obj(resp);
    const candidate = obj(root["data"] ?? root["candidate"] ?? root);
    const candidateId = String(candidate["id"] ?? candidate["candidate_id"] ?? root["id"] ?? "");
    if (!candidateId) {
      throw new Error("[hackerrank] invite response missing candidate id");
    }
    // Compound key so a single opaque providerInvitationId round-trips polling.
    const providerInvitationId = composeId(req.testId, candidateId);
    const candidateTestUrl =
      typeof candidate["test_link"] === "string"
        ? (candidate["test_link"] as string)
        : typeof candidate["login_url"] === "string"
          ? (candidate["login_url"] as string)
          : typeof candidate["url"] === "string"
            ? (candidate["url"] as string)
            : null;
    return { providerInvitationId, candidateTestUrl, status: "SENT", raw: resp };
  },

  async fetchResult(providerInvitationId: string, creds: ProviderCredentials): Promise<NormalizedResult | null> {
    const parts = decomposeId(providerInvitationId);
    if (!parts) return null; // malformed id → nothing to poll (honest null)
    const url = `${base(creds)}/x/api/v3/tests/${encodeURIComponent(parts.testId)}/candidates/${encodeURIComponent(parts.candidateId)}`;
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds), ...rate() });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
    if (!resp) return null;
    const candidate = obj(resp["data"] ?? resp["candidate"] ?? resp);
    return normalizeCandidate(providerInvitationId, candidate);
  },

  // HackerRank has NO per-invite webhook — there is no inbound callback to verify.
  // A configured caller must never treat an unsigned/foreign POST as authentic, so
  // this always returns false; results come solely from fetchResult() polling.
  verifyWebhook(): boolean {
    return false;
  },

  // No webhook path for HackerRank — nothing to parse. Always null (polling-only).
  parseWebhook(): NormalizedResult | null {
    return null;
  },
};

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

export default hackerRankProvider;
