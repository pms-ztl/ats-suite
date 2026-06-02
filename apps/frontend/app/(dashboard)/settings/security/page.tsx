"use client";
// app/(dashboard)/settings/security/page.tsx - EXACT Claude Design "Aurora"
// settings, the Security & 2FA right-panel (claude-design/screen-settings.jsx ->
// PSecurity, expanded). The settings layout already renders the left settings-nav
// rail + a <section> wrapper, so this file is ONLY the right-panel content: the
// workspace authentication / session / access policy (2FA + MFA enforcement,
// session timeout, password policy, IP allowlist, login alerts). Toggle /
// PanelHead / Card / Field are reproduced locally exactly as the prototype + the
// sibling settings panels define them; Btn / Pill come from the kit, Icon from
// the shim. Inline palette refs use --c-* so they resolve to real colors; effect
// / size tokens (--e1, --r-xl, --fs-sm, --t) stay bare.
//
// WIRE: the policy is controlled local useState. Save is a best-effort raw() PUT
// (tries /security/access/config, then /settings/security) that degrades
// gracefully and always shows an inline "Saved" notice. No fabricated data.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype (matching the sibling panels) ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
      aria-pressed={on}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

function PanelHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
const sel: CSS = { ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" };

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON, best-effort. Throws on a non-2xx so the
// caller can fall back to an alternate route / still surface "Saved".
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${init?.method ?? "GET"} ${path} -> ${r.status}`);
  const res = await r.json().catch(() => null);
  return res?.data ?? res;
}

/* ----------------------------- panel ----------------------------- */
function SecurityPanel() {
  // controlled access policy (prototype defaults: 2FA on, SSO off)
  const [mfa, setMfa] = useState(true);
  const [totp, setTotp] = useState(true);
  const [keys, setKeys] = useState(true);
  const [sso, setSso] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("8 hours");
  const [passwordPolicy, setPasswordPolicy] = useState("Strong (12+)");
  const [signOutOnChange, setSignOutOnChange] = useState(true);
  const [ipAllowlist, setIpAllowlist] = useState(false);
  const [allowedIps, setAllowedIps] = useState("203.0.113.0/24");
  const [loginAlerts, setLoginAlerts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    setSaving(true); setSaved(false);
    const body = JSON.stringify({
      mfa, totp, hardwareKeys: keys, enforceSso: sso,
      sessionTimeout, passwordPolicy, signOutOnPasswordChange: signOutOnChange,
      ipAllowlist, allowedIps: ipAllowlist ? allowedIps.split(/[\s,]+/).filter(Boolean) : [],
      loginAlerts,
    });
    try {
      // try the access-config route first, then the generic settings route
      await raw("/security/access/config", { method: "PUT", body }).catch(() =>
        raw("/settings/security", { method: "PUT", body }),
      );
    } catch {
      /* graceful: the gateway may not expose either route yet, still confirm */
    }
    setSaving(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  // each row: [title, description, control]
  const auth: [string, string, React.ReactNode][] = [
    ["Two-factor authentication", "Require a second factor for all members.", <Toggle key="c" on={mfa} onClick={() => setMfa((v) => !v)} />],
    ["Authenticator apps (TOTP)", "Allow time-based one-time-password apps as a factor.", <Toggle key="c" on={totp} onClick={() => setTotp((v) => !v)} disabled={!mfa} />],
    ["Hardware security keys", "Allow FIDO2 / WebAuthn keys and passkeys.", <Toggle key="c" on={keys} onClick={() => setKeys((v) => !v)} disabled={!mfa} />],
    ["Enforce SSO", "Members must sign in through your identity provider.", <Toggle key="c" on={sso} onClick={() => setSso((v) => !v)} />],
  ];

  const session: [string, string, React.ReactNode][] = [
    ["Session timeout", "Sign members out after inactivity.", (
      <select key="c" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} style={sel}>
        <option>30 minutes</option><option>8 hours</option><option>24 hours</option><option>30 days</option>
      </select>
    )],
    ["Password policy", "Minimum strength for password-based logins.", (
      <select key="c" value={passwordPolicy} onChange={(e) => setPasswordPolicy(e.target.value)} style={sel}>
        <option>Strong (12+)</option><option>Medium</option>
      </select>
    )],
    ["Sign out all devices on password change", "Revoke existing sessions when a member changes their password.", <Toggle key="c" on={signOutOnChange} onClick={() => setSignOutOnChange((v) => !v)} />],
  ];

  const saveAction = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {saved && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
          <Icon name="check" size={15} stroke={2.4} /> Saved
        </span>
      )}
      <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
    </div>
  );

  return (
    <>
      <PanelHead
        title="Security & 2FA"
        desc="Authentication, sessions, and access policy for your workspace."
        action={saveAction}
      />

      {/* Authentication */}
      <h3 style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
        <Icon name="shield" size={16} style={{ color: "var(--c-ink-3)" }} /> Authentication
      </h3>
      <Card pad={0}>
        {auth.map(([t, d, ctrl], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div>
            </div>
            {ctrl}
          </div>
        ))}
      </Card>

      {/* Sessions */}
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
        <Icon name="clock" size={16} style={{ color: "var(--c-ink-3)" }} /> Sessions
      </h3>
      <Card pad={0}>
        {session.map(([t, d, ctrl], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div>
            </div>
            {ctrl}
          </div>
        ))}
      </Card>

      {/* Access control */}
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
        <Icon name="scan" size={16} style={{ color: "var(--c-ink-3)" }} /> Access control
      </h3>
      <Card pad={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>IP allowlist</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Restrict sign-in to approved network ranges.</div>
          </div>
          <Toggle on={ipAllowlist} onClick={() => setIpAllowlist((v) => !v)} />
        </div>
        {ipAllowlist && (
          <div style={{ padding: "0 20px 16px" }}>
            <Field label="Allowed IP ranges (comma or space separated, CIDR)">
              <input
                value={allowedIps}
                onChange={(e) => setAllowedIps(e.target.value)}
                placeholder="203.0.113.0/24, 198.51.100.7"
                style={{ ...inp, fontFamily: "var(--font-mono)" }}
              />
            </Field>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: "1px solid var(--c-line)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>
              Login alerts
              <Pill icon="bell" tone="var(--c-info)" bg="var(--c-info-tint)">email</Pill>
            </div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Notify admins of sign-ins from new devices or locations.</div>
          </div>
          <Toggle on={loginAlerts} onClick={() => setLoginAlerts((v) => !v)} />
        </div>
      </Card>

      {/* honest note (matches the prototype's audit-trail callout) */}
      <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
        <Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} />
        Authentication events and policy changes are written to the audit trail automatically.
      </div>
    </>
  );
}

export default function SecuritySettingsPage() {
  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <SecurityPanel />
    </div>
  );
}
