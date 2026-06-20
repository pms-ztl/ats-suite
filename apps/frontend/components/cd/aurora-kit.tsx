"use client";
// components/aurora-kit.tsx
// The rich Aurora kit, ported pixel-exact from dash-kit.jsx + the chart/score
// primitives in foundations.jsx. Production TSX, data-driven via typed props.
// No internal fetching, no hardcoded mock data. Animations rely on the keyframes
// in motion.css (rise, drift, livedot, tickup, growx, fadein, draw, breathe).
//
// Primitives here (not in components/aurora.tsx): Pill, DeltaPill, CountUp, Spark,
// ScoreRing, Confidence. Plus the dashboard kit: Reveal, Greeting, CommandHero,
// KPICard, KpiRow, SectionCard, Funnel, TrendArea, Donut, Timeline, PendingList.
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Icon, type IconName } from "./icon";
import type {
  KPI, HeroStat, FunnelStage, DonutDatum, TimelineItem, PendingItem,
} from "./types";

/* ----- fStyles -----
   Shared form styles for the form-heavy CD screens (intake, settings, billing,
   requisition builder, copilot, platform). The only member those screens consume
   is fStyles.label (the standard uppercase field label, matching the LABEL style
   used verbatim across the other screens); input/hint are provided for parity.
   Permissive Record type so any fStyles.* access stays graceful. */
export const fStyles: Record<string, React.CSSProperties> = {
  label: { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" },
  input: { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" },
  hint: { fontSize: 11.5, color: "var(--ink-3)", marginTop: 5 },
};

/* ----------------------------- Pill ----------------------------- */
export function Pill({
  children, tone = "var(--ink-2)", bg = "var(--surface-2)", icon, mono, style = {},
}: {
  children: React.ReactNode; tone?: string; bg?: string; icon?: IconName; mono?: boolean; style?: React.CSSProperties;
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
      borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg, whiteSpace: "nowrap",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", letterSpacing: mono ? "-0.01em" : 0, textTransform: mono ? "none" : "capitalize", ...style,
    }}>
      {icon && <Icon name={icon} size={12} />}{children}
    </span>
  );
}

/* --------------------------- CountUp ---------------------------- */
export function CountUp({
  to, dur = 1100, fmt = (n: number) => Math.round(n).toLocaleString(), suffix = "",
}: { to: number; dur?: number; fmt?: (n: number) => string; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / dur); setN(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span className="mono tnum">{fmt(n)}{suffix}</span>;
}

/* ---------------------------- Spark ----------------------------- */
export function Spark({ data, w = 96, h = 30, color = "var(--brand)" }: { data: number[]; w?: number; h?: number; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length - 1] - min) / (max - min || 1)) * (h - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
}

/* -------------------------- ScoreRing --------------------------- */
export function ScoreRing({ value, size = 64, band = "var(--brand)", label = "match" }: { value: number; size?: number; band?: string; label?: string }) {
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={band} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} />
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

/* -------------------------- Confidence -------------------------- */
// Separate from score; honest "verify recommended" zone below the 0.70 threshold.
export function Confidence({ value }: { value: number }) {
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
        <div style={{ height: "100%", width: pct + "%", borderRadius: 99, background: low ? "linear-gradient(90deg,var(--warn),var(--warn))" : "linear-gradient(90deg,var(--ai-2),var(--ai))", transition: "width 1s var(--ease-out)" }} />
      </div>
      <div style={{ fontSize: 11, color: low ? "var(--warn)" : "var(--ink-3)", display: "inline-flex", gap: 5, alignItems: "center" }}>
        <Icon name={low ? "flag" : "check"} size={12} />
        {low ? "Below threshold, human verification recommended" : "Confident, within auto-advance threshold"}
      </div>
    </div>
  );
}

