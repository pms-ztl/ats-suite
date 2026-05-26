"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  MapPin,
  User,
  Briefcase,
  ArrowLeft,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

interface InterviewDetail {
  id: string;
  type: string;
  status: string;
  scheduledAt?: string;
  durationMinutes?: number;
  format?: string;
  meetingLink?: string;
  location?: string;
  notes?: string;
  candidate?: { id: string; firstName: string; lastName: string; email?: string };
  requisition?: { id: string; title: string };
  panelists?: { user: { id: string; firstName: string; lastName: string } }[];
  feedback?: {
    recommendation: string;
    notes?: string;
    rating?: number;
    strengths?: string[];
    concerns?: string[];
  }[];
  scorecard?: {
    overallScore?: number;
    criteria?: { name: string; score: number }[];
  };
}

const RECOMMENDATIONS = [
  { value: "STRONG_YES", label: "Strong Yes" },
  { value: "YES", label: "Yes" },
  { value: "NEUTRAL", label: "Neutral" },
  { value: "NO", label: "No" },
  { value: "STRONG_NO", label: "Strong No" },
] as const;

const statusColor: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

export default function InterviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [interview, setInterview] = useState<InterviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Feedback form state
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendation, setRecommendation] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api.interviews.getInterview(id);
        setInterview(result?.data ?? result ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load interview");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmitFeedback() {
    if (!recommendation) {
      toast.error("Please select a recommendation.");
      return;
    }
    setSubmitting(true);
    try {
      await api.interviews.submitFeedback(id, {
        interviewerId: "", // server uses auth token to determine
        rating: RECOMMENDATIONS.findIndex((r) => r.value === recommendation) + 1,
        strengths: [],
        concerns: [],
        recommendation,
        notes: feedbackNotes,
      });
      toast.success("Feedback submitted successfully.");
      setShowFeedback(false);
      // Reload
      const result = await api.interviews.getInterview(id);
      setInterview(result?.data ?? result ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      await api.interviews.cancelInterview(id);
      toast.success("Interview cancelled.");
      const result = await api.interviews.getInterview(id);
      setInterview(result?.data ?? result ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel interview");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <PageSkeleton />;
  if (error) return <PageError message={error} />;
  if (!interview) return <PageError message="Interview not found" />;

  const candidateName = interview.candidate
    ? `${interview.candidate.firstName} ${interview.candidate.lastName}`
    : "Unknown Candidate";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Interview: ${candidateName}`}
        description={interview.requisition?.title ?? ""}
        breadcrumbs={[
          { label: "Interviews", href: "/interviews" },
          { label: candidateName },
        ]}
        actions={
          <Link href="/interviews">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        }
      />

      {/* Interview Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Candidate:</span>
              <span>{candidateName}</span>
              {interview.candidate?.email && (
                <span className="text-muted-foreground">({interview.candidate.email})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Requisition:</span>
              <span>{interview.requisition?.title ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Scheduled:</span>
              <span>
                {interview.scheduledAt
                  ? new Date(interview.scheduledAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium ml-6">Type:</span>
              <span>{interview.type?.replace(/_/g, " ") ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium ml-6">Duration:</span>
              <span>{interview.durationMinutes ? `${interview.durationMinutes} min` : "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium ml-6">Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[interview.status] ?? "bg-gray-100 text-gray-600"}`}
              >
                {interview.status}
              </span>
            </div>
            {(interview.location || interview.meetingLink) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{interview.location ?? interview.meetingLink ?? "—"}</span>
              </div>
            )}
            {interview.panelists && interview.panelists.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-medium ml-6">Panelists:</span>
                <span>
                  {interview.panelists
                    .map((p) => `${p.user.firstName} ${p.user.lastName}`)
                    .join(", ")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {interview.status === "SCHEDULED" && (
              <>
                <Button
                  className="w-full"
                  onClick={() => setShowFeedback(true)}
                  disabled={showFeedback}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {cancelling ? "Cancelling..." : "Cancel Interview"}
                </Button>
              </>
            )}
            {interview.status === "COMPLETED" && !showFeedback && (
              <Button className="w-full" onClick={() => setShowFeedback(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            )}
            {interview.status === "CANCELLED" && (
              <p className="text-sm text-muted-foreground text-center py-4">
                This interview has been cancelled.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Form */}
      {showFeedback && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Submit Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Overall Recommendation</Label>
              <Select value={recommendation} onValueChange={setRecommendation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recommendation..." />
                </SelectTrigger>
                <SelectContent>
                  {RECOMMENDATIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Add your feedback notes..."
                rows={4}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitFeedback} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Feedback */}
      {interview.feedback && interview.feedback.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Submitted Feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {interview.feedback.map((fb, i) => (
                <div key={i} className="px-6 py-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Recommendation:</span>
                    <span className="text-sm">{fb.recommendation?.replace(/_/g, " ")}</span>
                    {fb.rating != null && (
                      <span className="text-xs text-muted-foreground">
                        (Rating: {fb.rating}/5)
                      </span>
                    )}
                  </div>
                  {fb.notes && <p className="text-sm text-muted-foreground">{fb.notes}</p>}
                  {fb.strengths && fb.strengths.length > 0 && (
                    <p className="text-xs text-green-700">
                      Strengths: {fb.strengths.join(", ")}
                    </p>
                  )}
                  {fb.concerns && fb.concerns.length > 0 && (
                    <p className="text-xs text-red-700">
                      Concerns: {fb.concerns.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scorecard */}
      {interview.scorecard && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Scorecard</CardTitle>
          </CardHeader>
          <CardContent>
            {interview.scorecard.overallScore != null && (
              <p className="text-sm mb-3">
                <span className="font-medium">Overall Score:</span>{" "}
                {interview.scorecard.overallScore}
              </p>
            )}
            {interview.scorecard.criteria && interview.scorecard.criteria.length > 0 && (
              <div className="space-y-2">
                {interview.scorecard.criteria.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-medium">{c.score}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
