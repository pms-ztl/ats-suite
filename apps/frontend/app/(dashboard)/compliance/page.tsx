"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, CheckCircle, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

interface Policy { id: string; name: string; type: string; status: string; jurisdiction?: string; createdAt: string; }
interface ReviewItem { id: string; decisionId?: string; reason?: string; priority?: string; createdAt: string; }

const statusColor: Record<string, string> = {
  ACTIVE: "bg-ok-tint text-ok",
  DRAFT: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-warn-tint text-warn",
  PENDING: "bg-info-tint text-info",
  HIGH: "bg-danger-tint text-danger",
  MEDIUM: "bg-warn-tint text-warn",
  LOW: "bg-ok-tint text-ok",
};

export default function CompliancePage() {
  const { can } = usePermissions();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.compliance.getPolicies({ page: 1, pageSize: 20 }),
      api.compliance.getHumanReviewQueue({ page: 1, pageSize: 10 }),
    ]).then(([polRes, revRes]) => {
      if (polRes.status === "fulfilled") {
        const d = polRes.value as any;
        setPolicies(Array.isArray(d?.data?.data) ? d.data.data : Array.isArray(d?.data) ? d.data : []);
      }
      if (revRes.status === "fulfilled") {
        const d = revRes.value as any;
        setReviewQueue(Array.isArray(d?.data?.data) ? d.data.data : Array.isArray(d?.data) ? d.data : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (!can("compliance")) return <AccessDenied />;

  const active = policies.filter(p => p.status === "ACTIVE").length;
  const pending = reviewQueue.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance & Governance" description="Policy enforcement, bias monitoring, EEO reporting, and regulatory compliance" breadcrumbs={[{ label: "Compliance & Governance" }]} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Policies", value: policies.length, icon: Scale },
          { label: "Active Policies", value: active, icon: CheckCircle },
          { label: "Human Review Queue", value: pending, icon: Clock },
          { label: "Drafts", value: policies.filter(p => p.status === "DRAFT").length, icon: FileText },
        ].map(s => { const Icon = s.icon; return (
          <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{loading ? "-" : s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        );})}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4" /> Compliance Policies</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading && <div className="p-4 space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-10 bg-muted rounded animate-pulse"/>)}</div>}
            {!loading && policies.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No policies found.</div>}
            {!loading && policies.length > 0 && <div className="divide-y">{policies.slice(0,8).map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors">
                <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.type}{p.jurisdiction ? ` · ${p.jurisdiction}` : ""}</p></div>
                <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${statusColor[p.status] ?? "bg-muted text-muted-foreground"}`}>{p.status}</span>
              </div>
            ))}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Human Review Queue</CardTitle></CardHeader>
          <CardContent className="p-0">
            {loading && <div className="p-4 space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-10 bg-muted rounded animate-pulse"/>)}</div>}
            {!loading && reviewQueue.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Review queue is empty.</div>}
            {!loading && reviewQueue.length > 0 && <div className="divide-y">{reviewQueue.map(r => (
              <div key={r.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors">
                <div><p className="text-sm font-medium">{r.reason ?? r.decisionId ?? r.id}</p>
                  <p className="text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</p>
                </div>
                {r.priority && <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${statusColor[r.priority] ?? "bg-muted text-muted-foreground"}`}>{r.priority}</span>}
              </div>
            ))}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
