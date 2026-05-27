/**
 * Phase 21 — prompt override cache.
 *
 * ai-engine looks up the active PromptOverride row from billing-service
 * before invoking an agent. If a row exists, its `systemPrompt`,
 * `modelName`, and `temperature` win over the agent's hardcoded defaults.
 *
 * Why a cache: every agent invocation would otherwise be an HTTP hop.
 * 5-minute TTL is bounded staleness — super-admin's prompt change shows
 * up across the fleet within 5 min worst-case, without per-call latency.
 *
 * Why in-process (not Redis): the cache is tiny (one entry per agent
 * type, max ~20), and a single per-pod copy is fine. If we ever need
 * "instant" propagation, billing-service could publish a NATS event on
 * PromptOverride change and we'd invalidate that one key.
 *
 * Failure mode: if billing-service is unreachable, we cache an empty
 * result for 30s and continue with the hardcoded defaults — agents keep
 * working, the override just doesn't apply until billing comes back up.
 */
import { createHash } from "node:crypto";

const FRESH_TTL_MS = 5 * 60 * 1000;
const ERROR_TTL_MS = 30 * 1000;

export interface PromptOverride {
  systemPrompt: string | null;
  modelName: string | null;
  temperature: number | null;
  version: number;
  notes: string | null;
}

interface CacheEntry {
  override: PromptOverride | null;
  fetchedAt: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<PromptOverride | null>>();

function billingUrl(): string {
  return process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003";
}

/**
 * Return the active prompt override for an agent type, or null if none.
 * Coalesces concurrent calls — under burst load only one HTTP request fires.
 */
export async function getPromptOverride(agentType: string): Promise<PromptOverride | null> {
  const entry = cache.get(agentType);
  if (entry && Date.now() - entry.fetchedAt < entry.ttl) {
    return entry.override;
  }
  const existing = inflight.get(agentType);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const res = await fetch(`${billingUrl()}/internal/platform/prompts/${encodeURIComponent(agentType)}`, {
        // Super-admin scope so the platform route's guard accepts the call.
        // ai-engine is a trusted internal package; this header is fine.
        headers: {
          "x-user-id": "system-ai-engine",
          "x-user-role": "SUPER_ADMIN",
        },
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) {
        cache.set(agentType, { override: null, fetchedAt: Date.now(), ttl: ERROR_TTL_MS });
        return null;
      }
      const body = (await res.json()) as { data?: { active?: PromptOverride | null } };
      const active = (body.data ?? (body as any))?.active ?? null;
      cache.set(agentType, { override: active, fetchedAt: Date.now(), ttl: FRESH_TTL_MS });
      return active;
    } catch {
      // Short TTL on error so we retry soon when billing-service recovers.
      cache.set(agentType, { override: null, fetchedAt: Date.now(), ttl: ERROR_TTL_MS });
      return null;
    } finally {
      inflight.delete(agentType);
    }
  })();

  inflight.set(agentType, promise);
  return promise;
}

/**
 * Resolve the effective prompt config for an agent: merge the hardcoded
 * defaults with the active override. Override fields that are null fall
 * back to defaults.
 */
export async function resolvePromptConfig(
  agentType: string,
  defaults: { systemPrompt: string; modelId: string; temperature?: number },
): Promise<{ systemPrompt: string; modelId: string; temperature: number | undefined; overrideVersion: number | null }> {
  const override = await getPromptOverride(agentType);
  if (!override) {
    return { ...defaults, temperature: defaults.temperature, overrideVersion: null };
  }
  return {
    systemPrompt: override.systemPrompt ?? defaults.systemPrompt,
    modelId: override.modelName ?? defaults.modelId,
    temperature: override.temperature ?? defaults.temperature,
    overrideVersion: override.version,
  };
}

/** Stable hash of the effective prompt — useful for cache-buster keys. */
export function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 8);
}

/** Test seam — drop the cache so tests don't share state. */
export function clearPromptOverrideCache(): void {
  cache.clear();
  inflight.clear();
}
