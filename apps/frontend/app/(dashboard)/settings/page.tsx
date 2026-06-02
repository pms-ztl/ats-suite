"use client";
// app/(dashboard)/settings/page.tsx
// VERBATIM port of claude-design/screen-settings.jsx (SettingsScreen, two-panel
// settings: Account, Members & roles + role/permission matrix, Security, Single
// sign-on, Branding, Email templates, Integrations, API keys, Feature flags, Data
// retention). Example/config data comes from claude-design/set-data.jsx.
//
// Because this route lives inside the (dashboard) shell (app/(dashboard)/
// layout.tsx already renders the sidebar + topbar + theme toggle inside a padded
// <main>), the prototype's own chrome is dropped and we render only the settings
// scene: the left settings nav + the active panel.
//
// METHOD (Aurora .jsx port): kit refs map to our kit, ST.Btn -> Btn, ST.Pill ->
// Pill (from @/components/aurora-kit); Icon, Logo from @/components/aurora-icon.
// The prototype's local Toggle, PanelHead, Card, Field, inp + ST.fStyles.label
// are inlined here. EVERY palette var(--x) is converted to its full-color
// companion var(--c-x); effect/size tokens (--r*, --t, --e1, --fs-*, --ease-*,
// --font-*) stay bare. The Account panel's name/email/role/workspace are filled
// from useCurrentUser() (the prototype hardcoded them); team / permission /
// SSO / email / integration / api-key / feature / retention content stays as the
// prototype's example data because those panels are configuration UIs. The left
// nav items link to the real /settings/* sub-routes; this landing page shows the
// prototype's default panel (Account) and the panel-switch / toggles are React
// useState. The prototype's React shim and window.SettingsScreen export are not
// copied; normal React imports are used.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon, Logo } from "@/components/aurora-icon";
import { useCurrentUser } from "@/hooks/use-current-user";

type CSS = React.CSSProperties;

/* ST.fStyles.label from the prototype's foundations, inlined (--c-* converted). */
const fLabel: CSS = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

/* ---- inlined prototype locals (Toggle / PanelHead / Card / Field / inp) ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return <button onClick={disabled ? undefined : onClick} style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, flexShrink: 0, transition: "background var(--t)" }}>
    <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} /></button>;
}
function PanelHead({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
    <div><h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p></div>
    {action}
  </div>;
}
function Card({ children, pad = 0 }: { children?: React.ReactNode; pad?: number }) { return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>; }
function Field({ label, children }: { label: string; children?: React.ReactNode }) { return <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>{label}</label>{children}</div>; }
const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* ---- example/config data, ported from claude-design/set-data.jsx ---- */
const TEAM = [
  { name: "Avery Chen", ini: "AC", email: "avery@northwind.co", role: "Admin", status: "active", last: "now" },
  { name: "Jordan Lee", ini: "JL", email: "jordan@northwind.co", role: "Hiring Manager", status: "active", last: "2h" },
  { name: "Sam Okafor", ini: "SO", email: "sam@northwind.co", role: "Recruiter", status: "active", last: "1d" },
  { name: "Maya Idris", ini: "MI", email: "maya@northwind.co", role: "Compliance Officer", status: "active", last: "3h" },
  { name: "Grace Park", ini: "GP", email: "grace@northwind.co", role: "Interviewer", status: "active", last: "5d" },
  { name: "Tomas Reyes", ini: "TR", email: "tomas@northwind.co", role: "Recruiter", status: "invited", last: ", " },
];
const ROLE_NAMES = ["Admin", "Recruiter", "Hiring Manager", "Interviewer", "Compliance"];
const PERMISSIONS: { area: string; caps: (boolean | "view")[] }[] = [
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
  { name: "Production", prefix: "cdc_live_8f3a…b21", created: "Mar 2026", last: "2m ago", scopes: "read, write" },
  { name: "Analytics export", prefix: "cdc_live_2k9d…7c4", created: "Apr 2026", last: "1d ago", scopes: "read" },
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
  { d: "Résumé files", period: "24 months", note: "Auto-purged" },
];

