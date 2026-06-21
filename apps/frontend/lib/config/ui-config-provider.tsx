"use client";
// apps/frontend/lib/config/ui-config-provider.tsx
//
// WF-C: the RESOLVED per-tenant UiConfig provider + useUiConfig() hook.
//
// This is the real implementation behind the WF-B forward-declared stub in
// lib/registry/index.ts. It fetches GET /api/me/ui-config ONCE per session,
// caches it (~5min TTL, module-local like use-tenant-branding), runs the
// contracts migration ladder (migrateUiConfig) over the response, and FAILS
// SOFT to the neutral, all-enabled UiConfig fallback on 404 / network error /
// malformed body, so a tenant that never authored a UiConfig (or any env where
// the route is not deployed yet) renders BYTE-IDENTICAL to the un-customized
// product. Nothing here invents theme/nav/copy values: the fallback is exactly
// what migrateUiConfig({}) parses an absent document into.
//
// ─────────────────────────── RESOLUTION PRECEDENCE ───────────────────────────
// A resolved UiConfig is the layering of four sources, lowest precedence first:
//
//   1. PLATFORM DEFAULT: the contract's neutral, all-enabled fallback
//      (migrateUiConfig({})). Every field defaulted: system color mode, no brand
//      override, empty nav/routes/copy/surfaces/featureToggles. This is the floor
//      and what an untouched tenant resolves to.
//   2. ENV: an optional build-time platform skin from NEXT_PUBLIC_UI_CONFIG
//      (a JSON UiConfig). Lets an operator ship a house default above the bare
//      contract fallback without a per-tenant write. Absent/invalid -> ignored
//      (stays at the platform default). Validated through migrateUiConfig.
//   3. TENANT OVERRIDE: the document returned by GET /api/me/ui-config (the
//      tenant's authored UiConfig). This is the primary customization layer.
//   4. PER-USER PREFS: a per-user overlay (e.g. a chosen colorMode) merged last.
//      Sourced from the same response (response.userPrefs) when the gateway
//      supplies it; absent today -> no-op. Highest precedence so a user choice
//      wins over the tenant default for that user only.
//
// The layers are merged FIELD-WISE (deep for the nested theme/nav/routes/copy/
// surfaces/featureToggles maps, shallow-overwrite for scalars) and the merged
// document is run through migrateUiConfig ONE final time, so the resolved value
// is always a fully-validated, current-schema UiConfig. Any layer that fails to
// parse is dropped (fail-soft) rather than poisoning the resolution.
//
// ─────────────────────────── HARD RULES (do not relax) ───────────────────────
//  1. ADDITIVE + FAIL-SOFT. 404 / error / malformed -> the all-enabled fallback.
//     The app renders byte-identically for untouched tenants; this provider never
//     regresses the existing nav/theme/login.
//  2. NO FABRICATED DATA. Every value in the resolved config came from the
//     contract defaults, the validated env skin, the tenant's own authored doc,
//     or the user's own prefs, never an invented theme/nav/copy value.
//  3. SCHEMA IS THE INJECTION BOUNDARY. Every document (env, tenant, merged) is
//     passed through migrateUiConfig (= UiConfigSchema.parse), so hex colors,
//     font names, and URLs are validated BEFORE the resolved config can reach
//     buildThemeCss / any inline <style>. Consumers may trust a resolved UiConfig.

import * as React from "react";
import {
  migrateUiConfig,
  type UiConfig,
  type UiNavOverride,
} from "@cdc-ats/contracts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// TTL for the module-local cache, mirroring use-tenant-branding (5 minutes).
const TTL_MS = 5 * 60 * 1000;

/* ───────────────────────────── token (same as use-modules) ─────────────────── */
// /api/me/* routes are read with the session access token + credentials:"include"
// exactly like use-modules. Branding uses a cookie; the /api/me family uses the
// sessionStorage access token, so we follow the closer analog.
function authToken(): string | null {
  try {
    return typeof window !== "undefined"
      ? window.sessionStorage.getItem("ats-access-token")
      : null;
  } catch {
    return null;
  }
}

/* ───────────────────────────── the platform-default floor ──────────────────── */
// The neutral, all-enabled fallback, computed ONCE from an empty document. This
// is the SAME value the WF-B barrel froze: migrateUiConfig({}) runs the schema
// ladder + final .parse, applying every default. Frozen so a consumer cannot
// mutate the shared fallback. This is layer (1) of the precedence and the value
// every error/empty path resolves to.
const PLATFORM_DEFAULT_UI_CONFIG: UiConfig = Object.freeze(
  migrateUiConfig({}),
) as UiConfig;

