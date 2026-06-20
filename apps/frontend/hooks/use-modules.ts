"use client";
// hooks/use-modules.ts
// SLICE E7 - the resolved ENABLED MODULE set for the signed-in tenant.
//
// Reads GET /api/me/modules (the WF4 gateway route), which returns the tenant's
// REAL resolved module state (TenantModule overrides + ModuleRegistry + plan
// limits + kill switches, AND-ed by billing). The response shape is
//   { success: true, data: { modules: ModuleState[], enabledKeys: string[] } }
// where enabledKeys is exactly the set of module keys currently enabled.
//
// GRACEFUL FALLBACK (so v1 is unaffected): the WF4 route may not be deployed in
// every environment yet. If the endpoint 404s - or the call errors, or the body
// is malformed - this hook reports `allEnabled: true` and `enabledKeys: null`,
// which downstream consumers (the widget palette filter, the read hook) MUST
// treat as "module gating not resolved -> do not hide anything". This mirrors the
// gateway's own fail-soft posture: a missing/blipping module surface never
// removes a feature the user already has.
//
// This hook does NOT gate the rendered widgets in WF5 (the system-default board
// shows the same bento regardless); it is the data the WF6 placement palette and
// any future per-widget module gate will read. Exposing it now keeps the read
// path complete and lets the page pass `enabledKeys` through without a second
// fetch later.
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function authToken(): string | null {
  try {
    return typeof window !== "undefined"
      ? window.sessionStorage.getItem("ats-access-token")
      : null;
  } catch {
    return null;
  }
}

/** One resolved module row from GET /api/me/modules. Mirrors the gateway shape;
 *  every field beyond `key`/`enabled` is best-effort (absent on the fallback). */
export interface ModuleRow {
  key: string;
  name?: string;
  category?: string;
  type?: string;
  enabled: boolean;
  /** Machine reason when !enabled, e.g. "PLAN_LIMIT" | "DISABLED" |
   *  "DEPENDENCY_DISABLED". Lets a consumer tell a plan-lock (show an upgrade
   *  affordance) apart from a hard-disabled module (hide it). */
  reason?: string;
  /** The plan that would unlock the module, when blocked on plan. */
  requiresPlan?: string | null;
}

export interface ModulesState {
  /** The enabled module keys, or null when gating is NOT resolved (endpoint
   *  absent / errored / malformed). null means "treat everything as enabled". */
  enabledKeys: string[] | null;
  /** True while gating is unresolved (the fallback): consumers must not hide any
   *  widget on this. Set whenever enabledKeys is null. */
  allEnabled: boolean;
  /** The full resolved module rows (with per-module reason/requiresPlan), or null
   *  on the fallback. Additive: existing consumers reading enabledKeys/allEnabled
   *  are unaffected. WF9 nav gating reads this to distinguish PLAN_LIMIT (show a
   *  lock + upgrade affordance) from a hard-disabled module (hide the nav item). */
  modules: ModuleRow[] | null;
  /** True only during the initial in-flight fetch. */
  loading: boolean;
  /** The error, if the fetch failed for a reason other than a 404 (kept for
   *  diagnostics; consumers should still fall back to all-enabled). */
  error?: Error;
}

// Parse the WF4 response body into the full module rows, tolerating the documented
// { data: { modules } } and a bare { modules } shape. Returns null when no usable
// rows are present so the caller falls back to all-enabled.
function readModuleRows(body: unknown): ModuleRow[] | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const data = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;
  const modules = data.modules;
  if (!Array.isArray(modules)) return null;
  return modules
    .filter((m): m is Record<string, unknown> => !!m && typeof m === "object" && typeof (m as { key?: unknown }).key === "string")
    .map((m) => ({
      key: m.key as string,
      name: typeof m.name === "string" ? m.name : undefined,
      category: typeof m.category === "string" ? m.category : undefined,
      type: typeof m.type === "string" ? m.type : undefined,
      enabled: m.enabled !== false,
      reason: typeof m.reason === "string" ? m.reason : undefined,
      requiresPlan: typeof m.requiresPlan === "string" ? m.requiresPlan : null,
    }));
}

// Parse the WF4 response body into a string[] of enabled keys, tolerating a few
// shapes (the documented { data: { enabledKeys } }, a bare { enabledKeys }, or a
// modules array we can filter ourselves). Returns null when no usable set is
// present so the caller falls back to all-enabled rather than hiding everything.
function readEnabledKeys(body: unknown): string[] | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const data = (root.data && typeof root.data === "object" ? root.data : root) as Record<string, unknown>;

  const keys = data.enabledKeys;
  if (Array.isArray(keys) && keys.every((k) => typeof k === "string")) {
    return keys as string[];
  }

  // Fallback: derive from a modules[] array of { key, enabled }.
  const modules = data.modules;
  if (Array.isArray(modules)) {
    const derived = modules
      .filter(
        (m): m is { key: string; enabled?: boolean } =>
          !!m && typeof m === "object" && typeof (m as { key?: unknown }).key === "string",
      )
      .filter((m) => m.enabled !== false)
      .map((m) => m.key);
    return derived;
  }

  return null;
}

/**
 * useModules - resolve the tenant's enabled module set with a graceful all-
 * enabled fallback. Fires once on mount. The result is stable for the page
 * lifetime (module state changes rarely; WF6 can add a manual refresh if needed).
 */
export function useModules(): ModulesState {
  const [state, setState] = useState<ModulesState>({
    enabledKeys: null,
    allEnabled: true,
    modules: null,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    const token = authToken();

    fetch(`${API_BASE}/me/modules`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!alive) return;
        // 404 (route not deployed) or any non-OK status -> fall back to all-
        // enabled. v1 is unaffected: nothing is hidden.
        if (!res.ok) {
          setState({ enabledKeys: null, allEnabled: true, modules: null, loading: false });
          return;
        }
        const body = await res.json().catch(() => null);
        const keys = readEnabledKeys(body);
        if (keys === null) {
          // Malformed body -> also fall back to all-enabled.
          setState({ enabledKeys: null, allEnabled: true, modules: null, loading: false });
        } else {
          setState({ enabledKeys: keys, allEnabled: false, modules: readModuleRows(body), loading: false });
        }
      })
      .catch((error: Error) => {
        if (!alive) return;
        // Network/transport error -> all-enabled fallback, keep the error for logs.
        setState({ enabledKeys: null, allEnabled: true, modules: null, loading: false, error });
      });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
