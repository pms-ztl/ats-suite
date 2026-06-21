// lib/registry/surface-registry.ts
// WF-B / B1 - the SURFACE REGISTRY for the developer-customizable UI program.
//
// A "surface" is any pluggable piece of the running app a developer (or a
// customization layer) may place, re-skin, or gate: a whole PAGE (e.g. the
// candidates screen), a dashboard WIDGET (e.g. the KPI scorecard), or a named
// SLOT inside a page (a region a custom block can mount into). This module is
// the single in-memory catalog of those surfaces, keyed by a stable id, behind
// ONE gate shape and ONE filter - the exact same role + plan + module gate the
// dashboard widget catalog already uses (lib/widgets/registry.ts filter()), so a
// surface and a widget are gated identically.
//
// ───────────────────────── HARD RULES (do not relax) ─────────────────────────
//  1. REAL DATA OR HONEST EMPTY ONLY. A surface that binds a data source MUST
//     bind a `dataSourceKey` whose lib/widgets/sources row is `realData: true`.
//     This is the assertRealSource invariant from the widget catalog, copied
//     here as validateSurfaceRegistry(): a surface pointed at a landmine (or a
//     typo'd / missing key) throws on validation, in dev and at build, instead
//     of silently rendering a fabricated metric. A surface that reads NO tenant
//     data (a static page, a layout slot) declares `dataSourceKey: undefined`
//     and is exempt - exactly as markdown_note / quick_actions are in the
//     widget catalog.
//  2. ADDITIVE + FAIL-SOFT. Registering a surface never removes another. The
//     filter() is byte-identical to the widget catalog's: an undefined
//     `enabledModules` means "module gating not resolved here -> hide nothing"
//     (the all-enabled fallback), and a surface with no `requiredModule` is
//     always available subject only to role + plan. An untouched registry
//     resolves to all-enabled, so wrapping the existing widget catalog cannot
//     regress what the dashboard already shows.
//  3. ONE GATE SHAPE. Surfaces and widgets share `{ roles, requiredModule,
//     planTier }`. registerWidget() adapts the existing CatalogEntry (which
//     already carries that exact gate) into a SurfaceEntry verbatim, so there is
//     no second, drifting gate to keep in sync.
//
// The registry holds LAZY component loaders only - `() => import(...)` - so this
// module carries no client-only viz/page code at import time and can be consumed
// by server-side validation of a saved layout as well as by the placement UI.

// React is referenced only for the component TYPE in SurfaceComponentLoader /
// SurfaceEntry - a type-only import, so this module pulls in no React runtime and
// stays importable from server-side validation paths.
import type * as React from "react";
import {
  // The role / plan vocabulary + the EXACT plan-rank table the widget catalog
  // gates with. Reused verbatim so the surface gate and the widget gate are the
  // same gate (HARD RULE 3), not two copies that can drift.
  type DashboardRole,
  type PlanTier,
  // The widget catalog: every registered widget, already carrying the shared
  // gate, a real `dataSourceKey`, and a lazy `component`. registerWidget()
  // adapts these into SurfaceEntry form so widgets live in the surface registry
  // under one filter.
  listCatalog,
  getCatalogEntry,
  type CatalogEntry,
} from "@/lib/widgets/registry";
// The data-source registry (E1) is the single source of truth for whether a
// bound source is REAL. We resolve + check it here exactly as the widget catalog
// does (assertRealSource), keeping the real-data invariant in one place.
import { getSource, type DataSource } from "@/lib/widgets/sources";

/* ─────────────────────────── re-exported gate vocab ─────────────────────────── */
// Re-export the role / plan types so callers import the surface gate vocabulary
// from one place (lib/registry/surface-registry) without reaching back into the
// widget catalog. These ARE the widget catalog's types - same union, same ranks.
export type { DashboardRole, PlanTier };

