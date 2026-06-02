"use client";
// app/(dashboard)/requisitions/[id]/form-builder/page.tsx
// EXACT Claude Design "Aurora" application form-builder, ported from
// claude-design/req-builder.jsx (the FormBuilder component) and wired to the
// real gateway. Three-column working surface: field palette, the form canvas
// (orderable/editable fields), and a live candidate preview. Interactive in
// session via local useState; loads any existing schema best-effort and saves
// it via PUT, falling back to an inline notice when the gateway declines.
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, Greeting } from "@/components/aurora-kit";
import { Skeleton } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

const LABEL: CSS = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

type FieldType = "text" | "textarea" | "select" | "checkbox" | "file" | "email" | "phone" | "url" | string;
type Field = { id: string; type: FieldType; label: string; required?: boolean; locked?: boolean; options?: string[] };

// Empty default set, no fake "saved" data. Used only when nothing loads.
const DEFAULT_FIELDS: Field[] = [
  { id: "f1", type: "text", label: "Full name", required: true, locked: true },
  { id: "f2", type: "email", label: "Email address", required: true, locked: true },
  { id: "f3", type: "file", label: "Resume / CV", required: true, locked: true },
];

const FIELD_PALETTE: { type: FieldType; label: string; icon: string }[] = [
  { type: "text", label: "Short text", icon: "type" },
  { type: "textarea", label: "Long text", icon: "fileText" },
  { type: "select", label: "Dropdown", icon: "chevD" },
  { type: "checkbox", label: "Yes / No", icon: "check" },
  { type: "file", label: "File upload", icon: "fileText" },
  { type: "email", label: "Email", icon: "dot" },
];

const TYPE_ICON: Record<string, string> = {
  text: "type", textarea: "fileText", select: "chevD", checkbox: "check",
  file: "fileText", email: "dot", phone: "dot", url: "dot",
};

