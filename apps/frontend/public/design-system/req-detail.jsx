/* req-detail.jsx, requisition detail: header, pipeline flow, tabs */
const { useState: uSd } = React;
const RD = window.UI;

function Fact({ k, v, mono }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--line)" }}>
    <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{k}</span>
    <span className={mono ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{v}</span>
  </div>;
}

function PipelineFlow({ stages }) {
  const max = stages[0].n;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        {stages.map((s, i) => {
          return (
            <React.Fragment key={s.stage}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: "16px 8px", position: "relative", overflow: "hidden", boxShadow: "var(--e1)" }}>
                  <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: 3, background: s.color, opacity: .5 }} />
                  <div className="mono tnum" style={{ fontSize: 26, fontWeight: 700, color: s.color }}><RD.CountUp to={s.n} /></div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600, marginTop: 2 }}>{s.stage}</div>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: ((s.n/max)*100)+"%", background: s.color, borderRadius: 99, animation: "growx 1s var(--ease-out) both", animationDelay: (i*90)+"ms" }} />
                  </div>
                </div>
              </div>
              {i < stages.length - 1 && (() => {
                const convNext = Math.round((stages[i+1].n / s.n) * 100);
                return (
                  <div style={{ width: 46, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <Icon name="chevR" size={16} style={{ color: "var(--ink-3)" }} />
                    <span className="mono" style={{ fontSize: 10, color: convNext >= 50 ? "var(--ok)" : "var(--ink-3)", fontWeight: 600 }}>{convNext}%</span>
                  </div>
                );
              })()}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ReqDetailScreen({ onBack, onRounds, onForm, onCandidates }) {
  const d = window.REQ_DETAIL;
  const [tab, setTab] = uSd("overview");
  const m = window.REQ_STATUS[d.status];
  const tabs = [["overview", "Overview", "fileText"], ["pipeline", "Pipeline", "radar"], ["rounds", "Interview rounds", "calendar"], ["form", "Application form", "listChecks"], ["activity", "Activity", "bolt"]];
  const g = window.JD_GEN;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* header */}
      <div style={{ padding: "16px 30px 0" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 12 }}><Icon name="chevsL" size={14} /> All requisitions</button>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.title}</h1>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px 4px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}><Icon name={m.icon} size={12} stroke={2.4} />{m.label}</span>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7, fontSize: 12.5, color: "var(--ink-2)" }}>
              <span className="mono">{d.id}</span><span>·</span><span>{d.dept}</span><span>·</span><span>{d.loc}</span><span>·</span>
              <span className="mono" style={{ color: "var(--brand)", fontWeight: 600 }}>${d.min/1000}k to ${d.max/1000}k</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <RD.Btn variant="soft" icon="copy">Edit</RD.Btn>
            <RD.Btn variant="soft" icon="users" onClick={onCandidates}>View candidates</RD.Btn>
            <RD.Btn variant="primary" icon="arrowUpRight">Post job</RD.Btn>
          </div>
        </div>
        {/* tabs */}
        <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid var(--line)" }}>
          {tabs.map(([id, label, ic]) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600,
              color: tab === id ? "var(--ink)" : "var(--ink-3)", borderBottom: "2px solid", borderColor: tab === id ? "var(--brand)" : "transparent", marginBottom: -1 }}>
              <Icon name={ic} size={15} />{label}</button>
          ))}
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 30px 50px" }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 22, boxShadow: "var(--e1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Job description</h3>
                  <RD.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">jd-author · 92 inclusivity</RD.Pill>
                </div>
                <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}>{g.description}</p>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Required qualifications</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                  {g.required.map((r, i) => <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--ink-2)" }}><Icon name="check" size={14} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />{r}</div>)}
                </div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Nice to have</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{g.niceToHave.map((r, i) => <RD.Pill key={i} tone="var(--ink-2)" bg="var(--surface-2)">{r}</RD.Pill>)}</div>
              </div>

              <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--ai) 24%, var(--line))", background: "linear-gradient(180deg, var(--ai-tint) 0%, transparent 38%)", padding: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3></div>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--ink-2)" }}>These admin-defined criteria are sent to the screener and appear in every verdict.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {window.CUSTOM_FIELDS.map(cf => {
                    const imp = window.IMPORTANCE[cf.importance];
                    return (
                      <div key={cf.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{cf.label}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{cf.value}</div></div>
                        <RD.Pill tone={imp.tone} bg={imp.bg}>{imp.label}</RD.Pill>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...RD.fStyles.label, marginBottom: 4 }}>Details</div>
                <Fact k="Level" v={d.level} /><Fact k="Job family" v={d.family} /><Fact k="Location" v={d.loc} />
                <Fact k="Salary" v={`$${d.min/1000}k to $${d.max/1000}k`} mono /><Fact k="Headcount" v={`${d.filled} / ${d.head} filled`} mono />
                <Fact k="Target start" v={d.target} /><Fact k="Posted" v={d.posted} />
              </div>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...RD.fStyles.label, marginBottom: 12 }}>Owners</div>
                {[["Recruiter", d.rec, "AC"], ["Hiring manager", d.hm, "JL"]].map(([role, name, ini]) => (
                  <div key={role} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <span className="mono" style={{ width: 32, height: 32, borderRadius: 99, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{ini}</span>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{role}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div style={{ animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div><h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Candidate pipeline</h3><p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>42 candidates across 5 stages · {Math.round((9/42)*100)}% reach interview.</p></div>
              <RD.Btn variant="soft" icon="users" onClick={onCandidates}>Open candidates board</RD.Btn>
            </div>
            <PipelineFlow stages={d.pipeline} />
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[["In screening", "26", "scan", "var(--info)", "5 flagged for human review"], ["Interviewing", "9", "calendar", "var(--ai)", "3 panels to schedule"], ["At offer", "2", "fileText", "var(--brand)", "1 awaiting approval"]].map(([t, n, ic, c, sub]) => (
                <div key={t} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: 16, boxShadow: "var(--e1)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", color: c, background: "color-mix(in oklab," + c + " 13%, transparent)" }}><Icon name={ic} size={16} /></span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}><span className="mono tnum" style={{ fontSize: 24, fontWeight: 700 }}>{n}</span><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>{t}</span></div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rounds" && <div style={{ animation: "rise .3s var(--ease-out)" }}><window.RoundsConfig /></div>}
        {tab === "form" && <div style={{ animation: "rise .3s var(--ease-out)" }}><window.FormBuilder /></div>}
        {tab === "activity" && (
          <div style={{ maxWidth: 620, animation: "rise .3s var(--ease-out)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "var(--fs-lg)", fontWeight: 700 }}>Activity</h3>
            <window.Timeline items={d.activity} />
          </div>
        )}
      </div>
    </div>
  );
}
window.ReqDetailScreen = ReqDetailScreen;

/* ---------------- controller ---------------- */
function RequisitionsScreen() {
  const [view, setView] = uSd("list");
  if (view === "intake") return <window.IntakeScreen onBack={() => setView("list")} />;
  if (view === "detail") return <window.ReqDetailScreen onBack={() => setView("list")} onCandidates={() => {}} />;
  return <window.ReqListScreen onCreate={() => setView("intake")} onOpen={() => setView("detail")} />;
}
window.RequisitionsScreen = RequisitionsScreen;
