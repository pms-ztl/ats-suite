"use client";
// app/(dashboard)/ai/page.tsx - EXACT Claude Design "Aurora" AI operations
// surface. Ported from claude-design/screen-secai.jsx (AiOpsScreen): a fleet
// table of agents with health, cost, runs, and a violet (--c-ai) advisory
// banner. Wired to the real gateway: tries GET /platform/agents (super-admin
// platform view) and falls back to GET /agents (tenant view). The prototype's
// accuracy/drift/latency numbers are NOT in the real payload, so per the
// product rule we never invent them: we render what the API actually returns
// (status, runs, cost) and show a neutral "-" where the backend has no value.
import { useState } from "react";
import { KPICard, SectionCard, Reveal, Pill, type Kpi } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// Normalized agent row the page renders. Only fields the gateway really
// returns are populated; everything else stays optional and shows as "-".
type AgentRow = {
  type: string;
  healthy: boolean;       // derived from enabled / kill-switch state
  statusLabel: string;
  runs: number | null;    // runs30d on the platform view, else null
  cost: number | null;    // costUsd30d on the platform view, else null
};

// Try the super-admin platform view first (richer: runs + cost), then the
// per-tenant view. Both return { agents: [...] }; coerce res?.data ?? res.
async function fetchAgents(): Promise<AgentRow[]> {
  let payload: any;
  try {
    payload = await raw("/platform/agents");
  } catch {
    payload = await raw("/agents");
  }
  const body = payload?.data ?? payload;
  const list: any[] = Array.isArray(body) ? body : Array.isArray(body?.agents) ? body.agents : [];
  return list.map((a) => {
    const type = String(a?.agentType ?? a?.type ?? a?.name ?? "agent");
    const platformKilled = a?.platformKillDisabled === true;
    const enabled = a?.enabled === true || (a?.enabled === undefined && !platformKilled && a?.killSwitchDisabled !== true);
    const healthy = enabled && !platformKilled;
    const runs = a?.runs30d != null ? Number(a.runs30d) : a?.runs != null ? Number(a.runs) : null;
    const cost = a?.costUsd30d != null ? Number(a.costUsd30d) : a?.cost != null ? Number(a.cost) : null;
    return {
      type,
      healthy,
      statusLabel: platformKilled ? "paused" : healthy ? "healthy" : "off",
      runs: Number.isFinite(runs as number) ? runs : null,
      cost: Number.isFinite(cost as number) ? cost : null,
    };
  });
}

const cols = "1.6fr 120px 110px 120px";

