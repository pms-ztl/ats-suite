"use client";
// app/(dashboard)/candidates/import/page.tsx
// EXACT Claude Design "Aurora" bulk-import wizard, ported from
// claude-design/cand-import.jsx (ImportScreen): the four-step stepper
// Upload -> Map columns -> Preview -> Done, dropzone, column mapping, and
// a result panel. Wired to the real gateway: a controlled file input +
// drag/drop reads the chosen CSV, parses headers/rows CLIENT-SIDE for honest
// counts (no fabricated candidates), then POSTs a FormData via
// importCandidates() and lands on Done with the real imported count.
import { useMemo, useRef, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { importCandidates } from "@/lib/api";

const STEPS = ["Upload", "Map columns", "Preview", "Done"];

// Target fields a CSV column can map to. "Skip" drops the column.
const MAP_TARGETS = ["Skip", "Name", "Email", "Headline", "Location", "Source", "Links"];

// Heuristic: guess a sensible target field from a raw CSV header name.
function guessTarget(header: string): string {
  const h = header.toLowerCase();
  if (/(full.?name|^name$|first.?name|last.?name)/.test(h)) return "Name";
  if (/e.?mail/.test(h)) return "Email";
  if (/(title|headline|role|position)/.test(h)) return "Headline";
  if (/(location|city|country|region|remote)/.test(h)) return "Location";
  if (/(source|channel|origin|referr)/.test(h)) return "Source";
  if (/(linkedin|github|portfolio|url|link|website)/.test(h)) return "Links";
  return "Skip";
}

type Parsed = { headers: string[]; samples: string[]; rowCount: number };

// Minimal, dependency-free CSV parse for client-side preview ONLY (real
// validation + upsert happen server-side on import). Handles quoted fields
// and quote-escaping; good enough to surface honest header/row counts.
function parseCsv(text: string): Parsed {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else { field += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field); field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else { field += ch; }
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((c) => c.trim() !== "")) rows.push(row); }
  const headers = (rows[0] ?? []).map((h) => h.trim());
  const samples = (rows[1] ?? []).map((c) => c.trim());
  return { headers, samples, rowCount: Math.max(0, rows.length - 1) };
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImportPage() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ imported: number; flagged: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (f: File | null | undefined) => {
    if (!f) return;
    setError(null);
    setFile(f);
    setParsed(null);
    const reader = new FileReader();
    reader.onload = () => {
      const p = parseCsv(String(reader.result ?? ""));
      setParsed(p);
      const m: Record<string, string> = {};
      p.headers.forEach((h) => { m[h] = guessTarget(h); });
      setMapping(m);
    };
    reader.onerror = () => setError("We could not read that file. Try a UTF-8 CSV export.");
    reader.readAsText(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  const mappedCount = useMemo(
    () => Object.values(mapping).filter((v) => v && v !== "Skip").length,
    [mapping],
  );

  const canContinue = step === 1 ? !!parsed : step === 2 ? mappedCount > 0 : true;

  async function runImport() {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const res = await importCandidates(form);
      setResult(res);
      setStep(4);
    } catch {
      setError("Import did not complete. Check the file and your connection, then try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const onPrimary = () => {
    if (step < 3) setStep(step + 1);
    else if (step === 3) void runImport();
  };

  const importedCount = result?.imported ?? 0;

  return (
    <div className="mx-auto w-full max-w-[820px]">
      <a
        href="/candidates"
        style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)", textDecoration: "none", fontWeight: 600, marginBottom: 14 }}
      >
        <Icon name="chevsL" size={14} /> Candidates
      </a>
      <h1 style={{ margin: "0 0 4px", fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Bulk import candidates</h1>
      <p style={{ margin: "0 0 22px", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>
        Upload a CSV, map the columns, preview, and commit. The resume-parser enriches each record on import.
      </p>

      {/* stepper */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "contents" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                  background: step > i + 1 ? "var(--c-brand)" : step === i + 1 ? "var(--c-brand-tint)" : "var(--c-surface-2)",
                  color: step > i + 1 ? "var(--c-on-brand)" : step === i + 1 ? "var(--c-brand-ink)" : "var(--c-ink-3)",
                  border: step === i + 1 ? "1px solid var(--c-brand)" : "1px solid var(--c-line)",
                }}
              >
                {step > i + 1 ? <Icon name="check" size={14} stroke={3} /> : i + 1}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: step >= i + 1 ? "var(--c-ink)" : "var(--c-ink-3)" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? "var(--c-brand)" : "var(--c-line)", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 24, boxShadow: "var(--e1)" }}>
        {/* hidden controlled file input, shared by browse + dropzone */}
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={(e) => accept(e.target.files?.[0])}
        />

        {step === 1 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
              style={{
                width: "100%", maxWidth: 460, margin: "0 auto", cursor: "pointer",
                border: `1.5px dashed ${dragging ? "var(--c-brand)" : "var(--c-line-strong)"}`,
                borderRadius: "var(--r-xl)", padding: "36px 20px",
                background: dragging ? "var(--c-brand-tint)" : "var(--c-surface-2)",
                transition: "border-color var(--t), background var(--t)",
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 13, margin: "0 auto 14px", display: "grid", placeItems: "center", background: "var(--c-brand-tint)", color: "var(--c-brand)" }}>
                <Icon name="users" size={24} />
              </div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Drop your CSV here</div>
              <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", margin: "4px 0 14px" }}>or browse, up to 5,000 rows on your plan</div>
              <Btn variant="soft" icon="fileText">Choose file</Btn>
            </div>

            {file && parsed && (
              <div style={{ marginTop: 18, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-ok-tint)", fontSize: 12.5, color: "var(--c-ink-2)" }}>
                <Icon name="check" size={15} style={{ color: "var(--c-ok)" }} />
                <b>{file.name}</b> · {fmtSize(file.size)} · {parsed.rowCount.toLocaleString()} rows detected · {parsed.headers.length} columns
              </div>
            )}
            {error && <InlineNotice text={error} />}
          </div>
        )}

        {step === 2 && parsed && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 1fr", gap: 12, padding: "0 0 10px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
              <span>CSV column</span><span></span><span>Maps to</span><span>Sample</span>
            </div>
            {parsed.headers.map((h, i) => {
              const ok = (mapping[h] ?? "Skip") !== "Skip";
              return (
                <div key={h + i} style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 1fr", gap: 12, alignItems: "center", padding: "10px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span className="mono" style={{ fontSize: 12.5, color: "var(--c-ink)" }}>{h}</span>
                  <Icon name="chevR" size={14} style={{ color: "var(--c-ink-3)" }} />
                  <select
                    value={mapping[h] ?? "Skip"}
                    onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                    style={{
                      padding: "7px 9px", borderRadius: "var(--r-sm)", border: "1px solid",
                      borderColor: ok ? "var(--c-line-2)" : "var(--c-line)",
                      background: ok ? "var(--c-surface)" : "var(--c-surface-2)",
                      color: ok ? "var(--c-ink)" : "var(--c-ink-3)",
                      fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer",
                    }}
                  >
                    {MAP_TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span style={{ fontSize: 12, color: "var(--c-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{parsed.samples[i] || "(empty)"}</span>
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && parsed && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{parsed.rowCount.toLocaleString()} rows</Pill>
              <Pill icon="listChecks" tone="var(--c-ink-2)" bg="var(--c-surface-2)">{mappedCount} columns mapped</Pill>
              <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">resume-parser will enrich on import</Pill>
            </div>

            {/* Honest preview: real column headers + counts from the file. We do
                NOT fabricate per-candidate rows or AI scores here, the server
                validates and the parser scores asynchronously after import. */}
            <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "9px 13px", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--c-ink-3)" }}>
                <span>CSV column</span><span>Maps to</span>
              </div>
              {parsed.headers.map((h, i) => {
                const target = mapping[h] ?? "Skip";
                const skip = target === "Skip";
                return (
                  <div key={h + i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "9px 13px", borderTop: "1px solid var(--c-line)", fontSize: 12.5 }}>
                    <span className="mono" style={{ color: "var(--c-ink-2)" }}>{h}</span>
                    <span style={{ color: skip ? "var(--c-ink-3)" : "var(--c-ink)", fontWeight: skip ? 400 : 600 }}>{skip ? "Skip" : target}</span>
                  </div>
                );
              })}
            </div>

            {/* Honest empty state for AI scores, mirrors the dashboard's tone. */}
            <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-ai-tint)" }}>
              <Icon name="sparkles" size={16} style={{ color: "var(--c-ai)", flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>
                Match scores are not available yet. After import, the resume-parser scores each candidate, and results appear in the screening queue within a few minutes.
              </p>
            </div>

            {error && <InlineNotice text={error} />}
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center", padding: "26px 0", animation: "pop .3s var(--ease-spring)" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px", display: "grid", placeItems: "center", background: "var(--c-ok-tint)", color: "var(--c-ok)" }}>
              <Icon name="check" size={32} stroke={2.2} />
            </div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700 }}>{importedCount.toLocaleString()} candidates imported</h2>
            <p style={{ margin: "8px auto 0", maxWidth: 380, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
              {result && result.flagged > 0
                ? `${result.flagged.toLocaleString()} were flagged for your review. The resume-parser is enriching the rest now, scores will appear in the queue within a few minutes.`
                : "The resume-parser is enriching them now, scores will appear in the queue within a few minutes."}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        {step < 4 ? (
          <Btn variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : (window.location.href = "/candidates"))}>
            {step > 1 ? "Back" : "Cancel"}
          </Btn>
        ) : <span />}
        {step < 4 ? (
          <Btn
            variant="primary"
            trailIcon="chevR"
            onClick={canContinue && !submitting ? onPrimary : undefined}
            style={canContinue && !submitting ? {} : { opacity: 0.5, pointerEvents: "none" }}
          >
            {step === 3 ? (submitting ? "Importing…" : `Import ${parsed?.rowCount.toLocaleString() ?? 0} candidates`) : "Continue"}
          </Btn>
        ) : (
          <Btn variant="primary" icon="users" onClick={() => (window.location.href = "/candidates")} style={{ marginLeft: "auto" }}>
            View candidates
          </Btn>
        )}
      </div>
    </div>
  );
}

function InlineNotice({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 16, display: "inline-flex", gap: 9, alignItems: "center", padding: "10px 14px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", fontSize: 12.5, color: "var(--c-warn)", fontWeight: 600 }}>
      <Icon name="flag" size={15} /> {text}
    </div>
  );
}
