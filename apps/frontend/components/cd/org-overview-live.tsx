"use client";
// components/cd/org-overview-live.tsx
// Wires the verbatim Claude Design OrgOverview (./screens/OrgOverview) to our real
// gateway. This is the REAL-TIME OPS HOME (DESIGN_SPEC 7): every widget maps to a
// real, tenant-scoped dataset (the same datasets the recruiter / hiring-manager
// homes already prove out) or shows an honest empty state. No fabricated feeds, no
// fake zeros, no flat zero-lines.
import { useMemo, useRef } from "react";
import { OrgOverview } from "./screens/OrgOverview";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getDashboardKpis, getPlatformOverview, getFunnel, getAdverseImpact, getBillingUsage, getSpendTrend,
  getSourceOfHire, getOversight, listCandidates, listRequisitions, listInterviews, listScreening, listOffers,
  weeklyCounts,
  type DashKpi, type PlatformOverview, type BillingUsage, type SpendMonth, type SourceStat, type OversightStats,
} from "@/lib/api";
import type { ApplicationStage, FairnessMetric, Candidate, Requisition, Interview, ScreeningVerdict, ScreeningResult, Offer } from "@/lib/types";
import type { OrgOverviewData, TimelineItem, PendingItem, OrgHeroKpi } from "./types";

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

