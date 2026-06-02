"use client";
// app/(dashboard)/requisitions/[id]/page.tsx - EXACT Claude Design "Aurora"
// requisition-detail screen. Header (title / status / department / location /
// salary) + a tabbed working surface (Overview, Pipeline, Interview rounds,
// Application form, Activity). Ported from claude-design/req-detail.jsx and
// wired to the real gateway via getRequisition(id). Sub-sections without a
// matching endpoint (per-stage pipeline counts, owners, activity) render the
// exact prototype layout with graceful loading / empty states, no fake data.
import { Fragment, useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, CountUp } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getRequisition } from "@/lib/api";
import type { Requisition, RequisitionStatus, CustomField } from "@/lib/types";

/* status -> icon + full-color tokens (from claude-design/req-data.jsx REQ_STATUS) */
const STATUS_META: Record<RequisitionStatus, { label: string; tone: string; bg: string; icon: string }> = {
  DRAFT: { label: "Draft", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)", icon: "dot" },
  OPEN: { label: "Open", tone: "var(--c-brand)", bg: "var(--c-brand-tint)", icon: "dot" },
  ON_HOLD: { label: "On hold", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "clock" },
  FILLED: { label: "Filled", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  CLOSED: { label: "Closed", tone: "var(--c-ink-2)", bg: "var(--c-surface-3)", icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x" },
};

/* importance -> full-color tokens (from req-data.jsx IMPORTANCE). The view-model
   CustomField.importance is "nice" | "important" | "must". */
const IMPORTANCE: Record<string, { label: string; tone: string; bg: string }> = {
  nice: { label: "Nice-to-have", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  important: { label: "Important", tone: "var(--c-info)", bg: "var(--c-info-tint)" },
  must: { label: "Must-have", tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)" },
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)",
};

const CARD_STYLE: React.CSSProperties = {
  borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)",
};

const TABS: [string, string, string][] = [
  ["overview", "Overview", "fileText"],
  ["pipeline", "Pipeline", "radar"],
  ["rounds", "Interview rounds", "calendar"],
  ["form", "Application form", "listChecks"],
  ["activity", "Activity", "bolt"],
];

function money(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min != null && max != null) return `${k(min)} to ${k(max)}`;
  return min != null ? `From ${k(min)}` : `Up to ${k(max!)}`;
}

function Fact({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--c-ink-3)" }}>{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

export default function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState("overview");
  const req = useData<Requisition>(() => getRequisition(id), [id]);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* back link */}
      <a href="/requisitions" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", fontWeight: 600, marginBottom: 12 }}>
        <Icon name="chevsL" size={14} /> All requisitions
      </a>

      {req.loading && <DetailSkeleton />}

      {req.error && (
        <div style={CARD_STYLE}>
          <ErrorState
            title="Could not load this requisition"
            body="The requisitions service did not respond."
            code={`GET /api/requisitions/${id}`}
            onRetry={req.reload}
          />
        </div>
      )}

      {req.data && <DetailBody d={req.data} tab={tab} setTab={setTab} />}
    </div>
  );
}

function DetailBody({ d, tab, setTab }: { d: Requisition; tab: string; setTab: (t: string) => void }) {
  const m = STATUS_META[d.status] ?? STATUS_META.DRAFT;
  const salary = money(d.salaryMin, d.salaryMax);

  return (
    <>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.title}</h1>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px 4px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
              <Icon name={m.icon} size={12} stroke={2.4} />{m.label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7, fontSize: 12.5, color: "var(--c-ink-2)", alignItems: "center" }}>
            <span className="mono">{d.id}</span>
            {d.department && (<><span>·</span><span>{d.department}</span></>)}
            {d.location && (<><span>·</span><span>{d.location}</span></>)}
            {salary && (<><span>·</span><span className="mono" style={{ color: "var(--c-brand)", fontWeight: 600 }}>{salary}</span></>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <a href={`/requisitions/${d.id}/form-builder`}><Btn variant="soft" icon="copy">Edit</Btn></a>
          <a href={`/candidates?requisition=${d.id}`}><Btn variant="soft" icon="users">View candidates</Btn></a>
          <Btn variant="primary" icon="arrowUpRight">Post job</Btn>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid var(--c-line)" }}>
        {TABS.map(([tid, label, ic]) => (
          <button
            key={tid}
            onClick={() => setTab(tid)}
            style={{
              display: "inline-flex", gap: 7, alignItems: "center", padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: "var(--fs-sm)", fontWeight: 600, color: tab === tid ? "var(--c-ink)" : "var(--c-ink-3)",
              borderBottom: "2px solid", borderColor: tab === tid ? "var(--c-brand)" : "transparent", marginBottom: -1,
            }}
          >
            <Icon name={ic} size={15} />{label}
          </button>
        ))}
      </div>

      {/* body */}
      <div style={{ padding: "22px 0 8px" }}>
        {tab === "overview" && <OverviewTab d={d} salary={salary} status={m.label} />}
        {tab === "pipeline" && <PipelineTab d={d} />}
        {tab === "rounds" && <RoundsTab d={d} />}
        {tab === "form" && <FormTab d={d} />}
        {tab === "activity" && <ActivityTab />}
      </div>
    </>
  );
}

