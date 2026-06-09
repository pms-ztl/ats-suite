"use client";
// app/(dashboard)/settings/billing/page.tsx
// VERBATIM port of claude-design/screen-billing.jsx (BillingScreen): the billing &
// subscription panel, current-plan card + per-meter usage block + payment method +
// invoice history table + a "Choose your plan" upgrade modal with the three tier
// cards. Markup, inline styles, and copy are copied element-for-element from the
// prototype; the ONLY mechanical changes are the guide's required mappings:
//   - kit refs BL.Pill / BL.Btn -> imported <Pill> / <Btn>; Icon imported; the
//     prototype's BL.fStyles.label -> the local `fStylesLabel` const (same values).
//   - every palette token var(--x) -> its full-color companion var(--c-x); effect/
//     size tokens (--r*, --e1, --fs-*, --ease-out) stay bare.
//   - the React-global shim (const {useState:uSbil}=React) and window export are
//     dropped in favour of a normal React import.
// DATA: per the port prompt this screen keeps the prototype's EXAMPLE billing
// content (the `BILLING` object from set-data.jsx) verbatim as invoice rows + usage
// numbers, since there is no billing endpoint; the only live wiring is
// useCurrentUser().user.tenant.plan, used to highlight the active tier in the
// upgrade modal. Plan-switch interactions are useState. This is a dashboard-content
// page: outer <div className="mx-auto w-full max-w-[1200px]">, no <main>/p-6.
import { useState } from "react";
import { Pill, Btn } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toTitleCase } from "@/lib/utils";

type CSS = React.CSSProperties;

const m$ = (n: number) => "$" + n.toLocaleString();

// BL.fStyles.label, ported verbatim from foundations.jsx (same values), palette
// token converted to its full-color companion.
const fStylesLabel: CSS = {
  fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)",
};

/* ---- example billing content, verbatim from set-data.jsx (window.BILLING) ---- */
type Tier = { n: string; price: number | null; feats: string[]; cur: boolean };
const BILLING: {
  plan: string; price: number; cycle: string; renews: string;
  usage: { k: string; used: number; limit: number | string }[];
  invoices: { id: string; date: string; amount: number; status: string }[];
  tiers: Tier[];
} = {
  plan: "PROFESSIONAL", price: 399, cycle: "month", renews: "Jun 24, 2026",
  usage: [
    { k: "Seats", used: 12, limit: 15 },
    { k: "Resumes this month", used: 3180, limit: 5000 },
    { k: "Active jobs", used: 38, limit: "Unlimited" },
    { k: "AI agent runs", used: 8420, limit: 50000 },
  ],
  invoices: [
    { id: "INV-2026-005", date: "May 24, 2026", amount: 399, status: "Paid" },
    { id: "INV-2026-004", date: "Apr 24, 2026", amount: 399, status: "Paid" },
    { id: "INV-2026-003", date: "Mar 24, 2026", amount: 399, status: "Paid" },
    { id: "INV-2026-002", date: "Feb 24, 2026", amount: 149, status: "Paid" },
  ],
  tiers: [
    { n: "STARTER", price: 149, feats: ["5 seats", "20 jobs", "500 resumes/mo", "Core agents"], cur: false },
    { n: "PROFESSIONAL", price: 399, feats: ["15 seats", "Unlimited jobs", "5,000 resumes/mo", "All 12 agents"], cur: true },
    { n: "ENTERPRISE", price: null, feats: ["Unlimited seats", "SSO / SAML", "Integrations", "Dedicated support"], cur: false },
  ],
};

function UsageMeter({ k, used, limit }: { k: string; used: number; limit: number | string }) {
  const unlimited = typeof limit === "string";
  const pct = unlimited ? Math.min(100, (used / 50000) * 100) : Math.min(100, (used / limit) * 100);
  const hot = !unlimited && pct >= 80;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>{k}</span>
        <span className="mono tnum" style={{ fontSize: 12, color: hot ? "var(--c-warn)" : "var(--c-ink-3)" }}>{used.toLocaleString()} <span style={{ color: "var(--c-ink-3)" }}>/ {unlimited ? limit : limit.toLocaleString()}</span></span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", borderRadius: 99, background: hot ? "linear-gradient(90deg, var(--c-warn), var(--c-warn))" : "linear-gradient(90deg, var(--c-brand-2), var(--c-brand))", animation: "growx 1s var(--ease-out) both" }} />
      </div>
    </div>
  );
}

