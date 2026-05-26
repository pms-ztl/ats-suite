"use client";

/**
 * Notification hook (Batch 3).
 *
 * - On mount: fetch initial unread list + count
 * - Opens an SSE connection to /api/notifications/stream
 *   - SSE messages of event "notification" prepend to the local list
 *   - If SSE errors twice within 10s, switches to 30s polling
 * - Exposes notifications, unreadCount, markAsRead, markAllRead, refresh
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface Notification {
  id: string;
  tenantId: string | null;
  userId: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function authToken(): string | null {
  try { return window.sessionStorage.getItem("ats-access-token"); } catch { return null; }
}
function authHeaders(): Record<string, string> {
  const t = authToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function useNotifications() {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streamMode, setStreamMode] = useState<"sse" | "polling" | "off">("off");
  const sseRef = useRef<EventSource | null>(null);
  const errorCountRef = useRef(0);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        fetch(`${API_BASE}/notifications?limit=50`, { headers: authHeaders(), credentials: "include" }),
        fetch(`${API_BASE}/notifications/unread-count`, { headers: authHeaders(), credentials: "include" }),
      ]);
      if (listRes.ok) {
        const data = await listRes.json();
        setNotifications(data.data ?? data ?? []);
      }
      if (countRes.ok) {
        const data = await countRes.json();
        setUnreadCount(data.data?.count ?? data.count ?? 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
      credentials: "include",
    }).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    setUnreadCount(0);
    await fetch(`${API_BASE}/notifications/read-all`, {
      method: "POST",
      headers: authHeaders(),
      credentials: "include",
    }).catch(() => {});
  }, []);

  // Initial fetch
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // SSE / polling effect
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setStreamMode("off");
      return;
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      setStreamMode("polling");
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(fetchAll, 30_000);
    }

    function startSse() {
      setStreamMode("sse");
      try {
        // EventSource cannot send headers, so token must come from cookie.
        // Backend supports cookie-based auth (ats-token). If that fails, we fall back.
        const url = `${API_BASE}/notifications/stream`;
        const es = new EventSource(url, { withCredentials: true });
        sseRef.current = es;

        es.addEventListener("notification", (e) => {
          try {
            const notif: Notification = JSON.parse((e as MessageEvent).data);
            setNotifications((prev) => [notif, ...prev]);
            if (!notif.readAt) setUnreadCount((c) => c + 1);
          } catch {}
        });

        es.onerror = () => {
          errorCountRef.current += 1;
          if (errorCountRef.current >= 2) {
            // Two errors → give up, switch to polling
            es.close();
            sseRef.current = null;
            startPolling();
          }
        };
      } catch {
        startPolling();
      }
    }

    // Prefer SSE; fall back to polling
    if (typeof EventSource !== "undefined") {
      startSse();
    } else {
      startPolling();
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [isAuthenticated, user, fetchAll]);

  return {
    notifications,
    unreadCount,
    loading,
    streamMode,
    markAsRead,
    markAllRead,
    refresh: fetchAll,
  };
}
