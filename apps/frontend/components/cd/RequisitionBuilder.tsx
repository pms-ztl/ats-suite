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
const typeIcon: Record<string, IconName> = { text: "type", textarea: "fileText", select: "chevD", checkbox: "check", file: "fileText", email: "dot" };

export function FormBuilder({ data, jobTitle = "Senior Backend Engineer", orgLine = "Northwind Talent · Payments", onPublish }: { data: FormBuilderData; jobTitle?: string; orgLine?: string; onPublish?: (fields: FormField[]) => void }) {
  const [fields, setFields] = useState<FormField[]>(data.fields.map(f => ({ ...f })));
  const [sel, setSel] = useState<string | null>(null);
  const add = (type: string, label: string) => setFields([...fields, { id: "f" + Date.now(), type, label: label + " field", required: false }]);
  const upd = (id: string, patch: Partial<FormField>) => setFields(fields.map(f => f.id === id ? { ...f, ...patch } : f));
  const remove = (id: string) => setFields(fields.filter(f => f.id !== id || f.locked));
  const move = (i: number, dir: number) => { const j = i + dir; if (j < 0 || j >= fields.length) return; const n = [...fields]; [n[i], n[j]] = [n[j], n[i]]; setFields(n); };

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
      </div>

      {/* live preview */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ ...fStyles.label, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Candidate preview</span>
          <Btn variant="primary" size="sm" icon="arrowUpRight" onClick={() => onPublish?.(fields)}>Publish</Btn>
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
                  : f.type === "file" ? <div style={{ height: 46, borderRadius: "var(--r)", border: "1.5px dashed var(--line-strong)", background: "var(--surface-2)", display: "grid", placeItems: "center", fontSize: 12, color: "var(--ink-3)" }}>Drop file or browse</div>
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
