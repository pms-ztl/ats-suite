"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DollarSign, Zap, Activity, AlertTriangle, Bot, Crown, Sparkles, Rocket, Building2, ArrowUpRight, X, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const PLAN_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  FREE:         { icon: <Rocket className="h-4 w-4" />,   label: "Free",         color: "bg-muted text-muted-foreground" },
  STARTER:      { icon: <Zap className="h-4 w-4" />,      label: "Starter",      color: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  PROFESSIONAL: { icon: <Crown className="h-4 w-4" />,    label: "Professional", color: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  ENTERPRISE:   { icon: <Building2 className="h-4 w-4" />, label: "Enterprise",  color: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
};

interface PCR {
  id: string;
  fromPlan: string;
  toPlan: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason: string | null;
  requestedAt: string;
  decisionNote: string | null;
}

interface StripeSubscriptionDto {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Phase 30 — self-serve pricing. Display-only; the actual price lives in
// Stripe and is what the customer pays. Keep these in sync with the
// STRIPE_PRICE_* env vars billing-service uses.
const SELF_SERVE_TIERS = [
  {
    plan: "STARTER" as const,
    price: "$299",
    period: "/mo",
    headline: "For small teams hiring 5–20 people/year",
    bullets: ["5 seats", "20 active jobs", "500 resumes/mo", "Core AI agents", "14-day free trial"],
  },
  {
    plan: "PROFESSIONAL" as const,
    price: "$999",
    period: "/mo",
    headline: "For growth-stage teams scaling hiring",
    bullets: ["15 seats", "Unlimited jobs", "5,000 resumes/mo", "All 12 AI agents", "14-day free trial"],
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

interface AgentCost {
  agentType: string;
  runs: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

interface UsageSummary {
  totalRuns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  totalCostUsd: number;
  byAgent: AgentCost[];
  dailyCeiling: number;
  ceilingUtilization: number;
  isOverBudget: boolean;
}

interface BudgetInfo {
  allowed: boolean;
  currentCostUsd: number;
  ceilingUsd: number;
}

interface AgentStatus {
  agentType: string;
  enabled: boolean;
}

interface DailyPoint {
  date: string;
  cost: number;
}

function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function BillingPage() {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <AccessDenied />;

  const [monthly, setMonthly] = useState<UsageSummary | null>(null);
  const [today, setToday] = useState<UsageSummary | null>(null);
  const [budget, setBudget] = useState<BudgetInfo | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [dailyTrend, setDailyTrend] = useState<DailyPoint[]>([]);
  const [loading, setLoading] = useState(true);
  // Batch 3: plan upgrade workflow
  const { user } = useCurrentUser();
  const [planRequests, setPlanRequests] = useState<PCR[]>([]);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [requestedPlan, setRequestedPlan] = useState<string>("PROFESSIONAL");
  const [reason, setReason] = useState("");
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);

  // Phase 30 — Stripe self-serve subscription state.
  const [stripeSub, setStripeSub] = useState<StripeSubscriptionDto | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchStripeSub = useCallback(async () => {
    try {
      const sub = await apiFetch<StripeSubscriptionDto | null>("/billing/stripe/subscription");
      setStripeSub(sub);
    } catch { /* ignore — 404 means no Stripe sub yet */ }
  }, []);

  const startCheckout = async (plan: "STARTER" | "PROFESSIONAL") => {
    setCheckoutLoading(plan);
    try {
      const data = await apiFetch<{ url: string }>("/billing/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      // Hard-navigate so the back button returns the user to /billing.
      window.location.href = data.url;
    } catch (err: any) {
      const msg = err?.message ?? "Failed to start checkout";
      toast.error(msg.includes("not configured")
        ? "Stripe is not configured on this instance. Use 'Request plan change' instead."
        : msg);
      setCheckoutLoading(null);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const data = await apiFetch<{ url: string }>("/billing/stripe/portal", { method: "POST" });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  const fetchPlanRequests = useCallback(async () => {
    try {
      const data = await apiFetch<PCR[]>("/tenants/plan-change-requests");
      setPlanRequests(data ?? []);
    } catch { /* ignore */ }
  }, []);

  const submitUpgradeRequest = async () => {
    setSubmittingUpgrade(true);
    try {
      await apiFetch<unknown>("/tenants/plan-change-request", {
        method: "POST",
        body: JSON.stringify({ toPlan: requestedPlan, reason: reason || undefined }),
      });
      toast.success("Upgrade request sent. Platform admin will review shortly.");
      setUpgradeOpen(false);
      setReason("");
      fetchPlanRequests();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit request");
    }
    setSubmittingUpgrade(false);
  };

  const cancelRequest = async (id: string) => {
    try {
      await apiFetch<unknown>(`/tenants/plan-change-requests/${id}`, { method: "DELETE" });
      toast.success("Request cancelled");
      fetchPlanRequests();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to cancel");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [monthlyData, todayData, budgetData, agentData] = await Promise.all([
        apiFetch<UsageSummary>("/billing/usage?days=30"),
        apiFetch<UsageSummary>("/billing/usage?days=1"),
        apiFetch<BudgetInfo>("/billing/budget"),
        apiFetch<AgentStatus[]>("/billing/agents"),
      ]);
      setMonthly(monthlyData);
      setToday(todayData);
      setBudget(budgetData);
      setAgents(agentData);

      // Build a simple 30-day trend from monthly per-agent data
      // In production this would come from a dedicated daily breakdown endpoint
      const trend: DailyPoint[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        // Distribute monthly cost roughly across days (placeholder until daily endpoint)
        const dailyCost = i === 0
          ? (todayData?.totalCostUsd ?? 0)
          : (monthlyData?.totalCostUsd ?? 0) / 30 * (0.7 + Math.random() * 0.6);
        trend.push({ date: dateStr, cost: Math.round(dailyCost * 100) / 100 });
      }
      setDailyTrend(trend);
    } catch (err) {
      console.error("Failed to load billing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchPlanRequests();
    fetchStripeSub();
  }, [fetchData, fetchPlanRequests, fetchStripeSub]);

  // Phase 30 — show a toast for users returning from Stripe Checkout
  // (success or cancel). URL params are appended by Stripe and survive the
  // 302 back to /billing. We strip them after reading so a refresh doesn't
  // re-toast.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("stripe");
    if (status === "success") {
      toast.success("Checkout complete — your plan is being activated.");
      // Re-fetch after a short delay; Stripe webhook usually arrives within
      // 1-2 seconds but Checkout success can outrun it.
      setTimeout(() => { fetchStripeSub(); fetchData(); }, 1500);
    } else if (status === "cancel") {
      toast.info("Checkout cancelled. You can try again any time.");
    }
    if (status) {
      const url = new URL(window.location.href);
      url.searchParams.delete("stripe");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    }
  }, [fetchStripeSub, fetchData]);

  const toggleAgent = async (agentType: string, enabled: boolean) => {
    try {
      await apiFetch(`/billing/agents/${agentType}/toggle`, {
        method: "POST",
        body: JSON.stringify({ enabled }),
      });
      setAgents((prev) =>
        prev.map((a) => (a.agentType === agentType ? { ...a, enabled } : a))
      );
    } catch (err) {
      console.error("Failed to toggle agent:", err);
    }
  };

  const utilizationPct = budget
    ? Math.min(100, Math.round((budget.currentCostUsd / budget.ceilingUsd) * 100))
    : 0;
  const budgetWarning = utilizationPct >= 80;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentPlan = user?.tenant?.plan ?? "FREE";
  const planMeta = PLAN_META[currentPlan] ?? PLAN_META.FREE;
  const pendingReq = planRequests.find((r) => r.status === "PENDING");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cost &amp; Usage</h1>
          <p className="text-muted-foreground">Monitor AI agent spending and manage your plan</p>
        </div>
      </div>

      {/* ─── Plan & Subscription card ─── */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", planMeta.color)}>
                {planMeta.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Current plan</p>
                </div>
                <p className="text-xl font-bold">{planMeta.label}</p>
                {user?.tenant?.trialEndsAt && (
                  <p className="text-xs text-muted-foreground">
                    Trial ends {new Date(user.tenant.trialEndsAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pendingReq ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-amber-700 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Upgrade pending: {pendingReq.toPlan}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={() => cancelRequest(pendingReq.id)} className="h-7 gap-1">
                    <X className="h-3 w-3" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setUpgradeOpen(true)} className="glow-primary gap-1.5">
                  <ArrowUpRight className="h-4 w-4" /> Request plan change
                </Button>
              )}
            </div>
          </div>

          {/* Recent decisions */}
          {planRequests.filter((r) => r.status !== "PENDING").length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground mb-2">Recent decisions</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {planRequests.filter((r) => r.status !== "PENDING").slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      {r.fromPlan} → <strong className="text-foreground">{r.toPlan}</strong>
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-2xs",
                        r.status === "APPROVED" && "text-emerald-600 dark:text-emerald-400",
                        r.status === "REJECTED" && "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {r.status}
                    </Badge>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(r.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 30 — Stripe self-serve plan cards. Shown when the tenant is on
          FREE OR on a paid plan but wants to switch. Enterprise always uses
          the "Request plan change" approval flow below. */}
      {(currentPlan === "FREE" || currentPlan === "STARTER" || currentPlan === "PROFESSIONAL") && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Self-serve plans
                </CardTitle>
                <CardDescription>
                  Pay with credit card via Stripe — instant activation, cancel any time.
                </CardDescription>
              </div>
              {stripeSub && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="gap-1.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {portalLoading ? "Opening…" : "Manage subscription"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {SELF_SERVE_TIERS.map((tier) => {
                const isCurrent = currentPlan === tier.plan;
                const isLoading = checkoutLoading === tier.plan;
                const meta = PLAN_META[tier.plan]!;
                return (
                  <div
                    key={tier.plan}
                    className={cn(
                      "rounded-xl border p-5 transition-colors",
                      isCurrent ? "border-primary/60 bg-primary/5" : "hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", meta.color)}>
                          {meta.icon}
                        </div>
                        <p className="font-semibold">{meta.label}</p>
                      </div>
                      {isCurrent && <Badge variant="outline" className="text-2xs">Current</Badge>}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-bold">{tier.price}</span>
                      <span className="text-sm text-muted-foreground">{tier.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{tier.headline}</p>
                    <ul className="space-y-1 mb-4 text-xs text-muted-foreground">
                      {tier.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">·</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      className="w-full"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || isLoading}
                      onClick={() => startCheckout(tier.plan)}
                    >
                      {isCurrent ? "Active" : isLoading ? "Redirecting…" : currentPlan === "FREE" ? `Start ${tier.plan} trial` : `Switch to ${tier.plan}`}
                    </Button>
                  </div>
                );
              })}
            </div>
            <p className="text-2xs text-muted-foreground mt-3 text-center">
              Need Enterprise pricing or a custom contract? Use "Request plan change" above to talk to our team.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Budget warning banner */}
      {budgetWarning && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">
              Budget {utilizationPct >= 100 ? "exceeded" : "warning"}: {utilizationPct}% of daily ceiling used
            </p>
            <p className="text-sm">
              {formatUsd(budget?.currentCostUsd ?? 0)} of {formatUsd(budget?.ceilingUsd ?? 50)} daily limit.
              {utilizationPct >= 100 && " Agent runs are paused until tomorrow."}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(today?.totalCostUsd ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{today?.totalRuns ?? 0} runs today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(monthly?.totalCostUsd ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{monthly?.totalRuns ?? 0} total runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationPct}%</div>
            <Progress value={utilizationPct} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {formatUsd(budget?.currentCostUsd ?? 0)} / {formatUsd(budget?.ceilingUsd ?? 50)} daily
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter((a) => a.enabled).length} / {agents.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {agents.filter((a) => !a.enabled).length} disabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Cost Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cost Trend (30 days)</CardTitle>
          <CardDescription>Estimated daily AI agent cost in USD</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip formatter={(value) => [formatUsd(Number(value)), "Cost"]} />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per-Agent Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Agent Cost Breakdown (30 days)</CardTitle>
          <CardDescription>Cost, token usage, and run counts by agent type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Agent Type</th>
                  <th className="pb-2 font-medium text-right">Runs</th>
                  <th className="pb-2 font-medium text-right">Tokens In</th>
                  <th className="pb-2 font-medium text-right">Tokens Out</th>
                  <th className="pb-2 font-medium text-right">Cost USD</th>
                  <th className="pb-2 font-medium text-right">Avg Cost/Run</th>
                </tr>
              </thead>
              <tbody>
                {(monthly?.byAgent ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No agent runs in the last 30 days
                    </td>
                  </tr>
                ) : (
                  monthly?.byAgent.map((agent) => (
                    <tr key={agent.agentType} className="border-b last:border-0">
                      <td className="py-2 font-medium">{agent.agentType}</td>
                      <td className="py-2 text-right">{agent.runs}</td>
                      <td className="py-2 text-right">{formatTokens(agent.tokensIn)}</td>
                      <td className="py-2 text-right">{formatTokens(agent.tokensOut)}</td>
                      <td className="py-2 text-right font-mono">{formatUsd(agent.costUsd)}</td>
                      <td className="py-2 text-right font-mono">
                        {agent.runs > 0 ? formatUsd(agent.costUsd / agent.runs) : "$0.00"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {(monthly?.byAgent ?? []).length > 0 && (
                <tfoot>
                  <tr className="border-t font-semibold">
                    <td className="pt-2">Total</td>
                    <td className="pt-2 text-right">{monthly?.totalRuns ?? 0}</td>
                    <td className="pt-2 text-right">{formatTokens(monthly?.totalTokensIn ?? 0)}</td>
                    <td className="pt-2 text-right">{formatTokens(monthly?.totalTokensOut ?? 0)}</td>
                    <td className="pt-2 text-right font-mono">{formatUsd(monthly?.totalCostUsd ?? 0)}</td>
                    <td className="pt-2 text-right font-mono">
                      {(monthly?.totalRuns ?? 0) > 0
                        ? formatUsd((monthly?.totalCostUsd ?? 0) / (monthly?.totalRuns ?? 1))
                        : "$0.00"}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Agent Kill Switches */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Kill Switches</CardTitle>
          <CardDescription>
            Enable or disable specific AI agents. Disabled agents will reject new runs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.agentType}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{agent.agentType}</p>
                    <Badge variant={agent.enabled ? "default" : "secondary"} className="mt-1">
                      {agent.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={agent.enabled}
                  onCheckedChange={(checked) => toggleAgent(agent.agentType, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade request dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-primary" />
              Request plan change
            </DialogTitle>
            <DialogDescription>
              Submit a request to change your plan. A platform admin will review and apply it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target plan</label>
              <Select value={requestedPlan} onValueChange={setRequestedPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLAN_META).map(([k, m]) => (
                    <SelectItem key={k} value={k} disabled={k === currentPlan}>
                      <span className="flex items-center gap-2">{m.icon} {m.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. We're scaling our hiring this quarter and need more seats…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)} disabled={submittingUpgrade}>Cancel</Button>
            <Button onClick={submitUpgradeRequest} disabled={submittingUpgrade || requestedPlan === currentPlan} className="glow-primary">
              {submittingUpgrade ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
