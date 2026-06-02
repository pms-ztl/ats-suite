/* dash-kit.jsx, shared dashboard components & charts (animated draw-ins) */
const { useState: uSk, useEffect: uEk, useRef: uRk } = React;
const DUI = window.UI;

/* staggered entrance, with a safety net so content is always visible
   even if compositor (opacity/transform) animations are throttled in a
   backgrounded tab/iframe. */
function Reveal({ i = 0, children, style = {} }) {
  const ref = uRk();
  uEk(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => { el.style.animation = "none"; el.style.opacity = "1"; el.style.transform = "none"; }, (i * 60) + 750);
    return () => clearTimeout(t);
  }, []);
  return <div ref={ref} style={{ animation: `rise .5s var(--ease-out) both`, animationDelay: (i * 60) + "ms", ...style }}>{children}</div>;
}

function Greeting({ title, sub, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 22 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</h1>
        <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{sub}</p>
      </div>
      <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

/* premium command-center hero band */
function CommandHero({ title, sub, stats, live, onToggleLive, children }) {
  return (
    <Reveal>
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-2xl)", border: "1px solid var(--glass-edge)", marginBottom: 18,
      background: "var(--glass)", backdropFilter: "blur(var(--glass-blur)) saturate(150%)", WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(150%)",
      boxShadow: "var(--e2), inset 0 1px 0 var(--glass-line)" }}>
      <div className="hero-mesh" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: .9 }}>
        <i style={{ width: 280, height: 280, left: "-4%", top: "-70%", background: "radial-gradient(circle, var(--brand) 0%, transparent 68%)", opacity: .26, animation: "drift 16s var(--ease-io) infinite" }} />
        <i style={{ width: 240, height: 240, left: "32%", top: "-40%", background: "radial-gradient(circle, var(--ai) 0%, transparent 68%)", opacity: .2, animation: "drift 21s var(--ease-io) infinite reverse" }} />
        <i style={{ width: 200, height: 200, right: "-2%", top: "-30%", background: "radial-gradient(circle, var(--info) 0%, transparent 70%)", opacity: .14, animation: "drift 19s var(--ease-io) infinite" }} />
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "22px 24px" }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            {onToggleLive && (
              <button onClick={onToggleLive} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: "var(--r-pill)", border: "1px solid var(--line-2)", background: "var(--surface)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: live ? "var(--ok)" : "var(--ink-3)", fontFamily: "var(--font-sans)" }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: live ? "var(--ok)" : "var(--ink-3)", animation: live ? "livedot 1.7s infinite" : "none" }} />
                {live ? "LIVE" : "PAUSED"}
              </button>
            )}
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>Northwind Talent</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.035em" }}>{title}</h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)", maxWidth: "44ch" }}>{sub}</p>
          {children && <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>{children}</div>}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ minWidth: 124, padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "color-mix(in oklab, var(--surface) 78%, transparent)",
              animation: "tickup .5s var(--ease-out) both", animationDelay: (140 + i * 90) + "ms" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>
                <Icon name={s.icon} size={13} style={{ color: s.ai ? "var(--ai)" : "var(--ink-3)" }} />{s.label}
              </div>
              <div className="mono tnum" style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 7 }}>
                <DUI.CountUp to={s.value} fmt={(n) => (s.prefix || "") + Math.round(n).toLocaleString() + (s.suffix || "")} />
              </div>
              {s.spark && <div style={{ marginTop: 6 }}><DUI.Spark data={s.spark} w={94} h={22} color={s.ai ? "var(--ai)" : "var(--brand)"} /></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
    </Reveal>
  );
}

function DeltaPill({ delta, good, suffix = "" }) {
  if (delta === 0) return <DUI.Pill tone="var(--ink-3)" bg="transparent" icon="dot">no change</DUI.Pill>;
  const up = delta > 0;
  const tone = good ? "var(--ok)" : "var(--danger)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: tone }}>
      <Icon name="arrowUpRight" size={13} style={{ transform: up ? "none" : "rotate(90deg)" }} />
      {up ? "+" : ""}{delta}{suffix}
    </span>
  );
}

function KPICard({ k, i }) {
  const fmt = (n) => (k.prefix || "") + Math.round(n).toLocaleString() + (k.suffix || "");
  const accent = k.ai ? "var(--ai)" : k.good === false && k.delta !== 0 ? "var(--danger)" : "var(--brand)";
  return (
    <Reveal i={i}>
      <div className="kpi-prem" style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "15px 16px 17px", boxShadow: "var(--e1)",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t), border-color var(--t)", cursor: "default" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--e2)"; e.currentTarget.style.borderColor = `color-mix(in oklab, ${accent} 40%, var(--line))`; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
        <span className="sheen" />
        {k.ai && <span style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, var(--ai-tint-2), transparent 70%)", animation: "breathe 3.4s var(--ease-io) infinite", pointerEvents: "none" }} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: k.ai ? "var(--ai-tint)" : "var(--surface-2)", color: k.ai ? "var(--ai)" : "var(--ink-3)", transition: "transform var(--t) var(--ease-spring)" }}><Icon name={k.icon} size={14} /></span>
            {k.label}
          </span>
          {k.ai && <DUI.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, padding: "1px 6px" }}>AI</DUI.Pill>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 13, position: "relative" }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }} className="tnum"><DUI.CountUp to={k.value} fmt={fmt} /></div>
          <DUI.Spark data={k.spark} w={74} h={28} color={accent} />
        </div>
        <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 6 }}><DeltaPill delta={k.delta} good={k.good} suffix={k.suffix === "%" ? "%" : ""} /> <span style={{ fontSize: 11, color: "var(--ink-3)" }}>vs last period</span></div>
        <span className="accent-bar" style={{ background: `linear-gradient(90deg, ${accent}, color-mix(in oklab, ${accent} 25%, transparent))`, borderRadius: "0 0 var(--r-lg) var(--r-lg)", animationDelay: (i * 60 + 200) + "ms" }} />
      </div>
    </Reveal>
  );
}

