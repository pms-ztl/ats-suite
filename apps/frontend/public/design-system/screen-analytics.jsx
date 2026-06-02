/* screen-analytics.jsx, Analytics dashboard (funnel, time-to-hire, source-effectiveness, diversity, AI insights) */
const { useState: uSan } = React;
const AN = window.UI;

function SevDot({ sev }) {
  const c = sev === "critical" ? "var(--danger)" : sev === "warning" ? "var(--warn)" : "var(--info)";
  return <span style={{ width: 8, height: 8, borderRadius: 99, background: c, flexShrink: 0 }} />;
}

function AnalyticsScreen() {
  const a = window.ANALYTICS;
  const maxDept = Math.max(...a.tthByDept.map(d => d.days));
  const maxHires = Math.max(...a.sources.map(s => s.hires));
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Analytics</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Hiring performance across Northwind Talent · {a.range}.</p></div>
          <div style={{ display: "flex", gap: 9 }}>
            <AN.Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>{a.range}</AN.Pill>
            <AN.Btn variant="primary" icon="arrowUpRight">Export</AN.Btn>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {a.kpis.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}
        </div>

        {/* AI insights */}
        <window.Reveal i={4}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: "linear-gradient(110deg, var(--ai-tint), transparent 65%)", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Insights</span><AN.Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">analytics agent</AN.Pill></div>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>ranked by severity · grounded in your data</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
              {a.insights.map((ins, i) => (
                <div key={i} style={{ padding: "16px 18px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><SevDot sev={ins.sev} /><span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: ins.sev === "critical" ? "var(--danger)" : ins.sev === "warning" ? "var(--warn)" : "var(--info)" }}>{ins.sev}</span></div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 6 }}>{ins.finding}</div>
                  <p style={{ margin: "0 0 9px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{ins.evidence}</p>
                  <div style={{ display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12, color: "var(--ai-ink)", fontWeight: 600, lineHeight: 1.45 }}><Icon name="bolt" size={13} style={{ flexShrink: 0, marginTop: 2 }} />{ins.rec}</div>
                </div>
              ))}
            </div>
          </div>
        </window.Reveal>

        {/* funnel + diversity */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          <window.Reveal i={5}><window.SectionCard title="Pipeline funnel" icon="radar" headRight={<AN.Pill mono tone="var(--ok)" bg="var(--ok-tint)">1.0% applied→hired</AN.Pill>}><window.Funnel stages={a.funnel} /></window.SectionCard></window.Reveal>
          <window.Reveal i={6}><window.SectionCard title="Diversity (hires)" icon="grid" action="EEOC report"><window.Donut data={a.diversity} /></window.SectionCard></window.Reveal>
        </div>

        {/* time-to-hire trend + by dept */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          <window.Reveal i={7}><window.SectionCard title="Time-to-hire trend" icon="chart" headRight={<AN.Pill mono tone="var(--ok)" bg="var(--ok-tint)" icon="arrowUpRight">−9 days YoY</AN.Pill>}><window.TrendArea data={a.tthTrend} labels={a.tthLabels} /></window.SectionCard></window.Reveal>
          <window.Reveal i={8}><window.SectionCard title="By department" icon="briefcase">
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {a.tthByDept.map((d, i) => (
                <div key={d.dept} style={{ display: "grid", gridTemplateColumns: "92px 1fr 56px", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>{d.dept}</span>
                  <div style={{ height: 16, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: ((d.days/maxDept)*100)+"%", borderRadius: 6, background: d.days > 28 ? "var(--warn)" : "var(--brand)", animation: "growx 1s var(--ease-out) both", animationDelay: (i*80)+"ms" }} />
                  </div>
                  <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>{d.days}d</span>
                </div>
              ))}
            </div>
          </window.SectionCard></window.Reveal>
        </div>

        {/* source effectiveness */}
        <window.Reveal i={9}><window.SectionCard title="Source effectiveness" icon="radar" action="Details">
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 90px 90px 90px", gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
            <span>Source</span><span>Hires</span><span style={{ textAlign: "right" }}>Quality</span><span style={{ textAlign: "right" }}>Apps</span><span style={{ textAlign: "right" }}>Cost/hire</span>
          </div>
          {a.sources.map((s, i) => (
            <div key={s.src} style={{ display: "grid", gridTemplateColumns: "120px 1fr 90px 90px 90px", gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 600 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: s.color }} />{s.src}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ flex: 1, maxWidth: 200, height: 18, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: ((s.hires/maxHires)*100)+"%", borderRadius: 6, background: s.color, animation: "growx 1s var(--ease-out) both", animationDelay: (i*80)+"ms" }} />
                </div>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700 }}>{s.hires}</span>
              </div>
              <span style={{ textAlign: "right", display: "inline-flex", justifyContent: "flex-end", alignItems: "center", gap: 5 }}><span className="mono" style={{ fontSize: 12, fontWeight: 600, color: s.quality >= 75 ? "var(--ok)" : s.quality >= 60 ? "var(--warn)" : "var(--danger)" }}>{s.quality}</span></span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--ink-3)" }}>{s.apps.toLocaleString()}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", fontWeight: 600, color: s.cost > 4000 ? "var(--danger)" : "var(--ink)" }}>${s.cost.toLocaleString()}</span>
            </div>
          ))}
        </window.SectionCard></window.Reveal>
      </div>
    </div>
  );
}
window.AnalyticsScreen = AnalyticsScreen;