/* ---- panels ---- */
function PAccount() {
  // The prototype hardcoded these; fill them from the signed-in user.
  const { user } = useCurrentUser();
  const name = user?.name || "Avery Chen";
  const email = user?.email || "avery@northwind.co";
  const ini = (name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2) || "AC").toUpperCase();
  const roleTitle = user?.role
    ? user.role.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")
    : "Head of Talent";
  return <><PanelHead title="Account" desc="Your personal profile and preferences." action={<Btn variant="primary" icon="check">Save</Btn>} />
    <Card pad={20}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
        <span className="mono" style={{ width: 56, height: 56, borderRadius: "var(--r-lg)", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>{ini}</span>
        <Btn variant="soft" icon="copy">Change photo</Btn>
      </div>
      <div style={{ display: "flex", gap: 14 }}><Field label="Full name"><input defaultValue={name} style={inp} /></Field><Field label="Email"><input defaultValue={email} style={inp} /></Field></div>
      <Field label="Title"><input defaultValue={roleTitle} style={inp} /></Field>
      {user?.tenant?.name && <Field label="Workspace"><input defaultValue={user.tenant.name} style={inp} disabled /></Field>}
    </Card></>;
}
function PTeam() {
  const cap = (c: boolean | "view") => c === true ? <Icon name="check" size={15} stroke={2.5} style={{ color: "var(--c-ok)" }} /> : c === "view" ? <span style={{ fontSize: 10.5, color: "var(--c-ink-3)", fontWeight: 600 }}>view</span> : <Icon name="x" size={14} style={{ color: "var(--c-line-strong)" }} />;
  return <><PanelHead title="Members & roles" desc="Manage your team and what each role can do." action={<Btn variant="primary" icon="plus">Invite member</Btn>} />
    <Card>
      {TEAM.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 110px 70px 36px", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
          <div style={{ display: "flex", gap: 11, alignItems: "center" }}><span className="mono" style={{ width: 32, height: 32, borderRadius: 8, background: m.status === "invited" ? "var(--c-surface-3)" : "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: m.status === "invited" ? "var(--c-ink-3)" : "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{m.ini}</span><div><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{m.email}</div></div></div>
          <select defaultValue={m.role} style={{ ...inp, padding: "6px 8px", cursor: "pointer", width: "auto" }}>{ROLE_NAMES.map(r => <option key={r}>{r}</option>)}<option>Compliance Officer</option></select>
          <Pill tone={m.status === "active" ? "var(--c-ok)" : "var(--c-warn)"} bg={m.status === "active" ? "var(--c-ok-tint)" : "var(--c-warn-tint)"} icon={m.status === "active" ? "check" : "clock"}>{m.status}</Pill>
          <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{m.last}</span>
          <button style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer" }}><Icon name="settings" size={15} /></button>
        </div>
      ))}
    </Card>
    <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Permission matrix</h3>
    <Card>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "11px 18px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
        <span>Capability</span>{ROLE_NAMES.map(r => <span key={r} style={{ textAlign: "center" }}>{r}</span>)}
      </div>
      {PERMISSIONS.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "10px 18px", borderTop: i ? "1px solid var(--c-line)" : "none", alignItems: "center" }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.area}</span>{p.caps.map((c, j) => <span key={j} style={{ display: "grid", placeItems: "center" }}>{cap(c)}</span>)}
        </div>
      ))}
    </Card></>;
}
function PSecurity() {
  const [mfa, setMfa] = useState(true);
  const [sso, setSso] = useState(false);
  const rows: [string, string, React.ReactNode][] = [
    ["Two-factor authentication", "Require a second factor for all members.", <Toggle on={mfa} onClick={() => setMfa(v => !v)} />],
    ["Enforce SSO", "Members must sign in through your identity provider.", <Toggle on={sso} onClick={() => setSso(v => !v)} />],
    ["Session timeout", "Sign members out after inactivity.", <select style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>8 hours</option><option>24 hours</option><option>30 days</option></select>],
    ["Password policy", "Minimum strength for password-based logins.", <select style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>Strong (12+)</option><option>Medium</option></select>],
  ];
  return <><PanelHead title="Security" desc="Authentication, sessions, and access policy for your workspace." />
    <Card pad={0}>
      {rows.map(([t, d, ctrl], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div></div>{ctrl}
        </div>
      ))}
    </Card></>;
}
function PSSO() {
  return <><PanelHead title="Single sign-on" desc="Connect your identity provider for SAML or OIDC sign-in." />
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {SSO_PROVIDERS.map((p, i) => (
        <Card key={i}><div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name={p.icon} size={20} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{p.n}</div><div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{p.detail}</div></div>
          {p.st === "connected" ? <><Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">connected</Pill><Btn variant="soft" size="sm">Configure</Btn></> : <Btn variant="soft" size="sm" icon="plus">Connect</Btn>}
        </div></Card>
      ))}
    </div></>;
}
function PBranding() {
  const [color, setColor] = useState("var(--c-brand)");
  const [name, setName] = useState("Northwind Talent");
  const swatches: [string, string][] = [["var(--c-brand)", "Emerald"], ["var(--c-info)", "Blue"], ["var(--c-ai)", "Violet"], ["var(--c-warn)", "Amber"]];
  return <><PanelHead title="Branding" desc="Customize how your workspace and candidate portal look." action={<Btn variant="primary" icon="check">Save</Btn>} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
      <Card pad={20}>
        <Field label="Company name"><input value={name} onChange={e => setName(e.target.value)} style={inp} /></Field>
        <Field label="Tagline"><input defaultValue="Hire with AI you can trust" style={inp} /></Field>
        <Field label="Logo"><div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 44, height: 44, borderRadius: 11, background: color, display: "grid", placeItems: "center" }}><Logo size={26} /></span><Btn variant="soft" size="sm" icon="copy">Upload logo</Btn></div></Field>
        <Field label="Primary color"><div style={{ display: "flex", gap: 8 }}>{swatches.map(([c, n]) => <button key={n} onClick={() => setColor(c)} title={n} style={{ width: 32, height: 32, borderRadius: 9, background: c, border: color === c ? "2px solid var(--c-ink)" : "2px solid transparent", cursor: "pointer" }} />)}</div></Field>
      </Card>
      <div>
        <div style={{ ...fLabel, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Live preview · candidate portal</div>
        <Card pad={0}>
          <div style={{ padding: "20px 22px", background: "color-mix(in oklab, " + color + " 12%, var(--c-surface))", borderBottom: "1px solid var(--c-line)" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}><span style={{ width: 28, height: 28, borderRadius: 8, background: color, display: "grid", placeItems: "center" }}><Logo size={18} /></span><b style={{ fontSize: 13 }}>{name}</b></div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Senior Backend Engineer</h3>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 4 }}>Payments · Remote · $160k to $200k</div>
          </div>
          <div style={{ padding: 18 }}><button style={{ width: "100%", padding: "10px", borderRadius: "var(--r)", border: "none", background: color, color: "white", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button></div>
        </Card>
      </div>
    </div></>;
}
function PEmail() {
  return <><PanelHead title="Email templates" desc="Customize the emails candidates and members receive." />
    <Card>{EMAIL_TEMPLATES.map((t, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name="fileText" size={16} /></span>
        <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t.n}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Edited {t.edited}</div></div>
        <Toggle on={t.on} onClick={() => {}} /><Btn variant="soft" size="sm" icon="copy">Edit</Btn>
      </div>
    ))}</Card></>;
}
function PIntegrations() {
  return <><PanelHead title="Integrations" desc="Connect ATS to the tools your team already uses." />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {INTEGRATIONS.map((it, i) => (
        <Card key={i}><div style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 17px" }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: it.st === "connected" ? "var(--c-brand-tint)" : "var(--c-surface-2)", color: it.st === "connected" ? "var(--c-brand)" : "var(--c-ink-2)" }}><Icon name={it.icon} size={19} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{it.n}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{it.cat}</div></div>
          {it.st === "connected" ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">on</Pill> : <Btn variant="soft" size="sm">Connect</Btn>}
        </div></Card>
      ))}
    </div></>;
}
function PApiKeys() {
  return <><PanelHead title="API keys" desc="Programmatic access to the ATS platform API." action={<Btn variant="primary" icon="plus">Generate key</Btn>} />
    <Card>{API_KEYS.map((k, i) => (
      <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 90px 70px", gap: 12, alignItems: "center", padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{k.name}<div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 400 }}>{k.scopes}</div></div>
        <code className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-2)", background: "var(--c-surface-2)", padding: "4px 8px", borderRadius: 6 }}>{k.prefix}</code>
        <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>created {k.created}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{k.last}</span>
        <Btn variant="danger" size="sm">Revoke</Btn>
      </div>
    ))}</Card></>;
}
function PFeatures() {
  return <><PanelHead title="Feature flags" desc="Enable features included in your plan, or request upgrades." />
    <Card>{FEATURE_FLAGS.map((f, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>{f.f}{f.locked && <Icon name="shield" size={12} style={{ color: "var(--c-ink-3)" }} />}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Included in {f.plan}</div></div>
        {f.locked ? <Btn variant="outlineAi" size="sm" icon="arrowUpRight">Upgrade</Btn> : <Toggle on={f.on} onClick={() => {}} />}
      </div>
    ))}</Card></>;
}
function PRetention() {
  return <><PanelHead title="Data retention" desc="GDPR-compliant deletion policies. Changes apply going forward." action={<Btn variant="primary" icon="check">Save</Btn>} />
    <Card>{RETENTION.map((r, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name="scroll" size={16} /></span>
        <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{r.d}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{r.note}</div></div>
        <select defaultValue={r.period} style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>{r.period}</option><option>12 months</option><option>24 months</option><option>7 years</option></select>
      </div>
    ))}</Card>
    <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}><Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} />Right-to-be-forgotten requests are honored automatically and logged to the audit trail.</div></>;
}

