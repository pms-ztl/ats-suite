/* req-intake.jsx, ⭐ the signature requisition-intake flow */
const { useState: uSi, useEffect: uEi, useRef: uRi } = React;
const RI = window.UI;

/* chips input */
function Chips({ items, setItems, placeholder, tone = "var(--brand)", bg = "var(--brand-tint)" }) {
  const [v, setV] = uSi("");
  const add = () => { const t = v.trim(); if (t && !items.includes(t)) setItems([...items, t]); setV(""); };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", minHeight: 42, alignItems: "center" }}>
      {items.map(s => (
        <span key={s} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "3px 7px 3px 10px", borderRadius: "var(--r-pill)", fontSize: 12.5, fontWeight: 600, color: tone, background: bg }}>
          {s}<button onClick={() => setItems(items.filter(x => x !== s))} style={{ display: "grid", placeItems: "center", border: "none", background: "none", cursor: "pointer", color: tone, opacity: .7, padding: 0 }}><Icon name="x" size={12} /></button>
        </span>
      ))}
      <input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder}
        style={{ flex: 1, minWidth: 120, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)", padding: "3px 2px" }} />
    </div>
  );
}

/* labelled field */
function Field({ label, hint, children, required }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--danger)" }}>*</span>}{hint && <span style={{ fontWeight: 400, color: "var(--ink-3)" }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* inclusivity meter */
function Inclusivity({ score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <RI.ScoreRing value={score} size={52} band="var(--ai)" label="incl." />
      <div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>Inclusivity score</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{score >= 90 ? "Strong, welcoming, unbiased language." : "Apply the suggested fixes to improve."}</div>
      </div>
    </div>
  );
}

/* bias flag row with one-click fix */
function BiasFlag({ f, onFix }) {
  const sevTone = { low: "var(--ink-3)", medium: "var(--warn)", high: "var(--danger)" }[f.severity];
  return (
    <div style={{ padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: f.applied ? "var(--ok-tint)" : "var(--surface)", transition: "background var(--t)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, fontWeight: 700 }}>
          <Icon name={f.applied ? "check" : "flag"} size={13} style={{ color: f.applied ? "var(--ok)" : sevTone }} />
          {f.applied ? "Fixed" : f.type}
          {!f.applied && <span style={{ fontSize: 10, fontWeight: 700, color: sevTone, background: "color-mix(in oklab," + sevTone + " 14%, transparent)", padding: "1px 6px", borderRadius: 5, textTransform: "uppercase", letterSpacing: ".04em" }}>{f.severity}</span>}
        </span>
        {!f.applied && <button onClick={() => onFix(f.id)} style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: "var(--ai-ink)", background: "var(--ai-tint)", border: "none", borderRadius: "var(--r-pill)", padding: "4px 10px", cursor: "pointer" }}><Icon name="bolt" size={12} />Apply fix</button>}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 6, lineHeight: 1.45 }}>
        {f.applied ? <>Replaced with <b style={{ color: "var(--ink)" }}>“{f.suggestion}”</b>.</>
          : <>“<span style={{ color: sevTone, fontWeight: 600 }}>{f.text}</span>” → suggest <b style={{ color: "var(--ink)" }}>“{f.suggestion}”</b>{f.where && <span style={{ color: "var(--ink-3)" }}> · {f.where}</span>}</>}
      </div>
    </div>
  );
}

/* custom field row */
function CFRow({ cf, onChange, onRemove }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 32px", gap: 9, alignItems: "center", animation: "rise .3s var(--ease-out)" }}>
      <input value={cf.label} onChange={e => onChange({ ...cf, label: e.target.value })} placeholder="Label, e.g. Must have fintech experience" style={{ ...inputStyle, fontWeight: 600 }} />
      <input value={cf.value} onChange={e => onChange({ ...cf, value: e.target.value })} placeholder="What good looks like" style={inputStyle} />
      <select value={cf.importance} onChange={e => onChange({ ...cf, importance: e.target.value })} style={{ ...inputStyle, cursor: "pointer", padding: "9px 8px" }}>
        {Object.keys(window.IMPORTANCE).map(k => <option key={k} value={k}>{window.IMPORTANCE[k].label}</option>)}
      </select>
      <button onClick={() => onRemove(cf.id)} style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={15} /></button>
    </div>
  );
}

