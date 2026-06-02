"use client";
// app/(dashboard)/requisitions/[id]/page.tsx - EXACT Claude Design "Aurora"
// requisition detail (claude-design/req-detail.jsx): back link + title/status
// header with actions, a five-tab rail, the JD card (description + required
// qualifications + nice-to-have), the AI custom-screening-criteria card, the
// pipeline rail with conversion chevrons + stage stat cards, and the
// Details/Owners side rail. Wired to the real gateway via getRequisition(id).
// Sections with no backing endpoint (per-stage pipeline counts, owners,
// activity) render their exact layout shell with an EmptyState, no fabrication.
import * as React from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getRequisition } from "@/lib/api";
import type { Requisition, RequisitionStatus, CustomField } from "@/lib/types";

type CSS = React.CSSProperties;

/* status -> icon + label + tone/bg, keyed by the real RequisitionStatus enum */
const STATUS_META: Record<RequisitionStatus, { label: string; icon: string; tone: string; bg: string }> = {
  DRAFT: { label: "Draft", icon: "dot", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  OPEN: { label: "Open", icon: "dot", tone: "var(--c-brand)", bg: "var(--c-brand-tint)" },
  ON_HOLD: { label: "On hold", icon: "clock", tone: "var(--c-warn)", bg: "var(--c-warn-tint)" },
  FILLED: { label: "Filled", icon: "check", tone: "var(--c-ok)", bg: "var(--c-ok-tint)" },
  CLOSED: { label: "Closed", icon: "x", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  CANCELLED: { label: "Cancelled", icon: "x", tone: "var(--c-danger)", bg: "var(--c-danger-tint)" },
};

/* custom-field importance -> label + tone/bg */
const IMPORTANCE: Record<string, { label: string; tone: string; bg: string }> = {
  must: { label: "Must have", tone: "var(--c-danger)", bg: "var(--c-danger-tint)" },
  important: { label: "Important", tone: "var(--c-warn)", bg: "var(--c-warn-tint)" },
  nice: { label: "Nice to have", tone: "var(--c-ink-2)", bg: "var(--c-surface-2)" },
};

const labelStyle: CSS = { fontSize: 11, fontWeight: 600, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".06em" };

function Fact({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--c-ink-3)" }}>{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

const k = (n?: number) => (n != null ? `$${Math.round(n / 1000)}k` : null);
function salaryLabel(r: Requisition): string | null {
  const lo = k(r.salaryMin), hi = k(r.salaryMax);
  if (lo && hi) return `${lo} to ${hi}`;
  return lo || hi || null;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1280px]" aria-busy="true">
      <Skeleton className="mb-3 h-4 w-32 rounded" />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2"><Skeleton className="h-9 w-72 rounded-lg" /><Skeleton className="h-4 w-96 rounded" /></div>
        <div className="flex gap-2"><Skeleton className="h-9 w-20 rounded" /><Skeleton className="h-9 w-32 rounded" /><Skeleton className="h-9 w-24 rounded" /></div>
      </div>
      <Skeleton className="mb-5 h-9 w-full max-w-[520px] rounded" />
      <div className="grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5"><Skeleton className="h-64 rounded-[18px]" /><Skeleton className="h-48 rounded-[18px]" /></div>
        <div className="flex flex-col gap-4"><Skeleton className="h-56 rounded-[18px]" /><Skeleton className="h-40 rounded-[18px]" /></div>
      </div>
    </div>
  );
}

export default function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const req = useData<Requisition>(() => getRequisition(id), [id]);
  const [tab, setTab] = useState<string>("overview");

  if (req.loading) return <DetailSkeleton />;
  if (req.error || !req.data) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <ErrorState title="Requisition not found" body="We could not load this requisition." code={`GET /api/requisitions/${id}`} onRetry={req.reload} />
      </div>
    );
  }

  const r = req.data;
  const m = STATUS_META[r.status] ?? STATUS_META.DRAFT;
  const salary = salaryLabel(r);
  const required = r.requiredSkills ?? r.requirements ?? [];
  const niceToHave = r.niceToHave ?? [];
  const customFields: CustomField[] = r.customFields ?? [];
  const inclusivity = r.inclusivityScore;

  const tabs: [string, string, string][] = [
    ["overview", "Overview", "fileText"],
    ["pipeline", "Pipeline", "radar"],
    ["rounds", "Interview rounds", "calendar"],
    ["form", "Application form", "listChecks"],
    ["activity", "Activity", "bolt"],
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <a href="/requisitions" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", fontWeight: 600, marginBottom: 12 }}>
        <Icon name="chevsL" size={14} /> All requisitions
      </a>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{r.title}</h1>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px 4px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
              <Icon name={m.icon} size={12} stroke={2.4} />{m.label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7, fontSize: 12.5, color: "var(--c-ink-2)" }}>
            <span className="mono">{r.id}</span>
            {r.department && <><span>·</span><span>{r.department}</span></>}
            {r.location && <><span>·</span><span>{r.location}</span></>}
            {salary && <><span>·</span><span className="mono" style={{ color: "var(--c-brand)", fontWeight: 600 }}>{salary}</span></>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="soft" icon="copy">Edit</Btn>
          <a href="/candidates"><Btn variant="soft" icon="users">View candidates</Btn></a>
          <Btn variant="primary" icon="arrowUpRight">Post job</Btn>
        </div>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid var(--c-line)" }}>
        {tabs.map(([tid, tlabel, tic]) => (
          <button key={tid} onClick={() => setTab(tid)} style={{
            display: "inline-flex", gap: 7, alignItems: "center", padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
            fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)",
            color: tab === tid ? "var(--c-ink)" : "var(--c-ink-3)", borderBottom: "2px solid", borderColor: tab === tid ? "var(--c-brand)" : "transparent", marginBottom: -1,
          }}>
            <Icon name={tic} size={15} />{tlabel}
          </button>
        ))}
      </div>

      {/* body */}
      <div style={{ paddingTop: 22 }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20, alignItems: "start", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* job description */}
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 22, boxShadow: "var(--e1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Job description</h3>
                  {inclusivity != null && <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">jd-author · {inclusivity} inclusivity</Pill>}
                </div>
                {r.description ? (
                  <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>{r.description}</p>
                ) : (
                  <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>No description yet. The jd-author agent can draft one.</p>
                )}

                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Required qualifications</div>
                {required.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                    {required.map((q, i) => (
                      <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                        <Icon name="check" size={14} style={{ color: "var(--c-brand)", flexShrink: 0, marginTop: 2 }} />{q}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--c-ink-3)" }}>No required qualifications captured.</p>
                )}

                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Nice to have</div>
                {niceToHave.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {niceToHave.map((n, i) => <Pill key={i} tone="var(--c-ink-2)" bg="var(--c-surface-2)">{n}</Pill>)}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-3)" }}>No nice-to-have skills listed.</p>
                )}
              </div>

              {/* custom screening criteria */}
              <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--c-ai) 24%, var(--c-line))", background: "linear-gradient(180deg, var(--c-ai-tint) 0%, transparent 38%)", padding: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} />
                  <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3>
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--c-ink-2)" }}>These admin-defined criteria are sent to the screener and appear in every verdict.</p>
                {customFields.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {customFields.map((cf, i) => {
                      const imp = IMPORTANCE[cf.importance ?? "nice"] ?? IMPORTANCE.nice;
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
                  <div style={{ borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px solid var(--c-line)", padding: "26px 14px" }}>
                    <EmptyState title="No custom criteria" body="Admin-defined screening criteria appear here once configured for this role." />
                  </div>
                )}
              </div>
            </div>

            {/* side rail: details + owners */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...labelStyle, marginBottom: 4 }}>Details</div>
                <Fact k="Status" v={m.label} />
                {r.employmentType && <Fact k="Job family" v={r.employmentType} />}
                <Fact k="Location" v={r.location || "Not set"} />
                {salary && <Fact k="Salary" v={salary} mono />}
                {r.openings != null && <Fact k="Headcount" v={r.openings} mono />}
                <Fact k="Candidates" v={r.candidateCount ?? 0} mono />
                {r.createdAt && <Fact k="Created" v={new Date(r.createdAt).toLocaleDateString()} />}
              </div>

              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...labelStyle, marginBottom: 12 }}>Owners</div>
                <EmptyState title="No owners yet" body="Recruiter and hiring-manager assignments will appear here." />
              </div>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div style={{ animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Candidate pipeline</h3>
                <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{r.candidateCount ?? 0} candidates across this requisition.</p>
              </div>
              <a href="/candidates"><Btn variant="soft" icon="users">Open candidates board</Btn></a>
            </div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "30px 18px", boxShadow: "var(--e1)" }}>
              <EmptyState
                title="Pipeline breakdown unavailable"
                body="Per-stage counts and conversion rates load here once the pipeline service is wired."
                actions={<a href="/candidates"><Btn variant="ai" icon="radar">View candidates</Btn></a>}
              />
            </div>
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {([["In screening", "scan", "var(--c-info)"], ["Interviewing", "calendar", "var(--c-ai)"], ["At offer", "fileText", "var(--c-brand)"]] as const).map(([t, ic, c]) => (
                <div key={t} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 16, boxShadow: "var(--e1)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", color: c, background: `color-mix(in oklab, ${c} 13%, transparent)` }}><Icon name={ic} size={16} /></span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                    <span className="mono tnum" style={{ fontSize: 24, fontWeight: 700, color: "var(--c-ink-3)" }}>--</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>{t}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 3 }}>No data yet</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rounds" && (
          <div style={{ animation: "rise .3s var(--ease-out)" }}>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "30px 18px", boxShadow: "var(--e1)" }}>
              <EmptyState
                title="Interview rounds"
                body="Configure the interview loop for this role on its own page."
                actions={<a href={`/requisitions/${id}/rounds`}><Btn variant="primary" icon="calendar">Open interview rounds</Btn></a>}
              />
            </div>
          </div>
        )}

        {tab === "form" && (
          <div style={{ animation: "rise .3s var(--ease-out)" }}>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "30px 18px", boxShadow: "var(--e1)" }}>
              <EmptyState
                title="Application form"
                body="Build and reorder the candidate application form on its own page."
                actions={<a href={`/requisitions/${id}/form-builder`}><Btn variant="primary" icon="listChecks">Open form builder</Btn></a>}
              />
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div style={{ maxWidth: 620, animation: "rise .3s var(--ease-out)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "var(--fs-lg)", fontWeight: 700 }}>Activity</h3>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "30px 18px", boxShadow: "var(--e1)" }}>
              <EmptyState title="No activity yet" body="Stage moves, agent runs, and notes for this requisition will appear here." />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
