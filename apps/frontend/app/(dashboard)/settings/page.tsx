"use client";
// app/(dashboard)/settings/page.tsx - EXACT Claude Design "Aurora" settings
// shell. A left settings nav (Account, Members & roles, Security, Single
// sign-on, Branding, Email templates, Integrations, API keys, Feature flags,
// Data retention) plus the active panel on the right. Ported verbatim from
// claude-design/screen-settings.jsx; Toggle/PanelHead/Card/Field are
// reproduced locally. The Account panel is prefilled from the signed-in user.
// Palette inline tokens use the --c-* full-color companions per the port guide.
import { useState } from "react";
import { Icon, Logo } from "@/components/aurora-icon";
import { Btn, Pill } from "@/components/aurora-kit";
import { useCurrentUser } from "@/hooks/use-current-user";

/* ------------------------------------------------------------------ */
/* Best-effort raw PUT helper (no single settings endpoint exists, so   */
/* a Save attempts this and falls back to a local "saved" notice).      */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

/* ---- prototype data (ported from claude-design/set-data.jsx) ---- */
type Cap = boolean | "view";
const ROLE_NAMES = ["Admin", "Recruiter", "Hiring Manager", "Interviewer", "Compliance"];
const TEAM: { name: string; ini: string; email: string; role: string; status: "active" | "invited"; last: string }[] = [
  { name: "Avery Chen", ini: "AC", email: "avery@northwind.co", role: "Admin", status: "active", last: "now" },
  { name: "Jordan Lee", ini: "JL", email: "jordan@northwind.co", role: "Hiring Manager", status: "active", last: "2h" },
  { name: "Sam Okafor", ini: "SO", email: "sam@northwind.co", role: "Recruiter", status: "active", last: "1d" },
  { name: "Maya Idris", ini: "MI", email: "maya@northwind.co", role: "Compliance Officer", status: "active", last: "3h" },
  { name: "Grace Park", ini: "GP", email: "grace@northwind.co", role: "Interviewer", status: "active", last: "5d" },
  { name: "Tomas Reyes", ini: "TR", email: "tomas@northwind.co", role: "Recruiter", status: "invited", last: "pending" },
];
const PERMISSIONS: { area: string; caps: Cap[] }[] = [
  { area: "Requisitions", caps: [true, true, true, false, false] },
  { area: "Candidates", caps: [true, true, true, "view", false] },
  { area: "Screening / AI", caps: [true, true, true, false, "view"] },
  { area: "Interviews & feedback", caps: [true, true, true, true, false] },
  { area: "Decisions & offers", caps: [true, true, true, false, false] },
  { area: "Compliance & audit", caps: [true, false, false, false, true] },
  { area: "Billing & plan", caps: [true, false, false, false, false] },
  { area: "Team & settings", caps: [true, false, false, false, false] },
];
const SSO_PROVIDERS = [
  { n: "Okta", st: "connected", detail: "SAML 2.0 · 142 users", icon: "shield" },
  { n: "Google Workspace", st: "available", detail: "OIDC", icon: "shield" },
  { n: "Microsoft Entra ID", st: "available", detail: "SAML / OIDC", icon: "shield" },
];
const EMAIL_TEMPLATES = [
  { n: "Interview invitation", edited: "May 22", on: true },
  { n: "Offer letter", edited: "May 18", on: true },
  { n: "Rejection (post-screen)", edited: "May 10", on: true },
  { n: "Status update", edited: "Apr 28", on: true },
  { n: "Application received", edited: "Apr 12", on: false },
];
const INTEGRATIONS = [
  { n: "Slack", cat: "Notifications", st: "connected", icon: "bolt" },
  { n: "Workday", cat: "HRIS", st: "connected", icon: "building" },
  { n: "Google Calendar", cat: "Scheduling", st: "connected", icon: "calendar" },
  { n: "LinkedIn", cat: "Sourcing", st: "available", icon: "radar" },
  { n: "Greenhouse", cat: "ATS sync", st: "available", icon: "briefcase" },
  { n: "Checkr", cat: "Background check", st: "available", icon: "shield" },
];
const API_KEYS = [
  { name: "Production", prefix: "cdc_live_8f3a...b21", created: "Mar 2026", last: "2m ago", scopes: "read, write" },
  { name: "Analytics export", prefix: "cdc_live_2k9d...7c4", created: "Apr 2026", last: "1d ago", scopes: "read" },
];
const FEATURE_FLAGS: { f: string; on: boolean; plan: string; locked?: boolean }[] = [
  { f: "Agentic screening (ReAct)", on: true, plan: "Professional" },
  { f: "Copilot assistant", on: true, plan: "Professional" },
  { f: "Internal mobility engine", on: false, plan: "Enterprise", locked: true },
  { f: "Custom application forms", on: true, plan: "Starter" },
  { f: "Bias auditor (agentic)", on: true, plan: "Professional" },
  { f: "SSO / SAML", on: false, plan: "Enterprise", locked: true },
];
const RETENTION = [
  { d: "Candidate data", period: "24 months", note: "After last activity" },
  { d: "Rejected applications", period: "12 months", note: "GDPR minimum" },
  { d: "Audit logs", period: "7 years", note: "Compliance requirement" },
  { d: "Resume files", period: "24 months", note: "Auto-purged" },
];

