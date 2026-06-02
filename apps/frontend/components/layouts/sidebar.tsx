"use client";
// components/layouts/sidebar.tsx
// EXACT Claude Design shell sidebar (claude-design/shell.jsx + data.jsx NAV):
// brand + workspace header, grouped role-gated nav with AI dots + count badges,
// active item (brand-tint + left accent), and the plan-usage footer. Wired to
// the real app: next/link + usePathname (active), usePermissions/useCurrentUser
// (role-gating + tenant), live HITL count + seat usage.
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/use-permissions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTenantBranding } from "@/hooks/use-tenant-branding";
import { Icon, Logo } from "@/components/aurora-icon";

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

type Item = { label: string; icon: string; href: string; roles: string[]; ai?: boolean; count?: number; countKey?: "hitl" };
type Group = { section: string | null; platform?: boolean; items: Item[] };

const ALL = ["admin", "recruiter", "hiring_manager", "interviewer", "compliance_officer", "super_admin"];

// Design NAV (data.jsx) mapped to the real app routes.
const NAV: Group[] = [
  { section: null, items: [
    { label: "Home", icon: "home", href: "/", roles: ALL },
  ] },
  { section: "Hiring", items: [
    { label: "Candidates", icon: "users", href: "/candidates", roles: ["admin", "recruiter", "hiring_manager"] },
    { label: "Requisitions", icon: "briefcase", href: "/requisitions", roles: ["admin", "recruiter", "hiring_manager"] },
    { label: "Sourcing", icon: "radar", href: "/sourcing", roles: ["admin", "recruiter"], ai: true },
    { label: "Screening", icon: "scan", href: "/screening", roles: ["admin", "recruiter", "hiring_manager"], ai: true },
    { label: "Interviews", icon: "calendar", href: "/interviews", roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
    { label: "Scheduling", icon: "clock", href: "/scheduling", roles: ["admin", "recruiter", "hiring_manager"] },
    { label: "Decisions", icon: "gavel", href: "/decisions", roles: ["admin", "recruiter", "hiring_manager"] },
    { label: "Offers", icon: "fileText", href: "/offers", roles: ["admin", "recruiter", "hiring_manager"] },
  ] },
  { section: "Intelligence", items: [
    { label: "Copilot", icon: "sparkles", href: "/copilot", roles: ["admin", "recruiter", "hiring_manager"], ai: true },
    { label: "Team Chat", icon: "inbox", href: "/chat", roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
    { label: "Review Queue", icon: "listChecks", href: "/hitl", roles: ["admin", "hiring_manager", "compliance_officer"], ai: true, countKey: "hitl" },
    { label: "AI Operations", icon: "cpu", href: "/ai", roles: ["admin", "compliance_officer", "super_admin"], ai: true },
    { label: "Analytics", icon: "chart", href: "/analytics", roles: ["admin", "recruiter", "hiring_manager", "compliance_officer"] },
  ] },
  { section: "Governance", items: [
    { label: "Compliance", icon: "shield", href: "/compliance", roles: ["admin", "compliance_officer"] },
    { label: "Security", icon: "shield", href: "/security", roles: ["admin", "compliance_officer"] },
    { label: "Audit Log", icon: "scroll", href: "/admin/audit", roles: ["admin", "compliance_officer"] },
  ] },
  { section: "Workspace", items: [
    { label: "Workspace admin", icon: "building", href: "/workspace", roles: ["admin"] },
    { label: "Team", icon: "userCog", href: "/settings/team", roles: ["admin"] },
    { label: "Internal Mobility", icon: "mobility", href: "/mobility", roles: ["admin", "hiring_manager"] },
    { label: "Integrations", icon: "plug", href: "/integrations", roles: ["admin", "recruiter"] },
    { label: "Billing & Plan", icon: "card", href: "/billing", roles: ["admin"] },
    { label: "Settings", icon: "settings", href: "/settings", roles: ["admin"] },
    { label: "Support", icon: "lifebuoy", href: "/support", roles: ["admin"] },
  ] },
  { section: "Platform", platform: true, items: [
    { label: "Tenants", icon: "building", href: "/admin", roles: ["super_admin"] },
    { label: "Platform Agents", icon: "server", href: "/admin/platform/agents", roles: ["super_admin"], ai: true },
    { label: "Cost Analytics", icon: "chart", href: "/admin/platform/cost", roles: ["super_admin"] },
    { label: "Agent Prompts", icon: "terminal", href: "/admin/platform/prompts", roles: ["super_admin"], ai: true },
    { label: "Plan Requests", icon: "inbox", href: "/admin/plan-requests", roles: ["super_admin"] },
    { label: "Platform Audit", icon: "scroll", href: "/admin/platform/audit", roles: ["super_admin"] },
  ] },
];

const ROLE_MAP: Record<string, string> = {
  ADMIN: "admin", RECRUITER: "recruiter", HIRING_MANAGER: "hiring_manager",
  INTERVIEWER: "interviewer", COMPLIANCE_OFFICER: "compliance_officer", SUPER_ADMIN: "super_admin",
};
const PLAN_TONE: Record<string, { tone: string; bg: string }> = {
  FREE: { tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
  STARTER: { tone: "var(--c-info)", bg: "var(--c-info-tint)" },
  PROFESSIONAL: { tone: "var(--c-brand)", bg: "var(--c-brand-tint)" },
  ENTERPRISE: { tone: "var(--c-ai)", bg: "var(--c-ai-tint)" },
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { isSuperAdmin, isTenantAdmin } = usePermissions();
  const { user } = useCurrentUser();
  const { branding } = useTenantBranding();
  const [hitl, setHitl] = useState(0);
  const [seats, setSeats] = useState<{ used: number; limit: number; unlimited: boolean } | null>(null);

  const role = ROLE_MAP[user?.role ?? ""] ?? "admin";
  const planName = user?.tenant?.plan ?? "FREE";
  const plan = PLAN_TONE[planName] ?? PLAN_TONE.FREE;
  const wsName = branding?.name ?? user?.tenant?.name ?? "CDC ATS";
  const wsInitials = wsName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "CD";

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    let t: string | null = null;
    try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
    const h = { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
    fetch(`${API}/agents/hitl`, { credentials: "include", headers: h })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => { const d = Array.isArray(res) ? res : res.data ?? []; setHitl(d.filter((c: { status: string }) => c.status === "PENDING").length); })
      .catch(() => {});
    if (isTenantAdmin) {
      fetch(`${API}/users/seats`, { credentials: "include", headers: h })
        .then((r) => (r.ok ? r.json() : null))
        .then((res) => { if (res?.data) setSeats({ used: res.data.used, limit: res.data.limit, unlimited: res.data.unlimited }); })
        .catch(() => {});
    }
  }, [isTenantAdmin]);

  const visible = NAV
    .map((g) => ({ ...g, items: g.items.filter((it) => it.roles.includes(role) || (it.roles.includes("super_admin") && isSuperAdmin)) }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const seatPct = seats && !seats.unlimited && seats.limit > 0 ? Math.min(100, Math.round((seats.used / seats.limit) * 100)) : 64;

  return (
    <aside
      className={cn("fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r transition-[width] duration-300", collapsed ? "w-16" : "w-64")}
      style={{ borderColor: "var(--c-line)", background: "color-mix(in oklab, var(--c-surface) 70%, transparent)", backdropFilter: "blur(10px)" }}
    >
      {/* brand + workspace */}
      <div style={{ padding: collapsed ? "14px 12px 10px" : "14px 14px 10px" }}>
        <Link href="/" className="mb-3 flex items-center gap-2" style={{ justifyContent: collapsed ? "center" : "flex-start", paddingLeft: collapsed ? 0 : 3 }}>
          {collapsed ? <Logo size={26} /> : (
            branding?.logoUrl
              ? <img src={branding.logoUrl} alt={wsName} style={{ height: 24, width: "auto", display: "block" }} />
              : <><Logo size={24} /><span style={{ fontSize: 14, fontWeight: 700, color: "var(--c-ink)" }}>CDC <span style={{ color: "var(--c-ink-3)", fontWeight: 500 }}>ATS</span></span></>
          )}
        </Link>
        {/* workspace header */}
        <div className="flex w-full items-center gap-2.5 rounded-[var(--r-lg)] p-[8px_9px]" style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
          <div className="mono grid shrink-0 place-items-center" style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", background: "color-mix(in oklab, var(--c-brand) 16%, var(--c-surface))", color: "var(--c-brand)", fontWeight: 700, fontSize: 13, border: "1px solid color-mix(in oklab, var(--c-brand) 24%, transparent)" }}>{wsInitials}</div>
          {!collapsed && (
            <div className="min-w-0 flex-1 text-left">
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--c-ink)" }}>{wsName}</div>
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: ".05em", color: plan.tone, background: plan.bg, padding: "1px 6px", borderRadius: 5 }}>{planName}</span>
            </div>
          )}
        </div>
      </div>

      {/* nav */}
      <nav className="scrollbar-thin flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden" style={{ padding: collapsed ? "4px 12px 16px" : "4px 10px 16px" }}>
        {visible.map((g, gi) => (
          <div key={gi} style={{ marginTop: g.section ? 14 : 2 }}>
            {g.section && !collapsed && (
              <div className="flex items-center gap-1.5 px-2.5 pb-1.5" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: g.platform ? "var(--c-danger)" : "var(--c-ink-3)" }}>
                {g.platform && <Icon name="bolt" size={11} />} {g.section}
              </div>
            )}
            {g.section && collapsed && <div style={{ height: 1, background: "var(--c-line)", margin: "10px 6px" }} />}
            {g.items.map((it) => {
              const on = isActive(it.href);
              const count = it.countKey === "hitl" ? (hitl > 0 ? hitl : undefined) : it.count;
              return (
                <Link key={it.href} href={it.href} title={collapsed ? it.label : undefined}
                  className="relative mb-px flex items-center rounded-[var(--r)] transition-colors"
                  style={{ gap: 11, padding: collapsed ? "9px 0" : "8px 10px", justifyContent: collapsed ? "center" : "flex-start",
                    background: on ? "var(--c-brand-tint)" : "transparent", color: on ? "var(--c-brand-ink)" : "var(--c-ink-2)", fontWeight: on ? 700 : 500, fontSize: "var(--fs-sm)" }}>
                  {on && !collapsed && <span aria-hidden style={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 3, background: "var(--c-brand)" }} />}
                  <span className="relative shrink-0" style={{ color: on ? "var(--c-brand)" : "var(--c-ink-3)" }}>
                    <Icon name={it.icon} size={18} stroke={on ? 2 : 1.7} />
                    {it.ai && <span aria-hidden style={{ position: "absolute", top: -2, right: -3, width: 6, height: 6, borderRadius: 99, background: "var(--c-ai)", boxShadow: "0 0 0 2px var(--c-surface)" }} />}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 whitespace-nowrap text-left">{it.label}</span>
                      {count != null && <span className="mono tnum" style={{ fontSize: 11, fontWeight: 600, color: on ? "var(--c-brand)" : "var(--c-ink-3)", background: on ? "var(--c-surface)" : "var(--c-surface-2)", padding: "1px 7px", borderRadius: 99 }}>{count}</span>}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* plan usage footer */}
      {!collapsed && (
        <div style={{ padding: 12, borderTop: "1px solid var(--c-line)" }}>
          <div style={{ background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)", padding: "11px 12px" }}>
            <div className="mb-[7px] flex items-center justify-between">
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--c-ink-2)" }}>{seats ? "Seats used" : "Plan"}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{seats ? `${seats.used} / ${seats.unlimited ? "∞" : seats.limit}` : planName}</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${seatPct}%`, borderRadius: 99, background: "linear-gradient(90deg, var(--c-brand-2), var(--c-brand))" }} />
            </div>
            <Link href="/billing" className="mt-[9px] block w-full rounded-[var(--r-sm)] text-center" style={{ padding: "6px", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontWeight: 600, fontSize: 11.5 }}>Upgrade plan</Link>
          </div>
        </div>
      )}

      {/* collapse toggle */}
      <button onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center gap-3 border-t" style={{ padding: collapsed ? "12px 0" : "12px 16px", justifyContent: collapsed ? "center" : "flex-start", borderColor: "var(--c-line)", color: "var(--c-ink-3)", background: "transparent" }}>
        <Icon name="chevsL" size={17} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
        {!collapsed && <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>Collapse</span>}
      </button>
    </aside>
  );
}
