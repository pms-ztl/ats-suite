"use client";

/**
 * Shared login card used by:
 *   /login                (Tenant Admin tier)
 *   /super-admin/login    (Platform tier)
 *   /staff/login          (Tenant Staff tier)
 *
 * Each consumer passes a `tier` config + an `allowedRoles` whitelist. After a
 * successful /api/auth/login, if the returned user.role is NOT in allowedRoles,
 * we reject with a tier-aware "wrong portal" message that points the user at
 * the correct sign-in URL.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export interface LoginCardProps {
  /** Identifier shown in error/redirect text. */
  tierLabel:     string;   // e.g. "Platform admin", "Tenant admin", "Staff"
  /** Where to redirect after successful login. */
  homeUrl:       string;   // e.g. "/admin", "/", "/"
  /** Allowed roles for this portal. Login is rejected if returned role isn't here. */
  allowedRoles:  string[];
  /** Distinct icon + accent so users know which portal they're on. */
  accentClass:   string;   // tailwind classes for the avatar bg + glow
  letter:        string;   // single character in the avatar
  title:         string;   // e.g. "Platform Admin Sign-In"
  subtitle:      string;
  /** Optional "wrong portal" map: role → correct URL. */
  redirectMap?:  Record<string, { url: string; label: string }>;
  /** Optional footer slot (e.g. sign-up link). */
  footerSlot?:   React.ReactNode;
}

export function LoginCard(props: LoginCardProps) {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<React.ReactNode>("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  // Phase 28, SSO discovery. When the user's email matches a tenant with
  // SSO enabled, we hide the password field and show a "Continue with SSO"
  // button that navigates to the tenant's initiate URL.
  const [ssoTarget, setSsoTarget] = useState<{ initiateUrl: string; protocol: string } | null>(null);
  const [ssoChecking, setSsoChecking] = useState(false);

  async function checkSso(emailValue: string) {
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setSsoTarget(null);
      return;
    }
    setSsoChecking(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const res = await fetch(`${apiBase}/auth/sso/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      if (!res.ok) { setSsoTarget(null); return; }
      const body = await res.json();
      const data = body.data ?? body;
      setSsoTarget(data && data.initiateUrl ? { initiateUrl: data.initiateUrl, protocol: data.protocol } : null);
    } catch {
      setSsoTarget(null);
    } finally {
      setSsoChecking(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fe: { email?: string; password?: string } = {};
    if (!email) fe.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fe.email = "Enter a valid email.";
    if (!password) fe.password = "Password is required.";
    if (Object.keys(fe).length > 0) { setFieldErrors(fe); return; }
    setFieldErrors({});
    setError("");
    setLoading(true);

    try {
      if (USE_MOCKS) {
        document.cookie = "ats-token=mock-token; path=/; max-age=86400";
        router.push(props.homeUrl);
        return;
      }

      // Use the shared login() from auth-context (sets token, fetches /me)
      await login(email, password);

      // After login, auth-context has set user; fetch /me again to confirm role
      // (login() pushes to "/" by default, we need tier check before redirect)
      const token = window.sessionStorage.getItem("ats-access-token");
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!meRes.ok) throw new Error("Failed to verify role after login.");
      const me = await meRes.json();
      const role = me.data?.role ?? me.role;

      if (!props.allowedRoles.includes(role)) {
        // Wrong portal, tell user where to sign in
        const correct = props.redirectMap?.[role];
        setError(
          correct ? (
            <>
              This portal is for {props.tierLabel}. Your account is{" "}
              <strong>{role}</strong>. Sign in at{" "}
              <Link href={correct.url} className="underline font-semibold">
                {correct.label}
              </Link>{" "}
              instead.
            </>
          ) : (
            <>
              This portal is for {props.tierLabel}. Your account role{" "}
              <strong>{role}</strong> is not allowed here.
            </>
          )
        );
        // Clear token so they aren't logged in to the wrong portal
        try { window.sessionStorage.removeItem("ats-access-token"); } catch {}
        document.cookie = "ats-token=; Max-Age=0; path=/";
        setLoading(false);
        return;
      }

      router.push(props.homeUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Aurora AuthShell: ambient brand panel beside the focused sign-in card */}
      <aside className="relative hidden overflow-hidden bg-bg-deep lg:block" aria-hidden="true">
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 50% at 30% 30%, var(--c-brand-tint-2), transparent 60%), radial-gradient(55% 50% at 80% 80%, var(--c-ai-tint-2), transparent 60%)" }} />
        <div className="relative flex h-full flex-col justify-end p-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Hire with AI you can trust.</h2>
          <p className="mt-2 max-w-[40ch] text-ink-2">Evidence-backed screening, human-in-the-loop decisions, candidate transparency.</p>
        </div>
      </aside>
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[420px] flex flex-col items-center gap-5">
          <Card className="w-full">
          <CardHeader className="text-center pt-8 pb-2">
            <div className={cn(
              "mx-auto h-12 w-12 rounded-2xl flex items-center justify-center mb-5",
              props.accentClass
            )}>
              <span className="text-xl font-bold text-white">{props.letter}</span>
            </div>
            <CardTitle className="text-2xl tracking-tight">{props.title}</CardTitle>
            <CardDescription className="mt-1">{props.subtitle}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Work email <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }));
                    // Reset SSO state when email changes, user might be typing a different domain.
                    if (ssoTarget) setSsoTarget(null);
                  }}
                  onBlur={(e) => void checkSso(e.target.value)}
                  autoComplete="email"
                  className={fieldErrors.email ? "border-destructive" : ""}
                />
                {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
                {ssoChecking && <p className="text-xs text-muted-foreground">Checking for SSO…</p>}
              </div>
              {/* Phase 28, show password input ONLY when no SSO target detected for this email. */}
              {!ssoTarget && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <Link href="/forgot-password" className="text-2xs text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined }));
                    }}
                    autoComplete="current-password"
                    className={fieldErrors.password ? "border-destructive" : ""}
                  />
                  {fieldErrors.password && <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>}
                </div>
              )}
              {ssoTarget && (
                <div className="rounded-md bg-primary/10 border border-primary/30 p-3 text-sm">
                  <p className="font-medium">Sign in with your organization&apos;s identity provider</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your email is configured to use {ssoTarget.protocol} SSO. Click below to continue at your IdP.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {ssoTarget ? (
                <Button
                  type="button"
                  className="w-full h-10 font-semibold"
                  onClick={() => { window.location.href = ssoTarget.initiateUrl; }}
                >
                  Continue with {ssoTarget.protocol}
                </Button>
              ) : (
                <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                  {loading ? "Signing in…" : `Sign In to ${props.tierLabel}`}
                </Button>
              )}
              {props.footerSlot}
            </CardFooter>
          </form>
          </Card>
          <p className="text-2xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} CDC ATS · Enterprise edition.
          </p>
        </div>
      </main>
    </div>
  );
}
