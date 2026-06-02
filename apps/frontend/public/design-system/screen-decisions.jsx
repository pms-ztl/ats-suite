/* screen-decisions.jsx, Decisions queue (human-approval-gated; AI advisory) */
const { useState: uSdec } = React;
const DC = window.UI;

const DEC_STATUS = {
  pending:  { label: "Pending approval", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  approved: { label: "Approved",         tone: "var(--brand)", bg: "var(--brand-tint)", icon: "check" },
  sent:     { label: "Offer sent",       tone: "var(--info)", bg: "var(--info-tint)", icon: "arrowUpRight" },
  accepted: { label: "Accepted",         tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  declined: { label: "Declined",         tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
};
const AI_REC = {
  hire:   { label: "Hire", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  reject: { label: "Reject", tone: "var(--danger)", bg: "var(--danger-tint)", icon: "x" },
  hold:   { label: "Hold", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "eye" },
};
const DECISIONS = [
  { id: "d1", name: "Sofia Karim", ini: "SK", role: "Platform Engineer", reqId: "REQ-4799", aiRec: "hire", aiConf: 0.9, screenScore: 86, interviewAvg: 4.3, status: "pending", by: "Jordan Lee", when: "2h", rationale: "Four interviewers aligned on a strong hire; consistently above bar on systems design and ownership. Comp within band." },
  { id: "d2", name: "Marcus Bell", ini: "MB", role: "Staff Product Designer", reqId: "REQ-4810", aiRec: "reject", aiConf: 0.58, screenScore: 41, interviewAvg: 2.6, status: "pending", by: ", ", when: "4h", rationale: "Portfolio depth below the role bar across two panels, but the model's confidence is low; portfolio signal may be underweighted.", lowConf: true },
  { id: "d3", name: "Dana Osei", ini: "DO", role: "Platform Engineer", reqId: "REQ-4799", aiRec: "hire", aiConf: 0.88, screenScore: 84, interviewAvg: 4.1, status: "approved", by: "Jordan Lee", when: "1d", rationale: "Strong technical loop; recommend advancing to offer at midpoint." },
  { id: "d4", name: "Ivy Chen", ini: "IC", role: "Staff Product Designer", reqId: "REQ-4810", aiRec: "hire", aiConf: 0.92, screenScore: 88, interviewAvg: 4.5, status: "sent", by: "Avery Chen", when: "2d", rationale: "Exceptional portfolio and panel feedback. Offer sent at 75th percentile." },
  { id: "d5", name: "Noah Frye", ini: "NF", role: "Data Engineer", reqId: "REQ-4771", aiRec: "hold", aiConf: 0.71, screenScore: 79, interviewAvg: 3.4, status: "pending", by: ", ", when: "5h", rationale: "Solid but not differentiated; suggest holding for the stronger pipeline or adding a final panel." },
  { id: "d6", name: "Sam Okafor", ini: "SO", role: "Security Engineer", reqId: "REQ-4725", aiRec: "hire", aiConf: 0.94, screenScore: 91, interviewAvg: 4.6, status: "accepted", by: "Jordan Lee", when: "3d", rationale: "Top of pipeline; offer accepted." },
];

function StatusFlow({ status }) {
  const order = ["pending", "approved", "sent", "accepted"];
  const idx = status === "declined" ? -1 : order.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {order.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 11, background: i <= idx ? "var(--brand)" : "var(--surface-2)", color: i <= idx ? "var(--on-brand)" : "var(--ink-3)", border: i <= idx ? "none" : "1px solid var(--line)" }}>{i <= idx ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: i <= idx ? "var(--ink)" : "var(--ink-3)", textTransform: "capitalize" }}>{s}</span>
          </div>
          {i < order.length - 1 && <div style={{ height: 2, flex: 1, background: i < idx ? "var(--brand)" : "var(--line)", marginBottom: 16 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function DecisionsScreen() {
  const [items, setItems] = uSdec(DECISIONS.map(d => ({ ...d })));
  const [selId, setSelId] = uSdec(DECISIONS[0].id);
  const [confirm, setConfirm] = uSdec(false);
  const [filter, setFilter] = uSdec("all");
  const cur = items.find(d => d.id === selId);
  const list = items.filter(d => filter === "all" || (filter === "pending" ? d.status === "pending" : d.status !== "pending"));
  const setStatus = (st) => { setItems(items.map(d => d.id === selId ? { ...d, status: st, by: "Avery Chen" } : d)); setConfirm(false); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", height: "100%", minHeight: 0 }}>
      {/* list */}
      <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
        <div style={{ padding: "18px 18px 12px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2, borderBottom: "1px solid var(--line)" }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Decisions</h1>
          <p style={{ margin: "4px 0 10px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.4 }}>{items.filter(d => d.status === "pending").length} awaiting your approval. The AI recommends, a human approves.</p>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all", "All"], ["pending", "Pending"], ["resolved", "Resolved"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: filter === k ? "transparent" : "var(--line-2)", background: filter === k ? "var(--brand-tint)" : "var(--surface)", color: filter === k ? "var(--brand-ink)" : "var(--ink-2)" }}>{l}</button>
            ))}
          </div>
        </div>
        {list.map(d => {
          const rec = AI_REC[d.aiRec], st = DEC_STATUS[d.status];
          return (
            <button key={d.id} onClick={() => { setSelId(d.id); setConfirm(false); }} style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--line)", cursor: "pointer", background: selId === d.id ? "var(--brand-tint)" : "transparent", position: "relative" }}
              onMouseEnter={e => { if (selId !== d.id) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={e => { if (selId !== d.id) e.currentTarget.style.background = "transparent"; }}>
              {selId === d.id && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--brand)", borderRadius: "0 3px 3px 0" }} />}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="mono" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white" }}>{d.ini}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.role}</div>
                </div>
                <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: st.tone, background: st.bg, padding: "2px 7px", borderRadius: 99 }}><Icon name={st.icon} size={10} />{st.label}</span>
              </div>
              <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 9 }}>
                <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: rec.tone, background: rec.bg, padding: "2px 7px 2px 6px", borderRadius: 99 }}><Icon name="sparkles" size={10} />AI: {rec.label}</span>
                <span className="mono" style={{ fontSize: 10, color: d.aiConf < 0.7 ? "var(--warn)" : "var(--ink-3)" }}>conf {d.aiConf.toFixed(2)}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginLeft: "auto" }}>{d.when} ago</span>
              </div>
            </button>
          );
        })}
      </aside>

      {/* detail */}
      <div style={{ overflowY: "auto", padding: "26px 30px 40px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <span className="mono" style={{ width: 48, height: 48, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", fontWeight: 700, fontSize: 16 }}>{cur.ini}</span>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{cur.name}</h2>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{cur.role} · <span className="mono">{cur.reqId}</span></div>
            </div>
          </div>

          {/* status flow */}
          <div style={{ padding: "18px 22px", borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", marginBottom: 18, boxShadow: "var(--e1)" }}>
            <StatusFlow status={cur.status} />
          </div>

          {/* AI recommendation, advisory */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 22%, var(--line))", background: "linear-gradient(120deg, var(--ai-tint), transparent 70%)", padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <DC.Pill icon="sparkles" tone="var(--on-ai)" bg="var(--ai)">AI recommendation · advisory</DC.Pill>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 13, fontWeight: 700, color: AI_REC[cur.aiRec].tone }}><Icon name={AI_REC[cur.aiRec].icon} size={15} />{AI_REC[cur.aiRec].label}</span>
                <DC.Pill mono tone={cur.aiConf < 0.7 ? "var(--warn)" : "var(--ai-ink)"} bg={cur.aiConf < 0.7 ? "var(--warn-tint)" : "var(--ai-tint)"}>conf {cur.aiConf.toFixed(2)}</DC.Pill>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>{cur.rationale}</p>
            <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
              {[["Screening score", cur.screenScore, "var(--ai-ink)"], ["Interview avg", cur.interviewAvg.toFixed(1) + " / 5", "var(--brand)"]].map(([l, v, c]) => (
                <div key={l} style={{ flex: 1, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>{l}</div>
                  <div className="mono tnum" style={{ fontSize: 19, fontWeight: 700, color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* human approval gate */}
          {cur.status === "pending" ? (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 4 }}>
                <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center" }}><Icon name="users" size={15} /></span>
                <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Your approval is required</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>The decision is yours, the AI cannot approve, send, or reject on its own.</div></div>
              </div>
              {cur.aiRec === "reject" && cur.lowConf && (
                <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--warn-tint)", border: "1px solid color-mix(in oklab, var(--warn) 28%, transparent)", fontSize: 12, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
                  <Icon name="flag" size={14} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} /><span><b style={{ color: "var(--ink)" }}>Resist rubber-stamping.</b> The model is only {Math.round(cur.aiConf*100)}% confident on a reject. Review the portfolio yourself before upholding it.</span>
                </div>
              )}
              {confirm ? (
                <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", background: "var(--danger-tint)", border: "1px solid color-mix(in oklab, var(--danger) 28%, transparent)" }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>Confirm: uphold the AI's reject for {cur.name}?</div>
                  <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--ink-2)" }}>You're recording a human rejection. This is final and logged to the audit trail with your name.</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <DC.Btn variant="ghost" onClick={() => setConfirm(false)}>Go back &amp; review</DC.Btn>
                    <DC.Btn variant="danger" icon="x" onClick={() => setStatus("declined")}>Yes, I reviewed, reject</DC.Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
                  <DC.Btn variant="primary" icon="check" onClick={() => setStatus("approved")}>Approve {cur.aiRec === "hire" ? "hire" : "decision"}</DC.Btn>
                  <DC.Btn variant="danger" icon="x" onClick={() => cur.aiRec === "reject" ? setConfirm(true) : setStatus("declined")}>Reject</DC.Btn>
                  <DC.Btn variant="soft" icon="eye">Add comment</DC.Btn>
                  <DC.Btn variant="ghost" icon="arrowUpRight" style={{ marginLeft: "auto" }}>Reassign</DC.Btn>
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--e1)" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: DEC_STATUS[cur.status].tone, background: DEC_STATUS[cur.status].bg }}><Icon name={DEC_STATUS[cur.status].icon} size={18} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{DEC_STATUS[cur.status].label} by {cur.by}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{cur.when} ago · recorded to audit trail</div>
              </div>
              {cur.status === "approved" && cur.aiRec === "hire" && <DC.Btn variant="primary" icon="fileText" onClick={() => setStatus("sent")}>Send offer</DC.Btn>}
              {cur.status === "sent" && <DC.Pill icon="clock" tone="var(--info)" bg="var(--info-tint)">awaiting candidate</DC.Pill>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.DecisionsScreen = DecisionsScreen;
