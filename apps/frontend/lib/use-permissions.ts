"use client";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export function usePermissions() {
  const user = getCurrentUser();
  // Widen to plain string so backend uppercase roles compare cleanly
  const role: string = (user?.role as string | undefined) ?? "candidate";
  const allowed = ROLE_PERMISSIONS[role] ?? [];

  const isSuperAdmin = role === "SUPER_ADMIN" || role === "super_admin";
  const isTenantAdmin = role === "ADMIN" || role === "admin";
  const isStaff = ["RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "recruiter", "hiring_manager", "interviewer"].includes(role);
  const isCandidate = role === "CANDIDATE" || role === "candidate";

  return {
    role,
    // Super-admins and tenant-admins see everything; others gated by their list
    can: (section: string) => isSuperAdmin || isTenantAdmin || allowed.includes(section),
    isAdmin: isSuperAdmin || isTenantAdmin,
    isSuperAdmin,
    isTenantAdmin,
    isStaff,
    isCandidate,
  };
}
