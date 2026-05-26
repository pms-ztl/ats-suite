"use client";

import { useEffect, useState, useMemo } from "react";
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
import { ClipboardList, Search, Zap } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

interface Screening {
  id: string;
  candidateName?: string;
  candidateId?: string;
  requisitionTitle?: string;
  type?: string;
  status?: string;
  stage?: string;
  score?: number;
  result?: string;
  recommendation?: string;
  createdAt?: string;
  application?: {
    candidate?: { firstName: string; lastName: string };
    requisition?: { title: string };
  };
}

const STATUS_OPTIONS = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"] as const;

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-700",
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
};

export default function ScreeningPage() {
  const { can } = usePermissions();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api.screening.listScreenings({ page: 1, pageSize: 100 });
        const list = result?.data ?? [];
        setScreenings(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load screenings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const filtered = useMemo(() => {
    let rows = screenings;
    if (statusFilter !== "ALL") {
      rows = rows.filter(
        (s) => s.status === statusFilter || s.stage === statusFilter
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((s) => {
        const name =
          s.candidateName?.toLowerCase() ??
          `${s.application?.candidate?.firstName ?? ""} ${s.application?.candidate?.lastName ?? ""}`.toLowerCase();
        return name.includes(q);
      });
    }
    return rows;
  }, [screenings, statusFilter, search]);

  async function handleRunAIScreen() {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const token = document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "";
      await fetch(`${API}/ai/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "CANDIDATE_MATCH",
          status: "QUEUED",
          params: { batchSize: 10 },
        }),
      });
      toast.success("AI screening batch job queued.");
    } catch {
      toast.error("Failed to queue AI screening job.");
    }
  }

  if (!can("screening")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return <PageError message={error} onRetry={() => setRetryCount((n) => n + 1)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Screening & Assessment"
        description="Application intake, skills matching, blind review, and structured evaluation"
        breadcrumbs={[{ label: "Screening & Assessment" }]}
        actions={
          <Button size="sm" variant="outline" onClick={handleRunAIScreen}>
            <Zap className="h-3.5 w-3.5 mr-1" />
            Run AI Screen
          </Button>
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
          <SelectTrigger className="w-[170px]">
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
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No screenings to review</p>
              <p className="text-xs mt-1">
                Candidates will appear here once they enter the screening pipeline.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium">Candidate</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      Requisition
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      Score
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((s) => {
                    const name =
                      s.candidateName ??
                      (s.application?.candidate
                        ? `${s.application.candidate.firstName} ${s.application.candidate.lastName}`
                        : "Unknown");
                    const reqTitle =
                      s.requisitionTitle ?? s.application?.requisition?.title ?? "—";
                    const displayStatus = s.status ?? s.stage ?? "PENDING";
                    const isPending = displayStatus === "PENDING";
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-muted/40 transition-colors ${isPending ? "bg-yellow-50/50" : ""}`}
                      >
                        <td className="px-4 py-3 font-medium">{name}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {reqTitle}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {s.type?.replace(/_/g, " ") ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[displayStatus] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {displayStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {s.score != null ? `${Math.round(s.score * 100)}%` : "—"}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {s.result ?? s.recommendation ?? "—"}
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
