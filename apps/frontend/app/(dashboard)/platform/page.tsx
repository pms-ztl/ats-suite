"use client";
// app/(dashboard)/platform/page.tsx - EXACT Claude Design "Aurora" platform
// operator console (TenantsScreen). Cross-tenant overview with plan pills,
// usage, MRR, cost, runs, and health. Ported from
// claude-design/screen-platform.jsx (TenantsScreen) and wired to the real
// gateway via GET /platform/tenants. KPI cards are derived from the live tenant
// rows (count, MRR, cost) so nothing is fabricated; on error or an empty/404
// response the exact layout still renders with EmptyState.
import { useState } from "react";
import { Btn, Pill, KPICard, type Kpi } from "@/components/aurora-kit";
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

// Plan -> accent color (full-color --c-* tokens; bare channels are Tailwind-only).
const PLAN_T: Record<string, string> = {
  FREE: "var(--c-ink-3)",
  STARTER: "var(--c-info)",
  PROFESSIONAL: "var(--c-brand)",
  ENTERPRISE: "var(--c-ai)",
};
// Health -> [tone, background] pair.
const HEALTH: Record<string, [string, string]> = {
  healthy: ["var(--c-ok)", "var(--c-ok-tint)"],
  watch: ["var(--c-warn)", "var(--c-warn-tint)"],
  over: ["var(--c-danger)", "var(--c-danger-tint)"],
  degraded: ["var(--c-warn)", "var(--c-warn-tint)"],
  paused: ["var(--c-ink-3)", "var(--c-surface-3)"],
  deployed: ["var(--c-ok)", "var(--c-ok-tint)"],
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  users: number | string;
  mrr: number;
  cost: number | string;
  runs: number | string;
  health: string;
  created: string;
};

