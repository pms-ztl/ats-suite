"use client";

/**
 * Settings → Security
 *   - Change password (current → new with strength rules)
 *   - TOTP MFA enrol (setup → QR + secret → verify → enabled)
 *   - MFA disable (requires current password)
 *
 * Wires the Phase 15 backend endpoints under /api/auth/*.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Shield, CheckCircle2, AlertCircle, Loader2, Copy, EyeOff, Eye } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

export default function SecuritySettingsPage() {
  // ── Change password state ────────────────────────────────────────────────
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // ── MFA state ────────────────────────────────────────────────────────────
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [enrolState, setEnrolState] = useState<"idle" | "setup" | "verifying">("idle");
  const [enrolSecret, setEnrolSecret] = useState("");
  const [enrolQr, setEnrolQr] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePw, setDisablePw] = useState("");

  useEffect(() => {
    // Read current MFA status from /api/auth/me
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setMfaEnabled(!!d?.data?.mfaEnabled))
      .catch(() => { /* keep default */ })
      .finally(() => setMfaLoading(false));
  }, []);

  // ── Change password ──────────────────────────────────────────────────────
  function pwStrength(p: string): { score: number; label: string; color: string } {
    let s = 0;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    if (p.length >= 16) s++;
    const labels = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"];
    const colors = ["text-destructive", "text-destructive", "text-warn", "text-ok", "text-ok", "text-ok"];
    return { score: s, label: labels[s] ?? labels[0]!, color: colors[s] ?? colors[0]! };
  }

  async function changePassword() {
    if (newPw.length < 12) return void toast.error("New password must be 12+ characters");
    if (newPw !== confirmPw) return void toast.error("New password and confirmation don't match");
    setPwSaving(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      toast.success("Password updated. New sessions will use the new password.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err) {
      toast.error(`Couldn't change password: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPwSaving(false);
    }
  }

  // ── MFA enrol ────────────────────────────────────────────────────────────
  async function startMfaEnrol() {
    setEnrolState("setup");
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      setEnrolSecret(body.data.secret);
      setEnrolQr(body.data.qrDataUrl);
    } catch (err) {
      toast.error(`Setup failed: ${err instanceof Error ? err.message : String(err)}`);
      setEnrolState("idle");
    }
  }

  async function verifyMfa() {
    if (!/^\d{6}$/.test(verifyCode)) return void toast.error("Code must be 6 digits");
    setEnrolState("verifying");
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ code: verifyCode }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      toast.success("MFA enabled. You'll be asked for a code on next sign-in.");
      setMfaEnabled(true);
      setEnrolState("idle");
      setEnrolSecret("");
      setEnrolQr("");
      setVerifyCode("");
    } catch (err) {
      toast.error(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
      setEnrolState("setup");
    }
  }

  async function disableMfa() {
    if (!disablePw) return void toast.error("Enter your current password to disable MFA");
    try {
      const res = await fetch(`${API_BASE}/auth/mfa/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ password: disablePw }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
      toast.success("MFA disabled.");
      setMfaEnabled(false);
      setDisablePw("");
    } catch (err) {
      toast.error(`Couldn't disable MFA: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function copySecret() {
    navigator.clipboard.writeText(enrolSecret).then(() => toast.success("Secret copied to clipboard"));
  }

  const strength = pwStrength(newPw);

  return (
    <div className="space-y-6">
      <Link href="/settings" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to Settings
      </Link>

      <PageHeader
        title="Security"
        description="Change your password and manage two-factor authentication"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Security" }]}
      />

      <div className="grid grid-cols-1 gap-6 max-w-2xl">
        {/* ── Change password ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="h-4 w-4" /> Change password
            </CardTitle>
            <CardDescription>Update the password for {`{your account}`}. New password must be at least 12 characters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrent ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="toggle password visibility"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNew ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="toggle password visibility"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {newPw && (
                <p className={`text-xs ${strength.color}`}>
                  Strength: {strength.label}{" "}
                  <span className="text-muted-foreground">(12+ chars, mix of upper/lower/digit/symbol recommended)</span>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm new password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
              />
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs text-destructive">Passwords don't match</p>
              )}
            </div>
            <Button
              onClick={changePassword}
              disabled={pwSaving || !currentPw || !newPw || newPw !== confirmPw || newPw.length < 12}
              size="sm"
            >
              {pwSaving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
              Update password
            </Button>
          </CardContent>
        </Card>

        {/* ── MFA ───────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" /> Two-factor authentication
              </CardTitle>
              <CardDescription>
                Scan the QR code with an authenticator app (Google Authenticator, 1Password, Authy, etc.) and enter a code to enable.
              </CardDescription>
            </div>
            {mfaLoading ? (
              <Badge variant="outline" className="text-muted-foreground">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading
              </Badge>
            ) : mfaEnabled ? (
              <Badge className="bg-ok/15 text-ok border-ok/40/30">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Enabled
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-1" /> Disabled
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ── State: idle + not enabled → Enable button ─────────── */}
            {!mfaEnabled && enrolState === "idle" && (
              <Button onClick={startMfaEnrol} size="sm">
                <Shield className="h-3 w-3 mr-2" /> Enable two-factor
              </Button>
            )}

            {/* ── State: setup → QR + secret + verify form ──────────── */}
            {enrolState !== "idle" && enrolQr && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <img
                    src={enrolQr}
                    alt="MFA QR code"
                    className="rounded-md border border-border/60 bg-white p-2 w-44 h-44"
                  />
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-muted-foreground">
                      Can't scan? Enter this secret manually in your app:
                    </p>
                    <div className="flex gap-2">
                      <Input value={enrolSecret} readOnly className="font-mono text-xs" />
                      <Button variant="outline" size="icon" onClick={copySecret}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="verify-code">Enter the 6-digit code from your app</Label>
                  <Input
                    id="verify-code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    pattern="\d{6}"
                    className="font-mono text-lg tracking-widest"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={verifyMfa}
                    size="sm"
                    disabled={enrolState === "verifying" || verifyCode.length !== 6}
                  >
                    {enrolState === "verifying" && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                    Verify + enable
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEnrolState("idle");
                      setEnrolSecret("");
                      setEnrolQr("");
                      setVerifyCode("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* ── State: enabled → Disable form ─────────────────────── */}
            {mfaEnabled && (
              <div className="space-y-3">
                <p className="text-sm">Two-factor is currently <strong>enabled</strong> on your account.</p>
                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="disable-pw">Enter password to disable</Label>
                  <Input
                    id="disable-pw"
                    type="password"
                    value={disablePw}
                    onChange={(e) => setDisablePw(e.target.value)}
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={disableMfa}
                  disabled={!disablePw}
                >
                  Disable two-factor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
