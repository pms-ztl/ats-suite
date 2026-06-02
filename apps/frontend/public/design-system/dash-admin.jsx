/* dash-admin.jsx, Admin org-wide + Compliance-officer dashboards + role dispatcher */
const DA = window.UI;

/* ---------------- Admin / org-wide ---------------- */
function AdminDash() {
  const d = window.DASH.admin;
  const [live, setLive] = React.useState(true);
  const heroStats = [
    { label: "Active candidates", value: 1284, icon: "users", spark: [1050,1100,1140,1180,1205,1240,1262,1284] },
    { label: "Open reqs", value: 38, icon: "briefcase", spark: [30,31,33,34,35,36,37,38] },
    { label: "AI decisions", value: 342, icon: "sparkles", ai: true, spark: [180,210,240,260,290,310,330,342] },
    { label: "Time to hire", value: 21, suffix: "d", icon: "clock", spark: [30,28,26,24,23,22,21,21] },
  ];
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <window.CommandHero title="Org overview" sub="Everything happening across your hiring operation, in real time." stats={heroStats} live={live} onToggleLive={() => setLive(v => !v)}>
        <DA.Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 30 days</DA.Pill>
        <DA.Btn variant="primary" icon="arrowUpRight">Export report</DA.Btn>
      </window.CommandHero>

      {/* 8 KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
        {d.kpis.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}
      </div>

      {/* charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <window.Reveal i={8}><window.SectionCard title="Pipeline funnel" icon="radar" action="Breakdown" headRight={<DA.Pill mono tone="var(--ok)" bg="var(--ok-tint)">1.0% applied→hired</DA.Pill>}>
          <window.Funnel stages={d.funnel} />
        </window.SectionCard></window.Reveal>
        <window.Reveal i={9}><window.SectionCard title="Diversity" icon="grid" action="EEOC report">
          <window.Donut data={d.diversity} />
        </window.SectionCard></window.Reveal>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <window.Reveal i={10}><window.SectionCard title="Time-to-hire trend" icon="chart" headRight={<DA.Pill mono tone="var(--ok)" bg="var(--ok-tint)" icon="arrowUpRight">−9 days YoY</DA.Pill>}>
            <window.TrendArea data={d.trend} labels={d.trendLabels} />
          </window.SectionCard></window.Reveal>
          <window.Reveal i={12}><window.SectionCard title="Activity" icon="bolt" action="Full log">
            <window.Timeline items={d.activity} />
          </window.SectionCard></window.Reveal>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <window.Reveal i={11}><window.SectionCard title="Pending actions" icon="listChecks" headRight={<DA.Pill tone="var(--warn)" bg="var(--warn-tint)">4 need attention</DA.Pill>}>
            <window.PendingList items={d.pending} />
          </window.SectionCard></window.Reveal>
          <window.Reveal i={13}><window.SectionCard title="Agent activity" icon="sparkles" ai>
            <svg viewBox="0 0 280 70" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
              <defs><linearGradient id="agp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="var(--ai)" stopOpacity="0.05" /><stop offset="1" stopColor="var(--ai)" stopOpacity="0.4" /></linearGradient></defs>
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => { var h = [14,22,18,30,26,38,34,46,40,52,48,58][i]; return <rect key={i} x={8 + i*22} y={64 - h} width="13" height={h} rx="3" fill="url(#agp)" />; })}
              <polyline points="14,50 36,46 58,48 80,40 102,42 124,34 146,36 168,28 190,30 212,22 234,24 256,16" fill="none" stroke="var(--ai)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="256" cy="16" r="3.5" fill="var(--ai)" />
            </svg>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["candidate-screener", "1,284 scored"], ["bias-auditor", "12 reqs watched"], ["jd-author", "38 drafts"], ["copilot", "210 answers"]].map(([n, v]) => (
                <div key={n} style={{ padding: "9px 11px", borderRadius: "var(--r)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 18%, transparent)" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> All agents advisory · humans hold every decision.</p>
          </window.SectionCard></window.Reveal>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Compliance officer ---------------- */
function ComplianceDash() {
  const d = window.DASH.compliance;
  const driftMeta = { stable: ["var(--ok)", "var(--ok-tint)", "stable"], watch: ["var(--warn)", "var(--warn-tint)", "watch"] };
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <window.Greeting title="Compliance & governance" sub="Fairness, model oversight, and a defensible audit trail, in one place.">
        <DA.Btn variant="soft" icon="scroll">Audit log</DA.Btn>
        <DA.Btn variant="primary" icon="arrowUpRight">Download EEOC report</DA.Btn>
      </window.Greeting>
      <KpiRowC kpis={d.kpis} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <window.Reveal i={4}><window.SectionCard title="Bias alerts" icon="flag" headRight={<DA.Pill tone="var(--danger)" bg="var(--danger-tint)">2 open</DA.Pill>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.alerts.map((a, i) => (
              <div key={i} style={{ padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid", borderColor: a.sev === "High" ? "color-mix(in oklab, var(--danger) 30%, var(--line))" : "var(--line)",
                background: a.sev === "High" ? "var(--danger-tint)" : "var(--warn-tint)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontWeight: 700, fontSize: "var(--fs-sm)", color: a.sev === "High" ? "var(--danger)" : "var(--warn)" }}>
                    <Icon name="flag" size={14} />{a.sev} · adverse impact</span>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 600, color: a.sev === "High" ? "var(--danger)" : "var(--warn)" }}>{a.ratio.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 5 }}>{a.attr} · {a.stage}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>below 0.80 threshold · {a.t}</span>
                  <DA.Btn variant="soft" size="sm" icon="eye">Investigate</DA.Btn>
                </div>
              </div>
            ))}
          </div>
        </window.SectionCard></window.Reveal>

        <window.Reveal i={5}><window.SectionCard title="Policy compliance" icon="shield" headRight={<DA.Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check">94 / 100</DA.Pill>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {d.policies.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0,
                  background: p.st === "active" ? "var(--ok-tint)" : "var(--warn-tint)", color: p.st === "active" ? "var(--ok)" : "var(--warn)" }}>
                  <Icon name={p.st === "active" ? "check" : "eye"} size={13} stroke={2.3} /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{p.p}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{p.note}</div></div>
                <DA.Pill tone={p.st === "active" ? "var(--ok)" : "var(--warn)"} bg="transparent">{p.st}</DA.Pill>
              </div>
            ))}
          </div>
        </window.SectionCard></window.Reveal>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <window.Reveal i={6}><window.SectionCard title="Model monitoring" icon="cpu" action="AI operations" headRight={<DA.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">15 agents</DA.Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 70px", gap: 10, padding: "0 4px 8px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
            <span>Agent</span><span>Drift</span><span style={{ textAlign: "right" }}>Accuracy</span><span style={{ textAlign: "right" }}>Runs</span>
          </div>
          {d.models.map((m, i) => {
            const [tc, tb, lbl] = driftMeta[m.drift];
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px 70px 70px", gap: 10, alignItems: "center", padding: "10px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ai-ink)" }}>{m.n}</span>
                <DA.Pill tone={tc} bg={tb} icon={m.drift === "stable" ? "check" : "eye"} style={{ fontSize: 10 }}>{lbl}</DA.Pill>
                <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>{m.acc.toFixed(2)}</span>
                <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--ink-3)" }}>{m.runs}</span>
              </div>
            );
          })}
        </window.SectionCard></window.Reveal>

        <window.Reveal i={7}><window.SectionCard title="Recent audit trail" icon="scroll" action="Export">
          <window.Timeline items={d.audit.map(a => ({ ic: a.ai ? "sparkles" : "scroll", ai: a.ai, who: a.who, what: a.act, t: a.t }))} />
        </window.SectionCard></window.Reveal>
      </div>
    </div>
  );
}
function KpiRowC({ kpis }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>{kpis.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}</div>;
}

/* ---------------- role dispatcher ---------------- */
function DashboardHome({ role }) {
  const map = {
    recruiter: window.RecruiterDash,
    hiring_manager: window.HMDash,
    interviewer: window.InterviewerDash,
    admin: window.AdminDash,
    compliance_officer: window.ComplianceDash,
    super_admin: window.AdminDash,
  };
  const View = map[role] || window.AdminDash;
  return <div style={{ padding: "28px 30px 60px", overflowY: "auto", height: "100%" }}><View /></div>;
}

Object.assign(window, { AdminDash, ComplianceDash, DashboardHome });
