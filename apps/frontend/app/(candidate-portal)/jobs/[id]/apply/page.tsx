"use client";

/* Candidate-portal apply page, ported from claude-design/portal.jsx (Apply +
   Confirm). CandidateLayout already provides the nav/header/footer chrome, so
   this file renders content only. Mock data is replaced with a best-effort
   live job summary and a real FormData submit to the gateway. */

import { useState, useEffect, FormEvent, CSSProperties } from "react";
import { useParams } from "next/navigation";

/* ---- inline fetch helper (do not edit lib/api.ts) ---- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try {
    t =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("ats-access-token")
        : null;
  } catch {}
  const isForm =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

/* ---- icons (subset, mirrors portal.jsx) ---- */
const PI: Record<string, string> = {
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  card: "M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18",
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevL: "M15 6l-6 6 6 6",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  upload: "M12 16V4M8 8l4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3",
  briefcase:
    "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  users:
    "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5",
};
function I({
  n,
  s = 20,
  sw = 1.7,
  c,
  style,
}: {
  n: string;
  s?: number;
  sw?: number;
  c?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c || "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      <path d={PI[n]} />
    </svg>
  );
}

/* ---- shared bits (from portal.jsx, --c- color tokens) ---- */
function Btn({
  kind = "primary",
  icon,
  trail,
  children,
  onClick,
  big,
  full,
  type = "button",
  disabled,
  style = {},
}: {
  kind?: "primary" | "soft" | "ghost" | "ai";
  icon?: string;
  trail?: string;
  children: React.ReactNode;
  onClick?: () => void;
  big?: boolean;
  full?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const V = {
    primary: {
      background: "var(--c-brand)",
      color: "var(--c-on-brand)",
      boxShadow: "var(--e1)",
    },
    soft: {
      background: "var(--c-surface)",
      color: "var(--c-ink)",
      border: "1px solid var(--c-line-2)",
    },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-brand)" },
  }[kind];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        padding: big ? "13px 22px" : "10px 18px",
        fontSize: big ? "var(--fs-md)" : "var(--fs-sm)",
        fontWeight: 700,
        borderRadius: "var(--r)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        border: "1px solid transparent",
        width: full ? "100%" : "auto",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
        ...V,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
      }}
    >
      {icon && <I n={icon} s={big ? 19 : 17} />}
      {children}
      {trail && <I n={trail} s={big ? 19 : 17} />}
    </button>
  );
}

function Chip({
  icon,
  children,
  tone = "var(--c-ink-2)",
  bg = "var(--c-surface-2)",
}: {
  icon?: string;
  children: React.ReactNode;
  tone?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 11px",
        borderRadius: "var(--r-pill)",
        fontSize: "var(--fs-xs)",
        fontWeight: 600,
        color: tone,
        background: bg,
      }}
    >
      {icon && <I n={icon} s={13} />}
      {children}
    </span>
  );
}

