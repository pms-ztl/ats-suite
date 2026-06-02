"use client";
// app/(dashboard)/candidates/[id]/page.tsx - VERBATIM Aurora port of the rich
// recruiter-side candidate profile (claude-design/cand-profile.jsx CandProfile):
// a top nav with "X of N" + prev/next + a blind-review toggle, then a multi-zone
// working surface. The left column leads with the AI screening verdict (ScoreRing
// + StatusBadge + Confidence + a weighted per-requirement breakdown), then the
// interview scorecards, the parsed resume, and an activity timeline; the right
// rail carries a snapshot, threaded notes, and an advisory next-steps map.
//
// Real gateway wiring (the prototype mapped over window.CAND_PROFILE/SCREENING/
// PARSED): getCandidate(id) drives the identity header + snapshot; getVerdict(id)
// drives the screening verdict zone (score, confidence, requirement findings);
// listCandidates() supplies the prev/next ring. Blind mode, prev/next, and add-note
// are useState. Zones the API does not expose yet (scorecards, parsed-resume
// fields, suggested next steps) keep the prototype's exact structure with the
// prototype's example content. AI is advisory; a human always decides.
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Btn, Pill, StatusBadge, ScoreRing, Confidence, Timeline } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getCandidate, getVerdict, listCandidates } from "@/lib/api";
import type { Candidate, ScreeningVerdict, ScreeningResult, ApplicationStage, RequirementMatch } from "@/lib/types";

/* per-requirement / verdict state -> color + icon (matches the screening port) */
const pStCol = (s: string) => s === "pass" ? "var(--c-ok)" : s === "review" ? "var(--c-warn)" : "var(--c-danger)";
const pStIc = (s: string) => s === "pass" ? "check" : s === "review" ? "eye" : "x";

/* the inlined fStyles.label from the prototype's foundations (uppercase micro-label) */
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

/* result -> advisory band copy + StatusBadge kind */
type Kind = "pass" | "review" | "fail";
const KIND: Record<ScreeningResult, Kind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<Kind, { band: string; rec: string }> = {
  pass: { band: "Strong match", rec: "advance" },
  review: { band: "Strong potential", rec: "human review" },
  fail: { band: "Below the bar", rec: "decline" },
};
function reqState(met: RequirementMatch["met"]): Kind {
  return met === true ? "pass" : met === "partial" ? "review" : "fail";
}

