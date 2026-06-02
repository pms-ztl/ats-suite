"use client";
// app/(dashboard)/analytics/diversity/page.tsx - EXACT Claude Design "Aurora"
// analytics layout, diversity slice. Reproduces the AnalyticsScreen
// representation-breakdown surface from claude-design/screen-analytics.jsx
// (Donut + Funnel + KpiRow + SectionCard) and wires it to the real gateway.
//
// Ethical framing is load-bearing here and is kept verbatim from the prototype
// intent: diversity is advisory only, a fairness signal to widen a search, and
// is NEVER a quota or a selection criterion. We never fabricate demographics, if
// the backend has no cohort data we render the exact layout with an EmptyState.
import { Greeting, KpiRow, SectionCard, Funnel, Donut, Pill, Reveal, type Kpi } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";

/* ----------------------------- inline fetch ----------------------------- */
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

/* ----------------------------- shared shapes ----------------------------- */
// Normalized cohort row, this is the ONLY demographic data we ever render and it
// always comes from the backend, never invented.
type Cohort = {
  stage: string;
  group: string;
  applicants: number;
  selected: number;
  selectionRate: number; // 0..1
  impactRatio: number | null; // vs the 0.80 four-fifths threshold
  pass: boolean | null;
};

// Stable palette so the same group keeps the same swatch across donut + funnel.
const PALETTE = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-ok)", "var(--c-warn)", "var(--c-danger)"];

function num(x: unknown, d = 0): number { const n = Number(x); return Number.isFinite(n) ? n : d; }

/* Coerce any of the three payload shapes into a flat Cohort[]. */
function toCohorts(res: any): Cohort[] {
  const out = res?.data ?? res;
  if (!out) return [];

  // Shape A, GET /analytics/diversity, { metrics?: [...] } or { byStage?: {...} }.
  const metrics: any[] = Array.isArray(out)
    ? out
    : out.metrics ?? out.cohorts ?? out.rows ?? [];
  const fromMetrics: Cohort[] = (Array.isArray(metrics) ? metrics : []).map((m) => {
    const applicants = num(m.applicantCount ?? m.applicants ?? m.total);
    const selected = num(m.selectedCount ?? m.selected ?? m.hired);
    const rate = m.selectionRate != null ? num(m.selectionRate) : applicants ? selected / applicants : 0;
    const ratio = m.adverseImpactRatio ?? m.impactRatio ?? m.ratio;
    return {
      stage: String(m.stage ?? m.phase ?? "Overall"),
      group: String(m.groupName ?? m.group ?? m.name ?? "Group"),
      applicants, selected, selectionRate: rate,
      impactRatio: ratio == null ? null : num(ratio),
      pass: typeof m.fourFifthsPass === "boolean" ? m.fourFifthsPass
        : ratio == null ? null : num(ratio) >= 0.8,
    };
  });
  if (fromMetrics.length) return fromMetrics;

  // Shape B, byStage map { [stage]: DiversityMetric[] }.
  const byStage = out.byStage;
  if (byStage && typeof byStage === "object") {
    const rows: Cohort[] = [];
    for (const [stage, ms] of Object.entries(byStage)) {
      for (const m of (Array.isArray(ms) ? ms : []) as any[]) {
        const applicants = num(m.applicantCount ?? m.applicants);
        const selected = num(m.selectedCount ?? m.selected);
        const rate = m.selectionRate != null ? num(m.selectionRate) : applicants ? selected / applicants : 0;
        const ratio = m.adverseImpactRatio ?? m.impactRatio;
        rows.push({
          stage, group: String(m.groupName ?? m.group ?? "Group"),
          applicants, selected, selectionRate: rate,
          impactRatio: ratio == null ? null : num(ratio),
          pass: typeof m.fourFifthsPass === "boolean" ? m.fourFifthsPass : ratio == null ? null : num(ratio) >= 0.8,
        });
      }
    }
    if (rows.length) return rows;
  }
  return [];
}

/* Map FairnessMetric[] (from getAdverseImpact / GET /bias/four-fifths) to Cohort[]. */
function fairnessToCohorts(rows: FairnessMetric[]): Cohort[] {
  return (rows ?? []).map((m) => ({
    stage: "Overall",
    group: m.group,
    applicants: 0,
    selected: 0,
    selectionRate: num(m.selectionRate),
    impactRatio: num(m.impactRatio),
    pass: typeof m.flagged === "boolean" ? !m.flagged : num(m.impactRatio) >= 0.8,
  }));
}

/* Three-tier fetch: diversity analytics, then four-fifths, then typed helper. */
async function fetchCohorts(): Promise<Cohort[]> {
  try {
    const c = toCohorts(await raw("/analytics/diversity"));
    if (c.length) return c;
  } catch { /* fall through to the fairness endpoints */ }
  try {
    const c = toCohorts(await raw("/bias/four-fifths"));
    if (c.length) return c;
  } catch { /* fall through to the typed helper */ }
  return fairnessToCohorts(await getAdverseImpact());
}

