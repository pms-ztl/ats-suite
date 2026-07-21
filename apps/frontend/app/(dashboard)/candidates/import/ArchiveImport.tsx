"use client";
// app/(dashboard)/candidates/import/ArchiveImport.tsx
// "Archive (ZIP)" bulk-import mode. A recruiter uploads ONE .zip of 1k-10k mixed
// resume files; the server unzips + extracts text (OCR for images) ASYNC in a
// worker, creating STAGING rows (NOT candidates yet). This component drives the
// whole lifecycle:
//   1. choose .zip      -> uploadResumeArchive -> bulkUploadId
//   2. phase=extracting -> poll status, show extracted-so-far progress
//   3. phase=review     -> paginated staging table (edit name/email, approve/
//                          reject per row + bulk toolbar)
//   4. commit N approved -> phase=committing/done, poll parse/screen progress
// Real data only: every state is driven by the live API; honest loading / empty
// / error states; no fabricated rows or counts. Theme-adaptive + responsive via
// the shared --c-* tokens and the Aurora kit primitives.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import {
  uploadResumeArchive, getBulkUpload, getBulkItems, patchBulkItem,
  reviewAllBulk, commitBulkImport, listRequisitions, listOpenBulkUploads,
  deleteBulkUpload,
  type BulkUploadStatus, type BulkImportItem, type OpenBulkUpload,
} from "@/lib/api";
import { useData } from "@/lib/use-data";
import type { Requisition } from "@/lib/types";

const ARCHIVE_ACCEPT = ".zip,application/zip,application/x-zip-compressed";
const POLL_MS = 2500;
const ITEMS_LIMIT = 50;

// Honest, color-paired labels for each extraction outcome (icon + word, never
// color alone) so the recruiter can see at a glance which rows are worth keeping.
function extractBadge(s: BulkImportItem["extractStatus"]) {
  switch (s) {
    case "extracted": return { t: "Extracted", icon: "check", tone: "var(--c-ok)", bg: "var(--c-ok-tint)" };
    case "ocr_empty": return { t: "OCR empty", icon: "eye", tone: "var(--c-warn)", bg: "var(--c-warn-tint)" };
    case "unsupported": return { t: "Unsupported", icon: "x", tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" };
    default: return { t: "Failed", icon: "flag", tone: "var(--c-danger)", bg: "var(--c-danger-tint)" };
  }
}

// "in_file" wins over "existing" server-side (computeDuplicates), so this just
// maps the already-decided reason to a label distinct from the other.
function duplicateBadge(reason: NonNullable<BulkImportItem["duplicateReason"]>) {
  return reason === "existing"
    ? { t: "Duplicate", icon: "copy", tone: "var(--c-warn)" }
    : { t: "Duplicate in file", icon: "copy", tone: "var(--c-warn)" };
}

// Module C — render the ATS-score cell for a staged item: a color-banded score
// once scored, an honest "scoring…" while pending, or "—" when unscored/failed
// (no requisition bound, or a per-item scoring error). Never a fabricated number.
function scoreCell(it: BulkImportItem) {
  if (it.scoreStatus === "pending") return <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>scoring…</span>;
  if (it.score == null) return <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>—</span>;
  const tone = it.score >= 75 ? "var(--c-ok)" : it.score >= 45 ? "var(--c-warn)" : "var(--c-danger)";
  return (
    <span className="mono" style={{ fontWeight: 800, fontSize: 13, color: tone }} title="ATS match score vs the bound requisition">
      {Math.round(it.score)}
    </span>
  );
}

function fileTypeLabel(name: string, mime: string): string {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "tiff"].includes(ext)) return "Image";
  if (ext === "pdf") return "PDF";
  if (ext === "doc" || ext === "docx") return "Word";
  if (ext === "txt") return "Text";
  return ext ? ext.toUpperCase() : (mime || "File");
}

const fmtBytes = (n: number) => n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

