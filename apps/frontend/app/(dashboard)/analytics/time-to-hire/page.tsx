"use client";
// app/(dashboard)/analytics/time-to-hire/page.tsx
// EXACT Claude Design "Aurora" analytics detail layout, focused on the
// time-to-hire view. Ported from claude-design/screen-analytics.jsx
// (AnalyticsScreen) and wired to the real gateway: tries
// GET /analytics/time-to-hire, falls back to GET /analytics/pipeline.
// Header + KPI strip + trend chart (TrendArea) + supporting funnel/donut,
// all from @/components/aurora-kit. No fabricated series: the trend renders
// EmptyState until the backend has real per-month data.
import {
  Greeting, KpiRow, SectionCard, TrendArea, Funnel, Donut, Pill, Btn, Reveal,
  type Kpi,
} from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

type DeptRow = { department?: string; dept?: string; name?: string; days?: number; averageDays?: number; avgDays?: number; count?: number };
type TrendRow = { month?: string; label?: string; period?: string; days?: number; value?: number; avgDays?: number };
type FunnelRow = { name?: string; stage?: string; value?: number; count?: number };

type TTH = {
  avgDays?: number | null; medianDays?: number | null; p90Days?: number | null;
  byDepartment?: DeptRow[]; trendByMonth?: TrendRow[];
  hiredCount?: number; funnel?: FunnelRow[]; note?: string;
};

// Try the dedicated time-to-hire aggregate; if it is unavailable, fall back to
// the pipeline aggregate so the funnel still has something real to show.
async function loadTTH(): Promise<TTH> {
  const primary = await raw("/analytics/time-to-hire").catch(() => null);
  if (primary) {
    const d: any = (primary?.data ?? primary) ?? {};
    if (!Array.isArray(d.funnel) || d.funnel.length === 0) {
      const pipe = await raw("/analytics/pipeline").catch(() => null);
      const p: any = (pipe?.data ?? pipe) ?? {};
      if (Array.isArray(p.funnel)) d.funnel = p.funnel;
    }
    return d as TTH;
  }
  // primary failed outright: rely entirely on pipeline.
  const pipe = await raw("/analytics/pipeline");
  return ((pipe?.data ?? pipe) ?? {}) as TTH;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return typeof n === "number" && isFinite(n) ? n : null;
};
const flat = (v: number) => [v, v, v, v, v, v];
const STAGE_COLOR = ["var(--c-brand)", "var(--c-brand)", "var(--c-info)", "var(--c-info)", "var(--c-ai)", "var(--c-ai)", "var(--c-ok)", "var(--c-ok)"];

