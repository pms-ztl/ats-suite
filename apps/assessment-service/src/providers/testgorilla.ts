/**
 * TestGorilla adapter — WF8 / SLICE H2.
 *
 * Real vendor shapes (TestGorilla Public API, https://www.testgorilla.com):
 *  - Auth:   Authorization: Token <apiToken> header on every call.
 *  - Tests:  GET  {base}/assessments/ → the account's assessments (paginated,
 *            `results[]`).
 *  - Invite: POST {base}/assessments/{id}/invite_candidate/
 *              body: { email, first_name, last_name, no_email:true,
 *                      webhook_url:webhookUrl, external_id:correlationId }
 *            TestGorilla returns the created candidate/invitation; we read the
 *            candidate id + the assessment URL. `no_email:true` keeps the ATS in
 *            control of candidate comms (HARD RULE).
 *  - Result: GET {base}/candidates/{candidateId}/ → the candidate; complete only
 *            when `status` is finished/completed and a score is present (else null
 *            — never fabricated).
 *  - Webhook: TestGorilla POSTs to webhook_url on completion, signing the raw body
 *            HMAC-SHA256 in the `X-TestGorilla-Signature` header keyed by the
 *            tenant's webhook secret.
 *
 * Base host: https://api.testgorilla.com (overridable via creds.baseUrl).
 */
import { createHmac } from "node:crypto";
import type {
  AssessmentProvider,
  InviteRequest,
  InviteResponse,
  NormalizedResult,
  NormalizedResultStatus,
  ProviderCredentials,
  ProviderTest,
} from "./types.js";
import { fetchJson, derivePercentage, num, dt, header, timingSafeEqualStr } from "./http.js";

const PROVIDER = "testgorilla";
const DEFAULT_BASE = "https://api.testgorilla.com";

