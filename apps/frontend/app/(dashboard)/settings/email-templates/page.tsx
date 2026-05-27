"use client";

/**
 * Settings → Email templates
 *
 * Per-tenant override of the auto-generated email body for each notification
 * type. When a template is saved, the delivery worker uses it instead of the
 * platform default.
 *
 * Template engine: Mustache-lite. {{varName}} placeholders only.
 * Per-type variable lists come from the backend (TEMPLATE_VARIABLES) so the
 * editor's variable picker stays in sync.
 *
 * Reads/writes via /api/email-templates (proxied to notification-service).
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Mail, Eye, RotateCcw, Loader2, FileText, Save, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface TemplateRow {
  id: string;
  tenantId: string;
  type: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  enabled: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  templates: TemplateRow[];
  availableTypes: string[];
  variables: Record<string, string[]>;
}

const TYPE_LABELS: Record<string, string> = {
  PLAN_CHANGE_REQUESTED: "Plan change requested (to super-admin)",
  PLAN_CHANGE_APPROVED: "Plan change approved (to tenant admin)",
  PLAN_CHANGE_REJECTED: "Plan change rejected (to tenant admin)",
  NEW_TENANT_SIGNUP: "New tenant signup (to super-admin)",
  BULK_UPLOAD_COMPLETED: "Bulk upload completed (to uploader)",
  SEAT_LIMIT_REACHED: "Seat limit reached (to tenant admin)",
  INTERVIEW_FEEDBACK_NEW: "New interview feedback (to tenant admin)",
  SYSTEM: "Generic system notification",
};

const DEFAULT_FOR_TYPE: Record<string, { subject: string; bodyText: string; bodyHtml: string }> = {
  PLAN_CHANGE_REQUESTED: {
    subject: "Plan change requested by {{tenantName}}",
    bodyText: "{{tenantName}} wants to upgrade from {{fromPlan}} to {{toPlan}}.\n\nRequested by: {{requestedBy}}\nReason: {{reason}}",
    bodyHtml: "<p><strong>{{tenantName}}</strong> wants to upgrade from <code>{{fromPlan}}</code> to <code>{{toPlan}}</code>.</p><p><em>Requested by:</em> {{requestedBy}}<br/><em>Reason:</em> {{reason}}</p>",
  },
  PLAN_CHANGE_APPROVED: {
    subject: "Your {{tenantName}} plan is now {{newPlan}}",
    bodyText: "Good news — your plan change to {{newPlan}} has been approved by {{reviewerName}}.\n\nThe new features are available immediately.",
    bodyHtml: "<p>Good news — your plan change to <strong>{{newPlan}}</strong> has been approved by {{reviewerName}}.</p><p>The new features are available immediately.</p>",
  },
  PLAN_CHANGE_REJECTED: {
    subject: "Your plan change request was declined",
    bodyText: "Your request to change to {{requestedPlan}} was reviewed by {{reviewerName}}.\n\nReason: {{reason}}",
    bodyHtml: "<p>Your request to change to <strong>{{requestedPlan}}</strong> was reviewed by {{reviewerName}}.</p><p><em>Reason:</em> {{reason}}</p>",
  },
  NEW_TENANT_SIGNUP: {
    subject: "New tenant signed up: {{tenantName}}",
    bodyText: "{{tenantName}} just signed up.\nIndustry: {{industry}}\nPlan: {{plan}}",
    bodyHtml: "<p><strong>{{tenantName}}</strong> just signed up.</p><ul><li>Industry: {{industry}}</li><li>Plan: {{plan}}</li></ul>",
  },
  BULK_UPLOAD_COMPLETED: {
    subject: "Bulk upload finished: {{fileCount}} files",
    bodyText: "Hi {{userName}},\n\nYour bulk upload completed.\n\n{{successCount}} parsed successfully\n{{failureCount}} failed",
    bodyHtml: "<p>Hi {{userName}},</p><p>Your bulk upload completed.</p><ul><li>{{successCount}} parsed successfully</li><li>{{failureCount}} failed</li></ul>",
  },
  SEAT_LIMIT_REACHED: {
    subject: "{{tenantName}} has reached its seat limit",
    bodyText: "You're at {{currentSeats}}/{{planLimit}} seats on the {{plan}} plan.\n\nUpgrade to invite more teammates.",
    bodyHtml: "<p>You're at <strong>{{currentSeats}}/{{planLimit}}</strong> seats on the {{plan}} plan.</p><p>Upgrade to invite more teammates.</p>",
  },
  INTERVIEW_FEEDBACK_NEW: {
    subject: "New feedback for {{candidateName}} ({{jobTitle}})",
    bodyText: "{{panelistName}} submitted feedback for {{candidateName}} on {{jobTitle}}: {{recommendation}}",
    bodyHtml: "<p><strong>{{panelistName}}</strong> submitted feedback for <strong>{{candidateName}}</strong> on {{jobTitle}}:</p><p>Recommendation: <strong>{{recommendation}}</strong></p>",
  },
  SYSTEM: {
    subject: "Notification",
    bodyText: "Hi {{userName}},\n\nYou have a new system notification.",
    bodyHtml: "<p>Hi {{userName}},</p><p>You have a new system notification.</p>",
  },
};

export default function EmailTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ListResponse | null>(null);
  const [selectedType, setSelectedType] = useState<string>("INTERVIEW_FEEDBACK_NEW");

  // Editor state for the currently-selected type
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!data) return;
    loadIntoEditor(selectedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, data]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/email-templates`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      setData(body.data ?? body);
    } catch (err) {
      toast.error("Couldn't load email templates");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function loadIntoEditor(type: string) {
    const existing = data?.templates.find((t) => t.type === type);
    if (existing) {
      setSubject(existing.subject);
      setBodyText(existing.bodyText);
      setBodyHtml(existing.bodyHtml);
      setEnabled(existing.enabled);
    } else {
      const def = DEFAULT_FOR_TYPE[type];
      setSubject(def?.subject ?? "");
      setBodyText(def?.bodyText ?? "");
      setBodyHtml(def?.bodyHtml ?? "");
      setEnabled(true);
    }
    setPreviewHtml(null);
    setPreviewSubject(null);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/email-templates/${selectedType}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyText, bodyHtml, enabled }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      const body = await res.json();
      const result = body.data ?? body;
      if (result.unknownVariables && result.unknownVariables.length > 0) {
        toast.warning(`Template saved, but unknown variables: ${result.unknownVariables.join(", ")}`);
      } else {
        toast.success(`${TYPE_LABELS[selectedType] ?? selectedType} template saved`);
      }
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function revert() {
    if (!confirm("Revert this template to the platform default? Your customization will be lost.")) return;
    try {
      const res = await fetch(`${API_BASE}/email-templates/${selectedType}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Reverted to platform default");
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to revert");
    }
  }

  async function preview() {
    setPreviewing(true);
    try {
      const res = await fetch(`${API_BASE}/email-templates/${selectedType}/preview`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ subject, bodyText, bodyHtml }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const result = body.data ?? body;
      setPreviewHtml(result.html);
      setPreviewSubject(result.subject);
    } catch (err: any) {
      toast.error(err.message ?? "Preview failed");
    } finally {
      setPreviewing(false);
    }
  }

  function insertVariable(name: string) {
    const tok = `{{${name}}}`;
    setBodyHtml((s) => s + tok);
  }

  const availableVars = useMemo(() => data?.variables[selectedType] ?? [], [data, selectedType]);
  const isCustomized = useMemo(
    () => Boolean(data?.templates.find((t) => t.type === selectedType)),
    [data, selectedType],
  );

  if (loading || !data) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading email templates…
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
      </Link>

      <PageHeader
        title="Email templates"
        description="Customize the subject and body of every notification email your workspace sends. Branding (logo + colors) is applied automatically — set those in Brand & Career Portal."
      />

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* Sidebar: template type list */}
        <Card className="self-start">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notification types
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5">
              {data.availableTypes.map((type) => {
                const customized = data.templates.find((t) => t.type === type);
                const isSelected = type === selectedType;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{TYPE_LABELS[type] ?? type}</span>
                      {customized && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          custom
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: editor */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {TYPE_LABELS[selectedType] ?? selectedType}
                  </CardTitle>
                  <CardDescription>
                    {isCustomized
                      ? "You have a custom template for this notification. Edit or revert below."
                      : "Using the platform default. Save below to create a custom version."}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="enabled" className="text-xs text-muted-foreground">Enabled</Label>
                  <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="New feedback for {{candidateName}}"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyText">Plain text body</Label>
                <Textarea
                  id="bodyText"
                  rows={4}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Hi {{userName}}, ..."
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">Fallback for email clients that don&apos;t render HTML.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyHtml">HTML body</Label>
                <Textarea
                  id="bodyHtml"
                  rows={10}
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  placeholder="<p>Hi <strong>{{userName}}</strong>, ...</p>"
                  className="font-mono text-xs"
                />
              </div>

              {availableVars.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs">Available variables for this notification</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableVars.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="text-xs font-mono px-2 py-1 rounded bg-muted hover:bg-muted/70 transition-colors"
                        title={`Click to insert {{${v}}} into HTML body`}
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={preview} disabled={previewing} variant="outline">
              {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
              Preview with sample data
            </Button>
            {isCustomized && (
              <Button onClick={revert} variant="ghost" className="text-destructive">
                <RotateCcw className="w-4 h-4 mr-2" />
                Revert to default
              </Button>
            )}
            <div className="ml-auto">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save template
              </Button>
            </div>
          </div>

          {previewHtml && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </CardTitle>
                <CardDescription>
                  Rendered with sample values + your current branding (logo + primary color).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-2 bg-white">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    <strong>Subject:</strong> {previewSubject}
                  </div>
                  <iframe
                    srcDoc={previewHtml}
                    title="Email preview"
                    className="w-full h-96 border-0 rounded bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 text-xs text-muted-foreground">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <div>
              Unknown variables render as empty strings — your email won&apos;t leak <code>{`{{typo}}`}</code> tokens.
              Hover the variable chips above to see which fields are populated for this notification type.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
