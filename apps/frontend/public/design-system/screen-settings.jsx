/* screen-settings.jsx, Settings (two-panel) */
const { useState: uSset } = React;
const ST = window.UI;

function Toggle({ on, onClick, disabled }) {
  return <button onClick={disabled ? null : onClick} style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--brand)" : "var(--line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, flexShrink: 0, transition: "background var(--t)" }}>
    <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} /></button>;
}
function PanelHead({ title, desc, action }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
    <div><h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2><p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p></div>
    {action}
  </div>;
}
function Card({ children, pad = 0 }) { return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>; }
function Field({ label, children }) { return <div style={{ marginBottom: 16 }}><label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 6 }}>{label}</label>{children}</div>; }
const inp = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* ---- panels ---- */
function PAccount() {
  return <><PanelHead title="Account" desc="Your personal profile and preferences." action={<ST.Btn variant="primary" icon="check">Save</ST.Btn>} />
    <Card pad={20}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
        <span className="mono" style={{ width: 56, height: 56, borderRadius: "var(--r-lg)", background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 18 }}>AC</span>
        <ST.Btn variant="soft" icon="copy">Change photo</ST.Btn>
      </div>
      <div style={{ display: "flex", gap: 14 }}><Field label="Full name"><input defaultValue="Avery Chen" style={inp} /></Field><Field label="Email"><input defaultValue="avery@northwind.co" style={inp} /></Field></div>
      <Field label="Title"><input defaultValue="Head of Talent" style={inp} /></Field>
    </Card></>;
}
function PTeam() {
  const cap = (c) => c === true ? <Icon name="check" size={15} stroke={2.5} style={{ color: "var(--ok)" }} /> : c === "view" ? <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600 }}>view</span> : <Icon name="x" size={14} style={{ color: "var(--line-strong)" }} />;
  return <><PanelHead title="Members & roles" desc="Manage your team and what each role can do." action={<ST.Btn variant="primary" icon="plus">Invite member</ST.Btn>} />
    <Card>
      {window.TEAM.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 110px 70px 36px", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--line)" : "none" }}>
          <div style={{ display: "flex", gap: 11, alignItems: "center" }}><span className="mono" style={{ width: 32, height: 32, borderRadius: 8, background: m.status === "invited" ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand), var(--ai))", color: m.status === "invited" ? "var(--ink-3)" : "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{m.ini}</span><div><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{m.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.email}</div></div></div>
          <select defaultValue={m.role} style={{ ...inp, padding: "6px 8px", cursor: "pointer", width: "auto" }}>{window.ROLE_NAMES.map(r => <option key={r}>{r}</option>)}<option>Compliance Officer</option></select>
          <ST.Pill tone={m.status === "active" ? "var(--ok)" : "var(--warn)"} bg={m.status === "active" ? "var(--ok-tint)" : "var(--warn-tint)"} icon={m.status === "active" ? "check" : "clock"}>{m.status}</ST.Pill>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.last}</span>
          <button style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--ink-3)", cursor: "pointer" }}><Icon name="settings" size={15} /></button>
        </div>
      ))}
    </Card>
    <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Permission matrix</h3>
    <Card>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "11px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-3)" }}>
        <span>Capability</span>{window.ROLE_NAMES.map(r => <span key={r} style={{ textAlign: "center" }}>{r}</span>)}
      </div>
      {window.PERMISSIONS.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(5, 1fr)", gap: 0, padding: "10px 18px", borderTop: i ? "1px solid var(--line)" : "none", alignItems: "center" }}>
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.area}</span>{p.caps.map((c, j) => <span key={j} style={{ display: "grid", placeItems: "center" }}>{cap(c)}</span>)}
        </div>
      ))}
    </Card></>;
}
function PSecurity() {
  const [mfa, setMfa] = uSset(true);
  return <><PanelHead title="Security" desc="Authentication, sessions, and access policy for your workspace." />
    <Card pad={0}>
      {[["Two-factor authentication", "Require a second factor for all members.", <Toggle on={mfa} onClick={() => setMfa(v => !v)} />],
        ["Enforce SSO", "Members must sign in through your identity provider.", <Toggle on={false} onClick={() => {}} />],
        ["Session timeout", "Sign members out after inactivity.", <select style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>8 hours</option><option>24 hours</option><option>30 days</option></select>],
        ["Password policy", "Minimum strength for password-based logins.", <select style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>Strong (12+)</option><option>Medium</option></select>]
      ].map(([t, d, ctrl], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div><div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{d}</div></div>{ctrl}
        </div>
      ))}
    </Card></>;
}
function PSSO() {
  return <><PanelHead title="Single sign-on" desc="Connect your identity provider for SAML or OIDC sign-in." />
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {window.SSO_PROVIDERS.map((p, i) => (
        <Card key={i}><div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
          <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--ink-2)" }}><Icon name={p.icon} size={20} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{p.n}</div><div style={{ fontSize: 12, color: "var(--ink-3)" }}>{p.detail}</div></div>
          {p.st === "connected" ? <><ST.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">connected</ST.Pill><ST.Btn variant="soft" size="sm">Configure</ST.Btn></> : <ST.Btn variant="soft" size="sm" icon="plus">Connect</ST.Btn>}
        </div></Card>
      ))}
    </div></>;
}
function PBranding() {
  const [color, setColor] = uSset("var(--brand)");
  const [name, setName] = uSset("Northwind Talent");
  const swatches = [["var(--brand)", "Emerald"], ["var(--info)", "Blue"], ["var(--ai)", "Violet"], ["var(--warn)", "Amber"]];
  return <><PanelHead title="Branding" desc="Customize how your workspace and candidate portal look." action={<ST.Btn variant="primary" icon="check">Save</ST.Btn>} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
      <Card pad={20}>
        <Field label="Company name"><input value={name} onChange={e => setName(e.target.value)} style={inp} /></Field>
        <Field label="Tagline"><input defaultValue="Hire with AI you can trust" style={inp} /></Field>
        <Field label="Logo"><div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 44, height: 44, borderRadius: 11, background: color, display: "grid", placeItems: "center" }}><Logo size={26} /></span><ST.Btn variant="soft" size="sm" icon="copy">Upload logo</ST.Btn></div></Field>
        <Field label="Primary color"><div style={{ display: "flex", gap: 8 }}>{swatches.map(([c, n]) => <button key={n} onClick={() => setColor(c)} title={n} style={{ width: 32, height: 32, borderRadius: 9, background: c, border: color === c ? "2px solid var(--ink)" : "2px solid transparent", cursor: "pointer" }} />)}</div></Field>
      </Card>
      <div>
        <div style={{ ...ST.fStyles.label, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Live preview · candidate portal</div>
        <Card pad={0}>
          <div style={{ padding: "20px 22px", background: "color-mix(in oklab, " + color + " 12%, var(--surface))", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 12 }}><span style={{ width: 28, height: 28, borderRadius: 8, background: color, display: "grid", placeItems: "center" }}><Logo size={18} /></span><b style={{ fontSize: 13 }}>{name}</b></div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Senior Backend Engineer</h3>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>Payments · Remote · $160k to $200k</div>
          </div>
          <div style={{ padding: 18 }}><button style={{ width: "100%", padding: "10px", borderRadius: "var(--r)", border: "none", background: color, color: "white", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button></div>
        </Card>
      </div>
    </div></>;
}
function PEmail() {
  return <><PanelHead title="Email templates" desc="Customize the emails candidates and members receive." />
    <Card>{window.EMAIL_TEMPLATES.map((t, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--ink-2)" }}><Icon name="fileText" size={16} /></span>
        <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t.n}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Edited {t.edited}</div></div>
        <Toggle on={t.on} onClick={() => {}} /><ST.Btn variant="soft" size="sm" icon="copy">Edit</ST.Btn>
      </div>
    ))}</Card></>;
}
function PIntegrations() {
  return <><PanelHead title="Integrations" desc="Connect ATS to the tools your team already uses." />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
      {window.INTEGRATIONS.map((it, i) => (
        <Card key={i}><div style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 17px" }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", background: it.st === "connected" ? "var(--brand-tint)" : "var(--surface-2)", color: it.st === "connected" ? "var(--brand)" : "var(--ink-2)" }}><Icon name={it.icon} size={19} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{it.n}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{it.cat}</div></div>
          {it.st === "connected" ? <ST.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">on</ST.Pill> : <ST.Btn variant="soft" size="sm">Connect</ST.Btn>}
        </div></Card>
      ))}
    </div></>;
}
function PApiKeys() {
  return <><PanelHead title="API keys" desc="Programmatic access to the ATS platform API." action={<ST.Btn variant="primary" icon="plus">Generate key</ST.Btn>} />
    <Card>{window.API_KEYS.map((k, i) => (
      <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 90px 70px", gap: 12, alignItems: "center", padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{k.name}<div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 400 }}>{k.scopes}</div></div>
        <code className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)", background: "var(--surface-2)", padding: "4px 8px", borderRadius: 6 }}>{k.prefix}</code>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>created {k.created}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{k.last}</span>
        <ST.Btn variant="danger" size="sm">Revoke</ST.Btn>
      </div>
    ))}</Card></>;
}
function PFeatures() {
  return <><PanelHead title="Feature flags" desc="Enable features included in your plan, or request upgrades." />
    <Card>{window.FEATURE_FLAGS.map((f, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
        <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>{f.f}{f.locked && <Icon name="shield" size={12} style={{ color: "var(--ink-3)" }} />}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Included in {f.plan}</div></div>
        {f.locked ? <ST.Btn variant="outlineAi" size="sm" icon="arrowUpRight">Upgrade</ST.Btn> : <Toggle on={f.on} onClick={() => {}} />}
      </div>
    ))}</Card></>;
}
function PRetention() {
  return <><PanelHead title="Data retention" desc="GDPR-compliant deletion policies. Changes apply going forward." action={<ST.Btn variant="primary" icon="check">Save</ST.Btn>} />
    <Card>{window.RETENTION.map((r, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
        <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--ink-2)" }}><Icon name="scroll" size={16} /></span>
        <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{r.d}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{r.note}</div></div>
        <select defaultValue={r.period} style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}><option>{r.period}</option><option>12 months</option><option>24 months</option><option>7 years</option></select>
      </div>
    ))}</Card>
    <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)", fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 9, alignItems: "center" }}><Icon name="shield" size={15} style={{ color: "var(--ai)" }} />Right-to-be-forgotten requests are honored automatically and logged to the audit trail.</div></>;
}

