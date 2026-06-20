// apps/frontend/lib/theme/brand-ramp.ts
//
// SLICE A5 -- BRAND RAMP. Generates the FULL Aurora brand token family from ONE
// brand hex, mirroring the EXACT token names + oklch style used in
// components/cd/cd-tokens.css (and the bare-channel + --c-* alias forms used in
// app/globals.css). Given a single hex, brandRamp() returns the light (.cd-scope)
// and dark (.dark .cd-scope) channel sets so a tenant can re-skin the whole
// Aurora chrome from their one brand color.
//
// The Aurora palette stores BARE oklch channels ("L C H") for Tailwind's
// <alpha-value> wrapper; cd-tokens.css stores FULL oklch(...) colors. We produce
// the bare-channel form here and provide the matching --c-* alias (oklch(var(..)))
// and the full-color form so callers can emit whichever variant they need.
//
// Color math is done properly: sRGB -> linear -> OKLab -> OKLCH (Bjorn Ottosson's
// matrices). The lightness/chroma ramp is derived to match the EXISTING emerald
// token relationships -- we read the deltas the design uses between --brand and
// its siblings (brand-2 / brand-ink / brand-tint / brand-tint-2 / on-brand) and
// re-apply them, scaling chroma relative to emerald's reference chroma so a muted
// brand stays muted and a vivid brand stays vivid.
//
// Pure functions only -- no React, no DOM, no side effects.

/* ============================================================================
 * Types
 * ========================================================================== */

/** OKLCH triple. h is in degrees [0, 360); for achromatic colors h is 0. */
export interface Oklch {
  l: number; // perceptual lightness, [0, 1]
  c: number; // chroma, >= 0
  h: number; // hue angle in degrees, [0, 360)
}

/** The exact brand token keys produced for each theme (bare-channel form). */
export type BrandTokenKey =
  | "--brand"
  | "--brand-2"
  | "--brand-ink"
  | "--brand-tint"
  | "--brand-tint-2"
  | "--on-brand";

export interface BrandRamp {
  /** Bare oklch channels ("L C H") for the LIGHT theme (.cd-scope). */
  light: Record<string, string>;
  /** Bare oklch channels ("L C H") for the DARK theme (.dark .cd-scope). */
  dark: Record<string, string>;
}

export interface ContrastResult {
  /** WCAG contrast ratio in [1, 21]. */
  ratio: number;
  /** Passes WCAG 2.1 AA for normal body text (>= 4.5:1). */
  passesAA: boolean;
}

/* ============================================================================
 * sRGB <-> OKLCH conversion (Bjorn Ottosson's OKLab)
 * ========================================================================== */

/** Parse a #rgb / #rrggbb hex into linear-domain inputs [r,g,b] in [0,1] sRGB. */
function hexToRgb(hex: string): [number, number, number] | null {
  if (typeof hex !== "string") return null;
  let h = hex.trim();
  if (h.startsWith("#")) h = h.slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return [r, g, b];
}

/** sRGB companded channel [0,1] -> linear-light [0,1]. */
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** linear-light channel [0,1] -> sRGB companded [0,1]. */
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/** Convert an sRGB hex to OKLCH. Returns null for an unparseable hex. */
export function hexToOklch(hex: string): Oklch | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);

  // linear sRGB -> LMS (cone response)
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  // LMS' -> OKLab
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.hypot(a, bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: C < 1e-6 ? 0 : H };
}

/** Convert OKLCH back to linear-light sRGB [r,g,b] (may be out of [0,1] gamut). */
function oklchToLinearRgb({ l: L, c: C, h: H }: Oklch): [number, number, number] {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const bb = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * bb;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bb;
  const s_ = L - 0.0894841775 * a - 1.291485548 * bb;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [r, g, b];
}

