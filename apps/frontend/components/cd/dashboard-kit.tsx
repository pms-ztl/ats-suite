"use client";
// components/cd/dashboard-kit.tsx
// Canonical, reusable dashboard pieces for the REAL-TIME OPS HOME (DESIGN_SPEC 7b/7c).
// Styled with the existing cd-tokens (status tokens --st-good/warn/bad/info/nodata).
// Same idioms as aurora-kit.tsx: inline styles + CSS vars, the shared Icon set, and
// the Spark polyline. The hard rule here is HONEST DATA: a value that is null/absent
// renders an em-dash empty state (--st-nodata + "No data yet"), NEVER a fake 0 or a
// flat zero-line, and a real measured 0 stays a real 0. The delta pill is suppressed
// entirely when there is no prior period.
//
// Freshness (LiveStatus) reuses the app's existing 45s refetch layer (lib/use-data.ts)
// rather than inventing a new fetch timer: the page passes the timestamp of its last
// successful load as `updatedAt`, and this component only renders the relative label +
// the live/stale pulse. The pulse animation is gated behind
// @media (prefers-reduced-motion: no-preference) via a scoped style block.
import * as React from "react";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "./icon";

/* The em-dash glyph used for every honest empty value. A single source so all the
   empty states look identical across cards. */
const EMPTY_CHAR = "—"; // em dash

/* ------------------------------ EmptyMetric ------------------------------ */
// The em-dash empty: a muted dash + an honest caption. Used standalone or by
// <KpiCard> when its value is null/absent. Distinct from a real measured 0.
export function EmptyMetric({
  caption = "No data yet",
  size = 30,
  style = {},
}: {
  caption?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...style }}>
      <span
        aria-hidden="true"
        className="tnum"
        style={{ fontSize: size, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.012em", color: "var(--st-nodata)" }}
      >
        {EMPTY_CHAR}
      </span>
      <span style={{ fontSize: 11, color: "var(--st-nodata)", fontWeight: 600 }}>{caption}</span>
    </div>
  );
}

/* ------------------------------- DeltaPill ------------------------------- */
// Signed change vs a comparison basis. Colour is driven by DIRECTION-OF-GOODNESS,
// not by the sign: `goodWhen="down"` (inverse metrics like time-to-fill) turns a
// rise RED and a fall GREEN. The arrow glyph is aria-hidden; the text carries the
// meaning. Renders NOTHING when delta is null/undefined (no prior period) so the
// caller never has to special-case the missing-pill layout.
export function DeltaPill({
  delta,
  goodWhen = "up",
  suffix = "",
  basis = "vs last period",
}: {
  delta: number | null | undefined;
  goodWhen?: "up" | "down";
  suffix?: string;
  basis?: string;
}) {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return null;

  if (delta === 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: "var(--st-nodata)" }}>
        <Icon name="dot" size={13} />
        No change {basis}
      </span>
    );
  }

  const up = delta > 0;
  const isGood = goodWhen === "up" ? up : !up;
  const tone = isGood ? "var(--st-good)" : "var(--st-bad)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 700, color: tone }}>
      <Icon name="arrowUpRight" size={13} style={{ transform: up ? "none" : "rotate(90deg)" }} />
      {up ? "+" : ""}
      {delta}
      {suffix}
      <span style={{ marginLeft: 4, fontWeight: 600, color: "var(--ink-3)" }}>{basis}</span>
    </span>
  );
}

/* -------------------------------- Spark ---------------------------------- */
// No axes, no grid; accent the latest point. Returns null for an absent/too-short
// series so an empty card never paints a flat zero-line.
export function MiniSpark({
  data,
  w = 74,
  h = 28,
  color = "var(--brand)",
}: {
  data?: number[] | null;
  w?: number;
  h?: number;
  color?: string;
}) {
  if (!Array.isArray(data) || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (d: number) => h - ((d - min) / (max - min || 1)) * (h - 4) - 2;
  const pts = data.map((d, i) => `${x(i)},${y(d)}`).join(" ");
  const last = data[data.length - 1];
  return (
    <svg width={w} height={h} style={{ display: "block" }} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(last)} r="2.5" fill={color} />
    </svg>
  );
}

