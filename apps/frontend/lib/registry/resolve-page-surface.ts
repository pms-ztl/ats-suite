// apps/frontend/lib/registry/resolve-page-surface.ts
//
// WF-B / B4 - resolve an (ext) catch-all SLUG to a registered PAGE surface.
//
// The (ext)/[...slug] catch-all route maps a URL slug to a registered surface of
// kind "page" and renders it via next/dynamic using the GENERATED_SURFACES
// literal-import map (WF-B/B3). This module is the single, side-effect-free
// resolver both halves of that route share: the server page (to decide
// notFound() before any client work) and the client host (to apply the
// role/module/plan gate and pick the loader).
//
// THREE registries cooperate, all keyed by the SAME stable surface id:
//   1. surfaces.ts  (SURFACE_REGISTRATIONS / getSurfaceRegistration) - the
//      build-time manifest: id -> { importPath, label, roles?, requiredModule?,
//      planTier? }. This is the SOURCE OF TRUTH for "which slug maps to which
//      component" plus the gate metadata.
//   2. generated.ts (GENERATED_SURFACES / getSurfaceLoader)         - the emitted
//      literal-import map: id -> () => import("<literal path>"). This is the ONLY
//      place a webpack-analyzable lazy loader exists (next/dynamic cannot take a
//      variable import path).
//   3. surface-registry.ts (SurfaceEntry / getSurface / isSurfaceAllowed)        -
//      the runtime registry carrying the canonical { kind, roles, requiredModule,
//      planTier } gate shape and the shared filter.
//
// resolvePageSurface() unifies them: given a slug it produces a single
// PageSurface = { id, surface: SurfaceEntry(kind:"page"), loader } or null. It
// prefers an explicitly-registered runtime SurfaceEntry ("page:<id>") and falls
// back to BUILDING a kind:"page" SurfaceEntry from the manifest registration, so
// a page registered in the manifest alone still resolves with its gate intact.
//
// FAIL-SOFT (HARD RULE): a slug with no manifest registration, no generated
// loader, or a registration that is not a page resolves to null; the caller
// renders Next's notFound(). Nothing here fabricates a surface or a loader, and
// an untouched (empty) manifest resolves every slug to null - the (ext) group
// therefore 404s entirely until a developer registers a page, never affecting
// any existing route group.

import { getSurfaceRegistration, type SurfaceRegistration } from "./surfaces";
import { getSurfaceLoader, type SurfaceLoader } from "./generated";
import { getSurface, type SurfaceEntry } from "./surface-registry";

// A fully-resolved page surface: the stable id, the runtime SurfaceEntry (always
// kind:"page") carrying the gate the host evaluates, and the literal-import
// loader the host hands to next/dynamic. `roles` defaults to the empty array
// when a manifest registration omits it (the host's role gate then DENIES, so an
// unscoped page is closed-by-default rather than open to everyone).
export interface PageSurface {
  id: string;
  surface: SurfaceEntry;
  loader: SurfaceLoader;
}

// Normalize a catch-all `slug` (string[] | string | undefined) into the single
// surface id used as the registry key. Next gives `params.slug` as the path
// segments AFTER the (ext) group root, so we join with "/" to support nested
// ids; the manifest id alphabet (lower-kebab, validated by the codegen) does not
// itself contain "/", so a single-segment slug is the common case. Empty / absent
// slugs (the bare group root) yield "" which never matches a registration.
export function slugToSurfaceId(slug: string[] | string | undefined): string {
  if (Array.isArray(slug)) return slug.join("/");
  if (typeof slug === "string") return slug;
  return "";
}

// Build a kind:"page" SurfaceEntry from a manifest registration. The manifest
// carries the SAME optional gate trio { roles, requiredModule, planTier } as the
// runtime SurfaceEntry, so this is a straight adaptation - no gate is invented.
// The component loader points at the generated literal-import loader (the only
// webpack-analyzable one); the host actually mounts via next/dynamic, so this
// `component` is a faithful pass-through and never issues a second import.
function surfaceFromRegistration(
  reg: SurfaceRegistration,
  loader: SurfaceLoader,
): SurfaceEntry {
  return {
    id: `page:${reg.id}`,
    kind: "page",
    // Pass-through to the generated loader (Record<string,unknown> prop signature;
    // the registry never constructs these props, so the wider type is lossless).
    component: loader as SurfaceEntry["component"],
    // closed-by-default: a registration with no roles denies every caller at the
    // host's role gate rather than rendering to everyone.
    roles: reg.roles ?? [],
    requiredModule: reg.requiredModule,
    planTier: reg.planTier,
    // Page surfaces declare no dataSourceKey here (the page component owns its own
    // real-data binding + honest-empty rendering); undefined is exempt from the
    // real-data assertion exactly as a static page / slot is.
  };
}

// Resolve a catch-all slug to a single PageSurface, or null when the slug does
// not map to a renderable page. A surface resolves ONLY when BOTH a generated
// literal-import loader (webpack-analyzable) AND a gate-bearing SurfaceEntry of
// kind "page" exist for the id; either one missing -> null -> the caller 404s.
//
// Resolution order (first hit wins):
//   1. The runtime registry's explicit "page:<id>" entry, if one was registered
//      via registerSurfaceComponent (and it is kind:"page").
//   2. Otherwise, a kind:"page" SurfaceEntry BUILT from the manifest registration
//      for <id>, carrying that registration's gate verbatim.
// In both cases a generated loader for <id> MUST exist or the resolve fails (no
// loader = no webpack chunk = nothing to render).
export function resolvePageSurface(
  slug: string[] | string | undefined,
): PageSurface | null {
  const id = slugToSurfaceId(slug);
  if (!id) return null;

  // The literal-import loader is mandatory: without an emitted chunk there is
  // nothing for next/dynamic to mount. (Also the fail-soft posture when codegen
  // has not run: every id resolves to null and the (ext) group 404s.)
  const loader = getSurfaceLoader(id);
  if (!loader) return null;

  // Prefer an explicitly-registered runtime SurfaceEntry, but only if it is a
  // page. A non-page surface registered under this id (a widget / slot) is not a
  // routable page -> null (404), never rendered as a full screen.
  const explicit = getSurface(`page:${id}`);
  if (explicit) {
    if (explicit.kind !== "page") return null;
    return { id, surface: explicit, loader };
  }

  // Fall back to the manifest registration, adapted to a kind:"page" SurfaceEntry
  // so the gate (roles / module / plan) still applies.
  const reg = getSurfaceRegistration(id);
  if (!reg) return null;

  return { id, surface: surfaceFromRegistration(reg, loader), loader };
}
