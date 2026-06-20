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
import { useModules } from "@/hooks/use-modules";
import { brandRamp } from "@/lib/theme/brand-ramp";
import type { IconName } from "./icon";
import type { NavSection, RoleMeta, Workspace, ShellUser, CommandGroup, PlanUsage } from "./types";

const ALL = ["admin", "recruiter", "hiring_manager", "interviewer", "compliance_officer", "super_admin"];

// A valid 3- or 6-digit hex is the ONLY trigger for tenant theming. Anything else
// (null, empty, a CSS keyword, garbage) leaves the .cd-scope emerald defaults from
// cd-tokens.css untouched -> tenants without a brand color are byte-identical.
function isHex(hex: string | null | undefined): hex is string {
  return !!hex && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex);
}

// The six brand-family token keys brandRamp() produces (bare "L C H" channels).
// We emit each in BOTH forms cd-tokens.css uses inside .cd-scope: the FULL-color
// `--brand*` (oklch(...)) the kit reads via var(--brand), and the `--c-brand*`
// full-color companions the kit reads via var(--c-brand). The global :root sets
// --c-brand = oklch(var(--brand)) which DOUBLE-WRAPS inside .cd-scope (where
// --brand is already a full color), so we redefine the --c-* brand family to the
// resolved full color directly here, on the same scope.
const BRAND_KEYS = [
  "--brand", "--brand-2", "--brand-ink", "--brand-tint", "--brand-tint-2", "--on-brand",
] as const;

// Build the scoped <style> body that re-skins the whole logged-in app from one
// tenant brand hex. brandRamp() returns the full Aurora token family as bare
// oklch channels for the LIGHT (.cd-scope) and DARK (.dark .cd-scope) themes; we
// wrap each channel set as a full oklch(...) color (the form cd-tokens.css uses
// inside .cd-scope) and also redefine the matching --c-brand* companion so both
// the `var(--brand)` and `var(--c-brand)` consumers across the kit resolve to the
// tenant color. The selectors are keyed by a per-shell data attribute so the
// override is scoped to THIS shell (and inherits down to any nested .cd-scope,
// e.g. /chat, via custom-property inheritance) without touching the global
// emerald defaults. Respecting colorMode is automatic: the .dark class on
// <html> selects the dark block exactly as the design's own tokens do.
function buildBrandStyle(hex: string, scopeId: string): string {
  const ramp = brandRamp(hex);
  const decls = (side: Record<string, string>): string =>
    BRAND_KEYS.map((k) => {
      const color = `oklch(${side[k]})`;
      // --brand*  : the bare full-color token the kit reads via var(--brand).
      // --c-brand*: the full-color companion the kit reads via var(--c-brand).
      const cKey = k.replace(/^--/, "--c-");
      return `${k}:${color};${cKey}:${color};`;
    }).join("");
  const sel = `.cd-scope[data-cd-brand="${scopeId}"]`;
  return `${sel}{${decls(ramp.light)}}\n.dark ${sel}{${decls(ramp.dark)}}`;
}

// WF9 / SLICE I3 — a NavRow may now declare the registry module key that OWNS it
// (`module`). The shell resolves the tenant's enabled-module set (use-modules ->
// GET /api/me/modules) and:
//   - a row with NO module key behaves exactly as before (always shown to its roles);
//   - a row whose module is ENABLED (or whose gating is unresolved) shows normally;
//   - a row whose module is PLAN-LOCKED (reason PLAN_LIMIT) stays visible with a
//     padlock "Upgrade" affordance instead of hiding it / routing to a dead 402;
//   - a row whose module is otherwise DISABLED for the tenant is hidden.
// Default-enabled modules are never disabled out of the box, so v1 is unaffected.
type NavRow = { label: string; icon: IconName; href: string; roles: string[]; ai?: boolean; countKey?: "hitl"; module?: string };
type NavGrp = { section: string | null; platform?: boolean; items: NavRow[] };

