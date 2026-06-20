"use client";
// app/(embed)/embed/apply/[token]/page.tsx
//
// WF9 / SLICE I1 — chrome-less PUBLIC APPLY embed. A tenant drops this widget on
// their own careers page; a candidate applies WITHOUT leaving that page. It
// renders the tenant's REAL application form schema (resolved server-side from
// the embed token's locked job slug) using the same field types the candidate
// portal apply page supports (text / email / phone / url / textarea / select /
// checkbox / file / image), and submits a multipart application to the public
// /public/jobs/:slug/apply-custom endpoint (the same no-auth ingress the portal
// uses — it creates a real Candidate + Application and forwards the resume).
//
// The form's look is ported from the candidate apply page (cd-token themed via
// the --c-* full-color tokens) and is white-labelled by EmbedShell's brand ramp.
// EmbedShell validates the token, applies the tenant brand, and fails closed.
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { EmbedShell, fetchEmbedData, type EmbedContext } from "../../embed-shell";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/* ---- minimal icon subset (ported from the candidate apply page) ---- */
const PI: Record<string, string> = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  upload: "M12 16V4M8 8l4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3",
};
function I({ n, s = 20, sw = 1.7, c, style }: { n: string; s?: number; sw?: number; c?: string; style?: React.CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={PI[n]} />
    </svg>
  );
}
function AINotice() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 14px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--c-ai)", color: "var(--c-on-brand)", display: "grid", placeItems: "center", flexShrink: 0 }}><I n="sparkles" s={17} /></span>
      <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>AI is assistive, a human decides.</div>
    </div>
  );
}
const Label = ({ children, req }: { children?: React.ReactNode; req?: boolean }) => (
  <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 7 }}>{children}{req && <span style={{ color: "var(--c-brand)" }}> *</span>}</label>
);
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" };

interface FormField { id: string; type: string; label: string; required?: boolean; order?: number; options?: string[]; fileTypes?: string[]; maxSizeMb?: number; helpText?: string; placeholder?: string }
interface JobSummary { title: string; dept: string; loc: string; blurb: string }

function normalizeJob(raw: any): JobSummary {
  const p = raw?.data ?? raw ?? {};
  const j = p.requisition ?? p.job ?? p;
  return {
    title: p.title ?? j?.title ?? "This role",
    dept: j?.department ?? "",
    loc: j?.location ?? "",
    blurb: j?.description ?? p.description ?? "",
  };
}

function ApplyBody({ token, ctx }: { token: string; ctx: EmbedContext }) {
  const slug = (typeof ctx.params?.slug === "string" && ctx.params.slug) || ctx.resourceId;
  const [job, setJob] = useState<JobSummary | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchEmbedData<{ job: any; form: any }>(token);
      if (cancelled) return;
      if (!data?.job) { setLoadFailed(true); setLoaded(true); return; }
      setJob(normalizeJob(data.job));
      const fl = (data.form?.data?.fields ?? data.form?.fields ?? []) as FormField[];
      setFields([...fl].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const set = (id: string, v: string | boolean) => setValues((s) => ({ ...s, [id]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !slug) return;
    setError(null); setSubmitting(true);
    try {
      const fd = new FormData();
      for (const f of fields) {
        if (f.type === "file" || f.type === "image") { const file = files[f.id]; if (file) fd.append(f.id, file); }
        else { const v = values[f.id]; if (v !== undefined && v !== "") fd.append(f.id, String(v)); }
      }
      const r = await fetch(`${API_BASE}/public/jobs/${slug}/apply-custom`, { method: "POST", body: fd });
      const d = await r.json().catch(() => null);
      if (r.ok) {
        setReference(d?.data?.applicationId ?? null);
        setDone(true);
      } else {
        setError(d?.error?.message ?? "We could not submit your application just now. Please check your details and try again.");
      }
    } catch {
      setError("Something went wrong while submitting. Please try again in a moment.");
    } finally { setSubmitting(false); }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "var(--r-2xl)", background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}><I n="check" s={38} sw={2.2} /></div>
        <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px", color: "var(--c-ink)" }}>Application received</h1>
        <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: 0 }}>Thanks for applying{job?.title ? <> to <b style={{ color: "var(--c-ink)" }}>{job.title}</b></> : null}. We have your details and a person will review your application.</p>
        {reference && <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", margin: "10px 0 0" }}>Your reference: <span className="mono" style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>{reference}</span></p>}
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
          <I n="shield" s={18} c="var(--c-ink-3)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", color: "var(--c-ink)" }}>We could not load this role.</div>
            <p style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>It may have been closed or this embed link may be out of date.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 20 }}>
      {job && (
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 6px", color: "var(--c-ink)" }}>{job.title}</h1>
          {(job.dept || job.loc) && <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{[job.dept, job.loc].filter(Boolean).join(" · ")}</div>}
        </div>
      )}

      <AINotice />

      <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
        <div style={{ borderRadius: "var(--r-2xl)", padding: 24, background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
          <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px", color: "var(--c-ink)" }}>Apply for this role</h2>

          {!loaded ? (
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
                    <button type="button" onClick={() => fileRefs.current[f.id]?.click()} style={{ display: "block", width: "100%", border: "1.5px dashed var(--c-line-strong)", borderRadius: "var(--r-lg)", padding: "20px", textAlign: "center", background: "var(--c-surface-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
                      <span style={{ width: 38, height: 38, borderRadius: 11, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 9px" }}><I n="upload" s={19} /></span>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--c-ink)" }}>{files[f.id] ? files[f.id]!.name : <>Drop your file or <span style={{ color: "var(--c-brand)" }}>browse</span></>}</div>
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

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", margin: "4px 0 16px", cursor: "pointer" }}>
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--c-brand)" }} />
            <span>I understand my application may be reviewed with the help of AI, that a human makes the final decision, and that I can request a human review at any time.</span>
          </label>

          {error && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5, marginBottom: 14 }}>
              <I n="shield" s={17} style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !loaded}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%", padding: "13px 22px", fontSize: "var(--fs-md)", fontWeight: 700, borderRadius: "var(--r)", cursor: submitting ? "default" : "pointer", border: "1px solid transparent", background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)", opacity: submitting || !loaded ? 0.6 : 1 }}
          >
            {submitting ? "Submitting..." : "Submit application"}<I n="arrow" s={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EmbedApplyPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <EmbedShell token={token ?? ""} expectedModule="apply">
      {({ token: t, ctx }) => <ApplyBody token={t} ctx={ctx} />}
    </EmbedShell>
  );
}
