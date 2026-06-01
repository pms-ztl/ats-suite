"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { StatusBadge } from "@/components/shared/status-badge";
import {
  FileText,
  Clock,
  Send,
  CheckCircle,
  Plus,
  DollarSign,
} from "lucide-react";
import { offers } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Offer {
  id: string;
  status: string;
  baseSalary?: number;
  equity?: string;
  bonus?: number;
  totalComp?: number;
  startDate?: string;
  expiresAt?: string;
  createdAt?: string;
  application?: {
    candidate?: { firstName: string; lastName: string; email?: string };
    requisition?: { title: string };
  };
  candidateName?: string;
  requisitionTitle?: string;
}

const STATUS_OPTIONS = [
  "ALL",
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "SENT",
  "ACCEPTED",
  "DECLINED",
] as const;

const statusColor: Record<string, string> = {
  DRAFT: "bg-info-tint text-info",
  PENDING_APPROVAL: "bg-warn-tint text-warn",
  APPROVED: "bg-ok-tint text-ok",
  SENT: "bg-info-tint text-info",
  ACCEPTED: "bg-ok-tint text-ok",
  DECLINED: "bg-danger-tint text-danger",
};

export default function OffersPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const [offerList, setOfferList] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await offers.list({ page: 1, pageSize: 100 });
        const list = result?.data ?? result ?? [];
        setOfferList(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load offers");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const filtered = useMemo(() => {
    if (statusFilter === "ALL") return offerList;
    return offerList.filter((o) => o.status === statusFilter);
  }, [offerList, statusFilter]);

  // KPI stats
  const totalOffers = offerList.length;
  const pendingApproval = offerList.filter(
    (o) => o.status === "PENDING_APPROVAL"
  ).length;
  const sentAwaiting = offerList.filter((o) => o.status === "SENT").length;
  const accepted = offerList.filter((o) => o.status === "ACCEPTED").length;

  if (!can("offers") && !can("decisions")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return (
      <PageError
        message={error}
        onRetry={() => setRetryCount((c) => c + 1)}
      />
    );

  function getCandidateName(o: Offer): string {
    if (o.candidateName) return o.candidateName;
    if (o.application?.candidate) {
      const c = o.application.candidate;
      return `${c.firstName} ${c.lastName}`;
    }
    return "Unknown";
  }

  function getRole(o: Offer): string {
    return (
      o.requisitionTitle ?? o.application?.requisition?.title ?? "-"
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Offers"
        description="Manage compensation offers, approvals, and candidate responses"
        breadcrumbs={[{ label: "Offers" }]}
        actions={
          <Button size="sm" onClick={() => router.push("/offers/new")}>
            <Plus className="h-4 w-4 mr-1" />
            Create Offer
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Offers", value: totalOffers, icon: FileText },
          { label: "Pending Approval", value: pendingApproval, icon: Clock },
          { label: "Sent / Awaiting", value: sentAwaiting, icon: Send },
          { label: "Accepted", value: accepted, icon: CheckCircle },
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
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
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

      {/* Offers Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No offers found</p>
              <p className="text-xs mt-1">
                Offers will appear as candidates progress through the hiring pipeline.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium">
                      Candidate
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      Role
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                      Base Salary
                    </th>
                    <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                      Total Comp
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">
                      Expires
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((o) => {
                    const name = getCandidateName(o);
                    const displayStatus = o.status ?? "DRAFT";
                    return (
                      <tr
                        key={o.id}
                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                        onClick={() => router.push(`/offers/${o.id}`)}
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
                          {getRole(o)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              statusColor[displayStatus] ??
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {displayStatus.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell font-mono text-muted-foreground">
                          {o.baseSalary
                            ? formatCurrency(o.baseSalary)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right hidden lg:table-cell font-mono">
                          {o.totalComp
                            ? formatCurrency(o.totalComp)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {o.createdAt
                            ? formatDate(o.createdAt, "MMM d, yyyy")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                          {o.expiresAt
                            ? formatDate(o.expiresAt, "MMM d, yyyy")
                            : "-"}
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
