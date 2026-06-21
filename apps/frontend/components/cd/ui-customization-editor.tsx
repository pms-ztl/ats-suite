"use client";
// components/cd/ui-customization-editor.tsx
//
// WF-D / D3 — the developer-customizable UI admin editor.
//
// A self-contained admin surface that lets a workspace admin author the tenant's
// UiConfig (the contract document in @cdc-ats/contracts ui-config.ts): the brand
// theme (brand / AI-accent / secondary colors, color mode, density, radius, logo +
// font URLs), the navigation (per-item order / hidden / label + icon overrides),
// per-route enablement + title overrides, and free-text copy overrides. It is the
// human front-end to the SAME contract the cd-shell + embed-shell read, so what an
// admin authors here is exactly what re-skins the chrome.
//
// ─────────────────────────────── WIRING ───────────────────────────────
//  READ : useUiConfig() (lib/config/ui-config-provider) gives the RESOLVED, already
//         schema-migrated UiConfig (platform <- env <- tenant <- user) + refresh().
//         The editor seeds its draft from config.theme / config.nav / config.routes
//         / config.copy. We deliberately read the RESOLVED config (not a raw tenant
//         doc) so the form shows what is actually in effect today; saving writes the
//         full edited document back, which the gateway persists as the tenant layer.
//  GATE : useModules() resolves whether the ENTERPRISE-only `ui-customization`
//         module is enabled for this tenant. PUT /api/me/ui-config is module-gated
//         server-side (gateway requireModule('ui-customization') -> 402 when off),
//         so we mirror that HONESTLY in the UI: when the module is off we render a
//         read-only, plan-locked state with an upgrade affordance instead of a Save
//         that would 402. Fail-soft: while gating is unresolved (allEnabled) we let
//         the admin edit; a real 402/403 on Save is still surfaced truthfully.
//  WRITE: PUT /api/me/ui-config with the full edited UiConfig document. "Saved"
//         shows ONLY on a real HTTP 200; any non-200 surfaces an honest inline
//         error (402 plan, 403 permission, network, generic). On success we call
//         refresh() so the live chrome re-resolves the new config.
//
// ─────────────────────────────── SAFETY ───────────────────────────────
//  • Every hex / font / URL the admin types is validated by the @cdc-ats/contracts
//    UiConfigSchema (via migrateUiConfig) BEFORE it is sent — invalid values block
//    the save with a field-level message and never reach the wire (and thus never
//    an inline <style>). The schema is the CSS-injection boundary; this editor
//    never bypasses it.
//  • ADDITIVE + FAIL-SOFT: an empty / unauthored tenant resolves (via the provider)
//    to the neutral, all-enabled fallback, so the form opens on sensible defaults
//    and clearing everything writes a document that renders byte-identically to the
//    un-customized product. No fabricated data — every value comes from the resolved
//    config or the admin's own input.
//
// The CONFIG-FIELD auto-form idea is borrowed from components/dashboard/Widget-
// Settings.tsx (type-aware ConfigField): here it is specialized to the UiConfig
// theme/nav/route/copy shape instead of a generic record.
import * as React from "react";
import {
  migrateUiConfig,
  type UiConfig,
  type UiTheme,
} from "@cdc-ats/contracts";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useUiConfig } from "@/lib/config/ui-config-provider";
import { useModules } from "@/hooks/use-modules";
import { useCurrentUser } from "@/hooks/use-current-user";

type CSS = React.CSSProperties;

/* ─────────────────────────── canonical nav (mirror) ───────────────────────────
 * The nav items the cd-shell renders. id = href, so overriding by href here keys
 * the SAME nav.order / nav.hidden / nav.overrides the shell reads. Kept in sync
 * with components/cd/cd-shell.tsx NAV. Used ONLY to populate the editor's list of
 * editable rows; it does not decide visibility (the shell + modules do). */
