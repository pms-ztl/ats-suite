/**
 * iMocha adapter — WF8 / SLICE H2.
 *
 * Real vendor shapes (iMocha REST API v3, https://apidoc.imocha.io):
 *  - Auth:   x-api-key: <apiKey> header on every call.
 *  - Tests:  GET  {base}/v3/tests?State=Active → the account's tests
 *            (PagedTests with `result.tests[]`).
 *  - Invite: POST {base}/v3/tests/{testId}/invite
 *              body: { Email, Name, SendEmail:false, CallbackUrl:webhookUrl,
 *                      RedirectUrl, InvitationId? } → returns the test invitation
 *            url + invitation id. iMocha calls its no-email flag `SendEmail`;
 *            forced false so the ATS owns candidate comms (HARD RULE).
 *  - Result: GET {base}/v3/reports/testattempts/{testInvitationId} → the attempt
 *            report; complete only when `Status` indicates the test is finished
 *            and a score is present (else null — never fabricated).
 *  - Webhook: iMocha POSTs the report to CallbackUrl on completion. The body is
 *            signed HMAC-SHA256 over the raw body in the `x-imocha-signature`
 *            header keyed by the tenant's webhook secret.
 *
 * Base host: https://apiv3.imocha.io (overridable via creds.baseUrl / region).
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

const PROVIDER = "imocha";
const DEFAULT_BASE = "https://apiv3.imocha.io";

function base(creds: ProviderCredentials): string {
  return (creds.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, "");
}

function authHeaders(creds: ProviderCredentials): Record<string, string> {
  const apiKey = creds.apiKey ?? creds.apiToken;
  if (!apiKey) throw new Error("[imocha] missing apiKey credential");
  return {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

type AnyObj = Record<string, unknown>;
const obj = (v: unknown): AnyObj => (v && typeof v === "object" && !Array.isArray(v) ? (v as AnyObj) : {});

function mapStatus(raw: unknown): NormalizedResultStatus {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("complete") || s.includes("finish") || s.includes("evaluated") || s === "1" || s.includes("submitted")) return "COMPLETED";
  if (s.includes("progress") || s.includes("start") || s.includes("attempt")) return "STARTED";
  if (s.includes("expire")) return "EXPIRED";
  if (s.includes("cancel") || s.includes("disqualif")) return "CANCELLED";
  return "PENDING";
}

/** Build a NormalizedResult from an iMocha attempt report, or null if it is not a
 *  real completed/scored attempt. */
