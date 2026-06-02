"use client";
// app/(candidate-portal)/status/page.tsx
// RICH port of claude-design/portal.jsx -> Status. PUBLIC candidate-portal page,
// the surrounding nav/footer/width come from CandidateLayout, so this renders
// CONTENT ONLY (a single max-width wrapper, no nav/footer of its own).
//
// Faithful reproduction of the prototype's Status content: the lookup form, the
// application-stage tracker (Applied -> Under review -> Interview -> Decision)
// with the current stage highlighted, a "What's happening now" note, the
// "AI is assistive, a human decides" advisory, and the two next-step actions
// (See how AI was used -> /transparency, Request human review -> /appeal).
//
// The portal-local helpers (Btn / Chip / AINotice) are reproduced inline so the
// look matches the prototype exactly; the Icon comes from "@/components/aurora-icon".
// Inline palette colors use var(--c-NAME); effect/size tokens (--r*, --fs*, --ease*)
// are bare. The prototype's `rise` / `pop` animations map to the existing globals.
//
// WIRE: the lookup is a controlled form (email + optional reference). On submit we
// do a best-effort fetch via raw() against the real public endpoint
// (GET /public/status?email=...), falling back to /candidate-portal/status, and
// coerce res?.data ?? res. When the API returns an application we render the real
// stage / timeline; otherwise pre-lookup, loading, "not found", and error each
// render the same layout with an EmptyState / ErrorState / spinner. No application
// data is fabricated, the design's sample copy only seeds the input placeholder.
import { useState } from "react";
import { EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import type { ApplicationStage } from "@/lib/types";

/* ---------- local raw() gateway helper (unwrap res?.data ?? res) ---------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  const json = await res.json();
  return json?.data ?? json;
}

/* ---------- portal-local helpers (reproduced from portal.jsx) ---------- */
type CSS = React.CSSProperties;

function Btn({
  kind = "primary", icon, trail, children, onClick, big, full, type, disabled, style = {},
}: {
  kind?: "primary" | "soft" | "ghost" | "ai";
  icon?: string; trail?: string; children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  big?: boolean; full?: boolean; type?: "button" | "submit" | "reset"; disabled?: boolean; style?: CSS;
}) {
  const V: Record<string, CSS> = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-ai)" },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
        padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)",
        fontWeight: 700, borderRadius: "var(--r)", cursor: disabled ? "default" : "pointer",
        border: "1px solid transparent", width: full ? "100%" : "auto",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
        ...V[kind], ...(disabled ? { opacity: 0.6, pointerEvents: "none" } : {}), ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {icon && <Icon name={icon} size={big ? 19 : 17} />}{children}{trail && <Icon name={trail} size={big ? 19 : 17} />}
    </button>
  );
}

function Chip({
  icon, children, tone = "var(--c-ink-2)", bg = "var(--c-surface-2)",
}: { icon?: string; children?: React.ReactNode; tone?: string; bg?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px",
      borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: tone, background: bg,
    }}>
      {icon && <Icon name={icon} size={13} />}{children}
    </span>
  );
}

/* AI-assistive banner, appears wherever AI touches the candidate. */
function AINotice({ compact }: { compact?: boolean }) {
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: compact ? "center" : "flex-start",
      padding: compact ? "11px 14px" : "16px 18px", borderRadius: "var(--r-lg)",
      background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)",
    }}>
      <span style={{
        width: 32, height: 32, borderRadius: 10, background: "var(--c-ai)", color: "var(--c-on-ai)",
        display: "grid", placeItems: "center", flexShrink: 0,
      }}><Icon name="sparkles" size={17} /></span>
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

/* ---------- view-model: maps the API's application onto the 4-stage tracker ---------- */
type Stage = { k: string; done: boolean; current?: boolean; date?: string };

// The prototype's 4-step tracker. Each label maps from one or more real stages
// so the public-status payload (whatever shape it arrives in) renders honestly.
const TRACKER: { label: string; stages: ApplicationStage[] }[] = [
  { label: "Applied", stages: ["APPLIED"] },
  { label: "Under review", stages: ["SCREENED", "PHONE_SCREEN", "ASSESSMENT"] },
  { label: "Interview", stages: ["INTERVIEW", "FINAL_REVIEW"] },
  { label: "Decision", stages: ["OFFER", "HIRED", "REJECTED", "WITHDRAWN"] },
];

