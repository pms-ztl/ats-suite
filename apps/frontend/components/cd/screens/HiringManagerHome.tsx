"use client";
// components/screens/HiringManagerHome.tsx
// Hiring-manager dashboard, ported pixel-exact from dash-views.jsx (HMDash).
// Data via props only; lists render a graceful empty state when [].
import * as React from "react";
import { Icon } from "../icon";
import { Btn, EmptyHint } from "../aurora-ui";
import { Greeting, KPICard, Reveal, SectionCard, Pill } from "../aurora-kit";
import type { HiringManagerHomeData } from "../types";

const FUNNEL_LABELS = ["Applied", "Screen", "Interview", "Offer"];
const FUNNEL_COLORS = ["var(--ink-3)", "var(--info)", "var(--ai)", "var(--brand)"];

export function HiringManagerHome({ data, onNewReq, onAnalytics }: { data: HiringManagerHomeData; onNewReq?: () => void; onAnalytics?: () => void }) {
  const { title, sub, kpis = [], decisions = [], reqs = [] } = data;
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <Greeting title={title} sub={sub}>
        <Btn variant="soft" icon="chart" onClick={onAnalytics}>View analytics</Btn>
        <Btn variant="primary" icon="briefcase" onClick={onNewReq}>New requisition</Btn>
      </Greeting>
      {kpis.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id ?? k.label} k={k} i={i} />)}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
        <Reveal i={4}><SectionCard title="Decisions awaiting you" icon="gavel" action="View queue" pad={10}>
          {decisions.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {decisions.map((dec, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, background: dec.tone === "ok" ? "var(--ok-tint)" : "var(--warn-tint)", color: dec.tone === "ok" ? "var(--ok)" : "var(--warn)" }}><Icon name="gavel" size={16} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{dec.n}</span>
                      <Pill tone={dec.tone === "ok" ? "var(--ok)" : "var(--warn)"} bg={dec.tone === "ok" ? "var(--ok-tint)" : "var(--warn-tint)"}>{dec.rec}</Pill>
                      {dec.recAi && <Pill tone="var(--ai-ink)" bg="var(--ai-tint)" icon="sparkles" style={{ fontSize: 9.5 }}>AI</Pill>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1 }}>{dec.role} · {dec.by}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{dec.wait}</span>
                  <Btn variant="primary" size="sm">Review</Btn>
                </div>
              ))}
            </div>
          ) : <EmptyHint icon="gavel" text="No decisions waiting on you." />}
        </SectionCard></Reveal>

        <Reveal i={5}><SectionCard title="My requisitions" icon="briefcase" action="All reqs">
          {reqs.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {reqs.map((r, i) => {
                const max = r.funnel[0] || 1;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.title}</span>
                      <Pill tone={r.risk === "at-risk" ? "var(--danger)" : "var(--ok)"} bg={r.risk === "at-risk" ? "var(--danger-tint)" : "var(--ok-tint)"} icon={r.risk === "at-risk" ? "flag" : "check"}>{r.target}</Pill>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {r.funnel.map((n, j) => (
                        <div key={j} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ height: 34, borderRadius: 7, background: "var(--surface-2)", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                            <div style={{ width: "100%", height: (n / max) * 100 + "%", background: FUNNEL_COLORS[j], borderRadius: 7, animation: "growy 1s var(--ease-out) both", animationDelay: j * 90 + "ms" }} />
                          </div>
                          <div className="mono tnum" style={{ fontSize: 11, fontWeight: 600, marginTop: 3 }}>{n}</div>
                          <div style={{ fontSize: 9, color: "var(--ink-3)" }}>{FUNNEL_LABELS[j]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyHint icon="briefcase" text="You have no open requisitions." />}
        </SectionCard></Reveal>
      </div>
    </div>
  );
}
