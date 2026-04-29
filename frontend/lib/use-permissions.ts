"use client";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export function usePermissions() {
  const user = getCurrentUser();
  const role = user?.role ?? "candidate";
  const allowed = ROLE_PERMISSIONS[role] ?? [];

  return {
    role,
    can: (section: string) => role === "admin" || allowed.includes(section),
    isAdmin: role === "admin",
    isCandidate: role === "candidate",
  };
}
