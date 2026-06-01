"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Globe, TrendingUp, Users, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

interface SourceData {
  source: string | null;
  totalCandidates: number;
  hiredCount: number;
  hireRate: number;
}

interface SourceResponse {
  sources: SourceData[];
}

export default function SourceEffectivenessPage() {
  const { can } = usePermissions();
  const [data, setData] = useState<SourceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/analytics/source-of-hire`, {
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

  const sources = (data?.sources ?? []).map((s) => ({
    ...s,
    source: s.source ?? "Unknown",
  }));

  const totalSources = sources.length;
  const totalCandidates = sources.reduce((sum, s) => sum + s.totalCandidates, 0);
  const totalHired = sources.reduce((sum, s) => sum + s.hiredCount, 0);
  const topSource = sources.length
    ? sources.reduce((a, b) => (a.hireRate > b.hireRate ? a : b))
    : null;

  // Chart data sorted by totalCandidates descending
  const chartData = [...sources]
    .sort((a, b) => b.totalCandidates - a.totalCandidates)
    .slice(0, 15);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Source Effectiveness"
        description="Evaluate which sourcing channels deliver the best candidates"
        breadcrumbs={[
          { label: "Analytics", href: "/analytics" },
          { label: "Source Effectiveness" },
        ]}
      />

      <Link href="/analytics">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </Link>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSources}</p>
              <p className="text-xs text-muted-foreground">Active Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ai/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-ai-ink" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCandidates}</p>
              <p className="text-xs text-muted-foreground">Total Candidates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-ok/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-ok" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalHired}</p>
              <p className="text-xs text-muted-foreground">Total Hires</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-warn/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-warn" />
            </div>
            <div>
              <p className="text-2xl font-bold">{topSource?.source ?? "--"}</p>
              <p className="text-xs text-muted-foreground">
                Top Source ({topSource ? `${topSource.hireRate}%` : "--"})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Bar Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Candidates by Source</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(chartData.length * 40, 200)}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="source"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "totalCandidates" ? "Candidates" : "Hired",
                  ]}
                />
                <Bar dataKey="totalCandidates" fill="#6366f1" radius={[0, 4, 4, 0]} name="Candidates" />
                <Bar dataKey="hiredCount" fill="#10b981" radius={[0, 4, 4, 0]} name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No source data available yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Source Breakdown Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Source Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {sources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Candidates</TableHead>
                  <TableHead className="text-right">Hires</TableHead>
                  <TableHead className="text-right">Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources
                  .sort((a, b) => b.hireRate - a.hireRate)
                  .map((s) => (
                    <TableRow key={s.source}>
                      <TableCell className="font-medium">{s.source}</TableCell>
                      <TableCell className="text-right">{s.totalCandidates}</TableCell>
                      <TableCell className="text-right">{s.hiredCount}</TableCell>
                      <TableCell className="text-right">{s.hireRate}%</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No source data available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
