/* cand-board.jsx, Candidates kanban board (draggable, AI badges, aging) */
const { useState: uSboard } = React;
const CB = window.UI;

const stIcon = (s) => s === "pass" ? "check" : s === "review" ? "eye" : s === "fail" ? "x" : "clock";
const stCol = (s) => s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : s === "fail" ? "var(--danger)" : "var(--ink-3)";
function aging(days) {
  if (days >= 6) return { tone: "var(--danger)", bg: "var(--danger-tint)", label: days + "d", warn: true };
  if (days >= 3) return { tone: "var(--warn)", bg: "var(--warn-tint)", label: days + "d" };
  return { tone: "var(--ink-3)", bg: "transparent", label: days === 0 ? "new" : days + "d" };
}

function CandCard({ c, onOpen, blind, onDragStart, dragging }) {
  const age = aging(c.days);
  return (
    <div draggable onDragStart={e => onDragStart(e, c.id)} onClick={() => onOpen(c.id)}
      style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: 13, boxShadow: "var(--e1)", cursor: "grab",
        opacity: dragging ? 0.4 : 1, transition: "box-shadow var(--t), transform var(--t-fast)", position: "relative" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--e2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className="mono" style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12,
          background: blind ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand), var(--ai))", color: blind ? "var(--ink-3)" : "white" }}>{blind ? "•" : c.ini}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{blind ? "Candidate " + c.id.toUpperCase() : c.name}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.role}</div>
        </div>
        {c.you && <span title="Assigned to you" style={{ width: 6, height: 6, borderRadius: 99, background: "var(--brand)", flexShrink: 0 }} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
        {c.st !== "pending" ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: "var(--r-pill)", fontSize: 11, fontWeight: 700,
            color: "var(--ai-ink)", background: "var(--ai-tint)" }}>
            <Icon name="sparkles" size={11} /><span className="mono">{c.score}</span>
            <Icon name={stIcon(c.st)} size={11} style={{ color: stCol(c.st) }} />
          </span>
        ) : <CB.Pill icon="clock" tone="var(--ink-3)" bg="var(--surface-2)">awaiting AI</CB.Pill>}
        {c.match !== ", " && <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{c.match} req</span>}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600, color: age.tone, background: age.bg, padding: "2px 7px", borderRadius: 99 }}>
          {age.warn && <Icon name="clock" size={10} />}{age.label}
        </span>
      </div>
    </div>
  );
}

function Board({ cands, onMove, onOpen, blind }) {
  const [dragId, setDragId] = uSboard(null);
  const [overCol, setOverCol] = uSboard(null);
  const onDragStart = (e, id) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDrop = (stage) => { if (dragId) onMove(dragId, stage); setDragId(null); setOverCol(null); };

  return (
    <div style={{ display: "flex", gap: 14, height: "100%", minHeight: 0, overflowX: "auto", padding: "2px 2px 8px" }}>
      {window.CAND_STAGES.map(stage => {
        const list = cands.filter(c => c.stage === stage.id);
        const over = overCol === stage.id;
        return (
          <div key={stage.id} onDragOver={e => { e.preventDefault(); setOverCol(stage.id); }} onDragLeave={() => setOverCol(o => o === stage.id ? null : o)} onDrop={() => onDrop(stage.id)}
            style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0, borderRadius: "var(--r-xl)",
              background: over ? "var(--brand-tint)" : "var(--surface-2)", border: "1px solid", borderColor: over ? "var(--brand)" : "var(--line)", transition: "background var(--t), border-color var(--t)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", position: "sticky", top: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: stage.color }} />
              <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{stage.label}</span>
              {stage.ai && <Icon name="sparkles" size={12} style={{ color: "var(--ai)" }} />}
              <span className="mono tnum" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--ink-3)", background: "var(--surface)", padding: "1px 8px", borderRadius: 99 }}>{list.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "2px 10px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
              {list.map(c => <CandCard key={c.id} c={c} onOpen={onOpen} blind={blind} onDragStart={onDragStart} dragging={dragId === c.id} />)}
              {list.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "var(--ink-3)", border: "1.5px dashed var(--line-2)", borderRadius: "var(--r-lg)" }}>Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
window.CandBoard = Board;
