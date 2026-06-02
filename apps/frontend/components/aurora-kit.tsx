"use client";
// components/aurora-kit.tsx
// Aurora prototype primitives + dashboard kit, ported from
// claude-design/foundations.jsx and dash-kit.jsx. Inline-styled, theme-aware
// via the --c-* full-color tokens. These back the verbatim prototype-page
// ports (dashboards, analytics, shell). Palette var() refs use --c-* so they
// resolve to real colors (the bare --x channels are Tailwind-only).
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Icon } from "./aurora-icon";

type CSS = React.CSSProperties;

/* ----------------------------- primitives ----------------------------- */
export function Btn({
  variant = "soft", size = "md", icon, trailIcon, children, onClick, style = {}, disabled, type,
}: {
  variant?: "primary" | "ai" | "soft" | "ghost" | "danger" | "outlineAi";
  size?: "sm" | "md" | "lg";
  icon?: string; trailIcon?: string; children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; style?: CSS;
  disabled?: boolean; type?: "button" | "submit" | "reset";
}) {
  const pad = size === "sm" ? "6px 11px" : size === "lg" ? "11px 18px" : "8px 14px";
  const fs = size === "sm" ? "var(--fs-sm)" : "var(--fs-base)";
  const base: CSS = {
    display: "inline-flex", alignItems: "center", gap: 8, padding: pad, fontSize: fs,
    fontFamily: "var(--font-sans)", fontWeight: 600, borderRadius: "var(--r)", cursor: "pointer",
    border: "1px solid transparent", whiteSpace: "nowrap", lineHeight: 1,
    transition: "transform var(--t-fast) var(--ease-out), background var(--t) var(--ease-out), box-shadow var(--t) var(--ease-out), border-color var(--t)",
  };
  const V: Record<string, CSS> = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-ai)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface-2)", color: "var(--c-ink)", borderColor: "var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    danger: { background: "var(--c-danger-tint)", color: "var(--c-danger)", borderColor: "transparent" },
    outlineAi: { background: "var(--c-ai-tint)", color: "var(--c-ai-ink)", borderColor: "transparent" },
  };
  return (
    <button onClick={onClick} disabled={disabled} type={type}
      style={{ ...base, ...V[variant], ...(disabled ? { opacity: 0.55, cursor: "default", pointerEvents: "none" } : {}), ...style }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 16} />}
      {children}
      {trailIcon && <Icon name={trailIcon} size={size === "sm" ? 15 : 16} />}
    </button>
  );
}

export function Pill({
  children, tone = "var(--c-ink-2)", bg = "var(--c-surface-2)", icon, mono, style = {},
}: { children?: React.ReactNode; tone?: string; bg?: string; icon?: string; mono?: boolean; style?: CSS }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
      borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg, whiteSpace: "nowrap",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", letterSpacing: mono ? "-0.01em" : 0, textTransform: mono ? "none" : "capitalize", ...style }}>
      {icon && <Icon name={icon} size={12} />}{children}
    </span>
  );
}

/** Status badge, ALWAYS icon + word, never color alone. */
export function StatusBadge({ kind }: { kind: "pass" | "review" | "fail" | "open" | "draft" }) {
  const M = {
    pass: { t: "Pass", icon: "check", tone: "var(--c-ok)", bg: "var(--c-ok-tint)" },
    review: { t: "Review", icon: "eye", tone: "var(--c-warn)", bg: "var(--c-warn-tint)" },
    fail: { t: "No match", icon: "x", tone: "var(--c-danger)", bg: "var(--c-danger-tint)" },
    open: { t: "Open", icon: "dot", tone: "var(--c-brand)", bg: "var(--c-brand-tint)" },
    draft: { t: "Draft", icon: "dot", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  }[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px",
      borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: M.tone, background: M.bg }}>
      <Icon name={M.icon} size={13} stroke={2.2} />{M.t}
    </span>
  );
}

