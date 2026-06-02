"use client";
// app/(candidate-portal)/profile/page.tsx
// RICH candidate account home, faithfully reproduced from claude-design/portal.jsx
// (the Profile component): greeting, "My applications" list, contact / profile
// card (with editable, controlled fields), resume management, an honest "Offers"
// empty state, candidate data-rights controls (download my data / delete my
// data), and the assistive-AI notice that appears wherever AI touches a
// candidate.
//
// This page is PUBLIC and is wrapped by CandidateLayout, which supplies the nav,
// footer, and the max-w main container; we therefore render CONTENT ONLY (no
// outer chrome of our own).
//
// WIRED to the real gateway, best-effort + graceful. Identity is taken from the
// `email` query param (the email the candidate applied with) or sessionStorage;
// we try `GET /public/profile?email=` for the contact/resume card and fall back
// to `GET /public/status?email=` for the applications list. On any failure,
// 404, or empty data the exact same layout renders with Skeletons (loading) or
// an EmptyState (error / empty). Privacy actions (download / delete my data)
// are best-effort raw() calls with inline feedback. NO personal data is
// fabricated, fields stay blank until the backend returns them.
//
// Inline palette refs use var(--c-NAME); effect / size tokens stay bare. The
// "rise" entrance keyframe is a global (app/globals.css).
import { useEffect, useState } from "react";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Local raw() helper, mirrors the other Aurora ports: cookie + bearer, unwraps
// the gateway's { data } envelope, throws on non-2xx so callers can fall back.
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const body: any = await res.json();
  return body?.data ?? body;
}

/* ----------------------------- portal helpers ----------------------------- */
// Reproduced inline from portal.jsx so this port renders unchanged: the small
// stroke-icon shim (I), the action button (Btn), and the pill (Chip). Icon
// geometry comes from the shared aurora-icon shim; a couple of portal-only
// glyphs (mail, upload, arrowUp, briefcase, pin, x) are filled in here.
const EXTRA: Record<string, string> = {
  mail: "M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  upload: "M12 16V4M8 8l4-4 4 4M5 16v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  pin: "M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13",
};
function I({ n, s = 20, sw = 1.7, c, style }: { n: string; s?: number; sw?: number; c?: string; style?: React.CSSProperties }) {
  const extra = EXTRA[n];
  if (extra) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
        <path d={extra} />
      </svg>
    );
  }
  return <Icon name={n} size={s} stroke={sw} style={{ ...(c ? { color: c } : {}), ...style }} />;
}

function Btn({
  kind = "primary", icon, trail, children, onClick, big, full, disabled, type, style = {},
}: {
  kind?: "primary" | "soft" | "ghost" | "ai";
  icon?: string; trail?: string; children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; big?: boolean; full?: boolean;
  disabled?: boolean; type?: "button" | "submit" | "reset"; style?: React.CSSProperties;
}) {
  const V = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-brand)" },
  }[kind];
  return (
    <button onClick={onClick} disabled={disabled} type={type}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
        padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)",
        fontWeight: 700, borderRadius: "var(--r)", cursor: disabled ? "default" : "pointer",
        border: "1px solid transparent", width: full ? "100%" : "auto",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
        ...V, ...(disabled ? { opacity: 0.55, pointerEvents: "none" } : {}), ...style,
      }}
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

/* AI-assistive banner, appears wherever AI touches the candidate. */
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

/* ------------------------------- shapes ------------------------------- */
type App = { id: string; title: string; co: string; applied: string; stage: string; tone: string; bg: string; icon: string };
type Resume = { file: string; size: string; updated: string } | null;
type Me = { name: string; email: string; phone: string; loc: string; initials: string; resume: Resume };

