/* screen-screenq.jsx, Screening queue with slide-over verdict panel (PASS/REVIEW/FAIL) */
const { useState: uSsq, useEffect: uEsq } = React;
const SQ = window.UI;

const RESULT = {
  pass:   { code: "PASS",   kind: "pass",   tone: "var(--ok)",     bg: "var(--ok-tint)",     rec: "Advance",      conf: 0.88, band: "Strong match" },
  review: { code: "REVIEW", kind: "review", tone: "var(--warn)",   bg: "var(--warn-tint)",   rec: "Human review", conf: 0.61, band: "Strong potential" },
  fail:   { code: "FAIL",   kind: "fail",   tone: "var(--danger)", bg: "var(--danger-tint)", rec: "Reject",       conf: 0.46, band: "Below the bar" },
};
const sqResults = () => window.CANDIDATES.filter(c => c.st !== "pending").map(c => {
  const r = RESULT[c.st];
  return { ...c, result: r.code, kind: r.kind, conf: c.id === "c1" ? 0.61 : r.conf, rec: r.rec, band: r.band, status: ["c7", "c4"].includes(c.id) ? "approved" : "pending" };
});

function ResultBadge({ kind }) {
  const r = Object.values(RESULT).find(x => x.kind === kind);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 700, color: r.tone, background: r.bg }}>
    <Icon name={kind === "pass" ? "check" : kind === "review" ? "eye" : "x"} size={12} stroke={2.4} />{r.code}</span>;
}

