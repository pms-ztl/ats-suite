"use client";

import { useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  Circle,
  Search,
  FileText,
  ArrowRight,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PIPELINE_STAGES = [
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENED", label: "Screened" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
] as const;

type StageKey = (typeof PIPELINE_STAGES)[number]["key"];

interface Application {
  id: string;
  requisition: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  currentStage: StageKey;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getStageIndex(stage: StageKey): number {
  return PIPELINE_STAGES.findIndex((s) => s.key === stage);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "IN_PROGRESS":
      return <Badge variant="info">In Progress</Badge>;
    case "HIRED":
    case "ACCEPTED":
      return <Badge variant="default" className="bg-emerald-600">Hired</Badge>;
    case "REJECTED":
    case "DECLINED":
      return <Badge variant="destructive">Not Selected</Badge>;
    case "WITHDRAWN":
      return <Badge variant="secondary">Withdrawn</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function ApplicationStatusPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [fetchError, setFetchError] = useState("");

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    setEmailError("");
    setFetchError("");

    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Use public API — no auth required
      const res = await fetch(
        `${API_BASE}/public/status?email=${encodeURIComponent(email.trim())}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.status === 404) {
        setApplications([]);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to look up applications");

      const json = await res.json();
      const result = json.data ?? json;

      // Map public API response to our Application interface
      const items: Application[] = (result.applications ?? []).map(
        (a: any) => ({
          id: a.applicationId,
          requisition: {
            id: "",
            title: a.role,
            department: a.department,
            location: "",
          },
          currentStage: a.stage ?? "APPLIED",
          status: a.status ?? "ACTIVE",
          appliedAt: a.appliedAt,
          updatedAt: a.appliedAt,
        })
      );
      setApplications(items);
    } catch {
      setFetchError(
        "Unable to look up your applications right now. Please try again later."
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track Your Applications</h1>
        <p className="text-muted-foreground mt-1">
          Enter your email to see the status of all your applications.
        </p>
      </div>

      {/* Email lookup form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleLookup} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  className={cn("pl-10", emailError && "border-destructive")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                />
              </div>
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="shrink-0">
              {loading ? (
                <Clock className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Look Up
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {fetchError && (
        <Card className="border-destructive/30">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-destructive">{fetchError}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && searched && !fetchError && (
        <>
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h2 className="text-lg font-semibold">
                  No applications found
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  We could not find any applications for{" "}
                  <strong>{email}</strong>. If you recently applied, it may take
                  a few minutes to appear.
                </p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/jobs">
                    Browse open positions <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {applications.length} application
                {applications.length !== 1 ? "s" : ""} for{" "}
                <strong>{email}</strong>
              </p>

              {applications.map((app) => {
                const currentIdx = getStageIndex(app.currentStage);

                return (
                  <Card key={app.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base">
                            {app.requisition.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {app.requisition.department} -{" "}
                            {app.requisition.location}
                          </p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Applied {formatDate(app.appliedAt)} - Last updated{" "}
                        {formatDate(app.updatedAt)}
                      </p>
                    </CardHeader>
                    <CardContent>
                      {/* Pipeline stepper */}
                      <div className="flex items-center gap-0">
                        {PIPELINE_STAGES.map((stage, i) => {
                          const isCompleted = i < currentIdx;
                          const isCurrent = i === currentIdx;
                          const isUpcoming = i > currentIdx;

                          return (
                            <div
                              key={stage.key}
                              className="flex items-center flex-1"
                            >
                              <div className="flex flex-col items-center gap-1.5 flex-1">
                                <div
                                  className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                    isCompleted &&
                                      "bg-emerald-100 text-emerald-600",
                                    isCurrent &&
                                      "bg-primary/10 text-primary ring-2 ring-primary",
                                    isUpcoming &&
                                      "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : isCurrent ? (
                                    <Clock className="h-4 w-4" />
                                  ) : (
                                    <Circle className="h-4 w-4" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-xs text-center",
                                    isCompleted && "text-emerald-700 font-medium",
                                    isCurrent && "text-primary font-medium",
                                    isUpcoming && "text-muted-foreground"
                                  )}
                                >
                                  {stage.label}
                                </span>
                              </div>
                              {i < PIPELINE_STAGES.length - 1 && (
                                <div
                                  className={cn(
                                    "h-0.5 flex-1 -mt-5",
                                    i < currentIdx
                                      ? "bg-emerald-300"
                                      : "bg-border"
                                  )}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Info cards (always shown) */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI assists in our hiring process. You have the right to request a
                human review of any AI-assisted decision.
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/transparency">View AI Transparency</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/appeal">Appeal a Decision</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have questions about your application or our process,
                please do not hesitate to reach out.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Contact Recruiting Team
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
