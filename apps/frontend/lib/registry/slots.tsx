"use client";
// apps/frontend/lib/registry/slots.tsx
//
// WF-B / B2 - the SLOT SYSTEM for the developer-customizable UI program.
//
// A "slot" is a NAMED, fixed region inside a shipped screen that a custom block
// may mount into WITHOUT forking the screen. The set of slots is CLOSED (the
// SlotId union below): a developer never invents a slot at runtime, they bind a
// registered, real-data component INTO one of the seams the product exposes.
// This is the override-by-id seam the per-tenant UiConfig + the embed layer fill.
//
// HOW IT COMPOSES (the precedence the <Slot> component implements):
//   1. DEFAULT bindings - registered in-process via registerSlot(id, binding).
//      These are the components the product ships into a slot out of the box.
//   2. PER-TENANT bindings - the UiConfig the caller passes as `config`:
//      config.surfaces[route].slots[slotId] is an ordered SlotBinding[] (the
//      contracts SlotBindingSchema). These are LAYERED ON TOP of the defaults.
//   3. OVERRIDE-BY-ID - a binding (default or tenant) carries a stable `id`. A
//      later binding with the SAME id REPLACES the earlier one in place (it keeps
//      the earlier one's order unless it sets its own). This is how a tenant
//      re-skins a default slot block: bind a component under the default's id and
//      it is swapped, NEVER ejected/forked. A binding with a NEW id is appended.
//
// THE GATE IS THE SAME GATE. Every binding is filtered with the EXACT shared
// filter() / isSurfaceAllowed() from B1 (lib/registry/surface-registry.ts), which
// is byte-identical to the dashboard widget catalog's role + plan + module gate.
// A binding is dropped when the viewer's role, the tenant's enabled modules, or
// the tenant's plan do not qualify - the same way a widget or a page surface is.
//
// ───────────────────────── HARD RULES (do not relax) ─────────────────────────
//  1. ADDITIVE + FAIL-SOFT. An unknown slot id, a slot with no bindings, a
//     binding whose component is not in the generated import map, or an
//     unresolved gate ALL resolve to rendering NOTHING (null) for that piece -
//     never an error, never a fabricated block. An untouched tenant (no UiConfig,
//     no registered defaults) renders a <Slot> as null, so dropping a <Slot/> into
//     a screen is byte-identical to the un-slotted screen until something is bound.
//  2. REAL COMPONENTS ONLY. A binding's `componentId` is resolved through the B3
//     generated literal-import map (getSurfaceLoader). A componentId that is not
//     generated yields no loader -> the binding renders null. The slot system
//     mounts only registered, build-analyzed components; it never evals a path or
//     fabricates a renderer.
//  3. ONE GATE SHAPE. Slot bindings are gated by reusing B1's isSurfaceAllowed
//     (the same role/plan/module trio as SurfaceEntry + the widget catalog). There
//     is no second, drifting gate.
//
// This module owns NO data binding and NO chrome: each bound component owns its
// own data source (real-or-honest-empty) and its own rendering. The <Slot> only
// resolves WHICH components mount, gates them, and mounts them lazily.

import * as React from "react";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { useModules } from "@/hooks/use-modules";
import {
  // The shared gate from B1 - the SAME role+plan+module filter the widget catalog
  // and the surface registry use. We adapt each SlotBinding into the SurfaceEntry
  // gate shape and run isSurfaceAllowed over it, so a slot binding is gated
  // identically to a widget / a page surface (HARD RULE 3).
  isSurfaceAllowed,
  type SurfaceEntry,
} from "@/lib/registry/surface-registry";
// The B3 generated literal-import map: componentId -> lazy `() => import(...)`.
// A componentId that was never registered+generated resolves to undefined here
// and the binding renders null (HARD RULE 2, fail-soft).
import { getSurfaceLoader, type SurfaceLoader } from "@/lib/registry/generated";
// The canonical per-tenant UiConfig + its slot-binding DTO (WF-A contracts). The
// <Slot> reads config.surfaces[route].slots[slotId] off this exact shape.
import type { UiConfig, SlotBinding } from "@cdc-ats/contracts";

