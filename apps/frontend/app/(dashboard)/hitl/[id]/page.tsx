"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { HITLPayloadRenderer } from "@/components/shared/hitl-payload-renderer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Bot, Timer, Clock, CheckCircle2, XCircle, User,
  ChevronLeft, Loader2, Cpu, Wrench, DollarSign,
  AlertTriangle,
} from "lucide-react";
import { cn, formatDateRelative, formatDate } from "@/lib/utils";
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
  resolvedByName?: string;
  createdAt: string;
  resolvedAt: string | null;
  escalatedAt: string | null;
  agentType?: string;
}

interface AgentTrace {
  id: string;
  agentRunId: string;
  stepNumber: number;
  type: "llm_call" | "tool_call" | "reasoning" | "error";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  model?: string;
  tokensUsed?: number;
  cost?: number;
  latencyMs?: number;
  createdAt: string;
}

interface AgentRun {
  id: string;
  agentType: string;
  status: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  totalCost?: number;
  totalTokens?: number;
  durationMs?: number;
  traces?: AgentTrace[];
  createdAt: string;
  completedAt?: string;
}

// --- Helpers ---

function getSlaRemaining(createdAt: string, slaMinutes: number): { label: string; overdue: boolean; minutesLeft: number } {
  const deadline = new Date(new Date(createdAt).getTime() + slaMinutes * 60_000);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  if (diffMs <= 0) return { label: "EXPIRED", overdue: true, minutesLeft: 0 };
  const mins = Math.floor(diffMs / 60_000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return { label: `${hrs}h ${mins % 60}m remaining`, overdue: false, minutesLeft: mins };
  return { label: `${mins}m remaining`, overdue: false, minutesLeft: mins };
}

const AGENT_LABELS: Record<string, string> = {
  "candidate-screener": "Candidate Screener",
  "interview-scheduler": "Interview Scheduler",
  "offer-generator": "Offer Generator",
  "sourcing-agent": "Sourcing Agent",
  "compliance-checker": "Compliance Checker",
};

function getTraceIcon(type: string) {
  switch (type) {
    case "llm_call": return <Cpu className="h-4 w-4 text-indigo-500" />;
    case "tool_call": return <Wrench className="h-4 w-4 text-emerald-500" />;
    case "reasoning": return <Bot className="h-4 w-4 text-blue-500" />;
    case "error": return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    default: return <Bot className="h-4 w-4 text-muted-foreground" />;
  }
}

// --- Page ---

export default function HITLCheckpointDetailPage() {
  const params = useParams();
  const router = useRouter();
  const checkpointId = params.id as string;

  const [checkpoint, setCheckpoint] = useState<HITLCheckpoint | null>(null);
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch checkpoint data
  const fetchData = useCallback(() => {
    setLoading(true);

    // Fetch all HITL checkpoints and find this one
    const checkpointPromise = fetch("/api/agents/hitl", {
      headers: { "x-tenant-id": "default" },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        const data = Array.isArray(res) ? res : res.data ?? [];
        const found = data.find((c: HITLCheckpoint) => c.id === checkpointId);
        if (found) setCheckpoint(found);
        return found;
      });

    checkpointPromise
      .then((cp) => {
        if (!cp?.agentRunId) return;
        // Fetch agent run with traces
        return fetch(`/api/agents/runs/${cp.agentRunId}`, {
          headers: { "x-tenant-id": "default" },
        })
          .then((r) => {
            if (!r.ok) return null;
            return r.json();
          })
          .then((res) => {
            if (res) setAgentRun(res.data ?? res);
          });
      })
      .catch((err) => {
        console.error("Failed to load checkpoint data:", err);
        toast.error("Failed to load checkpoint details");
      })
      .finally(() => setLoading(false));
  }, [checkpointId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Resolve checkpoint
  const resolveCheckpoint = useCallback(
    (status: "APPROVED" | "REJECTED", reason?: string) => {
      setResolving(true);
      fetch(`/api/agents/hitl/${checkpointId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": "default",
        },
        body: JSON.stringify({
          status,
          ...(reason ? { resolution: { reason } } : {}),
        }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(() => {
          toast.success(
            status === "APPROVED"
              ? "Checkpoint approved successfully"
              : "Checkpoint rejected"
          );
          router.push("/hitl");
        })
        .catch((err) => {
          console.error("Failed to resolve checkpoint:", err);
          toast.error("Failed to resolve checkpoint");
        })
        .finally(() => setResolving(false));
    },
    [checkpointId, router]
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Not found
  if (!checkpoint) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Checkpoint Not Found"
          description="The requested HITL checkpoint could not be found."
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Review Queue", href: "/hitl" },
            { label: "Not Found" },
          ]}
        />
        <Button variant="outline" onClick={() => router.push("/hitl")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Queue
        </Button>
      </div>
    );
  }

  const sla = checkpoint.status === "PENDING"
    ? getSlaRemaining(checkpoint.createdAt, checkpoint.slaMinutes)
    : null;
  const isPending = checkpoint.status === "PENDING";
  const agentLabel = AGENT_LABELS[checkpoint.agentType ?? ""] ?? checkpoint.agentType ?? "Unknown Agent";
  const traces = agentRun?.traces ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Review Checkpoint"
        description={`${agentLabel} requested a ${checkpoint.type.replace(/_/g, " ")}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Review Queue", href: "/hitl" },
          { label: `Checkpoint ${checkpoint.id.slice(0, 8)}` },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/hitl")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        }
      />

      {/* Status Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <StatusBadge status={checkpoint.status.toLowerCase()} />
            <Badge variant="outline" className="gap-1.5">
              <Bot className="h-3.5 w-3.5" />
              {agentLabel}
            </Badge>
            <span className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold",
              checkpoint.type === "rejection_review" ? "bg-rose-50 text-rose-700" :
              checkpoint.type === "offer_approval" ? "bg-violet-50 text-violet-700" :
              checkpoint.type === "scheduling_review" ? "bg-blue-50 text-blue-700" :
              "bg-muted text-muted-foreground"
            )}>
              {checkpoint.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
            {sla && (
              <div className="flex items-center gap-1.5">
                <Timer className={cn("h-4 w-4", sla.overdue ? "text-rose-500" : sla.minutesLeft < 60 ? "text-amber-500" : "text-muted-foreground")} />
                <span className={cn(
                  "text-sm font-medium",
                  sla.overdue ? "text-rose-600" : sla.minutesLeft < 60 ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {sla.label}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDateRelative(checkpoint.createdAt)}
            </div>
            {checkpoint.assignedTo && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {checkpoint.assignedToName ?? checkpoint.assignedTo}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Payload + Trace (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Decision Summary */}
          <div>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4" /> Agent Decision
            </h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Proposed action:</span>{" "}
                    <span className="font-medium">{checkpoint.action}</span>
                  </p>
                </CardContent>
              </Card>
              <HITLPayloadRenderer type={checkpoint.type} payload={checkpoint.payload} />
            </div>
          </div>

          {/* Agent Trace */}
          {traces.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" /> Agent Reasoning Trace
              </h2>
              <Card>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible>
                    {traces
                      .sort((a, b) => a.stepNumber - b.stepNumber)
                      .map((trace, i) => (
                        <AccordionItem key={trace.id ?? i} value={`step-${i}`}>
                          <AccordionTrigger className="px-4 py-3 hover:no-underline">
                            <div className="flex items-center gap-3 text-sm">
                              {getTraceIcon(trace.type)}
                              <span className="font-medium">
                                Step {trace.stepNumber}: {trace.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              {trace.model && (
                                <Badge variant="secondary" className="text-2xs">{trace.model}</Badge>
                              )}
                              {trace.latencyMs !== undefined && (
                                <span className="text-xs text-muted-foreground">{trace.latencyMs}ms</span>
                              )}
                              {trace.cost !== undefined && trace.cost > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <DollarSign className="h-3 w-3" />{trace.cost.toFixed(4)}
                                </span>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-3">
                              {trace.input && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Input</p>
                                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                                    {JSON.stringify(trace.input, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {trace.output && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Output</p>
                                  <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                                    {JSON.stringify(trace.output, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {trace.tokensUsed !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  Tokens: {trace.tokensUsed.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </CardContent>
              </Card>
              {/* Agent run summary */}
              {agentRun && (
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {agentRun.totalCost !== undefined && (
                    <span>Total cost: ${agentRun.totalCost.toFixed(4)}</span>
                  )}
                  {agentRun.totalTokens !== undefined && (
                    <span>Total tokens: {agentRun.totalTokens.toLocaleString()}</span>
                  )}
                  {agentRun.durationMs !== undefined && (
                    <span>Duration: {(agentRun.durationMs / 1000).toFixed(1)}s</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions sidebar (1/3 width) */}
        <div className="space-y-6">
          {/* Action Buttons */}
          {isPending && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Review Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => resolveCheckpoint("APPROVED")}
                  disabled={resolving}
                >
                  {resolving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={resolving}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Resolution History */}
          {!isPending && checkpoint.resolvedAt && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={checkpoint.status.toLowerCase()} />
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Resolved by</p>
                    <p className="font-medium">{checkpoint.resolvedByName ?? checkpoint.resolvedBy ?? "System"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Resolved at</p>
                    <p className="font-medium">{formatDate(checkpoint.resolvedAt, "MMM d, yyyy h:mm a")}</p>
                  </div>
                  {checkpoint.resolution && (
                    <div>
                      <p className="text-xs text-muted-foreground">Comments</p>
                      <p className="text-sm bg-muted/50 rounded-md p-2 mt-1">
                        {(checkpoint.resolution as Record<string, unknown>).reason
                          ? String((checkpoint.resolution as Record<string, unknown>).reason)
                          : JSON.stringify(checkpoint.resolution)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Checkpoint ID</span>
                <span className="font-mono text-xs">{checkpoint.id.slice(0, 12)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent Run</span>
                <span className="font-mono text-xs">{checkpoint.agentRunId.slice(0, 12)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">SLA</span>
                <span>{checkpoint.slaMinutes} minutes</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(checkpoint.createdAt, "MMM d, h:mm a")}</span>
              </div>
              {checkpoint.escalatedAt && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escalated</span>
                    <span>{formatDate(checkpoint.escalatedAt, "MMM d, h:mm a")}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Checkpoint</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this agent decision. The agent will be notified and may retry with different parameters.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setRejectDialogOpen(false);
                resolveCheckpoint("REJECTED", rejectReason);
              }}
              disabled={!rejectReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
