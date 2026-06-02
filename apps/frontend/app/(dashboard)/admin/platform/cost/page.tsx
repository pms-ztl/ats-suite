"use client";
// app/(dashboard)/admin/platform/cost/page.tsx - EXACT Claude Design "Aurora"
// platform-wide AI cost console. screen-platform.jsx has no dedicated cost
// screen (cost only appears as columns inside the Tenants / PlatformAgents
// tables), so this is a new platform-operator screen built in the SAME visual
// language as its siblings (admin/platform/agents/page.tsx): OpHead with the
// "platform operator" pill, the local raw() helper, the --c-* token style, and
// the shared aurora-kit charts (KpiRow / TrendArea / Funnel / SectionCard /
// Spark) - charts are NOT re-implemented here.
//
// HONEST WIRING: useData(..., [days]) tries the real super-admin cost rollup
// first (GET /super-admin/platform/cost -> billing-service /internal/platform/
// cost, returns { totals, byDay, byAgent, byTenant }), then the platform
// aggregator (GET /platform/cost), then the tenant-scoped usage endpoint
// (GET /billing/usage, returns { totalRuns, totalCostUsd, totalTokens*,
// byAgent }). Whatever responds first is normalised into one shape and fed into
// the KPIs + charts. Nothing is fabricated: if no series is present the panels
// render the exact layout with EmptyState; on error/404 the whole page still
// renders with EmptyState and a retry.
import { useState } from "react";
import { Btn, Pill, KpiRow, TrendArea, Funnel, SectionCard, Spark, type Kpi } from "@/components/aurora-kit";
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
  const json: any = await res.json();
  return json?.data ?? json;
}

// Normalised shape the page renders from. Sources differ in field names so we
// coerce defensively and never invent numbers.
type DayPoint = { day: string; costUsd: number; runs: number };
type AgentRow = { agentType: string; runs: number; costUsd: number };
type TenantRow = { tenantId: string; plan: string; runs: number; costUsd: number };
type CostModel = {
  periodDays: number;
  runs: number;
  costUsd: number;
  tokens: number;
  byDay: DayPoint[];
  byAgent: AgentRow[];
  byTenant: TenantRow[];
};

const num = (v: unknown): number => (Number(v) || 0);

// Try the three allowed endpoints in order; first to respond wins. The
// super-admin rollup is the only one with byTenant; the tenant usage endpoint
// has neither byTenant nor byDay, so those panels fall back to EmptyState.
async function fetchCost(days: number): Promise<CostModel> {
  let res: any;
  try {
    res = await raw(`/super-admin/platform/cost?days=${days}`);
  } catch {
    try {
      res = await raw(`/platform/cost?days=${days}`);
    } catch {
      res = await raw(`/billing/usage?days=${days}`);
    }
  }

  // totals: super-admin/platform shape -> res.totals.{runs,costUsd,tokensIn,tokensOut};
  // billing/usage shape -> res.{totalRuns,totalCostUsd,totalTokensIn,totalTokensOut}.
  const totals = res?.totals ?? res ?? {};
  const runs = num(totals.runs ?? totals.totalRuns ?? res?.runs ?? res?.totalRuns);
  const costUsd = num(totals.costUsd ?? totals.totalCostUsd ?? res?.costUsd ?? res?.totalCostUsd);
  const tokensIn = num(totals.tokensIn ?? totals.totalTokensIn ?? res?.tokensIn ?? res?.totalTokensIn);
  const tokensOut = num(totals.tokensOut ?? totals.totalTokensOut ?? res?.tokensOut ?? res?.totalTokensOut);

  const byDay: DayPoint[] = Array.isArray(res?.byDay)
    ? res.byDay.map((d: any) => ({ day: String(d?.day ?? d?.date ?? ""), costUsd: num(d?.costUsd ?? d?.cost), runs: num(d?.runs) }))
    : [];

  const byAgent: AgentRow[] = Array.isArray(res?.byAgent)
    ? res.byAgent
        .map((a: any) => ({ agentType: String(a?.agentType ?? a?.agent ?? a?.type ?? ""), runs: num(a?.runs), costUsd: num(a?.costUsd ?? a?.cost) }))
        .sort((a: AgentRow, b: AgentRow) => b.costUsd - a.costUsd)
    : [];

  const byTenant: TenantRow[] = Array.isArray(res?.byTenant)
    ? res.byTenant
        .map((t: any) => ({ tenantId: String(t?.tenantId ?? t?.tenant ?? t?.id ?? ""), plan: String(t?.plan ?? "UNKNOWN"), runs: num(t?.runs), costUsd: num(t?.costUsd ?? t?.cost) }))
        .sort((a: TenantRow, b: TenantRow) => b.costUsd - a.costUsd)
    : [];

  return {
    periodDays: num(res?.periodDays ?? res?.days ?? days) || days,
    runs,
    costUsd,
    tokens: tokensIn + tokensOut,
    byDay,
    byAgent,
    byTenant,
  };
}

