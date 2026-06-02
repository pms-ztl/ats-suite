"use client";
// app/(dashboard)/ai/page.tsx - EXACT Claude Design "Cost analytics" platform-operator
// screen (claude-design/screen-aix.jsx PlatformCostScreen): inference spend across
// agents and tenants this month. A 4-card KPI strip, a "Spend by agent" bar list
// (8 agents, violet AI accent), and a "Top tenant spenders" bar list with an
// over-budget flag for Vertex Capital. The agent/cost data has no single gateway
// endpoint, so the prototype's exact example content is kept inline.
import { Reveal, SectionCard, KPICard, Pill, type Kpi } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

/* ---------- prototype example data (claude-design/plat-data.jsx) ---------- */
const TENANTS = [
  { id: "t1", name: "Northwind Talent", slug: "northwind", plan: "PROFESSIONAL", seats: "12/15", users: 12, mrr: 399, cost: 284, runs: "8.4k", health: "healthy", created: "Jan 2026", focus: true },
  { id: "t2", name: "Helios Robotics", slug: "helios", plan: "STARTER", seats: "5/5", users: 5, mrr: 149, cost: 96, runs: "2.1k", health: "healthy", created: "Feb 2026" },
  { id: "t3", name: "Atlas Health Group", slug: "atlas", plan: "ENTERPRISE", seats: "240", users: 240, mrr: 4200, cost: 3180, runs: "112k", health: "watch", created: "Nov 2025" },
  { id: "t4", name: "Meridian Studio", slug: "meridian", plan: "FREE", seats: "1/1", users: 1, mrr: 0, cost: 12, runs: "180", health: "healthy", created: "May 2026" },
  { id: "t5", name: "Vertex Capital", slug: "vertex", plan: "PROFESSIONAL", seats: "14/15", users: 14, mrr: 399, cost: 410, runs: "11.2k", health: "over", created: "Mar 2026" },
  { id: "t6", name: "Quanta Bio", slug: "quanta", plan: "STARTER", seats: "3/5", users: 3, mrr: 149, cost: 64, runs: "1.4k", health: "healthy", created: "Apr 2026" },
  { id: "t7", name: "Orbital Freight", slug: "orbital", plan: "PROFESSIONAL", seats: "9/15", users: 9, mrr: 399, cost: 220, runs: "6.0k", health: "healthy", created: "Feb 2026" },
];
const PLAT_KPIS: Kpi[] = [
  { id: "tenants", label: "Active tenants", value: 142, delta: 6, good: true, spark: [120, 124, 128, 132, 136, 138, 140, 142], icon: "building" },
  { id: "mrr", label: "Platform MRR", value: 86400, prefix: "$", delta: 4200, good: true, spark: [72, 75, 78, 80, 82, 84, 85, 86], icon: "card" },
  { id: "cost", label: "Inference cost (mo)", value: 38200, prefix: "$", delta: -1800, good: true, spark: [42, 41, 40, 39, 39, 38, 38, 38], icon: "cpu", ai: true },
  { id: "margin", label: "Gross margin", value: 56, suffix: "%", delta: 2, good: true, spark: [50, 51, 52, 53, 54, 55, 55, 56], icon: "chart" },
];
const PLAT_AGENTS = [
  { n: "candidate-screener", tenants: 142, runs: "1.2M", cost: 14200, status: "deployed", err: 0.4 },
  { n: "resume-parser", tenants: 142, runs: "4.8M", cost: 8600, status: "deployed", err: 0.2 },
  { n: "jd-author", tenants: 138, runs: "210k", cost: 4100, status: "deployed", err: 0.6 },
  { n: "bias-auditor", tenants: 96, runs: "64k", cost: 2800, status: "degraded", err: 2.1 },
  { n: "copilot", tenants: 120, runs: "640k", cost: 5200, status: "deployed", err: 0.5 },
  { n: "sourcing", tenants: 88, runs: "180k", cost: 3400, status: "deployed", err: 0.8 },
  { n: "offer", tenants: 110, runs: "42k", cost: 900, status: "deployed", err: 0.3 },
  { n: "scheduling", tenants: 124, runs: "320k", cost: 1600, status: "paused", err: 0.1 },
];

export default function PlatformCostScreen() {
  const agents = PLAT_AGENTS.slice().sort((a, b) => b.cost - a.cost);
  const maxC = Math.max(...agents.map((a) => a.cost));
  const tenants = TENANTS.slice().sort((a, b) => b.cost - a.cost).slice(0, 6);
  const maxT = Math.max(...tenants.map((t) => t.cost));
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Cost analytics</h1>
            <Pill icon="bolt" tone="var(--c-danger)" bg="var(--c-danger-tint)">platform operator</Pill>
          </div>
          <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>Inference spend across agents and tenants · this month.</p>
        </div>
        <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>May 2026</Pill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>{PLAT_KPIS.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <Reveal i={4}><SectionCard title="Spend by agent" icon="cpu" headRight={<Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">8 agents</Pill>}>
          {agents.map((a, i) => (
            <div key={a.n} style={{ display: "grid", gridTemplateColumns: "150px 1fr 70px", gap: 10, alignItems: "center", padding: "7px 0" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ai-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.n}</span>
              <div style={{ height: 16, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: ((a.cost / maxC) * 100) + "%", borderRadius: 6, background: "var(--c-ai)", animation: "growx 1s var(--ease-out) both", animationDelay: (i * 60) + "ms" }} /></div>
              <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right" }}>${a.cost.toLocaleString()}</span>
            </div>
          ))}
        </SectionCard></Reveal>
        <Reveal i={5}><SectionCard title="Top tenant spenders" icon="building" action="All tenants">
          {tenants.map((t, i) => (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "150px 1fr 70px", gap: 10, alignItems: "center", padding: "7px 0" }}>
              <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</span>
              <div style={{ height: 16, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: ((t.cost / maxT) * 100) + "%", borderRadius: 6, background: t.health === "over" ? "var(--c-danger)" : "var(--c-brand)", animation: "growx 1s var(--ease-out) both", animationDelay: (i * 60) + "ms" }} /></div>
              <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, textAlign: "right", color: t.health === "over" ? "var(--c-danger)" : "var(--c-ink)" }}>${t.cost}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", fontSize: 11.5, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center" }}><Icon name="flag" size={13} style={{ color: "var(--c-danger)" }} />Vertex Capital is over its inference budget ($410 vs $399 MRR).</div>
        </SectionCard></Reveal>
      </div>
    </div>
  );
}
