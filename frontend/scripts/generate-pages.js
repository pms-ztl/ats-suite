#!/usr/bin/env node
/**
 * CDC ATS Feature Page Generator
 * Generates production-quality pages for all 358 features from build_spec.json
 */

const fs = require("fs");
const path = require("path");

const features = JSON.parse(fs.readFileSync(path.join(__dirname, "../../features_for_gen.json"), "utf8"));

const catMap = {
  "Compliance, Bias & Governance": "compliance",
  "Core Platform & Architecture": "platform",
  "Security & Privacy": "security",
  "AI/ML Operations & Explainability": "ai",
  "Analytics & Reporting": "analytics",
  "Candidate Experience & Communication": "candidates",
  "Decision & Offer Management": "decisions",
  "Integration & Workflow": "integrations",
  "Internal Mobility & Workforce Planning": "mobility",
  "Interview Management": "interviews",
  "Onboarding & Post-Hire": "onboarding",
  "Scheduling & Coordination": "scheduling",
  "Screening & Assessment": "screening",
  "Sourcing & Talent Attraction": "sourcing",
};

const catLabels = {
  compliance: "Compliance & Governance",
  platform: "Core Platform",
  security: "Security & Privacy",
  ai: "AI/ML Operations",
  analytics: "Analytics & Reporting",
  candidates: "Candidate Experience",
  decisions: "Decision & Offer",
  integrations: "Integrations",
  mobility: "Internal Mobility",
  interviews: "Interview Management",
  onboarding: "Onboarding",
  scheduling: "Scheduling",
  screening: "Screening & Assessment",
  sourcing: "Sourcing",
};

// Which engine maps to which mock data generators
const engineMockMap = {
  "bias-fairness-engine": { data: "generateBiasMetrics", type: "bias" },
  "compliance-governance-engine": { data: "generateCompliancePolicies", type: "compliance" },
  "security-framework": { data: "generateSecurityEvents", type: "security" },
  "explainability-layer": { data: "generateAIDecisions", type: "ai" },
  "analytics-engine": { data: "generateTimeSeriesData", type: "analytics" },
  "candidate-hub": { data: "generateCandidates", type: "candidates" },
  "interview-system": { data: "generateInterviews", type: "interviews" },
  "screening-engine": { data: "generateCandidates", type: "screening" },
  "sourcing-engine": { data: "generateCandidates", type: "sourcing" },
  "decision-engine": { data: "generateOffers", type: "decisions" },
  "integration-hub": { data: "generateAuditEvents", type: "integrations" },
  "scheduling-engine": { data: "generateInterviews", type: "scheduling" },
  "mobility-engine": { data: "generateCandidates", type: "mobility" },
  "onboarding-engine": { data: "generateCandidates", type: "onboarding" },
  "platform-core": { data: "generateRequisitions", type: "platform" },
};

