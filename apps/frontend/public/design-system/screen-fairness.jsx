/* screen-fairness.jsx, adverse-impact / four-fifths fairness dashboard */
const { useState: uSf } = React;

function Bar({ rate, max, isRef, pass }) {
  const w = (rate / max) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 22, borderRadius: 6, background: "var(--surface-3)", overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: w + "%", borderRadius: 6, transition: "width 1s var(--ease-out)",
          background: isRef ? "var(--brand)" : pass ? "var(--ok)" : "var(--danger)" }} />
      </div>
      <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, width: 52, textAlign: "right", color: "var(--ink)" }}>{(rate * 100).toFixed(1)}%</span>
    </div>
  );
}

function AttrCard({ a }) {
  const max = Math.max(...a.groups.map(g => g.rate));
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--line)",
        background: a.pass ? "transparent" : "var(--danger-tint)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{a.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Impact ratio</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: a.pass ? "var(--ok)" : "var(--danger)" }}>{a.ratio.toFixed(2)}</div>
          </div>
          <StatusBadge kind={a.pass ? "pass" : "fail"} />
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {a.groups.map(g => (
          <div key={g.g} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>{g.g}
                {g.ref && <Pill tone="var(--brand)" bg="var(--brand-tint)" style={{ fontSize: 9.5, padding: "0 6px" }}>reference</Pill>}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{g.sel.toLocaleString()} / {g.app.toLocaleString()}</span>
            </div>
            <Bar rate={g.rate} max={max} isRef={g.ref} pass={a.pass} />
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

function FairnessScreen() {
  const f = window.FAIRNESS;
  const failing = f.attributes.filter(a => !a.pass).length;
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6 }}>
              <Pill icon="shield" tone="var(--brand)" bg="var(--brand-tint)">EEOC · Uniform Guidelines</Pill>
              <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">computed by bias-auditor</Pill>
            </div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Adverse-impact analysis</h1>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 6 }}>{f.stage} · {f.range} · four-fifths (0.80) rule</div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn variant="soft" icon="scroll">View methodology</Btn>
            <Btn variant="primary" icon="arrowUpRight">Publish audit summary</Btn>
          </div>
        </div>

        {/* overall banner */}
        <div style={{ borderRadius: "var(--r-xl)", padding: "18px 22px", marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
          background: failing ? "linear-gradient(110deg, var(--danger-tint), transparent 70%)" : "linear-gradient(110deg, var(--ok-tint), transparent 70%)",
          border: "1px solid " + (failing ? "color-mix(in oklab, var(--danger) 30%, transparent)" : "color-mix(in oklab, var(--ok) 30%, transparent)") }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: failing ? "var(--danger)" : "var(--ok)", color: "white", flexShrink: 0 }}>
            <Icon name={failing ? "flag" : "check"} size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{failing ? `${failing} of ${f.attributes.length} attributes show potential adverse impact` : "No adverse impact detected"}</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 2 }}>Any impact ratio below 0.80 warrants review of the selection procedure at this stage. The 0.80 threshold and groupings are legal facts, not thresholds we chose.</div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {[["Applicants", "4,036"], ["Selected", "902"], ["Stages tracked", "5"]].map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div className="mono tnum" style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* attribute cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {f.attributes.map(a => <AttrCard key={a.name} a={a} />)}
          {/* intersection heatmap */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Intersectional view</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 14 }}>Selection rate · gender × ethnicity</div>
            <div style={{ display: "grid", gridTemplateColumns: "84px repeat(3, 1fr)", gap: 4, fontSize: 11 }}>
              <div></div>
              {["White", "Asian", "Black"].map(c => <div key={c} style={{ textAlign: "center", fontWeight: 600, color: "var(--ink-3)", paddingBottom: 4 }}>{c}</div>)}
              {[["Men", [0.24, 0.25, 0.17]], ["Women", [0.22, 0.23, 0.15]], ["Non-binary", [0.21, 0.20, 0.14]]].map(([row, vals]) => (
                <React.Fragment key={row}>
                  <div style={{ fontWeight: 600, color: "var(--ink-3)", display: "flex", alignItems: "center" }}>{row}</div>
                  {vals.map((v, i) => {
                    const ok = v >= 0.18;
                    return <div key={i} className="mono" style={{ height: 38, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600,
                      color: ok ? "var(--ink)" : "white", background: ok ? `color-mix(in oklab, var(--ok) ${v*180}%, var(--surface-2))` : `color-mix(in oklab, var(--danger) ${(0.25-v)*420}%, var(--surface-2))` }}>{(v*100).toFixed(0)}%</div>;
                  })}
                </React.Fragment>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
              <Icon name="shield" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--ai)" }} />
              Privacy-preserving: the auditor sees only group counts, never individual identities.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.FairnessScreen = FairnessScreen;
