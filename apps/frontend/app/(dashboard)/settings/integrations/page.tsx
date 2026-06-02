"use client";

/**
 * Settings → Integrations
 *
 * Per-tenant config for outbound channels:
 *   - Slack incoming webhook URL  (plus "Send test" → /api/integrations/slack/test)
 *   - Email overrides (Reply-To, From display) plus "Send test" → /api/integrations/email/test
 *
 * Reads/writes via /api/integrations (proxied to notification-service).
 * In_app delivery is always on, it's the SSE/DB channel.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Bell, Mail, MessageSquare as Slack, CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface Integration {
  id: string;
  tenantId: string;
  kind: "slack" | "email";
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  // Slack form state
  const [slackUrl, setSlackUrl] = useState("");
  const [slackChannel, setSlackChannel] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [slackSaving, setSlackSaving] = useState(false);
  const [slackTesting, setSlackTesting] = useState(false);

  // Email form state
  const [emailFromAddress, setEmailFromAddress] = useState("");
  const [emailReplyTo, setEmailReplyTo] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailTesting, setEmailTesting] = useState(false);

  useEffect(() => {
    void loadIntegrations();
  }, []);

  async function loadIntegrations() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/integrations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const items: Integration[] = Array.isArray(json?.data) ? json.data : [];
      setIntegrations(items);
      const slack = items.find((i) => i.kind === "slack");
      if (slack) {
        const cfg = slack.config as Record<string, string>;
        // Backend redacts webhook URL in list, show as ".... last 12 chars"
        setSlackUrl(typeof cfg.webhookUrl === "string" ? cfg.webhookUrl : "");
        setSlackChannel(typeof cfg.channel === "string" ? cfg.channel : "");
        setSlackEnabled(slack.enabled);
      }
      const email = items.find((i) => i.kind === "email");
      if (email) {
        const cfg = email.config as Record<string, string>;
        setEmailFromAddress(typeof cfg.fromAddress === "string" ? cfg.fromAddress : "");
        setEmailReplyTo(typeof cfg.replyTo === "string" ? cfg.replyTo : "");
        setEmailEnabled(email.enabled);
      }
    } catch (err) {
      toast.error("Failed to load integrations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveSlack() {
    if (!slackUrl.startsWith("https://hooks.slack.com/")) {
      toast.error("Webhook URL must start with https://hooks.slack.com/");
      return;
    }
    setSlackSaving(true);
    try {
      const res = await fetch(`${API_BASE}/integrations/slack`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({
          config: { webhookUrl: slackUrl, ...(slackChannel ? { channel: slackChannel } : {}) },
          enabled: slackEnabled,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Slack integration saved");
      await loadIntegrations();
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSlackSaving(false);
    }
  }

  async function testSlack() {
    setSlackTesting(true);
    try {
      const res = await fetch(`${API_BASE}/integrations/slack/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.ok) {
        throw new Error(json?.data?.error ?? json?.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Test message sent to Slack");
    } catch (err) {
      toast.error(`Slack test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSlackTesting(false);
    }
  }

  async function deleteSlack() {
    setSlackSaving(true);
    try {
      await fetch(`${API_BASE}/integrations/slack`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      setSlackUrl("");
      setSlackChannel("");
      toast.success("Slack integration removed");
      await loadIntegrations();
    } catch (err) {
      toast.error(`Failed to remove: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSlackSaving(false);
    }
  }

  async function saveEmail() {
    setEmailSaving(true);
    try {
      const res = await fetch(`${API_BASE}/integrations/email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({
          config: {
            ...(emailFromAddress ? { fromAddress: emailFromAddress } : {}),
            ...(emailReplyTo ? { replyTo: emailReplyTo } : {}),
          },
          enabled: emailEnabled,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Email config saved");
      await loadIntegrations();
    } catch (err) {
      toast.error(`Failed to save: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setEmailSaving(false);
    }
  }

  async function testEmail() {
    setEmailTesting(true);
    try {
      const res = await fetch(`${API_BASE}/integrations/email/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.ok) {
        throw new Error(json?.data?.error ?? json?.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success(`Test email sent, check your inbox`);
    } catch (err) {
      toast.error(`Email test failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setEmailTesting(false);
    }
  }

  const slackConfigured = integrations.some((i) => i.kind === "slack" && i.enabled);

  return (
    <div className="space-y-6">
      <Link
        href="/settings"
        className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Settings
      </Link>

      <PageHeader
        title="Integrations"
        description="Connect Slack and email so your team gets notified outside the app"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Integrations" }]}
      />

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {/* In-app channel (always on) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" /> In-app notifications
              </CardTitle>
              <CardDescription>Always-on bell + live SSE stream. No setup required.</CardDescription>
            </div>
            <Badge className="bg-ok/15 text-ok border-ok/40/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Badge>
          </CardHeader>
        </Card>

        {/* Slack */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Slack className="h-4 w-4" /> Slack
              </CardTitle>
              <CardDescription>
                Paste an Incoming Webhook URL. Get one at{" "}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  api.slack.com/messaging/webhooks
                </a>
                .
              </CardDescription>
            </div>
            {slackConfigured ? (
              <Badge className="bg-ok/15 text-ok border-ok/40/30">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                <AlertCircle className="h-3 w-3 mr-1" /> Not configured
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slack-url">Incoming webhook URL</Label>
              <Input
                id="slack-url"
                type="password"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/T.../B.../..."
                autoComplete="off"
              />
              {slackUrl && !slackUrl.startsWith("https://hooks.slack.com/") && (
                <p className="text-xs text-destructive">URL must start with https://hooks.slack.com/</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slack-channel">Channel override (optional)</Label>
              <Input
                id="slack-channel"
                value={slackChannel}
                onChange={(e) => setSlackChannel(e.target.value)}
                placeholder="#hiring"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="slack-enabled" className="text-sm font-medium">
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">Pause delivery without removing config</p>
              </div>
              <Switch id="slack-enabled" checked={slackEnabled} onCheckedChange={setSlackEnabled} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={saveSlack} disabled={slackSaving || !slackUrl} size="sm">
                {slackSaving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={testSlack}
                disabled={slackTesting || !slackConfigured}
              >
                {slackTesting ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 mr-2" />
                )}
                Send test message
              </Button>
              {slackConfigured && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteSlack}
                  disabled={slackSaving}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </CardTitle>
              <CardDescription>
                Default SMTP is platform-managed. Override From / Reply-To if you have your own sender domain.
              </CardDescription>
            </div>
            <Badge className="bg-ok/15 text-ok border-ok/40/30">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-from">From address (optional override)</Label>
              <Input
                id="email-from"
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="hiring@yourcompany.com"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-reply">Reply-To (optional)</Label>
              <Input
                id="email-reply"
                type="email"
                value={emailReplyTo}
                onChange={(e) => setEmailReplyTo(e.target.value)}
                placeholder="recruiters@yourcompany.com"
              />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/60 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="email-enabled" className="text-sm font-medium">
                  Enabled
                </Label>
                <p className="text-xs text-muted-foreground">Disable to suppress all outbound emails for this tenant</p>
              </div>
              <Switch id="email-enabled" checked={emailEnabled} onCheckedChange={setEmailEnabled} />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={saveEmail} disabled={emailSaving} size="sm">
                {emailSaving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={testEmail} disabled={emailTesting}>
                {emailTesting ? (
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 mr-2" />
                )}
                Send test email
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Test email is delivered to the email address on your logged-in account.
            </p>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading integrations…
        </div>
      )}
    </div>
  );
}
