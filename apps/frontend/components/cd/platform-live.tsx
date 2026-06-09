"use client";
// components/cd/platform-live.tsx
// Mounts the byte-exact CD super-admin platform-operator screens (PlatformScreens +
// AiSurfaceScreens.PlatformCostScreen) on the /admin/* routes. The platform gateway
// is not wired for this operator surface, so the data is the design's example
// content. These routes are super-admin-gated by app/(dashboard)/admin/layout.tsx
// (Admins get AccessDenied), and were verified by tsc + build only (no super-admin
// login available to verify visually).
import dynamic from "next/dynamic";
import { TenantsScreen, PlatformAgentsScreen, PromptsScreen, PlanRequestsScreen, PlatformAuditScreen } from "./PlatformScreens";
import { PlatformCostScreen } from "./AiSurfaceScreens";
import type { TenantsData, PlatformAgentsData, PromptsData, PlanRequestsData, PlatformAuditData, PlatformCostData, Tenant, PlanRequest, KPI } from "./types";
import { useData } from "@/lib/use-data";
import { listPlatformTenants, getPlatformStats, listPlanRequests, decidePlanRequest, slugify, getPlatformCost } from "@/lib/api";
import { ChartCard, ScatterPlot, BarsChart, CHART_COLORS } from "@/components/shared/charts";

// Live 3D tenant-spend landscape (three.js). Loaded client-only so the
// react-three-fiber stack never executes during SSR.
const TenantLandscape = dynamic(() => import("@/components/shared/hero3d").then((m) => m.TenantLandscape), {
  ssr: false,
  loading: () => <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card/60" />,
});

const PLAN_MRR: Record<string, number> = { FREE: 0, STARTER: 299, PROFESSIONAL: 999, ENTERPRISE: 4200 };
const flat = (v: number): number[] => Array.from({ length: 8 }, () => v);
function fmtRuns(n: number): string { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }
function timeAgo(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000); if (m < 60) return `${m}m`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
function mrrDelta(from: string, to: string): string {
  const d = (PLAN_MRR[to] ?? 0) - (PLAN_MRR[from] ?? 0);
  return `${d >= 0 ? "+" : "-"}$${Math.abs(d)}`;
}

const TENANTS_DATA: TenantsData = {
  summary: "9 active workspaces across 4 plans. $52.4k MRR, up 12 percent this month.",
  kpis: [
    { label: "Active tenants", value: 9, icon: "building", spark: [6, 6, 7, 7, 8, 8, 9, 9], delta: 2, good: true },
    { label: "MRR", value: 52400, prefix: "$", icon: "card", spark: [44000, 46000, 47500, 49000, 50200, 51000, 51800, 52400], delta: 8, good: true },
    { label: "AI cost (mo)", value: 9120, prefix: "$", icon: "cpu", ai: true, spark: [7600, 7900, 8200, 8500, 8700, 8900, 9000, 9120], delta: 6, good: false },
    { label: "Avg tenant health", value: 92, suffix: "%", icon: "check", spark: [88, 89, 90, 90, 91, 91, 92, 92], delta: 1, good: true },
  ],
  tenants: [
    { id: "t1", name: "Pinnacle Tech", slug: "pinnacle", created: "Jan 2026", plan: "FREE", users: 1, mrr: 0, cost: 12, runs: "1.2k", health: "healthy" },
    { id: "t2", name: "Northwind Talent", slug: "northwind", created: "Nov 2025", plan: "PROFESSIONAL", users: 14, mrr: 999, cost: 1840, runs: "182k", health: "healthy" },
    { id: "t3", name: "Apex Robotics", slug: "apex", created: "Sep 2025", plan: "ENTERPRISE", users: 62, mrr: 4200, cost: 3120, runs: "640k", health: "watch" },
    { id: "t4", name: "Lumen Health", slug: "lumen", created: "Aug 2025", plan: "ENTERPRISE", users: 48, mrr: 4200, cost: 2010, runs: "410k", health: "healthy" },
    { id: "t5", name: "Cedar Finance", slug: "cedar", created: "Dec 2025", plan: "STARTER", users: 6, mrr: 299, cost: 220, runs: "38k", health: "healthy" },
    { id: "t6", name: "Vela Logistics", slug: "vela", created: "Oct 2025", plan: "PROFESSIONAL", users: 11, mrr: 999, cost: 1280, runs: "96k", health: "over" },
    { id: "t7", name: "Bright Labs", slug: "bright", created: "Feb 2026", plan: "STARTER", users: 4, mrr: 299, cost: 140, runs: "21k", health: "healthy" },
  ],
};