export function ScoreRing({
  value, size = 64, band = "var(--c-brand)", label = "match",
}: { value: number; size?: number; band?: string; label?: string; confidence?: number }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / 900); setV(value * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-line)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={band} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", lineHeight: 1 }}>
        <div style={{ textAlign: "center" }}>
          <div className="mono" style={{ fontSize: size > 56 ? 20 : 16, fontWeight: 600, color: "var(--c-ink)" }}>{Math.round(v)}</div>
          <div style={{ fontSize: 9, color: "var(--c-ink-3)", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

/** Confidence, separate from score; honest "verify recommended" zone. */
export function Confidence({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const low = value < 0.7;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-ai-ink)", display: "inline-flex", gap: 5, alignItems: "center" }}>
          <Icon name="sparkles" size={12} /> Model confidence
        </span>
        <span className="mono" style={{ fontSize: "var(--fs-xs)", fontWeight: 600, color: low ? "var(--c-warn)" : "var(--c-ai-ink)" }}>{pct}%</span>
      </div>
      <div style={{ position: "relative", height: 7, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 1, background: "var(--c-line-strong)", zIndex: 2 }} />
        <div style={{ height: "100%", width: pct + "%", borderRadius: 99,
          background: low ? "linear-gradient(90deg,var(--c-warn),var(--c-warn))" : "linear-gradient(90deg,var(--c-ai-2),var(--c-ai))",
          transition: "width 1s var(--ease-out)" }} />
      </div>
      <div style={{ fontSize: 11, color: low ? "var(--c-warn)" : "var(--c-ink-3)", display: "inline-flex", gap: 5, alignItems: "center" }}>
        <Icon name={low ? "flag" : "check"} size={12} />
        {low ? "Below threshold, human verification recommended" : "Confident, within auto-advance threshold"}
      </div>
    </div>
  );
}

export function CountUp({
  to, dur = 1100, fmt = (n: number) => Math.round(n).toLocaleString(), suffix = "",
}: { to: number; dur?: number; fmt?: (n: number) => string; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setN(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className="mono tnum">{fmt(n)}{suffix}</span>;
}

export function Spark({ data, w = 96, h = 30, color = "var(--c-brand)" }: { data: number[]; w?: number; h?: number; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * (h - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
}

/* --------------------------- dashboard kit --------------------------- */
/** Staggered entrance, with a safety net so content is always visible. */
export function Reveal({ i = 0, children, style = {} }: { i?: number; children?: React.ReactNode; style?: CSS }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => { el.style.animation = "none"; el.style.opacity = "1"; el.style.transform = "none"; }, (i * 60) + 750);
    return () => clearTimeout(t);
  }, []);
  return <div ref={ref} style={{ animation: `rise .5s var(--ease-out) both`, animationDelay: (i * 60) + "ms", ...style }}>{children}</div>;
}

export function Greeting({ title, sub, children }: { title: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 22 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</h1>
        {sub && <p style={{ margin: "6px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

type Stat = { label: string; value: number; icon: string; ai?: boolean; prefix?: string; suffix?: string; spark?: number[] };
/** Premium command-center hero band. */
export function CommandHero({
  title, sub, stats, live, onToggleLive, eyebrow = "Northwind Talent", children,
}: { title: React.ReactNode; sub?: React.ReactNode; stats: Stat[]; live?: boolean; onToggleLive?: () => void; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <Reveal>
      <div style={{ position: "relative", overflow: "hidden", borderRadius: "var(--r-2xl)", border: "1px solid var(--glass-edge)", marginBottom: 18,
        background: "var(--glass)", backdropFilter: "blur(var(--glass-blur)) saturate(150%)", WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(150%)",
        boxShadow: "var(--e2), inset 0 1px 0 var(--glass-line)" }}>
        <div className="hero-mesh" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9 }}>
          <i style={{ width: 280, height: 280, left: "-4%", top: "-70%", background: "radial-gradient(circle, var(--c-brand) 0%, transparent 68%)", opacity: 0.26, animation: "drift 16s var(--ease-io) infinite" }} />
          <i style={{ width: 240, height: 240, left: "32%", top: "-40%", background: "radial-gradient(circle, var(--c-ai) 0%, transparent 68%)", opacity: 0.2, animation: "drift 21s var(--ease-io) infinite reverse" }} />
          <i style={{ width: 200, height: 200, right: "-2%", top: "-30%", background: "radial-gradient(circle, var(--c-info) 0%, transparent 70%)", opacity: 0.14, animation: "drift 19s var(--ease-io) infinite" }} />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "22px 24px" }}>
          <div style={{ minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              {onToggleLive && (
                <button onClick={onToggleLive} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12, fontWeight: 700, color: live ? "var(--c-ok)" : "var(--c-ink-3)", fontFamily: "var(--font-sans)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: live ? "var(--c-ok)" : "var(--c-ink-3)", animation: live ? "livedot 1.7s infinite" : "none" }} />
                  {live ? "LIVE" : "PAUSED"}
                </button>
              )}
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{eyebrow}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.035em" }}>{title}</h1>
            {sub && <p style={{ margin: "6px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)", maxWidth: "44ch" }}>{sub}</p>}
            {children && <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>{children}</div>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ minWidth: 124, padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "color-mix(in oklab, var(--c-surface) 78%, transparent)",
                animation: "tickup .5s var(--ease-out) both", animationDelay: (140 + i * 90) + "ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--c-ink-2)", fontWeight: 600 }}>
                  <Icon name={s.icon} size={13} style={{ color: s.ai ? "var(--c-ai)" : "var(--c-ink-3)" }} />{s.label}
                </div>
                <div className="mono tnum" style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 7 }}>
                  <CountUp to={s.value} fmt={(n) => (s.prefix || "") + Math.round(n).toLocaleString() + (s.suffix || "")} />
                </div>
                {s.spark && <div style={{ marginTop: 6 }}><Spark data={s.spark} w={94} h={22} color={s.ai ? "var(--c-ai)" : "var(--c-brand)"} /></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function DeltaPill({ delta, good, suffix = "" }: { delta: number; good?: boolean; suffix?: string }) {
  if (delta === 0) return <Pill tone="var(--c-ink-3)" bg="transparent" icon="dot">no change</Pill>;
  const up = delta > 0;
  const tone = good ? "var(--c-ok)" : "var(--c-danger)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: tone }}>
      <Icon name="arrowUpRight" size={13} style={{ transform: up ? "none" : "rotate(90deg)" }} />
      {up ? "+" : ""}{delta}{suffix}
    </span>
  );
}

export type Kpi = { id?: string; label: string; value: number; icon: string; spark: number[]; delta: number; good?: boolean; ai?: boolean; prefix?: string; suffix?: string };
export function KPICard({ k, i = 0 }: { k: Kpi; i?: number }) {
  const fmt = (n: number) => (k.prefix || "") + Math.round(n).toLocaleString() + (k.suffix || "");
  const accent = k.ai ? "var(--c-ai)" : k.good === false && k.delta !== 0 ? "var(--c-danger)" : "var(--c-brand)";
  return (
    <Reveal i={i}>
      <div className="kpi-prem" style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)", padding: "15px 16px 17px", boxShadow: "var(--e1)",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t), border-color var(--t)", cursor: "default" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--e2)"; e.currentTarget.style.borderColor = `color-mix(in oklab, ${accent} 40%, var(--c-line))`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.borderColor = "var(--c-line)"; }}>
        <span className="sheen" />
        {k.ai && <span style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, var(--c-ai-tint-2), transparent 70%)", animation: "breathe 3.4s var(--ease-io) infinite", pointerEvents: "none" }} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-ink-2)", fontWeight: 600 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: k.ai ? "var(--c-ai-tint)" : "var(--c-surface-2)", color: k.ai ? "var(--c-ai)" : "var(--c-ink-3)", transition: "transform var(--t) var(--ease-spring)" }}><Icon name={k.icon} size={14} /></span>
            {k.label}
          </span>
          {k.ai && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9, padding: "1px 6px" }}>AI</Pill>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 13, position: "relative" }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }} className="tnum"><CountUp to={k.value} fmt={fmt} /></div>
          <Spark data={k.spark} w={74} h={28} color={accent} />
        </div>
        <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 6 }}><DeltaPill delta={k.delta} good={k.good} suffix={k.suffix === "%" ? "%" : ""} /> <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>vs last period</span></div>
        <span className="accent-bar" style={{ background: `linear-gradient(90deg, ${accent}, color-mix(in oklab, ${accent} 25%, transparent))`, borderRadius: "0 0 var(--r-lg) var(--r-lg)", animationDelay: (i * 60 + 200) + "ms" }} />
      </div>
    </Reveal>
  );
}

