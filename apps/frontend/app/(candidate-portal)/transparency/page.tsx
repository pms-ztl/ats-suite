"use client";
// app/(candidate-portal)/transparency/page.tsx, RICH AI-transparency explainer
// ("How we use AI in hiring"), ported verbatim from claude-design/portal.jsx
// -> Transparency component. CONTENT ONLY: CandidateLayout supplies the nav,
// footer, and max-width main wrapper, so this renders the inner column alone.
// Static trust copy: what the AI looks at / what it never sees, that AI is
// assistive and a human decides, the decision-steps timeline, and the
// always-available link to /appeal (request a human review). Portal-specific
// helpers (Btn, AINotice) are reproduced inline; Icon comes from the shared
// aurora-icon shim. Inline palette colors use var(--c-NAME); effect/size/type
// tokens are bare. The "rise" entrance is a global keyframe (globals.css).
import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/aurora-icon";

/* ---- portal-specific helpers (reproduced inline from portal.jsx) ---- */
function Btn({
  kind = "primary", icon, trail, children, big, full, style = {},
}: {
  kind?: "primary" | "soft" | "ghost" | "ai";
  icon?: string; trail?: string; children?: React.ReactNode;
  big?: boolean; full?: boolean; style?: React.CSSProperties;
}) {
  const V: Record<string, React.CSSProperties> = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    ai: { background: "var(--c-ai)", color: "var(--c-on-ai)" },
  };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
        padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)",
        fontWeight: 700, borderRadius: "var(--r)", cursor: "pointer", border: "1px solid transparent",
        width: full ? "100%" : "auto",
        transition: "transform var(--t) var(--ease-out), box-shadow var(--t)",
        ...V[kind], ...style,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {icon && <Icon name={icon} size={big ? 19 : 17} />}{children}{trail && <Icon name={trail} size={big ? 19 : 17} />}
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

/* ---- page ---- */
export default function TransparencyPage() {
  const assessed = [
    "Your skills and experience against the role's requirements",
    "Relevant projects and measurable impact",
    "Strengths and areas to explore in interviews",
  ];
  const never = [
    "Your name, photo, age, gender, race, or any protected characteristic",
    "Where you went to school as a ranking factor",
    "Anything you didn't choose to share",
  ];
  const cols: [string, string[], string, string][] = [
    ["What the AI looks at", assessed, "check", "var(--c-ok)"],
    ["What it never sees", never, "x", "var(--c-brand)"],
  ];
  const steps: [string, string][] = [
    ["You apply", "Your resume and answers come straight to our team."],
    ["AI assists", "An assistant compares your experience to the role and writes a recommendation, with its reasoning shown."],
    ["A human reviews", "A recruiter reads your application and the AI's notes, and makes the call."],
    ["You can appeal", "If you think something was missed, you can ask a person to take another look."],
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 20px", animation: "rise .4s var(--ease-out)" }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <span style={{
          width: 56, height: 56, borderRadius: 16, background: "var(--c-ai-tint)", color: "var(--c-ai)",
          display: "grid", placeItems: "center", margin: "0 auto 16px",
        }}><Icon name="sparkles" size={28} /></span>
        <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px" }}>How we use AI in hiring</h1>
        <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
          We believe AI should make hiring fairer and faster, never less human. Here&apos;s exactly how it works, in plain language.
        </p>
      </div>

      <div style={{ marginBottom: 18 }}><AINotice /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        {cols.map(([t, arr, ic, col]) => (
          <div key={t} className="clay" style={{ borderRadius: "var(--r-xl)", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 12 }}>{t}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {arr.map((x) => (
                <div key={x} style={{ display: "flex", gap: 9, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.45 }}>
                  <Icon name={ic} size={17} style={{ color: col, flexShrink: 0, marginTop: 1 }} />{x}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="clay" style={{ borderRadius: "var(--r-xl)", padding: 22, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 14 }}>How a decision gets made</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map(([t, d], i, arr) => (
            <div key={i} style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 99,
                  background: i === 2 ? "var(--c-brand)" : "var(--c-brand-tint)",
                  color: i === 2 ? "var(--c-on-brand)" : "var(--c-brand)",
                  display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>{i + 1}</span>
                {i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--c-line)", minHeight: 14 }} />}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{t}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 1 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/appeal" style={{ textDecoration: "none" }}>
          <Btn kind="ai" big icon="users">Request a human review</Btn>
        </Link>
      </div>
    </div>
  );
}
