"use client";
// components/cd/AssessmentBuilder.tsx
// SLICE G10  -  a FORK of RequisitionBuilder's FormBuilder, extended from a plain
// application form into a GRADED assessment builder. It reuses the same
// three-column shape (palette · canvas · preview), the relabel-in-place / require
// toggle / reorder / per-field settings interactions, and the live candidate
// preview  -  but the field model is the WF1 graded question model:
//   type      MCQ_SINGLE | MCQ_MULTI | TRUE_FALSE | SHORT_ANSWER | ESSAY | CODING
//   points    integer score weight (default 1)
//   timeLimit optional per-question time cap in seconds
//   correctAnswer  the auto-grade key for deterministic items (option id(s) or a
//                  canonical short-answer string). ESSAY/CODING leave it unset  - 
//                  they are graded server-side (LLM rubric / Judge0), never here.
//
// Real-data-only: the builder edits the tenant's real authoring tree; the parent
// (assessment-builder-live) loads it from and saves it to the backend. The
// preview deliberately does NOT reveal correctAnswer (the candidate never sees
// the key  -  that boundary is enforced server-side too, but the author preview
// here also omits it so it reads exactly as a candidate would experience it).
import React, { useState } from "react";
import { fStyles } from "./aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon, type IconName } from "./icon";

/* ──────────────────────── question model ──────────────────────── */
export type QType = "MCQ_SINGLE" | "MCQ_MULTI" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "CODING";

export interface BuilderOption { id: string; label: string }
export interface BuilderQuestion {
  id: string;
  type: QType;
  prompt: string;
  required: boolean;
  points: number;
  timeLimit?: number | null;
  order: number;
  options?: BuilderOption[];          // MCQ_* / TRUE_FALSE
  correctAnswer?: string | string[];  // auto-grade key (option id(s) or string)
  language?: string;                  // CODING
  starterCode?: string;              // CODING
}

export interface AssessmentBuilderData { questions: BuilderQuestion[] }

const TYPE_META: Record<QType, { label: string; icon: IconName; auto: boolean }> = {
  MCQ_SINGLE: { label: "Multiple choice", icon: "listChecks", auto: true },
  MCQ_MULTI: { label: "Select many", icon: "listChecks", auto: true },
  TRUE_FALSE: { label: "True / False", icon: "check", auto: true },
  SHORT_ANSWER: { label: "Short answer", icon: "type", auto: true },
  ESSAY: { label: "Essay", icon: "scroll", auto: false },
  CODING: { label: "Coding", icon: "terminal", auto: false },
};

const PALETTE: { type: QType; label: string; icon: IconName }[] = [
  { type: "MCQ_SINGLE", label: "Multiple choice", icon: "listChecks" },
  { type: "MCQ_MULTI", label: "Select many", icon: "listChecks" },
  { type: "TRUE_FALSE", label: "True / False", icon: "check" },
  { type: "SHORT_ANSWER", label: "Short answer", icon: "type" },
  { type: "ESSAY", label: "Essay", icon: "scroll" },
  { type: "CODING", label: "Coding", icon: "terminal" },
];

const cfgLabel: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", margin: "10px 0 5px" };
const cfgInput: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", fontSize: 12.5, outline: "none", fontFamily: "var(--font-sans)" };

let SEQ = 0;
function uid(prefix: string): string { return `${prefix}${Date.now().toString(36)}${(SEQ++).toString(36)}`; }

function defaultsFor(type: QType, order: number): BuilderQuestion {
  const base: BuilderQuestion = { id: uid("q"), type, prompt: "New question", required: true, points: 1, order };
  if (type === "MCQ_SINGLE" || type === "MCQ_MULTI") {
    base.options = [{ id: uid("o"), label: "Option 1" }, { id: uid("o"), label: "Option 2" }];
    base.correctAnswer = type === "MCQ_MULTI" ? [] : "";
  }
  if (type === "TRUE_FALSE") {
    const t = uid("o"), f = uid("o");
    base.options = [{ id: t, label: "True" }, { id: f, label: "False" }];
    base.correctAnswer = "";
  }
  if (type === "SHORT_ANSWER") base.correctAnswer = "";
  if (type === "CODING") { base.language = "python"; base.starterCode = ""; }
  return base;
}

