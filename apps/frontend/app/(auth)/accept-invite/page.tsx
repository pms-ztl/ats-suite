"use client";

/**
 * Phase 31a, accept invite page.
 *
 * Flow:
 *   1. Land here with ?token=<uuid> in the URL (link emailed by gateway).
 *   2. We GET /api/auth/invite-info?token=… to confirm validity and show
 *      "Hi Alex, you've been invited to Acme Corp as Recruiter."
 *   3. User sets a password (12+ chars, with strength meter mirroring
 *      /forgot-password).
 *   4. POST /api/auth/accept-invite → gateway sets the ats-token cookie
 *      and we hard-nav to / so the role dispatcher takes over.
 */
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface InviteInfo {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenantName: string | null;
  expiresAt: string;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

function AcceptInviteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  // Validate token + load invite info on mount.
  useEffect(() => {
    if (!token) {
      setInfoError("This invite link is missing a token. Ask your admin to resend it.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/invite-info?token=${encodeURIComponent(token)}`);
        const body = await res.json();
        if (!res.ok) {
          setInfoError(body?.error?.message ?? body?.message ?? "This invite is invalid or expired.");
          return;
        }
        setInfo(body.data ?? body);
      } catch {
        setInfoError("Couldn't reach the server. Try again in a moment.");
      }
    })();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const pErr = validatePassword(password);
    const cErr = password !== confirm ? "Passwords do not match." : null;
    if (pErr || cErr) {
      setErrors({ password: pErr ?? undefined, confirm: cErr ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/accept-invite`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? body?.message ?? "Couldn't accept invite");
      // Stash the access token in sessionStorage for the API client.
      const accessToken = body?.data?.accessToken ?? body?.accessToken;
      if (accessToken) {
        try { window.sessionStorage.setItem("ats-access-token", accessToken); } catch {}
      }
      toast.success("Welcome aboard! Signing you in…");
      // Hard nav so the role dispatcher gets a fresh /auth/me on mount.
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't accept invite");
      setLoading(false);
    }
  };

  // ── Render: error state ──────────────────────────────────────────────
  if (infoError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite link not valid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{infoError}</p>
            <Link href="/login" className="text-sm text-primary hover:underline">
              Go to sign in →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render: loading state ────────────────────────────────────────────
  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Render: accept form ──────────────────────────────────────────────
  const checks = [
    { ok: password.length >= 12, label: "At least 12 characters" },
    { ok: /[A-Z]/.test(password), label: "One uppercase letter" },
    { ok: /[0-9]/.test(password), label: "One number" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-ai" />
          </div>
          <CardTitle className="text-2xl">Welcome to {info.tenantName ?? "CDC ATS"}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            Hi {info.firstName || info.email}, you&apos;ve been invited as <strong>{info.role}</strong>.
            Set a password to finish creating your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={info.email} readOnly disabled className="bg-muted" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-9"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <ul className="space-y-0.5 pt-1">
                {checks.map((c) => (
                  <li key={c.label} className={`flex items-center gap-1.5 text-2xs ${c.ok ? "text-ok" : "text-muted-foreground"}`}>
                    {c.ok ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    {c.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors(p => ({ ...p, confirm: undefined })); }}
                autoComplete="new-password"
              />
              {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Setting password…" : "Set password & sign in"}
            </Button>

            <p className="text-2xs text-muted-foreground text-center">
              By accepting this invite, you agree to your organization&apos;s admin managing your account.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <AcceptInviteInner />
    </Suspense>
  );
}
