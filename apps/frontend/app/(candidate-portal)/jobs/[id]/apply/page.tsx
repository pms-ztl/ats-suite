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
import { buildJobPostingJsonLd, jsonLdScriptText } from "@/lib/job-jsonld";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
// Public site origin for the canonical apply URL embedded in the JSON-LD (the
// only URL we own). Strips the trailing /api off the API base, else the explicit
// site URL, else the browser origin at render time.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "") : "") ??
  "";

async function getJSON(path: string): Promise<any> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { credentials: "include" });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/* ---- WF-I — apply fast path helpers (presigned upload + status poll) ---- */
// Map a file to the resume content type the upload-ticket route accepts. We send
// the browser-reported MIME when it is one we accept, else fall back by extension
// (some browsers report an empty / octet-stream type for .doc/.docx). An unknown
// type returns null, which makes the caller use the multipart fallback.
function resumeContentType(file: File): string | null {
  const accepted = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]);
  if (file.type && accepted.has(file.type)) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (name.endsWith(".doc")) return "application/msword";
  if (name.endsWith(".txt")) return "text/plain";
  return null;
}

// A simple unique idempotency key for the apply POST (so a retry/double-submit
// coalesces on the server). crypto.randomUUID is available in all modern browsers;
// fall back to a timestamp+random string if it is not.
function newIdempotencyKey(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch { /* ignore */ }
  return `apply-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

// Human-readable copy for each real pipeline stage the status route returns. These
// describe the ACTUAL processing step — never a fabricated/optimistic stage.
const STATUS_COPY: Record<string, string> = {
  PENDING_INGEST: "Received your application. Preparing your resume...",
  SCANNED: "Your resume was received and checked. Reading it now...",
  PARSED: "We have read your resume. Reviewing your application...",
  SCREENED: "Your application has been reviewed by our assistant. A person will take it from here.",
  RECEIVED: "Your application has been received.",
  REJECTED: "We could not process the uploaded file. You can re-apply with a different file.",
};

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
// Honest neutral placeholder, NEVER fabricated job content. Until the real job
// loads we show only a neutral title; a fetch failure renders an explicit error
// state (see the render) rather than inventing a role, salary or requirements.
const EMPTY_JOB: JobSummary = { title: "This role", dept: "", loc: "", min: null, max: null, blurb: "", required: [] };

function normalizeJob(raw: any): JobSummary {
  const p = raw?.data ?? raw ?? {};
  const j = p.requisition ?? p.job ?? p;
  const required = Array.isArray(j?.requirements) ? j.requirements.map((r: any) => (typeof r === "string" ? r : r?.label ?? String(r))) : [];
  return {
    title: p.title ?? j?.title ?? EMPTY_JOB.title,
    dept: j?.department ?? "", loc: j?.location ?? "",
    min: typeof j?.salaryMin === "number" ? Math.round(j.salaryMin / 1000) : null,
    max: typeof j?.salaryMax === "number" ? Math.round(j.salaryMax / 1000) : null,
    blurb: j?.description ?? p.description ?? "",
    required,
  };
}

function Confirm({ title, reference, liveStatus, statusCopy }: { title: string; reference: string | null; liveStatus: string | null; statusCopy: Record<string, string> }) {
  // The progress line reflects the REAL pipeline stage from the status poll. It is
  // shown ONLY when we actually have a live stage (fast path); the legacy multipart
  // path has no async stage, so it simply omits this line (no fabricated progress).
  const isRejected = liveStatus === "REJECTED";
  const isScreened = liveStatus === "SCREENED";
  const copy = liveStatus ? statusCopy[liveStatus] : null;
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
      <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: isRejected ? "var(--c-danger-tint)" : "var(--c-brand-tint)", color: isRejected ? "var(--c-danger)" : "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}><I n={isRejected ? "shield" : "check"} s={42} sw={2.2} /></div>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>{isRejected ? "We could not process your file" : "Application received"}</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>Thanks for applying to <b style={{ color: "var(--c-ink)" }}>{title}</b>. We have emailed you a confirmation, and you can check your status anytime.</p>
      {reference && <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", margin: "4px 0 0" }}>Your reference: <span className="mono" style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>{reference}</span></p>}
      {copy && (
        <div role="status" aria-live="polite" style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", margin: "18px auto 0", maxWidth: 440, padding: "12px 16px", borderRadius: "var(--r-lg)", background: isRejected ? "var(--c-danger-tint)" : "var(--c-surface-2)", color: isRejected ? "var(--c-danger)" : "var(--c-ink-2)", fontSize: "var(--fs-sm)", lineHeight: 1.5 }}>
          {!isRejected && !isScreened && <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--c-line-2)", borderTopColor: "var(--c-brand)", display: "inline-block", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />}
          {(isScreened) && <I n="check" s={16} c="var(--c-brand)" style={{ flexShrink: 0 }} />}
          <span>{copy}</span>
        </div>
      )}
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
  // Module A — when arriving via a CDC/college share link, the college name rides
  // the URL (?college=) so every application is stamped with it. Read from
  // window.location (not useSearchParams) to avoid a Suspense build constraint.
  const [college, setCollege] = useState("");
  useEffect(() => {
    try { setCollege(new URLSearchParams(window.location.search).get("college") ?? ""); } catch { /* */ }
  }, []);
  const [job, setJob] = useState<JobSummary>(EMPTY_JOB);
  // The raw public-job payload, kept verbatim ONLY to build the schema.org
  // JobPosting JSON-LD below. Null until a real, published job loads, so the
  // structured-data <script> is emitted only for a genuine published role.
  const [rawJob, setRawJob] = useState<unknown>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // WF-I — live pipeline status for the fast path. liveStatus is one of the real
  // status enum values from /public/applications/:id/status; null on the legacy
  // (multipart) path, which has no async stage to poll.
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop polling on unmount.
  useEffect(() => () => { if (pollRef.current) clearTimeout(pollRef.current); }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const [j, f] = await Promise.all([getJSON(`/public/jobs/${slug}`), getJSON(`/public/jobs/${slug}/form`)]);
      if (cancelled) return;
      // NEVER fall back to a fabricated job: if the job summary fails to load we
      // surface an honest error state instead of inventing a role / requirements.
      if (j) { setJob(normalizeJob(j)); setRawJob(j); }
      else { setLoadFailed(true); setLoading(false); return; }
      const fl = (f?.data?.fields ?? f?.fields ?? []) as FormField[];
      setFields([...fl].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const set = (id: string, v: string | boolean) => setValues((s) => ({ ...s, [id]: v }));

  // Poll the public status URL and reflect the REAL pipeline stage. Stops at a
  // terminal stage (SCREENED / RECEIVED / REJECTED) or after a bounded number of
  // attempts (the confirmation page stays useful regardless — polling is purely to
  // show live progress, never required to consider the application submitted).
  function pollStatus(applicationId: string, attempt = 0) {
    if (attempt > 40) return; // ~40 * 3s ≈ 2 min, then stop polling silently.
    const TERMINAL = new Set(["SCREENED", "RECEIVED", "REJECTED"]);
    (async () => {
      const res = await getJSON(`/public/applications/${applicationId}/status`);
      const status: string | undefined = res?.data?.status;
      if (status) setLiveStatus(status);
      if (status && TERMINAL.has(status)) return; // done — no further polling.
      pollRef.current = setTimeout(() => pollStatus(applicationId, attempt + 1), 3000);
    })();
  }

  // The legacy multipart submit. Used directly when there is no resume file, and as
  // the FALLBACK whenever the fast path cannot run (storage off, ticket error, or a
  // direct-upload failure). Response contract unchanged (201 { applicationId, ... }).
  async function submitMultipart(): Promise<boolean> {
    const fd = new FormData();
    for (const f of fields) {
      if (f.type === "file" || f.type === "image") { const file = files[f.id]; if (file) fd.append(f.id, file); }
      else { const v = values[f.id]; if (v !== undefined && v !== "") fd.append(f.id, String(v)); }
    }
    if (college) fd.append("collegeName", college);
    const r = await fetch(`${API_BASE}/public/jobs/${slug}/apply-custom`, { method: "POST", credentials: "include", body: fd });
    const d = await r.json().catch(() => null);
    if (r.ok) {
      setReference(d?.data?.applicationId ?? null);
      return true;
    }
    setError(d?.error?.message ?? "We could not submit your application just now. Please check your details and try again.");
    return false;
  }

  // The accept-FAST submit (WF-I). 2 steps: (1) GET an upload ticket + POST the
  // resume DIRECTLY to object storage; (2) POST the apply as JSON referencing the
  // returned objectKey, with an Idempotency-Key, and on 202 poll the live status.
  // Returns:
  //   "ok"       -> accepted (202); we showed the confirmation + started polling
  //   "fallback" -> the fast path is unavailable for a benign reason (storage off,
  //                 ticket 503, unsupported type, upload failed) -> caller retries
  //                 the legacy multipart submit so the application ALWAYS goes through
  //   "error"    -> a real apply error (validation etc.) already surfaced to the user
  async function submitFast(resumeField: FormField, resumeFile: File): Promise<"ok" | "fallback" | "error"> {
    const contentType = resumeContentType(resumeFile);
    if (!contentType) return "fallback"; // unknown type — let multipart handle it.

    // Step 1a: ask for a presigned upload ticket. 503 / non-200 -> fall back.
    let ticket: { postURL: string; formData: Record<string, string>; objectKey: string } | null = null;
    try {
      const r = await fetch(`${API_BASE}/public/jobs/${slug}/upload-ticket?type=${encodeURIComponent(contentType)}`, { credentials: "include" });
      if (!r.ok) return "fallback"; // 503 STORAGE_UNAVAILABLE / 415 / etc. -> multipart.
      const j = await r.json().catch(() => null);
      const t = j?.data ?? j;
      if (!t?.postURL || !t?.formData || !t?.objectKey) return "fallback";
      ticket = t;
    } catch { return "fallback"; }
    if (!ticket) return "fallback"; // narrow for the upload step below.

    // Step 1b: POST the file DIRECTLY to object storage. The signed form fields go
    // FIRST and the file MUST be the LAST part (S3/MinIO POST policy requirement).
    try {
      const up = new FormData();
      for (const [k, v] of Object.entries(ticket.formData)) up.append(k, v);
      up.append("file", resumeFile); // file last.
      const ur = await fetch(ticket.postURL, { method: "POST", body: up });
      // S3/MinIO answer 204 (or 201) on success. Any non-2xx -> fall back to multipart.
      if (!ur.ok) return "fallback";
    } catch { return "fallback"; }

    // Step 2: POST the apply as JSON referencing the objectKey, with Idempotency-Key.
    const payload: Record<string, unknown> = {
      firstName: (values["firstName"] as string) ?? "",
      lastName: (values["lastName"] as string) ?? "",
      email: (values["email"] as string) ?? "",
      phone: (values["phone"] as string) || undefined,
      linkedinUrl: (values["linkedinUrl"] as string) || undefined,
      coverLetter: (values["coverLetter"] as string) || undefined,
      resume: {
        objectKey: ticket.objectKey,
        filename: resumeFile.name,
        contentType,
        size: resumeFile.size,
      },
    };
    // Any non-standard field (and any non-resume upload) becomes a form response so
    // the tenant's custom schema is preserved exactly as the multipart path does.
    const STD = new Set(["firstName", "lastName", "email", "phone", "linkedinUrl", "coverLetter"]);
    const formResponses: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.id === resumeField.id || STD.has(f.id)) continue;
      if (f.type === "file" || f.type === "image") continue; // handled separately if present
      const v = values[f.id];
      if (v !== undefined && v !== "") formResponses[f.id] = v;
    }
    if (college) formResponses["collegeName"] = college;
    if (Object.keys(formResponses).length > 0) payload["formResponses"] = formResponses;

    try {
      const r = await fetch(`${API_BASE}/public/jobs/${slug}/apply-custom`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Idempotency-Key": newIdempotencyKey() },
        body: JSON.stringify(payload),
      });
      const d = await r.json().catch(() => null);
      if (r.status === 202 || r.ok) {
        const applicationId: string | null = d?.data?.applicationId ?? null;
        setReference(applicationId);
        if (d?.data?.status) setLiveStatus(d.data.status);
        if (applicationId) pollStatus(applicationId);
        return "ok";
      }
      // 503 STORAGE_UNAVAILABLE at the accept step (storage went away between the
      // ticket and the apply) -> fall back to multipart so it still goes through.
      if (r.status === 503) return "fallback";
      setError(d?.error?.message ?? "We could not submit your application just now. Please check your details and try again.");
      return "error";
    } catch { return "fallback"; }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null); setLiveStatus(null); setSubmitting(true);
    try {
      // Identify the single resume file field (first file-type field with a chosen
      // file). The fast path applies only when there is exactly one such resume to
      // upload directly; otherwise the multipart path handles everything.
      const resumeField = fields.find((f) => (f.type === "file" || f.type === "image") && files[f.id]);
      const resumeFile = resumeField ? files[resumeField.id] : null;

      let succeeded = false;
      if (resumeField && resumeFile) {
        const outcome = await submitFast(resumeField, resumeFile);
        if (outcome === "ok") succeeded = true;
        else if (outcome === "error") succeeded = false; // already surfaced.
        else succeeded = await submitMultipart(); // "fallback" -> legacy path.
      } else {
        // No resume file to upload directly -> straight to the multipart submit.
        succeeded = await submitMultipart();
      }

      if (succeeded) {
        setDone(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Something went wrong while submitting. Please try again in a moment.");
    } finally { setSubmitting(false); }
  }

  if (done) return <Confirm title={job.title} reference={reference} liveStatus={liveStatus} statusCopy={STATUS_COPY} />;

  const salary = job.min != null && job.max != null ? `₹${job.min}k to ₹${job.max}k` : null;

  // Honest error state: we never render a fabricated job, so a failed job-summary
  // fetch surfaces an explicit "could not load" notice with a way back to the
  // live job list rather than a placeholder role.
  if (loadFailed) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .4s var(--ease-out)" }}>
        <a href="/jobs" style={{ display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none", color: "var(--c-ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}><I n="chevL" s={16} /> All roles</a>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
          <I n="shield" s={18} c="var(--c-ink-3)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>We could not load this role.</div>
            <p style={{ margin: "4px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>It may have been closed or the link may be out of date. <a href="/jobs" style={{ color: "var(--c-brand)", fontWeight: 600 }}>Browse open roles</a> to find another opening.</p>
          </div>
        </div>
      </div>
    );
  }

  // schema.org JobPosting JSON-LD for Google for Jobs. Built from the REAL
  // public job payload (omits any field the job does not actually carry) and
  // emitted ONLY when a genuine published job loaded. The apply URL uses the
  // site origin resolved above, else the live browser origin at render time.
  const siteOrigin = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const jobLd = rawJob && siteOrigin && slug
    ? buildJobPostingJsonLd(rawJob, { appUrl: siteOrigin, slug })
    : null;
  const jobLdText = jsonLdScriptText(jobLd);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .4s var(--ease-out)" }}>
      {jobLdText && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jobLdText }} />
      )}
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
