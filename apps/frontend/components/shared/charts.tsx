"use client";

/**
 * Themed recharts kit for the ATS dashboards. One consistent, Aurora-styled wrapper set so every
 * role dashboard (Super Admin / Tenant Admin / HR-Manager) renders real data with tooltips, legends,
 * and responsive sizing - replacing the bespoke inline-SVG / hardcoded-array charts the audit flagged.
 *
 * All components are presentational: pass real data in, get an interactive chart out.
 */

import * as React from "react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, Treemap, RadialBarChart, RadialBar, FunnelChart, Funnel,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LabelList, Sankey, Layer,
} from "recharts";
import { cn } from "@/lib/utils";

/* ---- palette: THEME-ADAPTIVE. Every color is a CSS variable (the app's --c-* full-color
   tokens, defined for both light and dark) with a hex fallback for contexts where the
   token scope is missing. SVG presentation attributes resolve var() like any CSS, so the
   charts re-theme live when .dark flips - no JS re-render needed. ---- */
export const CHART_COLORS = {
  brand: "var(--c-brand, #34d399)",
  ai: "var(--c-ai, #7c5cff)",
  info: "var(--c-info, #0ea5e9)",
  ok: "var(--c-ok, #16a34a)",
  warn: "var(--c-warn, #f59e0b)",
  danger: "var(--c-danger, #ef4444)",
  pink: "var(--c-pink, #db2777)",
  teal: "var(--c-teal, #14b8a6)",
  violet: "var(--c-ai-2, #a855f7)",
  ink3: "var(--c-ink-3, #94a3b8)",
  grid: "color-mix(in oklab, var(--c-ink-3, #94a3b8) 24%, transparent)",
};
export const PALETTE = [
  CHART_COLORS.ai, CHART_COLORS.brand, CHART_COLORS.info, CHART_COLORS.warn,
  CHART_COLORS.danger, CHART_COLORS.pink, CHART_COLORS.teal, CHART_COLORS.violet,
];
export const colorAt = (i: number) => PALETTE[i % PALETTE.length];

/* ---- shared chrome ---- */
export function ChartCard({
  title, subtitle, right, className, bodyClassName, height = 260, children,
}: {
  title?: React.ReactNode; subtitle?: React.ReactNode; right?: React.ReactNode;
  className?: string; bodyClassName?: string; height?: number; children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card/60 p-4", className)}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold leading-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={bodyClassName} style={{ width: "100%", height }}>
        {children}
      </div>
    </div>
  );
}

function TipBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {children}
    </div>
  );
}

function DefaultTooltip({ active, payload, label, valueFormatter }: any) {
  if (!active || !payload || !payload.length) return null;
  const fmt = valueFormatter || ((v: any) => v);
  return (
    <TipBox>
      {label != null && <div className="mb-1 font-medium text-foreground">{label}</div>}
      <div className="space-y-0.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-[2px]" style={{ background: p.color || p.fill || p.payload?.fill }} />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto font-medium text-foreground">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </TipBox>
  );
}

export function EmptyChart({ label = "No data yet" }: { label?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
      {label}
    </div>
  );
}

/* Recharts' ResponsiveContainer logs a "width(-1) and height(-1)" console warning on
   its first (pre-measure) render even though the chart paints fine a frame later, and
   that warning fires no matter when it mounts. AutoSize measures the container with a
   ResizeObserver and only renders the chart once it has real pixel dimensions, which
   are then passed to ResponsiveContainer as concrete numbers - so recharts never sees
   -1 and never warns. The wrapper keeps the exact same footprint (width:100%, the
   given height, minHeight floor). */
function AutoSize({ height, children }: { height?: number; children: (w: number, h: number) => React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      if (w > 0 && h > 0) setSize((p) => (p && p.w === w && p.h === h ? p : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width: "100%", height: height ?? "100%", minHeight: 100 }}>
      {size ? children(size.w, size.h) : null}
    </div>
  );
}

const axisProps = {
  tick: { fontSize: 11, fill: CHART_COLORS.ink3 },
  tickLine: false,
  axisLine: { stroke: CHART_COLORS.grid },
} as const;

