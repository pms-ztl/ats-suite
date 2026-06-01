"use client";

/**
 * Per-requisition form builder page (Batch 4).
 * Three tabs: Build | Preview | Share
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ChevronLeft, Save, Eye, Share2, Copy, ExternalLink, RefreshCw, FileText,
  AlertCircle,
} from "lucide-react";
import { FormBuilder } from "@/components/forms/form-builder";
import { FormRenderer } from "@/components/forms/form-renderer";
import type { FormField } from "@/components/forms/form-types";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const t = window.sessionStorage.getItem("ats-access-token");
    if (t) h["Authorization"] = `Bearer ${t}`;
  } catch {}
  return h;
}

interface Requisition {
  id: string;
  title: string;
  department: string | null;
  jobPosting?: { slug: string };
  // job postings come via a relation; we'll fetch separately
}

interface FormResponse {
  requisitionId: string;
  name: string;
  fields: FormField[];
  isDefault: boolean;
}

export default function FormBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isTenantAdmin } = usePermissions();

  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState("Default");
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, formRes] = await Promise.all([
        fetch(`${API_BASE}/requisitions/${params.id}`, { headers: authHeaders(), credentials: "include" }),
        fetch(`${API_BASE}/requisitions/${params.id}/form`, { headers: authHeaders(), credentials: "include" }),
      ]);

      if (reqRes.ok) {
        const r = await reqRes.json();
        setRequisition(r.data ?? r);
      }
      if (formRes.ok) {
        const f: { data?: FormResponse } & FormResponse = await formRes.json();
        const data = f.data ?? f;
        setFields(data.fields);
        setFormName(data.name);
        setIsDefault(data.isDefault);
      }

      // Try to fetch a public job posting slug (best-effort)
      try {
        const postingRes = await fetch(`${API_BASE}/requisitions/${params.id}/postings`, {
          headers: authHeaders(),
          credentials: "include",
        });
        if (postingRes.ok) {
          const pdata = await postingRes.json();
          const postings = pdata.data ?? pdata ?? [];
          if (postings.length > 0) setSlug(postings[0].slug);
        }
      } catch { /* postings endpoint optional */ }
    } catch {
      toast.error("Failed to load form");
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => { if (params.id) fetchAll(); }, [params.id, fetchAll]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/requisitions/${params.id}/form`, {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ name: formName, fields }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `${res.status}`);
      }
      toast.success("Form saved ✓");
      setIsDefault(false);
      setDirty(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save form");
    }
    setSaving(false);
  };

  const resetToDefault = async () => {
    if (!confirm("Reset to default form? This deletes your custom schema.")) return;
    setSaving(true);
    try {
      await fetch(`${API_BASE}/requisitions/${params.id}/form`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      await fetchAll();
      toast.success("Form reset to default");
    } catch {
      toast.error("Failed to reset");
    }
    setSaving(false);
  };

  if (!isTenantAdmin) return <AccessDenied />;
  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading form…</div>;

  const publicUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/jobs/${slug}/apply`
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Link href={`/requisitions/${params.id}`} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-3 w-3" /> Back to requisition
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{requisition?.title ?? "Form builder"}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">Customize the application form for this job</p>
              {isDefault && <Badge variant="outline" className="text-2xs">Using default form</Badge>}
              {dirty && <Badge variant="outline" className="text-2xs text-warn">Unsaved changes</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isDefault && (
              <Button variant="outline" size="sm" onClick={resetToDefault} disabled={saving} className="gap-1">
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
            <Button onClick={save} disabled={saving || !dirty} className="glow-primary gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save form"}
            </Button>
          </div>
        </div>
      </div>

      {/* Form name */}
      <div className="flex items-center gap-3 max-w-md">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <Input
          value={formName}
          onChange={(e) => { setFormName(e.target.value); setDirty(true); }}
          placeholder="Form name (e.g. Senior Engineer application)"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="build">
        <TabsList>
          <TabsTrigger value="build" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Build</TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Preview</TabsTrigger>
          <TabsTrigger value="share" className="gap-1.5"><Share2 className="h-3.5 w-3.5" /> Share</TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="mt-4">
          <FormBuilder
            initialFields={fields}
            onChange={(next) => { setFields(next); setDirty(true); }}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-1">Apply for {requisition?.title ?? "this role"}</h2>
                <p className="text-xs text-muted-foreground mb-6">This is how candidates will see the form.</p>
                <FormRenderer
                  fields={fields}
                  submitLabel="Submit (preview only, no data saved)"
                  onSubmit={() => {
                    toast.info("Preview mode, submission is not actually saved");
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="share" className="mt-4 max-w-2xl mx-auto">
          {publicUrl ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Shareable public link</p>
                  <p className="text-xs text-muted-foreground">Anyone with this link can apply.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input value={publicUrl} readOnly className="font-mono text-xs" />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success("Copied!");
                    }}
                    className="gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </Button>
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                  </Button>
                </div>
                {/* QR code via image API (no extra deps) */}
                <div className="flex flex-col items-center pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Or scan with phone:</p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicUrl)}`}
                    alt="QR code"
                    className="rounded-lg border border-border"
                    width={180}
                    height={180}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warn shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">No published job posting yet</p>
                  <p className="text-xs text-muted-foreground">
                    Create a public job posting for this requisition first, then come back here to share the link.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
