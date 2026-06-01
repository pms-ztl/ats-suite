"use client";

/**
 * Phase 31b, confirm-email banner. Shown sitewide when the signed-in user
 * hasn't verified their email yet. Dismiss is session-only (sessionStorage)
 * so they get it back on next login until they verify.
 *
 * Why session-only and not permanent: an unverified email is a real
 * security concern, if we let the user dismiss it forever they might
 * forget about it and accept invites/notifications going to the wrong
 * address. Per-session dismiss is the right middle ground.
 */
import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DISMISS_KEY = "verify-email-dismissed";

export function VerifyEmailBanner() {
  const { user, isLoading } = useCurrentUser();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentAt, setSentAt] = useState<number | null>(null);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch { /* sessionStorage may be blocked */ }
  }, []);

  if (isLoading || !user) return null;
  // user.emailVerified can be undefined for users created before Phase 31b
  // (the backend defaults those to true), only show banner on explicit false.
  if ((user as any).emailVerified !== false) return null;
  if (dismissed) return null;

  const dismiss = () => {
    try { window.sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
    setDismissed(true);
  };

  const resend = async () => {
    setSending(true);
    try {
      const token = (() => {
        try { return window.sessionStorage.getItem("ats-access-token"); } catch { return null; }
      })();
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      if (body?.data?.alreadyVerified || body?.alreadyVerified) {
        toast.success("Your email is already verified, refreshing.");
        window.location.reload();
        return;
      }
      setSentAt(Date.now());
      toast.success(`Verification email sent to ${user.email}`);
    } catch {
      toast.error("Couldn't send, try again in a minute.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-b border-warn/40 bg-warn-tint/80 text-warn">
      <div className="px-6 py-2 flex items-center gap-3 text-sm">
        <Mail className="h-4 w-4 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium">Confirm your email.</span>{" "}
          <span className="opacity-80">
            We sent a link to <strong>{user.email}</strong>
            {sentAt ? " (re-sent, check your inbox)" : ""}.
          </span>
        </div>
        <button
          onClick={resend}
          disabled={sending}
          className="text-xs font-medium underline hover:no-underline disabled:opacity-50"
        >
          {sending ? "Sending…" : "Resend"}
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
