"use client";

/**
 * Phase 23, hiring manager "today" dashboard.
 *
 * Lives at `/` when the logged-in user has role HIRING_MANAGER. Focuses on
 * the reqs they own + the candidates moving through the pipeline + decisions
 * waiting on their approval.
 *
 * Uses tier-3 query filters:
 *   GET /api/requisitions?hiringManagerId=me      → my reqs
 *   GET /api/decisions?status=PENDING (best-effort) → decisions awaiting me
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, ChevronRight, Users, CheckCircle2, FileSignature, TrendingUp, BarChart3 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { StatCard, RowsSkeleton, EmptyState } from "./recruiter-view";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface Requisition {
  id: string;
  title: string;
  department: string;
  status: string;
  headcount: number;
  createdAt: string;
}

interface Decision {
  id: string;
  candidateId: string;
  requisitionId: string;
  status: string;
  recommendation: string;
  createdAt: string;
}

export function HiringManagerView() {
  const { user } = useCurrentUser();
  const firstName = (user?.name ?? user?.email ?? "there").split(" ")[0]?.split("@")[0] ?? "there";

  const [loading, setLoading] = useState(true);
  const [myReqs, setMyReqs] = useState<Requisition[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    void (async () => {
      const headers = { Authorization: `Bearer ${getToken()}` };
      try {
        const [reqsRes, decRes] = await Promise.all([
          fetch(`${API_BASE}/requisitions?hiringManagerId=me`, { headers }).catch(() => null),
          fetch(`${API_BASE}/decisions?status=PENDING`, { headers }).catch(() => null),
        ]);
        if (reqsRes?.ok) {
          const body = await reqsRes.json();
          setMyReqs(body.data ?? body ?? []);
        }
        if (decRes?.ok) {
          const body = await decRes.json();
          setPendingDecisions((body.data ?? body ?? []).slice(0, 10));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const open = myReqs.filter((r) => r.status === "OPEN" || r.status === "INTERVIEWING").length;
  const totalHeadcount = myReqs.reduce((s, r) => s + (r.headcount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your requisitions + decisions awaiting your input."
        breadcrumbs={[{ label: "Hiring manager today" }]}
        actions={
          <Button size="sm" asChild>
            <Link href="/requisitions"><Briefcase className="w-4 h-4 mr-1.5" /> All requisitions</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Briefcase className="w-4 h-4" />} label="My reqs" value={loading ? "-" : myReqs.length.toString()} hint={`${open} open`} />
        <StatCard icon={<Users className="w-4 h-4" />} label="Total headcount" value={loading ? "-" : totalHeadcount.toString()} hint="Across your reqs" />
        <StatCard icon={<FileSignature className="w-4 h-4" />} label="Decisions due" value={loading ? "-" : pendingDecisions.length.toString()} hint="Awaiting your call" />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Conversion" value="-" hint="Apply→Hire (this quarter)" />
      </div>

      <div className="grid lg:grid-cols-[1fr,1fr] gap-6">
        {/* My reqs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                My requisitions
              </CardTitle>
              <CardDescription>Where you're the hiring manager.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <RowsSkeleton /> : myReqs.length === 0 ? (
              <EmptyState text="You're not on any reqs yet. Ask your admin to assign you." />
            ) : (
              <ul className="divide-y">
                {myReqs.slice(0, 8).map((r) => (
                  <li key={r.id} className="px-4 py-3 hover:bg-muted/40">
                    <Link href={`/requisitions/${r.id}`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.department} · {r.headcount} HC
                        </p>
                      </div>
                      <Badge variant={r.status === "OPEN" ? "default" : "outline"} className="font-normal shrink-0">
                        {r.status}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Pending decisions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                Decisions awaiting you
              </CardTitle>
              <CardDescription>Hires, rejects, or holds with your name on them.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/decisions">All<ChevronRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? <RowsSkeleton /> : pendingDecisions.length === 0 ? (
              <EmptyState text="No decisions waiting. Sit back and source some great talent." />
            ) : (
              <ul className="divide-y">
                {pendingDecisions.map((d) => (
                  <li key={d.id} className="px-4 py-3 hover:bg-muted/40">
                    <Link href={`/decisions`} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          Candidate {d.candidateId.slice(0, 8)} · {d.recommendation}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          req {d.requisitionId.slice(0, 8)}
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pipeline summary card, placeholder for richer chart later */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Your pipeline at a glance
          </CardTitle>
          <CardDescription>Candidates across all your reqs.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Open <Link href="/analytics" className="underline">analytics</Link> for funnel + time-to-hire by requisition.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