// Friendly status chip per current stage (icon + word, never color alone).
function statusChip(stage: ApplicationStage): { label: string; icon: string; tone: string; bg: string } {
  switch (stage) {
    case "APPLIED": return { label: "Applied", icon: "check", tone: "var(--c-brand-ink)", bg: "var(--c-brand-tint)" };
    case "SCREENED": case "PHONE_SCREEN": case "ASSESSMENT":
      return { label: "Under review", icon: "clock", tone: "var(--c-warn)", bg: "var(--c-warn-tint)" };
    case "INTERVIEW": case "FINAL_REVIEW":
      return { label: "Interview", icon: "calendar", tone: "var(--c-info)", bg: "var(--c-info-tint)" };
    case "OFFER": case "HIRED":
      return { label: stage === "HIRED" ? "Hired" : "Offer", icon: "check", tone: "var(--c-ok)", bg: "var(--c-ok-tint)" };
    case "REJECTED": return { label: "Not selected", icon: "dot", tone: "var(--c-ink-3)", bg: "var(--c-surface-2)" };
    case "WITHDRAWN": return { label: "Withdrawn", icon: "dot", tone: "var(--c-ink-3)", bg: "var(--c-surface-2)" };
    default: return { label: "Under review", icon: "clock", tone: "var(--c-warn)", bg: "var(--c-warn-tint)" };
  }
}

// What the API gives us, kept loose because the public endpoint is best-effort.
interface StatusResult {
  title: string;        // role applied for
  company: string;      // tenant / company name
  applied: string;      // human date, e.g. "May 24"
  stage: ApplicationStage;
  note?: string;        // optional "what's happening now" copy
}

// Coerce the (unwrapped) gateway payload into the view-model, or null if absent.
function toResult(d: any): StatusResult | null {
  if (!d || typeof d !== "object") return null;
  const row = Array.isArray(d) ? d[0] : (d.application ?? d.candidate ?? d);
  if (!row || typeof row !== "object") return null;
  const stage = (row.stage ?? row.status ?? "") as string;
  if (!stage) return null;
  const title = row.title ?? row.role ?? row.requisitionTitle ?? row.jobTitle ?? "Your application";
  const company = row.company ?? row.companyName ?? row.tenantName ?? row.tenant?.name ?? "";
  const appliedRaw = row.applied ?? row.appliedAt ?? row.createdAt ?? "";
  let applied = String(appliedRaw);
  const ts = appliedRaw ? Date.parse(String(appliedRaw)) : NaN;
  if (!Number.isNaN(ts)) applied = new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { title, company, applied, stage: stage.toUpperCase() as ApplicationStage, note: row.note ?? row.statusNote };
}

// Build the tracker rows for a given current stage.
function buildStages(current: ApplicationStage): { rows: Stage[]; currentIdx: number; appliedDate?: string } {
  const idx = Math.max(0, TRACKER.findIndex((t) => t.stages.includes(current)));
  const terminalRejected = current === "REJECTED" || current === "WITHDRAWN";
  const rows: Stage[] = TRACKER.map((t, i) => ({
    k: t.label,
    done: terminalRejected ? i < idx : i <= idx ? i < idx : false,
    current: i === idx && !terminalRejected,
  }));
  return { rows, currentIdx: idx };
}

