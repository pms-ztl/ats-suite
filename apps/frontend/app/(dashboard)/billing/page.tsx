"use client";
// app/(dashboard)/billing/page.tsx - EXACT Claude Design "Aurora" billing &
// plan screen. Ported faithfully from claude-design/screen-billing.jsx: plan
// card, usage meters, payment method, invoices, and the "Choose your plan"
// upgrade modal with tiers.
//
// WIRING (rule 3): the gateway exposes GET /billing/usage?days=30 (an AI agent
// run / token / cost rollup, the only billing numbers genuinely measured), so
// the usage meters read from it. The current plan comes from
// useCurrentUser().user.tenant.plan. Tier prices/features are static marketing
// chrome and kept verbatim. We do NOT fabricate invoices or a payment card, so
// those sections render honest EmptyStates instead of fake rows.
import { useState } from "react";
import { Btn, Pill, Reveal } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";

/* ----------------------------- inline raw() ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try {
    t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const json = await res.json();
  // Gateway wraps successes as { success, data }; unwrap to the payload.
  return json?.data ?? json;
}

/* ------------------------------ real types ------------------------------ */
type Plan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
type UsageAgent = { agentType: string; runs: number; tokensIn: number; tokensOut: number; costUsd: number };
type UsageSummary = {
  days: number;
  totalRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  byAgent: UsageAgent[];
};

/* ------------------- static chrome: plan + tier catalog ------------------ */
// Display-only marketing copy (the customer-facing price lives in Stripe).
// Kept verbatim as the prototype's static chrome; these are NOT live figures.
const PLAN_META: Record<Plan, { label: string; price: number | null; cycle: string }> = {
  FREE:         { label: "FREE",         price: 0,    cycle: "month" },
  STARTER:      { label: "STARTER",      price: 299,  cycle: "month" },
  PROFESSIONAL: { label: "PROFESSIONAL", price: 999,  cycle: "month" },
  ENTERPRISE:   { label: "ENTERPRISE",   price: null, cycle: "month" },
};

const TIERS: { n: Plan; price: number | null; feats: string[] }[] = [
  { n: "STARTER",      price: 299,  feats: ["5 seats", "20 active jobs", "500 resumes / mo", "Core AI agents"] },
  { n: "PROFESSIONAL", price: 999,  feats: ["15 seats", "Unlimited jobs", "5,000 resumes / mo", "All 12 AI agents"] },
  { n: "ENTERPRISE",   price: null, feats: ["Unlimited seats", "SSO & SAML", "Dedicated support", "Custom SLAs"] },
];

const m$ = (n: number) => "$" + n.toLocaleString();

const fStylesLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".06em",
};

/* ------------------------------ usage meter ----------------------------- */
function UsageMeter({ k, used, limit }: { k: string; used: number; limit: number | string }) {
  const unlimited = typeof limit === "string";
  const pct = unlimited ? Math.min(100, (used / 50000) * 100) : Math.min(100, (used / ((limit as number) || 1)) * 100);
  const hot = !unlimited && pct >= 80;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>{k}</span>
        <span className="mono tnum" style={{ fontSize: 12, color: hot ? "var(--c-warn)" : "var(--c-ink-3)" }}>
          {used.toLocaleString()} <span style={{ color: "var(--c-ink-3)" }}>/ {unlimited ? limit : (limit as number).toLocaleString()}</span>
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", borderRadius: 99,
          background: hot ? "linear-gradient(90deg, var(--c-warn), var(--c-warn))" : "linear-gradient(90deg, var(--c-brand-2), var(--c-brand))",
          animation: "growx 1s var(--ease-out) both" }} />
      </div>
    </div>
  );
}

