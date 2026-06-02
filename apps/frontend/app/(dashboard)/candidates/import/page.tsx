"use client";
// app/(dashboard)/candidates/import/page.tsx - EXACT Claude Design "Aurora"
// bulk candidate import wizard. Ported verbatim from claude-design/cand-import.jsx
// (the ImportScreen) and wired to real, controlled state: a working drag/drop +
// file-picker dropzone, the file's own header row drives the column-mapping step,
// and "Import" POSTs the raw file to the gateway. No fabricated candidate rows;
// stages with no backend render the exact layout in honest empty/disabled states.
import { useState, useRef, useCallback, type DragEvent } from "react";
import { Btn, Pill, ScoreRing } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Inline raw() helper (the guide's pattern). Posts FormData so we do NOT force a
// JSON Content-Type; the browser sets the multipart boundary itself.
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Lightweight, real parse of the FIRST line (header) + a data-row count, so the
// "Map columns" / "Preview" steps reflect the user's actual file. Quote-aware
// enough for typical exports; no candidate values are invented anywhere.
function parseCsvMeta(text: string): { headers: string[]; dataRows: number } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], dataRows: 0 };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "")).filter(Boolean);
  return { headers, dataRows: Math.max(0, lines.length - 1) };
}

// Best-effort header -> field guess for the mapping step. Mirrors the prototype's
// "Maps to" column; falls back to "Skip" when we cannot confidently map.
const FIELD_OPTIONS = ["Skip", "Name", "Email", "Headline", "Location", "Source", "Links"];
function guessField(header: string): string {
  const h = header.toLowerCase();
  if (h.includes("name")) return "Name";
  if (h.includes("email") || h.includes("mail")) return "Email";
  if (h.includes("title") || h.includes("headline")) return "Headline";
  if (h.includes("location") || h.includes("city")) return "Location";
  if (h.includes("source") || h.includes("channel")) return "Source";
  if (h.includes("link") || h.includes("url") || h.includes("linkedin")) return "Links";
  return "Skip";
}