export function AssessmentBuilder({
  data, title = "Untitled assessment", status = "DRAFT", version, onPublish, onSaveDraft, publishState,
}: {
  data: AssessmentBuilderData;
  title?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  version?: number;
  onPublish?: (questions: BuilderQuestion[]) => void;
  onSaveDraft?: (questions: BuilderQuestion[]) => void;
  publishState?: "idle" | "saving" | "saved" | "error";
}) {
  // Snapshot the loaded tree into local edit state on mount (the parent's
  // background refresh never clobbers in-progress edits  -  same idiom as FormBuilder).
  const [questions, setQuestions] = useState<BuilderQuestion[]>(data.questions.map((q) => ({ ...q })));
  const [sel, setSel] = useState<string | null>(data.questions[0]?.id ?? null);
  const locked = status !== "DRAFT"; // PUBLISHED/ARCHIVED is immutable

  const add = (type: QType) => {
    if (locked) return;
    const q = defaultsFor(type, questions.length);
    setQuestions([...questions, q]);
    setSel(q.id);
  };
  const upd = (id: string, patch: Partial<BuilderQuestion>) =>
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const remove = (id: string) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
    setSel((s) => (s === id ? null : s));
  };
  const move = (i: number, dir: number) => {
    const j = i + dir; if (j < 0 || j >= questions.length) return;
    const n = [...questions]; [n[i], n[j]] = [n[j], n[i]]; setQuestions(n);
  };

  // Option editing (MCQ / TRUE_FALSE).
  const addOption = (q: BuilderQuestion) => upd(q.id, { options: [...(q.options ?? []), { id: uid("o"), label: `Option ${(q.options?.length ?? 0) + 1}` }] });
  const updOption = (q: BuilderQuestion, oid: string, label: string) =>
    upd(q.id, { options: (q.options ?? []).map((o) => (o.id === oid ? { ...o, label } : o)) });
  const removeOption = (q: BuilderQuestion, oid: string) => {
    const options = (q.options ?? []).filter((o) => o.id !== oid);
    // drop the removed id from any correctAnswer key
    let ca = q.correctAnswer;
    if (Array.isArray(ca)) ca = ca.filter((k) => k !== oid);
    else if (ca === oid) ca = "";
    upd(q.id, { options, correctAnswer: ca });
  };
  const setSingleCorrect = (q: BuilderQuestion, oid: string) => upd(q.id, { correctAnswer: oid });
  const toggleMultiCorrect = (q: BuilderQuestion, oid: string) => {
    const cur = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
    upd(q.id, { correctAnswer: cur.includes(oid) ? cur.filter((k) => k !== oid) : [...cur, oid] });
  };

  const selQ = questions.find((q) => q.id === sel) ?? null;
  const totalPoints = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);
  const pubLabel = publishState === "saving" ? "Publishing..." : publishState === "saved" ? "Published" : publishState === "error" ? "Retry" : "Publish";
  const pubIcon: IconName = publishState === "saved" ? "check" : "arrowUpRight";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "210px 1fr 1fr", gap: 16, alignItems: "start" }} className="assessment-builder-grid">
      {/* ── palette ── */}
      <div>
        <div style={{ ...fStyles.label, marginBottom: 10 }}>Add a question</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {PALETTE.map((p) => (
            <button key={p.type} disabled={locked} onClick={() => add(p.type)}
              style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", cursor: locked ? "not-allowed" : "pointer", opacity: locked ? 0.5 : 1, fontSize: 12.5, fontWeight: 600, color: "var(--ink)", textAlign: "left", fontFamily: "var(--font-sans)", transition: "all var(--t-fast)" }}
              onMouseEnter={(e) => { if (!locked) { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.background = "var(--brand-tint)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}>
              <Icon name={p.icon} size={15} style={{ color: "var(--ink-3)" }} />{p.label}
              <Icon name="plus" size={13} style={{ marginLeft: "auto", color: "var(--ink-3)" }} />
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: "var(--r)", background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Questions</span><b className="mono">{questions.length}</b></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total points</span><b className="mono">{totalPoints}</b></div>
        </div>
      </div>

      {/* ── canvas ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={fStyles.label}>Question structure · {questions.length}</div>
          {locked && <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 11, color: "var(--ink-3)" }}><Icon name="shield" size={12} /> {status} · read-only</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {questions.length === 0 && (
            <div style={{ padding: "20px 14px", borderRadius: "var(--r)", border: "1px dashed var(--line-strong)", background: "var(--surface-2)", color: "var(--ink-3)", fontSize: "var(--fs-sm)", textAlign: "center" }}>
              No questions yet. Pick a type from the left to add one.
            </div>
          )}
          {questions.map((q, i) => {
            const tm = TYPE_META[q.type];
            return (
              <div key={q.id} onClick={() => setSel(q.id)}
                style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid", borderColor: sel === q.id ? "var(--brand)" : "var(--line)", background: "var(--surface)", cursor: "pointer", boxShadow: sel === q.id ? "var(--ring)" : "var(--e1)" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={locked || i === 0} style={{ border: "none", background: "none", cursor: locked || i === 0 ? "default" : "pointer", color: "var(--ink-3)", opacity: locked || i === 0 ? 0.3 : 1, padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} style={{ transform: "rotate(180deg)" }} /></button>
                  <span className="mono" style={{ width: 18, textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--ink-3)" }}>{i + 1}</span>
                  <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={locked || i === questions.length - 1} style={{ border: "none", background: "none", cursor: locked || i === questions.length - 1 ? "default" : "pointer", color: "var(--ink-3)", opacity: locked || i === questions.length - 1 ? 0.3 : 1, padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} /></button>
                </div>
                <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--surface-2)", color: "var(--ink-2)" }}><Icon name={tm.icon} size={15} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input value={q.prompt} disabled={locked} onChange={(e) => upd(q.id, { prompt: e.target.value })} onClick={(e) => e.stopPropagation()}
                    style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{tm.label} · {q.points} pt{q.points === 1 ? "" : "s"}{tm.auto ? "" : " · manual / AI graded"}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); if (!locked) upd(q.id, { required: !q.required }); }} style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: "none", cursor: locked ? "default" : "pointer", color: q.required ? "var(--danger)" : "var(--ink-3)", background: q.required ? "var(--danger-tint)" : "var(--surface-2)" }}>{q.required ? "Required" : "Optional"}</button>
                {!locked && <button onClick={(e) => { e.stopPropagation(); remove(q.id); }} style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>}
              </div>
            );
          })}
        </div>

        {/* ── per-question settings ── */}
        {selQ && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", animation: "rise .25s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ ...fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="settings" size={13} /> Question settings</span>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{TYPE_META[selQ.type].label}</span>
            </div>

            <label style={cfgLabel}>Prompt</label>
            <textarea rows={2} disabled={locked} value={selQ.prompt} onChange={(e) => upd(selQ.id, { prompt: e.target.value })} style={{ ...cfgInput, resize: "vertical", lineHeight: 1.5 }} placeholder="What are you asking the candidate?" />

            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={cfgLabel}>Points</label>
                <input type="number" min={0} disabled={locked} value={selQ.points} onChange={(e) => upd(selQ.id, { points: Math.max(0, Number(e.target.value) || 0) })} className="mono" style={cfgInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={cfgLabel}>Time limit (sec)</label>
                <input type="number" min={1} disabled={locked} value={selQ.timeLimit ?? ""} onChange={(e) => { const v = e.target.value === "" ? null : Math.max(1, Number(e.target.value) || 1); upd(selQ.id, { timeLimit: v }); }} className="mono" style={cfgInput} placeholder="inherits cap" />
              </div>
            </div>

            {/* options + correct answer for MCQ / TRUE_FALSE */}
            {(selQ.type === "MCQ_SINGLE" || selQ.type === "MCQ_MULTI" || selQ.type === "TRUE_FALSE") && (
              <>
                <label style={cfgLabel}>
                  Choices · {selQ.type === "MCQ_MULTI" ? "tick every correct option" : "tick the one correct option"}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(selQ.options ?? []).map((o) => {
                    const checked = selQ.type === "MCQ_MULTI"
                      ? Array.isArray(selQ.correctAnswer) && selQ.correctAnswer.includes(o.id)
                      : selQ.correctAnswer === o.id;
                    return (
                      <div key={o.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button type="button" disabled={locked} title="Mark correct"
                          onClick={() => (selQ.type === "MCQ_MULTI" ? toggleMultiCorrect(selQ, o.id) : setSingleCorrect(selQ, o.id))}
                          style={{ width: 22, height: 22, flexShrink: 0, borderRadius: selQ.type === "MCQ_MULTI" ? 6 : 99, border: "1.5px solid", borderColor: checked ? "var(--ok)" : "var(--line-strong)", background: checked ? "var(--ok)" : "transparent", color: "white", display: "grid", placeItems: "center", cursor: locked ? "default" : "pointer" }}>
                          {checked && <Icon name="check" size={13} stroke={2.4} />}
                        </button>
                        <input value={o.label} disabled={locked || selQ.type === "TRUE_FALSE"} onChange={(e) => updOption(selQ, o.id, e.target.value)} style={{ ...cfgInput, flex: 1 }} />
                        {!locked && selQ.type !== "TRUE_FALSE" && (selQ.options?.length ?? 0) > 2 && (
                          <button onClick={() => removeOption(selQ, o.id)} style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Icon name="x" size={13} /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!locked && selQ.type !== "TRUE_FALSE" && (
                  <button onClick={() => addOption(selQ)} style={{ marginTop: 8, display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 10px", borderRadius: "var(--r-pill)", border: "1px dashed var(--line-strong)", background: "transparent", color: "var(--ink-2)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-sans)" }}><Icon name="plus" size={13} /> Add option</button>
                )}
              </>
            )}

            {/* canonical answer for SHORT_ANSWER */}
            {selQ.type === "SHORT_ANSWER" && (
              <>
                <label style={cfgLabel}>Expected answer (auto-graded, exact match)</label>
                <input disabled={locked} value={typeof selQ.correctAnswer === "string" ? selQ.correctAnswer : ""} onChange={(e) => upd(selQ.id, { correctAnswer: e.target.value })} style={cfgInput} placeholder="The canonical correct response" />
              </>
            )}

            {/* coding config */}
            {selQ.type === "CODING" && (
              <>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={cfgLabel}>Language</label>
                    <select disabled={locked} value={selQ.language ?? "python"} onChange={(e) => upd(selQ.id, { language: e.target.value })} style={{ ...cfgInput, cursor: "pointer" }}>
                      {["python", "javascript", "typescript", "java", "cpp", "csharp", "go", "ruby"].map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <label style={cfgLabel}>Starter code (optional)</label>
                <textarea rows={4} disabled={locked} value={selQ.starterCode ?? ""} onChange={(e) => upd(selQ.id, { starterCode: e.target.value })} className="mono" style={{ ...cfgInput, resize: "vertical", lineHeight: 1.5, fontSize: 12 }} placeholder={"def solution():\n    pass"} />
                <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  <Icon name="cpu" size={14} style={{ color: "var(--ai)", flexShrink: 0, marginTop: 1 }} />
                  <span>Coding submissions are run against your hidden test cases by <b style={{ color: "var(--ai-ink)" }}>Judge0</b> and scored from the real run results. There is no manual key here.</span>
                </div>
              </>
            )}

            {/* essay note */}
            {selQ.type === "ESSAY" && (
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "flex-start", fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                <Icon name="sparkles" size={14} style={{ color: "var(--ai)", flexShrink: 0, marginTop: 1 }} />
                <span>Essays are graded against an <b style={{ color: "var(--ai-ink)" }}>AI rubric</b> with a human reviewer in the loop  -  there is no auto-key. A person always confirms the score.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── live candidate preview ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ ...fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Candidate preview</span>
          {!locked && (
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="soft" size="sm" icon="clock" onClick={() => onSaveDraft?.(questions)}>Save draft</Btn>
              <Btn variant="primary" size="sm" icon={pubIcon} onClick={() => { if (publishState !== "saving") onPublish?.(questions); }}>{pubLabel}</Btn>
            </div>
          )}
        </div>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 16 }}>
            {questions.length} question{questions.length === 1 ? "" : "s"} · {totalPoints} point{totalPoints === 1 ? "" : "s"}{version ? ` · v${version}` : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {questions.map((q, i) => (
              <div key={q.id}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 7 }}>
                  <span className="mono" style={{ color: "var(--ink-3)", marginRight: 6 }}>{i + 1}.</span>
                  {q.prompt || <span style={{ color: "var(--ink-3)" }}>Untitled question</span>}
                  {q.required && <span style={{ color: "var(--danger)" }}> *</span>}
                  <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 500, marginLeft: 6 }}>· {q.points} pt{q.points === 1 ? "" : "s"}</span>
                </label>
                {/* NB: correctAnswer is NEVER shown  -  this preview reads exactly as a candidate sees it. */}
                {(q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI" || q.type === "TRUE_FALSE") ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {(q.options ?? []).map((o) => (
                      <div key={o.id} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)" }}>
                        <span style={{ width: 17, height: 17, flexShrink: 0, borderRadius: q.type === "MCQ_MULTI" ? 5 : 99, border: "1.5px solid var(--line-strong)" }} />
                        {o.label}
                      </div>
                    ))}
                  </div>
                ) : q.type === "SHORT_ANSWER" ? (
                  <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)" }} />
                ) : q.type === "ESSAY" ? (
                  <div style={{ height: 80, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)" }} />
                ) : (
                  <div style={{ borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", padding: "10px 12px", fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-mono, monospace)", minHeight: 64, whiteSpace: "pre-wrap" }}>
                    {q.starterCode ? q.starterCode : `// ${q.language ?? "code"} editor`}
                  </div>
                )}
              </div>
            ))}
            {questions.length > 0 && (
              <button disabled style={{ marginTop: 4, padding: "10px", borderRadius: "var(--r)", border: "none", background: "var(--brand)", color: "var(--on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "default", opacity: 0.85, fontFamily: "var(--font-sans)" }}>Submit assessment</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
