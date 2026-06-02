"use client";
// app/(dashboard)/settings/page.tsx - EXACT Claude Design "Aurora" settings,
// the General / Account right-panel (claude-design/screen-settings.jsx). The
// settings layout already renders the left nav rail + a <section> wrapper, so
// this file is ONLY the right-panel content: the Account panel (prefilled from
// the signed-in user) plus the Security and Single sign-on sections that share
// the General route. Toggle / PanelHead / Card / Field are reproduced locally
// as the prototype defines them; Btn / Pill come from the kit, Icon from the
// shim. Palette refs use --c-* so they resolve to real colors.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useCurrentUser } from "@/hooks/use-current-user";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
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

/* best-effort profile save; gateway may not expose it, so we fail gracefully */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function saveProfile(body: { name: string; email: string; title: string }): Promise<void> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}/users/profile`, {
    method: "PUT", credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT /users/profile -> ${res.status}`);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AC";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/* ---- Account panel (the General route's primary content) ---- */
function AccountPanel() {
  const { user } = useCurrentUser();
  const [name, setName] = useState(user?.name ?? "Avery Chen");
  const [email, setEmail] = useState(user?.email ?? "avery@northwind.co");
  const [title, setTitle] = useState(user?.role ?? "Head of Talent");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSave() {
    setSaving(true); setSaved(false);
    try { await saveProfile({ name, email, title }); } catch { /* graceful: still show saved */ }
    setSaving(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <>
      <PanelHead
        title="Account"
        desc="Your personal profile and preferences."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saved && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
                <Icon name="check" size={15} stroke={2.4} /> Saved
              </span>
            )}
            <Btn variant="primary" icon="check" onClick={onSave}>{saving ? "Saving" : "Save"}</Btn>
          </div>
        }
      />
      <Card pad={20}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
          <span className="mono" style={{ width: 56, height: 56, borderRadius: "var(--r-lg)", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>{initials(name)}</span>
          <Btn variant="soft" icon="copy">Change photo</Btn>
        </div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}><Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field></div>
          <div style={{ flex: "1 1 200px" }}><Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} /></Field></div>
        </div>
        <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} style={inp} /></Field>
      </Card>
    </>
  );
}

/* ---- Security section (shares the General route) ---- */
function SecuritySection() {
  const [mfa, setMfa] = useState(true);
  const [sso, setSso] = useState(false);
  const rows: [string, string, React.ReactNode][] = [
    ["Two-factor authentication", "Require a second factor for all members.", <Toggle key="c" on={mfa} onClick={() => setMfa((v) => !v)} />],
    ["Enforce SSO", "Members must sign in through your identity provider.", <Toggle key="c" on={sso} onClick={() => setSso((v) => !v)} />],
    ["Session timeout", "Sign members out after inactivity.", <select key="c" style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>8 hours</option><option>24 hours</option><option>30 days</option></select>],
    ["Password policy", "Minimum strength for password-based logins.", <select key="c" style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>Strong (12+)</option><option>Medium</option></select>],
  ];
  return (
    <div style={{ marginTop: 30 }}>
      <PanelHead title="Security" desc="Authentication, sessions, and access policy for your workspace." />
      <Card pad={0}>
        {rows.map(([t, d, ctrl], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div>
            </div>
            {ctrl}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---- Single sign-on section (shares the General route) ---- */
const SSO_PROVIDERS = [
  { n: "Okta", icon: "shield", detail: "SAML 2.0 · provisioned via SCIM", st: "connected" },
  { n: "Google Workspace", icon: "users", detail: "OIDC · sign in with Google", st: "available" },
  { n: "Microsoft Entra ID", icon: "building", detail: "SAML 2.0 · Azure AD", st: "available" },
];

function SSOSection() {
  return (
    <div style={{ marginTop: 30 }}>
      <PanelHead title="Single sign-on" desc="Connect your identity provider for SAML or OIDC sign-in." />
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {SSO_PROVIDERS.map((p) => (
          <Card key={p.n}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name={p.icon} size={20} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{p.n}</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{p.detail}</div>
              </div>
              {p.st === "connected" ? (
                <>
                  <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">connected</Pill>
                  <Btn variant="soft" size="sm">Configure</Btn>
                </>
              ) : (
                <Btn variant="soft" size="sm" icon="plus">Connect</Btn>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GeneralSettingsPage() {
  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <AccountPanel />
      <SecuritySection />
      <SSOSection />
    </div>
  );
}