function slugToDir(route) {
  // route like /compliance/protected-trait-proxy-detector => protected-trait-proxy-detector
  const parts = route.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function getPageType(feature) {
  const name = feature.name.toLowerCase();
  const desc = (feature.description || "").toLowerCase();

  if (name.includes("dashboard") || name.includes("monitor") || name.includes("tracker") || name.includes("health")) return "dashboard";
  if (name.includes("audit") || name.includes("trail") || name.includes("log") || name.includes("ledger") || name.includes("timeline")) return "audit";
  if (name.includes("review") || name.includes("gate") || name.includes("approval") || name.includes("queue")) return "review";
  if (name.includes("report") || name.includes("analytics") || name.includes("metric") || name.includes("benchmark")) return "analytics";
  if (name.includes("config") || name.includes("setting") || name.includes("policy") || name.includes("rule")) return "config";
  if (name.includes("detector") || name.includes("scanner") || name.includes("firewall") || name.includes("checker")) return "detector";
  if (name.includes("explainable") || name.includes("explanation") || name.includes("transparency") || name.includes("interpretab")) return "explainability";
  if (name.includes("agent") || name.includes("orchestrat") || name.includes("automat")) return "agent";
  if (desc.includes("list") || desc.includes("table") || desc.includes("records")) return "list";
  return "standard";
}

function getIconsForType(type, catKey) {
  const iconSets = {
    dashboard: ["BarChart3", "TrendingUp", "Activity", "Target"],
    audit: ["FileText", "Clock", "Search", "Shield"],
    review: ["Users", "CheckCircle2", "Clock", "AlertTriangle"],
    analytics: ["BarChart3", "TrendingUp", "Activity", "Target"],
    config: ["Settings", "Sliders", "Shield", "Lock"],
    detector: ["ShieldAlert", "AlertTriangle", "Eye", "Zap"],
    explainability: ["Brain", "Eye", "MessageSquare", "Lightbulb"],
    agent: ["Bot", "Workflow", "Play", "Zap"],
    list: ["List", "Database", "FileText", "Search"],
    standard: ["FileText", "Activity", "Shield", "CheckCircle2"],
  };

  const catIcons = {
    compliance: ["Scale", "Shield", "FileText", "AlertTriangle"],
    security: ["Lock", "Shield", "Key", "Fingerprint"],
    ai: ["Brain", "Cpu", "Sparkles", "Bot"],
    analytics: ["BarChart3", "TrendingUp", "Activity", "Target"],
    candidates: ["Users", "UserCheck", "MessageSquare", "Mail"],
    interviews: ["Video", "Mic", "Calendar", "ClipboardCheck"],
    screening: ["ClipboardCheck", "Filter", "Search", "Target"],
    decisions: ["CheckCircle2", "FileText", "Scale", "Award"],
    integrations: ["Plug", "Link", "Workflow", "ArrowLeftRight"],
    scheduling: ["Calendar", "Clock", "Users", "Bell"],
    sourcing: ["Search", "Globe", "Users", "Target"],
    platform: ["LayoutDashboard", "Database", "Server", "Workflow"],
    mobility: ["ArrowUpRight", "Users", "Briefcase", "Target"],
    onboarding: ["Rocket", "CheckCircle2", "Users", "FileText"],
  };

  return catIcons[catKey] || iconSets[type] || iconSets.standard;
}

function getKPILabels(type, catKey) {
  const kpiSets = {
    compliance: [
      ["Compliance Score", "Active Policies", "Violations", "Reviews Pending"],
      ["Audit Readiness", "Policies Enforced", "Exceptions", "Last Audit"],
      ["Compliant Items", "Non-Compliant", "Warning", "Remediation Rate"],
    ],
    security: [
      ["Security Score", "Threats Blocked", "Vulnerabilities", "Incidents"],
      ["Active Controls", "Events Today", "Risk Level", "Compliance"],
      ["Access Requests", "Denied", "Active Sessions", "Alerts"],
    ],
    ai: [
      ["Models Active", "Avg Accuracy", "Drift Score", "Decisions Today"],
      ["Confidence Avg", "Overrides", "Escalations", "Quality Score"],
      ["Predictions Made", "Human Reviews", "Model Health", "Bias Score"],
    ],
    analytics: [
      ["Total Events", "Trend", "Anomalies", "Data Points"],
      ["Reports Generated", "Active Dashboards", "Alerts", "Last Updated"],
    ],
    candidates: [
      ["Active Candidates", "New Today", "In Pipeline", "Response Rate"],
      ["Applications", "Avg Match Score", "Time to Response", "Satisfaction"],
    ],
    interviews: [
      ["Scheduled", "Completed Today", "Avg Duration", "Feedback Rate"],
      ["Panel Reviews", "No-Shows", "Avg Score", "Pending"],
    ],
    screening: [
      ["Screened Today", "Pass Rate", "Avg Score", "In Queue"],
      ["Assessments", "Completion Rate", "Avg Time", "Pass Rate"],
    ],
    decisions: [
      ["Decisions Made", "Pending", "Offers Sent", "Acceptance Rate"],
      ["Final Reviews", "Consensus Rate", "Avg Time", "Overrides"],
    ],
    integrations: [
      ["Connected Systems", "Sync Status", "Events/Day", "Errors"],
      ["API Calls Today", "Uptime", "Latency", "Webhooks"],
    ],
    scheduling: [
      ["Interviews Scheduled", "Rescheduled", "No-Shows", "Utilization"],
    ],
    sourcing: [
      ["Candidates Sourced", "Channels Active", "Response Rate", "Pipeline"],
    ],
    platform: [
      ["Requisitions", "Active Users", "System Health", "Uptime"],
    ],
    mobility: [
      ["Opportunities", "Matches", "Transfers", "Success Rate"],
    ],
    onboarding: [
      ["In Progress", "Completed", "Avg Time", "Satisfaction"],
    ],
  };

  const options = kpiSets[catKey] || [["Total Items", "Active", "Pending", "Completed"]];
  return options[Math.floor(Math.random() * options.length)];
}

function generateMockValues(kpiLabels) {
  return kpiLabels.map(label => {
    const l = label.toLowerCase();
    if (l.includes("score") || l.includes("rate") || l.includes("compliance") || l.includes("accuracy") || l.includes("readiness") || l.includes("health") || l.includes("uptime") || l.includes("satisfaction")) {
      return { value: `${Math.floor(Math.random() * 15) + 85}%`, change: (Math.random() * 6 - 1).toFixed(1) };
    }
    if (l.includes("time") || l.includes("duration") || l.includes("latency")) {
      const units = ["23d", "4.2h", "18m", "45m", "12d", "2.5h"];
      return { value: units[Math.floor(Math.random() * units.length)], change: (Math.random() * -15).toFixed(1) };
    }
    if (l.includes("last")) {
      return { value: ["2h ago", "Today", "Yesterday", "3d ago"][Math.floor(Math.random() * 4)], change: 0 };
    }
    return { value: Math.floor(Math.random() * 200) + 5, change: (Math.random() * 30 - 10).toFixed(1) };
  });
}

function getTableColumns(type, catKey) {
  const base = {
    compliance: `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge> },
    { accessorKey: "jurisdiction", header: "Jurisdiction" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
    { accessorKey: "enforcementLevel", header: "Enforcement", cell: ({ row }) => <Badge variant={row.getValue("enforcementLevel") === "block" ? "danger" : row.getValue("enforcementLevel") === "warn" ? "warning" : "secondary"}>{row.getValue("enforcementLevel")}</Badge> },
    { accessorKey: "lastUpdated", header: "Updated", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("lastUpdated"))}</span> },
  ]`,
    security: `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline">{(row.getValue("type") as string).replace(/_/g, " ")}</Badge> },
    { accessorKey: "severity", header: "Severity", cell: ({ row }) => <StatusBadge status={row.getValue("severity")} /> },
    { accessorKey: "description", header: "Description", cell: ({ row }) => <span className="text-sm max-w-xs truncate block">{row.getValue("description")}</span> },
    { accessorKey: "source", header: "Source" },
    { accessorKey: "resolved", header: "Resolved", cell: ({ row }) => row.getValue("resolved") ? <Badge variant="success">Yes</Badge> : <Badge variant="warning">No</Badge> },
    { accessorKey: "timestamp", header: "Time", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("timestamp"))}</span> },
  ]`,
    ai: `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "modelName", header: "Model", cell: ({ row }) => <span className="font-medium">{row.getValue("modelName")}</span> },
    { accessorKey: "decision", header: "Decision", cell: ({ row }) => <Badge variant="outline">{row.getValue("decision")}</Badge> },
    { accessorKey: "confidence", header: "Confidence", cell: ({ row }) => { const v = row.getValue("confidence") as number; return <div className="flex items-center gap-2 w-24"><div className="flex-1 bg-slate-100 rounded-full h-2"><div className={\`h-2 rounded-full \${v >= 0.9 ? "bg-emerald-500" : v >= 0.7 ? "bg-amber-500" : "bg-rose-500"}\`} style={{ width: \`\${v * 100}%\` }} /></div><span className="text-2xs font-mono">{Math.round(v * 100)}%</span></div>; } },
    { accessorKey: "timestamp", header: "Time", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("timestamp"))}</span> },
  ]`,
    candidates: `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span> },
    { accessorKey: "currentTitle", header: "Title" },
    { accessorKey: "currentCompany", header: "Company" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
    { accessorKey: "stage", header: "Stage", cell: ({ row }) => <Badge variant="outline">{row.getValue("stage")}</Badge> },
    { accessorKey: "source", header: "Source" },
    { accessorKey: "appliedDate", header: "Applied", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("appliedDate"))}</span> },
  ]`,
    interviews: `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "candidateName", header: "Candidate", cell: ({ row }) => <span className="font-medium">{row.getValue("candidateName")}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline">{(row.getValue("type") as string).replace(/_/g, " ")}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
    { accessorKey: "scheduledAt", header: "Scheduled", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("scheduledAt"))}</span> },
    { accessorKey: "duration", header: "Duration", cell: ({ row }) => <span>{row.getValue("duration")}min</span> },
    { accessorKey: "location", header: "Location" },
  ]`,
    decisions: `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "candidateName", header: "Candidate", cell: ({ row }) => <span className="font-medium">{row.getValue("candidateName")}</span> },
    { accessorKey: "requisitionTitle", header: "Requisition" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
    { accessorKey: "salary", header: "Salary", cell: ({ row }) => <span className="font-mono">\${(row.getValue("salary") as number).toLocaleString()}</span> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("createdAt"))}</span> },
  ]`,
  };

  // Categories that reuse other data shapes
  base.analytics = `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "actor", header: "Actor", cell: ({ row }) => <span className="font-medium">{row.getValue("actor")}</span> },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "resource", header: "Resource", cell: ({ row }) => <Badge variant="outline">{row.getValue("resource")}</Badge> },
    { accessorKey: "outcome", header: "Outcome", cell: ({ row }) => <StatusBadge status={row.getValue("outcome")} /> },
    { accessorKey: "timestamp", header: "Time", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("timestamp"))}</span> },
  ]`;
  base.integrations = base.analytics;
  base.screening = base.candidates;
  base.sourcing = base.candidates;
  base.mobility = base.candidates;
  base.onboarding = base.candidates;
  base.scheduling = base.interviews;
  base.platform = `[
    { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span> },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <StatusBadge status={row.getValue("priority")} /> },
    { accessorKey: "hiringManager", header: "Hiring Manager" },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-sm">{formatDate(row.getValue("createdAt"))}</span> },
  ]`;

  return base[catKey] || base.compliance;
}

function getMockDataCall(catKey) {
  const map = {
    compliance: "generateCompliancePolicies(30)",
    security: "generateSecurityEvents(40)",
    ai: "generateAIDecisions(40)",
    analytics: "generateAuditEvents(50)",
    candidates: "generateCandidates(40)",
    interviews: "generateInterviews(30)",
    screening: "generateCandidates(30)",
    decisions: "generateOffers(20)",
    integrations: "generateAuditEvents(30)",
    scheduling: "generateInterviews(20)",
    sourcing: "generateCandidates(20)",
    platform: "generateRequisitions(30)",
    mobility: "generateCandidates(15)",
    onboarding: "generateCandidates(10)",
  };
  return map[catKey] || "generateAuditEvents(20)";
}

function getMockImports(catKey) {
  const map = {
    compliance: "generateCompliancePolicies",
    security: "generateSecurityEvents",
    ai: "generateAIDecisions",
    analytics: "generateAuditEvents",
    candidates: "generateCandidates",
    interviews: "generateInterviews",
    screening: "generateCandidates",
    decisions: "generateOffers",
    integrations: "generateAuditEvents",
    scheduling: "generateInterviews",
    sourcing: "generateCandidates",
    platform: "generateRequisitions",
    mobility: "generateCandidates",
    onboarding: "generateCandidates",
  };
  return map[catKey] || "generateAuditEvents";
}

function getFilterOptions(catKey) {
  const filters = {
    compliance: `[{ label: "Active", value: "active" }, { label: "Draft", value: "draft" }, { label: "Archived", value: "archived" }]`,
    security: `[{ label: "Critical", value: "critical" }, { label: "High", value: "high" }, { label: "Medium", value: "medium" }, { label: "Low", value: "low" }]`,
    ai: `[{ label: "Advance", value: "Advance" }, { label: "Reject", value: "Reject" }, { label: "Hold for Review", value: "Hold for Review" }]`,
    analytics: `[{ label: "Success", value: "success" }, { label: "Failure", value: "failure" }, { label: "Warning", value: "warning" }]`,
    candidates: `[{ label: "New", value: "new" }, { label: "Screening", value: "screening" }, { label: "Interview", value: "interview" }, { label: "Offer", value: "offer" }]`,
    interviews: `[{ label: "Scheduled", value: "scheduled" }, { label: "Completed", value: "completed" }, { label: "Cancelled", value: "cancelled" }]`,
    screening: `[{ label: "New", value: "new" }, { label: "Screening", value: "screening" }, { label: "Interview", value: "interview" }]`,
    decisions: `[{ label: "Draft", value: "draft" }, { label: "Pending Approval", value: "pending_approval" }, { label: "Sent", value: "sent" }, { label: "Accepted", value: "accepted" }]`,
    integrations: `[{ label: "Success", value: "success" }, { label: "Failure", value: "failure" }, { label: "Warning", value: "warning" }]`,
    scheduling: `[{ label: "Scheduled", value: "scheduled" }, { label: "Completed", value: "completed" }, { label: "No Show", value: "no_show" }]`,
    sourcing: `[{ label: "New", value: "new" }, { label: "Screening", value: "screening" }, { label: "Interview", value: "interview" }]`,
    platform: `[{ label: "Open", value: "open" }, { label: "In Progress", value: "in_progress" }, { label: "Filled", value: "filled" }, { label: "Closed", value: "closed" }]`,
    mobility: `[{ label: "New", value: "new" }, { label: "Screening", value: "screening" }, { label: "Interview", value: "interview" }]`,
    onboarding: `[{ label: "New", value: "new" }, { label: "Screening", value: "screening" }, { label: "Hired", value: "hired" }]`,
  };
  return filters[catKey] || `[{ label: "Active", value: "active" }, { label: "Pending", value: "pending" }]`;
}

function generatePage(feature) {
  const catKey = feature.catKey;
  const catLabel = catLabels[catKey];
  const pageType = getPageType(feature);
  const icons = getIconsForType(pageType, catKey);
  const kpiLabels = getKPILabels(pageType, catKey);
  const kpiValues = generateMockValues(kpiLabels);
  const tableColumns = getTableColumns(pageType, catKey);
  const mockDataCall = getMockDataCall(catKey);
  const mockImport = getMockImports(catKey);
  const rawDesc = feature.description || `${feature.name} - AI-powered feature for enterprise hiring compliance and operations`;
  // Replace double quotes with single quotes for safe JSX embedding
  const desc = rawDesc.replace(/"/g, "'").substring(0, 200);
  const safeName = feature.name.replace(/"/g, "'");
  const safeShortName = safeName.substring(0, 50);
  const endpointsComment = feature.endpoints.length > 0 ? `// API: ${feature.endpoints.join(", ")}` : "";

  const hasDashboard = pageType === "dashboard" || pageType === "analytics";
  const hasTimeline = pageType === "audit";
  const hasReviewQueue = pageType === "review";
  const hasExplainability = pageType === "explainability" || catKey === "ai";

  // Category-specific action labels
  const actionLabels = {
    compliance: "Run Audit",
    security: "Run Scan",
    ai: "Evaluate Model",
    analytics: "Generate Report",
    candidates: "New Candidate",
    interviews: "Schedule Interview",
    screening: "Start Screening",
    decisions: "Create Offer",
    integrations: "Sync Now",
    scheduling: "Auto-Schedule",
    sourcing: "Search Candidates",
    platform: "New Requisition",
    mobility: "Find Opportunities",
    onboarding: "Start Onboarding",
  };
  const actionLabel = actionLabels[catKey] || "Action";

  // Endpoints for details panel
  const endpointsList = feature.endpoints && feature.endpoints.length > 0 ? feature.endpoints : [];
  const endpointsJsx = endpointsList.length > 0
    ? endpointsList.map(ep => `<div key="${ep}" className="font-mono text-2xs px-2 py-1 rounded bg-muted">${ep}</div>`).join("\n                        ")
    : `<p className="text-sm text-muted-foreground">No endpoints configured</p>`;

  // Filter out icon names that conflict with recharts exports
  const rechartsConflicts = new Set(["BarChart", "LineChart", "PieChart", "AreaChart"]);
  const safeIcons = icons.map(icon => {
    if (hasDashboard && rechartsConflicts.has(icon)) {
      // Replace conflicting icons with alternatives
      const alternatives = { BarChart: "BarChart3", LineChart: "TrendingUp", PieChart: "PieChart" /* no alias, skip */, AreaChart: "Activity" };
      return alternatives[icon] || "Activity";
    }
    return icon;
  });
  // Deduplicate icons
  const uniqueIcons = [...new Set(safeIcons)];

  return `"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";${hasExplainability ? `
import { ExplanationCard } from "@/components/shared/explanation-card";` : ""}${hasTimeline ? `
import { Timeline } from "@/components/shared/timeline";` : ""}${hasDashboard ? `
import { ChartWrapper } from "@/components/shared/chart-wrapper";` : ""}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";${hasDashboard ? `
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "@/lib/constants";` : ""}
import { ${mockImport} } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { ${uniqueIcons.join(", ")} } from "lucide-react";

${endpointsComment}

const columns: ColumnDef<any>[] = ${tableColumns};

export default function FeaturePage() {
  const [search, setSearch] = useState("");
  const [mockData] = useState(() => ${mockDataCall});${hasDashboard ? `
  const [chartData] = useState(() => Array.from({ length: 12 }, (_, i) => ({ month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: Math.floor(Math.random() * 100) + 20, prev: Math.floor(Math.random() * 80) + 20 })));` : ""}

  return (
    <div className="space-y-6">
      <PageHeader
        title="${safeName}"
        description="${desc}"
        breadcrumbs={[
          { label: "${catLabel}", href: "/${catKey}" },
          { label: "${safeShortName}" },
        ]}
        actions={
          <div className="flex gap-2">${catKey === "security" ? `
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-2xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              System Secure — All checks passing
            </div>` : ""}${catKey === "compliance" ? `
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-2xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Compliance Status: Passing — Last audit: 2 days ago
            </div>` : ""}
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm"><${uniqueIcons[0]} className="h-4 w-4 mr-1" />${actionLabel}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
${kpiLabels.map((label, i) => `        <KPICard label="${label}" value={${JSON.stringify(kpiValues[i].value)}} change={${kpiValues[i].change}} changeLabel="vs last period" icon={<${uniqueIcons[i % uniqueIcons.length]} className="h-5 w-5" />} />`).join("\n")}
      </div>
${hasDashboard ? `
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartWrapper title="Trend Overview" description="Performance over time" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }} />
              <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="Current" />
              <Bar dataKey="prev" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} name="Previous" opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <ChartWrapper title="Trend Line" description="Change over time" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid #E2E8F0" }} />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>` : ""}
${hasExplainability ? `
      <ExplanationCard
        title="AI Analysis"
        decision="Recommendation generated"
        confidence={0.89}
        reasoning={["Feature analysis completed with high confidence", "Multiple data points corroborate the finding", "Historical patterns align with current assessment"]}
        reasonCodes={["DATA_QUALITY", "PATTERN_MATCH", "CONFIDENCE_HIGH"]}
        modelName="CDC ATS AI"
        modelVersion="3.2"
      />` : ""}

      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Data</TabsTrigger>${hasTimeline ? `
          <TabsTrigger value="activity">Activity</TabsTrigger>` : ""}
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="mt-4 space-y-4">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search..."
            filters={[
              { label: "Status", value: "status", options: ${getFilterOptions(catKey)} },
            ]}
          />
          <DataTable columns={columns} data={mockData} onExport={() => {}} />
        </TabsContent>${hasTimeline ? `
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Timeline events={(mockData as any[]).slice(0, 10).map((item: any, i: number) => ({
                id: item.id || String(i),
                timestamp: item.timestamp || item.lastUpdated || item.createdAt || item.appliedDate || new Date().toISOString(),
                actor: item.actor || item.createdBy || item.name || "System",
                action: item.action || item.name || item.type || "Event recorded",
                type: (i % 3 === 0 ? "success" : i % 3 === 1 ? "warning" : "info") as "success" | "warning" | "info",
              }))} />
            </CardContent>
          </Card>
        </TabsContent>` : ""}
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Configuration & Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-medium">${catLabel}</p>
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Priority</p>
                    <StatusBadge status="${feature.priority}" />
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Page Type</p>
                    <Badge variant="outline">${pageType}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Core Engine</p>
                    <p className="text-sm font-medium">${feature.engine || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">API Endpoints</p>
                    <div className="space-y-1">
                      ${endpointsJsx}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`;
}

// P0 pages that already have custom implementations
const p0CustomRoutes = new Set([
  "/compliance/protected-trait-proxy-detector",
  "/compliance/human-decision-gate-on-all-consequential-actions",
  "/platform/unified-ats-+-crm-+-scheduling-+-analytics-on-a-single-data-",
  "/platform/end-to-end-requisition-orchestration",
  "/security/secure-tool-router-with-safe-action-semantics",
  "/security/consent-first-data-minimization-orchestrator",
  "/security/api-level-data-residency-and-tenant-isolation",
  "/security/sensitive-data-segregation-vault",
  "/security/retention-and-deletion-orchestrator",
  "/security/fine-grained-access-and-just-in-time-review",
  "/security/prompt-injection-and-output-safety-firewall",
  "/security/enterprise-grade-security-architecture-with-zero-trust-desig",
]);

// Also protect hand-crafted pages by directory name (prevent deletion)
const protectedDirs = new Set([
  "protected-trait-proxy-detector", "human-decision-gate-on-all-consequential-actions",
  "unified-ats", "end-to-end-requisition-orchestration",
  "secure-tool-router", "consent-data-minimization", "data-residency-tenant-isolation",
  "sensitive-data-vault", "retention-deletion-orchestrator", "fine-grained-access-jit-review",
  "prompt-injection-firewall", "zero-trust-architecture",
  "agent-and-model-governance-console", "conversational-candidate-concierge-core-feature",
  "structured-interview-and-bars-builder-agent", "usp-ai-powered-intake-orchestrator",
  "final-selection-supervisor-agent", "event-sourced-hiring-ledger",
  "usp-api-first-agent-integration", "scheduling-and-rescheduling-coordinator-agent-with-no-show-p",
]);

// Map P0 routes to actual directory names we created
const p0DirMap = {
  "/compliance/protected-trait-proxy-detector": "protected-trait-proxy-detector",
  "/compliance/human-decision-gate-on-all-consequential-actions": "human-decision-gate-on-all-consequential-actions",
  "/platform/unified-ats-+-crm-+-scheduling-+-analytics-on-a-single-data-": "unified-ats",
  "/platform/end-to-end-requisition-orchestration": "end-to-end-requisition-orchestration",
  "/security/secure-tool-router-with-safe-action-semantics": "secure-tool-router",
  "/security/consent-first-data-minimization-orchestrator": "consent-data-minimization",
  "/security/api-level-data-residency-and-tenant-isolation": "data-residency-tenant-isolation",
  "/security/sensitive-data-segregation-vault": "sensitive-data-vault",
  "/security/retention-and-deletion-orchestrator": "retention-deletion-orchestrator",
  "/security/fine-grained-access-and-just-in-time-review": "fine-grained-access-jit-review",
  "/security/prompt-injection-and-output-safety-firewall": "prompt-injection-firewall",
  "/security/enterprise-grade-security-architecture-with-zero-trust-desig": "zero-trust-architecture",
};

let generated = 0;
let skipped = 0;

features.forEach((feature) => {
  // Skip P0 pages that have custom implementations
  if (p0CustomRoutes.has(feature.route)) {
    skipped++;
    return;
  }

  const catKey = feature.catKey;
  const dirName = slugToDir(feature.route);

  // Sanitize directory name for Windows (no ?, *, :, <, >, |, ")
  let safeDirName = dirName.replace(/[?*:<>|"]/g, "").replace(/\s+/g, "-");
  // Truncate very long directory names
  if (safeDirName.length > 60) safeDirName = safeDirName.substring(0, 60);

  // Skip protected hand-crafted pages
  if (protectedDirs.has(safeDirName)) {
    skipped++;
    return;
  }

  const pagePath = path.join(__dirname, "../app/(dashboard)", catKey, safeDirName, "page.tsx");
  const pageDir = path.dirname(pagePath);

  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // Skip if page already exists (don't overwrite custom pages)
  if (fs.existsSync(pagePath)) {
    skipped++;
    return;
  }

  const content = generatePage(feature);
  fs.writeFileSync(pagePath, content, "utf8");
  generated++;
});

console.log(`Generated: ${generated} pages`);
console.log(`Skipped: ${skipped} pages (already exist or P0 custom)`);
console.log(`Total features: ${features.length}`);
