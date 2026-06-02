/* foundations.jsx, shared primitives + the Design System showcase page */
const { useState, useEffect, useRef } = React;

/* ---------------- shared primitives (reused by the shell) ---------------- */
function Btn({ variant = "soft", size = "md", icon, trailIcon, children, onClick, style = {}, ai }) {
  const pad = size === "sm" ? "6px 11px" : size === "lg" ? "11px 18px" : "8px 14px";
  const fs = size === "sm" ? "var(--fs-sm)" : "var(--fs-base)";
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: pad, fontSize: fs,
    fontFamily: "var(--font-sans)", fontWeight: 600, borderRadius: "var(--r)", cursor: "pointer",
    border: "1px solid transparent", whiteSpace: "nowrap", lineHeight: 1,
    transition: "transform var(--t-fast) var(--ease-out), background var(--t) var(--ease-out), box-shadow var(--t) var(--ease-out), border-color var(--t)",
  };
  const V = {
    primary: { background: "var(--brand)", color: "var(--on-brand)", boxShadow: "var(--e1)" },
    ai:      { background: "var(--ai)", color: "var(--on-ai)", boxShadow: "var(--e1)" },
    soft:    { background: "var(--surface-2)", color: "var(--ink)", borderColor: "var(--line-2)" },
    ghost:   { background: "transparent", color: "var(--ink-2)" },
    danger:  { background: "var(--danger-tint)", color: "var(--danger)", borderColor: "transparent" },
    outlineAi:{ background: "var(--ai-tint)", color: "var(--ai-ink)", borderColor: "transparent" },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...V[variant], ...style }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 16} />}
      {children}
      {trailIcon && <Icon name={trailIcon} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}

function Pill({ children, tone = "var(--ink-2)", bg = "var(--surface-2)", icon, mono, style = {} }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
      borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg, whiteSpace: "nowrap",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", letterSpacing: mono ? "-0.01em" : 0, textTransform: mono ? "none" : "capitalize", ...style }}>
      {icon && <Icon name={icon} size={12} />}{children}
    </span>
  );
}

/* status badge, ALWAYS icon + word, never color alone */
function StatusBadge({ kind }) {
  const M = {
    pass:   { t: "Pass",   icon: "check", tone: "var(--ok)",     bg: "var(--ok-tint)" },
    review: { t: "Review", icon: "eye",   tone: "var(--warn)",   bg: "var(--warn-tint)" },
    fail:   { t: "No match",icon: "x",    tone: "var(--danger)", bg: "var(--danger-tint)" },
    open:   { t: "Open",   icon: "dot",   tone: "var(--brand)",  bg: "var(--brand-tint)" },
    draft:  { t: "Draft",  icon: "dot",   tone: "var(--ink-3)",  bg: "var(--surface-3)" },
  }[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px",
      borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: M.tone, background: M.bg }}>
      <Icon name={M.icon} size={13} stroke={2.2} />{M.t}
    </span>
  );
}

function ScoreRing({ value, size = 64, band = "var(--brand)", label = "match", confidence }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => { let raf; const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / 900); setV(value * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={band} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (v/100)*c} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", lineHeight: 1 }}>
        <div style={{ textAlign: "center" }}>
          <div className="mono" style={{ fontSize: size > 56 ? 20 : 16, fontWeight: 600, color: "var(--ink)" }}>{Math.round(v)}</div>
          <div style={{ fontSize: 9, color: "var(--ink-3)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

/* confidence, separate from score; honest "verify recommended" zone */
function Confidence({ value }) {
  const pct = Math.round(value * 100);
  const low = value < 0.7;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--ai-ink)", display: "inline-flex", gap: 5, alignItems: "center" }}>
          <Icon name="sparkles" size={12} /> Model confidence
        </span>
        <span className="mono" style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: low ? "var(--warn)" : "var(--ai-ink)" }}>{pct}%</span>
      </div>
      <div style={{ position: "relative", height: 7, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 1, background: "var(--line-strong)", zIndex: 2 }} />
        <div style={{ height: "100%", width: pct + "%", borderRadius: 99,
          background: low ? "linear-gradient(90deg,var(--warn),var(--warn))" : "linear-gradient(90deg,var(--ai-2),var(--ai))",
          transition: "width 1s var(--ease-out)" }} />
      </div>
      <div style={{ fontSize: 11, color: low ? "var(--warn)" : "var(--ink-3)", display: "inline-flex", gap: 5, alignItems: "center" }}>
        <Icon name={low ? "flag" : "check"} size={12} />
        {low ? "Below threshold, human verification recommended" : "Confident, within auto-advance threshold"}
      </div>
    </div>
  );
}

function CountUp({ to, dur = 1100, fmt = (n) => Math.round(n).toLocaleString(), suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => { let raf; const t0 = performance.now();
    const tick = (t) => { const k = Math.min(1, (t - t0) / dur); setN(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className="mono tnum">{fmt(n)}{suffix}</span>;
}

function Spark({ data, w = 96, h = 30, color = "var(--brand)" }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => `${(i/(data.length-1))*w},${h - ((d-min)/(max-min||1))*(h-4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length-1]-min)/(max-min||1))*(h-4) - 2} r="2.5" fill={color} />
    </svg>
  );
}

/* ---------------- showcase building blocks ---------------- */
const fStyles = {
  card: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", padding: 22, boxShadow: "var(--e1)" },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" },
  h2: { fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "var(--ink)" },
};

function SectionHead({ icon, kicker, title, desc }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
      <div style={{ width: 38, height: 38, borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0,
        background: "var(--brand-tint)", color: "var(--brand)", flexShrink: 0 }}>
        <Icon name={icon} size={19} style={{ display: "block" }} />
      </div>
      <div>
        <div style={fStyles.label}>{kicker}</div>
        <h2 style={fStyles.h2}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)", maxWidth: 640 }}>{desc}</p>}
      </div>
    </div>
  );
}

function Swatch({ name, varName, oklch, big, on = "var(--on-brand)" }) {
  return (
    <div style={{ flex: big ? "1 1 150px" : "1 1 96px" }}>
      <div style={{ height: big ? 76 : 54, borderRadius: "var(--r-lg)", background: varName, border: "1px solid oklch(0 0 0 / .06)",
        boxShadow: "var(--e1)", display: "flex", alignItems: "flex-end", padding: 8 }}>
        {big && <span className="mono" style={{ fontSize: 10, color: on, opacity: .9 }}>{varName.replace("var(","").replace(")","")}</span>}
      </div>
      <div style={{ marginTop: 7, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--ink)" }}>{name}</div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{oklch}</div>
    </div>
  );
}

window.UI = { Btn, Pill, StatusBadge, ScoreRing, Confidence, CountUp, Spark, fStyles, SectionHead, Swatch };