/** Convert OKLCH to an sRGB hex (gamut-clipped at the linear stage). */
export function oklchToHex(color: Oklch): string {
  const lin = oklchToLinearRgb(color);
  const toByte = (c: number) => {
    const v = linearToSrgb(Math.min(1, Math.max(0, c)));
    return Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${toByte(lin[0])}${toByte(lin[1])}${toByte(lin[2])}`;
}

/* ============================================================================
 * The emerald reference ramp (read from cd-tokens.css / globals.css)
 * --------------------------------------------------------------------------
 * These are the EXACT channels the design ships for the default emerald brand,
 * hue 162. We capture each sibling token's relationship to --brand as:
 *   - an additive lightness delta (dL), and
 *   - a multiplicative chroma factor relative to emerald's base chroma (cMul).
 * Applying those deltas to ANY input hue/lightness/chroma reproduces the same
 * tonal family the design hand-tuned for emerald.
 * ========================================================================== */

/** emerald base chroma, the reference for the chroma ramp. */
const EMERALD_BASE_C = 0.122;

interface RampStep {
  /** Lightness delta added to the input brand lightness. */
  dL: number;
  /** Chroma multiplier applied to the scaled brand chroma. */
  cMul: number;
  /** Absolute lightness floor/ceiling so tints/inks stay readable regardless of input. */
  lClamp: [number, number];
}

/**
 * LIGHT theme steps, derived from the emerald light channels:
 *   brand      0.585 0.122   (reference -> dL 0,    cMul 1)
 *   brand-2    0.515 0.118   (dL -0.070, cMul 0.967)
 *   brand-ink  0.40  0.10    (dL -0.185, cMul 0.820)
 *   brand-tint 0.955 0.028   (dL +0.370, cMul 0.230)  -> high-L clamp
 *   brand-tint-2 0.925 0.045 (dL +0.340, cMul 0.369)  -> high-L clamp
 *   on-brand   0.99  0.01    (dL +0.405, cMul 0.082)  -> near-white text
 */
const LIGHT_STEPS: Record<BrandTokenKey, RampStep> = {
  "--brand": { dL: 0, cMul: 1, lClamp: [0.45, 0.72] },
  "--brand-2": { dL: -0.07, cMul: 0.967, lClamp: [0.4, 0.66] },
  "--brand-ink": { dL: -0.185, cMul: 0.82, lClamp: [0.32, 0.5] },
  "--brand-tint": { dL: 0.37, cMul: 0.23, lClamp: [0.93, 0.975] },
  "--brand-tint-2": { dL: 0.34, cMul: 0.369, lClamp: [0.89, 0.95] },
  "--on-brand": { dL: 0.405, cMul: 0.082, lClamp: [0.98, 0.995] },
};

/**
 * DARK theme steps, derived from the emerald dark channels:
 *   brand       0.755 0.13   (reference -> dL 0,   cMul 1.066 vs base)
 *   brand-2     0.82  0.13   (dL +0.065)
 *   brand-ink   0.86  0.10   (dL +0.105, cMul 0.82)
 *   brand-tint  0.30  0.05   (dL -0.455, cMul 0.41) -> low-L clamp
 *   brand-tint-2 0.36 0.07   (dL -0.395, cMul 0.574)-> low-L clamp
 *   on-brand    0.17  0.04   (dL -0.585, cMul 0.328)-> near-black text
 *
 * The dark brand is LIGHTER than the input (a vivid foreground on a dark
 * surface), so we lift the input lightness into the dark-brand band.
 */
const DARK_BRAND_L = 0.755;
const DARK_STEPS: Record<BrandTokenKey, RampStep> = {
  "--brand": { dL: 0, cMul: 1.066, lClamp: [0.66, 0.82] },
  "--brand-2": { dL: 0.065, cMul: 1.066, lClamp: [0.72, 0.88] },
  "--brand-ink": { dL: 0.105, cMul: 0.82, lClamp: [0.78, 0.92] },
  "--brand-tint": { dL: -0.455, cMul: 0.41, lClamp: [0.26, 0.36] },
  "--brand-tint-2": { dL: -0.395, cMul: 0.574, lClamp: [0.32, 0.42] },
  "--on-brand": { dL: -0.585, cMul: 0.328, lClamp: [0.15, 0.22] },
};

/* ============================================================================
 * Channel formatting helpers
 * ========================================================================== */

/** Round to a sane number of decimals and strip trailing zeros. */
function r3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Format an OKLCH triple as the bare channel string "L C H" used by the tokens. */
function channels({ l, c, h }: Oklch): string {
  return `${r3(l)} ${r3(c)} ${r3(h)}`;
}

/** Apply one ramp step to the input brand color for a given theme baseline. */
function applyStep(brand: Oklch, step: RampStep, baselineL: number, chromaScale: number): Oklch {
  const l = Math.min(step.lClamp[1], Math.max(step.lClamp[0], baselineL + step.dL));
  const c = Math.max(0, EMERALD_BASE_C * chromaScale * step.cMul);
  return { l, c, h: brand.h };
}

/* ============================================================================
 * Public: brandRamp
 * ========================================================================== */

/**
 * Generate the full Aurora brand token family from ONE brand hex.
 *
 * Returns `{ light, dark }` where each is a Record keyed by the EXACT bare-channel
 * token names the Aurora palette uses:
 *   --brand, --brand-2, --brand-ink, --brand-tint, --brand-tint-2, --on-brand
 * plus their --c-* alias form (oklch(var(--token))) and the bare alias `--c-brand`.
 *
 * Values are the bare "L C H" oklch channels (matching globals.css). The --c-*
 * entries are the full-color form (matching cd-tokens.css var() usage). The
 * `--on-brand` color is auto-picked for contrast against the brand surface using
 * the 0.179 OKLCH-lightness rule, then nudged to near-white / near-black.
 *
 * An unparseable hex falls back to the design's emerald so callers never crash.
 */
export function brandRamp(hex: string): BrandRamp {
  const parsed = hexToOklch(hex) ?? { l: 0.585, c: EMERALD_BASE_C, h: 162 };
  const chromaScale = EMERALD_BASE_C > 0 ? parsed.c / EMERALD_BASE_C : 1;

  // LIGHT: the brand is roughly the input lightness, gently pulled toward the
  // emerald light-brand band so very light/dark inputs still read as a "brand".
  const lightBaselineL = Math.min(0.72, Math.max(0.45, parsed.l));
  // DARK: lift toward the dark-brand band (a vivid foreground on a dark surface).
  const darkBaselineL = Math.min(0.82, Math.max(0.66, DARK_BRAND_L + (parsed.l - 0.585) * 0.4));

  const buildSide = (
    steps: Record<BrandTokenKey, RampStep>,
    baselineL: number,
    onBrandTowardDark: boolean,
  ): Record<string, string> => {
    const out: Record<string, string> = {};
    (Object.keys(steps) as BrandTokenKey[]).forEach((key) => {
      let color: Oklch;
      if (key === "--on-brand") {
        // Auto-pick the on-brand text color from the brand's own lightness using
        // the 0.179 luminance rule, keeping the design hue so it reads tinted.
        color = pickOnBrand(applyStep(parsed, steps["--brand"], baselineL, chromaScale), onBrandTowardDark);
      } else {
        color = applyStep(parsed, steps[key], baselineL, chromaScale);
      }
      out[key] = channels(color);
      // Full-color alias form (oklch(var(--token))) -> used by cd-tokens.css refs.
      const cKey = key.replace(/^--/, "--c-");
      out[cKey] = `oklch(var(${key}))`;
    });
    return out;
  };

  return {
    light: buildSide(LIGHT_STEPS, lightBaselineL, false),
    dark: buildSide(DARK_STEPS, darkBaselineL, true),
  };
}

/**
 * Pick the on-brand text color using OKLCH lightness as the perceptual proxy
 * (the 0.179 rule): if the brand's lightness exceeds 0.179, dark text wins,
 * otherwise light text. We keep the brand hue at very low chroma so the result
 * is a near-white / near-black that still reads as part of the brand family.
 * `towardDark` forces the dark-theme on-brand into the near-black band.
 */
function pickOnBrand(brand: Oklch, towardDark: boolean): Oklch {
  const useDarkText = brand.l > 0.179;
  if (towardDark) {
    // Dark theme: on-brand sits on a light/vivid brand chip, so it is near-black.
    return { l: useDarkText ? 0.17 : 0.22, c: 0.04, h: brand.h };
  }
  // Light theme: on-brand sits on a saturated brand button, so it is near-white.
  return { l: useDarkText ? 0.99 : 0.99, c: 0.01, h: brand.h };
}

/* ============================================================================
 * Public: WCAG contrast
 * ========================================================================== */

/** WCAG relative luminance of an sRGB hex (0 = black, 1 = white). */
function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG 2.1 contrast ratio between a foreground and background color. Inputs may
 * be sRGB hex strings or OKLCH triples. Returns the ratio and whether it meets
 * AA for normal body text (>= 4.5:1).
 */
export function validateContrast(fg: string | Oklch, bg: string | Oklch): ContrastResult {
  const fgHex = typeof fg === "string" ? fg : oklchToHex(fg);
  const bgHex = typeof bg === "string" ? bg : oklchToHex(bg);
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return { ratio: Math.round(ratio * 100) / 100, passesAA: ratio >= 4.5 };
}
