"use client";
// components/cd/cd-shell.tsx
// Adapter that mounts the verbatim Claude Design <Shell> (components/cd/Shell.tsx)
// as the real app chrome. It feeds the Shell our live data: the role-gated nav
// (Claude Design NAV mapped to our real routes), the signed-in user + workspace,
// a command palette derived from the nav, and live HITL + seat counts. It wires
// onNavigate to the Next router, onSignOut to our logout, and onThemeChange to
// the app's .dark class. The whole subtree is wrapped in .cd-scope so the Aurora
// tokens resolve as real colors. Page content is given its own scroll region
// because the Shell's <main> is overflow:hidden by design.
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Shell } from "./Shell";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuth } from "@/lib/auth-context";
import { useTenantBranding } from "@/hooks/use-tenant-branding";
import type { IconName } from "./icon";
import type { NavSection, RoleMeta, Workspace, ShellUser, CommandGroup, PlanUsage } from "./types";

const ALL = ["admin", "recruiter", "hiring_manager", "interviewer", "compliance_officer", "super_admin"];

type NavRow = { label: string; icon: IconName; href: string; roles: string[]; ai?: boolean; countKey?: "hitl" };
type NavGrp = { section: string | null; platform?: boolean; items: NavRow[] };

// Claude Design NAV (data.jsx) mapped to the real app routes. id = href, so
// onNavigate(id) is a direct router.push and active state matches the pathname.
const NAV: NavGrp[] = [
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
    { label: "Audit Log", icon: "scroll", href: "/audit", roles: ["admin", "compliance_officer"] },
  ] },
  { section: "Workspace", items: [
    { label: "Workspace admin", icon: "building", href: "/workspace", roles: ["admin"] },
    // "Team" lives under Settings -> Team & roles (/settings/team); removed the
    // duplicate top-level sidebar entry that pointed at the same page.
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
const ROLES: Record<string, RoleMeta> = {
  admin: { label: "Admin", short: "Admin" },
  recruiter: { label: "Recruiter", short: "Recruiter" },
  hiring_manager: { label: "Hiring Manager", short: "Hiring Mgr" },
  interviewer: { label: "Interviewer", short: "Interviewer" },
  compliance_officer: { label: "Compliance Officer", short: "Compliance" },
  super_admin: { label: "Platform Operator", short: "Platform" },
};
const PLAN_BADGE: Record<string, { tone: string; bg: string }> = {
  FREE: { tone: "var(--ink-3)", bg: "var(--surface-3)" },
  STARTER: { tone: "var(--info)", bg: "var(--info-tint)" },
  PROFESSIONAL: { tone: "var(--brand)", bg: "var(--brand-tint)" },
  ENTERPRISE: { tone: "var(--ai)", bg: "var(--ai-tint)" },
};
// Shell emits a few non-href ids (G-shortcuts + menu items); map them to routes.
const SPECIAL: Record<string, string> = {
  home: "/", candidates: "/candidates", requisitions: "/requisitions",
  analytics: "/analytics", screening: "/screening", interviews: "/interviews",
  offers: "/offers", billing: "/billing", settings: "/settings", notifications: "/settings",
};

export function CdShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { logout } = useAuth();
  const { branding } = useTenantBranding();
  const [hitl, setHitl] = useState(0);
  const [seats, setSeats] = useState<{ used: number; limit: number; unlimited: boolean } | null>(null);

  // Seed the key the Shell's useTheme reads from our current theme, BEFORE the
  // Shell's own useState initializer runs (it fires during this render pass).
  useState(() => {
    if (typeof window === "undefined") return true;
    try {
      if (!localStorage.getItem("cdc-theme")) {
        const old = localStorage.getItem("theme");
        const dark = document.documentElement.classList.contains("dark");
        localStorage.setItem("cdc-theme", old ?? (dark ? "dark" : "light"));
      }
    } catch { /* storage blocked */ }
    return true;
  });

  const role = ROLE_MAP[user?.role ?? ""] ?? "admin";
  const planName = (user?.tenant?.plan as string) ?? "FREE";
  const wsName = branding?.name ?? user?.tenant?.name ?? "CDC ATS";
  const wsInitials = wsName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "CD";
  const badge = PLAN_BADGE[planName] ?? PLAN_BADGE.FREE;

  // Live HITL pending count + seat usage (same endpoints the prior sidebar used).
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    let t: string | null = null;
    try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
    const h = { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
    fetch(`${API}/agents/hitl`, { credentials: "include", headers: h })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((res) => { const d = Array.isArray(res) ? res : res.data ?? []; setHitl(d.filter((c: { status: string }) => c.status === "PENDING").length); })
      .catch(() => {});
    fetch(`${API}/users/seats`, { credentials: "include", headers: h })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => { if (res?.data) setSeats({ used: res.data.used, limit: res.data.limit, unlimited: res.data.unlimited }); })
      .catch(() => {});
  }, []);

  // Full nav with roles kept on each item so the Shell can role-gate AND honor
  // its built-in "preview role" feature. id = href.
  const nav: NavSection[] = useMemo(() => NAV.map((g) => ({
    section: g.section ?? undefined,
    platform: g.platform,
    items: g.items.map((it) => ({
      id: it.href, label: it.label, icon: it.icon, roles: it.roles, ai: it.ai,
      count: it.countKey === "hitl" ? (hitl > 0 ? hitl : undefined) : undefined,
    })),
  })), [hitl]);

  // Active nav id = the nav href that best matches the current path.
  const activeId = useMemo(() => {
    let best = "/"; let bestLen = -1;
    for (const g of NAV) for (const it of g.items) {
      const h = it.href;
      const match = h === "/" ? pathname === "/" : (pathname === h || pathname.startsWith(h + "/"));
      if (match && h.length > bestLen) { best = h; bestLen = h.length; }
    }
    return best;
  }, [pathname]);

  // Command palette derived from the nav the user can actually see.
  const commands: CommandGroup[] = useMemo(() => {
    const vis = (its: NavSection["items"]) => its.filter((it) => !it.roles || it.roles.includes(role));
    return nav
      .map((s) => ({ group: s.section ?? "Go to", items: vis(s.items).map((it) => ({ id: it.id, label: it.label, icon: it.icon, nav: it.id, ai: it.ai })) }))
      .filter((g) => g.items.length > 0);
  }, [nav, role]);

  const planUsage: PlanUsage | undefined = seats
    ? { label: "Seats used", used: seats.used, limit: seats.unlimited ? seats.used : seats.limit }
    : undefined;

  const shellUser: ShellUser = {
    name: user?.name ?? "User",
    email: user?.email ?? "",
    initials: (user?.name ?? "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(),
    role,
  };
  const workspace: Workspace = {
    id: user?.tenantId ?? "ws",
    name: wsName,
    initials: wsInitials,
    color: "var(--brand)",
    plan: planName,
    planTone: badge.tone,
    planBg: badge.bg,
    role,
  };

  const onNavigate = (id: string) => {
    const href = id.startsWith("/") ? id : SPECIAL[id];
    if (href) router.push(href);
  };
  const onThemeChange = (t: string) => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", t === "dark");
    try { localStorage.setItem("theme", t); } catch { /* storage blocked */ }
  };
  const onSignOut = () => {
    try { document.cookie = "ats-token=; Max-Age=0; path=/"; } catch { /* no cookie access */ }
    logout();
  };

  // Full-height CD screens (own internal scroll, edge-to-edge) render full-bleed;
  // flow pages (dashboards + not-yet-swapped pages) keep the scroll + padding
  // gutter. This set grows as each full-height screen is wired onto its route.
  const FULL_BLEED = new Set(["/screening", "/candidates", "/decisions", "/offers", "/interviews", "/hitl", "/requisitions", "/analytics", "/analytics/diversity", "/billing", "/copilot", "/chat", "/security", "/ai", "/admin", "/admin/platform/agents", "/admin/platform/cost", "/admin/platform/prompts", "/admin/plan-requests", "/admin/platform/audit"]);
  // Full-height detail screens live on dynamic routes: /requisitions/<id> and
  // /requisitions/new (IntakeScreen, kept as the real-functional port). One segment
  // after /requisitions, so the /requisitions/<id>/rounds + /form-builder sub-routes
  // stay flow (padded). /candidates/<id> is the full-height CandidateProfile, but
  // /candidates/import stays a flow port.
  const fullBleed =
    FULL_BLEED.has(pathname) ||
    /^\/requisitions\/[^/]+$/.test(pathname) ||
    (/^\/candidates\/[^/]+$/.test(pathname) && pathname !== "/candidates/import");

  // Dense data routes (home dashboard, screening, analytics) dial the ambient
  // aurora WAY down so it does not compete with charts. globals.css matches
  // body:has(.cd-scope[data-dense="1"]) .aurora and drops its opacity to
  // ~.18/.22. Other routes keep the richer aurora.
  const DENSE = new Set(["/", "/screening", "/analytics"]);
  const dataDense = DENSE.has(pathname) ? "1" : undefined;

  return (
    <div className="cd-scope" data-dense={dataDense} style={{ height: "calc(100dvh / 0.9)", overflow: "hidden", background: "transparent" }}>
      <Shell
        user={shellUser}
        workspace={workspace}
        roles={ROLES}
        nav={nav}
        commands={commands}
        notifications={[]}
        planUsage={planUsage}
        activeId={activeId}
        hasUnreadNotifs={false}
        logoLight={branding?.logoUrl ?? "/assets/logo-light.png"}
        logoDark={branding?.logoUrl ?? "/assets/logo-dark.png"}
        onNavigate={onNavigate}
        onThemeChange={onThemeChange}
        onSignOut={onSignOut}
      >
        {fullBleed ? (
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>{children}</div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <div className="cd-page">{children}</div>
          </div>
        )}
      </Shell>
    </div>
  );
}
