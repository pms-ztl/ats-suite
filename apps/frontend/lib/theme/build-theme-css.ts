// apps/frontend/lib/theme/build-theme-css.ts
//
// WF-B / SLICE B5 -- BUILD THEME CSS. A pure, framework-free function that turns
// a validated tenant theme config into the BODY of a scoped <style> block. It is
// the generalized successor to buildBrandStyle() in components/cd/cd-shell.tsx
// (~54-66): where that helper emitted ONLY the brand ramp, buildThemeCss() emits
// the FULL token surface a tenant can customize -- the brand ramp, an AI-accent
// ramp, an optional secondary ramp, an optional @font-face + --font-sans override,
// data-driven --radius / --density values, and an optional Utopia fluid
// type/space scale (clamp() --fs-* / --space-* overrides).
//
// SCOPE + LAYERING. Everything is emitted under `.cd-scope[<scopeAttr>]` (default
// data-cd-brand) so the override is scoped to the shell that carries the matching
// data attribute and inherits down into nested .cd-scope subtrees (e.g. /chat)
// via CSS custom-property inheritance -- exactly the mechanism cd-shell already
// relies on. The global emerald defaults in components/cd/cd-tokens.css are left
// untouched; a tenant with no custom theme emits nothing here (the caller passes
// no scope attribute / renders no <style>), so the render is byte-identical.
//
// COLOR MODE. colorMode 'system' emits BOTH a light block (`.cd-scope[attr]`) and
// a dark block (`.dark .cd-scope[attr]`), so the .dark class on <html> selects the
// right tokens exactly like the design's own tokens. colorMode 'light' emits only
// the light block; 'dark' emits only the dark block (still under the `.dark`
// selector so it activates with the app's dark class). brandRamp() already
// produces both sides, so 'system' is the natural full-fidelity default.
//
// SAFETY. This function does NOT validate its inputs: every value it interpolates
// into the returned CSS text (hex colors, font family, font src, fluid numbers)
// MUST have been validated by the caller via @cdc-ats/contracts UiThemeSchema
// (HexColor regex, .url(), numeric fluid). That schema is the CSS-injection
// defense boundary; this is a pure formatter that trusts a parsed config. Numeric
// fields (--radius/--density px, fluid clamp()s) are computed here from enums /
// numbers and never carry arbitrary text.
//
// PURE. No React, no DOM, no side effects. Reuses lib/theme/brand-ramp.ts for the
// color math (the same module cd-shell uses), so brand colors stay byte-identical
// to the existing shell theming.

import { brandRamp, type BrandRamp } from "./brand-ramp";

/* ============================================================================
 * Public config shape
 * --------------------------------------------------------------------------
 * A structural subset of @cdc-ats/contracts UiTheme (ui-config.ts). Kept as a
 * local interface (not an import of UiTheme) so this pure helper has no package
 * dependency and accepts any caller that supplies the validated fields; the
 * field names + enum members match UiThemeSchema exactly so a parsed UiTheme is
 * assignable. Every field is optional: an empty config emits an empty body.
 * ========================================================================== */

/** Fluid (Utopia) control points. Mirrors UiFluidSchema in @cdc-ats/contracts. */
export interface ThemeFluid {
  /** Smallest viewport (px) the fluid scale is anchored to. */
  minViewport: number;
  /** Largest viewport (px) the fluid scale is anchored to. */
  maxViewport: number;
  /** Base font size (px) at minViewport. */
  minBase: number;
  /** Base font size (px) at maxViewport. */
  maxBase: number;
  /** Modular ratio for the type scale (e.g. 1.2 minor third). */
  typeRatio: number;
  /** Modular ratio for the space scale (e.g. 1.5). */
  spaceRatio: number;
}

export interface ThemeConfig {
  /** Primary brand hex (#RGB/#RRGGBB). Feeds the --brand* ramp. */
  brandHex?: string;
  /** AI-accent hex. Feeds the --ai* ramp (the violet "AI" token family). */
  aiAccentHex?: string;
  /** Secondary hex. Feeds an additive --secondary* ramp. */
  secondaryHex?: string;
  /** Which theme blocks to emit. 'system' emits both light + dark. */
  colorMode?: "system" | "light" | "dark";
  /** Corner-radius preset -> data-driven --radius. */
  density?: "compact" | "cozy" | "comfortable";
  /** Spacing density preset -> data-driven --density. */
  radius?: "sharp" | "soft" | "round";
  /** CSS font-family value to set as --font-sans (length-capped by the caller). */
  fontFamily?: string;
  /** URL to load a custom font from (validated by the caller). */
  fontSrc?: string;
  /** Optional Utopia fluid type/space scale. */
  fluid?: ThemeFluid;
}

