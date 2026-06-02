"use client";
// app/(dashboard)/admin/platform/agents/page.tsx - EXACT Claude Design "Aurora"
// platform-agents fleet console (PlatformAgentsScreen). Every agent instance
// across all tenants with model, status/enabled, kill-switch, runs, cost, and
// version. Ported verbatim in layout from claude-design/screen-platform.jsx
// (PlatformAgentsScreen) and wired to the real gateway via GET /platform/agents.
// The response is coerced from {data:{agents:[...]}} or a bare {agents:[...]};
// each row is mapped defensively (name, model, enabled, runs, cost, version).
// On error or an empty/404 response the exact layout still renders, with the
// kill-switch banner and an EmptyState in the table body. Nothing is fabricated.
import { useState } from "react";
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
  return res.json();
}

// Status -> [tone, background] pair (full-color --c-* tokens; bare channels are
// Tailwind-only). Mirrors the prototype's HEALTH map.
const HEALTH: Record<string, [string, string]> = {
  healthy: ["var(--c-ok)", "var(--c-ok-tint)"],
  watch: ["var(--c-warn)", "var(--c-warn-tint)"],
  over: ["var(--c-danger)", "var(--c-danger-tint)"],
  degraded: ["var(--c-warn)", "var(--c-warn-tint)"],
  paused: ["var(--c-ink-3)", "var(--c-surface-3)"],
  deployed: ["var(--c-ok)", "var(--c-ok-tint)"],
};

type Agent = {
  id: string;
  n: string;       // agent name / type (mono)
  model: string;   // model name, defensive (may be absent on the payload)
  tenants: number | string;
  runs: number | string;
  cost: number;
  err: number;
  status: string;  // deployed | degraded | paused, derived from enabled/kill
  version: string; // version label, defensive (may be absent on the payload)
};

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

// Defensive mapping: the real payload may be {data:{agents:[...]}} or a bare
// {agents:[...]} (or {data:[...]} / [...]). Coerce to the row shape, deriving
// status from the kill/enabled fields and pulling model/version when present.
function mapAgents(res: any): Agent[] {
  const root = res?.data ?? res;
  const arr = Array.isArray(root?.agents) ? root.agents
    : Array.isArray(root?.data) ? root.data
    : Array.isArray(root) ? root
    : [];
  return arr.map((a: any, i: number) => {
    const n = String(a?.n ?? a?.agentType ?? a?.name ?? a?.type ?? a?.key ?? `agent-${i + 1}`);
    const killed = Boolean(a?.platformKillDisabled ?? a?.killed ?? a?.disabled ?? a?.kill) ||
      a?.enabled === false;
    const errRaw = a?.err ?? a?.errorRate ?? a?.errPct ?? a?.errorPct ?? 0;
    const err = Math.round((Number(errRaw) || 0) * 10) / 10;
    // Status: explicit value wins; otherwise derive from enabled/kill + err.
    let status = String(a?.status ?? "").toLowerCase();
    if (!(status in HEALTH)) status = killed ? "paused" : err > 1.5 ? "degraded" : "deployed";
    return {
      id: String(a?.id ?? a?.agentType ?? n ?? i),
      n,
      model: String(a?.model ?? a?.modelName ?? a?.model_id ?? a?.engine ?? ""),
      tenants: a?.tenants ?? a?.tenantCount ?? a?.tenantsWithKillSwitch ?? a?.deployments ?? 0,
      runs: a?.runs ?? a?.runs30d ?? a?.runCount ?? a?.totalRuns ?? 0,
      cost: Number(a?.cost ?? a?.costUsd30d ?? a?.costUsd ?? a?.spend ?? 0) || 0,
      err,
      status,
      version: String(a?.version ?? a?.ver ?? a?.promptVersion ?? ""),
    };
  });
}