const SET_NAV = [
  { group: "Account", items: [["account", "Account", "userCog", PAccount], ["team", "Members & roles", "users", PTeam], ["security", "Security", "shield", PSecurity], ["sso", "Single sign-on", "shield", PSSO]] },
  { group: "Workspace", items: [["branding", "Branding", "swatch", PBranding], ["email", "Email templates", "fileText", PEmail]] },
  { group: "Connections", items: [["integrations", "Integrations", "plug", PIntegrations], ["apikeys", "API keys", "terminal", PApiKeys]] },
  { group: "Advanced", items: [["features", "Feature flags", "bolt", PFeatures], ["retention", "Data retention", "scroll", PRetention]] },
];

function SettingsScreen({ initial }) {
  const [sel, setSel] = uSset(initial || "team");
  const Panel = SET_NAV.flatMap(g => g.items).find(it => it[0] === sel)[3];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "232px 1fr", height: "100%", minHeight: 0 }}>
      <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto", padding: "20px 12px", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
        <h1 style={{ margin: "0 0 16px 8px", fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Settings</h1>
        {SET_NAV.map((g, gi) => (
          <div key={gi} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--ink-3)", padding: "0 8px 6px" }}>{g.group}</div>
            {g.items.map(([id, label, ic]) => (
              <button key={id} onClick={() => setSel(id)} style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: "var(--r)", border: "none", cursor: "pointer", marginBottom: 1, textAlign: "left",
                background: sel === id ? "var(--brand-tint)" : "transparent", color: sel === id ? "var(--brand-ink)" : "var(--ink-2)", fontWeight: sel === id ? 700 : 500, fontSize: "var(--fs-sm)" }}
                onMouseEnter={e => { if (sel !== id) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={e => { if (sel !== id) e.currentTarget.style.background = "transparent"; }}>
                <Icon name={ic} size={16} style={{ color: sel === id ? "var(--brand)" : "var(--ink-3)" }} />{label}
              </button>
            ))}
          </div>
        ))}
      </aside>
      <div style={{ overflowY: "auto", padding: "30px 36px 60px" }}><div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }} key={sel}><Panel /></div></div>
    </div>
  );
}
window.SettingsScreen = SettingsScreen;
