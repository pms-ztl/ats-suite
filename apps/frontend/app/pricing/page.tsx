"use client";
// app/(marketing)/pricing/page.tsx, 4-tier pricing with monthly/annual toggle.
import { useState } from "react";
import { Card, Button } from "@/components/aurora";
import type { Plan } from "@/lib/types";

const TIERS: { plan: Plan; m: number | null; a: number | null; blurb: string; feats: string[]; popular?: boolean }[] = [
  { plan: "FREE", m: 0, a: 0, blurb: "Try it on one role.", feats: ["1 requisition", "50 candidates / mo", "AI screening (advisory)"] },
  { plan: "STARTER", m: 149, a: 119, blurb: "For small teams.", feats: ["5 requisitions", "500 candidates / mo", "Custom screening fields"] },
  { plan: "PROFESSIONAL", m: 399, a: 319, blurb: "For scaling teams.", feats: ["Unlimited requisitions", "Bias auditing", "Agent suite + Copilot", "API"], popular: true },
  { plan: "ENTERPRISE", m: null, a: null, blurb: "Security & scale.", feats: ["SSO / SAML & SCIM", "Unlimited seats", "Dedicated success manager"] },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  return (
    <main className="mx-auto max-w-[1140px] px-6 py-16">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Pricing that scales with how you hire</h1>
        <div className="mt-5 inline-flex items-center gap-2 rounded-pill bg-surface-2 p-1">
          <button onClick={() => setAnnual(false)} className={"rounded-pill px-4 py-1.5 text-sm font-semibold " + (!annual ? "bg-surface" : "text-ink-2")}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={"rounded-pill px-4 py-1.5 text-sm font-semibold " + (annual ? "bg-surface" : "text-ink-2")}>Annual <span className="text-brand">save 20%</span></button>
        </div>
      </header>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <Card key={t.plan} material={t.popular ? "clay" : "flat"} className={"rounded-2xl border p-6 " + (t.popular ? "border-brand" : "border-line")}>
            {t.popular && <div className="mb-2 inline-block rounded-pill bg-brand px-2 py-0.5 text-xs font-bold text-on-brand">Most popular</div>}
            <div className="text-sm font-bold uppercase tracking-wide text-ink-2">{t.plan}</div>
            <div className="mt-2 font-mono text-3xl font-extrabold tabular-nums">{t.m === null ? "Custom" : t.m === 0 ? "$0" : `$${annual ? t.a : t.m}`}{t.m ? <span className="text-sm font-normal text-ink-3"> / mo</span> : null}</div>
            <p className="mt-2 text-sm text-ink-3">{t.blurb}</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">{t.feats.map((f) => <li key={f} className="flex gap-2"><span className="text-ok">✓</span>{f}</li>)}</ul>
            <a href={t.plan === "ENTERPRISE" ? "/get-started" : "/get-started"}><Button variant={t.popular ? "primary" : "soft"} className="mt-5 w-full">{t.plan === "ENTERPRISE" ? "Contact sales" : "Choose plan"}</Button></a>
          </Card>
        ))}
      </div>
    </main>
  );
}
