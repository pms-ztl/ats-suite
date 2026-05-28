/**
 * Phase 35a — real text extraction from PDF / DOC / DOCX / TXT.
 *
 * Before 35a: `buffer.toString("utf-8")` produced gibberish on PDFs.
 * Now: per-mime-type extractor with proper libraries.
 *
 * Libraries:
 *   - pdf-parse — pure-JS PDF parser, works in Node without native deps
 *   - mammoth — DOCX → plain text + HTML; we use plain text
 *   - .doc (legacy Word) is best-effort via mammoth's fallback; very old
 *     binary .doc files may still produce garbage. Modern .docx works fine.
 *
 * The extractor returns up to MAX_CHARS to bound LLM token usage. Most
 * resumes are < 4000 chars; the cap is generous.
 */
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "resume-service:extract" });

const MAX_CHARS = 50_000;     // ~12k tokens — fits well under Claude Sonnet's input

const MIME_PDF  = "application/pdf";
const MIME_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MIME_DOC  = "application/msword";
const MIME_TXT  = "text/plain";

export interface ExtractionResult {
  text: string;
  pageCount?: number;             // PDF only
  truncated: boolean;             // true if we hit MAX_CHARS
  warnings: string[];
}

/**
 * Extract plain text from a resume buffer. Returns empty text + warning
 * for unsupported types rather than throwing — the caller can still save
 * the binary and surface "parsed text unavailable" in the UI.
 */
export async function extractResumeText(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<ExtractionResult> {
  const warnings: string[] = [];
  let text = "";
  let pageCount: number | undefined;

  try {
    if (mimeType === MIME_PDF) {
      // pdf-parse module shape varies by version. v2+ exports named; v1 was default.
      // Handle both — pick whichever is callable.
      const mod: any = await import("pdf-parse");
      const pdfParse: (b: Buffer) => Promise<{ text: string; numpages: number }> =
        typeof mod === "function" ? mod : (mod.default ?? mod.pdfParse ?? mod);
      const result = await pdfParse(buffer);
      text = result.text ?? "";
      pageCount = result.numpages;
      if (!text.trim()) {
        warnings.push("PDF contained no extractable text — possibly a scanned image. OCR not yet wired.");
      }
    } else if (mimeType === MIME_DOCX) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value ?? "";
      // mammoth surfaces conversion warnings (unsupported elements etc.) —
      // forward them so the UI can show a "parsed with warnings" badge.
      for (const m of result.messages ?? []) {
        warnings.push(`${m.type}: ${m.message}`);
      }
    } else if (mimeType === MIME_DOC) {
      // Legacy .doc — mammoth supports a SUBSET. For full coverage we'd need
      // antiword or LibreOffice headless. Try mammoth; if it produces nothing,
      // tell the user.
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value ?? "";
        if (!text.trim()) {
          warnings.push("Legacy .doc format not fully supported — re-save as .docx for best results.");
        }
      } catch (err) {
        warnings.push(`Couldn't parse legacy .doc: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else if (mimeType === MIME_TXT) {
      // Plain text — utf-8 with bom-strip
      text = buffer.toString("utf-8").replace(/^﻿/, "");
    } else {
      warnings.push(`Unsupported MIME type: ${mimeType} (file: ${fileName})`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ err, fileName, mimeType }, "Extraction failed");
    warnings.push(`Extraction failed: ${msg}`);
  }

  // Normalize whitespace (resumes often have unusable consecutive newlines)
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const truncated = text.length > MAX_CHARS;
  if (truncated) text = text.slice(0, MAX_CHARS);

  return {
    text,
    ...(pageCount !== undefined ? { pageCount } : {}),
    truncated,
    warnings,
  };
}
