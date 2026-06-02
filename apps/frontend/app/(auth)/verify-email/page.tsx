"use client";

/**
 * Phase 31b, email verification landing page.
 * URL: /verify-email?token=<uuid>
 *
 * Validates the token via /api/auth/verify-email. Shows success or error.
 * After success, links the user back to either /login (if not authed) or
 * / (if they're already signed in).
 */
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"verifying" | "ok" | "fail">("verifying");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setState("fail");
      setMessage("This link is missing a token. Request a new one from your dashboard.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/verify-email`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await res.json();
        if (!res.ok) {
          setState("fail");
          setMessage(body?.error?.message ?? body?.message ?? "This link is invalid or expired.");
          return;
        }
        setState("ok");
        setMessage(`${body?.data?.email ?? "Your email"} is confirmed.`);
      } catch {
        setState("fail");
        setMessage("Couldn't reach the server. Try the link again in a moment.");
      }
    })();
  }, [token]);

  return (
    <AuthShell>
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pt-8">
          {state === "verifying" && (
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          )}
          {state === "ok" && (
            <div className="mx-auto h-12 w-12 rounded-full bg-ok/15 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-ok" />
            </div>
          )}
          {state === "fail" && (
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/15 flex items-center justify-center">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
          )}
          <CardTitle className="text-xl mt-4">
            {state === "verifying" && "Confirming your email…"}
            {state === "ok" && "Email confirmed"}
            {state === "fail" && "Couldn't confirm"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
          {state === "ok" && (
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-primary hover:underline text-sm">
                Continue to dashboard →
              </Link>
              <Link href="/login" className="text-muted-foreground hover:underline text-xs">
                Or sign in
              </Link>
            </div>
          )}
          {state === "fail" && (
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-primary hover:underline text-sm">
                Go to dashboard
              </Link>
              <span className="text-xs text-muted-foreground">
                Already signed in? Use "Resend verification" in Settings.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthShell>
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </AuthShell>
    }>
      <VerifyEmailInner />
    </Suspense>
  );
}
