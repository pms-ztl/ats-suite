/**
 * Hiring-platform credentials loader (job-service) - WF-E / SLICE E7.
 *
 * Ported from apps/assessment-service/src/lib/provider-creds.ts. Fetches a
 * tenant's DECRYPTED job-board credentials from the notification-service
 * integration store and maps them onto the adapter {@link PlatformCredentials}
 * shape. The secrets live (AES-GCM encrypted at rest) in notification-service's
 * TenantIntegration.config; that service decrypts them at the point of use and
 * vends them ONLY over its server-to-server route
 * /internal/provider-credentials/:kind (never through the gateway) so the
 * dispatcher/reaper is the consumer of those plaintext creds and must NOT persist
 * or log them.
 *
 * This is the HIRING-PLATFORM axis (job boards / syndication / inbound apply),
 * DISTINCT from the assessment-provider axis: the `kind` passed here is a board
 * {@link ProviderKey} (indeed, linkedin, ziprecruiter, ...), never an OA-vendor
 * kind. The two never cross-wire.
 *
 * Transport mirrors lib/service-client.ts: a short-timeout fetch that stamps
 * X-Tenant-Id / X-User-Id / X-User-Role + the X-Internal-Service token so the call
 * clears notification-service's internal-service-token enforcement, and unwraps the
 * { data } envelope. A 404 (no integration configured) → null; any transport error
 * → throws, so the caller can RETRY the dispatch (a creds-store blip must not be
 * mistaken for "no board configured" and silently drop the posting).
 *
 * DEPENDENCY NOTE: the notification-service route currently gates on
 * isAssessmentKind(); a sibling WF-E slice loosens that gate to also admit
 * isHiringPlatformKind() so this loader resolves board creds. Until that gate is
 * loosened a hiring kind returns a validation 400 (treated here as a hard error,
 * not a silent null) so the regression is visible rather than swallowed.
 */
import type { PlatformCredentials } from "./types.js";

const NOTIFICATION_URL = process.env["NOTIFICATION_SERVICE_URL"] ?? "http://localhost:4009";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

interface PlatformCredsResponse {
  kind: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

/** Distinguish "no integration row" (null → caller skips) from a transport error
 *  (throw → caller retries). Carries the HTTP status for the caller's logs. */
export class PlatformCredsError extends Error {
  constructor(public readonly status: number, message: string) {
    super(`[platform-creds] ${message} (HTTP ${status})`);
    this.name = "PlatformCredsError";
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/**
 * Load and map the tenant's decrypted creds for a board kind.
 *
 * @returns the mapped {@link PlatformCredentials} when the integration exists,
 *          `enabled`, and carries at least one usable secret; `null` when the
 *          tenant has NO integration of that kind (404) or it is disabled, so the
 *          caller then routes the posting to manual handling rather than inventing
 *          creds. Throws {@link PlatformCredsError} on a transport/store error so
 *          the job can retry (never a silent drop).
 */
export async function loadPlatformCredentials(
  tenantId: string,
  kind: string,
  userId = "system",
): Promise<PlatformCredentials | null> {
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
    throw new PlatformCredsError(0, err instanceof Error ? err.message : "transport error");
  } finally {
    clearTimeout(timer);
  }

  // 404 = no integration configured for this tenant/kind → honest null (no creds).
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new PlatformCredsError(res.status, "credential store rejected the request");
  }

  let body: { data?: PlatformCredsResponse } | PlatformCredsResponse;
  try {
    body = (await res.json()) as typeof body;
  } catch {
    throw new PlatformCredsError(res.status, "credential store returned a non-JSON body");
  }
  const payload = (("data" in body && body.data) || body) as PlatformCredsResponse;
  if (!payload || payload.enabled === false) return null;

  const config = (payload.config ?? {}) as Record<string, unknown>;
  // Map ONLY the typed PlatformCredentials fields straight from same-named config
  // keys, never synthesize a field. OAuth boards store clientId+clientSecret,
  // token boards store apiToken, key boards store apiKey; organizationId /
  // contractId / linkedinVersion scope a posting to the tenant's employer account.
  const creds: PlatformCredentials = {
    ...(str(config["apiKey"]) ? { apiKey: str(config["apiKey"]) } : {}),
    ...(str(config["apiToken"]) ? { apiToken: str(config["apiToken"]) } : {}),
    ...(str(config["clientId"]) ? { clientId: str(config["clientId"]) } : {}),
    ...(str(config["clientSecret"]) ? { clientSecret: str(config["clientSecret"]) } : {}),
    ...(str(config["webhookSecret"]) ? { webhookSecret: str(config["webhookSecret"]) } : {}),
    ...(str(config["baseUrl"]) ? { baseUrl: str(config["baseUrl"]) } : {}),
    ...(str(config["region"]) ? { region: str(config["region"]) } : {}),
    ...(str(config["subdomain"]) ? { subdomain: str(config["subdomain"]) } : {}),
    ...(str(config["organizationId"]) ? { organizationId: str(config["organizationId"]) } : {}),
    ...(str(config["contractId"]) ? { contractId: str(config["contractId"]) } : {}),
    ...(str(config["linkedinVersion"]) ? { linkedinVersion: str(config["linkedinVersion"]) } : {}),
  };

  // No usable secret → treat as not configured (the adapter would throw anyway).
  if (!creds.apiKey && !creds.apiToken && !creds.clientSecret) return null;
  return creds;
}
