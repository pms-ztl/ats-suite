"use client";
// components/shared/ribbon.tsx
// The house hero visualization: a full-width, theme-adaptive SVG "flow ribbon".
// The stream's thickness at each point is a REAL count, the gradient runs across
// the journey, a dotted marker pins every point, and a gentle dashed current
// drifts along the center (gated behind prefers-reduced-motion). Born on the
// Analytics page; shared here so every surface speaks the same visual language.
//
// Token strategy: every color is a chained CSS variable so the ribbon adapts to
// BOTH scopes - the dashboard pages (--c-*) and the cd screens (bare tokens) -
// and to light/dark automatically: var(--c-brand, var(--brand, #16a37a)).
import * as React from "react";

export interface RibbonPoint { label: string; n: number; sub?: string }

const T = {
  brand: "var(--c-brand, var(--brand, #16a37a))",
  info: "var(--c-info, var(--info, #5588fb))",
  ai: "var(--c-ai, var(--ai, #7c5cff))",
  ink: "var(--c-ink, var(--ink, #16203a))",
  ink2: "var(--c-ink-2, var(--ink-2, #5b647a))",
  ink3: "var(--c-ink-3, var(--ink-3, #8b93a7))",
  line: "var(--c-line, var(--line, #e4e8f0))",
  surface: "var(--c-surface, var(--surface, #ffffff))",
  // Text on token-colored fills: near-white in light mode, near-dark in dark
  // mode (the dark palette lightens its accents, so literal white loses contrast).
  inkInv: "var(--c-ink-inv, var(--ink-inv, #fff))",
};

