"use client";
// app/(dashboard)/admin/platform/agents/page.tsx - EXACT Claude Design "Aurora"
// platform agent fleet console (PlatformAgentsScreen). Every agent instance
// across all tenants with the kill-switch safety banner and the dense fleet
// table (agent + model/version, tenants, runs, cost/mo, error %, status, and a
// per-agent kill-switch toggle). Ported verbatim from
// claude-design/screen-platform.jsx (PlatformAgentsScreen) and wired to the
// real gateway via GET /platform/agents (returns { agents: [...] }). Rows are
// mapped defensively from the live payload so nothing is fabricated; on error
// or an empty/404 response the exact layout still renders with EmptyState. The
// kill-switch toggle is optimistic local state.
import { useEffect, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
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
  const json: any = await res.json();
  return json?.data ?? json;
}

// Status -> [tone, background] pair (full-color --c-* tokens; bare channels are
// Tailwind-only).
const HEALTH: Record<string, [string, string]> = {
  deployed: ["var(--c-ok)", "var(--c-ok-tint)"],
  degraded: ["var(--c-warn)", "var(--c-warn-tint)"],
  paused: ["var(--c-ink-3)", "var(--c-surface-3)"],
};

type Agent = {
  n: string;
  model: string;
  tenants: number | string;
  runs: number | string;
  cost: number;
  err: number;
  status: "deployed" | "degraded" | "paused";
};

// Defensive mapping: the real payload is { agents: [...] } but each row may use
// a variety of field names (live backend uses agentType / runs30d / costUsd30d /
// platformKillDisabled; the prototype used n / runs / cost / status). Coerce to
// the shape the fleet table renders. No fabricated agents.
function mapAgents(res: any): Agent[] {
  const arr = Array.isArray(res?.agents) ? res.agents
    : Array.isArray(res?.data) ? res.data
    : Array.isArray(res) ? res : [];
  return arr.map((a: any, i: number): Agent => {
    const name = String(a?.n ?? a?.name ?? a?.agentType ?? a?.type ?? a?.agent ?? `agent-${i + 1}`);
    const model = String(a?.model ?? a?.modelVersion ?? a?.version ?? a?.model_name ?? "");
    const tenants = a?.tenants ?? a?.tenantCount ?? a?.activeTenants ?? a?.tenantsWithKillSwitch ?? 0;
    const runs = a?.runs ?? a?.runs30d ?? a?.runCount ?? a?.totalRuns ?? 0;
    const cost = Number(a?.cost ?? a?.costUsd30d ?? a?.costUsd ?? a?.monthlyCost ?? a?.spend ?? 0) || 0;
    const err = Number(a?.err ?? a?.errorRate ?? a?.errPct ?? a?.errorPct ?? 0) || 0;
    // enabled/kill fields decide status: a disabled kill-switch means paused.
    const disabled = Boolean(a?.platformKillDisabled ?? a?.killed ?? a?.disabled ?? (a?.enabled === false));
    const status: Agent["status"] = disabled
      ? "paused"
      : a?.status === "degraded" || err > 1.5
        ? "degraded"
        : "deployed";
    return { n: name, model, tenants, runs, cost, err, status };
  });
}

function OpHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
      <div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h1>
          <Pill icon="bolt" tone="var(--c-danger)" bg="var(--c-danger-tint)">platform operator</Pill>
        </div>
        <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

export default function PlatformAgentsPage() {
  const fleet = useData<Agent[]>(() => raw("/platform/agents").then(mapAgents));

  // Optimistic local copy so the kill-switch toggle reflects instantly. Seeded
  // from the live data once it loads.
  const [agents, setAgents] = useState<Agent[]>([]);
  useEffect(() => { if (fleet.data) setAgents(fleet.data.map((a) => ({ ...a }))); }, [fleet.data]);

  const toggle = (n: string) =>
    setAgents((prev) => prev.map((a) => (a.n === n ? { ...a, status: a.status === "paused" ? "deployed" : "paused" } : a)));

  const cols = "1.5fr 90px 90px 100px 80px 120px 130px";

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <OpHead
        title="Platform agents"
        sub="Every agent instance across all tenants · deploy, pause, kill."
        right={<Btn variant="primary" icon="plus">Deploy agent</Btn>}
      />

      {/* Kill-switch safety banner */}
      <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 24%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
        <Icon name="bolt" size={16} style={{ color: "var(--c-danger)", flexShrink: 0 }} />
        <span><b style={{ color: "var(--c-danger)" }}>Kill-switch:</b> pausing an agent immediately halts it for all tenants and falls back to human-only flows. Use with care.</span>
      </div>

      {/* Fleet table */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
          <span>Agent</span>
          <span style={{ textAlign: "right" }}>Tenants</span>
          <span style={{ textAlign: "right" }}>Runs</span>
          <span style={{ textAlign: "right" }}>Cost/mo</span>
          <span style={{ textAlign: "right" }}>Err %</span>
          <span style={{ textAlign: "center" }}>Status</span>
          <span style={{ textAlign: "right" }}>Kill-switch</span>
        </div>

        {/* loading rows */}
        {fleet.loading && (
          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-[8px]" />)}
          </div>
        )}

        {/* error or empty/404 -> exact layout still renders, EmptyState in the body */}
        {!fleet.loading && agents.length === 0 && (
          <div style={{ padding: "44px 16px" }}>
            <EmptyState
              title={fleet.error ? "Could not load agents" : "No agents deployed"}
              body={
                fleet.error
                  ? "The platform service did not respond. The agent fleet will appear here once it is reachable."
                  : "When agents are deployed across tenants, their runs, cost, error rate, and kill-switch state appear here."
              }
              actions={fleet.error ? <Btn variant="soft" icon="arrowUpRight" onClick={fleet.reload}>Try again</Btn> : undefined}
            />
          </div>
        )}

        {/* data rows */}
        {!fleet.loading && agents.map((a, i) => {
          const [statusTone, statusBg] = HEALTH[a.status] ?? ["var(--c-ink-3)", "var(--c-surface-3)"];
          const statusIcon = a.status === "deployed" ? "check" : a.status === "degraded" ? "eye" : "x";
          const paused = a.status === "paused";
          return (
            <div key={a.n} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "12px 16px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", opacity: paused ? 0.6 : 1 }}>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)", flexShrink: 0 }}><Icon name="cpu" size={14} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="mono" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--c-ai-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.n}</span>
                  {a.model && <span className="mono" style={{ display: "block", fontSize: 10.5, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.model}</span>}
                </span>
              </span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right" }}>{a.tenants}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right" }}>{a.runs}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>${a.cost.toLocaleString()}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: a.err > 1.5 ? "var(--c-danger)" : "var(--c-ink-3)" }}>{a.err}</span>
              <span style={{ justifySelf: "center" }}>
                <Pill tone={statusTone} bg={statusBg} icon={statusIcon} style={{ fontSize: 10 }}>{a.status}</Pill>
              </span>
              <button
                onClick={() => toggle(a.n)}
                aria-label={paused ? `Resume ${a.n}` : `Pause ${a.n}`}
                style={{ justifySelf: "end", display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: paused ? "var(--c-brand)" : "var(--c-danger)", background: paused ? "var(--c-brand-tint)" : "var(--c-danger-tint)", color: paused ? "var(--c-brand-ink)" : "var(--c-danger)", cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}
              >
                <Icon name={paused ? "check" : "x"} size={12} />{paused ? "Resume" : "Pause"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
