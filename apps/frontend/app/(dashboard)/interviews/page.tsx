"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Search, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt?: string;
  durationMinutes?: number;
  format?: string;
  candidate?: { firstName: string; lastName: string };
  requisition?: { title: string };
  panelists?: { user: { firstName: string; lastName: string } }[];
}

const STATUS_OPTIONS = ["ALL", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
const TYPE_OPTIONS = ["ALL", "PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "PANEL", "FINAL"] as const;

const statusColor: Record<string, string> = {
  SCHEDULED: "bg-info-tint text-info",
  COMPLETED: "bg-ok-tint text-ok",
  CANCELLED: "bg-danger-tint text-danger",
  NO_SHOW: "bg-warn-tint text-warn",
  PENDING: "bg-warn-tint text-warn",
};

export default function InterviewsPage() {
  const { can } = usePermissions();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api.interviews.listInterviews({ page: 1, pageSize: 100 });
        const list = result?.data ?? [];
        setInterviews(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const filtered = useMemo(() => {
    let rows = interviews;
    if (statusFilter !== "ALL") {
      rows = rows.filter((i) => i.status === statusFilter);
    }
    if (typeFilter !== "ALL") {
      rows = rows.filter((i) => i.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((i) => {
        const name = i.candidate
          ? `${i.candidate.firstName} ${i.candidate.lastName}`.toLowerCase()
          : "";
        return name.includes(q);
      });
    }
    return rows;
  }, [interviews, statusFilter, typeFilter, search]);

  if (!can("interviews")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interview Management"
        description="Schedule, coordinate, and debrief structured interview panels"
        breadcrumbs={[{ label: "Interview Management" }]}
        actions={
          <Link href="/scheduling">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Schedule Interview
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "ALL" ? "All Types" : t.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No interviews found</p>
              <p className="text-xs mt-1">Try adjusting your filters or schedule a new interview.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium">Candidate</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Requisition</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Scheduled At</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Interviewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((iv) => {
                    const candidateName = iv.candidate
                      ? `${iv.candidate.firstName} ${iv.candidate.lastName}`
                      : "Unknown";
                    const interviewer =
                      iv.panelists?.[0]?.user
                        ? `${iv.panelists[0].user.firstName} ${iv.panelists[0].user.lastName}`
                        : "-";
                    return (
                      <tr
                        key={iv.id}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/interviews/${iv.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {candidateName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {iv.requisition?.title ?? "-"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {iv.type?.replace(/_/g, " ") ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[iv.status] ?? "bg-muted text-muted-foreground"}`}
                          >
                            {iv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {iv.scheduledAt
                            ? new Date(iv.scheduledAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {interviewer}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
