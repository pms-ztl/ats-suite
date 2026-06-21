# UI Customization (Developer Guide)

How a developer customizes the in-app shell of the ATS: brand theme, navigation,
route enablement, copy, and the components mounted into named page regions. This
is the developer reference for the WF-A through WF-D customizable-UI program.

Two foundational rules govern every customization in this guide:

1. **Additive and fail-soft.** Every customization is opt-in. A tenant that has
   authored nothing resolves to the neutral, all-enabled default and renders
   byte-identically to the un-customized product. A missing override, a 404 from
   the config endpoint, an unknown id, or a failed gate resolves to "render the
   default / render nothing", never to an error or a fabricated value.
2. **The schema is the injection boundary.** Every free-text value that can reach
   an inline `<style>` or attribute (hex colors, font family, font/logo/favicon
   URLs) is validated by the typed contract (`UiConfigSchema.parse`) before it can
   reach any style sink. Callers may trust a parsed `UiConfig`.

---

## Table of contents

1. [The typed `UiConfig` contract](#1-the-typed-uiconfig-contract)
2. [The closed slot-id list and registering into a slot](#2-the-closed-slot-id-list-and-registering-into-a-slot)
3. [The `InputSpec` field-type reference](#3-the-inputspec-field-type-reference)
4. [Adding a custom page: the `(ext)/[...slug]` codegen route](#4-adding-a-custom-page-the-extslug-codegen-route)
5. [Override-by-id precedence](#5-override-by-id-precedence)
6. [The three editing surfaces](#6-the-three-editing-surfaces)
7. [The two trust tiers](#7-the-two-trust-tiers)
8. [Quick reference: file map](#8-quick-reference-file-map)

---

## 1. The typed `UiConfig` contract

A `UiConfig` is the persisted, per-tenant description of how the product chrome
looks and behaves. It is the UI sibling of the dashboard document and the module
manifest, and is validated by the same Zod-everywhere discipline so the gateway,
the persistence service, and the frontend all agree on one shape.

**Zod shape:** [`packages/contracts/src/ui-config.ts`](../packages/contracts/src/ui-config.ts)
exports `UiConfigSchema`, the `UiConfig` type, and `migrateUiConfig()`.

```ts
import { UiConfigSchema, type UiConfig, migrateUiConfig } from "@cdc-ats/contracts";
```

### Document shape

| Field            | Type                              | Default | Purpose |
| ---------------- | --------------------------------- | ------- | ------- |
| `schemaVersion`  | `number`                          | (required) | The schema version the document was written at. Read paths walk the migration ladder up to `CURRENT_UI_CONFIG_SCHEMA_VERSION`. |
| `brandName`      | `string?`                         | absent  | Display name override for the product chrome. |
| `theme`          | `UiThemeSchema`                   | `{}`    | Brand colors and coarse appearance controls (below). |
| `nav`            | `UiNavSchema`                     | `{}`    | Navigation order, hidden items, per-item label/icon/href overrides. |
| `routes`         | `Record<string, UiRouteSchema>`   | `{}`    | Per-route `enabled` + optional `title`, keyed by route key. |
| `copy`           | `Record<string, string>`          | `{}`    | Copy overrides, keyed by copy key. |
| `surfaces`       | `Record<string, UiSurfaceSchema>` | `{}`    | Per-route surface enablement + ordered slot bindings (section 2). |
| `featureToggles` | `Record<string, boolean>`         | `{}`    | Coarse boolean toggles. |

Every field is optional or defaulted, so `migrateUiConfig({})` parses to a
neutral document that renders byte-identically to the un-customized product. A
tenant that never authored a `UiConfig` resolves to exactly this fallback.

### `theme` (`UiThemeSchema`)

| Field          | Type                                       | Notes |
| -------------- | ------------------------------------------ | ----- |
| `brandHex`     | hex `#RGB` / `#RRGGBB`                      | Feeds the brand ramp (`--brand*`). Strict-regex validated; this is what makes it injection-safe. |
| `aiAccentHex`  | hex                                        | Feeds the AI-accent ramp (`--ai*`). |
| `secondaryHex` | hex                                        | Feeds the additive secondary ramp (`--secondary*`). |
| `colorMode`    | `"system" \| "light" \| "dark"`            | Default `"system"` (emits both light + dark token blocks). |
| `density`      | `"compact" \| "cozy" \| "comfortable"`     | Default `"cozy"`. Drives `--density`. |
| `radius`       | `"sharp" \| "soft" \| "round"`             | Default `"soft"`. Drives `--radius`. |
| `tokens`       | `Record<string, string>?`                  | Escape-hatch CSS custom properties. Values are plain strings; treat token VALUES as untrusted unless they are themselves hex/number. |
| `logoUrl`      | `.url()`                                    | Validated URL. |
| `faviconUrl`   | `.url()`                                    | Validated URL. |
| `fontFamily`   | `string` (max 200)                         | CSS font-family value, length-capped. |
| `fontSrc`      | `.url()`                                    | URL to load the font from (drives `@font-face`). |
| `fluid`        | `UiFluidSchema?`                           | All-numeric Utopia control points for a fluid type/space scale. |

The theme is consumed by the pure formatter
[`apps/frontend/lib/theme/build-theme-css.ts`](../apps/frontend/lib/theme/build-theme-css.ts)
(`buildThemeCss`), which emits the body of a scoped `<style>` block under
`.cd-scope[data-cd-brand]`. That formatter does **not** validate its inputs; the
caller MUST have parsed the theme through `UiThemeSchema` first.

### `nav` (`UiNavSchema`)

- `order: string[]` — nav item ids, in display order. Empty = canonical order.
- `hidden: string[]` — nav item ids to hide.
- `overrides: Record<string, UiNavOverride>` — per-item `{ label?, icon?, href? }`.

### `routes` (`Record<string, UiRouteSchema>`)

Each entry is `{ enabled: boolean (default true), title?: string }`, keyed by a
route key (the href with leading/trailing slashes stripped, e.g. `candidates`).
An **unlisted route is enabled** — customizing one route never silently disables
the rest.

### The migration ladder

`migrateUiConfig(doc)` normalizes any older or hand-authored document up to the
current schema version, then `.parse`s it. The ladder mechanics are copied
structurally from the dashboard document's `migrateDashboard`:

- `CURRENT_UI_CONFIG_SCHEMA_VERSION` — the version this build writes/renders.
- `UI_CONFIG_MIGRATIONS` — an ordered list of steps `{ from, migrate }`. To
  evolve the shape, append a step (`from: 1`, then `from: 2`, …) that backfills
  the new field and bumps `schemaVersion`, then bump
  `CURRENT_UI_CONFIG_SCHEMA_VERSION`. Never breaking-read an old document.

Run a value through `migrateUiConfig` (or `UiConfigSchema.parse`) before it
reaches `buildThemeCss` or any inline style. This is non-negotiable: it is the
single CSS-injection defense boundary.

---

## 2. The closed slot-id list and registering into a slot

A **slot** is a named, fixed region inside a shipped screen that a custom block
mounts into without forking the screen. The set of slots is **closed** — a
developer never invents a slot at runtime; they bind a registered, real-data
component into one of the seams the product exposes.

**Files:**
[`apps/frontend/lib/registry/slots.tsx`](../apps/frontend/lib/registry/slots.tsx)
(the `<Slot>` component + the `SlotId` union),
[`apps/frontend/lib/registry/surface-registry.ts`](../apps/frontend/lib/registry/surface-registry.ts)
(`registerSurfaceComponent`), and the barrel
[`apps/frontend/lib/registry/index.ts`](../apps/frontend/lib/registry/index.ts)
(import everything from `@/lib/registry`).

### The closed `SlotId` union

| Slot id                       | Region |
| ----------------------------- | ------ |
| `shell.header.right`          | App chrome header, trailing edge. |
| `shell.nav.footer`            | Below the primary navigation. |
| `candidate.detail.before`     | Top of the candidate detail screen, pre-content. |
| `candidate.detail.sidebar`    | The candidate detail right rail. |
| `requisition.detail.actions`  | The requisition detail action cluster. |
| `screening.verdict.footer`    | Under an AI screening verdict. |
| `dashboard.toolbar`           | The customizable dashboard's toolbar. |

`SLOT_IDS` exposes these as a runtime array, and `isSlotId(id)` is the boundary
type guard (a `UiConfig` referencing an unknown slot is ignored, not crashed).
Adding a seam is a deliberate edit to this union plus a `<Slot/>` placement.

### Registering a component into a slot

There are two registration paths that compose under one precedence (section 5):

**A. In-source default binding** — `registerSlot(slotId, SlotBindingEntry)`.
These are the components the product ships into a slot out of the box:

```ts
import { registerSlot } from "@/lib/registry";

registerSlot("candidate.detail.sidebar", {
  id: "candidate-risk-card",         // stable override key (section 5)
  componentId: "candidate-risk-card", // must resolve via the generated map (section 4)
  order: 10,
  roles: ["admin", "recruiter"],      // optional gate; omit = every role
  requiredModule: "ai-screening",     // optional; omit = always (subject to role+plan)
  planTier: "PROFESSIONAL",           // optional; omit = every plan
});
```

The component itself is registered as a build-analyzed surface so it can be
mounted lazily. Register it as a surface (B1) and/or add it to the generated
import map (section 4):

```ts
import { registerSurfaceComponent } from "@/lib/registry";

registerSurfaceComponent({
  id: "widget:risk_card",  // namespaced: "page:…", "widget:…", "slot:…"
  kind: "slot",
  component: () => import("@/components/cd/blocks/RiskCard"),
  roles: ["admin", "recruiter"],
  requiredModule: "ai-screening",
  // dataSourceKey MUST resolve to a realData:true source, or omit it for a
  // source-less block (see HARD RULE 1 in surface-registry.ts).
  dataSourceKey: "screening.verdicts",
  inputs: [/* InputSpec[] — section 3 */],
});
```

**B. Per-tenant binding via `UiConfig`** — the tenant authors a `SlotBinding`
under `config.surfaces[route].slots[slotId]`:

```jsonc
{
  "surfaces": {
    "candidates": {
      "enabled": true,
      "slots": {
        "candidate.detail.sidebar": [
          { "componentId": "candidate-risk-card", "order": 5 }
        ]
      }
    }
  }
}
```

### The `SlotBinding` shape (contract)

`SlotBindingSchema` ([`ui-config.ts`](../packages/contracts/src/ui-config.ts)):

| Field            | Type        | Notes |
| ---------------- | ----------- | ----- |
| `componentId`    | `string`    | Resolves to a registered, real-data component (the generated map key). |
| `order`          | `number?`   | Ascending ordering within the slot. |
| `roles`          | `string[]?` | Role gate. |
| `requiredModule` | `string?`   | Module gate (a `MODULE_REGISTRY` key). |
| `planTier`       | `string?`   | Minimum plan tier. |

A per-tenant binding with no explicit id uses its `componentId` as the override
key. A surface (`UiSurfaceSchema`) is `{ enabled (default true), slots }`; a
surface set `enabled: false` suppresses all its slots for the tenant.

### How a `<Slot>` resolves

```tsx
import { Slot } from "@/lib/registry";

<Slot id="candidate.detail.sidebar" route="candidates" config={uiConfig} ctx={{ candidateId }} />
```

`<Slot>` merges default bindings with the tenant's bindings (override-by-id,
section 5), drops any binding whose role/plan/module gate fails (the **same**
`isSurfaceAllowed` the dashboard widget catalog uses), orders ascending, and
mounts each component lazily inside its own `<Suspense fallback={null}>`. An
unknown slot id, an empty slot, an unregistered `componentId`, or a failed gate
all render **null** — fail-soft. The bound component receives the typed `ctx`
prop the screen author passed.

---

## 3. The `InputSpec` field-type reference

A surface (widget, slot block, or page) may DECLARE the configurable inputs it
exposes to the customization UI (the auto-form that renders config controls). The
registry only declares inputs; it never renders them and never stores a user
value. `InputSpec` / `InputType` are defined in
[`surface-registry.ts`](../apps/frontend/lib/registry/surface-registry.ts) and
re-exported from `@/lib/registry`.

### `InputSpec`

```ts
interface InputSpec {
  name: string;                 // machine key, written into the surface's config
  type: InputType;              // see table below
  defaultValue?: unknown;       // seeds the control
  friendlyName?: string;        // label shown to the developer
  options?: { label: string; value: string }[]; // required-by-convention for `enum`
}
```

### `InputType` reference

| Type      | Auto-form control      | Notes / safety |
| --------- | ---------------------- | -------------- |
| `string`  | Single-line text       | Plain text. |
| `number`  | Numeric input          | Numeric value. |
| `boolean` | Toggle / checkbox      | True/false. |
| `color`   | Color picker           | **The consuming UI MUST hex-validate the value before it reaches any inline `<style>`** (mirror the `isHex()` discipline in cd-shell / ext-surface-host). A color value is never trusted just because the input type is `color`. |
| `enum`    | Select                 | Provide `options: { label, value }[]` — the choice list. |
| `file`    | File picker / upload   | Carries upload concerns the consuming UI must honor (size/mime). The registry stores no file. |
| `list`    | Repeatable list editor | An ordered list of values. |
| `object`  | Nested sub-form        | A nested config object. |

The two types that carry security concerns are `color` (CSS-injection — always
hex-validate before injecting) and `file` (upload size/mime — enforce in the
consuming UI). Everything else is plain data.

---

## 4. Adding a custom page: the `(ext)/[...slug]` codegen route

A custom **page** is a whole routed screen mounted at `/ext/<slug>`. The `(ext)`
route group is a zero-overlap surface area: it never collides with the
`(dashboard)`, `(embed)`, `(candidate-portal)`, or `(auth)` groups. Because
Next's `next/dynamic` cannot take a variable import path, a page is wired through
a build-time codegen step that emits a literal-import map.

**Files:**
[`apps/frontend/lib/registry/surfaces.ts`](../apps/frontend/lib/registry/surfaces.ts)
(the manifest — codegen INPUT),
[`apps/frontend/scripts/gen-surface-registry.ts`](../apps/frontend/scripts/gen-surface-registry.ts)
(the codegen),
[`apps/frontend/lib/registry/generated.ts`](../apps/frontend/lib/registry/generated.ts)
(the emitted map — DO NOT EDIT),
[`apps/frontend/lib/registry/resolve-page-surface.ts`](../apps/frontend/lib/registry/resolve-page-surface.ts)
(slug → surface resolver),
[`apps/frontend/app/(ext)/[...slug]/page.tsx`](../apps/frontend/app/(ext)/[...slug]/page.tsx)
(server) and
[`ext-surface-host.tsx`](../apps/frontend/app/(ext)/[...slug]/ext-surface-host.tsx)
(client host).

### Steps to add a page

1. **Register the surface** in `surfaces.ts` by appending ONE entry to
   `SURFACE_REGISTRATIONS`:

   ```ts
   {
     id: "candidates-board",                       // lower-kebab, unique (the slug)
     importPath: "@/components/cd/screens/CandBoard", // STRING LITERAL only
     label: "Candidates board",
     roles: ["admin", "recruiter", "hiring_manager"],
     requiredModule: "core-hiring",                // optional gate
     planTier: "PROFESSIONAL",                     // optional gate
   }
   ```

   `importPath` MUST be a string literal (never built from a variable) — the
   codegen copies it verbatim into a static `import("…")` so webpack can analyze
   the chunk. The component's **default export** is the page.

2. **Run codegen** — `npm run gen:surfaces` (it also runs automatically as the
   frontend `prebuild` step, so the Docker builder emits a fresh map before
   `next build`). This regenerates `generated.ts` deterministically. The codegen
   validates ids against a lower-kebab allowlist and `importPath` against a strict
   module-specifier allowlist (injection-defensive), and fails the build on a
   duplicate id or a hostile path.

3. **Visit `/ext/candidates-board`.** The server `page.tsx` resolves the slug via
   `resolvePageSurface` and 404s if there is no generated loader AND no
   gate-bearing `kind:"page"` entry. The client `ext-surface-host.tsx` then
   evaluates the shared role/module/plan gate against the live session, mounts the
   page via `next/dynamic` (`ssr:false`), and wraps it in a `.cd-scope` themed by
   the tenant brand ramp (the verbatim `buildBrandStyle` from cd-shell, hex-gated).

### Resolution and fail-soft

`resolvePageSurface(slug)` requires **both** a generated literal-import loader and
a `kind:"page"` `SurfaceEntry` (an explicitly-registered `page:<id>` runtime entry
wins; otherwise one is built from the manifest registration, carrying its gate
verbatim). A registration with no `roles` is **closed-by-default** at the host
role gate. The baseline manifest is EMPTY, so every `(ext)` slug 404s until a
developer registers a page; existing route groups are untouched.

---

## 5. Override-by-id precedence

Every binding (default or tenant) carries a stable `id`. Composition is
**override-by-id**: a later binding with the same id REPLACES the earlier one in
place (keeping the earlier one's `order` unless it sets its own); a binding with a
new id is APPENDED. This is how a tenant re-skins a default block — bind a
component under the default's id and it is swapped, never ejected or forked.

### Precedence the `<Slot>` resolver implements

1. **Default bindings** — registered in-source via `registerSlot(id, binding)`
   (insertion order).
2. **Per-tenant bindings** — `config.surfaces[route].slots[slotId]`, layered ON
   TOP of the defaults by id (a tenant binding's override key is its explicit
   `id`, or its `componentId` when omitted).
3. **Gate** — drop any binding whose role/plan/module gate fails (the same
   `isSurfaceAllowed` as the widget catalog).
4. **Order** — sort by `order` ascending, stable on resolution order for ties;
   unordered bindings sort after ordered ones.

### `UiConfig` resolution precedence (the document layers)

The resolved `UiConfig` a tenant renders is a layering of four sources, lowest
precedence first, implemented in
[`apps/frontend/lib/config/ui-config-provider.tsx`](../apps/frontend/lib/config/ui-config-provider.tsx):

1. **Platform default** — `migrateUiConfig({})`, the neutral all-enabled floor.
2. **Env skin** — `NEXT_PUBLIC_UI_CONFIG` (a JSON `UiConfig`), an optional
   build-time house default. Absent/invalid is ignored.
3. **Tenant override** — the document from `GET /api/me/ui-config`.
4. **Per-user prefs** — a per-user overlay (e.g. chosen color mode), highest
   precedence so a user choice wins for that user only.

Layers are merged field-wise (nested maps merge key-by-key; scalars/arrays
shallow-overwrite) and the merged document is run through `migrateUiConfig` one
final time, so a resolved `UiConfig` is always fully validated. Any layer that
fails to parse is dropped (fail-soft), never poisoning the resolution. On 404 /
network error / malformed body the provider falls back to the platform default,
so an untouched tenant renders byte-identically.

---

## 6. The three editing surfaces

A developer or admin edits the customizable UI through three distinct surfaces,
in increasing order of who can touch them and how directly.

### A. Token files in git (developer / design system)

The design tokens and structural defaults that ship with the product live in
source and are versioned in git. These are the floor every tenant inherits:

- The Aurora token CSS (`components/cd/cd-tokens.css`) — the emerald defaults and
  the full `--brand* / --ai* / --fs-* / --space-* / --radius / --density` token
  surface that `buildThemeCss` overrides under `.cd-scope`.
- The fluid scale, radius, and density presets encoded in
  [`build-theme-css.ts`](../apps/frontend/lib/theme/build-theme-css.ts).

These are the typed, code-reviewed source of truth. Changing them is a PR. (The
program's intended end state is a DTCG — Design Tokens Community Group — JSON
token file as the canonical input here; today the token surface is the CSS token
file plus the `theme.tokens` escape-hatch map in the contract.)

### B. Env white-label defaults (operator / build-time)

`NEXT_PUBLIC_UI_CONFIG` is an optional build-time JSON `UiConfig` an operator
ships to set a house default skin ABOVE the bare contract floor without a
per-tenant write (precedence layer 2 in section 5). It is parsed and validated
once through `migrateUiConfig`; invalid/absent is ignored (fail-soft). Use this
for a whole-deployment skin (e.g. a partner-branded build).

### C. The `/settings/branding` admin editor (tenant admin)

The in-app editor at
[`apps/frontend/app/(dashboard)/settings/branding/page.tsx`](../apps/frontend/app/(dashboard)/settings/branding/page.tsx)
lets a **tenant admin** author the per-tenant override (precedence layer 3). It is
served through the gateway:

- `GET /api/me/ui-config` — open read for any authed tenant user (the chrome needs
  the document to render). Proxies to tenant-service `/internal/ui-config`, which
  returns the migrated document + sibling rendering defaults.
- `PUT /api/me/ui-config` — **module-gated** (`requireModule("ui-customization")`,
  ENTERPRISE) AND tenant-admin-only (downstream `requireTenantAdmin`). The gate is
  a per-method shim, NOT a prefix-level middleware, so it can never catch the open
  GET (the documented `readAuthHeaders` mount-order trap is avoided).

Storage: the document is persisted in the existing `Tenant.dashboardThemeTokens`
(Json) column; the tenant-wide `defaultColorMode` is mirrored from the document's
`theme.colorMode`, and `defaultDashboardByRole` lives in its own column. Every PUT
is validated with `UiConfigSchema.parse` (via `migrateUiConfig`) before persist,
so every hex/font/URL has passed the injection-defense regexes by the time it is
stored. Branding-specific fields (logo upload, colors, career-portal copy, embed
allowlist) are handled by the sibling
[`tenant-service/src/routes/branding.ts`](../apps/tenant-service/src/routes/branding.ts).

---

## 7. The two trust tiers

The customization model distinguishes who is authoring a customization and how
much the platform trusts the code being mounted.

### Tier 1 — in-process typed React (first-party / trusted) — AVAILABLE NOW

This is the model this guide documents. A trusted developer registers a typed
React component in-source (a slot block, a widget, or an `(ext)` page) through the
surface/slot registries and the build-time codegen. The component runs **in
process**, in the same bundle as the app, and is subject to:

- the typed `UiConfig` contract as the CSS-injection boundary,
- the shared role/plan/module gate (`isSurfaceAllowed`),
- the real-data-or-honest-empty invariant (a bound `dataSourceKey` MUST resolve to
  a `realData:true` source; `validateSurfaceRegistry()` throws otherwise), and
- the codegen's strict id + import-path allowlist.

Trust here is established at code-review and build time. Only first-party /
trusted code should be registered this way, because an in-process component has
the full capabilities of the app bundle.

### Tier 2 — sandboxed third-party manifest (marketplace) — DEFERRED

For a future third-party marketplace, untrusted extensions would NOT run
in-process. The intended model is a Saleor-style declarative **manifest** plus a
**sandboxed iframe**: the third-party app declares its surfaces/permissions in a
manifest, the platform validates and gates it, and its UI renders inside a
sandboxed iframe with a constrained, message-passing API rather than direct
access to the app bundle. This isolates untrusted code, scopes its capabilities,
and lets the platform revoke it.

This tier is **deferred** and not implemented. Everything in this guide is Tier 1.
Do not register third-party code through the in-process registries.

---

## 8. Quick reference: file map

| Concern | File |
| ------- | ---- |
| Typed contract + migration ladder | `packages/contracts/src/ui-config.ts` |
| Theme → scoped CSS (pure formatter) | `apps/frontend/lib/theme/build-theme-css.ts` |
| Surface/widget registry + gate + `InputSpec` | `apps/frontend/lib/registry/surface-registry.ts` |
| Closed slot ids + `<Slot>` + precedence | `apps/frontend/lib/registry/slots.tsx` |
| Developer SDK barrel (import from here) | `apps/frontend/lib/registry/index.ts` |
| Resolved `UiConfig` provider + `useUiConfig` | `apps/frontend/lib/config/ui-config-provider.tsx` |
| Page manifest (codegen input) | `apps/frontend/lib/registry/surfaces.ts` |
| Codegen | `apps/frontend/scripts/gen-surface-registry.ts` |
| Generated import map (do not edit) | `apps/frontend/lib/registry/generated.ts` |
| Slug → page resolver | `apps/frontend/lib/registry/resolve-page-surface.ts` |
| `(ext)` catch-all route (server + client host) | `apps/frontend/app/(ext)/[...slug]/page.tsx`, `ext-surface-host.tsx` |
| Module registry (gate `requiredModule` keys) | `packages/common/src/modules/registry.ts` |
| Gateway `/api/me/ui-config` mount | `apps/api-gateway/src/app.ts` |
| Persistence (GET/PUT) | `apps/tenant-service/src/routes/ui-config.ts` |
| Branding self-service (colors/logo/embed) | `apps/tenant-service/src/routes/branding.ts` |
| Admin editor | `apps/frontend/app/(dashboard)/settings/branding/page.tsx` |
