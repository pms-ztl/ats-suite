/* screen-candidate.jsx, candidate transparency + appeal (warm, ethical, AI-assistive) */
const { useState: uSp } = React;

function CandidatePortal({ onClose }) {
  const c = window.CANDIDATE_VIEW;
  const [view, setView] = uSp("transparency"); // transparency | appeal | sent
  const [reason, setReason] = uSp("");

  return (
    <div onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "4vh 20px",
      background: "color-mix(in oklab, var(--bg-deep) 62%, transparent)", backdropFilter: "blur(6px)", animation: "pop .14s var(--ease-out)" }}>
      <div className="clay" style={{ width: "min(680px, 96vw)", maxHeight: "92vh", overflnow: "hidden", borderRadius: "var(--r-2xl)", overflow: "hidden", display: "flex", flexDirection: "column", animation: "rise .3s var(--ease-out)", boxShadow: "var(--e3)" }}>
        {/* warm aurora header */}
        <div style={{ position: "relative", padding: "26px 30px 22px", overflow: "hidden",
          background: "radial-gradient(120% 130% at 0% 0%, var(--brand-tint-2), transparent 55%), radial-gradient(120% 130% at 100% 0%, var(--ai-tint-2), transparent 55%)", borderBottom: "1px solid var(--line)" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 99, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={16} /></button>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
            <Logo size={24} /><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{c.company}</span>
            <Pill icon="eye" tone="var(--ink-2)" style={{ marginLeft: "auto" }}>candidate preview</Pill>
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Hi {c.name}, here’s how your application is being reviewed.</h1>
          <p style={{ margin: "8px 0 0", fontSize: "var(--fs-md)", color: "var(--ink-2)", lineHeight: 1.5 }}>You applied for <b style={{ color: "var(--ink)" }}>{c.job}</b>. We use AI to help our team review applications fairly, but <b style={{ color: "var(--ink)" }}>a person makes the final decision</b>, always.</p>
        </div>

        <div style={{ overflowY: "auto", padding: "22px 30px 26px" }}>
          {view === "transparency" && (
            <div style={{ animation: "rise .3s var(--ease-out)", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* status */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--warn-tint)", color: "var(--warn)", display: "grid", placeItems: "center" }}><Icon name="clock" size={20} /></span>
                <div><div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Current status</div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{c.stage}, with a human reviewer</div></div>
              </div>

              {/* assistive callout */}
              <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 22%, transparent)" }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 700, color: "var(--ai-ink)", marginBottom: 8 }}><Icon name="sparkles" size={17} /> AI is assistive, a human decides</div>
                <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55 }}>An AI assistant read your résumé and compared your experience to the role’s requirements. It produces a recommendation only, it never accepts or rejects anyone on its own.</p>
              </div>

              {/* what we looked at / didn't */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[["What the AI looked at", c.assessed, "check", "var(--ok)"], ["What it never sees", c.notAssessed, "x", "var(--danger)"]].map(([t, arr, ic, col]) => (
                  <div key={t} style={{ padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 10 }}>{t}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {arr.map(x => <div key={x} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.4 }}><Icon name={ic} size={14} style={{ color: col, flexShrink: 0, marginTop: 1 }} />{x}</div>)}
                    </div>
                  </div>
                ))}
              </div>

              {/* strengths / explore */}
              <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--surface)", border: "1px solid var(--line)" }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 11 }}>What the review highlighted</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ok)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>Strengths matched</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{c.strengths.map(s => <Pill key={s} icon="check" tone="var(--ok)" bg="var(--ok-tint)">{s}</Pill>)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--warn)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 7 }}>Areas the team may explore</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{c.explore.map(s => <Pill key={s} icon="eye" tone="var(--warn)" bg="var(--warn-tint)">{s}</Pill>)}</div>
                </div>
              </div>

              {/* appeal CTA */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--brand-tint)", border: "1px solid color-mix(in oklab, var(--brand) 22%, transparent)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Think something was missed?</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 1 }}>You can ask a human to re-review your application, no algorithms involved.</div>
                </div>
                <Btn variant="primary" icon="users" onClick={() => setView("appeal")}>Request human review</Btn>
              </div>
            </div>
          )}

          {view === "appeal" && (
            <div style={{ animation: "rise .3s var(--ease-out)", display: "flex", flexDirection: "column", gap: 16 }}>
              <button onClick={() => setView("transparency")} style={{ alignSelf: "flex-start", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 600 }}><Icon name="chevR" size={14} style={{ transform: "rotate(180deg)" }} /> Back</button>
              <div>
                <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Request a human review</h2>
                <p style={{ margin: "6px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.5 }}>This goes straight to a person on the {c.company} hiring team with the authority to change the decision. Tell them what you’d like them to reconsider.</p>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 7 }}>What should we take another look at?</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={5} placeholder="For example: my payments work at Lyra was core financial infrastructure handling regulated money movement…"
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", resize: "vertical", lineHeight: 1.5, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Skills were under-counted", "Relevant experience missed", "Wrong role match", "Something else"].map(t => (
                  <button key={t} onClick={() => setReason(r => r ? r : t)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: "var(--r-pill)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", cursor: "pointer" }}>{t}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 9, justifyContent: "flex-end", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "var(--ink-3)", marginRight: "auto", display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={13} /> A human reviews every appeal within 5 business days.</span>
                <Btn variant="ghost" onClick={() => setView("transparency")}>Cancel</Btn>
                <Btn variant="primary" icon="enter" onClick={() => setView("sent")}>Submit appeal</Btn>
              </div>
            </div>
          )}

          {view === "sent" && (
            <div style={{ animation: "pop .3s var(--ease-spring)", textAlign: "center", padding: "30px 20px" }}>
              <div style={{ width: 72, height: 72, borderRadius: "var(--r-2xl)", margin: "0 auto 20px", display: "grid", placeItems: "center", background: "var(--ok-tint)", color: "var(--ok)" }}><Icon name="check" size={36} stroke={2.2} /></div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Your appeal is on its way to a person.</h2>
              <p style={{ margin: "10px auto 0", maxWidth: 420, fontSize: "var(--fs-md)", color: "var(--ink-2)", lineHeight: 1.55 }}>A member of the {c.company} team will personally review your application and reply by email within 5 business days. Thank you, {c.name}.</p>
              <div style={{ marginTop: 22 }}><Btn variant="soft" icon="check" onClick={onClose}>Done</Btn></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.CandidatePortal = CandidatePortal;
