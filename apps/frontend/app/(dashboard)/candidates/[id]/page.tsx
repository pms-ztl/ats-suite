"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail, Phone, MapPin, Calendar, Briefcase, ArrowLeft,
  ChevronDown, Clock, User, Globe, Sparkles, MessageSquare, ShieldOff,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import { ParsedResumeView } from "@/components/candidates/parsed-resume-view";
import { InterviewQuestionsTab } from "@/components/candidates/interview-questions-tab";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CandidateDetail {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  source?: string;
  currentTitle?: string;
  createdAt?: string;
  applications?: {
    id: string;
    stage: string;
    status?: string;
    createdAt?: string;
    requisition?: { id: string; title: string; department?: string };
  }[];
  // Phase 37k — rich parsed data + fairness view
  parsedSummary?: Record<string, unknown> | null;
  parsedSummaryFair?: Record<string, unknown> | null;
}

interface TimelineEntry {
  id: string;
  action: string;
  details?: string;
  createdAt: string;
  performedBy?: string;
}

// Must match backend ApplicationStage enum (see candidates-write.ts AdvanceStageSchema)
const STAGE_ORDER = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];

function getNextStages(current: string): string[] {
  const idx = STAGE_ORDER.indexOf(current);
  if (idx === -1 || idx >= STAGE_ORDER.length - 1) return [];
  return STAGE_ORDER.slice(idx + 1);
}

