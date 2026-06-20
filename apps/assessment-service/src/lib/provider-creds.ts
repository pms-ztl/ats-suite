/**
 * Provider-credentials loader (assessment-service) — WF8 / SLICE H3.
 *
 * Fetches a tenant's DECRYPTED OA-vendor credentials from the notification-service
 * integration store and maps them onto the adapter {@link ProviderCredentials}
 * shape. The secrets live (AES-GCM encrypted at rest) in notification-service's
 * TenantIntegration.config; that service decrypts them at the point of use and
 * vends them ONLY over its server-to-server route
 * /internal/provider-credentials/:kind — never through the gateway — so the worker
 * is the consumer of those plaintext creds and must not persist or log them.
 *
 * Transport mirrors service-client.ts: a short-timeout fetch that stamps
 * X-Tenant-Id / X-User-Id / X-User-Role + the X-Internal-Service token so the call
 * clears notification-service's internal-service-token enforcement, and unwraps the
 * { data } envelope. A 404 (no integration configured) → null; any transport error
 * → throws, so the worker can RETRY the invite (a creds-store blip must not be
 * mistaken for "no vendor configured" and silently drop the invite).
 */
import type { ProviderCredentials } from "../providers/types.js";

const NOTIFICATION_URL = process.env["NOTIFICATION_SERVICE_URL"] ?? "http://localhost:4009";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

interface ProviderCredsResponse {
  kind: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

/** Distinguish "no integration row" (null → caller skips) from a transport error
 *  (throw → caller retries). Carries the HTTP status for the caller's logs. */
export class ProviderCredsError extends Error {
  constructor(public readonly status: number, message: string) {
    super(`[provider-creds] ${message} (HTTP ${status})`);
    this.name = "ProviderCredsError";
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/**
 * Load and map the tenant's decrypted creds for a provider kind.
 *
 * @returns the mapped {@link ProviderCredentials} when the integration exists,
 *          `enabled`, and carries at least one usable secret; `null` when the
 *          tenant has NO integration of that kind (404) or it is disabled — the
 *          worker then routes the invite to manual handling rather than inventing
 *          creds. Throws {@link ProviderCredsError} on a transport/store error so
 *          the BullMQ job can retry (never a silent drop).
 */
export async function loadProviderCredentials(
  tenantId: string,
  kind: string,
  userId = "system",
): Promise<ProviderCredentials | null> {
  const url = `${NOTIFICATION_URL}/internal/provider-credentials/${encodeURIComponent(kind)}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": userId,
    "X-User-Role": "ADMIN", // internal call, granted full read
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  let res: Response;
  try {
    res = await fetch(url, { headers, signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    throw new ProviderCredsError(0, err instanceof Error ? err.message : "transport error");
  } finally {
    clearTimeout(timer);
  }

  // 404 = no integration configured for this tenant/kind → honest null (no creds).
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new ProviderCredsError(res.status, "credential store rejected the request");
  }

  let body: { data?: ProviderCredsResponse } | ProviderCredsResponse;
  try {
    body = (await res.json()) as typeof body;
  } catch {
    throw new ProviderCredsError(res.status, "credential store returned a non-JSON body");
  }
  const payload = (("data" in body && body.data) || body) as ProviderCredsResponse;
  if (!payload || payload.enabled === false) return null;

  const config = (payload.config ?? {}) as Record<string, unknown>;
  const creds: ProviderCredentials = {
    ...(str(config["apiKey"]) ? { apiKey: str(config["apiKey"]) } : {}),
    ...(str(config["apiToken"]) ? { apiToken: str(config["apiToken"]) } : {}),
    ...(str(config["clientId"]) ? { clientId: str(config["clientId"]) } : {}),
    ...(str(config["clientSecret"]) ? { clientSecret: str(config["clientSecret"]) } : {}),
    ...(str(config["webhookSecret"]) ? { webhookSecret: str(config["webhookSecret"]) } : {}),
    ...(str(config["baseUrl"]) ? { baseUrl: str(config["baseUrl"]) } : {}),
    ...(str(config["region"]) ? { region: str(config["region"]) } : {}),
    ...(str(config["subdomain"]) ? { subdomain: str(config["subdomain"]) } : {}),
  };

  // No usable secret → treat as not configured (the adapter would throw anyway).
  if (!creds.apiKey && !creds.apiToken && !creds.clientSecret) return null;
  return creds;
}
