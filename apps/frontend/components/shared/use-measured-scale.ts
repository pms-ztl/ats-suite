"use client";
// components/shared/use-measured-scale.ts
// The house viz kit draws into a FIXED viewBox (e.g. 0 0 640 420) and lets the
// <svg> stretch to fill its card via `width:100%`. That stretch means a 11px
// SVG label can render at any on-screen size: tiny on a narrow card, fine on a
// wide one. This hook measures the live forward scale k = renderedWidth /
// viewBoxWidth with a ResizeObserver on the <svg> element, so callers can floor
// every font through `scaledFont(BASE, k)` and keep text legible regardless of
// how wide the viewBox is stretched.
//
// Dependency-free (React only). SSR-safe: returns k=1 until measured, and guards
// zero/NaN widths so a hidden or pre-paint <svg> never yields a degenerate scale.
import { useEffect, useRef, useState } from "react";

/**
 * Attach the returned ref to an <svg> and read back the live forward scale
 * k = svgEl.clientWidth / viewBoxWidth (1 until measured). Multiply a viewBox
 * length by k to get its on-screen px; divide an on-screen px floor by k to get
 * the viewBox font size that renders at that floor (see `scaledFont`).
 */
export function useMeasuredScale(
  viewBoxWidth: number,
): [React.RefObject<SVGSVGElement>, number] {
  const ref = useRef<SVGSVGElement>(null);
  const [k, setK] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || viewBoxWidth <= 0 || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const w = el.clientWidth || el.getBoundingClientRect().width;
      if (w > 0 && isFinite(w)) {
        const next = w / viewBoxWidth;
        // Avoid churn from sub-pixel jitter; only re-render on a meaningful change.
        setK((prev) => (Math.abs(prev - next) > 0.002 ? next : prev));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewBoxWidth]);

  return [ref, k];
}

/**
 * Floor an on-screen text size: returns the viewBox font size whose RENDERED
 * px never drops below `minPx`. As the <svg> shrinks (k < 1) the viewBox font
 * grows to compensate; as it grows (k > 1) the base size is kept. Use minPx ~11
 * for secondary labels and 12-14 for primary readouts.
 */
export function scaledFont(basePx: number, k: number, minPx = 11): number {
  const safeK = k > 0 && isFinite(k) ? k : 1;
  return Math.max(basePx, minPx / safeK);
}
