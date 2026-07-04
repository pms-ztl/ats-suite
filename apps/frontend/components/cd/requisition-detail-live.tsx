"use client";
// components/cd/requisition-detail-live.tsx
// Wires the byte-exact CD RequisitionDetail (components/cd/screens/RequisitionDetail)
// to the gateway: getRequisition(id) + getFunnel -> ReqDetailData + statusMeta, with
// the byte-exact RoundsConfig / FormBuilder (RequisitionBuilder) supplied as the
// rounds / form tab slots. The job description, qualifications, custom screening
// criteria, salary, headcount and the pipeline funnel are live; the sections the
// gateway does not expose (owners, activity, interview rounds, application form)
// keep the design's example content. Full-height screen (rendered full-bleed).
import { useState, type CSSProperties } from "react";
import { useRouter, useParams } from "next/navigation";
import { RequisitionDetail } from "./screens/RequisitionDetail";
import { RoundsConfig } from "./RequisitionBuilder";
import { FormBuilderLive } from "./form-builder-live";
import { EligibilityEditorLive } from "./eligibility-editor-live";
import { Icon } from "./icon";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getRequisition, getFunnel, createJobPosting, findPostingForRequisition, listRounds, type RoundLite } from "@/lib/api";
import type { Requisition, ApplicationStage } from "@/lib/types";
import type { ReqDetailData, ReqStatusMeta, ReqStatusKey, ReqCustomField, RoundsData, TimelineItem } from "./types";

const STATUS_META: Record<string, ReqStatusMeta> = {
  DRAFT: { label: "Draft", tone: "var(--ink-3)", bg: "var(--surface-3)", icon: "dot" },
  OPEN: { label: "Open", tone: "var(--brand)", bg: "var(--brand-tint)", icon: "dot" },
  ON_HOLD: { label: "On hold", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  FILLED: { label: "Filled", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  CLOSED: { label: "Closed", tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "var(--danger)", bg: "var(--danger-tint)", icon: "x" },
};
const IMPORTANCE: Record<string, { label: string; tone: string; bg: string }> = {
  "nice-to-have": { label: "Nice-to-have", tone: "var(--ink-3)", bg: "var(--surface-3)" },
  nice: { label: "Nice-to-have", tone: "var(--ink-3)", bg: "var(--surface-3)" },
  important: { label: "Important", tone: "var(--info)", bg: "var(--info-tint)" },
  "must-have": { label: "Must-have", tone: "var(--ai-ink)", bg: "var(--ai-tint)" },
  must: { label: "Must-have", tone: "var(--ai-ink)", bg: "var(--ai-tint)" },
};

// canonical 5-column pipeline the design's PipelineFlow renders
const PIPELINE_BASE: { stage: string; n: number; color: string }[] = [
  { stage: "Applied", n: 0, color: "var(--ink-3)" },
  { stage: "Screening", n: 0, color: "var(--info)" },
  { stage: "Interview", n: 0, color: "var(--ai)" },
  { stage: "Offer", n: 0, color: "var(--brand)" },
  { stage: "Hired", n: 0, color: "var(--ok)" },
];
const STAGE_BUCKET: Partial<Record<ApplicationStage, number>> = {
  APPLIED: 0, SCREENED: 1, PHONE_SCREEN: 1, ASSESSMENT: 1, INTERVIEW: 2, FINAL_REVIEW: 2, OFFER: 3, HIRED: 4,
};

// Interview-round chrome (labels + tones per type). The round ROWS themselves are
// fetched live from GET /api/rounds?requisitionId=... below - no example rounds.
const ROUND_TYPES: RoundsData["roundTypes"] = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--info)" },
  TECHNICAL: { label: "Technical", tone: "var(--ai)" },
  BEHAVIORAL: { label: "Behavioral", tone: "var(--brand)" },
  PANEL: { label: "Panel", tone: "var(--warn)" },
  FINAL: { label: "Final", tone: "var(--ok)" },
};