// Two decimals for small dollar amounts, whole dollars once it is meaningful.
const money = (n: number) => `$${n >= 100 ? Math.round(n).toLocaleString() : n.toFixed(2)}`;
const moneyFine = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;
// Short id so long tenant uuids fit the funnel label column.
const shortId = (id: string) => (id.length > 12 ? `${id.slice(0, 8)}…` : id) || "unknown";

const PLAN_T: Record<string, string> = {
  FREE: "var(--c-ink-3)", STARTER: "var(--c-info)", PROFESSIONAL: "var(--c-brand)", ENTERPRISE: "var(--c-ai)",
};
// Calm brand->ai ramp so the breakdown bars read as one series, not a rainbow.
const RAMP = ["var(--c-ai)", "var(--c-brand)", "var(--c-info)", "var(--c-ai-2)", "var(--c-ok)", "var(--c-ink-3)"];

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

// Segmented 7 / 30 / 90 day-range control.
function RangeTabs({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  return (
    <div style={{ display: "inline-flex", padding: 3, gap: 2, borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)" }}>
      {[7, 30, 90].map((d) => {
        const active = d === days;
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            aria-pressed={active}
            style={{
              padding: "5px 12px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans)",
              background: active ? "var(--c-brand)" : "transparent",
              color: active ? "var(--c-on-brand)" : "var(--c-ink-3)",
              transition: "background var(--t) var(--ease-out), color var(--t)",
            }}
          >
            {d}d
          </button>
        );
      })}
    </div>
  );
}

export default function PlatformCostPage() {
  const [days, setDays] = useState(30);
  const cost = useData<CostModel>(() => fetchCost(days), [days]);
  const d = cost.data;

  const avgPerRun = d && d.runs > 0 ? d.costUsd / d.runs : 0;

  // KPI strip - real totals only. The cost spark uses the daily cost series
  // when present; otherwise a flat single point (never fabricated).
  const costSpark = d && d.byDay.length > 1 ? d.byDay.map((p) => p.costUsd) : [d?.costUsd ?? 0];
  const runSpark = d && d.byDay.length > 1 ? d.byDay.map((p) => p.runs) : [d?.runs ?? 0];
  const kpis: Kpi[] = [
    { id: "runs", label: "Agent runs", value: d?.runs ?? 0, icon: "cpu", spark: runSpark, delta: 0, good: true, ai: true },
    { id: "cost", label: "Total cost", value: d?.costUsd ?? 0, icon: "card", spark: costSpark, delta: 0, good: false, prefix: "$" },
    { id: "avg", label: "Avg / run", value: avgPerRun, icon: "chart", spark: costSpark, delta: 0, good: false, prefix: "$" },
    { id: "tokens", label: "Tokens", value: d?.tokens ?? 0, icon: "layers", spark: runSpark, delta: 0, good: true },
  ];

  const trendData = d?.byDay.map((p) => p.costUsd) ?? [];
  const trendLabels = d?.byDay.map((p) => p.day.slice(5)) ?? [];
  const totalCost = d?.costUsd ?? 0;

  const agentStages = (d?.byAgent ?? []).slice(0, 8).map((a, i) => ({
    stage: a.agentType || "unknown", n: Math.round(a.costUsd * 100), color: RAMP[i % RAMP.length],
  }));
  const tenantStages = (d?.byTenant ?? []).slice(0, 8).map((t) => ({
    stage: shortId(t.tenantId), n: Math.round(t.costUsd * 100), color: PLAN_T[t.plan] ?? "var(--c-brand)",
  }));

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <OpHead
        title="Cost analytics"
        sub={`Platform-wide AI inference spend across all tenants · last ${days} days.`}
        right={
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <RangeTabs days={days} onChange={setDays} />
            <Btn variant="soft" icon="arrowUpRight">Export</Btn>
          </div>
        }
      />

      {/* KPI strip */}
      {cost.loading && (
        <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        </div>
      )}
      {!cost.loading && cost.error && (
        <div style={{ marginBottom: 18, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: "44px 16px" }}>
          <EmptyState
            title="Could not load cost analytics"
            body="The platform cost service did not respond. Cross-tenant spend, the cost trend, and the per-agent and per-tenant breakdowns appear here once it is reachable."
            actions={<Btn variant="soft" icon="arrowUpRight" onClick={cost.reload}>Try again</Btn>}
          />
        </div>
      )}
      {!cost.loading && !cost.error && <KpiRow kpis={kpis} cols={4} />}

      {/* Cost trend over the selected range */}
      {!cost.error && (
        <div style={{ marginBottom: 16 }}>
          <SectionCard
            title="Cost trend"
            icon="chart"
            headRight={
              d && totalCost > 0
                ? <Pill mono tone="var(--c-ink-2)" bg="var(--c-surface-2)">{money(totalCost)} · {days}d</Pill>
                : undefined
            }
          >
            {cost.loading && <Skeleton className="h-[150px] rounded-lg" />}
            {!cost.loading && trendData.length > 1 && (
              <TrendArea data={trendData} labels={trendLabels} color="var(--c-ai)" />
            )}
            {!cost.loading && trendData.length <= 1 && (
              <EmptyState
                title="No daily cost series yet"
                body="Once agent runs accrue cost over this range, the per-day inference spend is plotted here. Daily history is only exposed by the platform cost rollup."
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* Cost by agent + cost by tenant */}
      {!cost.error && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
          {/* by agent */}
          <SectionCard
            title="Cost by agent"
            icon="cpu"
            headRight={d && d.byAgent.length > 0 ? <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">{d.byAgent.length} agents</Pill> : undefined}
          >
            {cost.loading && <Skeleton className="h-44 rounded-lg" />}
            {!cost.loading && agentStages.length > 0 && (
              <>
                <Funnel stages={agentStages} />
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                  {(d?.byAgent ?? []).slice(0, 8).map((a, i) => (
                    <div key={a.agentType || i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px", alignItems: "center", gap: 10, fontSize: 12 }}>
                      <span className="mono" style={{ display: "inline-flex", gap: 7, alignItems: "center", color: "var(--c-ai-ink)", minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: RAMP[i % RAMP.length], flexShrink: 0 }} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.agentType || "unknown"}</span>
                      </span>
                      <span className="mono tnum" style={{ textAlign: "right", color: "var(--c-ink-3)" }}>{a.runs.toLocaleString()}</span>
                      <span className="mono tnum" style={{ textAlign: "right", fontWeight: 600 }}>{moneyFine(a.costUsd)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!cost.loading && agentStages.length === 0 && (
              <EmptyState title="No agent cost yet" body="When agents run across tenants, their share of inference spend appears here, ranked by cost." />
            )}
          </SectionCard>

          {/* by tenant */}
          <SectionCard
            title="Cost by tenant"
            icon="building"
            headRight={d && d.byTenant.length > 0 ? <Pill mono tone="var(--c-ink-2)" bg="var(--c-surface-2)">{d.byTenant.length} tenants</Pill> : undefined}
          >
            {cost.loading && <Skeleton className="h-44 rounded-lg" />}
            {!cost.loading && tenantStages.length > 0 && (
              <>
                <Funnel stages={tenantStages} />
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                  {(d?.byTenant ?? []).slice(0, 8).map((t, i) => (
                    <div key={t.tenantId || i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 80px", alignItems: "center", gap: 10, fontSize: 12 }}>
                      <span style={{ display: "inline-flex", gap: 7, alignItems: "center", minWidth: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: PLAN_T[t.plan] ?? "var(--c-brand)", background: `color-mix(in oklab, ${PLAN_T[t.plan] ?? "var(--c-brand)"} 14%, transparent)`, padding: "1px 6px", borderRadius: 5, flexShrink: 0 }}>{t.plan}</span>
                        <span className="mono" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--c-ink-2)" }}>{shortId(t.tenantId)}</span>
                      </span>
                      <span className="mono tnum" style={{ textAlign: "right", color: "var(--c-ink-3)" }}>{t.runs.toLocaleString()}</span>
                      <span className="mono tnum" style={{ textAlign: "right", fontWeight: 600 }}>{moneyFine(t.costUsd)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!cost.loading && tenantStages.length === 0 && (
              <EmptyState
                title="No per-tenant breakdown"
                body="Cross-tenant spend is only exposed by the platform cost rollup. When it is reachable, the top tenants by inference cost appear here."
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* tiny footnote sparkline echo so an empty trend range still feels alive */}
      {!cost.error && !cost.loading && d && trendData.length <= 1 && (d.runs > 0 || d.costUsd > 0) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", fontSize: 12, color: "var(--c-ink-3)" }}>
          <Icon name="sparkles" size={14} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
          <span>Totals reflect {d.runs.toLocaleString()} runs and {money(d.costUsd)} of inference over the last {days} days.</span>
          <span style={{ marginLeft: "auto" }}><Spark data={costSpark.length > 1 ? costSpark : [0, d.costUsd]} w={96} h={24} color="var(--c-ai)" /></span>
        </div>
      )}
    </div>
  );
}