const fmtCost = (n: number) => "$" + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PlatformAgentsPage() {
  const agents = useData<Agent[]>(() => raw("/platform/agents").then(mapAgents));
  // Local optimistic kill-switch toggle, mirrors the prototype's Pause/Resume.
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const toggle = (id: string, cur: string) =>
    setOverrides((o) => ({ ...o, [id]: (o[id] ?? cur) === "paused" ? "deployed" : "paused" }));

  const cols = "1.5fr 90px 90px 100px 80px 120px 130px";

  const rows = (agents.data ?? []).map((a) => ({ ...a, status: overrides[a.id] ?? a.status }));

  const subCopy = agents.data
    ? `${rows.length} ${rows.length === 1 ? "agent" : "agents"} across all tenants. Deploy, pause, kill.`
    : "Every agent instance across all tenants. Deploy, pause, kill.";

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <OpHead
        title="Platform agents"
        sub={subCopy}
        right={<Btn variant="primary" icon="plus">Deploy agent</Btn>}
      />

      {/* Kill-switch safety banner */}
      <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 24%, transparent)", display: "flex", gap: 10, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
        <Icon name="bolt" size={16} style={{ color: "var(--c-danger)", flexShrink: 0 }} />
        <span><b style={{ color: "var(--c-danger)" }}>Kill-switch:</b> pausing an agent immediately halts it for all tenants and falls back to human-only flows. Use with care.</span>
      </div>

      {/* Agent fleet table */}
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
        {agents.loading && (
          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-[8px]" />)}
          </div>
        )}

        {/* error or empty/404 -> exact layout still renders, EmptyState in the body */}
        {!agents.loading && rows.length === 0 && (
          <div style={{ padding: "44px 16px" }}>
            <EmptyState
              title={agents.error ? "Could not load agents" : "No agents deployed"}
              body={
                agents.error
                  ? "The platform service did not respond. The agent fleet will appear here once it is reachable."
                  : "When agents are deployed, their model, status, runs, cost, and version appear here."
              }
              actions={agents.error ? <Btn variant="soft" icon="arrowUpRight" onClick={agents.reload}>Try again</Btn> : undefined}
            />
          </div>
        )}

        {/* data rows */}
        {!agents.loading && rows.map((a, i) => {
          const [statusTone, statusBg] = HEALTH[a.status] ?? ["var(--c-ink-3)", "var(--c-surface-3)"];
          const statusIcon = a.status === "deployed" ? "check" : a.status === "degraded" ? "eye" : "x";
          const paused = a.status === "paused";
          return (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "12px 16px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", opacity: paused ? 0.6 : 1 }}>
              <span style={{ display: "inline-flex", gap: 8, alignItems: "center", minWidth: 0 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)", flexShrink: 0 }}><Icon name="cpu" size={14} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="mono" style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "var(--c-ai-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.n}</span>
                  {(a.model || a.version) && (
                    <span className="mono" style={{ display: "block", fontSize: 10, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.model}{a.model && a.version ? " · " : ""}{a.version}
                    </span>
                  )}
                </span>
              </span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right" }}>{a.tenants}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right" }}>{a.runs}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>{fmtCost(a.cost)}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: a.err > 1.5 ? "var(--c-danger)" : "var(--c-ink-3)" }}>{a.err}</span>
              <span style={{ justifySelf: "center" }}>
                <Pill tone={statusTone} bg={statusBg} icon={statusIcon} style={{ fontSize: 10 }}>{a.status}</Pill>
              </span>
              <button
                onClick={() => toggle(a.id, a.status)}
                aria-label={paused ? `Resume ${a.n}` : `Pause ${a.n}`}
                style={{ justifySelf: "end", display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 11px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: paused ? "var(--c-brand)" : "var(--c-danger)", background: paused ? "var(--c-brand-tint)" : "var(--c-danger-tint)", color: paused ? "var(--c-brand-ink)" : "var(--c-danger)", cursor: "pointer", fontSize: 11.5, fontWeight: 700, fontFamily: "var(--font-sans)" }}
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
