/* cand-profile.jsx, candidate profile (/candidates/[id]): multi-zone, blind mode, prev/next */
const { useState: uSp2 } = React;
const CP = window.UI;
const pStCol = (s) => s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : "var(--danger)";
const pStIc = (s) => s === "pass" ? "check" : s === "review" ? "eye" : "x";

function Zone({ title, icon, ai, action, children, onAction }) {
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 700, fontSize: "var(--fs-md)" }}>
          <Icon name={icon} size={16} style={{ color: ai ? "var(--ai)" : "var(--ink-3)" }} />{title}
          {ai && <CP.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9.5 }}>AI</CP.Pill>}
        </div>
        {action && <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{action}<Icon name="chevR" size={13} /></button>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function RatingDots({ n }) {
  return <span style={{ display: "inline-flex", gap: 3 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--brand)" : "var(--surface-3)" }} />)}</span>;
}

function CandProfile({ cand, idx, total, onNav, onBack, blind, setBlind, onVerdict }) {
  const p = window.CAND_PROFILE, s = window.SCREENING, parsed = window.PARSED;
  const c = cand || p;
  const [noteText, setNoteText] = uSp2("");
  const [notes, setNotes] = uSp2(p.notes);
  const addNote = () => { if (!noteText.trim()) return; setNotes([{ who: "Avery Chen", ini: "AC", t: "now", text: noteText }, ...notes]); setNoteText(""); };
  const name = blind ? "Candidate " + (c.id || "C1").toUpperCase() : c.name;
  const stageLabel = (window.CAND_STAGES.find(x => x.id === c.stage) || {}).label || "Screening";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* top nav bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 26px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}><Icon name="chevsL" size={14} /> Candidates</button>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{idx + 1} of {total}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onNav(-1)} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={16} style={{ transform: "rotate(180deg)" }} /></button>
          <button onClick={() => onNav(1)} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={16} /></button>
        </div>
        <div style={{ width: 1, height: 22, background: "var(--line)" }} />
        <button onClick={() => setBlind(b => !b)} title="Hide identity to reduce bias" style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: blind ? "transparent" : "var(--line-2)", background: blind ? "var(--ai-tint)" : "var(--surface)", color: blind ? "var(--ai-ink)" : "var(--ink-2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 26, height: 15, borderRadius: 99, background: blind ? "var(--ai)" : "var(--line-strong)", position: "relative", transition: "background var(--t)" }}>
            <span style={{ position: "absolute", top: 2, left: blind ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
          </span><Icon name="eye" size={14} /> Blind review
        </button>
      </div>

      {blind && (
        <div style={{ padding: "8px 26px", background: "var(--ai-tint)", borderBottom: "1px solid color-mix(in oklab, var(--ai) 18%, transparent)", fontSize: 12, color: "var(--ai-ink)", display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
          <Icon name="shield" size={14} /> Blind review on, name, photo, location, and contact are hidden so you assess skills, not identity.
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px 50px" }}>
        {/* identity header */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
          <span className="mono" style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 20,
            background: blind ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand), var(--ai))", color: blind ? "var(--ink-3)" : "white" }}>{blind ? "•" : c.ini}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{name}</h1>
              <CP.Pill mono>{c.reqId}</CP.Pill>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--info)" }} />{stageLabel}</span>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 3 }}>{c.role}{blind ? "" : ` · ${c.loc} · ${c.source} · applied ${p.applied}`}</div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <CP.Btn variant="soft" icon="calendar">Schedule</CP.Btn>
            <CP.Btn variant="soft" icon="fileText">Add note</CP.Btn>
            <CP.Btn variant="primary" icon="check">Advance</CP.Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 18, alignItems: "start" }}>
          {/* main zones */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* screening verdict */}
            <Zone title="AI screening verdict" icon="scan" ai action="Open full verdict" onAction={onVerdict}>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <CP.ScoreRing value={s.score} size={84} band="var(--ai)" label="match %" />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{s.band}</span><CP.StatusBadge kind="review" />
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>Recommends <b style={{ color: "var(--ink)" }}>human review</b>, strong systems signal, uncertain on fintech domain & leadership.</p>
                </div>
                <div style={{ width: 200 }}><CP.Confidence value={s.confidence} /></div>
              </div>
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {s.requirements.map(r => (
                  <div key={r.id} style={{ display: "grid", gridTemplateColumns: "20px 1fr 70px", gap: 10, alignItems: "center", padding: "7px 0", borderTop: "1px solid var(--line)" }}>
                    <Icon name={pStIc(r.state)} size={14} stroke={2.3} style={{ color: pStCol(r.state) }} />
                    <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>{r.label}{r.custom && <CP.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9 }}>custom</CP.Pill>}</span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", textAlign: "right" }}>{r.weight}% · {r.sub}</span>
                  </div>
                ))}
              </div>
            </Zone>

            {/* scorecards */}
            <Zone title="Interview scorecards" icon="fileText" action="All feedback">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {p.scorecards.map((sc, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", padding: 14, background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                        <span className="mono" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--ink-2)" }}>{sc.who.split(" ").map(w => w[0]).join("")}</span>
                        <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{blind ? "Interviewer " + (i+1) : sc.who}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{sc.role}</div></div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{sc.overall}</span>
                        <CP.Pill tone={sc.recTone === "ok" ? "var(--ok)" : "var(--warn)"} bg={sc.recTone === "ok" ? "var(--ok-tint)" : "var(--warn-tint)"}>{sc.rec}</CP.Pill>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                      {sc.dims.map(d => <div key={d.d} style={{ display: "flex", gap: 7, alignItems: "center" }}><span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{d.d}</span><RatingDots n={d.s} /></div>)}
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45, fontStyle: "italic" }}>“{sc.note}”</p>
                  </div>
                ))}
              </div>
            </Zone>

            {/* parsed résumé compact */}
            <Zone title="Parsed résumé" icon="fileText" ai action="View source">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ ...CP.fStyles.label, marginBottom: 8 }}>Fields</div>
                  {parsed.fields.slice(0, 5).map(f => (
                    <div key={f.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0", borderTop: "1px solid var(--line)", fontSize: 12 }}>
                      <span style={{ color: "var(--ink-3)" }}>{f.k}</span>
                      <span style={{ fontWeight: 600, display: "inline-flex", gap: 5, alignItems: "center" }}>{f.c < 0.7 && <Icon name="flag" size={11} style={{ color: "var(--warn)" }} />}{blind && (f.k === "Full name" || f.k === "Email" || f.k === "Phone" || f.k === "Location") ? "hidden" : f.v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ ...CP.fStyles.label, marginBottom: 8 }}>Skills · confidence</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {parsed.skills.map(sk => <span key={sk.n} style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "3px 8px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: sk.c < 0.7 ? "var(--warn-tint)" : "var(--surface-2)", color: sk.c < 0.7 ? "var(--warn)" : "var(--ink)", border: "1px solid var(--line)" }}>{sk.c < 0.7 && <Icon name="flag" size={10} />}{sk.n}</span>)}
                  </div>
                  <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: "var(--r)", background: "var(--warn-tint)", fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
                    <b style={{ color: "var(--warn)" }}>Honesty flag:</b> “Rust expert”, evidence suggests proficient, not expert.
                  </div>
                </div>
              </div>
            </Zone>

            {/* activity */}
            <Zone title="Activity" icon="bolt">
              <window.Timeline items={p.activity} />
            </Zone>
          </div>

          {/* right rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {!blind && (
              <Zone title="Snapshot" icon="users">
                {[["Stage", stageLabel], ["Requisition", c.reqId], ["Source", c.source], ["Applied", p.applied], ["Email", p.email], ["Phone", p.phone]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderTop: "1px solid var(--line)", fontSize: 12.5 }}>
                    <span style={{ color: "var(--ink-3)" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </Zone>
            )}
            <Zone title="Notes" icon="fileText">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} placeholder="Add a private team note…" style={{ width: "100%", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none" }} />
                <CP.Btn variant="primary" size="sm" icon="plus" onClick={addNote} style={{ alignSelf: "flex-end" }}>Add note</CP.Btn>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {notes.map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 10 }}>
                    <span className="mono" style={{ width: 26, height: 26, borderRadius: 99, flexShrink: 0, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, color: "var(--ink-2)" }}>{n.ini}</span>
                    <div><div style={{ fontSize: 12, marginBottom: 2 }}><b>{n.who}</b> <span className="mono" style={{ color: "var(--ink-3)", fontSize: 10.5 }}>· {n.t}</span></div><p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{n.text}</p></div>
                  </div>
                ))}
              </div>
            </Zone>
            {/* AI next steps, fills the right rail + adds value */}
            <Zone title="Suggested next steps" icon="sparkles" ai>
              <svg viewBox="0 0 240 96" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
                <defs><linearGradient id="cpNs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--ai)" /><stop offset="1" stopColor="var(--brand)" /></linearGradient></defs>
                <path d="M16 72 H224" stroke="var(--line)" strokeWidth="1.5" />
                {[40, 96, 152, 208].map((x, i) => (
                  <g key={i}>
                    <line x1={x} y1="72" x2={i < 3 ? x + 56 : x} y2="72" stroke={i < 2 ? "url(#cpNs)" : "var(--line-2)"} strokeWidth="2.5" />
                    <circle cx={x} cy="72" r={i === 1 ? 8 : 6} fill={i < 2 ? "url(#cpNs)" : "var(--surface)"} stroke={i < 2 ? "none" : "var(--line-2)"} strokeWidth="2" />
                    {i === 1 && <circle cx={x} cy="72" r="13" fill="none" stroke="var(--ai)" strokeWidth="1.5" opacity="0.4" />}
                  </g>
                ))}
                <text x="40" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink-3)">SCREENED</text>
                <text x="96" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ai-ink)">YOU&#39;RE HERE</text>
                <text x="152" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink-3)">INTERVIEW</text>
                <text x="208" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ink-3)">DECIDE</text>
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[["calendar", "Schedule the technical loop", "All 3 panelists free Tue 2pm"], ["fileText", "Request a Rust work sample", "Resolves the honesty flag"], ["users", "Loop in the hiring manager", "Strong systems signal to confirm"]].map(([ic, t, d]) => (
                  <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)" }}><Icon name={ic} size={14} /></span>
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{d}</div></div>
                  </div>
                ))}
              </div>
              <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> AI-suggested · you decide what happens next.</p>
            </Zone>
          </div>
        </div>
      </div>
    </div>
  );
}
window.CandProfile = CandProfile;
