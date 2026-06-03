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
import {
  getDashboardKpis, listScreening, listRequisitions, listReviewQueue, listInterviews,
  type DashKpi,
} from "@/lib/api";
import type { ScreeningVerdict, Requisition, ReviewItem, Interview, ScreeningResult } from "@/lib/types";

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
function greetingFor(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}
function firstName(user: { name?: string } | null | undefined): string {
  return (user?.name || "there").split(" ")[0];
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

  const applications = (screening.data ?? []).slice(0, 5);
  const myReqs = (reqs.data ?? []).slice(0, 3);
  const scheduling = (interviews.data ?? []).filter((iv) => iv.status === "SCHEDULED" || iv.status === "RESCHEDULED").slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Greeting title={`${greetingFor()}, ${firstName(user)}`} sub="47 new applications and 9 candidates waiting to be scheduled.">
        <a href="/candidates/import"><Btn variant="soft" icon="users">Bulk upload</Btn></a>
        <a href="/sourcing"><Btn variant="ai" icon="radar">Source candidates</Btn></a>
      </Greeting>
      <KpiStrip kpis={kpis} />
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, alignItems: "start" }}>
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
                  const stagePct = [60, 25, 10, 5];
                  return (
                    <div key={r.id ?? i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 60px", gap: 14, alignItems: "center" }}>
                      <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{r.department}</div></div>
                      <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                        {stagePct.map((p, j) => <div key={j} style={{ width: p + "%", background: ["var(--c-ink-3)", "var(--c-info)", "var(--c-ai)", "var(--c-brand)"][j], animation: "growx .9s var(--ease-out) both", animationDelay: (j * 100) + "ms" }} />)}
                      </div>
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
    </div>
  );
}

/* ---------------- Hiring manager ---------------- */
function HMDash() {
  const { user } = useCurrentUser();
  const kpis = useData<DashKpi[]>(getDashboardKpis);
  const review = useData<ReviewItem[]>(listReviewQueue);
  const reqs = useData<Requisition[]>(listRequisitions);

  const decisions = (review.data ?? []).slice(0, 4);
  const myReqs = (reqs.data ?? []).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Greeting title={`${greetingFor()}, ${firstName(user)}`} sub="4 decisions are waiting on you, 2 are time-sensitive.">
        <a href="/analytics"><Btn variant="soft" icon="chart">View analytics</Btn></a>
        <a href="/requisitions/new"><Btn variant="primary" icon="briefcase">New requisition</Btn></a>
      </Greeting>
      <KpiStrip kpis={kpis} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
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
                const labels = ["Applied", "Screen", "Interview", "Offer"];
                const total = r.candidateCount ?? 0;
                const funnel = [total, Math.round(total * 0.32), Math.round(total * 0.1), Math.max(1, Math.round(total * 0.025))];
                const max = funnel[0] || 1;
                const risk = r.status === "ON_HOLD" || r.status === "CANCELLED" ? "at-risk" : "on-track";
                const target = r.status;
                return (
                  <div key={r.id ?? i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</span>
                      <Pill tone={risk === "at-risk" ? "var(--c-danger)" : "var(--c-ok)"} bg={risk === "at-risk" ? "var(--c-danger-tint)" : "var(--c-ok-tint)"} icon={risk === "at-risk" ? "flag" : "check"}>{target}</Pill>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {funnel.map((n, j) => (
                        <div key={j} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ height: 34, borderRadius: 7, background: "var(--c-surface-2)", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                            <div style={{ width: "100%", height: ((n / max) * 100) + "%", background: ["var(--c-ink-3)", "var(--c-info)", "var(--c-ai)", "var(--c-brand)"][j], borderRadius: 7, animation: "growy 1s var(--ease-out) both", animationDelay: (j * 90) + "ms" }} />
                          </div>
                          <div className="mono tnum" style={{ fontSize: 11, fontWeight: 600, marginTop: 3 }}>{n}</div>
                          <div style={{ fontSize: 9, color: "var(--c-ink-3)" }}>{labels[j]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
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

  return (
    <div className="mx-auto w-full max-w-[980px]">
      <Greeting title={`${greetingFor()}, ${firstName(user)}`} sub="You have 3 interviews today and 2 scorecards to write.">
        <a href="/interviews"><Btn variant="soft" icon="calendar">Full schedule</Btn></a>
      </Greeting>
      <KpiStrip kpis={kpis} />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
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
    </div>
  );
}