const AGENTS_DATA: PlatformAgentsData = {
  agents: [
    { n: "candidate-screener", tenants: 9, runs: "1.2M", cost: 4200, err: 0.4, status: "deployed" },
    { n: "resume-parser", tenants: 9, runs: "3.8M", cost: 2100, err: 0.2, status: "deployed" },
    { n: "jd-author", tenants: 8, runs: "240k", cost: 1180, err: 0.6, status: "deployed" },
    { n: "bias-auditor", tenants: 8, runs: "61k", cost: 540, err: 1.8, status: "degraded" },
    { n: "copilot", tenants: 7, runs: "520k", cost: 1620, err: 0.5, status: "deployed" },
    { n: "analytics", tenants: 6, runs: "180k", cost: 410, err: 1.1, status: "deployed" },
    { n: "offer", tenants: 5, runs: "44k", cost: 190, err: 0.3, status: "deployed" },
    { n: "scheduling", tenants: 6, runs: "88k", cost: 260, err: 0.4, status: "paused" },
  ],
};

const PROMPTS_DATA: PromptsData = {
  agents: ["candidate-screener", "jd-author", "bias-auditor", "copilot", "offer"],
  current: {
    agent: "candidate-screener",
    tenants: 9,
    text: "You are an expert technical recruiter. Score each candidate against the requirements provided, one weighted row per requirement. Cite evidence from the resume for every claim. Never infer protected attributes. Flag for human review when confidence is below 0.70.",
  },
  versions: [
    { v: "v7", note: "Add per-requirement evidence citations", date: "May 28, 2026", author: "platform-ops", live: true },
    { v: "v6", note: "Lower auto-advance confidence to 0.70", date: "May 12, 2026", author: "platform-ops" },
    { v: "v5", note: "Stricter protected-attribute guardrails", date: "Apr 30, 2026", author: "platform-ops" },
    { v: "v4", note: "Initial weighted-rubric rollout", date: "Apr 09, 2026", author: "platform-ops" },
  ],
};

const PLAN_REQUESTS_DATA: PlanRequestsData = {
  requests: [
    { id: "pr1", tenant: "Vela Logistics", from: "PROFESSIONAL", to: "ENTERPRISE", mrr: "+$3,201", reason: "Needs SSO and unlimited seats", by: "ops@vela.co", when: "2h ago" },
    { id: "pr2", tenant: "Cedar Finance", from: "STARTER", to: "PROFESSIONAL", mrr: "+$700", reason: "Hit the 500 resumes/mo cap", by: "talent@cedar.fin", when: "1d ago" },
    { id: "pr3", tenant: "Bright Labs", from: "STARTER", to: "PROFESSIONAL", mrr: "+$700", reason: "Wants all 12 AI agents", by: "hr@bright.io", when: "3d ago" },
  ],
};

const AUDIT_DATA: PlatformAuditData = {
  entries: [
    { who: "platform-ops", act: "Deployed candidate-screener prompt v7 to 9 tenants", kind: "deploy", t: "12m" },
    { who: "platform-ops", act: "Impersonated Northwind Talent for support ticket #4821", kind: "impersonation", t: "1h" },
    { who: "bias-auditor", act: "Raised drift alert on Apex Robotics screening", kind: "alert", ai: true, t: "3h" },
    { who: "platform-ops", act: "Approved Vela Logistics upgrade to Enterprise", kind: "billing", t: "5h" },
    { who: "platform-ops", act: "Paused scheduling agent for Cedar Finance", kind: "killswitch", t: "1d" },
  ],
};