// The plan ladder, smallest -> largest. Kept private and identical to the widget
// catalog's PLAN_RANK so the plan gate compares ranks the same way. (The widget
// catalog does not export its PLAN_RANK; we replicate the identical table here so
// the two filters compute the same answer for the same inputs.)
const PLAN_RANK: Record<PlanTier, number> = {
  FREE: 0,
  STARTER: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

/* ──────────────────────────────── surface kinds ────────────────────────────── */

// What kind of surface this is:
//   - "page"   - a whole routed screen (e.g. the candidates page). component is
//                the page-level renderer (a components/cd/*-live wrapper).
//   - "widget" - a dashboard widget placed on the customizable grid. These are
//                adapted from the existing widget catalog via registerWidget().
//   - "slot"   - a named region inside a page that a custom block may mount into
//                (the seam the embed / per-tenant customization layer fills).
export type SurfaceKind = "page" | "widget" | "slot";

/* ─────────────────────────────── input specs ──────────────────────────────── */

// The primitive input types a surface may declare for its configurable inputs.
// `color` / `file` carry CSS-injection / upload concerns the consuming UI must
// honor (a color value MUST be hex-validated before it reaches any inline
// <style>, mirroring the cd-shell isHex() discipline); the registry only
// DECLARES the input - it never renders it - so it stores no user value.
export type InputType =
  | "string"
  | "number"
  | "boolean"
  | "color"
  | "enum"
  | "file"
  | "list"
  | "object";

// One configurable input a surface exposes to the customization UI. `name` is the
// machine key (written into the surface's config); `friendlyName` is the label
// shown to a developer. `options` is required-by-convention for `enum` inputs
// (the choice list); `defaultValue`, when present, seeds the input.
export interface InputSpec {
  name: string;
  type: InputType;
  defaultValue?: unknown;
  friendlyName?: string;
  options?: { label: string; value: string }[];
}

/* ─────────────────────────────── surface entry ────────────────────────────── */

// A lazy component loader: the React.lazy-compatible `() => import(...)` form, so
// the registry holds no client-only code at import time.
export type SurfaceComponentLoader = () => Promise<{
  default: React.ComponentType<Record<string, unknown>>;
}>;

// One registered surface. `id` is a stable, namespaced key
// (e.g. "page:candidates", "widget:kpi_scorecard", "slot:home.banner"). The gate
// trio { roles, requiredModule, planTier } is the SAME shape the widget catalog
// uses (HARD RULE 3). `dataSourceKey`, when set, MUST resolve to a realData:true
// E1 source (HARD RULE 1); a surface that reads no tenant data leaves it
// undefined and is exempt from the real-data assertion.
export interface SurfaceEntry {
  id: string;
  kind: SurfaceKind;
  // Lazy loader for the surface's React component. The component owns its own
  // data binding + honest-empty rendering (the registry never renders).
  component: SurfaceComponentLoader;
  // ── the shared gate (identical to CatalogEntry's gate) ──
  // Roles allowed to see / place this surface. Lowercased OR uppercased role
  // keys both flow through filter() verbatim against the caller's role; the
  // canonical DashboardRole union is uppercase (matches the widget catalog).
  roles: string[];
  // Module key (packages/common MODULE_REGISTRY) that must be enabled for the
  // tenant before this surface is offered. Omit = always available (role+plan).
  requiredModule?: string;
  // Minimum plan tier required. Omit = available on every plan.
  planTier?: string;
  // ── optional binding + config ──
  // The E1 data-source key this surface binds (realData:true, asserted by
  // validateSurfaceRegistry). Undefined for source-less surfaces (static pages,
  // slots, the source-less utility widgets).
  dataSourceKey?: string;
  // Default surface-specific config (merged under any developer override).
  defaultConfig?: Record<string, unknown>;
  // The configurable inputs this surface exposes to the customization UI.
  inputs?: InputSpec[];
}

/* ─────────────────────────── the in-memory registry ───────────────────────── */
// A single process-local Map keyed by surface id. Registration is idempotent-by-
// replace for a given id (last writer wins) so a hot-reload / re-import does not
// throw on a duplicate; validateSurfaceRegistry() is the fail-fast checkpoint.

const REGISTRY = new Map<string, SurfaceEntry>();

// Register (or replace) a surface by id. Returns the stored entry. The id must be
// a non-empty string; everything else is validated by validateSurfaceRegistry()
// so a caller can register a batch and then validate once.
export function registerSurfaceComponent(entry: SurfaceEntry): SurfaceEntry {
  if (!entry || typeof entry.id !== "string" || entry.id.length === 0) {
    throw new Error("registerSurfaceComponent: a surface must have a non-empty string id.");
  }
  REGISTRY.set(entry.id, entry);
  return entry;
}

// Adapt an existing widget CatalogEntry into a SurfaceEntry and register it under
// the canonical "widget:<type>" id. This is the "re-export/wrap the existing
// widget registry's register" path: the widget catalog has no register() of its
// own (it is a static CATALOG), so we wrap each catalog entry, carrying its gate
// { roles, requiredModule, planTier }, its real `dataSourceKey`, its
// `defaultConfig`, and its lazy `component` straight through. The gate shape is
// already identical, so nothing is reshaped - only the lazy component is wrapped
// to the surface loader's `Record<string, unknown>` prop signature (the widget
// wrapper actually receives WidgetRenderProps; the registry never constructs
// these props, so the wider prop type is safe and lossless).
export function registerWidget(catalogEntry: CatalogEntry): SurfaceEntry {
  const entry: SurfaceEntry = {
    id: `widget:${catalogEntry.type}`,
    kind: "widget",
    // The catalog's `component` is already a deferred (React.lazy) import; the
    // surface loader resolves to that SAME lazy component instance via a thin
    // pass-through, so no second import is issued and the widget renders through
    // the catalog's own WF5 wrapper.
    component: () =>
      Promise.resolve({
        default: catalogEntry.component as unknown as React.ComponentType<
          Record<string, unknown>
        >,
      }),
    roles: catalogEntry.roles,
    requiredModule: catalogEntry.requiredModule,
    planTier: catalogEntry.planTier,
    // null in the catalog (source-less widget) -> undefined here (exempt).
    dataSourceKey: catalogEntry.dataSourceKey ?? undefined,
    defaultConfig: catalogEntry.defaultConfig,
  };
  return registerSurfaceComponent(entry);
}

// Wrap EVERY registered widget into the surface registry in one call. Idempotent
// (re-registers by id). Call this once at module init of the customization UI so
// widgets and pages/slots live under the same filter. Returns the wrapped count.
export function registerAllWidgets(): number {
  let n = 0;
  for (const catalogEntry of listCatalog()) {
    registerWidget(catalogEntry);
    n += 1;
  }
  return n;
}

/* ─────────────────────────────── lookups ──────────────────────────────────── */

// Resolve a surface by id, or undefined for an unknown id. Consumers MUST treat
// undefined as "drop this surface" rather than rendering something unregistered.
export function getSurface(id: string): SurfaceEntry | undefined {
  return REGISTRY.get(id);
}

// All registered surfaces as an array (enumeration for the placement UI).
export function listSurfaces(): SurfaceEntry[] {
  return Array.from(REGISTRY.values());
}

// All registered surfaces of a given kind (e.g. only pages, only widgets).
export function listSurfacesByKind(kind: SurfaceKind): SurfaceEntry[] {
  return listSurfaces().filter((s) => s.kind === kind);
}

// Type guard: is this id a registered surface?
export function isSurfaceId(id: string): boolean {
  return REGISTRY.has(id);
}

// Test / lifecycle seam: clear the registry. Used by tests that register a
// fixture set; NOT used in the running app (registration is additive there).
export function clearSurfaceRegistry(): void {
  REGISTRY.clear();
}

/* ────────────────────────── the gate / filter ─────────────────────────────── */
// REUSE of lib/widgets/registry.ts filter() - the logic below is byte-identical
// to the widget catalog's role + plan + module gate, applied to surfaces:
//     - role   - entry.roles must include the caller's role.
//     - plan   - when entry.planTier is set AND a plan is known, the tenant's plan
//              rank must meet it.
//     - module - when entry.requiredModule is set AND `enabledModules` is provided,
//              the module must be in the enabled set, else the surface is DROPPED.
//              `enabledModules` undefined = "module gating not resolved here" =
//              hide nothing (the fail-soft all-enabled posture, matching
//              use-modules' fallback and the cd-shell nav). A surface with NO
//              requiredModule is ALWAYS available (role + plan only), so the gate
//              is purely additive and cannot regress the pre-module behavior.

// Apply the shared gate to a single surface. Exported so a page can ask "may this
// caller see this one surface?" without enumerating the whole registry.
export function isSurfaceAllowed(
  entry: SurfaceEntry,
  role: string,
  enabledModules?: string[],
  plan?: string,
): boolean {
  // Role gate.
  if (!entry.roles.includes(role)) return false;

  // Plan gate (only when both the entry requires a tier and a plan is known).
  if (entry.planTier && plan && plan in PLAN_RANK) {
    const need = PLAN_RANK[entry.planTier as PlanTier];
    const have = PLAN_RANK[plan as PlanTier];
    if (need !== undefined && have !== undefined && have < need) return false;
  }

  // Module gate (only when an enabled-module list is explicitly provided).
  if (entry.requiredModule && enabledModules) {
    if (!enabledModules.includes(entry.requiredModule)) return false;
  }

  return true;
}

// The placement filter: the surfaces a caller MAY see/place given their role, the
// tenant's enabled modules, and the tenant's plan. Same signature + semantics as
// the widget catalog's filter(); pass `enabledModules` undefined for the fail-soft
// all-enabled posture, or an explicit (possibly empty) list to enforce module
// gating. Optionally restrict to a single kind.
export function filter(
  role: string,
  enabledModules?: string[],
  plan?: string,
  kind?: SurfaceKind,
): SurfaceEntry[] {
  return listSurfaces().filter((entry) => {
    if (kind && entry.kind !== kind) return false;
    return isSurfaceAllowed(entry, role, enabledModules, plan);
  });
}

/* ──────────────────────── load-time real-data invariant ───────────────────── */
// HARD RULE 1, copied from the widget catalog's assertRealSource: every surface
// that NAMES a `dataSourceKey` MUST resolve to a realData:true E1 source. A
// surface with no dataSourceKey reads no tenant data and is exempt (a static
// page, a slot, a source-less utility widget). This is a fail-fast invariant: a
// caller registers its surfaces, then calls validateSurfaceRegistry() once; a
// surface bound to a landmine (realData:false), a typo'd key, or a removed source
// THROWS, so a regression that points a surface at fabricated data fails in dev
// and at build instead of silently rendering a fake metric.

function assertRealSurfaceSource(entry: SurfaceEntry): void {
  // Source-less surface: reads no tenant data -> exempt. (Mirrors the widget
  // catalog's SOURCELESS_TYPES exemption for markdown_note / quick_actions.)
  if (entry.dataSourceKey === undefined || entry.dataSourceKey === null) {
    return;
  }
  if (typeof entry.dataSourceKey !== "string" || entry.dataSourceKey.length === 0) {
    throw new Error(
      `Surface registry: "${entry.id}" declares a non-string / empty dataSourceKey.`,
    );
  }
  const source: DataSource | undefined = getSource(entry.dataSourceKey);
  if (!source) {
    throw new Error(
      `Surface registry: "${entry.id}" -> unknown dataSourceKey "${entry.dataSourceKey}" (not in lib/widgets/sources).`,
    );
  }
  if (!source.realData) {
    throw new Error(
      `Surface registry: "${entry.id}" -> "${entry.dataSourceKey}" is a realData:false landmine (${source.blockedReason ?? "no real source"}). Only realData:true sources may be bound.`,
    );
  }
}

// Validate the WHOLE registry's real-data invariant. Call this AFTER registering
// the surface set (and registerAllWidgets()). Throws on the first offending
// surface; returns the validated count on success so a caller can assert it ran.
export function validateSurfaceRegistry(): number {
  let n = 0;
  for (const entry of REGISTRY.values()) {
    assertRealSurfaceSource(entry);
    n += 1;
  }
  return n;
}

// Validate a single entry's real-data invariant (used at registration time by a
// caller that wants to fail fast on one surface rather than batch-validate).
export function assertSurfaceRealSource(entry: SurfaceEntry): void {
  assertRealSurfaceSource(entry);
}

/* ─────────────────────── compatibility with the widget catalog ────────────── */
// A convenience for callers that already hold a widget `type` (e.g. a saved
// DashboardDocument widget): resolve it to its surface id and entry through the
// registry, falling back to wrapping the catalog entry on demand if the bulk
// registerAllWidgets() has not been called yet. Keeps the surface registry the
// one place a widget is looked up from in the customization UI.
export function getWidgetSurface(type: string): SurfaceEntry | undefined {
  const existing = REGISTRY.get(`widget:${type}`);
  if (existing) return existing;
  const catalogEntry = getCatalogEntry(type);
  if (!catalogEntry) return undefined;
  return registerWidget(catalogEntry);
}