/* ─────────────────────────── the CLOSED slot id union ─────────────────────── */
// The fixed set of seams the product exposes. CLOSED on purpose: a screen author
// drops a <Slot id="…"/> at one of these named regions; a customization layer
// binds into the SAME ids. Adding a seam is a deliberate edit to this union (and
// a <Slot/> placement), never a runtime string. Each id names a region:
//   • shell.header.right        - the app chrome header, trailing edge.
//   • shell.nav.footer          - below the primary navigation.
//   • candidate.detail.before   - top of the candidate detail screen, pre-content.
//   • candidate.detail.sidebar  - the candidate detail right rail.
//   • requisition.detail.actions- the requisition detail action cluster.
//   • screening.verdict.footer  - under an AI screening verdict.
//   • dashboard.toolbar         - the customizable dashboard's toolbar.
export type SlotId =
  | "shell.header.right"
  | "shell.nav.footer"
  | "candidate.detail.before"
  | "candidate.detail.sidebar"
  | "requisition.detail.actions"
  | "screening.verdict.footer"
  | "dashboard.toolbar";

// All slot ids as a runtime set so a caller / test can validate an id at the
// boundary (e.g. a UiConfig referencing an unknown slot is ignored, not crashed).
export const SLOT_IDS: readonly SlotId[] = [
  "shell.header.right",
  "shell.nav.footer",
  "candidate.detail.before",
  "candidate.detail.sidebar",
  "requisition.detail.actions",
  "screening.verdict.footer",
  "dashboard.toolbar",
] as const;

// Type guard: is this string one of the closed slot ids?
export function isSlotId(id: string): id is SlotId {
  return (SLOT_IDS as readonly string[]).includes(id);
}

/* ─────────────────────────── the binding shape ────────────────────────────── */
// A DEFAULT slot binding registered in-process. It mirrors the contracts
// SlotBinding (componentId + the optional role/plan/module gate) and adds a
// stable `id` (the override key) plus an optional `order`. The contracts
// SlotBinding (per-tenant) has the same gate fields; we normalize both into this
// shape before filtering + ordering so defaults and tenant bindings compose under
// one rule. `componentId` MUST resolve through the B3 generated map.
export interface SlotBindingEntry {
  // Stable override key. A later binding (default or tenant) with the same id
  // REPLACES this one in place. Defaults to componentId when a tenant binding
  // omits an explicit id (so re-binding the same component is an override, and
  // adding a different component is an append).
  id: string;
  // The registered, build-analyzed component id (B3 getSurfaceLoader key).
  componentId: string;
  // Ordering within the slot (ascending). Stable insertion order breaks ties.
  order?: number;
  // ── the shared gate (same trio as SurfaceEntry / the widget catalog) ──
  roles?: string[];
  requiredModule?: string;
  planTier?: string;
}

/* ───────────────────────── the in-memory default registry ─────────────────── */
// Default slot bindings keyed by SlotId. Registration is additive + idempotent-
// by-(slot,id): re-registering a binding with the same id replaces it (so a hot-
// reload does not duplicate). An unregistered slot resolves to an empty list, so
// a <Slot/> with no defaults and no tenant bindings renders null (fail-soft).

const SLOT_REGISTRY = new Map<SlotId, Map<string, SlotBindingEntry>>();

// Register (or replace) a DEFAULT binding for a slot. The slot id MUST be one of
// the closed SlotId union (an unknown id throws, since a default binding is
// authored in-source, not received from a tenant). Returns the stored binding.
export function registerSlot(slotId: SlotId, binding: SlotBindingEntry): SlotBindingEntry {
  if (!isSlotId(slotId)) {
    throw new Error(`registerSlot: "${slotId}" is not a known SlotId.`);
  }
  if (!binding || typeof binding.id !== "string" || binding.id.length === 0) {
    throw new Error(`registerSlot: a binding for "${slotId}" must have a non-empty string id.`);
  }
  if (typeof binding.componentId !== "string" || binding.componentId.length === 0) {
    throw new Error(`registerSlot: binding "${binding.id}" must name a non-empty componentId.`);
  }
  let bucket = SLOT_REGISTRY.get(slotId);
  if (!bucket) {
    bucket = new Map<string, SlotBindingEntry>();
    SLOT_REGISTRY.set(slotId, bucket);
  }
  bucket.set(binding.id, binding);
  return binding;
}

