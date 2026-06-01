"use client";

/**
 * Phase 34a, CSV bulk candidate import.
 *
 * Three-step inline flow on one page:
 *   1. Upload CSV (drag/drop or file picker)
 *   2. Preview parsed rows + show validation results per row
 *   3. Commit, actual upsert, shows per-row outcome
 *
 * Why one page instead of a wizard: the preview ↔ adjust ↔ preview loop
 * is too common to make page transitions worth it. Upload, see, fix-or-go.
 */
import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, XCircle, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface PreviewRow {
  row: number;
  status: "valid_new" | "valid_update" | "invalid_email" | "missing_required" | "duplicate_in_file";
  candidate: { email?: string; firstName?: string; lastName?: string; phone?: string; location?: string };
  reason?: string;
  existingCandidateId?: string;
}

interface PreviewSummary {
  total: number;
  newCount: number;
  updateCount: number;
  invalidEmailCount: number;
  missingRequiredCount: number;
  duplicateInFileCount: number;
}

interface CommitOutcome {
  row: number;
  status: "created" | "updated" | "duplicate_skipped" | "invalid_email_skipped" | "missing_required_skipped" | "error";
  candidateId?: string;
  reason?: string;
}

const SAMPLE_CSV = `email,firstName,lastName,phone,location,linkedinUrl,source
alex.chen@example.com,Alex,Chen,+1-555-0100,"San Francisco, CA",https://linkedin.com/in/alexchen,Referral
priya.s@example.com,Priya,Sharma,,Bangalore,,LinkedIn
jordan@example.com,Jordan,Lee,+1-555-0123,Remote,https://linkedin.com/in/jordanlee,Career Page`;

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" };
}

