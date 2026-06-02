/* req-list.jsx, Requisitions list (DataTable + FilterBar) */
const { useState: uSl } = React;
const RL = window.UI;

function StatusChip({ s }) {
  const m = window.REQ_STATUS[s];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
    <Icon name={m.icon} size={12} stroke={2.4} />{m.label}</span>;
}

function ReqListScreen({ onCreate, onOpen }) {
  const [q, setQ] = uSl("");
  const [status, setStatus] = uSl("All");
  const [dept, setDept] = uSl("All");
  const [dense, setDense] = uSl(false);
  const rows = window.REQ_LIST.filter(r =>
    (!q || (r.title + r.id + r.rec).toLowerCase().includes(q.toLowerCase())) &&
    (status === "All" || r.status === status) &&
    (dept === "All" || r.dept === dept));
  const depts = ["All", ...Array.from(new Set(window.REQ_LIST.map(r => r.dept)))];
  const statuses = ["All", "OPEN", "DRAFT", "ON_HOLD", "FILLED", "CLOSED", "CANCELLED"];
  const pad = dense ? "8px 16px" : "13px 16px";
  const sel = (val, set, opts, render) => (
    <select value={val} onChange={e => set(e.target.value)} style={{ padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
      {opts.map(o => <option key={o} value={o}>{render ? render(o) : o}</option>)}
    </select>
  );

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Requisitions</h1>
            <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{window.REQ_LIST.filter(r => r.status === "OPEN").length} open · {window.REQ_LIST.length} total across Northwind Talent.</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <RL.Btn variant="soft" icon="arrowUpRight">Export</RL.Btn>
            <RL.Btn variant="primary" icon="plus" onClick={onCreate}>Create requisition</RL.Btn>
          </div>
        </div>

        {/* filter bar */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 12px", height: 38, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", flex: "1 1 240px", maxWidth: 320 }}>
            <Icon name="search" size={16} style={{ color: "var(--ink-3)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search title, ID, recruiter…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
          </div>
          {sel(status, setStatus, statuses, o => o === "All" ? "All statuses" : window.REQ_STATUS[o].label)}
          {sel(dept, setDept, depts, o => o === "All" ? "All departments" : o)}
          <div style={{ flex: 1 }} />
          <button onClick={() => setDense(d => !d)} title="Density" style={{ display: "inline-flex", gap: 6, alignItems: "center", height: 38, padding: "0 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: dense ? "var(--surface-2)" : "var(--surface)", color: "var(--ink-2)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
            <Icon name="listChecks" size={15} />{dense ? "Comfortable" : "Compact"}
          </button>
        </div>

        {/* table */}
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1.1fr 90px 80px 130px 90px", gap: 12, padding: "11px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            <span>Requisition</span><span>Status</span><span>Salary range</span><span style={{ textAlign: "center" }}>Cands</span><span style={{ textAlign: "center" }}>Heads</span><span>Recruiter</span><span style={{ textAlign: "right" }}>Created</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.id} onClick={() => onOpen(r.id)} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1.1fr 90px 80px 130px 90px", gap: 12, padding: pad, alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", cursor: "pointer", transition: "background var(--t-fast)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</span>
                  {r.pri === "High" && <span title="High priority" style={{ width: 6, height: 6, borderRadius: 99, background: "var(--danger)", flexShrink: 0 }} />}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.id} · {r.dept} · {r.loc}</div>
              </div>
              <StatusChip s={r.status} />
              <span className="mono tnum" style={{ fontSize: 12.5, color: r.min ? "var(--ink)" : "var(--warn)" }}>{r.min ? `$${r.min/1000}k to $${r.max/1000}k` : ", not set"}</span>
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>{r.cands || ", "}</span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: "center", color: "var(--ink-2)" }}>{r.head}</span>
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center", minWidth: 0 }}>
                <span className="mono" style={{ width: 24, height: 24, borderRadius: 99, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--ink-2)", flexShrink: 0 }}>{r.recI}</span>
                <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink-2)" }}>{r.rec}</span>
              </span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", textAlign: "right" }}>{r.created}</span>
            </div>
          ))}
          {rows.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>No requisitions match your filters.</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12.5, color: "var(--ink-3)" }}>
          <span>Showing {rows.length} of {window.REQ_LIST.length}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ padding: "6px 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-3)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)" }}>Previous</button>
            <button style={{ padding: "6px 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ReqListScreen = ReqListScreen;