/* ----------------------------- Overview ----------------------------- */
function OverviewTab({ d, salary, status }: { d: Requisition; salary: string | null; status: string }) {
  const required = d.requirements ?? [];
  const niceToHave = d.niceToHave ?? [];
  const customFields = d.customFields ?? [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start" }} className="max-lg:!grid-cols-1">
      {/* left: JD + custom screening criteria */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...CARD_STYLE, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Job description</h3>
            {d.inclusivityScore != null && (
              <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">jd-author · {d.inclusivityScore} inclusivity</Pill>
            )}
          </div>

          {d.description ? (
            <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{d.description}</p>
          ) : (
            <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>No description yet. The jd-author agent can draft one from the role details.</p>
          )}

          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Required qualifications</div>
          {required.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {required.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                  <Icon name="check" size={14} style={{ color: "var(--c-brand)", flexShrink: 0, marginTop: 2 }} />{r}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--c-ink-3)" }}>No required qualifications captured.</p>
          )}

          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Nice to have</div>
          {niceToHave.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {niceToHave.map((r, i) => <Pill key={i} tone="var(--c-ink-2)" bg="var(--c-surface-2)">{r}</Pill>)}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-3)" }}>No preferred qualifications captured.</p>
          )}
        </div>

        {/* custom screening criteria (AI surface) */}
        <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--c-ai) 24%, var(--c-line))", background: "linear-gradient(180deg, var(--c-ai-tint) 0%, transparent 38%)", padding: 20 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} />
            <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--c-ink-2)" }}>These admin-defined criteria are sent to the screener and appear in every verdict.</p>
          {customFields.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {customFields.map((cf: CustomField, i: number) => {
                const imp = IMPORTANCE[cf.importance ?? "important"] ?? IMPORTANCE.important;
                return (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{cf.label}</div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{cf.value}</div>
                    </div>
                    <Pill tone={imp.tone} bg={imp.bg}>{imp.label}</Pill>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No custom criteria" body="Add admin-defined screening criteria and the screener will weigh them in every verdict." />
          )}
        </div>
      </div>

      {/* right: details fact-list + owners */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={CARD_STYLE}>
          <div style={{ ...LABEL_STYLE, marginBottom: 4 }}>Details</div>
          <Fact k="Status" v={status} />
          {d.employmentType && <Fact k="Job family" v={d.employmentType} />}
          {d.location && <Fact k="Location" v={d.location} />}
          {salary && <Fact k="Salary" v={salary} mono />}
          {d.openings != null && <Fact k="Headcount" v={`${d.openings} opening${d.openings === 1 ? "" : "s"}`} mono />}
          <Fact k="Candidates" v={d.candidateCount ?? 0} mono />
          {d.createdAt && <Fact k="Created" v={new Date(d.createdAt).toLocaleDateString()} />}
          {d.updatedAt && <Fact k="Updated" v={new Date(d.updatedAt).toLocaleDateString()} />}
        </div>

        <div style={CARD_STYLE}>
          <div style={{ ...LABEL_STYLE, marginBottom: 12 }}>Owners</div>
          <EmptyState
            title="No owners assigned"
            body="Assign a recruiter and hiring manager to route reviews and approvals."
          />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Pipeline ----------------------------- */
const PIPELINE_STAGES: { stage: string; color: string }[] = [
  { stage: "Applied", color: "var(--c-ink-3)" },
  { stage: "Screening", color: "var(--c-info)" },
  { stage: "Interview", color: "var(--c-ai)" },
  { stage: "Offer", color: "var(--c-brand)" },
  { stage: "Hired", color: "var(--c-ok)" },
];

function PipelineTab({ d }: { d: Requisition }) {
  const total = d.candidateCount ?? 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Candidate pipeline</h3>
          <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
            {total} candidate{total === 1 ? "" : "s"} across {PIPELINE_STAGES.length} stages.
          </p>
        </div>
        <a href={`/candidates?requisition=${d.id}`}><Btn variant="soft" icon="users">Open candidates board</Btn></a>
      </div>

      {/* per-stage breakdown has no endpoint yet: render the exact stage rail
          with the real total on Applied and an honest empty state for the rest. */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        {PIPELINE_STAGES.map((s, i) => {
          const n = i === 0 ? total : null;
          return (
            <Fragment key={s.stage}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "16px 8px", position: "relative", overflow: "hidden", boxShadow: "var(--e1)" }}>
                  <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: 3, background: s.color, opacity: 0.5 }} />
                  <div className="mono tnum" style={{ fontSize: 26, fontWeight: 700, color: s.color }}>
                    {n != null ? <CountUp to={n} /> : <span style={{ color: "var(--c-ink-3)" }}>--</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-2)", fontWeight: 600, marginTop: 2 }}>{s.stage}</div>
                </div>
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ width: 46, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="chevR" size={16} style={{ color: "var(--c-ink-3)" }} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ ...CARD_STYLE, padding: 22 }}>
          <EmptyState
            title="Stage breakdown is not available yet"
            body="Per-stage counts and conversion appear here once candidates move through this requisition."
            actions={<a href={`/candidates?requisition=${d.id}`}><Btn variant="soft" icon="users">View candidates</Btn></a>}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Interview rounds ------------------------- */
function RoundsTab({ d }: { d: Requisition }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Interview rounds</h3>
          <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>Configure the stages every candidate moves through for this role.</p>
        </div>
        <a href={`/requisitions/${d.id}/rounds`}><Btn variant="primary" icon="calendar">Configure rounds</Btn></a>
      </div>
      <div style={{ ...CARD_STYLE, padding: 22 }}>
        <EmptyState
          title="No interview rounds configured"
          body="Add phone screens, technical loops, and a final panel so the pipeline can advance candidates automatically."
          actions={<a href={`/requisitions/${d.id}/rounds`}><Btn variant="primary" icon="calendar">Set up rounds</Btn></a>}
        />
      </div>
    </div>
  );
}

/* ------------------------- Application form ------------------------- */
function FormTab({ d }: { d: Requisition }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Application form</h3>
          <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>Choose the questions applicants answer when they apply to this role.</p>
        </div>
        <a href={`/requisitions/${d.id}/form-builder`}><Btn variant="primary" icon="listChecks">Customize form</Btn></a>
      </div>
      <div style={{ ...CARD_STYLE, padding: 22 }}>
        <EmptyState
          title="Using the default application form"
          body="Name, email, and resume are always collected. Open the form builder to add custom fields."
          actions={<a href={`/requisitions/${d.id}/form-builder`}><Btn variant="primary" icon="listChecks">Open form builder</Btn></a>}
        />
      </div>
    </div>
  );
}

/* ----------------------------- Activity ----------------------------- */
function ActivityTab() {
  return (
    <div style={{ maxWidth: 620 }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "var(--fs-lg)", fontWeight: 700 }}>Activity</h3>
      <div style={{ ...CARD_STYLE, padding: 22 }}>
        <EmptyState
          title="No activity yet"
          body="Agent screenings, stage moves, and approvals for this requisition will appear here as a timeline."
        />
      </div>
    </div>
  );
}

/* ----------------------------- Skeleton ----------------------------- */
function DetailSkeleton() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Skeleton className="h-8 w-[320px] rounded-[10px]" />
          <Skeleton className="mt-3 h-4 w-[240px] rounded-[8px]" />
        </div>
        <Skeleton className="h-9 w-[280px] rounded-[10px]" />
      </div>
      <Skeleton className="h-10 w-full rounded-[10px]" />
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[260px] w-full rounded-[16px]" />
          <Skeleton className="h-[150px] w-full rounded-[16px]" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[220px] w-full rounded-[16px]" />
          <Skeleton className="h-[120px] w-full rounded-[16px]" />
        </div>
      </div>
    </div>
  );
}
