"use client";
// Animated shader backdrop for the Overview (kpi_scorecard) card.
//
// Adapted from a supplied "Axion Studio" hero spec, but RETHEMED to the ATS
// palette: the source used orange (#ff5f03 / #F26522) which clashes badly with
// this product's green brand. Every accent here reads from the real design
// tokens (--c-brand etc.) so it follows tenant branding + light/dark like the
// rest of the app instead of hardcoding a second identity.
//
// Deliberately SUBTLE: this sits behind live KPI numbers on a page recruiters
// leave open all day, so it runs at low opacity + slow speed and self-disables
// on prefers-reduced-motion or when WebGPU is unavailable.
//
// NOTE: `shaders` renders via typegpu = WebGPU, not WebGL. Unsupported browsers
// (notably Safari) get the static gradient fallback rather than a broken canvas.
import * as React from "react";
import dynamic from "next/dynamic";

// The shader stack is WebGPU + a heavy dep — never SSR it, and keep it out of
// the initial dashboard bundle. The card renders fine while this resolves.
const ShaderStack = dynamic(() => import("./shader-stack"), {
  ssr: false,
  loading: () => null,
});

/** Reads the resolved value of a CSS custom property (design token). */
function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(true); // assume reduced until proven otherwise
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

function useWebGpuSupported(): boolean | null {
  const [ok, setOk] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    setOk(typeof navigator !== "undefined" && "gpu" in navigator);
  }, []);
  return ok;
}

/**
 * Static, zero-cost stand-in used for reduced-motion / no-WebGPU / render error.
 * Same brand tint as the live stack so the card looks intentional either way —
 * it is a decorative wash only, never a data surface.
 */
function StaticWash() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "radial-gradient(120% 80% at 85% 0%, color-mix(in oklab, var(--c-brand) 10%, transparent) 0%, transparent 60%)," +
          "radial-gradient(90% 70% at 0% 100%, color-mix(in oklab, var(--c-ai) 7%, transparent) 0%, transparent 55%)",
      }}
    />
  );
}

class ShaderBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    // A decorative backdrop must never take the dashboard down with it.
    if (this.state.failed) return <StaticWash />;
    return this.props.children;
  }
}

export function ShaderBackdrop() {
  const reduced = usePrefersReducedMotion();
  const gpu = useWebGpuSupported();
  const [tokens, setTokens] = React.useState<{ brand: string; ai: string; surface: string } | null>(null);

  React.useEffect(() => {
    setTokens({
      brand: readToken("--c-brand", "#16a37a"),
      ai: readToken("--c-ai", "#7c5cff"),
      surface: readToken("--c-surface", "#ffffff"),
    });
  }, []);

  // Honour the user's motion preference, and don't attempt WebGPU where absent.
  if (reduced || gpu === false) return <StaticWash />;
  if (gpu === null || !tokens) return <StaticWash />; // pre-detection: show the wash, no flash

  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      <ShaderBoundary>
        <ShaderStack brand={tokens.brand} ai={tokens.ai} surface={tokens.surface} />
      </ShaderBoundary>
    </div>
  );
}

export default ShaderBackdrop;