// Each nav item maps to its panel AND the real /settings/* sub-route it links to.
// Account has no dedicated sub-route (it is this landing page's default panel),
// so it links back to /settings.
type NavItem = { id: string; label: string; icon: string; href: string; Panel: () => JSX.Element };
const SET_NAV: { group: string; items: NavItem[] }[] = [
  { group: "Account", items: [
    { id: "account", label: "Account", icon: "userCog", href: "/settings", Panel: PAccount },
    { id: "team", label: "Members & roles", icon: "users", href: "/settings/team", Panel: PTeam },
    { id: "security", label: "Security", icon: "shield", href: "/settings/security", Panel: PSecurity },
    { id: "sso", label: "Single sign-on", icon: "shield", href: "/settings/sso", Panel: PSSO },
  ] },
  { group: "Workspace", items: [
    { id: "branding", label: "Branding", icon: "swatch", href: "/settings/branding", Panel: PBranding },
    { id: "email", label: "Email templates", icon: "fileText", href: "/settings/email-templates", Panel: PEmail },
  ] },
  { group: "Connections", items: [
    { id: "integrations", label: "Integrations", icon: "plug", href: "/settings/integrations", Panel: PIntegrations },
    { id: "apikeys", label: "API keys", icon: "terminal", href: "/settings/api-keys", Panel: PApiKeys },
  ] },
  { group: "Advanced", items: [
    { id: "features", label: "Feature flags", icon: "bolt", href: "/settings/features", Panel: PFeatures },
    { id: "retention", label: "Data retention", icon: "scroll", href: "/settings/retention", Panel: PRetention },
  ] },
];

