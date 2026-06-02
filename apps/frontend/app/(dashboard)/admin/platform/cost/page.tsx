"use client";
// app/(dashboard)/admin/platform/cost/page.tsx - EXACT Claude Design "Aurora"
// platform cost console (PlatformCostScreen). Platform-wide AI cost / usage in
// one operator view: a KPI strip (runs, cost, avg per run, tokens), a cost-trend
// area chart, a cost-by-agent breakdown, and a cost-by-tenant ranking.
//
// Wired to the real gateway with an inline raw() that tries the cross-tenant
// rollup first and falls back to the tenant-scoped usage feed:
//   1. GET /super-admin/platform/cost   (real cross-tenant: byTenant + byDay + byAgent + totals)
//   2. GET /platform/cost               (named in the port brief)
//   3. GET /billing/usage               (tenant-scoped fallback: totals + byAgent)
// Each response is coerced with `res?.data ?? res` and mapped defensively, so a
// {data:{...}} or a bare {...} payload both render. Every series is real, nothing
// is fabricated. On error or an empty / 404 response the exact layout still
// renders, with Skeletons while loading and an EmptyState in the body.
import { useState } from "react";
import { Btn, Pill, KpiRow, SectionCard, TrendArea, Funnel, Spark, type Kpi } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
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

// Try the endpoints in order; coerce {data:...} -> ... ; first one that answers wins.
async function loadCost(days: number): Promise<Cost> {
  const paths = [
    `/super-admin/platform/cost?days=${days}`,
    `/platform/cost?days=${days}`,
    `/billing/usage?days=${days}`,
  ];
  let lastErr: unknown;
  for (const p of paths) {
    try {
      const res = await raw(p);
      return mapCost(res?.data ?? res);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("cost feed unavailable");
}

// Plan -> accent color (full-color --c-* tokens; the bare channels are Tailwind-only).
const PLAN_T: Record<string, string> = {
  FREE: "var(--c-ink-3)",
  STARTER: "var(--c-info)",
  PROFESSIONAL: "var(--c-brand)",
  ENTERPRISE: "var(--c-ai)",
  UNKNOWN: "var(--c-ink-3)",
};
// Rotating palette for the by-agent funnel bars.
const AGENT_COLORS = ["var(--c-ai)", "var(--c-brand)", "var(--c-info)", "var(--c-ok)", "var(--c-warn)", "var(--c-danger)"];

type TenantRow = { tenantId: string; plan: string; runs: number; costUsd: number; tokens: number };
type AgentRow = { agentType: string; runs: number; costUsd: number };
type DayRow = { day: string; costUsd: number; runs: number };
type Cost = {
  periodDays: number;
  totals: { runs: number; costUsd: number; tokensIn: number; tokensOut: number };
  byTenant: TenantRow[];
  byAgent: AgentRow[];
  byDay: DayRow[];
};

const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Defensive mapping across both response shapes:
//   cross-tenant: { totals:{runs,costUsd,tokensIn,tokensOut}, byTenant[], byAgent[], byDay[] }
//   usage:        { totalRuns, totalCostUsd, totalTokensIn, totalTokensOut, byAgent[] }
function mapCost(r: any): Cost {
  const totalsSrc = r?.totals ?? {};
  const totals = {
    runs: num(totalsSrc.runs ?? r?.totalRuns),
    costUsd: num(totalsSrc.costUsd ?? r?.totalCostUsd),
    tokensIn: num(totalsSrc.tokensIn ?? r?.totalTokensIn),
    tokensOut: num(totalsSrc.tokensOut ?? r?.totalTokensOut),
  };

  const byTenant: TenantRow[] = (Array.isArray(r?.byTenant) ? r.byTenant : []).map((t: any) => ({
    tenantId: String(t?.tenantId ?? t?.id ?? t?.tenant ?? ""),
    plan: String(t?.plan ?? t?.tier ?? "UNKNOWN").toUpperCase(),
    runs: num(t?.runs ?? t?.runCount),
    costUsd: num(t?.costUsd ?? t?.cost ?? t?.spend),
    tokens: num(t?.tokensIn) + num(t?.tokensOut),
  })).sort((a: TenantRow, b: TenantRow) => b.costUsd - a.costUsd);

  const byAgent: AgentRow[] = (Array.isArray(r?.byAgent) ? r.byAgent : []).map((a: any) => ({
    agentType: String(a?.agentType ?? a?.agent ?? a?.type ?? a?.name ?? "agent"),
    runs: num(a?.runs ?? a?.runCount),
    costUsd: num(a?.costUsd ?? a?.cost ?? a?.spend),
  })).sort((a: AgentRow, b: AgentRow) => b.costUsd - a.costUsd);

  const byDay: DayRow[] = (Array.isArray(r?.byDay) ? r.byDay : []).map((d: any) => ({
    day: String(d?.day ?? d?.date ?? ""),
    costUsd: num(d?.costUsd ?? d?.cost),
    runs: num(d?.runs ?? d?.runCount),
  }));

  return { periodDays: num(r?.periodDays ?? r?.days) || 30, totals, byTenant, byAgent, byDay };
}

const fmtMoney = (n: number) => "$" + (n >= 1000 ? Math.round(n).toLocaleString() : n.toFixed(2));
const fmtFine = (n: number) => "$" + n.toFixed(4);
const fmtK = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(Math.round(n)));
// dd label for the trend axis from an ISO/yyyy-mm-dd day string.
const dayLabel = (d: string) => (d.length >= 10 ? d.slice(5) : d.slice(-5));

function OpHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
      <div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h1>
          <Pill icon="bolt" tone="var(--c-danger)" bg="var(--c-danger-tint)">platform operator</Pill>
        </div>
        <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

const PRESETS = [7, 30, 90];

export default function PlatformCostPage() {
  const [days, setDays] = useState(30);
  const cost = useData<Cost>(() => loadCost(days), [days]);
  const d = cost.data;

  // KPI strip derived from live totals, never fabricated.
  const runs = d?.totals.runs ?? 0;
  const totalCost = d?.totals.costUsd ?? 0;
  const tokens = (d?.totals.tokensIn ?? 0) + (d?.totals.tokensOut ?? 0);
  const avgPerRun = runs > 0 ? totalCost / runs : 0;
  const costSeries = (d?.byDay ?? []).map((x) => x.costUsd);
  const runSeries = (d?.byDay ?? []).map((x) => x.runs);

  const kpis: Kpi[] = [
    { id: "runs", label: "Agent runs", value: runs, delta: 0, good: true, spark: runSeries.length ? runSeries : [runs], icon: "cpu", ai: true },
    { id: "cost", label: "Total cost", value: Math.round(totalCost), prefix: "$", delta: 0, good: true, spark: costSeries.length ? costSeries.map((c) => Math.round(c)) : [Math.round(totalCost)], icon: "card" },
    { id: "avg", label: "Avg per run", value: avgPerRun, prefix: "$", delta: 0, good: true, spark: costSeries.length ? costSeries : [avgPerRun], icon: "chart" },
    { id: "tokens", label: "Tokens (in + out)", value: Math.round(tokens / 1000), suffix: "k", delta: 0, good: true, spark: [Math.round(tokens / 1000)], icon: "bolt" },
  ];

  // By-agent -> Funnel stages (cost-ranked); colored from the rotating palette.
  const agentStages = (d?.byAgent ?? []).slice(0, 8).map((a, i) => ({
    stage: a.agentType,
    n: Math.round(a.costUsd * 100), // cents, so sub-dollar costs still render proportionally
    color: AGENT_COLORS[i % AGENT_COLORS.length],
  }));

  const subCopy = d
    ? `${runs.toLocaleString()} agent ${runs === 1 ? "run" : "runs"} · ${fmtMoney(totalCost)} across ${d.byTenant.length || "all"} tenants in the last ${days} days.`
    : "Every agent run, every tenant. Find spike causes across the platform.";

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <OpHead
        title="AI cost"
        sub={subCopy}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "inline-flex", gap: 4 }}>
              {PRESETS.map((p) => (
                <Btn key={p} variant={days === p ? "primary" : "soft"} size="sm" onClick={() => setDays(p)}>{p}d</Btn>
              ))}
            </div>
            <Btn variant="soft" icon="arrowUpRight">Export</Btn>
          </div>
        }
      />

      {/* KPI strip, derived from live totals once loaded */}
      {cost.loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        </div>
      )}
      {d && <KpiRow kpis={kpis} cols={4} />}

      {/* Cost trend */}
      <div style={{ marginBottom: 16 }}>
        <SectionCard
          title="Cost trend"
          icon="chart"
          headRight={<Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)" mono>last {days}d</Pill>}
        >
          {cost.loading && <Skeleton className="h-[150px] rounded-[10px]" />}
          {!cost.loading && (!d || d.byDay.length === 0) && (
            <div style={{ padding: "30px 8px" }}>
              <EmptyState
                title={cost.error ? "Could not load cost trend" : "No runs in this window"}
                body={
                  cost.error
                    ? "The platform cost service did not respond. The daily cost trend appears here once it is reachable."
                    : "When agents run across tenants, daily spend is plotted here."
                }
                actions={cost.error ? <Btn variant="soft" icon="arrowUpRight" onClick={cost.reload}>Try again</Btn> : undefined}
              />
            </div>
          )}
          {d && d.byDay.length > 0 && (
            <TrendArea data={costSeries} labels={d.byDay.map((x) => dayLabel(x.day))} color="var(--c-ai)" />
          )}
        </SectionCard>
      </div>

      {/* Two-column working surface: cost by agent / top tenants by spend */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Cost by agent */}
        <SectionCard title="Cost by agent" icon="cpu" headRight={<Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" icon="sparkles">drivers</Pill>}>
          {cost.loading && <div style={{ display: "grid", gap: 10 }}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[30px] rounded-[8px]" />)}</div>}
          {!cost.loading && (!d || d.byAgent.length === 0) && (
            <div style={{ padding: "24px 8px" }}>
              <EmptyState
                title={cost.error ? "Could not load agents" : "No agent spend yet"}
                body={cost.error ? "The cost service did not respond. Per-agent spend appears here once it is reachable." : "Per-agent cost appears here after the first runs land."}
              />
            </div>
          )}
          {d && d.byAgent.length > 0 && (
            <>
              <Funnel stages={agentStages} />
              <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                {d.byAgent.slice(0, 8).map((a, i) => (
                  <div key={a.agentType} style={{ display: "grid", gridTemplateColumns: "12px 1fr auto auto", alignItems: "center", gap: 10, fontSize: 12 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: AGENT_COLORS[i % AGENT_COLORS.length] }} />
                    <span className="mono" style={{ color: "var(--c-ai-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.agentType}</span>
                    <span className="mono tnum" style={{ color: "var(--c-ink-3)" }}>{a.runs.toLocaleString()} runs</span>
                    <span className="mono tnum" style={{ fontWeight: 600, textAlign: "right", minWidth: 64 }}>{fmtFine(a.costUsd)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        {/* Top tenants by spend */}
        <SectionCard title="Top tenants by spend" icon="building" pad={0}>
          {cost.loading && <div style={{ padding: 16, display: "grid", gap: 10 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-[8px]" />)}</div>}
          {!cost.loading && (!d || d.byTenant.length === 0) && (
            <div style={{ padding: "30px 16px" }}>
              <EmptyState
                title={cost.error ? "Could not load tenants" : "No tenant spend yet"}
                body={
                  cost.error
                    ? "The platform cost service did not respond. Per-tenant spend appears here once it is reachable. The tenant-scoped usage feed is shown when cross-tenant data is unavailable."
                    : "When tenants run agents, their cost ranking appears here. Sorted by spend."
                }
                actions={cost.error ? <Btn variant="soft" icon="arrowUpRight" onClick={cost.reload}>Try again</Btn> : undefined}
              />
            </div>
          )}
          {d && d.byTenant.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 80px 90px", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
                <span>Tenant</span>
                <span>Plan</span>
                <span style={{ textAlign: "right" }}>Runs</span>
                <span style={{ textAlign: "right" }}>Cost</span>
              </div>
              {d.byTenant.slice(0, 20).map((t, i) => {
                const planTone = PLAN_T[t.plan] ?? "var(--c-ink-3)";
                return (
                  <a
                    key={t.tenantId || i}
                    href={t.tenantId ? `/admin?tenant=${t.tenantId}` : undefined}
                    style={{ display: "grid", gridTemplateColumns: "1.6fr 90px 80px 90px", gap: 12, padding: "11px 16px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", textDecoration: "none", color: "inherit" }}
                  >
                    <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.tenantId ? t.tenantId.slice(0, 12) + (t.tenantId.length > 12 ? "..." : "") : "unknown"}
                    </span>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: planTone, background: `color-mix(in oklab, ${planTone} 13%, transparent)`, padding: "2px 7px", borderRadius: 5, justifySelf: "start" }}>{t.plan}</span>
                    <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", color: "var(--c-ink-3)" }}>{t.runs.toLocaleString()}</span>
                    <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>{fmtFine(t.costUsd)}</span>
                  </a>
                );
              })}
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
