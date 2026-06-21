// apps/frontend/lib/registry/index.ts
// WF-B / B6 - the developer SDK BARREL for the customizable-UI program.
//
// This is the ONE public entrypoint a developer (or a per-tenant customization
// layer) imports from to register surfaces/widgets, place a custom block into a
// named slot, and read the resolved per-tenant UiConfig. Everything below is a
// thin RE-EXPORT of the real modules that own each capability - the barrel adds
// no behavior of its own, so importing from "@/lib/registry" is identical to
// importing from the underlying module, just under one stable name.
//
//   import {
//     registerSurfaceComponent, registerWidget,   // B1 surface registry
//     Slot, type SlotId,                            // B2 slot system
//     type InputSpec, type InputType,               // B1 input declarations
//     useUiConfig,                                  // resolved UiConfig (WF-C)
//   } from "@/lib/registry";
//
// ───────────────────────── HARD RULES (do not relax) ─────────────────────────
//  1. ADDITIVE + FAIL-SOFT. The barrel only RE-EXPORTS; it never registers a
//     surface, mounts a slot, or fetches a config at import time. Importing it
//     has zero side effects on an untouched tenant, which therefore keeps
//     resolving to the neutral, all-enabled UiConfig fallback and renders
//     byte-identically to the un-customized product.
//  2. REAL DATA OR HONEST EMPTY ONLY. The barrel surfaces the SAME real-data
//     invariant the registry enforces (validateSurfaceRegistry /
//     assertSurfaceRealSource are re-exported) - it adds no path that could bind
//     a surface to fabricated data, and the useUiConfig fallback returns the
//     contract's all-enabled config, never invented theme/nav values.
//
// NOTE: the underlying modules are the canonical homes; bug fixes go THERE, not
// here. Keep this file a disjoint, behavior-free re-export surface.

/* ───────────────────────── surface / widget registry (B1) ───────────────────── */
// The register API + the shared gate vocabulary + the filter/lookup helpers and
// the real-data validators. These are re-exported verbatim from B1's
// surface-registry, which owns the in-memory registry and the gate logic.
export {
  // registration
  registerSurfaceComponent,
  registerWidget,
  registerAllWidgets,
  // lookups
  getSurface,
  getWidgetSurface,
  listSurfaces,
  listSurfacesByKind,
  isSurfaceId,
  clearSurfaceRegistry,
  // gate / filter (identical to the dashboard widget catalog's filter())
  filter as filterSurfaces,
  isSurfaceAllowed,
  // real-data invariant (HARD RULE 2)
  validateSurfaceRegistry,
  assertSurfaceRealSource,
} from "./surface-registry";

// The registry's public TYPES: the entry + loader shapes, the configurable-input
// declaration types, the surface-kind union, and the shared role / plan gate
// vocabulary. `InputSpec` / `InputType` are the input-declaration types a surface
// exposes to the customization UI (the registry only DECLARES them; the consuming
// UI is responsible for hex-validating any `color` value before it reaches an
// inline <style>, mirroring the cd-shell isHex() discipline).
export type {
  SurfaceEntry,
  SurfaceKind,
  SurfaceComponentLoader,
  InputSpec,
  InputType,
  DashboardRole,
  PlanTier,
} from "./surface-registry";

/* ───────────────────────────────── slot system (B2) ────────────────────────── */
// The <Slot> component + the CLOSED SlotId union. A developer drops <Slot id=...>
// into a page; the slot reads the registered SlotBinding[] for that id, applies
// the SAME role/plan/module filter, layers the per-tenant config.surfaces binding
// on top (override-by-id, never an eject/fork), and renders each bound component
// lazily. An unknown / empty slot renders null (fail-soft). slots.tsx is the
// canonical home (created in this same WF-B Wire phase); re-exported here so the
// SDK has one import for placing custom blocks.
export { Slot } from "./slots";
export type { SlotId } from "./slots";

/* ─────────────────────────── resolved UiConfig (WF-C) ──────────────────────── */
// `useUiConfig` returns the per-tenant, validated UiConfig that drives theme /
// nav / route / copy / surface customization. WF-C LANDED the real provider at
// lib/config/ui-config-provider: a fail-soft, cached fetch of GET /api/me/ui-config
// (mirroring use-tenant-branding / use-modules) that runs the contracts migration
// ladder and resolves the precedence platform-default <- env <- tenant override
// <- per-user prefs. The barrel now RE-EXPORTS that real provider behind the SAME
// `useUiConfig` name the WF-B stub used, so any code that already calls it keeps
// compiling, and on an untouched tenant (no override, or /api/me/ui-config 404s)
// the provider fails soft to the neutral, all-enabled fallback (migrateUiConfig({})),
// so the app renders byte-identically (HARD RULE 1). The real
// `UseUiConfigResult` is a SUPERSET of the stub's (it adds the route/nav/copy
// helpers), so a call site reading only { config, loading, refresh } is unaffected.
//
// Re-export the contract type so SDK consumers type their config against the one
// canonical UiConfig shape from @cdc-ats/contracts.
export type { UiConfig } from "@cdc-ats/contracts";
export {
  useUiConfig,
  UiConfigProvider,
  clearUiConfigCache,
} from "@/lib/config/ui-config-provider";
export type { UseUiConfigResult } from "@/lib/config/ui-config-provider";