export default function BillingScreen() {
  const { user } = useCurrentUser();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const plan = (user?.tenant?.plan ?? "FREE") as Plan;
  const meta = PLAN_META[plan] ?? PLAN_META.FREE;
  const renews = user?.tenant?.trialEndsAt
    ? `Trial ends ${new Date(user.tenant.trialEndsAt).toLocaleDateString()}`
    : "Renews monthly";

  // Real usage rollup from the gateway. Falls back gracefully on 404 / error.
  const usage = useData<UsageSummary>(() => raw("/billing/usage?days=30"));
  const u = usage.data;

  // Build usage meters from the real payload. Limits use placeholders where
  // the product has no hard monthly cap (runs / tokens are unbounded today).
  const meters = u
    ? [
        { k: "Agent runs", used: u.totalRuns ?? 0, limit: "unlimited" as const },
        { k: "Tokens in", used: u.totalTokensIn ?? 0, limit: "unlimited" as const },
        { k: "Tokens out", used: u.totalTokensOut ?? 0, limit: "unlimited" as const },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Billing &amp; plan</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Manage your subscription, usage, and invoices.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18, alignItems: "start" }}>
        {/* plan card */}
        <Reveal i={0}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--c-brand) 30%, var(--c-line))",
            background: "linear-gradient(135deg, var(--c-brand-tint) 0%, transparent 60%)", padding: 24, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Pill tone="var(--c-brand)" bg="var(--c-surface)" style={{ fontSize: 10, fontWeight: 800 }}>{meta.label}</Pill>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
                  {meta.price !== null
                    ? <><span className="mono" style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>{m$(meta.price)}</span>
                        <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>/ {meta.cycle}</span></>
                    : <span className="mono" style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Custom</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginTop: 4 }}>{renews}</div>
              </div>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--c-brand)", color: "white", display: "grid", placeItems: "center", boxShadow: "var(--e1)" }}>
                <Icon name="rocket" size={24} />
              </span>
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
              <Btn variant="primary" icon="arrowUpRight" onClick={() => setShowUpgrade(true)}>Upgrade to Enterprise</Btn>
              <Btn variant="soft" onClick={() => setShowUpgrade(true)}>Change plan</Btn>
            </div>
          </div>
        </Reveal>

        {/* usage */}
        <Reveal i={1}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ ...fStylesLabel, marginBottom: 14 }}>Usage this period</div>
            {usage.loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[26px] rounded-[8px]" />)}
              </div>
            )}
            {!usage.loading && (usage.error || !u) && (
              <EmptyState title="No usage yet" body="When your AI agents run, their consumption shows up here for this billing period." />
            )}
            {!usage.loading && u && (
              (u.totalRuns ?? 0) === 0
                ? <EmptyState title="No usage yet" body="When your AI agents run, their consumption shows up here for this billing period." />
                : <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {meters.map((mm) => <UsageMeter key={mm.k} {...mm} />)}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 6, borderTop: "1px solid var(--c-line)" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>AI cost (30d)</span>
                      <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700 }}>{m$(Number((u.totalCostUsd ?? 0).toFixed(2)))}</span>
                    </div>
                  </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* payment + invoices */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 18, alignItems: "start" }}>
        {/* payment method */}
        <Reveal i={2}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ ...fStylesLabel, marginBottom: 12 }}>Payment method</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px dashed var(--c-line)", background: "var(--c-surface-2)" }}>
              <span style={{ width: 38, height: 26, borderRadius: 6, background: "var(--c-surface-3)", color: "var(--c-ink-3)", display: "grid", placeItems: "center" }}>
                <Icon name="card" size={15} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>No card on file</div>
                <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>Add a payment method to upgrade.</div>
              </div>
            </div>
            <Btn variant="soft" size="sm" icon="card" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>Add card</Btn>
          </div>
        </Reveal>

        {/* invoices */}
        <Reveal i={3}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: "1px solid var(--c-line)" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Invoices</span>
              <button style={{ fontSize: 12, fontWeight: 600, color: "var(--c-brand)", background: "none", border: "none", cursor: "pointer" }}>Download all</button>
            </div>
            <div style={{ padding: "28px 18px" }}>
              <EmptyState title="No invoices yet" body="Paid invoices appear here once your subscription bills. Nothing has been charged." />
            </div>
          </div>
        </Reveal>
      </div>

      {/* upgrade modal */}
      {showUpgrade && (
        <div onMouseDown={(e) => { if (e.target === e.currentTarget) setShowUpgrade(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 24,
            background: "color-mix(in oklab, var(--c-bg-deep) 50%, transparent)", animation: "fadein .2s" }}>
          <div style={{ width: "min(820px, 96vw)", borderRadius: "var(--r-2xl)", background: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "var(--e3)", padding: 26, animation: "rise .25s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Choose your plan</h2>
              <button onClick={() => setShowUpgrade(false)} aria-label="Close"
                style={{ width: 32, height: 32, borderRadius: 99, border: "1px solid var(--c-line)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", cursor: "pointer" }}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
              You are on {meta.label}. Upgrade for SSO, integrations, and unlimited seats.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {TIERS.map((t) => {
                const cur = t.n === plan;
                return (
                  <div key={t.n} style={{ borderRadius: "var(--r-xl)", padding: 18, border: "1.5px solid",
                    borderColor: cur ? "var(--c-brand)" : "var(--c-line)",
                    background: t.n === "ENTERPRISE" ? "linear-gradient(160deg, var(--c-ai-tint), transparent 60%)" : "var(--c-surface)", position: "relative" }}>
                    {cur && <span style={{ position: "absolute", top: -9, left: 16, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-on-brand)", background: "var(--c-brand)", padding: "2px 9px", borderRadius: 99 }}>Current</span>}
                    <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".02em" }}>{t.n}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "8px 0 14px" }}>
                      {t.price !== null
                        ? <><span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{m$(t.price)}</span><span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>/mo</span></>
                        : <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>Custom</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                      {t.feats.map((f) => (
                        <span key={f} style={{ fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 7, alignItems: "center" }}>
                          <Icon name="check" size={13} style={{ color: t.n === "ENTERPRISE" ? "var(--c-ai)" : "var(--c-brand)" }} />{f}
                        </span>
                      ))}
                    </div>
                    {cur
                      ? <Btn variant="soft" style={{ width: "100%", justifyContent: "center" }}>Current plan</Btn>
                      : <Btn variant={t.n === "ENTERPRISE" ? "ai" : "primary"} style={{ width: "100%", justifyContent: "center" }}>{t.n === "ENTERPRISE" ? "Contact sales" : "Switch plan"}</Btn>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
