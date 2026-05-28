"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Download, ShieldCheck, ShieldAlert, Users, BarChart2, Sparkles, Loader2 } from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";
import { AgentReasoningTrace, type AgentStep } from "@/components/shared/agent-reasoning-trace";

interface BiasAudit {
  narrative?: string;
  overallCompliance?: boolean;
  reports?: Array<{ attribute: string; stage: string; adverseImpactRatio: number; fourFifthsPass: boolean; finding: string; recommendation: string }>;
  agentTrace?: AgentStep[];
  toolsUsed?: string[];
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

interface DiversityMetric {
  id: string;
  stage: string;
  groupName: string;
  applicantCount: number;
  selectedCount: number;
  selectionRate: number;
  adverseImpactRatio: number | null;
  fourFifthsPass: boolean | null;
  computedAt: string;
}

interface DiversityData {
  available: boolean;
  message?: string;
  metrics?: DiversityMetric[];
  byStage?: Record<string, DiversityMetric[]>;
  summary: {
    totalApplications: number;
    hiredCount: number;
    hireRate: number;
  };
}

export default function DiversityPage() {
  const { can } = usePermissions();
  const [data, setData] = useState<DiversityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [audit, setAudit] = useState<BiasAudit | null>(null);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/analytics/diversity`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token ?? ""}`,
          },
        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const json = await res.json();
        setData(json.data ?? json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
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

  const metrics = data?.metrics ?? [];
  const byStage = data?.byStage ?? {};
  const stages = Object.keys(byStage);

  // Count pass/fail across all metrics that have a 4/5ths result
  const withResult = metrics.filter((m) => m.fourFifthsPass !== null);
  const passCount = withResult.filter((m) => m.fourFifthsPass).length;
  const failCount = withResult.filter((m) => !m.fourFifthsPass).length;
  const overallPass = failCount === 0 && passCount > 0;

  async function runBiasAudit() {
    // Transform the displayed cohort metrics into the agent's input (group
    // COUNTS only — no PII) and let the agent compute 4/5ths + flag failures.
    const auditData = Object.entries(byStage)
      .map(([stage, ms]) => ({
        attribute: "demographic",
        stage,
        groups: ms.map((m) => ({ name: m.groupName, applicants: m.applicantCount, selected: m.selectedCount })),
      }))
      .filter((d) => d.groups.length >= 2);
    if (auditData.length === 0) {
      setAudit({ error: "Need at least two groups in a stage to audit." });
      return;
    }
    setAuditing(true);
    setAudit(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/bias-auditor`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({ data: auditData }),
      });
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();
      setAudit(json.data ?? json);
    } catch {
      setAudit({ error: "AI audit failed. Please try again." });
    } finally {
      setAuditing(false);
    }
  }

  async function exportEEO() {
    const token = getToken();
    const res = await fetch(`${API_BASE}/analytics/export/eeo`, {
      credentials: "include",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eeo-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diversity & Compliance"
        description="EEOC 4/5ths rule analysis and adverse impact monitoring"
        breadcrumbs={[
          { label: "Analytics", href: "/analytics" },
          { label: "Diversity & Compliance" },
        ]}
      />

      <div className="flex items-center gap-2">
        <Link href="/analytics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={exportEEO}>
          <Download className="h-4 w-4 mr-1" /> Export EEO Report
        </Button>
        <Button size="sm" onClick={runBiasAudit} disabled={auditing} className="gap-1.5">
          {auditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {auditing ? "Auditing…" : "Run AI Audit"}
        </Button>
      </div>

      {/* AI Bias Audit result */}
      {audit && (
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Compliance Audit
              {audit.overallCompliance != null && (
                <Badge variant={audit.overallCompliance ? "default" : "destructive"} className="font-normal">
                  {audit.overallCompliance ? "Compliant" : "Adverse impact found"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audit.error ? (
              <p className="text-sm text-rose-600">{audit.error}</p>
            ) : (
              <>
                {audit.narrative && <p className="text-sm leading-relaxed">{audit.narrative}</p>}
                {audit.reports && audit.reports.length > 0 && (
                  <div className="space-y-2">
                    {audit.reports.map((r, i) => (
                      <div key={i} className="rounded-md border p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={r.fourFifthsPass ? "default" : "destructive"} className="text-2xs font-normal">
                            {r.fourFifthsPass ? "PASS" : "FAIL"} · {(r.adverseImpactRatio * 100).toFixed(0)}%
                          </Badge>
                          <span className="text-sm font-medium">{r.attribute} @ {r.stage}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{r.finding}</p>
                        <p className="text-xs"><span className="font-medium">Action:</span> {r.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
                {audit.agentTrace && audit.agentTrace.length > 0 && (
                  <AgentReasoningTrace steps={audit.agentTrace} toolsUsed={audit.toolsUsed} />
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.summary.totalApplications ?? 0}</p>
              <p className="text-xs text-muted-foreground">Total Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{withResult.length}</p>
              <p className="text-xs text-muted-foreground">Groups Analyzed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${overallPass ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
              {overallPass ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">{overallPass ? "Pass" : withResult.length === 0 ? "N/A" : "Fail"}</p>
              <p className="text-xs text-muted-foreground">Compliance Status</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {passCount}/{passCount + failCount}
              </p>
              <p className="text-xs text-muted-foreground">4/5ths Rule Pass</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No data state */}
      {!data?.available && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {data?.message ?? "No diversity metrics available. Run a bias analysis to generate data."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stage-level 4/5ths summary cards */}
      {stages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => {
            const stageMetrics = byStage[stage] ?? [];
            const stageHasResult = stageMetrics.some((m) => m.fourFifthsPass !== null);
            const stageFails = stageMetrics.filter((m) => m.fourFifthsPass === false);
            const stagePass = stageHasResult && stageFails.length === 0;
            return (
              <Card key={stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{stage}</span>
                    {stageHasResult ? (
                      <Badge variant={stagePass ? "default" : "destructive"}>
                        {stagePass ? "Pass" : `${stageFails.length} Fail`}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No Data</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {stageMetrics.length} group(s) analyzed
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Demographic Group Breakdown Table */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Demographic Group Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stage</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead className="text-right">Applicants</TableHead>
                  <TableHead className="text-right">Selected</TableHead>
                  <TableHead className="text-right">Selection Rate</TableHead>
                  <TableHead className="text-right">Impact Ratio</TableHead>
                  <TableHead className="text-center">4/5ths</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.stage}</TableCell>
                    <TableCell className="font-medium">{m.groupName}</TableCell>
                    <TableCell className="text-right">{m.applicantCount}</TableCell>
                    <TableCell className="text-right">{m.selectedCount}</TableCell>
                    <TableCell className="text-right">
                      {(m.selectionRate * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {m.adverseImpactRatio != null
                        ? (m.adverseImpactRatio * 100).toFixed(1) + "%"
                        : "--"}
                    </TableCell>
                    <TableCell className="text-center">
                      {m.fourFifthsPass != null ? (
                        <Badge variant={m.fourFifthsPass ? "default" : "destructive"}>
                          {m.fourFifthsPass ? "Pass" : "Fail"}
                        </Badge>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
