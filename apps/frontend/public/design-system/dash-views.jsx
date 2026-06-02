/* dash-views.jsx, Recruiter, Hiring-manager, Interviewer dashboards */
const DV = window.UI;
const dStICon = (s) => s === "pass" ? "check" : s === "review" ? "eye" : "x";
const dStCol = (s) => s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : "var(--danger)";

function KpiRow({ kpis, cols }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols || kpis.length}, 1fr)`, gap: 14, marginBottom: 18 }}>
    {kpis.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}
  </div>;
}

/* ---------------- Recruiter ---------------- */
function RecruiterDash() {
  const d = window.DASH.recruiter;
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <window.Greeting title={`${window.DASH.user.greeting}, ${window.DASH.user.name}`} sub="47 new applications and 9 candidates waiting to be scheduled.">
        <DV.Btn variant="soft" icon="users">Bulk upload</DV.Btn>
        <DV.Btn variant="ai" icon="radar">Source candidates</DV.Btn>
      </window.Greeting>
      <KpiRow kpis={d.kpis} />
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <window.Reveal i={4}><window.SectionCard title="Latest applications" icon="users" action="View all" pad={6}>
            {d.applications.map((a, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 12, alignItems: "center", padding: "9px 12px", borderRadius: "var(--r)", transition: "background var(--t-fast)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <DV.ScoreRing value={a.score} size={40} band={dStCol(a.st)} label="" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.n}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{a.role} · {a.src}</div>
                </div>
                <DV.StatusBadge kind={a.st} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 32, textAlign: "right" }}>{a.t}</span>
              </div>
            ))}
          </window.SectionCard></window.Reveal>

          <window.Reveal i={6}><window.SectionCard title="My requisitions" icon="briefcase" action="Manage">
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {d.myReqs.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 60px", gap: 14, alignItems: "center" }}>
                  <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{r.dept}</div></div>
                  <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                    {r.stagePct.map((p, j) => <div key={j} style={{ width: p + "%", background: ["var(--ink-3)","var(--info)","var(--ai)","var(--brand)"][j], animation: "growx .9s var(--ease-out) both", animationDelay: (j*100)+"ms" }} />)}
                  </div>
                  <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{r.cand}</span>
                </div>
              ))}
            </div>
          </window.SectionCard></window.Reveal>
        </div>

        <window.Reveal i={5}><window.SectionCard title="Scheduling queue" icon="calendar" action="Open calendar">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.scheduling.map((s, i) => (
              <div key={i} style={{ padding: "12px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: s.urgent ? "var(--warn-tint)" : "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{s.n}</span>
                  {s.urgent && <DV.Pill tone="var(--warn)" bg="transparent" icon="clock">urgent</DV.Pill>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 9 }}>{s.role} · {s.round}</div>
                <DV.Btn variant="soft" size="sm" icon="calendar" style={{ width: "100%", justifyContent: "center" }}>Schedule</DV.Btn>
              </div>
            ))}
          </div>
        </window.SectionCard></window.Reveal>
      </div>
    </div>
  );
}

/* ---------------- Hiring manager ---------------- */
function HMDash() {
  const d = window.DASH.hm;
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <window.Greeting title={`${window.DASH.user.greeting}, ${window.DASH.user.name}`} sub="4 decisions are waiting on you, 2 are time-sensitive.">
        <DV.Btn variant="soft" icon="chart">View analytics</DV.Btn>
        <DV.Btn variant="primary" icon="briefcase">New requisition</DV.Btn>
      </window.Greeting>
      <KpiRow kpis={d.kpis} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
        <window.Reveal i={4}><window.SectionCard title="Decisions awaiting you" icon="gavel" action="View queue" pad={10}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {d.decisions.map((dec, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
                  background: dec.tone === "ok" ? "var(--ok-tint)" : "var(--warn-tint)", color: dec.tone === "ok" ? "var(--ok)" : "var(--warn)" }}><Icon name="gavel" size={16} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{dec.n}</span>
                    <DV.Pill tone={dec.tone === "ok" ? "var(--ok)" : "var(--warn)"} bg={dec.tone === "ok" ? "var(--ok-tint)" : "var(--warn-tint)"}>{dec.rec}</DV.Pill>
                    {dec.recAi && <DV.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" icon="sparkles" style={{ fontSize: 9.5 }}>AI</DV.Pill>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{dec.role} · {dec.by}</div>
                </div>
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{dec.wait}</span>
                <DV.Btn variant="primary" size="sm">Review</DV.Btn>
              </div>
            ))}
          </div>
        </window.SectionCard></window.Reveal>

        <window.Reveal i={5}><window.SectionCard title="My requisitions" icon="briefcase" action="All reqs">
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {d.reqs.map((r, i) => {
              const labels = ["Applied","Screen","Interview","Offer"];
              const max = r.funnel[0];
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</span>
                    <DV.Pill tone={r.risk === "at-risk" ? "var(--danger)" : "var(--ok)"} bg={r.risk === "at-risk" ? "var(--danger-tint)" : "var(--ok-tint)"} icon={r.risk === "at-risk" ? "flag" : "check"}>{r.target}</DV.Pill>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.funnel.map((n, j) => (
                      <div key={j} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ height: 34, borderRadius: 7, background: "var(--surface-2)", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                          <div style={{ width: "100%", height: ((n/max)*100)+"%", background: ["var(--ink-3)","var(--info)","var(--ai)","var(--brand)"][j], borderRadius: 7, animation: "growy 1s var(--ease-out) both", animationDelay: (j*90)+"ms" }} />
                        </div>
                        <div className="mono tnum" style={{ fontSize: 11, fontWeight: 600, marginTop: 3 }}>{n}</div>
                        <div style={{ fontSize: 9, color: "var(--ink-3)" }}>{labels[j]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </window.SectionCard></window.Reveal>
      </div>
    </div>
  );
}

/* ---------------- Interviewer (calm) ---------------- */
function InterviewerDash() {
  const d = window.DASH.interviewer;
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <window.Greeting title={`${window.DASH.user.greeting}, ${window.DASH.user.name}`} sub="You have 3 interviews today and 2 scorecards to write.">
        <DV.Btn variant="soft" icon="calendar">Full schedule</DV.Btn>
      </window.Greeting>
      <KpiRow kpis={d.kpis} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
        <window.Reveal i={4}><window.SectionCard title="Today's interviews" icon="calendar">
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {d.today.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)",
                background: t.soon ? "linear-gradient(110deg, var(--brand-tint), transparent 70%)" : "var(--surface)" }}>
                <div style={{ textAlign: "center", flexShrink: 0, width: 56 }}>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{t.time}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{t.dur}</div>
                </div>
                <div style={{ width: 1, height: 38, background: "var(--line)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{t.n}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{t.role} · {t.type} · {t.panel} panelist{t.panel>1?"s":""}</div>
                </div>
                <DV.Pill tone="var(--ink-2)" icon={t.mode === "Video" ? "eye" : t.mode === "Phone" ? "clock" : "users"}>{t.mode}</DV.Pill>
                {t.soon ? <DV.Btn variant="primary" size="sm" icon="enter">Join</DV.Btn> : <DV.Btn variant="soft" size="sm">Details</DV.Btn>}
              </div>
            ))}
          </div>
        </window.SectionCard></window.Reveal>

        <window.Reveal i={5}><window.SectionCard title="Feedback due from you" icon="fileText" action="History">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {d.feedback.map((f, i) => (
              <div key={i} style={{ padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid", borderColor: f.overdue ? "color-mix(in oklab, var(--danger) 30%, var(--line))" : "var(--line)", background: f.overdue ? "var(--danger-tint)" : "var(--surface)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{f.n}</span>
                  <DV.Pill tone={f.overdue ? "var(--danger)" : "var(--ink-3)"} bg="transparent" icon="clock">{f.overdue ? "overdue" : f.when}</DV.Pill>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "2px 0 10px" }}>{f.role} · {f.type}</div>
                <DV.Btn variant={f.overdue ? "primary" : "soft"} size="sm" icon="fileText" style={{ width: "100%", justifyContent: "center" }}>Write scorecard</DV.Btn>
              </div>
            ))}
            <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: "var(--ink-3)" }}>You're all caught up after these. Nice work.</div>
          </div>
        </window.SectionCard></window.Reveal>
      </div>
    </div>
  );
}

Object.assign(window, { RecruiterDash, HMDash, InterviewerDash });
