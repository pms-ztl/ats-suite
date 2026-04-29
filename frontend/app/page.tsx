"use client";

import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { ChartWrapper } from "@/components/shared/chart-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import {
  Users, Briefcase, Clock, Target, Shield, Brain, TrendingUp, AlertTriangle,
  ArrowRight, Activity, FileCheck, UserCheck, CalendarClock, ClipboardList, Eye,
  ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

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

const systemHealthServices = [
  { name: "AI Pipeline", status: "operational" },
  { name: "Job Board Sync", status: "operational" },
  { name: "Email Service", status: "operational" },
  { name: "Compliance Engine", status: "operational" },
  { name: "Background Checks", status: "degraded" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
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

export default function Home() {
  const [dateRange, setDateRange] = useState("last_30");
  const [kpis, setKpis] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any[]>([]);
  const [pipelineData, setPipelineData] = useState<any[]>([]);
  const [diversityData, setDiversityData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/platform/unified-overview", { headers: { "x-tenant-id": "default" } })
      .then((r) => r.json())
      .then((res) => {
        const d = res.data ?? res;
        setKpis([
          { label: "Open Requisitions", value: d.openRequisitions ?? 48, change: 5, changeLabel: "vs last month", sparklineData: [30, 35, 40, 42, 48] },
          { label: "Active Candidates", value: d.activeCandidates ?? 1240, change: 12, changeLabel: "vs last month", sparklineData: [980, 1050, 1120, 1180, 1240] },
          { label: "Time to Hire", value: `${d.avgTimeToHire ?? 28}d`, change: -3, changeLabel: "vs last month", sparklineData: [35, 33, 31, 30, 28] },
          { label: "Offer Accept Rate", value: `${d.offerAcceptRate ?? 87}%`, change: 2, changeLabel: "vs last month", sparklineData: [82, 83, 85, 86, 87] },
          { label: "AI Decisions Today", value: d.aiDecisionsToday ?? 64, change: 8, changeLabel: "vs yesterday", sparklineData: [45, 50, 55, 60, 64] },
          { label: "Compliance Score", value: `${d.complianceScore ?? 94}%`, change: 1, changeLabel: "vs last month", sparklineData: [90, 91, 92, 93, 94] },
          { label: "Diversity Index", value: d.diversityScore ?? 0.82, change: 0.03, changeLabel: "vs last quarter", sparklineData: [0.76, 0.78, 0.79, 0.81, 0.82] },
          { label: "Cost per Hire", value: `$${d.costPerHire ?? 4200}`, change: -5, changeLabel: "vs last month", sparklineData: [4800, 4600, 4400, 4300, 4200] },
        ]);
        if (d.timeSeriesData) setTimeData(d.timeSeriesData);
        if (d.pipelineData) setPipelineData(d.pipelineData);
        if (d.diversityData) setDiversityData(d.diversityData);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setKpis([
          { label: "Open Requisitions", value: 48, change: 5, changeLabel: "vs last month", sparklineData: [30, 35, 40, 42, 48] },
          { label: "Active Candidates", value: 1240, change: 12, changeLabel: "vs last month", sparklineData: [980, 1050, 1120, 1180, 1240] },
          { label: "Time to Hire", value: "28d", change: -3, changeLabel: "vs last month", sparklineData: [35, 33, 31, 30, 28] },
          { label: "Offer Accept Rate", value: "87%", change: 2, changeLabel: "vs last month", sparklineData: [82, 83, 85, 86, 87] },
          { label: "AI Decisions Today", value: 64, change: 8, changeLabel: "vs yesterday", sparklineData: [45, 50, 55, 60, 64] },
          { label: "Compliance Score", value: "94%", change: 1, changeLabel: "vs last month", sparklineData: [90, 91, 92, 93, 94] },
          { label: "Diversity Index", value: 0.82, change: 0.03, changeLabel: "vs last quarter", sparklineData: [0.76, 0.78, 0.79, 0.81, 0.82] },
          { label: "Cost per Hire", value: "$4200", change: -5, changeLabel: "vs last month", sparklineData: [4800, 4600, 4400, 4300, 4200] },
        ]);
      });
  }, []);

  const user = getCurrentUser();
  const firstName = user.name.split(" ")[0];

  const overallSystemStatus = systemHealthServices.every(s => s.status === "operational")
    ? "operational"
    : systemHealthServices.some(s => s.status === "down")
      ? "down"
      : "degraded";

  const funnelData = useMemo(() => [
    { name: "Applied", value: 1240, fill: CHART_COLORS[0] },
    { name: "Screened", value: 856, fill: CHART_COLORS[1] },
    { name: "Interviewed", value: 394, fill: CHART_COLORS[4] },
    { name: "Offered", value: 142, fill: CHART_COLORS[2] },
    { name: "Hired", value: 89, fill: CHART_COLORS[5] },
  ], []);

  const funnelConversions = useMemo(() => {
    return funnelData.slice(0, -1).map((stage, i) => ({
      from: stage.name,
      to: funnelData[i + 1].name,
      rate: ((funnelData[i + 1].value / stage.value) * 100).toFixed(1),
    }));
  }, [funnelData]);

  const totalPendingCount = pendingActions.reduce((sum, a) => sum + a.count, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Hiring Dashboard"
          description={`${getGreeting()}, ${firstName}. Here's your organization's hiring overview.`}
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
              <Button variant="outline" size="sm">Export Report</Button>
              <Button size="sm"><Activity className="h-4 w-4 mr-1" />Real-time</Button>
            </div>
          }
        />

        {/* System Health */}
        <div className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${
          overallSystemStatus === "operational"
            ? "bg-emerald-50/60 border-emerald-200"
            : "bg-amber-50/60 border-amber-200"
        }`}>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                overallSystemStatus === "operational" ? "bg-emerald-400" : "bg-amber-400"
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                overallSystemStatus === "operational" ? "bg-emerald-500" : "bg-amber-500"
              }`} />
            </span>
            <span className="font-medium">
              {overallSystemStatus === "operational" ? "All Systems Operational" : "Partial System Degradation"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {systemHealthServices.map((service) => (
              <div key={service.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  service.status === "operational" ? "bg-emerald-500" : "bg-amber-500"
                }`} />
                {service.name}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Actions */}
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
                      <div className={`shrink-0 mt-0.5 ${styles.text}`}><Icon className="h-5 w-5" /></div>
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

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.slice(0, 8).map((kpi: any, i: number) => (
            <KPICard key={i} label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} sparklineData={kpi.sparklineData} icon={kpiIcons[i]} />
          ))}
        </div>

        {/* Pipeline Funnel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-medium">Hiring Pipeline Funnel</CardTitle>
              <p className="text-2xs text-muted-foreground mt-0.5">Candidate flow with stage-to-stage conversion rates</p>
            </div>
            <Badge variant="secondary" className="text-2xs">{funnelData[0].value.toLocaleString()} total applicants</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 w-full">
              {funnelData.map((stage, i) => {
                const heightPercent = Math.max(40, (stage.value / funnelData[0].value) * 100);
                return (
                  <div key={stage.name} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center w-full gap-1.5">
                      <div className="w-full rounded-md flex items-center justify-center transition-all" style={{ backgroundColor: stage.fill, height: `${Math.max(48, heightPercent * 0.8)}px`, opacity: 0.85 + (i * 0.03) }}>
                        <span className="text-white font-bold text-sm">{stage.value.toLocaleString()}</span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{stage.name}</span>
                      {i < funnelData.length - 1 && <span className="text-2xs text-muted-foreground">{funnelConversions[i].rate}% &rarr;</span>}
                    </div>
                    {i < funnelData.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mx-0.5" />}
                  </div>
                );
              })}
            </div>
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
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartWrapper title="Diversity Distribution" description="Current pipeline demographics" height={250}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diversityData[0]?.categories ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={2}>
                  {(diversityData[0]?.categories ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>

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
                        item.type === "success" ? "bg-emerald-500" : item.type === "warning" ? "bg-amber-500" : item.type === "error" ? "bg-rose-500" : "bg-blue-500"
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

        {/* Quick Links */}
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
                        link.trendDir === "down" && link.label === "Bias Alerts" ? "text-emerald-600" :
                        link.trendDir === "up" && link.label === "Bias Alerts" ? "text-rose-600" :
                        link.trendDir === "up" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {link.trendDir === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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
    </DashboardLayout>
  );
}
