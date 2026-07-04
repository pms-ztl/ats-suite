"use client";
// RequisitionBuilder.tsx, interview-rounds config + application form-builder.
// These fill the RequisitionDetail "rounds" and "form" tabs (passed as roundsSlot / formSlot).
// Ported byte-faithful from req-builder.jsx. Data via props only.
import React, { useState } from "react";
import { Pill, fStyles } from "./aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import type { IconName } from "./icon";
import type { RoundsData, RoundItem, FormBuilderData, FormField } from "./types";
import type { EligibilityRuleDef, EligibilityOp } from "./eligibility-api";

/* ---------------- Interview rounds ---------------- */
export function RoundsConfig({ data, jobTitle, onGenerateKits }: { data: RoundsData; jobTitle?: string; onGenerateKits?: () => void }) {
  const [rounds, setRounds] = useState<RoundItem[]>(data.rounds.map(r => ({ ...r })));
  const move = (i: number, dir: number) => {
    const j = i + dir; if (j < 0 || j >= rounds.length) return;
    const next = [...rounds]; [next[i], next[j]] = [next[j], next[i]]; setRounds(next);
  };
  const toggleAuto = (id: string) => setRounds(rounds.map(r => r.id === id ? { ...r, auto: !r.auto } : r));
  const remove = (id: string) => setRounds(rounds.filter(r => r.id !== id));
  const add = () => setRounds([...rounds, { id: "rd" + Date.now(), name: "New round", type: "TECHNICAL", dur: 45, panel: "Engineer", auto: false, instr: "" }]);

  return (
    <div style={{ maxWidth: 820 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Interview rounds</h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>{rounds.length} rounds · candidates advance through these in order.</p>
        </div>
        <Btn variant="primary" icon="plus" onClick={add}>Add round</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rounds.map((r, i) => {
          const t = data.roundTypes[r.type];
          return (
            <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", animation: "rise .3s var(--ease-out)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={{ border: "none", background: "none", cursor: i === 0 ? "default" : "pointer", color: "var(--ink-3)", opacity: i === 0 ? .3 : 1, padding: 0, lineHeight: 0 }}><Icon name="chevD" size={15} style={{ transform: "rotate(180deg)" }} /></button>
                <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--ink-3)" }}>{i + 1}</span>
                <button onClick={() => move(i, 1)} disabled={i === rounds.length - 1} style={{ border: "none", background: "none", cursor: i === rounds.length - 1 ? "default" : "pointer", color: "var(--ink-3)", opacity: i === rounds.length - 1 ? .3 : 1, padding: 0, lineHeight: 0 }}><Icon name="chevD" size={15} /></button>
              </div>
              <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, color: t.tone, background: "color-mix(in oklab," + t.tone + " 13%, transparent)" }}><Icon name="calendar" size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.name}</span>
                  <Pill tone={t.tone} bg={"color-mix(in oklab," + t.tone + " 13%, transparent)"}>{t.label}</Pill>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{r.dur}m</span>
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2 }}>Panel: {r.panel}{r.instr ? ` · ${r.instr}` : ""}</div>
              </div>
              <button onClick={() => toggleAuto(r.id)} title="Auto-advance on pass" style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 10px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: r.auto ? "transparent" : "var(--line-2)", background: r.auto ? "var(--brand-tint)" : "var(--surface)", color: r.auto ? "var(--brand-ink)" : "var(--ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>
                <span style={{ width: 26, height: 15, borderRadius: 99, background: r.auto ? "var(--brand)" : "var(--line-strong)", position: "relative", transition: "background var(--t)" }}>
                  <span style={{ position: "absolute", top: 2, left: r.auto ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
                </span>auto-advance
              </button>
              <button onClick={() => remove(r.id)} style={{ width: 30, height: 30, borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)" }}>
        <Icon name="sparkles" size={15} style={{ color: "var(--ai)", flexShrink: 0 }} /><span>The <b style={{ color: "var(--ai-ink)" }}>interview-kit</b> agent can draft questions + a scoring rubric for each round.</span>
        <Btn variant="outlineAi" size="sm" icon="sparkles" style={{ marginLeft: "auto" }} onClick={onGenerateKits}>Generate kits</Btn>
      </div>
    </div>
  );
}

/* ---------------- Application form builder ---------------- */
const typeIcon: Record<string, IconName> = { text: "type", textarea: "fileText", select: "chevD", multiselect: "listChecks", radio: "check", checkbox: "check", file: "fileText", image: "swatch", email: "dot", url: "arrowUpRight", phone: "card", number: "type", date: "calendar" };
const cfgLabel: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", margin: "10px 0 5px" };
const cfgInput: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", fontSize: 12.5, outline: "none", fontFamily: "var(--font-sans)" };

export function FormBuilder({ data, jobTitle = "Senior Backend Engineer", orgLine = "Northwind Talent · Payments", onPublish, publishState }: { data: FormBuilderData; jobTitle?: string; orgLine?: string; onPublish?: (fields: FormField[]) => void; publishState?: "idle" | "saving" | "saved" | "error" }) {
  const [fields, setFields] = useState<FormField[]>(data.fields.map(f => ({ ...f })));
  const [sel, setSel] = useState<string | null>(null);
  const add = (type: string, label: string) => {
    const base: FormField = { id: "f" + Date.now(), type, label: label + " field", required: false, order: fields.length };
    if (type === "file") { base.fileTypes = [".pdf", ".doc", ".docx"]; base.maxSizeMb = 10; }
    if (type === "image") { base.fileTypes = [".png", ".jpg", ".jpeg"]; base.maxSizeMb = 5; }
    if (type === "select" || type === "multiselect" || type === "radio") base.options = ["Option 1", "Option 2"];
    setFields([...fields, base]); setSel(base.id);
  };
  const upd = (id: string, patch: Partial<FormField>) => setFields(fields.map(f => f.id === id ? { ...f, ...patch } : f));
  const remove = (id: string) => { setFields(fields.filter(f => f.id !== id || f.locked)); setSel(s => (s === id ? null : s)); };
  const move = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= fields.length) return; const n = [...fields]; [n[i], n[j]] = [n[j], n[i]]; setFields(n); };
  const selField = fields.find(f => f.id === sel) || null;
  const pubLabel = publishState === "saving" ? "Saving..." : publishState === "saved" ? "Saved" : publishState === "error" ? "Retry" : "Publish";
  const pubIcon: IconName = publishState === "saved" ? "check" : "arrowUpRight";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 16, alignItems: "start" }} className="form-builder-grid">
      {/* palette */}
      <div>
        <div style={{ ...fStyles.label, marginBottom: 10 }}>Add a field</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {data.palette.map(p => (
            <button key={p.type} onClick={() => add(p.type, p.label)} style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--ink)", textAlign: "left", transition: "all var(--t-fast)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.background = "var(--brand-tint)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}>
              <Icon name={p.icon} size={15} style={{ color: "var(--ink-3)" }} />{p.label}<Icon name="plus" size={13} style={{ marginLeft: "auto", color: "var(--ink-3)" }} />
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
            <div key={f.id} onClick={() => setSel(f.id)} style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid", borderColor: sel === f.id ? "var(--brand)" : "var(--line)", background: "var(--surface)", cursor: "pointer", boxShadow: sel === f.id ? "var(--ring)" : "var(--e1)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button onClick={e => { e.stopPropagation(); move(i, -1); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-3)", padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} style={{ transform: "rotate(180deg)" }} /></button>
                <button onClick={e => { e.stopPropagation(); move(i, 1); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--ink-3)", padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} /></button>
              </div>
              <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--surface-2)", color: "var(--ink-2)" }}><Icon name={typeIcon[f.type] || "type"} size={15} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input value={f.label} onChange={e => upd(f.id, { label: e.target.value })} onClick={e => e.stopPropagation()} style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
                <span style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "capitalize" }}>{f.type}{f.locked ? " · default" : ""}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); upd(f.id, { required: !f.required }); }} style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: "none", cursor: "pointer", color: f.required ? "var(--danger)" : "var(--ink-3)", background: f.required ? "var(--danger-tint)" : "var(--surface-2)" }}>{f.required ? "Required" : "Optional"}</button>
              {!f.locked
                ? <button onClick={e => { e.stopPropagation(); remove(f.id); }} style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
                : <Icon name="shield" size={14} style={{ color: "var(--ink-3)" }} />}
            </div>
          ))}
        </div>

        {/* per-field settings (options, file/image type config) */}
        {selField && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", animation: "rise .25s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ ...fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="settings" size={13} /> Field settings</span>
              <span style={{ fontSize: 10.5, color: "var(--ink-3)", textTransform: "capitalize" }}>{selField.type}{selField.locked ? " · default" : ""}</span>
            </div>
            <label style={cfgLabel}>Help text</label>
            <input value={selField.helpText ?? ""} onChange={e => upd(selField.id, { helpText: e.target.value })} placeholder="Optional hint shown under the field" style={cfgInput} />
            {(selField.type === "select" || selField.type === "multiselect" || selField.type === "radio") && (
              <>
                <label style={cfgLabel}>Choices (one per line)</label>
                <textarea rows={3} value={(selField.options ?? []).join("\n")} onChange={e => upd(selField.id, { options: e.target.value.split("\n").map(s => s.trimStart()).filter((s, i, a) => s !== "" || i < a.length - 1) })} onBlur={e => upd(selField.id, { options: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} style={{ ...cfgInput, resize: "vertical", lineHeight: 1.5 }} placeholder={"Option 1\nOption 2"} />
              </>
            )}
            {(selField.type === "file" || selField.type === "image") && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={cfgLabel}>Accepted types</label>
                  <input value={(selField.fileTypes ?? []).join(", ")} onChange={e => upd(selField.id, { fileTypes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder={selField.type === "image" ? ".png, .jpg" : ".pdf, .docx"} style={cfgInput} />
                </div>
                <div style={{ width: 92 }}>
                  <label style={cfgLabel}>Max MB</label>
                  <input type="number" min={1} value={selField.maxSizeMb ?? 10} onChange={e => upd(selField.id, { maxSizeMb: Math.max(1, Number(e.target.value) || 10) })} className="mono" style={cfgInput} />
                </div>
              </div>
            )}
            {selField.type === "image" && (
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, color: "var(--ink-2)" }}>
                <Icon name="swatch" size={14} style={{ color: "var(--ai)", flexShrink: 0 }} />
                <span>Candidates can upload an image (for example a portfolio screenshot or headshot) on the public form.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* live preview */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ ...fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Candidate preview</span>
          <Btn variant="primary" size="sm" icon={pubIcon} onClick={() => { if (publishState !== "saving") onPublish?.(fields); }}>{pubLabel}</Btn>
        </div>
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Apply: {jobTitle}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 16 }}>{orgLine}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {fields.map(f => (
              <div key={f.id}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: 5 }}>{f.label}{f.required && <span style={{ color: "var(--danger)" }}> *</span>}</label>
                {f.type === "textarea" ? <div style={{ height: 56, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)" }} />
                  : f.type === "select" ? <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 12.5, color: "var(--ink-3)" }}>Select&hellip;<Icon name="chevD" size={14} /></div>
                  : f.type === "checkbox" ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid var(--line-strong)" }} /><span style={{ fontSize: 12, color: "var(--ink-3)" }}>Yes</span></div>
                  : f.type === "file" ? <div style={{ height: 46, borderRadius: "var(--r)", border: "1.5px dashed var(--line-strong)", background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 12, color: "var(--ink-3)" }}>Drop file or browse{f.fileTypes?.length ? ` (${f.fileTypes.join(", ")})` : ""}</div>
                  : f.type === "image" ? <div style={{ height: 60, borderRadius: "var(--r)", border: "1.5px dashed var(--line-strong)", background: "var(--surface-2)", display: "grid", placeItems: "center", color: "var(--ink-3)" }}><Icon name="swatch" size={20} /></div>
                  : <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)" }} />}
              </div>
            ))}
            <button style={{ marginTop: 4, padding: "10px", borderRadius: "var(--r)", border: "none", background: "var(--brand)", color: "var(--on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Submit application</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Eligibility rules authoring ----------------
   Recruiter-facing UI to AUTHOR the eligibility spec the gating engine enforces
   on the public apply path (job-service requisitions.ts / public.ts). Every rule
   checks the candidate's submitted answer to a form field. The high-level quick
   rules (departments / degree / min CGPA) are just presets over the same generic
   rule shape recruiters can also add by hand below. No rules = open to all (an
   honest empty state, matching how the gate treats an empty spec). Presentational
   only: `rules` in, `onSave` out. The live wrapper owns fetch/persist. */

const OP_LABEL: Record<EligibilityOp, string> = {
  eq: "equals",
  neq: "does not equal",
  in: "is one of",
  not_in: "is not one of",
  gte: "is at least",
  lte: "is at most",
  between: "is between",
};
const OP_ORDER: EligibilityOp[] = ["in", "not_in", "eq", "neq", "gte", "lte", "between"];
const NUMERIC_OPS = new Set<EligibilityOp>(["gte", "lte", "between"]);
// Common degree levels offered as quick chips; recruiters can still type any value.
const DEGREE_PRESETS = ["B.Tech", "B.E.", "B.Sc", "M.Tech", "M.Sc", "MCA", "MBA", "Ph.D"];

const elCard: React.CSSProperties = { borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" };
const elInput: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface-2)", color: "var(--ink)", fontSize: 12.5, outline: "none", fontFamily: "var(--font-sans)" };
const elLabel: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", margin: "0 0 5px" };

// A small chip-list editor: type a value + Enter (or click Add) to append, click × to remove.
function ChipList({ values, onChange, placeholder, presets }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string; presets?: string[] }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) { setDraft(""); return; }
    onChange([...values, v]); setDraft("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: values.length ? 8 : 0 }}>
        {values.map((v) => (
          <span key={v} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "4px 6px 4px 10px", borderRadius: "var(--r-pill)", background: "var(--brand-tint)", color: "var(--brand-ink)", fontSize: 12, fontWeight: 600 }}>
            {v}
            <button onClick={() => remove(v)} aria-label={`Remove ${v}`} style={{ width: 16, height: 16, borderRadius: 99, border: "none", background: "transparent", color: "var(--brand-ink)", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}><Icon name="x" size={11} /></button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(draft); } }} placeholder={placeholder} style={elInput} />
        <Btn variant="soft" size="sm" icon="plus" onClick={() => add(draft)}>Add</Btn>
      </div>
      {presets?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {presets.filter((p) => !values.some((x) => x.toLowerCase() === p.toLowerCase())).map((p) => (
            <button key={p} onClick={() => add(p)} style={{ padding: "3px 9px", borderRadius: "var(--r-pill)", border: "1px dashed var(--line-strong)", background: "transparent", color: "var(--ink-3)", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>+ {p}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Human-readable summary of one rule for the "active rules" list.
function ruleSummary(r: EligibilityRuleDef): string {
  const field = r.label || r.field;
  const vals = (r.values ?? []).filter(Boolean);
  if (r.op === "between") return `${field} is between ${vals[0] ?? "?"} and ${vals[1] ?? "?"}`;
  if (NUMERIC_OPS.has(r.op)) return `${field} ${OP_LABEL[r.op]} ${vals[0] ?? "?"}`;
  return `${field} ${OP_LABEL[r.op]} ${vals.length ? vals.join(", ") : "?"}`;
}

export interface EligibilityFieldOption { id: string; label: string }

export function EligibilityRulesEditor({
  rules, onSave, saveState = "idle", fieldOptions = [],
}: {
  rules: EligibilityRuleDef[];
  onSave?: (rules: EligibilityRuleDef[]) => void;
  saveState?: "idle" | "saving" | "saved" | "error";
  /** Form field ids/labels for THIS requisition, so the recruiter picks from real fields. */
  fieldOptions?: EligibilityFieldOption[];
}) {
  const [draft, setDraft] = useState<EligibilityRuleDef[]>(rules.map((r) => ({ ...r, values: [...(r.values ?? [])] })));

  // Locate the single "quick rule" for a well-known field (department / degree /
  // cgpa) if the recruiter authored one via the presets; the rest are "custom".
  const findByField = (field: string) => draft.find((r) => r.field.toLowerCase() === field.toLowerCase());
  const upsertByField = (field: string, next: EligibilityRuleDef | null) => {
    setDraft((cur) => {
      const rest = cur.filter((r) => r.field.toLowerCase() !== field.toLowerCase());
      return next ? [...rest, next] : rest;
    });
  };

  const deptRule = findByField("department");
  const degreeRule = findByField("degree");
  const cgpaRule = findByField("cgpa");
  const customRules = draft
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => !["department", "degree", "cgpa"].includes(r.field.toLowerCase()));

  const setDept = (values: string[]) => {
    if (!values.length) return upsertByField("department", null);
    upsertByField("department", {
      field: "department", op: "in", values, label: "Department",
      errorMessage: `This role is open only to candidates from: ${values.join(", ")}.`,
    });
  };
  const setDegree = (values: string[]) => {
    if (!values.length) return upsertByField("degree", null);
    upsertByField("degree", {
      field: "degree", op: "in", values, label: "Degree",
      errorMessage: `This role requires one of these qualifications: ${values.join(", ")}.`,
    });
  };
  const setCgpa = (raw: string) => {
    const v = raw.trim();
    if (v === "") return upsertByField("cgpa", null);
    upsertByField("cgpa", {
      field: "cgpa", op: "gte", values: [v], label: "Minimum CGPA",
      errorMessage: `A minimum CGPA of ${v} is required for this role.`,
    });
  };

  // ── generic custom-rule editing ─────────────────────────────────────
  const updateAt = (idx: number, patch: Partial<EligibilityRuleDef>) =>
    setDraft((cur) => cur.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeAt = (idx: number) => setDraft((cur) => cur.filter((_, i) => i !== idx));
  const addCustom = () =>
    setDraft((cur) => [...cur, { field: "", op: "in", values: [], errorMessage: "You are not eligible to apply for this role." }]);

  // A rule is complete enough to persist: a field, and for value-taking ops at
  // least one value (numeric "between" needs two). Incomplete drafts are dropped
  // on save so a half-authored row never blocks every applicant.
  const isComplete = (r: EligibilityRuleDef): boolean => {
    if (!r.field.trim() || !r.errorMessage.trim()) return false;
    const vals = (r.values ?? []).filter((v) => v.trim() !== "");
    if (r.op === "between") return vals.length >= 2;
    return vals.length >= 1;
  };
  const complete = draft.filter(isComplete).map((r) => ({ ...r, values: (r.values ?? []).map((v) => v.trim()).filter(Boolean) }));
  const saveLabel = saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : saveState === "error" ? "Retry" : "Save rules";
  const saveIcon: IconName = saveState === "saved" ? "check" : "shield";

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", display: "inline-flex", gap: 8, alignItems: "center" }}>
            <Icon name="shield" size={19} style={{ color: "var(--brand)" }} /> Eligibility rules
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", maxWidth: 560, lineHeight: 1.5 }}>
            Applicants who do not meet these rules are stopped at submission with your message. Rules check the answers candidates give on the application form. {complete.length === 0 ? "No rules yet, so this role is open to everyone who applies." : `${complete.length} active rule${complete.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Btn variant="primary" size="sm" icon={saveIcon} onClick={() => { if (saveState !== "saving") onSave?.(complete); }}>{saveLabel}</Btn>
      </div>

      {/* Active-rules summary (honest empty when there are none) */}
      <div style={{ ...elCard, marginBottom: 16, padding: complete.length ? 16 : 20 }}>
        <div style={{ ...fStyles.label, marginBottom: complete.length ? 10 : 0 }}>Active rules</div>
        {complete.length === 0 ? (
          <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink-3)" }}>
            <Icon name="users" size={15} /> Open to all applicants. Add a rule below to gate this role.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {complete.map((r, i) => (
              <div key={`${r.field}-${i}`} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)" }}>
                <Icon name="check" size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{ruleSummary(r)}</span>
                <span style={{ fontSize: 10.5, color: "var(--ink-3)", fontStyle: "italic", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{`"${r.errorMessage}"`}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick rules: the three most common gates as presets */}
      <div style={{ ...fStyles.label, marginBottom: 10 }}>Quick rules</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14, marginBottom: 22 }}>
        <div style={elCard}>
          <label style={elLabel}>Allowed departments / branches</label>
          <ChipList values={deptRule?.values ?? []} onChange={setDept} placeholder="e.g. Computer Science" />
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.4 }}>Only these are accepted. Checks the <span className="mono">department</span> answer.</div>
        </div>
        <div style={elCard}>
          <label style={elLabel}>Required degree</label>
          <ChipList values={degreeRule?.values ?? []} onChange={setDegree} placeholder="e.g. B.Tech" presets={DEGREE_PRESETS} />
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.4 }}>Any one qualifies. Checks the <span className="mono">degree</span> answer.</div>
        </div>
        <div style={elCard}>
          <label style={elLabel}>Minimum CGPA</label>
          <input type="number" step="0.1" min={0} max={10} value={cgpaRule?.values?.[0] ?? ""} onChange={(e) => setCgpa(e.target.value)} placeholder="e.g. 7.5" className="mono" style={elInput} />
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, lineHeight: 1.4 }}>Applicants at or above this pass. Checks the <span className="mono">cgpa</span> answer. Leave blank for no CGPA gate.</div>
        </div>
      </div>

      {/* Generic custom criteria: any form field, any operator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={fStyles.label}>Custom criteria</div>
        <Btn variant="soft" size="sm" icon="plus" onClick={addCustom}>Add criterion</Btn>
      </div>
      {customRules.length === 0 ? (
        <div style={{ ...elCard, display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--ink-3)" }}>
          <Icon name="listChecks" size={15} /> Add a criterion to gate on any other form field (for example graduation year, city, or a yes/no question).
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {customRules.map(({ r, i }) => {
            const numeric = NUMERIC_OPS.has(r.op);
            return (
              <div key={i} style={{ ...elCard, animation: "rise .25s var(--ease-out)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={elLabel}>Form field</label>
                    {fieldOptions.length ? (
                      <select value={r.field} onChange={(e) => updateAt(i, { field: e.target.value })} style={elInput}>
                        <option value="">Select a field…</option>
                        {fieldOptions.map((o) => <option key={o.id} value={o.id}>{o.label} ({o.id})</option>)}
                        {r.field && !fieldOptions.some((o) => o.id === r.field) ? <option value={r.field}>{r.field}</option> : null}
                      </select>
                    ) : (
                      <input value={r.field} onChange={(e) => updateAt(i, { field: e.target.value })} placeholder="form field id (e.g. gradYear)" style={elInput} />
                    )}
                  </div>
                  <div>
                    <label style={elLabel}>Condition</label>
                    <select value={r.op} onChange={(e) => updateAt(i, { op: e.target.value as EligibilityOp })} style={elInput}>
                      {OP_ORDER.map((op) => <option key={op} value={op}>{OP_LABEL[op]}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label style={elLabel}>{r.op === "between" ? "Range (two numbers)" : numeric ? "Value" : "Accepted values"}</label>
                  {r.op === "between" ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="number" value={r.values?.[0] ?? ""} onChange={(e) => updateAt(i, { values: [e.target.value, r.values?.[1] ?? ""] })} placeholder="min" className="mono" style={elInput} />
                      <span style={{ color: "var(--ink-3)", fontSize: 12 }}>to</span>
                      <input type="number" value={r.values?.[1] ?? ""} onChange={(e) => updateAt(i, { values: [r.values?.[0] ?? "", e.target.value] })} placeholder="max" className="mono" style={elInput} />
                    </div>
                  ) : numeric ? (
                    <input type="number" value={r.values?.[0] ?? ""} onChange={(e) => updateAt(i, { values: [e.target.value] })} placeholder="e.g. 2024" className="mono" style={elInput} />
                  ) : (
                    <ChipList values={r.values ?? []} onChange={(values) => updateAt(i, { values })} placeholder="type a value + Enter" />
                  )}
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={elLabel}>Message shown when a candidate fails this rule</label>
                    <input value={r.errorMessage} onChange={(e) => updateAt(i, { errorMessage: e.target.value })} placeholder="e.g. Only 2024 graduates can apply." style={elInput} />
                  </div>
                  <button onClick={() => removeAt(i)} aria-label="Remove rule" style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}><Icon name="x" size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