/* ---------------------------- Reveal ---------------------------- */
// Staggered entrance with a safety net so content is always visible even if
// compositor animations are throttled in a backgrounded tab.
export function Reveal({ i = 0, children, style = {} }: { i?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const t = setTimeout(() => { el.style.animation = "none"; el.style.opacity = "1"; el.style.transform = "none"; }, i * 60 + 750);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={ref} style={{ animation: "rise .5s var(--ease-out) both", animationDelay: i * 60 + "ms", ...style }}>{children}</div>;
}

/* --------------------------- Greeting --------------------------- */
export function Greeting({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 22 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</h1>
        {sub && <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>{sub}</p>}
      </div>
      <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

/* -------------------------- DeltaPill --------------------------- */
export function DeltaPill({ delta, good, suffix = "" }: { delta: number | null; good?: boolean; suffix?: string }) {
  // Absent prior period -> render nothing (no fabricated "no change" / 0%).
  if (delta === null || delta === undefined) return null;
  if (delta === 0) return <Pill tone="var(--ink-3)" bg="transparent" icon="dot">no change</Pill>;
  const up = delta > 0;
  const tone = good ? "var(--ok)" : "var(--danger)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: tone }}>
      <Icon name="arrowUpRight" size={13} style={{ transform: up ? "none" : "rotate(90deg)" }} />
      {up ? "+" : ""}{delta}{suffix}
    </span>
  );
}

/* ------------------------- CommandHero -------------------------- */
export function CommandHero({
  title, sub, workspace, stats, live, onToggleLive, children,
}: {
  title: string; sub?: string; workspace?: string; stats: HeroStat[]; live?: boolean; onToggleLive?: () => void; children?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div style={{
        position: "relative", overflow: "hidden", borderRadius: "var(--r-2xl)", border: "1px solid var(--glass-edge)", marginBottom: 18,
        background: "var(--glass)", backdropFilter: "blur(var(--glass-blur)) saturate(150%)", WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(150%)",
        boxShadow: "var(--e2), inset 0 1px 0 var(--glass-line)",
      }}>
        <div className="hero-mesh" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9 }}>
          <i style={{ position: "absolute", width: 280, height: 280, left: "-4%", top: "-70%", borderRadius: "50%", filter: "blur(50px)", background: "radial-gradient(circle, var(--brand) 0%, transparent 68%)", opacity: 0.26, animation: "drift 16s var(--ease-io) infinite" }} />
          <i style={{ position: "absolute", width: 240, height: 240, left: "32%", top: "-40%", borderRadius: "50%", filter: "blur(50px)", background: "radial-gradient(circle, var(--ai) 0%, transparent 68%)", opacity: 0.2, animation: "drift 21s var(--ease-io) infinite reverse" }} />
          <i style={{ position: "absolute", width: 200, height: 200, right: "-2%", top: "-30%", borderRadius: "50%", filter: "blur(50px)", background: "radial-gradient(circle, var(--info) 0%, transparent 70%)", opacity: 0.14, animation: "drift 19s var(--ease-io) infinite" }} />
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
              {workspace && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em" }}>{workspace}</span>}
            </div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.035em" }}>{title}</h1>
            {sub && <p style={{ margin: "6px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)", maxWidth: "44ch" }}>{sub}</p>}
            {children && <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>{children}</div>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ minWidth: 124, padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "color-mix(in oklab, var(--surface) 78%, transparent)", animation: "tickup .5s var(--ease-out) both", animationDelay: 140 + i * 90 + "ms" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>
                  <Icon name={s.icon} size={13} style={{ color: s.ai ? "var(--ai)" : "var(--ink-3)" }} />{s.label}
                </div>
                <div className="mono tnum" style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 7, color: (s.hasValue ?? (s.value !== null && s.value !== undefined)) ? undefined : "var(--ink-3)" }}>
                  {(s.hasValue ?? (s.value !== null && s.value !== undefined))
                    ? <CountUp to={s.value as number} fmt={(n) => (s.prefix || "") + Math.round(n).toLocaleString() + (s.suffix || "")} />
                    : <span>&mdash;</span>}
                </div>
                {s.spark && s.spark.length > 0 && <div style={{ marginTop: 6 }}><Spark data={s.spark} w={94} h={22} color={s.ai ? "var(--ai)" : "var(--brand)"} /></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ---------------------------- KPICard --------------------------- */
export function KPICard({ k, i = 0 }: { k: KPI; i?: number }) {
  const fmt = (n: number) => (k.prefix || "") + Math.round(n).toLocaleString() + (k.suffix || "");
  // Honest empty: absent value -> em-dash; absent prior period -> no delta pill.
  const hasValue = k.hasValue ?? (k.value !== null && k.value !== undefined);
  const hasPrior = k.hasPrior ?? (k.delta !== null && k.delta !== undefined);
  const accent = k.ai ? "var(--ai)" : k.good === false && hasPrior && k.delta !== 0 ? "var(--danger)" : "var(--brand)";
  return (
    <Reveal i={i}>
      <div className="kpi-prem" style={{ position: "relative", overflow: "hidden", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "15px 16px 17px", boxShadow: "var(--e1)", transition: "transform var(--t) var(--ease-out), box-shadow var(--t), border-color var(--t)", cursor: "default" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--e2)"; e.currentTarget.style.borderColor = `color-mix(in oklab, ${accent} 40%, var(--line))`; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.borderColor = "var(--line)"; }}>
        <span className="sheen" />
        {k.ai && <span style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", background: "radial-gradient(circle, var(--ai-tint-2), transparent 70%)", animation: "breathe 3.4s var(--ease-io) infinite", pointerEvents: "none" }} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: k.ai ? "var(--ai-tint)" : "var(--surface-2)", color: k.ai ? "var(--ai)" : "var(--ink-3)", transition: "transform var(--t) var(--ease-spring)" }}><Icon name={k.icon} size={14} /></span>
            {k.label}
          </span>
          {k.ai && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, padding: "1px 6px" }}>AI</Pill>}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginTop: 13, position: "relative" }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: hasValue ? undefined : "var(--ink-3)" }} className="tnum">
            {hasValue ? <CountUp to={k.value as number} fmt={fmt} /> : <span style={{ fontVariantNumeric: "tabular-nums" }}>&mdash;</span>}
          </div>
          {/* No fabricated flat zero-line: only render a sparkline from a real series. */}
          {k.spark.length > 0 && <Spark data={k.spark} w={74} h={28} color={accent} />}
        </div>
        <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 6 }}>
          {hasPrior
            ? <><DeltaPill delta={k.delta as number} good={k.good} suffix={k.suffix === "%" ? "%" : ""} /><span style={{ fontSize: 11, color: "var(--ink-3)" }}>vs last period</span></>
            : <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{hasValue ? "No prior period" : "No data yet"}</span>}
        </div>
        <span className="accent-bar" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 3, transformOrigin: "left", animation: "growx .9s var(--ease-out) both", background: `linear-gradient(90deg, ${accent}, color-mix(in oklab, ${accent} 25%, transparent))`, borderRadius: "0 0 var(--r-lg) var(--r-lg)", animationDelay: i * 60 + 200 + "ms" }} />
      </div>
    </Reveal>
  );
}

