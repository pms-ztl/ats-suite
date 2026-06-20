/**
 * Service client — typed fetch wrapper for calls from gateway to backend
 * services. Forwards user claims as headers, propagates trace context,
 * surfaces upstream errors cleanly.
 */
import { AppError, Errors } from "@cdc-ats/common";

const SERVICE_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

const URLS = {
  identity: process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:4001",
  tenant: process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002",
  billing: process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003",
  job: process.env["JOB_SERVICE_URL"] ?? "http://localhost:4004",
  candidate: process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005",
  interview: process.env["INTERVIEW_SERVICE_URL"] ?? "http://localhost:4006",
  resume: process.env["RESUME_SERVICE_URL"] ?? "http://localhost:4007",
  screening: process.env["SCREENING_SERVICE_URL"] ?? "http://localhost:4008",
  notification: process.env["NOTIFICATION_SERVICE_URL"] ?? "http://localhost:4009",
  assessment: process.env["ASSESSMENT_SERVICE_URL"] ?? "http://localhost:4014",
};

type ServiceName = keyof typeof URLS;

export interface CallOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  /** Pass-through user identity headers (if calling on behalf of a user). */
  userHeaders?: {
    userId?: string;
    tenantId?: string;
    role?: string;
    email?: string;
    requestId?: string;
    // Phase 32a — set when the caller is impersonating; downstream services
    // record the actor for audit.
    actorUserId?: string;
  };
  /** Arbitrary extra headers (Phase 28 — IP + user-agent pass-through for SSO audit). */
  headers?: Record<string, string>;
  /** Per-request timeout in ms (default 5000). */
  timeoutMs?: number;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

export async function callService<T>(
  service: ServiceName,
  opts: CallOptions
): Promise<T> {
  const url = `${URLS[service]}${opts.path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (SERVICE_TOKEN) headers["X-Internal-Service"] = SERVICE_TOKEN;
  if (opts.userHeaders) {
    if (opts.userHeaders.userId) headers["X-User-Id"] = opts.userHeaders.userId;
    if (opts.userHeaders.tenantId) headers["X-Tenant-Id"] = opts.userHeaders.tenantId;
    if (opts.userHeaders.role) headers["X-User-Role"] = opts.userHeaders.role;
    if (opts.userHeaders.email) headers["X-User-Email"] = opts.userHeaders.email;
    if (opts.userHeaders.requestId) headers["X-Request-Id"] = opts.userHeaders.requestId;
    if (opts.userHeaders.actorUserId) headers["X-Actor-User-Id"] = opts.userHeaders.actorUserId;
  }
  if (opts.headers) Object.assign(headers, opts.headers);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 5000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw Errors.upstreamFailure(service, `${service}-service timeout after ${opts.timeoutMs ?? 5000}ms`);
    }
    throw Errors.upstreamFailure(service, `Network error calling ${service}: ${(err as Error).message}`);
  }
  clearTimeout(timer);

  let body: ServiceResponse<T>;
  try {
    body = (await res.json()) as ServiceResponse<T>;
  } catch {
    throw Errors.upstreamFailure(service, `${service}-service returned non-JSON ${res.status}`);
  }

  if (!res.ok || body.success === false) {
    const err = body.error ?? { code: "UPSTREAM_FAILURE", message: `${service}-service ${res.status}` };
    throw new AppError(err.code, err.message, res.status, err.details);
  }

  return body.data as T;
}
