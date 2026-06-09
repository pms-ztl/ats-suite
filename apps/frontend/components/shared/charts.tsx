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
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, LabelList,
} from "recharts";
import { cn } from "@/lib/utils";

/* ---- palette (matches the Aurora mint/purple system; tweak here to re-theme every chart) ---- */
export const CHART_COLORS = {
  brand: "#34d399",
  ai: "#7c5cff",
  info: "#0ea5e9",
  ok: "#16a34a",
  warn: "#f59e0b",
  danger: "#ef4444",
  pink: "#db2777",
  teal: "#14b8a6",
  violet: "#a855f7",
  ink3: "#94a3b8",
  grid: "rgba(148,163,184,0.18)",
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
  if (!data?.length) return <EmptyChart />;
  const hasArea = series.some((s) => (s.type ?? "area") === "area");
  const Cmp: any = hasArea ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height ?? "100%"}>
      <Cmp data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color || colorAt(i)} stopOpacity={0.35} />
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
              strokeWidth={2} fill={`url(#grad-${s.key})`} strokeDasharray={s.dashed ? "5 4" : undefined} dot={false} />
          ) : (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || colorAt(i)}
              strokeWidth={2} strokeDasharray={s.dashed ? "5 4" : undefined} dot={false} />
          )
        )}
      </Cmp>
    </ResponsiveContainer>
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
  if (!data?.length) return <EmptyChart />;
  const horizontal = layout === "horizontal";
  return (
    <ResponsiveContainer width="100%" height={height ?? "100%"}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, bottom: 0, left: horizontal ? 8 : -8 }}>
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
          <Bar key={s.key} dataKey={s.key} name={s.name} stackId={s.stackId} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={38} fill={s.color || colorAt(i)}>
            {colorFn && data.map((row, ri) => <Cell key={ri} fill={colorFn(row, ri)} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
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
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height={height ?? "100%"}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={pal[i % pal.length]} />)}
          </Pie>
          <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
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
    <ResponsiveContainer width="100%" height={height ?? "100%"}>
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
  );
}

/* ---- Treemap (e.g. cost concentration) ---- */
export function TreemapChart({ data, valueFormatter, height }: { data: { name: string; size: number; fill?: string }[]; valueFormatter?: (v: any) => string; height?: number }) {
  if (!data?.length) return <EmptyChart />;
  const colored = data.map((d, i) => ({ ...d, fill: d.fill || colorAt(i) }));
  return (
    <ResponsiveContainer width="100%" height={height ?? "100%"}>
      <Treemap data={colored} dataKey="size" nameKey="name" stroke="#0b1220" aspectRatio={4 / 3}>
        <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
      </Treemap>
    </ResponsiveContainer>
  );
}

/* ---- Radial gauge (single 0-100 value) ---- */
export function RadialGauge({ value, label, color = CHART_COLORS.brand, height }: { value: number; label?: React.ReactNode; color?: string; height?: number }) {
  const data = [{ name: "v", value: Math.max(0, Math.min(100, value)), fill: color }];
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height={height ?? "100%"}>
        <RadialBarChart innerRadius="68%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <RadialBar dataKey="value" background={{ fill: "rgba(148,163,184,0.14)" }} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
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
    <ResponsiveContainer width="100%" height={height ?? "100%"}>
      <FunnelChart>
        <Tooltip content={<DefaultTooltip valueFormatter={valueFormatter} />} />
        <Funnel dataKey="value" data={colored} isAnimationActive>
          <LabelList position="right" fill="currentColor" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
          <LabelList position="left" fill="currentColor" stroke="none" dataKey="value" style={{ fontSize: 11, fontWeight: 600 }} />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
