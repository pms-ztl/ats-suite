"use client";
// app/(dashboard)/platform/page.tsx - VERBATIM port of the Claude Design
// super-admin platform console (claude-design/screen-platform.jsx -> TenantsScreen).
// Cross-tenant operator view: platform KPI row, the dense tenants table
// (name / plan / users / mrr / cost / runs / health / impersonate), search, and
// the impersonation safety banner. The prototype read static mocks off
// window.TENANTS / window.PLAT_KPIS; here the tenants list is wired to the real
// gateway via GET /platform/tenants through useData + the inline raw() helper.
// Real rows are mapped into the EXACT prototype row markup; loading / error /
// empty render INSIDE the table container; when the endpoint returns nothing we
// fall back to the prototype's example TENANTS rows so the dense layout always
// shows. KPI cards stay the prototype's PLAT_KPIS (static, with sparklines and
// deltas) rendered through the kit KPICard, byte-for-byte with the design.
// Search + impersonate are useState; Impersonate is a client-only no-op banner
// toggle (no platform impersonation endpoint exists to call). Palette var(--x)
// tokens are converted to their full-color var(--c-x) companions; effect/size
// tokens (--r*, --e1, --fs-*, --font-*) stay bare.
import { useState } from "react";
import { Btn, Pill, KPICard, type Kpi } from "@/components/aurora-kit";
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
  const json: any = await res.json();
  return json?.data ?? json;
}

// Plan -> accent color. Prototype used bare palette vars; converted to the
// full-color --c-* companions so they resolve to real colors.
const PLAN_T: Record<string, string> = {
  FREE: "var(--c-ink-3)",
  STARTER: "var(--c-info)",
  PROFESSIONAL: "var(--c-brand)",
  ENTERPRISE: "var(--c-ai)",
};
// Health -> [tone, background] pair (prototype HEALTH map, --c-* converted).
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
  seats?: string;
  users: number | string;
  mrr: number;
  cost: number | string;
  runs: number | string;
  health: string;
  created: string;
};

// Prototype window.PLAT_KPIS (plat-data.jsx), ported verbatim and rendered
// through the kit KPICard exactly as the design did (static, with sparklines).
const PLAT_KPIS: Kpi[] = [
  { id: "tenants", label: "Active tenants", value: 142, delta: 6, good: true, spark: [120, 124, 128, 132, 136, 138, 140, 142], icon: "building" },
  { id: "mrr", label: "Platform MRR", value: 86400, prefix: "$", delta: 4200, good: true, spark: [72, 75, 78, 80, 82, 84, 85, 86], icon: "card" },
  { id: "cost", label: "Inference cost (mo)", value: 38200, prefix: "$", delta: -1800, good: true, spark: [42, 41, 40, 39, 39, 38, 38, 38], icon: "cpu", ai: true },
  { id: "margin", label: "Gross margin", value: 56, suffix: "%", delta: 2, good: true, spark: [50, 51, 52, 53, 54, 55, 55, 56], icon: "chart" },
];

// Prototype window.TENANTS (plat-data.jsx) example rows, used as the fallback
// when the gateway returns nothing so the dense layout still renders.
const FALLBACK_TENANTS: Tenant[] = [
  { id: "t1", name: "Northwind Talent", slug: "northwind", plan: "PROFESSIONAL", seats: "12/15", users: 12, mrr: 399, cost: 284, runs: "8.4k", health: "healthy", created: "Jan 2026" },
  { id: "t2", name: "Helios Robotics", slug: "helios", plan: "STARTER", seats: "5/5", users: 5, mrr: 149, cost: 96, runs: "2.1k", health: "healthy", created: "Feb 2026" },
  { id: "t3", name: "Atlas Health Group", slug: "atlas", plan: "ENTERPRISE", seats: "240", users: 240, mrr: 4200, cost: 3180, runs: "112k", health: "watch", created: "Nov 2025" },
  { id: "t4", name: "Meridian Studio", slug: "meridian", plan: "FREE", seats: "1/1", users: 1, mrr: 0, cost: 12, runs: "180", health: "healthy", created: "May 2026" },
  { id: "t5", name: "Vertex Capital", slug: "vertex", plan: "PROFESSIONAL", seats: "14/15", users: 14, mrr: 399, cost: 410, runs: "11.2k", health: "over", created: "Mar 2026" },
  { id: "t6", name: "Quanta Bio", slug: "quanta", plan: "STARTER", seats: "3/5", users: 3, mrr: 149, cost: 64, runs: "1.4k", health: "healthy", created: "Apr 2026" },
  { id: "t7", name: "Orbital Freight", slug: "orbital", plan: "PROFESSIONAL", seats: "9/15", users: 9, mrr: 399, cost: 220, runs: "6.0k", health: "healthy", created: "Feb 2026" },
];