/* ───────────────────────────── the env skin (layer 2) ──────────────────────── */
// Optional build-time house skin from NEXT_PUBLIC_UI_CONFIG (a JSON UiConfig).
// Parsed + validated ONCE. Invalid / absent -> null (the resolution stays at the
// platform default). This lets an operator ship a default skin above the bare
// contract floor without a per-tenant write, and is purely additive.
const ENV_UI_CONFIG: UiConfig | null = (() => {
  const raw = process.env.NEXT_PUBLIC_UI_CONFIG;
  if (!raw || typeof raw !== "string") return null;
  try {
    return migrateUiConfig(JSON.parse(raw));
  } catch {
    return null; // malformed env skin -> ignored (fail-soft).
  }
})();

/* ───────────────────────────── deep field-wise merge ───────────────────────── */
// Layer a higher-precedence partial UiConfig on top of a base. The nested record
// maps (theme.tokens, nav.overrides, routes, copy, surfaces, featureToggles) are
// merged key-by-key so a higher layer overriding ONE route/copy key does not drop
// the rest; scalar + array fields shallow-overwrite (a present value wins, an
// absent one inherits). The result is re-parsed by the caller via migrateUiConfig,
// so this only needs to produce a structurally-plausible document.
function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function mergeMaps(
  base: Record<string, unknown> | undefined,
  over: Record<string, unknown> | undefined,
): Record<string, unknown> {
  return { ...(base ?? {}), ...(over ?? {}) };
}

function mergeUiConfig(base: UiConfig, over: UiConfig): Record<string, unknown> {
  const b = base as unknown as Record<string, unknown>;
  const o = over as unknown as Record<string, unknown>;
  return {
    schemaVersion: over.schemaVersion ?? base.schemaVersion,
    brandName: over.brandName ?? base.brandName,
    // theme: scalar appearance fields shallow-overwrite; nested tokens map merges.
    theme: {
      ...(isPlainObject(b.theme) ? b.theme : {}),
      ...(isPlainObject(o.theme) ? o.theme : {}),
      tokens: mergeMaps(base.theme?.tokens, over.theme?.tokens),
    },
    // nav: order/hidden arrays shallow-overwrite; overrides map merges by id.
    nav: {
      ...(isPlainObject(b.nav) ? b.nav : {}),
      ...(isPlainObject(o.nav) ? o.nav : {}),
      overrides: mergeMaps(base.nav?.overrides, over.nav?.overrides),
    },
    routes: mergeMaps(base.routes, over.routes),
    copy: mergeMaps(base.copy, over.copy),
    surfaces: mergeMaps(base.surfaces, over.surfaces),
    featureToggles: mergeMaps(base.featureToggles, over.featureToggles),
  };
}

// Fold an ordered list of layers (lowest precedence first) into one resolved,
// fully-validated UiConfig. Each fold step merges field-wise then re-parses
// through migrateUiConfig so the running value is always a valid current-schema
// document. A layer is dropped if it is null (absent); never crashes resolution.
function resolveLayers(layers: Array<UiConfig | null>): UiConfig {
  let acc: UiConfig = PLATFORM_DEFAULT_UI_CONFIG;
  for (const layer of layers) {
    if (!layer) continue;
    try {
      acc = migrateUiConfig(mergeUiConfig(acc, layer));
    } catch {
      // A layer that produces an invalid merge is dropped (fail-soft): keep the
      // last good resolution rather than poisoning it.
    }
  }
  return acc;
}

/* ───────────────────────────── response parsing ────────────────────────────── */
// Pull the tenant UiConfig + optional per-user prefs out of the gateway response,
// tolerating the documented { success, data: { uiConfig, userPrefs } } shape and
// a bare { uiConfig } / a top-level UiConfig document. Each is run through
// migrateUiConfig; anything that fails to parse becomes null (fail-soft).
interface FetchedLayers {
  tenant: UiConfig | null;
  userPrefs: UiConfig | null;
}

