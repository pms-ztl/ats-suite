"use client";
// components/cd/billing-live.tsx
// Wires the byte-exact CD BillingScreen to real data: the plan comes from
// useCurrentUser().tenant.plan and the usage meters from GET /billing/usage?days=30
// (the only genuinely-measured billing numbers: agent runs + tokens). This FREE
// tenant has no card or invoices, so those render as honest placeholders (no
// fabricated card number, no invoice rows). The tier catalog is static plan chrome.
import { BillingScreen } from "./BillingScreen";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { requestPlanChange } from "@/lib/api";
import { toast } from "sonner";
import type { BillingData, BillingUsage, BillingTier, BillingSpendMonth } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string): Promise<unknown> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const json = await res.json();
  return (json as { data?: unknown })?.data ?? json;
}

type UsageSummary = {
  totalRuns: number; totalTokensIn: number; totalTokensOut: number; totalCostUsd: number;
  // Real per-agent metering from AgentRunCost (last 30 days), already returned by /billing/usage.
  byAgent?: { agentType: string; runs: number; costUsd: number }[];
};
const PLAN_PRICE: Record<string, number> = { FREE: 0, STARTER: 299, PROFESSIONAL: 999, ENTERPRISE: 0 };
const TIERS: BillingTier[] = [
  { n: "STARTER", price: 299, feats: ["5 seats", "20 active jobs", "500 resumes / mo", "Core AI agents"] },
  { n: "PROFESSIONAL", price: 999, feats: ["15 seats", "Unlimited jobs", "5,000 resumes / mo", "All 12 AI agents"] },
  { n: "ENTERPRISE", price: null, feats: ["Unlimited seats", "SSO and SAML", "Dedicated support", "Custom SLAs"] },
];

type SpendTrendResp = { trend: BillingSpendMonth[]; totalSpend: number };

export function BillingLive() {
  const { user } = useCurrentUser();
  const usage = useData<UsageSummary>(() => raw("/billing/usage?days=30") as Promise<UsageSummary>);
  // Real AI spend over the last ~12 months (monthly buckets; the screen plots
  // the per-month totals as a comet trail). Honest empty array when the tenant
  // has recorded no AgentRunCost rows.
  const spend = useData<SpendTrendResp>(() => raw("/billing/spend-trend") as Promise<SpendTrendResp>);
  const spendTrend: BillingSpendMonth[] = spend.data?.trend ?? [];

  const plan = (user?.tenant?.plan as string) ?? "FREE";
  const renews = user?.tenant?.trialEndsAt ? new Date(user.tenant.trialEndsAt).toLocaleDateString() : "monthly";
  const u = usage.data;
  const meters: BillingUsage[] = u && (u.totalRuns ?? 0) > 0
    ? [
        { k: "Agent runs", used: u.totalRuns ?? 0, limit: "unlimited" },
        { k: "Tokens in", used: u.totalTokensIn ?? 0, limit: "unlimited" },
        { k: "Tokens out", used: u.totalTokensOut ?? 0, limit: "unlimited" },
      ]
    : [];

  // Per-agent workload for the flow ribbon: label = agentType, thickness = real
  // metered runs, sub = the agent's actual 30d cost. No rows -> the ribbon's
  // honest empty-state.
  const agentWorkload = (u?.byAgent ?? []).map((a) => ({
    label: a.agentType,
    n: a.runs,
    sub: "₹" + Number(a.costUsd ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
  }));

  // Spend share by provider: sum each provider's real metered AgentRunCost spend
  // (BillingSpendMonth.byProvider) across the whole loaded window. n = raw spend so
  // the waffle's proportions are honest; empty array -> WaffleField's empty-state.
  const providerTotals = new Map<string, number>();
  for (const month of spendTrend) {
    for (const [provider, amt] of Object.entries(month.byProvider ?? {})) {
      providerTotals.set(provider, (providerTotals.get(provider) ?? 0) + Number(amt ?? 0));
    }
  }
  const providerSpend = Array.from(providerTotals.entries())
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([label, n]) => ({ label, n }));

  const data: BillingData = {
    plan,
    price: PLAN_PRICE[plan] ?? 0,
    cycle: "month",
    renews,
    usage: meters,
    card: { last4: "----", exp: "Not on file" },
    invoices: [],
    tiers: TIERS.map((t) => ({ ...t, cur: t.n === plan })),
  };

  const onSelectPlan = async (toPlan: string) => {
    try {
      await requestPlanChange(toPlan);
      const pretty = toPlan.charAt(0) + toPlan.slice(1).toLowerCase();
      toast.success(`Plan change to ${pretty} requested — it goes to your workspace owner for approval.`);
    } catch (e: any) {
      toast.error(e?.message || "Could not submit the plan change request.");
    }
  };

  return <BillingScreen data={data} spendTrend={spendTrend} agentWorkload={agentWorkload} providerSpend={providerSpend} onSelectPlan={onSelectPlan} />;
}
