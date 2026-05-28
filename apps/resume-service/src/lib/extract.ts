/**
 * Phase 35a + 36a/b — text extraction from PDF / DOC / DOCX / TXT.
 *
 * Libraries:
 *   - pdf-parse — pure-JS PDF parser (text PDFs)
 *   - tesseract.js (via ocr.ts) — OCR fallback for scanned-image PDFs
 *     (Phase 36a; opt-in via ENABLE_OCR=true)
 *   - mammoth — DOCX → plain text + HTML; we use plain text
 *   - word-extractor — pre-2007 binary .doc (Phase 36b, pure JS)
 *
 * The extractor returns up to MAX_CHARS to bound LLM token usage. Most
 * resumes are < 4000 chars; the cap is generous.
 */
import { createLogger } from "@cdc-ats/common";
import { isOcrEnabled, ocrPdf } from "./ocr.js";

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

      // Phase 36a — OCR fallback for scanned-image PDFs. When pdf-parse
      // extracts nothing (or near-nothing), the PDF is most likely an
      // image-only scan. Render each page and run tesseract. Opt-in via
      // ENABLE_OCR=true because OCR is slow + downloads a ~12MB WASM model.
      if (text.trim().length < 50) {
        if (isOcrEnabled()) {
          logger.info({ fileName, pdfPages: pageCount }, "pdf-parse returned empty; falling back to OCR");
          const ocr = await ocrPdf(buffer);
          text = ocr.text;
          warnings.push(`Used OCR on ${ocr.pagesOcred} page(s) — accuracy may be lower than text PDFs.`);
          if (ocr.truncated) warnings.push("OCR was capped at 10 pages; remaining pages skipped.");
          for (const w of ocr.warnings) warnings.push(w);
        } else {
          warnings.push("PDF contained no extractable text — likely a scanned image. Set ENABLE_OCR=true on resume-service to enable OCR fallback.");
        }
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
      // Phase 36b — pre-2007 binary .doc via word-extractor (pure JS).
      // mammoth handles a subset of .doc but often produces empty output;
      // word-extractor is specifically built for the binary OLE format.
      // Strategy: try word-extractor first, fall back to mammoth.
      try {
        const WordExtractor = (await import("word-extractor")).default;
        const extractor = new WordExtractor();
        const doc = await extractor.extract(buffer);
        text = doc.getBody() ?? "";
        if (!text.trim()) {
          // word-extractor returned empty — try mammoth as a long-shot fallback
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          text = result.value ?? "";
        }
        if (!text.trim()) {
          warnings.push("Legacy .doc file produced no text — possibly password-protected or corrupted.");
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