export default function CsvImportPage() {
  const [csv, setCsv] = useState<string>("");
  const [filename, setFilename] = useState<string>("");
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [summary, setSummary] = useState<PreviewSummary | null>(null);
  const [committing, setCommitting] = useState(false);
  const [commitOutcomes, setCommitOutcomes] = useState<CommitOutcome[] | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const onFile = useCallback(async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File too large (max 20 MB)");
      return;
    }
    const text = await file.text();
    setCsv(text);
    setFilename(file.name);
    setPreview(null);
    setCommitOutcomes(null);
  }, []);

  const runPreview = async () => {
    if (!csv) return;
    setLoadingPreview(true);
    try {
      const res = await fetch(`${API_BASE}/candidates/import/preview`, {
        method: "POST", credentials: "include", headers: authHeaders(),
        body: JSON.stringify({ csv }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `${res.status}`);
      const data = body.data ?? body;
      setPreview(data.preview);
      setSummary(data.summary);
    } catch (e: any) {
      toast.error(e?.message ?? "Preview failed");
    } finally {
      setLoadingPreview(false);
    }
  };

  const runCommit = async () => {
    if (!csv) return;
    if (!confirm(`Import ${summary?.newCount ?? 0} new + ${summary?.updateCount ?? 0} updated candidates?`)) return;
    setCommitting(true);
    try {
      const res = await fetch(`${API_BASE}/candidates/import/commit`, {
        method: "POST", credentials: "include", headers: authHeaders(),
        body: JSON.stringify({ csv, skipDuplicates, source: "CSV_IMPORT" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `${res.status}`);
      const data = body.data ?? body;
      setCommitOutcomes(data.outcomes);
      toast.success(`Imported: ${data.summary.created} new, ${data.summary.updated} updated, ${data.summary.skipped} skipped`);
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
    } finally {
      setCommitting(false);
    }
  };

  const reset = () => { setCsv(""); setFilename(""); setPreview(null); setSummary(null); setCommitOutcomes(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/candidates" className="mt-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk import candidates</h1>
            <p className="text-muted-foreground text-sm">
              Upload a CSV exported from another ATS or any spreadsheet. We'll preview before importing.
            </p>
          </div>
        </div>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE_CSV)}`}
          download="cdc-ats-sample.csv"
          className="text-xs inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <Download className="h-3.5 w-3.5" /> Download sample CSV
        </a>
      </div>

      {/* Step 1, upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" /> 1. Upload your CSV
          </CardTitle>
          <CardDescription className="text-xs">
            Accepted columns (case-insensitive): email, firstName, lastName, phone, location, linkedinUrl, portfolioUrl, source, tags. Headers can also be "First Name", "Last Name", "Mobile", etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block">
            <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-8 text-center cursor-pointer">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {filename ? `Selected: ${filename}` : "Click to choose a CSV file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Up to 20 MB</p>
            </div>
            <input
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
            />
          </label>
          <div className="flex justify-end gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={reset} disabled={!csv}>Reset</Button>
            <Button size="sm" onClick={runPreview} disabled={!csv || loadingPreview}>
              {loadingPreview ? "Parsing…" : "Preview rows →"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2, preview */}
      {preview && summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">2. Preview ({summary.total} rows)</CardTitle>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                {summary.newCount} new
              </Badge>
              <Badge variant="outline" className="bg-blue-500/15 text-blue-700 dark:text-blue-300">
                {summary.updateCount} updates
              </Badge>
              {summary.invalidEmailCount > 0 && (
                <Badge variant="outline" className="bg-destructive/15 text-destructive">{summary.invalidEmailCount} bad email</Badge>
              )}
              {summary.missingRequiredCount > 0 && (
                <Badge variant="outline" className="bg-destructive/15 text-destructive">{summary.missingRequiredCount} missing name</Badge>
              )}
              {summary.duplicateInFileCount > 0 && (
                <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300">{summary.duplicateInFileCount} dupes in file</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">#</th>
                    <th className="text-left px-3 py-2 font-medium">Status</th>
                    <th className="text-left px-3 py-2 font-medium">Email</th>
                    <th className="text-left px-3 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Phone</th>
                    <th className="text-left px-3 py-2 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {preview.map((p) => (
                    <tr key={p.row} className={p.status.startsWith("valid") ? "" : "bg-destructive/5"}>
                      <td className="px-3 py-1.5 font-mono">{p.row}</td>
                      <td className="px-3 py-1.5">
                        {p.status === "valid_new" && <span className="text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />new</span>}
                        {p.status === "valid_update" && <span className="text-blue-600 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />update</span>}
                        {p.status === "invalid_email" && <span className="text-destructive inline-flex items-center gap-1"><XCircle className="h-3 w-3" />bad email</span>}
                        {p.status === "missing_required" && <span className="text-destructive inline-flex items-center gap-1"><XCircle className="h-3 w-3" />no name</span>}
                        {p.status === "duplicate_in_file" && <span className="text-amber-600 inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" />dupe</span>}
                      </td>
                      <td className="px-3 py-1.5 font-mono">{p.candidate.email ?? "-"}</td>
                      <td className="px-3 py-1.5">{[p.candidate.firstName, p.candidate.lastName].filter(Boolean).join(" ") || "-"}</td>
                      <td className="px-3 py-1.5">{p.candidate.phone ?? "-"}</td>
                      <td className="px-3 py-1.5">{p.candidate.location ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t p-3 flex items-center justify-between flex-wrap gap-3">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={skipDuplicates} onChange={(e) => setSkipDuplicates(e.target.checked)} className="h-3 w-3" />
                Skip existing candidates (uncheck to update them)
              </label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={reset}>Start over</Button>
                <Button size="sm" onClick={runCommit} disabled={committing || (summary.newCount + summary.updateCount === 0)}>
                  {committing ? "Importing…" : `3. Import ${summary.newCount + (skipDuplicates ? 0 : summary.updateCount)} candidates`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3, outcomes */}
      {commitOutcomes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Import complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1">
              {commitOutcomes.map((o) => (
                <div key={o.row} className="flex items-center gap-2 font-mono">
                  <span className="text-muted-foreground w-12">#{o.row}</span>
                  <span className={
                    o.status === "created" ? "text-emerald-600"
                    : o.status === "updated" ? "text-blue-600"
                    : o.status.includes("skipped") ? "text-muted-foreground"
                    : "text-destructive"
                  }>{o.status}</span>
                  {o.reason && <span className="text-muted-foreground">- {o.reason}</span>}
                  {o.candidateId && <span className="text-muted-foreground">→ {o.candidateId.slice(0, 8)}</span>}
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Link href="/candidates"><Button size="sm">View candidates →</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
