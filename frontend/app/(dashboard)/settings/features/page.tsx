"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bot, Plug, Cpu } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

interface FlagGroup {
  title: string;
  icon: React.ReactNode;
  flags: FeatureFlag[];
}

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  return (document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/) ?? [])[1]
    ? decodeURIComponent(
        (document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/) ?? [])[1]!
      )
    : null;
}

async function fetchFlags(): Promise<FeatureFlag[]> {
  if (USE_MOCKS) {
    return [
      { name: "agent.resume-parser", enabled: true, description: "AI Agent: resume-parser" },
      { name: "agent.screening", enabled: true, description: "AI Agent: screening" },
      { name: "agent.jd-author", enabled: true, description: "AI Agent: jd-author" },
      { name: "agent.scheduling", enabled: true, description: "AI Agent: scheduling" },
      { name: "agent.candidate-chat", enabled: true, description: "AI Agent: candidate-chat" },
      { name: "agent.sourcing", enabled: false, description: "AI Agent: sourcing" },
      { name: "agent.interview-kit", enabled: false, description: "AI Agent: interview-kit" },
      { name: "agent.interview-intelligence", enabled: false, description: "AI Agent: interview-intelligence" },
      { name: "agent.offer", enabled: false, description: "AI Agent: offer" },
      { name: "agent.copilot", enabled: false, description: "AI Agent: copilot" },
      { name: "agent.analytics", enabled: false, description: "AI Agent: analytics" },
      { name: "agent.bias-auditor", enabled: false, description: "AI Agent: bias-auditor" },
      { name: "public-api", enabled: true, description: "public-api" },
      { name: "esign-integration", enabled: false, description: "esign-integration" },
      { name: "background-check", enabled: false, description: "background-check" },
      { name: "auto-pipeline", enabled: true, description: "auto-pipeline" },
    ];
  }

  const token = getToken();
  const res = await fetch("/api/features", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Failed to fetch feature flags: ${res.status}`);
  const json = await res.json();
  return json.data;
}

async function toggleFlag(name: string, enabled: boolean): Promise<void> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 300));
    return;
  }

  const token = getToken();
  const res = await fetch(`/api/features/${encodeURIComponent(name)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error(`Failed to toggle flag: ${res.status}`);
}

function groupFlags(flags: FeatureFlag[]): FlagGroup[] {
  const agents = flags.filter((f) => f.name.startsWith("agent."));
  const integrations = flags.filter((f) =>
    ["esign-integration", "background-check"].includes(f.name)
  );
  const platform = flags.filter(
    (f) =>
      !f.name.startsWith("agent.") &&
      !["esign-integration", "background-check"].includes(f.name)
  );

  return [
    {
      title: "AI Agents",
      icon: <Bot className="h-4 w-4" />,
      flags: agents,
    },
    {
      title: "Integrations",
      icon: <Plug className="h-4 w-4" />,
      flags: integrations,
    },
    {
      title: "Platform",
      icon: <Cpu className="h-4 w-4" />,
      flags: platform,
    },
  ].filter((g) => g.flags.length > 0);
}

function formatName(name: string): string {
  const label = name.startsWith("agent.") ? name.slice(6) : name;
  return label
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function FeaturesPage() {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <AccessDenied />;

  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchFlags();
      setFlags(data);
    } catch {
      toast.error("Failed to load feature flags.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(name: string, enabled: boolean) {
    setToggling(name);
    try {
      await toggleFlag(name, enabled);
      setFlags((prev) =>
        prev.map((f) => (f.name === name ? { ...f, enabled } : f))
      );
      toast.success(`${formatName(name)} ${enabled ? "enabled" : "disabled"}.`);
    } catch {
      toast.error(`Failed to toggle ${formatName(name)}.`);
    } finally {
      setToggling(null);
    }
  }

  const groups = groupFlags(flags);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Flags"
        description="Enable or disable features for your organization. Changes take effect immediately."
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Feature Flags" },
        ]}
      />

      {groups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {group.icon} {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {group.flags.map((flag) => (
              <div
                key={flag.name}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {formatName(flag.name)}
                    </p>
                    {flag.description && (
                      <p className="text-xs text-muted-foreground">
                        {flag.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={flag.enabled ? "default" : "outline"}
                    className="text-xs"
                  >
                    {flag.enabled ? "On" : "Off"}
                  </Badge>
                  {toggling === flag.name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) =>
                        handleToggle(flag.name, checked)
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
