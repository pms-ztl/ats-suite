"use client";

/**
 * Phase 23, recruiter "today" dashboard.
 *
 * Lives at `/` when the logged-in user has role RECRUITER. Focuses on
 * the daily-driver tasks for a recruiter: candidates added today,
 * interviews to schedule, screening backlog, recently-applied candidates.
 *
 * Reuses existing endpoints rather than adding "recruiter-summary" RPCs:
 *   GET /api/candidates?limit=20            → newest applications
 *   GET /api/interviews?status=PENDING      → scheduling queue (TODO: status enum)
 *   GET /api/requisitions?recruiterId=me    → my reqs
 *   GET /api/screening?status=PENDING       → screening backlog (best-effort)
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Calendar, Briefcase, Clock, ArrowRight, UploadCloud, Sparkles, ClipboardList, ChevronRight,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  source?: string | null;
}
interface Interview {
  id: string;
  scheduledAt: string | null;
  status: string;
  candidateId: string;
  roundNumber?: number | null;
  round?: { name?: string; order?: number } | null;
}
interface Requisition {
  id: string;
  title: string;
  department: string;
  status: string;
  headcount: number;
}

export function RecruiterView() {
  const { user } = useCurrentUser();
  const firstName = (user?.name ?? user?.email ?? "there").split(" ")[0]?.split("@")[0] ?? "there";

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviewsToSchedule, setInterviewsToSchedule] = useState<Interview[]>([]);
  const [myReqs, setMyReqs] = useState<Requisition[]>([]);

  useEffect(() => {
    void (async () => {
      const headers = { Authorization: `Bearer ${getToken()}` };
      try {
        const [candidatesRes, intRes, reqsRes] = await Promise.all([
          fetch(`${API_BASE}/candidates?limit=10`, { headers }).catch(() => null),
          fetch(`${API_BASE}/interviews?status=SCHEDULED`, { headers }).catch(() => null),
          fetch(`${API_BASE}/requisitions?recruiterId=me`, { headers }).catch(() => null),
        ]);
        if (candidatesRes?.ok) {
          const body = await candidatesRes.json();
          setCandidates((body.data?.candidates ?? body.data ?? body ?? []).slice(0, 10));
        }
        if (intRes?.ok) {
          const body = await intRes.json();
          const list: Interview[] = body.data ?? body ?? [];
          setInterviewsToSchedule(list.filter((i) => !i.scheduledAt).slice(0, 10));
        }
        if (reqsRes?.ok) {
          const body = await reqsRes.json();
          setMyReqs((body.data ?? body ?? []).slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayCandidates = candidates.filter((c) => {
    const created = new Date(c.createdAt);
    return Date.now() - created.getTime() < 24 * 3600 * 1000;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Your sourcing & screening queue for today."
        breadcrumbs={[{ label: "Recruiter today" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/candidates"><UploadCloud className="w-4 h-4 mr-1.5" /> Bulk upload</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sourcing"><Sparkles className="w-4 h-4 mr-1.5" /> Source candidates</Link>
            </Button>
          </div>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Users className="w-4 h-4" />} label="New today" value={loading ? "-" : todayCandidates.length.toString()} hint="Candidates added" />
        <StatCard icon={<Calendar className="w-4 h-4" />} label="To schedule" value={loading ? "-" : interviewsToSchedule.length.toString()} hint="Interviews need slots" />
        <StatCard icon={<Briefcase className="w-4 h-4" />} label="My reqs" value={loading ? "-" : myReqs.length.toString()} hint="Open requisitions" />
        <StatCard icon={<ClipboardList className="w-4 h-4" />} label="Pipeline" value={loading ? "-" : candidates.length.toString()} hint="Active candidates" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scheduling queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Scheduling queue
              </CardTitle>
              <CardDescription>Interviews created but not yet on the calendar.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/scheduling">All<ChevronRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <RowsSkeleton /> : interviewsToSchedule.length === 0 ? (
              <EmptyState text="Nothing waiting, you're caught up." />
            ) : (
              <ul className="divide-y">
                {interviewsToSchedule.map((i) => (
                  <li key={i.id} className="px-4 py-3 hover:bg-muted/40">
                    <Link href={`/interviews/${i.id}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{i.round?.name ?? `Round ${i.roundNumber ?? "?"}`}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">candidate {i.candidateId.slice(0, 8)}…</p>
                      </div>
                      <Badge variant="outline" className="font-normal shrink-0">Needs slot</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* New candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                Latest applications
              </CardTitle>
              <CardDescription>Newest first. Click to triage.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/candidates">All<ChevronRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <RowsSkeleton /> : candidates.length === 0 ? (
              <EmptyState text="No candidates yet. Use Source candidates to start." />
            ) : (
              <ul className="divide-y">
                {candidates.slice(0, 6).map((c) => (
                  <li key={c.id} className="px-4 py-3 hover:bg-muted/40">
                    <Link href={`/candidates/${c.id}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{c.email} {c.source && `· via ${c.source}`}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                        {relativeTime(c.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* My reqs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              My requisitions
            </CardTitle>
            <CardDescription>Reqs you're recruiting on.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/requisitions">All<ChevronRight className="w-3 h-3 ml-1" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <RowsSkeleton /> : myReqs.length === 0 ? (
            <EmptyState text="You're not the recruiter on any req yet. Ask your admin to assign you." />
          ) : (
            <ul className="divide-y">
              {myReqs.map((r) => (
                <li key={r.id} className="px-4 py-3 hover:bg-muted/40">
                  <Link href={`/requisitions/${r.id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.department}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="font-normal">{r.status}</Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">{r.headcount} HC</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Shared sub-components (also used by the other tier-3 views) ──────────

export function StatCard({ icon, label, value, hint }: { icon?: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}

export function RowsSkeleton() {
  return (
    <div className="divide-y">
      {[1, 2, 3].map((i) => (
        <div key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8 px-4">{text}</p>;
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
