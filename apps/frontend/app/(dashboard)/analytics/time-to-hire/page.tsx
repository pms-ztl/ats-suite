"use client";
// app/(dashboard)/analytics/time-to-hire/page.tsx - EXACT Claude Design "Aurora"
// time-to-hire DETAIL (the time-to-hire slice of claude-design/screen-analytics.jsx:
// trend + by-department + metrics). Matches the just-shipped analytics overview
// (app/(dashboard)/analytics/page.tsx) for look, wiring, and tokens.
//
// HONEST WIRING: the allowed data layer exposes GET /analytics/time-to-hire, which
// today returns avg/median/p90 = null and empty byDepartment / trendByMonth until a
// per-application timestamp-history endpoint lands (see api-gateway aggregators). So
// the rich layout is preserved verbatim, but the TrendArea and the by-department
// breakdown render an EmptyState when their series is empty - never a fabricated
// number. The KPI strip (avg / median / fastest dept) is derived ONLY from whatever
// the endpoint actually returns; absent values read as a dash, not an invented day.
import { useEffect, useState } from "react";
import { KpiRow, SectionCard, TrendArea, Reveal, Pill, Btn, type Kpi } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";

/* ----------------------------- local data layer ----------------------------- */
// Local raw() (per task rules: do NOT edit lib/api.ts). Mirrors lib/api.ts: bearer
// from sessionStorage "ats-access-token", credentials include, unwrap res?.data ?? res.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  const json = await res.json();
  return json?.data ?? json;
}

type DeptRow = { dept: string; days: number };
type TthData = {
  avgDays: number | null;
  medianDays: number | null;
  p90Days: number | null;
  byDept: DeptRow[];
  trend: number[];
  trendLabels: string[];
  hiredCount: number;
  note?: string;
};

const num = (x: unknown): number | null => {
  const n = Number(x);
  return x == null || Number.isNaN(n) ? null : n;
};

/* Normalise either the time-to-hire payload (preferred) or, as a fallback, the
   pipeline payload (which carries no real TTH series, so it maps to an honest
   empty trend + empty departments). */
function normalize(out: any): TthData {
  const deptRaw: any[] = Array.isArray(out?.byDepartment) ? out.byDepartment
    : Array.isArray(out?.byDept) ? out.byDept : [];
  const byDept: DeptRow[] = deptRaw
    .map((d) => ({ dept: String(d?.department ?? d?.dept ?? d?.name ?? ""), days: Number(d?.days ?? d?.avgDays ?? d?.medianDays ?? d?.value ?? 0) }))
    .filter((d) => d.dept && Number.isFinite(d.days));

  const trendRaw: any[] = Array.isArray(out?.trendByMonth) ? out.trendByMonth
    : Array.isArray(out?.trend) ? out.trend : [];
  const trend = trendRaw.map((p) => Number(p?.days ?? p?.value ?? p?.avgDays ?? p?.medianDays ?? p) || 0);
  const trendLabels = trendRaw.map((p, i) => String(p?.month ?? p?.label ?? p?.period ?? p?.date ?? `M${i + 1}`));

  return {
    avgDays: num(out?.avgDays ?? out?.average ?? out?.mean),
    medianDays: num(out?.medianDays ?? out?.median),
    p90Days: num(out?.p90Days ?? out?.p90),
    byDept,
    trend,
    trendLabels,
    hiredCount: Number(out?.hiredCount ?? out?.hiredApplications ?? 0),
    note: typeof out?.note === "string" ? out.note : undefined,
  };
}

/* Tries GET /analytics/time-to-hire, then falls back to GET /analytics/pipeline,
   so the page still renders (with honest empties) if the dedicated route is down. */
function useTimeToHire() {
  const [state, setState] = useState<{ data?: TthData; error?: Error; loading: boolean }>({ loading: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    (async () => {
      try {
        const out = await raw("GET", "/analytics/time-to-hire");
        if (alive) setState({ data: normalize(out), loading: false });
      } catch {
        try {
          const out = await raw("GET", "/analytics/pipeline");
          if (alive) setState({ data: normalize(out), loading: false });
        } catch (error) {
          if (alive) setState({ error: error as Error, loading: false });
        }
      }
    })();
    return () => { alive = false; };
  }, [n]);
  return { ...state, reload: () => setN((x) => x + 1) };
}

const fmtDays = (v: number | null) => (v == null ? "--" : Math.round(v).toLocaleString());

