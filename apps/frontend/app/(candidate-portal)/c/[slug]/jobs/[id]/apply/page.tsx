"use client";
// app/(candidate-portal)/c/[slug]/jobs/[id]/apply/page.tsx
// RICH, TENANT-SCOPED port of claude-design/portal.jsx -> the Apply component
// (warm, ethical-AI-first candidate application form) plus its Confirm success
// state. This is the per-tenant sibling of /jobs/[id]/apply, branded by slug.
//
// This is a PUBLIC, content-only page: CandidateLayout (the route group's
// layout) supplies the slug-aware nav, footer and the max-w main wrapper, so we
// render the form CONTENT only (no min-h-screen / no chrome of our own).
//
// Faithful to the prototype's Apply/Confirm: job summary header + "What you'll
// need", the AI-advisory "a human decides" notice, the application fields
// (name / email / linkedin / resume upload / role-specific questions / cover
// note / consent), submit, and the celebratory Confirm screen.
//
// The portal-specific helpers (I / Btn / Chip / AINotice / Label) are
// reproduced inline. Inline palette colors use the full-color --c-* tokens;
// effect / size / motion tokens (--r, --e1, --fs-*, --t, --ease-out, ...) stay
// bare. The prototype's `rise` / `pop` keyframes exist globally.
//
// WIRED: a fully controlled form (useState) with a real resume <input
// type="file">. We read BOTH params via useParams<{ slug; id }>() and
// best-effort load the job summary via raw() (GET /c/{slug}/jobs/{id}, falling
// back to /public/jobs/{id}) and on submit POST the application as FormData via
// raw() (/c/{slug}/jobs/{id}/apply, then /jobs/{id}/apply, then /applications).
// On success we render Confirm with the server's reference id when present; on
// failure we show a friendly inline notice. No fabricated confirmation.
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/* ---- raw() local: best-effort fetch against the API, JSON or FormData ---- */
async function raw(
  paths: string[],
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: any } | null> {
  for (const p of paths) {
    try {
      const r = await fetch(`${API_BASE}${p}`, { credentials: "include", ...init });
      // A 404 on the first candidate path -> try the next fallback path.
      if (r.status === 404 && p !== paths[paths.length - 1]) continue;
      let data: any = null;
      try { data = await r.json(); } catch { /* empty / non-JSON body */ }
      return { ok: r.ok, status: r.status, data };
    } catch {
      // network error -> try the next path, else report failure
      if (p === paths[paths.length - 1]) return null;
    }
  }
  return null;
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

/* ---- shared (ported inline) ---- */
function Btn({
  kind = "primary", icon, trail, children, onClick, big, full, type, disabled, style = {},
}: {
  kind?: "primary" | "soft" | "ghost" | "ai";
  icon?: string; trail?: string; children?: React.ReactNode;
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
    <button
      onClick={onClick} type={type} disabled={disabled}
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

/* AI-assistive banner, appears wherever AI touches the candidate */
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

/* ---- job summary (best-effort, with the prototype's defaults as fallback) ---- */
interface JobSummary {
  title: string;
  dept: string;
  loc: string;
  min: number | null;
  max: number | null;
  blurb: string;
  required: string[];
  custom: { label: string; help: string }[];
}
// Honest neutral placeholder, NEVER fabricated job content. Until the real job
// loads we show only a neutral title; a fetch failure renders an explicit error
// state (see the render) rather than inventing a role, salary or requirements.
const EMPTY_JOB: JobSummary = {
  title: "This role",
  dept: "",
  loc: "",
  min: null,
  max: null,
  blurb: "",
  required: [],
  custom: [],
};

function normalizeJob(d: any): JobSummary {
  if (!d || typeof d !== "object") return EMPTY_JOB;
  const j = d.data ?? d.job ?? d;
  if (!j || typeof j !== "object") return EMPTY_JOB;
  const custom = Array.isArray(j.customQuestions ?? j.custom ?? j.questions)
    ? (j.customQuestions ?? j.custom ?? j.questions).map((c: any) =>
        typeof c === "string"
          ? { label: c, help: "" }
          : { label: c.label ?? c.question ?? c.prompt ?? "Question", help: c.help ?? c.placeholder ?? c.description ?? "" })
    : EMPTY_JOB.custom;
  const required = Array.isArray(j.requirements ?? j.required ?? j.mustHaves)
    ? (j.requirements ?? j.required ?? j.mustHaves).map((r: any) => (typeof r === "string" ? r : r.label ?? r.text ?? String(r)))
    : EMPTY_JOB.required;
  return {
    title: j.title ?? j.name ?? EMPTY_JOB.title,
    dept: j.department ?? j.dept ?? EMPTY_JOB.dept,
    loc: j.location ?? j.loc ?? EMPTY_JOB.loc,
    min: typeof j.salaryMin === "number" ? Math.round(j.salaryMin / 1000) : (typeof j.min === "number" ? j.min : EMPTY_JOB.min),
    max: typeof j.salaryMax === "number" ? Math.round(j.salaryMax / 1000) : (typeof j.max === "number" ? j.max : EMPTY_JOB.max),
    blurb: j.summary ?? j.blurb ?? j.description ?? EMPTY_JOB.blurb,
    required,
    custom,
  };
}

const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" };

/* ---- Confirm success state ---- */
function Confirm({ job, reference, slug }: { job: JobSummary; reference: string | null; slug: string }) {
  const jobsHref = slug ? `/c/${slug}/jobs` : "/jobs";
  const statusHref = slug ? `/c/${slug}/status` : "/status";
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
      <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}><I n="check" s={42} sw={2.2} /></div>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Application received</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>Thanks for applying to <b style={{ color: "var(--c-ink)" }}>{job.title}</b>. We have emailed you a confirmation, and you can check your status anytime.</p>
      {reference && (
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", margin: "4px 0 0" }}>
          Your reference: <span className="mono" style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>{reference}</span>
        </p>
      )}
      {/* honest next steps, no fabricated timeline beyond the standard flow */}
      <div style={{ margin: "22px auto 0", maxWidth: 420, textAlign: "left", padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 6 }}>What happens next</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>
          <li>A recruiter reviews your application alongside an AI-assisted summary.</li>
          <li>A human makes every decision, and you can request a human review at any time.</li>
          <li>Track progress anytime from your status page.</li>
        </ul>
      </div>
      <div style={{ margin: "16px auto 0", maxWidth: 420 }}><AINotice compact /></div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
        <a href={statusHref} style={{ textDecoration: "none" }}><Btn kind="primary" icon="eye">Track my status</Btn></a>
        <a href={jobsHref} style={{ textDecoration: "none" }}><Btn kind="soft">Browse more roles</Btn></a>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();

  const [job, setJob] = useState<JobSummary>(EMPTY_JOB);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // controlled form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [cover, setCover] = useState("");
  const [consent, setConsent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // best-effort load of the job summary (tenant-scoped first, then public). We
  // NEVER fall back to a fabricated job: if the fetch fails we surface an honest
  // error state instead of inventing a role / salary / requirements.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const res = await raw([`/c/${slug}/jobs/${id}`, `/public/jobs/${id}`]);
      if (cancelled) return;
      if (res?.ok && res.data) setJob(normalizeJob(res.data));
      else setLoadFailed(true);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (linkedin) fd.append("linkedin", linkedin);
      if (resume) fd.append("resume", resume);
      job.custom.forEach((c, i) => {
        if (answers[i]) fd.append(`answer_${i}`, answers[i]);
      });
      // structured copy of the custom answers for backends that prefer JSON
      fd.append("customAnswers", JSON.stringify(job.custom.map((c, i) => ({ label: c.label, answer: answers[i] ?? "" }))));
      if (cover) fd.append("coverNote", cover);
      fd.append("consent", String(consent));
      fd.append("jobId", String(id ?? ""));
      if (slug) fd.append("tenant", String(slug));

      const res = await raw([`/c/${slug}/jobs/${id}/apply`, `/jobs/${id}/apply`, `/applications`], { method: "POST", body: fd });
      if (res?.ok) {
        const d = res.data?.data ?? res.data ?? {};
        setReference(d.reference ?? d.id ?? d.applicationId ?? null);
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError("We could not submit your application just now. Please check your details and try again, or contact the team if the problem continues.");
      }
    } catch {
      setError("Something went wrong while submitting. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <Confirm job={job} reference={reference} slug={slug} />;

  const salary = job.min != null && job.max != null ? `₹${job.min}k to ₹${job.max}k` : null;
  const jobsHref = slug ? `/c/${slug}/jobs` : "/jobs";

  // Honest loading + error states: we never render a fabricated job, so until
  // the real role loads we show a neutral loader, and on failure an explicit
  // "could not load" notice with a way back to the live job list.
  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .4s var(--ease-out)" }}>
        <a href={jobsHref} style={{ display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none", color: "var(--c-ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> All roles</a>
        <div style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-md)", padding: "40px 0" }}>Loading this role...</div>
      </div>
    );
  }
  if (loadFailed) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .4s var(--ease-out)" }}>
        <a href={jobsHref} style={{ display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none", color: "var(--c-ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> All roles</a>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
          <I n="shield" s={18} c="var(--c-ink-3)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>We could not load this role.</div>
            <p style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>It may have been closed or the link may be out of date. <a href={jobsHref} style={{ color: "var(--c-brand)", fontWeight: 600 }}>Browse open roles</a> to find another opening.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .4s var(--ease-out)" }}>
      <a href={jobsHref} style={{ display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none", color: "var(--c-ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> All roles</a>

      {/* job header - only render facets the real job actually provides */}
      {(job.dept || job.loc || salary) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {job.dept && <Chip icon="briefcase">{job.dept}</Chip>}
          {job.loc && <Chip icon="pin">{job.loc}</Chip>}
          {salary && <Chip icon="card" tone="var(--c-brand)" bg="var(--c-brand-tint)">{salary}</Chip>}
        </div>
      )}
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 14px" }}>{job.title}</h1>
      {job.blurb && <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 18px" }}>{job.blurb}</p>}
      {job.required.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 9 }}>What you will need</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {job.required.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 9, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
                <I n="check" s={17} c="var(--c-brand)" style={{ flexShrink: 0, marginTop: 1 }} />{r}
              </div>
            ))}
          </div>
        </div>
      )}

      <AINotice />

      {/* form */}
      <form onSubmit={onSubmit} style={{ marginTop: 20 }}>
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26 }}>
          <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 18px" }}>Apply for this role</h2>

          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}><Label req>Full name</Label><input required value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="Your name" /></div>
            <div style={{ flex: 1, minWidth: 200 }}><Label req>Email</Label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder="you@email.com" /></div>
          </div>
          <div style={{ marginBottom: 16 }}><Label>LinkedIn or portfolio</Label><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} style={inp} placeholder="https://" /></div>

          {/* resume upload (real file input behind the drop zone) */}
          <div style={{ marginBottom: 20 }}>
            <Label req>Resume / CV</Label>
            <button type="button" onClick={() => fileRef.current?.click()} style={{ display: "block", width: "100%", border: "1.5px dashed var(--c-line-strong)", borderRadius: "var(--r-lg)", padding: "22px", textAlign: "center", background: "var(--c-surface-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="upload" s={20} /></span>
              <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--c-ink)" }}>
                {resume ? resume.name : <>Drop your resume or <span style={{ color: "var(--c-brand)" }}>browse</span></>}
              </div>
              <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", marginTop: 3 }}>{resume ? `${(resume.size / 1024).toFixed(0)} KB` : "PDF, DOCX, up to 10 MB"}</div>
            </button>
            <input ref={fileRef} type="file" required accept=".pdf,.doc,.docx,application/pdf" onChange={(e) => setResume(e.target.files?.[0] ?? null)} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }} />
          </div>

          {/* custom fields from the requisition */}
          {job.custom.length > 0 && (
            <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-brand-tint)", marginBottom: 18 }}>
              <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-brand-ink)", marginBottom: 12 }}>A few role-specific questions</div>
              {job.custom.map((c, i) => (
                <div key={i} style={{ marginBottom: i < job.custom.length - 1 ? 14 : 0 }}>
                  <Label req>{c.label}</Label>
                  <textarea rows={2} value={answers[i] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))} style={{ ...inp, resize: "vertical", lineHeight: 1.5 }} placeholder={c.help} />
                </div>
              ))}
            </div>
          )}

          <Label>Why are you interested in this role?</Label>
          <textarea rows={3} value={cover} onChange={(e) => setCover(e.target.value)} style={{ ...inp, resize: "vertical", lineHeight: 1.5, marginBottom: 18 }} placeholder="Optional, tell us what draws you here." />

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginBottom: 18, cursor: "pointer" }}>
            <input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--c-brand)" }} />
            <span>I understand my application may be reviewed with the help of AI, that a human makes the final decision, and that I can <b style={{ color: "var(--c-ink)" }}>request a human review</b> at any time.</span>
          </label>

          {error && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5, marginBottom: 16 }}>
              <I n="shield" s={17} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <Btn kind="primary" big full trail="arrow" type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit application"}</Btn>
        </div>
      </form>
    </div>
  );
}