// Defensive mapping: the real payload may be {data:[...]} or [...] and each row
// may use a variety of field names. Coerce to the shape the table renders.
function mapTenants(res: any): Tenant[] {
  const list = Array.isArray(res) ? res
    : Array.isArray(res?.data) ? res.data
    : Array.isArray(res?.tenants) ? res.tenants
    : Array.isArray(res?.items) ? res.items
    : [];
  return list.map((t: any, i: number) => {
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

// Prototype OpHead, ported verbatim (var(--x) -> var(--c-x)).
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

  // Live rows when present, otherwise fall back to the prototype's example rows
  // so the dense table layout always renders (never sparser than the prototype).
  const fetched = tenants.data ?? [];
  const usingFallback = !tenants.loading && fetched.length === 0;
  const all = fetched.length > 0 ? fetched : FALLBACK_TENANTS;
  const rows = all.filter((t) => !q || (t.name + t.plan).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <OpHead
        title="Tenants"
        sub="142 active tenants · cross-tenant cost, usage, and health."
        right={<Btn variant="soft" icon="arrowUpRight">Export</Btn>}
      />

      {/* Platform KPI row (prototype PLAT_KPIS, rendered through KPICard) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {PLAT_KPIS.map((k, i) => <KPICard key={k.id} k={k} i={i} />)}
      </div>

      {/* Impersonation safety banner (prototype verbatim) */}
      {imp && (
        <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 28%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
          <Icon name="bolt" size={17} style={{ color: "var(--c-ai)" }} />
          <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Impersonation started for <b>{imp}</b>, a persistent safety banner now appears app-wide (switch role to Platform to see it). Auto-expires in 60:00.</span>
          <Btn variant="soft" size="sm" onClick={() => setImp(null)} style={{ marginLeft: "auto" }}>End</Btn>
        </div>
      )}

      {/* Search (prototype verbatim) */}
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

      {/* Tenants table (prototype verbatim; loading/error/empty live inside) */}
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
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-[8px]" />)}
          </div>
        )}

        {/* error -> exact layout still renders, ErrorState in the table body */}
        {!tenants.loading && tenants.error && (
          <div style={{ padding: "44px 16px" }}>
            <ErrorState
              title="Could not load tenants"
              body="The platform service did not respond. Cross-tenant cost, usage, and health appear here once it is reachable."
              code="GET /api/platform/tenants"
              onRetry={tenants.reload}
            />
          </div>
        )}

        {/* search matched nothing -> empty in the table body */}
        {!tenants.loading && !tenants.error && rows.length === 0 && (
          <div style={{ padding: "44px 16px" }}>
            <EmptyState
              title={q ? "No tenants match" : "No tenants yet"}
              body={q ? "No tenants match your search. Try a different name or plan." : "When tenants are provisioned, their plan, usage, cost, and health appear here."}
            />
          </div>
        )}

        {/* data rows (prototype row markup, verbatim) */}
        {!tenants.loading && !tenants.error && rows.map((t, i) => {
          const planTone = PLAN_T[t.plan] ?? "var(--c-ink-3)";
          const [healthTone, healthBg] = HEALTH[t.health] ?? ["var(--c-ink-3)", "var(--c-surface-3)"];
          const initials = t.name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("");
          const healthIcon = t.health === "healthy" ? "check" : t.health === "over" ? "flag" : "eye";
          return (
            <div key={t.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "11px 16px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 10, background: "color-mix(in oklab," + planTone + " 16%, var(--c-surface))", color: planTone }}>{initials}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>/{t.slug}{t.created ? " · " + t.created : ""}</div>
                </div>
              </div>
              <span style={{ fontSize: 9.5, fontWeight: 800, color: planTone, background: "color-mix(in oklab," + planTone + " 13%, transparent)", padding: "2px 7px", borderRadius: 5, justifySelf: "start" }}>{t.plan}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right" }}>{t.users}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", fontWeight: 600 }}>${(Number(t.mrr) || 0).toLocaleString()}</span>
              <span className="mono tnum" style={{ fontSize: 12.5, textAlign: "right", color: t.health === "over" ? "var(--c-danger)" : "var(--c-ink-2)" }}>${t.cost}</span>
              <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--c-ink-3)" }}>{t.runs}</span>
              <span style={{ justifySelf: "center" }}>
                <Pill tone={healthTone} bg={healthBg} icon={healthIcon} style={{ fontSize: 10 }}>{t.health}</Pill>
              </span>
              <Btn variant="outlineAi" size="sm" icon="eye" onClick={() => setImp(t.name)} style={{ justifySelf: "end" }}>Impersonate</Btn>
            </div>
          );
        })}
      </div>

      {/* When the gateway returns nothing we render the prototype's example rows
          above; this quiet note keeps the operator honest about the source. */}
      {usingFallback && !tenants.error && rows.length > 0 && (
        <p style={{ margin: "10px 2px 0", fontSize: 11, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "center" }}>
          <Icon name="building" size={12} /> Showing example tenants. Live cross-tenant data appears here once the platform service returns rows.
        </p>
      )}
    </div>
  );
}
