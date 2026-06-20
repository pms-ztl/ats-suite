"use client";
// hooks/use-in-view.ts
// SLICE E5 - a tiny IntersectionObserver hook so OFF-screen dashboard widgets
// neither mount their body nor start fetching until they scroll into view.
//
// WHY: a customizable dashboard (WF5/WF6) can stack many data-bound widgets,
// each on the 45s live-refetch heartbeat. Mounting + fetching all of them on
// first paint would fire every gateway call at once even for cells the user
// never scrolls to. <WidgetFrame> gates its lazy body + its useData binding
// behind this hook, so a widget's data source is only hit once the cell is
// actually visible.
//
// Behaviour:
//   - Returns a ref to attach to the observed element and a boolean `inView`.
//   - `inView` latches true the first time the element intersects and STAYS
//     true (`once` default) so a widget that scrolls back off-screen keeps its
//     mounted body + live refetch rather than tearing down and re-fetching.
//   - SSR / no-IntersectionObserver fallback: treat as in view so the content
//     is never permanently hidden (graceful degradation, no blank dashboard).
import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  /** Start observing eagerly: a positive rootMargin pre-mounts cells slightly
   *  before they enter the viewport so there is no visible pop-in. Default
   *  "200px" (one row of lead-in). */
  rootMargin?: string;
  /** Fraction of the element that must be visible to count. Default 0. */
  threshold?: number | number[];
  /** Latch true on first intersection and stop observing (default true). Set
   *  false to track visibility continuously. */
  once?: boolean;
}

export function useInView<T extends Element = HTMLDivElement>(
  options: UseInViewOptions = {},
): { ref: React.RefObject<T>; inView: boolean } {
  const { rootMargin = "200px", threshold = 0, once = true } = options;
  const ref = useRef<T>(null);
  // SSR-safe default: render visible when IntersectionObserver is unavailable
  // (server, jsdom, very old browsers) so a widget is never stuck hidden.
  const [inView, setInView] = useState<boolean>(() =>
    typeof window === "undefined" || typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    // Already latched in `once` mode -> nothing to observe.
    if (once && inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootMargin, JSON.stringify(threshold), once]);

  return { ref, inView };
}