export default function AiOpsPage() {
  const agents = useData<AgentRow[]>(fetchAgents);
  const [showInfo, setShowInfo] = useState(true);

  const list = agents.data ?? [];
  const healthy = list.filter((a) => a.healthy).length;
  const total = list.length;
  const watch = total - healthy;
  const totalRuns = list.reduce((sum, a) => sum + (a.runs ?? 0), 0);
  const totalCost = list.reduce((sum, a) => sum + (a.cost ?? 0), 0);
  const hasRunData = list.some((a) => a.runs != null);
  const hasCostData = list.some((a) => a.cost != null);

  // KPIs built ONLY from values the API actually returned. Sparks use the
  // single real datapoint repeated (no fabricated history / trend deltas).
  const kpis: Kpi[] = [
    { id: "agents", label: "Agents in fleet", value: total, icon: "cpu", spark: [total, total], delta: 0, good: true, ai: true },
    { id: "healthy", label: "Agents healthy", value: healthy, suffix: total ? `/${total}` : "", icon: "check", spark: [healthy, healthy], delta: 0, good: true },
    { id: "runs", label: "Agent runs (30d)", value: hasRunData ? totalRuns : 0, icon: "bolt", spark: [totalRuns, totalRuns], delta: 0, good: true },
    { id: "cost", label: "Inference cost (30d)", value: hasCostData ? Math.round(totalCost) : 0, prefix: "$", icon: "card", spark: [totalCost, totalCost], delta: 0, good: true },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>AI operations</h1>
            <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">{total ? `${total} agents` : "agent fleet"}</Pill>
          </div>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Monitor agent health, cost, and runs across the fleet.</p>
        </div>
        <a href="/settings/prompts" aria-label="Manage agent prompts">
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", fontSize: "var(--fs-base)", fontFamily: "var(--font-sans)", fontWeight: 600, borderRadius: "var(--r)", cursor: "pointer", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink)", whiteSpace: "nowrap", lineHeight: 1 }}>
            <Icon name="terminal" size={16} />Manage prompts
          </button>
        </a>
      </div>

      {/* KPI row */}
      {agents.loading && (
        <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-[14px]" />)}
        </div>
      )}
      {agents.data && total > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
        </div>
      )}

      {/* Agent fleet */}
      <Reveal i={4}>
        <SectionCard
          title="Agent fleet"
          icon="cpu"
          headRight={<Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">violet = AI</Pill>}
        >
          {agents.loading && (
            <div className="grid gap-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 rounded-[11px]" />)}
            </div>
          )}

          {agents.error && (
            <ErrorState
              title="Could not load the agent fleet"
              body="The agent registry did not respond. Agent health is reported by the platform billing service."
              code="GET /api/platform/agents"
              onRetry={agents.reload}
            />
          )}

          {agents.data && total === 0 && (
            <EmptyState
              title="No agents reporting yet"
              body="When agents start running for your tenant, their health, runs, and cost show up here."
            />
          )}

          {agents.data && total > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
                <span>Agent</span>
                <span>Status</span>
                <span style={{ textAlign: "right" }}>Runs (30d)</span>
                <span style={{ textAlign: "right" }}>Cost/30d</span>
              </div>
              {list.map((ag, i) => (
                <div key={ag.type} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)", flexShrink: 0 }}>
                      <Icon name="cpu" size={14} />
                    </span>
                    <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ai-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ag.type}</span>
                  </span>
                  <Pill
                    tone={ag.healthy ? "var(--c-ok)" : "var(--c-warn)"}
                    bg={ag.healthy ? "var(--c-ok-tint)" : "var(--c-warn-tint)"}
                    icon={ag.healthy ? "check" : "eye"}
                  >
                    {ag.statusLabel}
                  </Pill>
                  <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600, color: ag.runs == null ? "var(--c-ink-3)" : "var(--c-ink)" }}>
                    {ag.runs == null ? "-" : ag.runs.toLocaleString()}
                  </span>
                  <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600, color: ag.cost == null ? "var(--c-ink-3)" : "var(--c-ink)" }}>
                    {ag.cost == null ? "-" : `$${ag.cost.toLocaleString()}`}
                  </span>
                </div>
              ))}
            </>
          )}
        </SectionCard>
      </Reveal>

      {/* Advisory banner - static explanatory copy stays (violet AI accent). */}
      {agents.data && total > 0 && showInfo && (
        <div style={{ marginTop: 16, padding: "13px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
          <Icon name="shield" size={16} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
          <span>
            {watch > 0
              ? <><b style={{ color: "var(--c-ai-ink)" }}>{watch}</b> {watch === 1 ? "agent is" : "agents are"} paused or disabled for this scope. Review their recent outputs and kill-switch state in Compliance.</>
              : <>All agents are running. Every agent decision stays advisory and auditable, review recent outputs in Compliance.</>}
          </span>
          <a href="/compliance" aria-label="Investigate agents in compliance" style={{ marginLeft: "auto" }}>
            <button onClick={() => setShowInfo(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 11px", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", fontWeight: 600, borderRadius: "var(--r)", cursor: "pointer", border: "1px solid transparent", background: "var(--c-ai-tint)", color: "var(--c-ai-ink)", whiteSpace: "nowrap", lineHeight: 1 }}>
              <Icon name="eye" size={15} />Investigate
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
