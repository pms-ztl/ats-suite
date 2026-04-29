"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { KPICard } from "@/components/shared/kpi-card";
import { DataTable } from "@/components/shared/data-table/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck, Clock, AlertTriangle, CheckCircle2, Timer,
  RefreshCw, Bot,
} from "lucide-react";
import { cn, formatDateRelative } from "@/lib/utils";
import { toast } from "sonner";

// --- Types ---

interface HITLCheckpoint {
  id: string;
  tenantId: string;
  agentRunId: string;
  type: string;
  action: string;
  payload: Record<string, unknown>;
  assignedTo: string | null;
  assignedToName?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED";
  slaMinutes: number;
  resolution: Record<string, unknown> | null;
  resolvedBy: string | null;
  createdAt: string;
  resolvedAt: string | null;
  escalatedAt: string | null;
  agentType?: string;
}

// --- Helpers ---

function getSlaRemaining(createdAt: string, slaMinutes: number): { label: string; overdue: boolean; minutesLeft: number } {
  const deadline = new Date(new Date(createdAt).getTime() + slaMinutes * 60_000);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { label: "EXPIRED", overdue: true, minutesLeft: 0 };
  }

  const mins = Math.floor(diffMs / 60_000);
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;

  if (hrs > 0) {
    return { label: `${hrs}h ${remainMins}m`, overdue: false, minutesLeft: mins };
  }
  return { label: `${mins}m`, overdue: false, minutesLeft: mins };
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case "rejection_review": return "bg-rose-50 text-rose-700";
    case "approval": return "bg-emerald-50 text-emerald-700";
    case "offer_approval": return "bg-violet-50 text-violet-700";
    case "scheduling_review": return "bg-blue-50 text-blue-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

const AGENT_LABELS: Record<string, string> = {
  "candidate-screener": "Candidate Screener",
  "interview-scheduler": "Interview Scheduler",
  "offer-generator": "Offer Generator",
  "sourcing-agent": "Sourcing Agent",
  "compliance-checker": "Compliance Checker",
};

// --- Columns ---

function buildColumns(router: ReturnType<typeof useRouter>): ColumnDef<HITLCheckpoint, unknown>[] {
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold", getTypeBadgeColor(type))}>
            {type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </span>
        );
      },
    },
    {
      accessorKey: "agentType",
      header: "Agent",
      cell: ({ row }) => {
        const agent = row.original.agentType ?? "unknown";
        return (
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm">{AGENT_LABELS[agent] ?? agent}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span className="text-sm max-w-[200px] truncate block">{row.original.action}</span>
      ),
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.assignedToName ?? row.original.assignedTo ?? "Unassigned"}</span>
      ),
    },
    {
      id: "sla",
      header: "SLA",
      cell: ({ row }) => {
        if (row.original.status !== "PENDING") {
          return <span className="text-xs text-muted-foreground">--</span>;
        }
        const sla = getSlaRemaining(row.original.createdAt, row.original.slaMinutes);
        return (
          <div className="flex items-center gap-1.5">
            <Timer className={cn("h-3.5 w-3.5", sla.overdue ? "text-rose-500" : sla.minutesLeft < 60 ? "text-amber-500" : "text-muted-foreground")} />
            <span className={cn(
              "text-sm font-medium",
              sla.overdue ? "text-rose-600" : sla.minutesLeft < 60 ? "text-amber-600" : ""
            )}>
              {sla.label}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDateRelative(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status.toLowerCase()} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => router.push(`/hitl/${row.original.id}`)}
        >
          Review
        </Button>
      ),
    },
  ];
}

// --- Page ---

export default function HITLQueuePage() {
  const router = useRouter();
  const [checkpoints, setCheckpoints] = useState<HITLCheckpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");

  const fetchCheckpoints = useCallback(() => {
    setLoading(true);
    fetch("/api/agents/hitl", {
      headers: { "x-tenant-id": "default" },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        setCheckpoints(data);
      })
      .catch((err) => {
        console.error("Failed to load HITL checkpoints:", err);
        toast.error("Failed to load review queue");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCheckpoints(); }, [fetchCheckpoints]);

  // Derived data
  const pending = useMemo(() => checkpoints.filter((c) => c.status === "PENDING"), [checkpoints]);
  const overdue = useMemo(
    () => pending.filter((c) => getSlaRemaining(c.createdAt, c.slaMinutes).overdue),
    [pending]
  );
  const resolvedToday = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return checkpoints.filter(
      (c) => c.resolvedAt && new Date(c.resolvedAt) >= todayStart
    );
  }, [checkpoints]);
  const avgResolutionMs = useMemo(() => {
    const resolved = checkpoints.filter((c) => c.resolvedAt);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((acc, c) => {
      return acc + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime());
    }, 0);
    return total / resolved.length;
  }, [checkpoints]);
  const avgResolutionLabel = useMemo(() => {
    if (avgResolutionMs === 0) return "--";
    const mins = Math.round(avgResolutionMs / 60_000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }, [avgResolutionMs]);

  // Filtering
  const filtered = useMemo(() => {
    let list = checkpoints;
    if (activeTab === "pending") list = list.filter((c) => c.status === "PENDING");
    else if (activeTab === "resolved") list = list.filter((c) => c.status === "APPROVED" || c.status === "REJECTED");
    else if (activeTab === "expired") list = list.filter((c) => c.status === "EXPIRED");
    if (typeFilter !== "all") list = list.filter((c) => c.type === typeFilter);
    if (agentFilter !== "all") list = list.filter((c) => c.agentType === agentFilter);
    return list;
  }, [checkpoints, activeTab, typeFilter, agentFilter]);

  const uniqueTypes = useMemo(() => Array.from(new Set(checkpoints.map((c) => c.type))), [checkpoints]);
  const uniqueAgents = useMemo(() => Array.from(new Set(checkpoints.map((c) => c.agentType).filter(Boolean) as string[])), [checkpoints]);

  const columns = useMemo(() => buildColumns(router), [router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Review Queue"
        description="Review and approve AI agent decisions before they take effect."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Review Queue" }]}
        actions={
          <Button variant="outline" size="sm" onClick={fetchCheckpoints} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))
        ) : (
          <>
            <KPICard
              label="Pending"
              value={pending.length}
              icon={<ClipboardCheck className="h-5 w-5" />}
            />
            <KPICard
              label="Overdue"
              value={overdue.length}
              icon={<AlertTriangle className="h-5 w-5" />}
              className={overdue.length > 0 ? "border-rose-200 bg-rose-50/30" : undefined}
            />
            <KPICard
              label="Avg Resolution"
              value={avgResolutionLabel}
              icon={<Clock className="h-5 w-5" />}
            />
            <KPICard
              label="Resolved Today"
              value={resolvedToday.length}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pending.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 text-2xs h-5 min-w-[20px] justify-center">
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {uniqueAgents.map((a) => (
              <SelectItem key={a} value={a!}>
                {AGENT_LABELS[a!] ?? a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={25}
        emptyTitle="No checkpoints found"
        emptyDescription={activeTab === "pending" ? "All caught up! No pending reviews." : "No checkpoints match your filters."}
      />
    </div>
  );
}
