"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Key, Activity, FileSearch, ClipboardList } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

interface AuditEntry {
  id: string;
  action: string;
  toolName?: string;
  userId?: string;
  risk?: string;
  timestamp?: string;
  createdAt?: string;
  allowed?: boolean;
  blocked?: boolean;
}

interface AccessConfig {
  mfaEnabled?: boolean;
  ssoEnabled?: boolean;
  sessionTimeoutMinutes?: number;
  ipWhitelistEnabled?: boolean;
}

const riskColor: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
  CRITICAL: "bg-red-200 text-red-900",
};

export default function SecurityPage() {
  const { can } = usePermissions();
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [accessConfig, setAccessConfig] = useState<AccessConfig | null>(null);
  const [zeroTrust, setZeroTrust] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.security.getToolAudit({ page: 1, pageSize: 10 }),
      api.security.getAccessConfig(),
      api.security.getZeroTrustStatus(),
    ]).then(([auditRes, accessRes, ztRes]) => {
      if (auditRes.status === "fulfilled") {
        const d = auditRes.value as any;
        const rows = d?.data?.data ?? d?.data ?? d ?? [];
        setAuditLog(Array.isArray(rows) ? rows.slice(0, 10) : []);
      }
      if (accessRes.status === "fulfilled") {
        setAccessConfig((accessRes.value as any)?.data ?? null);
      }
      if (ztRes.status === "fulfilled") {
        setZeroTrust((ztRes.value as any)?.data ?? null);
      }
    }).finally(() => setLoading(false));
  }, []);

  const blocked = auditLog.filter(e => e.blocked || e.allowed === false).length;
  const highRisk = auditLog.filter(e => e.risk === "HIGH" || e.risk === "CRITICAL").length;

  const configItems = [
    { label: "MFA", value: accessConfig?.mfaEnabled, icon: Key },
    { label: "SSO", value: accessConfig?.ssoEnabled, icon: Shield },
    { label: "IP Whitelist", value: accessConfig?.ipWhitelistEnabled, icon: Lock },
    { label: "Zero Trust", value: zeroTrust?.enabled ?? zeroTrust?.status === "ACTIVE", icon: Eye },
  ];

  if (!can("security")) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Privacy"
        description="Access control, data protection, audit logs, and compliance controls"
        breadcrumbs={[{ label: "Security & Privacy" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Audit Events (recent)", value: auditLog.length, icon: Activity },
          { label: "Blocked Actions", value: blocked, icon: AlertTriangle },
          { label: "High Risk Events", value: highRisk, icon: AlertTriangle },
          { label: "Session Timeout", value: accessConfig?.sessionTimeoutMinutes ? `${accessConfig.sessionTimeoutMinutes}m` : "—", icon: Lock },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "—" : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Access Config */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Security Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
              </div>
            ) : (
              configItems.map(item => {
                const Icon = item.icon;
                const enabled = item.value === true;
                const unknown = item.value === undefined || item.value === null;
                return (
                  <div key={item.label} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      unknown ? "bg-gray-100 text-gray-500" :
                      enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {unknown ? "Unknown" : enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileSearch className="h-4 w-4" /> Recent Audit Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
              </div>
            )}
            {!loading && auditLog.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No audit events found.</div>
            )}
            {!loading && auditLog.length > 0 && (
              <div className="divide-y">
                {auditLog.map((entry, i) => (
                  <div key={entry.id ?? i} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-xs font-medium">{entry.action ?? entry.toolName ?? "Event"}</p>
                      <p className="text-2xs text-muted-foreground">
                        {entry.timestamp
                          ? new Date(entry.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.risk && (
                        <span className={`text-2xs font-medium px-1.5 py-0.5 rounded ${riskColor[entry.risk] ?? "bg-gray-100 text-gray-600"}`}>
                          {entry.risk}
                        </span>
                      )}
                      {entry.allowed === false || entry.blocked ? (
                        <span className="text-2xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700">BLOCKED</span>
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Audit Log — prominent compliance shortcut */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Audit Log</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Immutable, tamper-evident record of all system actions — failed logins, PII access, role changes, and more.
              </p>
            </div>
          </div>
          <Link href="/security/audit-log">
            <button className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap">
              <FileSearch className="h-3.5 w-3.5" />
              View Audit Log
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
