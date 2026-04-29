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
import { ArrowLeft, Clock, Download, Building2, TrendingDown } from "lucide-react";
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

interface DeptTTH {
  department: string;
  averageDays: number;
  count: number;
}

interface TTHData {
  averageDays: number;
  medianDays: number;
  sampleSize: number;
  byDepartment: DeptTTH[];
}

export default function TimeToHirePage() {
  const { can } = usePermissions();
  const [data, setData] = useState<TTHData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/analytics/time-to-hire`, {
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

  const departments = data?.byDepartment ?? [];
  const fastest = departments.length
    ? departments.reduce((a, b) => (a.averageDays < b.averageDays ? a : b))
    : null;

  async function exportCSV() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Time to Hire"
        description="Track how long it takes to fill positions across departments"
        breadcrumbs={[
          { label: "Analytics", href: "/analytics" },
          { label: "Time to Hire" },
        ]}
      />

      <div className="flex items-center gap-2">
        <Link href="/analytics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.averageDays ?? "--"}d</p>
              <p className="text-xs text-muted-foreground">Avg Time to Hire</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.medianDays ?? "--"}d</p>
              <p className="text-xs text-muted-foreground">Median TTH</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{departments.length}</p>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {fastest ? `${fastest.averageDays}d` : "--"}
              </p>
              <p className="text-xs text-muted-foreground">
                Fastest Dept{fastest ? ` (${fastest.department})` : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart by Department */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Time to Hire by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                <Tooltip
                  formatter={(value) => [`${value} days`, "Avg TTH"]}
                />
                <Bar dataKey="averageDays" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hired candidates yet. Data will appear once positions are filled.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Department Breakdown Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {departments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Avg Days</TableHead>
                  <TableHead className="text-right">Hires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments
                  .sort((a, b) => a.averageDays - b.averageDays)
                  .map((d) => (
                    <TableRow key={d.department}>
                      <TableCell className="font-medium">{d.department}</TableCell>
                      <TableCell className="text-right">{d.averageDays}d</TableCell>
                      <TableCell className="text-right">{d.count}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No department data available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
