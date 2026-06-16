"use client";
// components/shared/ribbon-ext.tsx
// House visualization family - extension set. Same DNA as ribbon.tsx: every
// color is a chained CSS variable so each model adapts to BOTH token scopes
// (dashboard --c-* and cd bare tokens) AND to light/dark automatically; soft
// motion is gated behind prefers-reduced-motion; each model renders its own
// honest empty state; REAL data only.
//
// Layout note: the composition / multi-metric models pair the visual with a
// readable value panel (label - number - share bar) so a wide card is filled
// and every figure stays legible even when the real data is skewed or sparse.
//
// Models: StreamGraph, WaffleField, ActivityRings, CalendarHeat, KiteRadar,
// MilestoneSpine, HoneyComb.
import * as React from "react";

const T = {
  brand: "var(--c-brand, var(--brand, #16a37a))",
  info: "var(--c-info, var(--info, #5588fb))",
  ai: "var(--c-ai, var(--ai, #7c5cff))",
  ok: "var(--c-ok, var(--ok, #16a34a))",
  warn: "var(--c-warn, var(--warn, #e09f3e))",
  danger: "var(--c-danger, var(--danger, #e05252))",
  ink: "var(--c-ink, var(--ink, #16203a))",
  ink2: "var(--c-ink-2, var(--ink-2, #5b647a))",
  ink3: "var(--c-ink-3, var(--ink-3, #8b93a7))",
  line: "var(--c-line, var(--line, #e4e8f0))",
  surface: "var(--c-surface, var(--surface, #ffffff))",
};

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
    <div style={{ height, display: "grid", placeItems: "center", borderRadius: 12, border: `1px dashed ${T.line}`, color: T.ink3, fontSize: 12.5, textAlign: "center", padding: "0 18px" }}>
      {label}
    </div>
  );
}

/* Shared right-hand value row: colored chip, label, value, and a share bar.
   Keeps the real numbers legible regardless of the visual's shape. */
