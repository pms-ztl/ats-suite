"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { logger } from "./logger";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "ats-access-token";

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  return res;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setAuth = (user: AuthUser, token: string) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
    setState({ user, token, isLoading: false, isAuthenticated: true });
  };

  const clearAuth = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
  };

  // On mount: check sessionStorage then try /me
  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }
    // Validate stored token by fetching /me
    apiFetch("/auth/me", { headers: { Authorization: `Bearer ${stored}` } })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          const u = data.data;
          setAuth({ id: u.id, email: u.email, name: u.name ?? `${u.firstName} ${u.lastName}`, role: u.role, tenantId: u.tenantId }, stored);
        } else {
          clearAuth();
        }
      })
      .catch(() => clearAuth());
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? err.message ?? "Login failed");
    }
    const data = await res.json();
    const { token, user } = data.data;
    setAuth({ id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId }, token);
    logger.info("User logged in", { email: user.email, role: user.role });
    router.push("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      logger.warn("Logout request failed", { error: e });
    }
    clearAuth();
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(TOKEN_KEY) : null;
    if (!stored) return;
    const res = await apiFetch("/auth/me", { headers: { Authorization: `Bearer ${stored}` } });
    if (res.ok) {
      const data = await res.json();
      const u = data.data;
      setAuth({ id: u.id, email: u.email, name: u.name ?? `${u.firstName} ${u.lastName}`, role: u.role, tenantId: u.tenantId }, stored);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(): AuthContextValue {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);
  return auth;
}
