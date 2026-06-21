// apps/frontend/lib/registry/surfaces.ts
//
// WF-B / B3 - the SURFACE REGISTRATIONS manifest (the codegen INPUT).
//
// A "surface" is a registered, developer-customizable PAGE region that a tenant
// UiConfig (packages/contracts ui-config.ts - SlotBindingSchema.componentId /
// UiSurfaceSchema) can target by id, and that the WF-B renderer mounts lazily.
// Because `next/dynamic` cannot take a VARIABLE import path, a surface cannot be
// stored as `{ id, importPath: string }` and then `import(importPath)` at
// runtime - webpack would not emit a chunk for it. So this manifest is the
// build-time SOURCE OF TRUTH that the codegen (scripts/gen-surface-registry.ts)
// reads to EMIT lib/registry/generated.ts, where each registration becomes a
// STATIC `() => import("<literal path>")` entry keyed by `id`.
//
// ───────────────────────── REGISTRATION CONVENTION ──────────────────────────
//  • Register a surface by adding ONE entry to SURFACE_REGISTRATIONS below.
//  • `id` - the stable surface id used by UiConfig slot bindings and by
//                   getSurfaceLoader(id). Lower-kebab, unique. Treated as the
//                   key in the generated map.
//  • `importPath` - a STRING LITERAL module specifier whose DEFAULT export is the
//                   surface's React component (e.g. "@/components/cd/screens/X").
//                   MUST be a literal in the source (the codegen copies it
//                   verbatim into a static `import("…")`); never build it from a
//                   variable. The path is what webpack statically analyzes.
//  • `roles` / `requiredModule` / `planTier` - OPTIONAL gates mirroring the
//                   dashboard registry filter() (lib/widgets/registry.ts) and the
//                   UiConfig SlotBinding gates. They are metadata only here; the
//                   renderer applies them (the codegen does not gate - it emits
//                   every registration so the loader always exists, and gating
//                   happens at mount where role/modules/plan are known). This
//                   keeps gating fail-soft: an unresolved gate never removes a
//                   surface the codegen already emitted.
//
// ADDITIVE + FAIL-SOFT: this manifest ships EMPTY in the baseline. An empty
// manifest makes the codegen emit the same empty map as the checked-in baseline
// generated.ts, so the build is byte-identical to the pre-WF-B product. Adding a
// registration only ADDS a lazy loader; it never changes an untouched tenant's
// render (a tenant with no UiConfig surface binding never resolves a surface id).
//
// NOTE: this module imports NO page components - it only declares their literal
// paths as strings - so it carries no client-only code and is safe to import
// from both the codegen (Node) and any server-side UiConfig validation.

// One surface registration. See the convention block above.
export interface SurfaceRegistration {
  // Stable, unique surface id (lower-kebab). Key in the generated map and the
  // value a UiConfig SlotBinding.componentId / UiSurface targets.
  id: string;
  // STRING LITERAL module specifier; its default export is the surface component.
  // Must be a literal so the codegen can emit a static, webpack-analyzable
  // `import("<importPath>")`.
  importPath: string;
  // Human label for tooling / the customization UI (optional).
  label?: string;
  // OPTIONAL gates (metadata; enforced by the renderer at mount, not the codegen).
  roles?: string[];
  requiredModule?: string;
  planTier?: string;
}

// The registry. EMPTY baseline (see ADDITIVE + FAIL-SOFT above). Add surfaces by
// appending entries; each MUST use a string-literal importPath.
//
// Example of the intended shape (commented out so the baseline stays empty and
// the generated map stays byte-identical to the checked-in baseline):
//
//   {
//     id: "candidates-board",
//     importPath: "@/components/cd/screens/CandBoard",
//     label: "Candidates board",
//     roles: ["admin", "recruiter", "hiring_manager"],
//     requiredModule: "core-hiring",
//   },
//
export const SURFACE_REGISTRATIONS: readonly SurfaceRegistration[] = [];

// Look up a registration by id (tooling / renderer metadata; the runtime LOADER
// lives in generated.ts via getSurfaceLoader, which is what mounts the component).
export function getSurfaceRegistration(id: string): SurfaceRegistration | undefined {
  return SURFACE_REGISTRATIONS.find((s) => s.id === id);
}
