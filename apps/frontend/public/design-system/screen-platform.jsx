/* screen-platform.jsx, Super-admin platform console (operator-dense) */
const { useState: uSpl } = React;
const PL = window.UI;
const PLAN_T = { FREE: "var(--ink-3)", STARTER: "var(--info)", PROFESSIONAL: "var(--brand)", ENTERPRISE: "var(--ai)" };
const HEALTH = { healthy: ["var(--ok)", "var(--ok-tint)"], watch: ["var(--warn)", "var(--warn-tint)"], over: ["var(--danger)", "var(--danger-tint)"], degraded: ["var(--warn)", "var(--warn-tint)"], paused: ["var(--ink-3)", "var(--surface-3)"], deployed: ["var(--ok)", "var(--ok-tint)"] };

function OpHead({ title, sub, right }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
    <div><div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h1><PL.Pill icon="bolt" tone="var(--danger)" bg="var(--danger-tint)">platform operator</PL.Pill></div>
      <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>{sub}</p></div>{right}</div>;
}

function TenantsScreen() {
  const [q, setQ] = uSpl("");
  const [imp, setImp] = uSpl(null);
  const rows = window.TENANTS.filter(t => !q || (t.name + t.plan).toLowerCase().includes(q.toLowerCase()));
  const cols = "1.8fr 110px 80px 90px 90px 90px 100px 110px";
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <OpHead title="Tenants" sub="142 active tenants · cross-tenant cost, usage, and health." right={<PL.Btn variant="soft" icon="arrowUpRight">Export</PL.Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>{window.PLAT_KPIS.map((k, i) => <window.KPICard key={k.id} k={k} i={i} />)}</div>
      {imp && <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 28%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
        <Icon name="bolt" size={17} style={{ color: "var(--ai)" }} /><span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Impersonation started for <b>{imp}</b>, a persistent safety banner now appears app-wide (switch role to Platform to see it). Auto-expires in 60:00.</span>
        <PL.Btn variant="soft" size="sm" onClick={() => setImp(null)} style={{ marginLeft: "auto" }}>End</PL.Btn>
      </div>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 12px", height: 36, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", maxWidth: 300 }}>
        <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tenants…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
      </div>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          <span>Tenant</span><span>Plan</span><span style={{ textAlign: "right" }}>Users</span><span style={{ textAlign: "right" }}>MRR</span><span style={{ textAlign: "right" }}>Cost</span><span style={{ textAlign: "right" }}>Runs</span><span style={{ textAlign: "center" }}>Health</span><span></span>
        </div>
        {rows.map((t, i) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "11px 16px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}><span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 10, background: "color-mix(in oklab," + PLAN_T[t.plan] + " 16%, var(--surface))", color: PLAN_T[t.plan] }}>{t.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</span><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div><div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>/{t.slug} · {t.created}</div></div></div>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: PLAN_T[t.plan], background: "color-mix(in oklab," + PLAN_T[t.plan] + " 13%, transparent)", padding: "2px 7px", borderRadius: 5, justifySelf: "start" }}>{t.plan}</span>
            <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right" }}>{t.users}</span>
            <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>${t.mrr.toLocaleString()}</span>
            <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", color: t.health === "over" ? "var(--danger)" : "var(--ink-2)" }}>${t.cost}</span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--ink-3)" }}>{t.runs}</span>
            <span style={{ justifySelf: "center" }}><PL.Pill tone={HEALTH[t.health][0]} bg={HEALTH[t.health][1]} icon={t.health === "healthy" ? "check" : t.health === "over" ? "flag" : "eye"} style={{ fontSize: 10 }}>{t.health}</PL.Pill></span>
            <PL.Btn variant="outlineAi" size="sm" icon="eye" onClick={() => setImp(t.name)} style={{ justifySelf: "end" }}>Impersonate</PL.Btn>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function PlatformAgentsScreen() {
  const [agents, setAgents] = uSpl(window.PLAT_AGENTS.map(a => ({ ...a })));
  const toggle = (n) => setAgents(agents.map(a => a.n === n ? { ...a, status: a.status === "paused" ? "deployed" : "paused" } : a));
  const cols = "1.5fr 90px 90px 100px 80px 120px 130px";
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <OpHead title="Platform agents" sub="Every agent instance across all tenants · deploy, pause, kill." right={<PL.Btn variant="primary" icon="plus">Deploy agent</PL.Btn>} />
      <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--danger-tint)", border: "1px solid color-mix(in oklab, var(--danger) 24%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)" }}>
        <Icon name="bolt" size={16} style={{ color: "var(--danger)", flexShrink: 0 }} /><span><b style={{ color: "var(--danger)" }}>Kill-switch:</b> pausing an agent immediately halts it for all tenants and falls back to human-only flows. Use with care.</span>
      </div>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          <span>Agent</span><span style={{ textAlign: "right" }}>Tenants</span><span style={{ textAlign: "right" }}>Runs</span><span style={{ textAlign: "right" }}>Cost/mo</span><span style={{ textAlign: "right" }}>Err %</span><span style={{ textAlign: "center" }}>Status</span><span style={{ textAlign: "right" }}>Kill-switch</span>
        </div>
        {agents.map((a, i) => (
          <div key={a.n} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "12px 16px", alignItems: "center", borderTop: i ? "1px solid var(--line)" : "none", opacity: a.status === "paused" ? 0.6 : 1 }}>
            <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)", flexShrink: 0 }}><Icon name="cpu" size={14} /></span><span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ai-ink)" }}>{a.n}</span></span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right" }}>{a.tenants}</span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right" }}>{a.runs}</span>
            <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>${a.cost.toLocaleString()}</span>
            <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: a.err > 1.5 ? "var(--danger)" : "var(--ink-3)" }}>{a.err}</span>
            <span style={{ justifySelf: "center" }}><PL.Pill tone={HEALTH[a.status][0]} bg={HEALTH[a.status][1]} icon={a.status === "deployed" ? "check" : a.status === "degraded" ? "eye" : "x"} style={{ fontSize: 10 }}>{a.status}</PL.Pill></span>
            <button onClick={() => toggle(a.n)} style={{ justifySelf: "end", display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: a.status === "paused" ? "var(--brand)" : "var(--danger)", background: a.status === "paused" ? "var(--brand-tint)" : "var(--danger-tint)", color: a.status === "paused" ? "var(--brand-ink)" : "var(--danger)", cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}>
              <Icon name={a.status === "paused" ? "check" : "x"} size={12} />{a.status === "paused" ? "Resume" : "Pause"}</button>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function PromptsScreen() {
  const p = window.PROMPTS;
  const [ver, setVer] = uSpl("v4.2");
  const [text, setText] = uSpl(p.current.text);
  const cur = p.versions.find(v => v.v === ver);
  return <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", height: "100%", minHeight: 0 }}>
    <aside style={{ borderRight: "1px solid var(--line)", overflowY: "auto", padding: "20px 14px", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, padding: "0 4px" }}><Icon name="terminal" size={17} style={{ color: "var(--ai)" }} /><h1 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Agent prompts</h1></div>
      <select value={p.current.agent} style={{ width: "100%", padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-mono)", cursor: "pointer", marginBottom: 14 }}>{p.agents.map(a => <option key={a}>{a}</option>)}</select>
      <div style={{ ...PL.fStyles.label, marginBottom: 8, padding: "0 4px" }}>Version history</div>
      {p.versions.map(v => (
        <button key={v.v} onClick={() => setVer(v.v)} style={{ width: "100%", textAlign: "left", display: "block", padding: "11px 12px", borderRadius: "var(--r)", border: "1px solid", borderColor: ver === v.v ? "var(--ai)" : "transparent", background: ver === v.v ? "var(--ai-tint)" : "transparent", cursor: "pointer", marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: ver === v.v ? "var(--ai-ink)" : "var(--ink)" }}>{v.v}</span>{v.live && <PL.Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check" style={{ fontSize: 9 }}>live</PL.Pill>}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 3 }}>{v.note}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>{v.date} · {v.author}</div>
        </button>
      ))}
    </aside>
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 26px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ flex: 1 }}><div style={{ display: "flex", gap: 9, alignItems: "center" }}><h2 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>candidate-screener</h2><PL.Pill mono tone="var(--ai-ink)" bg="var(--ai-tint)">{ver}</PL.Pill>{cur.live && <PL.Pill tone="var(--ok)" bg="var(--ok-tint)" icon="check">deployed · {p.current.tenants} tenants</PL.Pill>}</div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>{cur.date} · {cur.author}</div></div>
        {!cur.live && <PL.Btn variant="soft" icon="arrowUpRight">Roll back to {ver}</PL.Btn>}
        <PL.Btn variant="primary" icon="check">Save &amp; deploy</PL.Btn>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px" }}>
        <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center", padding: "11px 14px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)", fontSize: 12, color: "var(--ink-2)" }}>
          <Icon name="shield" size={15} style={{ color: "var(--ai)" }} /><span>Deploying pushes to all subscribed tenants. Changes are versioned and logged to the platform audit trail. Never expose secrets here.</span>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)} spellCheck={false} style={{ width: "100%", minHeight: 360, padding: "16px 18px", borderRadius: "var(--r-lg)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 13, fontFamily: "var(--font-mono)", lineHeight: 1.7, resize: "vertical", outline: "none" }} />
      </div>
    </div>
  </div>;
}

function PlanRequestsScreen() {
  const [items, setItems] = uSpl(window.PLAN_REQUESTS.map(r => ({ ...r })));
  const [done, setDone] = uSpl({});
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <OpHead title="Plan requests" sub={`${items.filter(r => !done[r.id]).length} pending upgrade requests from tenant admins.`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map(r => (
          <div key={r.id} style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)", opacity: done[r.id] ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{r.tenant}</span>
                  <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12 }}><span style={{ fontSize: 9.5, fontWeight: 800, color: PLAN_T[r.from], background: "color-mix(in oklab," + PLAN_T[r.from] + " 13%, transparent)", padding: "2px 7px", borderRadius: 5 }}>{r.from}</span><Icon name="arrowUpRight" size={13} style={{ color: "var(--ink-3)" }} /><span style={{ fontSize: 9.5, fontWeight: 800, color: PLAN_T[r.to], background: "color-mix(in oklab," + PLAN_T[r.to] + " 13%, transparent)", padding: "2px 7px", borderRadius: 5 }}>{r.to}</span></span>
                  <PL.Pill mono tone="var(--ok)" bg="var(--ok-tint)">{r.mrr} MRR</PL.Pill></div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 6 }}>{r.reason}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{r.by} · {r.when} ago</div>
              </div>
              {done[r.id] ? <PL.Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">{done[r.id]}</PL.Pill>
                : <div style={{ display: "flex", gap: 8 }}><PL.Btn variant="soft" size="sm" onClick={() => setDone(d => ({ ...d, [r.id]: "Denied" }))}>Deny</PL.Btn><PL.Btn variant="primary" size="sm" icon="check" onClick={() => setDone(d => ({ ...d, [r.id]: "Approved" }))}>Approve upgrade</PL.Btn></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

function PlatformAuditScreen() {
  const kindTone = { impersonation: "var(--ai)", deploy: "var(--info)", killswitch: "var(--danger)", billing: "var(--brand)", alert: "var(--warn)" };
  return <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <OpHead title="Platform audit" sub="System-wide trail, operator actions, deploys, kill-switches, agent alerts." right={<PL.Btn variant="soft" icon="arrowUpRight">Export</PL.Btn>} />
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
        {window.PLAT_AUDIT.map((a, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr 64px", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, background: "color-mix(in oklab," + kindTone[a.kind] + " 14%, transparent)", color: kindTone[a.kind] }}><Icon name={a.kind === "killswitch" ? "x" : a.kind === "deploy" ? "terminal" : a.kind === "impersonation" ? "eye" : a.kind === "billing" ? "card" : "flag"} size={13} /></span>{i < window.PLAT_AUDIT.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--line)", minHeight: 12 }} />}</div>
            <div style={{ paddingBottom: 16 }}><div style={{ fontSize: 12.5, lineHeight: 1.45 }}><b className="mono" style={{ fontSize: 12 }}>{a.who}</b> <span style={{ color: "var(--ink-2)" }}>{a.act}</span>{a.ai && <PL.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, marginLeft: 6 }}>AI</PL.Pill>}</div></div>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", textAlign: "right" }}>{a.t} ago</span>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

Object.assign(window, { TenantsScreen, PlatformAgentsScreen, PromptsScreen, PlanRequestsScreen, PlatformAuditScreen });
