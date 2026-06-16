/**
 * Phase 36a — OCR fallback for scanned-image PDFs.
 *
 * Triggered when pdf-parse returns empty (or near-empty) text — meaning
 * the PDF is a scanned image with no embedded text layer. We render each
 * page to a PNG with pdfjs-dist + @napi-rs/canvas (prebuilt, no native
 * compile), then run tesseract.js (WASM) on each page.
 *
 * Opt-in via ENABLE_OCR=true because:
 *   - OCR is SLOW: ~1-3 seconds per page on average hardware
 *   - WASM model is ~12 MB downloaded on first use (cached after)
 *   - For most tenants whose recruiters never upload scans, this is dead
 *     weight on the resume-service container
 *
 * Bounds (configurable):
 *   - RESUME_OCR_MAX_PAGES pages per resume (default 30; truncate + warn above)
 *   - RESUME_OCR_MAX_MS wall-clock budget (default 180s; stop + warn above)
 *
 * Tesseract.js lifecycle: we keep ONE worker per process (warm), reuse
 * across requests. The first call pays the model-load cost; subsequent
 * calls are immediate.
 */
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "resume-service:ocr" });

// Page cap + time budget are configurable. Defaults raised from the original
// 10 pages to cover long CVs (academic/medical résumés run 15-30 pages); a
// wall-clock budget still protects the worker from pathological inputs.
const MAX_PAGES_OCR = Math.max(1, Number(process.env["RESUME_OCR_MAX_PAGES"]) || 30);
const MAX_OCR_MS = Math.max(10_000, Number(process.env["RESUME_OCR_MAX_MS"]) || 180_000);
const PDF_RENDER_SCALE = 2.0;       // 2x for better OCR accuracy on small text

// OCR now defaults ON (images + scanned PDFs are first-class in archive
// ingest). Opt OUT explicitly with ENABLE_OCR=false.
export function isOcrEnabled(): boolean {
  return process.env["ENABLE_OCR"] !== "false";
}

// Lazy-init the tesseract worker — first OCR call pays the cost, then
// subsequent calls reuse the warm worker.
let _tesseractWorker: any = null;
let _tesseractWorkerInit: Promise<any> | null = null;

async function getTesseractWorker(): Promise<any> {
  if (_tesseractWorker) return _tesseractWorker;
  if (_tesseractWorkerInit) return _tesseractWorkerInit;
  _tesseractWorkerInit = (async () => {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", 1, {
      // Quiet logs — tesseract is chatty by default
      logger: () => undefined,
    });
    logger.info("Tesseract worker ready");
    _tesseractWorker = worker;
    return worker;
  })();
  return _tesseractWorkerInit;
}

/**
 * Render PDF pages to PNG buffers using pdfjs-dist + @napi-rs/canvas.
 * Returns one buffer per page (up to MAX_PAGES_OCR).
 */
async function pdfToPngBuffers(pdfBuffer: Buffer): Promise<Buffer[]> {
  // pdfjs-dist is ESM-only in recent versions. The "legacy" build is
  // what works in plain Node without a worker thread.
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const canvasMod: any = await import("@napi-rs/canvas");

  // pdfjs requires the worker URL to be set OR disabled. In Node we
  // run inline (no separate worker) for simplicity.
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = false;
  }

  const data = new Uint8Array(pdfBuffer);
  const loadingTask = pdfjs.getDocument({
    data,
    // Suppress the warnings pdfjs spams about Node-specific quirks
    disableFontFace: true,
    useSystemFonts: false,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  const numPages = Math.min(pdf.numPages, MAX_PAGES_OCR);

  const pngs: Buffer[] = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = canvasMod.createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");
    // pdfjs's render context expects a canvas-like API; @napi-rs/canvas
    // implements the subset pdfjs uses.
    await page.render({ canvasContext: context as any, viewport }).promise;
    pngs.push(canvas.toBuffer("image/png"));
    page.cleanup();
  }
  return pngs;
}

export interface OcrResult {
  text: string;
  pagesOcred: number;
  truncated: boolean;
  warnings: string[];
}

/**
 * OCR a PDF that pdf-parse couldn't extract text from.
 * Caller should ONLY invoke this when (a) ENABLE_OCR=true AND
 * (b) pdf-parse returned empty/very-short text.
 */
export async function ocrPdf(pdfBuffer: Buffer): Promise<OcrResult> {
  const warnings: string[] = [];

  try {
    const pages = await pdfToPngBuffers(pdfBuffer);
    if (pages.length === 0) {
      return { text: "", pagesOcred: 0, truncated: false, warnings: ["PDF has 0 pages"] };
    }

    const worker = await getTesseractWorker();
    const texts: string[] = [];
    const startedAt = Date.now();
    let pagesDone = 0;
    let timedOut = false;
    for (let i = 0; i < pages.length; i++) {
      if (Date.now() - startedAt > MAX_OCR_MS) {
        timedOut = true;
        warnings.push(`OCR hit the ${Math.round(MAX_OCR_MS / 1000)}s time budget after ${pagesDone} page(s); remaining pages skipped.`);
        break;
      }
      try {
        const { data } = await worker.recognize(pages[i]);
        texts.push(data.text ?? "");
        pagesDone++;
      } catch (err) {
        warnings.push(`OCR failed on page ${i + 1}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    return {
      text: texts.join("\n\n").trim(),
      pagesOcred: pagesDone,
      truncated: timedOut || pages.length >= MAX_PAGES_OCR,
      warnings,
    };
  } catch (err) {
    logger.warn({ err }, "OCR pipeline failed");
    return {
      text: "",
      pagesOcred: 0,
      truncated: false,
      warnings: [`OCR pipeline failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

/**
 * OCR a raw image buffer (PNG / JPEG / WEBP / TIFF) directly via tesseract.
 * Image resumes (scans, phone photos) have no text layer, so OCR is the only
 * extraction path — there is no PDF to render, we recognise the image as-is.
 * Caller should only invoke this when ENABLE_OCR=true.
 */
export async function ocrImage(imageBuffer: Buffer): Promise<OcrResult> {
  try {
    const worker = await getTesseractWorker();
    const { data } = await worker.recognize(imageBuffer);
    const text = (data?.text ?? "").trim();
    return {
      text,
      pagesOcred: text ? 1 : 0,
      truncated: false,
      warnings: text ? [] : ["OCR produced no text from the image."],
    };
  } catch (err) {
    logger.warn({ err }, "Image OCR failed");
    return {
      text: "",
      pagesOcred: 0,
      truncated: false,
      warnings: [`Image OCR failed: ${err instanceof Error ? err.message : String(err)}`],
    };
  }
}

/** Graceful shutdown — release the tesseract worker. Call from index.ts. */
export async function shutdownOcr(): Promise<void> {
  if (_tesseractWorker) {
    try { await _tesseractWorker.terminate(); } catch { /* ignore */ }
    _tesseractWorker = null;
  }
}
