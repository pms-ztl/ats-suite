"use client";

/**
 * Phase 32a — banner shown sitewide when a SUPER_ADMIN is impersonating
 * another user. Rendered above the verify-email banner; bright red so
 * the support agent can never forget they're acting as someone else.
 *
 * "Stop" POSTs /api/super-admin/impersonate/stop which signs a fresh
 * super-admin JWT and returns us to the platform admin dashboard.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function ImpersonationBanner() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const [stopping, setStopping] = useState(false);

  // actorUserId is only present in the /auth/me response when an
  // impersonation JWT is in the cookie. We rely on the typed AuthUser
  // — `(user as any)` only because actorUserId is optional on AuthUser.
  const actorUserId = (user as any)?.actorUserId as string | undefined;
  if (!actorUserId || !user) return null;

  const stop = async () => {
    setStopping(true);
    try {
      const token = (() => {
        try { return window.sessionStorage.getItem("ats-access-token"); } catch { return null; }
      })();
      const res = await fetch(`${API_BASE}/super-admin/impersonate/stop`, {
        method: "POST",
        credentials: "include",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Returned to your super-admin account.");
      // Hard-nav so the auth context picks up the new JWT cleanly.
      window.location.href = "/admin";
    } catch {
      toast.error("Couldn't stop impersonating — try again.");
      setStopping(false);
    }
  };

  return (
    <div className="bg-rose-600 text-white border-b border-rose-700">
      <div className="px-6 py-2 flex items-center gap-3 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <strong>Impersonation active.</strong>{" "}
          You&apos;re acting as <strong>{user.email}</strong> ({user.role}).
          Every action is audited.
        </div>
        <button
          onClick={stop}
          disabled={stopping}
          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white/15 hover:bg-white/25 text-xs font-medium disabled:opacity-50"
        >
          <LogOut className="h-3 w-3" />
          {stopping ? "Stopping…" : "Stop impersonating"}
        </button>
      </div>
    </div>
  );
}