function base(creds: ProviderCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function authHeaders(creds: ProviderCredentials): Record<string, string> {
  const token = creds.apiToken ?? creds.apiKey;
  if (!token) throw new Error("[testgorilla] missing apiToken credential");
  return {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function mapStatus(raw: unknown): NormalizedResultStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("complete") || s.includes("finish") || s.includes("evaluated") || s.includes("done")) return "COMPLETED";
  if (s.includes("progress") || s.includes("start") || s.includes("invited_started")) return "STARTED";
  if (s.includes("expire")) return "EXPIRED";
  if (s.includes("cancel") || s.includes("disqualif")) return "CANCELLED";
  return "PENDING";
}

/** Build a NormalizedResult from a TestGorilla candidate object, or null if it is
 *  not a real completed/scored candidate. */
function normalizeCandidate(candidateId: string, candidate: AnyObj): NormalizedResult | null {
  const status = mapStatus(candidate["status"] ?? candidate["state"]);
  // TestGorilla reports an overall percentage as `average_score` (0..100).
  const explicitPct = candidate["average_score"] ?? candidate["overall_score"] ?? candidate["percentage"];
  const score = num(candidate["score"] ?? candidate["points"]);
  const maxScore = num(candidate["max_score"] ?? candidate["max_points"]);

  if (status !== "COMPLETED" && explicitPct === undefined && score === undefined) return null;

  const testsRaw = Array.isArray(candidate["tests"])
    ? (candidate["tests"] as unknown[])
    : Array.isArray(candidate["test_scores"])
      ? (candidate["test_scores"] as unknown[])
      : [];
  const sections = testsRaw
    .map((t) => {
      const to = obj(t);
      const name =
        typeof to["name"] === "string"
          ? to["name"]
          : typeof to["test_name"] === "string"
            ? (to["test_name"] as string)
            : null;
      if (!name) return null;
      const pct = num(to["score"] ?? to["percentage"] ?? to["average_score"]);
      return {
        name,
        ...(pct !== undefined ? { percentage: pct } : {}),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const pct = derivePercentage(explicitPct, score, maxScore);
  const passed = typeof candidate["passed"] === "boolean" ? (candidate["passed"] as boolean) : undefined;
  const plagiarism =
    typeof candidate["plagiarism"] === "boolean"
      ? (candidate["plagiarism"] as boolean)
      : typeof candidate["is_flagged"] === "boolean"
        ? (candidate["is_flagged"] as boolean)
        : undefined;
  const reportUrl =
    typeof candidate["report_url"] === "string"
      ? (candidate["report_url"] as string)
      : typeof candidate["public_report_url"] === "string"
        ? (candidate["public_report_url"] as string)
        : undefined;
  const startedAt = dt(candidate["started_at"] ?? candidate["start_date"]);
  const completedAt = dt(candidate["completed_at"] ?? candidate["finished_at"] ?? candidate["end_date"]);

  return {
    providerInvitationId: candidateId,
    provider: PROVIDER,
    status,
    ...(score !== undefined ? { score } : {}),
    ...(maxScore !== undefined ? { maxScore } : {}),
    ...(pct !== undefined ? { percentage: pct } : {}),
    ...(passed !== undefined ? { passed } : {}),
    ...(plagiarism !== undefined ? { plagiarismFlag: plagiarism } : {}),
    ...(reportUrl ? { reportUrl } : {}),
    ...(sections.length ? { sections } : {}),
    ...(startedAt ? { startedAt } : {}),
    ...(completedAt ? { completedAt } : {}),
    raw: candidate,
  };
}

export const testGorillaProvider: AssessmentProvider = {
  id: PROVIDER,

  async listTests(creds: ProviderCredentials): Promise<ProviderTest[]> {
    const url = `${base(creds)}/assessments/`;
    const body = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds) });
    const list = Array.isArray(body?.["results"])
      ? (body!["results"] as unknown[])
      : Array.isArray(body?.["assessments"])
        ? (body!["assessments"] as unknown[])
        : Array.isArray(body)
          ? (body as unknown[])
          : [];
    return list
      .map((t): ProviderTest | null => {
        const to = obj(t);
        const id = to["id"] ?? to["assessment_id"];
        if (id == null) return null;
        return {
          id: String(id),
          name: typeof to["name"] === "string" ? to["name"] : typeof to["title"] === "string" ? (to["title"] as string) : String(id),
          category: typeof to["job_role"] === "string" ? to["job_role"] : null,
          durationMinutes: num(to["duration"] ?? to["time_limit"]) ?? null,
          raw: t,
        };
      })
      .filter((t): t is ProviderTest => t !== null);
  },

  async invite(req: InviteRequest, creds: ProviderCredentials): Promise<InviteResponse> {
    const url = `${base(creds)}/assessments/${encodeURIComponent(req.testId)}/invite_candidate/`;
    const payload: AnyObj = {
      email: req.candidateEmail,
      ...(req.candidateFirstName ? { first_name: req.candidateFirstName } : {}),
      ...(req.candidateLastName ? { last_name: req.candidateLastName } : {}),
      // HARD RULE: vendor must NOT email the candidate.
      no_email: true,
      ...(req.correlationId ? { external_id: req.correlationId } : {}),
      ...(req.webhookUrl ? { webhook_url: req.webhookUrl } : {}),
    };
    const resp = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: authHeaders(creds),
      body: JSON.stringify(payload),
    });
    const root = obj(resp);
    const first = Array.isArray(root["candidates"]) ? obj((root["candidates"] as unknown[])[0]) : root;
    const providerInvitationId = String(
      first["candidate_id"] ?? first["id"] ?? first["invitation_id"] ?? root["candidate_id"] ?? "",
    );
    if (!providerInvitationId) {
      throw new Error("[testgorilla] invite response missing candidate id");
    }
    const candidateTestUrl =
      typeof first["assessment_url"] === "string"
        ? (first["assessment_url"] as string)
        : typeof first["test_url"] === "string"
          ? (first["test_url"] as string)
          : typeof first["url"] === "string"
            ? (first["url"] as string)
            : null;
    return { providerInvitationId, candidateTestUrl, status: "SENT", raw: resp };
  },

  async fetchResult(providerInvitationId: string, creds: ProviderCredentials): Promise<NormalizedResult | null> {
    const url = `${base(creds)}/candidates/${encodeURIComponent(providerInvitationId)}/`;
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds) });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
    if (!resp) return null;
    const candidate = obj(resp["candidate"] ?? resp);
    return normalizeCandidate(providerInvitationId, candidate);
  },

  verifyWebhook(headers, rawBody, secret): boolean {
    if (!secret) return false;
    const sig = header(headers, "x-testgorilla-signature") ?? header(headers, "x-signature");
    if (!sig) return false;
    const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
    const provided = sig.replace(/^sha256=/i, "").trim();
    return timingSafeEqualStr(expected, provided);
  },

  parseWebhook(rawBody: string): NormalizedResult | null {
    let payload: AnyObj;
    try {
      payload = obj(JSON.parse(rawBody));
    } catch {
      return null;
    }
    const candidate = obj(payload["candidate"] ?? payload["data"] ?? payload);
    const candidateId = String(
      candidate["candidate_id"] ?? candidate["id"] ?? payload["candidate_id"] ?? payload["external_id"] ?? "",
    );
    if (!candidateId) return null;
    return normalizeCandidate(candidateId, candidate);
  },
};

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

export default testGorillaProvider;