export function KpiRow({ kpis, cols }: { kpis: Kpi[]; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols || kpis.length}, 1fr)`, gap: 14, marginBottom: 18 }}>
      {kpis.map((k, i) => <KPICard key={k.id || k.label} k={k} i={i} />)}
    </div>
  );
}

export function SectionCard({
  title, icon, action, onAction, children, pad = 18, style = {}, headRight,
}: { title: React.ReactNode; icon?: string; action?: string; onAction?: () => void; children?: React.ReactNode; pad?: number; style?: CSS; headRight?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", boxShadow: "var(--e1)", display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: "var(--fs-md)" }}>
          {icon && <Icon name={icon} size={16} style={{ color: "var(--c-ink-3)" }} />}{title}
        </div>
        {headRight || (action && <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: "var(--c-brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{action}<Icon name="chevR" size={13} /></button>)}
      </div>
      <div style={{ padding: pad, flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

export function Funnel({ stages }: { stages: { stage: string; n: number; color: string }[] }) {
  const max = stages[0]?.n || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {stages.map((s, i) => {
        const pct = (s.n / max) * 100;
        const conv = i > 0 ? Math.round((s.n / stages[i - 1].n) * 100) : 100;
        return (
          <div key={s.stage} style={{ display: "grid", gridTemplateColumns: "92px 1fr 96px", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>{s.stage}</span>
            <div style={{ height: 30, borderRadius: 8, background: "var(--c-surface-2)", overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: pct + "%", background: `color-mix(in oklab, ${s.color} 80%, transparent)`, borderRadius: 8,
                animation: "growx 1s var(--ease-out) both", animationDelay: (i * 90) + "ms", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: i < 1 ? "var(--c-ink)" : "white" }}>{s.n.toLocaleString()}</span>
              </div>
            </div>
            <span style={{ textAlign: "right", fontSize: 11.5, color: "var(--c-ink-3)" }} className="mono">{i > 0 ? conv + "% conv" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TrendArea({ data, labels, color = "var(--c-brand)" }: { data: number[]; labels: string[]; unit?: string; color?: string }) {
  const w = 520, h = 150, pad = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2 - 16);
  const line = data.map((d, i) => `${x(i)}, ${y(d)}`).join(" ");
  const area = `${x(0)}, ${h - 14} ${line} ${x(data.length - 1)}, ${h - 14}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="none">
        <defs><linearGradient id="taFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient></defs>
        {[0, 0.5, 1].map((g) => <line key={g} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2 - 16)} y2={pad + g * (h - pad * 2 - 16)} stroke="var(--c-line)" strokeWidth="1" />)}
        <polygon points={area} fill="url(#taFill)" style={{ animation: "fadein 1.2s var(--ease-out) both", animationDelay: ".3s" }} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          pathLength="1" style={{ strokeDasharray: 1, animation: "draw 1.3s var(--ease-out) both" }} />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d)} r={i === data.length - 1 ? 4 : 0} fill={color} style={{ animation: "fadein .4s 1.2s both" }} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {labels.filter((_, i) => i % 2 === 0).map((l) => <span key={l} className="mono" style={{ fontSize: 10, color: "var(--c-ink-3)" }}>{l}</span>)}
      </div>
    </div>
  );
}