function readFetchedLayers(body: unknown): FetchedLayers {
  if (!isPlainObject(body)) return { tenant: null, userPrefs: null };
  const data = isPlainObject(body.data) ? body.data : body;

  const tenantRaw =
    (isPlainObject(data.uiConfig) ? data.uiConfig : undefined) ??
    // A top-level document (no envelope) that itself looks like a UiConfig.
    (typeof data.schemaVersion === "number" ? data : undefined);
  const prefsRaw = isPlainObject(data.userPrefs) ? data.userPrefs : undefined;

  const safeMigrate = (doc: unknown): UiConfig | null => {
    if (!isPlainObject(doc)) return null;
    try {
      return migrateUiConfig(doc);
    } catch {
      return null;
    }
  };

  return {
    tenant: safeMigrate(tenantRaw),
    userPrefs: safeMigrate(prefsRaw),
  };
}

/* ───────────────────────────── module-local cache ──────────────────────────── */
// One shared fetch across all consumers (use-tenant-branding pattern). The cache
// stores the already-resolved UiConfig so every subscriber gets the identical
// frozen-precedence result without re-folding.
let cached: { config: UiConfig; fetchedAt: number } | null = null;
let inflight: Promise<UiConfig> | null = null;

async function fetchResolvedUiConfig(): Promise<UiConfig> {
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached.config;
  if (inflight) return inflight;

  inflight = (async () => {
    const token = authToken();
    let tenant: UiConfig | null = null;
    let userPrefs: UiConfig | null = null;
    try {
      const res = await fetch(`${API_BASE}/me/ui-config`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // 404 (route not deployed) or any non-OK status -> tenant/userPrefs stay
      // null; resolution falls back to platform-default <- env. v1 unaffected.
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const parsed = readFetchedLayers(body);
        tenant = parsed.tenant;
        userPrefs = parsed.userPrefs;
      }
    } catch {
      // Network/transport error -> tenant/userPrefs stay null (fail-soft).
    } finally {
      inflight = null;
    }
    // precedence: platform default <- env <- tenant override <- per-user prefs.
    const resolved = resolveLayers([ENV_UI_CONFIG, tenant, userPrefs]);
    cached = { config: resolved, fetchedAt: Date.now() };
    return resolved;
  })();

  return inflight;
}

/** Test seam, clear the module-local cache (used after a UiConfig write). */
export function clearUiConfigCache(): void {
  cached = null;
  inflight = null;
}

/* ───────────────────────────── helpers (route/nav/copy) ────────────────────── */
// Pure helpers over a resolved UiConfig. They centralize the fail-soft semantics
// so every consumer reads the config the same way: an unlisted route is ENABLED,
// an absent nav override is null, and a missing copy key falls back to the
// supplied default. Exposed on the hook result so call sites never reach into the
// raw maps (and so the same logic is reused by cd-shell / the embed shell).

/** Normalize an href to the route key used in config.routes. Strips the leading
 *  slash and a trailing slash so "/candidates" and "candidates/" both key on
 *  "candidates". A route with no entry is treated as enabled (fail-soft). */
function routeKey(href: string): string {
  return href.replace(/^\/+/, "").replace(/\/+$/, "");
}

function isRouteEnabledIn(config: UiConfig, href: string): boolean {
  const key = routeKey(href);
  // Try both the slash-stripped key and the raw href, so a config authored with
  // either convention resolves. An unlisted route stays enabled (HARD RULE 1).
  const entry = config.routes[key] ?? config.routes[href];
  return entry ? entry.enabled !== false : true;
}

function routeTitleIn(config: UiConfig, href: string): string | undefined {
  const key = routeKey(href);
  return (config.routes[key] ?? config.routes[href])?.title;
}

function navOverrideIn(config: UiConfig, id: string): UiNavOverride | null {
  return config.nav.overrides[id] ?? null;
}

