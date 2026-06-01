"use client";

/**
 * Batch 2: Bulk resume upload dialog.
 *
 * Lets a recruiter drop dozens / hundreds of PDFs/DOCX files. We POST the
 * multipart form to /api/resume/bulk, then poll /api/resume/bulk/:id every 2s
 * until status === COMPLETED | PARTIAL | FAILED, surfacing a progress bar +
 * per-file error list.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Upload, FileText, X, CheckCircle2, AlertCircle, Loader2,
  PartyPopper, FileWarning,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const ACCEPTED = [".pdf", ".doc", ".docx", ".txt"];
const MAX_SIZE_MB = 10;

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  try {
    const t = window.sessionStorage.getItem("ats-access-token");
    if (t) h["Authorization"] = `Bearer ${t}`;
  } catch {}
  return h;
}

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requisitionId?: string;
  onComplete?: () => void;
}

interface UploadStatus {
  id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "PARTIAL" | "FAILED";
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  progress: number;
  errors: Array<{ filename: string; error: string }>;
}

export function BulkUploadDialog({
  open, onOpenChange, requisitionId, onComplete,
}: BulkUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setFiles([]);
        setUploadStatus(null);
        setPollError(null);
        setSubmitting(false);
      }, 300);
      return () => clearTimeout(t);
    }
    return;
  }, [open]);

  // Polling
  useEffect(() => {
    if (!uploadStatus || ["COMPLETED", "PARTIAL", "FAILED"].includes(uploadStatus.status)) return;
    const id = uploadStatus.id;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/resume/bulk/${id}`, {
          headers: authHeaders(),
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        const payload = data.data ?? data;
        setUploadStatus({
          id: payload.id,
          status: payload.status,
          totalFiles: payload.totalFiles,
          processedFiles: payload.processedFiles,
          failedFiles: payload.failedFiles,
          progress: payload.progress ?? 0,
          errors: payload.errors ?? [],
        });
        if (["COMPLETED", "PARTIAL", "FAILED"].includes(payload.status)) {
          onComplete?.();
        }
      } catch (err) {
        setPollError(err instanceof Error ? err.message : "Polling failed");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [uploadStatus, onComplete]);

  // ── File handling ────────────────────────────────────────────────────────
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const f of arr) {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) {
        rejected.push(`${f.name}, not a supported file type`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        rejected.push(`${f.name}, exceeds ${MAX_SIZE_MB}MB`);
        continue;
      }
      accepted.push(f);
    }
    if (rejected.length > 0) {
      toast.warning(`Skipped ${rejected.length} file(s)`, {
        description: rejected.slice(0, 3).join("\n") + (rejected.length > 3 ? `\n…and ${rejected.length - 3} more` : ""),
      });
    }
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, j) => j !== i));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (files.length === 0) return;
    setSubmitting(true);
    setPollError(null);
    try {
      const form = new FormData();
      files.forEach((f) => form.append("resumes", f, f.name));
      if (requisitionId) form.append("requisitionId", requisitionId);

      const res = await fetch(`${API_BASE}/resume/bulk`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? data?.message ?? `Upload failed (${res.status})`);
      }
      const { bulkUploadId, totalFiles, enqueued, failed } = data.data ?? data;
      toast.success(`Uploaded ${enqueued} file(s), parsing in background`);
      setUploadStatus({
        id: bulkUploadId,
        status: "PROCESSING",
        totalFiles,
        processedFiles: 0,
        failedFiles: failed ?? 0,
        progress: 0,
        errors: [],
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  const isDone = uploadStatus && ["COMPLETED", "PARTIAL", "FAILED"].includes(uploadStatus.status);
  const allOk = uploadStatus?.status === "COMPLETED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Bulk Resume Upload
          </DialogTitle>
          <DialogDescription>
            Drop up to <strong>1,000 resumes</strong> at once (PDF, DOC, DOCX, TXT, max {MAX_SIZE_MB}MB each).
            We&apos;ll parse them in the background.
          </DialogDescription>
        </DialogHeader>

        {!uploadStatus ? (
          // ── Drop zone ──────────────────────────────────────────────────
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              dragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-border bg-muted/30 hover:bg-muted/50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
            />
            <Upload className={cn(
              "h-10 w-10 mx-auto mb-3 transition-colors",
              dragging ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-sm font-medium mb-1">
              {dragging ? "Drop files here" : "Click to browse, or drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground">
              {ACCEPTED.join(", ")} · {MAX_SIZE_MB}MB max per file
            </p>
          </div>
        ) : (
          // ── Progress / result panel ────────────────────────────────────
          <div className="space-y-4">
            <div className={cn(
              "rounded-xl p-5 border",
              allOk
                ? "bg-ok-tint border-ok/40"
                : isDone && uploadStatus.failedFiles > 0
                  ? "bg-warn-tint border-warn/40"
                  : "bg-primary/5 border-primary/20"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {!isDone && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                {allOk && <PartyPopper className="h-5 w-5 text-ok" />}
                {isDone && !allOk && <FileWarning className="h-5 w-5 text-warn" />}
                <span className="font-semibold text-sm">
                  {!isDone && `Parsing… ${uploadStatus.processedFiles + uploadStatus.failedFiles} / ${uploadStatus.totalFiles}`}
                  {allOk && `Done! All ${uploadStatus.totalFiles} resumes parsed successfully.`}
                  {isDone && !allOk && `Finished: ${uploadStatus.processedFiles} ok · ${uploadStatus.failedFiles} failed`}
                </span>
              </div>
              <Progress value={uploadStatus.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                {uploadStatus.progress}% complete
              </p>
            </div>

            {uploadStatus.errors.length > 0 && (
              <div className="rounded-lg border border-danger/40 bg-danger-tint p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-danger dark:text-danger mb-2">
                  Errors ({uploadStatus.errors.length})
                </p>
                <ul className="space-y-1 text-xs">
                  {uploadStatus.errors.slice(0, 20).map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-danger dark:text-danger">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span className="truncate"><strong>{e.filename}</strong>: {e.error}</span>
                    </li>
                  ))}
                  {uploadStatus.errors.length > 20 && (
                    <li className="text-danger dark:text-danger">…and {uploadStatus.errors.length - 20} more</li>
                  )}
                </ul>
              </div>
            )}

            {pollError && (
              <p className="text-xs text-warn">
                Status poll error: {pollError}. The upload continues in the background.
              </p>
            )}
          </div>
        )}

        {/* File queue (only when not yet submitted) */}
        {!uploadStatus && files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{files.length} file{files.length === 1 ? "" : "s"} queued</Badge>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-2xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs truncate flex-1">{f.name}</span>
                  <span className="text-2xs text-muted-foreground tabular-nums shrink-0">{fmtSize(f.size)}</span>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-danger shrink-0">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {!uploadStatus ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                onClick={handleUpload}
                disabled={files.length === 0 || submitting}
                className="glow-primary gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Uploading…" : `Start upload (${files.length})`}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              {isDone ? "Close" : "Hide (continues in background)"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
