"use client";

const TOKEN_COOKIE = "ats-token";
const REFRESH_THRESHOLD_MS = 30 * 60 * 1000; // Refresh if < 30min remaining

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include", // sends the ats-refresh cookie
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data?.token ?? null;
  } catch {
    return null;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match?.[2] ? decodeURIComponent(match[2]) : null;
}

function parseJWT(token: string): { exp?: number; iat?: number; [key: string]: unknown } | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(): number | null {
  const token = getCookie(TOKEN_COOKIE);
  if (!token) return null;
  const payload = parseJWT(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000 - Date.now();
}

export function isTokenExpiringSoon(): boolean {
  const remaining = getTokenExpiryMs();
  if (remaining === null) return false;
  return remaining < REFRESH_THRESHOLD_MS;
}

export async function refreshTokenIfNeeded(): Promise<void> {
  const remaining = getTokenExpiryMs();

  // If token is fully expired (not just expiring soon), redirect immediately
  if (remaining !== null && remaining <= 0) {
    if (typeof window !== "undefined") {
      window.location.href = "/session-expired";
    }
    return;
  }

  if (!isTokenExpiringSoon()) return;

  const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  if (USE_MOCKS) {
    // In mock mode, just extend the mock token by resetting its cookie
    const maxAge = 24 * 60 * 60; // 24 hours
    document.cookie = `${TOKEN_COOKIE}=mock-token; path=/; max-age=${maxAge}`;
    return;
  }

  try {
    const newToken = await refreshAccessToken();
    if (newToken) {
      document.cookie = `${TOKEN_COOKIE}=${newToken}; path=/; max-age=${24 * 60 * 60}`;
    }
  } catch {
    // Silently fail — let the normal 401 flow handle expiry
  }
}
