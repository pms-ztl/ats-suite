"use client";
// app/(dashboard)/admin/page.tsx - EXACT Claude Design "Aurora" AdminDash
// (platform / org-wide admin dashboard). Ported verbatim from
// claude-design/dash-admin.jsx (the AdminDash component): command-center hero,
// 8-up KPI row, a pipeline-funnel + diversity charts row, then a two-column
// surface (time-to-hire trend / activity on the left, pending actions / agent
// activity on the right). The prototype read window.DASH.admin mock data; every
// number here comes from the real gateway via useData + getDashboardKpis,
// getFunnel, getAdverseImpact, and an inline raw() tenant fetch. Sections with
// no backing endpoint render the same SectionCard with EmptyState (no
// fabricated numbers), so the layout stays faithful.
import { useState } from "react";
import {
  CommandHero, KpiRow, SectionCard, Funnel, Donut, Timeline,
  PendingList, Pill, Btn, Reveal,
} from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getDashboardKpis, getFunnel, getAdverseImpact, type DashKpi } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/types";

// ---- inline raw() (guide-sanctioned; do NOT edit lib/api.ts) -----------------
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

type TenantRow = { id?: string; name?: string; slug?: string; plan?: string; status?: string; createdAt?: string };

// Try the platform tenant list, then the admin alias. Coerce {data:[...]} | [...]
async function fetchTenants(): Promise<TenantRow[]> {
  const coerce = (r: any): TenantRow[] => {
    const p = r?.data ?? r;
    return Array.isArray(p) ? p : Array.isArray(p?.data) ? p.data : [];
  };
  try { return coerce(await raw("/platform/tenants")); }
  catch { return coerce(await raw("/admin/tenants")); }
}

// ----- view-model mappers (real data -> kit shapes, no invented numbers) -----
const STAGE_COLOR: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "var(--c-brand)", SCREENED: "var(--c-ai)", PHONE_SCREEN: "var(--c-info)",
  ASSESSMENT: "var(--c-info)", INTERVIEW: "var(--c-warn)", FINAL_REVIEW: "var(--c-warn)",
  OFFER: "var(--c-ok)", HIRED: "var(--c-ok)",
};
const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone", ASSESSMENT: "Assessment",
  INTERVIEW: "Interview", FINAL_REVIEW: "Final", OFFER: "Offer", HIRED: "Hired",
};
const PALETTE = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-warn)", "var(--c-ok)", "var(--c-danger)"];

