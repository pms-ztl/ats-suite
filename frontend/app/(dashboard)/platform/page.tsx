"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings, Users, Briefcase, Layers, Activity,
  Building2, Database, ShieldCheck, Globe, Wrench,
} from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const sections = [
  {
    icon: Briefcase,
    title: "Requisitions",
    description: "Manage open positions, approvals, and job postings across departments.",
    href: "/requisitions",
  },
  {
    icon: Users,
    title: "Team & Users",
    description: "Manage recruiters, hiring managers, and their role assignments.",
    href: "/security",
  },
  {
    icon: Layers,
    title: "Skills Library",
    description: "Maintain the canonical skills taxonomy used across all requisitions.",
    href: "/sourcing",
  },
  {
    icon: Building2,
    title: "Tenant Configuration",
    description: "Configure branding, department structure, and org-wide defaults.",
    href: "/settings",
  },
  {
    icon: Activity,
    title: "System Health",
    description: "Real-time service status, API latency, and background job queues.",
    href: "/analytics",
  },
  {
    icon: Database,
    title: "Data & Storage",
    description: "Manage data retention policies, exports, and backup schedules.",
    href: "/analytics",
  },
  {
    icon: ShieldCheck,
    title: "Permissions & Roles",
    description: "Define access scopes and role-based permissions across modules.",
    href: "/security",
  },
  {
    icon: Globe,
    title: "Localization",
    description: "Language, timezone, date format, and region settings.",
    href: "/settings",
  },
  {
    icon: Wrench,
    title: "Platform Settings",
    description: "Feature flags, workflow defaults, and advanced configuration.",
    href: "/settings",
  },
];

function apiToken() { return typeof document !== "undefined" ? (document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "") : ""; }
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export default function PlatformPage() {
  const { can } = usePermissions();
  const [apiData, setApiData] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/platform/features`, { headers: { Authorization: `Bearer ${apiToken()}` }, credentials: "include" })
      .then(r => r.json()).then(r => { const d = r.data?.data ?? r.data; if (Array.isArray(d) && d.length > 0) setApiData(d); }).catch((err) => { console.error("Failed to load platform features:", err); });
  }, []);
  if (!can("platform")) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Core Platform"
        description="Platform architecture, configuration, and system settings"
        breadcrumbs={[{ label: "Core Platform" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{section.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
