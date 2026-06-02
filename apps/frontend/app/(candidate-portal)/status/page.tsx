"use client";
// app/(candidate-portal)/status/page.tsx
// Exact port of the Northwind candidate portal "Status" view from
// claude-design/portal.jsx. The candidate-layout already provides the page
// chrome (sticky nav + footer), so this file renders ONLY the page content.
// Mock STATUS_STAGES is replaced with real data: a controlled email/reference
// lookup hits GET /candidate-portal/status (falling back to /applications/
// status), coerces res?.data ?? res, and renders the real stage/timeline.
// AI is framed as advisory; a human always decides.
import { Fragment, useState, type CSSProperties, type FormEvent } from "react";
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
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
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
function Btn({ kind = "primary", icon, trail, children, onClick, type = "button", style = {} }: {
  kind?: BtnKind; icon?: string; trail?: string; children: React.ReactNode;
  onClick?: () => void; type?: "button" | "submit"; style?: CSSProperties;
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
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "10px 18px", fontSize: "var(--fs-sm)", fontWeight: 700, borderRadius: "var(--r)", cursor: "pointer", border: "1px solid transparent", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", ...V[kind], ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {icon && <I n={icon} s={17} />}
      {children}
      {trail && <I n={trail} s={17} />}
    </button>
  );
}
function Chip({ icon, children, tone = "var(--c-ink-2)", bg = "var(--c-surface-2)" }: {
  icon?: string; children: React.ReactNode; tone?: string; bg?: string;
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

/* ---- real-data shapes + stage mapping ---- */
// Canonical hiring pipeline; the live "current stage" drives done/current flags.
const STAGE_ORDER = ["APPLIED", "SCREENED", "INTERVIEW", "DECISION"] as const;
type StageKey = (typeof STAGE_ORDER)[number];
const STAGE_LABEL: Record<StageKey, string> = {
  APPLIED: "Applied",
  SCREENED: "Under review",
  INTERVIEW: "Interview",
  DECISION: "Decision",
};

type ApiApplication = {
  applicationId?: string;
  role?: string;
  title?: string;
  department?: string;
  company?: string;
  co?: string;
  stage?: string;
  status?: string;
  appliedAt?: string;
};

type StatusView = {
  role: string;
  company: string | null;
  appliedAt: string | null;
  stageIndex: number;
  statusRaw: string;
};

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Normalise a backend stage string to an index into STAGE_ORDER.
function stageIndexOf(stage?: string): number {
  if (!stage) return 0;
  const s = stage.toUpperCase();
  const direct = STAGE_ORDER.findIndex((k) => k === s);
  if (direct >= 0) return direct;
  if (s.includes("HIRED") || s.includes("OFFER") || s.includes("DECISION") || s.includes("REJECT") || s.includes("DECLINE")) return 3;
  if (s.includes("INTERVIEW")) return 2;
  if (s.includes("SCREEN") || s.includes("REVIEW")) return 1;
  return 0;
}

// Coerce the wide range of payloads (the gateway may return {data:{applications:[...]}},
// {applications:[...]}, [...], or a single application) into a single StatusView.
function toView(payload: unknown): StatusView | null {
  const root = (payload as { data?: unknown })?.data ?? payload;
  let app: ApiApplication | undefined;
  const apps = (root as { applications?: ApiApplication[] })?.applications;
  if (Array.isArray(apps)) app = apps[0];
  else if (Array.isArray(root)) app = (root as ApiApplication[])[0];
  else if (root && typeof root === "object") app = root as ApiApplication;
  if (!app || (!app.role && !app.title)) return null;
  return {
    role: app.role ?? app.title ?? "Your application",
    company: app.company ?? app.co ?? null,
    appliedAt: app.appliedAt ?? null,
    stageIndex: stageIndexOf(app.stage ?? app.status),
    statusRaw: (app.stage ?? app.status ?? "Under review").toString(),
  };
}

export default function ApplicationStatusPage() {
  const [lookup, setLookup] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<StatusView | null>(null);
  const [errored, setErrored] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    const q = lookup.trim();
    if (!q) return;
    setLoading(true);
    setErrored(false);
    setNotFound(false);
    setSearched(true);
    const qs = `?email=${encodeURIComponent(q)}&reference=${encodeURIComponent(q)}`;
    try {
      let payload: unknown;
      try {
        payload = await raw(`/candidate-portal/status${qs}`);
      } catch {
        // Fall back to the alternate route before surfacing an error.
        payload = await raw(`/applications/status${qs}`);
      }
      const v = toView(payload);
      if (!v) setNotFound(true);
      else setView(v);
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
  }

  const stages = STAGE_ORDER.map((k, i) => ({
    k: STAGE_LABEL[k],
    done: view ? i < view.stageIndex : false,
    current: view ? i === view.stageIndex : false,
    date: view && i === 0 ? fmtDate(view.appliedAt) : view && i === view.stageIndex ? "In progress" : "",
  }));

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 0 20px", animation: "rise .4s var(--ease-out)" }}>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px", textAlign: "center" }}>Check your application status</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", textAlign: "center", margin: "0 0 24px" }}>Enter the email you applied with, we'll show you exactly where things stand.</p>

      {!searched ? (
        <form onSubmit={handleLookup} className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 24, maxWidth: 460, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              type="text"
              aria-label="Email or reference"
              style={{ flex: 1, padding: "12px 15px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" }}
              placeholder="you@email.com"
            />
            <Btn kind="primary" type="submit">Look up</Btn>
          </div>
        </form>
      ) : loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton className="h-[150px] rounded-[var(--r-2xl)]" />
          <Skeleton className="h-[80px] rounded-[var(--r-lg)]" />
          <Skeleton className="h-[64px] rounded-[var(--r-lg)]" />
        </div>
      ) : errored ? (
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, display: "grid", placeItems: "center", minHeight: 220 }}>
          <ErrorState
            title="Could not load your status"
            body="We could not reach the application service. Please try again in a moment."
            code="GET /candidate-portal/status"
            onRetry={reset}
          />
        </div>
      ) : notFound || !view ? (
        <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, display: "grid", placeItems: "center", minHeight: 220 }}>
          <EmptyState
            title="No application found"
            body="We could not find an application for that email or reference. If you applied recently, it may take a little time to appear."
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
          <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{view.role}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>
                  {view.appliedAt ? `Applied ${fmtDate(view.appliedAt)}` : "Application received"}
                  {view.company ? ` · ${view.company}` : ""}
                </div>
              </div>
              <Chip icon="clock" tone="var(--c-warn)" bg="var(--c-warn-tint)">Under review</Chip>
            </div>
            {/* tracker */}
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              {stages.map((s, i) => (
                <Fragment key={s.k}>
                  <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 99, margin: "0 auto", display: "grid", placeItems: "center", background: s.done ? "var(--c-brand)" : "var(--c-surface-2)", color: s.done ? "var(--c-on-brand)" : "var(--c-ink-3)", border: s.current ? "2px solid var(--c-brand)" : s.done ? "none" : "1px solid var(--c-line)", boxShadow: s.current ? "0 0 0 4px var(--c-brand-tint)" : "none" }}>
                      {s.done ? <I n="check" s={18} sw={2.4} /> : i + 1}
                    </div>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: s.current ? 700 : 500, color: s.done ? "var(--c-ink)" : "var(--c-ink-3)", marginTop: 8 }}>{s.k}</div>
                    {s.date && <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 1 }}>{s.date}</div>}
                  </div>
                  {i < stages.length - 1 && <div style={{ flex: 1, height: 2, background: s.done ? "var(--c-brand)" : "var(--c-line)", marginTop: 17 }} />}
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-surface)", border: "1px solid var(--c-line)", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>What's happening now</div>
            <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
              A recruiter on the team is reviewing your application alongside an AI-assisted summary. The recommendation is advisory only, a person makes the final call. You'll hear from us soon, and no action is needed from you right now.
            </p>
          </div>
          <AINotice />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/transparency" style={{ textDecoration: "none" }}><Btn kind="soft" icon="eye">See how AI was used</Btn></a>
            <a href="/appeal" style={{ textDecoration: "none" }}><Btn kind="ai" icon="users">Request human review</Btn></a>
          </div>
        </div>
      )}
    </div>
  );
}