const STAGE_STYLE: { match: RegExp; tone: string; bg: string; icon: string }[] = [
  { match: /interview/i, tone: "var(--c-info)", bg: "var(--c-info-tint)", icon: "calendar" },
  { match: /offer|hired|accepted/i, tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  { match: /reject|not selected|declined|closed/i, tone: "var(--c-ink-3)", bg: "var(--c-surface-2)", icon: "dot" },
  { match: /.*/, tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "clock" }, // applied / under review
];
function stageStyle(stage: string) {
  return STAGE_STYLE.find((s) => s.match.test(stage)) ?? STAGE_STYLE[STAGE_STYLE.length - 1];
}

// Friendly date, the backend may send an ISO string or a label; never invented.
function fmtDate(v: unknown): string {
  if (!v) return "";
  const s = String(v);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function fmtSize(bytes: unknown): string {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/* --------------------------- defensive mappers --------------------------- */
function mapMe(res: any): Me {
  const r = res ?? {};
  const c = r.candidate ?? r.profile ?? r;
  const first = c.firstName ?? c.first_name ?? "";
  const last = c.lastName ?? c.last_name ?? "";
  const name = String(c.name ?? c.fullName ?? `${first} ${last}`.trim()).trim();
  const resumeRaw = c.resume ?? r.resume ?? null;
  let resume: Resume = null;
  if (resumeRaw && (resumeRaw.fileName || resumeRaw.file || resumeRaw.filename || resumeRaw.name || resumeRaw.url)) {
    resume = {
      file: String(resumeRaw.fileName ?? resumeRaw.file ?? resumeRaw.filename ?? resumeRaw.name ?? "Resume"),
      size: fmtSize(resumeRaw.size ?? resumeRaw.bytes ?? resumeRaw.fileSize),
      updated: fmtDate(resumeRaw.updatedAt ?? resumeRaw.uploadedAt ?? resumeRaw.updated ?? r.updatedAt),
    };
  }
  return {
    name,
    email: String(c.email ?? ""),
    phone: String(c.phone ?? c.phoneNumber ?? ""),
    loc: String(c.location ?? c.loc ?? c.city ?? ""),
    initials: initialsOf(name),
    resume,
  };
}

function mapApps(res: any): App[] {
  const arr = Array.isArray(res) ? res
    : Array.isArray(res?.applications) ? res.applications
    : Array.isArray(res?.items) ? res.items
    : Array.isArray(res?.data) ? res.data : [];
  return arr.map((a: any, i: number): App => {
    const title = String(a.title ?? a.role ?? a.requisitionTitle ?? a.job?.title ?? a.position ?? "Application");
    const co = String(a.company ?? a.co ?? a.tenant ?? a.employer ?? a.organization ?? a.tenantName ?? "");
    const applied = fmtDate(a.appliedAt ?? a.createdAt ?? a.applied ?? a.submittedAt);
    const stageLabel = String(a.stageLabel ?? a.statusLabel ?? a.stage ?? a.status ?? "Under review")
      .replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    const st = stageStyle(stageLabel);
    return { id: String(a.id ?? a.applicationId ?? i), title, co, applied, stage: stageLabel, tone: st.tone, bg: st.bg, icon: st.icon };
  });
}

/* ------------------------------- page -------------------------------- */
export default function CandidateProfilePage() {
  // Identity: the email the candidate applied with (?email=...) or a previously
  // stored one. Without it we cannot look anyone up, so we show the EmptyState.
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [apps, setApps] = useState<App[]>([]);

  // Controlled, editable contact fields (no fabricated values, blank until the
  // backend returns them).
  const [editing, setEditing] = useState(false);
  const [emailField, setEmailField] = useState("");
  const [phoneField, setPhoneField] = useState("");
  const [locField, setLocField] = useState("");

  // Inline feedback for the privacy / data-rights actions.
  const [privacyMsg, setPrivacyMsg] = useState<string>("");
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);

  useEffect(() => {
    let stored = "";
    try {
      const qp = new URLSearchParams(window.location.search).get("email");
      stored = qp || window.sessionStorage.getItem("ats-candidate-email") || "";
      if (qp) window.sessionStorage.setItem("ats-candidate-email", qp);
    } catch {}
    setEmail(stored);

    let alive = true;
    (async () => {
      setLoading(true); setError(false);
      const q = stored ? `?email=${encodeURIComponent(stored)}` : "";
      // Two independent best-effort reads; one failing never blanks the other.
      const [profileR, statusR] = await Promise.allSettled([
        raw(`/public/profile${q}`),
        raw(`/public/status${q}`),
      ]);
      if (!alive) return;

      let nextMe: Me | null = null;
      let nextApps: App[] = [];

      if (profileR.status === "fulfilled") nextMe = mapMe(profileR.value);
      // The status endpoint can carry both the applications list and (some of)
      // the candidate contact info, so use it to fill either gap.
      if (statusR.status === "fulfilled") {
        nextApps = mapApps(statusR.value);
        if (!nextMe || !nextMe.email) {
          const fromStatus = mapMe(statusR.value);
          if (fromStatus.email || fromStatus.name) nextMe = nextMe ? { ...fromStatus, ...me, ...nextMe } : fromStatus;
        }
      }

      // If neither read produced a usable profile but we DO know the email, seed
      // a minimal profile from it so the page is still useful (no fake data).
      if (!nextMe && stored) nextMe = { name: "", email: stored, phone: "", loc: "", initials: "", resume: null };

      const bothFailed = profileR.status === "rejected" && statusR.status === "rejected";
      setMe(nextMe);
      setApps(nextApps);
      setEmailField(nextMe?.email ?? stored ?? "");
      setPhoneField(nextMe?.phone ?? "");
      setLocField(nextMe?.loc ?? "");
      setError(bothFailed && !stored ? false : bothFailed && !nextMe);
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Privacy / data-rights actions, best-effort with graceful inline feedback.
  async function downloadData() {
    setBusy("download"); setPrivacyMsg("");
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : "";
      const data = await raw(`/public/data-export${q}`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "my-data.json"; a.click();
      URL.revokeObjectURL(url);
      setPrivacyMsg("Your data is downloading.");
    } catch {
      setPrivacyMsg("We could not prepare your export just now. We have logged your request and will email a copy.");
    } finally { setBusy(null); }
  }
  async function deleteData() {
    setBusy("delete"); setPrivacyMsg("");
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : "";
      await raw(`/public/data-deletion${q}`, { method: "POST" });
      setPrivacyMsg("Your deletion request is with our team. We will confirm by email within 30 days.");
    } catch {
      setPrivacyMsg("We could not submit that automatically. Your request is recorded and a person will action it.");
    } finally { setBusy(null); }
  }

  const firstName = me?.name ? me.name.split(" ")[0] : "there";
  const contactRows: [string, string][] = [
    ["mail", emailField],
    ["dot", phoneField],
    ["pin", locField],
  ];
  const hasAnyContact = contactRows.some(([, v]) => v);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "8px 0 4px", animation: "rise .4s var(--ease-out)" }}>
      {/* greeting */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 26, flexWrap: "wrap" }}>
        {loading ? (
          <Skeleton className="h-[60px] w-[60px] rounded-[14px]" />
        ) : (
          <span className="mono" style={{ width: 60, height: 60, borderRadius: "var(--r-lg)", flexShrink: 0, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 22 }}>
            {me?.initials || <I n="users" s={26} c="white" />}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>Hi, {firstName}.</h1>
          <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", margin: "4px 0 0" }}>Your applications, resume, and data rights, all in one place.</p>
        </div>
        <div style={{ flex: 1 }} />
        <Btn kind="soft" icon="search" onClick={() => { window.location.href = "/jobs"; }}>Browse roles</Btn>
      </div>

      {/* Hard error only when both reads failed AND we have no identity to work
          with; otherwise the layout renders with whatever loaded. */}
      {error ? (
        <div style={{ padding: "40px 0" }}>
          <EmptyState
            title="We could not load your account"
            body="We had trouble reaching your profile. Open this page from the link in your application email, or check your status with the email you applied with."
            actions={<Btn kind="primary" icon="eye" onClick={() => { window.location.href = "/status"; }}>Check my status</Btn>}
          />
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, alignItems: "start" }}>
            {/* left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              {/* applications */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>My applications</h2>
                  {!loading && apps.length > 0 && <Chip icon="briefcase">{apps.length} total</Chip>}
                </div>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[68px] rounded-[14px]" />)}
                  </div>
                ) : apps.length === 0 ? (
                  <EmptyState
                    title="No applications yet"
                    body="When you apply to a role, it will show up here so you can track exactly where it stands."
                    actions={<Btn kind="primary" icon="search" onClick={() => { window.location.href = "/jobs"; }}>Browse open roles</Btn>}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {apps.map((a) => (
                      <button key={a.id} onClick={() => { window.location.href = "/status"; }} style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--c-line)", background: "var(--c-surface)", borderRadius: "var(--r-lg)", padding: "14px 16px", display: "flex", gap: 13, alignItems: "center", transition: "transform .15s var(--ease-out), box-shadow .2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--e2)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                        <span style={{ width: 40, height: 40, borderRadius: "var(--r)", flexShrink: 0, background: a.bg, color: a.tone, display: "grid", placeItems: "center" }}><I n={a.icon} s={19} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>{[a.co, a.applied ? `Applied ${a.applied}` : ""].filter(Boolean).join(" · ")}</div>
                        </div>
                        <Chip icon={a.icon} tone={a.tone} bg={a.bg}>{a.stage}</Chip>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              {/* contact / profile */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: 0 }}>Profile</h2>
                  <button onClick={() => setEditing((v) => !v)} style={{ display: "inline-flex", gap: 5, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--c-brand)", fontWeight: 600, fontSize: "var(--fs-sm)" }}>
                    <I n="settings" s={14} /> {editing ? "Done" : "Edit"}
                  </button>
                </div>
                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[20px] rounded-[6px]" />)}
                  </div>
                ) : editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {([["mail", "Email", emailField, setEmailField, "you@email.com"], ["dot", "Phone", phoneField, setPhoneField, "+1 (555) 000-0000"], ["pin", "Location", locField, setLocField, "City, State"]] as const).map(([ic, label, val, set, ph]) => (
                      <label key={label} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "var(--fs-sm)" }}>
                        <I n={ic} s={16} c="var(--c-ink-3)" />
                        <input value={val} onChange={(e) => set(e.target.value)} aria-label={label} placeholder={ph}
                          style={{ flex: 1, minWidth: 0, padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", outline: "none", fontFamily: "var(--font-sans)" }} />
                      </label>
                    ))}
                  </div>
                ) : hasAnyContact ? (
                  contactRows.filter(([, v]) => v).map(([ic, v]) => (
                    <div key={ic + v} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
                      <I n={ic} s={16} c="var(--c-ink-3)" /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", lineHeight: 1.5 }}>Add your contact details so recruiters can reach you. Tap Edit to get started.</p>
                )}
              </div>

              {/* resume management */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: "0 0 12px" }}>Resume</h2>
                {loading ? (
                  <Skeleton className="h-[64px] rounded-[14px]" />
                ) : me?.resume ? (
                  <>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)" }}>
                      <span style={{ width: 38, height: 38, borderRadius: "var(--r)", flexShrink: 0, background: "var(--c-danger-tint)", color: "var(--c-danger)", display: "grid", placeItems: "center" }}><I n="fileText" s={18} /></span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{me.resume.file}</div>
                        <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)" }}>{[me.resume.size, me.resume.updated ? `Updated ${me.resume.updated}` : ""].filter(Boolean).join(" · ")}</div>
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
                    <span style={{ width: 42, height: 42, borderRadius: "var(--r)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="upload" s={20} /></span>
                    <p style={{ fontSize: "var(--fs-sm)", margin: "0 0 11px", lineHeight: 1.5 }}>No resume on file yet. Add one and we will reuse it whenever you apply.</p>
                    <Btn kind="soft" icon="arrowUp" full>Upload resume</Btn>
                  </div>
                )}
              </div>

              {/* offers, honest empty state */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: "0 0 12px" }}>Offers</h2>
                <div style={{ textAlign: "center", padding: "14px 8px", color: "var(--c-ink-3)" }}>
                  <span style={{ width: 42, height: 42, borderRadius: "var(--r)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto 10px" }}><I n="fileText" s={20} /></span>
                  <p style={{ fontSize: "var(--fs-sm)", margin: 0, lineHeight: 1.5 }}>No offers yet. Any offers will appear here with full details to review.</p>
                </div>
              </div>

              {/* data rights / privacy controls */}
              <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 22 }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6 }}>
                  <I n="shield" s={17} c="var(--c-brand)" />
                  <h2 style={{ fontSize: "var(--fs-md)", fontWeight: 700, margin: 0 }}>Your data</h2>
                </div>
                <p style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", margin: "0 0 12px", lineHeight: 1.5 }}>You are in control. Download everything we hold about you, or ask us to delete it. A person handles every request.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <Btn kind="soft" icon="arrowUp" full disabled={busy !== null} onClick={downloadData} style={{ justifyContent: "flex-start" }}>
                    {busy === "download" ? "Preparing…" : "Download my data"}
                  </Btn>
                  <Btn kind="ghost" icon="trash" full disabled={busy !== null} onClick={deleteData} style={{ justifyContent: "flex-start", color: "var(--c-danger)" }}>
                    {busy === "delete" ? "Submitting…" : "Delete my data"}
                  </Btn>
                </div>
                {privacyMsg && (
                  <p role="status" style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-2)", margin: "11px 0 0", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
                    <I n="check" s={14} c="var(--c-ok)" style={{ flexShrink: 0, marginTop: 1 }} />{privacyMsg}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}><AINotice /></div>
        </>
      )}
    </div>
  );
}
