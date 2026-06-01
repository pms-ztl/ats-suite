"use client";

/**
 * Phase 23, interviewer "today" dashboard.
 *
 * Lives at `/` when the logged-in user has role INTERVIEWER. Focuses on
 * what they need to do as a panelist: today's interviews, feedback that's
 * still pending from them, and the candidates they've recently met.
 *
 * Uses tier-3 query filters added in Phase 23:
 *   GET /api/interviews?panelistId=me                    → my interviews
 *   GET /api/interviews?panelistId=me&feedbackPending=true → feedback due
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, ClipboardCheck, MessageSquare, ChevronRight, Clock } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { StatCard, RowsSkeleton, EmptyState, relativeTime } from "./recruiter-view";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface Interview {
  id: string;
  scheduledAt: string | null;
  status: string;
  candidateId: string;
  interviewType?: string;
  roundNumber?: number | null;
  round?: { name?: string; order?: number } | null;
}

export function InterviewerView() {
  const { user } = useCurrentUser();
  const firstName = (user?.name ?? user?.email ?? "there").split(" ")[0]?.split("@")[0] ?? "there";

  const [loading, setLoading] = useState(true);
  const [myInterviews, setMyInterviews] = useState<Interview[]>([]);
  const [feedbackDue, setFeedbackDue] = useState<Interview[]>([]);

  useEffect(() => {
    void (async () => {
      const headers = { Authorization: `Bearer ${getToken()}` };
      try {
        const [allRes, dueRes] = await Promise.all([
          fetch(`${API_BASE}/interviews?panelistId=me`, { headers }).catch(() => null),
          fetch(`${API_BASE}/interviews?panelistId=me&feedbackPending=true`, { headers }).catch(() => null),
        ]);
        if (allRes?.ok) {
          const body = await allRes.json();
          setMyInterviews(body.data ?? body ?? []);
        }
        if (dueRes?.ok) {
          const body = await dueRes.json();
          setFeedbackDue(body.data ?? body ?? []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Today = scheduled between 00:00 today and 24h from now
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 3600 * 1000);
  const today = myInterviews.filter((i) => {
    if (!i.scheduledAt) return false;
    const t = new Date(i.scheduledAt);
    return t >= startOfDay && t < endOfDay;
  });
  const upcoming = myInterviews.filter((i) => {
    if (!i.scheduledAt) return false;
    return new Date(i.scheduledAt) >= endOfDay;
  }).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi ${firstName}`}
        description="Your panel calendar + feedback queue."
        breadcrumbs={[{ label: "Interviewer today" }]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Calendar className="w-4 h-4" />} label="Today" value={loading ? "-" : today.length.toString()} hint="Interviews on your calendar" />
        <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Feedback due" value={loading ? "-" : feedbackDue.length.toString()} hint="Awaiting your write-up" />
        <StatCard icon={<Video className="w-4 h-4" />} label="Upcoming" value={loading ? "-" : upcoming.length.toString()} hint="In the next weeks" />
        <StatCard icon={<ClipboardCheck className="w-4 h-4" />} label="All assigned" value={loading ? "-" : myInterviews.length.toString()} hint="Where you're a panelist" />
      </div>

      {/* Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's interviews
            </CardTitle>
            <CardDescription>What you have on your calendar today.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/interviews">All<ChevronRight className="w-3 h-3 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <RowsSkeleton /> : today.length === 0 ? (
            <EmptyState text="Nothing on your calendar today. Enjoy the focus time." />
          ) : (
            <ul className="divide-y">
              {today.map((i) => (
                <li key={i.id} className="px-4 py-3 hover:bg-muted/40">
                  <Link href={`/interviews/${i.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="text-xs font-mono tabular-nums text-muted-foreground w-12 shrink-0">
                        {i.scheduledAt ? formatTime(i.scheduledAt) : "-"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{i.round?.name ?? `Round ${i.roundNumber ?? "?"}`}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">candidate {i.candidateId.slice(0, 8)}…</p>
                      </div>
                    </div>
                    <Badge variant={i.status === "SCHEDULED" ? "default" : "outline"} className="font-normal shrink-0">
                      {i.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Feedback due */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback due from you
            </CardTitle>
            <CardDescription>Interviews you've conducted but haven't written up.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <RowsSkeleton /> : feedbackDue.length === 0 ? (
            <EmptyState text="You're caught up, no feedback owed." />
          ) : (
            <ul className="divide-y">
              {feedbackDue.map((i) => (
                <li key={i.id} className="px-4 py-3 hover:bg-muted/40">
                  <Link href={`/interviews/${i.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{i.round?.name ?? `Round ${i.roundNumber ?? "?"}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.scheduledAt ? `Conducted ${relativeTime(i.scheduledAt)}` : "Not yet scheduled"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Write feedback <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming
            </CardTitle>
            <CardDescription>Coming up over the next weeks.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {upcoming.slice(0, 5).map((i) => (
                <li key={i.id} className="px-4 py-3 hover:bg-muted/40">
                  <Link href={`/interviews/${i.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{i.round?.name ?? `Round ${i.roundNumber ?? "?"}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.scheduledAt ? new Date(i.scheduledAt).toLocaleString() : "Not scheduled"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