/* ---------- live preview ---------- */
function Preview({ st }) {
  const [mode, setMode] = uSi("candidate");
  const salary = st.min && st.max ? `$${(st.min/1000)}k to $${(st.max/1000)}k` : null;
  const reqs = st.generated ? st.required : (st.skills.length ? st.skills : []);
  return (
    <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0 12px" }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Live preview</span>
        <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: "var(--r-pill)", padding: 2, border: "1px solid var(--line)" }}>
          {[["candidate", "Candidate", "users"], ["screener", "Screener", "sparkles"]].map(([m, l, ic]) => (
            <button key={m} onClick={() => setMode(m)} style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "5px 11px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: mode === m ? (m === "screener" ? "var(--ai)" : "var(--surface)") : "transparent", color: mode === m ? (m === "screener" ? "var(--on-ai)" : "var(--ink)") : "var(--ink-3)", boxShadow: mode === m && m !== "screener" ? "var(--e1)" : "none" }}>
              <Icon name={ic} size={13} />{l}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)" }}>
        {mode === "candidate" ? (
          <div>
            <div style={{ padding: "20px 22px", background: "radial-gradient(120% 120% at 0 0, var(--brand-tint-2), transparent 60%)", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}><Logo size={20} /><span style={{ fontWeight: 700, fontSize: 12.5 }}>Northwind Talent</span></div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{st.title || "Job title"}</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                {st.dept && <RI.Pill icon="briefcase">{st.dept}</RI.Pill>}
                {st.location && <RI.Pill icon="dot">{st.location}</RI.Pill>}
                {salary ? <RI.Pill icon="card" tone="var(--brand)" bg="var(--brand-tint)" mono>{salary}</RI.Pill>
                  : <RI.Pill icon="flag" tone="var(--warn)" bg="var(--warn-tint)">salary not shown</RI.Pill>}
              </div>
            </div>
            <div style={{ padding: "18px 22px", fontSize: "var(--fs-sm)", lineHeight: 1.6, color: "var(--ink-2)" }}>
              {st.description ? <p style={{ margin: "0 0 16px" }}>{st.description}</p> : <p style={{ margin: "0 0 16px", color: "var(--ink-3)", fontStyle: "italic" }}>The description will appear here as you write or generate it.</p>}
              {reqs.length > 0 && <>
                <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>What you'll need</div>
                <ul style={{ margin: "0 0 16px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>{reqs.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </>}
              {st.generated && st.niceToHave.length > 0 && <>
                <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Nice to have</div>
                <ul style={{ margin: "0 0 16px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>{st.niceToHave.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </>}
              {st.customFields.filter(c => c.label).length > 0 && <>
                <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Additional requirements</div>
                <ul style={{ margin: "0 0 18px", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 5 }}>{st.customFields.filter(c => c.label).map(c => <li key={c.id}>{c.label}{c.value ? `, ${c.value}` : ""}</li>)}</ul>
              </>}
              <button style={{ width: "100%", padding: "11px", borderRadius: "var(--r)", border: "none", background: "var(--brand)", color: "var(--on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Apply now</button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><RI.Pill icon="sparkles" tone="var(--on-ai)" bg="var(--ai)">candidate-screener</RI.Pill><span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>how the AI will score applicants</span></div>
            <p style={{ fontSize: 12, color: "var(--ink-2)", margin: "8px 0 14px", lineHeight: 1.5 }}>Every requirement below, including your custom fields, becomes a weighted row in each candidate's screening verdict.</p>
            {[...reqs.map(r => ({ label: r, imp: "required" })), ...st.customFields.filter(c => c.label).map(c => ({ label: c.label, imp: c.importance, custom: true }))].map((r, i, arr) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 84px", gap: 10, alignItems: "center", padding: "9px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", gap: 7, alignItems: "center" }}>{r.custom && <Icon name="sparkles" size={12} style={{ color: "var(--ai)" }} />}{r.label}</span>
                <span className="mono" style={{ fontSize: 10.5, textAlign: "right", color: r.imp === "must-have" ? "var(--ai-ink)" : "var(--ink-3)", fontWeight: 600 }}>{Math.round(100 / Math.max(arr.length, 1))}% wt</span>
              </div>
            ))}
            {reqs.length === 0 && <div style={{ textAlign: "center", color: "var(--ink-3)", fontSize: 12.5, padding: "20px 0" }}>Add requirements to see how screening will weight them.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- the intake screen ---------- */
function IntakeScreen({ onBack }) {
  const [st, setSt] = uSi({ title: "Senior Backend Engineer", dept: "Payments", level: "Senior (L5)", location: "Austin, TX · Remote (US)", min: 160000, max: 200000,
    mode: "ai", generating: false, generated: false, description: "", required: [], niceToHave: [], inclusivity: 0, skills: [],
    customFields: window.CUSTOM_FIELDS.map(c => ({ ...c })) });
  const [biasFlags, setBiasFlags] = uSi([]);
  const [traceStep, setTraceStep] = uSi(0);
  const set = (patch) => setSt(s => ({ ...s, ...patch }));

  const generate = () => {
    if (!st.title.trim()) return;
    set({ generating: true, generated: false }); setTraceStep(0); setBiasFlags([]);
  };
  uEi(() => {
    if (!st.generating) return;
    if (traceStep >= window.JD_GEN.trace.length) {
      const t = setTimeout(() => {
        const g = window.JD_GEN;
        set({ generating: false, generated: true, description: g.description, required: g.required, niceToHave: g.niceToHave, inclusivity: g.inclusivity });
        setBiasFlags(g.biasFlags.map(f => ({ ...f })));
      }, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTraceStep(s => s + 1), 560);
    return () => clearTimeout(t);
  }, [st.generating, traceStep]);

  const fixBias = (id) => {
    setBiasFlags(fs => fs.map(f => f.id === id ? { ...f, applied: true } : f));
    set({ inclusivity: Math.min(100, st.inclusivity + 2) });
  };

  const openNoSalary = !st.min || !st.max;
  const addCF = () => set({ customFields: [...st.customFields, { id: "cf" + Date.now(), label: "", value: "", importance: "important" }] });
  const updCF = (cf) => set({ customFields: st.customFields.map(c => c.id === cf.id ? cf : c) });
  const rmCF = (id) => set({ customFields: st.customFields.filter(c => c.id !== id) });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 26px", borderBottom: "1px solid var(--line)" }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevsL" size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>New requisition</h1><RI.Pill mono tone="var(--ink-3)" bg="var(--surface-3)">draft</RI.Pill></div>
        </div>
        <RI.Btn variant="ghost" onClick={onBack}>Save draft</RI.Btn>
        <RI.Btn variant="primary" icon="arrowUpRight">Post job</RI.Btn>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.25fr 0.85fr", gap: 0, minHeight: 0 }}>
        {/* form */}
        <div style={{ overflowY: "auto", padding: "22px 26px 60px", display: "flex", flexDirection: "column", gap: 20, borderRight: "1px solid var(--line)" }}>
          {/* basics */}
          <section>
            <div style={{ ...RI.fStyles.label, marginBottom: 12 }}>The basics</div>
            <Field label="Job title" required>
              <input value={st.title} onChange={e => set({ title: e.target.value })} placeholder="e.g. Senior Backend Engineer" style={{ ...inputStyle, fontSize: "var(--fs-lg)", fontWeight: 700, padding: "11px 14px" }} />
            </Field>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <Field label="Department"><input value={st.dept} onChange={e => set({ dept: e.target.value })} style={inputStyle} /></Field>
              <Field label="Level"><input value={st.level} onChange={e => set({ level: e.target.value })} style={inputStyle} /></Field>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <Field label="Location"><input value={st.location} onChange={e => set({ location: e.target.value })} style={inputStyle} /></Field>
              <Field label="Salary range" hint="USD / year">
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="number" value={st.min || ""} onChange={e => set({ min: +e.target.value })} placeholder="min" className="mono" style={{ ...inputStyle, width: 100 }} />
                  <span style={{ color: "var(--ink-3)" }}>, </span>
                  <input type="number" value={st.max || ""} onChange={e => set({ max: +e.target.value })} placeholder="max" className="mono" style={{ ...inputStyle, width: 100 }} />
                </div>
              </Field>
            </div>
            {openNoSalary && (
              <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: "var(--r)", background: "var(--warn-tint)", border: "1px solid color-mix(in oklab, var(--warn) 28%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12, color: "var(--ink-2)" }}>
                <Icon name="flag" size={14} style={{ color: "var(--warn)", flexShrink: 0 }} /><span><b style={{ color: "var(--ink)" }}>Pay transparency:</b> several states require a salary range on public posts. Add one before publishing as Open.</span>
              </div>
            )}
          </section>

          {/* description, two paths */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={RI.fStyles.label}>Job description</div>
              <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: "var(--r-pill)", padding: 2, border: "1px solid var(--line)" }}>
                {[["ai", "Let AI write it", "sparkles"], ["paste", "Paste my own", "fileText"]].map(([m, l, ic]) => (
                  <button key={m} onClick={() => set({ mode: m })} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 12px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                    background: st.mode === m ? (m === "ai" ? "var(--ai)" : "var(--surface)") : "transparent", color: st.mode === m ? (m === "ai" ? "var(--on-ai)" : "var(--ink)") : "var(--ink-3)", boxShadow: st.mode === m && m === "paste" ? "var(--e1)" : "none" }}>
                    <Icon name={ic} size={14} />{l}</button>
                ))}
              </div>
            </div>

            {st.mode === "ai" && !st.generated && !st.generating && (
              <div className="clay" style={{ borderRadius: "var(--r-xl)", padding: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)" }}><Icon name="sparkles" size={26} /></div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Let <span style={{ color: "var(--ai-ink)" }}>jd-author</span> draft it for you</div>
                <p style={{ margin: "6px auto 16px", maxWidth: 360, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.5 }}>From the title and basics above, the agent writes the description, splits required vs nice-to-have, and self-audits for biased language.</p>
                <button onClick={generate} disabled={!st.title.trim()} style={{ position: "relative", overflow: "hidden", display: "inline-flex", gap: 8, alignItems: "center", padding: "11px 20px", borderRadius: "var(--r)", border: "none",
                  background: "var(--ai)", color: "var(--on-ai)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: st.title.trim() ? "pointer" : "not-allowed", opacity: st.title.trim() ? 1 : .5, fontFamily: "var(--font-sans)" }}>
                  <span style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / .35) 50%, transparent 70%)", transform: "translateX(-100%)", animation: "shimmer 2.4s infinite" }} />
                  <Icon name="sparkles" size={16} /> Generate description
                </button>
              </div>
            )}

            {st.generating && (
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 24%, var(--line))", background: "var(--ai-tint)", padding: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ai)", animation: "pulsering 1.3s infinite" }} />
                  <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--ai-ink)" }}>jd-author is writing…</span>
                </div>
                {window.JD_GEN.trace.slice(0, traceStep).map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", animation: "rise .3s var(--ease-out)" }}>
                    <Icon name={s.status === "review" ? "eye" : "check"} size={14} style={{ color: s.status === "review" ? "var(--warn)" : "var(--ai)" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.t}</span><span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>· {s.d}</span>
                  </div>
                ))}
              </div>
            )}

            {(st.generated || st.mode === "paste") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "rise .35s var(--ease-out)" }}>
                {st.generated && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: "var(--r)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 22%, transparent)" }}>
                    <Inclusivity score={st.inclusivity} />
                    <RI.Btn variant="soft" size="sm" icon="sparkles" onClick={generate}>Regenerate</RI.Btn>
                  </div>
                )}
                <Field label="Description">
                  <textarea value={st.description} onChange={e => set({ description: e.target.value })} rows={5} placeholder="Describe the role, the team, and the impact…" style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
                </Field>
                <Field label={st.generated ? "Required qualifications" : "Required skills"} hint="sent to the screener">
                  {st.generated
                    ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{st.required.map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "8px 11px", borderRadius: "var(--r)", background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 12.5 }}><Icon name="check" size={13} style={{ color: "var(--brand)" }} />{r}</div>
                      ))}</div>
                    : <Chips items={st.skills} setItems={v => set({ skills: v })} placeholder="Type a skill and press Enter" />}
                </Field>
                <Field label="Nice-to-have">
                  {st.generated
                    ? <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{st.niceToHave.map((r, i) => <RI.Pill key={i} tone="var(--ink-2)" bg="var(--surface-2)">{r}</RI.Pill>)}</div>
                    : <Chips items={[]} setItems={() => {}} placeholder="Optional skills…" tone="var(--ink-2)" bg="var(--surface-2)" />}
                </Field>

                {st.generated && biasFlags.length > 0 && (
                  <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="shield" size={15} style={{ color: "var(--ai)" }} /> Bias self-audit</span>
                      <RI.Pill tone={biasFlags.every(f => f.applied) ? "var(--ok)" : "var(--warn)"} bg={biasFlags.every(f => f.applied) ? "var(--ok-tint)" : "var(--warn-tint)"}>
                        {biasFlags.filter(f => !f.applied).length} to review</RI.Pill>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{biasFlags.map(f => <BiasFlag key={f.id} f={f} onFix={fixBias} />)}</div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ⭐ custom fields */}
          <section style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--ai) 28%, var(--line))", padding: 18, background: "linear-gradient(180deg, var(--ai-tint) 0%, transparent 40%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3></div>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--ink-2)", maxWidth: 480, lineHeight: 1.45 }}>Type any criterion that matters for this role. The <b style={{ color: "var(--ai-ink)" }}>label and value are sent to the AI screener</b> and become their own row in every candidate's verdict.</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 150px 32px", gap: 9, padding: "10px 0 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              <span>Label (you write this)</span><span>What good looks like</span><span>Importance</span><span></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {st.customFields.map(cf => <CFRow key={cf.id} cf={cf} onChange={updCF} onRemove={rmCF} />)}
            </div>
            <button onClick={addCF} style={{ marginTop: 11, display: "inline-flex", gap: 7, alignItems: "center", padding: "8px 13px", borderRadius: "var(--r)", border: "1px dashed color-mix(in oklab, var(--ai) 40%, var(--line))", background: "var(--surface)", color: "var(--ai-ink)", fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              <Icon name="plus" size={15} /> Add criterion
            </button>
          </section>
        </div>

        {/* preview */}
        <div style={{ padding: "22px 22px 22px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Preview st={st} />
        </div>
      </div>
    </div>
  );
}
window.IntakeScreen = IntakeScreen;
