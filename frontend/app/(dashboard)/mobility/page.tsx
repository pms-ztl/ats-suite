"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Briefcase, Users, MapPin } from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

interface Opportunity { id: string; title: string; department?: string; location?: string; type?: string; status?: string; }

export default function MobilityPage() {
  const { can } = usePermissions();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.mobility.getOpportunities(),
      api.platform.getRequisitions({ page: 1, pageSize: 20 }),
    ]).then(([oppRes, reqRes]) => {
      if (oppRes.status === "fulfilled") {
        const d = oppRes.value as any;
        setOpportunities(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
      }
      if (reqRes.status === "fulfilled") {
        const d = reqRes.value as any;
        setRequisitions(Array.isArray(d?.data?.data) ? d.data.data : Array.isArray(d?.data) ? d.data : []);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (!can("mobility")) return <AccessDenied />;

  const openReqs = requisitions.filter(r => r.status === "OPEN");

  return (
    <div className="space-y-6">
      <PageHeader title="Internal Mobility" description="Internal openings, skills passport, career pathing, and redeployment" breadcrumbs={[{ label: "Internal Mobility" }]} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Internal Opportunities", value: opportunities.length || openReqs.length },
          { label: "Open Roles", value: openReqs.length },
          { label: "Departments", value: Array.from(new Set(openReqs.map(r => r.department).filter(Boolean))).length },
          { label: "Remote Roles", value: openReqs.filter(r => r.location === "Remote").length },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4">
            <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ArrowRightLeft className="h-4 w-4" /> Internal Openings</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading && <div className="p-4 space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="h-12 bg-muted rounded animate-pulse"/>)}</div>}
          {!loading && openReqs.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No internal openings available.</div>}
          {!loading && openReqs.length > 0 && <div className="divide-y">{openReqs.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Briefcase className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{r.department}</span>
                    {r.location && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{r.location}</span>}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{r.salaryMin && r.salaryMax ? `${r.salaryCurrency} ${Math.round(r.salaryMin/1000)}k–${Math.round(r.salaryMax/1000)}k` : ""}</div>
            </div>
          ))}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