/* ---- Trend (area or line) with optional comparison band lines (e.g. median / p90) ---- */
export function TrendChart({
  data, xKey, series, valueFormatter, height,
}: {
  data: any[]; xKey: string;
  series: { key: string; name: string; color?: string; type?: "area" | "line"; dashed?: boolean }[];
  valueFormatter?: (v: any) => string; height?: number;
}) {
  // Gradient ids must be unique per chart instance: several charts on one page reuse
  // series keys like "n", and colliding ids silently paint the wrong gradient.
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!data?.length) return <EmptyChart />;
  const hasArea = series.some((s) => (s.type ?? "area") === "area");
  const Cmp: any = hasArea ? AreaChart : LineChart;
  // Sparse series read better with visible points on the line.
  const showDots = data.length <= 14;
  return (
    <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
      <Cmp data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color || colorAt(i)} stopOpacity={0.45} />
              <stop offset="100%" stopColor={s.color || colorAt(i)} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} width={44} />
        <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) =>
          (s.type ?? "area") === "area" ? (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || colorAt(i)}
              strokeWidth={2.5} fill={`url(#grad-${uid}-${s.key})`} strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={showDots ? { r: 3, strokeWidth: 0, fill: s.color || colorAt(i) } : false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--c-surface, #fff)" }} />
          ) : (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || colorAt(i)}
              strokeWidth={2.5} strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={showDots ? { r: 3, strokeWidth: 0, fill: s.color || colorAt(i) } : false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--c-surface, #fff)" }} />
          )
        )}
      </Cmp>
    </ResponsiveContainer>
      )}</AutoSize>
  );
}

/* ---- Bars (vertical or horizontal), optional per-bar color + stacked series ---- */
export function BarsChart({
  data, categoryKey, series, layout = "vertical", valueFormatter, colorFn, height, threshold,
}: {
  data: any[]; categoryKey: string;
  series: { key: string; name: string; color?: string; stackId?: string }[];
  layout?: "vertical" | "horizontal"; valueFormatter?: (v: any) => string;
  colorFn?: (row: any, i: number) => string; height?: number; threshold?: { value: number; label?: string };
}) {
  // Unique gradient ids per instance (series keys repeat across charts on one page).
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  if (!data?.length) return <EmptyChart />;
  const horizontal = layout === "horizontal";
  // "transparent" series (e.g. the floating base of a range bar) must not get a gradient.
  const fillFor = (s: { key: string; color?: string }, i: number) =>
    s.color === "transparent" ? "transparent" : `url(#bar-${uid}-${i})`;
  return (
    <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, bottom: 0, left: horizontal ? 8 : -8 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`bar-${uid}-${i}`}
              x1="0" y1="0" x2={horizontal ? "1" : "0"} y2={horizontal ? "0" : "1"}>
              <stop offset="0%" stopColor={s.color || colorAt(i)} stopOpacity={0.95} />
              <stop offset="100%" stopColor={s.color || colorAt(i)} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} />
            <YAxis type="category" dataKey={categoryKey} {...axisProps} width={120} />
          </>
        ) : (
          <>
            <XAxis type="category" dataKey={categoryKey} {...axisProps} />
            <YAxis type="number" {...axisProps} width={44} />
          </>
        )}
        <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} content={<DefaultTooltip valueFormatter={valueFormatter} />} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {threshold != null && (
          <ReferenceLine {...(horizontal ? { x: threshold.value } : { y: threshold.value })}
            stroke={CHART_COLORS.danger} strokeDasharray="4 4"
            label={{ value: threshold.label, fontSize: 10, fill: CHART_COLORS.danger }} />
        )}
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} stackId={s.stackId} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={44} fill={fillFor(s, i)}
            background={series.length === 1 && !s.stackId ? { fill: "color-mix(in oklab, var(--c-ink-3, #94a3b8) 8%, transparent)", radius: 6 } as any : undefined}>
            {colorFn && data.map((row, ri) => <Cell key={ri} fill={colorFn(row, ri)} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
      )}</AutoSize>
  );
}