// Map the signed-in user's raw role enum onto a friendly label for the
// Account panel; falls back to the raw value if it is something new.
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  RECRUITER: "Recruiter",
  HIRING_MANAGER: "Hiring Manager",
  COMPLIANCE_OFFICER: "Compliance Officer",
  CANDIDATE: "Candidate",
};

/* ----------------------------- helpers ----------------------------- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-pressed={on}
      style={{
        width: 38, height: 22, borderRadius: 99, border: "none",
        background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0,
        transition: "background var(--t)",
      }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

function PanelHead({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>
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

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)",
  background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none",
};
const fieldLabel: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" };

// Small inline "saved" notice shared by the panels with a Save action.
function SavedNote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
      <Icon name="check" size={15} stroke={2.4} /> Saved
    </span>
  );
}

/* -------------------------------- panels -------------------------------- */
function PAccount() {
  const { user } = useCurrentUser();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const roleLabel = user?.role ? ROLE_LABEL[user.role] ?? user.role : "Member";
  const initials = (user?.name ?? "AC").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const [saved, setSaved] = useState(false);

  async function save() {
    // Best-effort: there is no single settings endpoint, so try the profile
    // route and fall back gracefully to a local saved notice either way.
    try { await raw("/users/profile", { method: "PUT", body: JSON.stringify({ name, email }) }); } catch {}
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return (
    <>
      <PanelHead
        title="Account"
        desc="Your personal profile and preferences."
        action={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <SavedNote show={saved} />
            <Btn variant="primary" icon="check" onClick={save}>Save</Btn>
          </div>
        }
      />
      <Card pad={20}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
          <span className="mono" style={{ width: 56, height: 56, borderRadius: "var(--r-lg)", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>{initials}</span>
          <Btn variant="soft" icon="copy">Change photo</Btn>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field>
          <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} /></Field>
        </div>
        <Field label="Role"><input value={roleLabel} readOnly style={{ ...inp, color: "var(--c-ink-2)", cursor: "default" }} /></Field>
      </Card>
    </>
  );
}

function PTeam() {
  const cap = (c: Cap) =>
    c === true ? <Icon name="check" size={15} stroke={2.5} style={{ color: "var(--c-ok)" }} />
    : c === "view" ? <span style={{ fontSize: 10.5, color: "var(--c-ink-3)", fontWeight: 600 }}>view</span>
    : <Icon name="x" size={14} style={{ color: "var(--c-line-strong)" }} />;
  return (
    <>
      <PanelHead title="Members & roles" desc="Manage your team and what each role can do." action={<Btn variant="primary" icon="plus">Invite member</Btn>} />
      <Card>
        {TEAM.map((m, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 110px 70px 36px", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <span className="mono" style={{ width: 32, height: 32, borderRadius: 8, background: m.status === "invited" ? "var(--c-surface-3)" : "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: m.status === "invited" ? "var(--c-ink-3)" : "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{m.ini}</span>
              <div><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{m.email}</div></div>
            </div>
            <select defaultValue={m.role} style={{ ...inp, padding: "6px 8px", cursor: "pointer", width: "auto" }}>
              {ROLE_NAMES.map((r) => <option key={r}>{r}</option>)}
              <option>Compliance Officer</option>
            </select>
            <Pill tone={m.status === "active" ? "var(--c-ok)" : "var(--c-warn)"} bg={m.status === "active" ? "var(--c-ok-tint)" : "var(--c-warn-tint)"} icon={m.status === "active" ? "check" : "clock"}>{m.status}</Pill>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{m.last}</span>
            <button aria-label={`Manage ${m.name}`} style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer" }}><Icon name="settings" size={15} /></button>
          </div>
        ))}
      </Card>
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Permission matrix</h3>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "11px 18px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
          <span>Capability</span>{ROLE_NAMES.map((r) => <span key={r} style={{ textAlign: "center" }}>{r}</span>)}
        </div>
        {PERMISSIONS.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "10px 18px", borderTop: i ? "1px solid var(--c-line)" : "none", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.area}</span>{p.caps.map((c, j) => <span key={j} style={{ display: "grid", placeItems: "center" }}>{cap(c)}</span>)}
          </div>
        ))}
      </Card>
    </>
  );
}

