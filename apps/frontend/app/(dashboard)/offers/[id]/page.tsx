"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/status-badge";
import { Timeline } from "@/components/shared/timeline";
import {
  DollarSign,
  Calendar,
  User,
  Mail,
  Briefcase,
  CheckCircle,
  XCircle,
  Send,
  Clock,
  ShieldCheck,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";
import { offers } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";
import { formatCurrency, formatDate } from "@/lib/utils";

interface OfferApproval {
  id: string;
  approverId: string;
  approverName?: string;
  status: string;
  comments?: string;
  orderIndex: number;
  decidedAt?: string;
  approver?: { firstName: string; lastName: string };
}

interface OfferDetail {
  id: string;
  status: string;
  baseSalary?: number;
  equity?: string;
  bonus?: number;
  totalComp?: number;
  startDate?: string;
  expiresAt?: string;
  notes?: string;
  createdAt?: string;
  sentAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  approvals?: OfferApproval[];
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    actor?: string;
  }>;
  application?: {
    candidate?: {
      firstName: string;
      lastName: string;
      email?: string;
    };
    requisition?: { title: string; id: string };
  };
  candidateName?: string;
  candidateEmail?: string;
  requisitionTitle?: string;
}

const statusColor: Record<string, string> = {
  DRAFT: "bg-info-tint text-info",
  PENDING_APPROVAL: "bg-warn-tint text-warn",
  APPROVED: "bg-ok-tint text-ok",
  SENT: "bg-info-tint text-info",
  ACCEPTED: "bg-ok-tint text-ok",
  DECLINED: "bg-danger-tint text-danger",
};