export function TenantsLive() {
  const tenants = useData<any[]>(listPlatformTenants);
  const stats = useData<any>(getPlatformStats);
  if (tenants.loading || stats.loading) return null;
  const list = tenants.data ?? [];
  const rows: Tenant[] = list.map((t: any) => ({
    id: t.id, name: t.name, slug: t.slug ?? slugify(t.name ?? "tenant"),
    created: t.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "",
    plan: t.plan ?? "FREE", users: t.userCount ?? 0, mrr: PLAN_MRR[t.plan] ?? 0,
    cost: Math.round(t.costUsd30d ?? 0), runs: fmtRuns(t.agentRunCount ?? 0),
    health: (t.costUsd30d ?? 0) > 3000 ? "watch" : "healthy",
  }));
  const s = stats.data ?? {};
  const data: TenantsData = {
    summary: `${rows.length} workspaces · ${s.totalUsers ?? 0} users · ${s.totalCandidates ?? 0} candidates · $${Math.round(s.totalCostUsd30d ?? 0)} AI cost (30d).`,
    kpis: [
      { label: "Active tenants", value: s.activeTenants ?? rows.length, icon: "building", spark: flat(s.activeTenants ?? rows.length), delta: 0, good: true } as KPI,
      { label: "Total users", value: s.totalUsers ?? 0, icon: "users", spark: flat(s.totalUsers ?? 0), delta: 0, good: true } as KPI,
      { label: "AI cost (30d)", value: Math.round(s.totalCostUsd30d ?? 0), prefix: "$", icon: "cpu", ai: true, spark: flat(Math.round(s.totalCostUsd30d ?? 0)), delta: 0, good: false } as KPI,
      { label: "Candidates", value: s.totalCandidates ?? 0, icon: "users", spark: flat(s.totalCandidates ?? 0), delta: 0, good: true } as KPI,
    ],
    tenants: rows,
  };

  // Real-data charts (every value traces to /super-admin/tenants):
  //  • scatter — MRR (x, plan price) vs 30d AI cost (y), bubble = users,
  //    red dots = over-budget (cost > MRR), surfacing low-margin tenants.
  //  • bars    — tenant count by plan tier (planBreakdown from /super-admin/stats,
  //    falling back to counting the live rows when the stat map is absent).
  const scatterData = rows
    .filter((t) => (t.mrr ?? 0) > 0 || (t.cost ?? 0) > 0)
    .map((t) => ({ name: t.name, mrr: t.mrr, cost: t.cost, users: Math.max(1, t.users), over: t.cost > t.mrr }));
  const planBreakdown: Record<string, number> = (s.planBreakdown && typeof s.planBreakdown === "object") ? s.planBreakdown : {};
  const PLAN_ORDER = ["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"];
  const planCounts = Object.keys(planBreakdown).length > 0
    ? planBreakdown
    : rows.reduce<Record<string, number>>((acc, t) => { const p = (t.plan || "FREE").toUpperCase(); acc[p] = (acc[p] ?? 0) + 1; return acc; }, {});
  const planBars = PLAN_ORDER.filter((p) => (planCounts[p] ?? 0) > 0).map((p) => ({ plan: p[0] + p.slice(1).toLowerCase(), count: planCounts[p] ?? 0 }));

  // 3D tenant-spend landscape — a bar field over every live tenant. Every value
  // traces to /super-admin/tenants: bar height = plan MRR, bubble fields below.
  //  • mrr    — the tenant's monthly recurring revenue (plan price).
  //  • cost30 — real 30-day cross-tenant AI spend (billing AgentRunCost rollup).
  //  • users  — live user count.
  //  • health — honest proxy: a tenant whose 30d AI cost exceeds its MRR is
  //    "over-budget" (red); otherwise the existing watch/healthy proxy carries
  //    through ("watch" once cost crosses $3k). No fabricated fields.
  const landscape = rows.map((t) => ({
    name: t.name,
    mrr: t.mrr,
    cost30: t.cost,
    users: t.users,
    health: t.cost > t.mrr && t.mrr > 0 ? "over-budget" : t.health,
  }));
  const hero = <TenantLandscape tenants={landscape} />;

  const charts = (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 18 }} className="plat-charts">
      <ChartCard title="Margin map" subtitle="MRR vs 30-day AI cost · bubble = users · red = over budget" height={240}>
        <ScatterPlot
          data={scatterData}
          xKey="mrr" yKey="cost" zKey="users"
          xName="MRR" yName="AI cost 30d"
          xFormatter={(v) => `$${v}`} yFormatter={(v) => `$${v}`}
          valueFormatter={(v) => `$${Number(v).toLocaleString()}`}
          colorFn={(row) => (row.over ? CHART_COLORS.danger : CHART_COLORS.ai)}
        />
      </ChartCard>
      <ChartCard title="Tenants by plan" subtitle="Live plan-tier mix" height={240}>
        <BarsChart
          data={planBars}
          categoryKey="plan"
          series={[{ key: "count", name: "Tenants", color: CHART_COLORS.brand }]}
          valueFormatter={(v) => `${v}`}
        />
      </ChartCard>
    </div>
  );

  return <TenantsScreen data={data} charts={charts} hero={hero} />;
}
export function PlatformAgentsLive() { return <PlatformAgentsScreen data={AGENTS_DATA} />; }
export function PromptsLive() { return <PromptsScreen data={PROMPTS_DATA} />; }
export function PlanRequestsLive() {
  const reqs = useData<any[]>(listPlanRequests);
  if (reqs.loading) return null;
  const pending = (reqs.data ?? []).filter((r: any) => (r.status ?? "PENDING") === "PENDING");
  const requests: PlanRequest[] = pending.map((r: any) => ({
    id: r.id, tenant: r.tenantName ?? r.tenant?.name ?? r.tenantId ?? "Tenant",
    from: r.fromPlan ?? "FREE", to: r.toPlan ?? "STARTER",
    mrr: mrrDelta(r.fromPlan ?? "FREE", r.toPlan ?? "STARTER"),
    reason: r.reason ?? "", by: r.requestedByUserId ?? r.requestedBy ?? "", when: timeAgo(r.requestedAt ?? r.createdAt),
  }));
  const data: PlanRequestsData = { requests };
  const decide = (id: string, action: "APPROVE" | "REJECT") => { decidePlanRequest(id, action).catch(() => {}); };
  return <PlanRequestsScreen data={data} onApprove={(id) => decide(id, "APPROVE")} onDeny={(id) => decide(id, "REJECT")} />;
}
export function PlatformAuditLive() { return <PlatformAuditScreen data={AUDIT_DATA} />; }

