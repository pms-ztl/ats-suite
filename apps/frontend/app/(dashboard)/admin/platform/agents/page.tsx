"use client";

/**
 * Admin → Platform → Agents
 *
 * Super-admin platform-wide agent kill switch dashboard. Each row shows
 * the agent type, 30-day usage, and a toggle. Flipping the toggle disables
 * the agent for EVERY tenant immediately (next agent call refuses, no need
 * to redeploy anything).
 *
 * "Tenants throttled" count shows how many tenants have ALSO killed this
 * agent at the tenant level — informational, not affected by the platform
 * kill switch.
 *
 * Backend: /api/super-admin/platform/agents (proxies to billing-service)
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Power, Loader2, AlertTriangle, Activity, DollarSign, Users } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface AgentRow {
  agentType: string;
  platformKillDisabled: boolean;
  platformKillReason: string | null;
  platformKillUpdatedAt: string | null;
  platformKillUpdatedByUserId: string | null;
  tenantsWithKillSwitch: number;
  runs30d: number;
  costUsd30d: number;
  tokensIn30d: number;
  tokensOut30d: number;
}

const AGENT_DESCRIPTIONS: Record<string, string> = {
  "resume-parser": "Parses uploaded resumes into structured candidate data.",
  "candidate-screener": "Scores candidates against job requirements.",
  "jd-author": "Drafts job descriptions from a short brief.",
  "interview-scheduler": "Suggests interview times across panelist calendars.",
  "interview-kit": "Generates per-candidate interview question packs.",
  "interview-intelligence": "Summarizes interview feedback + extracts signals.",
  "candidate-assistant": "Answers candidate questions about role/process.",
  "sourcing": "Suggests candidates from internal/external pools.",
  "offer": "Drafts offer letters + comp packages.",
  "analytics": "Generates hiring metrics summaries.",
  "bias-auditor": "Flags potential bias in screening + feedback.",
  "copilot": "Conversational helper for recruiter workflows.",
};

export default function PlatformAgentsPage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [confirmKill, setConfirmKill] = useState<{ agent: AgentRow; reason: string } | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/platform/agents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const data = body.data ?? body;
      setAgents(data.agents ?? []);
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't load agent control plane");
    } finally {
      setLoading(false);
    }
  }

  async function commitToggle(agentType: string, disabled: boolean, reason: string | null) {
    setPending(agentType);
    try {
      const res = await fetch(`${API_BASE}/super-admin/platform/agents/${encodeURIComponent(agentType)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ disabled, reason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success(`${agentType} is now ${disabled ? "killed platform-wide" : "live"}.`);
      setConfirmKill(null);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update kill switch");
    } finally {
      setPending(null);
    }
  }

  function requestToggle(agent: AgentRow, nextEnabled: boolean) {
    // Re-enabling is harmless — no confirmation. Killing requires a reason.
    if (nextEnabled) {
      void commitToggle(agent.agentType, false, null);
    } else {
      setConfirmKill({ agent, reason: "" });
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading agent control plane…
        </div>
      </div>
    );
  }

  const killedCount = agents.filter((a) => a.platformKillDisabled).length;
  const totalCost = agents.reduce((s, a) => s + a.costUsd30d, 0);
  const totalRuns = agents.reduce((s, a) => s + a.runs30d, 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
      </Link>

      <PageHeader
        title="Agent control plane"
        description="Kill any agent for every tenant in one click. Used when a model regresses, a prompt produces bad output, or costs spike. Changes apply to new agent calls within 5 minutes (cache TTL)."
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Power className="w-4 h-4" />}
          label="Platform-killed"
          value={`${killedCount} / ${agents.length}`}
          tone={killedCount > 0 ? "warn" : "neutral"}
        />
        <StatCard icon={<Activity className="w-4 h-4" />} label="Runs (30d)" value={totalRuns.toLocaleString()} />
        <StatCard icon={<DollarSign className="w-4 h-4" />} label="Cost (30d)" value={`$${totalCost.toFixed(2)}`} />
        <StatCard
          icon={<Users className="w-4 h-4" />}
          label="Tenants throttling"
          value={agents.reduce((s, a) => s + (a.tenantsWithKillSwitch > 0 ? 1 : 0), 0).toString()}
          hint="Agents with at least one tenant-level kill"
        />
      </div>

      {/* Per-agent rows */}
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>Toggle off to refuse all calls platform-wide.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Agent</th>
                <th className="text-right px-4 py-2 font-medium">Runs (30d)</th>
                <th className="text-right px-4 py-2 font-medium">Cost (30d)</th>
                <th className="text-right px-4 py-2 font-medium">Tenants throttled</th>
                <th className="text-right px-4 py-2 font-medium">Status</th>
                <th className="text-right px-4 py-2 font-medium">Switch</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.agentType} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{a.agentType}</div>
                    <div className="text-xs text-muted-foreground">
                      {AGENT_DESCRIPTIONS[a.agentType] ?? "—"}
                    </div>
                    {a.platformKillDisabled && a.platformKillReason && (
                      <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 inline-flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>Killed: {a.platformKillReason}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{a.runs30d.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">${a.costUsd30d.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    {a.tenantsWithKillSwitch > 0 ? (
                      <Badge variant="outline" className="font-normal">{a.tenantsWithKillSwitch}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={a.platformKillDisabled ? "destructive" : "default"} className="font-normal">
                      {a.platformKillDisabled ? "Killed" : "Live"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Switch
                      checked={!a.platformKillDisabled}
                      onCheckedChange={(next) => requestToggle(a, next)}
                      disabled={pending === a.agentType}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!confirmKill} onOpenChange={(o) => !o && setConfirmKill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Kill {confirmKill?.agent.agentType} platform-wide
            </DialogTitle>
            <DialogDescription>
              This will refuse all calls to <strong>{confirmKill?.agent.agentType}</strong> for every tenant.
              Existing in-flight runs finish. Tenants will see &quot;agent disabled by platform&quot; in error responses.
              Re-enable any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="killReason">Reason (shown to tenants on error)</Label>
            <Textarea
              id="killReason"
              rows={3}
              maxLength={500}
              placeholder="Prompt regression detected — investigating, expect ~30 min outage."
              value={confirmKill?.reason ?? ""}
              onChange={(e) => setConfirmKill((c) => (c ? { ...c, reason: e.target.value } : c))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmKill(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!confirmKill?.reason.trim() || pending === confirmKill?.agent.agentType}
              onClick={() => {
                if (!confirmKill) return;
                void commitToggle(confirmKill.agent.agentType, true, confirmKill.reason.trim());
              }}
            >
              {pending === confirmKill?.agent.agentType ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Power className="w-4 h-4 mr-2" />
              )}
              Confirm kill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, hint, tone }: { icon: React.ReactNode; label: string; value: string; hint?: string; tone?: "warn" | "neutral" }) {
  return (
    <Card className={tone === "warn" ? "border-amber-200 dark:border-amber-900" : undefined}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </CardContent>
    </Card>
  );
}
