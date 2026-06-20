"use client";
// app/(dashboard)/settings/features/page.tsx — WF9 / SLICE I4.
//
// The Aurora "Feature flags" right-panel, now wired to the REAL per-tenant module
// system. The prior version was a FAKE no-op: it seeded toggles from a hardcoded
// catalog, kept them in local useState, and on Save did a best-effort PUT to a
// NONEXISTENT /settings/features route — then showed a false "Saved" regardless
// of whether anything persisted. This rewrite replaces that with the live module
// resolver:
//
//   GET /api/me/modules
//     -> { modules: [{ key, name, category, type, enabled, reason, requiresPlan,
//                        contributions }], enabledKeys }
//     the AUTHORITY for each module's resolved enabled state, the block reason,
//     and the plan it requires. Resolved server-side per tenant (TenantModule
//     overrides + plan + kill switches + dependencies, AND-ed by billing).
//
//   PUT /api/tenant/modules/:key  { enabled }   (tenant-admin only)
//     -> { moduleKey, enabled }  on 200
//     -> 402 PLAN_LIMIT          when enabling a module the plan does not entitle
//     toggles the tenant override. The toggle is OPTIMISTIC and REVERTS on any
//     non-200, and "Saved" shows ONLY on a real 200. No fake success.
//
// Client display metadata (description, category label/order, plan rank for the
// honest plan-locked state) comes from lib/modules/registry.ts — a static mirror
// of @cdc-ats/common MODULE_REGISTRY. It NEVER decides enabled state; that is the
// server's job. A module the server returns that is not mirrored still renders
// (falling back to the server name + key).
//
// Honest states throughout: real loading skeleton, real error with retry, real
// empty state, plan-locked rows show an Upgrade affordance (no toggle), and a
// non-admin sees read-only toggles with an explanatory note. Toggle / PanelHead /
// Card are reproduced locally exactly as the sibling settings panels define them.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getClientModule,
  categoryMeta,
  planEntitles,
  type ModulePlan,
} from "@/lib/modules/registry";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the sibling settings panels ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-pressed={on}
      disabled={disabled}
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
// envelope ({ data }) and bare shapes resolve to the payload. Surfaces a
// machine-readable error code (from the gateway error envelope) on the thrown
// Error so the caller can tell PLAN_LIMIT (402) apart from a transport failure.
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init?.headers ?? {}) },
  });
  const res = await r.json().catch(() => null);
  if (!r.ok) {
    const err = new Error(res?.error?.message ?? `${init?.method ?? "GET"} ${path} -> ${r.status}`) as Error & { status?: number; code?: string };
    err.status = r.status;
    err.code = res?.error?.code;
    throw err;
  }
  return res?.data ?? res;
}

// The /api/me/modules row shape (the server is the authority for `enabled`).
interface ServerModule {
  key: string;
  name: string;
  category: string;
  type: string;
  enabled: boolean;
  reason?: string;
  requiresPlan: string | null;
}

async function fetchModules(): Promise<ServerModule[]> {
  const data = await raw("/me/modules");
  const list: unknown = Array.isArray(data) ? data : data?.modules;
  if (!Array.isArray(list)) return [];
  return (list as any[]).map((m): ServerModule => ({
    key: String(m.key ?? ""),
    name: String(m.name ?? m.key ?? "Module"),
    category: String(m.category ?? "other"),
    type: String(m.type ?? "feature"),
    enabled: m.enabled === true,
    reason: m.reason ? String(m.reason) : undefined,
    requiresPlan: m.requiresPlan ?? null,
  }));
}

