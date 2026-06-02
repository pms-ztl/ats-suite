/* screen-secai.jsx, Security dashboard + AI operations */
const SA = window.UI;

function SecurityScreen() {
  const s = window.SECURITY;
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Security</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Posture, access, and risk for Northwind Talent.</p></div>
          <SA.Btn variant="primary" icon="arrowUpRight">Download report</SA.Btn>
        </div>

        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: "var(--r-xl)", background: "linear-gradient(110deg, var(--brand-tint-2), transparent 65%)", border: "1px solid color-mix(in oklab, var(--brand) 22%, var(--line))", marginBottom: 18, flexWrap: "wrap" }}>
          <SA.ScoreRing value={s.score} size={84} band="var(--brand)" label="score" />
          <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Security score {s.score} / 100</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 2 }}>{s.alerts.length} open risk items · strong encryption &amp; MFA coverage.</div></div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>{s.posture.map(p => <div key={p.k} style={{ textAlign: "center", minWidth: 80 }}><div className="mono tnum" style={{ fontSize: 20, fontWeight: 700, color: p.v >= 90 ? "var(--ok)" : "var(--ink)" }}>{p.v}{p.unit}</div><div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>{p.k}</div></div>)}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
          <window.SectionCard title="Risk alerts" icon="flag" headRight={<SA.Pill tone="var(--warn)" bg="var(--warn-tint)">{s.alerts.length} open</SA.Pill>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {s.alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: a.sev === "Medium" ? "var(--warn-tint)" : "var(--surface)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, color: a.sev === "Medium" ? "var(--warn)" : "var(--ink-2)", background: a.sev === "Medium" ? "var(--surface)" : "var(--surface-2)" }}><Icon name={a.icon} size={17} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.t}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{a.detail}</div></div>
                  <SA.Pill tone={a.sev === "Medium" ? "var(--warn)" : "var(--ink-3)"} bg="transparent">{a.sev}</SA.Pill>
                  <SA.Btn variant="soft" size="sm">Resolve</SA.Btn>
                </div>
              ))}
            </div>
          </window.SectionCard>
          <window.SectionCard title="Hardening checklist" icon="check" headRight={<SA.Pill tone="var(--ok)" bg="var(--ok-tint)">{s.checklist.filter(c => c.done).length} / {s.checklist.length}</SA.Pill>}>
            {s.checklist.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: c.done ? "var(--ok)" : "var(--surface-2)", color: c.done ? "var(--on-brand)" : "var(--ink-3)", border: c.done ? "none" : "1px solid var(--line-strong)" }}>{c.done && <Icon name="check" size={13} stroke={3} />}</span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: c.done ? "var(--ink-2)" : "var(--ink)" }}>{c.c}</span>
                {!c.done && <SA.Pill tone="var(--warn)" bg="var(--warn-tint)">to do</SA.Pill>}
              </div>
            ))}
          </window.SectionCard>
        </div>
      </div>
    </div>
  );
}
window.SecurityScreen = SecurityScreen;

function AiOpsScreen() {
  const a = window.AIOPS;
  const driftMeta = { stable: ["var(--ok)", "var(--ok-tint)"], watch: ["var(--warn)", "var(--warn-tint)"] };
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>AI operations</h1><SA.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">15 agents</SA.Pill></div>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Monitor agent health, cost, drift, and prompts across the fleet.</p></div>
          <SA.Btn variant="soft" icon="terminal">Manage prompts</SA.Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {a.kpis.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}
        </div>

        <window.Reveal i={4}><window.SectionCard title="Agent fleet" icon="cpu" action="Deploy agent" headRight={<SA.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">violet = AI</SA.Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 110px 90px 90px 100px 90px", gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
            <span>Agent</span><span>Status</span><span style={{ textAlign: "right" }}>Accuracy</span><span style={{ textAlign: "right" }}>Drift</span><span style={{ textAlign: "right" }}>Cost/mo</span><span style={{ textAlign: "right" }}>Latency</span>
          </div>
          {a.agents.map((ag, i) => {
            const [dc, db] = driftMeta[ag.drift];
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 110px 90px 90px 100px 90px", gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)", flexShrink: 0 }}><Icon name="cpu" size={14} /></span><span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ai-ink)" }}>{ag.n}</span></span>
                <SA.Pill tone={ag.status === "healthy" ? "var(--ok)" : "var(--warn)"} bg={ag.status === "healthy" ? "var(--ok-tint)" : "var(--warn-tint)"} icon={ag.status === "healthy" ? "check" : "eye"}>{ag.status}</SA.Pill>
                <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>{ag.acc.toFixed(2)}</span>
                <span style={{ textAlign: "right" }}><SA.Pill tone={dc} bg={db} style={{ fontSize: 10 }}>{ag.drift}</SA.Pill></span>
                <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>${ag.cost}</span>
                <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--ink-3)" }}>{ag.lat}s</span>
              </div>
            );
          })}
        </window.SectionCard></window.Reveal>

        <div style={{ marginTop: 16, padding: "13px 16px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)" }}>
          <Icon name="shield" size={16} style={{ color: "var(--ai)", flexShrink: 0 }} /><span><b style={{ color: "var(--ai-ink)" }}>bias-auditor</b> and <b style={{ color: "var(--ai-ink)" }}>analytics</b> are on drift watch, accuracy dipped below 0.92. Review their recent outputs in Compliance.</span>
          <SA.Btn variant="outlineAi" size="sm" icon="eye" style={{ marginLeft: "auto" }}>Investigate</SA.Btn>
        </div>
      </div>
    </div>
  );
}
window.AiOpsScreen = AiOpsScreen;
