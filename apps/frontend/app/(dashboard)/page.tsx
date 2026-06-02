"use client";
// app/(dashboard)/page.tsx - EXACT Claude Design "Aurora" dashboard home
// (claude-design/dash-views.jsx): time-aware Greeting + KPI row + a two-column
// working surface (latest applications with ScoreRing/StatusBadge, open
// requisitions, review queue). Role-aware. Wired to the real gateway.
import { Greeting, KpiRow, SectionCard, ScoreRing, StatusBadge, Btn, Pill, Reveal } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { OrgOverview } from "@/components/dashboards/org-overview";
import { getDashboardKpis, listScreening, listRequisitions, listReviewQueue, type DashKpi } from "@/lib/api";
import type { ScreeningVerdict, Requisition, ReviewItem, ScreeningResult } from "@/lib/types";

// Role-dispatched home (matches the design's DashboardHome): admins / compliance /
// super-admins land on the org-overview command center; recruiters, hiring
// managers, and interviewers get the focused working home below.
const ORG_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_OFFICER"];

export default function DashboardHome() {
  const { user } = useCurrentUser();
  if (ORG_ROLES.includes(user?.role ?? "")) return <OrgOverview />;
  return <RoleHome />;
}

const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<ScreeningResult, string> = { PASS: "var(--c-ok)", REVIEW: "var(--c-warn)", FAIL: "var(--c-danger)" };

function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

function RoleHome() {
  const { user } = useCurrentUser();
  const first = (user?.name || "there").split(" ")[0];
  const role = user?.role || "RECRUITER";
  const hour = new Date().getHours();
  const partOfDay = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const screening = useData<ScreeningVerdict[]>(listScreening);
  const reqs = useData<Requisition[]>(listRequisitions);
  const review = useData<ReviewItem[]>(listReviewQueue);

  const sub =
    role === "HIRING_MANAGER" ? `${review.data?.length ?? 0} decisions are waiting on you.`
    : role === "COMPLIANCE_OFFICER" ? "Fairness monitoring and audit trails are up to date."
    : `${screening.data?.length ?? 0} recent screenings and ${review.data?.length ?? 0} candidates awaiting review.`;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Greeting title={`${partOfDay}, ${first}`} sub={sub}>
        <a href="/sourcing"><Btn variant="ai" icon="radar">Source candidates</Btn></a>
        <a href="/requisitions/new"><Btn variant="primary" icon="briefcase">New requisition</Btn></a>
      </Greeting>

      {kpis.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {kpis.error && <div className="mb-[18px]"><ErrorState title="Could not load metrics" body="The overview service did not respond." code="GET /api/platform/unified-overview" onRetry={kpis.reload} /></div>}
      {kpis.data && <KpiRow kpis={kpis.data} cols={4} />}

      <div className="grid items-start gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-4">
          <Reveal i={4}>
            <SectionCard title="Latest applications" icon="users" action="View all" pad={6}>
              {screening.loading && <div className="grid gap-2 p-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}</div>}
              {screening.error && <ErrorState title="Could not load applications" body="The screening service did not respond." code="GET /api/screening" onRetry={screening.reload} />}
              {screening.data && screening.data.length === 0 && <EmptyState title="No applications yet" body="When candidates apply, the screener triages them here." />}
              {screening.data && screening.data.slice(0, 6).map((s) => (
                <a key={s.id} href="/screening" className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-3 rounded-[11px] px-3 py-[9px] transition-colors hover:bg-surface-2">
                  <ScoreRing value={s.score} size={40} band={BAND[s.result]} label="" />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold">{s.candidateId}</div>
                    <div className="text-[11.5px] text-ink-3">{s.agent}</div>
                  </div>
                  <StatusBadge kind={KIND[s.result]} />
                  <span className="mono w-8 text-right text-[11px] text-ink-3">{ago(s.createdAt)}</span>
                </a>
              ))}
            </SectionCard>
          </Reveal>

          <Reveal i={6}>
            <SectionCard title="Open requisitions" icon="briefcase" action="Manage">
              {reqs.loading && <div className="grid gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-[11px]" />)}</div>}
              {reqs.error && <ErrorState title="Could not load requisitions" body="The requisitions service did not respond." code="GET /api/requisitions" onRetry={reqs.reload} />}
              {reqs.data && reqs.data.length === 0 && <EmptyState title="No open requisitions" body="Create your first role; the jd-author agent can draft it." actions={<a href="/requisitions/new"><Btn variant="ai" icon="sparkles">Create with AI</Btn></a>} />}
              {reqs.data && reqs.data.length > 0 && (
                <div className="flex flex-col gap-[13px]">
                  {reqs.data.slice(0, 6).map((r) => (
                    <a key={r.id} href={`/requisitions/${r.id}`} className="grid grid-cols-[1fr_150px_60px] items-center gap-[14px]">
                      <div>
                        <div className="text-[13px] font-semibold">{r.title}</div>
                        <div className="text-[11.5px] text-ink-3">{r.department}{r.location ? ` · ${r.location}` : ""}</div>
                      </div>
                      <div><Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{r.status}</Pill></div>
                      <span className="mono tnum text-right text-[13px] font-semibold">{r.candidateCount ?? 0}</span>
                    </a>
                  ))}
                </div>
              )}
            </SectionCard>
          </Reveal>
        </div>

        <Reveal i={5}>
          <SectionCard title={role === "HIRING_MANAGER" ? "Decisions awaiting you" : "Review queue"} icon="gavel" action="Open queue">
            {review.loading && <div className="grid gap-[10px]">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[11px]" />)}</div>}
            {review.error && <ErrorState title="Could not load the queue" body="The HITL service did not respond." code="GET /api/agents/hitl" onRetry={review.reload} />}
            {review.data && review.data.length === 0 && <EmptyState title="You're all caught up" body="Nothing is waiting on a human right now. Nice work." />}
            {review.data && review.data.length > 0 && (
              <div className="flex flex-col gap-[10px]">
                {review.data.slice(0, 6).map((it) => (
                  <div key={it.id} className="rounded-[11px] border border-line bg-surface p-[13px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold">{it.candidateId}</span>
                      <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)" icon="clock">{it.reasonCode}</Pill>
                    </div>
                    <div className="mb-[9px] mt-1 text-[11.5px] text-ink-3">{it.verdict?.summary?.slice(0, 80) || "Awaiting human verification."}</div>
                    <a href={`/hitl/${it.id}`}><Btn variant="primary" size="sm" icon="enter" style={{ width: "100%", justifyContent: "center" }}>Review</Btn></a>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </Reveal>
      </div>
    </div>
  );
}