// Claude Design NAV (data.jsx) mapped to the real app routes. id = href, so
// onNavigate(id) is a direct router.push and active state matches the pathname.
const NAV: NavGrp[] = [
  { section: null, items: [
    { label: "Home", icon: "home", href: "/", roles: ALL },
  ] },
  { section: "Hiring", items: [
    { label: "Candidates", icon: "users", href: "/candidates", roles: ["admin", "recruiter", "hiring_manager"], module: "core-hiring" },
    { label: "Requisitions", icon: "briefcase", href: "/requisitions", roles: ["admin", "recruiter", "hiring_manager"], module: "core-hiring" },
    { label: "Sourcing", icon: "radar", href: "/sourcing", roles: ["admin", "recruiter"], ai: true, module: "ai-sourcing" },
    { label: "Screening", icon: "scan", href: "/screening", roles: ["admin", "recruiter", "hiring_manager"], ai: true, module: "ai-screening" },
    { label: "Assessments", icon: "listChecks", href: "/assessments", roles: ["admin", "recruiter", "hiring_manager"], module: "oa-assessments" },
    { label: "Interviews", icon: "calendar", href: "/interviews", roles: ["admin", "recruiter", "hiring_manager", "interviewer"], module: "interviews" },
    { label: "Scheduling", icon: "clock", href: "/scheduling", roles: ["admin", "recruiter", "hiring_manager"], module: "scheduling" },
    { label: "Decisions", icon: "gavel", href: "/decisions", roles: ["admin", "recruiter", "hiring_manager"], module: "core-hiring" },
    { label: "Offers", icon: "fileText", href: "/offers", roles: ["admin", "recruiter", "hiring_manager"], module: "offers" },
  ] },
  { section: "Intelligence", items: [
    { label: "Copilot", icon: "sparkles", href: "/copilot", roles: ["admin", "recruiter", "hiring_manager"], ai: true, module: "copilot" },
    { label: "Team Chat", icon: "inbox", href: "/chat", roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
    { label: "Review Queue", icon: "listChecks", href: "/hitl", roles: ["admin", "hiring_manager", "compliance_officer"], ai: true, countKey: "hitl", module: "review-queue" },
    { label: "AI Operations", icon: "cpu", href: "/ai", roles: ["admin", "compliance_officer", "super_admin"], ai: true },
    { label: "Analytics", icon: "chart", href: "/analytics", roles: ["admin", "recruiter", "hiring_manager", "compliance_officer"], module: "analytics" },
  ] },
  { section: "Governance", items: [
    { label: "Compliance", icon: "shield", href: "/compliance", roles: ["admin", "compliance_officer"], module: "compliance" },
    { label: "Security", icon: "shield", href: "/security", roles: ["admin", "compliance_officer"] },
    { label: "Audit Log", icon: "scroll", href: "/audit", roles: ["admin", "compliance_officer"] },
  ] },
  { section: "Workspace", items: [
    { label: "Workspace admin", icon: "building", href: "/workspace", roles: ["admin"] },
    // "Team" lives under Settings -> Team & roles (/settings/team); removed the
    // duplicate top-level sidebar entry that pointed at the same page.
    { label: "Internal Mobility", icon: "mobility", href: "/mobility", roles: ["admin", "hiring_manager"] },
    { label: "Integrations", icon: "plug", href: "/integrations", roles: ["admin", "recruiter"] },
    { label: "Billing & Plan", icon: "card", href: "/billing", roles: ["admin"], module: "billing" },
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
  // WF9 / SLICE I3 — resolved enabled-module set for the tenant. Fails SOFT
  // (allEnabled) when /api/me/modules is absent/errored, so a missing module
  // surface never hides a feature the user already has (v1 unaffected).
  const modules = useModules();
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

  // WF9 / SLICE I3 — resolve a single NavRow's module gating decision:
  //   "show" — no module key, gating unresolved (fail soft), or module enabled;
  //   "lock" — module is PLAN-LOCKED (reason PLAN_LIMIT): keep visible w/ upgrade;
  //   "hide" — module is otherwise disabled for this tenant.
  // Default-enabled modules are never disabled out of the box, so an item tagged
  // with a default-enabled module behaves byte-identically to v1.
  const moduleDecision = React.useCallback(
    (key: string | undefined): "show" | "lock" | "hide" => {
      if (!key) return "show";
      if (modules.allEnabled) return "show"; // gating unresolved -> fail soft
      if (modules.enabledKeys?.includes(key)) return "show";
      // Not enabled. Distinguish a plan-lock (upgrade affordance) from a hard
      // disable (hide). The per-module reason lives on modules.modules.
      const row = modules.modules?.find((m) => m.key === key);
      return row?.reason === "PLAN_LIMIT" ? "lock" : "hide";
    },
    [modules.allEnabled, modules.enabledKeys, modules.modules],
  );

  // Full nav with roles kept on each item so the Shell can role-gate AND honor
  // its built-in "preview role" feature. id = href. Items whose owning module is
  // hard-disabled are dropped; plan-locked items stay with a `lock` affordance.
  const nav: NavSection[] = useMemo(() => NAV.map((g) => ({
    section: g.section ?? undefined,
    platform: g.platform,
    items: g.items
      .map((it) => ({ it, decision: moduleDecision(it.module) }))
      .filter(({ decision }) => decision !== "hide")
      .map(({ it, decision }) => ({
        id: it.href, label: it.label, icon: it.icon, roles: it.roles, ai: it.ai,
        count: it.countKey === "hitl" ? (hitl > 0 ? hitl : undefined) : undefined,
        lock: decision === "lock" || undefined,
      })),
  })), [hitl, moduleDecision]);

  // WF9 / SLICE I3 — the set of nav hrefs that are PLAN-LOCKED right now, so a
  // click routes to the upgrade path (/billing) instead of the dead 402 route.
  const lockedHrefs = useMemo(() => {
    const s = new Set<string>();
    for (const g of NAV) for (const it of g.items) {
      if (moduleDecision(it.module) === "lock") s.add(it.href);
    }
    return s;
  }, [moduleDecision]);

  // WF9 / SLICE I3 — publish the set of NON-default-enabled modules that are
  // explicitly DISABLED for this tenant (hard-disabled, not plan-locked) to a
  // lightweight cookie the edge middleware reads to 404 their routes. Only
  // non-default modules can land here (a default-enabled module is never disabled
  // out of the box), so the cookie is empty for a v1 tenant -> the middleware is
  // a no-op and v1 is byte-identical. We write only the keys whose decision is
  // "hide" AND whose manifest is non-default (the registry's non-default set is
  // small + stable; encoded inline to keep @cdc-ats/common out of the edge bundle).
  useEffect(() => {
    if (typeof document === "undefined") return;
    // Gating unresolved -> clear any stale value so we never fail closed on a blip.
    if (modules.allEnabled || !modules.modules) {
      try { document.cookie = "ats-modules-off=; Max-Age=0; path=/; SameSite=Lax"; } catch {}
      return;
    }
    // Registry modules that are defaultEnabled:false AND own a frontend route.
    // (oa-assessments -> /assessments; custom-dashboards/white-label-embed own no
    // standalone gated nav route today but are listed so the middleware can guard
    // them if/when they get one. Kept in sync with @cdc-ats/common registry.)
    const NON_DEFAULT = new Set(["oa-assessments", "custom-dashboards", "white-label-embed"]);
    const off = modules.modules
      .filter((m) => !m.enabled && m.reason !== "PLAN_LIMIT" && NON_DEFAULT.has(m.key))
      .map((m) => m.key);
    try {
      if (off.length) {
        document.cookie = `ats-modules-off=${encodeURIComponent(off.join(","))}; path=/; SameSite=Lax`;
      } else {
        document.cookie = "ats-modules-off=; Max-Age=0; path=/; SameSite=Lax";
      }
    } catch { /* cookies blocked -> middleware simply stays a no-op */ }
  }, [modules.allEnabled, modules.modules]);

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
    if (!href) return;
    // WF9 / SLICE I3 — a plan-locked nav item routes to the upgrade path instead
    // of its own (gated) route, so a click never lands on a dead 402.
    if (lockedHrefs.has(href)) { router.push("/billing"); return; }
    router.push(href);
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

  // SLICE F3 - tenant theme injection. The brand color must reach the LOGGED-IN
  // app, not just the public career portal. If the tenant has a valid custom
  // brand hex, generate the full Aurora token ramp (light + dark) and inject it as
  // a <style> scoped to THIS shell's .cd-scope via a stable per-shell id, so
  // --brand / --brand-2 / --brand-ink / --brand-tint / --brand-tint-2 / --on-brand
  // (and their --c-brand* companions, plus --c-brand) resolve to the tenant color
  // across the whole subtree (it inherits into nested scopes like /chat too).
  // No custom color -> brandHex is undefined, no data attribute, no <style> emitted
  // -> the .cd-scope emerald defaults from cd-tokens.css apply, byte-identical to
  // today for every untouched tenant. colorMode is respected automatically: the
  // .dark class on <html> picks the dark block, exactly like the design tokens.
  const brandHex = isHex(branding?.brandPrimaryColor) ? branding!.brandPrimaryColor : null;
  // Stable id for the lifetime of this shell mount; only used when theming.
  const scopeId = useState(() => `t${Math.random().toString(36).slice(2, 9)}`)[0];
  const brandCss = useMemo(
    () => (brandHex ? buildBrandStyle(brandHex, scopeId) : null),
    [brandHex, scopeId],
  );

  return (
    <div className="cd-scope" data-dense={dataDense} data-cd-brand={brandCss ? scopeId : undefined} style={{ height: "calc(100dvh / 0.9)", overflow: "hidden", background: "transparent" }}>
      {brandCss ? <style dangerouslySetInnerHTML={{ __html: brandCss }} /> : null}
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
