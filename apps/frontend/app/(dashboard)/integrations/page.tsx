"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plug, CheckCircle, XCircle, RefreshCw, Calendar, MessageSquare, Mail, Webhook, Loader2, ExternalLink,
} from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

interface IntegrationConfigRow {
  id: string;
  provider: string;
  integrationType: string;
  status: string;
  config: Record<string, unknown>;
  lastSyncAt?: string;
  createdAt: string;
}

interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  status: string;
  createdAt: string;
}

const PROVIDERS = [
  { key: "GOOGLE_CALENDAR", label: "Google Calendar", icon: Calendar, color: "text-info", oauthUrl: "/api/calendar/google/auth-url" },
  { key: "MICROSOFT_CALENDAR", label: "Microsoft Calendar", icon: Calendar, color: "text-ai-ink", oauthUrl: null },
  { key: "SLACK", label: "Slack", icon: MessageSquare, color: "text-ok", oauthUrl: null },
  { key: "SENDGRID", label: "Email (SendGrid)", icon: Mail, color: "text-warn", oauthUrl: null },
] as const;

export default function IntegrationsPage() {
  const { can } = usePermissions();
  if (!can("integrations")) return <AccessDenied />;

  const [configs, setConfigs] = useState<IntegrationConfigRow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [slackUrl, setSlackUrl] = useState("");
  const [savingSlack, setSavingSlack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, whRes] = await Promise.allSettled([
        apiFetch<{ data: IntegrationConfigRow[] }>("GET", "/integrations/config"),
        apiFetch<{ data: WebhookRow[]; total: number }>("GET", "/integrations/webhooks"),
      ]);
      if (cfgRes.status === "fulfilled") setConfigs(cfgRes.value?.data ?? []);
      if (whRes.status === "fulfilled") setWebhooks(whRes.value?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function getConfigForProvider(provider: string): IntegrationConfigRow | undefined {
    return configs.find((c) => c.provider === provider && c.status === "ACTIVE");
  }

  async function connectOAuth(url: string) {
    try {
      const res = await apiFetch<{ data: { url: string } }>("GET", url);
      window.location.href = res.data?.url ?? url;
    } catch {
      window.location.href = url;
    }
  }

  async function saveSlackWebhook() {
    if (!slackUrl.startsWith("https://hooks.slack.com/")) {
      setError("Please enter a valid Slack webhook URL (https://hooks.slack.com/...)");
      return;
    }
    setSavingSlack(true);
    setError(null);
    try {
      await apiFetch("POST", "/integrations/config", {
        provider: "SLACK",
        integrationType: "SLACK",
        config: { webhookUrl: slackUrl },
      });
      setSlackUrl("");
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to save Slack webhook");
    } finally {
      setSavingSlack(false);
    }
  }

  async function disconnect(provider: string) {
    try {
      await apiFetch("DELETE", `/integrations/config/${provider}`);
      await load();
    } catch (err: any) {
      setError(err.message ?? "Failed to disconnect");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connect external services to your ATS pipeline"
        breadcrumbs={[{ label: "Integrations" }]}
      />

      {error && (
        <div className="bg-danger-tint border border-danger/40 text-danger px-4 py-3 rounded-md text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>dismiss</button>
        </div>
      )}

      {/* Connected Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plug className="h-5 w-5" /> Connected Integrations
          </CardTitle>
          <CardDescription>Manage calendar, messaging, and email service connections</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              {PROVIDERS.map((p) => {
                const cfg = getConfigForProvider(p.key);
                const isConnected = !!cfg;
                const Icon = p.icon;

                return (
                  <div
                    key={p.key}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${p.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {isConnected && cfg.lastSyncAt
                            ? `Last synced: ${new Date(cfg.lastSyncAt).toLocaleDateString()}`
                            : isConnected
                            ? `Connected ${new Date(cfg.createdAt).toLocaleDateString()}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <Badge variant="default" className="bg-ok-tint text-ok hover:bg-ok-tint">
                            <CheckCircle className="h-3 w-3 mr-1" /> Connected
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => disconnect(p.key)}>
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary">
                            <XCircle className="h-3 w-3 mr-1" /> Disconnected
                          </Badge>
                          {p.oauthUrl ? (
                            <Button size="sm" onClick={() => connectOAuth(p.oauthUrl!)}>
                              <ExternalLink className="h-3 w-3 mr-1" /> Connect
                            </Button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slack Webhook Setup */}
      {!getConfigForProvider("SLACK") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-ok" /> Connect Slack
            </CardTitle>
            <CardDescription>
              Paste your Slack incoming webhook URL to receive pipeline notifications in a channel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 max-w-xl">
              <Input
                placeholder="https://hooks.slack.com/services/T.../B.../..."
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={saveSlackWebhook} disabled={savingSlack || !slackUrl}>
                {savingSlack ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Webhook className="h-5 w-5" /> Registered Webhooks
          </CardTitle>
          <CardDescription>HTTP callbacks triggered on pipeline events</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No webhooks registered yet.</p>
          ) : (
            <div className="divide-y">
              {webhooks.map((wh) => (
                <div key={wh.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-mono">{wh.url}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {wh.events.map((ev) => (
                        <Badge key={ev} variant="outline" className="text-2xs">
                          {ev}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={wh.status === "ACTIVE" ? "default" : "secondary"}>
                    {wh.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>
    </div>
  );
}
