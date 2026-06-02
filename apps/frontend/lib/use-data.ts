"use client";
// lib/use-data.ts - tiny fetch hook so the Aurora pages get real loading / error /
// empty states with zero layout shift.
import { useEffect, useState } from "react";

export type Async<T> = { data?: T; error?: Error; loading: boolean };

export function useData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): Async<T> & { reload: () => void } {
  const [state, setState] = useState<Async<T>>({ loading: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    fetcher()
      .then((data) => alive && setState({ data, loading: false }))
      .catch((error) => alive && setState({ error, loading: false }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, n]);
  return { ...state, reload: () => setN((x) => x + 1) };
}
