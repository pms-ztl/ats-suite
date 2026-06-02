"use client";
// app/(dashboard)/requisitions/[id]/page.tsx - VERBATIM Aurora port of
// claude-design/req-detail.jsx (ReqDetailScreen): back link + title/status header
// with actions, a five-tab rail (Overview, Pipeline, Interview rounds, Application
// form, Activity), the JD card + AI custom-screening-criteria card + Details/Owners
// side rail, the animated PipelineFlow funnel with conversion chevrons + stage stat
// cards, the interactive RoundsConfig (from claude-design/req-builder.jsx), the
// interactive FormBuilder (req-builder.jsx), and the Activity Timeline. Dynamic
// route: id read via useParams, wired to the real gateway via getRequisition(id)
// and getFunnel(). Sections the API does not provide (owners, activity, rounds,
// form) keep the prototype's exact structure with the prototype's example content.
import * as React from "react";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, CountUp, Timeline } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getRequisition, getFunnel } from "@/lib/api";
import type { Requisition, RequisitionStatus, CustomField, ApplicationStage } from "@/lib/types";

type CSS = React.CSSProperties;

/* status -> icon + label + tone/bg, keyed by the real RequisitionStatus enum
   (prototype window.REQ_STATUS, palette tokens converted to --c-*) */
const REQ_STATUS: Record<RequisitionStatus, { label: string; tone: string; bg: string; icon: string }> = {
  DRAFT: { label: "Draft", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)", icon: "dot" },
  OPEN: { label: "Open", tone: "var(--c-brand)", bg: "var(--c-brand-tint)", icon: "dot" },
  ON_HOLD: { label: "On hold", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "clock" },
  FILLED: { label: "Filled", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  CLOSED: { label: "Closed", tone: "var(--c-ink-2)", bg: "var(--c-surface-3)", icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x" },
};

/* custom-field importance -> label + tone/bg (prototype window.IMPORTANCE; keys
   normalized to handle both the design slugs and the real CustomField values) */
const IMPORTANCE: Record<string, { label: string; tone: string; bg: string }> = {
  "nice-to-have": { label: "Nice-to-have", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  "nice": { label: "Nice-to-have", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  "important": { label: "Important", tone: "var(--c-info)", bg: "var(--c-info-tint)" },
  "must-have": { label: "Must-have", tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)" },
  "must": { label: "Must-have", tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)" },
};

/* interview rounds (prototype window.ROUNDS) */
type Round = { id: string; name: string; type: string; dur: number; panel: string; auto: boolean; instr: string };
const ROUNDS: Round[] = [
  { id: "rd1", name: "Recruiter phone screen", type: "PHONE_SCREEN", dur: 30, panel: "Recruiter", auto: true, instr: "Motivation, comp expectations, role fit." },
  { id: "rd2", name: "Technical screen", type: "TECHNICAL", dur: 60, panel: "Senior Engineer", auto: true, instr: "Coding + systems fundamentals." },
  { id: "rd3", name: "System design", type: "TECHNICAL", dur: 60, panel: "Staff Engineer", auto: false, instr: "Design a payments ledger service." },
  { id: "rd4", name: "Behavioral & values", type: "BEHAVIORAL", dur: 45, panel: "Hiring Manager", auto: false, instr: "Ownership, collaboration, conflict." },
  { id: "rd5", name: "Final panel", type: "PANEL", dur: 90, panel: "Cross-functional", auto: false, instr: "Bar-raiser + 2 panelists." },
];
const ROUND_TYPES: Record<string, { label: string; tone: string }> = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--c-info)" },
  TECHNICAL: { label: "Technical", tone: "var(--c-ai)" },
  BEHAVIORAL: { label: "Behavioral", tone: "var(--c-brand)" },
  PANEL: { label: "Panel", tone: "var(--c-warn)" },
  FINAL: { label: "Final", tone: "var(--c-ok)" },
};

/* application form-builder fields (prototype window.FORM_FIELDS / FIELD_PALETTE) */
type FormField = { id: string; type: string; label: string; required: boolean; locked?: boolean; options?: string[] };
const FORM_FIELDS: FormField[] = [
  { id: "f1", type: "text", label: "Full name", required: true, locked: true },
  { id: "f2", type: "email", label: "Email address", required: true, locked: true },
  { id: "f3", type: "file", label: "Resume / CV", required: true, locked: true },
  { id: "f4", type: "text", label: "LinkedIn or portfolio URL", required: false },
  { id: "f5", type: "select", label: "Years of backend experience", required: true, options: ["0 to 2", "3 to 5", "6 to 9", "10+"] },
  { id: "f6", type: "textarea", label: "Why are you interested in payments infrastructure?", required: false },
  { id: "f7", type: "checkbox", label: "Are you authorized to work in the US?", required: true },
];
const FIELD_PALETTE = [
  { type: "text", label: "Short text", icon: "type" },
  { type: "textarea", label: "Long text", icon: "fileText" },
  { type: "select", label: "Dropdown", icon: "chevD" },
  { type: "checkbox", label: "Yes / No", icon: "check" },
  { type: "file", label: "File upload", icon: "fileText" },
  { type: "email", label: "Email", icon: "dot" },
];

/* prototype RD.fStyles.label */
const fStyles = {
  label: { fontSize: 11, fontWeight: 700 as const, letterSpacing: ".08em", textTransform: "uppercase" as const, color: "var(--c-ink-3)" },
};

/* prototype example activity feed (window.REQ_DETAIL.activity) */
const EXAMPLE_ACTIVITY = [
  { ic: "sparkles", ai: true, who: "candidate-screener", what: "screened 4 new applicants", t: "12m" },
  { ic: "users", who: "Avery Chen", what: "moved Lena Whitfield to Interview", t: "1h" },
  { ic: "fileText", who: "Jordan Lee", what: "approved the job description", t: "2d" },
  { ic: "briefcase", who: "Avery Chen", what: "posted the requisition", t: "6d" },
];

/* prototype example pipeline (window.REQ_DETAIL.pipeline) */
type Stage = { stage: string; n: number; color: string };
const EXAMPLE_PIPELINE: Stage[] = [
  { stage: "Applied", n: 42, color: "var(--c-ink-3)" },
  { stage: "Screening", n: 26, color: "var(--c-info)" },
  { stage: "Interview", n: 9, color: "var(--c-ai)" },
  { stage: "Offer", n: 2, color: "var(--c-brand)" },
  { stage: "Hired", n: 0, color: "var(--c-ok)" },
];

/* map the gateway funnel (fine-grained stages) onto the prototype's 5 canonical
   columns so the horizontal PipelineFlow chart keeps fitting */
const STAGE_BUCKET: Partial<Record<ApplicationStage, number>> = {
  APPLIED: 0,
  SCREENED: 1, PHONE_SCREEN: 1, ASSESSMENT: 1,
  INTERVIEW: 2, FINAL_REVIEW: 2,
  OFFER: 3,
  HIRED: 4,
};
function bucketFunnel(rows: { stage: ApplicationStage; count: number }[]): Stage[] {
  const buckets = EXAMPLE_PIPELINE.map((s) => ({ ...s, n: 0 }));
  let any = false;
  for (const r of rows) {
    const idx = STAGE_BUCKET[r.stage];
    if (idx == null) continue;
    buckets[idx].n += Number(r.count) || 0;
    any = true;
  }
  return any ? buckets : EXAMPLE_PIPELINE;
}

/* ---------------- Fact row (prototype Fact) ---------------- */
function Fact({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderTop: "1px solid var(--c-line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--c-ink-3)" }}>{k}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

/* ---------------- PipelineFlow (prototype PipelineFlow) ---------------- */
function PipelineFlow({ stages }: { stages: Stage[] }) {
  const max = stages[0].n || 1;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        {stages.map((s, i) => {
          return (
            <React.Fragment key={s.stage}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "16px 8px", position: "relative", overflow: "hidden", boxShadow: "var(--e1)" }}>
                  <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: 3, background: s.color, opacity: .5 }} />
                  <div className="mono tnum" style={{ fontSize: 26, fontWeight: 700, color: s.color }}><CountUp to={s.n} /></div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-2)", fontWeight: 600, marginTop: 2 }}>{s.stage}</div>
                  <div style={{ marginTop: 8, height: 4, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: ((s.n / max) * 100) + "%", background: s.color, borderRadius: 99, animation: "growx 1s var(--ease-out) both", animationDelay: (i * 90) + "ms" }} />
                  </div>
                </div>
              </div>
              {i < stages.length - 1 && (() => {
                const convNext = s.n > 0 ? Math.round((stages[i + 1].n / s.n) * 100) : 0;
                return (
                  <div style={{ width: 46, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    <Icon name="chevR" size={16} style={{ color: "var(--c-ink-3)" }} />
                    <span className="mono" style={{ fontSize: 10, color: convNext >= 50 ? "var(--c-ok)" : "var(--c-ink-3)", fontWeight: 600 }}>{convNext}%</span>
                  </div>
                );
              })()}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Interview rounds (prototype req-builder RoundsConfig) ------- */
function RoundsConfig() {
  const [rounds, setRounds] = useState<Round[]>(ROUNDS.map((r) => ({ ...r })));
  const move = (i: number, dir: number) => {
    const j = i + dir; if (j < 0 || j >= rounds.length) return;
    const next = [...rounds]; [next[i], next[j]] = [next[j], next[i]]; setRounds(next);
  };
  const toggleAuto = (id: string) => setRounds(rounds.map((r) => r.id === id ? { ...r, auto: !r.auto } : r));
  const remove = (id: string) => setRounds(rounds.filter((r) => r.id !== id));
  const add = () => setRounds([...rounds, { id: "rd" + Date.now(), name: "New round", type: "TECHNICAL", dur: 45, panel: "Engineer", auto: false, instr: "" }]);

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Interview rounds</h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{rounds.length} rounds · candidates advance through these in order.</p>
        </div>
        <Btn variant="primary" icon="plus" onClick={add}>Add round</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rounds.map((r, i) => {
          const t = ROUND_TYPES[r.type] ?? ROUND_TYPES.TECHNICAL;
          return (
            <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", animation: "rise .3s var(--ease-out)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ border: "none", background: "none", cursor: i === 0 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === 0 ? .3 : 1, padding: 0, lineHeight: 0 }}><Icon name="chevD" size={15} style={{ transform: "rotate(180deg)" }} /></button>
                <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--c-ink-3)" }}>{i + 1}</span>
                <button onClick={() => move(i, 1)} disabled={i === rounds.length - 1} style={{ border: "none", background: "none", cursor: i === rounds.length - 1 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === rounds.length - 1 ? .3 : 1, padding: 0, lineHeight: 0 }}><Icon name="chevD" size={15} /></button>
              </div>
              <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, color: t.tone, background: "color-mix(in oklab," + t.tone + " 13%, transparent)" }}><Icon name="calendar" size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.name}</span>
                  <Pill tone={t.tone} bg={"color-mix(in oklab," + t.tone + " 13%, transparent)"}>{t.label}</Pill>
                  <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{r.dur}m</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>Panel: {r.panel}{r.instr ? ` · ${r.instr}` : ""}</div>
              </div>
              <button onClick={() => toggleAuto(r.id)} title="Auto-advance on pass" style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 10px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: r.auto ? "transparent" : "var(--c-line-2)", background: r.auto ? "var(--c-brand-tint)" : "var(--c-surface)", color: r.auto ? "var(--c-brand-ink)" : "var(--c-ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
                <span style={{ width: 26, height: 15, borderRadius: 99, background: r.auto ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", transition: "background var(--t)" }}>
                  <span style={{ position: "absolute", top: 2, left: r.auto ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
                </span>auto-advance
              </button>
              <button onClick={() => remove(r.id)} style={{ width: 30, height: 30, borderRadius: "var(--r-sm)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
        <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} /><span>The <b style={{ color: "var(--c-ai-ink)" }}>interview-kit</b> agent can draft questions + a scoring rubric for each round.</span>
        <Btn variant="outlineAi" size="sm" icon="sparkles" style={{ marginLeft: "auto" }}>Generate kits</Btn>
      </div>
    </div>
  );
}

/* ---------------- Application form builder (prototype req-builder FormBuilder) - */
function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>(FORM_FIELDS.map((f) => ({ ...f })));
  const [sel, setSel] = useState<string | null>(null);
  const add = (type: string, label: string) => setFields([...fields, { id: "f" + Date.now(), type, label: label + " field", required: false }]);
  const upd = (id: string, patch: Partial<FormField>) => setFields(fields.map((f) => f.id === id ? { ...f, ...patch } : f));
  const remove = (id: string) => setFields(fields.filter((f) => f.id !== id || f.locked));
  const move = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= fields.length) return; const n = [...fields]; [n[i], n[j]] = [n[j], n[i]]; setFields(n); };
  const typeIcon: Record<string, string> = { text: "type", textarea: "fileText", select: "chevD", checkbox: "check", file: "fileText", email: "dot" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 16, alignItems: "start" }}>
      {/* palette */}
      <div>
        <div style={{ ...fStyles.label, marginBottom: 10 }}>Add a field</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {FIELD_PALETTE.map((p) => (
            <button key={p.type} onClick={() => add(p.type, p.label)} style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink)", textAlign: "left", transition: "all var(--t-fast)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c-brand)"; e.currentTarget.style.background = "var(--c-brand-tint)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-surface)"; }}>
              <Icon name={p.icon} size={15} style={{ color: "var(--c-ink-3)" }} />{p.label}<Icon name="plus" size={13} style={{ marginLeft: "auto", color: "var(--c-ink-3)" }} />
            </button>
          ))}
        </div>
      </div>

      {/* canvas */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={fStyles.label}>Form structure · {fields.length} fields</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {fields.map((f, i) => (
            <div key={f.id} onClick={() => setSel(f.id)} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid", borderColor: sel === f.id ? "var(--c-brand)" : "var(--c-line)", background: "var(--c-surface)", cursor: "pointer", boxShadow: sel === f.id ? "var(--ring)" : "var(--e1)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--c-ink-3)", padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} style={{ transform: "rotate(180deg)" }} /></button>
                <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--c-ink-3)", padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} /></button>
              </div>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name={typeIcon[f.type]} size={15} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input value={f.label} onChange={(e) => upd(f.id, { label: e.target.value })} onClick={(e) => e.stopPropagation()} style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-sans)" }} />
                <span style={{ fontSize: 10.5, color: "var(--c-ink-3)", textTransform: "capitalize" }}>{f.type}{f.locked ? " · default" : ""}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); upd(f.id, { required: !f.required }); }} style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: "none", cursor: "pointer", color: f.required ? "var(--c-danger)" : "var(--c-ink-3)", background: f.required ? "var(--c-danger-tint)" : "var(--c-surface-2)" }}>{f.required ? "Required" : "Optional"}</button>
              {!f.locked
                ? <button onClick={(e) => { e.stopPropagation(); remove(f.id); }} style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
                : <Icon name="shield" size={14} style={{ color: "var(--c-ink-3)" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* live preview */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ ...fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Candidate preview</span>
          <Btn variant="primary" size="sm" icon="arrowUpRight">Publish</Btn>
        </div>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Apply: Senior Backend Engineer</div>
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 16 }}>Northwind Talent · Payments</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {fields.map((f) => (
              <div key={f.id}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 5 }}>{f.label}{f.required && <span style={{ color: "var(--c-danger)" }}> *</span>}</label>
                {f.type === "textarea" ? <div style={{ height: 56, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)" }} />
                  : f.type === "select" ? <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 12.5, color: "var(--c-ink-3)" }}>Select...<Icon name="chevD" size={14} /></div>
                  : f.type === "checkbox" ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid var(--c-line-strong)" }} /><span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Yes</span></div>
                  : f.type === "file" ? <div style={{ height: 46, borderRadius: "var(--r)", border: "1.5px dashed var(--c-line-strong)", background: "var(--c-surface-2)", display: "grid", placeItems: "center", fontSize: 12, color: "var(--c-ink-3)" }}>Drop file or browse</div>
                  : <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)" }} />}
              </div>
            ))}
            <button style={{ marginTop: 4, padding: "10px", borderRadius: "var(--r)", border: "none", background: "var(--c-brand)", color: "var(--c-on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Submit application</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- skeleton (loading state inside the page chrome) ----------- */
function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px]" aria-busy="true">
      <Skeleton className="mb-3 h-4 w-32 rounded" />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2"><Skeleton className="h-9 w-72 rounded-lg" /><Skeleton className="h-4 w-96 rounded" /></div>
        <div className="flex gap-2"><Skeleton className="h-9 w-20 rounded" /><Skeleton className="h-9 w-32 rounded" /><Skeleton className="h-9 w-24 rounded" /></div>
      </div>
      <Skeleton className="mb-5 h-9 w-full max-w-[560px] rounded" />
      <div className="grid items-start gap-5 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5"><Skeleton className="h-64 rounded-[18px]" /><Skeleton className="h-48 rounded-[18px]" /></div>
        <div className="flex flex-col gap-4"><Skeleton className="h-56 rounded-[18px]" /><Skeleton className="h-40 rounded-[18px]" /></div>
      </div>
    </div>
  );
}

