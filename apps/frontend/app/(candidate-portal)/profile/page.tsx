"use client";
// app/(candidate-portal)/profile/page.tsx
// Exact port of the Northwind candidate-portal "Profile" (my account) view from
// claude-design/portal.jsx. The candidate-layout already provides the page
// chrome (sticky nav + footer), so this file renders ONLY the page content.
//
// The prototype's hardcoded ME / MY_APPS / MY_INTERVIEW mocks are replaced with
// real data behind a controlled email lookup: we try GET /public/profile?email=
// then GET /candidate-portal/profile, and fall back to GET /public/status?email=
// for the applications list. Payloads are coerced defensively (res?.data ?? res).
// No personal data is ever fabricated, the greeting, contact card, and resume
// only show what the backend actually returns.
//
// Editable profile fields (name, phone, location) are controlled via useState.
// The data-rights actions (download my data, request deletion) make best-effort
// raw() calls and surface graceful inline feedback. AI is framed as advisory, a
// human always decides.
import {
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { EmptyState, ErrorState, Skeleton } from "@/components/aurora";

/* ---- inline raw() helper (do NOT edit lib/api.ts) ---- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try {
    t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

/* ---- icons (subset, from the prototype) ---- */
const PI: Record<string, string> = {
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  check: "M5 12.5l4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  arrow: "M5 12h14M13 6l6 6-6 6",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  fileText: "M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13 3v5h5M8 13h8M8 17h5",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  briefcase: "M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2",
  dot: "M12 12h.01",
  calendar: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1z",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  mail: "M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  download: "M12 4v10m0 0 4-4m-4 4-4-4M5 18h14",
  trash: "M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12",
};
function I({ n, s = 20, sw = 1.7, c, style }: { n: string; s?: number; sw?: number; c?: string; style?: CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={PI[n]} />
    </svg>
  );
}

/* ---- shared (ported from the prototype, palette refs use var(--c-*)) ---- */
type BtnKind = "primary" | "soft" | "ghost" | "ai";
function Btn({ kind = "primary", icon, trail, children, onClick, type = "button", full, disabled, style = {} }: {
  kind?: BtnKind; icon?: string; trail?: string; children: ReactNode;
  onClick?: () => void; type?: "button" | "submit"; full?: boolean; disabled?: boolean; style?: CSSProperties;
}) {
  const V: Record<BtnKind, CSSProperties> = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-brand)" },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "10px 18px", fontSize: "var(--fs-sm)", fontWeight: 700, borderRadius: "var(--r)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, border: "1px solid transparent", width: full ? "100%" : "auto", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", ...V[kind], ...style }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {icon && <I n={icon} s={17} />}
      {children}
      {trail && <I n={trail} s={17} />}
    </button>
  );
}
function Chip({ icon, children, tone = "var(--c-ink-2)", bg = "var(--c-surface-2)" }: {
  icon?: string; children: ReactNode; tone?: string; bg?: string;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg }}>
      {icon && <I n={icon} s={13} />}
      {children}
    </span>
  );
}
/* AI-assistive banner, appears wherever AI touches the candidate */
function AINotice({ compact }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: compact ? "center" : "flex-start", padding: compact ? "11px 14px" : "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)" }}>
      <span style={{ width: 32, height: 32, borderRadius: 10, background: "var(--c-ai)", color: "var(--c-on-brand)", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <I n="sparkles" s={17} />
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>AI is assistive, a human decides.</div>
        {!compact && (
          <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
            We use AI to help our team review applications fairly. It produces a recommendation only, a person always makes the final call, and you can ask for a human review at any time.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---- real-data shapes + coercion ---- */
type ApiApplication = {
  applicationId?: string;
  id?: string;
  role?: string;
  title?: string;
  department?: string;
  company?: string;
  co?: string;
  stage?: string;
  status?: string;
  appliedAt?: string;
};
type ApiResume = {
  fileName?: string;
  file?: string;
  size?: string | number;
  fileSize?: number;
  updatedAt?: string;
  updated?: string;
};
type ApiInterview = {
  role?: string;
  title?: string;
  company?: string;
  co?: string;
  scheduledAt?: string;
  when?: string;
  duration?: string;
  durationMinutes?: number;
  mode?: string;
  panel?: string[];
  interviewers?: string[];
};
type ApiProfile = {
  name?: string;
  candidateName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  loc?: string;
  resume?: ApiResume | null;
  applications?: ApiApplication[];
  interview?: ApiInterview | null;
  upcomingInterview?: ApiInterview | null;
};

type AppView = {
  id: string;
  title: string;
  company: string | null;
  applied: string | null;
  stage: string;
  icon: string;
  tone: string;
  bg: string;
};
type ResumeView = { file: string; meta: string };
type InterviewView = {
  role: string;
  company: string | null;
  when: string | null;
  duration: string | null;
  mode: string | null;
  panel: string[];
};
type ProfileView = {
  name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  applications: AppView[];
  resume: ResumeView | null;
  interview: InterviewView | null;
};

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // already a friendly string ("May 24")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtDateLong(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtBytes(n?: string | number): string {
  if (n == null) return "";
  if (typeof n === "string") return n;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function initialsOf(name: string | null, email: string): string {
  const src = (name && name.trim()) || email;
  const parts = src.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]).join("");
  return (letters || src[0] || "?").toUpperCase();
}

// Map a backend status/stage string to the prototype's icon + tone palette.
function stageStyle(stage: string): { icon: string; tone: string; bg: string; label: string } {
  const s = stage.toUpperCase();
  if (s.includes("INTERVIEW")) return { icon: "calendar", tone: "var(--c-info)", bg: "var(--c-info-tint)", label: "Interview" };
  if (s.includes("OFFER") || s.includes("HIRED")) return { icon: "check", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", label: stage };
  if (s.includes("REJECT") || s.includes("DECLINE") || s.includes("NOT") || s.includes("WITHDRAWN")) return { icon: "dot", tone: "var(--c-ink-3)", bg: "var(--c-surface-2)", label: s.includes("WITHDRAWN") ? "Withdrawn" : "Not selected" };
  if (s.includes("SCREEN") || s.includes("REVIEW") || s.includes("ACTIVE")) return { icon: "clock", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", label: "Under review" };
  return { icon: "clock", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", label: stage || "Under review" };
}

function toView(payload: unknown, email: string): ProfileView | null {
  const root = ((payload as { data?: unknown })?.data ?? payload) as ApiProfile | ApiApplication[] | undefined;
  if (!root) return null;

  // Applications may arrive as the root array, root.applications, or absent.
  let apps: ApiApplication[] = [];
  let prof: ApiProfile = {};
  if (Array.isArray(root)) {
    apps = root;
  } else {
    prof = root;
    apps = Array.isArray(prof.applications) ? prof.applications : [];
  }

  const applications: AppView[] = apps.map((a, i) => {
    const rawStage = (a.stage ?? a.status ?? "Under review").toString();
    const st = stageStyle(rawStage);
    return {
      id: a.applicationId ?? a.id ?? `app-${i}`,
      title: a.role ?? a.title ?? "Application",
      company: a.company ?? a.co ?? null,
      applied: a.appliedAt ?? null,
      stage: st.label,
      icon: st.icon,
      tone: st.tone,
      bg: st.bg,
    };
  });

  const resumeSrc = prof.resume;
  const resume: ResumeView | null = resumeSrc
    ? {
        file: resumeSrc.fileName ?? resumeSrc.file ?? "Resume.pdf",
        meta: [fmtBytes(resumeSrc.size ?? resumeSrc.fileSize), (resumeSrc.updatedAt ?? resumeSrc.updated) ? `Updated ${fmtDateLong(resumeSrc.updatedAt ?? resumeSrc.updated)}` : ""].filter(Boolean).join(" · "),
      }
    : null;

  const intSrc = prof.upcomingInterview ?? prof.interview ?? null;
  const interview: InterviewView | null = intSrc
    ? {
        role: intSrc.role ?? intSrc.title ?? "Interview",
        company: intSrc.company ?? intSrc.co ?? null,
        when: intSrc.scheduledAt ? fmtDateLong(intSrc.scheduledAt) : intSrc.when ?? null,
        duration: intSrc.duration ?? (intSrc.durationMinutes ? `${intSrc.durationMinutes} min` : null),
        mode: intSrc.mode ?? null,
        panel: intSrc.panel ?? intSrc.interviewers ?? [],
      }
    : null;

  const resolvedName = prof.name ?? prof.fullName ?? prof.candidateName ?? null;

  // Require at least one of: name, applications, resume, or interview so we
  // don't show an empty shell. A bare {email} with nothing else is "not found".
  if (!resolvedName && applications.length === 0 && !resume && !interview) return null;

  return {
    name: resolvedName,
    email: prof.email ?? email,
    phone: prof.phone ?? null,
    location: prof.location ?? prof.loc ?? null,
    applications,
    resume,
    interview,
  };
}

/* ===================================================================== */

export default function CandidateProfilePage() {
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ProfileView | null>(null);
  const [errored, setErrored] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  // Editable, controlled profile fields (seeded from the fetched profile).
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Data-rights inline feedback (best-effort, no toast dependency).
  const [busy, setBusy] = useState<null | "download" | "delete">(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    const q = emailInput.trim();
    if (!q) return;
    setLoading(true);
    setErrored(false);
    setNotFound(false);
    setSearched(true);
    setEditing(false);
    setNotice(null);
    setEmail(q);
    const qs = `?email=${encodeURIComponent(q)}`;
    try {
      let payload: unknown;
      // Prefer a dedicated profile endpoint, then the candidate-portal route,
      // and finally the public status route (applications only) as a fallback.
      try {
        payload = await raw(`/public/profile${qs}`);
      } catch {
        try {
          payload = await raw(`/candidate-portal/profile${qs}`);
        } catch {
          payload = await raw(`/public/status${qs}`);
        }
      }
      const v = toView(payload, q);
      if (!v) {
        setNotFound(true);
      } else {
        setView(v);
        setName(v.name ?? "");
        setPhone(v.phone ?? "");
        setLocation(v.location ?? "");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("404")) setNotFound(true);
      else setErrored(true);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSearched(false);
    setView(null);
    setErrored(false);
    setNotFound(false);
    setEditing(false);
    setNotice(null);
  }

  async function handleDownloadData() {
    if (!email) return;
    setBusy("download");
    setNotice(null);
    const qs = `?email=${encodeURIComponent(email)}`;
    try {
      let blob: Blob | null = null;
      // Best-effort: public self-service export, then the authenticated route.
      try {
        const res = await fetch(`${API_BASE}/public/gdpr/access${qs}`, { headers: { "Content-Type": "application/json" }, credentials: "include" });
        if (res.ok) blob = await res.blob();
      } catch {}
      if (!blob) {
        let t: string | null = null;
        try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
        const res = await fetch(`${API_BASE}/gdpr/access${qs}`, { headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) }, credentials: "include" });
        if (res.ok) blob = await res.blob();
      }
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `my-data-${email}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        setNotice({ tone: "ok", text: "Your data export has started downloading." });
      } else {
        setNotice({ tone: "warn", text: "We could not prepare your export right now. Please try again later." });
      }
    } catch {
      setNotice({ tone: "warn", text: "We could not prepare your export right now. Please try again later." });
    } finally {
      setBusy(null);
    }
  }

  async function handleDeleteData() {
    if (!email) return;
    setBusy("delete");
    setNotice(null);
    try {
      let ok = false;
      try {
        await raw(`/public/gdpr/erase`, { method: "POST", body: JSON.stringify({ email }) });
        ok = true;
      } catch {
        try {
          await raw(`/gdpr/erase`, { method: "POST", body: JSON.stringify({ email }) });
          ok = true;
        } catch {}
      }
      setNotice(
        ok
          ? { tone: "ok", text: "Deletion request received. We will email you to confirm once your data is removed." }
          : { tone: "warn", text: "We could not submit your deletion request right now. Please try again later." }
      );
    } finally {
      setBusy(null);
    }
  }

  // ---- contact rows: real fields only, with an editable mode ----
  const inputStyle: CSSProperties = { width: "100%", padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", outline: "none", fontFamily: "var(--font-sans)" };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 0 20px", animation: "rise .4s var(--ease-out)" }}>
      {/* greeting / intro */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
          {view?.name ? `Hi, ${view.name.split(" ")[0]}.` : "Your account"}
        </h1>
        <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", margin: "6px 0 0" }}>
          Your applications, resume, and upcoming interviews, all in one place. Look up your account with the email you applied with.
        </p>
      </div>

      {/* email lookup */}
      <form onSubmit={handleLookup} className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 20, marginBottom: 20 }}>
        <label htmlFor="profile-email" style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 8 }}>Email address</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-3)", pointerEvents: "none" }}><I n="mail" s={17} /></span>
            <input
              id="profile-email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              aria-label="Email address"
              placeholder="you@email.com"
              style={{ width: "100%", padding: "12px 15px 12px 40px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" }}
            />
          </div>
          <Btn kind="primary" type="submit" icon="search">Look up</Btn>
        </div>
      </form>

      {/* states */}
      {!searched ? (
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, display: "grid", placeItems: "center", minHeight: 200 }}>
          <EmptyState
            title="Look up your account"
            body="Enter the email you applied with above to see your applications, resume, upcoming interviews, and data rights."
            actions={<a href="/jobs" style={{ textDecoration: "none" }}><Btn kind="soft" icon="search">Browse open roles</Btn></a>}
          />
        </div>
      ) : loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton className="h-[220px] rounded-[var(--r-2xl)]" />
            <Skeleton className="h-[150px] rounded-[var(--r-2xl)]" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton className="h-[140px] rounded-[var(--r-2xl)]" />
            <Skeleton className="h-[140px] rounded-[var(--r-2xl)]" />
          </div>
        </div>
      ) : errored ? (
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, display: "grid", placeItems: "center", minHeight: 220 }}>
          <ErrorState
            title="Could not load your account"
            body="We could not reach the candidate service. Please try again in a moment."
            code="GET /public/profile"
            onRetry={reset}
          />
        </div>
      ) : notFound || !view ? (
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, display: "grid", placeItems: "center", minHeight: 220 }}>
          <EmptyState
            title="No account found"
            body="We could not find an account for that email. If you applied recently, it may take a little time to appear."
            actions={
              <>
                <Btn kind="primary" onClick={reset}>Try another email</Btn>
                <a href="/jobs" style={{ textDecoration: "none" }}><Btn kind="soft">Browse open roles</Btn></a>
              </>
            }
          />
        </div>
      ) : (
        <div style={{ animation: "rise .35s var(--ease-out)" }}>
          {/* account header with initials avatar */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
            <span className="mono" style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", flexShrink: 0, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 22 }}>
              {initialsOf(view.name, view.email)}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{view.name ?? view.email}</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>{view.email}</div>
            </div>
            <div style={{ flex: 1 }} />
            <a href="/jobs" style={{ textDecoration: "none" }}><Btn kind="soft" icon="search">Browse roles</Btn></a>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
            {/* left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              {/* applications */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>My applications</h2>
                  <Chip icon="briefcase">{view.applications.length} total</Chip>
                </div>
                {view.applications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px 8px", color: "var(--c-ink-3)" }}>
                    <span style={{ width: 42, height: 42, borderRadius: "var(--r)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="briefcase" s={20} /></span>
                    <p style={{ fontSize: "var(--fs-sm)", margin: "0 0 12px", lineHeight: 1.5 }}>No applications yet. Browse open roles to get started.</p>
                    <a href="/jobs" style={{ textDecoration: "none" }}><Btn kind="primary" icon="search">Browse roles</Btn></a>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {view.applications.map((a) => (
                      <a
                        key={a.id}
                        href="/status"
                        style={{ textDecoration: "none", color: "inherit", cursor: "pointer", border: "1px solid var(--c-line)", background: "var(--c-surface)", borderRadius: "var(--r-lg)", padding: "14px 16px", display: "flex", gap: 13, alignItems: "center", transition: "transform .15s var(--ease-out), box-shadow .2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--e2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <span style={{ width: 40, height: 40, borderRadius: "var(--r)", flexShrink: 0, background: a.bg, color: a.tone, display: "grid", placeItems: "center" }}><I n={a.icon} s={19} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>{[a.company, a.applied ? `Applied ${fmtDate(a.applied)}` : null].filter(Boolean).join(" · ")}</div>
                        </div>
                        <Chip icon={a.icon} tone={a.tone} bg={a.bg}>{a.stage}</Chip>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* upcoming interview */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 14px" }}>Upcoming interview</h2>
                {view.interview ? (
                  <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{view.interview.role}</div>
                        {view.interview.company && <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>{view.interview.company}</div>}
                      </div>
                      <Chip icon="calendar" tone="var(--c-brand-ink)" bg="var(--c-brand-tint)">Confirmed</Chip>
                    </div>
                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "14px 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
                      {view.interview.when && <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><I n="clock" s={15} c="var(--c-ink-3)" /> {view.interview.when}</span>}
                      {(view.interview.duration || view.interview.mode) && (
                        <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><I n="dot" s={15} c="var(--c-ink-3)" /> {[view.interview.duration, view.interview.mode].filter(Boolean).join(" · ")}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      {view.interview.panel.length > 0 && (
                        <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", marginRight: "auto", display: "inline-flex", gap: 8, alignItems: "center" }}>
                          With {view.interview.panel.join(" & ")}
                        </span>
                      )}
                      <Btn kind="soft" icon="calendar">Add to calendar</Btn>
                      <Btn kind="primary" trail="arrow">Join details</Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "14px 8px", color: "var(--c-ink-3)" }}>
                    <span style={{ width: 42, height: 42, borderRadius: "var(--r)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="calendar" s={20} /></span>
                    <p style={{ fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>No interviews scheduled yet. If an interview is booked, the details will appear here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              {/* contact / profile (editable) */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: 0 }}>Profile</h2>
                  <button
                    onClick={() => setEditing((v) => !v)}
                    style={{ display: "inline-flex", gap: 5, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--c-brand)", fontWeight: 600, fontSize: "var(--fs-sm)" }}
                  >
                    <I n={editing ? "check" : "settings"} s={14} /> {editing ? "Done" : "Edit"}
                  </button>
                </div>
                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label htmlFor="p-name" style={{ display: "block", fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-ink-3)", marginBottom: 4 }}>Full name</label>
                      <input id="p-name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="p-phone" style={{ display: "block", fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-ink-3)", marginBottom: 4 }}>Phone</label>
                      <input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="Optional" />
                    </div>
                    <div>
                      <label htmlFor="p-loc" style={{ display: "block", fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-ink-3)", marginBottom: 4 }}>Location</label>
                      <input id="p-loc" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} placeholder="Optional" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
                      <I n="mail" s={16} c="var(--c-ink-3)" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{view.email}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: "var(--fs-sm)", color: phone ? "var(--c-ink-2)" : "var(--c-ink-3)" }}>
                      <I n="dot" s={16} c="var(--c-ink-3)" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{phone || "Add a phone number"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: "var(--fs-sm)", color: location ? "var(--c-ink-2)" : "var(--c-ink-3)" }}>
                      <I n="dot" s={16} c="var(--c-ink-3)" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{location || "Add a location"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* resume management */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: "0 0 12px" }}>Resume</h2>
                {view.resume ? (
                  <>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)" }}>
                      <span style={{ width: 38, height: 38, borderRadius: "var(--r)", flexShrink: 0, background: "var(--c-danger-tint)", color: "var(--c-danger)", display: "grid", placeItems: "center" }}><I n="fileText" s={18} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{view.resume.file}</div>
                        {view.resume.meta && <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)" }}>{view.resume.meta}</div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 9, marginTop: 11 }}>
                      <Btn kind="soft" icon="arrowUp" full>Replace</Btn>
                      <Btn kind="ghost" icon="eye">View</Btn>
                    </div>
                    <p style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", margin: "12px 0 0", lineHeight: 1.5 }}>We reuse this resume when you apply, so you never have to upload it twice.</p>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "14px 8px", color: "var(--c-ink-3)" }}>
                    <span style={{ width: 42, height: 42, borderRadius: "var(--r)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="fileText" s={20} /></span>
                    <p style={{ fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>No resume on file yet. Your resume is saved the first time you apply to a role.</p>
                  </div>
                )}
              </div>

              {/* data rights, GDPR self-service */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <I n="shield" s={16} c="var(--c-ink-3)" />
                  <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: 0 }}>Your data rights</h2>
                </div>
                <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", margin: "0 0 14px", lineHeight: 1.5 }}>
                  You can access or delete your personal data at any time under GDPR and other data-protection laws.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <Btn kind="soft" icon="download" full onClick={handleDownloadData} disabled={busy !== null}>
                    {busy === "download" ? "Preparing export..." : "Download my data"}
                  </Btn>
                  <Btn kind="ghost" icon="trash" full onClick={handleDeleteData} disabled={busy !== null} style={{ color: "var(--c-danger)" }}>
                    {busy === "delete" ? "Submitting..." : "Request data deletion"}
                  </Btn>
                </div>
                {notice && (
                  <div role="status" style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: "var(--r)", fontSize: "var(--fs-xs)", lineHeight: 1.45, color: notice.tone === "ok" ? "var(--c-ok)" : "var(--c-warn)", background: notice.tone === "ok" ? "var(--c-ok-tint)" : "var(--c-warn-tint)" }}>
                    <I n={notice.tone === "ok" ? "check" : "shield"} s={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{notice.text}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}><AINotice /></div>
        </div>
      )}
    </div>
  );
}
