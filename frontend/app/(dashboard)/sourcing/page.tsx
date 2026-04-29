"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Database, Search, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";

interface TalentPool { id: string; name: string; description?: string; candidateCount?: number; tags?: string[]; createdAt: string; }

function fetchSourcingData(
  setPools: (v: TalentPool[]) => void,
  setCandidates: (v: any[]) => void,
  setLoading: (v: boolean) => void,
  setError: (e: string) => void,
) {
  setLoading(true);
  setError("");
  Promise.allSettled([
    api.sourcing.getTalentPools(),
    api.candidates.list({ page: 1, pageSize: 10 }),
  ]).then(([poolRes, canRes]) => {
    if (poolRes.status === "fulfilled") {
      const d = poolRes.value as any;
      setPools(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
    } else {
      setError("Could not load sourcing data.");
    }
    if (canRes.status === "fulfilled") {
      const d = canRes.value as any;
      setCandidates(Array.isArray(d?.data?.data) ? d.data.data : Array.isArray(d?.data) ? d.data : []);
    }
  }).finally(() => setLoading(false));
}

export default function SourcingPage() {
  const { can } = usePermissions();
  const [pools, setPools] = useState<TalentPool[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSourcingData(setPools, setCandidates, setLoading, setError);
  }, []);

  if (!can("sourcing")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error) return (
    <PageError
      message={error}
      onRetry={() => fetchSourcingData(setPools, setCandidates, setLoading, setError)}
    />
  );

  const sources = Array.from(new Set(candidates.map((c: any) => c.source).filter(Boolean)));

  return (
    <div className="space-y-6">
      <PageHeader title="Sourcing" description="Boolean search, talent pools, job board posting, and AI-powered outreach" breadcrumbs={[{ label: "Sourcing" }]}
        actions={<Button size="sm" onClick={async () => {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/sourcing/talent-pools`, {
              method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? ""}` },
              body: JSON.stringify({ name: `Pool ${new Date().toLocaleDateString()}`, description: "New talent pool" }),
            });
            toast.success("Talent pool created successfully.");
            window.location.reload();
          } catch { toast.error("Failed to create talent pool."); }
        }}><Plus className="h-4 w-4 mr-1" />New Talent Pool</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Talent Pools", value: pools.length },
          { label: "Total Candidates", value: candidates.length },
          { label: "Source Channels", value: sources.length },
          { label: "Referrals", value: candidates.filter((c:any) => c.source === "Referral").length },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" /> Talent Pools</CardTitle></CardHeader>
          <CardContent className="p-0">
            {pools.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No talent pools yet.</div>}
            {pools.length > 0 && <div className="divide-y">{pools.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors">
                <div><p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.description ?? (p.tags?.join(", ") ?? "")}</p></div>
                <span className="text-xs text-muted-foreground">{p.candidateCount ?? 0} candidates</span>
              </div>
            ))}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Source Breakdown</CardTitle></CardHeader>
          <CardContent className="p-4 space-y-3">
            {sources.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No source data.</p>}
            {sources.map(src => {
              const count = candidates.filter((c:any) => c.source === src).length;
              const pct = candidates.length ? Math.round((count / candidates.length) * 100) : 0;
              return (
                <div key={src}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium">{src}</span><span className="text-muted-foreground">{count} ({pct}%)</span></div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