const NAV_ROWS: { section: string; label: string; href: string; icon: string }[] = [
  { section: "Home", label: "Home", href: "/", icon: "home" },
  { section: "Hiring", label: "Candidates", href: "/candidates", icon: "users" },
  { section: "Hiring", label: "Requisitions", href: "/requisitions", icon: "briefcase" },
  { section: "Hiring", label: "Sourcing", href: "/sourcing", icon: "radar" },
  { section: "Hiring", label: "Screening", href: "/screening", icon: "scan" },
  { section: "Hiring", label: "Assessments", href: "/assessments", icon: "listChecks" },
  { section: "Hiring", label: "Interviews", href: "/interviews", icon: "calendar" },
  { section: "Hiring", label: "Scheduling", href: "/scheduling", icon: "clock" },
  { section: "Hiring", label: "Decisions", href: "/decisions", icon: "gavel" },
  { section: "Hiring", label: "Offers", href: "/offers", icon: "fileText" },
  { section: "Intelligence", label: "Copilot", href: "/copilot", icon: "sparkles" },
  { section: "Intelligence", label: "Team Chat", href: "/chat", icon: "inbox" },
  { section: "Intelligence", label: "Review Queue", href: "/hitl", icon: "listChecks" },
  { section: "Intelligence", label: "AI Operations", href: "/ai", icon: "cpu" },
  { section: "Intelligence", label: "Analytics", href: "/analytics", icon: "chart" },
  { section: "Governance", label: "Compliance", href: "/compliance", icon: "shield" },
  { section: "Governance", label: "Security", href: "/security", icon: "shield" },
  { section: "Governance", label: "Audit Log", href: "/audit", icon: "scroll" },
  { section: "Workspace", label: "Workspace admin", href: "/workspace", icon: "building" },
  { section: "Workspace", label: "Internal Mobility", href: "/mobility", icon: "mobility" },
  { section: "Workspace", label: "Integrations", href: "/integrations", icon: "plug" },
  { section: "Workspace", label: "Billing & Plan", href: "/billing", icon: "card" },
  { section: "Workspace", label: "Settings", href: "/settings", icon: "settings" },
  { section: "Workspace", label: "Support", href: "/support", icon: "lifebuoy" },
];

// The icon-override choices offered to the admin. A curated subset of the kit's
// ICONS so the picker only ever yields a glyph that renders (an unknown icon string
// is ignored by the shell anyway, but offering only real keys is honest UX).
const ICON_CHOICES = [
  "home", "users", "briefcase", "radar", "scan", "listChecks", "calendar",
  "clock", "gavel", "fileText", "sparkles", "inbox", "cpu", "chart", "shield",
  "scroll", "building", "mobility", "plug", "card", "settings", "lifebuoy",
  "search", "bell", "bolt", "flag", "layers", "server", "terminal", "rocket",
] as const;

const COLOR_MODES: [UiTheme["colorMode"], string][] = [
  ["system", "Match device"],
  ["light", "Light"],
  ["dark", "Dark"],
];
const DENSITIES: [UiTheme["density"], string][] = [
  ["compact", "Compact"],
  ["cozy", "Cozy"],
  ["comfortable", "Comfortable"],
];
const RADII: [UiTheme["radius"], string][] = [
  ["sharp", "Sharp"],
  ["soft", "Soft"],
  ["round", "Round"],
];

const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;
const isHex = (s: string | undefined): s is string => !!s && HEX_RE.test(s);
// Lightweight URL probe for inline field validation. The contract's .url() is the
// authority (it runs at save time); this only drives the field-level "looks wrong"
// hint so a bad URL is caught before the user clicks Save.
function looksLikeUrl(s: string): boolean {
  try { new URL(s); return true; } catch { return false; }
}

/* ─────────────────────────── network ─────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}

/** Real PUT /api/me/ui-config. Returns the ok flag + status + parsed error code so
 *  the caller can show a TRUTHFUL result: "Saved" only on 200; an honest reason
 *  (plan / permission / network) otherwise. Never fakes success. */
async function putUiConfig(doc: UiConfig): Promise<{ ok: boolean; status: number; code?: string }> {
  const t = authToken();
  try {
    const res = await fetch(`${API_BASE}/me/ui-config`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: JSON.stringify(doc),
    });
    let code: string | undefined;
    try { const j = await res.json(); code = j?.error?.code; } catch { /* non-JSON body */ }
    return { ok: res.ok, status: res.status, code };
  } catch {
    return { ok: false, status: 0 };
  }
}

/* ─────────────────────────── small primitives ─────────────────────────── */
const labelStyle: CSS = { fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 };
const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

function Field({ label, children, hint, warn }: { label: string; children: React.ReactNode; hint?: React.ReactNode; warn?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {warn ? (
        <div style={{ fontSize: 11.5, color: "var(--c-warn)", marginTop: 6, lineHeight: 1.4 }}>{warn}</div>
      ) : hint ? (
        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 6, lineHeight: 1.4 }}>{hint}</div>
      ) : null}
    </div>
  );
}