/* ---- Donut / Pie with legend + optional center label ---- */
export function DonutChart({
  data, nameKey = "name", valueKey = "value", centerLabel, centerSub, valueFormatter, height, colors,
}: {
  data: any[]; nameKey?: string; valueKey?: string; centerLabel?: React.ReactNode; centerSub?: React.ReactNode;
  valueFormatter?: (v: any) => string; height?: number; colors?: string[];
}) {
  if (!data?.length) return <EmptyChart />;
  const pal = colors || PALETTE;
  return (
    <div className="relative h-full w-full" style={{ filter: "drop-shadow(0 6px 14px color-mix(in oklab, var(--c-ink, #16203a) 10%, transparent))" }}>
      <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
        <PieChart>
          {/* faint full track ring behind the segments */}
          <Pie data={[{ v: 1 }]} dataKey="v" innerRadius="62%" outerRadius="84%" stroke="none"
            isAnimationActive={false} fill="color-mix(in oklab, var(--c-ink-3, #94a3b8) 10%, transparent)" />
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="62%" outerRadius="84%"
            paddingAngle={3} cornerRadius={6} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={pal[i % pal.length]} />)}
          </Pie>
          <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      )}</AutoSize>
      {(centerLabel != null || centerSub != null) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-6">
          <div className="text-lg font-semibold">{centerLabel}</div>
          {centerSub != null && <div className="text-[11px] text-muted-foreground">{centerSub}</div>}
        </div>
      )}
    </div>
  );
}

/* ---- Scatter (x, y, size=z, per-point color) ---- */
export function ScatterPlot({
  data, xKey, yKey, zKey, xName, yName, colorFn, valueFormatter, height, xFormatter, yFormatter,
}: {
  data: any[]; xKey: string; yKey: string; zKey?: string; xName?: string; yName?: string;
  colorFn?: (row: any, i: number) => string; valueFormatter?: (v: any) => string; height?: number;
  xFormatter?: (v: any) => string; yFormatter?: (v: any) => string;
}) {
  if (!data?.length) return <EmptyChart />;
  return (
    <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 4, left: -4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis type="number" dataKey={xKey} name={xName} {...axisProps} tickFormatter={xFormatter} />
        <YAxis type="number" dataKey={yKey} name={yName} {...axisProps} width={48} tickFormatter={yFormatter} />
        {zKey && <ZAxis type="number" dataKey={zKey} range={[60, 420]} />}
        <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<DefaultTooltip valueFormatter={valueFormatter} />} />
        <Scatter data={data}>
          {data.map((row, i) => <Cell key={i} fill={colorFn ? colorFn(row, i) : colorAt(i)} fillOpacity={0.78} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
      )}</AutoSize>
  );
}

/* ---- Treemap (e.g. cost concentration / channel mix) with readable in-cell labels ---- */
function TreemapCell(props: any) {
  const { x, y, width, height, name, value, fill, valueFormatter, depth } = props;
  if (width <= 0 || height <= 0) return null;
  // recharts also runs the content renderer for the ROOT node; without a fill it
  // paints black and peeks through the children's rounded corners (ugly in the
  // light theme). Leaf cells only.
  if (!name || depth === 0) return null;
  const showName = width > 56 && height > 30;
  const showValue = width > 56 && height > 48;
  const fmt = valueFormatter || ((v: any) => v);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={8} ry={8}
        fill={fill} fillOpacity={0.88} stroke="var(--c-surface, #fff)" strokeWidth={2.5} />
      {showName && (
        <text x={x + 8} y={y + 18} fill="var(--c-ink-inv, #fff)" fontSize={11.5} fontWeight={700} style={{ pointerEvents: "none" }}>
          {String(name).length > Math.floor(width / 7) ? String(name).slice(0, Math.max(3, Math.floor(width / 7) - 1)) + "…" : name}
        </text>
      )}
      {showValue && (
        <text x={x + 8} y={y + 34} fill="var(--c-ink-inv, #fff)" fillOpacity={0.85} fontSize={10.5} fontFamily="var(--font-mono, monospace)" style={{ pointerEvents: "none" }}>
          {fmt(value)}
        </text>
      )}
    </g>
  );
}
export function TreemapChart({ data, valueFormatter, height }: { data: { name: string; size: number; fill?: string }[]; valueFormatter?: (v: any) => string; height?: number }) {
  if (!data?.length) return <EmptyChart />;
  const colored = data.map((d, i) => ({ ...d, fill: d.fill || colorAt(i) }));
  return (
    <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
      <Treemap data={colored} dataKey="size" nameKey="name" aspectRatio={4 / 3} isAnimationActive
        content={<TreemapCell valueFormatter={valueFormatter} />}>
        <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
      </Treemap>
    </ResponsiveContainer>
      )}</AutoSize>
  );
}

/* ---- Sankey flow (e.g. AI workload: workforce -> agents, or agent -> model routing).
   Takes simple {from, to, value} links; nodes are derived. Node + link colors follow the
   theme tokens, labels render beside each node. ---- */
