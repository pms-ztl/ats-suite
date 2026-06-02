"use client";

/**
 * Phase 28, SSO post-callback landing.
 *
 * The gateway's /api/auth/sso/saml or /oidc callback handler signs the JWT, sets the
 * httpOnly ats-token cookie, then 302s the browser here. We do nothing
 * useful ourselves, just confirm /auth/me works (the cookie is being
 * sent) and let the Phase 23 role dispatcher take over by navigating
 * to /.
 */
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function SsoCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (!res.ok) {
          setError("SSO login completed but session check failed. Please try logging in again.");
          return;
        }
        // Hard navigation so the role dispatcher gets fresh /auth/me on mount.
        window.location.href = "/";
      } catch (e: any) {
        setError(e?.message ?? "Unknown error during SSO callback");
      }
    })();
  }, []);

  return (
    <AuthShell>
      <div className="text-center space-y-3">
        {error ? (
          <>
            <p className="text-destructive text-lg">⚠ {error}</p>
            <a href="/login" className="text-primary underline">Back to login</a>
          </>
        ) : (
          <>
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground">Completing sign-in…</p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