export function FlowRibbon({
  points, valueLabel, showShare = true, height = 250, gradient,
  emptyLabel = "The flow appears once data arrives.",
}: {
  points: RibbonPoint[];
  /** formats the big number above each point (default: the raw count) */
  valueLabel?: (n: number) => string;
  /** show share-of-total % under each label (only meaningful for categorical stages) */
  showShare?: boolean;
  height?: number;
  /** override gradient stops, e.g. ["var(--c-warn)", "var(--c-danger)"] */
  gradient?: string[];
  emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = points.reduce((s, x) => s + x.n, 0);
  if (!points.length || total === 0) {
    return (
      <div style={{ height: Math.min(height, 160), display: "grid", placeItems: "center", borderRadius: 12, border: `1px dashed ${T.line}`, color: T.ink3, fontSize: 12.5 }}>
        {emptyLabel}
      </div>
    );
  }
  // A single stage cannot form a flow; show a clean centered stat instead of a
  // collapsed sliver (keeps the card meaningful when all volume sits in one stage).
  if (points.length < 2) {
    const p = points[0];
    return (
      <div style={{ height: Math.min(height, 190), display: "grid", placeItems: "center", borderRadius: 12 }}>
        <div style={{ textAlign: "center" }}>
          <div className="mono" style={{ fontSize: 46, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)", lineHeight: 1 }}>{valueLabel ? valueLabel(p.n) : p.n}</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 6 }}>{p.label}</div>
          {p.sub && <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>{p.sub}</div>}
        </div>
      </div>
    );
  }
  const W = 1000, H = height, padX = 46, midY = Math.round(H * 0.47), maxHalf = Math.round(H * 0.3), minHalf = 4;
  const maxN = Math.max(...points.map((s) => s.n), 1);
  const step = points.length > 1 ? (W - padX * 2) / (points.length - 1) : 0;
  const pts = points.map((s, i) => ({
    x: padX + i * step,
    half: minHalf + (s.n / maxN) * (maxHalf - minHalf),
    n: s.n, label: s.label, sub: s.sub,
  }));
  const edge = (sign: 1 | -1) => {
    let d = `M ${pts[0].x} ${midY - sign * pts[0].half}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], cx = (a.x + b.x) / 2;
      d += ` C ${cx} ${midY - sign * a.half}, ${cx} ${midY - sign * b.half}, ${b.x} ${midY - sign * b.half}`;
    }
    return d;
  };
  const top = edge(1);
  const bottomBack = (() => {
    let d = "";
    for (let i = pts.length - 1; i > 0; i--) {
      const a = pts[i], b = pts[i - 1], cx = (a.x + b.x) / 2;
      d += ` C ${cx} ${midY + a.half}, ${cx} ${midY + b.half}, ${b.x} ${midY + b.half}`;
    }
    return d;
  })();
  const ribbon = `${top} L ${pts[pts.length - 1].x} ${midY + pts[pts.length - 1].half}${bottomBack} Z`;
  const current = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${midY}`).join(" ");
  const stops = gradient && gradient.length >= 2 ? gradient : [T.brand, T.info, T.ai];
  const fmt = valueLabel || ((n: number) => String(n));
  // With many points (e.g. weekly series), thin out the share row to avoid clutter.
  const dense = pts.length > 8;
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .ribbon-current-${uid}{stroke-dasharray:3 14;animation:ribbon-drift-${uid} 2.6s linear infinite;}
          @keyframes ribbon-drift-${uid}{to{stroke-dashoffset:-34;}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Flow by stage">
        <defs>
          <linearGradient id={`ribbon-g-${uid}`} x1="0" y1="0" x2="1" y2="0">
            {stops.map((c, i) => (
              <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} stopOpacity={0.88} />
            ))}
          </linearGradient>
          <linearGradient id={`ribbon-soft-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.ink} stopOpacity="0.06" />
            <stop offset="100%" stopColor={T.ink} stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx={W / 2} cy={midY + maxHalf + 26} rx={W / 2 - padX} ry={14} fill={`url(#ribbon-soft-${uid})`} />
        <path d={ribbon} fill={`url(#ribbon-g-${uid})`} stroke="none" />
        <path d={ribbon} fill="none" stroke={T.surface} strokeOpacity="0.5" strokeWidth="1.5" />
        <path className={`ribbon-current-${uid}`} d={current} fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <line x1={p.x} y1={midY - p.half - 10} x2={p.x} y2={midY + p.half + 10} stroke={T.line} strokeWidth="1" strokeDasharray="2 4" />
            <circle cx={p.x} cy={midY} r="4" fill={T.surface} stroke={T.ai} strokeWidth="2" />
            <text x={p.x} y={midY - p.half - 20} textAnchor="middle" fontSize={dense ? 14 : 17} fontWeight="800"
              fill={T.ink} fontFamily="var(--font-mono, monospace)">{fmt(p.n)}</text>
            <text x={p.x} y={midY + maxHalf + 30} textAnchor="middle" fontSize={dense ? 9.5 : 10.5} fontWeight="700"
              fill={T.ink2} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{p.label}</text>
            {(p.sub || (showShare && total > 0)) && (
              <text x={p.x} y={midY + maxHalf + 44} textAnchor="middle" fontSize="10"
                fill={T.ink3} fontFamily="var(--font-mono, monospace)">{p.sub ?? `${Math.round((p.n / total) * 100)}%`}</text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* =============================================================================
   The rest of the house family. Same DNA as FlowRibbon: dual-scope tokens,
   gradients, soft motion behind prefers-reduced-motion, honest empty states,
   REAL data only.
============================================================================= */

const PALETTE_T = [
  "var(--c-brand, var(--brand, #16a37a))",
  "var(--c-ai, var(--ai, #7c5cff))",
  "var(--c-info, var(--info, #5588fb))",
  "var(--c-warn, var(--warn, #e09f3e))",
  "var(--c-ok, var(--ok, #16a34a))",
  "var(--c-danger, var(--danger, #e05252))",
  "var(--c-ai-2, var(--ai-2, #a855f7))",
];

function EmptyNote({ label, height = 150 }: { label: string; height?: number }) {
  return (
    <div style={{ height, display: "grid", placeItems: "center", borderRadius: 12, border: `1px dashed ${T.line}`, color: T.ink3, fontSize: 12.5 }}>
      {label}
    </div>
  );
}

/* ---- ArcMeter: a sweeping 240-degree gradient gauge with ticks and a big
   center value. For scores / rates / adoption (0..100 or value/max). ---- */
export function ArcMeter({
  value, max = 100, label, sub, gradient, height = 230,
  emptyLabel = "The meter appears once data arrives.",
}: {
  value: number | null | undefined; max?: number;
  label?: string; sub?: string; gradient?: string[]; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (value == null || !isFinite(value) || max <= 0) return <EmptyNote label={emptyLabel} height={height} />;
  const pct = Math.max(0, Math.min(1, value / max));
  const W = 400, H = 250, cx = 200, cy = 196, r = 142, width = 21;
  const a0 = 210, a1 = -30; // 240-degree sweep
  const rad = (a: number) => (a * Math.PI) / 180;
  const pt = (a: number, rr = r) => [cx + rr * Math.cos(rad(a)), cy - rr * Math.sin(rad(a))];
  const arc = (from: number, to: number, rr = r) => {
    const [x0, y0] = pt(from, rr), [x1, y1] = pt(to, rr);
    const large = Math.abs(from - to) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${rr} ${rr} 0 ${large} 1 ${x1} ${y1}`;
  };
  const sweep = a0 - (a0 - a1) * pct;
  const stops = gradient && gradient.length >= 2 ? gradient : [T.brand, T.info, T.ai];
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const a = a0 - (a0 - a1) * t;
    const [x0, y0] = pt(a, r + 16), [x1, y1] = pt(a, r + 24);
    return { x0, y0, x1, y1, t };
  });
  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label={label ?? "Meter"}>
        <defs>
          <linearGradient id={`arc-g-${uid}`} x1="0" y1="1" x2="1" y2="0">
            {stops.map((c, i) => <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />)}
          </linearGradient>
        </defs>
        <path d={arc(a0, a1)} fill="none" stroke={`color-mix(in oklab, ${T.ink3} 16%, transparent)`} strokeWidth={width} strokeLinecap="round" />
        {pct > 0.005 && (
          <path d={arc(a0, sweep)} fill="none" stroke={`url(#arc-g-${uid})`} strokeWidth={width} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 6px 14px color-mix(in oklab, ${T.ai} 22%, transparent))` }} />
        )}
        {ticks.map((tk, i) => (
          <line key={i} x1={tk.x0} y1={tk.y0} x2={tk.x1} y2={tk.y1} stroke={T.ink3} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        ))}
        <text x={cx} y={cy - 26} textAnchor="middle" fontSize="52" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)" letterSpacing="-2">
          {Math.round(value)}{max === 100 ? "%" : ""}
        </text>
        {label && <text x={cx} y={cy + 2} textAnchor="middle" fontSize="13" fontWeight="700" fill={T.ink2} style={{ textTransform: "uppercase", letterSpacing: ".08em" } as any}>{label}</text>}
        {sub && <text x={cx} y={cy + 22} textAnchor="middle" fontSize="11.5" fill={T.ink3}>{sub}</text>}
      </svg>
    </div>
  );
}

/* ---- OrbitField: categories orbit a hub on dashed rings; dot area = the real
   count. For composition / mix (departments, channels, agents). ---- */
export function OrbitField({
  items, centerLabel, centerSub, height = 330,
  emptyLabel = "The field appears once data arrives.",
}: {
  items: { label: string; n: number; sub?: string }[];
  centerLabel?: string; centerSub?: string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = items.filter((d) => d.n > 0).slice(0, 8);
  const total = live.reduce((s, d) => s + d.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 640, H = 380, cx = 320, cy = 190;
  const ranked = live.slice().sort((a, b) => b.n - a.n);
  const maxN = ranked[0].n;
  const rings = [92, 138];
  const pts = ranked.map((d, i) => {
    const ring = rings[i % 2 === 0 ? 0 : 1];
    const angle = -90 + (360 / ranked.length) * i;
    const radA = (angle * Math.PI) / 180;
    const rr = 9 + Math.sqrt(d.n / maxN) * 17;
    return { ...d, x: cx + ring * Math.cos(radA), y: cy + ring * Math.sin(radA), r: rr, color: PALETTE_T[i % PALETTE_T.length], below: Math.sin(radA) >= 0 };
  });
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .orbit-ring-${uid}{animation:orbit-spin-${uid} 60s linear infinite;transform-box:fill-box;transform-origin:center;}
          @keyframes orbit-spin-${uid}{to{transform:rotate(360deg);}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Composition orbit">
        <defs>
          <radialGradient id={`orbit-hub-${uid}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={T.ai} stopOpacity="0.18" />
            <stop offset="100%" stopColor={T.ai} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={170} fill={`url(#orbit-hub-${uid})`} />
        {rings.map((ring, i) => (
          <circle key={i} className={`orbit-ring-${uid}`} cx={cx} cy={cy} r={ring} fill="none"
            stroke={T.line} strokeWidth="1.2" strokeDasharray={i === 0 ? "3 7" : "2 9"} />
        ))}
        {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={p.color} strokeOpacity="0.14" strokeWidth="1.5" />)}
        <circle cx={cx} cy={cy} r={46} fill={T.surface} stroke={T.line} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 8px 18px color-mix(in oklab, ${T.ink} 12%, transparent))` }} />
        <text x={cx} y={cy + 1} textAnchor="middle" fontSize="24" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">{centerLabel ?? String(total)}</text>
        {centerSub && <text x={cx} y={cy + 19} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".06em" } as any}>{centerSub}</text>}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} fillOpacity="0.85" stroke={T.surface} strokeWidth="2.5"
              style={{ filter: `drop-shadow(0 5px 12px color-mix(in oklab, ${T.ink} 14%, transparent))` }} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={p.r > 16 ? 12 : 10} fontWeight="800" fill={T.inkInv} fontFamily="var(--font-mono, monospace)">{p.n}</text>
            <text x={p.x} y={p.below ? p.y + p.r + 16 : p.y - p.r - 10} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink2}>
              {p.label.length > 16 ? p.label.slice(0, 15) + "…" : p.label}
            </text>
            {p.sub && <text x={p.x} y={p.below ? p.y + p.r + 29 : p.y - p.r - 23} textAnchor="middle" fontSize="9.5" fill={T.ink3} fontFamily="var(--font-mono, monospace)">{p.sub}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---- PulseGrid: a row of glowing tiles; intensity = real activity. For
   activity-over-time (inflow per week, interviews per day). ---- */
export function PulseGrid({
  cells, valueLabel, height = 120,
  emptyLabel = "Activity appears once events arrive.",
}: {
  cells: { label: string; n: number; sub?: string }[];
  valueLabel?: (n: number) => string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = cells.reduce((s, c) => s + c.n, 0);
  if (!cells.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const maxN = Math.max(...cells.map((c) => c.n), 1);
  const fmt = valueLabel || ((n: number) => String(n));
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .pulse-max-${uid}{animation:pulse-glow-${uid} 2.8s ease-in-out infinite;}
          @keyframes pulse-glow-${uid}{0%,100%{box-shadow:0 0 0 0 color-mix(in oklab, ${T.brand} 28%, transparent);}50%{box-shadow:0 0 18px color-mix(in oklab, ${T.brand} 30%, transparent);}}
        }` }} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 8 }}>
        {cells.map((c, i) => {
          const k = c.n / maxN;
          const isMax = c.n === maxN && c.n > 0;
          return (
            <div key={i} style={{ textAlign: "center", minWidth: 0 }}>
              <div className={isMax ? `pulse-max-${uid}` : undefined} title={`${c.label}: ${fmt(c.n)}`}
                style={{
                  height: Math.max(56, height - 52), borderRadius: 13, display: "grid", placeItems: "center",
                  background: c.n === 0
                    ? `color-mix(in oklab, ${T.ink3} 7%, transparent)`
                    : `linear-gradient(160deg, color-mix(in oklab, ${T.brand} ${Math.round(18 + k * 64)}%, transparent), color-mix(in oklab, ${T.ai} ${Math.round(10 + k * 42)}%, transparent))`,
                  border: `1px solid color-mix(in oklab, ${c.n === 0 ? T.ink3 : T.brand} ${c.n === 0 ? 12 : 30}%, transparent)`,
                }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: k > 0.55 ? T.inkInv : T.ink, fontFamily: "var(--font-mono, monospace)" }}>{fmt(c.n)}</span>
              </div>
              <div style={{ marginTop: 7, fontSize: 10.5, fontWeight: 700, color: T.ink2, textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</div>
              {c.sub && <div style={{ fontSize: 9.5, color: T.ink3, fontFamily: "var(--font-mono, monospace)" }}>{c.sub}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- BeadStream: every unit is a literal bead on a track, grouped and colored
   by state. Honest and beautiful at small counts (offers, queue items). ---- */
export function BeadStream({
  groups, height = 150, maxBeads = 60,
  emptyLabel = "Beads appear once items arrive.",
}: {
  groups: { label: string; n: number; color?: string }[];
  height?: number; maxBeads?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = groups.filter((g) => g.n > 0);
  const total = live.reduce((s, g) => s + g.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const colored = live.map((g, i) => ({ ...g, color: g.color || PALETTE_T[i % PALETTE_T.length] }));
  // Cap visible beads honestly; the legend always shows the true counts.
  const scale = total > maxBeads ? maxBeads / total : 1;
  let made = 0;
  const beads: { color: string }[] = [];
  colored.forEach((g) => {
    const k = Math.max(1, Math.round(g.n * scale));
    for (let i = 0; i < k && made < maxBeads; i++, made++) beads.push({ color: g.color });
  });
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .bead-${uid}{animation:bead-pop-${uid} .5s cubic-bezier(.22,1,.36,1) both;}
          @keyframes bead-pop-${uid}{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
        }` }} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
        {colored.map((g, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: T.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: g.color, boxShadow: `0 0 8px color-mix(in oklab, ${g.color} 50%, transparent)` }} />
            {g.label} <span style={{ color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>{g.n}</span>
          </span>
        ))}
        {scale < 1 && <span style={{ fontSize: 10.5, color: T.ink3 }}>showing {maxBeads} of {total}</span>}
      </div>
      <div style={{ padding: "16px 18px", borderRadius: 14, background: `color-mix(in oklab, ${T.ink3} 6%, transparent)`, border: `1px solid ${T.line}`, display: "flex", flexWrap: "wrap", gap: 9, alignItems: "center" }}>
        {beads.map((b, i) => (
          <span key={i} className={`bead-${uid}`}
            style={{
              width: 15, height: 15, borderRadius: 99, flexShrink: 0,
              background: `radial-gradient(circle at 32% 30%, color-mix(in oklab, ${b.color} 55%, white), ${b.color})`,
              boxShadow: `0 2px 6px color-mix(in oklab, ${b.color} 38%, transparent)`,
              animationDelay: `${Math.min(i * 28, 900)}ms`,
            }} />
        ))}
      </div>
    </div>
  );
}

/* ---- CometTrail: a time series as a comet. The line glows brightest at the
   most recent point (the head, with soft pulse rings); earlier points trail
   off as fading particles. For trends (inflow, spend, runs over time). ---- */
export function CometTrail({
  points, valueLabel, height = 230, gradient,
  emptyLabel = "The trail appears once history accrues.",
}: {
  points: RibbonPoint[];
  valueLabel?: (n: number) => string;
  height?: number; gradient?: string[]; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = points.reduce((s, p) => s + p.n, 0);
  if (points.length < 2 || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 1000, H = height, padX = 46, padT = 40, padB = 46;
  const maxN = Math.max(...points.map((p) => p.n), 1);
  const step = (W - padX * 2) / (points.length - 1);
  const pts = points.map((p, i) => ({
    x: padX + i * step,
    y: padT + (1 - p.n / maxN) * (H - padT - padB),
    n: p.n, label: p.label, sub: p.sub,
  }));
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], cx = (a.x + b.x) / 2;
    line += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
  }
  const base = H - padB;
  const area = `${line} L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`;
  const stops = gradient && gradient.length >= 2 ? gradient : [T.brand, T.info, T.ai];
  const head = pts[pts.length - 1];
  const fmt = valueLabel || ((n: number) => String(n));
  const dense = pts.length > 9;
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .comet-ring-${uid}{transform-box:fill-box;transform-origin:center;animation:comet-ping-${uid} 2.4s cubic-bezier(.2,.6,.36,1) infinite;}
          @keyframes comet-ping-${uid}{0%{transform:scale(.35);opacity:.55;}80%{transform:scale(1.9);opacity:0;}100%{transform:scale(1.9);opacity:0;}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Trend trail">
        <defs>
          <linearGradient id={`comet-l-${uid}`} x1="0" y1="0" x2="1" y2="0">
            {stops.map((c, i) => <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />)}
          </linearGradient>
          <linearGradient id={`comet-a-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stops[stops.length - 1]} stopOpacity="0.22" />
            <stop offset="100%" stopColor={stops[0]} stopOpacity="0.02" />
          </linearGradient>
          <radialGradient id={`comet-h-${uid}`}>
            <stop offset="0%" stopColor={stops[stops.length - 1]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={stops[stops.length - 1]} stopOpacity="0" />
          </radialGradient>
        </defs>
        <line x1={padX} y1={base} x2={W - padX} y2={base} stroke={T.line} strokeWidth="1" />
        <path d={area} fill={`url(#comet-a-${uid})`} />
        <path d={line} fill="none" stroke={`url(#comet-l-${uid})`} strokeWidth="3.5" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 4px 10px color-mix(in oklab, ${stops[stops.length - 1]} 25%, transparent))` }} />
        {pts.slice(0, -1).map((p, i) => {
          const k = pts.length > 1 ? i / (pts.length - 1) : 0;
          return <circle key={i} cx={p.x} cy={p.y} r={2.4 + k * 3.4} fill={`url(#comet-l-${uid})`} opacity={0.3 + k * 0.55} />;
        })}
        <circle cx={head.x} cy={head.y} r="26" fill={`url(#comet-h-${uid})`} />
        <circle className={`comet-ring-${uid}`} cx={head.x} cy={head.y} r="13" fill="none" stroke={stops[stops.length - 1]} strokeWidth="1.6" opacity="0.5" />
        <circle cx={head.x} cy={head.y} r="7" fill={stops[stops.length - 1]} stroke={T.surface} strokeWidth="2.5"
          style={{ filter: `drop-shadow(0 2px 8px color-mix(in oklab, ${stops[stops.length - 1]} 55%, transparent))` }} />
        {pts.map((p, i) => (
          (!dense || i % 2 === pts.length % 2 || i === pts.length - 1) && p.n > 0 ? (
            <text key={`v${i}`} x={p.x} y={p.y - (i === pts.length - 1 ? 20 : 11)} textAnchor="middle"
              fontSize={i === pts.length - 1 ? 17 : 12} fontWeight={i === pts.length - 1 ? 800 : 600}
              fill={i === pts.length - 1 ? T.ink : T.ink2} fontFamily="var(--font-mono, monospace)">{fmt(p.n)}</text>
          ) : null
        ))}
        {pts.map((p, i) => (
          (!dense || i % 2 === pts.length % 2 || i === pts.length - 1) ? (
            <text key={`l${i}`} x={p.x} y={H - 14} textAnchor="middle" fontSize="10.5" fontWeight="700"
              fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{p.label}</text>
          ) : null
        ))}
      </svg>
    </div>
  );
}

/* ---- PetalBloom: a rose chart. Each category is a gradient petal whose
   length is the real count; petals bloom open from the hub. For composition
   with more organic character than a donut. ---- */
export function PetalBloom({
  items, centerLabel, centerSub, height = 320,
  emptyLabel = "Petals appear once data arrives.",
}: {
  items: { label: string; n: number; sub?: string }[];
  centerLabel?: string; centerSub?: string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = items.filter((d) => d.n > 0).slice(0, 10);
  const total = live.reduce((s, d) => s + d.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 640, H = 420, cx = 320, cy = 210;
  const ranked = live.slice().sort((a, b) => b.n - a.n);
  const maxN = ranked[0].n;
  const minL = 56, maxL = 132;
  const petals = ranked.map((d, i) => {
    const angle = (360 / ranked.length) * i;
    const L = minL + Math.sqrt(d.n / maxN) * (maxL - minL);
    const w = Math.min(34, 14 + (180 / ranked.length));
    const rad = (angle * Math.PI) / 180;
    const tipR = L + 18;
    return {
      ...d, angle, L, w,
      color: PALETTE_T[i % PALETTE_T.length],
      lx: cx + tipR * Math.sin(rad), ly: cy - tipR * Math.cos(rad),
      sin: Math.sin(rad),
    };
  });
  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .petal-${uid}{animation:petal-bloom-${uid} .9s cubic-bezier(.22,1,.36,1) both;}
          @keyframes petal-bloom-${uid}{from{transform:scale(0);}to{transform:scale(1);}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Composition bloom">
        <defs>
          {petals.map((p, i) => (
            <linearGradient key={i} id={`petal-g-${uid}-${i}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0.78" />
            </linearGradient>
          ))}
        </defs>
        {petals.map((p, i) => (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(${p.angle})`}>
            <g className={`petal-${uid}`} style={{ animationDelay: `${i * 70}ms` }}>
              <path
                d={`M 0 0 C ${p.w} ${-p.L * 0.3}, ${p.w * 0.92} ${-p.L * 0.74}, 0 ${-p.L} C ${-p.w * 0.92} ${-p.L * 0.74}, ${-p.w} ${-p.L * 0.3}, 0 0 Z`}
                fill={`url(#petal-g-${uid}-${i})`} stroke={p.color} strokeOpacity="0.55" strokeWidth="1.4"
                style={{ filter: `drop-shadow(0 3px 8px color-mix(in oklab, ${p.color} 20%, transparent))` }} />
            </g>
          </g>
        ))}
        {petals.map((p, i) => (
          <text key={`t${i}`} x={p.lx} y={p.ly} textAnchor={p.sin > 0.35 ? "start" : p.sin < -0.35 ? "end" : "middle"}
            dominantBaseline="middle" fontSize="11" fontWeight="700" fill={T.ink2}>
            <tspan fill={T.ink} fontFamily="var(--font-mono, monospace)" fontWeight="800">{p.n}</tspan>
            <tspan dx="5">{p.label}</tspan>
            {p.sub ? <tspan dx="5" fill={T.ink3} fontWeight="600" fontSize="10">{p.sub}</tspan> : null}
          </text>
        ))}
        <circle cx={cx} cy={cy} r="37" fill={T.surface} stroke={T.line} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 4px 12px color-mix(in oklab, ${T.ink} 14%, transparent))` }} />
        <text x={cx} y={cy - 1} textAnchor="middle" fontSize="19" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">
          {centerLabel ?? total}
        </text>
        {centerSub && <text x={cx} y={cy + 15} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".07em" } as any}>{centerSub}</text>}
      </svg>
    </div>
  );
}

/* ---- SonarSweep: a radar. Items sit at their REAL normalized distance from
   the center (0 = now/here, 1 = the edge of the window) while a soft beam
   sweeps the field. For proximity: upcoming interviews, queue age, SLA. ---- */
export function SonarSweep({
  items, centerLabel, centerSub, rangeLabel, height = 340,
  emptyLabel = "The sweep appears once items are in range.",
}: {
  /** at: 0..1 distance from the center (0 = closest/now, 1 = window edge) */
  items: { label: string; at: number; sub?: string; tone?: string }[];
  centerLabel?: string; centerSub?: string;
  /** what the rings mean, e.g. "outer ring = 14 days out" */
  rangeLabel?: string;
  height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = items.slice(0, 12);
  if (!live.length) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 640, H = 430, cx = 320, cy = 204, R = 168;
  const blips = live.map((d, i) => {
    const angle = -90 + ((i * 137.5) % 360);
    const rad = (angle * Math.PI) / 180;
    const rr = 30 + Math.max(0, Math.min(1, d.at)) * (R - 40);
    return {
      ...d,
      x: cx + rr * Math.cos(rad), y: cy + rr * Math.sin(rad),
      color: d.tone || PALETTE_T[i % PALETTE_T.length],
      cos: Math.cos(rad),
    };
  });
  const wedge = `M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(0.5)} ${cy + R * Math.sin(0.5)} Z`;
  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .sweep-${uid}{transform-origin:${cx}px ${cy}px;animation:sweep-rot-${uid} 7s linear infinite;}
          @keyframes sweep-rot-${uid}{to{transform:rotate(360deg);}}
          .blip-${uid}{transform-box:fill-box;transform-origin:center;animation:blip-pulse-${uid} 2.6s ease-in-out infinite;}
          @keyframes blip-pulse-${uid}{0%,100%{transform:scale(1);}50%{transform:scale(1.35);}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Proximity sweep">
        <defs>
          <linearGradient id={`sweep-g-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={T.brand} stopOpacity="0.30" />
            <stop offset="100%" stopColor={T.brand} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`sonar-bg-${uid}`}>
            <stop offset="0%" stopColor={T.brand} stopOpacity="0.07" />
            <stop offset="100%" stopColor={T.brand} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill={`url(#sonar-bg-${uid})`} />
        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <circle key={i} cx={cx} cy={cy} r={R * t} fill="none" stroke={T.line} strokeWidth="1"
            strokeDasharray={i === 3 ? "none" : "3 6"} />
        ))}
        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={T.line} strokeWidth="1" strokeOpacity="0.6" />
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={T.line} strokeWidth="1" strokeOpacity="0.6" />
        <g className={`sweep-${uid}`}><path d={wedge} fill={`url(#sweep-g-${uid})`} /></g>
        {blips.map((b, i) => (
          <g key={i}>
            <circle className={`blip-${uid}`} cx={b.x} cy={b.y} r="10" fill={b.color} opacity="0.18" style={{ animationDelay: `${i * 180}ms` }} />
            <circle cx={b.x} cy={b.y} r="5.5" fill={b.color} stroke={T.surface} strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 7px color-mix(in oklab, ${b.color} 60%, transparent))` }} />
            {live.length <= 9 && (
              <text x={b.x + (b.cos >= 0 ? 11 : -11)} y={b.y + 1} textAnchor={b.cos >= 0 ? "start" : "end"}
                dominantBaseline="middle" fontSize="10.5" fontWeight="700" fill={T.ink2}>
                {b.label}{b.sub ? <tspan dx="4" fill={T.ink3} fontWeight="600" fontSize="9.5">{b.sub}</tspan> : null}
              </text>
            )}
          </g>
        ))}
        <circle cx={cx} cy={cy} r="27" fill={T.surface} stroke={T.line} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 4px 12px color-mix(in oklab, ${T.ink} 14%, transparent))` }} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">
          {centerLabel ?? live.length}
        </text>
        {centerSub && <text x={cx} y={cy + 44} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".07em" } as any}>{centerSub}</text>}
        {rangeLabel && <text x={cx} y={H - 10} textAnchor="middle" fontSize="10.5" fill={T.ink3}>{rangeLabel}</text>}
      </svg>
    </div>
  );
}

/* ---- TideBands: two real series over the same buckets as opposing tides -
   one band rises above the midline, the other falls below. For honest pair
   comparisons (scheduled vs completed, applied vs advanced). ---- */
export function TideBands({
  points, aLabel, bLabel, height = 250, aColor, bColor,
  emptyLabel = "The tides appear once both series have data.",
}: {
  points: { label: string; a: number; b: number }[];
  aLabel: string; bLabel: string;
  height?: number; aColor?: string; bColor?: string; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = points.reduce((s, p) => s + p.a + p.b, 0);
  if (points.length < 2 || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 1000, H = height, padX = 46, midY = Math.round(H * 0.52), amp = Math.round(H * 0.3);
  const maxN = Math.max(...points.map((p) => Math.max(p.a, p.b)), 1);
  const step = (W - padX * 2) / (points.length - 1);
  const ca = aColor || T.brand, cb = bColor || T.ai;
  const pts = points.map((p, i) => ({
    x: padX + i * step,
    ya: midY - 6 - (p.a / maxN) * amp,
    yb: midY + 6 + (p.b / maxN) * amp,
    ...p,
  }));
  const band = (key: "ya" | "yb", baseY: number) => {
    let d = `M ${pts[0].x} ${baseY} L ${pts[0].x} ${pts[0][key]}`;
    for (let i = 1; i < pts.length; i++) {
      const A = pts[i - 1], B = pts[i], cx = (A.x + B.x) / 2;
      d += ` C ${cx} ${A[key]}, ${cx} ${B[key]}, ${B.x} ${B[key]}`;
    }
    return `${d} L ${pts[pts.length - 1].x} ${baseY} Z`;
  };
  const dense = pts.length > 9;
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .tide-mid-${uid}{animation:tide-drift-${uid} 3s linear infinite;}
          @keyframes tide-drift-${uid}{to{stroke-dashoffset:-30;}}
        }` }} />
      <div style={{ display: "flex", gap: 16, marginBottom: 6 }}>
        {[{ c: ca, l: aLabel }, { c: cb, l: bLabel }].map((g, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: T.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: g.c, boxShadow: `0 0 8px color-mix(in oklab, ${g.c} 50%, transparent)` }} />{g.l}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label={`${aLabel} vs ${bLabel}`}>
        <defs>
          <linearGradient id={`tide-a-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={ca} stopOpacity="0.12" /><stop offset="100%" stopColor={ca} stopOpacity="0.62" />
          </linearGradient>
          <linearGradient id={`tide-b-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cb} stopOpacity="0.12" /><stop offset="100%" stopColor={cb} stopOpacity="0.62" />
          </linearGradient>
        </defs>
        <path d={band("ya", midY - 6)} fill={`url(#tide-a-${uid})`} stroke={ca} strokeOpacity="0.5" strokeWidth="1.5" />
        <path d={band("yb", midY + 6)} fill={`url(#tide-b-${uid})`} stroke={cb} strokeOpacity="0.5" strokeWidth="1.5" />
        <line className={`tide-mid-${uid}`} x1={padX} y1={midY} x2={W - padX} y2={midY}
          stroke={T.ink3} strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="2 13" strokeLinecap="round" />
        {pts.map((p, i) => (
          (!dense || i % 2 === pts.length % 2 || i === pts.length - 1) ? (
            <g key={i}>
              {p.a > 0 && <text x={p.x} y={p.ya - 8} textAnchor="middle" fontSize="12" fontWeight="700" fill={T.ink} fontFamily="var(--font-mono, monospace)">{p.a}</text>}
              {p.b > 0 && <text x={p.x} y={p.yb + 16} textAnchor="middle" fontSize="12" fontWeight="700" fill={T.ink2} fontFamily="var(--font-mono, monospace)">{p.b}</text>}
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{p.label}</text>
            </g>
          ) : null
        ))}
      </svg>
    </div>
  );
}

/* ---- FillGauge: a glass tube filling with a living liquid - the level is a
   REAL used/total ratio. Gentle wave + rising bubbles behind reduced-motion.
   For capacity: seats, plan limits, budgets. ---- */
export function FillGauge({
  used, total, label, sub, height = 230,
  emptyLabel = "The gauge appears once a limit is known.",
}: {
  used: number | null | undefined; total: number | null | undefined;
  label?: string; sub?: string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (used == null || total == null || !isFinite(used) || !isFinite(total) || total <= 0) {
    return <EmptyNote label={emptyLabel} height={height} />;
  }
  const pct = Math.max(0, Math.min(1, used / total));
  const W = 220, H = 230, tx = 76, tw = 68, ty = 14, th = 168, rx = 33;
  const levelY = ty + (1 - pct) * th;
  const hot = pct >= 0.9;
  const c0 = hot ? "var(--c-warn, var(--warn, #e09f3e))" : T.brand;
  const c1 = hot ? "var(--c-danger, var(--danger, #e05252))" : T.info;
  const wave = `M ${tx - 20} ${levelY} q 14 -7 28 0 t 28 0 t 28 0 t 28 0 t 28 0 L ${tx + tw + 20} ${ty + th + 4} L ${tx - 20} ${ty + th + 4} Z`;
  return (
    <div style={{ width: "100%", maxWidth: 240, margin: "0 auto", textAlign: "center" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .wave-${uid}{animation:wave-sway-${uid} 3.4s ease-in-out infinite alternate;}
          @keyframes wave-sway-${uid}{from{transform:translateX(-14px);}to{transform:translateX(14px);}}
          .bub-${uid}{animation:bub-rise-${uid} 3.2s ease-in infinite;}
          @keyframes bub-rise-${uid}{0%{transform:translateY(0);opacity:0;}15%{opacity:.7;}100%{transform:translateY(-${Math.max(20, Math.round(pct * th) - 14)}px);opacity:0;}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={label ?? "Capacity"}>
        <defs>
          <linearGradient id={`fill-g-${uid}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={c0} /><stop offset="100%" stopColor={c1} />
          </linearGradient>
          <clipPath id={`tube-${uid}`}><rect x={tx} y={ty} width={tw} height={th} rx={rx} /></clipPath>
        </defs>
        <rect x={tx} y={ty} width={tw} height={th} rx={rx} fill={`color-mix(in oklab, ${T.ink3} 7%, transparent)`} stroke={T.line} strokeWidth="1.5" />
        <g clipPath={`url(#tube-${uid})`}>
          {pct > 0.005 && (
            <>
              <g className={`wave-${uid}`}><path d={wave} fill={`url(#fill-g-${uid})`} opacity="0.92" /></g>
              <circle className={`bub-${uid}`} cx={tx + tw * 0.3} cy={ty + th - 10} r="2.5" fill={T.surface} opacity="0" />
              <circle className={`bub-${uid}`} cx={tx + tw * 0.55} cy={ty + th - 6} r="1.8" fill={T.surface} opacity="0" style={{ animationDelay: "1.1s" }} />
              <circle className={`bub-${uid}`} cx={tx + tw * 0.74} cy={ty + th - 12} r="2.2" fill={T.surface} opacity="0" style={{ animationDelay: "2.2s" }} />
            </>
          )}
        </g>
        <rect x={tx} y={ty} width={tw} height={th} rx={rx} fill="none" stroke={T.line} strokeWidth="1.5" />
        <text x={tx + tw / 2} y={ty + th / 2 + 2} textAnchor="middle" fontSize="26" fontWeight="800" fill={T.ink}
          fontFamily="var(--font-mono, monospace)" stroke={T.surface} strokeWidth="5" paintOrder="stroke">
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>
        {used} <span style={{ color: T.ink3, fontWeight: 600 }}>of {total}</span>
      </div>
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: T.ink2, textTransform: "uppercase", letterSpacing: ".07em", marginTop: 2 }}>{label}</div>}
      {sub && <div style={{ fontSize: 11, color: T.ink3, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/* ---- HaloStack: concentric halo rings - each category is a ring whose
   thickness is its REAL count; the rings breathe with a slow rotating gap.
   For status / plan / type mixes (3-5 categories). ---- */
export function HaloStack({
  items, centerLabel, centerSub, height = 330,
  emptyLabel = "Halos appear once data arrives.",
}: {
  items: { label: string; n: number; color?: string }[];
  centerLabel?: string; centerSub?: string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = items.filter((d) => d.n > 0).slice(0, 5);
  const total = live.reduce((s, d) => s + d.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 640, H = 400, cx = 320, cy = 186;
  const ranked = live.slice().sort((a, b) => b.n - a.n).map((d, i) => ({ ...d, color: d.color || PALETTE_T[i % PALETTE_T.length] }));
  const maxN = ranked[0].n;
  let r = 50;
  const rings = ranked.map((d, i) => {
    const t = 9 + (d.n / maxN) * 14;
    const ring = { ...d, r: r + t / 2, t, C: 2 * Math.PI * (r + t / 2), dur: 36 + i * 12, dir: i % 2 ? 1 : -1 };
    r += t + 6;
    return ring;
  });
  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          ${rings.map((g, i) => `.halo-${uid}-${i}{transform-origin:${cx}px ${cy}px;animation:halo-rot-${uid} ${g.dur}s linear infinite ${g.dir < 0 ? "reverse" : "normal"};}`).join("\n")}
          @keyframes halo-rot-${uid}{to{transform:rotate(360deg);}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Halo mix">
        {rings.map((g, i) => (
          <circle key={i} className={`halo-${uid}-${i}`} cx={cx} cy={cy} r={g.r} fill="none"
            stroke={g.color} strokeWidth={g.t} strokeLinecap="round" opacity="0.8"
            strokeDasharray={`${g.C * 0.88} ${g.C * 0.12}`}
            style={{ filter: `drop-shadow(0 2px 8px color-mix(in oklab, ${g.color} 28%, transparent))` }} />
        ))}
        <circle cx={cx} cy={cy} r="38" fill={T.surface} stroke={T.line} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 4px 12px color-mix(in oklab, ${T.ink} 14%, transparent))` }} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">
          {centerLabel ?? total}
        </text>
        {centerSub && <text x={cx} y={cy + 18} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".07em" } as any}>{centerSub}</text>}
      </svg>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
        {rings.map((g, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: T.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: g.color, boxShadow: `0 0 8px color-mix(in oklab, ${g.color} 50%, transparent)` }} />
            {g.label} <span style={{ color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>{g.n}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---- StepCascade: a waterfall of gradient steps - each stage is a column,
   the translucent fall between columns is the REAL drop. An honest funnel
   with gravity. ---- */
export function StepCascade({
  stages, valueLabel, height = 260,
  emptyLabel = "The cascade appears once stages have data.",
}: {
  stages: { label: string; n: number }[];
  valueLabel?: (n: number) => string;
  height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = stages.reduce((s, x) => s + x.n, 0);
  if (stages.length < 2 || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 1000, H = height, padX = 46, padT = 34, base = H - 44;
  const maxN = Math.max(...stages.map((s) => s.n), 1);
  const step = (W - padX * 2) / stages.length;
  const barW = step * 0.52;
  const cols = stages.map((s, i) => ({
    ...s,
    x: padX + i * step + (step - barW) / 2,
    y: padT + (1 - s.n / maxN) * (base - padT - 8),
  }));
  const fmt = valueLabel || ((n: number) => String(n));
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .casc-${uid}{transform-box:fill-box;transform-origin:bottom;animation:casc-rise-${uid} .8s cubic-bezier(.22,1,.36,1) both;}
          @keyframes casc-rise-${uid}{from{transform:scaleY(0);}to{transform:scaleY(1);}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Stage cascade">
        <defs>
          <linearGradient id={`casc-g-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={T.brand} /><stop offset="55%" stopColor={T.info} /><stop offset="100%" stopColor={T.ai} />
          </linearGradient>
          <linearGradient id={`casc-f-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={T.info} stopOpacity="0.30" /><stop offset="100%" stopColor={T.info} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={base} x2={W - padX} y2={base} stroke={T.line} strokeWidth="1" />
        {cols.slice(0, -1).map((c, i) => {
          const nx = cols[i + 1];
          const drop = c.n - nx.n;
          return (
            <g key={`f${i}`}>
              <path d={`M ${c.x + barW} ${c.y} C ${(c.x + barW + nx.x) / 2} ${c.y}, ${(c.x + barW + nx.x) / 2} ${nx.y}, ${nx.x} ${nx.y} L ${nx.x} ${base} L ${c.x + barW} ${base} Z`}
                fill={`url(#casc-f-${uid})`} />
              {drop > 0 && (
                <text x={(c.x + barW + nx.x) / 2} y={(c.y + nx.y) / 2 - 6} textAnchor="middle" fontSize="11" fontWeight="700"
                  fill={T.ink3} fontFamily="var(--font-mono, monospace)">-{fmt(drop)}</text>
              )}
            </g>
          );
        })}
        {cols.map((c, i) => (
          <g key={i}>
            <rect className={`casc-${uid}`} x={c.x} y={c.y} width={barW} height={base - c.y} rx="9"
              fill={`url(#casc-g-${uid})`} opacity={0.5 + 0.5 * (c.n / maxN)}
              style={{ animationDelay: `${i * 90}ms`, filter: `drop-shadow(0 4px 10px color-mix(in oklab, ${T.info} 18%, transparent))` }} />
            <text x={c.x + barW / 2} y={c.y - 9} textAnchor="middle" fontSize="14" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">{fmt(c.n)}</text>
            <text x={c.x + barW / 2} y={H - 14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{c.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ---- ConstellationField: every item is a twinkling star at its REAL (x, y)
   position, linked in order by a faint thread. For score-vs-time scatters
   (screening verdicts, decision latency). x, y normalized 0..1. ---- */
export function ConstellationField({
  stars, xLabel, yLabel, height = 320,
  emptyLabel = "Stars appear once items arrive.",
}: {
  stars: { x: number; y: number; size?: number; label?: string; tone?: string }[];
  xLabel?: string; yLabel?: string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = stars.slice(0, 40);
  if (!live.length) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 1000, H = height, padX = 50, padT = 34, padB = 40;
  const px = (v: number) => padX + Math.max(0, Math.min(1, v)) * (W - padX * 2);
  const py = (v: number) => padT + (1 - Math.max(0, Math.min(1, v))) * (H - padT - padB);
  const pts = live.map((s, i) => ({
    ...s, X: px(s.x), Y: py(s.y),
    r: 3.5 + Math.max(0, Math.min(1, s.size ?? 0.5)) * 6,
    color: s.tone || PALETTE_T[i % PALETTE_T.length],
  }));
  const thread = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.X} ${p.Y}`).join(" ");
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .star-${uid}{animation:star-tw-${uid} 2.8s ease-in-out infinite alternate;}
          @keyframes star-tw-${uid}{from{opacity:.55;}to{opacity:1;}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Constellation">
        <line x1={padX} y1={H - padB} x2={W - padX} y2={H - padB} stroke={T.line} strokeWidth="1" />
        <line x1={padX} y1={padT - 8} x2={padX} y2={H - padB} stroke={T.line} strokeWidth="1" />
        {pts.length > 1 && <path d={thread} fill="none" stroke={T.ink3} strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2 5" />}
        {pts.map((p, i) => (
          <g key={i} className={`star-${uid}`} style={{ animationDelay: `${(i % 7) * 320}ms` }}>
            <line x1={p.X - p.r * 1.7} y1={p.Y} x2={p.X + p.r * 1.7} y2={p.Y} stroke={p.color} strokeWidth="1.1" opacity="0.7" />
            <line x1={p.X} y1={p.Y - p.r * 1.7} x2={p.X} y2={p.Y + p.r * 1.7} stroke={p.color} strokeWidth="1.1" opacity="0.7" />
            <circle cx={p.X} cy={p.Y} r={p.r * 0.62} fill={p.color}
              style={{ filter: `drop-shadow(0 0 ${p.r}px color-mix(in oklab, ${p.color} 65%, transparent))` }} />
            {live.length <= 8 && p.label && (
              <text x={p.X + p.r * 1.9 + 3} y={p.Y + 1} dominantBaseline="middle" fontSize="10.5" fontWeight="700" fill={T.ink2}>{p.label}</text>
            )}
          </g>
        ))}
        {xLabel && <text x={W - padX} y={H - 12} textAnchor="end" fontSize="10.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{xLabel}</text>}
        {yLabel && <text x={padX - 6} y={padT - 14} textAnchor="start" fontSize="10.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{yLabel}</text>}
      </svg>
    </div>
  );
}

/* ---- RayBurst: a dandelion burst - each category is a glowing ray from the
   hub, ray length = the real count, a bright seed at the tip. For up to ~12
   categories where a donut would be boring. ---- */
export function RayBurst({
  items, centerLabel, centerSub, height = 330,
  emptyLabel = "Rays appear once data arrives.",
}: {
  items: { label: string; n: number; sub?: string }[];
  centerLabel?: string; centerSub?: string; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = items.filter((d) => d.n > 0).slice(0, 12);
  const total = live.reduce((s, d) => s + d.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 640, H = 420, cx = 320, cy = 204, r0 = 44;
  const ranked = live.slice().sort((a, b) => b.n - a.n);
  const maxN = ranked[0].n;
  const rays = ranked.map((d, i) => {
    const angle = -90 + (360 / ranked.length) * i;
    const rad = (angle * Math.PI) / 180;
    const len = 46 + Math.sqrt(d.n / maxN) * 116;
    const x0 = cx + r0 * Math.cos(rad), y0 = cy + r0 * Math.sin(rad);
    const x1 = cx + (r0 + len) * Math.cos(rad), y1 = cy + (r0 + len) * Math.sin(rad);
    const lx = cx + (r0 + len + 15) * Math.cos(rad), ly = cy + (r0 + len + 15) * Math.sin(rad);
    return { ...d, x0, y0, x1, y1, lx, ly, len, cos: Math.cos(rad), color: PALETTE_T[i % PALETTE_T.length] };
  });
  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          ${rays.map((g, i) => `.ray-${uid}-${i}{stroke-dasharray:${Math.ceil(g.len)};stroke-dashoffset:${Math.ceil(g.len)};animation:ray-grow-${uid}-${i} .7s cubic-bezier(.22,1,.36,1) ${i * 60}ms forwards;}
          @keyframes ray-grow-${uid}-${i}{to{stroke-dashoffset:0;}}`).join("\n")}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Ray burst">
        {rays.map((g, i) => (
          <g key={i}>
            <line className={`ray-${uid}-${i}`} x1={g.x0} y1={g.y0} x2={g.x1} y2={g.y1}
              stroke={g.color} strokeWidth="5" strokeLinecap="round" opacity="0.78" />
            <circle cx={g.x1} cy={g.y1} r="5.5" fill={g.color} stroke={T.surface} strokeWidth="2"
              style={{ filter: `drop-shadow(0 0 7px color-mix(in oklab, ${g.color} 60%, transparent))` }} />
            {rays.length <= 10 && (
              <text x={g.lx} y={g.ly + 1} textAnchor={g.cos > 0.3 ? "start" : g.cos < -0.3 ? "end" : "middle"}
                dominantBaseline="middle" fontSize="10.5" fontWeight="700" fill={T.ink2}>
                <tspan fill={T.ink} fontFamily="var(--font-mono, monospace)" fontWeight="800">{g.n}</tspan>
                <tspan dx="4">{g.label}</tspan>
              </text>
            )}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={r0 - 8} fill={T.surface} stroke={T.line} strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 4px 12px color-mix(in oklab, ${T.ink} 14%, transparent))` }} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">
          {centerLabel ?? total}
        </text>
        {centerSub && <text x={cx} y={cy + 17} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".07em" } as any}>{centerSub}</text>}
      </svg>
    </div>
  );
}

/* ---- HiveCells: a honeycomb where every hexagon is ONE real unit, colored
   by its group. Caps the visible cells honestly; the legend always carries
   the true counts. ---- */
export function HiveCells({
  groups, maxCells = 72, height = 200,
  emptyLabel = "The hive fills as items arrive.",
}: {
  groups: { label: string; n: number; color?: string }[];
  maxCells?: number; height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = groups.filter((g) => g.n > 0);
  const total = live.reduce((s, g) => s + g.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const colored = live.map((g, i) => ({ ...g, color: g.color || PALETTE_T[i % PALETTE_T.length] }));
  const scale = total > maxCells ? maxCells / total : 1;
  const cells: { color: string }[] = [];
  let made = 0;
  colored.forEach((g) => {
    const k = Math.max(1, Math.round(g.n * scale));
    for (let i = 0; i < k && made < maxCells; i++, made++) cells.push({ color: g.color });
  });
  const a = 13, w = Math.sqrt(3) * a, vstep = 1.5 * a;
  const W = 1000, pad = 16;
  const cols = Math.floor((W - pad * 2 - w / 2) / w);
  const rows = Math.ceil(cells.length / cols);
  const H = pad * 2 + rows * vstep + a;
  const hex = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, k) => {
      const ang = ((60 * k - 30) * Math.PI) / 180;
      return `${cx + a * 0.92 * Math.cos(ang)},${cy + a * 0.92 * Math.sin(ang)}`;
    }).join(" ");
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .hex-${uid}{transform-box:fill-box;transform-origin:center;animation:hex-pop-${uid} .5s cubic-bezier(.22,1,.36,1) both;}
          @keyframes hex-pop-${uid}{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
        }` }} />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
        {colored.map((g, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11.5, fontWeight: 700, color: T.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: g.color, boxShadow: `0 0 8px color-mix(in oklab, ${g.color} 50%, transparent)` }} />
            {g.label} <span style={{ color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>{g.n}</span>
          </span>
        ))}
        {scale < 1 && <span style={{ fontSize: 10.5, color: T.ink3 }}>showing {maxCells} of {total}</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Hive">
        {cells.map((c, i) => {
          const row = Math.floor(i / cols), col = i % cols;
          const cx = pad + w / 2 + col * w + (row % 2 ? w / 2 : 0);
          const cy = pad + a + row * vstep;
          return (
            <polygon key={i} className={`hex-${uid}`} points={hex(cx, cy)}
              fill={`color-mix(in oklab, ${c.color} 82%, transparent)`} stroke={c.color} strokeWidth="1"
              style={{ animationDelay: `${Math.min(i * 18, 900)}ms`, filter: `drop-shadow(0 1px 3px color-mix(in oklab, ${c.color} 30%, transparent))` }} />
          );
        })}
      </svg>
    </div>
  );
}

/* ---- PulseLine: an EKG heartbeat - flat baseline, a sharp spike per bucket
   with height = the REAL count, and a light dot riding the line. For activity
   rhythms (events per day, runs per day). ---- */
export function PulseLine({
  events, valueLabel, height = 220,
  emptyLabel = "The pulse appears once activity arrives.",
}: {
  events: { label: string; n: number }[];
  valueLabel?: (n: number) => string;
  height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = events.reduce((s, e) => s + e.n, 0);
  if (events.length < 2 || total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 1000, H = height, padX = 46, base = H - 48, topPad = 30;
  const maxN = Math.max(...events.map((e) => e.n), 1);
  const step = (W - padX * 2) / (events.length - 1);
  const pts = events.map((e, i) => ({
    ...e, x: padX + i * step,
    h: e.n > 0 ? 8 + (e.n / maxN) * (base - topPad - 8) : 0,
  }));
  let d = `M ${padX - 18} ${base}`;
  pts.forEach((p) => {
    if (p.h === 0) { d += ` L ${p.x + 14} ${base}`; return; }
    d += ` L ${p.x - 13} ${base} L ${p.x - 4} ${base - p.h} L ${p.x + 3} ${base + Math.min(7, p.h * 0.16)} L ${p.x + 11} ${base}`;
  });
  d += ` L ${W - padX + 18} ${base}`;
  const fmt = valueLabel || ((n: number) => String(n));
  const dense = pts.length > 10;
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .pulse-dot-${uid}{offset-path:path("${d}");animation:pulse-run-${uid} 7s linear infinite;}
          @keyframes pulse-run-${uid}{from{offset-distance:0%;}to{offset-distance:100%;}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Activity pulse">
        <defs>
          <linearGradient id={`pulse-g-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={T.brand} /><stop offset="55%" stopColor={T.info} /><stop offset="100%" stopColor={T.ai} />
          </linearGradient>
        </defs>
        <line x1={padX - 18} y1={base} x2={W - padX + 18} y2={base} stroke={T.line} strokeWidth="1" />
        <path d={d} fill="none" stroke={`url(#pulse-g-${uid})`} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 3px 9px color-mix(in oklab, ${T.info} 26%, transparent))` }} />
        <circle className={`pulse-dot-${uid}`} r="4.5" fill={T.ai}
          style={{ filter: `drop-shadow(0 0 8px color-mix(in oklab, ${T.ai} 70%, transparent))` } as any} />
        {pts.map((p, i) => (
          p.n > 0 && (!dense || i % 2 === pts.length % 2 || i === pts.length - 1) ? (
            <text key={`v${i}`} x={p.x} y={base - p.h - 9} textAnchor="middle" fontSize="12" fontWeight="700" fill={T.ink} fontFamily="var(--font-mono, monospace)">{fmt(p.n)}</text>
          ) : null
        ))}
        {pts.map((p, i) => (
          (!dense || i % 2 === pts.length % 2 || i === pts.length - 1) ? (
            <text key={`l${i}`} x={p.x} y={H - 14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".05em" } as any}>{p.label}</text>
          ) : null
        ))}
      </svg>
    </div>
  );
}

/* ---- TiltScale: a real balance - the beam tilts by the actual ratio of the
   two sides, pans hold the true counts. For honest A-vs-B comparisons
   (approved vs rejected, pass vs fail). ---- */
export function TiltScale({
  a, b, height = 320, aColor, bColor,
  emptyLabel = "The scale appears once both sides have data.",
}: {
  a: { label: string; n: number }; b: { label: string; n: number };
  height?: number; aColor?: string; bColor?: string; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const total = a.n + b.n;
  if (total === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 640, H = 400;
  const Px = 320, Py = 130;
  const half = 190;
  const diff = (a.n - b.n) / total;
  const angle = -(diff * 13);
  const ca = aColor || T.brand, cb = bColor || T.ai;
  const panW = 104, panH = 50, drop = 64;
  const pan = (x: number, color: string, side: { label: string; n: number }) => (
    <g transform={`translate(${x} 0)`}>
      <g transform={`rotate(${-angle})`}>
        <line x1="-30" y1="4" x2="0" y2={drop} stroke={T.ink3} strokeWidth="1.4" strokeOpacity="0.6" />
        <line x1="30" y1="4" x2="0" y2={drop} stroke={T.ink3} strokeWidth="1.4" strokeOpacity="0.6" />
        <rect x={-panW / 2} y={drop} width={panW} height={panH} rx="15"
          fill={`color-mix(in oklab, ${color} 16%, transparent)`} stroke={color} strokeWidth="1.6"
          style={{ filter: `drop-shadow(0 5px 12px color-mix(in oklab, ${color} 26%, transparent))` }} />
        <text x="0" y={drop + panH / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize="21" fontWeight="800"
          fill={color} fontFamily="var(--font-mono, monospace)">{side.n}</text>
        <text x="0" y={drop + panH + 19} textAnchor="middle" fontSize="11" fontWeight="700" fill={T.ink2}
          style={{ textTransform: "uppercase", letterSpacing: ".06em" } as any}>{side.label}</text>
      </g>
    </g>
  );
  return (
    <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .tilt-${uid}{transform-origin:${Px}px ${Py}px;transform:rotate(${angle}deg);}
        @media (prefers-reduced-motion: no-preference){
          .tilt-${uid}{animation:tilt-settle-${uid} 1.2s cubic-bezier(.34,1.4,.5,1) both;}
          @keyframes tilt-settle-${uid}{from{transform:rotate(0deg);}to{transform:rotate(${angle}deg);}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label={`${a.label} vs ${b.label}`}>
        <defs>
          <linearGradient id={`tilt-g-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={ca} /><stop offset="100%" stopColor={cb} />
          </linearGradient>
        </defs>
        <path d={`M ${Px - 26} ${H - 70} L ${Px} ${Py + 8} L ${Px + 26} ${H - 70} Z`}
          fill={`color-mix(in oklab, ${T.ink3} 18%, transparent)`} stroke={T.line} strokeWidth="1.4" />
        <ellipse cx={Px} cy={H - 64} rx="92" ry="9" fill={`color-mix(in oklab, ${T.ink3} 12%, transparent)`} />
        <g className={`tilt-${uid}`}>
          <rect x={Px - half} y={Py - 5} width={half * 2} height="10" rx="5" fill={`url(#tilt-g-${uid})`}
            style={{ filter: `drop-shadow(0 4px 10px color-mix(in oklab, ${T.ink} 18%, transparent))` }} />
          {pan(Px - half + 30, ca, a)}
          {pan(Px + half - 30, cb, b)}
        </g>
        <circle cx={Px} cy={Py} r="11" fill={T.surface} stroke={T.line} strokeWidth="2" />
        <circle cx={Px} cy={Py} r="4" fill={`url(#tilt-g-${uid})`} />
        <text x={Px} y={H - 26} textAnchor="middle" fontSize="11.5" fill={T.ink3}>
          {Math.round((a.n / total) * 100)}% {a.label.toLowerCase()} · {Math.round((b.n / total) * 100)}% {b.label.toLowerCase()}
        </text>
      </svg>
    </div>
  );
}
