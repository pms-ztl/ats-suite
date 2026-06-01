import type { Config } from "tailwindcss";

/**
 * CDC ATS "Aurora" Tailwind config. Palette tokens are bare oklch channels in
 * app/globals.css, wrapped here as oklch(var(--x) / <alpha-value>) so opacity
 * modifiers (bg-primary/10, border-border/40, ...) work. Light/dark switch via
 * the `.dark` class. shadcn/ui inherits via the alias tokens.
 */
const c = (v: string) => `oklch(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aurora semantic surfaces
        bg: c("--bg"),
        "bg-deep": c("--bg-deep"),
        surface: { DEFAULT: c("--surface"), 2: c("--surface-2"), 3: c("--surface-3") },
        ink: { DEFAULT: c("--ink"), 2: c("--ink-2"), 3: c("--ink-3"), inv: c("--ink-inv") },
        line: { DEFAULT: c("--line"), 2: c("--line-2"), strong: c("--line-strong") },
        brand: { DEFAULT: c("--brand"), 2: c("--brand-2"), ink: c("--brand-ink"), tint: c("--brand-tint"), "tint-2": c("--brand-tint-2"), on: c("--on-brand") },
        ai: { DEFAULT: c("--ai"), 2: c("--ai-2"), ink: c("--ai-ink"), tint: c("--ai-tint"), "tint-2": c("--ai-tint-2"), on: c("--on-ai") },
        ok: { DEFAULT: c("--ok"), tint: c("--ok-tint") },
        warn: { DEFAULT: c("--warn"), tint: c("--warn-tint") },
        danger: { DEFAULT: c("--danger"), tint: c("--danger-tint") },
        info: { DEFAULT: c("--info"), tint: c("--info-tint") },
        // shadcn/ui contract
        background: c("--background"),
        foreground: c("--foreground"),
        card: { DEFAULT: c("--card"), foreground: c("--card-foreground") },
        popover: { DEFAULT: c("--popover"), foreground: c("--popover-foreground") },
        primary: { DEFAULT: c("--primary"), foreground: c("--primary-foreground") },
        secondary: { DEFAULT: c("--secondary"), foreground: c("--secondary-foreground") },
        muted: { DEFAULT: c("--muted"), foreground: c("--muted-foreground") },
        accent: { DEFAULT: c("--accent"), foreground: c("--accent-foreground") },
        destructive: { DEFAULT: c("--destructive"), foreground: c("--destructive-foreground") },
        border: c("--border"),
        input: c("--input"),
        ring: c("--brand"),
        // legacy-compat (pre-Aurora components used these)
        success: { DEFAULT: c("--ok"), foreground: c("--on-brand") },
        warning: { DEFAULT: c("--warn"), foreground: c("--on-brand") },
      },
      fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
      fontSize: {
        "2xs": "var(--fs-2xs)", xs: "var(--fs-xs)", sm: "var(--fs-sm)", base: "var(--fs-base)",
        md: "var(--fs-md)", lg: "var(--fs-lg)", xl: "var(--fs-xl)", "2xl": "var(--fs-2xl)",
        "3xl": "var(--fs-3xl)", "4xl": "var(--fs-4xl)", "5xl": "var(--fs-5xl)",
      },
      borderRadius: {
        xs: "var(--r-xs)", sm: "var(--r-sm)", DEFAULT: "var(--r)", md: "var(--r)",
        lg: "var(--r-lg)", xl: "var(--r-xl)", "2xl": "var(--r-2xl)", pill: "var(--r-pill)",
      },
      boxShadow: { e1: "var(--e1)", e2: "var(--e2)", e3: "var(--e3)", ring: "var(--ring)", "ai-ring": "var(--ai-ring)" },
      transitionTimingFunction: { out: "var(--ease-out)", io: "var(--ease-io)", spring: "var(--ease-spring)" },
      transitionDuration: { fast: "130ms", DEFAULT: "240ms", slow: "460ms" },
      backdropBlur: { glass: "var(--glass-blur)" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        pop: { from: { opacity: "0", transform: "scale(.96)" }, to: { opacity: "1", transform: "none" } },
        floaty: { to: { transform: "translateY(-6px)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite",
        rise: "rise .45s var(--ease-out) both",
        pop: "pop .3s var(--ease-spring) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
