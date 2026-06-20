/**
 * HackerEarth (FaceCode / Assessments) adapter — WF8 / SLICE H2.
 *
 * Real vendor shapes (HackerEarth Partner / Assessment API):
 *  - Auth:   client_id + client_secret on each call (sent in the JSON body for
 *            the invite endpoint, per the Partner API).
 *  - Invite: POST {base}/partner/hackerearth/invite/
 *              body: { client_id, client_secret, test_id, emails:[email],
 *                      send_email:false, report_callback_urls:[webhookUrl] }
 *            HackerEarth returns the invite/registration record(s); we read the
 *            per-candidate invitation id + the test link. `send_email:false` keeps
 *            the ATS in control of candidate comms (HARD RULE).
 *  - Result: POST {base}/partner/hackerearth/report/ with { client_id,
 *            client_secret, invitation_id } → the test report when complete; we
 *            return null while it is still in progress (NEVER a fabricated score).
 *  - Webhook: HackerEarth POSTs the report to each report_callback_url on
 *            completion. Signature is an HMAC-SHA256 of the raw body in the
 *            `X-HackerEarth-Signature` header keyed by the tenant's webhook secret.
 *
 * Base host: https://api.hackerearth.com (overridable via creds.baseUrl).
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

const PROVIDER = "hackerearth";
const DEFAULT_BASE = "https://api.hackerearth.com";

function base(creds: ProviderCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function requireCreds(creds: ProviderCredentials): { clientId: string; clientSecret: string } {
  const clientId = creds.clientId ?? creds.apiKey;
  const clientSecret = creds.clientSecret;
  if (!clientId || !clientSecret) {
    throw new Error("[hackerearth] missing clientId/clientSecret credentials");
  }
  return { clientId, clientSecret };
}

function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", Accept: "application/json" };
}

/** Map a HackerEarth status string to our normalized result status. */
function mapStatus(raw: unknown): NormalizedResultStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("complete") || s.includes("finish") || s.includes("evaluated") || s.includes("submitted")) return "COMPLETED";
  if (s.includes("progress") || s.includes("start") || s.includes("attempt")) return "STARTED";
  if (s.includes("expire")) return "EXPIRED";
  if (s.includes("cancel") || s.includes("revoke")) return "CANCELLED";
  return "PENDING";
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

/** Build a NormalizedResult from a HackerEarth report object, or null if the
 *  report is not a real completed result (no score / not finished). */
