"use client";
// app/(ext)/[...slug]/ext-surface-host.tsx
//
// WF-B / B4 - the CLIENT half of the (ext) catch-all. The server page
// (page.tsx) has already resolved the slug to a renderable PAGE surface (a
// generated literal-import loader + a kind:"page" SurfaceEntry carrying the gate)
// and 404'd when no surface matched. This host then, on the client where the
// signed-in user / plan / enabled-modules are known:
//   1. evaluates the SHARED role + module + plan gate (isSurfaceAllowed) against
//      the live auth context, and calls notFound() when it fails;
//   2. mounts the surface via next/dynamic from the GENERATED_SURFACES loader
//      (the server cannot do this without re-deriving the loader, and ssr:false
//      keeps a client-only surface out of SSR);
//   3. wraps the surface in a .cd-scope themed by the tenant brand ramp, using the
//      VERBATIM buildBrandStyle mechanism from cd-shell.tsx / embed-shell.tsx, so a
//      registered page renders white-labelled and with the Aurora tokens resolving
//      - and an untouched tenant (no/invalid brand hex) keeps the emerald defaults
//      byte-identically.
//
// FAIL-SOFT + CSS-injection defense:
//   - We gate against the REAL auth context (useAuth) + the REAL module set
//     (useModules), never the lib/auth mock. While auth is still loading we render
//     a neutral placeholder rather than prematurely 404'ing a valid-but-loading
//     session. Modules unresolved -> all-enabled (use-modules' documented
//     fallback), matching the cd-shell nav, so module gating never hides a page
//     the user actually has.
//   - The ONLY value that reaches an inline <style> is the brand hex, and it is
//     accepted ONLY when isHex() matches a strict 3/6-digit hex (identical to
//     cd-shell), then run through brandRamp() which emits oklch() channels. A
//     hostile branding value can never break out of the style literal.
import * as React from "react";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import { useModules } from "@/hooks/use-modules";
import { useTenantBranding } from "@/hooks/use-tenant-branding";
import { brandRamp } from "@/lib/theme/brand-ramp";
import { getSurfaceLoader } from "@/lib/registry/generated";
import { isSurfaceAllowed, type SurfaceEntry } from "@/lib/registry/surface-registry";

/* ───────────────────────── brand ramp (verbatim from cd-shell) ───────────────────────── */
// A valid 3- or 6-digit hex is the ONLY trigger for tenant theming - matches
// cd-shell.tsx / embed-shell.tsx exactly. Anything else leaves the .cd-scope
// emerald defaults from cd-tokens.css untouched (byte-identical for untouched tenants).
function isHex(hex: string | null | undefined): hex is string {
  return !!hex && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex);
}

const BRAND_KEYS = [
  "--brand", "--brand-2", "--brand-ink", "--brand-tint", "--brand-tint-2", "--on-brand",
] as const;

function buildBrandStyle(hex: string, scopeId: string): string {
  const ramp = brandRamp(hex);
  const decls = (side: Record<string, string>): string =>
    BRAND_KEYS.map((k) => {
      const color = `oklch(${side[k]})`;
      const cKey = k.replace(/^--/, "--c-");
      return `${k}:${color};${cKey}:${color};`;
    }).join("");
  const sel = `.cd-scope[data-cd-brand="${scopeId}"]`;
  return `${sel}{${decls(ramp.light)}}\n.dark ${sel}{${decls(ramp.dark)}}`;
}

/* ───────────────────────── role normalization ───────────────────────── */
// The auth context stamps role UPPERCASE (e.g. "ADMIN"); surface registrations
// (mirroring the cd-shell nav) often use the lowercase form ("admin"). The shared
// gate (isSurfaceAllowed) does an exact roles.includes(role), so we first resolve
// which CASING of the caller's role the entry actually lists - verbatim, then
// lower, then upper - the same dual-case tolerance lib/use-permissions.ts applies.
// Returns the matched casing, or null when no casing is listed (role denied).
function matchedRoleCasing(entry: SurfaceEntry, role: string): string | null {
  if (entry.roles.includes(role)) return role;
  const lower = role.toLowerCase();
  if (entry.roles.includes(lower)) return lower;
  const upper = role.toUpperCase();
  if (entry.roles.includes(upper)) return upper;
  return null;
}

