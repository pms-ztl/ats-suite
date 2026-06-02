/* cand-screen.jsx, Candidates controller: board⇄table switch, profile, import, sourcing */
const { useState: uScs } = React;
const CS = window.UI;

const VIEW_FILTERS = {
  v1: () => true,
  v2: (c) => c.you,
  v3: (c) => c.stage === "applied" || (c.stage === "screening" && c.st === "review"),
  v4: (c) => c.stage === "interview",
  v5: (c) => c.score >= 85,
  v6: (c) => c.st === "review",
};

function BulkBar({ n, onClear }) {
  return (
    <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40, animation: "rise .25s var(--ease-out)" }}>
      <div className="glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px 9px 16px", borderRadius: "var(--r-pill)", boxShadow: "var(--e3)" }}>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{n} selected</span>
        <div style={{ width: 1, height: 22, background: "var(--line)" }} />
        {[["check", "Advance"], ["calendar", "Schedule"], ["sparkles", "Re-screen"], ["arrowUpRight", "Export"]].map(([ic, l]) => (
          <button key={l} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "none", background: "transparent", color: l === "Re-screen" ? "var(--ai-ink)" : "var(--ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Icon name={ic} size={14} />{l}</button>
        ))}
        <button style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "none", background: "var(--danger-tint)", color: "var(--danger)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}><Icon name="x" size={14} />Reject</button>
        <button onClick={onClear} style={{ width: 28, height: 28, borderRadius: 99, border: "none", background: "var(--surface-2)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={15} /></button>
      </div>
    </div>
  );
}

function CandidatesScreen() {
  const [cands, setCands] = uScs(window.CANDIDATES.map(c => ({ ...c })));
  const [view, setView] = uScs("board");
  const [route, setRoute] = uScs("list"); // list | profile | import | sourcing
  const [savedView, setSavedView] = uScs("v1");
  const [q, setQ] = uScs("");
  const [source, setSource] = uScs("All sources");
  const [sel, setSel] = uScs(new Set());
  const [blind, setBlind] = uScs(false);
  const [dense, setDense] = uScs(true);
  const [pIdx, setPIdx] = uScs(0);

  const filtered = cands.filter(c =>
    VIEW_FILTERS[savedView](c) &&
    (!q || (c.name + c.role + c.reqId).toLowerCase().includes(q.toLowerCase())) &&
    (source === "All sources" || c.source === source));

  const move = (id, stage) => setCands(cs => cs.map(c => c.id === id ? { ...c, stage, days: 0 } : c));
  const openProfile = (id) => { const i = filtered.findIndex(c => c.id === id); setPIdx(i < 0 ? 0 : i); setRoute("profile"); };
  const navProfile = (dir) => setPIdx(i => (i + dir + filtered.length) % filtered.length);

  if (route === "import") return <window.ImportScreen onBack={() => setRoute("list")} />;
  if (route === "sourcing") return <window.SourcingScreen onBack={() => setRoute("list")} />;
  if (route === "profile") return <window.CandProfile cand={filtered[pIdx]} idx={pIdx} total={filtered.length} onNav={navProfile} onBack={() => setRoute("list")} blind={blind} setBlind={setBlind} onVerdict={() => {}} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
      {/* header */}
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Candidates</h1>
            <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>{filtered.length} candidates · {cands.filter(c => c.st === "review").length} flagged for human review</p>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <CS.Btn variant="soft" icon="users" onClick={() => setRoute("import")}>Import</CS.Btn>
            <CS.Btn variant="ai" icon="radar" onClick={() => setRoute("sourcing")}>Source with AI</CS.Btn>
            {/* view switch */}
            <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: "var(--r)", padding: 2, border: "1px solid var(--line)", marginLeft: 4 }}>
              {[["board", "Board", "grid"], ["table", "Table", "listChecks"]].map(([v, l, ic]) => (
                <button key={v} onClick={() => setView(v)} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "7px 13px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                  background: view === v ? "var(--surface)" : "transparent", color: view === v ? "var(--ink)" : "var(--ink-3)", boxShadow: view === v ? "var(--e1)" : "none", transition: "all var(--t-fast)" }}>
                  <Icon name={ic} size={14} />{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* saved views + filters */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "16px 0 14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, minWidth: 0 }}>
            {window.SAVED_VIEWS.map(v => (
              <button key={v.id} onClick={() => setSavedView(v.id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                border: "1px solid", borderColor: savedView === v.id ? "transparent" : "var(--line-2)", background: savedView === v.id ? "var(--brand-tint)" : "var(--surface)", color: savedView === v.id ? "var(--brand-ink)" : "var(--ink-2)", fontSize: 12.5, fontWeight: 600 }}>
                <Icon name={v.icon} size={14} style={{ color: v.ai && savedView !== v.id ? "var(--ai)" : undefined }} />{v.label}
                <span className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{v.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 11px", height: 34, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", width: 200 }}>
            <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
          </div>
          <select value={source} onChange={e => setSource(e.target.value)} style={{ height: 34, padding: "0 9px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
            {window.CAND_SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setBlind(b => !b)} title="Blind review" style={{ display: "inline-flex", gap: 6, alignItems: "center", height: 34, padding: "0 11px", borderRadius: "var(--r)", border: "1px solid", borderColor: blind ? "transparent" : "var(--line-2)", background: blind ? "var(--ai-tint)" : "var(--surface)", color: blind ? "var(--ai-ink)" : "var(--ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            <Icon name="eye" size={14} />Blind
          </button>
          {view === "table" && <button onClick={() => setDense(d => !d)} title="Density" style={{ width: 34, height: 34, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: dense ? "var(--surface-2)" : "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="listChecks" size={15} /></button>}
        </div>
      </div>

      {/* content */}
      <div key={view} style={{ flex: 1, minHeight: 0, padding: view === "board" ? "0 28px 16px" : "0 28px 20px", animation: "fadein .25s var(--ease-out)" }}>
        {view === "board"
          ? <window.CandBoard cands={filtered} onMove={move} onOpen={openProfile} blind={blind} />
          : <window.CandTable cands={filtered} sel={sel} setSel={setSel} onOpen={openProfile} blind={blind} dense={dense} />}
      </div>

      {view === "table" && sel.size > 0 && <BulkBar n={sel.size} onClear={() => setSel(new Set())} />}
    </div>
  );
}
window.CandidatesScreen = CandidatesScreen;
