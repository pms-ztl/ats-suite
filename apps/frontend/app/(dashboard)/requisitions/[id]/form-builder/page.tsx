"use client";
// app/(dashboard)/requisitions/[id]/form-builder/page.tsx
// EXACT Claude Design "Aurora" port of the application FormBuilder
// (claude-design/req-builder.jsx -> FormBuilder): a three-column builder with a
// field palette, an orderable form canvas, inline field settings, a live
// candidate preview, and a publish bar. Fully interactive via local useState
// (add / remove / reorder / rename / toggle required / pick type). Best-effort
// loads any saved config from the gateway and attempts to persist on save, with
// graceful inline feedback. Inline palette colors use the --c-* full-color
// tokens; effect / size / type tokens stay bare. No fabricated saved data.
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

type FieldType = "text" | "textarea" | "select" | "checkbox" | "file" | "email";
type Field = { id: string; type: FieldType; label: string; required: boolean; locked?: boolean; options?: string[] };

// Sensible default field set, used when nothing loads (mirrors the prototype's
// FORM_FIELDS). Honest defaults only, never persisted unless the user saves.
const DEFAULT_FIELDS: Field[] = [
  { id: "f1", type: "text", label: "Full name", required: true, locked: true },
  { id: "f2", type: "email", label: "Email address", required: true, locked: true },
  { id: "f3", type: "file", label: "Resume / CV", required: true, locked: true },
  { id: "f4", type: "text", label: "LinkedIn or portfolio URL", required: false },
  { id: "f5", type: "select", label: "Years of backend experience", required: true, options: ["0 to 2", "3 to 5", "6 to 9", "10+"] },
  { id: "f6", type: "textarea", label: "Why are you interested in payments infrastructure?", required: false },
  { id: "f7", type: "checkbox", label: "Are you authorized to work in the US?", required: true },
];

const FIELD_PALETTE: { type: FieldType; label: string; icon: string }[] = [
  { type: "text", label: "Short text", icon: "type" },
  { type: "textarea", label: "Long text", icon: "fileText" },
  { type: "select", label: "Dropdown", icon: "chevD" },
  { type: "checkbox", label: "Yes / No", icon: "check" },
  { type: "file", label: "File upload", icon: "fileText" },
  { type: "email", label: "Email", icon: "dot" },
];

const TYPE_ICON: Record<FieldType, string> = { text: "type", textarea: "fileText", select: "chevD", checkbox: "check", file: "fileText", email: "dot" };

const LABEL_STYLE: CSS = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

// Local raw gateway fetch, scoped to this page (mirrors lib/api raw()).
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  return res.json();
}

// Best-effort mapping of an unknown saved payload into our Field[] view-model.
function coerceFields(payload: any): Field[] | null {
  const src = payload?.fields ?? payload?.form?.fields ?? payload?.applicationForm?.fields ?? payload?.data?.fields;
  if (!Array.isArray(src) || src.length === 0) return null;
  const ok: FieldType[] = ["text", "textarea", "select", "checkbox", "file", "email"];
  return src.map((f: any, i: number): Field => {
    const rawType = String(f?.type ?? f?.fieldType ?? "text").toLowerCase();
    const type = (ok.includes(rawType as FieldType) ? rawType : "text") as FieldType;
    return {
      id: String(f?.id ?? f?.key ?? `f${i + 1}`),
      type,
      label: String(f?.label ?? f?.name ?? f?.question ?? "Untitled field"),
      required: Boolean(f?.required ?? f?.isRequired ?? false),
      locked: Boolean(f?.locked ?? f?.system ?? false),
      options: Array.isArray(f?.options) ? f.options.map(String) : undefined,
    };
  });
}

