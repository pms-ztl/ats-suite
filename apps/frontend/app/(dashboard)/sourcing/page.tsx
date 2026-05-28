"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Database, Search, Plus, Sparkles, Loader2, Star } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";
import { AgentReasoningTrace, type AgentStep } from "@/components/shared/agent-reasoning-trace";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface SourcedCandidate {
  id: string; name: string; matchScore: number; rationale: string; skills: string[]; shortlisted?: boolean;
}
interface SourcingResult {
  candidates: SourcedCandidate[];
  searchStrategiesUsed?: string[];
  summary?: string;
  agentTrace?: AgentStep[];
  toolsUsed?: string[];
}

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
  // AI sourcing agent panel
  const [reqs, setReqs] = useState<Array<{ id: string; title: string }>>([]);
  const [reqId, setReqId] = useState("");
  const [sourcing, setSourcing] = useState(false);
  const [result, setResult] = useState<SourcingResult | null>(null);

  useEffect(() => {
    fetchSourcingData(setPools, setCandidates, setLoading, setError);
    // Load open requisitions for the AI sourcing dropdown
    const token = document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "";
    fetch(`${API}/requisitions?page=1&pageSize=50`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        const rows = res?.data?.data ?? res?.data ?? res;
        if (Array.isArray(rows)) setReqs(rows.map((r: any) => ({ id: r.id, title: r.title })));
      })
      .catch(() => {});
  }, []);

  async function runAiSourcing() {
    if (!reqId) { toast.error("Pick a requisition first"); return; }
    setSourcing(true);
    setResult(null);
    try {
      const token = document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "";
      const res = await fetch(`${API}/sourcing`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requisitionId: reqId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json.data ?? json);
    } catch {
      toast.error("AI sourcing failed.");
    } finally {
      setSourcing(false);
    }
  }

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

      {/* AI Sourcing agent */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Sourcing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm min-w-[260px]"
              value={reqId}
              onChange={(e) => setReqId(e.target.value)}
            >
              <option value="">Select a requisition…</option>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
            <Button size="sm" onClick={runAiSourcing} disabled={sourcing || !reqId} className="gap-1.5">
              {sourcing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {sourcing ? "Sourcing…" : "Source candidates"}
            </Button>
          </div>

          {result && (
            <div className="space-y-3">
              {result.summary && <p className="text-sm text-muted-foreground">{result.summary}</p>}
              {result.candidates.length === 0 && (
                <p className="text-sm text-muted-foreground">No matching candidates found.</p>
              )}
              {result.candidates.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{c.name}</p>
                      {c.shortlisted && (
                        <Badge variant="outline" className="text-2xs gap-1 text-amber-600 border-amber-300">
                          <Star className="h-3 w-3" /> Shortlisted
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.rationale}</p>
                    {c.skills?.length > 0 && (
                      <p className="text-2xs text-muted-foreground mt-1">{c.skills.slice(0, 8).join(" · ")}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums shrink-0">
                    {Math.round(c.matchScore * 100)}%
                  </span>
                </div>
              ))}
              {result.agentTrace && result.agentTrace.length > 0 && (
                <AgentReasoningTrace steps={result.agentTrace} toolsUsed={result.toolsUsed} />
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
