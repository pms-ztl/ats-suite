"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock, Send, XCircle, Plus, ThumbsUp } from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

interface Decision {
  id: string;
  candidateId?: string;
  candidateName?: string;
  requisitionId?: string;
  requisitionTitle?: string;
  decisionType?: string;
  recommendation?: string;
  status?: string;
  confidence?: number;
  createdAt?: string;
  candidate?: { firstName: string; lastName: string };
  requisition?: { title: string };
}

const STATUS_OPTIONS = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "OFFER_SENT",
  "OFFER_ACCEPTED",
  "OFFER_DECLINED",
  "HIRED",
] as const;

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
  OFFER_SENT: "bg-blue-100 text-blue-800",
  OFFER_ACCEPTED: "bg-emerald-100 text-emerald-800",
  OFFER_DECLINED: "bg-orange-100 text-orange-800",
  HIRED: "bg-emerald-100 text-emerald-800",
  FINAL_REVIEW: "bg-orange-100 text-orange-800",
  OFFER: "bg-green-100 text-green-800",
};

export default function DecisionsPage() {
  const { can } = usePermissions();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api.decisions.listDecisions({ page: 1, pageSize: 100 });
        const list = result?.data ?? [];
        setDecisions(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load decisions");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return decisions;
    return decisions.filter((d) => d.status === statusFilter);
  }, [decisions, statusFilter]);

  // Stats
  const pending = decisions.filter((d) => d.status === "PENDING").length;
  const offers = decisions.filter((d) =>
    ["OFFER_SENT", "OFFER_ACCEPTED", "OFFER"].includes(d.status ?? "")
  ).length;
  const hired = decisions.filter((d) =>
    ["HIRED", "OFFER_ACCEPTED"].includes(d.status ?? "")
  ).length;
  const rejected = decisions.filter((d) =>
    ["REJECTED", "OFFER_DECLINED"].includes(d.status ?? "")
  ).length;

  if (!can("decisions")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Decision & Offer"
        description="Hire decisions, offer management, approvals, and compensation benchmarking"
        breadcrumbs={[{ label: "Decision & Offer" }]}
        actions={
          <Button size="sm" disabled>
            <Plus className="h-4 w-4 mr-1" />
            Create Offer
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Decisions", value: pending, icon: Clock },
          { label: "Active Offers", value: offers, icon: Send },
          { label: "Hired", value: hired, icon: ThumbsUp },
          { label: "Rejected / Declined", value: rejected, icon: XCircle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Decisions & Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckCircle className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No pending decisions or offers</p>
              <p className="text-xs mt-1">Decisions will appear as candidates progress through the pipeline.</p>
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
                      Decision
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((d) => {
                    const name =
                      d.candidateName ??
                      (d.candidate
                        ? `${d.candidate.firstName} ${d.candidate.lastName}`
                        : "Unknown");
                    const reqTitle =
                      d.requisitionTitle ?? d.requisition?.title ?? "—";
                    const displayStatus = d.status ?? "PENDING";
                    return (
                      <tr
                        key={d.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {(name[0] ?? "").toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {reqTitle}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {d.recommendation ?? d.decisionType ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[displayStatus] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {displayStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
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