/* slide-over verdict */
function VerdictPanel({ row, onClose, onDecide }) {
  const s = window.SCREENING;
  const [trace, setTrace] = uSsq(false);
  const r = RESULT[row.kind];
  uEsq(() => { const h = e => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, []);
  return (
    <div onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end", background: "color-mix(in oklab, var(--bg-deep) 45%, transparent)", animation: "fadein .2s" }}>
      <div style={{ width: "min(580px, 94vw)", height: "100%", background: "var(--surface)", borderLeft: "1px solid var(--line)", boxShadow: "var(--e3)", display: "flex", flexDirection: "column", animation: "slidein .3s var(--ease-out)" }}>
        {/* header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", fontWeight: 700, fontSize: 14 }}>{row.ini}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)", letterSpacing: "-0.01em" }}>{row.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{row.role} · <span className="mono">{row.reqId}</span></div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {/* verdict hero */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "linear-gradient(120deg, var(--ai-tint), transparent 70%)", padding: 18 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <SQ.Pill icon="sparkles" tone="var(--on-ai)" bg="var(--ai)">AI · advisory</SQ.Pill>
              <SQ.Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">candidate-screener</SQ.Pill>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <SQ.ScoreRing value={row.score} size={78} band={r.tone} label="match %" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}><span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{row.band}</span><ResultBadge kind={row.kind} /></div>
                <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Recommends <b style={{ color: "var(--ink)" }}>{r.rec.toLowerCase()}</b>, not final.</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}><SQ.Confidence value={row.conf} /></div>
          </div>

          {/* requirements */}
          <div style={{ marginTop: 16 }}>
            <div style={{ ...SQ.fStyles.label, marginBottom: 8 }}>Requirement breakdown</div>
            <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", overflow: "hidden" }}>
              {s.requirements.map((req, i) => (
                <div key={req.id} style={{ padding: "11px 14px", borderTop: i ? "1px solid var(--line)" : "none", background: "var(--surface)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 60px", gap: 10, alignItems: "center" }}>
                    <Icon name={req.state === "pass" ? "check" : req.state === "review" ? "eye" : "x"} size={15} stroke={2.3} style={{ color: req.state === "pass" ? "var(--ok)" : req.state === "review" ? "var(--warn)" : "var(--danger)" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>{req.label}{req.custom && <SQ.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9 }}>custom</SQ.Pill>}</span>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textAlign: "right" }}>{req.weight}%·{req.sub}</span>
                  </div>
                  <div style={{ marginLeft: 30, marginTop: 5, fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.45, fontStyle: "italic" }}>↳ {req.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* trace toggle */}
          <button onClick={() => setTrace(t => !t)} style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--ai-tint)", cursor: "pointer", color: "var(--ai-ink)", fontWeight: 600, fontSize: 12.5 }}>
            <Icon name="cpu" size={15} /> Reasoning trace <Icon name="chevD" size={15} style={{ marginLeft: "auto", transform: trace ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
          </button>
          {trace && (
            <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: "var(--r)", border: "1px solid var(--line)", animation: "rise .25s var(--ease-out)" }}>
              {window.TRACE.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "6px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <Icon name={st.status === "review" ? "eye" : st.status === "fail" ? "x" : "check"} size={13} style={{ color: st.status === "review" ? "var(--warn)" : st.status === "fail" ? "var(--danger)" : "var(--ai)" }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{st.t}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--ai-ink)", marginLeft: "auto" }}>{st.tool}()</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* decision bar */}
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="users" size={12} /> AI is advisory, your decision is recorded as the deciding action.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <SQ.Btn variant="soft" icon="flag" onClick={() => onDecide(row.id, "review")} style={{ flex: 1, justifyContent: "center" }}>Request review</SQ.Btn>
            <SQ.Btn variant="danger" icon="x" onClick={() => onDecide(row.id, "decline")} style={{ flex: 1, justifyContent: "center" }}>Decline</SQ.Btn>
            <SQ.Btn variant="primary" icon="check" onClick={() => onDecide(row.id, "advance")} style={{ flex: 1.3, justifyContent: "center" }}>Advance</SQ.Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreeningQueueScreen() {
  const [rows] = uSsq(sqResults());
  const [filter, setFilter] = uSsq("all");
  const [open, setOpen] = uSsq(null);
  const [sel, setSel] = uSsq(new Set());
  const [decided, setDecided] = uSsq({});
  const filtered = rows.filter(r => filter === "all" || r.kind === filter);
  const counts = { all: rows.length, pass: rows.filter(r => r.kind === "pass").length, review: rows.filter(r => r.kind === "review").length, fail: rows.filter(r => r.kind === "fail").length };
  const decide = (id, d) => { setDecided(x => ({ ...x, [id]: d })); setOpen(null); };
  const toggle = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };
  const cols = "30px 1.6fr 0.9fr 80px 100px 130px 110px 90px";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Screening queue</h1>
              <SQ.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">candidate-screener</SQ.Pill>
            </div>
            <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>AI assessments awaiting a human decision · {counts.review} need review before they can advance.</p>
          </div>
          <SQ.Btn variant="soft" icon="arrowUpRight">Export</SQ.Btn>
        </div>
        {/* result filters */}
        <div style={{ display: "flex", gap: 8, margin: "16px 0 12px", flexWrap: "wrap" }}>
          {[["all", "All", "users"], ["pass", "PASS", "check"], ["review", "REVIEW", "eye"], ["fail", "FAIL", "x"]].map(([k, l, ic]) => {
            const active = filter === k; const r = k !== "all" ? RESULT[k] : null;
            return (
              <button key={k} onClick={() => setFilter(k)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "7px 13px", borderRadius: "var(--r-pill)", cursor: "pointer",
                border: "1px solid", borderColor: active ? "transparent" : "var(--line-2)", background: active ? (r ? r.bg : "var(--brand-tint)") : "var(--surface)", color: active ? (r ? r.tone : "var(--brand-ink)") : "var(--ink-2)", fontSize: 12.5, fontWeight: 700 }}>
                <Icon name={ic} size={14} />{l}<span className="mono" style={{ opacity: .7, fontWeight: 600 }}>{counts[k]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: "0 28px 20px" }}>
        <div style={{ height: "100%", overflowY: "auto", borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", position: "sticky", top: 0, zIndex: 2, fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", alignItems: "center" }}>
            <span></span><span>Candidate</span><span>Requisition</span><span>Score</span><span>Result</span><span>Confidence</span><span>Recommended</span><span style={{ textAlign: "right" }}>Status</span>
          </div>
          {filtered.map((row, i) => {
            const r = RESULT[row.kind], on = sel.has(row.id), dec = decided[row.id];
            return (
              <div key={row.id} onClick={() => setOpen(row)} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "11px 16px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer", background: on ? "var(--brand-tint)" : "transparent", transition: "background var(--t-fast)" }}
                onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                <button onClick={e => { e.stopPropagation(); toggle(row.id); }} style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid", borderColor: on ? "var(--brand)" : "var(--line-strong)", background: on ? "var(--brand)" : "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>{on && <Icon name="check" size={12} stroke={3} style={{ color: "var(--on-brand)" }} />}</button>
                <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                  <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white" }}>{row.ini}</span>
                  <div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{row.role}</div></div>
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{row.reqId}</span>
                <span className="mono tnum" style={{ fontSize: 16, fontWeight: 700, color: "var(--ai-ink)" }}>{row.score}</span>
                <ResultBadge kind={row.kind} />
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden", maxWidth: 64, position: "relative" }}>
                    <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 1, background: "var(--line-strong)" }} />
                    <div style={{ height: "100%", width: (row.conf*100)+"%", background: row.conf < 0.7 ? "var(--warn)" : "var(--ai)" }} />
                  </div>
                  <span className="mono" style={{ fontSize: 10.5, color: row.conf < 0.7 ? "var(--warn)" : "var(--ink-3)" }}>{row.conf.toFixed(2)}</span>
                </div>
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: row.kind === "fail" ? "var(--danger)" : row.kind === "review" ? "var(--warn)" : "var(--ink-2)" }}>
                  <Icon name={r.rec === "Advance" ? "check" : r.rec === "Reject" ? "x" : "eye"} size={13} />{r.rec}</span>
                <span style={{ textAlign: "right" }}>
                  {dec ? <SQ.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)" style={{ fontSize: 10 }}>{dec === "advance" ? "Advanced" : dec === "decline" ? "Declined" : "In review"}</SQ.Pill>
                    : row.status === "approved" ? <SQ.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">approved</SQ.Pill>
                    : <SQ.Pill tone="var(--ink-3)" bg="var(--surface-2)">pending</SQ.Pill>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {sel.size > 0 && (
        <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40 }}>
          <div className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px 9px 16px", borderRadius: "var(--r-pill)", boxShadow: "var(--e3)" }}>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{sel.size} selected</span>
            <div style={{ width: 1, height: 20, background: "var(--line)" }} />
            <SQ.Btn variant="primary" size="sm" icon="check">Advance passing</SQ.Btn>
            <SQ.Btn variant="soft" size="sm" icon="flag">Send to review</SQ.Btn>
            <button onClick={() => setSel(new Set())} style={{ width: 26, height: 26, borderRadius: 99, border: "none", background: "var(--surface-2)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
          </div>
        </div>
      )}

      {open && <VerdictPanel row={open} onClose={() => setOpen(null)} onDecide={decide} />}
    </div>
  );
}
window.ScreeningQueueScreen = ScreeningQueueScreen;