type SaveState = { kind: "idle" | "saving" | "ok" | "err"; msg?: string };

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [sel, setSel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedSaved, setLoadedSaved] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  // Best-effort load: try the dedicated form endpoint, then fall back to the
  // requisition itself. Anything that does not parse leaves the defaults in place.
  useEffect(() => {
    let alive = true;
    (async () => {
      let next: Field[] | null = null;
      try { next = coerceFields(await raw("GET", `/requisitions/${id}/form`)); } catch { /* try fallback */ }
      if (!next) { try { next = coerceFields(await raw("GET", `/requisitions/${id}`)); } catch { /* keep defaults */ } }
      if (!alive) return;
      if (next && next.length) { setFields(next); setLoadedSaved(true); }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id]);

  const add = (type: FieldType, label: string) =>
    setFields((fs) => [...fs, { id: "f" + Date.now(), type, label: label + " field", required: false }]);
  const upd = (fid: string, patch: Partial<Field>) =>
    setFields((fs) => fs.map((f) => (f.id === fid ? { ...f, ...patch } : f)));
  const remove = (fid: string) =>
    setFields((fs) => fs.filter((f) => f.id !== fid || f.locked));
  const move = (i: number, dir: number) =>
    setFields((fs) => { const j = i + dir; if (j < 0 || j >= fs.length) return fs; const n = [...fs]; [n[i], n[j]] = [n[j], n[i]]; return n; });

  // Save attempts PUT then POST; either success surfaces inline confirmation.
  const onSave = useCallback(async () => {
    setSave({ kind: "saving" });
    const payload = { fields };
    try {
      await raw("PUT", `/requisitions/${id}/form`, payload);
      setSave({ kind: "ok", msg: "Form saved." });
    } catch {
      try {
        await raw("POST", `/requisitions/${id}/form`, payload);
        setSave({ kind: "ok", msg: "Form saved." });
      } catch {
        setSave({ kind: "err", msg: "Could not save to the server. Your changes are kept locally." });
      }
    }
  }, [fields, id]);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header + publish bar */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Application form</h1>
          <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
            {fields.length} fields candidates fill for requisition <span className="mono">{id}</span>.
            {loadedSaved ? " Loaded from your saved form." : " Starting from the default field set."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          {save.kind === "ok" && (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-ok)" }}>
              <Icon name="check" size={14} stroke={2.2} />{save.msg}
            </span>
          )}
          {save.kind === "err" && (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-warn)", maxWidth: 320 }}>
              <Icon name="flag" size={14} />{save.msg}
            </span>
          )}
          <Btn variant="primary" icon={save.kind === "saving" ? "clock" : "check"} onClick={onSave}>
            {save.kind === "saving" ? "Saving..." : "Save form"}
          </Btn>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[38px] rounded-[10px]" />)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[54px] rounded-[10px]" />)}</div>
          <Skeleton className="h-[420px] rounded-[16px]" />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 16, alignItems: "start" }}>
          {/* palette */}
          <div>
            <div style={{ ...LABEL_STYLE, marginBottom: 10 }}>Add a field</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {FIELD_PALETTE.map((p) => (
                <button key={p.type} onClick={() => add(p.type, p.label)}
                  style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink)", textAlign: "left", fontFamily: "var(--font-sans)", transition: "all var(--t-fast)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c-brand)"; e.currentTarget.style.background = "var(--c-brand-tint)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-surface)"; }}>
                  <Icon name={p.icon} size={15} style={{ color: "var(--c-ink-3)" }} />{p.label}
                  <Icon name="plus" size={13} style={{ marginLeft: "auto", color: "var(--c-ink-3)" }} />
                </button>
              ))}
            </div>
          </div>

          {/* canvas */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={LABEL_STYLE}>Form structure · {fields.length} fields</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fields.map((f, i) => (
                <div key={f.id} onClick={() => setSel(f.id)}
                  style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid", borderColor: sel === f.id ? "var(--c-brand)" : "var(--c-line)", background: "var(--c-surface)", cursor: "pointer", boxShadow: sel === f.id ? "var(--ring)" : "var(--e1)", animation: "rise .3s var(--ease-out)" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button onClick={(e) => { e.stopPropagation(); move(i, -1); }} disabled={i === 0}
                      style={{ border: "none", background: "none", cursor: i === 0 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === 0 ? 0.3 : 1, padding: 0, lineHeight: 0 }}>
                      <Icon name="chevD" size={13} style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); move(i, 1); }} disabled={i === fields.length - 1}
                      style={{ border: "none", background: "none", cursor: i === fields.length - 1 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === fields.length - 1 ? 0.3 : 1, padding: 0, lineHeight: 0 }}>
                      <Icon name="chevD" size={13} />
                    </button>
                  </div>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}>
                    <Icon name={TYPE_ICON[f.type]} size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input value={f.label} onChange={(e) => upd(f.id, { label: e.target.value })} onClick={(e) => e.stopPropagation()}
                      style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-sans)" }} />
                    <span style={{ fontSize: 10.5, color: "var(--c-ink-3)", textTransform: "capitalize" }}>{f.type}{f.locked ? " · default" : ""}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); upd(f.id, { required: !f.required }); }}
                    style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", color: f.required ? "var(--c-danger)" : "var(--c-ink-3)", background: f.required ? "var(--c-danger-tint)" : "var(--c-surface-2)" }}>
                    {f.required ? "Required" : "Optional"}
                  </button>
                  {!f.locked ? (
                    <button onClick={(e) => { e.stopPropagation(); remove(f.id); }}
                      style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                      <Icon name="x" size={14} />
                    </button>
                  ) : (
                    <span title="Locked default field" style={{ display: "grid", placeItems: "center", width: 26, height: 26 }}>
                      <Icon name="shield" size={14} style={{ color: "var(--c-ink-3)" }} />
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* field settings, shown when a field is selected */}
            {sel && (() => {
              const f = fields.find((x) => x.id === sel);
              if (!f) return null;
              return (
                <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", boxShadow: "var(--e1)", animation: "rise .3s var(--ease-out)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ ...LABEL_STYLE, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="settings" size={13} /> Field settings</span>
                    <button onClick={() => setSel(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--c-ink-3)", display: "grid", placeItems: "center" }}><Icon name="x" size={14} /></button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Label</div>
                      <input value={f.label} onChange={(e) => upd(f.id, { label: e.target.value })}
                        style={{ width: "100%", padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)", outline: "none" }} />
                    </div>
                    <div>
                      <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Field type</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {FIELD_PALETTE.map((p) => {
                          const active = f.type === p.type;
                          return (
                            <button key={p.type} disabled={f.locked} onClick={() => upd(f.id, { type: p.type })}
                              style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 10px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: active ? "transparent" : "var(--c-line-2)", background: active ? "var(--c-brand-tint)" : "var(--c-surface)", color: active ? "var(--c-brand-ink)" : "var(--c-ink-2)", cursor: f.locked ? "not-allowed" : "pointer", opacity: f.locked && !active ? 0.5 : 1, fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                              <Icon name={p.icon} size={13} />{p.label}
                            </button>
                          );
                        })}
                      </div>
                      {f.locked && <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 6, display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="shield" size={12} /> Default fields keep their type.</div>}
                    </div>
                    <button onClick={() => upd(f.id, { required: !f.required })}
                      style={{ display: "inline-flex", gap: 8, alignItems: "center", alignSelf: "flex-start", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: f.required ? "transparent" : "var(--c-line-2)", background: f.required ? "var(--c-danger-tint)" : "var(--c-surface)", color: f.required ? "var(--c-danger)" : "var(--c-ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                      <span style={{ width: 26, height: 15, borderRadius: 99, background: f.required ? "var(--c-danger)" : "var(--c-line-strong)", position: "relative", transition: "background var(--t)" }}>
                        <span style={{ position: "absolute", top: 2, left: f.required ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
                      </span>
                      Required field
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* live candidate preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ ...LABEL_STYLE, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Candidate preview</span>
              <Btn variant="primary" size="sm" icon="arrowUpRight" onClick={onSave}>Publish</Btn>
            </div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Apply: Senior Backend Engineer</div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 16 }}>Northwind Talent · Payments</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {fields.map((f) => (
                  <div key={f.id}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 5 }}>
                      {f.label}{f.required && <span style={{ color: "var(--c-danger)" }}> *</span>}
                    </label>
                    {f.type === "textarea" ? (
                      <div style={{ height: 56, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)" }} />
                    ) : f.type === "select" ? (
                      <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", fontSize: 12.5, color: "var(--c-ink-3)" }}>
                        Select...<Icon name="chevD" size={14} />
                      </div>
                    ) : f.type === "checkbox" ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid var(--c-line-strong)" }} />
                        <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Yes</span>
                      </div>
                    ) : f.type === "file" ? (
                      <div style={{ height: 46, borderRadius: "var(--r)", border: "1.5px dashed var(--c-line-strong)", background: "var(--c-surface-2)", display: "grid", placeItems: "center", fontSize: 12, color: "var(--c-ink-3)" }}>
                        Drop file or browse
                      </div>
                    ) : (
                      <div style={{ height: 38, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)" }} />
                    )}
                  </div>
                ))}
                <button style={{ marginTop: 4, padding: "10px", borderRadius: "var(--r)", border: "none", background: "var(--c-brand)", color: "var(--c-on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                  Submit application
                </button>
              </div>
            </div>
            <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
              <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
              <span>The required <b style={{ color: "var(--c-ai-ink)" }}>screening criteria</b> from this requisition are appended automatically when candidates apply.</span>
              <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ marginLeft: "auto" }}>auto</Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