const approvalStatusColor: Record<string, string> = {
  PENDING: "bg-warn-tint text-warn",
  APPROVED: "bg-ok-tint text-ok",
  REJECTED: "bg-danger-tint text-danger",
};

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { can } = usePermissions();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");

  const loadOffer = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await offers.get(offerId);
      setOffer(result?.data ?? result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offer");
    } finally {
      setLoading(false);
    }
  }, [offerId]);

  useEffect(() => {
    loadOffer();
  }, [loadOffer]);

  async function handleStatusChange(newStatus: string) {
    setActionLoading(true);
    try {
      await offers.patch(offerId, { status: newStatus });
      await loadOffer();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update offer status"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove(approved: boolean) {
    setActionLoading(true);
    try {
      await offers.approve(offerId, {
        status: approved ? "APPROVED" : "REJECTED",
        comments: approvalComment,
      });
      setApprovalComment("");
      await loadOffer();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit approval"
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (!can("offers") && !can("decisions")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return <PageError message={error} onRetry={loadOffer} />;
  if (!offer)
    return <PageError message="Offer not found" onRetry={loadOffer} />;

  const candidateName =
    offer.candidateName ??
    (offer.application?.candidate
      ? `${offer.application.candidate.firstName} ${offer.application.candidate.lastName}`
      : "Unknown");

  const candidateEmail =
    offer.candidateEmail ?? offer.application?.candidate?.email ?? "-";

  const role =
    offer.requisitionTitle ?? offer.application?.requisition?.title ?? "-";

  const displayStatus = offer.status ?? "DRAFT";

  // Build timeline events from statusHistory or dates
  const timelineEvents = buildTimeline(offer);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Offer for ${candidateName}`}
        description={role}
        breadcrumbs={[
          { label: "Offers", href: "/offers" },
          { label: candidateName },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/offers")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Offers
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Offer details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compensation Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Compensation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Base Salary
                  </p>
                  <p className="text-lg font-bold font-mono">
                    {offer.baseSalary
                      ? formatCurrency(offer.baseSalary)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Equity</p>
                  <p className="text-lg font-bold font-mono">
                    {offer.equity ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bonus</p>
                  <p className="text-lg font-bold font-mono">
                    {offer.bonus ? formatCurrency(offer.bonus) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Total Compensation
                  </p>
                  <p className="text-lg font-bold font-mono text-primary">
                    {offer.totalComp
                      ? formatCurrency(offer.totalComp)
                      : "-"}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Start Date
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {offer.startDate
                      ? formatDate(offer.startDate, "MMM d, yyyy")
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Expiry Date
                  </p>
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {offer.expiresAt
                      ? formatDate(offer.expiresAt, "MMM d, yyyy")
                      : "No expiry"}
                  </p>
                </div>
              </div>

              {offer.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {offer.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Candidate Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {(candidateName[0] ?? "").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{candidateName}</p>
                    <p className="text-xs text-muted-foreground">Candidate</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{candidateEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{role}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Chain Card */}
          {offer.approvals && offer.approvals.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Approval Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {offer.approvals
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((approval) => {
                      const approverName =
                        approval.approverName ??
                        (approval.approver
                          ? `${approval.approver.firstName} ${approval.approver.lastName}`
                          : `Approver ${approval.orderIndex + 1}`);
                      return (
                        <div
                          key={approval.id}
                          className="flex items-start justify-between gap-4 p-3 rounded-lg border bg-muted/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {approval.orderIndex + 1}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {approverName}
                              </p>
                              {approval.comments && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {approval.comments}
                                </p>
                              )}
                              {approval.decidedAt && (
                                <p className="text-2xs text-muted-foreground mt-0.5">
                                  {formatDate(
                                    approval.decidedAt,
                                    "MMM d, yyyy HH:mm"
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              approvalStatusColor[approval.status] ??
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {approval.status}
                          </span>
                        </div>
                      );
                    })}
                </div>

                {/* Approval actions for pending approvers */}
                {displayStatus === "PENDING_APPROVAL" && (
                  <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-warn/40 bg-warn-tint/50">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-warn" />
                      Your Approval Required
                    </p>
                    <Textarea
                      placeholder="Add comments (optional)"
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="mb-3"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(true)}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApprove(false)}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: Status sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    statusColor[displayStatus] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {displayStatus.replace(/_/g, " ")}
                </span>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>
                    {offer.createdAt
                      ? formatDate(offer.createdAt, "MMM d, yyyy")
                      : "-"}
                  </span>
                </div>
                {offer.sentAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sent</span>
                    <span>{formatDate(offer.sentAt, "MMM d, yyyy")}</span>
                  </div>
                )}
                {offer.acceptedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accepted</span>
                    <span>{formatDate(offer.acceptedAt, "MMM d, yyyy")}</span>
                  </div>
                )}
                {offer.declinedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Declined</span>
                    <span>{formatDate(offer.declinedAt, "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {displayStatus === "DRAFT" && (
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleStatusChange("PENDING_APPROVAL")}
                  disabled={actionLoading}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit for Approval
                </Button>
              )}
              {displayStatus === "APPROVED" && (
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleStatusChange("SENT")}
                  disabled={actionLoading}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send to Candidate
                </Button>
              )}
              {displayStatus === "SENT" && (
                <>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleStatusChange("ACCEPTED")}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark Accepted
                  </Button>
                  <Button
                    className="w-full"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange("DECLINED")}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Mark Declined
                  </Button>
                </>
              )}
              {displayStatus === "ACCEPTED" && (
                <Button
                  className="w-full"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/screening?offerId=${offer.id}`)
                  }
                  disabled={actionLoading}
                >
                  <ShieldCheck className="h-4 w-4 mr-1" />
                  Initiate Background Check
                </Button>
              )}
              {(displayStatus === "DRAFT" ||
                displayStatus === "PENDING_APPROVAL") && (
                <Button
                  className="w-full"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(`/offers/${offer.id}/edit`)
                  }
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Edit Offer
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          {timelineEvents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline events={timelineEvents} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function buildTimeline(offer: OfferDetail) {
  const events: Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details?: string;
    type?: "info" | "success" | "warning" | "error";
  }> = [];

  // Use statusHistory if available
  if (offer.statusHistory && offer.statusHistory.length > 0) {
    offer.statusHistory.forEach((sh, i) => {
      events.push({
        id: `sh-${i}`,
        timestamp: sh.timestamp,
        actor: sh.actor ?? "System",
        action: `Status changed to ${sh.status.replace(/_/g, " ")}`,
        type:
          sh.status === "ACCEPTED"
            ? "success"
            : sh.status === "DECLINED"
              ? "error"
              : sh.status === "PENDING_APPROVAL"
                ? "warning"
                : "info",
      });
    });
    return events;
  }

  // Fallback: build from known dates
  if (offer.createdAt) {
    events.push({
      id: "created",
      timestamp: offer.createdAt,
      actor: "System",
      action: "Offer created",
      type: "info",
    });
  }
  if (offer.sentAt) {
    events.push({
      id: "sent",
      timestamp: offer.sentAt,
      actor: "System",
      action: "Offer sent to candidate",
      type: "info",
    });
  }
  if (offer.acceptedAt) {
    events.push({
      id: "accepted",
      timestamp: offer.acceptedAt,
      actor: "Candidate",
      action: "Offer accepted",
      type: "success",
    });
  }
  if (offer.declinedAt) {
    events.push({
      id: "declined",
      timestamp: offer.declinedAt,
      actor: "Candidate",
      action: "Offer declined",
      type: "error",
    });
  }

  // Add approval events
  if (offer.approvals) {
    offer.approvals
      .filter((a) => a.decidedAt)
      .forEach((a) => {
        const name =
          a.approverName ??
          (a.approver
            ? `${a.approver.firstName} ${a.approver.lastName}`
            : "Approver");
        events.push({
          id: `approval-${a.id}`,
          timestamp: a.decidedAt!,
          actor: name,
          action: `${a.status === "APPROVED" ? "Approved" : "Rejected"} offer`,
          details: a.comments,
          type: a.status === "APPROVED" ? "success" : "error",
        });
      });
  }

  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}