/* AI-assistive banner, appears wherever AI touches the candidate */
function AINotice({ compact }: { compact?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: compact ? "center" : "flex-start",
        padding: compact ? "11px 14px" : "16px 18px",
        borderRadius: "var(--r-lg)",
        background: "var(--c-ai-tint)",
        border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "var(--c-ai)",
          color: "var(--c-on-brand)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <I n="sparkles" s={17} />
      </span>
      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "var(--fs-sm)",
            color: "var(--c-ai-ink)",
          }}
        >
          AI is assistive, a human decides.
        </div>
        {!compact && (
          <p
            style={{
              margin: "3px 0 0",
              fontSize: "var(--fs-sm)",
              color: "var(--c-ink-2)",
              lineHeight: 1.5,
            }}
          >
            We use AI to help our team review applications fairly. It produces a
            recommendation only, a person always makes the final call, and you
            can ask for a human review at any time.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- job summary shape (best-effort from gateway) ---- */
interface JobSummary {
  id: string;
  slug?: string;
  title: string;
  dept: string;
  loc: string;
  blurb: string;
  min?: number;
  max?: number;
  required: string[];
  custom: { label: string; help: string }[];
}

/* Defensive mapping over the assorted payload shapes the gateway may return
   (GET /jobs/:id, /public/jobs/:id, /requisitions/:id). */
function mapJob(id: string, res: any): JobSummary {
  const p = res?.data ?? res ?? {};
  const req = p.requisition ?? p;
  const splitLines = (v: unknown): string[] =>
    typeof v === "string"
      ? v
          .split(/\r?\n|·|;/)
          .map((s) => s.trim())
          .filter(Boolean)
      : Array.isArray(v)
        ? (v as unknown[]).map((x) => String(x)).filter(Boolean)
        : [];
  const required =
    splitLines(req.requirements ?? p.requirements ?? req.mustHave).slice(0, 6);
  const custom = Array.isArray(p.customQuestions ?? p.questions)
    ? (p.customQuestions ?? p.questions)
        .map((q: any) => ({
          label: String(q?.label ?? q?.question ?? q?.prompt ?? "Question"),
          help: String(q?.help ?? q?.placeholder ?? q?.description ?? ""),
        }))
        .slice(0, 6)
    : [];
  const loc = [req.location, req.remote ? "Remote" : null]
    .filter(Boolean)
    .join(" · ");
  return {
    id: p.id ?? id,
    slug: p.slug ?? req.slug,
    title: p.title ?? req.title ?? "This role",
    dept: req.department ?? p.department ?? "Team",
    loc: loc || req.location || "Location shared on request",
    blurb:
      p.description ?? req.description ?? p.summary ?? req.summary ?? "",
    min: req.salaryMin ?? p.salaryMin,
    max: req.salaryMax ?? p.salaryMax,
    required,
    custom,
  };
}

/* ---- shared input styling (from portal.jsx) ---- */
const inp: CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "var(--r)",
  border: "1px solid var(--c-line-2)",
  background: "var(--c-surface)",
  color: "var(--c-ink)",
  fontSize: "var(--fs-md)",
  outline: "none",
  fontFamily: "var(--font-sans)",
};

function FieldLabel({
  children,
  req,
}: {
  children: React.ReactNode;
  req?: boolean;
}) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "var(--fs-sm)",
        fontWeight: 600,
        color: "var(--c-ink-2)",
        marginBottom: 7,
      }}
    >
      {children}
      {req && <span style={{ color: "var(--c-brand)" }}> *</span>}
    </label>
  );
}

/* ---- success state (Confirm from portal.jsx) ---- */
function Confirm({
  jobTitle,
  reference,
}: {
  jobTitle: string;
  reference: string | null;
}) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "40px 0",
        textAlign: "center",
        animation: "pop .4s var(--ease-spring)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "var(--r-2xl)",
          background: "var(--c-brand-tint)",
          color: "var(--c-brand)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 22px",
        }}
      >
        <I n="check" s={42} sw={2.2} />
      </div>
      <h1
        style={{
          fontSize: "var(--fs-3xl)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 12px",
        }}
      >
        Application received
      </h1>
      <p
        style={{
          fontSize: "var(--fs-md)",
          color: "var(--c-ink-2)",
          lineHeight: 1.6,
          margin: "0 0 8px",
        }}
      >
        Thanks for applying to{" "}
        <b style={{ color: "var(--c-ink)" }}>{jobTitle}</b>. We have emailed you
        a confirmation, you can check your status anytime.
      </p>
      {reference && (
        <p
          style={{
            fontSize: "var(--fs-sm)",
            color: "var(--c-ink-3)",
            margin: "0 0 4px",
          }}
        >
          Your reference:{" "}
          <span
            style={{ fontFamily: "var(--font-mono)", color: "var(--c-ink-2)" }}
          >
            {reference}
          </span>
        </p>
      )}
      {/* next steps */}
      <div
        style={{
          margin: "20px auto 0",
          maxWidth: 440,
          textAlign: "left",
          padding: "16px 18px",
          borderRadius: "var(--r-lg)",
          background: "var(--c-surface)",
          border: "1px solid var(--c-line)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "var(--fs-sm)",
            marginBottom: 8,
          }}
        >
          What happens next
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "A recruiter reviews your application alongside an AI-assisted summary.",
            "You can track every step from the My Applications page.",
            "A human makes the final call, and you can request a human review anytime.",
          ].map((step) => (
            <div
              key={step}
              style={{
                display: "flex",
                gap: 9,
                fontSize: "var(--fs-sm)",
                color: "var(--c-ink-2)",
                lineHeight: 1.45,
              }}
            >
              <I
                n="check"
                s={16}
                c="var(--c-brand)"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              {step}
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: "22px auto 0", maxWidth: 440 }}>
        <AINotice compact />
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginTop: 24,
          flexWrap: "wrap",
        }}
      >
        <a href="/status" style={{ textDecoration: "none" }}>
          <Btn kind="primary" icon="eye">
            Track my status
          </Btn>
        </a>
        <a href="/jobs" style={{ textDecoration: "none" }}>
          <Btn kind="soft">Browse more roles</Btn>
        </a>
      </div>
    </div>
  );
}

