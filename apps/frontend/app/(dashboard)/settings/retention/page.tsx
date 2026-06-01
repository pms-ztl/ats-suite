"use client";

/**
 * Settings → Data retention
 *
 * Tenant-admin self-service for "how long do we keep candidate data after
 * their last activity before the nightly purge worker anonymizes them?"
 *
 * Plan-driven floor:
 *   FREE         → min 365 days
 *   STARTER      → min 180 days
 *   PROFESSIONAL → min 90 days
 *   ENTERPRISE   → min 30 days
 *
 * The actual purge runs in candidate-service's retention-purge.worker.ts,
 * which calls the GDPR-delete flow for candidates past their tenant's
 * retention window.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Trash2, Shield, Loader2, AlertTriangle, ArrowUpRight } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface Retention {
  dataRetentionDays: number;
  plan: string;
  floorDays: number;
  ceilingDays: number;
  nextEligibleForPurgeAt: string;
}

const PRESETS = [
  { label: "30 days", days: 30, minPlan: "ENTERPRISE" },
  { label: "90 days", days: 90, minPlan: "PROFESSIONAL" },
  { label: "6 months", days: 180, minPlan: "STARTER" },
  { label: "1 year", days: 365, minPlan: "FREE" },
  { label: "2 years (default)", days: 730, minPlan: "FREE" },
  { label: "7 years", days: 365 * 7, minPlan: "FREE" },
];

export default function RetentionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retention, setRetention] = useState<Retention | null>(null);
  const [days, setDays] = useState(730);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/retention`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const r: Retention = body.data ?? body;
      setRetention(r);
      setDays(r.dataRetentionDays);
    } catch (err) {
      toast.error("Couldn't load retention policy");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!retention) return;
    if (days < retention.floorDays) {
      toast.error(`On the ${retention.plan} plan, retention must be at least ${retention.floorDays} days.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/retention`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ dataRetentionDays: days }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success(`Retention saved: ${days} days. Next purge runs nightly at 3am UTC.`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !retention) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading retention policy…
        </div>
      </div>
    );
  }

  const belowFloor = days < retention.floorDays;
  const aboveCeiling = days > retention.ceilingDays;
  const dirty = days !== retention.dataRetentionDays;
  const purgeDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
      </Link>

      <PageHeader
        title="Data retention"
        description="How long candidate data is kept after their last activity before automated GDPR-style anonymization."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your plan: <Badge variant="outline">{retention.plan}</Badge>
          </CardTitle>
          <CardDescription>
            On {retention.plan}, the platform allows retention between {retention.floorDays} days and {retention.ceilingDays.toLocaleString()} days.
            {retention.plan === "FREE" && (
              <>
                {" "}
                <Link href="/billing" className="text-primary underline inline-flex items-center gap-1">
                  Upgrade <ArrowUpRight className="w-3 h-3" />
                </Link>{" "}
                for shorter retention windows.
              </>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Choose retention window</CardTitle>
          <CardDescription>
            Candidates with no activity for longer than this will have their PII anonymized by the nightly purge worker.
            Applications, notes, and attachments are deleted; the candidate record stays but with scrubbed name/email/contact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="days">
              Retention window:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {days.toLocaleString()} days
              </span>{" "}
              <span className="text-muted-foreground">({(days / 365).toFixed(1)} years)</span>
            </Label>
            <input
              id="days"
              type="range"
              min={1}
              max={retention.ceilingDays}
              step={days < 30 ? 1 : days < 365 ? 15 : 30}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: belowFloor || aboveCeiling ? "#ef4444" : undefined }}
            />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>1 day</span>
              <span>{retention.ceilingDays.toLocaleString()} days</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const disabled = p.days < retention.floorDays;
              return (
                <Button
                  key={p.days}
                  type="button"
                  variant={days === p.days ? "default" : "outline"}
                  size="sm"
                  disabled={disabled}
                  onClick={() => setDays(p.days)}
                  title={disabled ? `Requires ${p.minPlan} plan` : undefined}
                >
                  {p.label}
                </Button>
              );
            })}
          </div>

          {belowFloor && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-danger-tint border border-danger/40 text-danger dark:text-danger text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                Retention must be at least {retention.floorDays} days on the {retention.plan} plan.
                {retention.plan !== "ENTERPRISE" && (
                  <>
                    {" "}
                    <Link href="/billing" className="underline">Upgrade your plan</Link> to set shorter retention.
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" />
            What happens next
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            With a <strong>{days}-day</strong> window, a candidate inactive since today would become eligible for purge on{" "}
            <strong>{purgeDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</strong>.
          </p>
          <p className="text-muted-foreground">
            The retention worker runs nightly at 03:00 UTC. When it finds an eligible candidate it calls the same anonymization
            flow as the manual <code className="bg-muted px-1 py-0.5 rounded text-xs">DELETE /api/gdpr/candidates/:id</code>{" "}
            endpoint, applications, notes, and attachments are removed; the candidate record stays but with name/email/contact scrubbed.
          </p>
          <div className="pt-3 border-t flex items-start gap-2 text-xs text-muted-foreground">
            <Trash2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <strong>Purges are irreversible.</strong> To change a candidate&apos;s retention before the nightly job runs, edit them
              directly to bump their <code>updatedAt</code>, or restore them from your most recent backup.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur p-4 -mx-4 border-t">
        <Button variant="outline" onClick={load} disabled={saving || !dirty}>
          Discard changes
        </Button>
        <Button onClick={save} disabled={saving || !dirty || belowFloor || aboveCeiling}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save retention policy
        </Button>
      </div>
    </div>
  );
}
