/* screen-aix.jsx, Platform cost, Notification prefs, Internal mobility, Platform jobs */
const { useState: uSx } = React;
const AX = window.UI;

function PlatformCostScreen() {
  const agents = window.PLAT_AGENTS.slice().sort((a, b) => b.cost - a.cost);
  const maxC = Math.max(...agents.map(a => a.cost));
  const tenants = window.TENANTS.slice().sort((a, b) => b.cost - a.cost).slice(0, 6);
  const maxT = Math.max(...tenants.map(t => t.cost));
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 1240, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div><div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Cost analytics</h1><AX.Pill icon="bolt" tone="var(--danger)" bg="var(--danger-tint)">platform operator</AX.Pill></div>
          <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>Inference spend across agents and tenants · this month.</p></div>
        <AX.Pill icon="clock" tone="var(--ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>May 2026</AX.Pill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>{window.PLAT_KPIS.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <window.Reveal i={4}><window.SectionCard title="Spend by agent" icon="cpu" headRight={<AX.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">8 agents</AX.Pill>}>
          {agents.map((a, i) => (
            <div key={a.n} style={{ display: "grid", gridTemplateColumns: "150px 1fr 70px", gap: 10, alignItems: "center", padding: "7px 0" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.n}</span>
              <div style={{ height: 16, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: ((a.cost / maxC) * 100) + "%", borderRadius: 6, background: "var(--ai)", animation: "growx 1s var(--ease-out) both", animationDelay: (i * 60) + "ms" }} /></div>
              <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>${a.cost.toLocaleString()}</span>
            </div>
          ))}
        </window.SectionCard></window.Reveal>
        <window.Reveal i={5}><window.SectionCard title="Top tenant spenders" icon="building" action="All tenants">
          {tenants.map((t, i) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr 70px", gap: 10, alignItems: "center", padding: "7px 0" }}>
              <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
              <div style={{ height: 16, borderRadius: 6, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: ((t.cost / maxT) * 100) + "%", borderRadius: 6, background: t.health === "over" ? "var(--danger)" : "var(--brand)", animation: "growx 1s var(--ease-out) both", animationDelay: (i * 60) + "ms" }} /></div>
              <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right", color: t.health === "over" ? "var(--danger)" : "var(--ink)" }}>${t.cost}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--r)", background: "var(--danger-tint)", fontSize: 11.5, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center" }}><Icon name="flag" size={13} style={{ color: "var(--danger)" }} />Vertex Capital is over its inference budget ($410 vs $399 MRR).</div>
        </window.SectionCard></window.Reveal>
      </div>
    </div>
  </div>;
}

function NotificationsScreen() {
  const [prefs, setPrefs] = uSx(window.NOTIF_PREFS.map(p => ({ ...p })));
  const set = (i, ch) => setPrefs(prefs.map((p, j) => j === i ? { ...p, [ch]: !p[ch] } : p));
  const Toggle = ({ on, onClick }) => <button onClick={onClick} style={{ width: 36, height: 21, borderRadius: 99, border: "none", background: on ? "var(--brand)" : "var(--line-strong)", position: "relative", cursor: "pointer" }}><span style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 15, height: 15, borderRadius: 99, background: "white", transition: "left var(--t)" }} /></button>;
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Notifications</h1>
      <p style={{ margin: "5px 0 20px", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Choose how you hear about what matters, per channel.</p>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: 12, padding: "11px 20px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          <span>Notify me about</span><span style={{ textAlign: "center" }}>Email</span><span style={{ textAlign: "center" }}>SMS</span><span style={{ textAlign: "center" }}>In-app</span>
        </div>
        {prefs.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: 12, padding: "14px 20px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>{p.cat}{p.ai && <AX.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9 }}>AI</AX.Pill>}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{p.desc}</div></div>
            <span style={{ display: "grid", placeItems: "center" }}><Toggle on={p.email} onClick={() => set(i, "email")} /></span>
            <span style={{ display: "grid", placeItems: "center" }}><Toggle on={p.sms} onClick={() => set(i, "sms")} /></span>
            <span style={{ display: "grid", placeItems: "center" }}><Toggle on={p.inapp} onClick={() => set(i, "inapp")} /></span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "14px 18px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Digest frequency</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Batch low-priority items into a summary</div></div>
        <select style={{ padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}><option>Daily</option><option>Weekly</option><option>Off</option></select>
      </div>
    </div>
  </div>;
}

function MobilityScreen() {
  const [added, setAdded] = uSx({});
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div><div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Internal mobility</h1><AX.Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">skill-matched</AX.Pill></div>
          <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Current employees the AI matched to your open roles, promote from within.</p></div>
      </div>
      <div style={{ marginBottom: 16 }}><div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)", fontSize: 12.5, color: "var(--ink-2)" }}><Icon name="users" size={16} style={{ color: "var(--ai)" }} /><span>Matches are advisory. A hiring manager reviews each before an internal transfer is created.</span></div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {window.MOBILITY.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", flexWrap: "wrap" }}>
            <AX.ScoreRing value={m.match} size={52} band="var(--ai)" label="match" />
            <span className="mono" style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg, var(--brand), var(--ai))", color: "white" }}>{m.ini}</span>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.cur} · {m.tenure} tenure</div>
              <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>{m.skills.map(s => <AX.Pill key={s} tone="var(--ink-2)" bg="var(--surface-2)" style={{ fontSize: 10.5 }}>{s}</AX.Pill>)}</div>
            </div>
            <div style={{ textAlign: "right", minWidth: 160 }}>
              <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Matched to</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-end" }}>{m.ai && <Icon name="sparkles" size={12} style={{ color: "var(--ai)" }} />}{m.to}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{m.reqId}</div>
            </div>
            {added[i] ? <AX.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">added</AX.Pill> : <AX.Btn variant="primary" size="sm" icon="plus" onClick={() => setAdded(a => ({ ...a, [i]: true }))}>Add to req</AX.Btn>}
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function PlatformJobsScreen() {
  const cols = "1.8fr 1.3fr 110px 90px 90px 90px";
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Job postings</h1>
          <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{window.PLAT_JOBS.filter(j => j.status === "published").length} published · pre-filled from your requisitions.</p></div>
        <AX.Btn variant="primary" icon="plus">Post a job</AX.Btn>
      </div>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "11px 18px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          <span>Posting</span><span>Channels</span><span>Status</span><span style={{ textAlign: "right" }}>Apps</span><span style={{ textAlign: "right" }}>Views</span><span></span>
        </div>
        {window.PLAT_JOBS.map((j, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "13px 18px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{j.title}</div><div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{j.reqId} · posted {j.posted}</div></div>
            <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{j.board}</span>
            <AX.Pill tone={j.status === "published" ? "var(--brand)" : "var(--ink-3)"} bg={j.status === "published" ? "var(--brand-tint)" : "var(--surface-3)"} icon={j.status === "published" ? "arrowUpRight" : "dot"} style={{ justifySelf: "start" }}>{j.status}</AX.Pill>
            <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{j.apps || ", "}</span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--ink-3)" }}>{j.views ? j.views.toLocaleString() : ", "}</span>
            <AX.Btn variant="soft" size="sm" style={{ justifySelf: "end" }}>{j.status === "published" ? "Unpublish" : "Publish"}</AX.Btn>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

Object.assign(window, { PlatformCostScreen, NotificationsScreen, MobilityScreen, PlatformJobsScreen });
