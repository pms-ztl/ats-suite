"use client";
// lib/use-live-refresh.ts - background revalidation for components that load
// their data manually (outside of useData).
import { useEffect, useRef } from "react";

const WAKE_THROTTLE_MS = 5_000;

/**
 * Re-runs `cb` on a fixed interval (default 45s) plus immediately when the tab
 * regains focus or becomes visible again, so manually-loaded data stays fresh
 * without any user action.
 *
 * Behavior:
 * - Interval ticks are skipped while the tab is hidden (`document.hidden`).
 * - `window` "focus" and `document` "visibilitychange" (when visible) trigger an
 *   immediate refresh, throttled to at most once per 5 seconds.
 * - Overlapping runs are prevented: a tick is skipped while a previous async
 *   `cb` is still in flight.
 * - Errors thrown/rejected by `cb` are swallowed — a failed background refresh
 *   should never disturb data already on screen.
 * - The interval and listeners are cleaned up on unmount.
 *
 * `cb` is read through a ref, so callers may pass a fresh closure every render
 * without resetting the timer.
 *
 * @param cb Refetch function — should silently reload the component's data.
 * @param ms Interval between background refreshes in milliseconds (default 45000).
 */
export function useLiveRefresh(cb: () => void | Promise<void>, ms = 45_000): void {
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    let alive = true;
    let inFlight = false;
    // The caller just loaded its data on mount — don't instantly re-run on a
    // mount-time focus event.
    let lastRun = Date.now();

    const run = () => {
      if (!alive || inFlight || document.hidden) return;
      lastRun = Date.now();
      inFlight = true;
      Promise.resolve()
        .then(() => cbRef.current())
        .catch(() => { /* silent: keep showing current data */ })
        .finally(() => { inFlight = false; });
    };

    const onWake = () => {
      if (document.hidden) return;
      if (Date.now() - lastRun < WAKE_THROTTLE_MS) return;
      run();
    };

    const interval = setInterval(run, ms);
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);

    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [ms]);
}