export function OrgOverviewLive() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  // The raw platform aggregate carries the real hero metrics + sparklines + deltas
  // (avgTimeToHire / offerAcceptRate / weeklyInflow / aiSpend) that the KPI getters
  // also read; we read it once directly to build the hero KpiCard row honestly.
  const overview = useData<PlatformOverview>(getPlatformOverview);
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
  const screening = useData<ScreeningVerdict[]>(listScreening);
  const offers = useData<Offer[]>(listOffers);

  // ---- One freshness signal for the single header <LiveStatus> ----
  // The 45s refetch layer (use-data.ts) keeps `kpis.data`/`overview.data` fresh but
  // does not expose a timestamp. Stamp the wall-clock time whenever the primary
  // aggregate's data reference changes (i.e. a real successful load landed).
  const updatedRef = useRef<number | null>(null);
  const updatedAt = useMemo(() => {
    if (kpis.data !== undefined || overview.data !== undefined) updatedRef.current = Date.now();
    return updatedRef.current ?? undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpis.data, overview.data]);

  const allKpis = kpis.data ?? [];
  const ov = overview.data;

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

  // ---- Real weekly inflow series (Candidate.appliedAt/createdAt) ----
  const inflow = weeklyCounts((cands.data ?? []).map((c: any) => c.appliedAt || c.createdAt), 8);
  const inflowTotal = inflow.reduce((s, w) => s + w.n, 0);
  const inflowSpark = inflow.map((w) => w.n);

  // ---- Screener verdict mix (PASS / REVIEW / FAIL) from listScreening ----
  const verdictMix = (() => {
    const rows = screening.data ?? [];
    const c = (r: ScreeningResult) => rows.filter((v) => v.result === r).length;
    const order: [ScreeningResult, string, string][] = [
      ["PASS", "Advance", "var(--ok)"], ["REVIEW", "Review", "var(--warn)"], ["FAIL", "Reject", "var(--danger)"],
    ];
    return order.map(([r, name, color]) => ({ name, value: c(r), color })).filter((d) => d.value > 0);
  })();

  // ---- Offer lifecycle counts (DRAFT -> ACCEPTED) from listOffers ----
  const OFFER_COLOR: Record<string, string> = {
    Draft: "var(--ink-3)", "Pending approval": "var(--warn)", Approved: "var(--info)",
    Sent: "var(--ai)", Accepted: "var(--ok)", Declined: "var(--danger)", Expired: "var(--danger)",
  };
  const offerLifecycle = (() => {
    const rows = offers.data ?? [];
    const order = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"];
    return order
      .map((st) => {
        const status = st.replace(/_/g, " ").toLowerCase().replace(/^\w/, (ch) => ch.toUpperCase());
        return { status, n: rows.filter((o) => o.status === st).length, color: OFFER_COLOR[status] ?? "var(--ink-3)" };
      })
      .filter((r) => r.n > 0);
  })();
  // Real offer-accept rate: accepted of the resolved-after-send pool. null when none out.
  const offerAccept = (() => {
    const rows = offers.data ?? [];
    const accepted = rows.filter((o) => o.status === "ACCEPTED").length;
    const sent = rows.filter((o) => o.status === "SENT").length;
    const declined = rows.filter((o) => o.status === "DECLINED").length;
    const denom = sent + accepted + declined;
    return denom ? Math.round((accepted / denom) * 100) : null;
  })();

  // ---- Real per-agent metered workload (billing AgentRunCost) ----
  const byAgent = usage.data?.byAgent ?? [];
  const agentMax = Math.max(1, ...byAgent.map((a) => a.runs));

  // ---- Hero KPI row (DESIGN_SPEC 7d). Each tile pulls a REAL value/delta/spark from
  //      the platform aggregate or the loaded datasets; null/absent flips the tile to
  //      the honest em-dash empty (never a fake 0), and an absent prior period drops
  //      the delta pill. A real measured 0 stays a real 0. ----
  const heroKpis: OrgHeroKpi[] = [
    {
      id: "pipeline",
      name: "Candidates in pipeline",
      value: ov?.activeCandidates ?? null,
      delta: ov?.activeCandidatesChange ?? null,
      goodWhen: "up",
      // The active-candidates momentum spark is the real weekly-inflow series.
      spark: (ov?.activeCandidatesSparkline?.length ? ov.activeCandidatesSparkline : inflowSpark),
      icon: "users",
      period: inflowTotal > 0 ? `${inflowTotal} arrived in 8 weeks` : undefined,
      emptyCaption: "No candidates yet",
    },
    {
      id: "tth",
      name: "Time to fill",
      value: ov?.avgTimeToHire ?? null,
      delta: ov?.avgTimeToHireChange ?? null,
      goodWhen: "down",         // an increase in days is bad
      spark: ov?.avgTimeToHireSparkline ?? [],
      suffix: "d",
      icon: "clock",
      emptyCaption: "Not enough history",
    },
    {
      id: "offer",
      name: "Offer acceptance",
      // Prefer the backend's computed rate; fall back to the live offer pool.
      value: ov?.offerAcceptRate ?? offerAccept,
      delta: ov?.offerAcceptRateChange ?? null,
      goodWhen: "up",
      spark: ov?.offerAcceptRateSparkline ?? [],
      suffix: "%",
      icon: "fileText",
      emptyCaption: "No offers out yet",
    },
    {
      id: "hitl",
      name: "HITL pending",
      // A real measured 0 (queue clear) is healthy and shown as 0, not as empty.
      value: oversight.data ? oversight.data.pending : null,
      goodWhen: "down",         // fewer waiting on a human is better
      icon: "shield",
      period: oversight.data && oversight.data.pending === 0 ? "Queue is clear" : undefined,
      emptyCaption: "No checkpoints yet",
    },
    {
      id: "aispend",
      name: "AI spend",
      value: usage.data ? +(usage.data.totalCostUsd).toFixed(2) : null,
      delta: ov?.aiSpendChange ?? null,
      goodWhen: "down",
      spark: ov?.aiSpendSparkline ?? [],
      prefix: "₹",
      ai: true,
      icon: "sparkles",
      period: "Last 30 days",
      emptyCaption: "No AI runs metered",
    },
  ];

  // Activity feed: there is still no tenant-scoped activity endpoint, so we pass an
  // empty feed and the screen HIDES that card entirely (never a permanent empty
  // placeholder, never a fabricated feed).
  const activity: TimelineItem[] = [];

  const data: OrgOverviewData = {
    workspace: user?.tenant?.name ?? undefined,
    live: true,
    updatedAt,
    heroKpis,
    heroStats: allKpis.slice(0, 4),
    kpis: allKpis,
    funnel: funnelStages,
    funnelConversionLabel: overallConv > 0 ? `${overallConv}% applied to hired` : undefined,
    diversity,
    diversityIndex: fairness.data && fairness.data.length ? minRatio.toFixed(2) : "0.00",
    // Real weekly candidate inflow as the org-wide trend series (oldest -> newest).
    trend: inflow.map((w) => w.n),
    trendLabels: inflow.map((w) => w.label),
    trendDeltaLabel: undefined,
    activity,
    pending,
    pendingCountLabel: pending.length ? `${pending.length} need attention` : undefined,
    // Real per-agent run counts as relative bar heights (no fabricated bars).
    agentBars: byAgent.map((a) => Math.round((a.runs / agentMax) * 100)),
    // Real per-agent workload: runs + metered cost from billing AgentRunCost. The tiles
    // fall back to the static advisory roster only while the usage call is pending/empty.
    agents: (byAgent.length
      ? byAgent.map((a) => ({ name: a.agentType, stat: `${a.runs} runs · ₹${a.costUsd.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` }))
      : AGENTS.map((n) => ({ name: n, stat: "advisory" }))),
    agentUsage: byAgent.map((a) => ({ agent: a.agentType, runs: a.runs, costUsd: a.costUsd })),
    sources: (sources.data ?? []).map((s) => ({ source: s.source, applied: s.applied })),
    spendTrend: (spend.data?.trend ?? []).map((m) => ({ label: m.label, byProvider: m.byProvider })),
    oversight: oversight.data,
    verdictMix,
    offerLifecycle,
    // Real division: metered 30d AI spend over candidates reaching HIRED. Omitted (no
    // fabrication) when either side is zero.
    costPerHireLabel: (() => {
      const cost = usage.data?.totalCostUsd ?? 0;
      if (cost > 0 && hired > 0) return `₹${(cost / hired).toLocaleString("en-IN", { maximumFractionDigits: 2 })} AI cost per hire`;
      return undefined;
    })(),
    // Hiring-activity row: weekly inflow (Candidate.createdAt), open roles per
    // department, and the live interview status mix - straight counts, no modeling.
    inflow,
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
