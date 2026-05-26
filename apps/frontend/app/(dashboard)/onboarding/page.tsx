"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CheckCircle, Clock, Package } from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

export default function OnboardingPage() {
  const { can } = usePermissions();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.candidates.list({ page: 1, pageSize: 50 })
      .then((d: any) => {
        const rows = d?.data?.data ?? d?.data ?? [];
        setCandidates(Array.isArray(rows) ? rows : []);
      })
      .catch((err) => { console.error("Failed to load onboarding data:", err); })
      .finally(() => setLoading(false));
  }, []);

  if (!can("onboarding")) return <AccessDenied />;

  const hired = candidates.filter(c => c.applications?.some((a: any) => a.stage === "HIRED"));
  const recentHires = hired.slice(0, 10);

  return (
    <div className="space-y-6">
      <PageHeader title="Onboarding" description="New hire setup, task checklists, document collection, and feedback loops" breadcrumbs={[{ label: "Onboarding" }]} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hires", value: hired.length, icon: UserPlus },
          { label: "Onboarding Active", value: recentHires.length, icon: Clock },
          { label: "Completed", value: 0, icon: CheckCircle },
          { label: "Pending Docs", value: "—", icon: Package },
        ].map(s => { const Icon = s.icon; return (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{loading ? "—" : s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        );})}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> New Hires — Onboarding Pipeline</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading && <div className="p-4 space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-muted rounded animate-pulse"/>)}</div>}
          {!loading && recentHires.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No hires in onboarding yet.</div>}
          {!loading && recentHires.length > 0 && <div className="divide-y">{recentHires.map((c: any) => {
            const hireApp = c.applications?.find((a: any) => a.stage === "HIRED");
            return (
              <div key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-emerald-700">{c.firstName?.[0]}{c.lastName?.[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-muted-foreground">{hireApp?.requisition?.title ?? c.currentTitle ?? ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{c.location ?? ""}</span>
                  <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">HIRED</span>
                </div>
              </div>
            );
          })}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