function normalizeReport(invitationId: string, report: AnyObj): NormalizedResult | null {
  const status = mapStatus(report["status"] ?? report["state"]);
  const score = num(report["score"] ?? report["total_score"] ?? report["obtained_score"]);
  const maxScore = num(report["max_score"] ?? report["total_max_score"] ?? report["maximum_score"]);
  const explicitPct = report["percentage"] ?? report["percent"] ?? report["score_percentage"];

  // Honest empty: a report with no real score AND not marked complete is "no
  // result yet" — never fabricate one.
  if (status !== "COMPLETED" && score === undefined) return null;

  const sectionsRaw = Array.isArray(report["sections"]) ? (report["sections"] as unknown[]) : [];
  const sections = sectionsRaw
    .map((s) => {
      const so = obj(s);
      const name = typeof so["name"] === "string" ? so["name"] : typeof so["title"] === "string" ? (so["title"] as string) : null;
      if (!name) return null;
      const sScore = num(so["score"]);
      const sMax = num(so["max_score"] ?? so["maximum_score"]);
      return {
        name,
        ...(sScore !== undefined ? { score: sScore } : {}),
        ...(sMax !== undefined ? { maxScore: sMax } : {}),
        ...(derivePercentage(so["percentage"], sScore, sMax) !== undefined
          ? { percentage: derivePercentage(so["percentage"], sScore, sMax)! }
          : {}),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const pct = derivePercentage(explicitPct, score, maxScore);
  const passed = typeof report["passed"] === "boolean" ? (report["passed"] as boolean) : undefined;
  const plagiarism =
    typeof report["plagiarism_flagged"] === "boolean"
      ? (report["plagiarism_flagged"] as boolean)
      : typeof report["plagiarism"] === "boolean"
        ? (report["plagiarism"] as boolean)
        : undefined;
  const reportUrl = typeof report["report_url"] === "string" ? (report["report_url"] as string) : undefined;
  const startedAt = dt(report["started_at"] ?? report["start_time"]);
  const completedAt = dt(report["completed_at"] ?? report["end_time"] ?? report["finished_at"]);

  return {
    providerInvitationId: invitationId,
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
    raw: report,
  };
}

export const hackerEarthProvider: AssessmentProvider = {
  id: PROVIDER,

  async listTests(creds: ProviderCredentials): Promise<ProviderTest[]> {
    const { clientId, clientSecret } = requireCreds(creds);
    const url = `${base(creds)}/partner/hackerearth/tests/`;
    const body = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: jsonHeaders(),
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
    });
    const list = Array.isArray(body?.["tests"]) ? (body!["tests"] as unknown[]) : Array.isArray(body) ? (body as unknown[]) : [];
    return list
      .map((t): ProviderTest | null => {
        const to = obj(t);
        const id = to["test_id"] ?? to["id"];
        if (id == null) return null;
        return {
          id: String(id),
          name: typeof to["name"] === "string" ? to["name"] : typeof to["title"] === "string" ? (to["title"] as string) : String(id),
          category: typeof to["category"] === "string" ? to["category"] : null,
          durationMinutes: num(to["duration"] ?? to["duration_minutes"]) ?? null,
          raw: t,
        };
      })
      .filter((t): t is ProviderTest => t !== null);
  },

  async invite(req: InviteRequest, creds: ProviderCredentials): Promise<InviteResponse> {
    const { clientId, clientSecret } = requireCreds(creds);
    const url = `${base(creds)}/partner/hackerearth/invite/`;
    const payload: AnyObj = {
      client_id: clientId,
      client_secret: clientSecret,
      test_id: req.testId,
      emails: [req.candidateEmail],
      // HARD RULE: vendor must NOT email the candidate (ATS owns comms).
      send_email: false,
      ...(req.correlationId ? { tag: req.correlationId, external_id: req.correlationId } : {}),
      ...(req.webhookUrl ? { report_callback_urls: [req.webhookUrl] } : {}),
      ...(req.expiresAt ? { expiry: req.expiresAt.toISOString() } : {}),
    };
    const resp = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    const root = obj(resp);
    // HackerEarth returns either a single invite or an `invites`/`data` array.
    const first = Array.isArray(root["invites"])
      ? obj((root["invites"] as unknown[])[0])
      : Array.isArray(root["data"])
        ? obj((root["data"] as unknown[])[0])
        : root;
    const providerInvitationId = String(
      first["invitation_id"] ?? first["id"] ?? root["invitation_id"] ?? root["id"] ?? "",
    );
    if (!providerInvitationId) {
      throw new Error("[hackerearth] invite response missing invitation_id");
    }
    const candidateTestUrl =
      typeof first["test_link"] === "string"
        ? (first["test_link"] as string)
        : typeof first["url"] === "string"
          ? (first["url"] as string)
          : typeof root["test_link"] === "string"
            ? (root["test_link"] as string)
            : null;
    return {
      providerInvitationId,
      candidateTestUrl,
      status: "SENT",
      raw: resp,
    };
  },

  async fetchResult(providerInvitationId: string, creds: ProviderCredentials): Promise<NormalizedResult | null> {
    const { clientId, clientSecret } = requireCreds(creds);
    const url = `${base(creds)}/partner/hackerearth/report/`;
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(url, {
        method: "POST",
        provider: PROVIDER,
        headers: jsonHeaders(),
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, invitation_id: providerInvitationId }),
      });
    } catch (err) {
      // A 404 means "no report yet" for this vendor — honest null, not an error.
      if (isNotFound(err)) return null;
      throw err;
    }
    if (!resp) return null;
    const report = obj(resp["report"] ?? resp["data"] ?? resp);
    return normalizeReport(providerInvitationId, report);
  },

  verifyWebhook(headers, rawBody, secret): boolean {
    if (!secret) return false;
    const sig = header(headers, "x-hackerearth-signature") ?? header(headers, "x-signature");
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
    const invitationId = String(payload["invitation_id"] ?? payload["id"] ?? "");
    if (!invitationId) return null;
    const report = obj(payload["report"] ?? payload["data"] ?? payload);
    return normalizeReport(invitationId, report);
  },
};

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

export default hackerEarthProvider;
