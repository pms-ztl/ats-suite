#!/usr/bin/env node
/**
 * P3 + P4 Frontend Page Generator
 * Creates all 91 P3-Low + 5 P4-Future feature pages
 * and updates all 14 section index pages to include them.
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend/app/(dashboard)');
const USP_FILE = path.join(__dirname, 'USPs/unique_usps_master_list.json');

// ─── Load features ────────────────────────────────────────────────────────────
const raw = JSON.parse(fs.readFileSync(USP_FILE, 'utf8'));
const allFeatures = Array.isArray(raw) ? raw : (raw.usps || raw.features || Object.values(raw).flat());
const targetFeatures = allFeatures.filter(u => u.priority === 'P3-Low' || u.priority === 'P4-Future');

console.log(`Found ${targetFeatures.filter(f=>f.priority==='P3-Low').length} P3-Low features`);
console.log(`Found ${targetFeatures.filter(f=>f.priority==='P4-Future').length} P4-Future features`);

// ─── Category → folder mapping ───────────────────────────────────────────────
const CATEGORY_MAP = {
  'AI/ML Operations & Explainability': 'ai',
  'Analytics & Reporting': 'analytics',
  'Candidate Experience & Communication': 'candidates',
  'Compliance, Bias & Governance': 'compliance',
  'Core Platform & Architecture': 'platform',
  'Decision & Offer Management': 'decisions',
  'Integration & Workflow': 'integrations',
  'Internal Mobility & Workforce Planning': 'mobility',
  'Interview Management': 'interviews',
  'Onboarding & Post-Hire': 'onboarding',
  'Scheduling & Coordination': 'scheduling',
  'Screening & Assessment': 'screening',
  'Security & Privacy': 'security',
  'Sourcing & Talent Attraction': 'sourcing',
};

// ─── Section metadata ─────────────────────────────────────────────────────────
const SECTION_META = {
  ai:           { title: 'AI/ML Operations',          desc: 'AI model governance, explainability, and intelligent automation',          icon: 'Brain',        mockFn: 'generateAuditEvents',        icons: ['Brain', 'Cpu', 'Zap', 'Shield'] },
  analytics:    { title: 'Analytics & Reporting',     desc: 'Hiring analytics, pipeline reporting, and workforce insights',             icon: 'BarChart3',    mockFn: 'generateAuditEvents',        icons: ['BarChart3', 'TrendingUp', 'Activity', 'Target'] },
  candidates:   { title: 'Candidate Experience',      desc: 'Candidate engagement, communication, and experience management',          icon: 'Users',        mockFn: 'generateCandidates',         icons: ['Users', 'MessageSquare', 'Star', 'Heart'] },
  compliance:   { title: 'Compliance & Governance',   desc: 'Regulatory compliance, bias governance, and audit management',           icon: 'Scale',        mockFn: 'generateCompliancePolicies', icons: ['Scale', 'Shield', 'FileText', 'AlertTriangle'] },
  platform:     { title: 'Core Platform',             desc: 'Platform architecture, configuration, and system settings',              icon: 'Settings',     mockFn: 'generateAuditEvents',        icons: ['Settings', 'Database', 'Server', 'Code'] },
  decisions:    { title: 'Decision & Offer Mgmt',     desc: 'Offer management, decision workflows, and compensation analytics',       icon: 'CheckCircle',  mockFn: 'generateAuditEvents',        icons: ['CheckCircle', 'DollarSign', 'FileText', 'Award'] },
  integrations: { title: 'Integrations',              desc: 'Third-party integrations, API management, and workflow automation',      icon: 'Plug',         mockFn: 'generateAuditEvents',        icons: ['Plug', 'GitBranch', 'RefreshCw', 'Link'] },
  mobility:     { title: 'Internal Mobility',         desc: 'Internal transfers, career pathing, and workforce planning',             icon: 'ArrowUpRight', mockFn: 'generateAuditEvents',        icons: ['ArrowUpRight', 'Map', 'Briefcase', 'TrendingUp'] },
  interviews:   { title: 'Interview Management',      desc: 'Interview scheduling, scorecards, panel coordination, and debrief',      icon: 'Video',        mockFn: 'generateAuditEvents',        icons: ['Video', 'Calendar', 'ClipboardCheck', 'Users'] },
  onboarding:   { title: 'Onboarding & Post-Hire',    desc: 'Employee onboarding, documentation, and post-hire workflows',           icon: 'UserCheck',    mockFn: 'generateAuditEvents',        icons: ['UserCheck', 'BookOpen', 'CheckSquare', 'Rocket'] },
  scheduling:   { title: 'Scheduling & Coordination', desc: 'Interview scheduling, calendar management, and coordination',           icon: 'Calendar',     mockFn: 'generateAuditEvents',        icons: ['Calendar', 'Clock', 'Bell', 'RefreshCw'] },
  screening:    { title: 'Screening & Assessment',    desc: 'Resume screening, skill assessments, and candidate evaluation',         icon: 'Filter',       mockFn: 'generateAuditEvents',        icons: ['Filter', 'Search', 'ClipboardList', 'Star'] },
  security:     { title: 'Security & Privacy',        desc: 'Data security, access control, and privacy management',                 icon: 'Lock',         mockFn: 'generateAuditEvents',        icons: ['Lock', 'ShieldCheck', 'Eye', 'Key'] },
  sourcing:     { title: 'Sourcing & Talent',         desc: 'Talent sourcing, job posting, and attraction strategies',               icon: 'Search',       mockFn: 'generateAuditEvents',        icons: ['Search', 'Globe', 'Megaphone', 'Users'] },
};

// ─── KPIs per section ─────────────────────────────────────────────────────────
const KPIS = {
  ai:           [['Models Active','12',8.2],['Predictions Today','4,821',15.3],['Avg Confidence','87%',3.1],['Drift Alerts','2',-25.0]],
  analytics:    [['Reports Generated','247',12.5],['Active Dashboards','34',6.2],['Alerts Triggered','18',-8.1],['Data Freshness','< 5 min',0]],
  candidates:   [['Active Candidates','1,284',9.4],['Engagement Rate','73%',5.2],['Avg Response Time','4h',-12.0],['Satisfaction Score','4.6/5',2.1]],
  compliance:   [['Compliance Score','98%',1.4],['Policies Enforced','175',8.0],['Exceptions Flagged','12',-18.2],['Last Audit','2d ago',0]],
  platform:     [['Uptime','99.98%',0.1],['API Calls Today','182k',22.3],['Active Tenants','47',4.5],['Error Rate','0.02%',-31.0]],
  decisions:    [['Offers Sent','89',7.2],['Acceptance Rate','84%',3.5],['Avg Offer Cycle','3.2d',-14.0],['Pending Approvals','7',0]],
  integrations: [['Active Integrations','23',5.0],['Events Today','8,421',18.2],['Sync Errors','3',-40.0],['API Uptime','99.9%',0.1]],
  mobility:     [['Open Transfers','34',11.2],['Match Rate','67%',4.8],['Avg Transition Days','21',-9.1],['Promotions YTD','128',15.3]],
  interviews:   [['Scheduled Today','47',8.5],['Completion Rate','91%',2.1],['Avg Score','3.8/5',4.2],['No-Shows','4',-22.0]],
  onboarding:   [['Active Onboards','28',6.3],['Completion Rate','94%',3.1],['Tasks Overdue','5',-28.0],['Avg Days to Complete','7.2',-5.4]],
  scheduling:   [['Interviews Scheduled','142',9.8],['Conflicts Resolved','18',-15.0],['Avg Schedule Time','8 min',-22.5],['Cancellations','7',-10.0]],
  screening:    [['In Queue','312',14.2],['Screened Today','87',22.1],['Advance Rate','43%',3.2],['Avg Screen Time','12 min',-8.5]],
  security:     [['Security Score','96/100',1.0],['Active Sessions','284',5.2],['Threats Blocked','17',-12.0],['Audit Events','2,841',8.4]],
  sourcing:     [['Active Channels','18',2.0],['Candidates Sourced','1,847',21.4],['Pipeline Coverage','3.2x',8.5],['Cost per Candidate','$47',-12.2]],
};

// ─── Columns per section ──────────────────────────────────────────────────────
const COLUMNS = {
  candidates: `[
    { accessorKey: "id", header: "ID", cell: ({ row }: any) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "actor", header: "Candidate", cell: ({ row }: any) => <span className="font-medium">{row.getValue("actor")}</span> },
    { accessorKey: "action", header: "Stage" },
    { accessorKey: "resource", header: "Channel", cell: ({ row }: any) => <Badge variant="outline">{row.getValue("resource")}</Badge> },
    { accessorKey: "outcome", header: "Status", cell: ({ row }: any) => <StatusBadge status={row.getValue("outcome")} /> },
    { accessorKey: "timestamp", header: "Last Activity", cell: ({ row }: any) => <span className="text-sm">{formatDate(row.getValue("timestamp"))}</span> },
  ]`,
  analytics: `[
    { accessorKey: "id", header: "ID", cell: ({ row }: any) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "actor", header: "Source", cell: ({ row }: any) => <span className="font-medium">{row.getValue("actor")}</span> },
    { accessorKey: "action", header: "Metric" },
    { accessorKey: "resource", header: "Category", cell: ({ row }: any) => <Badge variant="outline">{row.getValue("resource")}</Badge> },
    { accessorKey: "outcome", header: "Status", cell: ({ row }: any) => <StatusBadge status={row.getValue("outcome")} /> },
    { accessorKey: "timestamp", header: "Updated", cell: ({ row }: any) => <span className="text-sm">{formatDate(row.getValue("timestamp"))}</span> },
  ]`,
  default: `[
    { accessorKey: "id", header: "ID", cell: ({ row }: any) => <span className="font-mono text-2xs">{row.getValue("id")}</span> },
    { accessorKey: "actor", header: "Name", cell: ({ row }: any) => <span className="font-medium">{row.getValue("actor")}</span> },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "resource", header: "Resource", cell: ({ row }: any) => <Badge variant="outline">{row.getValue("resource")}</Badge> },
    { accessorKey: "outcome", header: "Status", cell: ({ row }: any) => <StatusBadge status={row.getValue("outcome")} /> },
    { accessorKey: "timestamp", header: "Time", cell: ({ row }: any) => <span className="text-sm">{formatDate(row.getValue("timestamp"))}</span> },
  ]`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeStr(s) {
  if (!s) return '';
  return s
    .replace(/\\/g, '')
    .replace(/"/g, "'")
    .replace(/`/g, "'")
    .replace(/\$/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .trim();
}

function toSlug(name) {
  return safeStr(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 70)
    .replace(/-$/, '');
}

// ─── Page generator ───────────────────────────────────────────────────────────
function generatePage(feature, folder) {
  const meta   = SECTION_META[folder] || SECTION_META.analytics;
  const kpis   = KPIS[folder]    || KPIS.analytics;
  const cols   = COLUMNS[folder] || COLUMNS.default;
  const [icon1, icon2, icon3, icon4] = meta.icons;

  const safeName    = safeStr(feature.name);
  const description = feature.description
    ? safeStr(feature.description).substring(0, 120)
    : `${safeName} — intelligent automation and AI-powered workflow for modern recruiting teams.`;

  const apiHint = `// API: /api/${folder}/${toSlug(feature.name).substring(0, 30)}`;

  const kpiRows = kpis.map(([label, value, change]) =>
    `        <KPICard label="${label}" value={"${value}"} change={${change}} changeLabel="vs last period" icon={<${icon1} className="h-5 w-5" />} />`
  ).join('\n');

  const priorityBadge = feature.priority === 'P4-Future' ? 'P4-Future' : 'P3-Low';

  return `"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColumnDef } from "@tanstack/react-table";
import { generateAuditEvents } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { ${icon1}, ${icon2}, ${icon3}, ${icon4} } from "lucide-react";

${apiHint}

const columns: ColumnDef<any>[] = ${cols};

export default function FeaturePage() {
  const [search, setSearch] = useState("");
  const [mockData] = useState(() => generateAuditEvents(40));

  return (
    <div className="space-y-6">
      <PageHeader
        title="${safeName}"
        description="${description}"
        breadcrumbs={[
          { label: "${meta.title}", href: "/${folder}" },
          { label: "${safeName.substring(0, 50)}" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm"><${icon1} className="h-4 w-4 mr-1" />Run</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
${kpiRows}
      </div>

      <Tabs defaultValue="data">
        <TabsList>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="mt-4 space-y-4">
          <FilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search..."
            filters={[
              { label: "Status", value: "status", options: [{ label: "Active", value: "active" }, { label: "Pending", value: "pending" }, { label: "Completed", value: "completed" }] },
            ]}
          />
          <DataTable columns={columns} data={mockData} onExport={() => {}} />
        </TabsContent>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feature Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                    <p className="text-sm font-medium">${safeStr(feature.category) || meta.title}</p>
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Priority</p>
                    <StatusBadge status="${priorityBadge}" />
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Rank</p>
                    <p className="text-sm font-medium">#${feature.rank || ''}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Core Engine</p>
                    <p className="text-sm font-medium">${safeStr(feature.coreEngine) || folder + '-engine'}</p>
                  </div>
                  <div>
                    <p className="text-2xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">${description}</p>
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

// ─── Index page generator ─────────────────────────────────────────────────────
function generateIndexPage(folder, items) {
  const meta    = SECTION_META[folder] || { title: folder, desc: '' };
  const sorted  = [...items].sort((a, b) => (a.rank || 9999) - (b.rank || 9999));
  const fnName  = folder.charAt(0).toUpperCase() + folder.slice(1)
                    .replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'IndexPage';

  const featureItems = sorted.map(f => `  {
    "name": "${safeStr(f.name)}",
    "href": "${f.href}",
    "priority": "${f.priority}",
    "rank": ${f.rank || 0}
  }`).join(',\n');

  return `"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const features = [
${featureItems}
];

export default function ${fnName}() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="${meta.title}"
        description="${meta.desc}"
        breadcrumbs={[{ label: "${meta.title}" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, i) => (
          <Link key={i} href={feature.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{feature.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          feature.priority === "P0-Critical" ? "danger" :
                          feature.priority === "P1-High" ? "secondary" :
                          "outline"
                        }
                        className="text-2xs"
                      >
                        {feature.priority}
                      </Badge>
                      <span className="text-2xs text-muted-foreground">Rank #{feature.rank}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
let created = 0;
let skipped = 0;

// Seed bySection with existing index-page features
const bySection = {};
for (const folder of Object.values(CATEGORY_MAP)) bySection[folder] = [];

for (const folder of Object.values(CATEGORY_MAP)) {
  const indexPath = path.join(FRONTEND_DIR, folder, 'page.tsx');
  if (!fs.existsSync(indexPath)) continue;
  const content = fs.readFileSync(indexPath, 'utf8');
  const rx = /"name":\s*"([^"]*)"[\s\S]*?"href":\s*"([^"]*)"[\s\S]*?"priority":\s*"([^"]*)"[\s\S]*?"rank":\s*(\d+)/g;
  let m;
  while ((m = rx.exec(content)) !== null) {
    bySection[folder].push({ name: m[1], href: m[2], priority: m[3], rank: parseInt(m[4]) });
  }
}

// Generate pages + collect new entries
for (const feature of targetFeatures) {
  const folder = CATEGORY_MAP[feature.category];
  if (!folder) { console.warn(`⚠️  No folder for: ${feature.category}`); continue; }

  const slug    = toSlug(feature.name);
  const pageDir = path.join(FRONTEND_DIR, folder, slug);
  const pagePath = path.join(pageDir, 'page.tsx');
  const href    = `/${folder}/${slug}`;

  // Add to index (dedup later)
  bySection[folder].push({ name: feature.name, href, priority: feature.priority, rank: feature.rank || 9999 });

  if (fs.existsSync(pagePath)) { skipped++; continue; }
  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(pagePath, generatePage(feature, folder), 'utf8');
  created++;
  process.stdout.write('.');
}
console.log('');

// Rebuild all index pages (deduplicated)
for (const [folder, items] of Object.entries(bySection)) {
  const seen   = new Set();
  const unique = items.filter(item => {
    const key = item.href || item.name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const indexPath = path.join(FRONTEND_DIR, folder, 'page.tsx');
  fs.writeFileSync(indexPath, generateIndexPage(folder, unique), 'utf8');
  const p3count = unique.filter(u => u.priority === 'P3-Low').length;
  const p4count = unique.filter(u => u.priority === 'P4-Future').length;
  console.log(`✅  ${folder}/page.tsx — ${unique.length} total (${p3count} P3, ${p4count} P4)`);
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`✅  Created : ${created} new pages`);
console.log(`⏭️   Skipped : ${skipped} already existed`);
console.log(`📊  Total   : ${targetFeatures.length} P3+P4 features processed`);
console.log('🎉  Done!');
