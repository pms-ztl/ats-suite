"use client";
// app/(dashboard)/candidates/import/page.tsx
// Bulk import candidates. Two modes via a segmented toggle:
//   - "CSV spreadsheet": REAL two-step import wired to candidate-service
//     /import/preview (real csv-parse: detected headers, validated rows, dedupe)
//     and /import/commit (real upsert). No hardcoded columns/rows/counts.
//   - "Resume files": multi-file dropzone (PDF/DOCX/DOC/TXT/images) -> /api/resume/bulk,
//     which creates a candidate per file (the AI parser backfills details).
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { bulkUploadResumes, previewCandidateImport, commitCandidateImport, type ImportPreview } from "@/lib/api";
import { useTableSort, SortHead } from "@/components/shared/sortable";

const RESUME_ACCEPT = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.tiff,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg,image/webp,image/tiff";

// Approximates candidate-service's HEADER_MAP so the "Map columns" step can show
// each REAL detected header and what it maps to (display only; the server does
// the authoritative mapping).
function mappedField(h: string): string | null {
  const k = h.toLowerCase().replace(/[\s_-]/g, "");
  const has = (...xs: string[]) => xs.includes(k);
  if (has("firstname", "first", "fname", "givenname")) return "First name";
  if (has("lastname", "last", "lname", "surname", "familyname")) return "Last name";
  if (has("name", "fullname", "candidate", "candidatename")) return "Name";
  if (has("email", "emailaddress", "mail", "workemail", "e-mail")) return "Email";
  if (has("phone", "phonenumber", "mobile", "cell", "tel")) return "Phone";
  if (has("location", "city", "region", "country", "place")) return "Location";
  if (has("linkedin", "linkedinurl")) return "LinkedIn";
  if (has("portfolio", "website", "url", "portfoliourl")) return "Portfolio";
  if (has("source", "channel", "sourcechannel")) return "Source";
  if (has("tags", "skills", "tag")) return "Tags";
  if (has("title", "headline", "currenttitle", "role")) return "Headline";
  return null;
}

const cand = (r: ImportPreview["preview"][number]) => ({
  name: [r.candidate.firstName, r.candidate.lastName].filter(Boolean).join(" ") || "(no name)",
  email: r.candidate.email ?? "",
  loc: (r.candidate.location as string) ?? (r.candidate.source as string) ?? "",
  ok: r.status === "valid_new" || r.status === "valid_update",
  status: r.status,
  reason: r.reason,
});