// Defensive mapping: the real payload may be {data:[...]} or [...] and each row
// may use a variety of field names. Coerce to the shape the table renders.
function mapTenants(res: any): Tenant[] {
  const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return arr.map((t: any, i: number) => {
    const name = String(t?.name ?? t?.tenantName ?? t?.companyName ?? t?.title ?? `Tenant ${i + 1}`);
    const slug = String(t?.slug ?? t?.subdomain ?? t?.key ?? name.toLowerCase().replace(/\s+/g, "-"));
    const plan = String(t?.plan ?? t?.tier ?? t?.subscription?.plan ?? "FREE").toUpperCase();
    const seatsUsed = t?.seatsUsed ?? t?.usedSeats ?? t?.activeUsers;
    const users = t?.users ?? t?.userCount ?? t?.seats ?? seatsUsed ?? t?.memberCount ?? 0;
    const created = String(t?.created ?? t?.createdAtLabel ??
      (t?.createdAt ? new Date(t.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : ""));
    return {
      id: String(t?.id ?? t?.tenantId ?? slug ?? i),
      name,
      slug,
      plan: plan in PLAN_T ? plan : "FREE",
      users,
      mrr: Number(t?.mrr ?? t?.monthlyRevenue ?? t?.revenue ?? 0) || 0,
      cost: t?.cost ?? t?.inferenceCost ?? t?.spend ?? 0,
      runs: t?.runs ?? t?.agentRuns ?? t?.runCount ?? 0,
      health: String(t?.health ?? t?.status ?? "healthy").toLowerCase(),
      created,
    };
  });
}

const fmtMoney = (n: number) => "$" + Math.round(n).toLocaleString();

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

export default function PlatformPage() {
  const tenants = useData<Tenant[]>(() => raw("/platform/tenants").then(mapTenants));
  const [q, setQ] = useState("");
  const [imp, setImp] = useState<string | null>(null);

  const cols = "1.8fr 110px 80px 90px 90px 90px 100px 110px";

  const all = tenants.data ?? [];
  const rows = all.filter((t) => !q || (t.name + t.plan).toLowerCase().includes(q.toLowerCase()));

  // KPI aggregates derived from the live rows, never fabricated.
  const activeCount = all.length;
  const totalMrr = all.reduce((s, t) => s + (Number(t.mrr) || 0), 0);
  const totalCost = all.reduce((s, t) => s + (Number(t.cost) || 0), 0);
  const margin = totalMrr > 0 ? Math.round(((totalMrr - totalCost) / totalMrr) * 100) : 0;
  const kpis: Kpi[] = [
    { id: "tenants", label: "Active tenants", value: activeCount, delta: 0, good: true, spark: [activeCount], icon: "building" },
    { id: "mrr", label: "Platform MRR", value: totalMrr, prefix: "$", delta: 0, good: true, spark: [totalMrr], icon: "card" },
    { id: "cost", label: "Inference cost (mo)", value: Math.round(totalCost), prefix: "$", delta: 0, good: true, spark: [Math.round(totalCost)], icon: "cpu", ai: true },
    { id: "margin", label: "Gross margin", value: margin, suffix: "%", delta: 0, good: true, spark: [margin], icon: "chart" },
  ];

  const subCopy = tenants.data
    ? `${activeCount} active ${activeCount === 1 ? "tenant" : "tenants"} · cross-tenant cost, usage, and health.`
    : "Cross-tenant cost, usage, and health.";

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <OpHead
        title="Tenants"
        sub={subCopy}
        right={<Btn variant="soft" icon="arrowUpRight">Export</Btn>}
      />

      {/* KPI row, derived from live tenants once loaded */}
      {tenants.loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        </div>
      )}
      {tenants.data && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {kpis.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
        </div>
      )}

      {/* Impersonation safety banner */}
      {imp && (
        <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 28%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
          <Icon name="bolt" size={17} style={{ color: "var(--c-ai)" }} />
          <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
            Impersonation started for <b>{imp}</b>, a persistent safety banner now appears app-wide. Auto-expires in 60:00.
          </span>
          <Btn variant="soft" size="sm" onClick={() => setImp(null)} style={{ marginLeft: "auto" }}>End</Btn>
        </div>
      )}

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 12px", height: 36, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", maxWidth: 300 }}>
        <Icon name="search" size={15} style={{ color: "var(--c-ink-3)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tenants..."
          aria-label="Search tenants"
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}
        />
      </div>

      {/* Tenant table */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
          <span>Tenant</span>
          <span>Plan</span>
          <span style={{ textAlign: "right" }}>Users</span>
          <span style={{ textAlign: "right" }}>MRR</span>
          <span style={{ textAlign: "right" }}>Cost</span>
          <span style={{ textAlign: "right" }}>Runs</span>
          <span style={{ textAlign: "center" }}>Health</span>
          <span></span>
        </div>

        {/* loading rows */}
        {tenants.loading && (
          <div style={{ padding: 16, display: "grid", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-[8px]" />)}
          </div>
        )}

        {/* error or empty/404 -> exact layout still renders, EmptyState in the body */}
        {!tenants.loading && rows.length === 0 && (
          <div style={{ padding: "44px 16px" }}>
            <EmptyState
              title={tenants.error ? "Could not load tenants" : q ? "No tenants match" : "No tenants yet"}
              body={
                tenants.error
                  ? "The platform service did not respond. Tenant overview will appear here once it is reachable."
                  : q
                    ? "No tenants match your search. Try a different name or plan."
                    : "When tenants are provisioned, their plan, usage, cost, and health appear here."
              }
              actions={tenants.error ? <Btn variant="soft" icon="arrowUpRight" onClick={tenants.reload}>Try again</Btn> : undefined}
            />
          </div>
        )}

        {/* data rows */}
        {!tenants.loading && rows.map((t, i) => {
          const planTone = PLAN_T[t.plan] ?? "var(--c-ink-3)";
          const [healthTone, healthBg] = HEALTH[t.health] ?? ["var(--c-ink-3)", "var(--c-surface-3)"];
          const initials = t.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("");
          const healthIcon = t.health === "healthy" ? "check" : t.health === "over" ? "flag" : "eye";
          return (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "11px 16px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 10, background: `color-mix(in oklab, ${planTone} 16%, var(--c-surface))`, color: planTone }}>{initials}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>/{t.slug}{t.created ? ` · ${t.created}` : ""}</div>
                </div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: planTone, background: `color-mix(in oklab, ${planTone} 13%, transparent)`, padding: "2px 7px", borderRadius: 5, justifySelf: "start" }}>{t.plan}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right" }}>{t.users}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>{fmtMoney(Number(t.mrr) || 0)}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", color: t.health === "over" ? "var(--c-danger)" : "var(--c-ink-2)" }}>{fmtMoney(Number(t.cost) || 0)}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--c-ink-3)" }}>{t.runs}</span>
              <span style={{ justifySelf: "center" }}>
                <Pill tone={healthTone} bg={healthBg} icon={healthIcon} style={{ fontSize: 10 }}>{t.health}</Pill>
              </span>
              <Btn variant="outlineAi" size="sm" icon="eye" onClick={() => setImp(t.name)} style={{ justifySelf: "end" }}>Impersonate</Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}
