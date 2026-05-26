/**
 * Minimal HTTP client for job-service → candidate-service calls during
 * public apply. The full typed client lives in api-gateway; this is a
 * stripped-down version for one-off internal calls.
 */
import { AppError } from "@cdc-ats/common";

const CANDIDATE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

export async function callCandidateService<T>(opts: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  tenantId: string;
  userId?: string;
  role?: string;
}): Promise<T> {
  const url = `${CANDIDATE_URL}${opts.path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant-Id": opts.tenantId,
    "X-User-Id": opts.userId ?? "public",
    "X-User-Role": opts.role ?? "CANDIDATE",
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const res = await fetch(url, {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let body: any;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  if (!res.ok || body.success === false) {
    const err = body?.error ?? { code: "UPSTREAM_FAILURE", message: `candidate-service ${res.status}` };
    throw new AppError(err.code, err.message, res.status);
  }
  return body.data as T;
}
