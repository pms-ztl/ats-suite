"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SystemHealthBanner, type ServiceHealth } from "@/components/shared/system-health-banner";
import { KPICard } from "@/components/shared/kpi-card";
import { ChartWrapper } from "@/components/shared/chart-wrapper";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
  FunnelChart, Funnel, LabelList,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import {
  Users, Briefcase, Clock, Target, Shield, Brain, TrendingUp, AlertTriangle,
  ArrowRight, Activity, CheckCircle2, Circle, AlertCircle, FileCheck, UserCheck,
  CalendarClock, ClipboardList, Eye, ChevronRight, Zap, ArrowUpRight, ArrowDownRight,
  Monitor, Calendar, BarChart2, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"

const kpiIcons = [
  <Briefcase key="0" className="h-5 w-5" />,
  <Users key="1" className="h-5 w-5" />,
  <Clock key="2" className="h-5 w-5" />,
  <Target key="3" className="h-5 w-5" />,
  <Shield key="4" className="h-5 w-5" />,
  <Brain key="5" className="h-5 w-5" />,
  <AlertTriangle key="6" className="h-5 w-5" />,
  <TrendingUp key="7" className="h-5 w-5" />,
];

const recentActivity = [
  { action: "New candidate applied", detail: "Sarah Chen - Senior SWE", time: "5 min ago", type: "info" },
  { action: "Bias alert triggered", detail: "Adverse impact ratio below threshold", time: "12 min ago", type: "warning" },
  { action: "Interview completed", detail: "Marcus Johnson - Panel Round", time: "1 hour ago", type: "success" },
  { action: "Policy updated", detail: "NYC LL144 compliance rules", time: "2 hours ago", type: "info" },
  { action: "Offer accepted", detail: "Emily Rodriguez - Staff Engineer", time: "3 hours ago", type: "success" },
  { action: "Model drift detected", detail: "Resume Scorer v3.2 - 2.3% drift", time: "4 hours ago", type: "error" },
  { action: "Screening completed", detail: "Batch of 14 candidates processed", time: "4.5 hours ago", type: "success" },
  { action: "New requisition opened", detail: "Staff ML Engineer - AI Platform", time: "5 hours ago", type: "info" },
  { action: "Compliance review due", detail: "Q1 adverse impact report", time: "6 hours ago", type: "warning" },
  { action: "Candidate withdrawn", detail: "David Kim - Accepted other offer", time: "7 hours ago", type: "error" },
];

const pendingActions = [
  { id: 1, type: "review", title: "Resume Review Pending", description: "12 AI-screened resumes awaiting your approval", urgency: "high", href: "/compliance", icon: FileCheck, count: 12 },
  { id: 2, type: "approval", title: "Offer Approval Overdue", description: "Emily Rodriguez - Staff Engineer offer needs sign-off", urgency: "critical", href: "/platform", icon: UserCheck, count: 1 },
  { id: 3, type: "interview", title: "Interviews to Schedule", description: "5 candidates passed screening, need interview slots", urgency: "medium", href: "/platform", icon: CalendarClock, count: 5 },
  { id: 4, type: "compliance", title: "Bias Report Review", description: "Monthly adverse impact analysis ready for review", urgency: "high", href: "/compliance", icon: ClipboardList, count: 1 },
  { id: 5, type: "model", title: "Model Drift Acknowledgement", description: "Resume Scorer v3.2 flagged for 2.3% performance drift", urgency: "medium", href: "/ai", icon: Brain, count: 1 },
];

const healthServices: ServiceHealth[] = [
  { name: "AI Pipeline", status: "operational" },
  { name: "Job Board Sync", status: "operational" },
  { name: "Email Service", status: "degraded" },
  { name: "Compliance Engine", status: "operational" },
  { name: "Background Checks", status: "operational" },
];

function getGreetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getUrgencyStyles(urgency: string) {
  switch (urgency) {
    case "critical":
      return { border: "border-l-rose-500", bg: "bg-rose-50/50 dark:bg-rose-950/20", badge: "destructive" as const, text: "text-rose-700" };
    case "high":
      return { border: "border-l-amber-500", bg: "bg-amber-50/50 dark:bg-amber-950/20", badge: "warning" as const, text: "text-amber-700" };
    default:
      return { border: "border-l-blue-500", bg: "bg-blue-50/50 dark:bg-blue-950/20", badge: "info" as const, text: "text-blue-700" };
  }
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState("last_30");
  const [kpis, setKpis] = useState<any[]>([]);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(false);
  const [timeData, setTimeData] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [diversityData, setDiversityData] = useState<any[]>([]);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [funnelCounts, setFunnelCounts] = useState<{ name: string; value: number; barClass: string }[]>([]);
  const [hitlPending, setHitlPending] = useState(0);
  const [hitlOverdue, setHitlOverdue] = useState(0);
  // Stable greeting on SSR; localized after mount (avoids hydration mismatch).
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => {
    setGreeting(getGreetingForHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    setKpisLoading(true);
    setKpisError(false);
    // Absolute backend URL + credentials. sessionStorage for same-tab login,
    // HttpOnly cookie fallback (auto-sent via credentials:'include').
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    let _token: string | null = null;
    if (typeof window !== "undefined") {
      try { _token = window.sessionStorage?.getItem("ats-access-token") || null; } catch {}
    }
    fetch(`${API_BASE}/platform/unified-overview`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        const d = res.data ?? res;
        setKpis([
          { label: "Open Requisitions", value: d.openRequisitions ?? 0, change: d.openRequisitionsChange, changeLabel: "vs last month", sparklineData: d.openRequisitionsSparkline },
          { label: "Active Candidates", value: d.activeCandidates ?? 0, change: d.activeCandidatesChange, changeLabel: "vs last month", sparklineData: d.activeCandidatesSparkline },
          { label: "Time to Hire", value: d.avgTimeToHire != null ? `${d.avgTimeToHire}d` : "—", change: d.avgTimeToHireChange, changeLabel: "vs last month", sparklineData: d.avgTimeToHireSparkline },
          { label: "Offer Accept Rate", value: d.offerAcceptRate != null ? `${d.offerAcceptRate}%` : "—", change: d.offerAcceptRateChange, changeLabel: "vs last month", sparklineData: d.offerAcceptRateSparkline },
          { label: "AI Decisions Today", value: d.aiDecisionsToday ?? 0, change: d.aiDecisionsTodayChange, changeLabel: "vs yesterday", sparklineData: d.aiDecisionsTodaySparkline },
          { label: "Compliance Score", value: d.complianceScore != null ? `${d.complianceScore}%` : "—", change: d.complianceScoreChange, changeLabel: "vs last month", sparklineData: d.complianceScoreSparkline },
          { label: "Diversity Index", value: d.diversityScore ?? "—", change: d.diversityScoreChange, changeLabel: "vs last quarter", sparklineData: d.diversityScoreSparkline },
          { label: "Cost per Hire", value: d.costPerHire != null ? `$${d.costPerHire}` : "—", change: d.costPerHireChange, changeLabel: "vs last month", sparklineData: d.costPerHireSparkline },
        ]);
        if (d.timeSeriesData) setTimeData(d.timeSeriesData);
        if (d.pipelineData) setPipelineData(d.pipelineData);
        if (d.diversityData) setDiversityData(d.diversityData);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setKpisError(true);
        setKpis([
          { label: "Open Requisitions", value: "—" },
          { label: "Active Candidates", value: "—" },
          { label: "Time to Hire", value: "—" },
          { label: "Offer Accept Rate", value: "—" },
          { label: "AI Decisions Today", value: "—" },
          { label: "Compliance Score", value: "—" },
          { label: "Diversity Index", value: "—" },
          { label: "Cost per Hire", value: "—" },
        ]);
      })
      .finally(() => setKpisLoading(false));
  }, []);

  // Fetch real pipeline funnel data from candidates API
  useEffect(() => {
    setFunnelLoading(true);
    fetch("/api/analytics/pipeline", { headers: { "x-tenant-id": "default" } })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        const d = res.data ?? res;
        if (Array.isArray(d) && d.length > 0) {
          const colorMap: Record<string, string> = {
            APPLIED: "bg-indigo-500", SCREENING: "bg-emerald-500", INTERVIEW: "bg-amber-500",
            OFFER: "bg-violet-500", HIRED: "bg-rose-500",
          };
          setFunnelCounts(d.map((s: any) => ({
            name: s.stage ?? s.name ?? "Unknown",
            value: s.count ?? s.value ?? 0,
            barClass: colorMap[s.stage ?? s.name] ?? "bg-slate-500",
          })));
        }
      })
      .catch((err) => {
        console.error("Failed to load pipeline data:", err);
        // Leave funnel empty so it shows empty state
      })
      .finally(() => setFunnelLoading(false));
  }, []);

  // Fetch HITL queue summary
  useEffect(() => {
    fetch("/api/agents/hitl", { headers: { "x-tenant-id": "default" } })
      .then((r) => (r.ok ? r.json() : []))
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        const pendingItems = data.filter((c: { status: string }) => c.status === "PENDING");
        setHitlPending(pendingItems.length);
        const now = new Date();
        const overdueItems = pendingItems.filter((c: { createdAt: string; slaMinutes: number }) => {
          const deadline = new Date(new Date(c.createdAt).getTime() + c.slaMinutes * 60_000);
          return deadline < now;
        });
        setHitlOverdue(overdueItems.length);
      })
      .catch(err => console.error('HITL count fetch failed:', err));
  }, []);

  const user = getCurrentUser();
  const firstName = user.name.split(" ")[0];

  const funnelData = funnelCounts;

  const funnelConversions = useMemo(() => {
    if (funnelData.length < 2) return [];
    return funnelData.slice(0, -1).map((stage, i) => ({
      from: stage.name,
      to: funnelData[i + 1].name,
      rate: stage.value > 0 ? ((funnelData[i + 1].value / stage.value) * 100).toFixed(1) : "0.0",
    }));
  }, [funnelData]);

  const totalPendingCount = pendingActions.reduce((sum, a) => sum + a.count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header with Date Range Selector */}
      <PageHeader
        title="Hiring Dashboard"
        description={`${greeting}, ${firstName}. Here's your organization's hiring overview.`}
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last_7">Last 7 Days</SelectItem>
                <SelectItem value="last_30">Last 30 Days</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => {
              const headers = ["Metric", "Value", "Trend"];
              const rows = kpis.map((k: any) => [k.label, String(k.value), k.trend > 0 ? `+${k.trend}%` : `${k.trend}%`]);
              const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `dashboard-report-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
              toast.success("Dashboard report exported as CSV.");
            }}>Export Report</Button>
            <Button size="sm" onClick={() => {
              toast.success("Real-time mode enabled — dashboard refreshes every 30s.");
              setTimeout(() => window.location.reload(), 30000);
            }}><Activity className="h-4 w-4 mr-1" />Real-time</Button>
          </div>
        }
      />

      {/* System Health Status Strip */}
      <SystemHealthBanner services={healthServices} />

      {/* Pending Your Action */}
      {pendingActions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Pending Your Action</CardTitle>
              <Badge variant="destructive" className="text-2xs">{totalPendingCount} items</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-2xs" asChild>
              <Link href="/compliance">View All Tasks <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {pendingActions.map((action) => {
                const styles = getUrgencyStyles(action.urgency);
                const Icon = action.icon;
                return (
                  <Link key={action.id} href={action.href}>
                    <div className={`flex items-start gap-3 rounded-lg border-l-4 ${styles.border} ${styles.bg} p-3 hover:shadow-md transition-all cursor-pointer`}>
                      <div className={`shrink-0 mt-0.5 ${styles.text}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{action.title}</p>
                          <Badge variant={styles.badge} className="text-2xs shrink-0">{action.urgency}</Badge>
                        </div>
                        <p className="text-2xs text-muted-foreground mt-0.5 line-clamp-1">{action.description}</p>
                      </div>
                      <span className={`text-lg font-bold ${styles.text} shrink-0`}>{action.count}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Review Queue Summary */}
      {hitlPending > 0 && (
        <Card className={hitlOverdue > 0 ? "border-amber-300 bg-amber-50/30" : undefined}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${hitlOverdue > 0 ? "bg-amber-100" : "bg-indigo-100"}`}>
                  <ShieldCheck className={`h-5 w-5 ${hitlOverdue > 0 ? "text-amber-600" : "text-indigo-600"}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">AI Review Queue</h3>
                  <p className="text-xs text-muted-foreground">
                    {hitlPending} pending checkpoint{hitlPending !== 1 ? "s" : ""}
                    {hitlOverdue > 0 && (
                      <span className="text-amber-600 font-medium"> ({hitlOverdue} overdue)</span>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/hitl">
                  Review Queue <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.slice(0, 8).map((kpi: any, i: number) => (
            <KPICard
              key={i}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              changeLabel={kpi.changeLabel}
              sparklineData={kpi.sparklineData}
              icon={kpiIcons[i]}
            />
          ))
        )}
      </div>
      {kpisError && (
        <p className="text-sm text-muted-foreground text-center">
          Could not load live metrics. Showing placeholder values.
        </p>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Post New Job", icon: Briefcase, href: "/platform" },
              { label: "Review Candidates", icon: Users, href: "/candidates" },
              { label: "Schedule Interview", icon: Calendar, href: "/scheduling" },
              { label: "Run Report", icon: BarChart2, href: "/analytics" },
            ].map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href}>
                <Button variant="outline" className="w-full h-16 flex-col gap-1 text-xs">
                  <Icon className="h-5 w-5" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Funnel Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-medium">Hiring Pipeline Funnel</CardTitle>
            <p className="text-2xs text-muted-foreground mt-0.5">Candidate flow with stage-to-stage conversion rates</p>
          </div>
          {funnelData.length > 0 && (
            <Badge variant="secondary" className="text-2xs">{funnelData[0].value.toLocaleString()} total applicants</Badge>
          )}
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="flex items-center gap-2 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 space-y-2">
                  <Skeleton className="w-full h-12 rounded-md" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          ) : funnelData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No pipeline data available yet.</p>
          ) : (
          <>
          {/* Horizontal funnel visualization */}
          <div className="flex items-center gap-1 w-full">
            {funnelData.map((stage, i) => {
              const widthPercent = Math.max(12, (stage.value / funnelData[0].value) * 100);
              const heightPercent = Math.max(40, (stage.value / funnelData[0].value) * 100);
              return (
                <div key={stage.name} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center w-full gap-1.5">
                    <div
                      className={`w-full rounded-md flex items-center justify-center transition-all ${stage.barClass}`}
                      style={{ height: `${Math.max(48, heightPercent * 0.8)}px` }}
                    >
                      <span className="text-white font-bold text-sm">{stage.value.toLocaleString()}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{stage.name}</span>
                    {i < funnelData.length - 1 && (
                      <span className="text-2xs text-muted-foreground">
                        {funnelConversions[i].rate}% &rarr;
                      </span>
                    )}
                  </div>
                  {i < funnelData.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mx-0.5" />
                  )}
                </div>
              );
            })}
          </div>
          {/* Conversion summary strip */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t">
            {funnelConversions.map((conv) => (
              <div key={conv.from} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">{conv.from}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium">{conv.to}</span>
                <Badge variant="secondary" className="text-2xs ml-1">{conv.rate}%</Badge>
              </div>
            ))}
          </div>
          </>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Hiring Pipeline Trend" description="Applications through to hires over time" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="applications" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="interviews" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="hires" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Pipeline Conversion" description="Candidates at each stage" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94A3B8" width={100} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diversity Overview */}
        <ChartWrapper title="Diversity Distribution" description="Current pipeline demographics" height={250}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={diversityData[0]?.categories ?? []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={2}
              >
                {(diversityData[0]?.categories ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* Recent Activity - now scrollable */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Badge variant="secondary" className="text-2xs">{recentActivity.length} events</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-2xs" asChild>
              <Link href="/analytics">View All <ArrowRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-3">
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group hover:bg-muted/50 rounded-md p-1.5 -mx-1.5 transition-colors">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                      item.type === "success" ? "bg-emerald-500" :
                      item.type === "warning" ? "bg-amber-500" :
                      item.type === "error" ? "bg-rose-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-2xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <span className="text-2xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Links with trend indicators and icons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Review Queue", count: "12 pending", trend: "+3", trendDir: "up" as const, href: "/compliance", color: "text-amber-600", bgHover: "hover:border-amber-300", icon: Eye },
          { label: "Bias Alerts", count: "3 active", trend: "-2", trendDir: "down" as const, href: "/compliance", color: "text-rose-600", bgHover: "hover:border-rose-300", icon: AlertTriangle },
          { label: "AI Models", count: "15 deployed", trend: "+1", trendDir: "up" as const, href: "/ai", color: "text-indigo-600", bgHover: "hover:border-indigo-300", icon: Brain },
          { label: "Open Requisitions", count: "48 active", trend: "+5", trendDir: "up" as const, href: "/platform", color: "text-emerald-600", bgHover: "hover:border-emerald-300", icon: Briefcase },
        ].map((link, i) => {
          const Icon = link.icon;
          return (
            <Link key={i} href={link.href}>
              <Card className={`hover:shadow-md transition-all cursor-pointer ${link.bgHover}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className={`h-4 w-4 ${link.color}`} />
                    <div className={`flex items-center gap-0.5 text-2xs font-medium ${
                      link.trendDir === "down" && link.label === "Bias Alerts"
                        ? "text-emerald-600"
                        : link.trendDir === "up" && link.label === "Bias Alerts"
                          ? "text-rose-600"
                          : link.trendDir === "up"
                            ? "text-emerald-600"
                            : "text-rose-600"
                    }`}>
                      {link.trendDir === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {link.trend}
                    </div>
                  </div>
                  <p className="text-sm font-medium">{link.label}</p>
                  <p className={`text-lg font-bold ${link.color}`}>{link.count}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