function Card({ children, pad = 20 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad, marginBottom: 18 }}>{children}</div>;
}

function SectionHead({ title, desc }: { title: string; desc?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>
      {desc && <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--c-ink-3)", maxWidth: 560, lineHeight: 1.5 }}>{desc}</p>}
    </div>
  );
}

// Segmented control (color mode / density / radius). Pure, controlled.
function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", flexWrap: "wrap" }}>
      {options.map(([v, lbl]) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          style={{ padding: "7px 13px", borderRadius: "var(--r-sm, 8px)", border: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)", background: value === v ? "var(--c-surface)" : "transparent", color: value === v ? "var(--c-ink)" : "var(--c-ink-2)", boxShadow: value === v ? "var(--e1)" : "none" }}>
          {lbl}
        </button>
      ))}
    </div>
  );
}

// A color picker that pairs a native <input type=color> with a clearable hex readout.
// `value` is "" (unset) or a #hex literal; onChange yields "" to clear.
function ColorField({ label, value, fallback, hint, onChange }: { label: string; value: string; fallback: string; hint?: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} hint={hint}>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 10px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", cursor: "pointer" }}>
        <input type="color" value={isHex(value) ? value : fallback} onChange={(e) => onChange(e.target.value)}
          style={{ width: 24, height: 24, border: "none", background: "transparent", padding: 0, cursor: "pointer" }} />
        <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{value || "Not set"}</span>
        {value && (
          <button type="button" onClick={(e) => { e.preventDefault(); onChange(""); }}
            style={{ border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", fontSize: 12 }}>clear</button>
        )}
      </label>
    </Field>
  );
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} aria-pressed={on} disabled={disabled}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

/* ─────────────────────────── draft model ───────────────────────────
 * The editor edits a flat, form-friendly DRAFT, then re-assembles a full UiConfig
 * document on save (validated by migrateUiConfig before it leaves the editor). The
 * draft is seeded from the resolved config so the form opens on what is in effect. */
interface NavRowDraft { hidden: boolean; label: string; icon: string; order: number }
interface RouteDraft { enabled: boolean; title: string }
interface Draft {
  theme: {
    brandHex: string; aiAccentHex: string; secondaryHex: string;
    colorMode: NonNullable<UiTheme["colorMode"]>;
    density: NonNullable<UiTheme["density"]>;
    radius: NonNullable<UiTheme["radius"]>;
    logoUrl: string; faviconUrl: string; fontFamily: string; fontSrc: string;
  };
  brandName: string;
  nav: Record<string, NavRowDraft>;
  routes: Record<string, RouteDraft>;
  copy: Array<{ key: string; value: string }>;
}

// Build the editor draft from a resolved UiConfig. Nav rows default to the canonical
// order index so an unauthored config opens in the shell's native order; overrides
// pull through any authored label/icon. Routes default to enabled (fail-soft).
function draftFromConfig(cfg: UiConfig): Draft {
  const t = cfg.theme;
  const order = cfg.nav.order;
  const nav: Record<string, NavRowDraft> = {};
  NAV_ROWS.forEach((row, i) => {
    const ov = cfg.nav.overrides[row.href] ?? {};
    const idx = order.indexOf(row.href);
    nav[row.href] = {
      hidden: cfg.nav.hidden.includes(row.href),
      label: typeof ov.label === "string" ? ov.label : "",
      icon: typeof ov.icon === "string" ? ov.icon : "",
      order: idx === -1 ? i : idx,
    };
  });
  const routes: Record<string, RouteDraft> = {};
  NAV_ROWS.forEach((row) => {
    const key = row.href.replace(/^\/+/, "").replace(/\/+$/, "");
    const entry = cfg.routes[key] ?? cfg.routes[row.href];
    routes[row.href] = {
      enabled: entry ? entry.enabled !== false : true,
      title: typeof entry?.title === "string" ? entry.title : "",
    };
  });
  const copy = Object.entries(cfg.copy).map(([key, value]) => ({ key, value: String(value) }));
  return {
    theme: {
      brandHex: t.brandHex ?? "",
      aiAccentHex: t.aiAccentHex ?? "",
      secondaryHex: t.secondaryHex ?? "",
      colorMode: t.colorMode ?? "system",
      density: t.density ?? "cozy",
      radius: t.radius ?? "soft",
      logoUrl: t.logoUrl ?? "",
      faviconUrl: t.faviconUrl ?? "",
      fontFamily: t.fontFamily ?? "",
      fontSrc: t.fontSrc ?? "",
    },
    brandName: cfg.brandName ?? "",
    nav,
    routes,
    copy,
  };
}

// Re-assemble a full UiConfig document from the draft. Empty strings are DROPPED
// (so clearing a field removes the override -> fail-soft), and the document is run
// through migrateUiConfig (= UiConfigSchema.parse) so every hex/font/url is
// validated before it can be sent. Throws (Zod) on invalid input; the caller turns
// that into a field-level message and blocks the save.
function configFromDraft(base: UiConfig, d: Draft): UiConfig {
  const theme: Record<string, unknown> = {
    colorMode: d.theme.colorMode,
    density: d.theme.density,
    radius: d.theme.radius,
  };
  if (d.theme.brandHex) theme.brandHex = d.theme.brandHex;
  if (d.theme.aiAccentHex) theme.aiAccentHex = d.theme.aiAccentHex;
  if (d.theme.secondaryHex) theme.secondaryHex = d.theme.secondaryHex;
  if (d.theme.logoUrl) theme.logoUrl = d.theme.logoUrl;
  if (d.theme.faviconUrl) theme.faviconUrl = d.theme.faviconUrl;
  if (d.theme.fontFamily) theme.fontFamily = d.theme.fontFamily;
  if (d.theme.fontSrc) theme.fontSrc = d.theme.fontSrc;

  // nav.order: the hrefs sorted by the draft's per-row order index (stable). Only
  // emitted when the admin actually reordered (i.e. the order differs from the
  // canonical sequence), so an untouched nav writes an empty order array.
  const orderedHrefs = [...NAV_ROWS]
    .map((r, i) => ({ href: r.href, order: d.nav[r.href]?.order ?? i, i }))
    .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.i - b.i))
    .map((x) => x.href);
  const isCanonicalOrder = orderedHrefs.every((h, i) => h === NAV_ROWS[i].href);
  const order = isCanonicalOrder ? [] : orderedHrefs;

  const hidden = NAV_ROWS.filter((r) => d.nav[r.href]?.hidden).map((r) => r.href);
  const overrides: Record<string, Record<string, string>> = {};
  for (const r of NAV_ROWS) {
    const row = d.nav[r.href];
    if (!row) continue;
    const ov: Record<string, string> = {};
    if (row.label.trim()) ov.label = row.label.trim();
    if (row.icon.trim()) ov.icon = row.icon.trim();
    if (Object.keys(ov).length) overrides[r.href] = ov;
  }

  const routes: Record<string, { enabled: boolean; title?: string }> = {};
  for (const r of NAV_ROWS) {
    const row = d.routes[r.href];
    if (!row) continue;
    const key = r.href.replace(/^\/+/, "").replace(/\/+$/, "") || "/";
    // Only persist a route entry when it deviates from the fail-soft default
    // (enabled + no title), so an untouched route writes nothing.
    if (!row.enabled || row.title.trim()) {
      routes[key] = { enabled: row.enabled, ...(row.title.trim() ? { title: row.title.trim() } : {}) };
    }
  }

  const copy: Record<string, string> = {};
  for (const { key, value } of d.copy) {
    const k = key.trim();
    if (k && value.trim()) copy[k] = value;
  }

  const doc = {
    schemaVersion: base.schemaVersion,
    brandName: d.brandName.trim() || undefined,
    theme,
    nav: { order, hidden, overrides },
    routes,
    copy,
    surfaces: base.surfaces,
    featureToggles: base.featureToggles,
  };
  // The injection boundary: parse the whole document before it can be sent.
  return migrateUiConfig(doc);
}

