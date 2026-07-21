"use client";
// components/screens/CandidateProfile.tsx
// Candidate profile (/candidates/[id]), ported pixel-exact from cand-profile.jsx:
// multi-zone layout (screening verdict, scorecards, parsed resume, activity, snapshot,
// notes, AI next steps), prev/next navigation, and blind / bias-reduced mode.
// Data via props. Notes are composed from a popover anchored on the header's
// "Add note" button (see NoteComposer below); onAddNote persists via the parent
// and `notes` renders whatever the parent currently has (no local snapshot), so
// a successful save shows up as soon as the parent's data refreshes.
import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "../icon";
import { Btn, StatusBadge } from "../aurora-ui";
import { Pill, ScoreRing, Confidence, Timeline } from "../aurora-kit";
import { Slot } from "@/lib/registry/slots";
import { useUiConfig } from "@/lib/config/ui-config-provider";
import { useFieldVisibility } from "@/lib/visibility";
import type { CandidateProfileData, CandStage, TimelineItem } from "../types";

const pStCol = (s: string) => (s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : "var(--danger)");
const pStIc = (s: string): IconName => (s === "pass" ? "check" : s === "review" ? "eye" : "x");
// Real per-requirement status text + tint, mapped from the screener's met/partial/unmet
// verdict. No fabricated weight% or x/10 sub-score — those are not measured.
const pStTxt = (s: string) => (s === "pass" ? "Met" : s === "review" ? "Partial" : "Not met");
const pStBg = (s: string) => (s === "pass" ? "var(--ok-tint)" : s === "review" ? "var(--warn-tint)" : "var(--danger-tint)");
const LABEL: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" };

function Zone({ title, icon, ai, action, children, onAction }: { title: string; icon: IconName; ai?: boolean; action?: string; children: React.ReactNode; onAction?: () => void }) {
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ display: "flex", gap: 9, alignItems: "center", fontWeight: 700, fontSize: "var(--fs-md)" }}>
          <Icon name={icon} size={16} style={{ color: ai ? "var(--ai)" : "var(--ink-3)" }} />{title}
          {ai && <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9.5 }}>AI</Pill>}
        </div>
        {action && <button onClick={onAction} style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center" }}>{action}<Icon name="chevR" size={13} /></button>}
      </div>
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function RatingDots({ n }: { n: number }) {
  return <span style={{ display: "inline-flex", gap: 3 }}>{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: i < Math.round(n) ? "var(--brand)" : "var(--surface-3)" }} />)}</span>;
}

