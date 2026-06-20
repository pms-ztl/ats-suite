/**
 * Codility adapter — WF8 / SLICE H2.
 *
 * Real vendor shapes (Codility public API, https://app.codility.com/api):
 *  - Auth:   Bearer <apiToken> on every call (Authorization header).
 *  - Tests:  GET  {base}/api/tests/            → the account's test list.
 *  - Invite: POST {base}/api/tests/{id}/invite/
 *              body: { candidates:[{ email, first_name, last_name }],
 *                      send_emails:false,
 *                      event_callbacks:[{ url:webhookUrl, events:["session_close"] }],
 *                      external_id: correlationId }
 *            Codility returns the created session(s); we read the session id +
 *            candidate test URL. `send_emails:false` keeps comms in the ATS.
 *  - Result: GET {base}/api/sessions/{sessionId}/ → the session; complete only
 *            when `status` is closed/finished and a result/score is present.
 *  - Webhook: Codility POSTs to each event_callbacks.url on session_close. The
 *            body is signed with HMAC-SHA256 over the raw body in the
 *            `X-Codility-Signature` header keyed by the tenant's webhook secret.
 *
 * Base host: https://app.codility.com (overridable via creds.baseUrl).
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

const PROVIDER = "codility";
const DEFAULT_BASE = "https://app.codility.com";

function base(creds: ProviderCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function authHeaders(creds: ProviderCredentials): Record<string, string> {
  const token = creds.apiToken ?? creds.apiKey;
  if (!token) throw new Error("[codility] missing apiToken credential");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function mapStatus(raw: unknown): NormalizedResultStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("closed") || s.includes("finished") || s.includes("evaluated") || s.includes("complete")) return "COMPLETED";
  if (s.includes("open") || s.includes("progress") || s.includes("started")) return "STARTED";
  if (s.includes("expire") || s.includes("timeout")) return "EXPIRED";
  if (s.includes("cancel")) return "CANCELLED";
  return "PENDING";
}

/** Build a NormalizedResult from a Codility session object, or null if it is not
 *  a real completed/scored session. */
function normalizeSession(sessionId: string, session: AnyObj): NormalizedResult | null {
  const status = mapStatus(session["status"] ?? session["state"]);
  // Codility reports `result` as a percentage 0..100 of the evaluated tasks.
  const explicitPct = session["result"] ?? session["percentage"];
  const score = num(session["score"] ?? session["points"]);
  const maxScore = num(session["max_score"] ?? session["max_points"]);

  if (status !== "COMPLETED" && explicitPct === undefined && score === undefined) return null;

  const tasksRaw = Array.isArray(session["tasks"]) ? (session["tasks"] as unknown[]) : [];
  const sections = tasksRaw
    .map((t) => {
      const to = obj(t);
      const name = typeof to["name"] === "string" ? to["name"] : typeof to["id"] === "string" ? (to["id"] as string) : null;
      if (!name) return null;
      const tScore = num(to["result"] ?? to["score"]);
      return {
        name,
        ...(tScore !== undefined ? { percentage: derivePercentage(to["result"], undefined, undefined) ?? tScore } : {}),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const pct = derivePercentage(explicitPct, score, maxScore);
  const passed = typeof session["passed"] === "boolean" ? (session["passed"] as boolean) : undefined;
  const plagiarism =
    typeof session["plagiarism"] === "boolean"
      ? (session["plagiarism"] as boolean)
      : typeof session["similarity_flagged"] === "boolean"
        ? (session["similarity_flagged"] as boolean)
        : undefined;
  const reportUrl =
    typeof session["report_url"] === "string"
      ? (session["report_url"] as string)
      : typeof session["url"] === "string"
        ? (session["url"] as string)
        : undefined;
  const startedAt = dt(session["start_date"] ?? session["started_at"]);
  const completedAt = dt(session["close_date"] ?? session["finished_at"] ?? session["submit_date"]);

  return {
    providerInvitationId: sessionId,
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
    raw: session,
  };
}

export const codilityProvider: AssessmentProvider = {
  id: PROVIDER,

  async listTests(creds: ProviderCredentials): Promise<ProviderTest[]> {
    const url = `${base(creds)}/api/tests/`;
    const body = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds) });
    const list = Array.isArray(body?.["results"])
      ? (body!["results"] as unknown[])
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
          name: typeof to["name"] === "string" ? to["name"] : String(id),
          category: typeof to["type"] === "string" ? to["type"] : null,
          durationMinutes: num(to["time_limit"] ?? to["duration"]) ?? null,
          raw: t,
        };
      })
      .filter((t): t is ProviderTest => t !== null);
  },

  async invite(req: InviteRequest, creds: ProviderCredentials): Promise<InviteResponse> {
    const url = `${base(creds)}/api/tests/${encodeURIComponent(req.testId)}/invite/`;
    const payload: AnyObj = {
      candidates: [
        {
          email: req.candidateEmail,
          ...(req.candidateFirstName ? { first_name: req.candidateFirstName } : {}),
          ...(req.candidateLastName ? { last_name: req.candidateLastName } : {}),
        },
      ],
      // HARD RULE: vendor must NOT email the candidate.
      send_emails: false,
      ...(req.correlationId ? { external_id: req.correlationId } : {}),
      ...(req.webhookUrl
        ? { event_callbacks: [{ url: req.webhookUrl, events: ["session_close", "session_finished"] }] }
        : {}),
      ...(req.expiresAt ? { expiry_date: req.expiresAt.toISOString() } : {}),
    };
    const resp = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: authHeaders(creds),
      body: JSON.stringify(payload),
    });
    const root = obj(resp);
    const first = Array.isArray(root["sessions"])
      ? obj((root["sessions"] as unknown[])[0])
      : Array.isArray(root["candidates"])
        ? obj((root["candidates"] as unknown[])[0])
        : root;
    const providerInvitationId = String(
      first["session_id"] ?? first["id"] ?? first["public_id"] ?? root["session_id"] ?? "",
    );
    if (!providerInvitationId) {
      throw new Error("[codility] invite response missing session id");
    }
    const candidateTestUrl =
      typeof first["url"] === "string"
        ? (first["url"] as string)
        : typeof first["test_url"] === "string"
          ? (first["test_url"] as string)
          : typeof first["candidate_url"] === "string"
            ? (first["candidate_url"] as string)
            : null;
    return { providerInvitationId, candidateTestUrl, status: "SENT", raw: resp };
  },

  async fetchResult(providerInvitationId: string, creds: ProviderCredentials): Promise<NormalizedResult | null> {
    const url = `${base(creds)}/api/sessions/${encodeURIComponent(providerInvitationId)}/`;
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds) });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
    if (!resp) return null;
    const session = obj(resp["session"] ?? resp);
    return normalizeSession(providerInvitationId, session);
  },

  verifyWebhook(headers, rawBody, secret): boolean {
    if (!secret) return false;
    const sig = header(headers, "x-codility-signature") ?? header(headers, "x-signature");
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
    const session = obj(payload["session"] ?? payload["data"] ?? payload);
    const sessionId = String(session["session_id"] ?? session["id"] ?? payload["session_id"] ?? "");
    if (!sessionId) return null;
    return normalizeSession(sessionId, session);
  },
};

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

export default codilityProvider;