/* ─────────────────────────── the editor ─────────────────────────── */
export function UiCustomizationEditor() {
  const { config, loading, refresh } = useUiConfig();
  const modules = useModules();
  const { user } = useCurrentUser();

  const role = String(user?.role ?? "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const plan = user?.tenant?.plan ?? null;

  // Is the ENTERPRISE-only ui-customization module enabled? Fail-soft: while gating
  // is unresolved (allEnabled) we treat it as available so the admin can edit; a
  // real 402 on save still tells the truth.
  const moduleRow = modules.modules?.find((m) => m.key === "ui-customization");
  const moduleEnabled = modules.allEnabled || (moduleRow ? moduleRow.enabled : true);
  const planLocked = !modules.allEnabled && moduleRow?.reason === "PLAN_LIMIT";

  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const savedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed the draft from the resolved config once it loads (and whenever a refresh
  // brings a new resolution). Only re-seed while the form is pristine-or-empty so an
  // in-progress edit is never clobbered by the 45s-less provider refresh.
  React.useEffect(() => {
    if (loading) return;
    setDraft((prev) => prev ?? draftFromConfig(config));
  }, [loading, config]);

  React.useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current); }, []);

  function flashSaved() {
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2600);
  }

  function patchTheme(p: Partial<Draft["theme"]>) {
    setDraft((d) => (d ? { ...d, theme: { ...d.theme, ...p } } : d));
  }
  function patchNav(href: string, p: Partial<NavRowDraft>) {
    setDraft((d) => (d ? { ...d, nav: { ...d.nav, [href]: { ...d.nav[href], ...p } } } : d));
  }
  function patchRoute(href: string, p: Partial<RouteDraft>) {
    setDraft((d) => (d ? { ...d, routes: { ...d.routes, [href]: { ...d.routes[href], ...p } } } : d));
  }

  async function onSave() {
    if (!draft) return;
    setError(null);
    setFieldError(null);
    // 1) Validate locally through the contract schema. A bad hex/font/url throws
    //    here and never reaches the wire (no fake save, no inline-style injection).
    let doc: UiConfig;
    try {
      doc = configFromDraft(config, draft);
    } catch {
      setFieldError("Some values are not valid yet. Check that colors are #hex and logo / font fields are full URLs (https://...).");
      return;
    }
    // 2) PUT it. "Saved" only on a real 200; honest reason otherwise.
    setSaving(true);
    setSaved(false);
    const res = await putUiConfig(doc);
    setSaving(false);
    if (res.ok) {
      flashSaved();
      refresh(); // re-resolve the live chrome with the new config
    } else if (res.status === 402 || res.code === "PLAN_LIMIT") {
      setError("UI customization is an Enterprise feature. Upgrade your plan to save changes.");
    } else if (res.status === 401 || res.status === 403) {
      setError("You need workspace-admin access to change the UI configuration.");
    } else if (res.status === 0) {
      setError("Could not reach the server. Check your connection and try again.");
    } else {
      setError(`We could not save your UI configuration (error ${res.status}). Please try again.`);
    }
  }

  function onReset() {
    setError(null);
    setFieldError(null);
    setDraft(draftFromConfig(config));
  }

  /* ── loading skeleton ── */
  if (loading && !draft) {
    return (
      <Card>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ height: 12, width: "28%", borderRadius: 6, background: "var(--c-surface-3)" }} />
            <div style={{ height: 38, borderRadius: 8, background: "var(--c-surface-3)", marginTop: 8, opacity: 0.7 }} />
          </div>
        ))}
      </Card>
    );
  }

  /* ── plan-locked: honest ENTERPRISE-gated read-only state ── */
  if (!moduleEnabled || planLocked) {
    return (
      <Card pad={28}>
        <div style={{ textAlign: "center", color: "var(--c-ink-2)", maxWidth: 460, margin: "0 auto" }}>
          <span style={{ display: "inline-grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: "var(--c-ai-tint)", marginBottom: 12 }}>
            <Icon name="lock" size={20} style={{ color: "var(--c-ai)" }} />
          </span>
          <h3 style={{ margin: "0 0 6px", fontSize: "var(--fs-md)", fontWeight: 700 }}>UI customization is an Enterprise feature</h3>
          <p style={{ margin: "0 0 16px", fontSize: "var(--fs-sm)", lineHeight: 1.55 }}>
            Override the workspace theme, navigation, route visibility, and in-app copy for your whole team. Upgrade to Enterprise to author your own UI configuration.
          </p>
          <Btn variant="outlineAi" trailIcon="arrowUpRight" onClick={() => { window.location.href = "/billing"; }}>
            Upgrade to Enterprise
          </Btn>
        </div>
      </Card>
    );
  }

  if (!draft) return null;

  const t = draft.theme;
  const navBySection = NAV_ROWS.reduce<Record<string, typeof NAV_ROWS>>((acc, r) => {
    (acc[r.section] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      {/* save bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">UI configuration</Pill>
          {!isAdmin && <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>View only — ask a workspace admin to save changes.</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
              <Icon name="check" size={15} stroke={2.4} /> Saved
            </span>
          )}
          <Btn variant="ghost" onClick={onReset} disabled={saving}>Reset</Btn>
          <Btn variant="primary" icon="check" onClick={onSave} disabled={saving || !isAdmin}>{saving ? "Saving" : "Save"}</Btn>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", marginBottom: 16, border: "1px solid color-mix(in oklab, var(--c-danger) 22%, transparent)" }}>
          <Icon name="shield" size={15} /> {error}
        </div>
      )}
      {fieldError && (
        <div role="alert" style={{ display: "flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", color: "var(--c-warn)", fontSize: "var(--fs-sm)", marginBottom: 16, border: "1px solid color-mix(in oklab, var(--c-warn) 24%, transparent)" }}>
          <Icon name="flag" size={15} /> {fieldError}
        </div>
      )}

      {/* THEME */}
      <Card>
        <SectionHead title="Theme" desc="Brand colors, appearance, logo, and font. Colors must be #hex; logo and font fields must be full URLs. Cleared fields fall back to the product defaults." />
        <Field label="Workspace display name (optional)" hint="Overrides the name shown in the app chrome. Leave blank to use your tenant name.">
          <input value={draft.brandName} onChange={(e) => setDraft((d) => (d ? { ...d, brandName: e.target.value } : d))} style={inp} placeholder="e.g. Pinnacle Talent" />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 4 }}>
          <ColorField label="Brand color" value={t.brandHex} fallback="#16916a" hint="Primary brand color. Feeds the brand ramp." onChange={(v) => patchTheme({ brandHex: v })} />
          <ColorField label="AI accent color" value={t.aiAccentHex} fallback="#9b8cff" hint="Used on AI features and accents." onChange={(v) => patchTheme({ aiAccentHex: v })} />
          <ColorField label="Secondary color" value={t.secondaryHex} fallback="#64748b" hint="Optional supporting color." onChange={(v) => patchTheme({ secondaryHex: v })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 4 }}>
          <Field label="Color mode"><Segmented value={t.colorMode} options={COLOR_MODES} onChange={(v) => patchTheme({ colorMode: v })} /></Field>
          <Field label="Density"><Segmented value={t.density} options={DENSITIES} onChange={(v) => patchTheme({ density: v })} /></Field>
          <Field label="Corner radius"><Segmented value={t.radius} options={RADII} onChange={(v) => patchTheme({ radius: v })} /></Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
          <Field label="Logo URL" hint="Full https:// URL to your logo image." warn={t.logoUrl && !looksLikeUrl(t.logoUrl) ? "This does not look like a full URL (https://...)." : undefined}>
            <input value={t.logoUrl} onChange={(e) => patchTheme({ logoUrl: e.target.value })} style={inp} placeholder="https://cdn.example.com/logo.svg" />
          </Field>
          <Field label="Favicon URL" hint="Full https:// URL to your favicon." warn={t.faviconUrl && !looksLikeUrl(t.faviconUrl) ? "This does not look like a full URL (https://...)." : undefined}>
            <input value={t.faviconUrl} onChange={(e) => patchTheme({ faviconUrl: e.target.value })} style={inp} placeholder="https://cdn.example.com/favicon.ico" />
          </Field>
          <Field label="Font family" hint="A CSS font-family value, e.g. &quot;Inter&quot;, sans-serif.">
            <input value={t.fontFamily} onChange={(e) => patchTheme({ fontFamily: e.target.value })} style={inp} placeholder='"Inter", sans-serif' />
          </Field>
          <Field label="Font source URL" hint="Full https:// URL to a webfont (woff2 / woff / ttf)." warn={t.fontSrc && !looksLikeUrl(t.fontSrc) ? "This does not look like a full URL (https://...)." : undefined}>
            <input value={t.fontSrc} onChange={(e) => patchTheme({ fontSrc: e.target.value })} style={inp} placeholder="https://cdn.example.com/Inter.woff2" />
          </Field>
        </div>
      </Card>

      {/* NAVIGATION */}
      <Card>
        <SectionHead title="Navigation" desc="Reorder, hide, relabel, or re-icon the sidebar items. Hiding an item here removes it for everyone in the workspace; it does not disable the underlying route (see Routes below). Module gating still applies on top of this." />
        {Object.entries(navBySection).map(([section, rows]) => (
          <div key={section} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--c-ink-3)", marginBottom: 8 }}>{section}</div>
            {rows.map((row) => {
              const nd = draft.nav[row.href];
              return (
                <div key={row.href} style={{ display: "grid", gridTemplateColumns: "minmax(140px, 1fr) 90px 130px 70px auto", gap: 10, alignItems: "center", padding: "9px 0", borderTop: "1px solid var(--c-line)" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center" }}>
                      <Icon name={(nd.icon || row.icon)} size={15} style={{ color: "var(--c-ink-3)" }} />{row.label}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{row.href}</div>
                  </div>
                  <input type="number" value={nd.order} onChange={(e) => patchNav(row.href, { order: Number(e.target.value) })} title="Order within section" style={{ ...inp, padding: "7px 9px", textAlign: "center" }} />
                  <input value={nd.label} onChange={(e) => patchNav(row.href, { label: e.target.value })} placeholder="Label" style={{ ...inp, padding: "7px 9px" }} />
                  <select value={nd.icon} onChange={(e) => patchNav(row.href, { icon: e.target.value })} title="Icon override" style={{ ...inp, padding: "7px 6px" }}>
                    <option value="">Icon</option>
                    {ICON_CHOICES.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--c-ink-2)", justifySelf: "end" }}>
                    <span>Hide</span>
                    <Toggle on={nd.hidden} onClick={() => patchNav(row.href, { hidden: !nd.hidden })} disabled={!isAdmin} />
                  </label>
                </div>
              );
            })}
          </div>
        ))}
      </Card>

      {/* ROUTES */}
      <Card>
        <SectionHead title="Routes" desc="Turn a route on or off for the whole workspace, and override its page title. A disabled route is removed from the sidebar and is unreachable. Unlisted routes stay enabled." />
        {NAV_ROWS.map((row, i) => {
          const rd = draft.routes[row.href];
          return (
            <div key={row.href} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) 1fr 70px", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{row.label}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{row.href}</div>
              </div>
              <input value={rd.title} onChange={(e) => patchRoute(row.href, { title: e.target.value })} placeholder="Title override (optional)" style={{ ...inp, padding: "7px 10px" }} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--c-ink-2)", justifySelf: "end" }}>
                <span>{rd.enabled ? "On" : "Off"}</span>
                <Toggle on={rd.enabled} onClick={() => patchRoute(row.href, { enabled: !rd.enabled })} disabled={!isAdmin} />
              </label>
            </div>
          );
        })}
      </Card>

      {/* COPY */}
      <Card>
        <SectionHead title="Copy overrides" desc="Replace specific in-app strings by key. Nav labels use the key nav.&lt;href&gt; (e.g. nav./candidates). An empty key or value is ignored." />
        {draft.copy.length === 0 && (
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", padding: "8px 0 14px" }}>No copy overrides yet.</div>
        )}
        {draft.copy.map((entry, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) 1.4fr auto", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input value={entry.key} onChange={(e) => setDraft((d) => { if (!d) return d; const copy = [...d.copy]; copy[i] = { ...copy[i], key: e.target.value }; return { ...d, copy }; })} placeholder="nav./candidates" className="mono" style={{ ...inp, padding: "7px 10px", fontSize: 12 }} />
            <input value={entry.value} onChange={(e) => setDraft((d) => { if (!d) return d; const copy = [...d.copy]; copy[i] = { ...copy[i], value: e.target.value }; return { ...d, copy }; })} placeholder="Override text" style={{ ...inp, padding: "7px 10px" }} />
            <button type="button" onClick={() => setDraft((d) => (d ? { ...d, copy: d.copy.filter((_, j) => j !== i) } : d))} aria-label="Remove" style={{ border: "1px solid var(--c-line-2)", background: "var(--c-surface)", borderRadius: "var(--r)", width: 34, height: 34, display: "grid", placeItems: "center", cursor: "pointer", color: "var(--c-ink-3)" }}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
        <Btn variant="soft" icon="plus" onClick={() => setDraft((d) => (d ? { ...d, copy: [...d.copy, { key: "", value: "" }] } : d))}>Add copy override</Btn>
      </Card>
    </div>
  );
}

export default UiCustomizationEditor;
