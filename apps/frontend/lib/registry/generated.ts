// apps/frontend/lib/registry/generated.ts
//
// WF-B / B3 - GENERATED FILE. DO NOT EDIT BY HAND.
//
// Build-time LITERAL-IMPORT MAP for registered surfaces (pages). Emitted by
// apps/frontend/scripts/gen-surface-registry.ts from the registrations in
// apps/frontend/lib/registry/surfaces.ts. Next.js `next/dynamic` cannot take a
// variable import path, so each surface id below is wired to a STATIC
// `() => import("<literal path>")` loader that webpack can analyze.
//
// An environment that never runs codegen resolves every id to `undefined` and
// the consumer falls back to its un-customized render (fail-soft). Regenerate
// with `npm run gen:surfaces`; it runs automatically as the frontend
// `prebuild` step so the Docker builder emits a fresh map before `next build`.

import type * as React from "react";

// A lazy surface loader: a thunk returning a dynamic import of a module whose
// default export is the surface's React component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SurfaceLoader = () => Promise<{ default: React.ComponentType<any> }>;

// The generated map: surface id -> literal-import loader. Consumers MUST treat a
// missing key as "surface not generated -> fall back", never as an error.
export const GENERATED_SURFACES: Record<string, SurfaceLoader> = {};

// Resolve a surface id to its lazy loader, or undefined when the surface is not
// in the generated map (codegen not run, or the id was removed). Callers fall
// back to their default render on undefined (fail-soft).
export function getSurfaceLoader(surfaceId: string): SurfaceLoader | undefined {
  return GENERATED_SURFACES[surfaceId];
}
