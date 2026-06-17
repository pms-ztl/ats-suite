"use client";
// app/(dashboard)/page.tsx - EXACT Claude Design "Aurora" role dashboards
// (claude-design/dash-views.jsx): the recruiter, hiring-manager, and interviewer
// home screens. Role-dispatched. Admins / compliance / super-admins land on the
// org-overview command center (untouched). The recruiter/HM/interviewer surfaces
// are verbatim ports of dash-views.jsx, wired to the real gateway via useData.
import { Greeting, KpiRow, SectionCard, ScoreRing, StatusBadge, Btn, Pill, Reveal } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { OrgOverviewLive } from "@/components/cd/org-overview-live";
import { EmptyChart, DonutChart, BarsChart, SankeyFlow, CHART_COLORS, colorAt } from "@/components/shared/charts";
import { FlowRibbon, ArcMeter, OrbitField, PulseGrid, BeadStream, SonarSweep, TideBands, StepCascade } from "@/components/shared/ribbon";
import { ActivityRings } from "@/components/shared/ribbon-ext";
import {
  getDashboardKpis, listScreening, listRequisitions, listReviewQueue, listInterviews, listCandidates,
  listOffers, getSourceOfHire, getFunnel, prettySource, weeklyCounts, type DashKpi, type SourceStat,
} from "@/lib/api";
import type { ScreeningVerdict, Requisition, ReviewItem, Interview, ScreeningResult, Candidate, ApplicationStage, Offer } from "@/lib/types";

// Role-dispatched home (matches the design's DashboardHome): admins / compliance /
// super-admins land on the org-overview command center; recruiters, hiring
// managers, and interviewers get the focused dash-views.jsx working homes below.
const ORG_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"];

export default function DashboardHome() {
  const { user } = useCurrentUser();
  if (ORG_ROLES.includes(user?.role ?? "")) return <OrgOverviewLive />;
  return <RoleHome />;
}

/* -------------------- shared helpers (status -> kit kind/band) -------------------- */
const dStICon = (s: "pass" | "review" | "fail") => (s === "pass" ? "check" : s === "review" ? "eye" : "x");
const dStCol = (s: "pass" | "review" | "fail") => (s === "pass" ? "var(--c-ok)" : s === "review" ? "var(--c-warn)" : "var(--c-danger)");
const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}
function untilRel(hours: number): string {
  if (hours < 1) return "<1h";
  return hours < 24 ? `${Math.round(hours)}h` : `${Math.round(hours / 24)}d`;
}
/* Upcoming interviews within `windowH` hours as radar blips: each blip's
   distance from the center is the REAL time until Interview.startsAt
   (0 = now, 1 = the window edge). No positions are invented. */
function radarBlips(rows: Interview[] | undefined, windowH: number): { label: string; at: number; sub: string }[] {
  const now = Date.now();
  return (rows ?? [])
    .filter((iv) => iv.status !== "CANCELLED")
    .map((iv) => ({ iv, h: iv.startsAt ? (new Date(iv.startsAt).getTime() - now) / 3600000 : NaN }))
    .filter(({ h }) => isFinite(h) && h > 0 && h <= windowH)
    .sort((x, y) => x.h - y.h)
    .slice(0, 12)
    .map(({ iv, h }) => ({
      label: iv.candidateId || iv.round || "Interview",
      at: Math.max(0, Math.min(1, h / windowH)),
      sub: untilRel(h),
    }));
}
function greetingFor(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}
function firstName(user: { name?: string } | null | undefined): string {
  return (user?.name || "there").split(" ")[0];
}

/* Real per-requisition pipeline: group THIS requisition's loaded candidates by stage
   into the 4 funnel buckets the Aurora rows show. No fabricated ratios — every count
   traces to a real Candidate.stage from GET /api/candidates. Returns null when no
   candidate data is available client-side (endpoint empty/errored) so callers can
   fall back to an honest EmptyChart instead of inventing numbers. */
const FUNNEL_BUCKETS: { label: string; stages: ApplicationStage[]; color: string }[] = [
  { label: "Applied", stages: ["APPLIED"], color: "var(--c-ink-3)" },
  { label: "Screen", stages: ["SCREENED", "PHONE_SCREEN", "ASSESSMENT"], color: "var(--c-info)" },
  { label: "Interview", stages: ["INTERVIEW", "FINAL_REVIEW"], color: "var(--c-ai)" },
  { label: "Offer", stages: ["OFFER", "HIRED"], color: "var(--c-brand)" },
];
// Canonical forward order of the pipeline for the hero ribbon (terminal
// REJECTED / WITHDRAWN states are not part of the forward flow).
const STAGE_FLOW: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];

function reqFunnel(reqId: string | undefined, candidates: Candidate[] | undefined): { label: string; n: number; color: string }[] | null {
  if (!reqId || !candidates) return null;
  const mine = candidates.filter((c) => c.requisitionId === reqId);
  if (mine.length === 0) return null;
  return FUNNEL_BUCKETS.map((b) => ({
    label: b.label,
    n: mine.filter((c) => b.stages.includes(c.stage)).length,
    color: b.color,
  }));
}

