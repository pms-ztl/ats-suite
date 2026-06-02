"use client";
// app/(dashboard)/candidates/[id]/page.tsx - EXACT Claude Design "Aurora" port of
// the rich multi-zone candidate profile (claude-design/cand-profile.jsx +
// "Candidate Profile.html"): a top nav + blind-review toggle, an identity header
// with name/role/stage + actions, then a two-column working surface. The left
// column leads with the AI screening verdict (ScoreRing + Confidence + per-
// requirement evidence) and continues into scorecards / parsed resume / activity
// zones; the right rail carries a snapshot, notes, and an advisory next-steps map.
// Wired to the real gateway: getCandidate + getVerdict, advanceStage moves people
// forward. AI is advisory; a human always decides. Zones with no endpoint render
// the exact layout with an honest EmptyState - no data is fabricated.
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, StatusBadge, ScoreRing, Confidence } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getCandidate, getVerdict, advanceStage } from "@/lib/api";
import type { Candidate, ScreeningVerdict, ScreeningResult, ApplicationStage, RequirementMatch } from "@/lib/types";

/* result -> StatusBadge kind + advisory band copy (matches the screening port) */
type Kind = "pass" | "review" | "fail";
const KIND: Record<ScreeningResult, Kind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<Kind, { tone: string; band: string; rec: string }> = {
  pass: { tone: "var(--c-ok)", band: "Strong match", rec: "advance" },
  review: { tone: "var(--c-warn)", band: "Strong potential", rec: "human review" },
  fail: { tone: "var(--c-danger)", band: "Below the bar", rec: "decline" },
};

/* per-requirement state, from the real RequirementMatch.met union */
function reqState(met: RequirementMatch["met"]): Kind {
  return met === true ? "pass" : met === "partial" ? "review" : "fail";
}
const REQ_ICON: Record<Kind, string> = { pass: "check", review: "eye", fail: "x" };
const REQ_COLOR: Record<Kind, string> = { pass: "var(--c-ok)", review: "var(--c-warn)", fail: "var(--c-danger)" };

/* stages map the verbatim ApplicationStage enum to the prototype's labelled dots */
const STAGE_META: Record<ApplicationStage, { label: string; color: string }> = {
  APPLIED:      { label: "Applied",       color: "var(--c-ink-3)" },
  SCREENED:     { label: "Screened",      color: "var(--c-info)" },
  PHONE_SCREEN: { label: "Phone screen",  color: "var(--c-info)" },
  ASSESSMENT:   { label: "Assessment",    color: "var(--c-ai)" },
  INTERVIEW:    { label: "Interview",     color: "var(--c-ai)" },
  FINAL_REVIEW: { label: "Final review",  color: "var(--c-brand)" },
  OFFER:        { label: "Offer",         color: "var(--c-brand)" },
  HIRED:        { label: "Hired",         color: "var(--c-ok)" },
  REJECTED:     { label: "Rejected",      color: "var(--c-danger)" },
  WITHDRAWN:    { label: "Withdrawn",     color: "var(--c-ink-3)" },
};
/* forward path only; advancing skips the terminal/negative stages */
const STAGE_FLOW: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];

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

/* ---------- Zone, the bordered card used across the profile ---------- */
function Zone({
  title, icon, ai, action, onAction, children,
}: { title: React.ReactNode; icon: string; ai?: boolean; action?: string; onAction?: () => void; children?: React.ReactNode }) {
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--c-line)" }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 700, fontSize: "var(--fs-md)" }}>
          <Icon name={icon} size={16} style={{ color: ai ? "var(--c-ai)" : "var(--c-ink-3)" }} />{title}
          {ai && <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9.5 }}>AI</Pill>}
        </div>
        {action && (
          <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: "var(--c-brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>
            {action}<Icon name="chevR" size={13} />
          </button>
        )}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

