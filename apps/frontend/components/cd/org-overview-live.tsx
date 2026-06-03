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
import { getDashboardKpis, getFunnel, getAdverseImpact, type DashKpi } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";
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
const AGENT_BARS = [14, 22, 18, 30, 26, 38, 34, 46, 40, 52, 48, 58];

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
  const activity = useData<TimelineItem[]>(() =>
    rawList("/platform/tenants").then((rows) => rows.slice(0, 6).map((t: any): TimelineItem => ({
      ic: "building",
      who: String(t?.name ?? t?.tenantName ?? t?.companyName ?? "A tenant"),
      what: `· ${String(t?.plan ?? t?.tier ?? "FREE").toUpperCase()} · ${t?.users ?? t?.userCount ?? t?.seats ?? 0} seats`,
      t: ago(t?.createdAt ?? t?.updatedAt),
    }))),
  );

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
    agentBars: AGENT_BARS,
    agents: AGENTS.map((n) => ({ name: n, stat: "advisory" })),
  };

  return <OrgOverview data={data} />;
}