export default function TimeToHirePage() {
  const tth = useTimeToHire();
  const d = tth.data;

  const byDept = d?.byDept ?? [];
  const maxDept = byDept.reduce((m, x) => Math.max(m, x.days), 0) || 1;
  const fastest = byDept.length ? byDept.reduce((a, b) => (b.days < a.days ? b : a)) : null;
  const trendReady = !!d && d.trend.length > 1;

  // KPI strip - avg / median / fastest dept - derived ONLY from the real payload.
  const kpis: Kpi[] = [
    { id: "avg", label: "Average time to hire", value: d?.avgDays ?? 0, icon: "clock", spark: [d?.avgDays ?? 0], delta: 0, good: false, suffix: "d" },
    { id: "median", label: "Median time to hire", value: d?.medianDays ?? 0, icon: "chart", spark: [d?.medianDays ?? 0], delta: 0, good: false, suffix: "d" },
    { id: "p90", label: "90th percentile", value: d?.p90Days ?? 0, icon: "listChecks", spark: [d?.p90Days ?? 0], delta: 0, good: false, suffix: "d" },
    { id: "fastest", label: fastest ? `Fastest: ${fastest.dept}` : "Fastest department", value: fastest?.days ?? 0, icon: "rocket", spark: [fastest?.days ?? 0], delta: 0, good: true, suffix: "d" },
  ];
  const hasAnyMetric = !!d && (d.avgDays != null || d.medianDays != null || d.p90Days != null || byDept.length > 0);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* breadcrumb / back link to /analytics */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>
        <a href="/analytics" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--c-ink-2)", fontWeight: 600, textDecoration: "none" }}>
          <Icon name="chevsL" size={15} /> Analytics
        </a>
        <Icon name="chevR" size={13} style={{ color: "var(--c-ink-3)" }} />
        <span style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>Time to hire</span>
      </div>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Time to hire</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>
            Days from application to accepted offer, with the trend over time and the breakdown by department.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 90 days</Pill>
          <Btn variant="primary" icon="arrowUpRight">Export</Btn>
        </div>
      </div>

      {/* KPI strip (avg / median / p90 / fastest dept) - derived from the real payload */}
      {tth.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {tth.error && <div className="mb-[18px]"><ErrorState title="Could not load metrics" body="The analytics service did not respond." code="GET /api/analytics/time-to-hire" onRetry={tth.reload} /></div>}
      {!tth.loading && !tth.error && hasAnyMetric && <KpiRow kpis={kpis} cols={4} />}
      {!tth.loading && !tth.error && d && !hasAnyMetric && (
        <Reveal>
          <div style={{ marginBottom: 18 }}>
            <SectionCard title="Metrics" icon="clock">
              <EmptyState
                title="No time-to-hire metrics yet"
                body={d.note ?? "Time-to-hire is computed once hires have a recorded application-to-offer timeline. Nothing to summarise for this period."}
              />
            </SectionCard>
          </div>
        </Reveal>
      )}

      {/* time-to-hire trend + by department (mirrors the overview row layout) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={1}>
          <SectionCard title="Time-to-hire trend" icon="chart" headRight={trendReady ? <Pill mono tone="var(--c-ink-2)" bg="var(--c-surface-2)" icon="clock">{d!.trend.length} periods</Pill> : undefined}>
            {tth.loading && <Skeleton className="h-48 rounded-lg" />}
            {tth.error && <ErrorState title="Trend unavailable" body="Could not load the time-to-hire trend." code="GET /api/analytics/time-to-hire" onRetry={tth.reload} />}
            {!tth.loading && !tth.error && trendReady && <TrendArea data={d!.trend} labels={d!.trendLabels} />}
            {!tth.loading && !tth.error && !trendReady && (
              <EmptyState
                title="No trend yet"
                body={d?.note ?? "The monthly time-to-hire series is not available from the current analytics endpoint. It fills in once hires accumulate a dated timeline."}
              />
            )}
          </SectionCard>
        </Reveal>
        <Reveal i={2}>
          <SectionCard title="By department" icon="briefcase">
            {tth.loading && <Skeleton className="h-40 rounded-lg" />}
            {tth.error && <ErrorState title="Breakdown unavailable" body="Could not load per-department time-to-hire." code="GET /api/analytics/time-to-hire" onRetry={tth.reload} />}
            {!tth.loading && !tth.error && byDept.length === 0 && (
              <EmptyState title="No department breakdown" body="Per-department time-to-hire appears once enough roles have completed a full hire cycle." />
            )}
            {!tth.loading && !tth.error && byDept.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {byDept.map((row, i) => (
                  <div key={row.dept} style={{ display: "grid", gridTemplateColumns: "92px 1fr 56px", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--c-ink-2)", fontWeight: 500 }}>{row.dept}</span>
                    <div style={{ height: 16, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: ((row.days / maxDept) * 100) + "%", borderRadius: 6, background: row.days > 28 ? "var(--c-warn)" : "var(--c-brand)", animation: "growx 1s var(--ease-out) both", animationDelay: (i * 80) + "ms" }} />
                    </div>
                    <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>{fmtDays(row.days)}d</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </Reveal>
      </div>
    </div>
  );
}
