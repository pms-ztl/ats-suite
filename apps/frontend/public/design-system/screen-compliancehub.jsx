/* screen-compliancehub.jsx, Compliance hub: overview · adverse impact · audit */
const { useState: uSch } = React;
const CH = window.UI;

function ImpactBar({ rate, max, isRef, pass }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 20, borderRadius: 6, background: "var(--surface-3)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: (rate/max*100)+"%", borderRadius: 6, background: isRef ? "var(--brand)" : pass ? "var(--ok)" : "var(--danger)", animation: "growx 1s var(--ease-out) both" }} />
    </div>
    <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, width: 48, textAlign: "right" }}>{(rate*100).toFixed(1)}%</span>
  </div>;
}
function AttrCard({ a }) {
  const max = Math.max(...a.groups.map(g => g.rate));
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--line)", background: a.pass ? "transparent" : "var(--danger-tint)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{a.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Impact ratio</div><div className="mono" style={{ fontSize: 18, fontWeight: 600, color: a.pass ? "var(--ok)" : "var(--danger)" }}>{a.ratio.toFixed(2)}</div></div>
          <CH.StatusBadge kind={a.pass ? "pass" : "fail"} />
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {a.groups.map(g => (
          <div key={g.g} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>{g.g}{g.ref && <CH.Pill tone="var(--brand)" bg="var(--brand-tint)" style={{ fontSize: 9.5, padding: "0 6px" }}>reference</CH.Pill>}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{g.sel.toLocaleString()} / {g.app.toLocaleString()}</span>
            </div>
            <ImpactBar rate={g.rate} max={max} isRef={g.ref} pass={a.pass} />
          </div>
        ))}
        <div style={{ marginTop: 4, padding: "11px 13px", borderRadius: "var(--r)", background: a.pass ? "var(--ok-tint)" : "var(--danger-tint)", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name={a.pass ? "check" : "flag"} size={15} style={{ color: a.pass ? "var(--ok)" : "var(--danger)", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{a.finding}</span>
        </div>
      </div>
    </div>
  );
}

function ComplianceHubScreen() {
  const c = window.COMPLIANCE, f = window.FAIRNESS;
  const [tab, setTab] = uSch("overview");
  const failing = f.attributes.filter(a => !a.pass).length;
  const tabs = [["overview", "Overview", "shield"], ["impact", "Adverse impact", "flag"], ["audit", "Audit log", "scroll"]];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "20px 30px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Compliance &amp; governance</h1><CH.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">bias-auditor</CH.Pill></div>
            <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>EEOC · GDPR · model oversight · {c.range}</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}><CH.Btn variant="soft" icon="scroll">Methodology</CH.Btn><CH.Btn variant="primary" icon="arrowUpRight">Download EEOC report</CH.Btn></div>
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid var(--line)" }}>
          {tabs.map(([id, l, ic]) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600, color: tab === id ? "var(--ink)" : "var(--ink-3)", borderBottom: "2px solid", borderColor: tab === id ? "var(--brand)" : "transparent", marginBottom: -1 }}>
              <Icon name={ic} size={15} />{l}{id === "impact" && failing > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--danger)", background: "var(--danger-tint)", padding: "0 6px", borderRadius: 99 }}>{failing}</span>}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "22px 30px 50px" }}>
        {tab === "overview" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", animation: "rise .3s var(--ease-out)" }}>
            {/* score banner */}
            <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: "var(--r-xl)", background: "linear-gradient(110deg, var(--brand-tint-2), transparent 65%)", border: "1px solid color-mix(in oklab, var(--brand) 22%, var(--line))", marginBottom: 18, flexWrap: "wrap" }}>
              <CH.ScoreRing value={c.score} size={84} band="var(--brand)" label="score" />
              <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Compliance score {c.score} / 100</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 2 }}>{failing} open adverse-impact finding{failing !== 1 ? "s" : ""} · 1 model on watch · all policies active.</div></div>
              <div style={{ display: "flex", gap: 16 }}>{[["Certs valid", "4 / 4"], ["Audit events", "1,240"], ["DPAs signed", "3 / 3"]].map(([k, v]) => <div key={k} style={{ textAlign: "center" }}><div className="mono tnum" style={{ fontSize: 20, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div></div>)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
              <window.SectionCard title="Policy compliance" icon="shield" headRight={<CH.Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check">{c.score} / 100</CH.Pill>}>
                {c.policies.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: p.st === "active" ? "var(--ok-tint)" : "var(--warn-tint)", color: p.st === "active" ? "var(--ok)" : "var(--warn)" }}><Icon name={p.st === "active" ? "check" : "eye"} size={13} stroke={2.3} /></span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{p.p}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.note}</div></div>
                    <CH.Pill tone={p.st === "active" ? "var(--ok)" : "var(--warn)"} bg="transparent">{p.st}</CH.Pill>
                  </div>
                ))}
              </window.SectionCard>
              <window.SectionCard title="Certifications" icon="shield">
                {c.certs.map((ct, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{ct.c}</div>{ct.until !== ", " && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>valid until {ct.until}</div>}</div>
                    <CH.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">{ct.st}</CH.Pill>
                  </div>
                ))}
              </window.SectionCard>
            </div>
          </div>
        )}

        {tab === "impact" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{f.stage} · {f.range} · <b style={{ color: "var(--ink)" }}>four-fifths (0.80) rule</b></div>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>generated {c.generated}</span>
            </div>
            <div style={{ borderRadius: "var(--r-xl)", padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: failing ? "linear-gradient(110deg, var(--danger-tint), transparent 70%)" : "linear-gradient(110deg, var(--ok-tint), transparent 70%)", border: "1px solid " + (failing ? "color-mix(in oklab, var(--danger) 28%, transparent)" : "color-mix(in oklab, var(--ok) 28%, transparent)") }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, display: "grid", placeItems: "center", background: failing ? "var(--danger)" : "var(--ok)", color: "white", flexShrink: 0 }}><Icon name={failing ? "flag" : "check"} size={24} /></span>
              <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{failing} of {f.attributes.length} attributes show potential adverse impact</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 2 }}>Any ratio below 0.80 warrants review. The threshold and groupings are legal facts, not choices.</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {f.attributes.map(a => <AttrCard key={a.name} a={a} />)}
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Intersectional view</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 14 }}>Selection rate · gender × ethnicity</div>
                <div style={{ display: "grid", gridTemplateColumns: "84px repeat(3, 1fr)", gap: 4, fontSize: 11 }}>
                  <div></div>{["White", "Asian", "Black"].map(cc => <div key={cc} style={{ textAlign: "center", fontWeight: 600, color: "var(--ink-3)", paddingBottom: 4 }}>{cc}</div>)}
                  {[["Men", [0.24,0.25,0.17]], ["Women", [0.22,0.23,0.15]], ["Non-binary", [0.21,0.20,0.14]]].map(([row, vals]) => (
                    <React.Fragment key={row}>
                      <div style={{ fontWeight: 600, color: "var(--ink-3)", display: "flex", alignItems: "center" }}>{row}</div>
                      {vals.map((v, i) => { const ok = v >= 0.18; return <div key={i} className="mono" style={{ height: 38, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: ok ? "var(--ink)" : "white", background: ok ? `color-mix(in oklab, var(--ok) ${v*180}%, var(--surface-2))` : `color-mix(in oklab, var(--danger) ${(0.25-v)*420}%, var(--surface-2))` }}>{(v*100).toFixed(0)}%</div>; })}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}><Icon name="shield" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--ai)" }} />Privacy-preserving: only group counts, never individual identities.</div>
              </div>
            </div>
          </div>
        )}

        {tab === "audit" && (
          <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Audit trail</h3><CH.Btn variant="soft" size="sm" icon="arrowUpRight">Export CSV</CH.Btn></div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <window.Timeline items={c.audit.map(a => ({ ic: a.ai ? "sparkles" : "scroll", ai: a.ai, who: a.who, what: a.act, t: a.t }))} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
window.ComplianceHubScreen = ComplianceHubScreen;