// Reusable KPI strip with the three data states inside the row's container.
function KpiStrip({ kpis }: { kpis: ReturnType<typeof useData<DashKpi[]>> }) {
  return (
    <>
      {kpis.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {kpis.error && <div className="mb-[18px]"><ErrorState title="Could not load metrics" body="The overview service did not respond." code="GET /api/platform/unified-overview" onRetry={kpis.reload} /></div>}
      {kpis.data && kpis.data.length > 0 && <KpiRow kpis={kpis.data} cols={4} />}
      {kpis.data && kpis.data.length === 0 && <div className="mb-[18px]"><EmptyState title="No metrics yet" body="Your KPIs appear once requisitions, candidates, and agent runs are flowing." /></div>}
    </>
  );
}

/* -------------------- role dispatcher (replaces the old single RoleHome) -------------------- */
function RoleHome() {
  const { user } = useCurrentUser();
  const role = user?.role || "RECRUITER";
  if (role === "HIRING_MANAGER") return <HMDash />;
  if (role === "INTERVIEWER") return <InterviewerDash />;
  return <RecruiterDash />;
}

/* ---------------- Recruiter ---------------- */
function RecruiterDash() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const screening = useData<ScreeningVerdict[]>(listScreening);
  const reqs = useData<Requisition[]>(listRequisitions);
  const interviews = useData<Interview[]>(listInterviews);
  const candidates = useData<Candidate[]>(() => listCandidates());
  const sources = useData<SourceStat[]>(getSourceOfHire);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);

  const applications = (screening.data ?? []).slice(0, 5);
  const myReqs = (reqs.data ?? []).slice(0, 3);
  const scheduling = (interviews.data ?? []).filter((iv) => iv.status === "SCHEDULED" || iv.status === "RESCHEDULED").slice(0, 3);

  // Weekly inflow from the candidate's real arrival timestamp (appliedAt, which the
  // mapper falls back to createdAt) + live department mix (Requisition.department).
  const inflow = (() => {
    const weeks = weeklyCounts((candidates.data ?? []).map((c: any) => c.appliedAt || c.createdAt), 8);
    return { weeks, total: weeks.reduce((s, w) => s + w.n, 0) };
  })();
  const deptMix = (() => {
    const by = new Map<string, number>();
    for (const r of reqs.data ?? []) {
      // The backend enum also carries INTERVIEWING, which the frontend union lacks.
      const st = String(r.status ?? "OPEN");
      if (st !== "OPEN" && st !== "INTERVIEWING") continue;
      const d = r.department || "Other";
      by.set(d, (by.get(d) ?? 0) + 1);
    }
    return Array.from(by, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  })();

  // Source -> stage-bucket links: every link value is a count of real candidates
  // (Candidate.source x Candidate.stage). No transitions are inferred.
  const sourceFlow = (() => {
    const links: { from: string; to: string; value: number }[] = [];
    const cands = candidates.data ?? [];
    if (!cands.length) return links;
    for (const b of FUNNEL_BUCKETS) {
      const inBucket = cands.filter((c) => b.stages.includes(c.stage));
      const bySource = new Map<string, number>();
      for (const c of inBucket) {
        const src = prettySource(String((c as any).source || "Direct"));
        bySource.set(src, (bySource.get(src) ?? 0) + 1);
      }
      for (const [src, n] of bySource) links.push({ from: src, to: b.label, value: n });
    }
    return links;
  })();

  // Hero ribbon: the live pipeline as one stream. Each point's thickness is the
  // real candidate count per stage from the same funnel aggregate the cascade reads,
  // ordered by the canonical forward flow and humanized (APPLIED -> Applied).
  const pipelinePoints = (funnel.data ?? [])
    .filter((s) => STAGE_FLOW.includes(s.stage))
    .sort((a, b) => STAGE_FLOW.indexOf(a.stage) - STAGE_FLOW.indexOf(b.stage))
    .map((s) => ({
      label: s.stage.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      n: s.count,
    }));

  return (
    // No bespoke cap: the shared .cd-page (from cd-shell) governs width + gutter + centering.
    <div>
      <Greeting title={`${greetingFor()}, ${firstName(user)}`}
        sub={`${(screening.data ?? []).length} screened application${(screening.data ?? []).length === 1 ? "" : "s"} and ${scheduling.length} candidate${scheduling.length === 1 ? "" : "s"} waiting to be scheduled.`}>
        <a href="/candidates/import"><Btn variant="soft" icon="users">Bulk upload</Btn></a>
        <a href="/sourcing"><Btn variant="ai" icon="radar">Source candidates</Btn></a>
      </Greeting>
      <KpiStrip kpis={kpis} />

      {/* Hero: the whole pipeline as one flowing stream - thickness at each
          stage is the live candidate count (same data as the funnel below). */}
      <div style={{ marginBottom: 16 }}>
        <Reveal i={3}><SectionCard title="Pipeline flow" icon="chart"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>ribbon thickness = live candidates per stage</Pill>}>
          {funnel.loading && <Skeleton className="h-[220px] rounded-[11px]" />}
          {funnel.error && <div style={{ height: 160 }}><EmptyChart label="Pipeline data unavailable right now." /></div>}
          {funnel.data && (
            <FlowRibbon points={pipelinePoints} valueLabel={(n) => n.toLocaleString()}
              emptyLabel="The pipeline flow appears as applications move through stages." />
          )}
        </SectionCard></Reveal>
      </div>

      <div className="cd-grid-cards">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={4}><SectionCard title="Latest applications" icon="users" action="View all" onAction={() => { window.location.href = "/candidates"; }} pad={6}>
            {screening.loading && <div className="grid gap-2 p-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}</div>}
            {screening.error && <ErrorState title="Could not load applications" body="The screening service did not respond." code="GET /api/screening" onRetry={screening.reload} />}
            {screening.data && applications.length === 0 && <EmptyState title="No applications yet" body="When candidates apply, the screener triages them here." />}
            {screening.data && applications.map((a, i) => {
              const st = KIND[a.result];
              return (
                <a key={a.id ?? i} href="/screening" style={{ display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 12, alignItems: "center", padding: "9px 12px", borderRadius: "var(--r)", transition: "background var(--t-fast)", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-2)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <ScoreRing value={a.score} size={40} band={dStCol(st)} label="" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.candidateId}</div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{a.agent}</div>
                  </div>
                  <StatusBadge kind={st} />
                  <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", width: 32, textAlign: "right" }}>{ago(a.createdAt)}</span>
                </a>
              );
            })}
          </SectionCard></Reveal>

          <Reveal i={6}><SectionCard title="My requisitions" icon="briefcase" action="Manage" onAction={() => { window.location.href = "/requisitions"; }}>
            {reqs.loading && <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-[11px]" />)}</div>}
            {reqs.error && <ErrorState title="Could not load requisitions" body="The requisitions service did not respond." code="GET /api/requisitions" onRetry={reqs.reload} />}
            {reqs.data && myReqs.length === 0 && <EmptyState title="No open requisitions" body="Create your first role; the jd-author agent can draft it." actions={<a href="/requisitions/new"><Btn variant="ai" icon="sparkles">Create with AI</Btn></a>} />}
            {reqs.data && myReqs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {myReqs.map((r, i) => {
                  // Real per-stage breakdown for THIS req from loaded candidates (no fabricated ratios).
                  const buckets = reqFunnel(r.id, candidates.data);
                  const totalInBuckets = buckets ? buckets.reduce((s, b) => s + b.n, 0) : 0;
                  return (
                    <div key={r.id ?? i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 60px", gap: 14, alignItems: "center" }}>
                      <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{r.department}</div></div>
                      {buckets && totalInBuckets > 0 ? (
                        <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                          {buckets.map((b, j) => b.n > 0 ? <div key={j} title={`${b.label}: ${b.n}`} style={{ width: ((b.n / totalInBuckets) * 100) + "%", background: b.color, animation: "growx .9s var(--ease-out) both", animationDelay: (j * 100) + "ms" }} /> : null)}
                        </div>
                      ) : (
                        <div style={{ height: 8, borderRadius: 99, background: "var(--c-surface-2)" }} title="No staged candidates yet" />
                      )}
                      <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{r.candidateCount ?? 0}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard></Reveal>
        </div>

        <Reveal i={5}><SectionCard title="Scheduling queue" icon="calendar" action="Open calendar" onAction={() => { window.location.href = "/interviews"; }}>
          {interviews.loading && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[11px]" />)}</div>}
          {interviews.error && <ErrorState title="Could not load scheduling" body="The interviews service did not respond." code="GET /api/interviews" onRetry={interviews.reload} />}
          {interviews.data && scheduling.length === 0 && <EmptyState title="Nothing to schedule" body="Candidates that need an interview slot show up here." />}
          {interviews.data && scheduling.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scheduling.map((s, i) => {
                const urgent = i === 0;
                return (
                  <div key={s.id ?? i} style={{ padding: "12px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: urgent ? "var(--c-warn-tint)" : "var(--c-surface)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{s.candidateId || "Candidate"}</span>
                      {urgent && <Pill tone="var(--c-warn)" bg="transparent" icon="clock">urgent</Pill>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 9 }}>{s.round}</div>
                    <Btn variant="soft" size="sm" icon="calendar" style={{ width: "100%", justifyContent: "center" }}>Schedule</Btn>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard></Reveal>
      </div>

      {/* Hiring pipeline: the live stage distribution as an honest cascade, each stage
          counting every candidate at-or-beyond it. The per-channel application mix lives
          in the Channel orbit below, so it is not duplicated here. */}
      <div style={{ marginTop: 16 }}>
        <Reveal i={8}><SectionCard title="Hiring pipeline" icon="chart"
          headRight={funnel.data && funnel.data.length ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{funnel.data.length} stages</Pill> : undefined}>
          <div style={{ height: 260 }}>
            {funnel.loading && <Skeleton className="h-full rounded-[11px]" />}
            {funnel.error && <EmptyChart label="Pipeline data unavailable right now." />}
            {funnel.data && (funnel.data.length
              ? <StepCascade height={260} stages={funnel.data.map((s) => ({
                  label: s.stage.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
                  n: s.count,
                }))} valueLabel={(n) => n.toLocaleString()}
                emptyLabel="The funnel fills as applications move through stages." />
              : <EmptyChart label="The funnel fills as applications move through stages." />)}
          </div>
        </SectionCard></Reveal>
      </div>

      {/* Source-to-stage flow: each ribbon is the count of real candidates from that
          channel currently sitting in that stage bucket (Candidate.source x stage). */}
      {sourceFlow.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Reveal i={9}><SectionCard title="Source-to-stage flow" icon="radar"
            headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">live candidates</Pill>}>
            <div style={{ height: Math.max(260, sourceFlow.reduce((s: Set<string>, l) => s.add(l.from), new Set<string>()).size * 40) }}>
              <SankeyFlow links={sourceFlow} valueFormatter={(v) => `${v} candidate${v === 1 ? "" : "s"}`}
                nodeColor={(name, i) => (FUNNEL_BUCKETS.some((b) => b.label === name) ? FUNNEL_BUCKETS.find((b) => b.label === name)!.color : colorAt(i))} />
            </div>
          </SectionCard></Reveal>
        </div>
      )}

      {/* Momentum row: candidate inflow per week (Candidate.createdAt), the live
          requisition mix by department, and the channel orbit (applications per
          Candidate.source) - all straight counts of real rows. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
        <Reveal i={10}><SectionCard title="Candidate inflow" icon="users"
          headRight={inflow.total ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{inflow.total} in 8 weeks</Pill> : undefined}>
          <div style={{ height: 200 }}>
            {candidates.loading && <Skeleton className="h-full rounded-[11px]" />}
            {candidates.error && <EmptyChart label="Candidate data unavailable right now." />}
            {candidates.data && (
              <PulseGrid cells={inflow.weeks} height={200}
                emptyLabel="Weekly inflow appears as candidates arrive." />
            )}
          </div>
        </SectionCard></Reveal>

        <Reveal i={11}><SectionCard title="Open roles by department" icon="briefcase">
          <div style={{ height: 200 }}>
            {reqs.loading && <Skeleton className="h-full rounded-[11px]" />}
            {reqs.error && <EmptyChart label="Requisition data unavailable right now." />}
            {reqs.data && (deptMix.length
              ? <DonutChart data={deptMix} centerLabel={String(deptMix.reduce((s, d) => s + d.value, 0))} centerSub="open roles"
                  valueFormatter={(v) => `${v} role${Number(v) === 1 ? "" : "s"}`} />
              : <EmptyChart label="Departments appear as requisitions open." />)}
          </div>
        </SectionCard></Reveal>

        <Reveal i={12}><SectionCard title="Channel orbit" icon="radar">
          {sources.loading && <Skeleton className="h-[200px] rounded-[11px]" />}
          {sources.error && <div style={{ height: 200 }}><EmptyChart label="Channel data unavailable right now." /></div>}
          {sources.data && (
            <OrbitField items={sources.data.map((s) => ({ label: s.source, n: s.applied }))}
              centerSub="applications" height={200}
              emptyLabel="Channels appear here once applications arrive with a source." />
          )}
        </SectionCard></Reveal>
      </div>

      {/* Interview radar: every blip is a real upcoming interview (Interview.startsAt) -
          its distance from the center is the actual time until it starts. */}
      <div style={{ marginTop: 16 }}>
        <Reveal i={13}><SectionCard title="Interview radar" icon="radar"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>blip distance = time until interview</Pill>}>
          {interviews.loading && <Skeleton className="h-[340px] rounded-[11px]" />}
          {interviews.error && <div style={{ height: 300 }}><EmptyChart label="Interview data unavailable right now." /></div>}
          {interviews.data && (
            <SonarSweep items={radarBlips(interviews.data, 14 * 24)}
              centerSub="next 14 days" rangeLabel="outer ring = 14 days out"
              emptyLabel="The radar lights up as interviews are booked in the next 14 days." />
          )}
        </SectionCard></Reveal>
      </div>
    </div>
  );
}

/* ---------------- Hiring manager ---------------- */
// Bead color per humanized Offer.status (DRAFT -> ACCEPTED lifecycle).
const OFFER_BEAD_COLOR: Record<string, string> = {
  Accepted: "var(--c-ok)",
  Declined: "var(--c-danger)", Expired: "var(--c-danger)",
  Sent: "var(--c-ai)", Approved: "var(--c-info)",
  Draft: "var(--c-ink-3)", "Pending approval": "var(--c-warn)",
};

function HMDash() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const review = useData<ReviewItem[]>(listReviewQueue);
  const reqs = useData<Requisition[]>(listRequisitions);
  const candidates = useData<Candidate[]>(() => listCandidates());
  const screening = useData<ScreeningVerdict[]>(listScreening);
  const offers = useData<Offer[]>(listOffers);
  const interviews = useData<Interview[]>(listInterviews);

  // Real verdict mix from the screener's PASS/REVIEW/FAIL results.
  const verdictMix = (() => {
    const rows = screening.data ?? [];
    const c = (r: ScreeningResult) => rows.filter((v) => v.result === r).length;
    const pass = c("PASS"), rev = c("REVIEW"), fail = c("FAIL");
    const total = pass + rev + fail;
    return { pass, rev, fail, total, passRate: total ? Math.round((pass / total) * 100) : 0 };
  })();
  // Real offer counts by status (DRAFT -> ACCEPTED lifecycle).
  const offerBars = (() => {
    const rows = offers.data ?? [];
    const order = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SENT", "ACCEPTED", "DECLINED", "EXPIRED"];
    return order
      .map((st) => ({ status: st.replace(/_/g, " ").toLowerCase().replace(/^\w/, (ch) => ch.toUpperCase()), n: rows.filter((o) => o.status === st).length }))
      .filter((r) => r.n > 0);
  })();
  // Decision timeliness: pending checkpoints still inside their SLA window vs overdue,
  // from the real slaDueAt timestamps.
  const slaStats = (() => {
    const rows = review.data ?? [];
    const now = Date.now();
    const overdue = rows.filter((r) => r.slaDueAt && new Date(r.slaDueAt).getTime() < now).length;
    const total = rows.length;
    return { total, overdue, onTimePct: total ? Math.round(((total - overdue) / total) * 100) : 100 };
  })();
  // Real offer-accept rate: accepted of the resolved-after-send pool (SENT counts as
  // still-pending). accepted / (sent + accepted + declined). null when nothing is out.
  const offerAccept = (() => {
    const rows = offers.data ?? [];
    const accepted = rows.filter((o) => o.status === "ACCEPTED").length;
    const sent = rows.filter((o) => o.status === "SENT").length;
    const declined = rows.filter((o) => o.status === "DECLINED").length;
    const denom = sent + accepted + declined;
    return { accepted, denom, pct: denom ? Math.round((accepted / denom) * 100) : null };
  })();
  // Real interview completion rate: COMPLETED of all non-cancelled interviews.
  // Distinct from the tide bands (weekly counts) - this is a single health rate.
  const interviewCompletion = (() => {
    const rows = (interviews.data ?? []).filter((iv) => iv.status !== "CANCELLED");
    const done = rows.filter((iv) => iv.status === "COMPLETED").length;
    return { done, total: rows.length, pct: rows.length ? Math.round((done / rows.length) * 100) : null };
  })();
  // Advertised salary bands for open roles (Requisition.salaryMin/Max, $k). The
  // transparent base series floats each bar to its real minimum.
  const salaryBands = (reqs.data ?? [])
    .map((r) => ({ role: r.title, min: Number((r as any).salaryMin), max: Number((r as any).salaryMax) }))
    .filter((r) => isFinite(r.min) && isFinite(r.max) && r.max > r.min)
    .sort((a, b) => b.max - a.max)
    .slice(0, 6)
    .map((r) => ({ role: r.role.length > 24 ? r.role.slice(0, 23) + "…" : r.role, base: Math.round(r.min / 1000), band: Math.round((r.max - r.min) / 1000), max: Math.round(r.max / 1000) }));

  // Interview tides: real Interview rows bucketed by startsAt into the last 6
  // ISO weeks (Monday start, local time) - a = everything booked into the week,
  // b = the rows that actually reached COMPLETED. Straight counts, no inference.
  const tideWeeks = (() => {
    const monday = new Date(); monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const rows = interviews.data ?? [];
    const weeks: { label: string; a: number; b: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(monday); start.setDate(start.getDate() - i * 7);
      const end = new Date(start); end.setDate(end.getDate() + 7);
      const inWeek = rows.filter((iv) => {
        if (!iv.startsAt) return false;
        const t = new Date(iv.startsAt).getTime();
        return t >= start.getTime() && t < end.getTime();
      });
      weeks.push({
        label: start.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        a: inWeek.length,
        b: inWeek.filter((iv) => iv.status === "COMPLETED").length,
      });
    }
    return weeks;
  })();

  const decisions = (review.data ?? []).slice(0, 4);
  const myReqs = (reqs.data ?? []).slice(0, 3);

  return (
    // No bespoke cap: the shared .cd-page (from cd-shell) governs width + gutter + centering.
    <div>
      <Greeting title={`${greetingFor()}, ${firstName(user)}`}
        sub={`${(review.data ?? []).length} decision${(review.data ?? []).length === 1 ? " is" : "s are"} waiting on you${slaStats.overdue > 0 ? `, ${slaStats.overdue} time-sensitive` : ""}.`}>
        <a href="/analytics"><Btn variant="soft" icon="chart">View analytics</Btn></a>
        <a href="/requisitions/new"><Btn variant="primary" icon="briefcase">New requisition</Btn></a>
      </Greeting>
      <KpiStrip kpis={kpis} />

      {/* Hero: the screener's verdict stream - each band's thickness is the
          real count of PASS / REVIEW / FAIL results (same rows as the donut). */}
      <div style={{ marginBottom: 16 }}>
        <Reveal i={3}><SectionCard title="Screening verdicts" icon="sparkles"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>ribbon thickness = verdicts per outcome</Pill>}>
          {screening.loading && <Skeleton className="h-[220px] rounded-[11px]" />}
          {screening.error && <div style={{ height: 160 }}><EmptyChart label="Screening data unavailable right now." /></div>}
          {screening.data && (
            <FlowRibbon
              points={[
                { label: "Pass", n: verdictMix.pass },
                { label: "Review", n: verdictMix.rev },
                { label: "Fail", n: verdictMix.fail },
              ]}
              gradient={["var(--c-ok, #16a34a)", "var(--c-warn, #f59e0b)", "var(--c-danger, #ef4444)"]}
              emptyLabel="Verdicts flow in once the screener has scored candidates." />
          )}
        </SectionCard></Reveal>
      </div>

      <div className="cd-grid-cards">
        <Reveal i={4}><SectionCard title="Decisions awaiting you" icon="gavel" action="View queue" onAction={() => { window.location.href = "/hitl"; }} pad={10}>
          {review.loading && <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[58px] rounded-[11px]" />)}</div>}
          {review.error && <ErrorState title="Could not load the queue" body="The HITL service did not respond." code="GET /api/agents/hitl" onRetry={review.reload} />}
          {review.data && decisions.length === 0 && <EmptyState title="You're all caught up" body="Nothing is waiting on a human right now. Nice work." />}
          {review.data && decisions.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {decisions.map((dec, i) => {
                const conf = dec.verdict?.confidence ?? 0.7;
                const tone: "ok" | "warn" = conf >= 0.7 ? "ok" : "warn";
                const rec = tone === "ok" ? "Hire" : "Human review";
                return (
                  <div key={dec.id ?? i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
                      background: tone === "ok" ? "var(--c-ok-tint)" : "var(--c-warn-tint)", color: tone === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}><Icon name="gavel" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{dec.verdict?.candidateId || dec.candidateId || "Candidate"}</span>
                        <Pill tone={tone === "ok" ? "var(--c-ok)" : "var(--c-warn)"} bg={tone === "ok" ? "var(--c-ok-tint)" : "var(--c-warn-tint)"}>{rec}</Pill>
                        <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" icon="sparkles" style={{ fontSize: 9.5 }}>AI</Pill>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 1 }}>{(dec.verdict?.agent || "Screening")} · confidence {conf.toFixed(2)}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{ago(dec.slaDueAt)}</span>
                    <a href={`/hitl/${dec.id}`}><Btn variant="primary" size="sm">Review</Btn></a>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard></Reveal>

        <Reveal i={5}><SectionCard title="My requisitions" icon="briefcase" action="All reqs" onAction={() => { window.location.href = "/requisitions"; }}>
          {reqs.loading && <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-[11px]" />)}</div>}
          {reqs.error && <ErrorState title="Could not load requisitions" body="The requisitions service did not respond." code="GET /api/requisitions" onRetry={reqs.reload} />}
          {reqs.data && myReqs.length === 0 && <EmptyState title="No open requisitions" body="Create your first role; the jd-author agent can draft it." actions={<a href="/requisitions/new"><Btn variant="ai" icon="sparkles">Create with AI</Btn></a>} />}
          {reqs.data && myReqs.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {myReqs.map((r, i) => {
                // Real per-stage funnel for THIS req from loaded candidates. The previous
                // total*0.32 / total*0.1 / total*0.025 ratios were fabricated and are gone.
                const buckets = reqFunnel(r.id, candidates.data);
                const max = buckets ? Math.max(1, ...buckets.map((b) => b.n)) : 1;
                const risk = r.status === "ON_HOLD" || r.status === "CANCELLED" ? "at-risk" : "on-track";
                const target = r.status;
                return (
                  <div key={r.id ?? i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</span>
                      <Pill tone={risk === "at-risk" ? "var(--c-danger)" : "var(--c-ok)"} bg={risk === "at-risk" ? "var(--c-danger-tint)" : "var(--c-ok-tint)"} icon={risk === "at-risk" ? "flag" : "check"}>{target}</Pill>
                    </div>
                    {buckets ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        {buckets.map((b, j) => (
                          <div key={j} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ height: 34, borderRadius: 7, background: "var(--c-surface-2)", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                              <div style={{ width: "100%", height: ((b.n / max) * 100) + "%", background: b.color, borderRadius: 7, animation: "growy 1s var(--ease-out) both", animationDelay: (j * 90) + "ms" }} />
                            </div>
                            <div className="mono tnum" style={{ fontSize: 11, fontWeight: 600, marginTop: 3 }}>{b.n}</div>
                            <div style={{ fontSize: 9, color: "var(--c-ink-3)" }}>{b.label}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ height: 56 }}><EmptyChart label="No staged candidates yet" /></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard></Reveal>
      </div>

      {/* Decision-quality row: the verdict mix is the screener's real PASS/REVIEW/FAIL
          split; the offer board is the live Offer.status lifecycle. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
        <Reveal i={6}><SectionCard title="AI screening quality" icon="sparkles"
          headRight={verdictMix.total ? <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)">{verdictMix.passRate}% pass</Pill> : undefined}>
          <div style={{ height: 220 }}>
            {screening.loading && <Skeleton className="h-full rounded-[11px]" />}
            {screening.error && <EmptyChart label="Screening data unavailable right now." />}
            {screening.data && (verdictMix.total
              ? <DonutChart
                  data={[
                    { name: "Pass", value: verdictMix.pass },
                    { name: "Review", value: verdictMix.rev },
                    { name: "Fail", value: verdictMix.fail },
                  ].filter((d) => d.value > 0)}
                  colors={[CHART_COLORS.ok, CHART_COLORS.warn, CHART_COLORS.danger]}
                  centerLabel={`${verdictMix.passRate}%`} centerSub="pass rate"
                  valueFormatter={(v) => `${v} verdict${Number(v) === 1 ? "" : "s"}`} />
              : <EmptyChart label="Verdicts appear once the screener has scored candidates." />)}
          </div>
        </SectionCard></Reveal>

        <Reveal i={7}><SectionCard title="Offer pipeline" icon="fileText" action="All offers" onAction={() => { window.location.href = "/offers"; }}>
          {offers.loading && <Skeleton className="h-[220px] rounded-[11px]" />}
          {offers.error && <div style={{ height: 220 }}><EmptyChart label="Offer data unavailable right now." /></div>}
          {offers.data && (
            <BeadStream groups={offerBars.map((r) => ({ label: r.status, n: r.n, color: OFFER_BEAD_COLOR[r.status] }))}
              height={220}
              emptyLabel="Offers appear here as they are drafted and sent." />
          )}
        </SectionCard></Reveal>
      </div>

      {/* Governance row: decision timeliness from real SLA timestamps, and the
          advertised salary band of each open role (Requisition.salaryMin/Max). */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
        <Reveal i={8}><SectionCard title="Decision timeliness" icon="clock"
          headRight={slaStats.overdue > 0 ? <Pill tone="var(--c-danger)" bg="var(--c-danger-tint)" icon="flag">{slaStats.overdue} overdue</Pill> : undefined}>
          {review.loading && <Skeleton className="h-[200px] rounded-[11px]" />}
          {review.error && <div style={{ height: 200 }}><EmptyChart label="Queue data unavailable right now." /></div>}
          {review.data && (
            <ArcMeter value={slaStats.total ? slaStats.onTimePct : null} label="on time"
              sub={slaStats.total ? `${slaStats.total - slaStats.overdue} of ${slaStats.total} inside SLA` : undefined}
              height={200}
              emptyLabel="Timeliness appears once decisions hit the queue." />
          )}
        </SectionCard></Reveal>

        <Reveal i={9}><SectionCard title="Salary bands · open roles" icon="chart"
          headRight={salaryBands.length ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">advertised range, ₹k</Pill> : undefined}>
          <div style={{ height: Math.max(200, salaryBands.length * 38) }}>
            {reqs.loading && <Skeleton className="h-full rounded-[11px]" />}
            {reqs.error && <EmptyChart label="Requisition data unavailable right now." />}
            {reqs.data && (salaryBands.length
              ? <BarsChart data={salaryBands} categoryKey="role" layout="horizontal"
                  series={[
                    { key: "base", name: "From", color: "transparent", stackId: "band" },
                    { key: "band", name: "Range", color: CHART_COLORS.ai, stackId: "band" },
                  ]}
                  valueFormatter={(v) => `₹${v}k`} />
              : <EmptyChart label="Bands appear for roles with a salary range." />)}
          </div>
        </SectionCard></Reveal>
      </div>

      {/* Hiring health: several real rates at once, each ring drawn only when its
          data is real (pass null otherwise so that ring self-empties). pass rate =
          screener PASS share, offer accept = accepted of resolved-after-send offers,
          interview completion = COMPLETED of non-cancelled interviews. Distinct from
          the ArcMeter (timeliness) and the verdict donut (distribution). */}
      <div style={{ marginTop: 16 }}>
        <Reveal i={10}><SectionCard title="Hiring health" icon="shield"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>each ring is a live rate</Pill>}>
          {(screening.loading || offers.loading || interviews.loading) && <Skeleton className="h-[250px] rounded-[11px]" />}
          {(screening.error && offers.error && interviews.error) && <div style={{ height: 250 }}><EmptyChart label="Health data unavailable right now." /></div>}
          {(screening.data || offers.data || interviews.data) && (
            <ActivityRings
              rings={[
                { label: "Pass rate", value: verdictMix.total ? verdictMix.passRate : null, max: 100, color: "var(--c-ok)" },
                { label: "Offer accept", value: offerAccept.pct, max: 100, color: "var(--c-brand)" },
                { label: "Interview completion", value: interviewCompletion.pct, max: 100, color: "var(--c-ai)" },
              ]}
              centerLabel={verdictMix.total ? `${verdictMix.passRate}%` : undefined}
              centerSub={verdictMix.total ? "pass rate" : undefined}
              height={250}
              emptyLabel="Rates appear once verdicts, offers, or interviews exist." />
          )}
        </SectionCard></Reveal>
      </div>

      {/* Interview tides: the last 6 ISO weeks of real Interview rows - everything
          booked into the week rises above the midline, completions fall below. */}
      <div style={{ marginTop: 16 }}>
        <Reveal i={11}><SectionCard title="Interview tides" icon="calendar"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>last 6 weeks · bucketed by start date</Pill>}>
          {interviews.loading && <Skeleton className="h-[250px] rounded-[11px]" />}
          {interviews.error && <div style={{ height: 200 }}><EmptyChart label="Interview data unavailable right now." /></div>}
          {interviews.data && (
            <TideBands points={tideWeeks} aLabel="Scheduled" bLabel="Completed"
              emptyLabel="The tides appear once interviews land on the calendar." />
          )}
        </SectionCard></Reveal>
      </div>
    </div>
  );
}

/* ---------------- Interviewer (calm) ---------------- */
function InterviewerDash() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const interviews = useData<Interview[]>(listInterviews);

  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
  const isToday = (iso?: string) => { if (!iso) return false; const t = new Date(iso).getTime(); return t >= startOfDay.getTime() && t <= endOfDay.getTime(); };
  const today = (interviews.data ?? []).filter((iv) => isToday(iv.startsAt)).slice(0, 3);
  const feedback = (interviews.data ?? []).filter((iv) => iv.status === "COMPLETED").slice(0, 2);

  const hhmm = (iso?: string) => { if (!iso) return "--:--"; const d = new Date(iso); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const modeLabel = (m: Interview["mode"]) => (m === "VIDEO" ? "Video" : m === "PHONE" ? "Phone" : "Onsite");

  // Real per-day interview load for the coming 7 days from Interview.startsAt;
  // hours are the summed real durations.
  const weekLoad = (() => {
    const days: { day: string; n: number; hours: number }[] = [];
    let total = 0, totalHours = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfDay); d.setDate(d.getDate() + i);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const inDay = (interviews.data ?? []).filter((iv) => {
        if (!iv.startsAt) return false;
        const t = new Date(iv.startsAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      });
      const hours = +(inDay.reduce((s, iv) => s + (iv.durationMins || 0), 0) / 60).toFixed(1);
      total += inDay.length; totalHours += hours;
      days.push({ day: i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }), n: inDay.length, hours });
    }
    return { days, total, totalHours: +totalHours.toFixed(1) };
  })();
  // Real status mix across this interviewer's visible interviews.
  const statusMix = (() => {
    const order: [Interview["status"], string, string][] = [
      ["SCHEDULED", "Scheduled", CHART_COLORS.info], ["CONFIRMED", "Confirmed", CHART_COLORS.brand],
      ["IN_PROGRESS", "In progress", CHART_COLORS.ai], ["COMPLETED", "Completed", CHART_COLORS.ok],
      ["RESCHEDULED", "Rescheduled", CHART_COLORS.warn], ["CANCELLED", "Cancelled", CHART_COLORS.ink3],
      ["NO_SHOW", "No-show", CHART_COLORS.danger],
    ];
    return order
      .map(([st, name, color]) => ({ name, color, value: (interviews.data ?? []).filter((iv) => iv.status === st).length }))
      .filter((d) => d.value > 0);
  })();

  return (
    // No bespoke cap: the shared .cd-page (from cd-shell) governs width + gutter + centering.
    <div>
      <Greeting title={`${greetingFor()}, ${firstName(user)}`}
        sub={`You have ${today.length} interview${today.length === 1 ? "" : "s"} today and ${feedback.length} scorecard${feedback.length === 1 ? "" : "s"} to write.`}>
        <a href="/interviews"><Btn variant="soft" icon="calendar">Full schedule</Btn></a>
      </Greeting>
      <KpiStrip kpis={kpis} />

      {/* Hero: the coming week as one stream - thickness per day is the real
          number of interviews (Interview.startsAt), sub = committed hours. */}
      <div style={{ marginBottom: 16 }}>
        <Reveal i={3}><SectionCard title="Your week's flow" icon="calendar"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>ribbon thickness = interviews per day</Pill>}>
          {interviews.loading && <Skeleton className="h-[180px] rounded-[11px]" />}
          {interviews.error && <div style={{ height: 150 }}><EmptyChart label="Interview data unavailable right now." /></div>}
          {interviews.data && (
            <FlowRibbon
              points={weekLoad.days.map((d) => ({ label: d.day, n: d.n, sub: d.hours ? `${d.hours}h` : undefined }))}
              showShare={false} height={200}
              emptyLabel="No interviews scheduled in the coming week." />
          )}
        </SectionCard></Reveal>
      </div>

      <div className="cd-grid-cards">
        <Reveal i={4}><SectionCard title="Today's interviews" icon="calendar">
          {interviews.loading && <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[66px] rounded-[14px]" />)}</div>}
          {interviews.error && <ErrorState title="Could not load interviews" body="The interviews service did not respond." code="GET /api/interviews" onRetry={interviews.reload} />}
          {interviews.data && today.length === 0 && <EmptyState title="Nothing scheduled today" body="Your interviews for today will appear here when they are booked." />}
          {interviews.data && today.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {today.map((t, i) => {
                const soon = i === 0;
                const mode = modeLabel(t.mode);
                const panel = t.panel?.length || 1;
                return (
                  <div key={t.id ?? i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)",
                    background: soon ? "linear-gradient(110deg, var(--c-brand-tint), transparent 70%)" : "var(--c-surface)" }}>
                    <div style={{ textAlign: "center", flexShrink: 0, width: 56 }}>
                      <div className="mono" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{hhmm(t.startsAt)}</div>
                      <div style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>{t.durationMins}m</div>
                    </div>
                    <div style={{ width: 1, height: 38, background: "var(--c-line)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{t.candidateId || "Candidate"}</div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{t.round} · {mode} · {panel} panelist{panel > 1 ? "s" : ""}</div>
                    </div>
                    <Pill tone="var(--c-ink-2)" icon={mode === "Video" ? "eye" : mode === "Phone" ? "clock" : "users"}>{mode}</Pill>
                    {soon ? <Btn variant="primary" size="sm" icon="enter">Join</Btn> : <Btn variant="soft" size="sm">Details</Btn>}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard></Reveal>

        <Reveal i={5}><SectionCard title="Feedback due from you" icon="fileText" action="History" onAction={() => { window.location.href = "/interviews"; }}>
          {interviews.loading && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[14px]" />)}</div>}
          {interviews.error && <ErrorState title="Could not load feedback" body="The interviews service did not respond." code="GET /api/interviews" onRetry={interviews.reload} />}
          {interviews.data && feedback.length === 0 && <EmptyState title="No scorecards due" body="When you finish an interview, the scorecard to write shows up here." />}
          {interviews.data && feedback.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {feedback.map((f, i) => {
                const overdue = i === feedback.length - 1 && feedback.length > 1;
                const when = ago(f.startsAt) ? `${ago(f.startsAt)} ago` : "Recently";
                return (
                  <div key={f.id ?? i} style={{ padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid", borderColor: overdue ? "color-mix(in oklab, var(--c-danger) 30%, var(--c-line))" : "var(--c-line)", background: overdue ? "var(--c-danger-tint)" : "var(--c-surface)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{f.candidateId || "Candidate"}</span>
                      <Pill tone={overdue ? "var(--c-danger)" : "var(--c-ink-3)"} bg="transparent" icon="clock">{overdue ? "overdue" : when}</Pill>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", margin: "2px 0 10px" }}>{f.round}</div>
                    <Btn variant={overdue ? "primary" : "soft"} size="sm" icon="fileText" style={{ width: "100%", justifyContent: "center" }}>Write scorecard</Btn>
                  </div>
                );
              })}
              <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: "var(--c-ink-3)" }}>You're all caught up after these. Nice work.</div>
            </div>
          )}
        </SectionCard></Reveal>
      </div>

      {/* Load forecast row: interviews-per-day and committed hours for the coming week
          (Interview.startsAt + real durations), plus the live status mix. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 16, alignItems: "start" }}>
        <Reveal i={6}><SectionCard title="Your next 7 days" icon="chart"
          headRight={weekLoad.total ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{weekLoad.total} scheduled</Pill> : undefined}>
          <div style={{ height: 190 }}>
            {interviews.loading && <Skeleton className="h-full rounded-[11px]" />}
            {interviews.error && <EmptyChart label="Interview data unavailable right now." />}
            {interviews.data && (
              <PulseGrid cells={weekLoad.days.map((d) => ({ label: d.day, n: d.n, sub: d.hours ? `${d.hours}h` : undefined }))}
                height={190}
                emptyLabel="No interviews scheduled in the coming week." />
            )}
          </div>
        </SectionCard></Reveal>

        <Reveal i={7}><SectionCard title="Hours in interviews" icon="clock"
          headRight={weekLoad.totalHours ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{weekLoad.totalHours}h this week</Pill> : undefined}>
          <div style={{ height: 190 }}>
            {interviews.loading && <Skeleton className="h-full rounded-[11px]" />}
            {interviews.error && <EmptyChart label="Interview data unavailable right now." />}
            {interviews.data && (weekLoad.totalHours
              ? <BarsChart data={weekLoad.days} categoryKey="day"
                  series={[{ key: "hours", name: "Hours", color: CHART_COLORS.brand }]}
                  valueFormatter={(v) => `${v}h`} />
              : <EmptyChart label="Committed hours appear with scheduled interviews." />)}
          </div>
        </SectionCard></Reveal>

        <Reveal i={8}><SectionCard title="Interview status mix" icon="listChecks">
          <div style={{ height: 190 }}>
            {interviews.loading && <Skeleton className="h-full rounded-[11px]" />}
            {interviews.error && <EmptyChart label="Interview data unavailable right now." />}
            {interviews.data && (statusMix.length
              ? <DonutChart data={statusMix} colors={statusMix.map((d) => d.color)}
                  centerLabel={String(statusMix.reduce((s, d) => s + d.value, 0))} centerSub="interviews"
                  valueFormatter={(v) => `${v} interview${Number(v) === 1 ? "" : "s"}`} />
              : <EmptyChart label="The mix appears once interviews exist." />)}
          </div>
        </SectionCard></Reveal>
      </div>

      {/* Your radar: each blip is one of your real upcoming interviews - its
          distance from the center is the actual time until it starts. */}
      <div style={{ marginTop: 16 }}>
        <Reveal i={9}><SectionCard title="Your radar" icon="radar"
          headRight={<Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>blip distance = time until start</Pill>}>
          {interviews.loading && <Skeleton className="h-[320px] rounded-[11px]" />}
          {interviews.error && <div style={{ height: 280 }}><EmptyChart label="Interview data unavailable right now." /></div>}
          {interviews.data && (
            <SonarSweep items={radarBlips(interviews.data, 7 * 24)}
              centerSub="next 7 days" rangeLabel="outer ring = 7 days out"
              emptyLabel="The radar lights up as interviews land on your schedule." />
          )}
        </SectionCard></Reveal>
      </div>
    </div>
  );
}
