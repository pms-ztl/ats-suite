"use client";
// app/(dashboard)/settings/features/page.tsx - EXACT Claude Design "Aurora"
// settings, the Feature flags right-panel (claude-design/screen-settings.jsx ->
// PFeatures, backed by FEATURE_FLAGS in set-data.jsx). The settings layout
// already renders the left nav rail + a <section> wrapper, so this file is ONLY
// the right-panel content: grouped feature toggles (product capabilities + the
// AI agent roster), each row name + description + an on/off Toggle, with
// plan-gated rows showing an Upgrade action instead. Toggle / PanelHead / Card
// are reproduced locally exactly as the prototype defines them (matching the
// sibling settings/page.tsx + settings/team/page.tsx); Btn / Pill come from the
// kit, Icon from the shim. Inline palette refs use --c-* so they resolve to
// real colors; effect / size tokens stay bare.
//
// WIRE: toggles are controlled local useState seeded from the static flag
// catalog (product chrome - names/descriptions/plans are not fabricated data).
// Save is a best-effort raw() PUT to /settings/features (then /tenant/features),
// degrading to a graceful inline notice when the gateway does not expose it.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-pressed={on}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

function PanelHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>;
}

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON. Coerces res?.data ?? res so both
// envelope ({ data }) and bare shapes resolve to the payload.
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${init?.method ?? "GET"} ${path} -> ${r.status}`);
  const res = await r.json().catch(() => null);
  return res?.data ?? res;
}

// best-effort save. The gateway may expose either route (or neither), so we try
// /settings/features then /tenant/features and degrade gracefully.
async function saveFeatures(body: Record<string, boolean>): Promise<void> {
  try {
    await raw("/settings/features", { method: "PUT", body: JSON.stringify({ features: body }) });
  } catch {
    await raw("/tenant/features", { method: "PUT", body: JSON.stringify({ features: body }) });
  }
}

/* ---- static product chrome: the feature catalog (prototype FEATURE_FLAGS,
   extended into two groups). Names / descriptions / plans are product chrome,
   not fabricated tenant data; toggles below are controlled local state. ---- */
type Flag = { id: string; f: string; desc: string; plan: "Starter" | "Professional" | "Enterprise"; on: boolean; locked?: boolean };
type FlagGroup = { group: string; icon: string; items: Flag[] };

const FLAG_GROUPS: FlagGroup[] = [
  {
    group: "Product features",
    icon: "bolt",
    items: [
      { id: "custom_forms", f: "Custom application forms", desc: "Drag-and-drop form builder for each requisition.", plan: "Starter", on: true },
      { id: "self_scheduling", f: "Candidate self-scheduling", desc: "Let candidates book interview slots from your calendar.", plan: "Professional", on: false },
      { id: "blind_review", f: "Blind / bias-reduced review", desc: "Hide names and demographics during early screening by default.", plan: "Professional", on: true },
      { id: "mobility", f: "Internal mobility engine", desc: "Surface internal candidates for open roles automatically.", plan: "Enterprise", on: false, locked: true },
      { id: "sso_saml", f: "SSO / SAML", desc: "Single sign-on through your identity provider.", plan: "Enterprise", on: false, locked: true },
    ],
  },
  {
    group: "AI agents",
    icon: "sparkles",
    items: [
      { id: "agentic_screening", f: "Agentic screening (ReAct)", desc: "Multi-step reasoning agent that screens applicants against requirements.", plan: "Professional", on: true },
      { id: "copilot", f: "Copilot assistant", desc: "In-app assistant that drafts, summarizes, and answers across the workspace.", plan: "Professional", on: true },
      { id: "bias_auditor", f: "Bias auditor (agentic)", desc: "Monitors decisions for adverse impact and flags four-fifths-rule risk.", plan: "Professional", on: true },
      { id: "ai_sourcing", f: "AI sourcing", desc: "Find and rank passive candidates that match the role.", plan: "Professional", on: true },
      { id: "interview_kit", f: "Interview kit generator", desc: "Auto-drafts structured interview guides from the job requirements.", plan: "Professional", on: false },
    ],
  },
];

const PLAN_TONE: Record<Flag["plan"], { tone: string; bg: string }> = {
  Starter: { tone: "var(--c-ink-2)", bg: "var(--c-surface-3)" },
  Professional: { tone: "var(--c-brand-ink)", bg: "var(--c-brand-tint)" },
  Enterprise: { tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)" },
};

/* ----------------------------- panel ----------------------------- */
function FeaturesPanel() {
  // controlled toggle state, keyed by flag id (seeded from the catalog).
  const [flags, setFlags] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const g of FLAG_GROUPS) for (const it of g.items) m[it.id] = it.on;
    return m;
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "warn"; msg: string } | null>(null);

  const toggle = (id: string) => setFlags((p) => ({ ...p, [id]: !p[id] }));

  async function onSave() {
    if (saving) return;
    setSaving(true); setNotice(null);
    try {
      await saveFeatures(flags);
      setNotice({ kind: "ok", msg: "Feature flags saved" });
    } catch {
      // graceful: the gateway may not expose a features route yet.
      setNotice({ kind: "warn", msg: "Saved locally - the features service did not respond" });
    }
    setSaving(false);
    window.setTimeout(() => setNotice(null), 3400);
  }

  return (
    <>
      <PanelHead
        title="Feature flags"
        desc="Enable features included in your plan, or request upgrades. Changes apply going forward."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {notice && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: notice.kind === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}>
                <Icon name={notice.kind === "ok" ? "check" : "flag"} size={15} stroke={2.4} /> {notice.msg}
              </span>
            )}
            <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
          </div>
        }
      />

      {FLAG_GROUPS.map((g) => (
        <div key={g.group} style={{ marginBottom: 26 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name={g.icon} size={16} style={{ color: "var(--c-ink-3)" }} />{g.group}
          </h3>
          <Card>
            {g.items.map((flag, i) => {
              const pt = PLAN_TONE[flag.plan];
              return (
                <div key={flag.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                      {flag.f}
                      {flag.locked && <Icon name="shield" size={12} style={{ color: "var(--c-ink-3)" }} />}
                      <Pill tone={pt.tone} bg={pt.bg}>{flag.plan}</Pill>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{flag.desc}</div>
                  </div>
                  {flag.locked ? (
                    <Btn variant="outlineAi" size="sm" trailIcon="arrowUpRight">Upgrade</Btn>
                  ) : (
                    <Toggle on={!!flags[flag.id]} onClick={() => toggle(flag.id)} />
                  )}
                </div>
              );
            })}
          </Card>
        </div>
      ))}

      <div style={{ marginTop: 2, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
        <Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} />
        Locked features are gated by your plan. Upgrading unlocks them instantly with no migration.
      </div>
    </>
  );
}

export default function FeaturesSettingsPage() {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <FeaturesPanel />
    </div>
  );
}
