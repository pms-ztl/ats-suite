import { z } from "zod";

// Developer-customizable UI contract (WF-A). A UiConfig is the persisted,
// per-tenant description of how the product chrome looks and behaves: brand
// theme tokens, navigation order/visibility, route enablement, copy overrides,
// surface slot bindings, and coarse feature toggles. It is the UI sibling of
// the dashboard document (dtos/dashboard.ts) and module manifest (dtos/module.ts)
// and is validated by the exact same Zod-everywhere discipline so the gateway,
// the persistence service, and the frontend all agree on one shape.
//
// SAFETY: every free-text value that can reach an inline <style> or attribute
// is constrained here so a parsed UiConfig is safe to inject. Hex colors must
// match a strict #RGB/#RRGGBB regex; URL fields are .url()-validated; font
// names are length-capped strings. Callers MUST run a value through this schema
// (.parse) before it touches buildBrandStyle / any inline style. The schema is
// the CSS-injection defense boundary.
//
// ADDITIVE + FAIL-SOFT: every field is optional or has a default, so an empty
// or absent document parses to a neutral, all-enabled configuration that renders
// byte-identically to the un-customized product. A tenant that never authored a
// UiConfig resolves to this fallback.

/* ─────────────────────────── primitive validators ─────────────────────────── */

// A 3- or 6-digit hex color (with leading #). This is the ONLY accepted form for
// any color that may be interpolated into a scoped <style> block; the strict
// regex is what makes those values injection-safe after .parse.
const HexColor = z
  .string()
  .regex(
    /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/,
    "must be a #RGB or #RRGGBB hex color",
  );

/* ──────────────────────────────── sub-schemas ─────────────────────────────── */

// Optional fluid-typography control points. Mirrors the shape the frontend's
// fluid type scale expects; all numeric so nothing here can reach a style sink
// as arbitrary text.
export const UiFluidSchema = z.object({
  minViewport: z.number(),
  maxViewport: z.number(),
  minBase: z.number(),
  maxBase: z.number(),
  typeRatio: z.number(),
  spaceRatio: z.number(),
});
export type UiFluid = z.infer<typeof UiFluidSchema>;

// Theme: brand colors + coarse appearance controls. brandHex / aiAccentHex /
// secondaryHex feed the hex->oklch brand ramp (lib/theme/brand-ramp.ts) and the
// cd-shell scoped brand <style>; they are hex-validated so they are safe to
// inject. tokens is an escape hatch of additional CSS custom properties; values
// are plain strings (length-capped by the record value schema) and callers must
// still treat token VALUES as untrusted unless they are themselves hex/number.
export const UiThemeSchema = z.object({
  brandHex: HexColor.optional(),
  aiAccentHex: HexColor.optional(),
  secondaryHex: HexColor.optional(),
  colorMode: z.enum(["system", "light", "dark"]).default("system"),
  density: z.enum(["compact", "cozy", "comfortable"]).default("cozy"),
  radius: z.enum(["sharp", "soft", "round"]).default("soft"),
  tokens: z.record(z.string(), z.string()).optional(),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  // Font family is a CSS font-family value; it is length-capped and only ever
  // placed where a font name is expected. fontSrc is the (validated) URL to load
  // the font from.
  fontFamily: z.string().max(200).optional(),
  fontSrc: z.string().url().optional(),
  fluid: UiFluidSchema.optional(),
});
export type UiTheme = z.infer<typeof UiThemeSchema>;

// Navigation customization. order/hidden reference nav item ids (resolved
// against the canonical nav + module contributions on the frontend); overrides
// lets a tenant relabel/re-icon/re-href an item. All defaults are empty so an
// absent nav block leaves the canonical navigation untouched (fail-soft).
export const UiNavOverrideSchema = z
  .object({
    label: z.string(),
    icon: z.string(),
    href: z.string(),
  })
  .partial();
export type UiNavOverride = z.infer<typeof UiNavOverrideSchema>;

export const UiNavSchema = z.object({
  order: z.array(z.string()).default([]),
  hidden: z.array(z.string()).default([]),
  overrides: z.record(z.string(), UiNavOverrideSchema).default({}),
});
export type UiNav = z.infer<typeof UiNavSchema>;

// Per-route enablement + optional title override, keyed by route key. enabled
// defaults to true so an unlisted route stays on (fail-soft: customizing one
// route never silently disables the rest).
export const UiRouteSchema = z.object({
  enabled: z.boolean().default(true),
  title: z.string().optional(),
});
export type UiRoute = z.infer<typeof UiRouteSchema>;

// A binding that places a component into a named surface slot. componentId
// resolves to a registered, real-data component on the frontend; the optional
// roles / requiredModule / planTier gates mirror the dashboard registry filter
// (registry.ts filter()) so a slot binding is dropped when the viewer's role,
// the tenant's enabled modules, or the tenant's plan do not qualify.
export const SlotBindingSchema = z.object({
  componentId: z.string(),
  order: z.number().optional(),
  roles: z.array(z.string()).optional(),
  requiredModule: z.string().optional(),
  planTier: z.string().optional(),
});
export type SlotBinding = z.infer<typeof SlotBindingSchema>;

