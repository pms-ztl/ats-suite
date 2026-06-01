import type { Config } from "tailwindcss";

/**
 * CDC ATS "Aurora" Tailwind config. CSS variables (oklch) in app/globals.css
 * drive every value, so light/dark switch via the `.dark` class with no dark:
 * color variants. Pairs with shadcn/ui via the alias tokens in globals.css.
 */
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
        bg: "var(--bg)",
        "bg-deep": "var(--bg-deep)",
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)", 3: "var(--surface-3)" },
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)", inv: "var(--ink-inv)" },
        line: { DEFAULT: "var(--line)", 2: "var(--line-2)", strong: "var(--line-strong)" },
        brand: { DEFAULT: "var(--brand)", 2: "var(--brand-2)", ink: "var(--brand-ink)", tint: "var(--brand-tint)", "tint-2": "var(--brand-tint-2)", on: "var(--on-brand)" },
        ai: { DEFAULT: "var(--ai)", 2: "var(--ai-2)", ink: "var(--ai-ink)", tint: "var(--ai-tint)", "tint-2": "var(--ai-tint-2)", on: "var(--on-ai)" },
        ok: { DEFAULT: "var(--ok)", tint: "var(--ok-tint)" },
        warn: { DEFAULT: "var(--warn)", tint: "var(--warn-tint)" },
        danger: { DEFAULT: "var(--danger)", tint: "var(--danger-tint)" },
        info: { DEFAULT: "var(--info)", tint: "var(--info-tint)" },
        // shadcn/ui contract
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // legacy-compat (pre-Aurora components used these)
        success: { DEFAULT: "var(--ok)", foreground: "var(--on-brand)" },
        warning: { DEFAULT: "var(--warn)", foreground: "var(--on-brand)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
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
