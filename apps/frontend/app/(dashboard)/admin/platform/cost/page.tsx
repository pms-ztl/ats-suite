"use client";

/**
 * Admin → Platform → Cost
 *
 * Cross-tenant AI spend dashboard. Shows where the money is going across
 * every tenant in one view:
 *
 *   - Totals (runs / cost / tokens) for the selected window
 *   - Per-tenant ranking (who's spending the most)
 *   - Per-agent rollup (which agent is the cost driver)
 *   - Time-series of daily cost
 *
 * Backend: /api/super-admin/platform/cost?days=30
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, DollarSign, Activity, Loader2, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface ByTenant {
  tenantId: string;
  plan: string;
  runs: number;
  costUsd: number;
  tokensIn: number;
  tokensOut: number;
}
interface ByAgent {
  agentType: string;
  runs: number;
  costUsd: number;
}
interface ByDay {
  day: string;
  costUsd: number;
  runs: number;
}
interface Response {
  periodDays: number;
  totals: { runs: number; costUsd: number; tokensIn: number; tokensOut: number };
  byTenant: ByTenant[];
  byAgent: ByAgent[];
  byDay: ByDay[];
}

const PRESETS = [7, 30, 90];

export default function PlatformCostPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Response | null>(null);

  useEffect(() => {
    void load(days);
  }, [days]);

  async function load(d: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/platform/cost?days=${d}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      setData(body.data ?? body);
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't load cost dashboard");
    } finally {
      setLoading(false);
    }
  }

  const avgPerRun = useMemo(() => {
    if (!data || data.totals.runs === 0) return 0;
    return data.totals.costUsd / data.totals.runs;
  }, [data]);

  if (loading || !data) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading cost dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
      </Link>

      <PageHeader
        title="AI cost across all tenants"
        description="Every agent run, every tenant. Sort and slice to find spike causes."
        actions={
          <div className="flex items-center gap-1">
            {PRESETS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={days === p ? "default" : "outline"}
                onClick={() => setDays(p)}
              >
                {p}d
              </Button>
            ))}
          </div>
        }
      />

      {/* Totals strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Activity className="w-4 h-4" />} label="Agent runs" value={data.totals.runs.toLocaleString()} />
        <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total cost" value={`$${data.totals.costUsd.toFixed(2)}`} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Avg per run" value={`$${avgPerRun.toFixed(4)}`} />
        <StatCard
          label="Tokens (in + out)"
          icon={<Activity className="w-4 h-4" />}
          value={`${((data.totals.tokensIn + data.totals.tokensOut) / 1000).toFixed(1)}k`}
        />
      </div>

      {/* Daily cost area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily cost</CardTitle>
          <CardDescription>Sum of all agent runs across all tenants per day.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.byDay.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No runs in this window.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.byDay} margin={{ left: 8, right: 8 }}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                <YAxis fontSize={10} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                <Tooltip
                  formatter={(v: any) => [`$${Number(v).toFixed(4)}`, "Cost"]}
                  labelFormatter={(d) => d}
                  contentStyle={{ fontSize: 12 }}
                />
                <Area type="monotone" dataKey="costUsd" stroke="oklch(var(--primary))" fill="url(#costGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* By tenant — top spenders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top tenants by spend</CardTitle>
            <CardDescription>Sorted by cost; click a tenant to inspect.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Tenant</th>
                  <th className="text-right px-4 py-2 font-medium">Plan</th>
                  <th className="text-right px-4 py-2 font-medium">Runs</th>
                  <th className="text-right px-4 py-2 font-medium">Cost</th>
                </tr>
              </thead>
              <tbody>
                {data.byTenant.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No tenants yet.</td>
                  </tr>
                ) : (
                  data.byTenant.slice(0, 20).map((t) => (
                    <tr key={t.tenantId} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs truncate max-w-[200px]">
                        <Link href={`/admin?tenant=${t.tenantId}`} className="hover:underline">
                          {t.tenantId.slice(0, 8)}…
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Badge variant="outline" className="font-normal">{t.plan}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{t.runs.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium">${t.costUsd.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* By agent — cost drivers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by agent</CardTitle>
            <CardDescription>Which agent is driving spend.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.byAgent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No runs in this window.</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, data.byAgent.length * 24)}>
                <BarChart data={data.byAgent} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                  <XAxis type="number" fontSize={10} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <YAxis type="category" dataKey="agentType" fontSize={10} width={130} />
                  <Tooltip
                    formatter={(v: any) => [`$${Number(v).toFixed(4)}`, "Cost"]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="costUsd" fill="oklch(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
