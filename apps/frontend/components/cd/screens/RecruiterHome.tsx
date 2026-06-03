"use client";
// components/screens/RecruiterHome.tsx
// Recruiter dashboard, ported pixel-exact from dash-views.jsx (RecruiterDash).
// Data via props only; lists render a graceful empty state when [].
import * as React from "react";
import { Btn, StatusBadge, EmptyHint } from "../aurora-ui";
import { Greeting, KPICard, Reveal, SectionCard, ScoreRing, Pill } from "../aurora-kit";
import type { RecruiterHomeData } from "../types";

const stCol = (s: "pass" | "review" | "fail") => (s === "pass" ? "var(--ok)" : s === "review" ? "var(--warn)" : "var(--danger)");

export function RecruiterHome({ data, onBulkUpload, onSource }: { data: RecruiterHomeData; onBulkUpload?: () => void; onSource?: () => void }) {
  const { title, sub, kpis = [], applications = [], myReqs = [], scheduling = [] } = data;
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <Greeting title={title} sub={sub}>
        <Btn variant="soft" icon="users" onClick={onBulkUpload}>Bulk upload</Btn>
        <Btn variant="ai" icon="radar" onClick={onSource}>Source candidates</Btn>
      </Greeting>
      {kpis.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id ?? k.label} k={k} i={i} />)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={4}><SectionCard title="Latest applications" icon="users" action="View all" pad={6}>
            {applications.length ? applications.map((a, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 12, alignItems: "center", padding: "9px 12px", borderRadius: "var(--r)", transition: "background var(--t-fast)", cursor: "pointer" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <ScoreRing value={a.score} size={40} band={stCol(a.st)} label="" />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.n}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{a.role} · {a.src}</div>
                </div>
                <StatusBadge kind={a.st} />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", width: 32, textAlign: "right" }}>{a.t}</span>
              </div>
            )) : <EmptyHint icon="users" text="No new applications yet." />}
          </SectionCard></Reveal>

          <Reveal i={6}><SectionCard title="My requisitions" icon="briefcase" action="Manage">
            {myReqs.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {myReqs.map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 150px 60px", gap: 14, alignItems: "center" }}>
                    <div><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{r.dept}</div></div>
                    <div style={{ display: "flex", height: 8, borderRadius: 99, overflow: "hidden", gap: 2 }}>
                      {r.stagePct.map((p, j) => <div key={j} style={{ width: p + "%", background: ["var(--ink-3)", "var(--info)", "var(--ai)", "var(--brand)"][j], animation: "growx .9s var(--ease-out) both", animationDelay: j * 100 + "ms" }} />)}
                    </div>
                    <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{r.cand}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyHint icon="briefcase" text="You have no open requisitions." />}
          </SectionCard></Reveal>
        </div>

        <Reveal i={5}><SectionCard title="Scheduling queue" icon="calendar" action="Open calendar">
          {scheduling.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {scheduling.map((s, i) => (
                <div key={i} style={{ padding: "12px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: s.urgent ? "var(--warn-tint)" : "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{s.n}</span>
                    {s.urgent && <Pill tone="var(--warn)" bg="transparent" icon="clock">urgent</Pill>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 9 }}>{s.role} · {s.round}</div>
                  <Btn variant="soft" size="sm" icon="calendar" style={{ width: "100%", justifyContent: "center" }}>Schedule</Btn>
                </div>
              ))}
            </div>
          ) : <EmptyHint icon="calendar" text="Nothing to schedule right now." />}
        </SectionCard></Reveal>
      </div>
    </div>
  );
}