// The registered DEFAULT bindings for a slot, in insertion order (empty for an
// unregistered slot). Exported for tooling / tests.
export function getDefaultSlotBindings(slotId: SlotId): SlotBindingEntry[] {
  const bucket = SLOT_REGISTRY.get(slotId);
  return bucket ? Array.from(bucket.values()) : [];
}

// Test / lifecycle seam: clear the default-binding registry. Used by tests that
// register a fixture set; NOT used by the running app (registration is additive).
export function clearSlotRegistry(): void {
  SLOT_REGISTRY.clear();
}

/* ───────────────────── per-tenant binding normalization ───────────────────── */
// Pull the tenant's bindings for one slot out of a UiConfig and normalize them to
// SlotBindingEntry. Path: config.surfaces[route].slots[slotId] (the contracts
// UiSurfaceSchema). A surface with enabled === false contributes NOTHING (the
// region is turned off for the tenant). A missing route / surface / slot yields
// an empty list (fail-soft). A tenant binding with no explicit id falls back to
// its componentId as the override key.
function tenantBindingsFor(
  config: UiConfig | null | undefined,
  route: string | undefined,
  slotId: SlotId,
): SlotBindingEntry[] {
  if (!config || !route) return [];
  const surface = config.surfaces?.[route];
  // A surface explicitly disabled for the tenant suppresses its slots entirely.
  if (!surface || surface.enabled === false) return [];
  const raw: SlotBinding[] | undefined = surface.slots?.[slotId];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (b): b is SlotBinding =>
        !!b && typeof b === "object" && typeof b.componentId === "string" && b.componentId.length > 0,
    )
    .map((b) => ({
      id: b.componentId, // override key = componentId (re-binding the same component overrides).
      componentId: b.componentId,
      order: typeof b.order === "number" ? b.order : undefined,
      roles: Array.isArray(b.roles) ? b.roles : undefined,
      requiredModule: typeof b.requiredModule === "string" ? b.requiredModule : undefined,
      planTier: typeof b.planTier === "string" ? b.planTier : undefined,
    }));
}

/* ─────────────────────── resolve: defaults + tenant + gate ─────────────────── */
// Compose the final, ordered, gated list of bindings for a slot:
//   1. start from the DEFAULT bindings (insertion order),
//   2. layer the TENANT bindings on top - override-by-id (same id replaces in
//      place, keeping the prior order when the override omits its own; a new id
//      is appended),
//   3. drop any binding whose gate (role + plan + module) fails - the SAME
//      isSurfaceAllowed from B1,
//   4. sort by `order` ascending, stable on resolution order for ties.
// `role` / `plan` come from the signed-in user; `enabledModules` is the resolved
// module set (undefined = the fail-soft all-enabled posture, so module gating is
// not applied until it is resolved - matching use-modules + the cd-shell nav).
export function resolveSlotBindings(
  slotId: SlotId,
  args: {
    config?: UiConfig | null;
    route?: string;
    role: string;
    enabledModules?: string[];
    plan?: string;
  },
): SlotBindingEntry[] {
  // 1 + 2: merge defaults then tenant bindings by id (last writer wins). A Map
  // keyed by binding id preserves first-seen order for stable ties while letting
  // a same-id tenant binding REPLACE a default in place (override, never eject).
  const merged = new Map<string, SlotBindingEntry>();
  for (const b of getDefaultSlotBindings(slotId)) merged.set(b.id, b);
  for (const b of tenantBindingsFor(args.config, args.route, slotId)) {
    const prior = merged.get(b.id);
    // When the tenant override omits its own order, inherit the default's order so
    // an in-place swap keeps its position.
    merged.set(b.id, prior && b.order === undefined ? { ...b, order: prior.order } : b);
  }

  // 3: gate each binding with the shared filter. We adapt the binding to the
  // SurfaceEntry gate shape (roles default to "every role" when a binding omits
  // them, so an un-gated binding is always allowed subject to plan/module). The
  // component/kind/id fields are placeholders the gate ignores.
  const gated = Array.from(merged.values()).filter((b) => {
    const asSurface: SurfaceEntry = {
      id: `slot:${slotId}:${b.id}`,
      kind: "slot",
      component: NULL_LOADER,
      roles: b.roles ?? ALL_ROLES,
      requiredModule: b.requiredModule,
      planTier: b.planTier,
    };
    return isSurfaceAllowed(asSurface, args.role, args.enabledModules, args.plan);
  });

  // 4: stable order ascending. Bindings without an explicit order sort after
  // ordered ones (treated as +∞) while preserving their relative resolution order.
  return gated
    .map((b, i) => ({ b, i }))
    .sort((x, y) => {
      const ox = x.b.order ?? Number.POSITIVE_INFINITY;
      const oy = y.b.order ?? Number.POSITIVE_INFINITY;
      if (ox !== oy) return ox - oy;
      return x.i - y.i; // stable on resolution order
    })
    .map((x) => x.b);
}