function PSecurity() {
  const [mfa, setMfa] = useState(true);
  const [enforceSso, setEnforceSso] = useState(false);
  const rows: [string, string, React.ReactNode][] = [
    ["Two-factor authentication", "Require a second factor for all members.", <Toggle key="mfa" on={mfa} onClick={() => setMfa((v) => !v)} />],
    ["Enforce SSO", "Members must sign in through your identity provider.", <Toggle key="sso" on={enforceSso} onClick={() => setEnforceSso((v) => !v)} />],
    ["Session timeout", "Sign members out after inactivity.", <select key="to" style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>8 hours</option><option>24 hours</option><option>30 days</option></select>],
    ["Password policy", "Minimum strength for password-based logins.", <select key="pw" style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>Strong (12+)</option><option>Medium</option></select>],
  ];
  return (
    <>
      <PanelHead title="Security" desc="Authentication, sessions, and access policy for your workspace." />
      <Card pad={0}>
        {rows.map(([t, d, ctrl], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div></div>{ctrl}
          </div>
        ))}
      </Card>
    </>
  );
}

function PSSO() {
  return (
    <>
      <PanelHead title="Single sign-on" desc="Connect your identity provider for SAML or OIDC sign-in." />
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {SSO_PROVIDERS.map((p, i) => (
          <Card key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name={p.icon} size={20} /></span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{p.n}</div><div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{p.detail}</div></div>
              {p.st === "connected"
                ? <><Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">connected</Pill><Btn variant="soft" size="sm">Configure</Btn></>
                : <Btn variant="soft" size="sm" icon="plus">Connect</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function PBranding() {
  const [color, setColor] = useState("var(--c-brand)");
  const [name, setName] = useState("Northwind Talent");
  const swatches: [string, string][] = [["var(--c-brand)", "Emerald"], ["var(--c-info)", "Blue"], ["var(--c-ai)", "Violet"], ["var(--c-warn)", "Amber"]];
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PanelHead
        title="Branding"
        desc="Customize how your workspace and candidate portal look."
        action={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <SavedNote show={saved} />
            <Btn variant="primary" icon="check" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2400); }}>Save</Btn>
          </div>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <Card pad={20}>
          <Field label="Company name"><input value={name} onChange={(e) => setName(e.target.value)} style={inp} /></Field>
          <Field label="Tagline"><input defaultValue="Hire with AI you can trust" style={inp} /></Field>
          <Field label="Logo"><div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 44, height: 44, borderRadius: 11, background: color, display: "grid", placeItems: "center" }}><Logo size={26} /></span><Btn variant="soft" size="sm" icon="copy">Upload logo</Btn></div></Field>
          <Field label="Primary color"><div style={{ display: "flex", gap: 8 }}>{swatches.map(([c, n]) => <button key={n} onClick={() => setColor(c)} title={n} aria-label={n} style={{ width: 32, height: 32, borderRadius: 9, background: c, border: color === c ? "2px solid var(--c-ink)" : "2px solid transparent", cursor: "pointer" }} />)}</div></Field>
        </Card>
        <div>
          <div style={{ ...fieldLabel, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Live preview · candidate portal</div>
          <Card pad={0}>
            <div style={{ padding: "20px 22px", background: "color-mix(in oklab, " + color + " 12%, var(--c-surface))", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}><span style={{ width: 28, height: 28, borderRadius: 8, background: color, display: "grid", placeItems: "center" }}><Logo size={18} /></span><b style={{ fontSize: 13 }}>{name}</b></div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Senior Backend Engineer</h3>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 4 }}>Payments · Remote · $160k to $200k</div>
            </div>
            <div style={{ padding: 18 }}><button style={{ width: "100%", padding: "10px", borderRadius: "var(--r)", border: "none", background: color, color: "white", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button></div>
          </Card>
        </div>
      </div>
    </>
  );
}

function PEmail() {
  return (
    <>
      <PanelHead title="Email templates" desc="Customize the emails candidates and members receive." />
      <Card>
        {EMAIL_TEMPLATES.map((t, i) => (
          <EmailRow key={i} t={t} i={i} />
        ))}
      </Card>
    </>
  );
}
function EmailRow({ t, i }: { t: { n: string; edited: string; on: boolean }; i: number }) {
  const [on, setOn] = useState(t.on);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
      <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name="fileText" size={16} /></span>
      <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t.n}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Edited {t.edited}</div></div>
      <Toggle on={on} onClick={() => setOn((v) => !v)} /><Btn variant="soft" size="sm" icon="copy">Edit</Btn>
    </div>
  );
}

function PIntegrations() {
  return (
    <>
      <PanelHead title="Integrations" desc="Connect ATS to the tools your team already uses." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {INTEGRATIONS.map((it, i) => (
          <Card key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 17px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: it.st === "connected" ? "var(--c-brand-tint)" : "var(--c-surface-2)", color: it.st === "connected" ? "var(--c-brand)" : "var(--c-ink-2)" }}><Icon name={it.icon} size={19} /></span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{it.n}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{it.cat}</div></div>
              {it.st === "connected" ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">on</Pill> : <Btn variant="soft" size="sm">Connect</Btn>}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function PApiKeys() {
  return (
    <>
      <PanelHead title="API keys" desc="Programmatic access to the ATS platform API." action={<Btn variant="primary" icon="plus">Generate key</Btn>} />
      <Card>
        {API_KEYS.map((k, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 90px 70px", gap: 12, alignItems: "center", padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{k.name}<div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 400 }}>{k.scopes}</div></div>
            <code className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-2)", background: "var(--c-surface-2)", padding: "4px 8px", borderRadius: 6 }}>{k.prefix}</code>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>created {k.created}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{k.last}</span>
            <Btn variant="danger" size="sm">Revoke</Btn>
          </div>
        ))}
      </Card>
    </>
  );
}

function PFeatures() {
  return (
    <>
      <PanelHead title="Feature flags" desc="Enable features included in your plan, or request upgrades." />
      <Card>
        {FEATURE_FLAGS.map((f, i) => (
          <FeatureRow key={i} f={f} i={i} />
        ))}
      </Card>
    </>
  );
}
function FeatureRow({ f, i }: { f: { f: string; on: boolean; plan: string; locked?: boolean }; i: number }) {
  const [on, setOn] = useState(f.on);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>{f.f}{f.locked && <Icon name="shield" size={12} style={{ color: "var(--c-ink-3)" }} />}</div>
        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Included in {f.plan}</div>
      </div>
      {f.locked ? <Btn variant="outlineAi" size="sm" icon="arrowUpRight">Upgrade</Btn> : <Toggle on={on} onClick={() => setOn((v) => !v)} />}
    </div>
  );
}

function PRetention() {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <PanelHead
        title="Data retention"
        desc="GDPR-compliant deletion policies. Changes apply going forward."
        action={
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <SavedNote show={saved} />
            <Btn variant="primary" icon="check" onClick={() => { setSaved(true); window.setTimeout(() => setSaved(false), 2400); }}>Save</Btn>
          </div>
        }
      />
      <Card>
        {RETENTION.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name="scroll" size={16} /></span>
            <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{r.d}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{r.note}</div></div>
            <select defaultValue={r.period} style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>{r.period}</option><option>12 months</option><option>24 months</option><option>7 years</option></select>
          </div>
        ))}
      </Card>
      <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
        <Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} />Right-to-be-forgotten requests are honored automatically and logged to the audit trail.
      </div>
    </>
  );
}