export default function TimeToHirePage() {
  const tth = useData<TTH>(loadTTH);

  return (
    <div className="mx-auto w-full max-w-[1240px]">
      {/* Breadcrumb / back to the analytics overview */}
      <div className="mb-3 flex items-center gap-2 text-[12px]">
        <a href="/analytics" className="inline-flex items-center gap-1 font-semibold text-brand">
          <span aria-hidden="true">&lt;</span> Analytics
        </a>
        <span className="text-ink-3" aria-hidden="true">/</span>
        <span className="text-ink-3">Time to hire</span>
      </div>

      <Greeting
        title="Time to hire"
        sub="How long roles take to fill across departments, with the hiring-velocity trend."
      >
        <Pill icon="clock" tone="var(--c-ink-2)">Last 90 days</Pill>
        <a href="/analytics"><Btn variant="primary" icon="arrowUpRight">Export</Btn></a>
      </Greeting>

      {/* KPI / metric strip */}
      {tth.loading && (
        <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        </div>
      )}
      {tth.error && (
        <div className="mb-[18px]">
          <ErrorState
            title="Could not load time-to-hire"
            body="The analytics service did not respond. Your data is safe; try again in a moment."
            code="GET /api/analytics/time-to-hire"
            onRetry={tth.reload}
          />
        </div>
      )}
      {tth.data && (() => {
        const d = tth.data;
        const depts = Array.isArray(d.byDepartment) ? d.byDepartment : [];
        const avg = num(d.avgDays);
        const median = num(d.medianDays);
        const hired = num(d.hiredCount);
        const deptDays = (r: DeptRow) => num(r.days ?? r.averageDays ?? r.avgDays) ?? 0;
        const fastest = depts.length
          ? depts.reduce((a, b) => (deptDays(a) <= deptDays(b) ? a : b))
          : null;
        const fastestDays = fastest ? deptDays(fastest) : null;
        const fastestName = fastest?.department ?? fastest?.dept ?? fastest?.name ?? "";

        const kpis: Kpi[] = [
          { id: "avg", label: "Avg time to hire", icon: "clock", value: avg ?? 0, spark: flat(avg ?? 0), delta: 0, good: false, suffix: avg == null ? "" : "d" },
          { id: "median", label: "Median time to hire", icon: "chart", value: median ?? 0, spark: flat(median ?? 0), delta: 0, good: false, suffix: median == null ? "" : "d" },
          { id: "depts", label: "Departments tracked", icon: "briefcase", value: depts.length, spark: flat(depts.length), delta: 0 },
          { id: "fastest", label: fastestName ? `Fastest (${fastestName})` : "Fastest dept", icon: "bolt", value: fastestDays ?? 0, spark: flat(fastestDays ?? 0), delta: 0, good: true, suffix: fastestDays == null ? "" : "d" },
        ];

        return <KpiRow kpis={kpis} cols={4} />;
      })()}

      {/* Trend chart + supporting funnel */}
      {tth.data && (() => {
        const d = tth.data;
        const trend = Array.isArray(d.trendByMonth) ? d.trendByMonth : [];
        const series = trend
          .map((t) => num(t.days ?? t.value ?? t.avgDays))
          .filter((n): n is number => n != null);
        const labels = trend.map((t, i) => String(t.month ?? t.label ?? t.period ?? i + 1));
        const hasTrend = series.length >= 2 && series.length === labels.length;

        const funnelRows = (Array.isArray(d.funnel) ? d.funnel : [])
          .map((s, i) => ({
            stage: String(s.stage ?? s.name ?? "").replace(/_/g, " ").toLowerCase(),
            n: num(s.value ?? s.count) ?? 0,
            color: STAGE_COLOR[i] ?? "var(--c-brand)",
          }))
          .filter((s) => s.stage);
        const hasFunnel = funnelRows.some((s) => s.n > 0);

        const noteRight = d.note
          ? <Pill mono tone="var(--c-ink-3)" bg="var(--c-surface-2)">awaiting timestamps</Pill>
          : undefined;

        return (
          <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Reveal i={4}>
              <SectionCard title="Time-to-hire trend" icon="chart" headRight={noteRight}>
                {hasTrend ? (
                  <TrendArea data={series} labels={labels} />
                ) : (
                  <EmptyState
                    title="No trend yet"
                    body={d.note || "Per-hire timestamp history is not captured yet, so the velocity trend cannot be computed."}
                  />
                )}
              </SectionCard>
            </Reveal>

            <Reveal i={5}>
              <SectionCard title="Pipeline funnel" icon="radar" action="View pipeline" onAction={() => { window.location.href = "/analytics"; }}>
                {hasFunnel ? (
                  <Funnel stages={funnelRows} />
                ) : (
                  <EmptyState
                    title="No pipeline data"
                    body="Once candidates move through stages, the applied to hired funnel appears here."
                  />
                )}
              </SectionCard>
            </Reveal>
          </div>
        );
      })()}

      {/* By department + diversity-of-hires, mirroring the prototype's lower grid */}
      {tth.data && (() => {
        const d = tth.data;
        const depts = (Array.isArray(d.byDepartment) ? d.byDepartment : [])
          .map((r) => ({
            dept: String(r.department ?? r.dept ?? r.name ?? ""),
            days: num(r.days ?? r.averageDays ?? r.avgDays) ?? 0,
            count: num(r.count) ?? 0,
          }))
          .filter((r) => r.dept);
        const maxDept = Math.max(1, ...depts.map((r) => r.days));

        const donut: { g: string; v: number; color: string }[] = depts.length
          ? (() => {
              const total = depts.reduce((s, r) => s + r.count, 0) || 1;
              const palette = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-ok)", "var(--c-warn)"];
              return depts
                .slice(0, 5)
                .map((r, i) => ({ g: r.dept, v: Math.round((r.count / total) * 100), color: palette[i] ?? "var(--c-ink-3)" }));
            })()
          : [];

        return (
          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Reveal i={6}>
              <SectionCard title="By department" icon="briefcase">
                {depts.length ? (
                  <div className="flex flex-col gap-[11px]">
                    {depts.map((r, i) => (
                      <div key={r.dept} className="grid grid-cols-[92px_1fr_56px] items-center gap-[10px]">
                        <span className="text-[12px] font-medium text-ink-2">{r.dept}</span>
                        <div className="h-4 overflow-hidden rounded-[6px] bg-surface-2">
                          <div
                            className="h-full rounded-[6px]"
                            style={{
                              width: `${(r.days / maxDept) * 100}%`,
                              background: r.days > 28 ? "var(--c-warn)" : "var(--c-brand)",
                              animation: "growx 1s var(--ease-out) both",
                              animationDelay: `${i * 80}ms`,
                            }}
                          />
                        </div>
                        <span className="mono tnum text-right text-[12px] font-semibold">{r.days}d</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No department breakdown"
                    body="Department-level time to hire appears once roles are filled across teams."
                  />
                )}
              </SectionCard>
            </Reveal>

            <Reveal i={7}>
              <SectionCard title="Hires by department" icon="grid">
                {donut.length ? (
                  <Donut data={donut} center={{ value: String(d.hiredCount ?? 0), label: "hires" }} />
                ) : (
                  <EmptyState
                    title="No hires yet"
                    body="When positions are filled, their department mix is summarized here."
                  />
                )}
              </SectionCard>
            </Reveal>
          </div>
        );
      })()}
    </div>
  );
}