export default function BillingScreen() {
  const b = BILLING;
  const { user } = useCurrentUser();
  const [showUpgrade, setShowUpgrade] = useState(false);
  // Highlight the active tier from the real tenant plan; fall back to the
  // prototype's own `cur` flag if the plan is unknown.
  const activePlan = user?.tenant?.plan;
  const isCur = (t: Tier) => (activePlan ? t.n === activePlan : t.cur);
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Billing &amp; plan</h1>
            <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Manage your subscription, usage, and invoices.</p></div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18, alignItems: "start" }}>
          {/* plan card */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1.5px solid color-mix(in oklab, var(--c-brand) 30%, var(--c-line))", background: "linear-gradient(135deg, var(--c-brand-tint) 0%, transparent 60%)", padding: 24, boxShadow: "var(--e1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <Pill tone="var(--c-brand)" bg="var(--c-surface)" style={{ fontSize: 10, fontWeight: 800 }}>{toTitleCase(b.plan)}</Pill>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}><span className="mono" style={{ fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em" }}>{m$(b.price)}</span><span style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>/ {b.cycle}</span></div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginTop: 4 }}>Renews {b.renews}</div>
              </div>
              <span style={{ width: 48, height: 48, borderRadius: 14, background: "var(--c-brand)", color: "white", display: "grid", placeItems: "center", boxShadow: "var(--e1)" }}><Icon name="rocket" size={24} /></span>
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
              <Btn variant="primary" icon="arrowUpRight" onClick={() => setShowUpgrade(true)}>Upgrade to Enterprise</Btn>
              <Btn variant="soft" onClick={() => setShowUpgrade(true)}>Change plan</Btn>
            </div>
          </div>
          {/* usage */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ ...fStylesLabel, marginBottom: 14 }}>Usage this period</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{b.usage.map(u => <UsageMeter key={u.k} {...u} />)}</div>
          </div>
        </div>

        {/* payment + invoices */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 18, alignItems: "start" }}>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 20, boxShadow: "var(--e1)" }}>
            <div style={{ ...fStylesLabel, marginBottom: 12 }}>Payment method</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "13px 15px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
              <span style={{ width: 38, height: 26, borderRadius: 6, background: "linear-gradient(135deg, var(--c-ink), var(--c-ink-2))", color: "white", display: "grid", placeItems: "center" }}><Icon name="card" size={15} /></span>
              <div style={{ flex: 1 }}><div className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>&bull;&bull;&bull;&bull; 4242</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>Expires 08 / 28</div></div>
            </div>
            <Btn variant="soft" size="sm" icon="copy" style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>Update card</Btn>
          </div>
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: "1px solid var(--c-line)" }}><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Invoices</span><button style={{ fontSize: 12, fontWeight: 600, color: "var(--c-brand)", background: "none", border: "none", cursor: "pointer" }}>Download all</button></div>
            {b.invoices.map((iv, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 80px 80px 60px", gap: 12, alignItems: "center", padding: "12px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{iv.id}</span>
                <span style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{iv.date}</span>
                <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>{m$(iv.amount)}</span>
                <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{iv.status}</Pill>
                <button style={{ fontSize: 11.5, color: "var(--c-ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, textAlign: "right" }}>PDF</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* upgrade modal */}
      {showUpgrade && (
        <div onMouseDown={e => { if (e.target === e.currentTarget) setShowUpgrade(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 24, background: "color-mix(in oklab, var(--c-bg-deep) 50%, transparent)", animation: "fadein .2s" }}>
          <div style={{ width: "min(820px, 96vw)", borderRadius: "var(--r-2xl)", background: "var(--c-surface)", border: "1px solid var(--c-line)", boxShadow: "var(--e3)", padding: 26, animation: "rise .25s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Choose your plan</h2><button onClick={() => setShowUpgrade(false)} style={{ width: 32, height: 32, borderRadius: 99, border: "1px solid var(--c-line)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", cursor: "pointer" }}><Icon name="x" size={16} /></button></div>
            <p style={{ margin: "0 0 20px", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>You&apos;re on Professional. Upgrade for SSO, integrations, and unlimited seats.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {b.tiers.map(t => {
                const cur = isCur(t);
                return (
                <div key={t.n} style={{ borderRadius: "var(--r-xl)", padding: 18, border: "1.5px solid", borderColor: cur ? "var(--c-brand)" : "var(--c-line)", background: t.n === "ENTERPRISE" ? "linear-gradient(160deg, var(--c-ai-tint), transparent 60%)" : "var(--c-surface)", position: "relative" }}>
                  {cur && <span style={{ position: "absolute", top: -9, left: 16, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-on-brand)", background: "var(--c-brand)", padding: "2px 9px", borderRadius: 99 }}>Current</span>}
                  <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: ".02em" }}>{toTitleCase(t.n)}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "8px 0 14px" }}>{t.price ? <><span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{m$(t.price)}</span><span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>/mo</span></> : <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>Custom</span>}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>{t.feats.map(f => <span key={f} style={{ fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 7, alignItems: "center" }}><Icon name="check" size={13} style={{ color: t.n === "ENTERPRISE" ? "var(--c-ai)" : "var(--c-brand)" }} />{f}</span>)}</div>
                  {cur ? <Btn variant="soft" style={{ width: "100%", justifyContent: "center" }}>Current plan</Btn> : <Btn variant={t.n === "ENTERPRISE" ? "ai" : "primary"} style={{ width: "100%", justifyContent: "center" }}>{t.n === "ENTERPRISE" ? "Contact sales" : "Downgrade"}</Btn>}
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