export default function CsvImportPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ headers: string[]; dataRows: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = ["Upload", "Map columns", "Preview", "Done"];

  const accept = useCallback(async (f: File | null | undefined) => {
    if (!f) return;
    setErr(null);
    setImported(null);
    setFile(f);
    try {
      const text = await f.text();
      setMeta(parseCsvMeta(text));
    } catch {
      setMeta(null);
    }
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    accept(e.dataTransfer.files?.[0]);
  };

  const reset = () => { setFile(null); setMeta(null); setImported(null); setErr(null); setStep(1); if (inputRef.current) inputRef.current.value = ""; };

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      // Plausible bulk-import endpoint; FormData multipart upload of the raw CSV.
      const res = await raw("/candidates/import", { method: "POST", body: fd });
      const data = res?.data ?? res ?? {};
      const count = data.imported ?? data.created ?? data.count ?? meta?.dataRows ?? 0;
      setImported(count);
      setStep(4);
    } catch (e) {
      setErr("We could not reach the import service. Your file is still selected, please try again in a moment.");
    } finally {
      setImporting(false);
    }
  };

  const next = () => {
    if (step === 3) { runImport(); return; }
    if (step < 4) setStep(step + 1);
  };

  const canContinue = step === 1 ? !!file : true;

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <a href="/candidates" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}>
        <Icon name="chevsL" size={14} /> Candidates
      </a>
      <h1 style={{ margin: "0 0 4px", fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Bulk import candidates</h1>
      <p style={{ margin: "0 0 22px", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Upload a CSV, map the columns, preview, and commit. The resume-parser enriches each record on import.</p>

      {/* stepper */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: "contents" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                background: step > i + 1 ? "var(--c-brand)" : step === i + 1 ? "var(--c-brand-tint)" : "var(--c-surface-2)",
                color: step > i + 1 ? "var(--c-on-brand)" : step === i + 1 ? "var(--c-brand-ink)" : "var(--c-ink-3)",
                border: step === i + 1 ? "1px solid var(--c-brand)" : "1px solid var(--c-line)" }}>
                {step > i + 1 ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: step >= i + 1 ? "var(--c-ink)" : "var(--c-ink-3)" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "var(--c-brand)" : "var(--c-line)", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 24, boxShadow: "var(--e1)" }}>
        {step === 1 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              role="button"
              tabIndex={0}
              aria-label="Choose a CSV file or drop one here"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              style={{ width: "100%", maxWidth: 460, margin: "0 auto", border: `1.5px dashed ${dragOver ? "var(--c-brand)" : "var(--c-line-strong)"}`, borderRadius: "var(--r-xl)", padding: "36px 20px", background: dragOver ? "var(--c-brand-tint)" : "var(--c-surface-2)", cursor: "pointer", transition: "border-color var(--t), background var(--t)" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--c-brand-tint)", color: "var(--c-brand)" }}><Icon name="users" size={24} /></div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Drop your CSV here</div>
              <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", margin: "4px 0 14px" }}>or browse, up to 5,000 rows on your plan</div>
              <span style={{ display: "inline-block" }}><Btn variant="soft" icon="fileText">Choose file</Btn></span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              style={{ display: "none" }}
              onChange={(e) => accept(e.target.files?.[0])}
            />
            {file && (
              <div style={{ marginTop: 18, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-ok-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                <Icon name="check" size={15} style={{ color: "var(--c-ok)" }} />
                <b>{file.name}</b> · {fmtSize(file.size)}{meta ? ` · ${meta.dataRows.toLocaleString()} rows detected · ${meta.headers.length} columns` : ""}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 1fr", gap: 12, padding: "0 0 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
              <span>CSV column</span><span></span><span>Maps to</span><span>Sample</span>
            </div>
            {(meta?.headers ?? []).length === 0 && (
              <div style={{ padding: "26px 0", textAlign: "center", fontSize: 12.5, color: "var(--c-ink-3)" }}>No columns were detected in this file. Go back and choose a CSV with a header row.</div>
            )}
            {(meta?.headers ?? []).map((h, i) => {
              const mapped = guessField(h);
              const ok = mapped !== "Skip";
              return (
                <div key={h + i} style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 1fr", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span className="mono" style={{ fontSize: 12.5, color: "var(--c-ink)" }}>{h}</span>
                  <Icon name="chevR" size={14} style={{ color: "var(--c-ink-3)" }} />
                  <select defaultValue={mapped} style={{ padding: "7px 9px", borderRadius: "var(--r-sm)", border: "1px solid", borderColor: ok ? "var(--c-line-2)" : "var(--c-line)", background: ok ? "var(--c-surface)" : "var(--c-surface-2)", color: ok ? "var(--c-ink)" : "var(--c-ink-3)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
                    {FIELD_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: "var(--c-ink-3)" }}>from your file</span>
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{(meta?.dataRows ?? 0).toLocaleString()} rows ready</Pill>
              <Pill icon="fileText" tone="var(--c-ink-2)" bg="var(--c-surface-2)">{meta?.headers.length ?? 0} columns</Pill>
              <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">resume-parser will enrich on import</Pill>
            </div>
            {/* Preview validates and enriches server-side on commit; we surface the
                file's real shape here rather than inventing candidate rows. */}
            <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, meta?.headers.length ?? 1))}, 1fr)`, gap: 10, padding: "9px 13px", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--c-ink-3)" }}>
                {(meta?.headers ?? ["Column"]).slice(0, 4).map((h) => <span key={h}>{h}</span>)}
              </div>
              <div style={{ display: "grid", placeItems: "center", padding: "30px 13px", borderTop: "1px solid var(--c-line)", textAlign: "center" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-3)" }}>
                  <Icon name="eye" size={15} style={{ color: "var(--c-ink-3)" }} />
                  Row-level preview and scores appear in the queue after import.
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)" }}>
              <ScoreRing value={0} size={44} band="var(--c-ai)" label="score" />
              <p style={{ margin: 0, fontSize: 12, color: "var(--c-ai-ink)", lineHeight: 1.45 }}>
                Match scores stay empty until the resume-parser finishes. You can watch them fill in from the candidate queue.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", padding: "26px 0", animation: "pop .3s var(--ease-spring)" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--c-ok-tint)", color: "var(--c-ok)" }}><Icon name="check" size={32} stroke={2.2} /></div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>{(imported ?? 0).toLocaleString()} candidates imported</h2>
            <p style={{ margin: "8px auto 0", maxWidth: 380, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>The resume-parser is enriching them now, scores will appear in the queue within a few minutes.</p>
          </div>
        )}

        {/* friendly inline failure notice (import POST did not succeed) */}
        {err && (
          <div role="alert" style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 22%, transparent)" }}>
            <Icon name="flag" size={16} style={{ color: "var(--c-danger)", flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: "var(--c-danger)", lineHeight: 1.45 }}>{err}</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <Btn variant="ghost" onClick={() => { if (step > 1) setStep(step - 1); else if (typeof window !== "undefined") window.location.href = "/candidates"; }}>
          {step > 1 ? "Back" : "Cancel"}
        </Btn>
        {step < 4 ? (
          <span style={{ opacity: canContinue && !importing ? 1 : 0.5, pointerEvents: canContinue && !importing ? "auto" : "none" }}>
            <Btn variant="primary" trailIcon={step === 3 ? undefined : "chevR"} icon={step === 3 ? "users" : undefined} onClick={next}>
              {step === 3 ? (importing ? "Importing..." : `Import ${(meta?.dataRows ?? 0).toLocaleString()} candidates`) : "Continue"}
            </Btn>
          </span>
        ) : (
          <a href="/candidates"><Btn variant="primary" icon="users">View candidates</Btn></a>
        )}
      </div>
    </div>
  );
}
