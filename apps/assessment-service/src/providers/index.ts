/**
 * Provider adapter registry (assessment-service) — WF8 / SLICE H2.
 *
 * Maps a provider key (which is identical to the TenantIntegration `kind` the
 * notification-service stores, e.g. "hackerrank") to its {@link AssessmentProvider}
 * adapter. The rest of the service resolves an adapter through {@link getProvider}
 * / {@link requireProvider} and never imports a concrete vendor file directly, so
 * adding a vendor is: drop in a disjoint adapter file + add one line here.
 *
 * Webhook capability note: HackerRank has NO per-invite webhook (polling-only).
 * {@link providerSupportsWebhook} lets the caller decide whether to register an
 * inbound-webhook path or schedule fetchResult() polling for a given vendor.
 *
 * All adapters obey the HARD RULES (real-data-or-null normalization, no
 * fabricated scores, no auto-reject, vendor rate limits) — see each adapter file.
 */
import type { AssessmentProvider, ProviderKey } from "./types.js";
import { hackerEarthProvider } from "./hackerearth.js";
import { codilityProvider } from "./codility.js";
import { iMochaProvider } from "./imocha.js";
import { testGorillaProvider } from "./testgorilla.js";
import { hackerRankProvider } from "./hackerrank.js";

/** The provider registry: providerKey → adapter. */
export const PROVIDERS: Record<ProviderKey, AssessmentProvider> = {
  hackerearth: hackerEarthProvider,
  codility: codilityProvider,
  imocha: iMochaProvider,
  testgorilla: testGorillaProvider,
  hackerrank: hackerRankProvider,
};

/** Every supported provider key. */
export const PROVIDER_KEYS = Object.keys(PROVIDERS) as ProviderKey[];

/** True when `key` is a registered provider key (narrows to ProviderKey). */
export function isProviderKey(key: unknown): key is ProviderKey {
  return typeof key === "string" && key in PROVIDERS;
}

/** Resolve an adapter by key, or null if the key is not a registered provider. */
export function getProvider(key: string): AssessmentProvider | null {
  return isProviderKey(key) ? PROVIDERS[key] : null;
}

/** Resolve an adapter by key, throwing a clear error for an unknown provider. */
export function requireProvider(key: string): AssessmentProvider {
  const provider = getProvider(key);
  if (!provider) {
    throw new Error(`Unknown assessment provider "${key}". Known: ${PROVIDER_KEYS.join(", ")}`);
  }
  return provider;
}

/**
 * Whether a vendor delivers a per-invite completion webhook. HackerRank does NOT
 * (polling-only via fetchResult); the others do. The inbound-webhook router uses
 * this to decide whether a vendor callback path is expected; the polling reaper
 * covers the rest.
 */
export function providerSupportsWebhook(key: string): boolean {
  return isProviderKey(key) && key !== "hackerrank";
}

export * from "./types.js";
export {
  hackerEarthProvider,
  codilityProvider,
  iMochaProvider,
  testGorillaProvider,
  hackerRankProvider,
};