export default function ArchiveImport({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // lifecycle — bulkId seeds from the URL so a reload/return mid-extraction
  // reattaches to the same job instead of dropping back to the upload screen.
  const [bulkId, setBulkId] = useState<string | null>(() => searchParams.get("bulkId"));
  const [status, setStatus] = useState<BulkUploadStatus | null>(null);

  // staging table
  const [items, setItems] = useState<BulkImportItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [bulkActionBusy, setBulkActionBusy] = useState(false);
  const [committing, setCommitting] = useState(false);

  // local edits for detected name/email (kept in a map; persisted on blur).
  const [edits, setEdits] = useState<Record<string, { name?: string; email?: string }>>({});
  // Module C — optional requisition to rank the batch against (by ATS score desc).
  const [reqId, setReqId] = useState<string>("");
  const reqs = useData<Requisition[]>(listRequisitions, []);

  // Task 2 — imports left waiting for review from an earlier session (e.g. the
  // recruiter navigated away mid-extraction); surfaced so real, already-done
  // extraction work never sits undiscoverable.
  const [openUploads, setOpenUploads] = useState<OpenBulkUpload[]>([]);
  const [confirmDeleteUploadId, setConfirmDeleteUploadId] = useState<string | null>(null);
  const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsLoadedFor = useRef<string | null>(null);

  const phase = status?.phase;

  // While sitting on the upload screen, check for any archive imports still
  // open from a previous session so they're discoverable, not orphaned.
  useEffect(() => {
    if (bulkId) return;
    let cancelled = false;
    listOpenBulkUploads().then((rows) => { if (!cancelled) setOpenUploads(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, [bulkId]);

  /* ---- polling: runs while extracting / committing (and a tick after upload) ---- */
  useEffect(() => {
    if (!bulkId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const s = await getBulkUpload(bulkId);
        if (!cancelled) { setStatus(s); setError(null); }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Lost connection to the import status.");
      }
    };
    void tick();
    pollRef.current = setInterval(() => { void tick(); }, POLL_MS);
    // Browsers throttle/pause setInterval in a backgrounded tab, so a
    // recruiter who tabs away mid-extraction (the screen's own copy invites
    // exactly this: "come back later") can return to a stale screen even
    // though extraction finished long ago — nothing was actually stuck, the
    // scheduled tick just never got to run. Force an immediate tick the
    // moment the tab is visible again instead of waiting for the next one.
    const onVisible = () => { if (document.visibilityState === "visible") void tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [bulkId]);

  // Stop polling once nothing is in flight; keep polling through commit so the
  // parse/screen progress updates live.
  useEffect(() => {
    if (!pollRef.current) return;
    if (phase === "review" || phase === "failed" || phase === "done") {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [phase]);

  // A terminal phase means there's nothing left to reattach to — drop the
  // query param so a fresh visit lands on the upload screen, not back on a
  // finished or failed job.
  useEffect(() => {
    if (phase === "done" || phase === "failed") router.replace(pathname);
  }, [phase, pathname, router]);

  /* ---- load the first page of staging items once we enter review ---- */
  const loadFirstPage = useCallback(async (id: string) => {
    setItemsLoading(true);
    try {
      const { items: rows, nextCursor: nc } = await getBulkItems(id, undefined, ITEMS_LIMIT, "score");
      setItems(rows); setNextCursor(nc); setError(null);
    } catch (e: any) {
      setError(e?.message || "Could not load the staging list.");
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phase === "review" && bulkId && itemsLoadedFor.current !== bulkId) {
      itemsLoadedFor.current = bulkId;
      void loadFirstPage(bulkId);
    }
  }, [phase, bulkId, loadFirstPage]);

  const loadMore = async () => {
    if (!bulkId || !nextCursor) return;
    setItemsLoading(true);
    try {
      const { items: rows, nextCursor: nc } = await getBulkItems(bulkId, nextCursor, ITEMS_LIMIT, "score");
      setItems((prev) => [...prev, ...rows]); setNextCursor(nc);
    } catch (e: any) {
      setError(e?.message || "Could not load more rows.");
    } finally {
      setItemsLoading(false);
    }
  };

  /* ---- actions ---- */
  const onChoose = (f: File | null) => { setFile(f); setError(null); };

  // Jump straight into an already-open import found by the Task 2 banner below.
  const openExisting = (id: string) => {
    setBulkId(id);
    router.replace(`${pathname}?bulkId=${id}`);
  };

  // Discards an import's staging data (server-side: the BulkUpload job + its
  // BulkImportItem rows only — never touches already-committed candidates).
  const deleteUpload = async (id: string) => {
    setDeletingUploadId(id);
    try {
      await deleteBulkUpload(id);
      setOpenUploads((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteUploadId(null);
    } catch (e: any) {
      setError(e?.message || "Could not delete that import.");
    } finally {
      setDeletingUploadId(null);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const { bulkUploadId } = await uploadResumeArchive(file, reqId || undefined);
      if (!bulkUploadId) throw new Error("The server did not return an upload id.");
      setBulkId(bulkUploadId);
      // replace, not push — this re-parameterizes the same screen rather than
      // navigating to a new one, so it shouldn't grow the back-button history.
      router.replace(`${pathname}?bulkId=${bulkUploadId}`);
      setStatus({ id: bulkUploadId, phase: "extracting", totalFiles: 0, extractedCount: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0, committedCount: 0, duplicateCount: 0, parsedFiles: 0, failedFiles: 0 });
    } catch (e: any) {
      setError(e?.message || "Could not upload that archive.");
    } finally {
      setUploading(false);
    }
  };

  const setReview = async (item: BulkImportItem, reviewStatus: "approved" | "rejected") => {
    if (!bulkId) return;
    setBusyItemId(item.id);
    try {
      const updated = await patchBulkItem(bulkId, item.id, { reviewStatus });
      setItems((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
      // refresh counters so the toolbar totals stay honest
      getBulkUpload(bulkId).then(setStatus).catch(() => {});
    } catch (e: any) {
      setError(e?.message || "Could not update that row.");
    } finally {
      setBusyItemId(null);
    }
  };

  const persistEdit = async (item: BulkImportItem) => {
    if (!bulkId) return;
    const e = edits[item.id];
    if (!e) return;
    const patch: { detectedName?: string; detectedEmail?: string } = {};
    if (e.name !== undefined && e.name !== (item.detectedName ?? "")) patch.detectedName = e.name;
    if (e.email !== undefined && e.email !== (item.detectedEmail ?? "")) patch.detectedEmail = e.email;
    if (Object.keys(patch).length === 0) return;
    setBusyItemId(item.id);
    try {
      const updated = await patchBulkItem(bulkId, item.id, patch);
      setItems((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
      setEdits((prev) => { const n = { ...prev }; delete n[item.id]; return n; });
    } catch (err: any) {
      setError(err?.message || "Could not save your edit.");
    } finally {
      setBusyItemId(null);
    }
  };

  const runReviewAll = async (action: "approve-nonempty" | "reject-empty" | "approve-all" | "reject-duplicates") => {
    if (!bulkId) return;
    setBulkActionBusy(true); setError(null);
    try {
      const s = await reviewAllBulk(bulkId, action);
      setStatus(s);
      await loadFirstPage(bulkId); // re-read rows so reviewStatus reflects the bulk action
    } catch (e: any) {
      setError(e?.message || "Bulk action failed.");
    } finally {
      setBulkActionBusy(false);
    }
  };

  const runCommit = async () => {
    if (!bulkId) return;
    setCommitting(true); setError(null);
    try {
      await commitBulkImport(bulkId);
      // commit flips phase to committing/done; re-arm polling to show parse/screen progress
      itemsLoadedFor.current = null;
      const s = await getBulkUpload(bulkId);
      setStatus(s);
      if (s.phase !== "done" && !pollRef.current) {
        pollRef.current = setInterval(() => { getBulkUpload(bulkId).then(setStatus).catch(() => {}); }, POLL_MS);
      }
    } catch (e: any) {
      setError(e?.message || "Commit failed.");
    } finally {
      setCommitting(false);
    }
  };

  const reset = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    itemsLoadedFor.current = null;
    setFile(null); setBulkId(null); setStatus(null); setItems([]); setNextCursor(null);
    setEdits({}); setError(null);
    router.replace(pathname);
  };

  /* ----------------------------- render ----------------------------- */
  const card: React.CSSProperties = { borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 24, boxShadow: "var(--e1)" };

  const errorBanner = error && (
    <div style={{ marginBottom: 14, display: "flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
      <Icon name="flag" size={15} style={{ color: "var(--c-danger)" }} /> {error}
    </div>
  );

  // ── 1. UPLOAD ──────────────────────────────────────────────────────────────
  if (!bulkId) {
    const sizeMB = file ? file.size / (1024 * 1024) : 0;
    return (
      <>
        <div style={card}>
          {errorBanner}
          {openUploads.length > 0 && (
            <div style={{ marginBottom: 18, borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: "var(--c-ink)", marginBottom: 10 }}>
                <Icon name="clock" size={15} style={{ color: "var(--c-brand)" }} />
                {openUploads.length} import{openUploads.length === 1 ? "" : "s"} waiting for review
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {openUploads.map((u) => {
                  const armed = confirmDeleteUploadId === u.id;
                  const busy = deletingUploadId === u.id;
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => openExisting(u.id)} style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "left" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.archiveName || "Archive import"}</span>
                        <span style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                          <Pill icon={u.phase === "review" ? "clock" : "bolt"} tone="var(--c-ink-2)" bg="var(--c-surface-3)">
                            {u.phase === "review" ? `${u.approvedCount.toLocaleString()} of ${u.totalFiles.toLocaleString()} approved` : u.phase}
                          </Pill>
                          <Icon name="chevR" size={13} style={{ color: "var(--c-ink-3)" }} />
                        </span>
                      </button>
                      {armed ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0, position: "relative", zIndex: 60 }}>
                          <button onClick={() => void deleteUpload(u.id)} disabled={busy} title="Confirm delete" style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "var(--c-danger)", color: "white", display: "grid", placeItems: "center", cursor: busy ? "default" : "pointer", opacity: busy ? 0.7 : 1 }}>
                            <Icon name="check" size={12} stroke={3} />
                          </button>
                          <button onClick={() => setConfirmDeleteUploadId(null)} disabled={busy} title="Cancel" style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                            <Icon name="x" size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteUploadId(u.id)}
                          title="Delete this import"
                          style={{ width: 26, height: 26, flexShrink: 0, borderRadius: 6, border: "none", background: "transparent", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--c-danger-tint)"; e.currentTarget.style.color = "var(--c-danger)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--c-ink-3)"; }}
                        >
                          <Icon name="x" size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {confirmDeleteUploadId && <div onClick={() => setConfirmDeleteUploadId(null)} style={{ position: "fixed", inset: 0, zIndex: 55 }} />}
            </div>
          )}
          <input id="archive-input" type="file" accept={ARCHIVE_ACCEPT} style={{ display: "none" }} onChange={(e) => onChoose(e.target.files?.[0] ?? null)} />
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div onClick={() => document.getElementById("archive-input")?.click()} style={{ width: "100%", maxWidth: 460, margin: "0 auto", border: "1.5px dashed var(--c-line-strong)", borderRadius: "var(--r-xl)", padding: "36px 20px", background: "var(--c-surface-2)", cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai-ink)" }}><Icon name="layers" size={24} /></div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Drop a .zip archive here</div>
              <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", margin: "4px 0 14px" }}>one .zip with up to 10,000 mixed files (PDF, DOCX, DOC, TXT, or images) - up to 300 MB. We unzip and extract each in the background.</div>
              <Btn variant="soft" icon="layers">Choose .zip</Btn>
            </div>
            {file && (
              <div style={{ marginTop: 18, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                <Icon name="layers" size={15} style={{ color: "var(--c-ai-ink)" }} /><b>{file.name}</b> · {sizeMB.toFixed(1)} MB · extracted in the background, you review before importing
              </div>
            )}
            {/* Module C — bind the batch to a requisition to rank resumes by ATS score. */}
            <div style={{ marginTop: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--c-ink-3)", marginBottom: 6 }}>
                Rank against requisition <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — scores &amp; ranks every resume)</span>
              </label>
              <select value={reqId} onChange={(e) => setReqId(e.target.value)}
                style={{ minWidth: 280, padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 13 }}>
                <option value="">No requisition (don’t rank)</option>
                {(reqs.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
          <Btn variant="primary" trailIcon="chevR" disabled={uploading || !file} onClick={() => void startUpload()}>
            {uploading ? "Uploading…" : file ? "Upload & extract" : "Choose a .zip first"}
          </Btn>
        </div>
      </>
    );
  }

  // ── 2. EXTRACTING ───────────────────────────────────────────────────────────
  if (phase === "extracting" || phase === "committing") {
    const extracting = phase === "extracting";
    const done = extracting ? (status?.extractedCount ?? 0) : (status?.committedCount ?? 0);
    const total = status?.totalFiles ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : null;
    return (
      <>
        <div style={card}>
          {errorBanner}
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 18px", display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai-ink)" }}>
              <Icon name="bolt" size={28} style={{ animation: "pulse 1.4s ease-in-out infinite" }} />
            </div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>
              {extracting ? "Extracting your archive…" : "Creating candidates…"}
            </h2>
            <p style={{ margin: "8px auto 18px", maxWidth: 440, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
              {extracting
                ? "We are unzipping and reading each file (images go through OCR). This runs in the background - you can keep working and come back."
                : "Creating a candidate and résumé record for each approved file, then queuing AI screening."}
            </p>
            <div style={{ maxWidth: 420, margin: "0 auto" }}>
              <div style={{ height: 8, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct != null ? `${pct}%` : "35%", background: "var(--c-ai)", borderRadius: 99, transition: "width .4s var(--ease-out)", animation: pct == null ? "indeterminate 1.4s ease-in-out infinite" : undefined }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--c-ink-2)", fontWeight: 600 }}>
                {done.toLocaleString()}{total > 0 ? ` of ${total.toLocaleString()}` : ""} {extracting ? "files extracted" : "committed"}{pct != null ? ` · ${pct}%` : ""}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <Btn variant="ghost" onClick={onBack}>Leave (keeps running)</Btn>
          <Btn variant="soft" disabled>{extracting ? "Extracting…" : "Committing…"}</Btn>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(320%)}}`}</style>
      </>
    );
  }

  // ── failed ───────────────────────────────────────────────────────────────────
  if (phase === "failed") {
    return (
      <>
        <div style={card}>
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--c-danger-tint)", color: "var(--c-danger)" }}><Icon name="x" size={28} stroke={2.2} /></div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>Extraction failed</h2>
            <p style={{ margin: "8px auto 0", maxWidth: 400, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>We could not process that archive. Make sure it is a valid .zip and try again.</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
          <Btn variant="primary" icon="layers" onClick={reset}>Try another archive</Btn>
        </div>
      </>
    );
  }

  // ── 4. DONE ───────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const committed = status?.committedCount ?? 0;
    const parsed = status?.parsedFiles ?? 0;
    const failed = status?.failedFiles ?? 0;
    const parsing = committed > 0 && parsed < committed;
    return (
      <>
        <div style={card}>
          {errorBanner}
          <div style={{ textAlign: "center", padding: "26px 0", animation: "pop .3s var(--ease-spring)" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--c-ok-tint)", color: "var(--c-ok)" }}><Icon name="check" size={32} stroke={2.2} /></div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>{committed.toLocaleString()} candidate{committed === 1 ? "" : "s"} imported</h2>
            <p style={{ margin: "8px auto 0", maxWidth: 440, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
              Each approved file created a candidate and a résumé record. The AI résumé-parser is backfilling details and screening runs automatically.
            </p>
            {committed > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <Pill icon={parsing ? "clock" : "check"} tone={parsing ? "var(--c-brand)" : "var(--c-ok)"} bg={parsing ? "var(--c-brand-tint)" : "var(--c-ok-tint)"}>
                  {parsed.toLocaleString()} of {committed.toLocaleString()} parsed
                </Pill>
                {failed > 0 && <Pill icon="flag" tone="var(--c-warn)" bg="var(--c-warn-tint)">{failed.toLocaleString()} failed</Pill>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <Btn variant="ghost" onClick={reset}>Import another</Btn>
          <Btn variant="primary" icon="users" onClick={onBack}>View candidates</Btn>
        </div>
      </>
    );
  }

  // ── 3. REVIEW (staging table) ─────────────────────────────────────────────────
  const pending = status?.pendingCount ?? 0;
  const approved = status?.approvedCount ?? 0;
  const rejected = status?.rejectedCount ?? 0;
  const duplicates = status?.duplicateCount ?? 0;
  const total = status?.totalFiles ?? 0;
  const failedExtract = status?.failedFiles ?? 0;

  return (
    <>
      <div style={card}>
        {errorBanner}

        {/* counts + bulk toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill icon="layers" tone="var(--c-ink-2)" bg="var(--c-surface-2)">{total.toLocaleString()} extracted</Pill>
            <Pill icon="clock" tone="var(--c-ink-2)" bg="var(--c-surface-2)">{pending.toLocaleString()} pending</Pill>
            <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{approved.toLocaleString()} approved</Pill>
            {rejected > 0 && <Pill icon="x" tone="var(--c-ink-3)" bg="var(--c-surface-3)">{rejected.toLocaleString()} rejected</Pill>}
            {duplicates > 0 && <Pill icon="copy" tone="var(--c-warn)" bg="var(--c-warn-tint)">{duplicates.toLocaleString()} duplicates</Pill>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="soft" size="sm" icon="check" disabled={bulkActionBusy} onClick={() => void runReviewAll("approve-nonempty")}>Approve all non-empty</Btn>
            <Btn variant="soft" size="sm" icon="x" disabled={bulkActionBusy} onClick={() => void runReviewAll("reject-empty")}>Reject empty</Btn>
            <Btn variant="soft" size="sm" icon="copy" disabled={bulkActionBusy} onClick={() => void runReviewAll("reject-duplicates")}>Reject all duplicates</Btn>
          </div>
        </div>

        {/* table */}
        {itemsLoading && items.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-ink-3)", fontSize: 13 }}>
            <Icon name="bolt" size={20} style={{ animation: "pulse 1.4s ease-in-out infinite" }} /> <div style={{ marginTop: 8 }}>Loading staging list…</div>
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-ink-3)", fontSize: 13 }}>
            <Icon name="inbox" size={22} /> <div style={{ marginTop: 8 }}>No files were extracted from this archive.</div>
          </div>
        ) : (
          <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.3fr 1.5fr 0.8fr 0.9fr 0.8fr 1.3fr 0.9fr", gap: 10, padding: "9px 13px", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--c-ink-3)" }}>
              <span>File</span><span>Detected name</span><span>Detected email</span><span>Type</span><span>Extract</span><span>ATS score</span><span>Snippet</span><span style={{ textAlign: "right" }}>Review</span>
            </div>
            {items.map((it, i) => {
              const eb = extractBadge(it.extractStatus);
              const db = it.duplicateReason ? duplicateBadge(it.duplicateReason) : null;
              const tlabel = fileTypeLabel(it.fileName, it.mimeType);
              const e = edits[it.id] ?? {};
              const nameVal = e.name !== undefined ? e.name : (it.detectedName ?? "");
              const emailVal = e.email !== undefined ? e.email : (it.detectedEmail ?? "");
              const rowBusy = busyItemId === it.id;
              return (
                <div key={it.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.3fr 1.5fr 0.8fr 0.9fr 0.8fr 1.3fr 0.9fr", gap: 10, alignItems: "center", padding: "9px 13px", borderTop: i ? "1px solid var(--c-line)" : "none", fontSize: 12.5, opacity: it.reviewStatus === "rejected" ? 0.55 : 1, background: it.reviewStatus === "approved" ? "var(--c-ok-tint)" : "transparent" }}>
                  <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={`${it.fileName} · ${fmtBytes(it.sizeBytes)}`}>{it.fileName}</span>
                  <input value={nameVal} placeholder="(none)" disabled={rowBusy}
                    onChange={(ev) => setEdits((p) => ({ ...p, [it.id]: { ...p[it.id], name: ev.target.value } }))}
                    onBlur={() => void persistEdit(it)}
                    style={inputStyle} />
                  <input value={emailVal} placeholder="(none)" disabled={rowBusy} type="email"
                    onChange={(ev) => setEdits((p) => ({ ...p, [it.id]: { ...p[it.id], email: ev.target.value } }))}
                    onBlur={() => void persistEdit(it)}
                    className="mono" style={{ ...inputStyle, fontFamily: "var(--font-mono)" }} />
                  <span style={{ color: "var(--c-ink-2)" }}>{tlabel}</span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: eb.tone, fontWeight: 600, fontSize: 11 }} title={it.extractStatus}>
                      <Icon name={eb.icon} size={13} />{eb.t}
                    </span>
                    {db && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: db.tone, fontWeight: 600, fontSize: 11 }} title={db.t}>
                        <Icon name={db.icon} size={13} />{db.t}
                      </span>
                    )}
                  </span>
                  {/* Module C — ATS score vs the bound requisition (ranked desc). */}
                  {scoreCell(it)}
                  <span style={{ color: "var(--c-ink-3)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={it.textSnippet ?? ""}>{it.textSnippet || "—"}</span>
                  <span style={{ display: "inline-flex", gap: 6, justifyContent: "flex-end" }}>
                    <button title="Approve" disabled={rowBusy} onClick={() => void setReview(it, "approved")} style={toggleBtn(it.reviewStatus === "approved", "var(--c-ok)", "var(--c-ok-tint)")}>
                      <Icon name="check" size={14} />
                    </button>
                    <button title="Reject" disabled={rowBusy} onClick={() => void setReview(it, "rejected")} style={toggleBtn(it.reviewStatus === "rejected", "var(--c-danger)", "var(--c-danger-tint)")}>
                      <Icon name="x" size={14} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {nextCursor && (
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <Btn variant="ghost" size="sm" disabled={itemsLoading} onClick={() => void loadMore()}>{itemsLoading ? "Loading…" : "Load more"}</Btn>
          </div>
        )}
        {items.length > 0 && (
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 8 }}>
            Showing {items.length.toLocaleString()} of {total.toLocaleString()} extracted file{total === 1 ? "" : "s"}.{failedExtract > 0 ? ` ${failedExtract.toLocaleString()} could not be read.` : ""}
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
        <Btn variant="primary" trailIcon="chevR" disabled={committing || approved === 0} onClick={() => void runCommit()}>
          {committing ? "Importing…" : approved === 0 ? "Approve some to import" : `Commit ${approved.toLocaleString()} approved`}
        </Btn>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", fontSize: 12.5, padding: "5px 8px", borderRadius: "var(--r-sm)",
  border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink)",
  fontFamily: "var(--font-sans)", outline: "none",
};

function toggleBtn(active: boolean, tone: string, bg: string): React.CSSProperties {
  return {
    display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: "var(--r-sm)",
    cursor: "pointer", border: active ? `1px solid ${tone}` : "1px solid var(--c-line)",
    background: active ? bg : "var(--c-surface)", color: active ? tone : "var(--c-ink-3)",
    transition: "background .15s, color .15s, border-color .15s",
  };
}
