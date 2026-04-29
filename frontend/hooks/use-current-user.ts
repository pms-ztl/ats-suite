"use client";

import { useAuth } from "@/lib/auth-context";

export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useAuth();
  return { user, isLoading, isAuthenticated };
}

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === "ADMIN";
}

export function useIsRecruiter() {
  const { user } = useAuth();
  return user?.role === "RECRUITER" || user?.role === "ADMIN";
}

export function useIsHiringManager() {
  const { user } = useAuth();
  return user?.role === "HIRING_MANAGER" || user?.role === "ADMIN";
}