/* ---------------------------- KpiRow ---------------------------- */
// Convenience grid wrapper, renders a KPICard per item with staggered reveal.
export function KpiRow({ kpis, cols = 4 }: { kpis: KPI[]; cols?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>
      {kpis.map((k, i) => <KPICard key={k.id ?? k.label} k={k} i={i} />)}
    </div>
  );
}

/* -------------------------- SectionCard ------------------------- */
export function SectionCard({
  title, icon, action, onAction, children, pad = 18, style = {}, headRight, headerClassName, headerStyle = {},
}: {
  title: string; icon?: IconName; action?: string; onAction?: () => void; children: React.ReactNode;
  pad?: number; style?: React.CSSProperties; headRight?: React.ReactNode;
  // Additive (WF6/F2): lets the dashboard frame stamp a drag-handle class /
  // cursor on the header in edit mode. Existing callers omit these (no change).
  headerClassName?: string; headerStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-xl)", boxShadow: "var(--e1)", display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      <div className={headerClassName} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--line)", ...headerStyle }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: "var(--fs-md)" }}>
          {icon && <Icon name={icon} size={16} style={{ color: "var(--ink-3)" }} />}{title}
        </div>
        {headRight || (action && <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{action}<Icon name="chevR" size={13} /></button>)}
      </div>
      <div style={{ padding: pad, flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

/* ---------------------------- Funnel ---------------------------- */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const max = stages[0].n;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {stages.map((s, i) => {
        const pct = (s.n / max) * 100;
        const conv = i > 0 ? Math.round((s.n / stages[i - 1].n) * 100) : 100;
        return (
          <div key={s.stage} style={{ display: "grid", gridTemplateColumns: "92px 1fr 96px", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>{s.stage}</span>
            <div style={{ height: 30, borderRadius: 8, background: "var(--surface-2)", overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: pct + "%", background: `color-mix(in oklab, ${s.color} 80%, transparent)`, borderRadius: 8, animation: "growx 1s var(--ease-out) both", animationDelay: i * 90 + "ms", display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: i < 1 ? "var(--ink)" : "var(--c-ink-inv, var(--ink-inv, #fff))" }}>{s.n.toLocaleString()}</span>
              </div>
            </div>
            <span style={{ textAlign: "right", fontSize: 11.5, color: "var(--ink-3)" }} className="mono">{i > 0 ? conv + "% conv" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------- TrendArea -------------------------- */
export function TrendArea({ data, labels, color = "var(--brand)" }: { data: number[]; labels: string[]; unit?: string; color?: string }) {
  const w = 520, h = 150, pad = 8;
  const max = Math.max(...data), min = Math.min(...data);
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2 - 16);
  const line = data.map((d, i) => `${x(i)}, ${y(d)}`).join(" ");
  const area = `${x(0)}, ${h - 14} ${line} ${x(data.length - 1)}, ${h - 14}`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="none">
        <defs><linearGradient id="taFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.22" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0, 0.5, 1].map((g) => <line key={g} x1={pad} x2={w - pad} y1={pad + g * (h - pad * 2 - 16)} y2={pad + g * (h - pad * 2 - 16)} stroke="var(--line)" strokeWidth="1" />)}
        <polygon points={area} fill="url(#taFill)" style={{ animation: "fadein 1.2s var(--ease-out) both", animationDelay: ".3s" }} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} style={{ strokeDasharray: 1, animation: "draw 1.3s var(--ease-out) both" }} />
        {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d)} r={i === data.length - 1 ? 4 : 0} fill={color} style={{ animation: "fadein .4s 1.2s both" }} />)}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {labels.filter((_, i) => i % 2 === 0).map((l) => <span key={l} className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{l}</span>)}
      </div>
    </div>
  );
}

/* ----------------------------- Donut ---------------------------- */
export function Donut({ data, size = 150, centerValue = "0.78", centerLabel = "index" }: { data: DonutDatum[]; size?: number; centerValue?: string; centerLabel?: string }) {
  const r = (size - 26) / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {data.map((d, i) => {
            const len = (d.v / 100) * c, off = acc; acc += len;
            return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth="13" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} style={{ animation: "fadein .9s var(--ease-out) both", animationDelay: i * 120 + "ms" }} />;
          })}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>{centerValue}</div>
            <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{centerLabel}</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {data.map((d) => (
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

/* --------------------------- Timeline --------------------------- */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, background: it.ai ? "var(--ai-tint)" : "var(--surface-2)", color: it.ai ? "var(--ai)" : "var(--ink-2)", border: "1px solid var(--line)" }}><Icon name={it.ic} size={13} /></span>
            {i < items.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--line)", minHeight: 10 }} />}
          </div>
          <div style={{ paddingBottom: 14 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              <b style={{ color: "var(--ink)" }}>{it.who}</b> <span style={{ color: "var(--ink-2)" }}>{it.what}</span>
              {it.ai && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, padding: "0 5px", marginLeft: 6 }}>AI</Pill>}
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{it.t} ago</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------- PendingList ------------------------- */
export function PendingList({ items, onPick }: { items: PendingItem[]; onPick?: (it: PendingItem) => void }) {
  const tones: Record<string, [string, string]> = {
    ok: ["var(--ok)", "var(--ok-tint)"], warn: ["var(--warn)", "var(--warn-tint)"], danger: ["var(--danger)", "var(--danger-tint)"],
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((it, i) => {
        const [tc, tb] = tones[it.tone];
        return (
          <button key={i} onClick={() => onPick?.(it)} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", textAlign: "left", transition: "all var(--t-fast)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = tc; e.currentTarget.style.background = tb; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}>
            <span style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", flexShrink: 0, color: tc, background: tb }}><Icon name={it.ic} size={16} /></span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "flex", gap: 6, alignItems: "center" }}>{it.title}{it.ai && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9, padding: "0 5px" }}>AI</Pill>}</span>
              <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{it.meta}</span>
            </span>
            <Icon name="chevR" size={15} style={{ color: "var(--ink-3)" }} />
          </button>
        );
      })}
    </div>
  );
}