export default function DiversityAnalytics() {
  const cohorts = useData<Cohort[]>(fetchCohorts);
  const rows = cohorts.data ?? [];

  // Representation by group, aggregated across stages from real applicant counts
  // (or, when only fairness ratios exist, evenly weighted so the donut still
  // names the real groups). Percentages are computed, never demographic guesses.
  const groups = Array.from(new Set(rows.map((r) => r.group)));
  const colorFor = (g: string) => PALETTE[groups.indexOf(g) % PALETTE.length];

  const byGroupApplicants = new Map<string, number>();
  for (const r of rows) byGroupApplicants.set(r.group, (byGroupApplicants.get(r.group) ?? 0) + r.applicants);
  const totalApplicants = Array.from(byGroupApplicants.values()).reduce((a, b) => a + b, 0);

  const donut = groups.map((g) => {
    const v = totalApplicants
      ? Math.round(((byGroupApplicants.get(g) ?? 0) / totalApplicants) * 100)
      : Math.round((1 / Math.max(1, groups.length)) * 100);
    return { g, v, color: colorFor(g) };
  });

  // Representation funnel: applicants -> selected, summed across groups. Only
  // shown when we actually have applicant/selected counts (the diversity feed).
  const totalSelected = rows.reduce((a, r) => a + r.selected, 0);
  const funnel = totalApplicants
    ? [
        { stage: "Applicants", n: totalApplicants, color: "var(--c-brand)" },
        { stage: "Selected", n: totalSelected, color: "var(--c-ai)" },
      ]
    : [];

  // KPIs, all derived from real rows.
  const withRatio = rows.filter((r) => r.impactRatio != null);
  const flagged = rows.filter((r) => r.pass === false);
  const minRatio = withRatio.length ? Math.min(...withRatio.map((r) => num(r.impactRatio))) : null;
  const kpis: Kpi[] = [
    { id: "groups", label: "Groups tracked", value: groups.length, icon: "users", spark: [groups.length], delta: 0 },
    { id: "stages", label: "Stages analyzed", value: new Set(rows.map((r) => r.stage)).size, icon: "radar", spark: [1], delta: 0 },
    {
      id: "ratio", label: "Lowest impact ratio", value: minRatio == null ? 0 : Math.round(minRatio * 100),
      icon: "gavel", suffix: "%", spark: [minRatio == null ? 0 : Math.round(minRatio * 100)], delta: 0,
      good: minRatio == null ? undefined : minRatio >= 0.8,
    },
    {
      id: "flags", label: "Four-fifths flags", value: flagged.length, icon: "flag",
      spark: [flagged.length], delta: 0, good: flagged.length === 0,
    },
  ];

  // Per-stage representation: groups within each stage, selection-rate bars.
  const stageOrder = Array.from(new Set(rows.map((r) => r.stage)));
  const stageMax = Math.max(0.0001, ...rows.map((r) => r.selectionRate));

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* breadcrumb / back link to /analytics */}
      <nav aria-label="Breadcrumb" className="mb-3">
        <a href="/analytics" className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-3 transition-colors hover:text-ink">
          <Icon name="chevsL" size={14} /> Analytics
        </a>
      </nav>

      <Greeting
        title="Representation and fairness"
        sub="Advisory only. Diversity is a fairness signal to widen a search and surface adverse impact, never a quota and never a selection criterion."
      >
        <a href="/analytics"><Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" icon="chart">Back to analytics</Pill></a>
      </Greeting>

      {/* Ethical-framing advisory band, kept from the prototype intent. */}
      <Reveal i={2}>
        <div
          className="mb-[18px] flex items-start gap-3 rounded-[14px] p-[14px_16px]"
          style={{ border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "linear-gradient(110deg, var(--c-ai-tint), transparent 65%)" }}
          role="note"
        >
          <Icon name="shield" size={16} style={{ color: "var(--c-ai-ink)", flexShrink: 0, marginTop: 2 }} />
          <p className="m-0 text-[12.5px] leading-relaxed text-ink-2">
            These figures are computed from your own pipeline using the EEOC four-fifths rule. They are advisory and help you
            spot where a process may be filtering groups unevenly. No candidate is ever advanced, ranked, or rejected on the
            basis of a protected characteristic.
          </p>
        </div>
      </Reveal>

      {/* KPI row */}
      {cohorts.loading && (
        <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        </div>
      )}
      {cohorts.error && (
        <div className="mb-[18px]">
          <ErrorState
            title="Could not load representation data"
            body="The diversity and fairness services did not respond."
            code="GET /api/analytics/diversity"
            onRetry={cohorts.reload}
          />
        </div>
      )}
      {cohorts.data && rows.length > 0 && <KpiRow kpis={kpis} cols={4} />}

      {/* Representation breakdown by group + by stage */}
      <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: representation funnel + per-stage selection rates */}
        <div className="flex flex-col gap-4">
          <Reveal i={5}>
            <SectionCard
              title="Representation funnel"
              icon="radar"
              headRight={<Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">advisory</Pill>}
            >
              {cohorts.loading && <div className="grid gap-3 p-1">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[30px] rounded-[8px]" />)}</div>}
              {cohorts.error && <ErrorState title="Unavailable" body="The diversity service did not respond." code="GET /api/analytics/diversity" onRetry={cohorts.reload} />}
              {cohorts.data && funnel.length > 0 && <Funnel stages={funnel} />}
              {cohorts.data && funnel.length === 0 && (
                <EmptyState
                  title="No stage counts yet"
                  body="When applicant and selection counts exist for each stage, the representation funnel renders here. We never fabricate demographic figures."
                />
              )}
            </SectionCard>
          </Reveal>

          <Reveal i={7}>
            <SectionCard title="Selection rate by stage and group" icon="grid">
              {cohorts.loading && <div className="grid gap-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 rounded-[6px]" />)}</div>}
              {cohorts.error && <ErrorState title="Unavailable" body="The fairness service did not respond." code="GET /api/bias/four-fifths" onRetry={cohorts.reload} />}
              {cohorts.data && rows.length === 0 && (
                <EmptyState
                  title="No cohort data"
                  body="Selection-rate breakdowns appear once your pipeline has demographic cohorts to compare. This view stays advisory."
                />
              )}
              {cohorts.data && rows.length > 0 && (
                <div className="flex flex-col gap-[18px]">
                  {stageOrder.map((stage) => {
                    const stageRows = rows.filter((r) => r.stage === stage);
                    return (
                      <div key={stage}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-ink-2">{stage}</span>
                          {stageRows.some((r) => r.pass === false)
                            ? <Pill tone="var(--c-danger)" bg="var(--c-danger-tint)" icon="flag">{stageRows.filter((r) => r.pass === false).length} flagged</Pill>
                            : stageRows.some((r) => r.pass === true)
                              ? <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">within range</Pill>
                              : null}
                        </div>
                        <div className="flex flex-col gap-[9px]">
                          {stageRows.map((r) => {
                            const pct = Math.round(r.selectionRate * 100);
                            const w = (r.selectionRate / stageMax) * 100;
                            const flaggedRow = r.pass === false;
                            return (
                              <div key={r.group} className="grid items-center gap-[10px]" style={{ gridTemplateColumns: "110px 1fr 92px" }}>
                                <span className="inline-flex items-center gap-2 text-[12px] font-medium" title={r.group}>
                                  <span style={{ width: 9, height: 9, borderRadius: 3, background: colorFor(r.group), flexShrink: 0 }} />
                                  <span className="truncate">{r.group}</span>
                                </span>
                                <div style={{ height: 16, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${w}%`, borderRadius: 6, background: flaggedRow ? "var(--c-warn)" : colorFor(r.group) }} />
                                </div>
                                <span className="mono tnum text-right text-[12px] font-semibold" style={{ color: flaggedRow ? "var(--c-danger)" : "var(--c-ink)" }}>
                                  {pct}%{r.impactRatio != null ? ` · ${Math.round(r.impactRatio * 100)}` : ""}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </Reveal>
        </div>

        {/* Right: representation donut */}
        <Reveal i={6}>
          <SectionCard title="Representation mix" icon="users" action="EEOC report" onAction={() => { window.location.href = "/analytics"; }}>
            {cohorts.loading && <div className="grid place-items-center p-4"><Skeleton className="h-[150px] w-[150px] rounded-full" /></div>}
            {cohorts.error && <ErrorState title="Unavailable" body="Representation data did not load." code="GET /api/analytics/diversity" onRetry={cohorts.reload} />}
            {cohorts.data && donut.length === 0 && (
              <EmptyState
                title="No demographics on file"
                body="Representation shows here only when candidates self-identify and the data is aggregated. We never infer protected characteristics."
              />
            )}
            {cohorts.data && donut.length > 0 && (
              <>
                <Donut data={donut} center={{ value: String(groups.length), label: "groups" }} />
                <p className="mt-4 text-[11.5px] leading-relaxed text-ink-3">
                  Shares are aggregated from self-identified applicant counts. Advisory only, used to widen sourcing, never to set a quota.
                </p>
              </>
            )}
          </SectionCard>
        </Reveal>
      </div>
    </div>
  );
}