type Notice = { tone: "ok" | "warn"; text: string } | null;

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const reqId = params.id;

  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [sel, setSel] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("this role");
  const [subtitle, setSubtitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Best-effort load: try the form schema first, then fall back to the
  // requisition record (for title/department). Never block on either.
  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    let gotForm = false;
    try {
      const f = await raw(`/requisitions/${reqId}/form`);
      const data = f?.data ?? f;
      if (Array.isArray(data?.fields) && data.fields.length > 0) {
        setFields(data.fields.map((x: Field) => ({ ...x })));
        gotForm = true;
      }
    } catch {
      // no custom form yet, start from the default set
    }
    try {
      const r = await raw(`/requisitions/${reqId}`);
      const req = r?.data ?? r;
      if (req?.title) setTitle(req.title);
      const parts = [req?.department, req?.location].filter(Boolean);
      if (parts.length) setSubtitle(parts.join(" · "));
    } catch {
      // requisition lookup is decorative for this surface
    }
    if (!gotForm) {
      // leave the default field set in place; do not invent saved data
    }
    setLoading(false);
  }, [reqId]);

  useEffect(() => { if (reqId) load(); }, [reqId, load]);

  const add = (type: FieldType, label: string) =>
    setFields((cur) => [...cur, { id: "f" + Date.now(), type, label: label + " field", required: false }]);
  const upd = (id: string, patch: Partial<Field>) =>
    setFields((cur) => cur.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const remove = (id: string) =>
    setFields((cur) => cur.filter((f) => f.id !== id || f.locked));
  const move = (i: number, dir: number) =>
    setFields((cur) => {
      const j = i + dir; if (j < 0 || j >= cur.length) return cur;
      const n = [...cur]; [n[i], n[j]] = [n[j], n[i]]; return n;
    });

  const save = async () => {
    setSaving(true);
    setNotice(null);
    const payload = {
      name: "Default",
      fields: fields.map((f, i) => ({
        id: f.id, type: f.type, label: f.label, required: !!f.required, order: i,
        ...(f.options ? { options: f.options } : {}),
      })),
    };
    try {
      await raw(`/requisitions/${reqId}/form`, { method: "PUT", body: JSON.stringify(payload) });
      setNotice({ tone: "ok", text: "Form saved. Candidates will see these fields when they apply." });
    } catch {
      // Gateway declined (permissions, plan, or endpoint unavailable). Keep the
      // in-session edits and surface an honest notice instead of faking success.
      try {
        await raw(`/requisitions/${reqId}/form`, { method: "POST", body: JSON.stringify(payload) });
        setNotice({ tone: "ok", text: "Form saved. Candidates will see these fields when they apply." });
      } catch {
        setNotice({ tone: "warn", text: "Could not save to the server. Your changes are kept in this session only." });
      }
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Greeting title="Application form" sub={`Design the fields candidates fill in when they apply to ${title}.`}>
        <Btn variant="primary" icon="check" onClick={save}>{saving ? "Saving..." : "Save form"}</Btn>
      </Greeting>

      {notice && (
        <div
          role="status"
          style={{
            marginBottom: 16, padding: "11px 14px", borderRadius: "var(--r)",
            display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, fontWeight: 500,
            color: notice.tone === "ok" ? "var(--c-ok)" : "var(--c-warn)",
            background: notice.tone === "ok" ? "var(--c-ok-tint)" : "var(--c-warn-tint)",
            border: "1px solid " + (notice.tone === "ok" ? "color-mix(in oklab, var(--c-ok) 22%, transparent)" : "color-mix(in oklab, var(--c-warn) 24%, transparent)"),
          }}
        >
          <Icon name={notice.tone === "ok" ? "check" : "flag"} size={15} style={{ flexShrink: 0 }} />
          <span>{notice.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 16, alignItems: "start" }}>
          <Skeleton className="h-[220px] rounded-[14px]" />
          <Skeleton className="h-[300px] rounded-[14px]" />
          <Skeleton className="h-[360px] rounded-[14px]" />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 16, alignItems: "start" }}>
          {/* palette */}
          <div>
            <div style={{ ...LABEL, marginBottom: 10 }}>Add a field</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {FIELD_PALETTE.map((p) => (
                <button
                  key={p.type}
                  onClick={() => add(p.type, p.label)}
                  style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--c-ink)", textAlign: "left", transition: "all var(--t-fast)", fontFamily: "var(--font-sans)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c-brand)"; e.currentTarget.style.background = "var(--c-brand-tint)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-surface)"; }}
                >
                  <Icon name={p.icon} size={15} style={{ color: "var(--c-ink-3)" }} />{p.label}
                  <Icon name="plus" size={13} style={{ marginLeft: "auto", color: "var(--c-ink-3)" }} />
                </button>
              ))}
            </div>
          </div>

          {/* canvas */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={LABEL}>Form structure &middot; {fields.length} fields</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fields.map((f, i) => (
                <div
                  key={f.id}
                  onClick={() => setSel(f.id)}
                  style={{ display: "flex", gap: 11, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid", borderColor: sel === f.id ? "var(--c-brand)" : "var(--c-line)", background: "var(--c-surface)", cursor: "pointer", boxShadow: sel === f.id ? "var(--ring)" : "var(--e1)" }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button aria-label="Move field up" onClick={(e) => { e.stopPropagation(); move(i, -1); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--c-ink-3)", padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} style={{ transform: "rotate(180deg)" }} /></button>
                    <button aria-label="Move field down" onClick={(e) => { e.stopPropagation(); move(i, 1); }} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--c-ink-3)", padding: 0, lineHeight: 0 }}><Icon name="chevD" size={13} /></button>
                  </div>
                  <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", flexShrink: 0, background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name={TYPE_ICON[f.type] ?? "type"} size={15} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      value={f.label}
                      aria-label="Field label"
                      onChange={(e) => upd(f.id, { label: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}
                    />
                    <span style={{ fontSize: 10.5, color: "var(--c-ink-3)", textTransform: "capitalize" }}>{f.type}{f.locked ? " · default" : ""}</span>
                  </div>
                  <button
                    aria-label={f.required ? "Mark optional" : "Mark required"}
                    onClick={(e) => { e.stopPropagation(); upd(f.id, { required: !f.required }); }}
                    style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, border: "none", cursor: "pointer", color: f.required ? "var(--c-danger)" : "var(--c-ink-3)", background: f.required ? "var(--c-danger-tint)" : "var(--c-surface-2)" }}
                  >{f.required ? "Required" : "Optional"}</button>
                  {!f.locked ? (
                    <button aria-label="Remove field" onClick={(e) => { e.stopPropagation(); remove(f.id); }} style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", border: "none", background: "transparent", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
                  ) : (
                    <span title="Locked default field" style={{ display: "grid", placeItems: "center", width: 26, height: 26 }}><Icon name="shield" size={14} style={{ color: "var(--c-ink-3)" }} /></span>
                  )}
                </div>
              ))}
              {fields.length === 0 && (
                <div style={{ padding: "22px 16px", borderRadius: "var(--r)", border: "1px dashed var(--c-line-strong)", background: "var(--c-surface-2)", textAlign: "center", fontSize: 12.5, color: "var(--c-ink-3)" }}>
                  No fields yet. Add one from the palette on the left.
                </div>
              )}
            </div>
          </div>

          {/* live preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ ...LABEL, display: "inline-flex", gap: 6, alignItems: "center" }}><Icon name="eye" size={13} /> Candidate preview</span>
              <Btn variant="primary" size="sm" icon="arrowUpRight" onClick={save}>Publish</Btn>
            </div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Apply: {title}</div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 16 }}>{subtitle || "Application form"}</div>
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

            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" icon="layers">{fields.length} fields</Pill>
              <Pill tone="var(--c-danger)" bg="var(--c-danger-tint)" icon="flag">{fields.filter((f) => f.required).length} required</Pill>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
