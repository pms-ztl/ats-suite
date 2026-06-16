"use client";
// components/cd/org-overview-live.tsx
// Wires the verbatim Claude Design OrgOverview (./screens/OrgOverview) to our real
// gateway. Maps /platform/unified-overview (KPIs + pipeline + diversity) and
// /platform/tenants (activity) onto OrgOverviewData. This is the same data the
// prior components/dashboards/org-overview pulled, retargeted to the CD prop shape
// and CD color tokens (var(--brand) etc. resolve inside the .cd-scope chrome).
import { OrgOverview } from "./screens/OrgOverview";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getDashboardKpis, getFunnel, getAdverseImpact, getBillingUsage, getSpendTrend, getSourceOfHire, getOversight,
  listCandidates, listRequisitions, listInterviews, weeklyCounts,
  type DashKpi, type BillingUsage, type SpendMonth, type SourceStat, type OversightStats,
} from "@/lib/api";
import type { ApplicationStage, FairnessMetric, Candidate, Requisition, Interview } from "@/lib/types";
import type { OrgOverviewData, TimelineItem, PendingItem } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function rawList(path: string): Promise<any[]> {
  try {
    let t: string | null = null;
    try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    });
    if (!res.ok) return [];
    const body: any = await res.json();
    return Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  } catch { return []; }
}

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};
const STAGE_ORDER: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];
// CD tokens (full colors under .cd-scope), not the app's bare-channel --c-* tokens.
const FUNNEL_COLORS = ["var(--brand)", "var(--brand)", "var(--info)", "var(--info)", "var(--ai-2)", "var(--ai)", "var(--ai)", "var(--ok)"];
const GROUP_COLORS = ["var(--brand)", "var(--ai)", "var(--info)", "var(--warn)", "var(--ok)", "var(--ink-3)"];
const AGENTS = ["candidate-screener", "bias-auditor", "jd-author", "copilot"];