const k = (n?: number | null) => (n != null ? `$${Math.round(n / 1000)}k` : null);
function salaryLabel(r: Requisition): string | null {
  const lo = k(r.salaryMin), hi = k(r.salaryMax);
  if (lo && hi) return `${lo} to ${hi}`;
  return lo || hi || null;
}

export default function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const req = useData<Requisition>(() => getRequisition(id), [id]);
  const funnel = useData<{ stage: ApplicationStage; count: number }[]>(getFunnel);
  const [tab, setTab] = useState<string>("overview");

  if (req.loading) return <DetailSkeleton />;
  if (req.error || !req.data) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <ErrorState title="Requisition not found" body="We could not load this requisition." code={`GET /api/requisitions/${id}`} onRetry={req.reload} />
      </div>
    );
  }

  const d = req.data;
  const m = REQ_STATUS[d.status] ?? REQ_STATUS.DRAFT;
  const salary = salaryLabel(d);
  const required = d.requiredSkills ?? d.requirements ?? [];
  const niceToHave = d.niceToHave ?? [];
  const customFields: CustomField[] = d.customFields ?? [];
  const inclusivity = d.inclusivityScore;

  const pipeline = bucketFunnel(funnel.data ?? []);
  const reachInterview = pipeline[0].n > 0 ? Math.round((pipeline[2].n / pipeline[0].n) * 100) : 0;
  const totalCands = d.candidateCount ?? pipeline[0].n;

  const tabs: [string, string, string][] = [
    ["overview", "Overview", "fileText"],
    ["pipeline", "Pipeline", "radar"],
    ["rounds", "Interview rounds", "calendar"],
    ["form", "Application form", "listChecks"],
    ["activity", "Activity", "bolt"],
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* header */}
      <a href="/requisitions" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", fontWeight: 600, marginBottom: 12 }}>
        <Icon name="chevsL" size={14} /> All requisitions
      </a>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{d.title}</h1>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px 4px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
              <Icon name={m.icon} size={12} stroke={2.4} />{m.label}
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 7, fontSize: 12.5, color: "var(--c-ink-2)" }}>
            <span className="mono">{d.id}</span>
            {d.department && <><span>·</span><span>{d.department}</span></>}
            {d.location && <><span>·</span><span>{d.location}</span></>}
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
                {d.description ? (
                  <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>{d.description}</p>
                ) : (
                  <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", lineHeight: 1.6 }}>No description yet. The jd-author agent can draft one.</p>
                )}
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Required qualifications</div>
                {required.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
                    {required.map((q, i) => <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--c-ink-2)" }}><Icon name="check" size={14} style={{ color: "var(--c-brand)", flexShrink: 0, marginTop: 2 }} />{q}</div>)}
                  </div>
                ) : (
                  <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--c-ink-3)" }}>No required qualifications captured.</p>
                )}
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 9 }}>Nice to have</div>
                {niceToHave.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{niceToHave.map((n, i) => <Pill key={i} tone="var(--c-ink-2)" bg="var(--c-surface-2)">{n}</Pill>)}</div>
                ) : (
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-3)" }}>No nice-to-have skills listed.</p>
                )}
              </div>

              {/* custom screening criteria */}
              <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--c-ai) 24%, var(--c-line))", background: "linear-gradient(180deg, var(--c-ai-tint) 0%, transparent 38%)", padding: 20 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>Custom screening criteria</h3></div>
                <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--c-ink-2)" }}>These admin-defined criteria are sent to the screener and appear in every verdict.</p>
                {customFields.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {customFields.map((cf, i) => {
                      const imp = IMPORTANCE[cf.importance ?? "nice"] ?? IMPORTANCE.nice;
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
                          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{cf.label}</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{cf.value}</div></div>
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
                <div style={{ ...fStyles.label, marginBottom: 4 }}>Details</div>
                <Fact k="Status" v={m.label} />
                {d.employmentType && <Fact k="Job family" v={d.employmentType} />}
                <Fact k="Location" v={d.location || "Not set"} />
                {salary && <Fact k="Salary" v={salary} mono />}
                {d.openings != null && <Fact k="Headcount" v={d.openings} mono />}
                <Fact k="Candidates" v={totalCands} mono />
                {d.createdAt && <Fact k="Posted" v={new Date(d.createdAt).toLocaleDateString()} />}
              </div>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ ...fStyles.label, marginBottom: 12 }}>Owners</div>
                {([["Recruiter", "Avery Chen", "AC"], ["Hiring manager", "Jordan Lee", "JL"]] as const).map(([role, name, ini]) => (
                  <div key={role} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                    <span className="mono" style={{ width: 32, height: 32, borderRadius: 99, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11 }}>{ini}</span>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{name}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{role}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div style={{ animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div><h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Candidate pipeline</h3><p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{pipeline[0].n} candidates across 5 stages · {reachInterview}% reach interview.</p></div>
              <a href="/candidates"><Btn variant="soft" icon="users">Open candidates board</Btn></a>
            </div>
            {funnel.loading && <Skeleton className="h-32 w-full rounded-[14px]" />}
            {!funnel.loading && <PipelineFlow stages={pipeline} />}
            <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {([["In screening", String(pipeline[1].n), "scan", "var(--c-info)", "5 flagged for human review"], ["Interviewing", String(pipeline[2].n), "calendar", "var(--c-ai)", "3 panels to schedule"], ["At offer", String(pipeline[3].n), "fileText", "var(--c-brand)", "1 awaiting approval"]] as const).map(([t, n, ic, c, sub]) => (
                <div key={t} style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 16, boxShadow: "var(--e1)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", color: c, background: "color-mix(in oklab," + c + " 13%, transparent)" }}><Icon name={ic} size={16} /></span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}><span className="mono tnum" style={{ fontSize: 24, fontWeight: 700 }}>{n}</span><span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>{t}</span></div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "rounds" && <div style={{ animation: "rise .3s var(--ease-out)" }}><RoundsConfig /></div>}
        {tab === "form" && <div style={{ animation: "rise .3s var(--ease-out)" }}><FormBuilder /></div>}
        {tab === "activity" && (
          <div style={{ maxWidth: 620, animation: "rise .3s var(--ease-out)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: "var(--fs-lg)", fontWeight: 700 }}>Activity</h3>
            <Timeline items={EXAMPLE_ACTIVITY} />
          </div>
        )}
      </div>
    </div>
  );
}
