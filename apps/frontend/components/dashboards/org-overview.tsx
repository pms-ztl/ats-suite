"use client";
// components/dashboards/org-overview.tsx
// EXACT Claude Design "Org overview" admin dashboard (claude-design/dash-admin.jsx
// AdminDash): CommandHero band (live toggle + 4 hero stats) + an 8-card KPI row +
// pipeline funnel + diversity donut + time-to-hire trend + activity timeline +
// pending actions + advisory agent-activity panel. Shared by the dashboard home
// (/) for admins and the platform admin route (/admin). Wired to the real
// gateway: getDashboardKpis (hero + KPI row), getFunnel (funnel), getAdverseImpact
// (diversity donut + pending flags), best-effort /platform/tenants (activity).
import { useState } from "react";
import { CommandHero, KpiRow, SectionCard, Funnel, Donut, Timeline, PendingList, Reveal, Pill, Btn } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getDashboardKpis, getFunnel, getAdverseImpact, type DashKpi } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";

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
const FUNNEL_COLORS = ["var(--c-brand)", "var(--c-brand)", "var(--c-info)", "var(--c-info)", "var(--c-ai-2)", "var(--c-ai)", "var(--c-ai)", "var(--c-ok)"];
const GROUP_COLORS = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-warn)", "var(--c-ok)", "var(--c-ink-3)"];
const AGENTS = ["candidate-screener", "bias-auditor", "jd-author", "copilot"];

type Activity = { who: string; what: string; t: string; ic: string; ai?: boolean };
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