/* ============================================================================
 * Token families
 * ========================================================================== */

// The six brand-family token keys brandRamp() produces (in BOTH the --brand* and
// --c-brand* forms, matching how cd-shell.buildBrandStyle emits them). We reuse
// this same list for the AI and secondary families by swapping the `--brand`
// prefix, because the design's --ai* family has the identical 6-key structure
// (--ai / --ai-2 / --ai-ink / --ai-tint / --ai-tint-2 / --on-ai).
const BRAND_KEYS = [
  "--brand",
  "--brand-2",
  "--brand-ink",
  "--brand-tint",
  "--brand-tint-2",
  "--on-brand",
] as const;

// Radius preset -> the --radius value (rem). Defaults mirror cd-tokens.css, where
// --radius is 0.6875rem (the "soft" 11px base). 'sharp' squares the chrome,
// 'round' fattens it. Values are computed here (never arbitrary text).
const RADIUS_REM: Record<NonNullable<ThemeConfig["radius"]>, string> = {
  sharp: "0.25rem",
  soft: "0.6875rem", // verbatim cd-tokens.css default
  round: "1rem",
};

// Density preset -> a unitless --density multiplier consumers can scale spacing
// by (1 = the cozy baseline). compact tightens, comfortable loosens. This is a
// NEW additive token (no existing token is named --density), so emitting it only
// adds a knob and cannot regress anything that does not read it.
const DENSITY_SCALE: Record<NonNullable<ThemeConfig["density"]>, string> = {
  compact: "0.85",
  cozy: "1",
  comfortable: "1.15",
};

// The type-scale step names (small -> large) and their integer step index off the
// base (--fs-base = step 0). Matches the px scale in cd-tokens.css so a fluid
// override replaces the SAME token names the kit already reads.
const TYPE_STEPS: ReadonlyArray<readonly [token: string, step: number]> = [
  ["--fs-2xs", -2],
  ["--fs-xs", -1.5],
  ["--fs-sm", -1],
  ["--fs-base", 0],
  ["--fs-md", 1],
  ["--fs-lg", 2],
  ["--fs-xl", 3],
  ["--fs-2xl", 4],
  ["--fs-3xl", 5],
  ["--fs-4xl", 6],
  ["--fs-5xl", 7],
] as const;

// The spacing-ramp token names and their step index off --space-4 (16px, the
// "1rem-ish" middle of the ramp = step 0). Matches cd-tokens.css so a fluid
// override replaces the SAME token names.
const SPACE_STEPS: ReadonlyArray<readonly [token: string, step: number]> = [
  ["--space-1", -3],
  ["--space-2", -2],
  ["--space-3", -1],
  ["--space-4", 0],
  ["--space-5", 0.5],
  ["--space-6", 1],
  ["--space-8", 2],
  ["--space-10", 3],
  ["--space-12", 4],
] as const;

/* ============================================================================
 * Formatting helpers
 * ========================================================================== */

/** Round to 4 decimals and strip trailing zeros (compact, deterministic CSS). */
function r4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * Emit the brand-family declarations for one theme side, optionally remapping the
 * `--brand` prefix to another family prefix (e.g. `--ai`, `--secondary`). Each
 * key is emitted in BOTH forms cd-tokens.css consumers read inside .cd-scope: the
 * full-color `--<family>*` (read via var(--brand) / var(--ai)) and the
 * `--c-<family>*` companion (read via var(--c-brand) / var(--c-ai)). This mirrors
 * cd-shell.buildBrandStyle exactly so brand colors stay byte-identical.
 */
function familyDecls(side: Record<string, string>, prefix: string): string {
  return BRAND_KEYS.map((k) => {
    const color = `oklch(${side[k]})`;
    // Remap "--brand" -> the target family prefix (no-op when prefix is "--brand").
    const key = k.replace(/^--brand/, prefix);
    // Full-color companion: "--brand-tint" -> "--c-<family>-tint".
    const cKey = key.replace(/^--/, "--c-");
    return `${key}:${color};${cKey}:${color};`;
  }).join("");
}