/* ---- page (Apply from portal.jsx) ---- */
export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [job, setJob] = useState<JobSummary | null>(null);

  // controlled form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [consent, setConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  // Best-effort load of the job summary. Tries the public endpoint first, then
  // the authenticated job, then the requisition. Any failure leaves a graceful
  // fallback so the form still works.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const paths = [
        `/public/jobs/${id}`,
        `/jobs/${id}`,
        `/requisitions/${id}`,
      ];
      for (const path of paths) {
        try {
          const res = await raw(path);
          if (!cancelled) setJob(mapJob(id, res));
          return;
        } catch {
          /* try the next shape */
        }
      }
      if (!cancelled)
        setJob({
          id,
          title: "This role",
          dept: "Team",
          loc: "Location shared on request",
          blurb: "",
          required: [],
          custom: [],
        });
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Please confirm you understand how AI is used before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("fullName", fullName.trim());
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      fd.append("firstName", firstName ?? "");
      fd.append("lastName", rest.join(" "));
      fd.append("email", email.trim());
      if (phone.trim()) fd.append("phone", phone.trim());
      if (linkedin.trim()) fd.append("linkedinUrl", linkedin.trim());
      if (coverNote.trim()) fd.append("coverLetter", coverNote.trim());
      if (resume) fd.append("resume", resume, resume.name);
      if (job?.custom.length) {
        const responses = job.custom.map((c, i) => ({
          label: c.label,
          answer: answers[i] ?? "",
        }));
        fd.append("customAnswers", JSON.stringify(responses));
      }

      // Try the slug/id-scoped apply endpoint, then the generic collection.
      let res: any = null;
      const slug = job?.slug ?? id;
      const tries: { path: string }[] = [
        { path: `/public/jobs/${slug}/apply` },
        { path: `/jobs/${id}/apply` },
        { path: `/applications` },
      ];
      let lastErr: unknown = null;
      for (const t of tries) {
        try {
          res = await raw(t.path, { method: "POST", body: fd });
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
        }
      }
      if (lastErr) throw lastErr;

      const body = res?.data ?? res ?? {};
      setReference(
        body.reference ?? body.applicationId ?? body.id ?? null,
      );
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(
        "We could not submit your application just now. Please check your details and try again, or reach out and a human can help.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done)
    return <Confirm jobTitle={job?.title ?? "this role"} reference={reference} />;

  const showSalary =
    typeof job?.min === "number" && typeof job?.max === "number";

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        animation: "rise .4s var(--ease-out)",
      }}
    >
      <a
        href="/jobs"
        style={{
          display: "inline-flex",
          gap: 6,
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--c-ink-2)",
          fontWeight: 600,
          fontSize: "var(--fs-sm)",
          marginBottom: 16,
          textDecoration: "none",
        }}
      >
        <I n="chevL" s={16} /> All roles
      </a>

      {/* job header */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <Chip icon="briefcase">{job?.dept ?? "Team"}</Chip>
        <Chip icon="pin">{job?.loc ?? "Location shared on request"}</Chip>
        {showSalary && (
          <Chip icon="card" tone="var(--c-brand)" bg="var(--c-brand-tint)">
            ${Math.round((job!.min as number) / 1000)}k to $
            {Math.round((job!.max as number) / 1000)}k
          </Chip>
        )}
      </div>
      <h1
        style={{
          fontSize: "var(--fs-3xl)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          margin: "0 0 14px",
        }}
      >
        {job?.title ?? "This role"}
      </h1>
      {job?.blurb && (
        <p
          style={{
            fontSize: "var(--fs-md)",
            color: "var(--c-ink-2)",
            lineHeight: 1.6,
            margin: "0 0 18px",
          }}
        >
          {job.blurb}
        </p>
      )}
      {job && job.required.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 9 }}>
            What you will need
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {job.required.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 9,
                  fontSize: "var(--fs-sm)",
                  color: "var(--c-ink-2)",
                }}
              >
                <I
                  n="check"
                  s={17}
                  c="var(--c-brand)"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      <AINotice />

      {/* form */}
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26 }}>
          <h2
            style={{
              fontSize: "var(--fs-xl)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: "0 0 18px",
            }}
          >
            Apply for this role
          </h2>

          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FieldLabel req>Full name</FieldLabel>
              <input
                required
                style={inp}
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FieldLabel req>Email</FieldLabel>
              <input
                required
                type="email"
                style={inp}
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FieldLabel>Phone</FieldLabel>
              <input
                type="tel"
                style={inp}
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <FieldLabel>LinkedIn or portfolio</FieldLabel>
              <input
                type="url"
                style={inp}
                placeholder="https://"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
          </div>

          {/* resume upload, real file input */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel req>Resume / CV</FieldLabel>
            <label
              style={{
                display: "block",
                border: "1.5px dashed var(--c-line-strong)",
                borderRadius: "var(--r-lg)",
                padding: "22px",
                textAlign: "center",
                background: "var(--c-surface-2)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "var(--c-brand-tint)",
                  color: "var(--c-brand)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 10px",
                }}
              >
                <I n="upload" s={20} />
              </span>
              {resume ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>
                    {resume.name}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--fs-xs)",
                      color: "var(--c-ink-3)",
                      marginTop: 3,
                    }}
                  >
                    {(resume.size / 1024).toFixed(0)} KB, click to replace
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>
                    Drop your resume or{" "}
                    <span style={{ color: "var(--c-brand)" }}>browse</span>
                  </div>
                  <div
                    style={{
                      fontSize: "var(--fs-xs)",
                      color: "var(--c-ink-3)",
                      marginTop: 3,
                    }}
                  >
                    PDF, DOCX, up to 10 MB
                  </div>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* custom fields from the requisition */}
          {job && job.custom.length > 0 && (
            <div
              style={{
                padding: "16px 18px",
                borderRadius: "var(--r-lg)",
                background: "var(--c-brand-tint)",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: "var(--fs-xs)",
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                  color: "var(--c-brand-ink)",
                  marginBottom: 12,
                }}
              >
                A few role-specific questions
              </div>
              {job.custom.map((c, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i < job.custom.length - 1 ? 14 : 0,
                  }}
                >
                  <FieldLabel req>{c.label}</FieldLabel>
                  <textarea
                    rows={2}
                    required
                    style={{ ...inp, resize: "vertical", lineHeight: 1.5 }}
                    placeholder={c.help}
                    value={answers[i] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <FieldLabel>Why are you interested in this role?</FieldLabel>
          <textarea
            rows={3}
            style={{
              ...inp,
              resize: "vertical",
              lineHeight: 1.5,
              marginBottom: 18,
            }}
            placeholder="Optional, tell us what draws you here."
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: "var(--fs-sm)",
              color: "var(--c-ink-2)",
              marginBottom: 18,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{
                marginTop: 3,
                width: 17,
                height: 17,
                accentColor: "var(--c-brand)",
              }}
            />
            <span>
              I understand my application may be reviewed with the help of AI,
              that a human makes the final decision, and that I can{" "}
              <b style={{ color: "var(--c-ink)" }}>request a human review</b> at
              any time.
            </span>
          </label>

          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: "var(--r-lg)",
                background: "var(--c-danger-tint)",
                color: "var(--c-danger)",
                fontSize: "var(--fs-sm)",
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              <I n="shield" s={17} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <Btn
            kind="primary"
            big
            full
            trail="arrow"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit application"}
          </Btn>
        </div>
      </form>
    </div>
  );
}
