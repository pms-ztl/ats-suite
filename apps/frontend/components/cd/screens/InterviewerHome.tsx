"use client";
// components/screens/InterviewerHome.tsx
// Interviewer dashboard (calm), ported pixel-exact from dash-views.jsx (InterviewerDash).
// Data via props only; lists render a graceful empty state when [].
import * as React from "react";
import { Btn, EmptyHint } from "../aurora-ui";
import { Greeting, KPICard, Reveal, SectionCard, Pill } from "../aurora-kit";
import type { InterviewerHomeData } from "../types";

export function InterviewerHome({ data, onSchedule }: { data: InterviewerHomeData; onSchedule?: () => void }) {
  const { title, sub, kpis = [], today = [], feedback = [], allCaughtUpNote } = data;
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Greeting title={title} sub={sub}>
        <Btn variant="soft" icon="calendar" onClick={onSchedule}>Full schedule</Btn>
      </Greeting>
      {kpis.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id ?? k.label} k={k} i={i} />)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
        <Reveal i={4}><SectionCard title="Today's interviews" icon="calendar">
          {today.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {today.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: t.soon ? "linear-gradient(110deg, var(--brand-tint), transparent 70%)" : "var(--surface)" }}>
                  <div style={{ textAlign: "center", flexShrink: 0, width: 56 }}>
                    <div className="mono" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{t.time}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{t.dur}</div>
                  </div>
                  <div style={{ width: 1, height: 38, background: "var(--line)" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{t.n}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{t.role} · {t.type} · {t.panel} panelist{t.panel > 1 ? "s" : ""}</div>
                  </div>
                  <Pill tone="var(--ink-2)" icon={t.mode === "Video" ? "eye" : t.mode === "Phone" ? "clock" : "users"}>{t.mode}</Pill>
                  {t.soon ? <Btn variant="primary" size="sm" icon="enter">Join</Btn> : <Btn variant="soft" size="sm">Details</Btn>}
                </div>
              ))}
            </div>
          ) : <EmptyHint icon="calendar" text="No interviews today." />}
        </SectionCard></Reveal>

        <Reveal i={5}><SectionCard title="Feedback due from you" icon="fileText" action="History">
          {feedback.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {feedback.map((f, i) => (
                <div key={i} style={{ padding: "13px 14px", borderRadius: "var(--r-lg)", border: "1px solid", borderColor: f.overdue ? "color-mix(in oklab, var(--danger) 30%, var(--line))" : "var(--line)", background: f.overdue ? "var(--danger-tint)" : "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{f.n}</span>
                    <Pill tone={f.overdue ? "var(--danger)" : "var(--ink-3)"} bg="transparent" icon="clock">{f.overdue ? "overdue" : f.when}</Pill>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "2px 0 10px" }}>{f.role} · {f.type}</div>
                  <Btn variant={f.overdue ? "primary" : "soft"} size="sm" icon="fileText" style={{ width: "100%", justifyContent: "center" }}>Write scorecard</Btn>
                </div>
              ))}
              {allCaughtUpNote && <div style={{ textAlign: "center", padding: "8px 0", fontSize: 12, color: "var(--ink-3)" }}>{allCaughtUpNote}</div>}
            </div>
          ) : <EmptyHint icon="fileText" text="No scorecards due. You are all caught up." />}
        </SectionCard></Reveal>
      </div>
    </div>
  );
}
