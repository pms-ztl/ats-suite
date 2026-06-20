"use client";
// hooks/use-dashboard-layout.ts
// SLICE E7 (read) + SLICE F2 (write) - resolve AND persist the active dashboard.
//
// Resolution order (highest precedence first):
//   1. USER override   - the signed-in user's personal saved board.
//   2. TENANT default  - the workspace-wide default board an admin saved.
//   3. SYSTEM default  - the hardcoded per-role constant in lib/widgets/defaults.
//
// WF5 shipped the resolution machinery with the user/tenant tiers stubbed to
// undefined (the system default always won). WF6/F2 fills in the REAL read +
// write path against the F1 persistence API:
//
//   GET    /api/me/dashboards/:key   -> the caller's personal DashboardDocument
//                                       (200 with { data: doc } / { document }),
//                                       or 404 when they have none saved.
//   PUT    /api/me/dashboards/:key    -> copy-on-write: persists the WHOLE working
//                                       document as the caller's personal override.
//   DELETE /api/me/dashboards/:key    -> removes the personal override (reset to
//                                       the tenant/system default).
//
// GRACEFUL FALLBACK (HARD RULE - untouched tenants stay byte-identical): if the
// route 404s, errors, or returns a body that cannot be migrated/validated, the
// hook resolves to the WF5 seeded SYSTEM default for the role. A tenant whose
// gateway has no F1 route deployed renders EXACTLY the WF5 board - the write path
// is simply unavailable (save() surfaces an error the toolbar shows). The page
// never breaks on a missing endpoint.
//
// COPY-ON-WRITE: editing does NOT mutate the resolved document in place. The page
// edits a working copy; save() PUTs that copy, which the server stores as a NEW
// per-user row (RLS-scoped to the caller). The system/tenant defaults are never
// touched by a user save.
//
// MIGRATE-ON-READ: every candidate (user override, tenant default, even the
// system default) is run through migrateDashboard() so an older saved shape is
// upgraded to the current schemaVersion before it is rendered. A candidate that
// FAILS to migrate/validate (a corrupt saved board) is treated as absent and the
// next tier takes over - the system default is the guaranteed-valid floor.
//
// REAL DATA OR HONEST EMPTY ONLY: this hook resolves only the LAYOUT (which real
// widgets sit where). The widgets themselves bind real sources via WidgetFrame
// and render honest empty states; this file fabricates no data.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  migrateDashboard,
  type DashboardDocument,
} from "@/lib/widgets/schema";
import { systemDefaultFor } from "@/lib/widgets/defaults";

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

/** Which tier the active document came from (drives the toolbar's "reset to
 *  default" affordance and diagnostics). */
export type DashboardSource = "user" | "tenant" | "system";

export interface ResolvedDashboard {
  /** The validated, migration-applied document to render. Never undefined. */
  document: DashboardDocument;
  /** Which tier won. "system" when no override is saved (or the route 404s). */
  source: DashboardSource;
  /** True until the override fetch settles. */
  loading: boolean;
  /** The persistence key for the caller's board (per-role). */
  dashboardKey: string;
  /** The always-valid seeded default for the caller's role (the reset target). */
  systemDefault: DashboardDocument;

  // ── write path (F2) ──────────────────────────────────────────────────────
  /** Persist the WHOLE working document as the caller's personal override
   *  (copy-on-write). Resolves on success; rejects with the transport/validation
   *  error so the toolbar can surface it. Optimistically updates the resolved doc
   *  on success. */
  save: (doc: DashboardDocument) => Promise<void>;
  /** Remove the caller's personal override (DELETE) and reload, falling back to
   *  the tenant/system default. */
  reset: () => Promise<void>;
  /** Re-run the read (after an external change). */
  reload: () => void;
  /** True while a save/reset write is in flight. */
  saving: boolean;
  /** The last write error, if any (cleared on the next successful write). */
  saveError?: Error;
}

// Per-role persistence key. The board a user customizes is scoped to their role's
// home, so the key is "home:<ROLE>" (lowercased, defaulting to recruiter - the
// most general operational home, mirroring systemDefaultFor's fallback).
export function dashboardKeyForRole(role: string | null | undefined): string {
  const r = (role ?? "").toLowerCase();
  const known = ["admin", "recruiter", "hiring_manager", "interviewer", "super_admin", "compliance_officer"];
  return `home:${known.includes(r) ? r : "recruiter"}`;
}

// Safely migrate+validate a candidate document. Returns the upgraded document or
// undefined if it cannot be made valid (so the caller falls through to the next
// tier instead of throwing).
function tryResolve(candidate: unknown): DashboardDocument | undefined {
  if (candidate === undefined || candidate === null) return undefined;
  try {
    return migrateDashboard(candidate);
  } catch {
    return undefined;
  }
}

