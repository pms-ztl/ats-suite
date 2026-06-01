"use client";

/**
 * Phase 34g, SMS / WhatsApp apply configuration.
 *
 * Setup is half-manual: tenant provisions a phone number in their own
 * Twilio account (TCPA compliance requires they own it), then pastes
 * the number here. We show them the webhook URLs to paste into Twilio.
 *
 * Conversation log section shows recent multi-turn flows + their state.
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Phone, Copy, ExternalLink, Unplug } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface TwilioConfig {
  configured: boolean;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  smsWebhookUrl: string;
  whatsappWebhookUrl: string;
}

interface SmsConversation {
  id: string;
  fromNumber: string;
  channel: string;
  step: string;
  collectedName: string | null;
  collectedEmail: string | null;
  collectedResumeUrl: string | null;
  candidateId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STEP_COLOR: Record<string, string> = {
  GREETING: "bg-muted text-muted-foreground",
  AWAITING_NAME: "bg-info/15 text-info dark:text-info",
  AWAITING_EMAIL: "bg-info/15 text-info dark:text-info",
  AWAITING_RESUME: "bg-info/15 text-info dark:text-info",
  COMPLETED: "bg-ok/15 text-ok dark:text-ok",
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" };
}

export default function SmsSettingsPage() {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <AccessDenied />;

  const [config, setConfig] = useState<TwilioConfig | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);
  const [conversations, setConversations] = useState<SmsConversation[]>([]);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/twilio/config`, { credentials: "include", headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      const data = body.data ?? body;
      setConfig(data);
      setPhone(data.phoneNumber ?? "");
      setWhatsapp(data.whatsappNumber ?? "");
    } catch { toast.error("Couldn't load config"); }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/twilio/conversations`, { credentials: "include", headers: authHeaders() });
      if (!res.ok) return;
      const body = await res.json();
      setConversations(body.data ?? body);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchConfig(); fetchConversations(); }, [fetchConfig, fetchConversations]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/twilio/config`, {
        method: "PUT", credentials: "include", headers: authHeaders(),
        body: JSON.stringify({ phoneNumber: phone || null, whatsappNumber: whatsapp || null }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Saved");
      fetchConfig();
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Twilio? Inbound messages will stop creating candidates.")) return;
    try {
      const res = await fetch(`${API_BASE}/twilio/config`, { method: "DELETE", credentials: "include", headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Disconnected");
      setPhone(""); setWhatsapp("");
      fetchConfig();
    } catch { toast.error("Couldn't disconnect"); }
  };

  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied`); }
    catch { toast.error("Copy failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/settings" className="mt-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SMS &amp; WhatsApp apply</h1>
          <p className="text-muted-foreground text-sm">
            Candidates text your number to apply. Stateful conversation collects name → email → resume link.
          </p>
        </div>
      </div>

      {/* Setup card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" /> Your Twilio numbers</CardTitle>
          <CardDescription className="text-xs">
            Provision a number in your <a href="https://console.twilio.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Twilio Console <ExternalLink className="h-3 w-3" /></a> first
            (TCPA compliance requires your account holds the number).
            Paste it here, then point Twilio's webhook at the URLs below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">SMS phone number (E.164)</Label>
              <Input id="phone" placeholder="+15551234567" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wa" className="text-xs">WhatsApp number (optional)</Label>
              <Input id="wa" placeholder="whatsapp:+15551234567" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            {config?.configured && (
              <Button onClick={disconnect} variant="ghost" className="text-destructive gap-1.5 ml-auto"><Unplug className="h-3.5 w-3.5" /> Disconnect</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook URLs */}
      {config && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Twilio webhook configuration</CardTitle>
            <CardDescription className="text-xs">
              In Twilio Console → your number → Messaging → "WHEN A MESSAGE COMES IN" → HTTP POST → paste:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">SMS webhook</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 rounded border bg-muted/40 px-3 py-2 text-xs font-mono break-all">{config.smsWebhookUrl}</code>
                <Button variant="outline" size="icon" onClick={() => copy(config.smsWebhookUrl, "SMS URL")}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
            <div>
              <Label className="text-xs">WhatsApp webhook (if using WhatsApp Sandbox or Business)</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 rounded border bg-muted/40 px-3 py-2 text-xs font-mono break-all">{config.whatsappWebhookUrl}</code>
                <Button variant="outline" size="icon" onClick={() => copy(config.whatsappWebhookUrl, "WhatsApp URL")}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation log */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Recent conversations</CardTitle>
          <Button onClick={fetchConversations} variant="ghost" size="sm">Refresh</Button>
        </CardHeader>
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No conversations yet. Tell someone to text your number.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-muted/30 text-2xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">From</th>
                  <th className="text-left px-4 py-2 font-medium">Channel</th>
                  <th className="text-left px-4 py-2 font-medium">Step</th>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {conversations.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono">{c.fromNumber}</td>
                    <td className="px-4 py-2 uppercase text-2xs">{c.channel}</td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className={`text-2xs ${STEP_COLOR[c.step] ?? ""}`}>{c.step}</Badge>
                    </td>
                    <td className="px-4 py-2">{c.collectedName ?? "-"}</td>
                    <td className="px-4 py-2 font-mono text-2xs">{c.collectedEmail ?? "-"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(c.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