// PUT the tenant override. Resolves on a real 200 (the page then reload()s for
// the authoritative re-resolved state, since a toggle can cascade to dependent
// modules); throws (with .status / .code) on any failure so the caller can
// revert the optimistic flip + show the honest reason.
async function putModule(key: string, enabled: boolean): Promise<void> {
  await raw(`/tenant/modules/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ enabled }),
  });
}

/* ---- plan display tones (product chrome — not tenant data) ---- */
const PLAN_TONE: Record<string, { tone: string; bg: string }> = {
  FREE: { tone: "var(--c-ink-2)", bg: "var(--c-surface-3)" },
  STARTER: { tone: "var(--c-brand-ink)", bg: "var(--c-brand-tint)" },
  PROFESSIONAL: { tone: "var(--c-brand-ink)", bg: "var(--c-brand-tint)" },
  ENTERPRISE: { tone: "var(--c-ai-ink)", bg: "var(--c-ai-tint)" },
};
const PLAN_LABEL: Record<string, string> = {
  FREE: "Free", STARTER: "Starter", PROFESSIONAL: "Professional", ENTERPRISE: "Enterprise",
};

/* ----------------------------- panel ----------------------------- */
function FeaturesPanel() {
  const { user } = useCurrentUser();
  const role = String(user?.role ?? "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const tenantPlan = user?.tenant?.plan ?? null;

  const { data, loading, error, reload } = useData<ServerModule[]>(fetchModules);

  // Per-module local override of the server-resolved enabled flag, applied
  // optimistically while a toggle PUT is in flight. Reverted on failure. The
  // server-resolved value (data) is always the base truth; this Map only holds
  // an in-flight optimistic value keyed by module key.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<{ kind: "ok" | "warn"; msg: string } | null>(null);

  function flash(kind: "ok" | "warn", msg: string) {
    setNotice({ kind, msg });
    window.setTimeout(() => setNotice((n) => (n && n.msg === msg ? null : n)), 3400);
  }

  async function onToggle(mod: ServerModule, next: boolean) {
    if (!isAdmin || busy[mod.key]) return;
    setOptimistic((p) => ({ ...p, [mod.key]: next }));
    setBusy((p) => ({ ...p, [mod.key]: true }));
    setNotice(null);
    try {
      await putModule(mod.key, next);
      flash("ok", `${mod.name} ${next ? "enabled" : "disabled"}`);
      // Re-resolve from the server so dependency-driven changes (a module that
      // turns off because its dependency did) are reflected honestly.
      reload();
      // Clear the optimistic entry once the reload lands authoritative data.
      setOptimistic((p) => { const c = { ...p }; delete c[mod.key]; return c; });
    } catch (e) {
      // Revert the optimistic flip and surface the real reason.
      setOptimistic((p) => { const c = { ...p }; delete c[mod.key]; return c; });
      const err = e as Error & { status?: number; code?: string };
      if (err.status === 402 || err.code === "PLAN_LIMIT") {
        flash("warn", `${mod.name} is not included in your plan`);
      } else if (err.status === 403) {
        flash("warn", "You do not have permission to change modules");
      } else {
        flash("warn", `Could not update ${mod.name}`);
      }
    } finally {
      setBusy((p) => { const c = { ...p }; delete c[mod.key]; return c; });
    }
  }

  // ---- render states ----
  if (loading && !data) {
    return (
      <>
        <PanelHead title="Modules & features" desc="Enable features included in your plan. Changes apply going forward." />
        <Card pad={0}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, width: "32%", borderRadius: 6, background: "var(--c-surface-3)" }} />
                <div style={{ height: 10, width: "62%", borderRadius: 6, background: "var(--c-surface-3)", marginTop: 8, opacity: 0.7 }} />
              </div>
              <div style={{ width: 38, height: 22, borderRadius: 99, background: "var(--c-surface-3)" }} />
            </div>
          ))}
        </Card>
      </>
    );
  }

  if (error && !data) {
    return (
      <>
        <PanelHead title="Modules & features" desc="Enable features included in your plan. Changes apply going forward." />
        <Card pad={28}>
          <div style={{ textAlign: "center", color: "var(--c-ink-2)" }}>
            <Icon name="flag" size={22} style={{ color: "var(--c-warn)" }} />
            <p style={{ margin: "10px 0 14px", fontSize: "var(--fs-sm)" }}>We could not load your modules right now.</p>
            <Btn variant="soft" icon="settings" onClick={reload}>Try again</Btn>
          </div>
        </Card>
      </>
    );
  }

  const modules = data ?? [];

  if (modules.length === 0) {
    return (
      <>
        <PanelHead title="Modules & features" desc="Enable features included in your plan. Changes apply going forward." />
        <Card pad={28}>
          <div style={{ textAlign: "center", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>
            <Icon name="layers" size={22} style={{ color: "var(--c-ink-3)" }} />
            <p style={{ margin: "10px 0 0" }}>No modules are available for your account yet.</p>
          </div>
        </Card>
      </>
    );
  }

  // Group by category, ordered by the client registry's category order.
  const byCat = new Map<string, ServerModule[]>();
  for (const m of modules) {
    const list = byCat.get(m.category) ?? [];
    list.push(m);
    byCat.set(m.category, list);
  }
  const groups = [...byCat.entries()].sort(
    (a, b) => categoryMeta(a[0]).order - categoryMeta(b[0]).order,
  );

  return (
    <>
      <PanelHead
        title="Modules & features"
        desc="Enable modules included in your plan. Plan-locked modules show an upgrade path. Changes apply going forward."
        action={
          notice ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: notice.kind === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}>
              <Icon name={notice.kind === "ok" ? "check" : "flag"} size={15} stroke={2.4} /> {notice.msg}
            </span>
          ) : undefined
        }
      />

      {!isAdmin && (
        <div style={{ marginBottom: 16, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
          <Icon name="eye" size={15} style={{ color: "var(--c-ink-3)" }} />
          You can view your workspace modules here. Only a workspace admin can turn modules on or off.
        </div>
      )}

      {groups.map(([cat, items]) => {
        const meta = categoryMeta(cat);
        return (
          <div key={cat} style={{ marginBottom: 26 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", fontWeight: 700, display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name={meta.icon} size={16} style={{ color: "var(--c-ink-3)" }} />{meta.label}
            </h3>
            <Card>
              {items.map((mod, i) => {
                const cm = getClientModule(mod.key);
                const desc = cm?.description ?? "";
                const requiresPlan = (mod.requiresPlan ?? cm?.requiresPlan ?? null) as ModulePlan | null;
                // The plan entitles this module? (display gate — server still
                // enforces it on write). A null requiresPlan = every plan.
                const entitled = planEntitles(tenantPlan, requiresPlan);
                const on = optimistic[mod.key] ?? mod.enabled;
                const planTone = requiresPlan ? (PLAN_TONE[requiresPlan] ?? PLAN_TONE.PROFESSIONAL) : null;

                return (
                  <div key={mod.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                        {mod.name}
                        {!entitled && <Icon name="shield" size={12} style={{ color: "var(--c-ink-3)" }} />}
                        {requiresPlan && planTone && (
                          <Pill tone={planTone.tone} bg={planTone.bg}>{PLAN_LABEL[requiresPlan] ?? requiresPlan}</Pill>
                        )}
                        {on && entitled && <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)">On</Pill>}
                      </div>
                      {desc && <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{desc}</div>}
                      {/* Honest block reason when the module is off and the server
                          told us WHY (e.g. blocked by a disabled dependency). We
                          suppress the generic plan reason here because the plan
                          pill + Upgrade affordance already carry that. */}
                      {!on && entitled && mod.reason && !/plan/i.test(mod.reason) && (
                        <div style={{ fontSize: 11, color: "var(--c-warn)", marginTop: 3 }}>{mod.reason}</div>
                      )}
                    </div>

                    {!entitled ? (
                      // Plan-locked: no toggle. Honest upgrade affordance.
                      <Btn variant="outlineAi" size="sm" trailIcon="arrowUpRight" onClick={() => { window.location.href = "/billing"; }}>
                        Upgrade
                      </Btn>
                    ) : (
                      <Toggle
                        on={on}
                        disabled={!isAdmin || !!busy[mod.key]}
                        onClick={() => onToggle(mod, !on)}
                      />
                    )}
                  </div>
                );
              })}
            </Card>
          </div>
        );
      })}

      <div style={{ marginTop: 2, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "center" }}>
        <Icon name="shield" size={15} style={{ color: "var(--c-ai)" }} />
        Modules above your plan are locked. Upgrading unlocks them instantly with no migration. Disabling a module also turns off anything that depends on it.
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