export function OrgOverview() {
  const [live, setLive] = useState(true);
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const activity = useData<Activity[]>(() =>
    rawList("/platform/tenants").then((rows) =>
      rows.slice(0, 6).map((t: any): Activity => ({
        who: String(t?.name ?? t?.tenantName ?? t?.companyName ?? "A tenant"),
        what: `· ${String(t?.plan ?? t?.tier ?? "FREE").toUpperCase()} · ${t?.users ?? t?.userCount ?? t?.seats ?? 0} seats`,
        t: ago(t?.createdAt ?? t?.updatedAt), ic: "building",
      })),
    ),
  );

  // Hero band shows the first 4 KPIs; the KPI row below shows all 8.
  const heroStats = (kpis.data ?? []).slice(0, 4).map((k) => ({
    label: k.label, value: k.value, icon: k.icon, ai: k.ai, prefix: k.prefix, suffix: k.suffix, spark: k.spark,
  }));

  const stages = (funnel.data ?? []).slice().sort((a, b) => {
    const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const funnelStages = stages.map((s, i) => ({ stage: STAGE_LABEL[s.stage] ?? s.stage, n: s.count, color: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }));
  const applied = stages.find((s) => s.stage === "APPLIED")?.count ?? stages[0]?.count ?? 0;
  const hired = stages.find((s) => s.stage === "HIRED")?.count ?? stages[stages.length - 1]?.count ?? 0;
  const overallConv = applied > 0 ? +((hired / applied) * 100).toFixed(1) : 0;

  const totalSel = (fairness.data ?? []).reduce((acc, m) => acc + (m.selectionRate || 0), 0) || 1;
  const donutData = (fairness.data ?? []).map((m, i) => ({ g: m.group, v: Math.round(((m.selectionRate || 0) / totalSel) * 100), color: m.flagged ? "var(--c-warn)" : GROUP_COLORS[i % GROUP_COLORS.length] }));
  const flaggedGroups = (fairness.data ?? []).filter((m) => m.flagged);
  const minRatio = (fairness.data ?? []).reduce((m, x) => Math.min(m, x.impactRatio || 1), 1);
  const pending = flaggedGroups.map((g): { title: string; meta: string; ic: string; tone: "ok" | "warn" | "danger" } => ({
    title: `Adverse-impact flag: ${g.group}`, meta: `Impact ratio ${(g.impactRatio ?? 0).toFixed(2)} · below 0.80 four-fifths threshold`,
    ic: "flag", tone: (g.impactRatio ?? 1) < 0.6 ? "danger" : "warn",
  }));

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <CommandHero title="Org overview" sub="Everything happening across your hiring operation, in real time." stats={heroStats} live={live} onToggleLive={() => setLive((v) => !v)}>
        <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 30 days</Pill>
        <Btn variant="primary" icon="arrowUpRight">Export report</Btn>
      </CommandHero>

      {kpis.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {kpis.error && <div className="mb-[18px]"><ErrorState title="Could not load metrics" body="The overview service did not respond." code="GET /api/platform/unified-overview" onRetry={kpis.reload} /></div>}
      {kpis.data && kpis.data.length > 0 && <KpiRow kpis={kpis.data} cols={4} />}
      {kpis.data && kpis.data.length === 0 && <div className="mb-[18px]"><EmptyState title="No metrics yet" body="Org-wide KPIs appear once requisitions, candidates, and agent runs are flowing." /></div>}

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={8}>
          <SectionCard title="Pipeline funnel" icon="radar" headRight={overallConv > 0 ? <Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">{overallConv}% applied to hired</Pill> : undefined}>
            {funnel.loading && <Skeleton className="h-48 rounded-lg" />}
            {funnel.error && <ErrorState title="Funnel unavailable" body="Could not load the pipeline funnel." code="GET /api/analytics/funnel" onRetry={funnel.reload} />}
            {funnel.data && funnelStages.length === 0 && <EmptyState title="No funnel data yet" body="When candidates apply and move through stages, the funnel fills in here." />}
            {funnel.data && funnelStages.length > 0 && <Funnel stages={funnelStages} />}
          </SectionCard>
        </Reveal>
        <Reveal i={9}>
          <SectionCard title="Diversity" icon="grid" action="EEOC report" onAction={() => { window.location.href = "/analytics/diversity"; }}>
            {fairness.loading && <Skeleton className="h-40 rounded-lg" />}
            {fairness.error && <ErrorState title="Fairness unavailable" body="Could not load adverse-impact metrics." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
            {fairness.data && donutData.length === 0 && <EmptyState title="No fairness data yet" body="Selection rates by group appear once enough candidates have been screened." />}
            {fairness.data && donutData.length > 0 && <Donut data={donutData} center={{ value: minRatio.toFixed(2), label: "min ratio" }} />}
          </SectionCard>
        </Reveal>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={10}>
            <SectionCard title="Time-to-hire trend" icon="chart" action="Open" onAction={() => { window.location.href = "/analytics/time-to-hire"; }}>
              <EmptyState title="Trend not wired yet" body="The time-to-hire series is not available from the current analytics endpoint. Open the detail view for medians by department." actions={<a href="/analytics/time-to-hire"><Btn variant="soft" icon="chart">Time to hire</Btn></a>} />
            </SectionCard>
          </Reveal>
          <Reveal i={12}>
            <SectionCard title="Activity" icon="bolt" action="Full log" onAction={() => { window.location.href = "/audit"; }}>
              {activity.loading && <div style={{ display: "grid", gap: 10 }}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}</div>}
              {!activity.loading && (!activity.data || activity.data.length === 0) && <EmptyState title="No recent activity" body="Org-wide events appear here as your team and the agents work. View the full audit log for the complete trail." />}
              {!activity.loading && activity.data && activity.data.length > 0 && <Timeline items={activity.data} />}
            </SectionCard>
          </Reveal>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={11}>
            <SectionCard title="Pending actions" icon="listChecks" headRight={pending.length > 0 ? <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)">{pending.length} need attention</Pill> : undefined}>
              {fairness.loading && <div style={{ display: "grid", gap: 9 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-[11px]" />)}</div>}
              {fairness.error && <ErrorState title="Pending actions unavailable" body="Could not load the fairness signals that drive pending actions." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
              {fairness.data && pending.length === 0 && <EmptyState title="Nothing needs attention" body="No adverse-impact flags are open right now. The bias-auditor keeps watching every requisition." />}
              {fairness.data && pending.length > 0 && <PendingList items={pending} />}
            </SectionCard>
          </Reveal>
          <Reveal i={13}>
            <SectionCard title="Agent activity" icon="sparkles">
              <svg viewBox="0 0 280 70" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
                <defs><linearGradient id="agp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="var(--c-ai)" stopOpacity="0.05" /><stop offset="1" stopColor="var(--c-ai)" stopOpacity="0.4" /></linearGradient></defs>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const h = [14, 22, 18, 30, 26, 38, 34, 46, 40, 52, 48, 58][i]; return <rect key={i} x={8 + i * 22} y={64 - h} width="13" height={h} rx="3" fill="url(#agp)" />; })}
                <polyline points="14,50 36,46 58,48 80,40 102,42 124,34 146,36 168,28 190,30 212,22 234,24 256,16" fill="none" stroke="var(--c-ai)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="256" cy="16" r="3.5" fill="var(--c-ai)" />
              </svg>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {AGENTS.map((n) => (
                  <div key={n} style={{ padding: "9px 11px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)" }}>
                    <div className="mono" style={{ fontSize: 11, color: "var(--c-ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>advisory</div>
                  </div>
                ))}
              </div>
              <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> All agents advisory · humans hold every decision.</p>
            </SectionCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