function SectionCard({ title, icon, action, children, pad = 18, style = {}, headRight }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", boxShadow: "var(--e1)", display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: "var(--fs-md)" }}>
          {icon && <Icon name={icon} size={16} style={{ color: "var(--ink-3)" }} />}{title}
        </div>
        {headRight || (action && <button style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{action}<Icon name="chevR" size={13} /></button>)}
      </div>
      <div style={{ padding: pad, flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

/* ---- pipeline funnel ---- */
function Funnel({ stages }) {
  const max = stages[0].n;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {stages.map((s, i) => {
        const pct = (s.n / max) * 100;
        const conv = i > 0 ? Math.round((s.n / stages[i-1].n) * 100) : 100;
        return (
          <div key={s.stage} style={{ display: "grid", gridTemplateColumns: "92px 1fr 96px", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>{s.stage}</span>
            <div style={{ height: 30, borderRadius: 8, background: "var(--surface-2)", overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: pct + "%", background: `color-mix(in oklab, ${s.color} 80%, transparent)`, borderRadius: 8,
                animation: "growx 1s var(--ease-out) both", animationDelay: (i*90)+"ms", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: i < 1 ? "var(--ink)" : "white" }}>{s.n.toLocaleString()}</span>
              </div>
            </div>
            <span style={{ textAlign: "right", fontSize: 11.5, color: "var(--ink-3)" }} className="mono">{i > 0 ? conv + "% conv" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---- time-to-hire area trend (draw-in) ---- */
function TrendArea({ data, labels, unit = "d", color = "var(--brand)" }) {
  const w = 520, h = 150, pad = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const x = (i) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2 - 16);
  const line = data.map((d, i) => `${x(i)}, ${y(d)}`).join(" ");
  const area = `${x(0)}, ${h - 14} ${line} ${x(data.length-1)}, ${h - 14}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="none">
        <defs><linearGradient id="taFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        {[0, 0.5, 1].map(g => <line key={g} x1={pad} x2={w-pad} y1={pad + g*(h-pad*2-16)} y2={pad + g*(h-pad*2-16)} stroke="var(--line)" strokeWidth="1" />)}
        <polygon points={area} fill="url(#taFill)" style={{ animation: "fadein 1.2s var(--ease-out) both", animationDelay: ".3s" }} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          pathLength="1" style={{ strokeDasharray: 1, animation: "draw 1.3s var(--ease-out) both" }} />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d)} r={i === data.length-1 ? 4 : 0} fill={color} style={{ animation: "fadein .4s 1.2s both" }} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {labels.filter((_, i) => i % 2 === 0).map(l => <span key={l} className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{l}</span>)}
      </div>
    </div>
  );
}

/* ---- diversity donut (draw-in) ---- */
function Donut({ data, size = 150 }) {
  const r = (size - 26) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {data.map((d, i) => {
            const len = (d.v / 100) * c, off = acc; acc += len;
            return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth="13"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off}
              style={{ animation: "fadein .9s var(--ease-out) both", animationDelay: (i*120)+"ms" }} />;
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center" }}><div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>0.78</div><div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>index</div></div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {data.map(d => (
          <div key={d.g} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--ink-2)" }}>{d.g}</span>
            <span className="mono tnum" style={{ fontWeight: 600 }}>{d.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- activity timeline ---- */
function Timeline({ items }) {
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0,
              background: it.ai ? "var(--ai-tint)" : "var(--surface-2)", color: it.ai ? "var(--ai)" : "var(--ink-2)", border: "1px solid var(--line)" }}><Icon name={it.ic} size={13} /></span>
            {i < items.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--line)", minHeight: 10 }} />}
          </div>
          <div style={{ paddingBottom: 14 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              <b style={{ color: "var(--ink)" }}>{it.who}</b> <span style={{ color: "var(--ink-2)" }}>{it.what}</span>
              {it.ai && <DUI.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, padding: "0 5px", marginLeft: 6 }}>AI</DUI.Pill>}
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{it.t} ago</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- pending actions ---- */
function PendingList({ items }) {
  const tones = { ok: ["var(--ok)", "var(--ok-tint)"], warn: ["var(--warn)", "var(--warn-tint)"], danger: ["var(--danger)", "var(--danger-tint)"] };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => {
        const [tc, tb] = tones[it.tone];
        return (
          <button key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", textAlign: "left", transition: "all var(--t-fast)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = tc; e.currentTarget.style.background = tb; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}>
            <span style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", flexShrink: 0, color: tc, background: tb }}><Icon name={it.ic} size={16} /></span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "flex", gap: 6, alignItems: "center" }}>{it.title}{it.ai && <DUI.Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, padding: "0 5px" }}>AI</DUI.Pill>}</span>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{it.meta}</span>
            </span>
            <Icon name="chevR" size={15} style={{ color: "var(--ink-3)" }} />
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { Reveal, Greeting, CommandHero, DeltaPill, KPICard, SectionCard, Funnel, TrendArea, Donut, Timeline, PendingList });
