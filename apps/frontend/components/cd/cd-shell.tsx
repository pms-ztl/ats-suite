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
import { useUiConfig } from "@/lib/config/ui-config-provider";
import { Slot } from "@/lib/registry/slots";
import { buildThemeCss, type ThemeConfig } from "@/lib/theme/build-theme-css";
import type { IconName } from "./icon";
import type { NavSection, RoleMeta, Workspace, ShellUser, CommandGroup, PlanUsage } from "./types";

const ALL = ["admin", "recruiter", "hiring_manager", "interviewer", "compliance_officer", "super_admin"];

// A valid 3- or 6-digit hex is the ONLY trigger for legacy tenant theming via the
// branding payload. Anything else (null, empty, a CSS keyword, garbage) leaves the
// .cd-scope emerald defaults from cd-tokens.css untouched. NOTE: hex values that
// arrive via the UiConfig theme block are already validated by the contract's
// HexColor regex (UiThemeSchema), so this guard only re-validates the *legacy*
// branding.brandPrimaryColor that does NOT pass through that schema.
function isHex(hex: string | null | undefined): hex is string {
  return !!hex && /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex);
}

// C5 — WF-B B5 THEME SINK. The whole scoped <style> body that re-skins the logged-
// in app is now built by buildThemeCss (lib/theme/build-theme-css.ts), the
// generalized successor to the old inline buildBrandStyle helper. Where that
// emitted ONLY the brand ramp, buildThemeCss emits the FULL customizable token
// surface (brand + AI-accent + secondary ramps, @font-face + --font-sans, data-
// driven --radius / --density, and an optional Utopia fluid type/space scale),
// scoped to THIS shell's .cd-scope via a per-shell data attribute that inherits
// down into nested .cd-scope subtrees (e.g. /chat) exactly like before. Every hex/
// font/number it interpolates has been validated by the @cdc-ats/contracts
// UiThemeSchema (the CSS-injection boundary) before it reaches the sink, OR is the
// schema-less legacy branding hex re-validated by isHex above.

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
  // C5 (WF-C/WF-D) — the resolved per-tenant UiConfig + its fail-soft helpers.
  // FAIL-SOFT: when /api/me/ui-config 404s / errors / is unauthored, `config`
  // resolves to the contract's neutral, all-enabled fallback (empty nav/routes/
  // copy, system color mode, no brand override), so every helper below is a no-op
  // and the shell renders BYTE-IDENTICAL to today. `config` drives: the nav
  // (order/hidden/overrides + per-route enablement + copy labels), the breadcrumb
  // title (route title override + copy), and the theme sink (theme block ->
  // buildThemeCss). Nothing here invents values; it only layers a tenant's own
  // authored, schema-validated config over the canonical chrome.
  const { config: uiConfig, isRouteEnabled, routeTitle, navOverride, copy } = useUiConfig();
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
  //
  // C5 (WF-C/WF-D) — the tenant UiConfig now DATA-DRIVES the nav, layered AFTER the
  // module filter so a tenant's enabled modules still win the visibility decision:
  //   • routes[].enabled === false  -> the nav row is dropped (route disabled).
  //   • nav.hidden includes the href -> the nav row is dropped (tenant hid it).
  //   • nav.overrides[href]          -> relabel / re-icon / re-href the row.
  //   • copy["nav.<href>"]           -> relabel the row (lower precedence than an
  //                                     explicit nav.overrides.label).
  //   • nav.order                    -> reorder rows WITHIN each section by href;
  //                                     unlisted rows keep their canonical order
  //                                     after the listed ones (stable).
  // FAIL-SOFT: the fallback UiConfig has empty routes/nav/copy, so every branch is
  // a no-op and the produced nav is byte-identical to the pre-C5 nav. An icon
  // override is only applied when it is a valid IconName key the kit ships; an
  // unknown icon string is ignored (the canonical icon stays) so a bad override
  // can never render a broken glyph.
  const navOrder = uiConfig.nav.order;
  const navHidden = uiConfig.nav.hidden;
  const nav: NavSection[] = useMemo(() => {
    const hiddenSet = new Set(navHidden);
    // Rank an href by its position in nav.order (unlisted -> +Infinity, i.e. last,
    // preserving the canonical order among the unlisted tail).
    const rank = (href: string): number => {
      const i = navOrder.indexOf(href);
      return i === -1 ? Number.POSITIVE_INFINITY : i;
    };
    return NAV.map((g) => {
      const items = g.items
        .map((it) => ({ it, decision: moduleDecision(it.module) }))
        // module hard-disabled -> drop (unchanged from v1).
        .filter(({ decision }) => decision !== "hide")
        // route disabled by the tenant -> drop (fail-soft: unlisted route stays on).
        .filter(({ it }) => isRouteEnabled(it.href))
        // tenant explicitly hid this nav item -> drop.
        .filter(({ it }) => !hiddenSet.has(it.href))
        .map(({ it, decision }) => {
          const ov = navOverride(it.href);
          // Label precedence: explicit nav.overrides.label > copy["nav.<href>"] >
          // canonical label. Icon/href overrides are validated below.
          const label = ov?.label ?? copy(`nav.${it.href}`, it.label);
          const icon = (ov?.icon && (ov.icon as IconName)) || it.icon;
          const id = (ov?.href && typeof ov.href === "string") ? ov.href : it.href;
          // Keep the CANONICAL href so nav.order (authored against canonical hrefs)
          // ranks correctly even when this item was re-href'd by an override.
          return {
            canonical: it.href,
            item: {
              id, label, icon, roles: it.roles, ai: it.ai,
              count: it.countKey === "hitl" ? (hitl > 0 ? hitl : undefined) : undefined,
              lock: decision === "lock" || undefined,
            },
          };
        });
      // Stable reorder within the section by nav.order rank (keyed on the canonical
      // href). Ties (including the all-unlisted v1 default) preserve source order.
      const ordered = items
        .map((entry, i) => ({ ...entry, i }))
        .sort((a, b) => {
          const ra = rank(a.canonical), rb = rank(b.canonical);
          return ra !== rb ? ra - rb : a.i - b.i;
        })
        .map(({ item }) => item);
      return { section: g.section ?? undefined, platform: g.platform, items: ordered };
    });
  }, [hitl, moduleDecision, isRouteEnabled, navOverride, copy, navOrder, navHidden]);

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
    ? { label: "Seats used", used: seats.used, limit: seats.limit, unlimited: seats.unlimited }
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
  //
  // C5 — a tenant whose UiConfig theme.density is "compact" reads as dense
  // EVERYWHERE (its chrome is dialed tighter by intent), so the ambient aurora
  // stays muted on every route, not just the data routes. "cozy"/"comfortable"/
  // absent keep the per-route behavior (byte-identical for the v1 default).
  const DENSE = new Set(["/", "/screening", "/analytics"]);
  const tenantCompact = uiConfig.theme.density === "compact";
  const dataDense = tenantCompact || DENSE.has(pathname) ? "1" : undefined;

  // C5 (WF-C/WF-D) — TENANT THEME via the WF-B B5 sink. The resolved UiConfig
  // theme block (brand/ai-accent/secondary hexes, colorMode, density, radius,
  // font + @font-face, and an optional Utopia fluid scale) is fed to buildThemeCss,
  // which emits the full scoped token surface (replacing the old brand-only
  // buildBrandStyle). The legacy branding.brandPrimaryColor still works as the
  // brand-hex FALLBACK for a tenant that set a brand color via the branding payload
  // but never authored a UiConfig theme.brandHex (re-validated by isHex; UiConfig
  // hexes are already schema-validated).
  //
  // BYTE-IDENTICAL FALLBACK: the contract theme defaults are colorMode "system",
  // density "cozy", radius "soft" — the SAME values cd-tokens.css already ships.
  // So a tenant that authored NO theme override (and has no legacy brand hex)
  // produces an "uncustomized" theme: we emit NO <style> and NO data attribute,
  // leaving the cd-tokens.css emerald defaults intact -> the render is byte-
  // identical to today. We only emit when the tenant actually customized something
  // (any hex, a font, a fluid scale, or a non-default density/radius/colorMode).
  const legacyBrandHex = isHex(branding?.brandPrimaryColor) ? branding!.brandPrimaryColor : undefined;
  const t = uiConfig.theme;
  const themeCfg: ThemeConfig = {
    brandHex: t.brandHex ?? legacyBrandHex,
    aiAccentHex: t.aiAccentHex,
    secondaryHex: t.secondaryHex,
    colorMode: t.colorMode,
    density: t.density,
    radius: t.radius,
    fontFamily: t.fontFamily,
    fontSrc: t.fontSrc,
    fluid: t.fluid,
  };
  // Did the tenant customize anything? Compared against the contract defaults so a
  // bare/unauthored config is treated as uncustomized -> no <style> emitted.
  const themeCustomized =
    !!themeCfg.brandHex ||
    !!themeCfg.aiAccentHex ||
    !!themeCfg.secondaryHex ||
    !!themeCfg.fontFamily ||
    !!themeCfg.fluid ||
    t.colorMode !== "system" ||
    t.density !== "cozy" ||
    t.radius !== "soft";
  // Stable id for the lifetime of this shell mount; only used when theming.
  const scopeId = useState(() => `t${Math.random().toString(36).slice(2, 9)}`)[0];
  const brandCss = useMemo(
    () => {
      if (!themeCustomized) return null;
      const css = buildThemeCss(themeCfg, `data-cd-brand="${scopeId}"`);
      return css.length > 0 ? css : null;
    },
    // themeCfg fields are primitives/plain objects derived from uiConfig + branding;
    // depend on uiConfig.theme + the legacy hex + scopeId so the CSS rebuilds when
    // the resolved theme changes.
    [themeCustomized, uiConfig.theme, legacyBrandHex, scopeId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // C5 — breadcrumb title: a tenant route-title override (routes[key].title) wins
  // for the ACTIVE route; otherwise the Shell derives the title from the (already
  // copy/override-relabeled) nav item, byte-identical to today. routeTitle returns
  // undefined for an unlisted route, so the prop is undefined for v1 -> no change.
  const breadcrumbTitle = routeTitle(activeId);

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
        breadcrumbTitle={breadcrumbTitle}
        hasUnreadNotifs={false}
        logoLight={branding?.logoUrl ?? "/assets/logo-light.png"}
        logoDark={branding?.logoUrl ?? "/assets/logo-dark.png"}
        onNavigate={onNavigate}
        onThemeChange={onThemeChange}
        onSignOut={onSignOut}
        // D6 — WF-B slot seams at the closed shell positions. Each <Slot> resolves
        // its bindings (defaults + the tenant's resolved UiConfig, gated by the same
        // role/plan/module filter) and renders them lazily; with no bindings it is
        // null, so an untouched tenant's chrome is byte-identical. ctx hands each
        // bound block the live workspace + signed-in user + active route.
        headerRight={
          <Slot
            id="shell.header.right"
            config={uiConfig}
            route="shell"
            ctx={{ workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, role }, user: shellUser, activeRoute: activeId }}
          />
        }
        navFooter={
          <Slot
            id="shell.nav.footer"
            config={uiConfig}
            route="shell"
            ctx={{ workspace: { id: workspace.id, name: workspace.name, plan: workspace.plan, role }, user: shellUser, activeRoute: activeId }}
          />
        }
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