// Pull a DashboardDocument out of a few tolerated response shapes ({ data: doc },
// { document: doc }, or a bare doc). Returns undefined when no usable object is
// present so the caller falls back to the next tier.
function readDocBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return undefined;
  const root = body as Record<string, unknown>;
  if (root.data && typeof root.data === "object") return root.data;
  if (root.document && typeof root.document === "object") return root.document;
  // A bare document carries widgets + layouts; treat that as the doc itself.
  if ("widgets" in root && "layouts" in root) return root;
  return undefined;
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = authToken();
  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * useDashboardLayout - resolve the active dashboard document for the signed-in
 * user AND expose the F2 write path (save / reset). The user override is fetched
 * from the F1 persistence API with a graceful fallback to the seeded system
 * default, so a tenant without the route deployed renders the WF5 board exactly.
 */
export function useDashboardLayout(): ResolvedDashboard {
  const { user } = useCurrentUser();
  const role = user?.role;

  const dashboardKey = useMemo(() => dashboardKeyForRole(role), [role]);

  // The seeded default for this role - the always-valid floor + the reset target.
  // Run through migrateDashboard so the same validating pass applies as on read.
  const systemDefault = useMemo(() => migrateDashboard(systemDefaultFor(role)), [role]);

  const [override, setOverride] = useState<DashboardDocument | undefined>(undefined);
  const [source, setSource] = useState<DashboardSource>("system");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<Error | undefined>(undefined);

  // Bump to force a re-read (reload / after reset).
  const [readNonce, setReadNonce] = useState(0);
  const reload = useCallback(() => setReadNonce((n) => n + 1), []);

  // ── READ: GET /api/me/dashboards/:key (user override) ─────────────────────
  // 404 / error / malformed -> fall back to the system default (override:
  // undefined, source: "system"). Never throws to the render path.
  useEffect(() => {
    let alive = true;
    setLoading(true);

    apiFetch(`/me/dashboards/${encodeURIComponent(dashboardKey)}`)
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 404) {
          // No personal override saved (or route absent in this env) -> default.
          setOverride(undefined);
          setSource("system");
          setLoading(false);
          return;
        }
        if (!res.ok) {
          // Any other non-OK -> graceful default, keep the WF5 board.
          setOverride(undefined);
          setSource("system");
          setLoading(false);
          return;
        }
        const body = await res.json().catch(() => null);
        const resolved = tryResolve(readDocBody(body));
        if (resolved) {
          setOverride(resolved);
          setSource("user");
        } else {
          // Corrupt/empty body -> fall through to the default rather than render
          // a broken grid.
          setOverride(undefined);
          setSource("system");
        }
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        // Network/transport error -> default. The WF5 board renders unchanged.
        setOverride(undefined);
        setSource("system");
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [dashboardKey, readNonce]);

  // The resolved document: user override wins, else the system default. (The
  // tenant tier is read server-side by the F1 GET when no user override exists,
  // so a tenant-default board arrives here AS the GET payload and is reported as
  // "user" precedence from the client's view; the explicit client-side tenant
  // fetch is intentionally not duplicated here.)
  const document = override ?? systemDefault;

  // Keep a ref to the latest key so async writes target the current board even
  // if the role changes mid-flight.
  const keyRef = useRef(dashboardKey);
  keyRef.current = dashboardKey;

  // ── WRITE: PUT /api/me/dashboards/:key (copy-on-write personal override) ───
  const save = useCallback(async (doc: DashboardDocument) => {
    setSaving(true);
    setSaveError(undefined);
    // Validate + normalize before sending so we never persist a malformed board.
    const normalized = migrateDashboard(doc);
    try {
      const res = await apiFetch(`/me/dashboards/${encodeURIComponent(keyRef.current)}`, {
        method: "PUT",
        body: JSON.stringify(normalized),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          res.status === 404
            ? "Saving isn't available yet (the dashboard persistence service is not reachable)."
            : `Save failed (${res.status}). ${text}`.trim(),
        );
      }
      // On success, prefer the server's echoed document (it may have normalized
      // further); otherwise keep what we sent. Optimistically promote to "user".
      const body = await res.json().catch(() => null);
      const echoed = tryResolve(readDocBody(body));
      setOverride(echoed ?? normalized);
      setSource("user");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setSaveError(error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  // ── RESET: DELETE /api/me/dashboards/:key then reload ─────────────────────
  const reset = useCallback(async () => {
    setSaving(true);
    setSaveError(undefined);
    try {
      const res = await apiFetch(`/me/dashboards/${encodeURIComponent(keyRef.current)}`, {
        method: "DELETE",
      });
      // 200/204 = deleted, 404 = nothing to delete (already on default). Both are
      // a successful "reset" from the user's point of view.
      if (!res.ok && res.status !== 404) {
        const text = await res.text().catch(() => "");
        throw new Error(`Reset failed (${res.status}). ${text}`.trim());
      }
      setOverride(undefined);
      setSource("system");
      // Re-read so any TENANT default (which the GET resolves server-side) is
      // picked up after the personal override is gone.
      reload();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setSaveError(error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [reload]);

  return {
    document,
    source,
    loading,
    dashboardKey,
    systemDefault,
    save,
    reset,
    reload,
    saving,
    saveError,
  };
}