export function RequisitionDetailLive() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useCurrentUser();
  const req = useData<Requisition>(() => getRequisition(id), [id]);
  // Real configured interview loop for THIS requisition (empty when none is set up).
  const rounds = useData<RoundLite[]>(() => listRounds(id), [id]);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const [publish, setPublish] = useState<{ open: boolean; busy: boolean; slug: string | null; error: string | null }>({ open: false, busy: false, slug: null, error: null });

  const onPost = async () => {
    if (publish.busy) return;
    const d0 = req.data;
    if (!d0) return;
    setPublish({ open: true, busy: true, slug: null, error: null });
    try {
      const existing = await findPostingForRequisition(d0.id);
      const posting = existing?.isPublished
        ? existing
        : await createJobPosting({ requisitionId: d0.id, title: d0.title, description: d0.description ?? "", requirements: d0.requiredSkills ?? d0.requirements ?? [] });
      setPublish({ open: true, busy: false, slug: posting.slug, error: posting.slug ? null : "The posting was created but did not return a link." });
    } catch {
      setPublish({ open: true, busy: false, slug: null, error: "We could not publish this job right now. Please try again." });
    }
  };

  // The byte-exact screen has no loading/error state, so gate here.
  if (req.loading || funnel.loading) return null;
  if (req.error || !req.data) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: "var(--fs-lg)", fontWeight: 700, marginBottom: 6 }}>Requisition not found</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)", marginBottom: 16 }}>We could not load this requisition.</div>
          <button onClick={req.reload} style={{ padding: "8px 16px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Try again</button>
        </div>
      </div>
    );
  }

  const d = req.data;
  const statusMeta = STATUS_META[d.status] ?? STATUS_META.DRAFT;
  const required = d.requiredSkills ?? d.requirements ?? [];
  const niceToHave = d.niceToHave ?? [];
  const customFields: ReqCustomField[] = (d.customFields ?? []).map((cf, i) => {
    const imp = IMPORTANCE[cf.importance ?? "nice"] ?? IMPORTANCE.nice;
    return { id: String(i), label: cf.label, value: cf.value, importanceLabel: imp.label, importanceTone: imp.tone, importanceBg: imp.bg };
  });

  const pipeline = PIPELINE_BASE.map((s) => ({ ...s }));
  let anyFunnel = false;
  for (const r of funnel.data ?? []) {
    const idx = STAGE_BUCKET[r.stage];
    if (idx == null) continue;
    pipeline[idx].n += Number(r.count) || 0;
    anyFunnel = true;
  }
  if (!anyFunnel) pipeline[0].n = d.candidateCount ?? 0;
  const reachInterview = pipeline[0].n > 0 ? Math.round((pipeline[2].n / pipeline[0].n) * 100) : 0;
  const orgName = user?.tenant?.name ?? "Your workspace";

  const data: ReqDetailData = {
    id: d.id, title: d.title, dept: d.department, loc: d.location,
    status: d.status as ReqStatusKey,
    min: d.salaryMin ?? 0, max: d.salaryMax ?? 0,
    level: "Not set", family: d.employmentType ?? "Not set",
    filled: 0, head: d.openings ?? 1,
    target: "Not set", posted: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Not set",
    jd: {
      description: d.description ?? "No description yet. The jd-author agent can draft one.",
      inclusivity: d.inclusivityScore ?? 0,
      required, niceToHave,
    },
    customFields,
    owners: [
      { role: "Recruiter", name: "Avery Chen", ini: "AC" },
      { role: "Hiring manager", name: "Jordan Lee", ini: "JL" },
    ],
    pipeline,
    pipelineSummary: `${pipeline[0].n} candidates across 5 stages · ${reachInterview}% reach interview.`,
    pipelineCards: [
      { label: "In screening", n: String(pipeline[1].n), icon: "scan", color: "var(--info)", sub: "in the screening stage" },
      { label: "Interviewing", n: String(pipeline[2].n), icon: "calendar", color: "var(--ai)", sub: "in interview rounds" },
      { label: "At offer", n: String(pipeline[3].n), icon: "fileText", color: "var(--brand)", sub: "at the offer stage" },
    ],
    // Honest empty: the gateway exposes no per-requisition activity feed yet, so
    // the Activity tab shows its empty state instead of invented events.
    activity: [] as TimelineItem[],
  };

  // Live rounds -> the RoundsConfig shape. Unconfigured loops render the
  // builder's empty state rather than a fabricated 5-round example.
  const roundsData: RoundsData = {
    rounds: (rounds.data ?? []).slice().sort((a, b) => a.order - b.order).map((r) => ({
      id: r.id, name: r.name, type: r.interviewType || "TECHNICAL", dur: r.durationMinutes || 60,
      panel: "Round panel", auto: Boolean(r.autoAdvanceOnPass), instr: "",
    })),
    roundTypes: ROUND_TYPES,
  };

  return (
    <>
      <RequisitionDetail
        data={data}
        statusMeta={statusMeta}
        roundsSlot={<RoundsConfig data={roundsData} jobTitle={d.title} />}
        formSlot={
          <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
            <FormBuilderLive requisitionId={d.id} jobTitle={d.title} orgLine={`${orgName} · ${d.department}`} />
            {/* Eligibility authoring lives with the application form: its rules gate
                the answers candidates give on exactly these fields. */}
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 26 }}>
              <EligibilityEditorLive requisitionId={d.id} />
            </div>
          </div>
        }
        onBack={() => router.push("/requisitions")}
        onCandidates={() => router.push("/candidates")}
        onPost={onPost}
      />
      {publish.open && (
        <PublishModal state={publish} onClose={() => setPublish((p) => ({ ...p, open: false }))} />
      )}
    </>
  );
}

function PublishModal({ state, onClose }: { state: { busy: boolean; slug: string | null; error: string | null }; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = state.slug ? `${origin}/jobs/${state.slug}/apply` : "";
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };
  const inputStyle: CSSProperties = { flex: 1, padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-mono)", outline: "none", overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 24, background: "color-mix(in oklab, var(--bg-deep) 55%, transparent)", animation: "fadein .2s" }}>
      <div style={{ width: "min(520px, 96vw)", borderRadius: "var(--r-2xl)", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--e3)", padding: 26, animation: "rise .25s var(--ease-out)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{state.busy ? "Publishing job..." : state.slug ? "Job is live" : "Could not publish"}</h2>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 99, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="x" size={16} /></button>
        </div>

        {state.busy ? (
          <p style={{ margin: "6px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>Creating a public application link and rendering this requisition's form.</p>
        ) : state.error ? (
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 8, padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--danger-tint)", color: "var(--danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5 }}>
            <Icon name="flag" size={16} />{state.error}
          </div>
        ) : (
          <>
            <p style={{ margin: "6px 0 16px", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.5 }}>Anyone with this link can view the role and apply. Their application lands in your pipeline and is screened automatically.</p>
            <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6, display: "block" }}>Shareable application link</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} style={inputStyle} />
              <button onClick={copy} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 16px", borderRadius: "var(--r)", border: "1px solid transparent", background: copied ? "var(--ok)" : "var(--brand)", color: "var(--on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
                <Icon name={copied ? "check" : "copy"} size={15} />{copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
              <a href={link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontWeight: 600, fontSize: "var(--fs-sm)", textDecoration: "none" }}>
                <Icon name="arrowUpRight" size={15} />Open application page
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