/* stages map the verbatim ApplicationStage enum to the prototype's labelled dots */
const STAGE_META: Record<ApplicationStage, { label: string; color: string }> = {
  APPLIED:      { label: "Applied",       color: "var(--c-ink-3)" },
  SCREENED:     { label: "Screening",     color: "var(--c-info)" },
  PHONE_SCREEN: { label: "Phone screen",  color: "var(--c-info)" },
  ASSESSMENT:   { label: "Assessment",    color: "var(--c-ai)" },
  INTERVIEW:    { label: "Interview",     color: "var(--c-ai)" },
  FINAL_REVIEW: { label: "Final review",  color: "var(--c-brand)" },
  OFFER:        { label: "Offer",         color: "var(--c-brand)" },
  HIRED:        { label: "Hired",         color: "var(--c-ok)" },
  REJECTED:     { label: "Rejected",      color: "var(--c-danger)" },
  WITHDRAWN:    { label: "Withdrawn",     color: "var(--c-ink-3)" },
};

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] || "" : "")).toUpperCase();
}
function fmtDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ---------- Zone, the bordered card used across the profile (verbatim) ---------- */
function Zone({
  title, icon, ai, action, children, onAction,
}: { title: React.ReactNode; icon: string; ai?: boolean; action?: string; children?: React.ReactNode; onAction?: () => void }) {
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 700, fontSize: "var(--fs-md)" }}>
          <Icon name={icon} size={16} style={{ color: ai ? "var(--c-ai)" : "var(--c-ink-3)" }} />{title}
          {ai && <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9.5 }}>AI</Pill>}
        </div>
        {action && <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: "var(--c-brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{action}<Icon name="chevR" size={13} /></button>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

/* ---------- RatingDots, the 5-dot scorecard meter (verbatim) ---------- */
function RatingDots({ n }: { n: number }) {
  return <span style={{ display: "inline-flex", gap: 3 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--c-brand)" : "var(--c-surface-3)" }} />)}</span>;
}

/* ---------- example content for zones with no endpoint yet (prototype's own data) ---------- */
/* interview scorecards: kept verbatim from the prototype so the panel reads true to design */
const EXAMPLE_SCORECARDS: { who: string; role: string; rec: string; recTone: string; overall: number; dims: { d: string; s: number }[]; note: string }[] = [
  { who: "Sam Okafor", role: "Technical screen", rec: "YES", recTone: "ok", overall: 4.2,
    dims: [{ d: "Coding", s: 4 }, { d: "Systems depth", s: 5 }, { d: "Communication", s: 4 }], note: "Excellent on distributed systems; clean problem decomposition." },
  { who: "Jordan Lee", role: "Behavioral", rec: "NEUTRAL", recTone: "warn", overall: 3.3,
    dims: [{ d: "Ownership", s: 4 }, { d: "Leadership", s: 2 }, { d: "Collaboration", s: 4 }], note: "Strong IC signal; limited evidence of people leadership." },
];
/* parsed-resume example fields + skills (prototype's PARSED) */
const EXAMPLE_FIELDS: { k: string; v: string; c: number }[] = [
  { k: "Full name", v: "Priya Raman", c: 0.99 },
  { k: "Email", v: "priya.raman@hey.com", c: 0.98 },
  { k: "Phone", v: "+1 (512) 555-0148", c: 0.95 },
  { k: "Location", v: "Austin, TX", c: 0.91 },
  { k: "Years of experience", v: "8", c: 0.86 },
];
const EXAMPLE_SKILLS: { n: string; c: number }[] = [
  { n: "Go", c: 0.97 }, { n: "Kafka", c: 0.94 }, { n: "PostgreSQL", c: 0.93 }, { n: "gRPC", c: 0.9 },
  { n: "Kubernetes", c: 0.88 }, { n: "AWS", c: 0.85 }, { n: "Observability", c: 0.82 }, { n: "Rust", c: 0.58 }, { n: "Terraform", c: 0.71 },
];
/* activity timeline example (prototype's CAND_PROFILE.activity) */
const EXAMPLE_ACTIVITY: { who: string; what: string; t: string; ic: string; ai?: boolean }[] = [
  { ic: "sparkles", ai: true, who: "candidate-screener", what: "produced a screening verdict (78, REVIEW)", t: "6d" },
  { ic: "calendar", who: "Avery Chen", what: "scheduled the technical screen", t: "5d" },
  { ic: "fileText", who: "Sam Okafor", what: "submitted a scorecard (YES, 4.2)", t: "3d" },
  { ic: "flag", ai: true, who: "candidate-screener", what: "flagged confidence below threshold for human review", t: "2d" },
];
/* seed notes (prototype's CAND_PROFILE.notes); add-note threads new ones on top */
const SEED_NOTES: { who: string; ini: string; t: string; text: string }[] = [
  { who: "Avery Chen", ini: "AC", t: "2d", text: "Referred by Ruth (current backend hire). Strong systems signal, the open question is fintech domain depth. Pushing to a human-reviewed decision." },
  { who: "Jordan Lee", ini: "JL", t: "1d", text: "Agree it is borderline on leadership. Let us probe scope in the final panel rather than rejecting on the AI gap." },
];
/* advisory next-steps (prototype's static list) */
const NEXT_STEPS: [string, string, string][] = [
  ["calendar", "Schedule the technical loop", "All 3 panelists free Tue 2pm"],
  ["fileText", "Request a Rust work sample", "Resolves the honesty flag"],
  ["users", "Loop in the hiring manager", "Strong systems signal to confirm"],
];

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const cand = useData<Candidate>(() => getCandidate(id), [id]);
  const verdict = useData<ScreeningVerdict>(() => getVerdict(id), [id]);
  const roster = useData<Candidate[]>(listCandidates, []);

  const [blind, setBlind] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(SEED_NOTES);
  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes([{ who: "Avery Chen", ini: "AC", t: "now", text: noteText }, ...notes]);
    setNoteText("");
  };

  /* prev/next ring over the real candidate roster; index + total drive "X of N" */
  const list = roster.data ?? [];
  const idx = useMemo(() => list.findIndex((x) => x.id === id), [list, id]);
  const total = list.length;
  const onNav = (dir: number) => {
    if (idx < 0 || total === 0) return;
    const next = list[(idx + dir + total) % total];
    if (next) router.push(`/candidates/${next.id}`);
  };

  /* page-level loading / error (the candidate is the spine of the page) */
  if (cand.loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Skeleton className="h-16 rounded-2xl" />
          <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.65fr_1fr]">
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
          </div>
        </div>
      </div>
    );
  }
  if (cand.error || !cand.data) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <ErrorState title="Candidate not found" body="We could not load this candidate profile." code={`GET /api/candidates/${id}`} onRetry={cand.reload} />
      </div>
    );
  }

  const c = cand.data;
  const stage = STAGE_META[c.stage] ?? { label: c.stage, color: "var(--c-ink-3)" };
  const stageLabel = stage.label;
  const name = blind ? "Candidate " + initials(c.name) : c.name;

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* top nav bar: back + "X of N" + prev/next + blind toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--c-line)", flexWrap: "wrap" }}>
        <a href="/candidates" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", textDecoration: "none", fontWeight: 600 }}><Icon name="chevsL" size={14} /> Candidates</a>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{idx >= 0 ? idx + 1 : 1} of {total || 1}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onNav(-1)} disabled={total < 2} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: total < 2 ? "default" : "pointer", opacity: total < 2 ? 0.5 : 1 }}><Icon name="chevR" size={16} style={{ transform: "rotate(180deg)" }} /></button>
          <button onClick={() => onNav(1)} disabled={total < 2} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: total < 2 ? "default" : "pointer", opacity: total < 2 ? 0.5 : 1 }}><Icon name="chevR" size={16} /></button>
        </div>
        <div style={{ width: 1, height: 22, background: "var(--c-line)" }} />
        <button onClick={() => setBlind((b) => !b)} title="Hide identity to reduce bias" style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: blind ? "transparent" : "var(--c-line-2)", background: blind ? "var(--c-ai-tint)" : "var(--c-surface)", color: blind ? "var(--c-ai-ink)" : "var(--c-ink-2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 26, height: 15, borderRadius: 99, background: blind ? "var(--c-ai)" : "var(--c-line-strong)", position: "relative", transition: "background var(--t)" }}>
            <span style={{ position: "absolute", top: 2, left: blind ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
          </span><Icon name="eye" size={14} /> Blind review
        </button>
      </div>

      {blind && (
        <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)", fontSize: 12, color: "var(--c-ai-ink)", display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
          <Icon name="shield" size={14} /> Blind review on, name, photo, location, and contact are hidden so you assess skills, not identity.
        </div>
      )}

      {/* identity header */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "22px 0", flexWrap: "wrap" }}>
        <span className="mono" style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 20,
          background: blind ? "var(--c-surface-3)" : "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: blind ? "var(--c-ink-3)" : "white" }}>{blind ? "*" : initials(c.name)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{name}</h1>
            {c.requisitionId && <Pill mono>{c.requisitionId}</Pill>}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" }}><span style={{ width: 7, height: 7, borderRadius: 99, background: stage.color }} />{stageLabel}</span>
          </div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 3 }}>{c.stage ? STAGE_META[c.stage]?.label : ""}{blind ? "" : [c.location, c.source, c.appliedAt && `applied ${fmtDate(c.appliedAt)}`].filter(Boolean).length ? ` · ${[c.location, c.source, c.appliedAt && `applied ${fmtDate(c.appliedAt)}`].filter(Boolean).join(" · ")}` : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="soft" icon="calendar">Schedule</Btn>
          <Btn variant="soft" icon="fileText">Add note</Btn>
          <Btn variant="primary" icon="check">Advance</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.65fr_1fr]">
        {/* main zones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* screening verdict, wired to the real getVerdict(id) */}
          <Zone title="AI screening verdict" icon="scan" ai action="Open full verdict" onAction={() => { window.location.href = "/screening"; }}>
            {verdict.loading && <Skeleton className="h-28 rounded-xl" />}
            {verdict.error && (
              <EmptyState title="No screening verdict" body="This candidate has not been screened yet, or the verdict is unavailable." actions={<a href="/screening"><Btn variant="ai" size="sm" icon="scan">Open screening</Btn></a>} />
            )}
            {verdict.data && (() => {
              const v = verdict.data;
              const kind = KIND[v.result] ?? "review";
              const b = BAND[kind];
              return (
                <>
                  <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                    <ScoreRing value={v.score} size={84} band="var(--c-ai)" label="match %" />
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{b.band}</span><StatusBadge kind={kind} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>Recommends <b style={{ color: "var(--c-ink)" }}>{b.rec}</b>{v.summary ? `, ${v.summary}` : ". AI is advisory; a human decides."}</p>
                    </div>
                    <div style={{ width: 200 }}><Confidence value={v.confidence} /></div>
                  </div>
                  {v.requirements.length === 0 ? (
                    <div style={{ marginTop: 14, fontSize: 12, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center", borderTop: "1px solid var(--c-line)", paddingTop: 12 }}>
                      <Icon name="flag" size={13} /> This verdict did not record per-requirement findings.
                    </div>
                  ) : (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                      {v.requirements.map((r, i) => {
                        const st = reqState(r.met);
                        return (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr 70px", gap: 10, alignItems: "center", padding: "7px 0", borderTop: "1px solid var(--c-line)" }}>
                            <Icon name={pStIc(st)} size={14} stroke={2.3} style={{ color: pStCol(st) }} />
                            <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>{r.requirement}</span>
                            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", textAlign: "right" }}>{st === "pass" ? "met" : st === "review" ? "partial" : "not met"}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </Zone>

          {/* scorecards, no endpoint yet: prototype structure + example content */}
          <Zone title="Interview scorecards" icon="fileText" action="All feedback">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {EXAMPLE_SCORECARDS.map((sc, i) => (
                <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", padding: 14, background: "var(--c-surface-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                      <span className="mono" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--c-ink-2)" }}>{sc.who.split(" ").map((w) => w[0]).join("")}</span>
                      <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{blind ? "Interviewer " + (i + 1) : sc.who}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{sc.role}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{sc.overall}</span>
                      <Pill tone={sc.recTone === "ok" ? "var(--c-ok)" : "var(--c-warn)"} bg={sc.recTone === "ok" ? "var(--c-ok-tint)" : "var(--c-warn-tint)"}>{sc.rec}</Pill>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                    {sc.dims.map((d) => <div key={d.d} style={{ display: "flex", gap: 7, alignItems: "center" }}><span style={{ fontSize: 11.5, color: "var(--c-ink-2)" }}>{d.d}</span><RatingDots n={d.s} /></div>)}
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45, fontStyle: "italic" }}>{'"'}{sc.note}{'"'}</p>
                </div>
              ))}
            </div>
          </Zone>

          {/* parsed resume compact, no endpoint yet: prototype structure + example content */}
          <Zone title="Parsed resume" icon="fileText" ai action="View source">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <div style={{ ...labelStyle, marginBottom: 8 }}>Fields</div>
                {EXAMPLE_FIELDS.slice(0, 5).map((f) => (
                  <div key={f.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0", borderTop: "1px solid var(--c-line)", fontSize: 12 }}>
                    <span style={{ color: "var(--c-ink-3)" }}>{f.k}</span>
                    <span style={{ fontWeight: 600, display: "inline-flex", gap: 5, alignItems: "center" }}>{f.c < 0.7 && <Icon name="flag" size={11} style={{ color: "var(--c-warn)" }} />}{blind && (f.k === "Full name" || f.k === "Email" || f.k === "Phone" || f.k === "Location") ? "hidden" : f.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ ...labelStyle, marginBottom: 8 }}>Skills · confidence</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EXAMPLE_SKILLS.map((sk) => <span key={sk.n} style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "3px 8px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: sk.c < 0.7 ? "var(--c-warn-tint)" : "var(--c-surface-2)", color: sk.c < 0.7 ? "var(--c-warn)" : "var(--c-ink)", border: "1px solid var(--c-line)" }}>{sk.c < 0.7 && <Icon name="flag" size={10} />}{sk.n}</span>)}
                </div>
                <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", fontSize: 11.5, color: "var(--c-ink-2)", lineHeight: 1.4 }}>
                  <b style={{ color: "var(--c-warn)" }}>Honesty flag:</b> {'"'}Rust expert{'"'}, evidence suggests proficient, not expert.
                </div>
              </div>
            </div>
          </Zone>

          {/* activity, no endpoint yet: prototype structure + example timeline */}
          <Zone title="Activity" icon="bolt">
            <Timeline items={EXAMPLE_ACTIVITY} />
          </Zone>
        </div>

        {/* right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {!blind && (
            <Zone title="Snapshot" icon="users">
              {([
                ["Stage", stageLabel],
                ["Requisition", c.requisitionId || "-"],
                ["Source", c.source || "-"],
                ["Applied", fmtDate(c.appliedAt)],
                ["Email", c.email || "-"],
                ["Location", c.location || "-"],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderTop: "1px solid var(--c-line)", fontSize: 12.5 }}>
                  <span style={{ color: "var(--c-ink-3)" }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{v}</span>
                </div>
              ))}
            </Zone>
          )}
          <Zone title="Notes" icon="fileText">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} placeholder="Add a private team note..." style={{ width: "100%", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none" }} />
              <Btn variant="primary" size="sm" icon="plus" onClick={addNote} style={{ alignSelf: "flex-end" }}>Add note</Btn>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {notes.map((n, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <span className="mono" style={{ width: 26, height: 26, borderRadius: 99, flexShrink: 0, background: "var(--c-surface-3)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, color: "var(--c-ink-2)" }}>{n.ini}</span>
                  <div><div style={{ fontSize: 12, marginBottom: 2 }}><b>{n.who}</b> <span className="mono" style={{ color: "var(--c-ink-3)", fontSize: 10.5 }}>· {n.t}</span></div><p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>{n.text}</p></div>
                </div>
              ))}
            </div>
          </Zone>
          {/* AI next steps, fills the right rail + adds value */}
          <Zone title="Suggested next steps" icon="sparkles" ai>
            <svg viewBox="0 0 240 96" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
              <defs><linearGradient id="cpNs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--c-ai)" /><stop offset="1" stopColor="var(--c-brand)" /></linearGradient></defs>
              <path d="M16 72 H224" stroke="var(--c-line)" strokeWidth="1.5" />
              {[40, 96, 152, 208].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1="72" x2={i < 3 ? x + 56 : x} y2="72" stroke={i < 2 ? "url(#cpNs)" : "var(--c-line-2)"} strokeWidth="2.5" />
                  <circle cx={x} cy="72" r={i === 1 ? 8 : 6} fill={i < 2 ? "url(#cpNs)" : "var(--c-surface)"} stroke={i < 2 ? "none" : "var(--c-line-2)"} strokeWidth="2" />
                  {i === 1 && <circle cx={x} cy="72" r="13" fill="none" stroke="var(--c-ai)" strokeWidth="1.5" opacity="0.4" />}
                </g>
              ))}
              <text x="40" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-ink-3)">SCREENED</text>
              <text x="96" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-ai-ink)">YOU ARE HERE</text>
              <text x="152" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-ink-3)">INTERVIEW</text>
              <text x="208" y="44" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-ink-3)">DECIDE</text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NEXT_STEPS.map(([ic, t, d]) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)" }}><Icon name={ic} size={14} /></span>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> AI-suggested · you decide what happens next.</p>
          </Zone>
        </div>
      </div>
    </div>
  );
}