// A binding with no `roles` is allowed for every role (subject to plan/module).
// We hand the gate the full role vocabulary so isSurfaceAllowed's role check
// passes for any caller; plan + module still apply.
const ALL_ROLES: string[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
  "COMPLIANCE_OFFICER",
];

// A never-called loader handed to the placeholder SurfaceEntry the gate inspects
// (isSurfaceAllowed never invokes `component`). Keeps the adapter type-correct
// without importing a real component.
const NULL_LOADER: SurfaceEntry["component"] = () =>
  Promise.resolve({ default: () => null });

/* ────────────────────────── lazy mount of one binding ─────────────────────── */
// Mount a single resolved binding: resolve its componentId to the B3 generated
// loader and lazily render it with the typed `ctx` prop. An unknown componentId
// (not generated) yields no loader -> render null (fail-soft, HARD RULE 2). The
// React.lazy instance is memoized on the loader identity (the WidgetFrame
// convention) so it is stable across renders.
function BoundSlotComponent(props: { binding: SlotBindingEntry; ctx?: unknown }): React.ReactElement | null {
  const loader: SurfaceLoader | undefined = getSurfaceLoader(props.binding.componentId);
  const Lazy = React.useMemo(
    () => (loader ? React.lazy(loader) : null),
    [loader],
  );
  if (!Lazy) return null; // componentId not in the generated map -> fail-soft null.
  // The bound component owns its own data + render; we pass the typed slot ctx
  // (whatever the screen author handed <Slot ctx=…>) straight through.
  return <Lazy ctx={props.ctx} />;
}

/* ─────────────────────────────── <Slot> ────────────────────────────────────── */
// The component a screen author drops at a named seam. It resolves the gated +
// ordered bindings for `id`, then lazily mounts each in order. The screen passes
// the per-tenant `config` (resolved UiConfig) and the `route` key whose
// surfaces[route].slots holds the tenant bindings; both are OPTIONAL so a screen
// that has not wired UiConfig resolution yet still renders defaults-only (and, if
// there are none, null). `ctx` is the typed context object the bound components
// receive as a prop (e.g. the candidate id on candidate.detail.* slots).
//
// FAIL-SOFT: a slot with no resolved bindings renders null. Each bound component
// is wrapped in its own <Suspense fallback={null}> so a slow chunk never blocks
// the host screen and a failed import simply renders nothing for that piece.
export interface SlotProps {
  /** The closed slot id this seam exposes. */
  id: SlotId;
  /** Typed context handed to every bound component as a `ctx` prop. */
  ctx?: unknown;
  /** The resolved per-tenant UiConfig (optional; absent = defaults-only). */
  config?: UiConfig | null;
  /** The route key whose surfaces[route].slots holds the tenant bindings. */
  route?: string;
}

export function Slot({ id, ctx, config, route }: SlotProps): React.ReactElement | null {
  const { user } = useAuth();
  const { enabledKeys } = useModules();

  // Unknown id (defensive - the type already constrains it): render nothing.
  if (!isSlotId(id)) return null;

  const role = user?.role ?? "";
  const plan = user?.tenant?.plan;

  const bindings = resolveSlotBindings(id, {
    config,
    route,
    role,
    // enabledKeys is null on the all-enabled fallback (use-modules); passing
    // undefined there means "module gating not resolved -> hide nothing".
    enabledModules: enabledKeys ?? undefined,
    plan,
  });

  if (bindings.length === 0) return null; // fail-soft empty slot.

  return (
    <>
      {bindings.map((b) => (
        // key on the override id so React reconciles an in-place swap cleanly.
        <Suspense key={b.id} fallback={null}>
          <BoundSlotComponent binding={b} ctx={ctx} />
        </Suspense>
      ))}
    </>
  );
}