export default function ImportScreen() {
  const onBack = () => { window.location.href = "/candidates"; };
  const [mode, setMode] = useState<"csv" | "resume">("csv");
  const [step, setStep] = useState(1);
  const steps = mode === "resume" ? ["Upload", "Done"] : ["Upload", "Map columns", "Preview", "Done"];

  // CSV state — driven entirely by the real preview/commit API.
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [commitResult, setCommitResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Resume state.
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [resumeImporting, setResumeImporting] = useState(false);
  const [resumeResult, setResumeResult] = useState<{ totalFiles: number; enqueued: number; failed: number } | null>(null);

  const switchMode = (m: "csv" | "resume") => {
    setMode(m); setStep(1); setPreview(null); setCommitResult(null); setCsvError(null); setResumeResult(null);
  };

  async function onCsvChosen(f: File | null) {
    setFile(f); setPreview(null); setCommitResult(null); setCsvError(null);
    setCsvText(f ? await f.text().catch(() => "") : "");
  }

  const runPreview = async () => {
    if (!csvText.trim()) { setCsvError("Please choose a CSV file first."); return; }
    setBusy(true); setCsvError(null);
    try { setPreview(await previewCandidateImport(csvText)); setStep(2); }
    catch (e: any) { setCsvError(e?.message || "Could not read that CSV."); }
    finally { setBusy(false); }
  };
  const runCommit = async () => {
    setBusy(true); setCsvError(null);
    try { const r = await commitCandidateImport(csvText); setCommitResult({ created: r.created, updated: r.updated, skipped: r.skipped }); setStep(4); }
    catch (e: any) { setCsvError(e?.message || "Import failed."); }
    finally { setBusy(false); }
  };

  const runResumeImport = async () => {
    if (resumeFiles.length === 0) return;
    setResumeImporting(true);
    try {
      const form = new FormData();
      for (const f of resumeFiles) form.append("resumes", f, f.name);
      const res = await bulkUploadResumes(form);
      setResumeResult({ totalFiles: res.totalFiles, enqueued: res.enqueued, failed: res.failed });
    } catch {
      setResumeResult({ totalFiles: resumeFiles.length, enqueued: 0, failed: resumeFiles.length });
    } finally {
      setResumeImporting(false); setStep(2);
    }
  };

  const rowHint = csvText ? Math.max(0, csvText.trim().split(/\r?\n/).length - 1) : 0;
  const validCount = preview ? preview.summary.newCount + preview.summary.updateCount : 0;
  const flaggedCount = preview ? preview.summary.invalidEmailCount + preview.summary.missingRequiredCount + preview.summary.duplicateInFileCount : 0;
  const resumeMB = resumeFiles.reduce((a, f) => a + f.size, 0) / (1024 * 1024);
  const committedTotal = commitResult ? commitResult.created + commitResult.updated : 0;

  const rows = (preview?.preview ?? []).map(cand);
  const { sorted: sortedRows, sort: rowSort, toggle: toggleRow } = useTableSort(rows, { key: "name", dir: "asc" });

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, marginBottom: 14 }}><Icon name="chevsL" size={14} /> Candidates</button>
        <h1 style={{ margin: "0 0 4px", fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Bulk import candidates</h1>
        <p style={{ margin: "0 0 18px", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Import a CSV of candidate records, or upload resume files (PDF, DOCX, DOC, TXT, or images) - the AI résumé-parser extracts and enriches each candidate.</p>

        {/* mode toggle */}
        <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)", marginBottom: 22 }}>
          {([["csv", "CSV spreadsheet", "fileText"], ["resume", "Resume files", "sparkles"]] as const).map(([m, label, icon]) => (
            <button key={m} onClick={() => switchMode(m)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 15px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", background: mode === m ? "var(--c-surface)" : "transparent", color: mode === m ? "var(--c-ink)" : "var(--c-ink-3)", boxShadow: mode === m ? "var(--e1)" : "none", transition: "background .15s, color .15s" }}>
              <Icon name={icon} size={14} /> {label}
            </button>
          ))}
        </div>

        {/* stepper */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: "contents" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                  background: step > i+1 ? "var(--c-brand)" : step === i+1 ? "var(--c-brand-tint)" : "var(--c-surface-2)", color: step > i+1 ? "var(--c-on-brand)" : step === i+1 ? "var(--c-brand-ink)" : "var(--c-ink-3)", border: step === i+1 ? "1px solid var(--c-brand)" : "1px solid var(--c-line)" }}>
                  {step > i+1 ? <Icon name="check" size={14} stroke={3} /> : i+1}</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: step >= i+1 ? "var(--c-ink)" : "var(--c-ink-3)" }}>{s}</span>
              </div>
              {i < steps.length-1 && <div style={{ flex: 1, height: 1, background: step > i+1 ? "var(--c-brand)" : "var(--c-line)", margin: "0 12px" }} />}
            </div>
          ))}
        </div>

        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 24, boxShadow: "var(--e1)" }}>
          {/* hidden inputs */}
          <input id="csv-input" type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={(e) => void onCsvChosen(e.target.files?.[0] ?? null)} />
          <input id="resume-input" type="file" multiple accept={RESUME_ACCEPT} style={{ display: "none" }} onChange={(e) => setResumeFiles(Array.from(e.target.files ?? []))} />

          {csvError && (
            <div style={{ marginBottom: 14, display: "flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
              <Icon name="flag" size={15} style={{ color: "var(--c-warn)" }} /> {csvError}
            </div>
          )}

          {/* ---------- CSV mode ---------- */}
          {mode === "csv" && step === 1 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div onClick={() => document.getElementById("csv-input")?.click()} style={{ width: "100%", maxWidth: 460, margin: "0 auto", border: "1.5px dashed var(--c-line-strong)", borderRadius: "var(--r-xl)", padding: "36px 20px", background: "var(--c-surface-2)", cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--c-brand-tint)", color: "var(--c-brand)" }}><Icon name="users" size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Drop your CSV here</div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", margin: "4px 0 14px" }}>columns like name, email, location, source - up to 5,000 rows on your plan</div>
                <Btn variant="soft" icon="fileText">Choose file</Btn>
              </div>
              {file && (
                <div style={{ marginTop: 18, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-ok-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                  <Icon name="check" size={15} style={{ color: "var(--c-ok)" }} /><b>{file.name}</b>{rowHint ? ` · ~${rowHint.toLocaleString()} rows` : ""}
                </div>
              )}
            </div>
          )}
          {mode === "csv" && step === 2 && preview && (
            <div>
              <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginBottom: 12 }}>Detected <b>{preview.headers.length}</b> column{preview.headers.length === 1 ? "" : "s"} in your file. Recognized columns are mapped automatically; others are ignored.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", gap: 12, padding: "0 0 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
                <span>CSV column</span><span></span><span>Maps to</span>
              </div>
              {preview.headers.map((h, i) => {
                const f = mappedField(h);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                    <span className="mono" style={{ fontSize: 12.5, color: "var(--c-ink)" }}>{h}</span>
                    <Icon name="chevR" size={14} style={{ color: "var(--c-ink-3)" }} />
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: f ? "var(--c-ink)" : "var(--c-ink-3)" }}>{f ?? "Ignored"}</span>
                  </div>
                );
              })}
            </div>
          )}
          {mode === "csv" && step === 3 && preview && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{preview.summary.newCount} new</Pill>
                {preview.summary.updateCount > 0 && <Pill icon="check" tone="var(--c-brand)" bg="var(--c-brand-tint)">{preview.summary.updateCount} updates</Pill>}
                {flaggedCount > 0 && <Pill icon="flag" tone="var(--c-warn)" bg="var(--c-warn-tint)">{flaggedCount} flagged</Pill>}
              </div>
              <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 0.9fr", gap: 10, padding: "9px 13px", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--c-ink-3)" }}>
                  <SortHead label="Name" sortKey="name" sort={rowSort} onSort={toggleRow} />
                  <SortHead label="Email" sortKey="email" sort={rowSort} onSort={toggleRow} />
                  <SortHead label="Location" sortKey="loc" sort={rowSort} onSort={toggleRow} />
                  <SortHead label="Status" sortKey="status" sort={rowSort} onSort={toggleRow} />
                </div>
                {sortedRows.slice(0, 50).map((r, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 0.9fr", gap: 10, padding: "9px 13px", borderTop: "1px solid var(--c-line)", fontSize: 12.5, background: r.ok ? "transparent" : "var(--c-warn-tint)" }}>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <span className="mono" style={{ color: r.email ? "var(--c-ink-2)" : "var(--c-warn)" }}>{r.email || "(missing)"}</span>
                    <span style={{ color: "var(--c-ink-2)" }}>{r.loc}</span>
                    <span style={{ fontSize: 11, color: r.ok ? "var(--c-ok)" : "var(--c-warn)", fontWeight: 600 }} title={r.reason ?? ""}>{r.ok ? "ready" : (r.status || "flagged").replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
              {rows.length > 50 && <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 8 }}>Showing 50 of {rows.length.toLocaleString()} rows.</div>}
            </div>
          )}
          {mode === "csv" && step === 4 && (
            <div style={{ textAlign: "center", padding: "26px 0", animation: "pop .3s var(--ease-spring)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--c-ok-tint)", color: "var(--c-ok)" }}><Icon name="check" size={32} stroke={2.2} /></div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>{committedTotal.toLocaleString()} candidate{committedTotal === 1 ? "" : "s"} imported</h2>
              <p style={{ margin: "8px auto 0", maxWidth: 400, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
                {commitResult ? `${commitResult.created.toLocaleString()} new, ${commitResult.updated.toLocaleString()} updated${commitResult.skipped ? `, ${commitResult.skipped.toLocaleString()} skipped` : ""}. ` : ""}They are now in your Candidates list.
              </p>
            </div>
          )}

          {/* ---------- Resume-files mode ---------- */}
          {mode === "resume" && step === 1 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div onClick={() => document.getElementById("resume-input")?.click()} style={{ width: "100%", maxWidth: 460, margin: "0 auto", border: "1.5px dashed var(--c-line-strong)", borderRadius: "var(--r-xl)", padding: "36px 20px", background: "var(--c-surface-2)", cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai-ink)" }}><Icon name="fileText" size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Drop resume files here</div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", margin: "4px 0 14px" }}>PDF, DOCX, DOC, TXT, or images (PNG / JPG) - up to 1,000 files, 10MB each</div>
                <Btn variant="soft" icon="fileText">Choose files</Btn>
              </div>
              {resumeFiles.length > 0 && (
                <div style={{ marginTop: 18, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                  <Icon name="sparkles" size={15} style={{ color: "var(--c-ai-ink)" }} /><b>{resumeFiles.length} file{resumeFiles.length > 1 ? "s" : ""} selected</b> · {resumeMB.toFixed(1)} MB · AI parser will extract each
                </div>
              )}
            </div>
          )}
          {mode === "resume" && step === 2 && (
            <div style={{ textAlign: "center", padding: "26px 0", animation: "pop .3s var(--ease-spring)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--c-ok-tint)", color: "var(--c-ok)" }}><Icon name="check" size={32} stroke={2.2} /></div>
              <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>{(resumeResult?.enqueued ?? 0).toLocaleString()} resume{(resumeResult?.enqueued ?? 0) === 1 ? "" : "s"} uploaded</h2>
              <p style={{ margin: "8px auto 0", maxWidth: 400, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{resumeResult && resumeResult.failed > 0 ? `${resumeResult.failed.toLocaleString()} file${resumeResult.failed === 1 ? "" : "s"} could not be read and were skipped. ` : ""}Each file created a candidate (visible now in Candidates); the AI résumé-parser backfills name, email, and skills as it processes them.</p>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <Btn variant="ghost" onClick={() => step > 1 ? setStep(step-1) : onBack()}>{step > 1 ? "Back" : "Cancel"}</Btn>
          {mode === "resume" ? (
            step === 1
              ? <Btn variant="primary" trailIcon="chevR" disabled={resumeImporting || resumeFiles.length === 0} onClick={() => void runResumeImport()}>{resumeImporting ? "Uploading…" : resumeFiles.length ? `Upload ${resumeFiles.length} resume${resumeFiles.length > 1 ? "s" : ""}` : "Choose files first"}</Btn>
              : <Btn variant="primary" icon="users" onClick={onBack}>View candidates</Btn>
          ) : step === 1 ? (
            <Btn variant="primary" trailIcon="chevR" disabled={busy || !file} onClick={() => void runPreview()}>{busy ? "Reading…" : "Continue"}</Btn>
          ) : step === 2 ? (
            <Btn variant="primary" trailIcon="chevR" onClick={() => setStep(3)}>Continue</Btn>
          ) : step === 3 ? (
            <Btn variant="primary" trailIcon="chevR" disabled={busy || validCount === 0} onClick={() => void runCommit()}>{busy ? "Importing…" : `Import ${validCount.toLocaleString()} candidate${validCount === 1 ? "" : "s"}`}</Btn>
          ) : (
            <Btn variant="primary" icon="users" onClick={onBack}>View candidates</Btn>
          )}
        </div>
      </div>
    </div>
  );
}