function StatRow({ color, label, value, frac }: { color: string; label: string; value: string; frac?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0, alignSelf: "center", boxShadow: `0 0 7px color-mix(in oklab, ${color} 45%, transparent)` }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: T.ink2, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        <span className="mono tnum" style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)", whiteSpace: "nowrap" }}>{value}</span>
      </div>
      {frac != null && (
        <div style={{ height: 5, borderRadius: 99, background: `color-mix(in oklab, ${T.ink3} 13%, transparent)`, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.max(3, Math.round(frac * 100))}%`, borderRadius: 99, background: color, boxShadow: `0 0 6px color-mix(in oklab, ${color} 40%, transparent)` }} />
        </div>
      )}
    </div>
  );
}

const SPLIT: React.CSSProperties = { display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" };
const VIZCOL: React.CSSProperties = { flex: "2 1 340px", minWidth: 280 };
const PANELCOL: React.CSSProperties = { flex: "1 1 200px", minWidth: 188, display: "flex", flexDirection: "column", gap: 11 };

/* ---- StreamGraph: several REAL series stacked as a flowing, center-balanced
   river over shared time buckets, paired with a per-channel breakdown. ---- */
export function StreamGraph({
  buckets, series, height = 250,
  emptyLabel = "The river appears once history accrues.",
}: {
  buckets: { label: string }[];
  series: { label: string; values: number[]; color?: string }[];
  height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = series.filter((s) => s.values.some((v) => v > 0));
  const grand = live.reduce((s, se) => s + se.values.reduce((a, b) => a + b, 0), 0);
  if (buckets.length < 2 || !live.length || grand === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 760, H = height, padX = 30, padT = 26, padB = 34;
  const nB = buckets.length;
  const totals = buckets.map((_, j) => live.reduce((s, se) => s + (se.values[j] || 0), 0));
  const maxTotal = Math.max(...totals, 1);
  const bandH = H - padT - padB;
  const midY = padT + bandH / 2;
  const scale = bandH / maxTotal;
  const colored = live
    .map((s, i) => ({ ...s, color: s.color || PALETTE_T[i % PALETTE_T.length], total: s.values.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total);
  const x = (j: number) => padX + (nB > 1 ? ((W - 2 * padX) / (nB - 1)) * j : 0);
  const boundaryY = (level: number, j: number) => {
    const base = midY - (totals[j] * scale) / 2;
    let cum = 0;
    for (let i = 0; i < level; i++) cum += colored[i].values[j] || 0;
    return base + cum * scale;
  };
  const pathFwd = (pts: { x: number; y: number }[]) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], cx = (a.x + b.x) / 2; d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`; }
    return d;
  };
  const pathRev = (pts: { x: number; y: number }[]) => {
    let d = ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
    for (let i = pts.length - 2; i >= 0; i--) { const a = pts[i + 1], b = pts[i], cx = (a.x + b.x) / 2; d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`; }
    return d;
  };
  const bands = colored.map((se, i) => {
    const topPts = buckets.map((_, j) => ({ x: x(j), y: boundaryY(i, j) }));
    const botPts = buckets.map((_, j) => ({ x: x(j), y: boundaryY(i + 1, j) }));
    return { d: pathFwd(topPts) + pathRev(botPts) + " Z", color: se.color };
  });
  const peakJ = totals.indexOf(maxTotal);
  const dense = nB > 9;
  return (
    <div style={SPLIT}>
      <div style={VIZCOL}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-reduced-motion: no-preference){
            .stream-${uid} path{animation:stream-in-${uid} .8s ease-out both;}
            @keyframes stream-in-${uid}{from{opacity:0;}to{opacity:1;}}
          }` }} />
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Composition over time">
          <defs>
            {bands.map((b, i) => (
              <linearGradient key={i} id={`stream-g-${uid}-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={b.color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0.62" />
              </linearGradient>
            ))}
          </defs>
          {buckets.map((_, j) => (
            <line key={`g${j}`} x1={x(j)} y1={padT - 6} x2={x(j)} y2={H - padB + 4} stroke={T.line} strokeWidth="1" strokeOpacity="0.45" strokeDasharray="2 6" />
          ))}
          <g className={`stream-${uid}`}>
            {bands.map((b, i) => (
              <path key={i} d={b.d} fill={`url(#stream-g-${uid}-${i})`} stroke={T.surface} strokeWidth="1.1" strokeOpacity="0.55" style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </g>
          <text x={x(peakJ)} y={midY - (maxTotal * scale) / 2 - 8} textAnchor="middle" fontSize="11" fontWeight="800" fill={T.ink2} fontFamily="var(--font-mono, monospace)">{maxTotal}</text>
          {buckets.map((bk, j) => (
            (!dense || j % 2 === nB % 2 || j === nB - 1) ? (
              <text key={j} x={x(j)} y={H - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".04em" } as React.CSSProperties}>{bk.label}</text>
            ) : null
          ))}
        </svg>
      </div>
      <div style={PANELCOL}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 4, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: ".06em" }}>By channel</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>{grand}</span>
        </div>
        {colored.map((g, i) => <StatRow key={i} color={g.color} label={g.label} value={String(g.total)} frac={g.total / grand} />)}
      </div>
    </div>
  );
}

/* ---- WaffleField: a 100-cell square grid where each REAL category claims its
   share, paired with a labelled value/percent breakdown. ---- */
export function WaffleField({
  segments, cols = 10, valueLabel,
  emptyLabel = "The grid fills in once data arrives.",
}: {
  segments: { label: string; n: number; color?: string }[];
  cols?: number; valueLabel?: (n: number) => string; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = segments.filter((s) => s.n > 0);
  const total = live.reduce((s, g) => s + g.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={150} />;
  const colored = live
    .map((g, i) => ({ ...g, color: g.color || PALETTE_T[i % PALETTE_T.length], pct: g.n / total }))
    .sort((a, b) => b.n - a.n);
  const cells = cols * cols;
  const raw = colored.map((g) => g.pct * cells);
  const floors = raw.map((r) => Math.floor(r));
  let used = floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  let oi = 0;
  while (used < cells && oi < order.length) { floors[order[oi].i] += 1; used += 1; oi += 1; }
  const fill: string[] = [];
  colored.forEach((g, i) => { for (let k = 0; k < floors[i]; k++) fill.push(g.color); });
  while (fill.length < cells) fill.push("");
  const fmt = valueLabel || ((n: number) => String(n));
  return (
    <div style={SPLIT}>
      <div style={{ flex: "0 1 360px", minWidth: 240 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-reduced-motion: no-preference){
            .waffle-${uid} > span{animation:waffle-pop-${uid} .45s cubic-bezier(.22,1,.36,1) both;}
            @keyframes waffle-pop-${uid}{from{transform:scale(0);opacity:0;}to{transform:scale(1);opacity:1;}}
          }` }} />
        <div className={`waffle-${uid}`} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "clamp(4px, 0.8vw, 7px)" }}>
          {fill.map((c, i) => (
            <span key={i} style={{
              aspectRatio: "1 / 1", borderRadius: 5,
              background: c || `color-mix(in oklab, ${T.ink3} 9%, transparent)`,
              boxShadow: c ? `inset 0 0 0 1px color-mix(in oklab, ${c} 32%, transparent), 0 1px 3px color-mix(in oklab, ${c} 22%, transparent)` : "none",
              animationDelay: `${Math.min(i * 8, 650)}ms`,
            }} />
          ))}
        </div>
      </div>
      <div style={PANELCOL}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 4, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: ".06em" }}>Share</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>{fmt(total)}</span>
        </div>
        {colored.map((g, i) => <StatRow key={i} color={g.color} label={g.label} value={`${fmt(g.n)} · ${Math.round(g.pct * 100)}%`} frac={g.pct} />)}
      </div>
    </div>
  );
}

/* ---- ActivityRings: concentric progress rings (Apple-watch style). Each ring
   is one REAL rate filling clockwise from the top, with a labelled legend. ---- */
export function ActivityRings({
  rings, height = 250, centerLabel, centerSub,
  emptyLabel = "Rings appear once rates are measurable.",
}: {
  rings: { label: string; value: number | null | undefined; max?: number; color?: string }[];
  height?: number; centerLabel?: string; centerSub?: string; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = rings.filter((r) => r.value != null && isFinite(r.value as number)).slice(0, 4);
  if (!live.length) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 260, H = 260, cx = 130, cy = 130;
  const sw = 22, gap = 8;
  const ringData = live.map((r, i) => {
    const max = r.max && r.max > 0 ? r.max : 100;
    const frac = Math.max(0, Math.min(1, (r.value as number) / max));
    const rr = 116 - i * (sw + gap);
    return { ...r, frac, rr, C: 2 * Math.PI * rr, color: r.color || PALETTE_T[i % PALETTE_T.length], max };
  });
  return (
    <div style={SPLIT}>
      <div style={{ flex: "0 1 230px", minWidth: 190 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-reduced-motion: no-preference){
            ${ringData.map((r, i) => `.ring-${uid}-${i}{animation:ring-fill-${uid}-${i} 1.1s cubic-bezier(.3,1,.5,1) both;}@keyframes ring-fill-${uid}-${i}{from{stroke-dashoffset:${r.C};}to{stroke-dashoffset:${r.C * (1 - r.frac)};}}`).join("")}
          }` }} />
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Rates">
          <defs>
            {ringData.map((r, i) => (
              <linearGradient key={i} id={`ring-g-${uid}-${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={r.color} stopOpacity="0.7" /><stop offset="100%" stopColor={r.color} />
              </linearGradient>
            ))}
          </defs>
          <g transform={`rotate(-90 ${cx} ${cy})`}>
            {ringData.map((r, i) => (
              <circle key={`t${i}`} cx={cx} cy={cy} r={r.rr} fill="none" strokeWidth={sw} strokeLinecap="round" stroke={`color-mix(in oklab, ${r.color} 15%, transparent)`} />
            ))}
            {ringData.map((r, i) => (
              r.frac > 0.001 ? (
                <circle key={`p${i}`} className={`ring-${uid}-${i}`} cx={cx} cy={cy} r={r.rr} fill="none" strokeWidth={sw} strokeLinecap="round"
                  stroke={`url(#ring-g-${uid}-${i})`} strokeDasharray={r.C} strokeDashoffset={r.C * (1 - r.frac)}
                  style={{ filter: `drop-shadow(0 2px 6px color-mix(in oklab, ${r.color} 40%, transparent))` }} />
              ) : null
            ))}
          </g>
          {centerLabel != null && (
            <>
              <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle" fontSize="36" fontWeight="800" fill={T.ink} fontFamily="var(--font-mono, monospace)">{centerLabel}</text>
              {centerSub && <text x={cx} y={cy + 26} textAnchor="middle" fontSize="10" fontWeight="700" fill={T.ink3} style={{ textTransform: "uppercase", letterSpacing: ".07em" } as React.CSSProperties}>{centerSub}</text>}
            </>
          )}
        </svg>
      </div>
      <div style={PANELCOL}>
        {ringData.map((r, i) => (
          <StatRow key={i} color={r.color} label={r.label} value={r.max === 100 ? `${Math.round(r.frac * 100)}%` : `${Math.round(r.value as number)}`} frac={r.frac} />
        ))}
      </div>
    </div>
  );
}

/* ---- CalendarHeat: a GitHub-style daily activity heatmap (weeks as columns)
   paired with a stat panel. For activity density (interviews per day). ---- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function CalendarHeat({
  days, height = 170, weekStartsMonday = false,
  emptyLabel = "Activity appears once days have data.",
}: {
  days: { date: string; n: number }[];
  height?: number; weekStartsMonday?: boolean; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const parsed = days
    .map((d) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d.date);
      if (!m) return null;
      const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
      return { dt, ms: dt.getTime(), n: d.n };
    })
    .filter((x): x is { dt: Date; ms: number; n: number } => !!x)
    .sort((a, b) => a.ms - b.ms);
  const totalN = parsed.reduce((s, d) => s + d.n, 0);
  if (parsed.length < 2 || totalN === 0) return <EmptyNote label={emptyLabel} height={height} />;
  const wd = (dt: Date) => { const g = dt.getDay(); return weekStartsMonday ? (g + 6) % 7 : g; };
  const first = parsed[0].dt;
  const originMs = parsed[0].ms - wd(first) * 86400000;
  const maxN = Math.max(...parsed.map((d) => d.n), 1);
  const cellsByKey = new Map<string, number>();
  let maxCol = 0, busiest = parsed[0];
  parsed.forEach((d) => {
    const col = Math.floor((d.ms - originMs) / (7 * 86400000));
    maxCol = Math.max(maxCol, col);
    cellsByKey.set(`${col}:${wd(d.dt)}`, d.n);
    if (d.n > busiest.n) busiest = d;
  });
  const cell = 16, gp = 5, leftPad = 22, topPad = 16;
  const cols = maxCol + 1;
  const W = leftPad + cols * (cell + gp);
  const H = topPad + 7 * (cell + gp);
  const dayLabels = weekStartsMonday ? ["M", "", "W", "", "F", "", ""] : ["S", "M", "", "W", "", "F", ""];
  const color = (n: number | undefined) => {
    if (!n) return `color-mix(in oklab, ${T.ink3} 9%, transparent)`;
    return `color-mix(in oklab, ${T.brand} ${Math.round((0.22 + (n / maxN) * 0.73) * 100)}%, transparent)`;
  };
  const rects: React.ReactNode[] = [];
  const monthMarks: React.ReactNode[] = [];
  let prevMonth = -1;
  for (let c = 0; c < cols; c++) {
    const colDate = new Date(originMs + c * 7 * 86400000);
    if (colDate.getMonth() !== prevMonth) {
      prevMonth = colDate.getMonth();
      monthMarks.push(<text key={`m${c}`} x={leftPad + c * (cell + gp)} y={10} fontSize="9.5" fontWeight="700" fill={T.ink3}>{MONTHS[prevMonth]}</text>);
    }
    for (let r = 0; r < 7; r++) {
      const n = cellsByKey.get(`${c}:${r}`);
      rects.push(
        <rect key={`${c}-${r}`} x={leftPad + c * (cell + gp)} y={topPad + r * (cell + gp)} width={cell} height={cell} rx={4}
          fill={color(n)} stroke={n ? `color-mix(in oklab, ${T.brand} 32%, transparent)` : "none"} strokeWidth={n ? 0.8 : 0}>
          <title>{n ? `${n}` : "0"}</title>
        </rect>
      );
    }
  }
  const activeDays = parsed.filter((d) => d.n > 0).length;
  const thisWeek = parsed.filter((d) => (Date.now() - d.ms) <= 7 * 86400000).reduce((s, d) => s + d.n, 0);
  const busyLabel = busiest.dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const Stat = ({ k, v }: { k: string; v: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 11.5, color: T.ink3, fontWeight: 600 }}>{k}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)", textAlign: "right" }}>{v}</span>
    </div>
  );
  return (
    <div style={SPLIT}>
      <div style={{ flex: "2 1 360px", minWidth: 300 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block" }} role="img" aria-label="Daily activity">
          {monthMarks}
          {dayLabels.map((d, r) => d ? (
            <text key={r} x={leftPad - 6} y={topPad + r * (cell + gp) + cell - 4} textAnchor="end" fontSize="9" fontWeight="700" fill={T.ink3}>{d}</text>
          ) : null)}
          {rects}
        </svg>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 10, fontSize: 10.5, color: T.ink3 }}>
          <span>less</span>
          {[0.25, 0.45, 0.68, 0.85, 1].map((t, i) => (
            <span key={i} style={{ width: 13, height: 13, borderRadius: 4, background: `color-mix(in oklab, ${T.brand} ${Math.round(t * 95)}%, transparent)` }} />
          ))}
          <span>more</span>
        </div>
      </div>
      <div style={{ ...PANELCOL, gap: 13 }}>
        <div style={{ paddingBottom: 4, borderBottom: `1px solid ${T.line}` }}>
          <div className="mono" style={{ fontSize: 30, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)", lineHeight: 1 }}>{totalN}</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: ".06em", marginTop: 3 }}>total in range</div>
        </div>
        <Stat k="Busiest day" v={`${busiest.n} · ${busyLabel}`} />
        <Stat k="This week" v={`${thisWeek}`} />
        <Stat k="Active days" v={`${activeDays}`} />
        <Stat k="Peak / day" v={`${maxN}`} />
      </div>
    </div>
  );
}

/* ---- KiteRadar: a filled multi-axis profile over a spider grid, paired with a
   labelled 0-100 breakdown so skewed real values stay readable. ---- */
export function KiteRadar({
  axes, height = 320, gradient, max: globalMax,
  emptyLabel = "The profile appears once dimensions are scored.",
}: {
  axes: { label: string; value: number; max?: number }[];
  height?: number; gradient?: string[]; max?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = axes.filter((a) => isFinite(a.value)).slice(0, 8);
  if (live.length < 3) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 360, H = 360, cx = 180, cy = 178, R = 124;
  const n = live.length;
  const ang = (i: number) => -90 + (360 / n) * i;
  const pt = (i: number, rr: number) => { const a = (ang(i) * Math.PI) / 180; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; };
  const norm = (a: { value: number; max?: number }) => {
    const mx = globalMax && globalMax > 0 ? globalMax : (a.max && a.max > 0 ? a.max : 100);
    return Math.max(0, Math.min(1, a.value / mx));
  };
  const suffix = (a: { max?: number }) => ((globalMax ?? a.max ?? 100) === 100 ? "%" : "");
  // A small floor so a 0 vertex is still visible as a point, not collapsed onto the hub.
  const valuePts = live.map((a, i) => pt(i, 6 + (R - 6) * norm(a)));
  const poly = (pts: number[][]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";
  const stops = gradient && gradient.length >= 2 ? gradient : [T.brand, T.info, T.ai];
  const grid = [0.25, 0.5, 0.75, 1];
  return (
    <div style={SPLIT}>
      <div style={{ flex: "1 1 300px", minWidth: 260 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-reduced-motion: no-preference){
            .kite-${uid}{transform-box:fill-box;transform-origin:${cx}px ${cy}px;animation:kite-in-${uid} .9s cubic-bezier(.22,1,.36,1) both;}
            @keyframes kite-in-${uid}{from{transform:scale(.2);opacity:0;}to{transform:scale(1);opacity:1;}}
          }` }} />
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block", overflow: "visible", margin: "0 auto" }} role="img" aria-label="Multi-dimensional profile">
          <defs>
            <radialGradient id={`kite-g-${uid}`}>
              <stop offset="0%" stopColor={stops[stops.length - 1]} stopOpacity="0.42" />
              <stop offset="100%" stopColor={stops[0]} stopOpacity="0.2" />
            </radialGradient>
            <linearGradient id={`kite-s-${uid}`} x1="0" y1="0" x2="1" y2="1">
              {stops.map((c, i) => <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />)}
            </linearGradient>
          </defs>
          {grid.map((g, gi) => (
            <polygon key={gi} points={live.map((_, i) => pt(i, R * g).join(",")).join(" ")} fill="none" stroke={T.line} strokeWidth="1" strokeDasharray={gi === grid.length - 1 ? "none" : "3 5"} />
          ))}
          {grid.map((g, gi) => (
            <text key={`gl${gi}`} x={cx + 4} y={cy - R * g + 3} fontSize="8.5" fontWeight="600" fill={T.ink3} opacity="0.8">{Math.round(g * 100)}</text>
          ))}
          {live.map((_, i) => { const [ex, ey] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke={T.line} strokeWidth="1" strokeOpacity="0.6" />; })}
          <path className={`kite-${uid}`} d={poly(valuePts)} fill={`url(#kite-g-${uid})`} stroke={`url(#kite-s-${uid})`} strokeWidth="2.5" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 4px 12px color-mix(in oklab, ${T.ai} 22%, transparent))` }} />
          {valuePts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={T.surface} stroke={stops[i % stops.length]} strokeWidth="2.5" />)}
          {live.map((a, i) => {
            const [lx, ly] = pt(i, R + 18);
            const anchor = Math.abs(lx - cx) < 16 ? "middle" : lx > cx ? "start" : "end";
            return <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fontSize="10" fontWeight="700" fill={T.ink2}>{a.label}</text>;
          })}
        </svg>
      </div>
      <div style={PANELCOL}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: ".06em", paddingBottom: 4, borderBottom: `1px solid ${T.line}` }}>Dimensions · 0–100</span>
        {live.map((a, i) => <StatRow key={i} color={stops[i % stops.length]} label={a.label} value={`${Math.round(a.value)}${suffix(a)}`} frac={norm(a)} />)}
      </div>
    </div>
  );
}

/* ---- MilestoneSpine: a horizontal journey laid along a glowing spine. Each
   step is a REAL milestone - done (filled), current (pulsing), or ahead. ---- */
export function MilestoneSpine({
  steps, height = 150,
  emptyLabel = "The journey appears once it begins.",
}: {
  steps: { label: string; sub?: string; done?: boolean; current?: boolean }[];
  height?: number; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = steps.slice(0, 9);
  if (live.length < 2) return <EmptyNote label={emptyLabel} height={height} />;
  const W = 1000, H = height, padX = 64, cy = Math.round(H * 0.46);
  const step = (W - padX * 2) / (live.length - 1);
  const x = (i: number) => padX + i * step;
  const lastDone = live.reduce((acc, s, i) => (s.done || s.current ? i : acc), -1);
  return (
    <div style={{ width: "100%" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (prefers-reduced-motion: no-preference){
          .ms-cur-${uid}{transform-box:fill-box;transform-origin:center;animation:ms-pulse-${uid} 2.2s ease-in-out infinite;}
          @keyframes ms-pulse-${uid}{0%{transform:scale(1);opacity:.5;}70%{transform:scale(2.1);opacity:0;}100%{opacity:0;}}
        }` }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} role="img" aria-label="Journey">
        <defs>
          <linearGradient id={`ms-g-${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={T.brand} /><stop offset="100%" stopColor={T.ai} /></linearGradient>
        </defs>
        <line x1={x(0)} y1={cy} x2={x(live.length - 1)} y2={cy} stroke={T.line} strokeWidth="3" strokeLinecap="round" />
        {lastDone > 0 && (
          <line x1={x(0)} y1={cy} x2={x(lastDone)} y2={cy} stroke={`url(#ms-g-${uid})`} strokeWidth="3.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 2px 6px color-mix(in oklab, ${T.ai} 28%, transparent))` }} />
        )}
        {live.map((s, i) => {
          const cxn = x(i);
          const tone = s.current ? T.ai : s.done ? T.brand : T.ink3;
          const above = i % 2 === 0;
          return (
            <g key={i}>
              {s.current && <circle className={`ms-cur-${uid}`} cx={cxn} cy={cy} r="11" fill="none" stroke={T.ai} strokeWidth="2" />}
              <circle cx={cxn} cy={cy} r={s.done || s.current ? 9 : 7} fill={s.done ? T.brand : s.current ? T.ai : T.surface} stroke={tone} strokeWidth="2.5"
                style={s.done || s.current ? { filter: `drop-shadow(0 2px 7px color-mix(in oklab, ${tone} 45%, transparent))` } : undefined} />
              {s.done && <path d={`M ${cxn - 3.5} ${cy} l 2.4 2.6 l 4.6 -5`} fill="none" stroke={T.surface} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
              <text x={cxn} y={above ? cy - 22 : cy + 30} textAnchor="middle" fontSize="11.5" fontWeight={s.current ? 800 : 700} fill={s.current ? T.ink : s.done ? T.ink : T.ink2}>{s.label}</text>
              {s.sub && <text x={cxn} y={above ? cy - 36 : cy + 44} textAnchor="middle" fontSize="10" fontWeight="600" fill={T.ink3} fontFamily="var(--font-mono, monospace)">{s.sub}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---- HoneyComb: a honeycomb where each hexagon is a unit of a REAL category;
   the comb auto-sizes to the item count and pairs with a labelled legend. ---- */
export function HoneyComb({
  groups, perRow, rows, maxCells = 60, valueLabel,
  emptyLabel = "The comb fills in once items arrive.",
}: {
  groups: { label: string; n: number; color?: string }[];
  perRow?: number; rows?: number; maxCells?: number; valueLabel?: (n: number) => string; emptyLabel?: string;
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const live = groups.filter((g) => g.n > 0);
  const total = live.reduce((s, g) => s + g.n, 0);
  if (!live.length || total === 0) return <EmptyNote label={emptyLabel} height={150} />;
  const colored = live.map((g, i) => ({ ...g, color: g.color || PALETTE_T[i % PALETTE_T.length] })).sort((a, b) => b.n - a.n);
  const scale = total > maxCells ? maxCells / total : 1;
  const cap = Math.min(maxCells, Math.round(total * scale));
  // Auto layout: a roughly balanced grid sized to the real count (no big empty comb).
  const cells = Math.max(cap, 1);
  const cpr = perRow ?? Math.max(4, Math.min(13, Math.round(Math.sqrt(cells * 1.7))));
  const raw = colored.map((g) => g.n * scale);
  const floors = raw.map((r) => Math.floor(r));
  let used = floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  let oi = 0;
  while (used < cap && oi < order.length) { floors[order[oi].i] += 1; used += 1; oi += 1; }
  const fillColors: string[] = [];
  colored.forEach((g, i) => { for (let k = 0; k < floors[i]; k++) fillColors.push(g.color); });
  const shown = fillColors.length;
  const s = 21;
  const hw = Math.sqrt(3) * s;
  const vstep = 1.5 * s;
  const hex = (cxn: number, cyn: number) =>
    [-90, -30, 30, 90, 150, 210].map((d) => { const a = (d * Math.PI) / 180; return `${(cxn + s * Math.cos(a)).toFixed(1)},${(cyn + s * Math.sin(a)).toFixed(1)}`; }).join(" ");
  const cells2: { x: number; y: number; color: string }[] = [];
  let idx = 0, r = 0;
  while (idx < shown) {
    const odd = r % 2 === 1;
    const count = Math.min(cpr - (odd ? 1 : 0), shown - idx);
    for (let c = 0; c < count; c++) {
      cells2.push({ x: hw / 2 + 4 + c * hw + (odd ? hw / 2 : 0), y: s + 4 + r * vstep, color: fillColors[idx] });
      idx += 1;
    }
    r += 1;
    if (rows && r >= rows) break;
  }
  const usedRows = r;
  const W = hw * cpr + 8;
  const H = s + 4 + (usedRows - 1) * vstep + s + 4;
  const fmt = valueLabel || ((n: number) => String(n));
  return (
    <div style={SPLIT}>
      <div style={{ flex: "1 1 280px", minWidth: 230 }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-reduced-motion: no-preference){
            .comb-${uid} polygon{animation:comb-pop-${uid} .5s cubic-bezier(.22,1,.36,1) both;}
            @keyframes comb-pop-${uid}{from{opacity:0;transform:scale(.4);}to{opacity:1;transform:scale(1);}}
          }` }} />
        <svg viewBox={`0 0 ${W} ${H}`} className={`comb-${uid}`} style={{ width: "100%", maxWidth: W, height: "auto", display: "block", overflow: "visible", margin: "0 auto" }} role="img" aria-label="Composition comb">
          {cells2.map((cl, i) => (
            <polygon key={i} points={hex(cl.x, cl.y)}
              fill={`color-mix(in oklab, ${cl.color} 84%, transparent)`}
              stroke={`color-mix(in oklab, ${cl.color} 46%, transparent)`} strokeWidth="1.2"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: `${Math.min(i * 12, 700)}ms`, filter: `drop-shadow(0 1px 3px color-mix(in oklab, ${cl.color} 25%, transparent))` }} />
          ))}
        </svg>
      </div>
      <div style={PANELCOL}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 4, borderBottom: `1px solid ${T.line}` }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: T.ink3, textTransform: "uppercase", letterSpacing: ".06em" }}>{scale < 1 ? `${shown} of ${total}` : "Total"}</span>
          <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: T.ink, fontFamily: "var(--font-mono, monospace)" }}>{fmt(total)}</span>
        </div>
        {colored.map((g, i) => <StatRow key={i} color={g.color} label={g.label} value={fmt(g.n)} frac={g.n / total} />)}
      </div>
    </div>
  );
}
