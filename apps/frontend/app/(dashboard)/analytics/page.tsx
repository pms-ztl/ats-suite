"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentReasoningTrace, type AgentStep } from "@/components/shared/agent-reasoning-trace";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart2,
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  Globe,
  ShieldCheck,
  Sparkles,
  Download,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

interface DashboardData {
  openRoles?: number;
  openRequisitions?: number;
  activeCandidates?: number;
  avgTimeToHire?: number;
  hiresThisMonth?: number;
  offerAcceptanceRate?: number;
}

interface FunnelStage {
  stage: string;
  count: number;
}

const FUNNEL_STAGES = ["APPLIED", "SCREENED", "INTERVIEW", "OFFER", "HIRED"];
const FUNNEL_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-500",
  SCREENED: "bg-cyan-500",
  INTERVIEW: "bg-violet-500",
  OFFER: "bg-amber-500",
  HIRED: "bg-emerald-500",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export default function AnalyticsPage() {
  const { can } = usePermissions();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    answer?: string;
    insights?: Array<{ finding: string; evidence: string; severity: string; recommendation: string }>;
    agentTrace?: AgentStep[];
    toolsUsed?: string[];
    error?: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [dashRes, funnelRes] = await Promise.allSettled([
          api.analytics.getDashboard(),
          api.analytics.getFunnel(),
        ]);

        if (dashRes.status === "fulfilled") {
          const d = (dashRes.value as any)?.data;
          setDashboard(d ?? null);
        }

        if (funnelRes.status === "fulfilled") {
          const f = (funnelRes.value as any)?.data;
          if (Array.isArray(f)) {
            setFunnel(f);
          } else if (f && typeof f === "object") {
            // Convert object format { APPLIED: 10, SCREENED: 5 } to array
            const arr = Object.entries(f).map(([stage, count]) => ({
              stage,
              count: Number(count) || 0,
            }));
            setFunnel(arr);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  if (!can("analytics")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />;

  const openRoles = dashboard?.openRoles ?? dashboard?.openRequisitions ?? 0;
  const activeCandidates = dashboard?.activeCandidates ?? 0;
  const avgTimeToHire = dashboard?.avgTimeToHire;
  const hiresThisMonth = dashboard?.hiresThisMonth ?? 0;

  async function exportPipelineCSV() {
    const token = getToken();
    const res = await fetch(`${API_BASE}/analytics/export/pipeline`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pipeline-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runAiInsights() {
    setAiOpen(true);
    setAiLoading(true);
    setAiResult(null);
    try {
      const token = getToken();
      // Agentic analytics route — the agent pulls only the metric slices it
      // needs, then returns structured insights + its ReAct reasoning trace.
      const res = await fetch(`${API_BASE}/analytics`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ query: "Summarize current hiring pipeline performance and identify bottlenecks" }),
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();
      const data = json.data ?? json;
      setAiResult({
        answer: data.answer,
        insights: data.insights,
        agentTrace: data.agentTrace,
        toolsUsed: data.toolsUsed,
      });
    } catch {
      setAiResult({ error: "Failed to generate AI insights. Please try again." });
    } finally {
      setAiLoading(false);
    }
  }

  // Build funnel data - use real data if available, else show stages with 0
  const funnelMap = new Map(funnel.map((f) => [f.stage.toUpperCase(), f.count]));
  const funnelData = FUNNEL_STAGES.map((stage) => ({
    stage,
    count: funnelMap.get(stage) ?? 0,
  }));
  const maxCount = Math.max(...funnelData.map((f) => f.count), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reporting"
        description="Hiring metrics, pipeline insights, and performance dashboards"
        breadcrumbs={[{ label: "Analytics & Reporting" }]}
      />

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Link href="/analytics/time-to-hire">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Time to Hire</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/source-effectiveness">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-violet-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Source Effectiveness</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics/diversity">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Diversity & Compliance</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Card
          className="hover:border-primary/50 transition-colors cursor-pointer"
          onClick={runAiInsights}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">AI Insights</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
        <Card
          className="hover:border-primary/50 transition-colors cursor-pointer"
          onClick={exportPipelineCSV}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <Download className="h-5 w-5 text-cyan-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Export Pipeline CSV</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI Insights
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {aiLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                The analytics agent is investigating…
              </div>
            ) : aiResult?.error ? (
              <p className="text-sm text-rose-600">{aiResult.error}</p>
            ) : aiResult ? (
              <>
                {aiResult.answer && <p className="text-sm leading-relaxed">{aiResult.answer}</p>}
                {aiResult.insights && aiResult.insights.length > 0 && (
                  <div className="space-y-2">
                    {aiResult.insights.map((ins, i) => (
                      <Card key={i}>
                        <CardContent className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                ins.severity === "critical"
                                  ? "text-rose-600 border-rose-300"
                                  : ins.severity === "warning"
                                    ? "text-amber-600 border-amber-300"
                                    : "text-muted-foreground"
                              }
                            >
                              {ins.severity}
                            </Badge>
                            <span className="text-sm font-medium">{ins.finding}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{ins.evidence}</p>
                          <p className="text-xs"><span className="font-medium">Recommendation:</span> {ins.recommendation}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {aiResult.agentTrace && aiResult.agentTrace.length > 0 && (
                  <AgentReasoningTrace steps={aiResult.agentTrace} toolsUsed={aiResult.toolsUsed} />
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Open Requisitions",
            value: openRoles,
            icon: Briefcase,
          },
          {
            label: "Active Candidates",
            value: activeCandidates,
            icon: Users,
          },
          {
            label: "Avg Time-to-Hire",
            value: avgTimeToHire != null ? `${avgTimeToHire}d` : "--",
            icon: Clock,
          },
          {
            label: "Hires This Month",
            value: hiresThisMonth,
            icon: TrendingUp,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pipeline Funnel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" /> Pipeline Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData.map((f) => {
              const pct = maxCount > 0 ? (f.count / maxCount) * 100 : 0;
              return (
                <div key={f.stage} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 shrink-0">{f.stage}</span>
                  <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
                    <div
                      className={`h-full rounded-md transition-all duration-500 ${FUNNEL_COLORS[f.stage] ?? "bg-gray-400"}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                      {f.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {funnelData.every((f) => f.count === 0) && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No pipeline data available yet. Candidates will appear as they progress through stages.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
