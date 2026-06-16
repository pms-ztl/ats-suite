"use client";
// lib/use-data.ts - tiny fetch hook so the Aurora pages get real loading / error /
// empty states with zero layout shift.
//
// Real-time layer: after the initial load the fetcher silently re-runs every 45s
// in the background (paused while the tab is hidden) and immediately when the tab
// regains focus / becomes visible again (throttled to once per 5s). Background
// refreshes never flip `loading` back on and never surface a transient error over
// data we already have — the previous data stays on screen until fresh data lands.
import { useEffect, useRef, useState } from "react";

export type Async<T> = { data?: T; error?: Error; loading: boolean };

const REFRESH_MS = 45_000;
const WAKE_THROTTLE_MS = 5_000;

export function useData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): Async<T> & { reload: () => void } {
  const [state, setState] = useState<Async<T>>({ loading: true });
  const [n, setN] = useState(0);
  // Always call the latest fetcher from background ticks, even if the caller
  // recreates the closure on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let alive = true;
    // Effect-LOCAL bookkeeping: a dead generation's late .finally must never
    // unlock (or throttle) the current generation's fetches.
    let lastFetchAt = Date.now();
    let inFlight = true;

    // Initial (or reload/dep-change) fetch — this one shows the loading state.
    setState({ loading: true });
    fetcher()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((error) => alive && setState({ error, loading: false }))
      .finally(() => { inFlight = false; });

    // Silent background refetch: no loading flicker, no error over good data.
    const silentRefetch = () => {
      if (!alive || inFlight || document.hidden) return;
      lastFetchAt = Date.now();
      inFlight = true;
      fetcherRef.current()
        .then((data) => { if (alive) setState({ data, loading: false }); })
        .catch((error: Error) => {
          // Keep showing the previous data; only surface the error if we have
          // nothing better to show (e.g. the initial fetch failed too).
          if (alive) setState((prev) => (prev.data !== undefined ? prev : { error, loading: false }));
        })
        .finally(() => { inFlight = false; });
    };

    // Refetch right away when the tab regains focus/visibility, at most once per 5s.
    const onWake = () => {
      if (document.hidden) return;
      if (Date.now() - lastFetchAt < WAKE_THROTTLE_MS) return;
      silentRefetch();
    };

    const interval = setInterval(silentRefetch, REFRESH_MS);
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);

    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);

  return { ...state, reload: () => setN((x) => x + 1) };
}