// A surface (e.g. a page region) that can be toggled and filled with ordered
// slot bindings keyed by slot name. enabled defaults true; slots defaults {}.
export const UiSurfaceSchema = z.object({
  enabled: z.boolean().default(true),
  slots: z.record(z.string(), z.array(SlotBindingSchema)).default({}),
});
export type UiSurface = z.infer<typeof UiSurfaceSchema>;

/* ──────────────────────────────── document ────────────────────────────────── */

export const UiConfigSchema = z.object({
  schemaVersion: z.number(),
  brandName: z.string().optional(),
  // theme/nav are structurally objects but default to {} so a bare document
  // ({} or absent) parses: their own fields are all optional/defaulted, so an
  // empty theme/nav resolves to the neutral, all-enabled fallback (fail-soft).
  theme: UiThemeSchema.default({}),
  nav: UiNavSchema.default({}),
  routes: z.record(z.string(), UiRouteSchema).default({}),
  copy: z.record(z.string(), z.string()).default({}),
  surfaces: z.record(z.string(), UiSurfaceSchema).default({}),
  featureToggles: z.record(z.string(), z.boolean()).default({}),
});
export type UiConfig = z.infer<typeof UiConfigSchema>;

/* ──────────────────────────── migration ladder ────────────────────────────── */
//
// COPIED VERBATIM (structurally) from lib/widgets/schema.ts migrateDashboard:
// a schemaVersion ladder so a future theme/nav/surface change is a self-contained
// migration step rather than a breaking read. CURRENT_SCHEMA_VERSION + MIGRATIONS
// + version-walk + final .parse, identical mechanics to the dashboard ladder.

// The schemaVersion this build writes and renders. Bump this whenever a new
// migration step is appended to MIGRATIONS below.
export const CURRENT_UI_CONFIG_SCHEMA_VERSION = 1;

// A migration step upgrades a document that is AT `from` to the shape expected
// at `from + 1`. Steps run in order, each on the output of the previous one, so
// a document at any old version is walked up to CURRENT_UI_CONFIG_SCHEMA_VERSION.
// Steps operate on the raw, un-parsed document because an old document may not
// satisfy the current Zod schema until it has been migrated.
type UiConfigMigrationStep = {
  from: number;
  migrate: (doc: Record<string, unknown>) => Record<string, unknown>;
};

// The ladder. v1 is the baseline shape (what we ship today), so there is no step
// landing on v1 yet. When the document shape changes, append a step here with
// `from: 1` (then `from: 2`, ...) and bump CURRENT_UI_CONFIG_SCHEMA_VERSION.
//
// Example of the intended pattern for a future change:
//   {
//     from: 1,
//     migrate: (doc) => ({
//       ...doc,
//       schemaVersion: 2,
//       // ...backfill the new theme/nav/surface field here...
//     }),
//   },
const UI_CONFIG_MIGRATIONS: UiConfigMigrationStep[] = [];

// Upgrade a raw (possibly older, possibly malformed) UiConfig document to the
// current shape, then validate it. Runs on read so every render path sees a
// document at CURRENT_UI_CONFIG_SCHEMA_VERSION. The final .parse applies every
// default, so a `{}` (or absent) document yields the neutral, all-enabled
// fallback. Throws (via Zod) if the result still does not match the contract;
// callers should treat that as "fall back to the un-customized UI" rather than
// rendering broken chrome.
export function migrateUiConfig(doc: unknown): UiConfig {
  // Normalize to an object we can walk. A non-object (null, array, string) is
  // not a recoverable document; let the final parse surface the error.
  let current: Record<string, unknown> =
    doc && typeof doc === "object" && !Array.isArray(doc)
      ? { ...(doc as Record<string, unknown>) }
      : (doc as Record<string, unknown>);

  // A document missing schemaVersion is treated as the baseline (v1): every
  // document we have ever written carries schemaVersion, so an absent one means
  // a hand-authored or legacy seed.
  const rawVersion = current?.schemaVersion;
  let version =
    typeof rawVersion === "number" &&
    Number.isInteger(rawVersion) &&
    rawVersion > 0
      ? rawVersion
      : CURRENT_UI_CONFIG_SCHEMA_VERSION;

  // Walk the ladder. Each iteration applies the single step whose `from`
  // matches the current version, advancing one version at a time so steps
  // compose. Guard against an unknown/forward version by clamping at the top.
  while (version < CURRENT_UI_CONFIG_SCHEMA_VERSION) {
    const step = UI_CONFIG_MIGRATIONS.find((s) => s.from === version);
    if (!step) break; // no path forward; let parse validate what we have
    current = step.migrate(current);
    version += 1;
  }

  // Ensure the version stamp reflects where we ended up, then validate against
  // the schema. `.parse` applies every default (theme appearance, empty nav/
  // routes/copy/surfaces/featureToggles).
  const stamped = { ...current, schemaVersion: version };
  return UiConfigSchema.parse(stamped);
}