function candidateName(c: CandidateDetail) {
  if (c.name) return c.name;
  return `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unknown";
}

function candidateInitials(c: CandidateDetail) {
  const parts = candidateName(c).split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  // Phase 37k — toggles ParsedResumeView between the full parsedSummary and
  // the PII-stripped parsedSummaryFair view. Off by default.
  const [fairnessMode, setFairnessMode] = useState(false);
  // Batch 6: custom-form attachments (anything beyond the primary resume)
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    fieldId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    requisitionId: string | null;
    requisitionTitle: string | null;
    createdAt: string;
  }>>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    api.candidates.get(id)
      .then((res: any) => {
        const data = res?.data ?? res;
        if (data.applications === undefined && data.newApplications) {
          data.applications = data.newApplications;
        }
        setCandidate(data);
      })
      .catch((err: any) => {
        setError(err instanceof Error ? err.message : "Failed to load candidate.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setTimelineLoading(true);
    api.candidates.getTimeline(id)
      .then((res: any) => {
        const data = res?.data ?? res;
        setTimeline(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Timeline may not be available, that is fine
        setTimeline([]);
      })
      .finally(() => setTimelineLoading(false));
  }, [id]);

  // Batch 6: fetch custom-form attachments
  useEffect(() => {
    if (!id) return;
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    let token: string | null = null;
    try { token = window.sessionStorage.getItem("ats-access-token"); } catch {}
    fetch(`${API}/candidates/${id}/attachments`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) setAttachments(res.data);
      })
      .catch(() => {});
  }, [id]);

  async function handleAdvanceStage(applicationId: string, newStage: string) {
    setAdvancing(true);
    try {
      // Real backend endpoint: POST /api/candidates/:candidateId/stage with { stage, applicationId }
      const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const token = typeof document !== "undefined"
        ? document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? ""
        : "";
      const res = await fetch(`${API}/candidates/${id}/stage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ stage: newStage, applicationId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Stage advance failed (HTTP ${res.status})`);
      }
      toast.success(`Stage advanced to ${newStage}`);
      // Reload candidate data
      const reload = await api.candidates.get(id);
      const data = (reload as any)?.data ?? reload;
      if (data.applications === undefined && data.newApplications) {
        data.applications = data.newApplications;
      }
      setCandidate(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to advance stage.";
      toast.error(msg);
    } finally {
      setAdvancing(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <div className="space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Candidate Not Found"
          breadcrumbs={[
            { label: "Candidates", href: "/candidates" },
            { label: "Not Found" },
          ]}
        />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{error || "This candidate could not be loaded."}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/candidates")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Candidates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const name = candidateName(candidate);
  const initials = candidateInitials(candidate);
  const latestApp = candidate.applications?.[0];
  const currentStage = latestApp?.stage ?? "APPLIED";
  const nextStages = getNextStages(currentStage);

  return (
    <div className="space-y-6">
      <PageHeader
        title={name}
        description={candidate.currentTitle || undefined}
        breadcrumbs={[
          { label: "Candidates", href: "/candidates" },
          { label: name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/candidates">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Link>
            </Button>
            {nextStages.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" disabled={advancing}>
                    Advance Stage <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {nextStages.map((stage) => (
                    <DropdownMenuItem
                      key={stage}
                      onClick={() => latestApp && handleAdvanceStage(latestApp.id, stage)}
                    >
                      Move to {stage}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Info */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">{initials}</span>
              </div>
              <h2 className="text-lg font-semibold">{name}</h2>
              {candidate.currentTitle && (
                <p className="text-sm text-muted-foreground">{candidate.currentTitle}</p>
              )}
              <div className="mt-2">
                <StatusBadge status={currentStage} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {candidate.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${candidate.email}`} className="hover:underline truncate">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate.source && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span>Source: {candidate.source}</span>
                </div>
              )}
              {candidate.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Added {new Date(candidate.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Applications + Timeline + parsed resume + interview questions */}
        <div className="lg:col-span-2">
          {/* Phase 37k — fairness mode toggle, only visible when parsed data exists */}
          {candidate.parsedSummary && (
            <div className="flex items-center justify-end gap-2 mb-2">
              <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
              <Label htmlFor="fairness" className="text-xs text-muted-foreground cursor-pointer">
                Fairness mode (hide identity-correlated fields)
              </Label>
              <Switch id="fairness" checked={fairnessMode} onCheckedChange={setFairnessMode} />
            </div>
          )}
          <Tabs defaultValue="applications" className="w-full">
            <TabsList>
              <TabsTrigger value="applications">
                Applications ({candidate.applications?.length ?? 0})
              </TabsTrigger>
              {candidate.parsedSummary && (
                <TabsTrigger value="resume" className="gap-1.5">
                  <Sparkles className="h-3 w-3" /> Resume
                </TabsTrigger>
              )}
              {candidate.parsedSummary && (
                <TabsTrigger value="questions" className="gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Interview Questions
                </TabsTrigger>
              )}
              <TabsTrigger value="timeline">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="attachments">
                Attachments{attachments.length > 0 ? ` (${attachments.length})` : ""}
              </TabsTrigger>
            </TabsList>

            {candidate.parsedSummary && (
              <TabsContent value="resume" className="mt-4">
                <ParsedResumeView
                  parsedSummary={(fairnessMode && candidate.parsedSummaryFair) ? candidate.parsedSummaryFair : candidate.parsedSummary}
                  fairnessMode={fairnessMode}
                />
              </TabsContent>
            )}

            {candidate.parsedSummary && (
              <TabsContent value="questions" className="mt-4">
                <InterviewQuestionsTab
                  candidateId={candidate.id}
                  applications={(candidate.applications ?? []).map((a) => ({
                    id: a.id,
                    requisition: a.requisition
                      ? { id: a.requisition.id, title: a.requisition.title }
                      : null,
                  }))}
                />
              </TabsContent>
            )}

            <TabsContent value="applications" className="mt-4 space-y-3">
              {(!candidate.applications || candidate.applications.length === 0) ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No applications found for this candidate.</p>
                  </CardContent>
                </Card>
              ) : (
                candidate.applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                            <p className="font-medium text-sm truncate">
                              {app.requisition?.title ?? "Unknown Position"}
                            </p>
                          </div>
                          {app.requisition?.department && (
                            <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                              {app.requisition.department}
                            </p>
                          )}
                          {app.createdAt && (
                            <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                              Applied {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={app.stage} />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              {timelineLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : timeline.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No timeline events recorded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-0">
                  {timeline.map((entry, i) => (
                    <div key={entry.id ?? i} className="flex gap-3 pb-4 relative">
                      {i < timeline.length - 1 && (
                        <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                      )}
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                        <Clock className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.action}</p>
                        {entry.details && (
                          <p className="text-xs text-muted-foreground">{entry.details}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                          {entry.performedBy && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" /> {entry.performedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Batch 6: Custom-form attachments */}
            <TabsContent value="attachments" className="mt-4 space-y-2">
              {attachments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No custom-form attachments.</p>
                    <p className="text-xs mt-1">Files uploaded via custom application forms (other than the main resume) appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                attachments.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                        {(a.mimeType?.split("/")[1] ?? "?").slice(0, 4).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Field <code className="text-2xs">{a.fieldId}</code>
                          {a.requisitionTitle && <> · <span className="italic">{a.requisitionTitle}</span></>}
                          {" · "}{(a.fileSize / 1024).toFixed(1)} KB
                          {" · "}{new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