function normalizeReport(invitationId: string, report: AnyObj): NormalizedResult | null {
  const status = mapStatus(report["Status"] ?? report["status"] ?? report["TestStatus"]);
  const score = num(report["Score"] ?? report["score"] ?? report["TotalScore"]);
  const maxScore = num(report["MaxScore"] ?? report["TotalMarks"] ?? report["maxScore"]);
  const explicitPct = report["PercentageScore"] ?? report["Percentage"] ?? report["percentage"];

  if (status !== "COMPLETED" && score === undefined) return null;

  const sectionsRaw = Array.isArray(report["Sections"])
    ? (report["Sections"] as unknown[])
    : Array.isArray(report["sections"])
      ? (report["sections"] as unknown[])
      : [];
  const sections = sectionsRaw
    .map((s) => {
      const so = obj(s);
      const name = typeof so["Name"] === "string" ? so["Name"] : typeof so["name"] === "string" ? (so["name"] as string) : null;
      if (!name) return null;
      const sScore = num(so["Score"] ?? so["score"]);
      const sMax = num(so["MaxScore"] ?? so["maxScore"]);
      return {
        name,
        ...(sScore !== undefined ? { score: sScore } : {}),
        ...(sMax !== undefined ? { maxScore: sMax } : {}),
        ...(derivePercentage(so["Percentage"], sScore, sMax) !== undefined
          ? { percentage: derivePercentage(so["Percentage"], sScore, sMax)! }
          : {}),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const pct = derivePercentage(explicitPct, score, maxScore);
  const passed =
    typeof report["IsPassed"] === "boolean"
      ? (report["IsPassed"] as boolean)
      : typeof report["passed"] === "boolean"
        ? (report["passed"] as boolean)
        : undefined;
  const plagiarism =
    typeof report["IsPlagiarized"] === "boolean"
      ? (report["IsPlagiarized"] as boolean)
      : typeof report["PlagiarismFlag"] === "boolean"
        ? (report["PlagiarismFlag"] as boolean)
        : undefined;
  const reportUrl =
    typeof report["ReportUrl"] === "string"
      ? (report["ReportUrl"] as string)
      : typeof report["PdfReportUrl"] === "string"
        ? (report["PdfReportUrl"] as string)
        : undefined;
  const startedAt = dt(report["TestStartDateTime"] ?? report["StartedOn"] ?? report["startedAt"]);
  const completedAt = dt(report["TestEndDateTime"] ?? report["CompletedOn"] ?? report["completedAt"]);

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

export const iMochaProvider: AssessmentProvider = {
  id: PROVIDER,

  async listTests(creds: ProviderCredentials): Promise<ProviderTest[]> {
    const url = `${base(creds)}/v3/tests?State=Active`;
    const body = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds) });
    const result = obj(body?.["result"] ?? body);
    const list = Array.isArray(result["tests"])
      ? (result["tests"] as unknown[])
      : Array.isArray(body?.["tests"])
        ? (body!["tests"] as unknown[])
        : Array.isArray(body)
          ? (body as unknown[])
          : [];
    return list
      .map((t): ProviderTest | null => {
        const to = obj(t);
        const id = to["testId"] ?? to["TestId"] ?? to["id"];
        if (id == null) return null;
        return {
          id: String(id),
          name:
            typeof to["testName"] === "string"
              ? to["testName"]
              : typeof to["TestName"] === "string"
                ? (to["TestName"] as string)
                : String(id),
          category: typeof to["testType"] === "string" ? to["testType"] : null,
          durationMinutes: num(to["testDuration"] ?? to["Duration"]) ?? null,
          raw: t,
        };
      })
      .filter((t): t is ProviderTest => t !== null);
  },

  async invite(req: InviteRequest, creds: ProviderCredentials): Promise<InviteResponse> {
    const url = `${base(creds)}/v3/tests/${encodeURIComponent(req.testId)}/invite`;
    const name = [req.candidateFirstName, req.candidateLastName].filter(Boolean).join(" ").trim();
    const payload: AnyObj = {
      Email: req.candidateEmail,
      ...(name ? { Name: name } : {}),
      // HARD RULE: vendor must NOT email the candidate.
      SendEmail: false,
      ...(req.correlationId ? { InvitationId: req.correlationId } : {}),
      ...(req.webhookUrl ? { CallbackUrl: req.webhookUrl } : {}),
    };
    const resp = await fetchJson<AnyObj>(url, {
      method: "POST",
      provider: PROVIDER,
      headers: authHeaders(creds),
      body: JSON.stringify(payload),
    });
    const root = obj(resp);
    const result = obj(root["result"] ?? root);
    const providerInvitationId = String(
      result["testInvitationId"] ?? result["TestInvitationId"] ?? result["invitationId"] ?? root["testInvitationId"] ?? "",
    );
    if (!providerInvitationId) {
      throw new Error("[imocha] invite response missing testInvitationId");
    }
    const candidateTestUrl =
      typeof result["testInvitationUrl"] === "string"
        ? (result["testInvitationUrl"] as string)
        : typeof result["invitationUrl"] === "string"
          ? (result["invitationUrl"] as string)
          : typeof result["url"] === "string"
            ? (result["url"] as string)
            : null;
    return { providerInvitationId, candidateTestUrl, status: "SENT", raw: resp };
  },

  async fetchResult(providerInvitationId: string, creds: ProviderCredentials): Promise<NormalizedResult | null> {
    const url = `${base(creds)}/v3/reports/testattempts/${encodeURIComponent(providerInvitationId)}`;
    let resp: AnyObj | null;
    try {
      resp = await fetchJson<AnyObj>(url, { provider: PROVIDER, headers: authHeaders(creds) });
    } catch (err) {
      if (isNotFound(err)) return null;
      throw err;
    }
    if (!resp) return null;
    const report = obj(resp["result"] ?? resp["report"] ?? resp);
    return normalizeReport(providerInvitationId, report);
  },

  verifyWebhook(headers, rawBody, secret): boolean {
    if (!secret) return false;
    const sig = header(headers, "x-imocha-signature") ?? header(headers, "x-signature");
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
    const report = obj(payload["result"] ?? payload["report"] ?? payload["data"] ?? payload);
    const invitationId = String(
      report["testInvitationId"] ?? report["TestInvitationId"] ?? payload["testInvitationId"] ?? payload["invitationId"] ?? "",
    );
    if (!invitationId) return null;
    return normalizeReport(invitationId, report);
  },
};

function isNotFound(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && (err as { status?: number }).status === 404);
}

export default iMochaProvider;