function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function AdminDashboard() {
  const [live, setLive] = useState(true);

  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const funnel = useData(getFunnel);
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const tenants = useData<TenantRow[]>(fetchTenants);

  // Hero stats derive from the real KPI payload, so the command-center band
  // never shows a number the backend didn't return.
  const byId = (id: string) => (kpis.data ?? []).find((k) => k.id === id);
  const heroStats =
    kpis.data?.map((k) => ({
      label: k.label, value: k.value, icon: k.icon, ai: k.ai,
      prefix: k.prefix, suffix: k.suffix, spark: k.spark,
    })) ?? [];

  // Pipeline funnel: real per-stage counts in canonical stage order.
  const ORDER: ApplicationStage[] = ["APPLIED", "SCREENED", "INTERVIEW", "OFFER", "HIRED"];
  const funnelStages = (() => {
    const rows = funnel.data ?? [];
    const m = new Map(rows.map((r) => [r.stage, r.count]));
    const picked = ORDER.filter((s) => m.has(s)).map((s) => ({
      stage: STAGE_LABEL[s] ?? s, n: m.get(s) ?? 0, color: STAGE_COLOR[s] ?? "var(--c-brand)",
    }));
    if (picked.length) return picked;
    return rows.map((r) => ({ stage: STAGE_LABEL[r.stage] ?? r.stage, n: r.count, color: STAGE_COLOR[r.stage] ?? "var(--c-brand)" }));
  })();
  const appliedToHired = (() => {
    const top = funnelStages[0]?.n ?? 0;
    const hired = funnelStages[funnelStages.length - 1]?.n ?? 0;
    if (!top || funnelStages.length < 2) return null;
    return ((hired / top) * 100).toFixed(1);
  })();

  // Diversity donut: selection rate by group, from the four-fifths report.
  const diversity = (fairness.data ?? []).map((f, i) => ({
    g: f.group, v: Math.round(f.selectionRate * 100), color: PALETTE[i % PALETTE.length],
  }));
  const flaggedCount = (fairness.data ?? []).filter((f) => f.flagged).length;

  // Org-wide activity: recently-joined tenants (real platform data).
  const activity = (tenants.data ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 6)
    .map((t) => ({
      ic: "building", who: t.name ?? t.slug ?? "Tenant",
      what: `joined on the ${t.plan ?? "Free"} plan`, t: ago(t.createdAt),
    }));

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* Command-center hero. Stats come from the real unified-overview KPIs. */}
      {kpis.loading && <div className="mb-[18px]"><Skeleton className="h-[150px] rounded-[20px]" /></div>}
      {kpis.error && <div className="mb-[18px]"><ErrorState title="Could not load the overview" body="The platform overview service did not respond." code="GET /api/platform/unified-overview" onRetry={kpis.reload} /></div>}
      {kpis.data && (
        <CommandHero
          title="Org overview"
          sub="Everything happening across your hiring operation, in real time."
          stats={heroStats}
          live={live}
          onToggleLive={() => setLive((v) => !v)}
        >
          <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 30 days</Pill>
          <a href="/admin/platform/audit"><Btn variant="primary" icon="arrowUpRight">Export report</Btn></a>
        </CommandHero>
      )}

      {/* KPI row (the real 4-up unified overview metrics). */}
      {kpis.data && <KpiRow kpis={kpis.data} cols={4} />}

      {/* charts row: pipeline funnel + diversity */}
      <div className="mb-4 grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Reveal i={8}>
          <SectionCard
            title="Pipeline funnel"
            icon="radar"
            action="Breakdown"
            headRight={appliedToHired ? <Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">{appliedToHired}% applied to hired</Pill> : undefined}
          >
            {funnel.loading && <div className="grid gap-[10px]">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[30px] rounded-[8px]" />)}</div>}
            {funnel.error && <ErrorState title="Could not load the funnel" body="The analytics service did not respond." code="GET /api/analytics/funnel" onRetry={funnel.reload} />}
            {funnel.data && funnelStages.length === 0 && <EmptyState title="No pipeline data yet" body="Once candidates move through stages, the funnel fills in here." />}
            {funnel.data && funnelStages.length > 0 && <Funnel stages={funnelStages} />}
          </SectionCard>
        </Reveal>

        <Reveal i={9}>
          <SectionCard title="Diversity" icon="grid" action="EEOC report">
            {fairness.loading && <div className="grid gap-2"><Skeleton className="h-[150px] rounded-[12px]" /></div>}
            {fairness.error && <ErrorState title="Could not load diversity" body="The bias-auditor service did not respond." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
            {fairness.data && diversity.length === 0 && <EmptyState title="No fairness data yet" body="Adverse-impact ratios appear once enough candidates are scored." />}
            {fairness.data && diversity.length > 0 && (
              <Donut data={diversity} center={{ value: String(diversity.length), label: "groups" }} />
            )}
          </SectionCard>
        </Reveal>
      </div>

      {/* two-column surface: trend / activity (left), pending / agents (right) */}
      <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <Reveal i={10}>
            <SectionCard title="Time-to-hire trend" icon="chart">
              {/* No historical time-series endpoint is exposed yet; show the
                  current value honestly instead of inventing a trend line. */}
              {kpis.loading && <Skeleton className="h-[150px] rounded-[12px]" />}
              {kpis.data && (() => {
                const tth = byId("tth");
                if (!tth || !tth.value) return <EmptyState title="No time-to-hire history yet" body="Once roles are filled, the trend over time renders here." />;
                return (
                  <div className="flex items-center justify-between gap-4 px-1 py-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Current average</div>
                      <div className="mono mt-1 text-[34px] font-extrabold leading-none tracking-tight">{tth.value}<span className="ml-1 text-[16px] font-bold text-ink-3">days</span></div>
                    </div>
                    <Pill mono tone="var(--c-ink-2)" bg="var(--c-surface-2)" icon="clock">from hired applications</Pill>
                  </div>
                );
              })()}
            </SectionCard>
          </Reveal>

          <Reveal i={12}>
            <SectionCard title="Activity" icon="bolt" action="Full log">
              {tenants.loading && <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-[11px]" />)}</div>}
              {tenants.error && <ErrorState title="Could not load activity" body="The platform service did not respond." code="GET /api/platform/tenants" onRetry={tenants.reload} />}
              {tenants.data && activity.length === 0 && <EmptyState title="No recent activity" body="Org-wide events show up here as your teams get to work." />}
              {tenants.data && activity.length > 0 && <Timeline items={activity} />}
            </SectionCard>
          </Reveal>
        </div>

        <div className="flex flex-col gap-4">
          <Reveal i={11}>
            <SectionCard
              title="Pending actions"
              icon="listChecks"
              headRight={flaggedCount > 0 ? <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)">{flaggedCount} need attention</Pill> : undefined}
            >
              {fairness.loading && <div className="grid gap-[9px]">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[54px] rounded-[10px]" />)}</div>}
              {fairness.error && <ErrorState title="Could not load pending actions" body="The compliance service did not respond." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
              {fairness.data && (() => {
                const flagged = (fairness.data ?? []).filter((f) => f.flagged);
                if (flagged.length === 0) return <EmptyState title="Nothing needs attention" body="No adverse-impact flags are open right now. Nice work." />;
                return (
                  <PendingList
                    items={flagged.map((f) => ({
                      title: `Adverse impact, ${f.group}`,
                      meta: `Impact ratio ${f.impactRatio.toFixed(2)} (below 0.80 threshold)`,
                      ic: "flag", tone: "danger" as const,
                    }))}
                  />
                );
              })()}
            </SectionCard>
          </Reveal>

          <Reveal i={13}>
            <SectionCard title="Agent activity" icon="sparkles">
              {/* Decorative sparkline (illustrative chrome, kept verbatim). */}
              <svg viewBox="0 0 280 70" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
                <defs><linearGradient id="agp" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="var(--c-ai)" stopOpacity="0.05" /><stop offset="1" stopColor="var(--c-ai)" stopOpacity="0.4" /></linearGradient></defs>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const h = [14, 22, 18, 30, 26, 38, 34, 46, 40, 52, 48, 58][i]; return <rect key={i} x={8 + i * 22} y={64 - h} width="13" height={h} rx="3" fill="url(#agp)" />; })}
                <polyline points="14,50 36,46 58,48 80,40 102,42 124,34 146,36 168,28 190,30 212,22 234,24 256,16" fill="none" stroke="var(--c-ai)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="256" cy="16" r="3.5" fill="var(--c-ai)" />
              </svg>
              {/* The AI decisions count is the one real number we have. */}
              {kpis.data && (() => {
                const ai = byId("ai");
                return (
                  <div className="grid grid-cols-2 gap-[10px]">
                    <div style={{ padding: "9px 11px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)" }}>
                      <div className="mono" style={{ fontSize: 11, color: "var(--c-ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>agent decisions</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>{(ai?.value ?? 0).toLocaleString()} today</div>
                    </div>
                    <div style={{ padding: "9px 11px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)" }}>
                      <div className="mono" style={{ fontSize: 11, color: "var(--c-ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>bias auditor</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 2 }}>{flaggedCount} flags open</div>
                    </div>
                  </div>
                );
              })()}
              <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> All agents advisory · humans hold every decision.</p>
            </SectionCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
