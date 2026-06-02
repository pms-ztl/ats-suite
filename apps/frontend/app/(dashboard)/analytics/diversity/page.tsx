"use client";
// app/(dashboard)/analytics/diversity/page.tsx - EXACT Claude Design "Aurora"
// diversity / representation detail (the diversity slice of
// claude-design/screen-analytics.jsx, expanded into a full detail screen):
// breadcrumb back to /analytics, an advisory band that frames diversity as a
// fairness signal (never a quota), a KPI strip, representation-by-group donut,
// and a selection-rate-by-group bar list against the 0.80 four-fifths line.
//
// HONEST WIRING: every group, selection rate, and impact ratio comes from the
// real getAdverseImpact endpoint (FairnessMetric[]). Nothing is fabricated -
// flagged groups render in the warn color, the donut is normalised to a share
// of selections, and loading/error/empty all surface honest states.
import { KpiRow, SectionCard, Donut, Reveal, Pill, Btn, type Kpi } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";

// Stable palette for unflagged groups; flagged groups always override to warn.
const GROUP_COLORS = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-ok)", "var(--c-ink-3)", "var(--c-brand-2)"];
const FOUR_FIFTHS = 0.8;

export default function DiversityPage() {
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const rows = fairness.data ?? [];

  // The reference group is the one with the highest selection rate; every other
  // group's impact ratio is measured against it under the four-fifths rule.
  const maxRate = rows.reduce((m, x) => Math.max(m, x.selectionRate || 0), 0) || 1;
  const totalRate = rows.reduce((acc, m) => acc + (m.selectionRate || 0), 0) || 1;

  // Donut: each group's share of total selection rate across all groups.
  const donutData = rows.map((m, i) => ({
    g: m.group,
    v: Math.round((m.selectionRate / totalRate) * 100),
    color: m.flagged ? "var(--c-warn)" : GROUP_COLORS[i % GROUP_COLORS.length],
  }));

  const flaggedGroups = rows.filter((m) => m.flagged);
  const minRatio = rows.length ? rows.reduce((m, x) => Math.min(m, x.impactRatio), 1) : 1;
  const groupsPassing = rows.filter((m) => m.impactRatio >= FOUR_FIFTHS).length;

  // ----- KPIs (all derived from the one real series, never invented) -----
  const kpis: Kpi[] = [
    { id: "groups", label: "Groups tracked", value: rows.length, icon: "users", spark: [rows.length], delta: 0, good: true },
    { id: "minratio", label: "Lowest impact ratio", value: +minRatio.toFixed(2), icon: "shield", spark: [minRatio], delta: 0, good: minRatio >= FOUR_FIFTHS },
    { id: "flagged", label: "Flagged groups", value: flaggedGroups.length, icon: "flag", spark: [flaggedGroups.length], delta: 0, good: flaggedGroups.length === 0 ? true : false },
    { id: "pass", label: "Within four-fifths", value: groupsPassing, icon: "check", spark: [groupsPassing], delta: 0, good: true, ai: true },
  ];

  const hasFlag = flaggedGroups.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* breadcrumb / back to analytics */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: "var(--fs-sm)" }}>
        <a href="/analytics" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--c-ink-2)", fontWeight: 600, textDecoration: "none" }}>
          <Icon name="chevsL" size={15} />Analytics
        </a>
        <Icon name="chevR" size={13} style={{ color: "var(--c-ink-3)" }} />
        <span style={{ color: "var(--c-ink-3)" }}>Diversity and representation</span>
      </div>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Diversity and representation</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)", maxWidth: "62ch" }}>
            A fairness signal across selection rates by group, measured against the 0.80 four-fifths rule. This is an advisory check on process, not a quota or a target.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 90 days</Pill>
          <Btn variant="primary" icon="arrowUpRight">EEOC report</Btn>
        </div>
      </div>

      {/* advisory / ethical framing band */}
      <Reveal i={1}>
        <div style={{ borderRadius: "var(--r-xl)", border: `1px solid color-mix(in oklab, ${hasFlag ? "var(--c-warn)" : "var(--c-ai)"} 22%, var(--c-line))`, background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", background: `linear-gradient(110deg, ${hasFlag ? "var(--c-warn-tint)" : "var(--c-ai-tint)"}, transparent 65%)`, borderBottom: "1px solid var(--c-line)" }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <Icon name={hasFlag ? "flag" : "shield"} size={16} style={{ color: hasFlag ? "var(--c-warn)" : "var(--c-ai)" }} />
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Fairness signal</span>
              <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">bias auditor</Pill>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>advisory only · review process, never set quotas</span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Icon name={hasFlag ? "flag" : "check"} size={16} style={{ color: hasFlag ? "var(--c-warn)" : "var(--c-ok)", flexShrink: 0, marginTop: 2 }} />
            <div>
              {fairness.loading && <Skeleton className="h-5 w-[60%] rounded" />}
              {!fairness.loading && rows.length === 0 && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--c-ink-2)", lineHeight: 1.55 }}>
                  Selection rates by group appear here once enough candidates have moved through the funnel. Representation is read as a signal about your process, not a hiring target.
                </p>
              )}
              {!fairness.loading && rows.length > 0 && hasFlag && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--c-ink-2)", lineHeight: 1.55 }}>
                  <b style={{ color: "var(--c-ink)" }}>Adverse-impact flag on {flaggedGroups.length} group{flaggedGroups.length > 1 ? "s" : ""}.</b>{" "}
                  The lowest impact ratio is <span className="mono" style={{ color: "var(--c-warn)", fontWeight: 600 }}>{minRatio.toFixed(2)}</span>, below the {FOUR_FIFTHS.toFixed(2)} four-fifths threshold ({flaggedGroups.map((g) => g.group).join(", ")}). A flag is a prompt to audit the screening criteria and outreach behind the gap, not a reason to adjust outcomes by group.
                </p>
              )}
              {!fairness.loading && rows.length > 0 && !hasFlag && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--c-ink-2)", lineHeight: 1.55 }}>
                  <b style={{ color: "var(--c-ink)" }}>All groups clear the four-fifths rule.</b>{" "}
                  The lowest impact ratio is <span className="mono" style={{ color: "var(--c-ok)", fontWeight: 600 }}>{minRatio.toFixed(2)}</span>, at or above the {FOUR_FIFTHS.toFixed(2)} threshold. Keep this as a routine check on the fairness of the process as new cohorts move through the funnel.
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* KPIs (derived from the real fairness series) */}
      {fairness.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {fairness.error && <div className="mb-[18px]"><ErrorState title="Could not load fairness metrics" body="The adverse-impact service did not respond." code="GET /api/bias/four-fifths" onRetry={fairness.reload} /></div>}
      {fairness.data && rows.length > 0 && <KpiRow kpis={kpis} cols={4} />}

      {/* representation donut + selection-rate bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 16, alignItems: "start" }}>
        <Reveal i={2}>
          <SectionCard title="Representation by group" icon="grid" headRight={<Pill mono tone={hasFlag ? "var(--c-warn)" : "var(--c-ok)"} bg={hasFlag ? "var(--c-warn-tint)" : "var(--c-ok-tint)"}>min ratio {minRatio.toFixed(2)}</Pill>}>
            {fairness.loading && <Skeleton className="h-40 rounded-lg" />}
            {fairness.error && <ErrorState title="Representation unavailable" body="Could not load selection rates by group." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
            {fairness.data && donutData.length === 0 && <EmptyState title="No representation data yet" body="Share of selections by group appears once enough candidates have been screened." />}
            {fairness.data && donutData.length > 0 && <Donut data={donutData} center={{ value: minRatio.toFixed(2), label: "min ratio" }} />}
          </SectionCard>
        </Reveal>

        <Reveal i={3}>
          <SectionCard title="Selection rate by group" icon="chart" action="EEOC report" onAction={() => { window.location.href = "/analytics/diversity"; }}>
            {fairness.loading && <Skeleton className="h-48 rounded-lg" />}
            {fairness.error && <ErrorState title="Selection rates unavailable" body="Could not load adverse-impact metrics." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />}
            {fairness.data && rows.length === 0 && <EmptyState title="No selection rates yet" body="Selection rate and impact ratio by group fill in here as cohorts move through the funnel." />}
            {fairness.data && rows.length > 0 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 78px 64px", gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
                  <span>Group</span><span>Selection rate</span><span style={{ textAlign: "right" }}>Ratio</span><span style={{ textAlign: "right" }}>Status</span>
                </div>
                {rows.map((m, i) => {
                  const pct = (m.selectionRate / maxRate) * 100;
                  const bar = m.flagged ? "var(--c-warn)" : GROUP_COLORS[i % GROUP_COLORS.length];
                  return (
                    <div key={m.group} style={{ display: "grid", gridTemplateColumns: "120px 1fr 78px 64px", gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                      <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 600 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: bar, flexShrink: 0 }} />{m.group}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div style={{ flex: 1, maxWidth: 220, height: 18, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: pct + "%", borderRadius: 6, background: bar, animation: "growx 1s var(--ease-out) both", animationDelay: (i * 80) + "ms" }} />
                        </div>
                        <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 700 }}>{Math.round(m.selectionRate * 100)}%</span>
                      </div>
                      <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", fontWeight: 600, color: m.impactRatio < FOUR_FIFTHS ? "var(--c-warn)" : "var(--c-ok)" }}>{m.impactRatio.toFixed(2)}</span>
                      <span style={{ display: "inline-flex", justifyContent: "flex-end" }}>
                        {m.flagged
                          ? <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)" icon="flag" style={{ fontSize: 10, padding: "2px 7px" }}>Flag</Pill>
                          : <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check" style={{ fontSize: 10, padding: "2px 7px" }}>Pass</Pill>}
                      </span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--c-line)", display: "flex", gap: 7, alignItems: "flex-start", fontSize: 11.5, color: "var(--c-ink-3)", lineHeight: 1.5 }}>
                  <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1, color: "var(--c-ink-3)" }} />
                  The impact ratio compares each group's selection rate to the highest-selected group. A ratio below {FOUR_FIFTHS.toFixed(2)} (the four-fifths rule) is flagged for review of the criteria, never corrected by changing outcomes per group.
                </div>
              </>
            )}
          </SectionCard>
        </Reveal>
      </div>
    </div>
  );
}
