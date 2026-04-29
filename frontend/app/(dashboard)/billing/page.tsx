"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DollarSign, Zap, Activity, AlertTriangle, Bot } from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

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
  }, [fetchData]);

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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cost & Usage</h1>
        <p className="text-muted-foreground">Monitor AI agent spending and manage budgets</p>
      </div>

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
    </div>
  );
}