export default function SettingsPage() {
  // The prototype's panel-switch is React useState. This landing page defaults to
  // the Account panel (wired to the signed-in user); the other nav items also
  // deep-link to their real /settings/* sub-routes.
  const [sel, setSel] = useState("account");
  const Panel = SET_NAV.flatMap(g => g.items).find(it => it.id === sel)?.Panel ?? PAccount;
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", minHeight: 0 }}>
        <aside style={{ borderRight: "1px solid var(--c-line)", overflowY: "auto", padding: "20px 12px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <h1 style={{ margin: "0 0 16px 8px", fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Settings</h1>
          {SET_NAV.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--c-ink-3)", padding: "0 8px 6px" }}>{g.group}</div>
              {g.items.map(({ id, label, icon, href }) => (
                <a key={id} href={href} onClick={(e) => { if (id === "account") { e.preventDefault(); setSel(id); } }} style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: "var(--r)", border: "none", cursor: "pointer", marginBottom: 1, textAlign: "left",
                  background: sel === id ? "var(--c-brand-tint)" : "transparent", color: sel === id ? "var(--c-brand-ink)" : "var(--c-ink-2)", fontWeight: sel === id ? 700 : 500, fontSize: "var(--fs-sm)" }}
                  onMouseEnter={e => { if (sel !== id) e.currentTarget.style.background = "var(--c-surface-2)"; }} onMouseLeave={e => { if (sel !== id) e.currentTarget.style.background = "transparent"; }}>
                  <Icon name={icon} size={16} style={{ color: sel === id ? "var(--c-brand)" : "var(--c-ink-3)" }} />{label}
                </a>
              ))}
            </div>
          ))}
        </aside>
        <div style={{ overflowY: "auto", padding: "30px 36px 60px" }}><div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }} key={sel}><Panel /></div></div>
      </div>
    </div>
  );
}
