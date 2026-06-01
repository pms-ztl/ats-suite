"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Cpu, CheckCircle, Clock, AlertTriangle, Activity } from "lucide-react";
import { api } from "@/lib/api-client";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

interface AIModel {
  id: string;
  name: string;
  type: string;
  version: string;
  status: string;
  accuracy?: number;
  fairnessScore?: number;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  DEPLOYED: "bg-ok-tint text-ok",
  SHADOW_EVAL: "bg-warn-tint text-warn",
  RETIRED: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-info-tint text-info",
};

const statusIcon: Record<string, React.ReactNode> = {
  DEPLOYED: <CheckCircle className="h-3.5 w-3.5 text-ok" />,
  SHADOW_EVAL: <Clock className="h-3.5 w-3.5 text-warn" />,
  RETIRED: <Activity className="h-3.5 w-3.5 text-muted-foreground" />,
  PENDING_REVIEW: <AlertTriangle className="h-3.5 w-3.5 text-info" />,
};

export default function AiPage() {
  const { can } = usePermissions();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.ai.getModels()
      .then((d: any) => {
        const rows = d?.data?.data ?? d?.data ?? d ?? [];
        setModels(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setError("Could not load AI models."))
      .finally(() => setLoading(false));
  }, []);

  if (!can("ai")) return <AccessDenied />;

  const deployed = models.filter(m => m.status === "DEPLOYED");
  const inReview = models.filter(m => m.status === "SHADOW_EVAL" || m.status === "PENDING_REVIEW");

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI/ML Operations"
        description="Model governance, explainability, fairness monitoring, and decision auditing"
        breadcrumbs={[{ label: "AI/ML Operations" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Models", value: models.length, icon: Brain },
          { label: "Deployed", value: deployed.length, icon: CheckCircle },
          { label: "Under Review", value: inReview.length, icon: Clock },
          { label: "Retired", value: models.filter(m => m.status === "RETIRED").length, icon: Activity },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "-" : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Cpu className="h-4 w-4" /> AI Model Registry
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-destructive">{error}</div>
          )}
          {!loading && !error && models.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No AI models found.</div>
          )}
          {!loading && !error && models.length > 0 && (
            <div className="divide-y">
              {models.map(model => (
                <div key={model.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Brain className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.type} · v{model.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {model.accuracy != null && (
                      <span className="text-xs text-muted-foreground hidden md:block">
                        Accuracy: {(model.accuracy * 100).toFixed(1)}%
                      </span>
                    )}
                    {model.fairnessScore != null && (
                      <span className="text-xs text-muted-foreground hidden md:block">
                        Fairness: {(model.fairnessScore * 100).toFixed(1)}%
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-full ${statusColor[model.status] ?? "bg-muted text-muted-foreground"}`}>
                      {statusIcon[model.status]}
                      {model.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