function copyIn(config: UiConfig, key: string, fallback: string): string {
  const v = config.copy[key];
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

/* ───────────────────────────── the hook result shape ───────────────────────── */
// Mirrors use-tenant-branding's hook contract (value + loading + refresh) plus the
// resolved-config helpers, so this provider is a drop-in for the WF-B stub's
// UseUiConfigResult: any existing call site reading { config, loading, refresh }
// keeps compiling, and new call sites get the typed helpers.
export interface UseUiConfigResult {
  /** The fully-resolved, validated UiConfig (platform <- env <- tenant <- user). */
  config: UiConfig;
  /** True only during the initial in-flight fetch. */
  loading: boolean;
  /** Re-fetch the tenant config (busts the cache), e.g. after a UiConfig write. */
  refresh: () => void;
  /** Is the route at `href` enabled? Unlisted routes are enabled (fail-soft). */
  isRouteEnabled: (href: string) => boolean;
  /** The tenant title override for a route (config.routes[key].title), or undefined. */
  routeTitle: (href: string) => string | undefined;
  /** The tenant nav override (label/icon/href) for a nav item id, or null. */
  navOverride: (id: string) => UiNavOverride | null;
  /** A copy override by key, falling back to the supplied default string. */
  copy: (key: string, fallback: string) => string;
}

/* ───────────────────────────── React context ───────────────────────────────── */
// The provider hydrates the resolved config once and shares it via context, so
// the whole logged-in subtree reads ONE resolution. A consumer used OUTSIDE the
// provider (e.g. a not-yet-wrapped screen) still works: useUiConfig falls back to
// its own module-local fetch + the platform default, so the hook is safe anywhere
// and renders byte-identically until a tenant override loads (HARD RULE 1).
interface UiConfigContextValue {
  config: UiConfig;
  loading: boolean;
  refresh: () => void;
}

const UiConfigContext = React.createContext<UiConfigContextValue | null>(null);

export function UiConfigProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  // Seed synchronously from the cache (if warm) or the platform default, so SSR
  // and the first client paint are byte-identical to the un-customized product;
  // the tenant override layers in after the fetch resolves.
  const [config, setConfig] = React.useState<UiConfig>(
    cached?.config ?? PLATFORM_DEFAULT_UI_CONFIG,
  );
  const [loading, setLoading] = React.useState<boolean>(cached === null);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      const resolved = await fetchResolvedUiConfig();
      if (!active) return;
      setConfig(resolved);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const refresh = React.useCallback(() => {
    clearUiConfigCache();
    void fetchResolvedUiConfig().then((resolved) => setConfig(resolved));
  }, []);

  const value = React.useMemo<UiConfigContextValue>(
    () => ({ config, loading, refresh }),
    [config, loading, refresh],
  );

  return (
    <UiConfigContext.Provider value={value}>
      {children}
    </UiConfigContext.Provider>
  );
}

/* ───────────────────────────── useUiConfig() ───────────────────────────────── */
// Returns the resolved UiConfig + the loading/refresh seam + the route/nav/copy
// helpers. Reads the context when inside a UiConfigProvider; otherwise runs a
// standalone module-local fetch (same cache) so the hook is usable from any
// component without forcing a provider; both paths fail soft to the platform
// default, so an untouched tenant renders byte-identically (HARD RULE 1).
export function useUiConfig(): UseUiConfigResult {
  const ctx = React.useContext(UiConfigContext);

  // Standalone state, only used when there is no surrounding provider. Seeded
  // from the cache / platform default exactly like the provider.
  const [standalone, setStandalone] = React.useState<UiConfig>(
    cached?.config ?? PLATFORM_DEFAULT_UI_CONFIG,
  );
  const [standaloneLoading, setStandaloneLoading] = React.useState<boolean>(
    ctx === null && cached === null,
  );

  React.useEffect(() => {
    if (ctx !== null) return; // provider present -> it owns the fetch.
    let active = true;
    void (async () => {
      const resolved = await fetchResolvedUiConfig();
      if (!active) return;
      setStandalone(resolved);
      setStandaloneLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [ctx]);

  const standaloneRefresh = React.useCallback(() => {
    clearUiConfigCache();
    void fetchResolvedUiConfig().then((resolved) => setStandalone(resolved));
  }, []);

  const config = ctx ? ctx.config : standalone;
  const loading = ctx ? ctx.loading : standaloneLoading;
  const refresh = ctx ? ctx.refresh : standaloneRefresh;

  return React.useMemo<UseUiConfigResult>(
    () => ({
      config,
      loading,
      refresh,
      isRouteEnabled: (href: string) => isRouteEnabledIn(config, href),
      routeTitle: (href: string) => routeTitleIn(config, href),
      navOverride: (id: string) => navOverrideIn(config, id),
      copy: (key: string, fallback: string) => copyIn(config, key, fallback),
    }),
    [config, loading, refresh],
  );
}

// Re-export the contract type so SDK consumers type their config against the one
// canonical UiConfig shape (matches the WF-B barrel's re-export).
export type { UiConfig } from "@cdc-ats/contracts";
