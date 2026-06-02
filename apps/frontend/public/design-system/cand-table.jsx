/* cand-table.jsx, dense high-volume triage table */
const CT = window.UI;
const ctStIcon = (s) => s === "pass" ? "check" : s === "review" ? "eye" : s === "fail" ? "x" : "clock";
const ctStCol = (s) => s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : s === "fail" ? "var(--danger)" : "var(--ink-3)";

function MatchBar({ match }) {
  if (match === ", ") return <span style={{ color: "var(--ink-3)", fontSize: 11 }} className="mono">, </span>;
  const [n, d] = match.split("/").map(Number);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: d }).map((_, i) => <span key={i} style={{ width: 12, height: 5, borderRadius: 2, background: i < n ? (n >= d ? "var(--ok)" : n >= d/2 ? "var(--warn)" : "var(--danger)") : "var(--surface-3)" }} />)}
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{match}</span>
    </div>
  );
}

function StageBadge({ stage }) {
  const s = window.CAND_STAGES.find(x => x.id === stage);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
    <span style={{ width: 7, height: 7, borderRadius: 99, background: s.color }} />{s.label}</span>;
}

function CandTable({ cands, sel, setSel, onOpen, blind, dense }) {
  const allSel = cands.length > 0 && cands.every(c => sel.has(c.id));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(cands.map(c => c.id)));
  const toggle = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };
  const pad = dense ? "7px 14px" : "11px 14px";
  const cols = "30px 1.7fr 1fr 110px 1fr 130px 0.9fr 70px";

  const Check = ({ on, onClick }) => (
    <button onClick={e => { e.stopPropagation(); onClick(); }} style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid", borderColor: on ? "var(--brand)" : "var(--line-strong)", background: on ? "var(--brand)" : "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
      {on && <Icon name="check" size={12} stroke={3} style={{ color: "var(--on-brand)" }} />}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", position: "sticky", top: 0, zIndex: 2, fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", alignItems: "center" }}>
          <Check on={allSel} onClick={toggleAll} />
          <span>Candidate</span><span>Requisition</span><span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="sparkles" size={11} style={{ color: "var(--ai)" }} />AI score</span><span>Stage</span><span>Requirement match</span><span>Source</span><span style={{ textAlign: "right" }}>Age</span>
        </div>
        {cands.map((c, i) => {
          const on = sel.has(c.id);
          return (
            <div key={c.id} onClick={() => onOpen(c.id)} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: pad, alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer", background: on ? "var(--brand-tint)" : "transparent", transition: "background var(--t-fast)" }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={e => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <Check on={on} onClick={() => toggle(c.id)} />
              <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11,
                  background: blind ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand), var(--ai))", color: blind ? "var(--ink-3)" : "white" }}>{blind ? "•" : c.ini}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", gap: 6, alignItems: "center" }}>
                    {blind ? "Candidate " + c.id.toUpperCase() : c.name}{c.you && <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--brand)" }} />}
                  </div>
                  {!dense && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.role}{blind ? "" : " · " + c.loc}</div>}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{c.reqId}</span>
              <div>
                {c.st !== "pending"
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: "var(--ai-ink)" }}>{c.score}</span>
                      <Icon name={ctStIcon(c.st)} size={13} stroke={2.3} style={{ color: ctStCol(c.st) }} />
                    </span>
                  : <CT.Pill icon="clock" tone="var(--ink-3)" bg="var(--surface-2)">queued</CT.Pill>}
              </div>
              <StageBadge stage={c.stage} />
              <MatchBar match={c.match} />
              <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{c.source}</span>
              <span className="mono" style={{ fontSize: 11.5, textAlign: "right", color: c.days >= 6 ? "var(--danger)" : "var(--ink-3)", fontWeight: c.days >= 6 ? 600 : 400 }}>{c.days === 0 ? "new" : c.days + "d"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
window.CandTable = CandTable;