/**
 * Build a single Utopia clamp() value: linear interpolation between `min` (at
 * minViewport) and `max` (at maxViewport), clamped at both ends. Produces the
 * standard `clamp(MINrem, PREFERREDrem + SLOPEvw, MAXrem)` CSS. All numeric.
 */
function fluidClamp(min: number, max: number, f: ThemeFluid): string {
  const minRem = min / 16;
  const maxRem = max / 16;
  const vwRange = f.maxViewport - f.minViewport;
  // Slope in px-per-px-of-viewport, expressed as vw (so * 100).
  const slopeVw = vwRange !== 0 ? ((max - min) / vwRange) * 100 : 0;
  // Intercept (rem) so the line passes through (minViewport, min).
  const interceptRem = (min - (slopeVw / 100) * f.minViewport) / 16;
  const lo = Math.min(minRem, maxRem);
  const hi = Math.max(minRem, maxRem);
  return `clamp(${r4(lo)}rem, ${r4(interceptRem)}rem + ${r4(slopeVw)}vw, ${r4(hi)}rem)`;
}

/**
 * Emit the fluid type + space scale declarations for the given control points.
 * Each --fs-* and --space-* token gets a clamp() that scales between its
 * min-viewport size (minBase * ratio^step) and its max-viewport size
 * (maxBase * ratio^step).
 * The token names are the EXACT ones in cd-tokens.css, so this overrides the
 * shipped px scale with a fluid one.
 */
function fluidDecls(f: ThemeFluid): string {
  const type = TYPE_STEPS.map(([token, step]) => {
    const min = f.minBase * Math.pow(f.typeRatio, step);
    const max = f.maxBase * Math.pow(f.typeRatio, step);
    return `${token}:${fluidClamp(min, max, f)};`;
  }).join("");
  // Space ramp is anchored to the SAME base sizes but uses the space ratio; the
  // base step (0) is the body base size, matching the 16px-ish middle of the ramp.
  const space = SPACE_STEPS.map(([token, step]) => {
    const min = f.minBase * Math.pow(f.spaceRatio, step);
    const max = f.maxBase * Math.pow(f.spaceRatio, step);
    return `${token}:${fluidClamp(min, max, f)};`;
  }).join("");
  return type + space;
}

/**
 * Build the non-color, mode-independent declarations: --radius, --density,
 * --font-sans, and the fluid scale. These belong in the LIGHT block (they are not
 * theme-mode-specific); when colorMode is 'dark' the caller still gets them
 * because the dark-only path emits them in the dark block instead (see below).
 */
function structuralDecls(cfg: ThemeConfig): string {
  let out = "";
  if (cfg.radius) out += `--radius:${RADIUS_REM[cfg.radius]};`;
  if (cfg.density) out += `--density:${DENSITY_SCALE[cfg.density]};`;
  if (cfg.fontFamily) out += `--font-sans:${cfg.fontFamily};`;
  if (cfg.fluid) out += fluidDecls(cfg.fluid);
  return out;
}

/* ============================================================================
 * Public: buildThemeCss
 * ============================================================================
 *
 * Returns the BODY of a scoped <style> block (a string of CSS rules) that
 * re-skins a .cd-scope subtree from a validated theme config. The caller is
 * responsible for:
 *   1. validating `cfg` via @cdc-ats/contracts UiThemeSchema before calling, and
 *   2. placing the returned string into a <style> AND giving the target
 *      .cd-scope element the matching `[scopeAttr]` data attribute.
 *
 * Tokens emitted (all under `.cd-scope[scopeAttr]`, dark under `.dark .cd-scope`):
 *   • brand ramp     — --brand, --brand-2, --brand-ink, --brand-tint,
 *                      --brand-tint-2, --on-brand (+ each --c-brand* companion),
 *                      from brandHex via brand-ramp.ts. Omitted if brandHex unset.
 *   • AI-accent ramp — --ai, --ai-2, --ai-ink, --ai-tint, --ai-tint-2, --on-ai
 *                      (+ --c-ai* companions), from aiAccentHex. Omitted if unset.
 *   • secondary ramp — additive --secondary* / --c-secondary* family from
 *                      secondaryHex. Omitted if unset (no existing token reads it,
 *                      so it is purely additive).
 *   • @font-face     — emitted once (mode-independent) when fontSrc is set, named
 *                      after fontFamily; pair it with --font-sans below.
 *   • --font-sans    — overridden to fontFamily when set.
 *   • --radius       — data-driven rem from the radius preset.
 *   • --density      — data-driven unitless multiplier from the density preset.
 *   • --fs-* / --space-* — Utopia clamp() fluid scale when `fluid` is provided.
 *
 * An empty config (no fields) returns "" (the caller should then emit no <style>
 * and no data attribute, leaving the cd-tokens.css emerald defaults intact ->
 * byte-identical render). colorMode 'system' emits both light + dark color blocks;
 * 'light' emits only light; 'dark' emits only dark.
 */
