"use client";
// SecAiScreens.tsx, Security dashboard + AI operations. Ported byte-faithful from
// screen-secai.jsx. Data via props only.
import React from "react";
import { Pill, ScoreRing, Reveal, KPICard, SectionCard } from "./aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import type { SecurityData, AiOpsData } from "./types";
import { useTableSort, SortHead } from "@/components/shared/sortable";
import { toTitleCase } from "@/lib/utils";
import { SceneArt } from "@/components/shared/scene-art";

export function SecurityScreen({ data, onReport }: { data: SecurityData; onReport?: () => void }) {
  const s = data;
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Security</h1>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Posture, access, and risk for {s.orgName}.</p></div>
          <Btn variant="primary" icon="arrowUpRight" onClick={onReport}>Download report</Btn>
        </div>

        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: "var(--r-xl)", background: "linear-gradient(110deg, var(--brand-tint-2), transparent 65%)", border: "1px solid color-mix(in oklab, var(--brand) 22%, var(--line))", marginBottom: 18, flexWrap: "wrap" }}>
          <ScoreRing value={s.score} size={84} band="var(--brand)" label="score" />
          <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Security score {s.score} / 100</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 2 }}>{s.alerts.length} open risk items · strong encryption &amp; MFA coverage.</div></div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>{s.posture.map(p => <div key={p.k} style={{ textAlign: "center", minWidth: 80 }}><div className="mono tnum" style={{ fontSize: 20, fontWeight: 700, color: p.v >= 90 ? "var(--ok)" : "var(--ink)" }}>{p.v}{p.unit}</div><div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600 }}>{p.k}</div></div>)}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }} className="sec-row">
          <SectionCard title="Risk alerts" icon="flag" headRight={<Pill tone="var(--warn)" bg="var(--warn-tint)">{s.alerts.length} open</Pill>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {s.alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: a.sev === "Medium" ? "var(--warn-tint)" : "var(--surface)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, color: a.sev === "Medium" ? "var(--warn)" : "var(--ink-2)", background: a.sev === "Medium" ? "var(--surface)" : "var(--surface-2)" }}><Icon name={a.icon} size={17} /></span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.t}</div><div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{a.detail}</div></div>
                  <Pill tone={a.sev === "Medium" ? "var(--warn)" : "var(--ink-3)"} bg="transparent">{toTitleCase(a.sev)}</Pill>
                  <Btn variant="soft" size="sm">Resolve</Btn>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Hardening checklist" icon="check" headRight={<Pill tone="var(--ok)" bg="var(--ok-tint)">{s.checklist.filter(c => c.done).length} / {s.checklist.length}</Pill>}>
            {s.checklist.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: c.done ? "var(--ok)" : "var(--surface-2)", color: c.done ? "var(--on-brand)" : "var(--ink-3)", border: c.done ? "none" : "1px solid var(--line-strong)" }}>{c.done && <Icon name="check" size={13} stroke={3} />}</span>
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: c.done ? "var(--ink-2)" : "var(--ink)" }}>{c.c}</span>
                {!c.done && <Pill tone="var(--warn)" bg="var(--warn-tint)">to do</Pill>}
              </div>
            ))}
          </SectionCard>
        </div>
        {s.alerts.length === 0 && s.checklist.length === 0 && (
          <div style={{ padding: "34px 0 6px" }}>
            <SceneArt scene="shield" maxWidth={380}
              title="Continuous protection, watching quietly"
              body="MFA and SSO coverage, encryption at rest and the hardening checklist are monitored around the clock. Risk findings surface here the moment they appear." />
          </div>
        )}
      </div>
    </div>
  );
}

const driftMeta: Record<string, [string, string]> = { stable: ["var(--ok)", "var(--ok-tint)"], watch: ["var(--warn)", "var(--warn-tint)"] };

export function AiOpsScreen({ data, onManagePrompts, onInvestigate }: { data: AiOpsData; onManagePrompts?: () => void; onInvestigate?: () => void }) {
  const a = data;
  const { sorted: sortedAgents, sort, toggle } = useTableSort(a.agents, { key: "cost", dir: "desc" });
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>AI operations</h1><Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">{a.agentCount} agents</Pill></div>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Monitor agent health, cost, drift, and prompts across the fleet.</p></div>
          <Btn variant="soft" icon="terminal" onClick={onManagePrompts}>Manage prompts</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }} className="aiops-kpis">
          {a.kpis.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
        </div>

        <Reveal i={4}><SectionCard title="Agent fleet" icon="cpu" action="Deploy agent" headRight={<Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">violet = AI</Pill>}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 110px 90px 90px 100px 90px", gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "1px solid var(--line)" }}>
            <SortHead label="Agent" sortKey="n" sort={sort} onSort={toggle} /><SortHead label="Status" sortKey="status" sort={sort} onSort={toggle} /><SortHead label="Accuracy" sortKey="acc" sort={sort} onSort={toggle} align="right" style={{ textAlign: "right" }} /><SortHead label="Drift" sortKey="drift" sort={sort} onSort={toggle} align="right" style={{ textAlign: "right" }} /><SortHead label="Cost/mo" sortKey="cost" sort={sort} onSort={toggle} align="right" style={{ textAlign: "right" }} /><SortHead label="Latency" sortKey="lat" sort={sort} onSort={toggle} align="right" style={{ textAlign: "right" }} />
          </div>
          {sortedAgents.map((ag, i) => {
            const [dc, db] = driftMeta[ag.drift] || driftMeta.stable;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 110px 90px 90px 100px 90px", gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--ai-tint)", color: "var(--ai)", flexShrink: 0 }}><Icon name="cpu" size={14} /></span><span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ai-ink)" }}>{ag.n}</span></span>
                <Pill tone={ag.status === "healthy" ? "var(--ok)" : "var(--warn)"} bg={ag.status === "healthy" ? "var(--ok-tint)" : "var(--warn-tint)"} icon={ag.status === "healthy" ? "check" : "eye"}>{toTitleCase(ag.status)}</Pill>
                <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>{ag.acc.toFixed(2)}</span>
                <span style={{ textAlign: "right" }}><Pill tone={dc} bg={db} style={{ fontSize: 10 }}>{toTitleCase(ag.drift)}</Pill></span>
                <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>${ag.cost}</span>
                <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--ink-3)" }}>{ag.lat}s</span>
              </div>
            );
          })}
        </SectionCard></Reveal>

        <div style={{ marginTop: 16, padding: "13px 16px", borderRadius: "var(--r-lg)", background: "var(--ai-tint)", border: "1px solid color-mix(in oklab, var(--ai) 20%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--ink-2)" }}>
          <Icon name="shield" size={16} style={{ color: "var(--ai)", flexShrink: 0 }} /><span><b style={{ color: "var(--ai-ink)" }}>bias-auditor</b> and <b style={{ color: "var(--ai-ink)" }}>analytics</b> are on drift watch, accuracy dipped below 0.92. Review their recent outputs in Compliance.</span>
          <Btn variant="outlineAi" size="sm" icon="eye" style={{ marginLeft: "auto" }} onClick={onInvestigate}>Investigate</Btn>
        </div>
      </div>
    </div>
  );
}
