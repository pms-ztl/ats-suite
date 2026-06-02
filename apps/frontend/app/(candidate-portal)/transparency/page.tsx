"use client";

// Public candidate-portal "How we use AI in hiring" explainer.
// Ported from claude-design/portal.jsx (the Transparency component): a static
// trust/explainability page. The (candidate-portal) layout already provides the
// nav, footer and the max-w-5xl content shell, so this file renders page content
// only. Reuses aurora-kit Btn / Pill / Icon and the aurora "clay" Card.
// Inline palette colors use the full-color var(--c-NAME) companions.

import { Btn } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Card } from "@/components/aurora";

/* AI-assistive banner, appears wherever AI touches the candidate. */
function AINotice({ compact = false }: { compact?: boolean }) {
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
          color: "var(--c-on-ai)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Icon name="sparkles" size={17} />
      </span>
      <div>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>
          AI is assistive, a human decides.
        </div>
        {!compact && (
          <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.5 }}>
            We use AI to help our team review applications fairly. It produces a recommendation only, a person always
            makes the final call, and you can ask for a human review at any time.
          </p>
        )}
      </div>
    </div>
  );
}

export default function CandidateTransparencyPage() {
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
  const columns: [string, string[], string, string][] = [
    ["What the AI looks at", assessed, "check", "var(--c-ok)"],
    ["What it never sees", never, "x", "var(--c-brand)"],
  ];
  const steps: [string, string][] = [
    ["You apply", "Your resume and answers come straight to our team."],
    [
      "AI assists",
      "An assistant compares your experience to the role and writes a recommendation, with its reasoning shown.",
    ],
    ["A human reviews", "A recruiter reads your application and the AI's notes, and makes the call."],
    ["You can appeal", "If you think something was missed, you can ask a person to take another look."],
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", animation: "rise .4s var(--ease-out)" }}>
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--c-ai-tint)",
            color: "var(--c-ai)",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
          }}
        >
          <Icon name="sparkles" size={28} />
        </span>
        <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px" }}>
          How we use AI in hiring
        </h1>
        <p
          style={{
            fontSize: "var(--fs-md)",
            color: "var(--c-ink-2)",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          We believe AI should make hiring fairer and faster, never less human. Here's exactly how it works, in plain
          language.
        </p>
      </div>

      <div style={{ marginBottom: 18 }}>
        <AINotice />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        {columns.map(([title, items, ic, col]) => (
          <Card key={title} material="clay" style={{ borderRadius: "var(--r-xl)", padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 12 }}>{title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((x) => (
                <div
                  key={x}
                  style={{
                    display: "flex",
                    gap: 9,
                    fontSize: "var(--fs-sm)",
                    color: "var(--c-ink-2)",
                    lineHeight: 1.45,
                  }}
                >
                  <Icon name={ic} size={17} style={{ color: col, flexShrink: 0, marginTop: 1 }} />
                  {x}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card material="clay" style={{ borderRadius: "var(--r-xl)", padding: 22, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 14 }}>How a decision gets made</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map(([title, desc], i, arr) => (
            <div key={i} style={{ display: "flex", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 99,
                    background: i === 2 ? "var(--c-brand)" : "var(--c-brand-tint)",
                    color: i === 2 ? "var(--c-on-brand)" : "var(--c-brand)",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ width: 2, flex: 1, background: "var(--c-line)", minHeight: 14 }} />
                )}
              </div>
              <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{title}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ textAlign: "center" }}>
        <a href="/appeal" style={{ textDecoration: "none", display: "inline-block" }}>
          <Btn variant="ai" size="lg" icon="users">
            Request a human review
          </Btn>
        </a>
      </div>
    </div>
  );
}
