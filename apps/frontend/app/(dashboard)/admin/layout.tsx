"use client";
// app/(dashboard)/admin/layout.tsx
// Single super-admin guard for the entire /admin/* area (platform-operator
// console: admin home, audit, support, plan-requests, platform/*). Restores
// and unifies the per-page access gates so the Aurora ports cannot expose an
// operator surface to a non-operator. The backend still enforces authz on the
// data endpoints; this is defense-in-depth + correct UX.
import { usePermissions } from "@/lib/use-permissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AccessDenied } from "@/components/shared/access-denied";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useCurrentUser();
  const { isSuperAdmin } = usePermissions();
  if (isLoading) return null; // avoid flashing AccessDenied during auth resolution
  if (!isSuperAdmin) return <AccessDenied />;
  return <>{children}</>;
}