export default function StatusPage() {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "found" | "empty" | "error">("idle");
  const [result, setResult] = useState<StatusResult | null>(null);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    const q = email.trim();
    if (!q) return;
    setPhase("loading");
    setResult(null);
    const ref = reference.trim();
    const qs = `email=${encodeURIComponent(q)}${ref ? `&reference=${encodeURIComponent(ref)}` : ""}`;
    // Try the real public endpoint first, then the candidate-portal alias.
    const paths = [`/public/status?${qs}`, `/candidate-portal/status?${qs}`];
    let lastErr = false;
    for (const p of paths) {
      try {
        const data = await raw(p);
        const vm = toResult(data);
        if (vm) { setResult(vm); setPhase("found"); return; }
        lastErr = false; // reached the API but no application matched
      } catch {
        lastErr = true; // network / endpoint error, try the next path
      }
    }
    setPhase(lastErr ? "error" : "empty");
  }

  function reset() {
    setPhase("idle");
    setResult(null);
  }

  const tracker = result ? buildStages(result.stage) : null;
  const chip = result ? statusChip(result.stage) : null;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px", textAlign: "center" }}>
        Check your application status
      </h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", textAlign: "center", margin: "0 0 24px" }}>
        Enter the email you applied with, we will show you exactly where things stand.
      </p>

      {phase !== "found" ? (
        <>
          <form className="clay" onSubmit={lookup} style={{ borderRadius: "var(--r-2xl)", padding: 24, maxWidth: 460, margin: "0 auto" }}>
            <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 7 }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
              style={{
                width: "100%", padding: "12px 15px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)",
                background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
            <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", margin: "14px 0 7px" }}>
              Application reference <span style={{ color: "var(--c-ink-3)", fontWeight: 500 }}>(optional)</span>
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. APP-48213"
                style={{
                  flex: 1, padding: "12px 15px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)",
                  background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none",
                  fontFamily: "var(--font-sans)",
                }}
              />
              <Btn kind="primary" type="submit" trail="search" disabled={!email.trim() || phase === "loading"}>
                {phase === "loading" ? "Looking up" : "Look up"}
              </Btn>
            </div>
          </form>

          {/* feedback under the form: loading / not-found / error */}
          <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
            {phase === "loading" && (
              <div style={{ display: "inline-flex", gap: 10, alignItems: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)", padding: "12px 0" }}>
                <span
                  aria-hidden="true"
                  className="animate-spin"
                  style={{
                    width: 18, height: 18, borderRadius: 99, border: "2px solid var(--c-line-2)",
                    borderTopColor: "var(--c-brand)", display: "inline-block",
                  }}
                />
                Checking your application status...
              </div>
            )}
            {phase === "empty" && (
              <EmptyState
                illustration={
                  <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto" }}>
                    <Icon name="search" size={26} />
                  </span>
                }
                title="No application found"
                body="We could not find an application for that email. Double-check the address you applied with, or browse open roles to apply."
                actions={<Btn kind="soft" onClick={reset}>Try a different email</Btn>}
              />
            )}
            {phase === "error" && (
              <ErrorState
                title="We could not reach our servers"
                body="Something went wrong looking up your status. Please try again in a moment."
                code="GET /public/status"
                onRetry={() => lookup()}
              />
            )}
          </div>
        </>
      ) : (
        result && tracker && chip && (
          <div style={{ animation: "rise .35s var(--ease-out)" }}>
            <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{result.title}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>
                    {result.applied ? `Applied ${result.applied}` : "Applied"}{result.company ? ` · ${result.company}` : ""}
                  </div>
                </div>
                <Chip icon={chip.icon} tone={chip.tone} bg={chip.bg}>{chip.label}</Chip>
              </div>
              {/* tracker */}
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                {tracker.rows.map((s, i) => (
                  <div key={s.k} style={{ display: "contents" }}>
                    <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 99, margin: "0 auto", display: "grid", placeItems: "center",
                        background: s.done ? "var(--c-brand)" : "var(--c-surface-2)",
                        color: s.done ? "var(--c-on-brand)" : "var(--c-ink-3)",
                        border: s.current ? "2px solid var(--c-brand)" : s.done ? "none" : "1px solid var(--c-line)",
                        boxShadow: s.current ? "0 0 0 4px var(--c-brand-tint)" : "none",
                      }}>
                        {s.done ? <Icon name="check" size={18} stroke={2.4} /> : i + 1}
                      </div>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: s.current ? 700 : 500, color: s.done || s.current ? "var(--c-ink)" : "var(--c-ink-3)", marginTop: 8 }}>{s.k}</div>
                      {s.current && <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 1 }}>In progress</div>}
                    </div>
                    {i < tracker.rows.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: s.done ? "var(--c-brand)" : "var(--c-line)", marginTop: 17 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "16px 18px", borderRadius: "var(--r-lg)", background: "var(--c-surface)", border: "1px solid var(--c-line)", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>What is happening now</div>
              <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
                {result.note
                  ? result.note
                  : "A recruiter is reviewing your application alongside an AI-assisted summary. You will hear from us soon. No action is needed from you right now."}
              </p>
            </div>

            <AINotice />

            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/transparency" style={{ textDecoration: "none" }}><Btn kind="soft" icon="eye">See how AI was used</Btn></a>
              <a href="/appeal" style={{ textDecoration: "none" }}><Btn kind="ai" icon="users">Request human review</Btn></a>
              <Btn kind="ghost" onClick={reset}>Check another application</Btn>
            </div>
          </div>
        )
      )}
    </div>
  );
}
