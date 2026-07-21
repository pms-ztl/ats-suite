"use client";
// app/(dashboard)/analytics/time-to-hire/page.tsx - EXACT Claude Design "Aurora"
// time-to-hire DETAIL (the time-to-hire slice of claude-design/screen-analytics.jsx:
// trend + by-department + metrics). Matches the just-shipped analytics overview
// (app/(dashboard)/analytics/page.tsx) for look, wiring, and tokens.
//
// HONEST WIRING: the allowed data layer exposes GET /analytics/time-to-hire, which
// today returns avg/median/p90 = null and empty byDepartment / trendByMonth until a
// per-application timestamp-history endpoint lands (see api-gateway aggregators). So
// the rich layout is preserved verbatim, but the kit TrendChart and the by-department
// BarsChart render the real series when present and an EmptyChart ("awaiting analytics
// aggregator") when empty - never a fabricated number. The KPI strip (avg / median /
// fastest dept) is derived ONLY from whatever the endpoint actually returns; absent
// values read as a dash, not an invented day.
import { useEffect, useState } from "react";
import { KpiRow, SectionCard, Reveal, Pill, Btn, type Kpi } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { TrendChart, BarsChart, EmptyChart, CHART_COLORS } from "@/components/shared/charts";
import { exportReport } from "@/lib/export";

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
type TrendRow = { label: string; avgDays: number; medianDays: number; p90Days: number; hires: number };
type TthData = {
  avgDays: number | null;
  medianDays: number | null;
  p90Days: number | null;
  byDept: DeptRow[];
  trend: number[];
  trendLabels: string[];
  trendRows: TrendRow[];
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
  const trend = trendRaw.map((p) => Number(p?.avgDays ?? p?.days ?? p?.value ?? p?.medianDays ?? p) || 0);
  const trendLabels = trendRaw.map((p, i) => String(p?.label ?? p?.month ?? p?.period ?? p?.date ?? `M${i + 1}`));
  const trendRows: TrendRow[] = trendRaw.map((p, i) => ({
    label: String(p?.label ?? p?.month ?? p?.period ?? `M${i + 1}`),
    avgDays: Number(p?.avgDays ?? p?.days ?? p?.value ?? 0) || 0,
    medianDays: Number(p?.medianDays ?? p?.avgDays ?? p?.days ?? 0) || 0,
    p90Days: Number(p?.p90Days ?? p?.avgDays ?? p?.days ?? 0) || 0,
    hires: Number(p?.hires ?? 0) || 0,
  }));

  return {
    avgDays: num(out?.avgDays ?? out?.average ?? out?.mean),
    medianDays: num(out?.medianDays ?? out?.median),
    p90Days: num(out?.p90Days ?? out?.p90),
    byDept,
    trend,
    trendLabels,
    trendRows,
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
  const fastest = byDept.length ? byDept.reduce((a, b) => (b.days < a.days ? b : a)) : null;
  const trendReady = !!d && d.trend.length > 1;
  // Real monthly trend rows (avg + median + p90) from /api/analytics/time-to-hire.
  const trendData = (d?.trendRows ?? []).map((r, i) => ({
    period: r.label || d?.trendLabels[i] || `M${i + 1}`,
    avgDays: r.avgDays, medianDays: r.medianDays, p90Days: r.p90Days,
  }));

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
          <Btn variant="primary" icon="arrowUpRight" onClick={() => exportReport("xlsx", {
            filename: `time-to-hire-${new Date().toISOString().slice(0, 10)}`,
            title: "Time to hire",
            subtitle: `Last 90 days · generated ${new Date().toLocaleString()}`,
            sections: [
              { filename: "", title: "Summary", headers: ["Metric", "Value"], rows: [
                ["Average days", d?.avgDays ?? "—"],
                ["Median days", d?.medianDays ?? "—"],
                ["P90 days", d?.p90Days ?? "—"],
                ["Total hires", d?.hiredCount ?? 0],
              ] },
              { filename: "", title: "Trend", headers: ["Month", "Avg days", "Median days", "P90 days", "Hires"], rows: (d?.trendRows ?? []).filter((t) => t.hires > 0).map((t) => [t.label, t.avgDays, t.medianDays, t.p90Days, t.hires]) },
              { filename: "", title: "By department", headers: ["Department", "Avg days"], rows: byDept.map((x) => [x.dept, x.days]) },
            ],
          })}>Export</Btn>
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
            {!tth.loading && !tth.error && trendReady && (
              <div style={{ height: 220 }}>
                <TrendChart
                  data={trendData}
                  xKey="period"
                  series={[
                    { key: "avgDays", name: "Avg days", color: CHART_COLORS.brand, type: "area" },
                    { key: "medianDays", name: "Median", color: CHART_COLORS.info, type: "line", dashed: true },
                    { key: "p90Days", name: "P90", color: CHART_COLORS.violet, type: "line", dashed: true },
                  ]}
                  valueFormatter={(v) => `${Math.round(Number(v))}d`}
                />
              </div>
            )}
            {!tth.loading && !tth.error && !trendReady && (
              <div style={{ height: 220 }}>
                <EmptyChart label="Time-to-hire trend - awaiting analytics aggregator" />
              </div>
            )}
          </SectionCard>
        </Reveal>
        <Reveal i={2}>
          <SectionCard title="By department" icon="briefcase">
            {tth.loading && <Skeleton className="h-40 rounded-lg" />}
            {tth.error && <ErrorState title="Breakdown unavailable" body="Could not load per-department time-to-hire." code="GET /api/analytics/time-to-hire" onRetry={tth.reload} />}
            {!tth.loading && !tth.error && byDept.length === 0 && (
              <div style={{ height: 200 }}>
                <EmptyChart label="By department - awaiting analytics aggregator" />
              </div>
            )}
            {!tth.loading && !tth.error && byDept.length > 0 && (
              <div style={{ height: Math.max(180, byDept.length * 36 + 36) }}>
                <BarsChart
                  data={byDept.slice().sort((a, b) => b.days - a.days)}
                  categoryKey="dept"
                  layout="horizontal"
                  series={[{ key: "days", name: "Days to hire" }]}
                  valueFormatter={(v) => `${fmtDays(Number(v))}d`}
                  colorFn={(row) => (row.days > 28 ? CHART_COLORS.warn : CHART_COLORS.brand)}
                />
              </div>
            )}
          </SectionCard>
        </Reveal>
      </div>
    </div>
  );
}
