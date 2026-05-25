"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, DollarSign, Users, Calendar, Briefcase, ArrowLeft,
  Clock, Building2, FileText,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";

interface RequisitionDetail {
  id: string;
  title: string;
  department?: string;
  location?: string;
  status: string;
  priority?: number;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  headcount?: number;
  employmentType?: string;
  remote?: boolean;
  description?: string;
  targetStartDate?: string;
  createdAt?: string;
  updatedAt?: string;
  recruiter?: { firstName: string; lastName: string };
  applications?: {
    id: string;
    stage: string;
    candidate?: { id: string; firstName?: string; lastName?: string; email?: string };
  }[];
}

function formatSalary(min?: number, max?: number, currency?: string) {
  if (!min && !max) return "Not specified";
  const curr = currency ?? "USD";
  const fmt = (n: number) => `${curr} ${(n / 1000).toFixed(0)}k`;
  if (!min) return `Up to ${fmt(max!)}`;
  if (!max) return `From ${fmt(min)}`;
  return `${fmt(min)} - ${fmt(max)}`;
}

const statusColors: Record<string, string> = {
  OPEN: "bg-green-100 text-green-800",
  DRAFT: "bg-gray-100 text-gray-700",
  CLOSED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  FILLED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-emerald-100 text-emerald-800",
};

export default function RequisitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [requisition, setRequisition] = useState<RequisitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    api.platform.getRequisition(id)
      .then((res: any) => {
        const data = res?.data ?? res;
        setRequisition(data);
        // Check if a JobPosting exists for this requisition.
        // Backend may return either the historical singular `jobPosting` shape
        // or the new `jobPostings` array (the schema relation is 1:N).
        const posting = data?.jobPostings?.[0] ?? data?.jobPosting;
        setIsPublished(Boolean(posting?.isPublished));
      })
      .catch((err: any) => {
        setError(err instanceof Error ? err.message : "Failed to load requisition.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePublishToggle() {
    if (!id) return;
    setPublishing(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const token = typeof document !== "undefined"
        ? document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? ""
        : "";
      const action = isPublished ? "unpublish" : "publish";
      const res = await fetch(`${API}/requisitions/${id}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || `${action} failed (HTTP ${res.status})`);
      }
      setIsPublished(!isPublished);
      toast.success(isPublished ? "Requisition unpublished" : "Requisition published to job board");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish action failed.");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !requisition) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Requisition Not Found"
          breadcrumbs={[
            { label: "Requisitions", href: "/requisitions" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{error || "This requisition could not be loaded."}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/requisitions")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Requisitions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applications = requisition.applications ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={requisition.title}
        description={requisition.department || undefined}
        breadcrumbs={[
          { label: "Requisitions", href: "/requisitions" },
          { label: requisition.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/requisitions">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
            {requisition.status === "OPEN" && (
              <Button
                size="sm"
                variant={isPublished ? "outline" : "default"}
                onClick={handlePublishToggle}
                disabled={publishing}
              >
                {publishing ? "..." : isPublished ? "Unpublish" : "Publish to Job Board"}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" /> Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requisition.description ? (
                <p className="text-sm whitespace-pre-wrap">{requisition.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Linked Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Candidates ({applications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No applications yet for this requisition.
                </p>
              ) : (
                <div className="space-y-2">
                  {applications.map((app) => {
                    const cName = app.candidate
                      ? `${app.candidate.firstName ?? ""} ${app.candidate.lastName ?? ""}`.trim() || "Unknown"
                      : "Unknown";
                    return (
                      <div key={app.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex-1 min-w-0">
                          {app.candidate?.id ? (
                            <Link href={`/candidates/${app.candidate.id}`} className="text-sm font-medium hover:underline">
                              {cName}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium">{cName}</span>
                          )}
                          {app.candidate?.email && (
                            <p className="text-xs text-muted-foreground">{app.candidate.email}</p>
                          )}
                        </div>
                        <StatusBadge status={app.stage} />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Info sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[requisition.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {requisition.status}
                </span>
              </div>

              {requisition.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </span>
                  <span className="text-sm">{requisition.location}</span>
                </div>
              )}

              {requisition.department && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Department
                  </span>
                  <span className="text-sm">{requisition.department}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Salary
                </span>
                <span className="text-sm">{formatSalary(requisition.salaryMin, requisition.salaryMax, requisition.salaryCurrency)}</span>
              </div>

              {requisition.headcount != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Headcount
                  </span>
                  <span className="text-sm">{requisition.headcount}</span>
                </div>
              )}

              {requisition.employmentType && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> Type
                  </span>
                  <span className="text-sm">{requisition.employmentType}</span>
                </div>
              )}

              {requisition.remote != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Remote</span>
                  <Badge variant={requisition.remote ? "default" : "secondary"}>
                    {requisition.remote ? "Yes" : "No"}
                  </Badge>
                </div>
              )}

              {requisition.priority != null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  <span className="text-sm">{requisition.priority}</span>
                </div>
              )}

              {requisition.targetStartDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Target Start
                  </span>
                  <span className="text-sm">{new Date(requisition.targetStartDate).toLocaleDateString()}</span>
                </div>
              )}

              {requisition.recruiter && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recruiter</span>
                  <span className="text-sm">{requisition.recruiter.firstName} {requisition.recruiter.lastName}</span>
                </div>
              )}

              {requisition.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Created
                  </span>
                  <span className="text-sm">{new Date(requisition.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