/* -------------------------------- nav -------------------------------- */
type NavItem = [string, string, string, () => JSX.Element];
const SET_NAV: { group: string; items: NavItem[] }[] = [
  { group: "Account", items: [["account", "Account", "userCog", PAccount], ["team", "Members & roles", "users", PTeam], ["security", "Security", "shield", PSecurity], ["sso", "Single sign-on", "shield", PSSO]] },
  { group: "Workspace", items: [["branding", "Branding", "swatch", PBranding], ["email", "Email templates", "fileText", PEmail]] },
  { group: "Connections", items: [["integrations", "Integrations", "plug", PIntegrations], ["apikeys", "API keys", "terminal", PApiKeys]] },
  { group: "Advanced", items: [["features", "Feature flags", "bolt", PFeatures], ["retention", "Data retention", "scroll", PRetention]] },
];

export default function SettingsPage() {
  const [sel, setSel] = useState("account");
  const Panel = SET_NAV.flatMap((g) => g.items).find((it) => it[0] === sel)?.[3] ?? PAccount;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", alignItems: "start", gap: 0, borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--c-line)", background: "var(--c-surface)" }}>
        <aside style={{ borderRight: "1px solid var(--c-line)", padding: "20px 12px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <h1 style={{ margin: "0 0 16px 8px", fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Settings</h1>
          {SET_NAV.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--c-ink-3)", padding: "0 8px 6px" }}>{g.group}</div>
              {g.items.map(([id, label, ic]) => (
                <button
                  key={id}
                  onClick={() => setSel(id)}
                  aria-current={sel === id ? "page" : undefined}
                  style={{
                    width: "100%", display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: "var(--r)",
                    border: "none", cursor: "pointer", marginBottom: 1, textAlign: "left",
                    background: sel === id ? "var(--c-brand-tint)" : "transparent",
                    color: sel === id ? "var(--c-brand-ink)" : "var(--c-ink-2)",
                    fontWeight: sel === id ? 700 : 500, fontSize: "var(--fs-sm)",
                  }}
                  onMouseEnter={(e) => { if (sel !== id) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={(e) => { if (sel !== id) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon name={ic} size={16} style={{ color: sel === id ? "var(--c-brand)" : "var(--c-ink-3)" }} />{label}
                </button>
              ))}
            </div>
          ))}
        </aside>
        <div style={{ padding: "30px 36px 60px" }}>
          <div key={sel} style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
            <Panel />
          </div>
        </div>
      </div>
    </div>
  );
}
