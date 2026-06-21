// app/(ext)/[...slug]/page.tsx
//
// WF-B / B4 - the (ext) catch-all ROUTE. The (ext) route group is a NEW,
// zero-overlap surface area (no segment of its own; it never collides with the
// (dashboard), (embed), (candidate-portal), or (auth) groups because those route
// matchers are all rooted at concrete paths the manifest never re-registers). It
// maps an arbitrary URL slug to a developer-REGISTERED surface of kind "page" and
// renders it through next/dynamic via the GENERATED_SURFACES literal-import map
// (WF-B/B3).
//
// ── how a slug resolves ───────────────────────────────────────────────────────
//   /ext/<a>/<b>/...  ->  params.slug = ["a","b",...]  ->  surface id "a/b/..."
// resolvePageSurface(slug) (the shared, side-effect-free resolver) requires BOTH:
//   • a GENERATED literal-import loader for that id (getSurfaceLoader) - the only
//     webpack-analyzable lazy import; absent => the chunk does not exist => 404; and
//   • a gate-bearing kind:"page" SurfaceEntry for that id - either an explicitly
//     registered "page:<id>" runtime entry, or one BUILT from the manifest
//     registration (carrying its roles / requiredModule / planTier verbatim).
// Anything else - unknown slug, non-page surface, or codegen-not-run (empty map) -
// resolves to null and we render Next's notFound() (404).
//
// ── server / client split ─────────────────────────────────────────────────────
// This file is a SERVER component: it only resolves the slug -> PageSurface and
// 404s when nothing matches, doing zero client work for a miss. The role / module
// / plan GATE and the actual next/dynamic mount happen in the client host
// (ext-surface-host.tsx), because the signed-in user, plan, and enabled-module set
// are known only on the client (the frontend has no server session) and a
// client-only surface needs ssr:false. The SurfaceEntry's lazy `component` and
// the generated loader are not JSON-serializable, so we pass only the plain,
// serializable id + the gate fields the host needs across the server/client
// boundary, and the host re-resolves the loader by id from the generated map.
//
// FAIL-SOFT: the baseline manifest is EMPTY, so every (ext) slug 404s until a
// developer registers a page surface; the existing route groups are untouched and
// no tenant's render changes.

import { notFound } from "next/navigation";
import { resolvePageSurface } from "@/lib/registry/resolve-page-surface";
import { ExtSurfaceHost } from "./ext-surface-host";

// (ext) surfaces are resolved at request time from the in-memory registry +
// generated map, never prerendered: a surface id only exists once a developer
// registers it, and gating depends on the live (client) session. Force-dynamic
// so Next does not attempt to statically collect catch-all params.
export const dynamic = "force-dynamic";

interface ExtPageProps {
  // Next 14 passes the catch-all segments as a synchronous params object. A
  // required catch-all ([...slug]) always provides an array for a matched path.
  params: { slug?: string[] };
}

export default function ExtCatchAllPage({ params }: ExtPageProps) {
  // Resolve the slug -> a renderable page surface (loader + gate-bearing entry).
  // A miss (unknown slug / non-page / codegen not run) 404s here, server-side,
  // before any client component mounts.
  const resolved = resolvePageSurface(params.slug);
  if (!resolved) {
    notFound();
  }

  // Hand the client host ONLY serializable data: the stable id (it re-resolves the
  // literal-import loader by id) and the gate fields. We rebuild a minimal,
  // serializable SurfaceEntry-shaped object for the gate; the host never invokes
  // `component` (it mounts via the generated loader), so a no-op component keeps
  // the shape valid without crossing a non-serializable function over the boundary.
  const { id, surface } = resolved;
  const gateEntry = {
    id: surface.id,
    kind: surface.kind,
    // The host re-resolves the real loader by id; this placeholder satisfies the
    // SurfaceEntry shape and is never called.
    component: () => Promise.resolve({ default: () => null }),
    roles: surface.roles,
    requiredModule: surface.requiredModule,
    planTier: surface.planTier,
    dataSourceKey: surface.dataSourceKey,
  };

  return <ExtSurfaceHost surfaceId={id} surface={gateEntry} />;
}