// Apply the full shared gate with dual-case role tolerance. Once the listed role
// casing is resolved we delegate ENTIRELY to isSurfaceAllowed, so the role + plan
// + module gate stays byte-identical to the widget catalog / surface registry.
function gatePasses(
  entry: SurfaceEntry,
  role: string,
  enabledModules: string[] | undefined,
  plan: string | undefined,
): boolean {
  const roleForGate = matchedRoleCasing(entry, role);
  if (roleForGate === null) return false;
  return isSurfaceAllowed(entry, roleForGate, enabledModules, plan);
}

/* ───────────────────────── the host ───────────────────────── */
export function ExtSurfaceHost({
  surfaceId,
  surface,
}: {
  surfaceId: string;
  // The kind:"page" SurfaceEntry the server resolved (gate-bearing). Its
  // `component` is the generated loader, but we re-resolve the loader by id below
  // so the import path stays a single source of truth (the generated map).
  surface: SurfaceEntry;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { enabledKeys, allEnabled, loading: modulesLoading } = useModules();
  const { branding } = useTenantBranding();

  // The live gate inputs. Modules: undefined => "not resolved => all-enabled"
  // (the documented fail-soft posture); only pass an explicit list once resolved.
  const role = user?.role ?? "";
  const plan = user?.tenant?.plan;
  const enabledModules = allEnabled || !enabledKeys ? undefined : enabledKeys;

  // The literal-import loader (the ONLY webpack-analyzable one). next/dynamic with
  // ssr:false keeps a client-only surface out of SSR; the server already
  // confirmed this loader exists, but we guard for the defensive case.
  const Surface = useMemo(
    () =>
      dynamic(() => getSurfaceLoader(surfaceId)?.() ?? Promise.resolve({ default: () => null }), {
        ssr: false,
        loading: () => (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
            Loading...
          </div>
        ),
      }),
    [surfaceId],
  );

  // Brand-ramp <style> scoped to THIS host's .cd-scope. Only a valid hex themes;
  // anything else keeps the emerald defaults (untouched tenants byte-identical).
  const scopeId = useMemo(() => `ext-${surfaceId.replace(/[^a-z0-9-]/gi, "-")}`, [surfaceId]);
  const brandStyle = useMemo(() => {
    const hex = branding?.brandPrimaryColor;
    return isHex(hex) ? buildBrandStyle(hex, scopeId) : null;
  }, [branding?.brandPrimaryColor, scopeId]);

  // Wait for the live session to resolve before deciding: a valid-but-loading
  // session must not be prematurely 404'd. Modules may still be loading; that is
  // fine (it just means all-enabled until resolved), so we do NOT block on it.
  if (isLoading) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
        Loading...
      </div>
    );
  }

  // An unauthenticated visitor (no real session) is not entitled to a gated app
  // surface -> 404 (the (ext) surfaces are authed app screens; the public portal
  // / embed have their own route groups). useRequireAuth-style redirects are the
  // job of middleware; here we simply do not render a gated surface to a non-user.
  if (!isAuthenticated || !user) {
    notFound();
  }

  // The SHARED gate: role + plan + module, identical to the widget catalog /
  // surface registry, with dual-case role tolerance. Fail -> 404.
  if (!gatePasses(surface, role, enabledModules, plan)) {
    notFound();
  }

  // While modules are resolving we still render (all-enabled fallback already
  // applied above), so there is no flash-then-404 for a module-gated page the
  // user actually has. (modulesLoading kept for clarity / future use.)
  void modulesLoading;

  return (
    <div className="cd-scope" data-cd-brand={scopeId} style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)" }}>
      {brandStyle ? <style dangerouslySetInnerHTML={{ __html: brandStyle }} /> : null}
      <Surface />
    </div>
  );
}