function ago(iso?: string): string {
  if (!iso) return "just now";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "just now";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

export function OrgOverviewLive() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  // Live intelligence row: metered AI workload + spend (billing AgentRunCost),
  // channel mix (Candidate.source) and HITL oversight - all real, tenant-scoped.
  const usage = useData<BillingUsage>(() => getBillingUsage(30));
  const spend = useData<{ trend: SpendMonth[]; totalSpend: number }>(getSpendTrend);
  const sources = useData<SourceStat[]>(getSourceOfHire);
  const oversight = useData<OversightStats>(getOversight);
  const cands = useData<Candidate[]>(() => listCandidates());
  const reqs = useData<Requisition[]>(listRequisitions);
  const interviews = useData<Interview[]>(listInterviews);
  // Activity feed: there is no tenant-scoped activity endpoint yet, so this stays
  // an honest empty feed rather than calling a non-existent route. (The old
  // /platform/tenants call was a super-admin-only endpoint that 404'd here.)
  const activity = useData<TimelineItem[]>(() => Promise.resolve([] as TimelineItem[]));

  const allKpis = kpis.data ?? [];

  const stages = (funnel.data ?? []).slice().sort((a, b) => {
    const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const funnelStages = stages.map((s, i) => ({ stage: STAGE_LABEL[s.stage] ?? s.stage, n: s.count, color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }));
  const applied = stages.find((s) => s.stage === "APPLIED")?.count ?? stages[0]?.count ?? 0;
  const hired = stages.find((s) => s.stage === "HIRED")?.count ?? stages[stages.length - 1]?.count ?? 0;
  const overallConv = applied > 0 ? +((hired / applied) * 100).toFixed(1) : 0;

  const totalSel = (fairness.data ?? []).reduce((acc, m) => acc + (m.selectionRate || 0), 0) || 1;
  const diversity = (fairness.data ?? []).map((m, i) => ({ g: m.group, v: Math.round(((m.selectionRate || 0) / totalSel) * 100), color: m.flagged ? "var(--warn)" : GROUP_COLORS[i % GROUP_COLORS.length] }));
  const flagged = (fairness.data ?? []).filter((m) => m.flagged);
  const minRatio = (fairness.data ?? []).reduce((m, x) => Math.min(m, x.impactRatio || 1), 1);
  const pending: PendingItem[] = flagged.map((g) => ({
    ic: "flag",
    title: `Adverse-impact flag: ${g.group}`,
    meta: `Impact ratio ${(g.impactRatio ?? 0).toFixed(2)} · below 0.80 four-fifths threshold`,
    tone: (g.impactRatio ?? 1) < 0.6 ? "danger" : "warn",
  }));

  const data: OrgOverviewData = {
    workspace: user?.tenant?.name ?? undefined,
    live: true,
    heroStats: allKpis.slice(0, 4),
    kpis: allKpis,
    funnel: funnelStages,
    funnelConversionLabel: overallConv > 0 ? `${overallConv}% applied to hired` : undefined,
    diversity,
    diversityIndex: fairness.data && fairness.data.length ? minRatio.toFixed(2) : "0.00",
    trend: [],
    trendLabels: [],
    activity: activity.data ?? [],
    pending,
    pendingCountLabel: pending.length ? `${pending.length} need attention` : undefined,
    agentBars: [],
    // Real per-agent workload: runs + metered cost from billing AgentRunCost. The tiles
    // fall back to the static advisory roster only while the usage call is pending/empty.
    agents: (usage.data?.byAgent?.length
      ? usage.data.byAgent.map((a) => ({ name: a.agentType, stat: `${a.runs} runs · ₹${a.costUsd.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` }))
      : AGENTS.map((n) => ({ name: n, stat: "advisory" }))),
    agentUsage: usage.data?.byAgent?.map((a) => ({ agent: a.agentType, runs: a.runs, costUsd: a.costUsd })) ?? [],
    sources: (sources.data ?? []).map((s) => ({ source: s.source, applied: s.applied })),
    spendTrend: (spend.data?.trend ?? []).map((m) => ({ label: m.label, byProvider: m.byProvider })),
    oversight: oversight.data,
    // Real division: metered 30d AI spend over candidates reaching HIRED. Omitted (no
    // fabrication) when either side is zero.
    costPerHireLabel: (() => {
      const cost = usage.data?.totalCostUsd ?? 0;
      if (cost > 0 && hired > 0) return `₹${(cost / hired).toLocaleString("en-IN", { maximumFractionDigits: 2 })} AI cost per hire`;
      return undefined;
    })(),
    // Hiring-activity row: weekly inflow (Candidate.createdAt), open roles per
    // department, and the live interview status mix - straight counts, no modeling.
    inflow: weeklyCounts((cands.data ?? []).map((c: any) => c.appliedAt || c.createdAt), 8),
    departments: (() => {
      const by = new Map<string, number>();
      for (const r of reqs.data ?? []) {
        // The backend enum also carries INTERVIEWING, which the frontend union lacks.
        const st = String(r.status ?? "OPEN");
        if (st !== "OPEN" && st !== "INTERVIEWING") continue;
        const d = r.department || "Other";
        by.set(d, (by.get(d) ?? 0) + 1);
      }
      return Array.from(by, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    })(),
    interviewMix: (() => {
      const order: [string, string, string][] = [
        ["SCHEDULED", "Scheduled", "var(--info)"], ["CONFIRMED", "Confirmed", "var(--brand)"],
        ["IN_PROGRESS", "In progress", "var(--ai)"], ["COMPLETED", "Completed", "var(--ok)"],
        ["RESCHEDULED", "Rescheduled", "var(--warn)"], ["CANCELLED", "Cancelled", "var(--ink-3)"],
        ["NO_SHOW", "No-show", "var(--danger)"],
      ];
      return order
        .map(([st, name, color]) => ({ name, color, value: (interviews.data ?? []).filter((iv) => iv.status === st).length }))
        .filter((d) => d.value > 0);
    })(),
  };

  return <OrgOverview data={data} />;
}
