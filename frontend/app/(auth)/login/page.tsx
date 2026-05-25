"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

function LoginForm() {
  const [step, setStep]           = useState<"credentials" | "mfa">("credentials");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [mfaCode, setMfaCode]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") || "/";
  const { login }    = useAuth();

  // ── Step 1: credentials ────────────────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    // Per-field validation
    const newFieldErrors: { email?: string; password?: string } = {};
    if (!email) {
      newFieldErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newFieldErrors.password = "Password is required.";
    }
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }
    setFieldErrors({});

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Auth context handles token storage and redirect to "/"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: MFA verify ─────────────────────────────────────────────────────
  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(mfaCode)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      // MFA verification calls POST /api/auth/mfa/verify which returns tokens
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: mfaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed. Please try again.");
      router.push(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Credentials form ───────────────────────────────────────────────────────
  if (step === "credentials") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col items-center gap-5">
          <Card className="w-full">
            <CardHeader className="text-center pt-8 pb-2">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-primary glow-primary flex items-center justify-center mb-5">
                <span className="text-xl font-bold text-primary-foreground">C</span>
              </div>
              <CardTitle className="text-2xl tracking-tight">Welcome Back</CardTitle>
              <CardDescription className="mt-1">Sign in to <span className="text-foreground font-medium">CDC ATS</span></CardDescription>
            </CardHeader>
            <form onSubmit={handleCredentials}>
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
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    autoComplete="email"
                    className={fieldErrors.email ? "border-destructive" : ""}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
                  )}
                </div>
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
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    autoComplete="current-password"
                    className={fieldErrors.password ? "border-destructive" : ""}
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
                  )}
                </div>
                {USE_MOCKS && (
                  <p className="text-2xs text-muted-foreground text-center">
                    Demo mode — any credentials work
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  Fields marked <span className="text-destructive">*</span> are required.
                </p>
                <Button type="submit" className="w-full glow-primary h-10 font-semibold" disabled={loading}>
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
                <p className="text-2xs text-muted-foreground text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-primary hover:underline">Sign up</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
          <p className="text-2xs text-muted-foreground text-center">
            &copy; 2026 CDC. Enterprise edition.
          </p>
        </div>
      </div>
    );
  }

  // ── MFA form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-4">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
            <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
          </CardHeader>
          <form onSubmit={handleMFA}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="mfa-code">Authentication Code <span className="text-destructive">*</span></Label>
                <Input
                  id="mfa-code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  autoFocus
                />
              </div>
              <p className="text-2xs text-muted-foreground text-center">
                Open your authenticator app (e.g. Google Authenticator, Authy) to find your code.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                Fields marked <span className="text-destructive">*</span> are required.
              </p>
              <Button type="submit" className="w-full" disabled={loading || mfaCode.length !== 6}>
                {loading ? "Verifying…" : "Verify"}
              </Button>
              <button
                type="button"
                className="text-2xs text-primary hover:underline"
                onClick={() =>
                  toast.info("Contact your administrator for backup code access.")
                }
              >
                Use a backup code
              </button>
              <button
                type="button"
                className="text-2xs text-muted-foreground hover:underline"
                onClick={() => {
                  setStep("credentials");
                  setMfaCode("");
                  setError("");
                }}
              >
                Back to sign in
              </button>
            </CardFooter>
          </form>
        </Card>
        <p className="text-2xs text-muted-foreground text-center">
          &copy; 2026 CDC. Enterprise edition.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
