/* screen-billing.jsx, Billing & subscription */
const { useState: uSbil } = React;
const BL = window.UI;
const m$ = (n) => "$" + n.toLocaleString();

function UsageMeter({ k, used, limit }) {
  const unlimited = typeof limit === "string";
  const pct = unlimited ? Math.min(100, (used / 50000) * 100) : Math.min(100, (used / limit) * 100);
  const hot = !unlimited && pct >= 80;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>{k}</span>
        <span className="mono tnum" style={{ fontSize: 12, color: hot ? "var(--warn)" : "var(--ink-3)" }}>{used.toLocaleString()} <span style={{ color: "var(--ink-3)" }}>/ {unlimited ? limit : limit.toLocaleString()}</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", borderRadius: 99, background: hot ? "linear-gradient(90deg, var(--warn), var(--warn))" : "linear-gradient(90deg, var(--brand-2), var(--brand))", animation: "growx 1s var(--ease-out) both" }} />
      </div>
    </div>
  );
}

function BillingScreen() {
  const b = window.BILLING;
  const [showUpgrade, setShowUpgrade] = uSbil(false);
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px", position: "relative" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Billing &amp; plan</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Manage your subscription, usage, and invoices.</p></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18, alignItems: "start" }}>
          {/* plan card */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--brand) 30%, var(--line))", background: "linear-gradient(135deg, var(--brand-tint) 0%, transparent 60%)", padding: 24, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <BL.Pill tone="var(--brand)" bg="var(--surface)" style={{ fontSize: 10, fontWeight: 800 }}>{b.plan}</BL.Pill>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}><span className="mono" style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>{m$(b.price)}</span><span style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>/ {b.cycle}</span></div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 4 }}>Renews {b.renews}</div>
              </div>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--brand)", color: "white", display: "grid", placeItems: "center", boxShadow: "var(--e1)" }}><Icon name="rocket" size={24} /></span>
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
              <BL.Btn variant="primary" icon="arrowUpRight" onClick={() => setShowUpgrade(true)}>Upgrade to Enterprise</BL.Btn>
              <BL.Btn variant="soft" onClick={() => setShowUpgrade(true)}>Change plan</BL.Btn>
            </div>
          </div>
          {/* usage */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ ...BL.fStyles.label, marginBottom: 14 }}>Usage this period</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{b.usage.map(u => <UsageMeter key={u.k} {...u} />)}</div>
          </div>
        </div>

        {/* payment + invoices */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 18, alignItems: "start" }}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ ...BL.fStyles.label, marginBottom: 12 }}>Payment method</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
              <span style={{ width: 38, height: 26, borderRadius: 6, background: "linear-gradient(135deg, var(--ink), var(--ink-2))", color: "white", display: "grid", placeItems: "center" }}><Icon name="card" size={15} /></span>
              <div style={{ flex: 1 }}><div className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>•••• 4242</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>Expires 08 / 28</div></div>
            </div>
            <BL.Btn variant="soft" size="sm" icon="copy" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>Update card</BL.Btn>
          </div>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: "1px solid var(--line)" }}><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Invoices</span><button style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}>Download all</button></div>
            {b.invoices.map((iv, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 80px 80px 60px", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{iv.id}</span>
                <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{iv.date}</span>
                <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{m$(iv.amount)}</span>
                <BL.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">{iv.status}</BL.Pill>
                <button style={{ fontSize: 11.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textAlign: "right" }}>PDF</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* upgrade modal */}
      {showUpgrade && (
        <div onMouseDown={e => { if (e.target === e.currentTarget) setShowUpgrade(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 24, background: "color-mix(in oklab, var(--bg-deep) 50%, transparent)", animation: "fadein .2s" }}>
          <div style={{ width: "min(820px, 96vw)", borderRadius: "var(--r-2xl)", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--e3)", padding: 26, animation: "rise .25s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Choose your plan</h2><button onClick={() => setShowUpgrade(false)} style={{ width: 32, height: 32, borderRadius: 99, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", cursor: "pointer" }}><Icon name="x" size={16} /></button></div>
            <p style={{ margin: "0 0 20px", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>You're on Professional. Upgrade for SSO, integrations, and unlimited seats.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {b.tiers.map(t => (
                <div key={t.n} style={{ borderRadius: "var(--r-xl)", padding: 18, border: "1.5px solid", borderColor: t.cur ? "var(--brand)" : "var(--line)", background: t.n === "ENTERPRISE" ? "linear-gradient(160deg, var(--ai-tint), transparent 60%)" : "var(--surface)", position: "relative" }}>
                  {t.cur && <span style={{ position: "absolute", top: -9, left: 16, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--on-brand)", background: "var(--brand)", padding: "2px 9px", borderRadius: 99 }}>Current</span>}
                  <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".02em" }}>{t.n}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "8px 0 14px" }}>{t.price ? <><span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{m$(t.price)}</span><span style={{ fontSize: 12, color: "var(--ink-3)" }}>/mo</span></> : <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>Custom</span>}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>{t.feats.map(f => <span key={f} style={{ fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 7, alignItems: "center" }}><Icon name="check" size={13} style={{ color: t.n === "ENTERPRISE" ? "var(--ai)" : "var(--brand)" }} />{f}</span>)}</div>
                  {t.cur ? <BL.Btn variant="soft" style={{ width: "100%", justifyContent: "center" }}>Current plan</BL.Btn> : <BL.Btn variant={t.n === "ENTERPRISE" ? "ai" : "primary"} style={{ width: "100%", justifyContent: "center" }}>{t.n === "ENTERPRISE" ? "Contact sales" : "Downgrade"}</BL.Btn>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
window.BillingScreen = BillingScreen;
