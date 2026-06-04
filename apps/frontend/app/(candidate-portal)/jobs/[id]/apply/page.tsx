"use client";
// app/(candidate-portal)/jobs/[id]/apply/page.tsx
// PUBLIC candidate application page (no auth). The [id] route param is the job
// posting SLUG. We load the job summary (GET /public/jobs/:slug) AND the tenant's
// real application form schema (GET /public/jobs/:slug/form), render the schema's
// fields dynamically (text / email / phone / url / textarea / select / checkbox /
// file / image), and on submit POST a multipart application to
// /public/jobs/:slug/apply-custom (field id -> value, the file under its field id),
// which creates a real Candidate + Application and forwards the resume for parsing.
// Design ported from claude-design/portal.jsx (Apply + Confirm). Inline palette
// uses the --c-* full-color tokens; effect/size/motion tokens stay bare.
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function getJSON(path: string): Promise<any> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { credentials: "include" });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/* ---- icons (subset, ported verbatim from portal.jsx's PI map) ---- */
const PI: Record<string, string> = {
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  card: "M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevL: "M15 6l-6 6 6 6",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  upload: "M12 16V4M8 8l4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3",
  briefcase: "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};
function I({ n, s = 20, sw = 1.7, c, style }: { n: string; s?: number; sw?: number; c?: string; style?: React.CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={PI[n]} />
    </svg>
  );
}

function Btn({ kind = "primary", icon, trail, children, onClick, big, full, type, disabled, style = {} }: {
  kind?: "primary" | "soft" | "ghost" | "ai"; icon?: string; trail?: string; children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; big?: boolean; full?: boolean;
  type?: "button" | "submit" | "reset"; disabled?: boolean; style?: React.CSSProperties;
}) {
  const V = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-brand)" },
  }[kind];
  return (
    <button onClick={onClick} type={type} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)", fontWeight: 700, borderRadius: "var(--r)", cursor: disabled ? "default" : "pointer", border: "1px solid transparent", width: full ? "100%" : "auto", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", ...V, ...(disabled ? { opacity: 0.6, pointerEvents: "none" } : {}), ...style }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
      {icon && <I n={icon} s={big ? 19 : 17} />}{children}{trail && <I n={trail} s={big ? 19 : 17} />}
    </button>
  );
}
function Chip({ icon, children, tone = "var(--c-ink-2)", bg = "var(--c-surface-2)" }: { icon?: string; children?: React.ReactNode; tone?: string; bg?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg }}>
      {icon && <I n={icon} s={13} />}{children}
    </span>
  );
}
function AINotice({ compact }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: compact ? "center" : "flex-start", padding: compact ? "11px 14px" : "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--c-ai)", color: "var(--c-on-brand)", display: "grid", placeItems: "center", flexShrink: 0 }}><I n="sparkles" s={17} /></span>
      <div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>AI is assistive, a human decides.</div>
        {!compact && <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>We use AI to help our team review applications fairly. It produces a recommendation only, a person always makes the final call, and you can ask for a human review at any time.</p>}
      </div>
    </div>
  );
}
const Label = ({ children, req }: { children?: React.ReactNode; req?: boolean }) => (
  <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 7 }}>{children}{req && <span style={{ color: "var(--c-brand)" }}> *</span>}</label>
);
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" };

interface FormField { id: string; type: string; label: string; required?: boolean; order?: number; options?: string[]; fileTypes?: string[]; maxSizeMb?: number; url?: string; src?: string; helpText?: string; placeholder?: string }
interface JobSummary { title: string; dept: string; loc: string; min: number | null; max: number | null; blurb: string; required: string[] }
const DEFAULT_JOB: JobSummary = { title: "This role", dept: "", loc: "", min: null, max: null, blurb: "", required: [] };

function normalizeJob(raw: any): JobSummary {
  const p = raw?.data ?? raw ?? {};
  const j = p.requisition ?? p.job ?? p;
  const required = Array.isArray(j?.requirements) ? j.requirements.map((r: any) => (typeof r === "string" ? r : r?.label ?? String(r))) : [];
  return {
    title: p.title ?? j?.title ?? DEFAULT_JOB.title,
    dept: j?.department ?? "", loc: j?.location ?? "",
    min: typeof j?.salaryMin === "number" ? Math.round(j.salaryMin / 1000) : null,
    max: typeof j?.salaryMax === "number" ? Math.round(j.salaryMax / 1000) : null,
    blurb: j?.description ?? p.description ?? "",
    required,
  };
}

