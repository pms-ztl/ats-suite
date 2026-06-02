/* screen-screening.jsx, Screening verdict · reasoning trace · parsed résumé (the centerpiece) */
const { useState: uSs, useEffect: uEs, useRef: uRs } = React;

function AIChip({ children = "AI · advisory", solid }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 700, whiteSpace: "nowrap",
      color: solid ? "var(--on-ai)" : "var(--ai-ink)", background: solid ? "var(--ai)" : "var(--ai-tint)" }}>
      <Icon name="sparkles" size={12} />{children}
    </span>
  );
}
function SubBar({ v, state }) {
  const c = state === "pass" ? "var(--ok)" : state === "review" ? "var(--warn)" : "var(--danger)";
  return (
    <div style={{ height: 5, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: v + "%", background: c, borderRadius: 99, transition: "width .9s var(--ease-out)" }} />
    </div>
  );
}
const stIcon = (s) => s === "pass" ? "check" : s === "review" ? "eye" : "x";
const stColor = (s) => s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : "var(--danger)";

/* ---------- requirement breakdown row ---------- */
function ReqRow({ r, open, onToggle }) {
  return (
    <div style={{ borderTop: "1px solid var(--line)", background: open ? "var(--surface-2)" : "transparent", transition: "background var(--t)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "grid", gridTemplateColumns: "24px 1fr 120px 78px 18px", gap: 14, alignItems: "center",
        padding: "13px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 7, background: "color-mix(in oklab," + stColor(r.state) + " 14%, transparent)", color: stColor(r.state) }}>
          <Icon name={stIcon(r.state)} size={15} stroke={2.3} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {r.label}
            {r.custom && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9.5, padding: "1px 7px" }} icon="sparkles">custom · {r.importance}</Pill>}
          </span>
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <SubBar v={r.sub} state={r.state} />
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>sub-score {r.sub}</span>
        </span>
        <span className="mono tnum" style={{ fontSize: 11.5, color: "var(--ink-2)", textAlign: "right", fontWeight: 600 }}>{r.weight}% wt</span>
        <Icon name="chevD" size={16} style={{ color: "var(--ink-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px 56px", animation: "rise .25s var(--ease-out)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>
            <Icon name="scroll" size={13} /> Evidence
          </div>
          <blockquote style={{ margin: 0, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--surface)", border: "1px solid var(--line)",
            borderLeft: "3px solid " + stColor(r.state), fontSize: "var(--fs-sm)", color: "var(--ink)", lineHeight: 1.55, fontStyle: "italic" }}>
            {r.evidence}
            <span style={{ display: "block", marginTop: 7, fontStyle: "normal", fontSize: 11.5, color: "var(--brand)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
              ↳ {r.src}
            </span>
          </blockquote>
          <div style={{ marginTop: 10, display: "flex", gap: 9, alignItems: "flex-start" }}>
            <AIChip>reasoning</AIChip>
            <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55, flex: 1 }}>{r.note}</p>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Btn variant="soft" size="sm" icon="copy">Edit / contest</Btn>
            <Btn variant="ghost" size="sm" icon="flag">Mark wrong</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- VERDICT tab ---------- */
function VerdictTab({ s, openReq, setOpenReq, onPortal }) {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      {/* hero verdict */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--ai) 24%, var(--line))", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 300px", gap: 24, alignItems: "center", padding: 22,
          background: "linear-gradient(110deg, var(--ai-tint) 0%, transparent 70%)" }}>
          <ScoreRing value={s.score} size={104} band="var(--ai)" label="match %" />
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <AIChip solid />
              <Pill mono tone="var(--ai-ink)" bg="var(--ai-tint-2)">{s.agent}</Pill>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{s.band}</h2>
              <StatusBadge kind={s.result === "PASS" ? "pass" : s.result === "FAIL" ? "fail" : "review"} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 560 }}>{s.summary}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Confidence value={s.confidence} />
            <div style={{ padding: "10px 13px", borderRadius: "var(--r)", background: "var(--surface)", border: "1px dashed color-mix(in oklab, var(--ai) 35%, var(--line))" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>Recommended, not final</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                <Icon name="eye" size={15} style={{ color: "var(--warn)" }} />
                <span style={{ fontWeight: 700, fontSize: "var(--fs-md)", textTransform: "capitalize" }}>{s.recommended.replace("_", " ")}</span>
              </div>
            </div>
          </div>
        </div>
        {/* signals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--line)" }}>
          {[["Strengths", s.signals.match, "check", "var(--ok)"], ["Gaps to explore", s.signals.gap, "x", "var(--warn)"]].map(([t, arr, ic, c], i) => (
            <div key={t} style={{ padding: "14px 18px", borderLeft: i ? "1px solid var(--line)" : "none", background: "var(--surface)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 9 }}>{t}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {arr.map(x => <Pill key={x} icon={ic} tone={c} bg={"color-mix(in oklab," + c + " 12%, transparent)"}>{x}</Pill>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* requirement breakdown */}
      <div style={{ marginTop: 20, borderRadius: "var(--r-xl)", border: "1px solid var(--line)", overflow: "hidden", background: "var(--surface)", boxShadow: "var(--e1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Requirement-by-requirement</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>Each scored against weight · expand for the evidence behind it</div>
          </div>
          <Pill mono>weights sum 100</Pill>
        </div>
        {s.requirements.map(r => <ReqRow key={r.id} r={r} open={openReq === r.id} onToggle={() => setOpenReq(openReq === r.id ? null : r.id)} />)}
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <Btn variant="outlineAi" icon="eye" onClick={onPortal}>Preview what the candidate sees</Btn>
      </div>
    </div>
  );
}

/* ---------- REASONING TRACE tab ---------- */
function TraceTab({ s }) {
  const [shown, setShown] = uSs(window.TRACE.length);
  const [live, setLive] = uSs(false);
  const replay = () => { setLive(true); setShown(0); };
  uEs(() => {
    if (!live) return;
    if (shown >= window.TRACE.length) { setLive(false); return; }
    const id = setTimeout(() => setShown(n => n + 1), 520);
    return () => clearTimeout(id);
  }, [live, shown]);
  return (
    <div style={{ animation: "rise .3s var(--ease-out)", display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--line)", background: "linear-gradient(110deg, var(--ai-tint) 0%, transparent 60%)" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <AIChip>reasoning trace</AIChip>
            {live && <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11.5, fontWeight: 600, color: "var(--ai-ink)" }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ai)", animation: "pulsering 1.4s infinite" }} /> running…</span>}
          </div>
          <Btn variant="soft" size="sm" icon="bolt" onClick={replay}>Replay live</Btn>
        </div>
        <div style={{ padding: "8px 18px 18px" }}>
          {window.TRACE.slice(0, shown).map((step, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 14, animation: "rise .3s var(--ease-out)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 12,
                  background: step.status === "done" ? "var(--brand-tint)" : "color-mix(in oklab," + stColor(step.status) + " 14%, transparent)",
                  color: step.status === "done" ? "var(--brand)" : stColor(step.status) }}>
                  <Icon name={step.status === "done" ? "check" : stIcon(step.status)} size={13} stroke={2.4} />
                </span>
                {i < shown - 1 && <span style={{ width: 2, flex: 1, background: "var(--line)", marginTop: 2 }} />}
              </div>
              <div style={{ padding: "12px 0", borderBottom: i < shown - 1 ? "1px solid var(--line)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{step.t}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--ai-ink)", background: "var(--ai-tint)", padding: "1px 7px", borderRadius: 5 }}>{step.tool}()</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 3, lineHeight: 1.45 }}>{step.d}</div>
                <button style={{ marginTop: 6, fontSize: 11, color: "var(--ink-3)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 600 }}>
                  <Icon name="flag" size={11} /> Question this step
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="clay" style={{ borderRadius: "var(--r-lg)", padding: 16 }}>
          <div style={{ ...window.UI.fStyles.label, marginBottom: 10 }}>Audit record</div>
          {[["Run id", "scr_9f3a…b21"], ["Model", "claude · screener"], ["Prompt ver.", "v4.2"], ["Started", "10:14:02"], ["Duration", "3.8s"], ["Tools called", "9"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "1px solid var(--line)", fontSize: 12 }}>
              <span style={{ color: "var(--ink-3)" }}>{k}</span><span className="mono" style={{ color: "var(--ink)", fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "flex-start", lineHeight: 1.4 }}>
            <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} /> Prompts &amp; secrets are never exposed. Full trace retained for compliance.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- PARSED RÉSUMÉ tab ---------- */
function ParsedTab() {
  const p = window.PARSED;
  const [sel, setSel] = uSs("Header");
  const lowC = (c) => c < 0.7;
  const Field = ({ k, v, c, src }) => (
    <button onClick={() => setSel(src)} style={{ width: "100%", display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 12, alignItems: "center", padding: "9px 12px", textAlign: "left",
      borderRadius: "var(--r)", border: "1px solid", borderColor: sel === src ? "var(--brand)" : "transparent", background: sel === src ? "var(--brand-tint)" : "transparent", cursor: "pointer", transition: "all var(--t-fast)" }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--ink)" }}>{v}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {lowC(c) && <Icon name="flag" size={12} style={{ color: "var(--warn)" }} />}
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: lowC(c) ? "var(--warn)" : "var(--ink-3)" }}>{c.toFixed(2)}</span>
      </span>
    </button>
  );
  return (
    <div style={{ animation: "rise .3s var(--ease-out)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* structured */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 16, boxShadow: "var(--e1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><AIChip>resume-parser</AIChip><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Structured fields</span></div>
          <Pill icon="copy" tone="var(--ink-2)">every field editable</Pill>
        </div>
        {p.fields.map(f => <Field key={f.k} {...f} />)}
        <div style={{ ...window.UI.fStyles.label, margin: "14px 0 8px" }}>Skills · confidence</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {p.skills.map(sk => (
            <span key={sk.n} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "4px 9px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 600,
              background: lowC(sk.c) ? "var(--warn-tint)" : "var(--surface-2)", color: lowC(sk.c) ? "var(--warn)" : "var(--ink)", border: "1px solid var(--line)" }}>
              {lowC(sk.c) && <Icon name="flag" size={11} />}{sk.n}<span className="mono" style={{ opacity: .6, fontSize: 10 }}>{sk.c.toFixed(2)}</span>
            </span>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: "var(--r)", background: "var(--warn-tint)", border: "1px solid color-mix(in oklab, var(--warn) 30%, transparent)" }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", fontWeight: 700, fontSize: 12, color: "var(--warn)" }}><Icon name="flag" size={14} /> Honesty flag</div>
          {p.honesty.map((h, i) => (
            <div key={i} style={{ marginTop: 5, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45 }}><b style={{ color: "var(--ink)" }}>{h.claim}</b>, {h.issue}</div>
          ))}
        </div>
      </div>
      {/* original with source highlight */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface-2)", padding: 0, boxShadow: "var(--e1)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)" }}>
          <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="fileText" size={15} /> priya-raman-resume.pdf</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>click a field → its source highlights</span>
        </div>
        <div style={{ padding: 18, fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-2)" }}>
          {[
            { src: "Header", body: <div><b style={{ color: "var(--ink)", fontSize: 15 }}>Priya Raman</b><br/>Austin, TX · priya.raman@hey.com · +1 (512) 555‑0148</div> },
            { src: "Experience · Lyra · 2021 to present", body: <div><b style={{ color: "var(--ink)" }}>Staff Backend Engineer, Lyra</b> · 2021 to present<br/>Led the Kafka event pipeline processing 1.2M msg/s across 40 services, cutting p99 latency 38%. Built payments &amp; payouts infrastructure for the marketplace ($2.1B/yr GMV).</div> },
            { src: "Skills + Experience", body: <div><b style={{ color: "var(--ink)" }}>Skills</b> · Go (5 yrs), Kafka, PostgreSQL, gRPC, Kubernetes, AWS, Rust (perf-critical services)</div> },
            { src: "Computed from roles", body: <div style={{ fontStyle: "italic", color: "var(--ink-3)" }}>8 years total experience computed across listed roles.</div> },
          ].map((blk, i) => {
            const hot = sel === blk.src;
            return (
              <div key={i} style={{ padding: "9px 12px", marginBottom: 8, borderRadius: "var(--r)", transition: "all var(--t)",
                background: hot ? "var(--brand-tint)" : "transparent", boxShadow: hot ? "inset 0 0 0 1px var(--brand)" : "none" }}>{blk.body}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- queue + decision shell ---------- */
const QUEUE = [
  { id: "q1", n: "Priya Raman", role: "Sr. Backend Eng", score: 78, st: "review", active: true },
  { id: "q2", n: "Dana Osei", role: "Platform Eng", score: 84, st: "pass" },
  { id: "q3", n: "Lena Whitfield", role: "Sr. Backend Eng", score: 81, st: "pass" },
  { id: "q4", n: "Marcus Bell", role: "Staff Designer", score: 41, st: "fail" },
  { id: "q5", n: "Tomas Reyes", role: "Data Eng", score: 67, st: "review" },
  { id: "q6", n: "Aisha Bello", role: "Sr. Backend Eng", score: 73, st: "review" },
];

function ScreeningScreen({ onPortal }) {
  const s = window.SCREENING;
  const [tab, setTab] = uSs("verdict");
  const [openReq, setOpenReq] = uSs("r3");
  const [sel, setSel] = uSs("q1");
  const [decision, setDecision] = uSs(null);
  const tabs = [["verdict", "Verdict", "scan"], ["trace", "Reasoning trace", "cpu"], ["parsed", "Parsed résumé", "fileText"]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "256px 1fr", height: "100%", minHeight: 0 }}>
      {/* queue */}
      <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto", padding: "16px 12px", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 10px" }}>
          <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Screening queue</span>
          <Pill mono tone="var(--warn)" bg="var(--warn-tint)">26</Pill>
        </div>
        {QUEUE.map(q => (
          <button key={q.id} onClick={() => setSel(q.id)} style={{ width: "100%", display: "flex", gap: 11, alignItems: "center", padding: "10px 10px", borderRadius: "var(--r)", border: "none", cursor: "pointer", textAlign: "left",
            background: sel === q.id ? "var(--brand-tint)" : "transparent", marginBottom: 2, transition: "background var(--t-fast)" }}
            onMouseEnter={e => { if (sel !== q.id) e.currentTarget.style.background = "var(--surface-2)"; }} onMouseLeave={e => { if (sel !== q.id) e.currentTarget.style.background = "transparent"; }}>
            <ScoreRing value={q.score} size={40} band={q.st === "pass" ? "var(--ok)" : q.st === "fail" ? "var(--danger)" : "var(--warn)"} label="" />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.n}</span>
              <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{q.role}</span>
            </span>
            <Icon name={stIcon(q.st)} size={14} stroke={2.3} style={{ color: stColor(q.st) }} />
          </button>
        ))}
      </aside>

      {/* detail */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* candidate header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 26px 0" }}>
          <div className="mono" style={{ width: 46, height: 46, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white", fontWeight: 700, fontSize: 16 }}>{s.candidate.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{s.candidate.name}</h1>
              <Pill mono>{s.req.id}</Pill>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.req.title} · {s.req.team}, screening {s.candidate.title}</div>
          </div>
        </div>
        {/* tabs */}
        <div style={{ display: "flex", gap: 4, padding: "14px 26px 0", borderBottom: "1px solid var(--line)" }}>
          {tabs.map(([id, label, ic]) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: "var(--fs-sm)", fontWeight: 600, color: tab === id ? "var(--ink)" : "var(--ink-3)", borderBottom: "2px solid", borderColor: tab === id ? "var(--brand)" : "transparent", marginBottom: -1, transition: "color var(--t-fast)" }}>
              <Icon name={ic} size={15} />{label}{id !== "verdict" && <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--ai)" }} />}
            </button>
          ))}
        </div>
        {/* body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px 120px" }}>
          {tab === "verdict" && <VerdictTab s={s} openReq={openReq} setOpenReq={setOpenReq} onPortal={onPortal} />}
          {tab === "trace" && <TraceTab s={s} />}
          {tab === "parsed" && <ParsedTab />}
        </div>

        {/* human decision bar */}
        <div className="glass" style={{ position: "sticky", bottom: 0, borderTop: "1px solid var(--line)", padding: "12px 26px", display: "flex", alignItems: "center", gap: 16, borderRadius: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 30, height: 30, borderRadius: 99, background: "var(--brand-tint)", color: "var(--brand)", display: "grid", placeItems: "center" }}><Icon name="users" size={16} /></span>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>You are the decider</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>AI is advisory, it never advances or rejects on its own.</div>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {decision && <Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">{decision}</Pill>}
          <Btn variant="soft" icon="flag" onClick={() => setDecision("Sent back for review")}>Request review</Btn>
          <Btn variant="danger" icon="x" onClick={() => setDecision("Declined, reason recorded")}>Decline…</Btn>
          <Btn variant="primary" icon="check" onClick={() => setDecision("Advanced to interview")}>Advance to interview</Btn>
        </div>
      </div>
    </div>
  );
}
window.ScreeningScreen = ScreeningScreen;