export function Donut({ data, size = 150, center }: { data: { g: string; v: number; color: string }[]; size?: number; center?: { value: string; label: string } }) {
  const r = (size - 26) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {data.map((d, i) => {
            const len = (d.v / 100) * c, off = acc; acc += len;
            return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth="13"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off}
              style={{ animation: "fadein .9s var(--ease-out) both", animationDelay: (i * 120) + "ms" }} />;
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center" }}><div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>{center?.value ?? "0.78"}</div><div style={{ fontSize: 9.5, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{center?.label ?? "index"}</div></div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {data.map((d) => (
          <div key={d.g} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ flex: 1, color: "var(--c-ink-2)" }}>{d.g}</span>
            <span className="mono tnum" style={{ fontWeight: 600 }}>{d.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Timeline({ items }: { items: { who: string; what: string; t: string; ic: string; ai?: boolean }[] }) {
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0,
              background: it.ai ? "var(--c-ai-tint)" : "var(--c-surface-2)", color: it.ai ? "var(--c-ai)" : "var(--c-ink-2)", border: "1px solid var(--c-line)" }}><Icon name={it.ic} size={13} /></span>
            {i < items.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--c-line)", minHeight: 10 }} />}
          </div>
          <div style={{ paddingBottom: 14 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              <b style={{ color: "var(--c-ink)" }}>{it.who}</b> <span style={{ color: "var(--c-ink-2)" }}>{it.what}</span>
              {it.ai && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9, padding: "0 5px", marginLeft: 6 }}>AI</Pill>}
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>{it.t} ago</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PendingList({ items }: { items: { title: string; meta: string; ic: string; tone: "ok" | "warn" | "danger"; ai?: boolean }[] }) {
  const tones: Record<string, [string, string]> = { ok: ["var(--c-ok)", "var(--c-ok-tint)"], warn: ["var(--c-warn)", "var(--c-warn-tint)"], danger: ["var(--c-danger)", "var(--c-danger-tint)"] };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => {
        const [tc, tb] = tones[it.tone];
        return (
          <button key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", textAlign: "left", transition: "all var(--t-fast)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tc; e.currentTarget.style.background = tb; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-surface)"; }}>
            <span style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", flexShrink: 0, color: tc, background: tb }}><Icon name={it.ic} size={16} /></span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "flex", gap: 6, alignItems: "center" }}>{it.title}{it.ai && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9, padding: "0 5px" }}>AI</Pill>}</span>
              <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{it.meta}</span>
            </span>
            <Icon name="chevR" size={15} style={{ color: "var(--c-ink-3)" }} />
          </button>
        );
      })}
    </div>
  );
}
