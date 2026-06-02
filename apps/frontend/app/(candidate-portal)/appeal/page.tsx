"use client";
// app/(candidate-portal)/appeal/page.tsx
// EXACT Claude Design "Aurora" candidate-portal Appeal port (claude-design/portal.jsx,
// the Appeal component): the candidate's right to contest an AI-assisted decision.
// A person on the hiring team with the authority to change the decision reviews
// every request, no algorithms involved. Content ONLY, the public
// CandidateLayout (components/layouts/candidate-layout.tsx) supplies the nav,
// footer, and the max-w main wrapper, so this renders the page body alone.
// Portal-specific helpers (Btn, the local icon shim) are inlined for fidelity;
// canonical glyphs come from "@/components/aurora-icon". Palette colors use
// var(--c-*); effect/size tokens (--r*, --fs-*, --e1, --t, --ease-*) stay bare.
//
// HONEST WIRING: the form is controlled (reason) with validation, a non-empty
// reason is required before submit. Submitting does a best-effort raw() POST to
// /public/appeal, falling back to /appeals. The reassuring confirmation is shown
// ONLY after the request actually succeeds, no fabricated success: a failed POST
// keeps the form and surfaces an inline error with a retry. Nothing here invents
// a server response it did not receive.
import { useState } from "react";
import { Icon } from "@/components/aurora-icon";

/* ------------------------------- wiring ------------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
// Local raw() helper: best-effort fetch that throws on non-2xx so callers can
// try/catch or fall back to a sibling path. Unwraps res?.data ?? res.
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return json?.data ?? json;
}
// POST the appeal to the public path first, then the tenant path. Returns on the
// first that succeeds; rethrows only if both fail so the caller can degrade.
async function submitAppeal(body: { reason: string }): Promise<any> {
  try { return await raw("POST", "/public/appeal", body); }
  catch { return await raw("POST", "/appeals", body); }
}

/* --------------------------- local icon shim -------------------------- */
// chevL and arrow are not in the shared aurora-icon set; reproduce just those
// two portal glyphs inline so the port renders unchanged. Everything else
// (check, users, shield) comes from the canonical Icon component.
const LOCAL_PATHS: Record<string, string> = {
  chevL: "M15 6l-6 6 6 6",
  arrow: "M5 12h14M13 6l6 6-6 6",
};
function LI({ n, s = 16, sw = 1.7, style }: { n: string; s?: number; sw?: number; style?: React.CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={LOCAL_PATHS[n]} />
    </svg>
  );
}

/* ------------------------------ Btn (portal) -------------------------- */
type BtnKind = "primary" | "soft" | "ghost" | "ai";
function Btn({
  kind = "primary", icon, trail, children, onClick, big, full, disabled, type, style = {},
}: {
  kind?: BtnKind; icon?: string; trail?: string; children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; big?: boolean; full?: boolean;
  disabled?: boolean; type?: "button" | "submit" | "reset"; style?: React.CSSProperties;
}) {
  const V: Record<BtnKind, React.CSSProperties> = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-ai)" },
  };
  const sz = big ? 19 : 17;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
        padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)",
        fontWeight: 700, borderRadius: "var(--r)", cursor: disabled ? "default" : "pointer",
        border: "1px solid transparent", width: full ? "100%" : "auto", fontFamily: "var(--font-sans)",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
        ...V[kind], ...(disabled ? { opacity: 0.55, pointerEvents: "none" } : {}), ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
      {icon === "chevL" || icon === "arrow" ? <LI n={icon} s={sz} /> : icon && <Icon name={icon} size={sz} />}
      {children}
      {trail === "chevL" || trail === "arrow" ? <LI n={trail} s={sz} /> : trail && <Icon name={trail} size={sz} />}
    </button>
  );
}

/* ------------------------------- quick-fill prompts ------------------------------- */
const QUICK = ["Skills were under-counted", "Relevant experience missed", "Wrong role match", "Something else"];

/* --------------------------------- page --------------------------------- */
export default function AppealPage() {
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = reason.trim().length > 0 && !busy;

  async function onSubmit() {
    if (!canSubmit) { setErr("Please tell us what you would like us to take another look at."); return; }
    setBusy(true); setErr(null);
    try {
      await submitAppeal({ reason: reason.trim() });
      setSent(true);
    } catch {
      // No fabricated success. Keep the form, let the candidate retry.
      setErr("We could not submit your request just now. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  // Success: the request is genuinely with a person (only reached after a 2xx).
  if (sent) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
          <Icon name="check" size={42} stroke={2.2} />
        </div>
        <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Your request is with a person.</h1>
        <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
          A member of the Northwind team will personally review your application and reply by email within 5 business days. Thank you.
        </p>
        <div style={{ marginTop: 24 }}>
          <a href="/status" style={{ textDecoration: "none" }}><Btn kind="soft">Back to my status</Btn></a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
      <a href="/status" style={{ display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none", color: "var(--c-ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 16 }}>
        <LI n="chevL" s={16} /> Back
      </a>
      <span style={{ width: 52, height: 52, borderRadius: 15, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", marginBottom: 14 }}>
        <Icon name="users" size={26} />
      </span>
      <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Request a human review</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
        This goes straight to a person on the Northwind hiring team with the authority to change the decision, no algorithms involved. Tell them what you would like reconsidered.
      </p>

      <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 24 }}>
        <label htmlFor="appeal-reason" style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 8 }}>
          What should we take another look at?
        </label>
        <textarea
          id="appeal-reason"
          value={reason}
          onChange={(e) => { setReason(e.target.value); if (err) setErr(null); }}
          rows={5}
          style={{ width: "100%", padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", lineHeight: 1.55, resize: "vertical", outline: "none", fontFamily: "var(--font-sans)" }}
          placeholder="For example: my payments work at Lyra was core financial infrastructure handling regulated money movement..."
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 18px" }}>
          {QUICK.map((t) => (
            <button key={t} type="button" onClick={() => setReason((r) => r || t)}
              style={{ fontSize: "var(--fs-xs)", fontWeight: 600, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", cursor: "pointer", fontFamily: "var(--font-sans)" }}>
              {t}
            </button>
          ))}
        </div>

        {err && (
          <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 13px", marginBottom: 14, borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
            <Icon name="flag" size={15} /> {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", marginRight: "auto", display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Icon name="shield" size={14} /> A human reviews every appeal within 5 business days.
          </span>
          <a href="/status" style={{ textDecoration: "none" }}><Btn kind="ghost">Cancel</Btn></a>
          <Btn kind="primary" trail="arrow" type="button" onClick={onSubmit} disabled={!canSubmit}>
            {busy ? "Submitting..." : "Submit appeal"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