function SankeyNode({ x, y, width, height, payload, containerWidth }: any) {
  const isLeft = x + width / 2 < (containerWidth ?? 600) / 2;
  return (
    <Layer>
      <rect x={x} y={y} width={width} height={height} rx={3} fill={payload.fill || CHART_COLORS.ai} fillOpacity={0.92} />
      <text
        x={isLeft ? x + width + 7 : x - 7} y={y + height / 2}
        textAnchor={isLeft ? "start" : "end"} dominantBaseline="middle"
        fontSize={11.5} fontWeight={600} fill="var(--c-ink, #16203a)">
        {payload.name}
      </text>
      <text
        x={isLeft ? x + width + 7 : x - 7} y={y + height / 2 + 13}
        textAnchor={isLeft ? "start" : "end"} dominantBaseline="middle"
        fontSize={10} fill={CHART_COLORS.ink3} fontFamily="var(--font-mono, monospace)">
        {payload.valueLabel ?? ""}
      </text>
    </Layer>
  );
}
export function SankeyFlow({
  links, valueFormatter, height, nodeColor,
}: {
  links: { from: string; to: string; value: number }[];
  valueFormatter?: (v: number) => string; height?: number;
  nodeColor?: (name: string, index: number) => string;
}) {
  const positive = (links ?? []).filter((l) => l.value > 0);
  if (!positive.length) return <EmptyChart />;
  const names: string[] = [];
  for (const l of positive) {
    if (!names.includes(l.from)) names.push(l.from);
    if (!names.includes(l.to)) names.push(l.to);
  }
  const fmt = valueFormatter || ((v: number) => String(v));
  const totals = new Map<string, number>();
  for (const l of positive) {
    totals.set(l.from, (totals.get(l.from) ?? 0) + l.value);
    totals.set(l.to, (totals.get(l.to) ?? 0) + l.value);
  }
  const data = {
    nodes: names.map((n, i) => ({
      name: n,
      fill: nodeColor ? nodeColor(n, i) : colorAt(i),
      valueLabel: fmt(totals.get(n) ?? 0),
    })),
    links: positive.map((l) => ({ source: names.indexOf(l.from), target: names.indexOf(l.to), value: l.value })),
  };
  return (
    <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
      <Sankey data={data} nodePadding={26} nodeWidth={10}
        margin={{ top: 8, right: 130, bottom: 8, left: 8 }}
        node={<SankeyNode />} link={{ stroke: CHART_COLORS.ai, strokeOpacity: 0.25 }}>
        <Tooltip content={<DefaultTooltip valueFormatter={fmt} />} />
      </Sankey>
    </ResponsiveContainer>
      )}</AutoSize>
  );
}

/* ---- Radial gauge (single 0-100 value) with a gradient arc ---- */
export function RadialGauge({ value, label, color = CHART_COLORS.brand, height }: { value: number; label?: React.ReactNode; color?: string; height?: number }) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const data = [{ name: "v", value: Math.max(0, Math.min(100, value)), fill: `url(#gauge-${uid})` }];
  return (
    <div className="relative h-full w-full" style={{ filter: "drop-shadow(0 6px 14px color-mix(in oklab, var(--c-ink, #16203a) 10%, transparent))" }}>
      <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
        <RadialBarChart innerRadius="72%" outerRadius="98%" data={data} startAngle={90} endAngle={-270}>
          <defs>
            <linearGradient id={`gauge-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <RadialBar dataKey="value" background={{ fill: "color-mix(in oklab, var(--c-ink-3, #94a3b8) 12%, transparent)" }} cornerRadius={12} />
        </RadialBarChart>
      </ResponsiveContainer>
      )}</AutoSize>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-semibold">{Math.round(value)}%</div>
        {label != null && <div className="text-[11px] text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}

/* ---- Funnel (pipeline stages) ---- */
export function FunnelViz({ data, valueFormatter, height }: { data: { name: string; value: number; fill?: string }[]; valueFormatter?: (v: any) => string; height?: number }) {
  if (!data?.length) return <EmptyChart />;
  const colored = data.map((d, i) => ({ ...d, fill: d.fill || colorAt(i) }));
  return (
    <AutoSize height={height}>{(__w, __h) => (
      <ResponsiveContainer width={__w} height={__h}>
      <FunnelChart>
        <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
        <Funnel dataKey="value" data={colored} isAnimationActive>
          <LabelList position="right" fill="currentColor" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
          <LabelList position="left" fill="currentColor" stroke="none" dataKey="value" style={{ fontSize: 11, fontWeight: 600 }} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
      )}</AutoSize>
  );
}