// Cost analytics — wired to the REAL cross-tenant AI cost rollup (billing
// AgentRunCost, last 30d) via /super-admin/platform/cost. Per-agent + per-tenant
// spend are real; tenant names are joined from /super-admin/tenants (cost rollup
// keys on tenantId only). KPIs are derived from the rollup totals (no fabricated
// deltas — delta 0, flat spark). When there has been no AI usage the charts in
// PlatformCostScreen render honest empty-states.
export function PlatformCostLive() {
  const cost = useData(() => getPlatformCost(30));
  const tenants = useData<any[]>(listPlatformTenants);
  if (cost.loading || tenants.loading) return null;
  const c = cost.data ?? { periodDays: 30, totals: { runs: 0, costUsd: 0, tokensIn: 0, tokensOut: 0 }, byTenant: [], byAgent: [], byDay: [] };
  const nameById = new Map<string, string>((tenants.data ?? []).map((t: any) => [t.id, t.name ?? t.slug ?? t.id]));

  const totalCost = Math.round((c.totals.costUsd ?? 0) * 100) / 100;
  const totalTokens = (c.totals.tokensIn ?? 0) + (c.totals.tokensOut ?? 0);
  const period = `Last ${c.periodDays} days`;

  const data: PlatformCostData = {
    period,
    kpis: [
      { label: "Total AI spend (30d)", value: totalCost, prefix: "$", icon: "cpu", ai: true, spark: flat(totalCost), delta: 0, good: false } as KPI,
      { label: "Agent runs (30d)", value: c.totals.runs ?? 0, icon: "server", spark: flat(c.totals.runs ?? 0), delta: 0, good: true } as KPI,
      { label: "Tokens (30d)", value: totalTokens, icon: "chart", spark: flat(totalTokens), delta: 0, good: false } as KPI,
      { label: "Agents w/ spend", value: (c.byAgent ?? []).length, icon: "sparkles", ai: true, spark: flat((c.byAgent ?? []).length), delta: 0, good: true } as KPI,
    ],
    agents: (c.byAgent ?? []).map((a) => ({ n: a.agentType, cost: a.costUsd })),
    tenants: (c.byTenant ?? []).map((t) => ({
      id: t.tenantId,
      name: nameById.get(t.tenantId) ?? t.tenantId.slice(0, 8),
      cost: Math.round(t.costUsd * 100) / 100,
      // "over" budget heuristic: spend exceeds the plan's monthly MRR.
      health: t.costUsd > (PLAN_MRR[t.plan] ?? 0) && (PLAN_MRR[t.plan] ?? 0) > 0 ? "over" : "healthy",
    })),
  };
  return <PlatformCostScreen data={data} />;
}