export function CandidateProfile({ data, stages = [], idx = 0, total = 1, blind = false, onNav, onBack, onToggleBlind, onVerdict, onAllFeedback, onAddNote, onDeleteNote, onSchedule, onAdvance, onViewSource }: {
  data: CandidateProfileData; stages?: CandStage[]; idx?: number; total?: number; blind?: boolean;
  onNav?: (dir: number) => void; onBack?: () => void; onToggleBlind?: () => void; onVerdict?: () => void;
  onAllFeedback?: () => void;
  onAddNote?: (text: string) => void | Promise<void>; onDeleteNote?: (noteId: string) => void | Promise<void>;
  onSchedule?: () => void; onAdvance?: () => void; onViewSource?: () => void;
}) {
  const { candidate: c, applied, email, phone, verdict: s, scorecards = [], parsed, activity = [], notes = [], nextSteps = [] } = data;
  // Popover draft: lives independently of whether the popover is open, so closing
  // it (click outside) does not lose what was typed — the button below shows a
  // dot while a draft is pending, and reopening restores it.
  const [noteDraft, setNoteDraft] = useState("");
  const [notePopoverOpen, setNotePopoverOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const submitNote = async () => {
    const text = noteDraft.trim();
    if (!text || savingNote) return;
    setSavingNote(true);
    try {
      await onAddNote?.(text);
      setNoteDraft("");
      setNotePopoverOpen(false);
    } catch {
      // Save failed — keep the popover open and the draft intact (the parent's
      // onAddNote is expected to toast the specific error) rather than silently
      // discarding what the user wrote.
    } finally {
      setSavingNote(false);
    }
  };
  // Delete is a two-click arm/confirm on the note's own row (see the notes list
  // below) — no modal, consistent with the note popover's own lightweight,
  // click-outside-friendly style. Armed state clears on any outside click, on
  // opening the note popover, or once the delete completes.
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const confirmDelete = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      await onDeleteNote?.(noteId);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };
  const name = blind ? "Candidate " + (c.id || "C1").toUpperCase() : c.name;
  const stageLabel = stages.find((x) => x.id === c.stage)?.label || "Screening";

  // "Suggested next steps" mini-stepper: this used to be four HARDCODED labels
  // (Screened / You're here / Interview / Decide) regardless of the candidate's
  // real stage — on anyone not literally between Screened and Interview it was
  // simply wrong (most visibly: it still said "you're here" there for a
  // candidate who had since been REJECTED). Now it's a real 4-wide window over
  // the tenant's actual ordered stages, centered on wherever the candidate
  // really is. HIRED/REJECTED/WITHDRAWN are terminal — a forward-looking
  // "what's next" stepper doesn't apply once the pipeline has ended, so those
  // render a plain status line instead (see the render below).
  const TERMINAL_STAGES = new Set(["HIRED", "REJECTED", "WITHDRAWN"]);
  const isTerminal = TERMINAL_STAGES.has(c.stage);
  const activeStages = stages.filter((s) => !TERMINAL_STAGES.has(s.id));
  const curIdx = activeStages.findIndex((s) => s.id === c.stage);
  const winStart = Math.max(0, Math.min(curIdx - 1, activeStages.length - 4));
  const stepWindow = activeStages.slice(winStart, winStart + 4);
  const curWinIdx = curIdx - winStart;

  // D6 / WF-B slot seams — the resolved per-tenant UiConfig (fail-soft all-enabled
  // when unauthored) + the live route key drive which custom blocks mount. The
  // typed `slotCtx` hands each bound block the REAL candidate entity (no fabricated
  // fields, identity respects blind mode). An empty slot renders nothing, so the
  // screen is byte-identical until a tenant binds something.
  const { config: uiConfig } = useUiConfig();
  const { canSee } = useFieldVisibility(); // Module I — gate score + notes by policy
  const pathname = usePathname() ?? "";
  const slotCtx = {
    candidateId: c.id,
    candidate: c,
    stage: c.stage,
    stageLabel,
    verdict: s,
    blind,
    route: pathname,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 26px", borderBottom: "1px solid var(--line)", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}><Icon name="chevsL" size={14} /> Candidates</button>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{idx + 1} of {total}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => onNav?.(-1)} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={16} style={{ transform: "rotate(180deg)" }} /></button>
          <button onClick={() => onNav?.(1)} style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={16} /></button>
        </div>
        <div style={{ width: 1, height: 22, background: "var(--line)" }} />
        <button onClick={onToggleBlind} title="Hide identity to reduce bias" style={{ display: "inline-flex", gap: 8, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: blind ? "transparent" : "var(--line-2)", background: blind ? "var(--ai-tint)" : "var(--surface)", color: blind ? "var(--ai-ink)" : "var(--ink-2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          <span style={{ width: 26, height: 15, borderRadius: 99, background: blind ? "var(--ai)" : "var(--line-strong)", position: "relative", transition: "background var(--t)" }}>
            <span style={{ position: "absolute", top: 2, left: blind ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
          </span><Icon name="eye" size={14} /> Blind review
        </button>
      </div>

      {blind && (
        <div style={{ padding: "8px 26px", background: "var(--ai-tint)", borderBottom: "1px solid color-mix(in oklab, var(--ai) 18%, transparent)", fontSize: 12, color: "var(--ai-ink)", display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}>
          <Icon name="shield" size={14} /> Blind review on, name, photo, location, and contact are hidden so you assess skills, not identity.
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px 50px" }}>
        {/* D6 — candidate.detail.before: a custom block at the top of the candidate
            detail content, before the identity header. Empty -> nothing. */}
        <Slot id="candidate.detail.before" config={uiConfig} route="candidate.detail" ctx={slotCtx} />
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
          <span className="mono" style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 20, background: blind ? "var(--surface-3)" : "linear-gradient(135deg, var(--brand), var(--ai))", color: blind ? "var(--ink-3)" : "white" }}>{blind ? "•" : c.ini}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{name}</h1>
              <Pill mono>{c.reqId}</Pill>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--info)" }} />{stageLabel}</span>
            </div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 3 }}>{c.role}{blind ? "" : ` · ${c.loc} · ${c.source} · applied ${applied}`}</div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn variant="soft" icon="calendar" onClick={onSchedule}>Schedule</Btn>
            <div style={{ position: "relative" }}>
              <Btn variant="soft" icon="fileText" onClick={() => setNotePopoverOpen((o) => !o)} style={{ position: "relative" }}>
                Add note
                {/* Draft dot: a note was started but not saved. No separate pane or
                    label change — just this, per the "don't make it clumsy" ask. */}
                {!notePopoverOpen && noteDraft.trim() !== "" && (
                  <span title="Unsaved draft" style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: 99, background: "var(--warn)", border: "1.5px solid var(--surface)" }} />
                )}
              </Btn>
              {notePopoverOpen && (
                <>
                  {/* Click-outside-to-close backdrop — closing this way keeps the
                      draft (submitNote is the only path that clears it). */}
                  <div onClick={() => setNotePopoverOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 59 }} />
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, zIndex: 60, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", boxShadow: "var(--e3)", padding: 14 }}>
                    <textarea
                      autoFocus
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote(); }}
                      rows={4}
                      placeholder="Add a private team note…"
                      style={{ width: "100%", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 12.5, fontFamily: "var(--font-sans)", resize: "vertical", outline: "none" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                      <Btn
                        variant="primary" size="sm" icon="plus"
                        onClick={savingNote ? undefined : submitNote}
                        style={{ opacity: savingNote || !noteDraft.trim() ? 0.6 : 1, cursor: savingNote || !noteDraft.trim() ? "not-allowed" : "pointer" }}
                      >
                        {savingNote ? "Saving…" : "Save note"}
                      </Btn>
                    </div>
                  </div>
                </>
              )}
            </div>
            <Btn variant="primary" icon="check" onClick={onAdvance}>Advance</Btn>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.65fr 1fr", gap: 18, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Zone title="AI screening verdict" icon="scan" ai action="Open full verdict" onAction={onVerdict}>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <ScoreRing value={canSee("alignmentScore") ? s.score : 0} size={84} band="var(--ai)" label={canSee("alignmentScore") ? "match %" : "hidden"} />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{s.band}</span><StatusBadge kind="review" />
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{s.summary}</p>
                </div>
                <div style={{ width: 200 }}><Confidence value={s.confidence} /></div>
              </div>
              {/* Mandated alignment dimensions: technical skills match + experience
                  relevance. DERIVED from the real requirement findings (see
                  candidate-profile-live). Gated by the same alignment-score policy;
                  honest "Not scored" when no finding maps to the dimension. */}
              {canSee("alignmentScore") && s.dimensions && s.dimensions.length > 0 && (
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {s.dimensions.map((d) => {
                    const col = d.scored ? pStCol(d.state || "review") : "var(--ink-3)";
                    const bg = d.scored ? pStBg(d.state || "review") : "var(--surface-2)";
                    return (
                      <div key={d.key} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: bg, padding: "11px 13px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>{d.label}</span>
                          {d.scored ? (
                            <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: col }}>{d.pct}%</span>
                          ) : (
                            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-3)" }}>Not scored</span>
                          )}
                        </div>
                        {d.scored ? (
                          <>
                            <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: "var(--surface-3)", overflow: "hidden" }}>
                              <div style={{ width: `${Math.max(0, Math.min(100, d.pct ?? 0))}%`, height: "100%", background: col, borderRadius: 99 }} />
                            </div>
                            <div style={{ marginTop: 6, fontSize: 11, color: "var(--ink-3)" }}>
                              {d.met}/{d.total} requirement{(d.total ?? 0) === 1 ? "" : "s"} met
                            </div>
                          </>
                        ) : (
                          <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-3)", lineHeight: 1.4 }}>
                            No matching requirement in this verdict.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {s.requirements.map((r) => (
                  <div key={r.id} style={{ padding: "7px 0", borderTop: "1px solid var(--line)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 10, alignItems: "center" }}>
                      <Icon name={pStIc(r.state)} size={14} stroke={2.3} style={{ color: pStCol(r.state) }} />
                      <span style={{ fontSize: 12.5, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>{r.label}{r.custom && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ fontSize: 9 }}>custom</Pill>}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: pStCol(r.state), background: pStBg(r.state), padding: "2px 8px", borderRadius: "var(--r-pill)", whiteSpace: "nowrap" }}>{pStTxt(r.state)}</span>
                    </div>
                    {r.note && <div style={{ marginLeft: 30, marginTop: 4, fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.45, fontStyle: "italic" }}>↳ {r.note}</div>}
                  </div>
                ))}
              </div>
              {canSee("alignmentScore") && (s.strengths.length > 0 || s.missing.length > 0) && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                  {s.strengths.length > 0 && (
                    <div>
                      <div style={{ ...LABEL, marginBottom: 7, display: "flex", gap: 6, alignItems: "center" }}>
                        <Icon name="check" size={12} stroke={2.3} style={{ color: "var(--ok)" }} /> Strengths
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {s.strengths.map((t, i) => (
                          <Pill key={i} tone="var(--ok)" bg="var(--ok-tint)" style={{ textTransform: "none" }}>{t}</Pill>
                        ))}
                      </div>
                    </div>
                  )}
                  {s.missing.length > 0 && (
                    <div>
                      <div style={{ ...LABEL, marginBottom: 7, display: "flex", gap: 6, alignItems: "center" }}>
                        <Icon name="x" size={12} stroke={2.3} style={{ color: "var(--danger)" }} /> Missing skills
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {s.missing.map((t, i) => (
                          <Pill key={i} tone="var(--danger)" bg="var(--danger-tint)" style={{ textTransform: "none" }}>{t}</Pill>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Zone>

            <Zone title="Interview scorecards" icon="fileText" action="All feedback" onAction={onAllFeedback}>
              {scorecards.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {scorecards.map((sc, i) => (
                    <div key={i} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", padding: 14, background: "var(--surface-2)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                          <span className="mono" style={{ width: 28, height: 28, borderRadius: 99, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--ink-2)" }}>{sc.who.split(" ").map((w) => w[0]).join("")}</span>
                          <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{blind ? "Interviewer " + (i + 1) : sc.who}</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>{sc.role}</div></div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{sc.overall}</span>
                          <Pill tone={sc.recTone === "ok" ? "var(--ok)" : "var(--warn)"} bg={sc.recTone === "ok" ? "var(--ok-tint)" : "var(--warn-tint)"}>{sc.rec}</Pill>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
                        {sc.dims.map((d) => <div key={d.d} style={{ display: "flex", gap: 7, alignItems: "center" }}><span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{d.d}</span><RatingDots n={d.s} /></div>)}
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45, fontStyle: "italic" }}>&ldquo;{sc.note}&rdquo;</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)" }}>No interview feedback yet.</p>}
            </Zone>

            <Zone title="Parsed résumé" icon="fileText" ai action="View source" onAction={onViewSource}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ ...LABEL, marginBottom: 8 }}>Fields</div>
                  {parsed.fields.slice(0, 5).map((f) => (
                    <div key={f.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "5px 0", borderTop: "1px solid var(--line)", fontSize: 12 }}>
                      <span style={{ color: "var(--ink-3)" }}>{f.k}</span>
                      <span style={{ fontWeight: 600, display: "inline-flex", gap: 5, alignItems: "center" }}>{f.c < 0.7 && <Icon name="flag" size={11} style={{ color: "var(--warn)" }} />}{blind && (f.k === "Full name" || f.k === "Email" || f.k === "Phone" || f.k === "Location") ? "hidden" : f.v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ ...LABEL, marginBottom: 8 }}>Skills · confidence</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {parsed.skills.map((sk) => <span key={sk.n} style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "3px 8px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: sk.c < 0.7 ? "var(--warn-tint)" : "var(--surface-2)", color: sk.c < 0.7 ? "var(--warn)" : "var(--ink)", border: "1px solid var(--line)" }}>{sk.c < 0.7 && <Icon name="flag" size={10} />}{sk.n}</span>)}
                  </div>
                  {parsed.honestyFlag && (
                    <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: "var(--r)", background: "var(--warn-tint)", fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.4 }}>
                      <b style={{ color: "var(--warn)" }}>Honesty flag:</b> {parsed.honestyFlag}
                    </div>
                  )}
                </div>
              </div>
            </Zone>

            <Zone title="Activity" icon="bolt">
              {activity.length ? <Timeline items={activity} /> : <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)" }}>No activity yet.</p>}
            </Zone>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* D6 — candidate.detail.sidebar: a custom block in the candidate detail
                right rail, above the Snapshot card. Empty -> nothing. */}
            <Slot id="candidate.detail.sidebar" config={uiConfig} route="candidate.detail" ctx={slotCtx} />
            {!blind && (
              <Zone title="Snapshot" icon="users">
                {([["Stage", stageLabel], ["Requisition", c.reqId], ["Source", c.source], ["Applied", applied], ["Email", email], ["Phone", phone]] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "7px 0", borderTop: "1px solid var(--line)", fontSize: 12.5 }}>
                    <span style={{ color: "var(--ink-3)" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </Zone>
            )}
            {canSee("recruiterNotes") && (
            <Zone title="Notes" icon="fileText" action={notes.length ? undefined : "Add note"} onAction={notes.length ? undefined : () => setNotePopoverOpen(true)}>
              {notes.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-3)" }}>No notes yet — use "Add note" above to start one.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {notes.map((n, i) => {
                    const key = n.id ?? String(i);
                    const armed = confirmDeleteId === key;
                    const busy = deletingId === key;
                    return (
                      <div key={key}
                        onMouseEnter={() => setHoveredNoteId(key)}
                        onMouseLeave={() => setHoveredNoteId((h) => (h === key ? null : h))}
                        style={{ display: "flex", gap: 10, position: "relative" }}>
                        <span className="mono" style={{ width: 26, height: 26, borderRadius: 99, flexShrink: 0, background: "var(--surface-3)", display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, color: "var(--ink-2)" }}>{n.ini}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, marginBottom: 2 }}><b>{n.who}</b> <span className="mono" style={{ color: "var(--ink-3)", fontSize: 10.5 }}>· {n.t}</span></div>
                          <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{n.text}</p>
                        </div>
                        {/* Only the author can undo their own note (an ADMIN override
                            exists server-side for moderation, not surfaced here to
                            keep this a plain "undo what I wrote" control). */}
                        {n.mine && onDeleteNote && (
                          armed ? (
                            <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, position: "relative", zIndex: 60 }}>
                              <span style={{ fontSize: 11, color: "var(--danger)", fontWeight: 600, marginRight: 2 }}>Delete?</span>
                              <button onClick={() => confirmDelete(key)} disabled={busy} title="Confirm delete" style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "var(--danger)", color: "white", display: "grid", placeItems: "center", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
                                <Icon name="check" size={12} stroke={3} />
                              </button>
                              <button onClick={() => setConfirmDeleteId(null)} disabled={busy} title="Cancel" style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                                <Icon name="x" size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(key)}
                              title="Delete this note"
                              style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 6, border: "none", background: "transparent", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", opacity: hoveredNoteId === key ? 1 : 0, transition: "opacity var(--t-fast)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-tint)"; e.currentTarget.style.color = "var(--danger)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-3)"; }}
                            >
                              <Icon name="x" size={13} />
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                  {/* Click-outside cancels an armed confirm, same language as the
                      note popover's own backdrop. */}
                  {confirmDeleteId && <div onClick={() => setConfirmDeleteId(null)} style={{ position: "fixed", inset: 0, zIndex: 55 }} />}
                </div>
              )}
            </Zone>
            )}
            <Zone title="Suggested next steps" icon="sparkles" ai>
              {isTerminal ? (
                // A forward "what's next" stepper does not apply once the
                // pipeline has ended — say so plainly instead of a stepper that
                // would (as it did before this fix) still point at some stage
                // in the middle of a process that is already over.
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 13px", marginBottom: 4, borderRadius: "var(--r)", background: c.stage === "HIRED" ? "var(--ok-tint)" : "var(--danger-tint)" }}>
                  <Icon name={c.stage === "HIRED" ? "check" : "x"} size={15} style={{ color: c.stage === "HIRED" ? "var(--ok)" : "var(--danger)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: c.stage === "HIRED" ? "var(--ok)" : "var(--danger)" }}>
                    {c.stage === "HIRED" ? "Hired — this pipeline is complete." : c.stage === "REJECTED" ? "Rejected — no further steps." : "Withdrawn — no further steps."}
                  </span>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 240 96" style={{ width: "100%", height: "auto", display: "block", marginBottom: 12 }} aria-hidden="true">
                    <defs><linearGradient id="cpNs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--ai)" /><stop offset="1" stopColor="var(--brand)" /></linearGradient></defs>
                    <path d="M16 72 H224" stroke="var(--line)" strokeWidth="1.5" />
                    {stepWindow.map((s, i) => {
                      const x = 40 + i * 56;
                      const passed = i <= curWinIdx;
                      return (
                        <g key={s.id}>
                          <line x1={x} y1="72" x2={i < stepWindow.length - 1 ? x + 56 : x} y2="72" stroke={passed ? "url(#cpNs)" : "var(--line-2)"} strokeWidth="2.5" />
                          <circle cx={x} cy="72" r={i === curWinIdx ? 8 : 6} fill={passed ? "url(#cpNs)" : "var(--surface)"} stroke={passed ? "none" : "var(--line-2)"} strokeWidth="2" />
                          {i === curWinIdx && <circle cx={x} cy="72" r="13" fill="none" stroke="var(--ai)" strokeWidth="1.5" opacity="0.4" />}
                        </g>
                      );
                    })}
                    {stepWindow.map((s, i) => {
                      const x = 40 + i * 56;
                      if (i === curWinIdx) {
                        // Smaller + italic + lowercase (unlike the all-caps real
                        // stage names around it): this is a POINTER at a stage
                        // ("you are here"), not a stage name itself — it read
                        // like a fifth peer stage before this differentiation,
                        // and was hardcoded to this position regardless of the
                        // candidate's real stage before this fix.
                        return <text key={s.id} x={x} y="44" textAnchor="middle" fontSize="7.5" fontStyle="italic" fontWeight="600" fill="var(--ai-ink)">you're here</text>;
                      }
                      // Real stage labels are now dynamic and can run to two
                      // words ("PHONE SCREEN", "TECHNICAL ROUND", "HR ROUND"),
                      // which collided with the fixed-width neighboring slot at
                      // a single line. Wrap onto a second line at the FIRST
                      // space instead of shrinking text to fit or truncating —
                      // both node-neighbor collisions and unreadably-tiny text
                      // would only get worse as tenants author longer stage
                      // names, so this is the one label treatment that stays
                      // correct regardless of label length.
                      const label = s.label.toUpperCase();
                      const spaceAt = label.indexOf(" ");
                      const lines = spaceAt === -1 ? [label] : [label.slice(0, spaceAt), label.slice(spaceAt + 1)];
                      const startY = lines.length === 2 ? 40 : 44;
                      return (
                        <text key={s.id} x={x} y={startY} textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--ink-3)">
                          {lines.map((line, li) => <tspan key={li} x={x} dy={li === 0 ? 0 : 9}>{line}</tspan>)}
                        </text>
                      );
                    })}
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {nextSteps.map((step) => (
                      <div key={step.title} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
                        <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)" }}><Icon name={step.icon} size={14} /></span>
                        <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 600 }}>{step.title}</div><div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{step.detail}</div></div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <p style={{ margin: "11px 2px 0", fontSize: 10.5, color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="shield" size={12} /> AI-suggested · you decide what happens next.</p>
            </Zone>
          </div>
        </div>
      </div>
    </div>
  );
}