/* -------------------------------- KpiCard -------------------------------- */
// One shared KPI tile, identical across cards (DESIGN_SPEC 7b). NAME (uppercase
// muted) / VALUE (fluid clamp, tabular-nums) / optional PERIOD caption / optional
// DeltaPill / optional sparkline slot / optional target line. A null/undefined
// `value` flips the whole tile to the honest EMPTY state; a real 0 is still a 0.
export function KpiCard({
  name,
  value,
  format = (n: number) => n.toLocaleString(),
  prefix = "",
  suffix = "",
  period,
  emptyCaption = "No data yet",
  icon,
  ai = false,
  delta,
  goodWhen = "up",
  deltaSuffix,
  deltaBasis,
  spark,
  target,
  style = {},
}: {
  name: string;
  /** Raw value; null/undefined renders the honest empty state (NOT 0). */
  value: number | null | undefined;
  /** Format the numeric value (default: locale string). */
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  /** Optional period caption, e.g. "Last 30 days". */
  period?: string;
  /** Caption for the empty state, e.g. "No data yet" / "Not enough history". */
  emptyCaption?: string;
  icon?: IconName;
  /** Machine-generated metric: violet AI accent + AI pill. */
  ai?: boolean;
  /** Change vs prior period; null/undefined suppresses the pill (no prior period). */
  delta?: number | null;
  /** Direction-of-goodness: inverse metrics (time-to-fill) use "down". */
  goodWhen?: "up" | "down";
  deltaSuffix?: string;
  deltaBasis?: string;
  /** Sparkline series, oldest -> newest. Omit/short series -> no spark. */
  spark?: number[] | null;
  /** Optional target/benchmark line: a value + label rendered under the number. */
  target?: { value: number; label?: string } | null;
  style?: React.CSSProperties;
}) {
  const absent = value === null || value === undefined || Number.isNaN(value as number);
  const accent = ai ? "var(--ai)" : "var(--brand)";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-lg)",
        padding: "15px 16px 17px",
        boxShadow: "var(--e1)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        ...style,
      }}
    >
      {/* NAME row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--ink-2)",
            fontWeight: 700,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          {icon && (
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: ai ? "var(--ai-tint)" : "var(--surface-2)",
                color: ai ? "var(--ai)" : "var(--ink-3)",
              }}
            >
              <Icon name={icon} size={14} />
            </span>
          )}
          {name}
        </span>
        {ai && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: "var(--r-pill)",
              color: "var(--ai-ink)",
              background: "var(--ai-tint)",
              letterSpacing: ".06em",
            }}
          >
            AI
          </span>
        )}
      </div>

      {/* VALUE + sparkline (or honest empty) */}
      {absent ? (
        <EmptyMetric caption={emptyCaption} />
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
            <div
              className="tnum"
              style={{
                fontSize: "clamp(1.75rem, 1.2rem + 2vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.012em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {prefix}
              {format(value as number)}
              {suffix}
            </div>
            {spark && <MiniSpark data={spark} color={accent} />}
          </div>
          {target && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--ink-3)" }}>
              <span aria-hidden="true" style={{ display: "inline-block", width: 14, height: 0, borderTop: "2px dashed var(--line-strong)" }} />
              {target.label ?? "Target"} {prefix}
              {format(target.value)}
              {suffix}
            </div>
          )}
        </>
      )}

      {/* PERIOD caption + DELTA pill. Pill renders nothing when delta is null. */}
      {(period || (!absent && delta !== null && delta !== undefined)) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {!absent && <DeltaPill delta={delta} goodWhen={goodWhen} suffix={deltaSuffix} basis={deltaBasis ?? "vs last period"} />}
          {period && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{period}</span>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------- LiveStatus ------------------------------ */
// ONE header-level freshness pulse per page (role="status"). Reuses the app's
// existing 45s refetch layer (lib/use-data.ts): the page passes `updatedAt` (the
// ms timestamp / Date / ISO string of its last successful load) and this component
// renders the relative "Updated Ns ago" label + a pulsing dot. The dot is green
// (Live) until the data is older than `staleAfterMs` (default 2x the 45s refresh),
// then amber (Stale). The pulse animation is wrapped in
// @media (prefers-reduced-motion: no-preference) so reduced-motion users get a
// static dot.
const REFRESH_MS = 45_000;

function toMs(t: number | string | Date | null | undefined): number | null {
  if (t === null || t === undefined) return null;
  if (t instanceof Date) return t.getTime();
  if (typeof t === "number") return Number.isFinite(t) ? t : null;
  const ms = new Date(t).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function relativeAgo(ms: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}

export function LiveStatus({
  updatedAt,
  staleAfterMs = REFRESH_MS * 2,
  liveLabel = "Live",
  staleLabel = "Stale",
  style = {},
}: {
  /** Timestamp of the last successful load (ms epoch / Date / ISO). Absent -> "Connecting". */
  updatedAt: number | string | Date | null | undefined;
  /** Age past which the dot turns amber. Defaults to 2x the 45s refresh. */
  staleAfterMs?: number;
  liveLabel?: string;
  staleLabel?: string;
  style?: React.CSSProperties;
}) {
  // Re-tick once a second so the relative label advances without a refetch.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = toMs(updatedAt);
  const hasData = ms !== null;
  const stale = hasData && Date.now() - ms > staleAfterMs;
  const dotColor = !hasData ? "var(--st-nodata)" : stale ? "var(--st-warn)" : "var(--st-good)";
  const label = !hasData ? "Connecting" : stale ? staleLabel : liveLabel;

  return (
    <span
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 11px",
        borderRadius: "var(--r-pill)",
        border: "1px solid var(--line-2)",
        background: "var(--surface)",
        fontSize: 12,
        fontWeight: 700,
        color: dotColor,
        fontFamily: "var(--font-sans)",
        ...style,
      }}
    >
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .cd-livestatus-dot[data-live="true"] { animation: livedot 1.7s infinite; }
        }
      `}</style>
      <span
        className="cd-livestatus-dot"
        data-live={hasData && !stale ? "true" : "false"}
        aria-hidden="true"
        style={{ width: 7, height: 7, borderRadius: 99, background: dotColor }}
      />
      {label}
      {hasData && (
        <span style={{ fontWeight: 600, color: "var(--ink-3)" }}>
          {"·"} Updated {relativeAgo(ms)}
        </span>
      )}
    </span>
  );
}