function Confirm({ title, reference }: { title: string; reference: string | null }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
      <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}><I n="check" s={42} sw={2.2} /></div>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Application received</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>Thanks for applying to <b style={{ color: "var(--c-ink)" }}>{title}</b>. We have emailed you a confirmation, and you can check your status anytime.</p>
      {reference && <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", margin: "4px 0 0" }}>Your reference: <span className="mono" style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>{reference}</span></p>}
      <div style={{ margin: "22px auto 0", maxWidth: 420 }}><AINotice compact /></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
        <a href="/status" style={{ textDecoration: "none" }}><Btn kind="primary" icon="eye">Track my status</Btn></a>
        <a href="/jobs" style={{ textDecoration: "none" }}><Btn kind="soft">Browse more roles</Btn></a>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const { id: slug } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobSummary>(DEFAULT_JOB);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const [j, f] = await Promise.all([getJSON(`/public/jobs/${slug}`), getJSON(`/public/jobs/${slug}/form`)]);
      if (cancelled) return;
      if (j) setJob(normalizeJob(j));
      const fl = (f?.data?.fields ?? f?.fields ?? []) as FormField[];
      setFields([...fl].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const set = (id: string, v: string | boolean) => setValues((s) => ({ ...s, [id]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null); setSubmitting(true);
    try {
      const fd = new FormData();
      for (const f of fields) {
        if (f.type === "file" || f.type === "image") { const file = files[f.id]; if (file) fd.append(f.id, file); }
        else { const v = values[f.id]; if (v !== undefined && v !== "") fd.append(f.id, String(v)); }
      }
      const r = await fetch(`${API_BASE}/public/jobs/${slug}/apply-custom`, { method: "POST", credentials: "include", body: fd });
      const d = await r.json().catch(() => null);
      if (r.ok) {
        setReference(d?.data?.applicationId ?? null);
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(d?.error?.message ?? "We could not submit your application just now. Please check your details and try again.");
      }
    } catch {
      setError("Something went wrong while submitting. Please try again in a moment.");
    } finally { setSubmitting(false); }
  }

  if (done) return <Confirm title={job.title} reference={reference} />;

  const salary = job.min != null && job.max != null ? `$${job.min}k to $${job.max}k` : null;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
      <a href="/jobs" style={{ display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none", color: "var(--c-ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> All roles</a>

      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {job.dept && <Chip icon="briefcase">{job.dept}</Chip>}
        {job.loc && <Chip icon="pin">{job.loc}</Chip>}
        {salary && <Chip icon="card" tone="var(--c-brand)" bg="var(--c-brand-tint)">{salary}</Chip>}
      </div>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>{job.title}</h1>
      {job.blurb && <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 18px" }}>{job.blurb}</p>}
      {job.required.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 9 }}>What you will need</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {job.required.map((r, i) => <div key={i} style={{ display: "flex", gap: 9, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}><I n="check" s={17} c="var(--c-brand)" style={{ flexShrink: 0, marginTop: 1 }} />{r}</div>)}
          </div>
        </div>
      )}

      <AINotice />

      <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26 }}>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 18px" }}>Apply for this role</h2>

          {loading ? (
            <div style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-sm)", padding: "12px 0" }}>Loading the application form...</div>
          ) : fields.map((f) => {
            const v = values[f.id];
            const isUpload = f.type === "file" || f.type === "image";
            const accept = f.fileTypes && f.fileTypes.length ? f.fileTypes : (f.type === "image" ? [".png", ".jpg", ".jpeg"] : [".pdf", ".doc", ".docx"]);
            const maxMb = f.maxSizeMb ?? (f.type === "image" ? 5 : 10);
            return (
              <div key={f.id} style={{ marginBottom: 16 }}>
                {f.type !== "checkbox" && <Label req={f.required}>{f.label}</Label>}
                {f.type === "textarea" ? (
                  <textarea rows={3} required={f.required} value={(v as string) ?? ""} onChange={(e) => set(f.id, e.target.value)} style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} placeholder={f.placeholder ?? f.helpText} />
                ) : f.type === "select" ? (
                  <select required={f.required} value={(v as string) ?? ""} onChange={(e) => set(f.id, e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                    <option value="">Select...</option>
                    {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : f.type === "checkbox" ? (
                  <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", cursor: "pointer" }}>
                    <input type="checkbox" required={f.required} checked={Boolean(v)} onChange={(e) => set(f.id, e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--c-brand)" }} />
                    <span>{f.label}{f.required && <span style={{ color: "var(--c-brand)" }}> *</span>}</span>
                  </label>
                ) : isUpload ? (
                  <>
                    <button type="button" onClick={() => fileRefs.current[f.id]?.click()} style={{ display: "block", width: "100%", border: "1.5px dashed var(--c-line-strong)", borderRadius: "var(--r-lg)", padding: "22px", textAlign: "center", background: "var(--c-surface-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                      <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n={f.type === "image" ? "sparkles" : "upload"} s={20} /></span>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--c-ink)" }}>{files[f.id] ? files[f.id]!.name : <>Drop {f.type === "image" ? "an image" : "your file"} or <span style={{ color: "var(--c-brand)" }}>browse</span></>}</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", marginTop: 3 }}>{files[f.id] ? `${(files[f.id]!.size / 1024).toFixed(0)} KB` : `${accept.join(", ")}, up to ${maxMb} MB`}</div>
                    </button>
                    <input ref={(el) => { fileRefs.current[f.id] = el; }} type="file" required={f.required} accept={accept.join(",")} onChange={(e) => setFiles((s) => ({ ...s, [f.id]: e.target.files?.[0] ?? null }))} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }} />
                  </>
                ) : (
                  <input type={f.type === "email" ? "email" : f.type === "url" ? "url" : f.type === "phone" ? "tel" : "text"} required={f.required} value={(v as string) ?? ""} onChange={(e) => set(f.id, e.target.value)} style={inp} placeholder={f.placeholder ?? f.helpText ?? ""} />
                )}
              </div>
            );
          })}

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", margin: "4px 0 18px", cursor: "pointer" }}>
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--c-brand)" }} />
            <span>I understand my application may be reviewed with the help of AI, that a human makes the final decision, and that I can <b style={{ color: "var(--c-ink)" }}>request a human review</b> at any time.</span>
          </label>

          {error && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5, marginBottom: 16 }}>
              <I n="shield" s={17} style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span>
            </div>
          )}

          <Btn kind="primary" big full trail="arrow" type="submit" disabled={submitting || loading}>{submitting ? "Submitting..." : "Submit application"}</Btn>
        </div>
      </form>
    </div>
  );
}
