"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// ── Validation helpers ─────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

// ── Reset Password form (shown when ?token= is present) ───────────────────────

function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState<{ password?: string; confirm?: string }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordErr = validatePassword(password);
    const confirmErr  = password !== confirm ? "Passwords do not match." : null;

    if (passwordErr || confirmErr) {
      setErrors({ password: passwordErr ?? undefined, confirm: confirmErr ?? undefined });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      if (USE_MOCKS) {
        await new Promise(r => setTimeout(r, 800));
        toast.success("Password reset successfully! Redirecting to sign in…");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      toast.success("Password reset successfully! Redirecting to sign in…");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">C</div>
            <div>
              <div className="font-bold text-lg">CDC ATS</div>
              <div className="text-xs text-muted-foreground">AI-Powered Hiring</div>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-2">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Set new password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">New password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoFocus
                  autoComplete="new-password"
                  className={errors.password ? "border-destructive" : ""}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
              {/* Password strength checklist — show when password field has any value */}
              {password.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {[
                    { label: "At least 8 characters", met: password.length >= 8 },
                    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
                    { label: "One number", met: /[0-9]/.test(password) },
                  ].map(({ label, met }) => (
                    <li key={label} className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {met
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        : <Circle className="h-3.5 w-3.5 shrink-0" />
                      }
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={errors.confirm ? "border-destructive" : ""}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirm(v => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-xs text-destructive">{errors.confirm}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving…" : "Set new password"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Forgot Password flow ───────────────────────────────────────────────────────

type Step = "email" | "sent";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const resetToken   = searchParams.get("token");

  // Hooks must be called before any early return
  const [step, setStep]     = useState<Step>("email");
  const [email, setEmail]   = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // If a reset token is present in the URL, show the reset password form
  if (resetToken) {
    return <ResetPasswordForm token={resetToken} />;
  }

  const sendResetLink = async () => {
    const err = validateEmail(email);
    if (err) {
      setEmailErr(err);
      return;
    }
    setEmailErr(null);
    setLoading(true);

    try {
      if (USE_MOCKS) {
        await new Promise(r => setTimeout(r, 800));
        setStep("sent");
        return;
      }

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset link.");

      setStep("sent");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendResetLink();
  };

  // ── "Sent" step ──────────────────────────────────────────────────────────────
  if (step === "sent") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">C</div>
              <div>
                <div className="font-bold text-lg">CDC ATS</div>
                <div className="text-xs text-muted-foreground">AI-Powered Hiring</div>
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to your inbox.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-700">
              <Mail className="h-4 w-4 shrink-0" />
              Reset link sent to <span className="font-medium">{email}</span>
            </div>

            <Button
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={() => {
                sendResetLink();
                toast.info("Reset link resent.");
              }}
            >
              {loading ? "Resending…" : "Didn't receive it? Resend"}
            </Button>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── "Email" step ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">C</div>
            <div>
              <div className="font-bold text-lg">CDC ATS</div>
              <div className="text-xs text-muted-foreground">AI-Powered Hiring</div>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-2">
            <Mail className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your work email and we&apos;ll send you a reset link.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailErr) setEmailErr(null);
                }}
                autoFocus
                autoComplete="email"
                className={emailErr ? "border-destructive" : ""}
              />
              {emailErr && (
                <p className="text-xs text-destructive">{emailErr}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