/* ---------- advisory next-steps map (static pipeline viz, not candidate data) ---------- */
function NextSteps() {
  const steps: [string, string, string][] = [
    ["calendar", "Schedule the next interview", "Coordinate panel availability"],
    ["fileText", "Request supporting evidence", "Resolve any open confidence gaps"],
    ["users", "Loop in the hiring manager", "Confirm the strongest signals"],
  ];
  return (
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
        {steps.map(([ic, t, d]) => (
          <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)" }}><Icon name={ic} size={14} /></span>
            <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div></div>
          </div>
        ))}
      </div>
      <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}>
        <Icon name="shield" size={12} /> AI-suggested - you decide what happens next.
      </p>
    </Zone>
  );
}

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const cand = useData<Candidate>(() => getCandidate(id), [id]);
  const verdict = useData<ScreeningVerdict>(() => getVerdict(id), [id]);

  const [blind, setBlind] = useState(false);
  const [moving, setMoving] = useState(false);
  const [moveErr, setMoveErr] = useState(false);

  const c = cand.data;
  const next = useMemo<ApplicationStage | null>(() => {
    if (!c) return null;
    const i = STAGE_FLOW.indexOf(c.stage);
    return i >= 0 && i < STAGE_FLOW.length - 1 ? STAGE_FLOW[i + 1] : null;
  }, [c]);

  async function advance() {
    if (!c || !next || moving) return;
    setMoving(true); setMoveErr(false);
    try { await advanceStage(c.id, next); cand.reload(); }
    catch { setMoveErr(true); }
    finally { setMoving(false); }
  }

  /* page-level loading / error (the candidate is the spine of the page) */
  if (cand.loading) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Skeleton className="h-16 rounded-2xl" />
          <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}</div>
          </div>
        </div>
      </div>
    );
  }
  if (cand.error || !c) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <ErrorState title="Candidate not found" body="We could not load this candidate profile." code={`GET /api/candidates/${id}`} onRetry={cand.reload} />
      </div>
    );
  }

  const stage = STAGE_META[c.stage] ?? { label: c.stage, color: "var(--c-ink-3)" };
  const name = blind ? `Candidate ${initials(c.name)}` : c.name;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* top nav: back + blind-review toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--c-line)", flexWrap: "wrap" }}>
        <a href="/candidates" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", textDecoration: "none", fontWeight: 600 }}>
          <Icon name="chevsL" size={14} /> Candidates
        </a>
        <div style={{ flex: 1 }} />
        <button onClick={() => setBlind((b) => !b)} title="Hide identity to reduce bias"
          style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "1px solid",
            borderColor: blind ? "transparent" : "var(--c-line-2)", background: blind ? "var(--c-ai-tint)" : "var(--c-surface)", color: blind ? "var(--c-ai-ink)" : "var(--c-ink-2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 26, height: 15, borderRadius: 99, background: blind ? "var(--c-ai)" : "var(--c-line-strong)", position: "relative", transition: "background var(--t)" }}>
            <span style={{ position: "absolute", top: 2, left: blind ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
          </span>
          <Icon name="eye" size={14} /> Blind review
        </button>
      </div>

      {blind && (
        <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)", fontSize: 12, color: "var(--c-ai-ink)", display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
          <Icon name="shield" size={14} /> Blind review on - name, location, and contact are hidden so you assess skills, not identity.
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
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: stage.color }} />{stage.label}
            </span>
          </div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 3 }}>
            {blind
              ? "Identity hidden for blind review"
              : [c.location, c.source && `via ${c.source}`, c.appliedAt && `applied ${fmtDate(c.appliedAt)}`].filter(Boolean).join(" · ") || "No profile details on file"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <Btn variant="soft" icon="calendar">Schedule</Btn>
          <Btn variant="soft" icon="fileText">Add note</Btn>
          <Btn variant="primary" icon="check" onClick={advance} style={next && !moving ? {} : { opacity: 0.55, pointerEvents: moving ? "none" : "auto" }}>
            {moving ? "Advancing..." : next ? `Advance to ${STAGE_META[next].label}` : "Advance"}
          </Btn>
        </div>
      </div>

      {moveErr && (
        <div style={{ marginBottom: 18, padding: "9px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: 12, fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
          <Icon name="flag" size={14} /> Could not advance the stage. Please try again.
        </div>
      )}

      {/* two-column working surface; reflows to one column on small viewports */}
      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-[1.65fr_1fr]">
        {/* main zones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* AI screening verdict, its own loading / error / empty */}
          <Zone title="AI screening verdict" icon="scan" ai action="Open full verdict" onAction={() => { window.location.href = "/screening"; }}>
            {verdict.loading && <Skeleton className="h-28 rounded-xl" />}
            {verdict.error && (
              <EmptyState title="No screening verdict" body="This candidate has not been screened yet, or the verdict is unavailable." actions={<a href="/screening"><Btn variant="ai" size="sm" icon="scan">Open screening</Btn></a>} />
            )}
            {verdict.data && (() => {
              const v = verdict.data;
              const kind = KIND[v.result];
              const b = BAND[kind];
              return (
                <>
                  <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                    <ScoreRing value={v.score} size={84} band="var(--c-ai)" label="match %" />
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{b.band}</span><StatusBadge kind={kind} />
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>
                        Recommends <b style={{ color: "var(--c-ink)" }}>{b.rec}</b>. AI is advisory; a human decides.
                      </p>
                    </div>
                    <div style={{ width: 200 }}><Confidence value={v.confidence} /></div>
                  </div>
                  {v.summary && <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>{v.summary}</p>}
                  {v.requirements.length === 0 ? (
                    <div style={{ marginTop: 14, fontSize: 12, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center", borderTop: "1px solid var(--c-line)", paddingTop: 12 }}>
                      <Icon name="flag" size={13} /> This verdict did not record per-requirement findings.
                    </div>
                  ) : (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                      {v.requirements.map((req, i) => {
                        const st = reqState(req.met);
                        return (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr 80px", gap: 10, alignItems: "start", padding: "8px 0", borderTop: "1px solid var(--c-line)" }}>
                            <Icon name={REQ_ICON[st]} size={14} stroke={2.3} style={{ color: REQ_COLOR[st], marginTop: 2 }} />
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{req.requirement}</span>
                              {req.evidence && <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--c-ink-3)", lineHeight: 1.45, fontStyle: "italic" }}>{"↳ "}{req.evidence}</div>}
                            </div>
                            <span className="mono" style={{ fontSize: 10.5, color: st === "pass" ? "var(--c-ok)" : st === "review" ? "var(--c-warn)" : "var(--c-ink-3)", textAlign: "right" }}>
                              {st === "pass" ? "met" : st === "review" ? "partial" : "not met"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </Zone>

          {/* interview scorecards, no endpoint wired yet */}
          <Zone title="Interview scorecards" icon="fileText">
            <EmptyState title="No scorecards yet" body="When interviewers submit structured feedback, their scorecards and ratings appear here." />
          </Zone>

          {/* parsed resume, no endpoint wired yet */}
          <Zone title="Parsed resume" icon="fileText" ai action={c.resumeUrl ? "View source" : undefined} onAction={c.resumeUrl ? () => { window.open(c.resumeUrl, "_blank", "noopener"); } : undefined}>
            <EmptyState
              title="No parsed resume"
              body={c.resumeUrl ? "The resume-parser has not produced structured fields for this candidate yet." : "No resume is attached to this candidate."}
              actions={c.resumeUrl ? <a href={c.resumeUrl} target="_blank" rel="noopener"><Btn variant="soft" size="sm" icon="fileText">Open resume</Btn></a> : undefined}
            />
          </Zone>

          {/* activity, no endpoint wired yet */}
          <Zone title="Activity" icon="bolt">
            <EmptyState title="No activity yet" body="Stage moves, screenings, scorecards, and messages will form a timeline here." />
          </Zone>
        </div>

        {/* right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {!blind && (
            <Zone title="Snapshot" icon="users">
              {([
                ["Stage", stage.label],
                ["Requisition", c.requisitionId || "-"],
                ["Source", c.source || "-"],
                ["Applied", fmtDate(c.appliedAt)],
                ["Email", c.email || "-"],
                ["Location", c.location || "-"],
                ["Time in stage", c.timeInStageDays != null ? `${c.timeInStageDays}d` : "-"],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderTop: "1px solid var(--c-line)", fontSize: 12.5 }}>
                  <span style={{ color: "var(--c-ink-3)" }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{v}</span>
                </div>
              ))}
            </Zone>
          )}

          {/* notes, no endpoint wired yet */}
          <Zone title="Notes" icon="fileText">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
              <textarea rows={2} placeholder="Add a private team note..." disabled
                style={{ width: "100%", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", fontSize: 12.5, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none" }} />
            </div>
            <EmptyState title="No notes yet" body="Private team notes are not wired up yet. They will thread here, newest first." />
          </Zone>

          {/* advisory next-steps map */}
          <NextSteps />
        </div>
      </div>
    </div>
  );
}