export function buildThemeCss(cfg: ThemeConfig, scopeAttr = "data-cd-brand"): string {
  const sel = `.cd-scope[${scopeAttr}]`;
  const darkSel = `.dark ${sel}`;

  // Color ramps (light + dark sides) for whichever hexes are provided.
  const brand: BrandRamp | null = cfg.brandHex ? brandRamp(cfg.brandHex) : null;
  const ai: BrandRamp | null = cfg.aiAccentHex ? brandRamp(cfg.aiAccentHex) : null;
  const secondary: BrandRamp | null = cfg.secondaryHex ? brandRamp(cfg.secondaryHex) : null;

  const colorDecls = (ramp: BrandRamp | null, prefix: string, side: "light" | "dark"): string =>
    ramp ? familyDecls(ramp[side], prefix) : "";

  const lightColors =
    colorDecls(brand, "--brand", "light") +
    colorDecls(ai, "--ai", "light") +
    colorDecls(secondary, "--secondary", "light");
  const darkColors =
    colorDecls(brand, "--brand", "dark") +
    colorDecls(ai, "--ai", "dark") +
    colorDecls(secondary, "--secondary", "dark");

  // Structural (mode-independent) declarations: radius/density/font/fluid.
  const structural = structuralDecls(cfg);

  // Optional @font-face: emitted once at the top (mode-independent). Only when a
  // src URL is present; fontFamily names the face so --font-sans can reference it.
  // The url() and family are caller-validated; format is inferred from the src
  // extension so woff2/woff/ttf load correctly without the caller specifying it.
  const fontFace =
    cfg.fontSrc && cfg.fontFamily
      ? `@font-face{font-family:${cfg.fontFamily};src:url("${cfg.fontSrc}")${fontFormat(cfg.fontSrc)};font-display:swap;}\n`
      : "";

  const mode = cfg.colorMode ?? "system";
  const blocks: string[] = [];

  if (mode === "dark") {
    // Dark-only: put structural decls in the dark block so a dark-locked tenant
    // still gets radius/density/font/fluid (there is no light block to carry them).
    const body = darkColors + structural;
    if (body) blocks.push(`${darkSel}{${body}}`);
  } else {
    // 'light' and 'system' both emit a light block carrying the structural decls.
    const lightBody = lightColors + structural;
    if (lightBody) blocks.push(`${sel}{${lightBody}}`);
    // 'system' additionally emits the dark color block (structural decls inherit
    // from the light block, so they are not repeated).
    if (mode === "system" && darkColors) blocks.push(`${darkSel}{${darkColors}}`);
  }

  const rules = blocks.join("\n");
  if (!rules) return "";
  return `${fontFace}${rules}`;
}

/**
 * Infer the CSS `format(...)` hint from a font src URL extension so the browser
 * loads it correctly. Returns "" (no hint) for an unrecognized extension; the
 * font still loads, the browser just sniffs the format. The src is caller-
 * validated, so this only reads a known suffix.
 */
function fontFormat(src: string): string {
  const lower = src.split(/[?#]/)[0].toLowerCase();
  if (lower.endsWith(".woff2")) return ' format("woff2")';
  if (lower.endsWith(".woff")) return ' format("woff")';
  if (lower.endsWith(".ttf")) return ' format("truetype")';
  if (lower.endsWith(".otf")) return ' format("opentype")';
  return "";
}
